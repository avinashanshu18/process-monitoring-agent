package collector

import (
	"bytes"
	"context"
	"errors"
	"io"
	"os/exec"
	"time"
)

type cappedBuffer struct {
	buffer    bytes.Buffer
	limit     int
	truncated bool
}

func (buffer *cappedBuffer) Write(payload []byte) (int, error) {
	if buffer.limit <= 0 {
		return len(payload), nil
	}
	remaining := buffer.limit - buffer.buffer.Len()
	if remaining <= 0 {
		buffer.truncated = true
		return len(payload), nil
	}
	if len(payload) > remaining {
		buffer.truncated = true
		payload = payload[:remaining]
	}
	_, err := buffer.buffer.Write(payload)
	if err != nil {
		return 0, err
	}
	return len(payload), nil
}

func (buffer *cappedBuffer) Bytes() []byte {
	return buffer.buffer.Bytes()
}

func runCommandCombinedOutput(timeout time.Duration, maxBytes int, name string, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	command := exec.CommandContext(ctx, name, args...)
	stdout := &cappedBuffer{limit: maxBytes}
	stderr := &cappedBuffer{limit: maxBytes}
	command.Stdout = stdout
	command.Stderr = stderr

	err := command.Run()
	output := joinCommandOutput(stdout.Bytes(), stderr.Bytes())
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		return output, ctx.Err()
	}
	return output, err
}

func runCommandOutput(timeout time.Duration, maxBytes int, name string, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	command := exec.CommandContext(ctx, name, args...)
	stdout := &cappedBuffer{limit: maxBytes}
	command.Stdout = stdout
	command.Stderr = io.Discard

	err := command.Run()
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		return stdout.Bytes(), ctx.Err()
	}
	return stdout.Bytes(), err
}

func joinCommandOutput(stdout []byte, stderr []byte) []byte {
	switch {
	case len(stdout) == 0:
		return stderr
	case len(stderr) == 0:
		return stdout
	default:
		return append(append(stdout, '\n'), stderr...)
	}
}
