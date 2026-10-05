package collector

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	"hostlens-go-agent/internal/config"
	"hostlens-go-agent/internal/model"
	"hostlens-go-agent/internal/version"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	gnet "github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

var reverseLookupCache sync.Map

func Collect(cfg config.Config) (model.SnapshotPayload, error) {
	hostInfo, err := host.Info()
	if err != nil {
		return model.SnapshotPayload{}, err
	}

	hostname := cfg.HostnameOverride
	if hostname == "" {
		hostname, err = os.Hostname()
		if err != nil {
			hostname = hostInfo.Hostname
		}
	}

	vm, _ := mem.VirtualMemory()
	diskUsage, _ := disk.Usage("/")
	netStats, _ := gnet.IOCounters(false)
	loadOne, loadFive, loadFifteen := loadAverages()
	cpuPercent, _ := cpu.Percent(200*time.Millisecond, false)
	cpuCount, _ := cpu.Counts(true)
	users, _ := host.Users()

	processes, err := collectProcesses()
	if err != nil {
		return model.SnapshotPayload{}, err
	}
	processEvents := runtimeProcessEvents(processes)
	processNames := map[int32]string{}
	for _, process := range processes {
		processNames[process.PID] = process.Name
	}
	networkConnections := collectNetworkConnections(processNames)
	networkEvents := runtimeConnectionEvents(networkConnections)
	serviceInventory := collectServiceInventory()
	helperBatch := drainRuntimeHelperBatch()
	processEvents = append(processEvents, helperBatch.ProcessEvents...)
	networkEvents = append(networkEvents, helperBatch.NetworkEvents...)
	serviceInventory = mergeServiceInventory(serviceInventory, helperBatch.ServiceInventory)
	startupItems := mergeStartupItems(collectStartupItems(), helperBatch.StartupItems)
	fileEvents := append(drainRuntimeFileEvents(), helperBatch.FileEvents...)
	authEvents := append(collectAuthEvents(), helperBatch.AuthEvents...)
	dnsEvents := append(collectDNSEvents(), helperBatch.DNSEvents...)
	securityPosture := collectSecurityPosture(serviceInventory)
	securityPosture = mergeSecurityCapabilities(securityPosture, helperBatch.Capabilities)

	payload := model.SnapshotPayload{
		AgentID:            cfg.AgentID,
		Hostname:           hostname,
		DeviceType:         cfg.DeviceType,
		AgentVersion:       version.AgentVersion,
		OSName:             hostInfo.Platform,
		OSVersion:          fmt.Sprintf("%s %s", hostInfo.PlatformVersion, hostInfo.KernelVersion),
		Architecture:       runtime.GOARCH,
		PrimaryIP:          primaryIP(),
		CPUCount:           cpuCount,
		TotalMemoryMB:      bytesToMB(vm.Total),
		TotalDiskGB:        bytesToGB(diskUsage.Total),
		CPUPercent:         firstFloat(cpuPercent),
		MemoryPercent:      floatPtr(vm.UsedPercent),
		DiskPercent:        floatPtr(diskUsage.UsedPercent),
		NetworkSentMB:      networkSent(netStats),
		NetworkRecvMB:      networkRecv(netStats),
		LoadOne:            loadOne,
		LoadFive:           loadFive,
		LoadFifteen:        loadFifteen,
		UptimeSeconds:      hostInfo.Uptime,
		ActiveUserCount:    len(users),
		ListeningPorts:     listeningPorts(),
		NetworkConnections: networkConnections,
		NetworkEvents:      truncateNetworkEventsPayload(networkEvents),
		DNSEvents:          truncateDNSEventPayload(dnsEvents),
		StartupItems:       startupItems,
		ServiceInventory:   serviceInventory,
		SoftwareInventory:  collectSoftwareInventory(),
		UserSessions:       collectUserSessions(users),
		FileIntegrityItems: collectFileIntegrityItems(),
		FileEvents:         truncateFileEventPayload(fileEvents),
		AuthEvents:         truncateAuthEventPayload(authEvents),
		ProcessEvents:      truncateProcessEventPayload(processEvents),
		SecurityPosture:    securityPosture,
		CollectorSources:   runtimeCollectorSources(),
		Processes:          processes,
	}

	return payload, nil
}

