//go:build !windows

package main

import (
	"os"
	"syscall"
)

func restartProcess(executablePath string) error {
	return syscall.Exec(executablePath, append([]string{executablePath}, os.Args[1:]...), os.Environ())
}
