//go:build !windows

package collector

import "hostlens-go-agent/internal/model"

func collectWindowsStartupItems() []model.StartupItem {
	return nil
}

func collectWindowsSoftwareInventory() []model.SoftwareItem {
	return nil
}