func mergeServiceInventory(base []model.ServiceItem, extra []model.ServiceItem) []model.ServiceItem {
	if len(extra) == 0 {
		return base
	}
	seen := make(map[string]struct{}, len(base))
	results := append([]model.ServiceItem{}, base...)
	for _, item := range base {
		seen[strings.ToLower(strings.TrimSpace(item.Manager+"|"+item.Scope+"|"+item.Name))] = struct{}{}
	}
	for _, item := range extra {
		key := strings.ToLower(strings.TrimSpace(item.Manager + "|" + item.Scope + "|" + item.Name))
		if key == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		results = append(results, item)
	}
	if len(results) > 240 {
		results = results[:240]
	}
	return results
}

func mergeStartupItems(base []model.StartupItem, extra []model.StartupItem) []model.StartupItem {
	if len(extra) == 0 {
		return base
	}
	seen := make(map[string]struct{}, len(base))
	results := append([]model.StartupItem{}, base...)
	for _, item := range base {
		seen[strings.ToLower(strings.TrimSpace(item.Scope+"|"+item.Type+"|"+item.Location+"|"+item.Name))] = struct{}{}
	}
	for _, item := range extra {
		key := strings.ToLower(strings.TrimSpace(item.Scope + "|" + item.Type + "|" + item.Location + "|" + item.Name))
		if key == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		results = append(results, item)
	}
	if len(results) > 120 {
		results = results[:120]
	}
	return results
}

func mergeSecurityCapabilities(base model.SecurityPosture, capabilities []model.CollectorCapability) model.SecurityPosture {
	if len(capabilities) == 0 {
		return base
	}
	seen := make(map[string]struct{}, len(base.CollectorCapabilities))
	results := append([]model.CollectorCapability{}, base.CollectorCapabilities...)
	for _, capability := range base.CollectorCapabilities {
		seen[strings.ToLower(strings.TrimSpace(capability.Name))] = struct{}{}
	}
	for _, capability := range capabilities {
		key := strings.ToLower(strings.TrimSpace(capability.Name))
		if key == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			for index, existing := range results {
				if strings.EqualFold(existing.Name, capability.Name) {
					results[index] = capability
					break
				}
			}
			continue
		}
		seen[key] = struct{}{}
		results = append(results, capability)
	}
	base.CollectorCapabilities = results
	return base
}

func truncateProcessEventPayload(items []model.ProcessEvent) []model.ProcessEvent {
	if len(items) > 240 {
		return items[:240]
	}
	return items
}

func truncateNetworkEventsPayload(items []model.NetworkEvent) []model.NetworkEvent {
	if len(items) > 240 {
		return items[:240]
	}
	return items
}

func truncateFileEventPayload(items []model.FileEvent) []model.FileEvent {
	if len(items) > 200 {
		return items[:200]
	}
	return items
}

func truncateAuthEventPayload(items []model.AuthEvent) []model.AuthEvent {
	if len(items) > 96 {
		return items[:96]
	}
	return items
}

func truncateDNSEventPayload(items []model.DNSEvent) []model.DNSEvent {
	if len(items) > 160 {
		return items[:160]
	}
	return items
}

func collectUserSessions(users []host.UserStat) []model.UserSession {
	results := make([]model.UserSession, 0, len(users))
	for _, user := range users {
		startedAt := ""
		if user.Started > 0 {
			startedAt = time.Unix(int64(user.Started), 0).UTC().Format(time.RFC3339)
		}
		results = append(results, model.UserSession{
			Username:  user.User,
			Terminal:  user.Terminal,
			Host:      user.Host,
			StartedAt: startedAt,
			Remote:    strings.TrimSpace(user.Host) != "",
			Type:      sessionType(user),
		})
	}

	sort.SliceStable(results, func(i, j int) bool {
		if results[i].Remote == results[j].Remote {
			if results[i].Username == results[j].Username {
				return results[i].Terminal < results[j].Terminal
			}
			return results[i].Username < results[j].Username
		}
		return results[i].Remote && !results[j].Remote
	})
	return results
}

