package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"syscall"
	"time"

	"hostlens-go-agent/internal/config"
	"hostlens-go-agent/internal/updater"
	"hostlens-go-agent/internal/version"

	"golang.org/x/sys/windows/svc"
)

const (
	serviceName    = "HostLensAgent"
	serviceLogName = "service.log"
)

type hostLensService struct {
	mu     sync.Mutex
	cmd    *exec.Cmd
	logOut io.WriteCloser
	waitCh chan error
}

func main() {
	isInteractive, err := svc.IsAnInteractiveSession()
	if err != nil {
		fmt.Fprintf(os.Stderr, "service error: %v\n", err)
		os.Exit(1)
	}

	if isInteractive {
		fmt.Println("HostLens Windows service wrapper is meant to run under the Service Control Manager.")
		fmt.Println("Install it with install-windows.ps1 and start the HostLensAgent service.")
		return
	}

	if err := svc.Run(serviceName, &hostLensService{}); err != nil {
		fmt.Fprintf(os.Stderr, "service error: %v\n", err)
		os.Exit(1)
	}
}

func (s *hostLensService) Execute(_ []string, r <-chan svc.ChangeRequest, status chan<- svc.Status) (bool, uint32) {
	status <- svc.Status{State: svc.StartPending}

	if err := s.startAgent(); err != nil {
		fmt.Fprintf(os.Stderr, "service start error: %v\n", err)
		status <- svc.Status{State: svc.Stopped, Win32ExitCode: 1}
		return false, 1
	}

	status <- svc.Status{State: svc.Running, Accepts: svc.AcceptStop | svc.AcceptShutdown}

	for change := range r {
		switch change.Cmd {
		case svc.Interrogate:
			status <- change.CurrentStatus
		case svc.Stop, svc.Shutdown:
			status <- svc.Status{State: svc.StopPending}
			s.stopAgent()
			status <- svc.Status{State: svc.Stopped}
			return false, 0
		default:
			status <- change.CurrentStatus
		}
	}

	s.stopAgent()
	status <- svc.Status{State: svc.Stopped}
	return false, 0
}

func (s *hostLensService) startAgent() error {
	exePath, err := os.Executable()
	if err != nil {
		return err
	}
	installDir := filepath.Dir(exePath)
	agentPath := filepath.Join(installDir, "hostlens-agent.exe")

	if err := applyAgentUpdate(agentPath); err != nil {
		return err
	}

	logOut, err := openLogFile()
	if err != nil {
		return err
	}

	cmd := exec.Command(agentPath)
	cmd.Dir = installDir
	cmd.Stdout = logOut
	cmd.Stderr = logOut
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	if err := cmd.Start(); err != nil {
		_ = logOut.Close()
		return err
	}

	waitCh := make(chan error, 1)

	go func() {
		waitCh <- cmd.Wait()
		close(waitCh)
		s.mu.Lock()
		defer s.mu.Unlock()
		if s.logOut != nil {
			_ = s.logOut.Close()
			s.logOut = nil
		}
		s.cmd = nil
	}()

	s.mu.Lock()
	s.cmd = cmd
	s.logOut = logOut
	s.waitCh = waitCh
	s.mu.Unlock()

	return nil
}

func applyAgentUpdate(agentPath string) error {
	cfg, _, err := config.Load()
	if err != nil {
		return err
	}

	currentVersion := updater.BinaryVersion(agentPath)
	if currentVersion == "" {
		currentVersion = version.AgentVersion
	}
	if !updater.ShouldAutoUpdate(
		cfg.ReleaseManifestURL,
		cfg.AutoUpdate,
		currentVersion,
		agentPath,
	) {
		return nil
	}

	targetKey, err := updater.TargetKey("windows", "amd64")
	if err != nil {
		return err
	}

	_, err = updater.ApplyBinaryUpdate(
		cfg.ReleaseManifestURL,
		currentVersion,
		agentPath,
		targetKey,
	)
	return err
}

func (s *hostLensService) stopAgent() {
	s.mu.Lock()
	cmd := s.cmd
	logOut := s.logOut
	waitCh := s.waitCh
	s.cmd = nil
	s.logOut = nil
	s.waitCh = nil
	s.mu.Unlock()

	if cmd == nil || cmd.Process == nil {
		if logOut != nil {
			_ = logOut.Close()
		}
		return
	}

	_ = cmd.Process.Kill()

	select {
	case <-waitCh:
	case <-time.After(5 * time.Second):
	}

	if logOut != nil {
		_ = logOut.Close()
	}
}

func openLogFile() (io.WriteCloser, error) {
	baseDir := os.Getenv("ProgramData")
	if baseDir == "" {
		baseDir = `C:\ProgramData`
	}
	logDir := filepath.Join(baseDir, "HostLens", "logs")
	if err := os.MkdirAll(logDir, 0o755); err != nil {
		return nil, err
	}
	return os.OpenFile(
		filepath.Join(logDir, serviceLogName),
		os.O_CREATE|os.O_APPEND|os.O_WRONLY,
		0o644,
	)
}
