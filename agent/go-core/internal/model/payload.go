package model

type Process struct {
	PID        int32    `json:"pid"`
	PPID       int32    `json:"ppid,omitempty"`
	Name       string   `json:"name"`
	CPUPercent *float64 `json:"cpu_percent,omitempty"`
	MemoryMB   *float64 `json:"memory_mb,omitempty"`
	Status     string   `json:"status,omitempty"`
	Username   string   `json:"username,omitempty"`
	Cmdline    string   `json:"cmdline,omitempty"`
	ExePath    string   `json:"exe_path,omitempty"`
	StartedAt  string   `json:"started_at,omitempty"`
}

type ProcessEvent struct {
	PID         int32  `json:"pid,omitempty"`
	PPID        int32  `json:"ppid,omitempty"`
	Name        string `json:"name,omitempty"`
	ParentName  string `json:"parent_name,omitempty"`
	Username    string `json:"username,omitempty"`
	Cmdline     string `json:"cmdline,omitempty"`
	ExePath     string `json:"exe_path,omitempty"`
	EventType   string `json:"event_type,omitempty"`
	OccurredAt  string `json:"occurred_at,omitempty"`
	StartedAt   string `json:"started_at,omitempty"`
	SessionType string `json:"session_type,omitempty"`
}

type NetworkEvent struct {
	PID           int32  `json:"pid,omitempty"`
	ProcessName   string `json:"process_name,omitempty"`
	Protocol      string `json:"protocol,omitempty"`
	Status        string `json:"status,omitempty"`
	LocalAddress  string `json:"local_address,omitempty"`
	LocalPort     uint32 `json:"local_port,omitempty"`
	RemoteAddress string `json:"remote_address,omitempty"`
	RemotePort    uint32 `json:"remote_port,omitempty"`
	RemoteDomain  string `json:"remote_domain,omitempty"`
	RemoteScope   string `json:"remote_scope,omitempty"`
	ServiceLabel  string `json:"service_label,omitempty"`
	TLSSuspected  bool   `json:"tls_suspected,omitempty"`
	SecurityHint  string `json:"security_hint,omitempty"`
	Direction     string `json:"direction,omitempty"`
	Family        string `json:"family,omitempty"`
	EventType     string `json:"event_type,omitempty"`
	OccurredAt    string `json:"occurred_at,omitempty"`
}

type NetworkConnection struct {
	PID           int32  `json:"pid,omitempty"`
	ProcessName   string `json:"process_name,omitempty"`
	Protocol      string `json:"protocol,omitempty"`
	Status        string `json:"status,omitempty"`
	LocalAddress  string `json:"local_address,omitempty"`
	LocalPort     uint32 `json:"local_port,omitempty"`
	RemoteAddress string `json:"remote_address,omitempty"`
	RemotePort    uint32 `json:"remote_port,omitempty"`
	Family        string `json:"family,omitempty"`
	Direction     string `json:"direction,omitempty"`
	RemoteDomain  string `json:"remote_domain,omitempty"`
	RemoteScope   string `json:"remote_scope,omitempty"`
	ServiceLabel  string `json:"service_label,omitempty"`
	TLSSuspected  bool   `json:"tls_suspected,omitempty"`
	SecurityHint  string `json:"security_hint,omitempty"`
}

type DNSEvent struct {
	Query      string   `json:"query,omitempty"`
	RecordType string   `json:"record_type,omitempty"`
	Process    string   `json:"process,omitempty"`
	PID        int32    `json:"pid,omitempty"`
	Answers    []string `json:"answers,omitempty"`
	Status     string   `json:"status,omitempty"`
	Source     string   `json:"source,omitempty"`
	OccurredAt string   `json:"occurred_at,omitempty"`
}

type StartupItem struct {
	Name      string `json:"name"`
	Type      string `json:"type,omitempty"`
	Scope     string `json:"scope,omitempty"`
	Location  string `json:"location,omitempty"`
	Command   string `json:"command,omitempty"`
	Publisher string `json:"publisher,omitempty"`
}

