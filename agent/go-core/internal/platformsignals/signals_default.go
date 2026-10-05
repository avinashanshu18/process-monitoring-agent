//go:build !darwin && !linux && !windows

package platformsignals

func DeepCollectors() []string {
	return []string{"generic-userspace"}
}

func SecurityMode() string {
	return "generic-userspace"
}