func sessionType(user host.UserStat) string {
	if strings.TrimSpace(user.Host) != "" {
		return "remote"
	}
	if strings.TrimSpace(user.Terminal) == "console" {
		return "console"
	}
	return "local"
}

func collectNetworkConnections(processNames map[int32]string) []model.NetworkConnection {
	connections, err := gnet.Connections("inet")
	if err != nil {
		return nil
	}

	results := make([]model.NetworkConnection, 0, len(connections))
	for _, connection := range connections {
		if connection.Status != "LISTEN" && connection.Status != "ESTABLISHED" {
			continue
		}
		if connection.Laddr.Port == 0 {
			continue
		}
		results = append(results, model.NetworkConnection{
			PID:           connection.Pid,
			ProcessName:   processNames[connection.Pid],
			Protocol:      socketProtocol(connection.Type),
			Status:        connection.Status,
			LocalAddress:  connection.Laddr.IP,
			LocalPort:     connection.Laddr.Port,
			RemoteAddress: connection.Raddr.IP,
			RemotePort:    connection.Raddr.Port,
			Family:        socketFamily(connection.Family),
			Direction:     connectionDirection(connection),
			RemoteDomain:  reverseDomainForAddress(connection.Raddr.IP),
			RemoteScope:   remoteScope(connection.Raddr.IP),
			ServiceLabel:  serviceLabel(connection.Type, connection.Laddr.Port, connection.Raddr.Port),
			TLSSuspected:  tlsLikely(connection.Laddr.Port, connection.Raddr.Port),
			SecurityHint:  securityHint(connection.Raddr.IP, connection.Raddr.Port),
		})
	}

	sort.SliceStable(results, func(i, j int) bool {
		if results[i].Status == results[j].Status {
			if results[i].LocalPort == results[j].LocalPort {
				return results[i].PID < results[j].PID
			}
			return results[i].LocalPort < results[j].LocalPort
		}
		return results[i].Status < results[j].Status
	})
	if len(results) > 80 {
		results = results[:80]
	}
	return results
}

func reverseDomainForAddress(address string) string {
	address = strings.TrimSpace(address)
	if address == "" || address == "*" {
		return ""
	}
	if net.ParseIP(address) == nil {
		return address
	}
	if scope := remoteScope(address); scope != "public" {
		return address
	}
	if cached, ok := reverseLookupCache.Load(address); ok {
		return cached.(string)
	}
	names, err := net.LookupAddr(address)
	if err != nil || len(names) == 0 {
		reverseLookupCache.Store(address, address)
		return address
	}
	name := strings.TrimSuffix(names[0], ".")
	reverseLookupCache.Store(address, name)
	return name
}

func remoteScope(address string) string {
	ip := net.ParseIP(strings.TrimSpace(address))
	if ip == nil {
		if address == "" {
			return "none"
		}
		return "hostname"
	}
	if ip.IsLoopback() {
		return "loopback"
	}
	if ip.IsPrivate() {
		return "private"
	}
	if ip.IsMulticast() {
		return "multicast"
	}
	if ip.IsLinkLocalMulticast() || ip.IsLinkLocalUnicast() {
		return "link-local"
	}
	if ip.IsUnspecified() {
		return "unspecified"
	}
	return "public"
}