type ServiceItem struct {
	Name          string `json:"name"`
	DisplayName   string `json:"display_name,omitempty"`
	Manager       string `json:"manager,omitempty"`
	Scope         string `json:"scope,omitempty"`
	State         string `json:"state,omitempty"`
	SubState      string `json:"sub_state,omitempty"`
	StartupType   string `json:"startup_type,omitempty"`
	Status        string `json:"status,omitempty"`
	Executable    string `json:"executable,omitempty"`
	Username      string `json:"username,omitempty"`
	PID           int32  `json:"pid,omitempty"`
	ExitCode      string `json:"exit_code,omitempty"`
	UnitFileState string `json:"unit_file_state,omitempty"`
}

type SoftwareItem struct {
	Name           string `json:"name"`
	Identifier     string `json:"identifier,omitempty"`
	Version        string `json:"version,omitempty"`
	Publisher      string `json:"publisher,omitempty"`
	InstallPath    string `json:"install_path,omitempty"`
	InstallScope   string `json:"install_scope,omitempty"`
	InstallSource  string `json:"install_source,omitempty"`
	ExecutablePath string `json:"executable_path,omitempty"`
	SignatureState string `json:"signature_state,omitempty"`
	Signer         string `json:"signer,omitempty"`
	TeamIdentifier string `json:"team_identifier,omitempty"`
	SHA256         string `json:"sha256,omitempty"`
}

type UserSession struct {
	Username  string `json:"username"`
	Terminal  string `json:"terminal,omitempty"`
	Host      string `json:"host,omitempty"`
	StartedAt string `json:"started_at,omitempty"`
	Remote    bool   `json:"remote"`
	Type      string `json:"type,omitempty"`
}

type FileIntegrityItem struct {
	Path       string `json:"path"`
	Category   string `json:"category,omitempty"`
	ModifiedAt string `json:"modified_at,omitempty"`
	SizeBytes  int64  `json:"size_bytes,omitempty"`
	SHA256     string `json:"sha256,omitempty"`
	Mode       string `json:"mode,omitempty"`
}

type FileEvent struct {
	Path       string `json:"path"`
	Category   string `json:"category,omitempty"`
	Action     string `json:"action,omitempty"`
	OccurredAt string `json:"occurred_at,omitempty"`
	SHA256     string `json:"sha256,omitempty"`
	Mode       string `json:"mode,omitempty"`
}

type AuthEvent struct {
	Username   string `json:"username"`
	Terminal   string `json:"terminal,omitempty"`
	Source     string `json:"source,omitempty"`
	OccurredAt string `json:"occurred_at,omitempty"`
	EventType  string `json:"event_type,omitempty"`
	Status     string `json:"status,omitempty"`
	Summary    string `json:"summary,omitempty"`
	SourceIP   string `json:"source_ip,omitempty"`
	Method     string `json:"method,omitempty"`
	EventID    string `json:"event_id,omitempty"`
	Session    string `json:"session,omitempty"`
}

type USBDevice struct {
	Name      string `json:"name,omitempty"`
	Vendor    string `json:"vendor,omitempty"`
	ProductID string `json:"product_id,omitempty"`
	Serial    string `json:"serial,omitempty"`
}

type ExtensionItem struct {
	Name       string `json:"name,omitempty"`
	Identifier string `json:"identifier,omitempty"`
	Version    string `json:"version,omitempty"`
	Source     string `json:"source,omitempty"`
	State      string `json:"state,omitempty"`
}

type CollectorCapability struct {
	Name   string `json:"name,omitempty"`
	Layer  string `json:"layer,omitempty"`
	State  string `json:"state,omitempty"`
	Detail string `json:"detail,omitempty"`
}

