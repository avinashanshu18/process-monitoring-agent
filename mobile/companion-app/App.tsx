import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Battery from "expo-battery";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { StatusBar } from "expo-status-bar";

type HostItem = {
  agent_id: string | null;
  hostname: string;
  display_name: string;
  status: string;
  latest_alert_level: string;
};

type AlertItem = {
  id: string;
  message: string;
  level: string;
  status: string;
  hostname: string;
  type: string;
};

type CompanionConfig = {
  apiBase: string;
  username: string;
  token: string;
  deviceId: string;
};

type DeviceTelemetry = {
  device_id: string;
  hostname: string;
  platform: string;
  os_name: string;
  os_version: string;
  manufacturer: string;
  model_name: string;
  app_version: string;
  battery_level: number | null;
  battery_state: string;
  low_power_mode: boolean;
  network_type: string;
  is_connected: boolean;
  is_internet_reachable: boolean | null;
  total_memory_mb: number | null;
  physical_device: boolean;
  timezone: string;
  locale: string;
};

const STORAGE_KEY = "hostlens-companion-config";
const DEFAULT_API_BASE = "http://127.0.0.1:8001/api/v1";
const HEARTBEAT_INTERVAL_MS = 60000;

function batteryStateLabel(state: Battery.BatteryState | null | undefined) {
  switch (state) {
    case Battery.BatteryState.CHARGING:
      return "charging";
    case Battery.BatteryState.FULL:
      return "full";
    case Battery.BatteryState.UNPLUGGED:
      return "unplugged";
    default:
      return "unknown";
  }
}