func serviceLabel(socketType uint32, localPort uint32, remotePort uint32) string {
	port := remotePort
	if port == 0 {
		port = localPort
	}
	switch port {
	case 22:
		return "ssh"
	case 25:
		return "smtp"
	case 53:
		return "dns"
	case 80:
		return "http"
	case 110:
		return "pop3"
	case 123:
		return "ntp"
	case 143:
		return "imap"
	case 389:
		return "ldap"
	case 443:
		return "https"
	case 445:
		return "smb"
	case 465:
		return "smtps"
	case 587:
		return "submission"
	case 636:
		return "ldaps"
	case 993:
		return "imaps"
	case 995:
		return "pop3s"
	case 3306:
		return "mysql"
	case 3389:
		return "rdp"
	case 5432:
		return "postgres"
	case 6379:
		return "redis"
	case 8080:
		return "http-alt"
	case 8443:
		return "https-alt"
	}
	if socketProtocol(socketType) == "udp" {
		return "udp"
	}
	return "custom"
}

func tlsLikely(localPort uint32, remotePort uint32) bool {
	port := remotePort
	if port == 0 {
		port = localPort
	}
	switch port {
	case 443, 465, 563, 636, 853, 989, 990, 992, 993, 995, 8443:
		return true
	default:
		return false
	}
}

func securityHint(address string, remotePort uint32) string {
	scope := remoteScope(address)
	switch {
	case scope == "loopback":
		return "local-only"
	case scope == "private":
		return "internal"
	case remotePort == 22 || remotePort == 3389:
		return "remote-admin"
	case remotePort == 53:
		return "resolver"
	case tlsLikely(0, remotePort):
		return "encrypted"
	case scope == "public":
		return "public-egress"
	default:
		return "observed"
	}
}

func collectStartupItems() []model.StartupItem {
	switch runtime.GOOS {
	case "darwin":
		return collectDarwinStartupItems()
	case "linux":
		return collectLinuxStartupItems()
	case "windows":
		return collectWindowsStartupItems()
	default:
		return nil
	}
}

func collectDarwinStartupItems() []model.StartupItem {
	directories := []struct {
		Path  string
		Scope string
		Type  string
	}{
		{Path: "/Library/LaunchDaemons", Scope: "system", Type: "launchd"},
		{Path: "/Library/LaunchAgents", Scope: "system", Type: "launchd"},
	}
	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" {
		directories = append(directories, struct {
			Path  string
			Scope string
			Type  string
		}{
			Path:  filepath.Join(home, "Library", "LaunchAgents"),
			Scope: "user",
			Type:  "launchd",
		})
	}
	return collectStartupEntries(directories)
}

func collectLinuxStartupItems() []model.StartupItem {
	directories := []struct {
		Path  string
		Scope string
		Type  string
	}{
		{Path: "/etc/systemd/system", Scope: "system", Type: "systemd"},
		{Path: "/etc/init.d", Scope: "system", Type: "init"},
		{Path: "/etc/cron.d", Scope: "system", Type: "cron"},
	}
	if home, err := os.UserHomeDir(); err == nil && strings.TrimSpace(home) != "" {
		directories = append(directories, struct {
			Path  string
			Scope string
			Type  string
		}{
			Path:  filepath.Join(home, ".config", "systemd", "user"),
			Scope: "user",
			Type:  "systemd",
		})
	}
	return collectStartupEntries(directories)
}

func collectStartupEntries(directories []struct {
	Path  string
	Scope string
	Type  string
}) []model.StartupItem {
	results := make([]model.StartupItem, 0, 32)
	for _, directory := range directories {
		entries, err := os.ReadDir(directory.Path)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			results = append(results, model.StartupItem{
				Name:     entry.Name(),
				Type:     directory.Type,
				Scope:    directory.Scope,
				Location: filepath.Join(directory.Path, entry.Name()),
			})
		}
	}
	sort.SliceStable(results, func(i, j int) bool {
		if results[i].Scope == results[j].Scope {
			if results[i].Type == results[j].Type {
				return results[i].Name < results[j].Name
			}
			return results[i].Type < results[j].Type
		}
		return results[i].Scope < results[j].Scope
	})
	if len(results) > 40 {
		results = results[:40]
	}
	return results
}

