//go:build !darwin && !linux

package collector

func loadAverages() (*float64, *float64, *float64) {
	return nil, nil, nil
}