function generateDeviceId() {
  return `mobile-${Platform.OS}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function ensureDeviceId(existing?: string) {
  if (existing) {
    return existing;
  }
  const nextId = generateDeviceId();
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return nextId;
  }
  try {
    const parsed = JSON.parse(saved) as Partial<CompanionConfig>;
    const updated = {
      apiBase: parsed.apiBase || DEFAULT_API_BASE,
      username: parsed.username || "",
      token: parsed.token || "",
      deviceId: nextId,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Keep the generated device id in memory if the cache is invalid.
  }
  return nextId;
}

async function collectTelemetry(deviceId: string): Promise<DeviceTelemetry> {
  const [batteryLevel, batteryState, lowPowerMode, networkState] = await Promise.all([
    Battery.getBatteryLevelAsync().catch(() => -1),
    Battery.getBatteryStateAsync().catch(() => null),
    Battery.isLowPowerModeEnabledAsync().catch(() => false),
    Network.getNetworkStateAsync().catch(() => null),
  ]);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "unknown";

  return {
    device_id: deviceId,
    hostname:
      Device.deviceName ||
      Device.modelName ||
      `${Platform.OS}-${Application.nativeApplicationVersion || "device"}`,
    platform: Platform.OS,
    os_name: Device.osName || Platform.OS,
    os_version: Device.osVersion || "",
    manufacturer: Device.manufacturer || "",
    model_name: Device.modelName || "",
    app_version: Application.nativeApplicationVersion || "0.1.0",
    battery_level: batteryLevel >= 0 ? Math.round(batteryLevel * 1000) / 10 : null,
    battery_state: batteryStateLabel(batteryState),
    low_power_mode: lowPowerMode,
    network_type: networkState?.type ? String(networkState.type) : "unknown",
    is_connected: Boolean(networkState?.isConnected),
    is_internet_reachable:
      typeof networkState?.isInternetReachable === "boolean"
        ? networkState.isInternetReachable
        : null,
    total_memory_mb: Device.totalMemory
      ? Math.round((Device.totalMemory / (1024 * 1024)) * 10) / 10
      : null,
    physical_device: Device.isDevice,
    timezone,
    locale,
  };
}

export default function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [heartbeatLoading, setHeartbeatLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(async (saved) => {
      if (!saved) {
        const nextDeviceId = await ensureDeviceId("");
        setDeviceId(nextDeviceId);
        return;
      }
      try {
        const parsed = JSON.parse(saved) as Partial<CompanionConfig>;
        setApiBase(parsed.apiBase || DEFAULT_API_BASE);
        setUsername(parsed.username || "");
        setToken(parsed.token || "");
        const nextDeviceId = await ensureDeviceId(parsed.deviceId || "");
        setDeviceId(nextDeviceId);
      } catch {
        const nextDeviceId = await ensureDeviceId("");
        setDeviceId(nextDeviceId);
      }
    });
  }, []);

  const signedIn = Boolean(token);

  useEffect(() => {
    if (!signedIn || !deviceId) {
      return;
    }
    void refreshWorkspace();
    void sendHeartbeat();
    const interval = setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [signedIn, deviceId, token, apiBase]);

  async function persistConfig(nextToken: string) {
    const nextConfig: CompanionConfig = {
      apiBase,
      username,
      token: nextToken,
      deviceId: deviceId || generateDeviceId(),
    };
    setDeviceId(nextConfig.deviceId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
  }

  async function login() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail || "Login failed");
      }
      setToken(payload.access);
      await persistConfig(payload.access);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendHeartbeat() {
    if (!token || !deviceId) {
      return;
    }
    setHeartbeatLoading(true);
    try {
      const nextTelemetry = await collectTelemetry(deviceId);
      const response = await fetch(`${apiBase}/mobile/heartbeat/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextTelemetry),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail || "Heartbeat failed");
      }
      setTelemetry(nextTelemetry);
      setLastHeartbeatAt(new Date().toLocaleString());
      setHosts((current) => {
        const existing = current.filter((host) => host.agent_id !== payload.agent_id);
        return [
          {
            agent_id: payload.agent_id,
            hostname: payload.hostname,
            display_name: payload.display_name,
            status: payload.host_status,
            latest_alert_level: payload.risk_level,
          },
          ...existing,
        ];
      });
    } catch (heartbeatError) {
      setError(heartbeatError instanceof Error ? heartbeatError.message : "Heartbeat failed");
    } finally {
      setHeartbeatLoading(false);
    }
  }

  async function refreshWorkspace() {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [hostsResponse, alertsResponse] = await Promise.all([
        fetch(`${apiBase}/hosts/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBase}/alerts/?status=open,acknowledged,muted&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const hostsPayload = await hostsResponse.json();
      const alertsPayload = await alertsResponse.json();
      if (!hostsResponse.ok) {
        throw new Error(hostsPayload?.detail || "Unable to load hosts");
      }
      if (!alertsResponse.ok) {
        throw new Error(alertsPayload?.detail || "Unable to load alerts");
      }
      setHosts(hostsPayload.hosts || []);
      setAlerts(alertsPayload.alerts || []);
    } catch (workspaceError) {
      setError(workspaceError instanceof Error ? workspaceError.message : "Unable to refresh workspace");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setToken("");
    setHosts([]);
    setAlerts([]);
    setTelemetry(null);
    setLastHeartbeatAt("");
    await persistConfig("");
  }

  const telemetryRows = useMemo(
    () =>
      telemetry
        ? [
            ["Device", telemetry.hostname],
            ["Platform", `${telemetry.os_name} ${telemetry.os_version}`],
            ["Model", telemetry.model_name || "Unknown"],
            ["Battery", telemetry.battery_level != null ? `${telemetry.battery_level}%` : "Unknown"],
            ["Battery state", telemetry.battery_state],
            ["Network", telemetry.network_type],
            ["Internet", telemetry.is_internet_reachable == null ? "Unknown" : telemetry.is_internet_reachable ? "Reachable" : "Offline"],
            ["Memory", telemetry.total_memory_mb != null ? `${telemetry.total_memory_mb} MB` : "Unknown"],
            ["Timezone", telemetry.timezone],
          ]
        : [],
    [telemetry],
  );

  if (!signedIn) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.eyebrow}>HostLens Mobile Collector</Text>
          <Text style={styles.title}>Sign in and turn this phone into a real HostLens device.</Text>
          <Text style={styles.copy}>
            This app now captures supported mobile telemetry and posts signed heartbeats into your HostLens workspace.
          </Text>
          <TextInput value={apiBase} onChangeText={setApiBase} placeholder="API base" placeholderTextColor="#7b8795" style={styles.input} autoCapitalize="none" />
          <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor="#7b8795" style={styles.input} autoCapitalize="none" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#7b8795" style={styles.input} secureTextEntry />
          <View style={styles.deviceBadge}>
            <Text style={styles.deviceBadgeText}>Device ID: {deviceId || "Preparing..."}</Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign in and start telemetry"}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Mobile telemetry</Text>
            <Text style={styles.title}>HostLens companion collector</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={logout}>
            <Text style={styles.secondaryButtonText}>Log out</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Collector state</Text>
          <Text style={styles.cardMeta}>Heartbeat interval: 60s</Text>
          <Text style={styles.cardMeta}>Last upload: {lastHeartbeatAt || "Pending first upload"}</Text>
          <Text style={styles.cardMeta}>Device ID: {deviceId}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={sendHeartbeat}>
              <Text style={styles.buttonText}>{heartbeatLoading ? "Sending..." : "Send heartbeat now"}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={refreshWorkspace}>
              <Text style={styles.secondaryButtonText}>{loading ? "Refreshing..." : "Refresh workspace"}</Text>
            </Pressable>
          </View>
        </View>

        {heartbeatLoading || loading ? <ActivityIndicator color="#77e0c3" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Local telemetry</Text>
        <View style={styles.card}>
          {telemetryRows.length === 0 ? (
            <Text style={styles.cardMeta}>Telemetry will appear after the first heartbeat.</Text>
          ) : (
            telemetryRows.map(([label, value]) => (
              <View key={label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text style={styles.metaValue}>{value}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Workspace devices</Text>
        {hosts.map((host) => (
          <View key={host.agent_id || host.hostname} style={styles.card}>
            <Text style={styles.cardTitle}>{host.display_name || host.hostname}</Text>
            <Text style={styles.cardMeta}>
              {host.status} · {host.latest_alert_level || "healthy"}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Active alerts</Text>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.card}>
            <Text style={styles.cardTitle}>{alert.message}</Text>
            <Text style={styles.cardMeta}>
              {alert.hostname} · {alert.level} · {alert.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#041019",
  },
  container: {
    padding: 20,
    gap: 14,
  },
  eyebrow: {
    color: "#77e0c3",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
  },
  copy: {
    marginTop: 10,
    color: "#97a5b6",
    fontSize: 15,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    borderRadius: 18,
    backgroundColor: "#77e0c3",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#031117",
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  error: {
    color: "#ffb4b4",
    fontSize: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    gap: 8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: "#97a5b6",
    fontSize: 14,
  },
  deviceBadge: {
    borderRadius: 14,
    backgroundColor: "rgba(119,224,195,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deviceBadgeText: {
    color: "#dffdf6",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLabel: {
    color: "#97a5b6",
    fontSize: 13,
  },
  metaValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});