type SecurityPosture struct {
	Mode                  string                `json:"mode,omitempty"`
	FirewallState         string                `json:"firewall_state,omitempty"`
	FirewallDetails       string                `json:"firewall_details,omitempty"`
	DiskEncryptionState   string                `json:"disk_encryption_state,omitempty"`
	DiskEncryptionDetail  string                `json:"disk_encryption_detail,omitempty"`
	AntivirusState        string                `json:"antivirus_state,omitempty"`
	AntivirusProducts     []string              `json:"antivirus_products,omitempty"`
	MDMState              string                `json:"mdm_state,omitempty"`
	GatekeeperState       string                `json:"gatekeeper_state,omitempty"`
	SIPState              string                `json:"sip_state,omitempty"`
	ScheduledTasksCount   int                   `json:"scheduled_tasks_count,omitempty"`
	SystemExtensions      []ExtensionItem       `json:"system_extensions,omitempty"`
	BrowserExtensions     []ExtensionItem       `json:"browser_extensions,omitempty"`
	USBDevices            []USBDevice           `json:"usb_devices,omitempty"`
	CollectorCapabilities []CollectorCapability `json:"collector_capabilities,omitempty"`
	CollectorMode         string                `json:"collector_mode,omitempty"`
}

type SnapshotPayload struct {
	AgentID            string              `json:"agent_id"`
	Hostname           string              `json:"hostname"`
	DeviceType         string              `json:"device_type"`
	AgentVersion       string              `json:"agent_version"`
	OSName             string              `json:"os_name"`
	OSVersion          string              `json:"os_version"`
	Architecture       string              `json:"architecture"`
	PrimaryIP          string              `json:"primary_ip,omitempty"`
	CPUCount           int                 `json:"cpu_count,omitempty"`
	TotalMemoryMB      float64             `json:"total_memory_mb,omitempty"`
	TotalDiskGB        float64             `json:"total_disk_gb,omitempty"`
	CPUPercent         *float64            `json:"cpu_percent,omitempty"`
	MemoryPercent      *float64            `json:"memory_percent,omitempty"`
	DiskPercent        *float64            `json:"disk_percent,omitempty"`
	NetworkSentMB      *float64            `json:"network_sent_mb,omitempty"`
	NetworkRecvMB      *float64            `json:"network_recv_mb,omitempty"`
	LoadOne            *float64            `json:"load_one,omitempty"`
	LoadFive           *float64            `json:"load_five,omitempty"`
	LoadFifteen        *float64            `json:"load_fifteen,omitempty"`
	UptimeSeconds      uint64              `json:"uptime_seconds,omitempty"`
	ActiveUserCount    int                 `json:"active_user_count,omitempty"`
	ListeningPorts     []uint32            `json:"listening_ports,omitempty"`
	NetworkConnections []NetworkConnection `json:"network_connections,omitempty"`
	NetworkEvents      []NetworkEvent      `json:"network_events,omitempty"`
	DNSEvents          []DNSEvent          `json:"dns_events,omitempty"`
	StartupItems       []StartupItem       `json:"startup_items,omitempty"`
	ServiceInventory   []ServiceItem       `json:"service_inventory,omitempty"`
	SoftwareInventory  []SoftwareItem      `json:"software_inventory,omitempty"`
	UserSessions       []UserSession       `json:"user_sessions,omitempty"`
	FileIntegrityItems []FileIntegrityItem `json:"file_integrity_items,omitempty"`
	FileEvents         []FileEvent         `json:"file_events,omitempty"`
	AuthEvents         []AuthEvent         `json:"auth_events,omitempty"`
	ProcessEvents      []ProcessEvent      `json:"process_events,omitempty"`
	SecurityPosture    SecurityPosture     `json:"security_posture,omitempty"`
	CollectorSources   []string            `json:"collector_sources,omitempty"`
	Processes          []Process           `json:"processes"`
}

type PostResponse struct {
	HostAPIKey     string `json:"host_api_key"`
	Hostname       string `json:"hostname"`
	AgentID        string `json:"agent_id"`
	TotalProcesses int    `json:"total_processes"`
}

type AgentAction struct {
	ID         string         `json:"id"`
	Kind       string         `json:"kind"`
	Status     string         `json:"status"`
	Note       string         `json:"note"`
	Parameters map[string]any `json:"parameters"`
}

type AgentActionResult struct {
	Status string         `json:"status"`
	Result map[string]any `json:"result,omitempty"`
}
