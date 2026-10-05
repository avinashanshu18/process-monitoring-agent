//go:build windows

package main

import "fmt"

func restartProcess(_ string) error {
	return fmt.Errorf("process restart is not supported on this platform")
}
