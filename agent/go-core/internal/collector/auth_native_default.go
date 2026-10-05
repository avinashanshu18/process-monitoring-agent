//go:build !darwin && !linux && !windows

package collector

import "hostlens-go-agent/internal/model"

func collectNativeAuthEvents() []model.AuthEvent {
	return nil
}