func socketProtocol(value uint32) string {
	switch value {
	case 1:
		return "tcp"
	case 2:
		return "udp"
	default:
		return "other"
	}
}

func socketFamily(value uint32) string {
	switch value {
	case 2:
		return "ipv4"
	case 10:
		return "ipv6"
	default:
		return "other"
	}
}

func connectionDirection(connection gnet.ConnectionStat) string {
	if connection.Status == "LISTEN" {
		return "ingress"
	}
	if strings.TrimSpace(connection.Raddr.IP) != "" {
		return "egress"
	}
	return "local"
}

func collectProcesses() ([]model.Process, error) {
	procs, err := process.Processes()
	if err != nil {
		return nil, err
	}

	results := make([]model.Process, 0, len(procs))
	for _, proc := range procs {
		name, _ := proc.Name()
		cpuPercent, _ := proc.CPUPercent()
		memInfo, _ := proc.MemoryInfo()
		username, _ := proc.Username()
		cmdline, _ := proc.Cmdline()
		status, _ := proc.Status()
		ppid, _ := proc.Ppid()
		exePath, _ := proc.Exe()
		createTime, _ := proc.CreateTime()

		entry := model.Process{
			PID:      proc.Pid,
			PPID:     ppid,
			Name:     trimOrUnknown(name),
			Status:   strings.Join(status, ","),
			Username: username,
			Cmdline:  cmdline,
			ExePath:  exePath,
		}
		if createTime > 0 {
			entry.StartedAt = time.UnixMilli(createTime).UTC().Format(time.RFC3339)
		}
		if cpuPercent >= 0 {
			entry.CPUPercent = floatPtr(float64(cpuPercent))
		}
		if memInfo != nil {
			entry.MemoryMB = floatPtr(bytesToMB(memInfo.RSS))
		}

		results = append(results, entry)
	}

	sort.SliceStable(results, func(i, j int) bool {
		left := derefFloat(results[i].CPUPercent)
		right := derefFloat(results[j].CPUPercent)
		if left == right {
			return derefFloat(results[i].MemoryMB) > derefFloat(results[j].MemoryMB)
		}
		return left > right
	})

	return results, nil
}

func listeningPorts() []uint32 {
	connections, err := gnet.Connections("inet")
	if err != nil {
		return nil
	}

	set := map[uint32]struct{}{}
	for _, connection := range connections {
		if connection.Status != "LISTEN" {
			continue
		}
		if connection.Laddr.Port == 0 {
			continue
		}
		set[connection.Laddr.Port] = struct{}{}
	}

	ports := make([]uint32, 0, len(set))
	for port := range set {
		ports = append(ports, port)
	}
	sort.Slice(ports, func(i, j int) bool { return ports[i] < ports[j] })
	if len(ports) > 20 {
		ports = ports[:20]
	}
	return ports
}

func primaryIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "127.0.0.1"
	}
	defer conn.Close()

	localAddr, ok := conn.LocalAddr().(*net.UDPAddr)
	if !ok || localAddr.IP == nil {
		return "127.0.0.1"
	}
	return localAddr.IP.String()
}

func networkSent(stats []gnet.IOCountersStat) *float64 {
	if len(stats) == 0 {
		return nil
	}
	return floatPtr(bytesToMB(stats[0].BytesSent))
}

func networkRecv(stats []gnet.IOCountersStat) *float64 {
	if len(stats) == 0 {
		return nil
	}
	return floatPtr(bytesToMB(stats[0].BytesRecv))
}

func trimOrUnknown(value string) string {
	if strings.TrimSpace(value) == "" {
		return "unknown"
	}
	return value
}

func bytesToMB(value uint64) float64 {
	return float64(value) / (1024 * 1024)
}

func bytesToGB(value uint64) float64 {
	return float64(value) / (1024 * 1024 * 1024)
}

func floatPtr(value float64) *float64 {
	return &value
}

func firstFloat(values []float64) *float64 {
	if len(values) == 0 {
		return nil
	}
	return floatPtr(values[0])
}

func derefFloat(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}
