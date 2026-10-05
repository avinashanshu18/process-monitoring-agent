"use client";

import { useEffect, useState } from "react";
import { Mail, Save, Send, SlidersHorizontal, Webhook } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useAlertRuleSettings } from "@/hooks/use-alert-rule-settings";
import type { AlertRuleSettings } from "@/hooks/use-alert-workflow";
import { useNotificationSettings, type NotificationPreference } from "@/hooks/use-notification-settings";

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="kicker">{label}</div>
      <div className="mt-2 relative">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 text-left transition hover:border-white/12 hover:bg-white/5"
    >
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="mt-2 text-sm leading-7 text-slate-400">{description}</div>
      </div>
      <div
        className={`mt-1 inline-flex h-7 w-12 rounded-full border transition ${
          checked
            ? "border-[rgba(119,224,195,0.26)] bg-[rgba(119,224,195,0.18)]"
            : "border-white/10 bg-white/5"
        }`}
      >
        <span
          className={`m-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, save, loading, saving, error } = useAlertRuleSettings();
  const {
    preference,
    setPreference,
    deliveries,
    loading: notificationLoading,
    saving: notificationSaving,
    error: notificationError,
    save: saveNotificationPreference,
  } = useNotificationSettings();
  const [draft, setDraft] = useState<AlertRuleSettings | null>(null);
  const [notificationDraft, setNotificationDraft] = useState<NotificationPreference | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setDraft(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (preference) {
      setNotificationDraft(preference);
    }
  }, [preference]);

  async function handleSave() {
    if (!draft) {
      return;
    }
    await save(draft);
    setMessage("Alert rules saved.");
  }

  async function handleSaveNotifications() {
    if (!notificationDraft) {
      return;
    }
    await saveNotificationPreference(notificationDraft);
    setMessage("Notification settings saved.");
  }

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Alert settings"
        description="Tune thresholds and detection rules so the alert lane matches real device behavior."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
              <div>
                <div className="eyebrow">Rule tuning</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Calibrate alerts for the devices you actually run.
                </div>
                <div className="section-copy mt-4 text-base">
                  Thresholds, watchlists, process spike sensitivity, and auto-resolution all live here now.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Current rule set</div>
                </div>
                {draft ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">CPU warning / critical</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.cpu_warning_threshold}% / {draft.cpu_critical_threshold}%
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Memory warning / critical</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.memory_warning_threshold}% / {draft.memory_critical_threshold}%
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Disk warning / critical</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.disk_warning_threshold}% / {draft.disk_critical_threshold}%
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Process spike floor</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.process_spike_min_delta} processes / {draft.process_spike_percent_threshold}%
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Software trust rules</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.new_software_tracking_enabled ? "New software" : "No new software"} ·{" "}
                        {draft.unsigned_software_alert_enabled ? "Unsigned alerts on" : "Unsigned alerts off"}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Session and persistence</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.remote_session_tracking_enabled ? "Remote sessions" : "Session tracking off"} ·{" "}
                        {draft.startup_drift_tracking_enabled ? "Startup drift" : "Persistence drift off"}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4 sm:col-span-2">
                      <div className="kicker">Integrity and auth watch</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.file_integrity_tracking_enabled ? "Sensitive file drift" : "Integrity watch off"} ·{" "}
                        {draft.auth_event_tracking_enabled ? "Auth history alerts" : "Auth history off"}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Policy engine</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.policy_engine_enabled ? "Checks and saved policies on" : "Checks disabled"}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Mobile compliance</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.mobile_compliance_tracking_enabled ? "Tracked" : "Disabled"} · Battery {draft.minimum_mobile_battery_percent}% · iOS/Android baseline {draft.minimum_mobile_os_version}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4 sm:col-span-2">
                      <div className="kicker">Patch posture</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {draft.vulnerability_tracking_enabled ? "Baseline patch review on" : "Patch review off"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 text-sm text-slate-400">{loading ? "Loading settings..." : "No settings available."}</div>
                )}
              </div>
            </div>
          </section>

          {error || notificationError ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error || notificationError}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-[1.6rem] border border-emerald-300/18 bg-emerald-300/10 px-5 py-4 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          {draft ? (
            <>
              <section className="grid gap-6 xl:grid-cols-3">
                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">System thresholds</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Global host saturation triggers.
                  </div>
                  <div className="mt-5 grid gap-4">
                    <NumberField label="CPU warning" value={draft.cpu_warning_threshold} onChange={(value) => setDraft((current) => current ? { ...current, cpu_warning_threshold: value } : current)} suffix="%" />
                    <NumberField label="CPU critical" value={draft.cpu_critical_threshold} onChange={(value) => setDraft((current) => current ? { ...current, cpu_critical_threshold: value } : current)} suffix="%" />
                    <NumberField label="Memory warning" value={draft.memory_warning_threshold} onChange={(value) => setDraft((current) => current ? { ...current, memory_warning_threshold: value } : current)} suffix="%" />
                    <NumberField label="Memory critical" value={draft.memory_critical_threshold} onChange={(value) => setDraft((current) => current ? { ...current, memory_critical_threshold: value } : current)} suffix="%" />
                    <NumberField label="Disk warning" value={draft.disk_warning_threshold} onChange={(value) => setDraft((current) => current ? { ...current, disk_warning_threshold: value } : current)} suffix="%" />
                    <NumberField label="Disk critical" value={draft.disk_critical_threshold} onChange={(value) => setDraft((current) => current ? { ...current, disk_critical_threshold: value } : current)} suffix="%" />
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Behavior thresholds</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Process and host behavior triggers.
                  </div>
                  <div className="mt-5 grid gap-4">
                    <NumberField label="Process CPU warning" value={draft.process_cpu_warning_threshold} onChange={(value) => setDraft((current) => current ? { ...current, process_cpu_warning_threshold: value } : current)} suffix="%" />
                    <NumberField label="Process memory warning" value={draft.process_memory_warning_mb} onChange={(value) => setDraft((current) => current ? { ...current, process_memory_warning_mb: value } : current)} suffix="MB" />
                    <NumberField label="Listening ports info threshold" value={draft.listening_ports_info_threshold} onChange={(value) => setDraft((current) => current ? { ...current, listening_ports_info_threshold: value } : current)} />
                    <NumberField label="Multiple users threshold" value={draft.multiple_users_threshold} onChange={(value) => setDraft((current) => current ? { ...current, multiple_users_threshold: value } : current)} />
                    <NumberField label="Process spike min delta" value={draft.process_spike_min_delta} onChange={(value) => setDraft((current) => current ? { ...current, process_spike_min_delta: value } : current)} />
                    <NumberField label="Process spike percent threshold" value={draft.process_spike_percent_threshold} onChange={(value) => setDraft((current) => current ? { ...current, process_spike_percent_threshold: value } : current)} suffix="%" />
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Detection switches</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Enable or disable specific rule families.
                  </div>
                  <div className="mt-5 grid gap-4">
                    <ToggleField
                      label="Watchlist detection"
                      description="Generate critical alerts for processes on the built-in watchlist."
                      checked={draft.watchlist_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, watchlist_enabled: value } : current)}
                    />
                    <ToggleField
                      label="New process tracking"
                      description="Create info alerts when new process names appear between snapshots."
                      checked={draft.new_process_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, new_process_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="New software tracking"
                      description="Create info alerts when a new app or package appears in the software inventory."
                      checked={draft.new_software_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, new_software_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Unsigned software alerts"
                      description="Keep warning alerts open while unsigned software remains installed on the device."
                      checked={draft.unsigned_software_alert_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, unsigned_software_alert_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Startup drift tracking"
                      description="Generate alerts when boot or login persistence entries change between snapshots."
                      checked={draft.startup_drift_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, startup_drift_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Remote session tracking"
                      description="Create info alerts when a remote login session is present on the device."
                      checked={draft.remote_session_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, remote_session_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="File integrity tracking"
                      description="Alert when monitored shell, SSH, launch, or service control files appear, disappear, or change hash."
                      checked={draft.file_integrity_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, file_integrity_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Auth history tracking"
                      description="Create alerts when new login-session history entries appear between snapshots."
                      checked={draft.auth_event_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, auth_event_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Policy engine"
                      description="Evaluate saved checks, mobile compliance rules, and patch posture on every snapshot."
                      checked={draft.policy_engine_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, policy_engine_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Mobile compliance tracking"
                      description="Run mobile companion compliance checks like battery floor, reachability, and MDM review."
                      checked={draft.mobile_compliance_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, mobile_compliance_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Patch posture tracking"
                      description="Evaluate software inventory against built-in patch baselines and create posture findings."
                      checked={draft.vulnerability_tracking_enabled}
                      onChange={(value) => setDraft((current) => current ? { ...current, vulnerability_tracking_enabled: value } : current)}
                    />
                    <ToggleField
                      label="Muted alert auto-resolve"
                      description="Resolve muted alerts automatically when the signal disappears from later snapshots."
                      checked={draft.muted_alert_auto_resolve}
                      onChange={(value) => setDraft((current) => current ? { ...current, muted_alert_auto_resolve: value } : current)}
                    />
                    <NumberField
                      label="Minimum mobile battery"
                      value={draft.minimum_mobile_battery_percent}
                      onChange={(value) => setDraft((current) => current ? { ...current, minimum_mobile_battery_percent: value } : current)}
                      suffix="%"
                    />
                    <label className="block">
                      <div className="kicker">Minimum mobile OS major</div>
                      <input
                        type="text"
                        value={draft.minimum_mobile_os_version}
                        onChange={(event) => setDraft((current) => current ? { ...current, minimum_mobile_os_version: event.target.value } : current)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <div>
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save alert rules"}
                </button>
              </div>
            </>
          ) : null}

          {notificationDraft ? (
            <>
              <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Notification channels</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Decide where HostLens should push alerts when the dashboard is closed.
                  </div>

                  <div className="mt-5 grid gap-4">
                    <ToggleField
                      label="Email notifications"
                      description="Deliver alerts over SMTP using the configured backend and this destination."
                      checked={notificationDraft.email_enabled}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, email_enabled: value } : current,
                        )
                      }
                    />
                    <label className="block">
                      <div className="kicker">Email destination</div>
                      <input
                        value={notificationDraft.email_address}
                        onChange={(event) =>
                          setNotificationDraft((current) =>
                            current ? { ...current, email_address: event.target.value } : current,
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                        placeholder="alerts@yourcompany.com"
                      />
                    </label>

                    <ToggleField
                      label="Slack notifications"
                      description="Send critical workflow events to a Slack incoming webhook."
                      checked={notificationDraft.slack_enabled}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, slack_enabled: value } : current,
                        )
                      }
                    />
                    <label className="block">
                      <div className="kicker">Slack webhook URL</div>
                      <input
                        value={notificationDraft.slack_webhook_url}
                        onChange={(event) =>
                          setNotificationDraft((current) =>
                            current ? { ...current, slack_webhook_url: event.target.value } : current,
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </label>

                    <ToggleField
                      label="Webhook notifications"
                      description="Forward alert lifecycle events to any compatible endpoint."
                      checked={notificationDraft.webhook_enabled}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, webhook_enabled: value } : current,
                        )
                      }
                    />
                    <label className="block">
                      <div className="kicker">Webhook URL</div>
                      <input
                        value={notificationDraft.webhook_url}
                        onChange={(event) =>
                          setNotificationDraft((current) =>
                            current ? { ...current, webhook_url: event.target.value } : current,
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                        placeholder="https://example.com/hostlens/webhook"
                      />
                    </label>
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Notification rules</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Control which severities and host-offline states are allowed to leave the platform.
                  </div>
                  <div className="mt-5 grid gap-4">
                    <ToggleField
                      label="Info alerts"
                      description="Allow low-severity notifications such as new process detection."
                      checked={notificationDraft.notify_info}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, notify_info: value } : current,
                        )
                      }
                    />
                    <ToggleField
                      label="Warning alerts"
                      description="Allow warning notifications for high CPU, memory, disk, or stale devices."
                      checked={notificationDraft.notify_warning}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, notify_warning: value } : current,
                        )
                      }
                    />
                    <ToggleField
                      label="Critical alerts"
                      description="Allow critical notifications for watchlist matches and offline devices."
                      checked={notificationDraft.notify_critical}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, notify_critical: value } : current,
                        )
                      }
                    />
                    <ToggleField
                      label="Offline and stale hosts"
                      description="Allow dedicated delivery for host connectivity alerts from the background health check."
                      checked={notificationDraft.notify_offline}
                      onChange={(value) =>
                        setNotificationDraft((current) =>
                          current ? { ...current, notify_offline: value } : current,
                        )
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => void handleSaveNotifications()}
                      disabled={notificationSaving}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4" />
                      {notificationSaving ? "Saving..." : "Save notification settings"}
                    </button>
                  </div>
                </div>
              </section>

              <section className="panel rounded-[2rem] p-5">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Recent deliveries</div>
                    <div className="mt-1 text-sm text-slate-400">
                      The latest notification attempts across email, Slack, and webhooks.
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {notificationLoading ? (
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                      Loading notification activity...
                    </div>
                  ) : null}
                  {!notificationLoading && deliveries.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                      No deliveries have been recorded yet.
                    </div>
                  ) : null}
                  {deliveries.map((delivery) => {
                    const Icon =
                      delivery.channel === "email"
                        ? Mail
                        : delivery.channel === "slack"
                          ? Send
                          : Webhook;
                    return (
                      <div key={delivery.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white">
                                {delivery.channel} · {delivery.event_type.replaceAll(".", " ")}
                              </div>
                              <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                {delivery.display_name || delivery.hostname} · {new Date(delivery.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${
                            delivery.status === "success"
                              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                              : delivery.status === "failed"
                                ? "border-red-400/20 bg-red-400/10 text-red-100"
                                : "border-white/10 bg-white/4 text-slate-300"
                          }`}>
                            {delivery.status}
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-7 text-slate-400">{delivery.destination || "No destination recorded"}</div>
                        {delivery.error_message ? (
                          <div className="mt-2 text-sm leading-7 text-red-200">{delivery.error_message}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
