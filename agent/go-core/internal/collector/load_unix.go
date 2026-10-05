//go:build darwin || linux

package collector

import "github.com/shirou/gopsutil/v3/load"

func loadAverages() (*float64, *float64, *float64) {
	avg, err := load.Avg()
	if err != nil {
		return nil, nil, nil
	}
	return floatPtr(avg.Load1), floatPtr(avg.Load5), floatPtr(avg.Load15)
}
