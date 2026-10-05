# HostLens

Responsive web SaaS MVP for personal security and device visibility. The product ships a Go core agent for desktop and server devices, a Django API, and a Next.js workspace focused on:

- device registration and per-device API keys
- live process snapshots
- recent snapshot history
- CPU, memory, and disk summaries
- alerting for suspicious, unknown, or high-usage processes
- offline/stale host detection with background health checks
- notification delivery over email, Slack, and generic webhooks
- saved checks, patch posture, mobile compliance checks, and live query
- queued remediation actions for refresh, diagnostics, process termination, and live query

The current product strategy is:

- web app first for signup, billing, onboarding, and device review
- native mobile companion later for alert response and quick status checks
- deep desktop visibility on macOS, Windows, and Linux
- limited Android telemetry through native mobile collection later
- iPhone companion behavior instead of false full-device parity

## Stack

- Backend: Django, Django REST Framework, Channels, Whitenoise
- Frontend: Next.js 16, React 19, Tailwind CSS
- Desktop and server agent: Go core agent
- Legacy fallback agent: Python + psutil
- Production services: PostgreSQL and Redis

## Local Development

1. Copy the environment file and fill in real keys:

```bash
cp .env.example .env
```

2. Install backend dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

3. Run backend migrations:

```bash
cd backend
python manage.py migrate
```

4. Install frontend dependencies:

```bash
cd ../frontend/process-monitor
npm install
```

5. Start the backend:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/backend
python manage.py runserver 127.0.0.1:8001
```

6. Start the frontend:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/frontend/process-monitor
HOSTNAME=127.0.0.1 PORT=3001 PROCESS_MONITOR_API_ORIGIN=http://127.0.0.1:8001 npm run start
```

7. Start the background host health monitor:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/backend
python manage.py run_host_health_monitor --interval 60
```

8. Configure the Go core agent:

- use [config.example.json](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/config.example.json) as the starting point
- set `endpoint`, `api_key`, and the desired `device_type`
- keep `agent_id` blank on the first run if you want HostLens to generate it
- keep `interval_seconds` at `60` for normal device monitoring unless you need faster ingest
- set `deep_collector_spool_dir` if you want privileged helper sidecars to feed the Go agent

9. Run the Go core agent:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core
go mod tidy
go run ./cmd/hostlens-agent
```

10. Claim the device in the web app:

- sign up at [http://127.0.0.1:3001/signup](http://127.0.0.1:3001/signup)
- open [http://127.0.0.1:3001/setup](http://127.0.0.1:3001/setup)
- copy the `agent_id` from `agent/go-core/config.json`
- copy the issued host API key from the same config after the first successful upload
- give the device a buyer-friendly name such as `Founder MacBook Pro`

Legacy Python fallback remains available at:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo
python3 agent/agent.py
```

The web workspace will be available at [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Notifications and Offline Detection

HostLens now supports:

- persistent alert lifecycle records
- background host freshness checks
- per-account notification preferences
- delivery history for email, Slack, and webhooks

Relevant environment variables:

- `HOSTLENS_OFFLINE_WARNING_SECONDS`
- `HOSTLENS_OFFLINE_CRITICAL_SECONDS`
- `HOSTLENS_NOTIFICATION_TIMEOUT_SECONDS`
- `HOSTLENS_NOTIFICATION_MAX_RETRIES`
- `HOSTLENS_NOTIFICATION_BACKOFF_SECONDS`
- `HOSTLENS_NOTIFICATION_RETRYABLE_STATUS_CODES`
- `HOSTLENS_WEBHOOK_SIGNING_SECRET`
- `EMAIL_BACKEND`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS`
- `DEFAULT_FROM_EMAIL`

Useful commands:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/backend
python manage.py check_host_health
python manage.py run_host_health_monitor --interval 60
python manage.py retry_notification_deliveries --limit 25
```

## Production Agent Packaging

The Go agent now has first-party install assets for the main desktop and server rollout paths:

- macOS `launchd`: [agent/go-core/deploy/macos/com.hostlens.agent.plist](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/com.hostlens.agent.plist)
- Linux `systemd`: [agent/go-core/deploy/linux/hostlens-agent.service](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/linux/hostlens-agent.service)
- Windows rollout guide: [agent/go-core/deploy/windows/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/windows/README.md)
- macOS installer: [agent/go-core/deploy/macos/install.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/macos/install.sh)
- Linux installer: [agent/go-core/deploy/linux/install.sh](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/linux/install.sh)
- Windows installer: [agent/go-core/deploy/windows/install.ps1](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core/deploy/windows/install.ps1)

The install page serves downloadable agent binaries from `frontend/process-monitor/public/downloads`.
Refresh those assets with:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core
bash scripts/build-release-bundles.sh
```

Optional signing inputs for release builds:

- `HOSTLENS_MAC_BINARY_IDENTITY`
- `HOSTLENS_MAC_INSTALLER_IDENTITY`
- `HOSTLENS_MAC_NOTARY_PROFILE`
- `HOSTLENS_WINDOWS_SIGNTOOL`
- `HOSTLENS_WINDOWS_SIGNING_CERT_SHA1`
- `HOSTLENS_WINDOWS_SIGNING_CERT_NAME`
- `HOSTLENS_WINDOWS_PFX_PATH`
- `HOSTLENS_WINDOWS_PFX_PASSWORD`
- `HOSTLENS_WINDOWS_TIMESTAMP_URL`

The release manifest at `/downloads/release-manifest.json` now records whether each artifact is signed or notarized in the current environment.

## Docker

This repo includes a production-oriented Docker setup.

```bash
docker compose up --build
```

Services:

- frontend: [http://127.0.0.1:3001](http://127.0.0.1:3001) in the current local setup
- backend: [http://127.0.0.1:8001/api/v1/health/](http://127.0.0.1:8001/api/v1/health/) in the current local setup
- host-health background monitor
- postgres
- redis

The frontend proxies `/api/v1/*` requests to the backend using `PROCESS_MONITOR_API_ORIGIN`.

## API

- `POST /api/v1/process-snapshots/`
- `GET /api/v1/process-snapshots/latest/?agent_id=<device>`
- `GET /api/v1/process-snapshots/history/?agent_id=<device>&limit=12`
- `POST /api/v1/mobile/heartbeat/`
- `GET /api/v1/hosts/`
- `GET /api/v1/fleet/summary/`
- `POST /api/v1/hosts/rotate-key/`
- `GET /api/v1/health/`
- `GET /api/v1/alerts/`
- `GET /api/v1/alerts/<alert_id>/`
- `POST /api/v1/alerts/<alert_id>/actions/`
- `GET /api/v1/alerts/rules/`
- `PUT /api/v1/alerts/rules/`
- `GET /api/v1/alerts/notifications/preferences/`
- `PUT /api/v1/alerts/notifications/preferences/`
- `GET /api/v1/alerts/notifications/deliveries/`
- `GET /api/v1/checks/`
- `POST /api/v1/checks/`
- `PUT /api/v1/checks/<check_id>/`
- `POST /api/v1/checks/<check_id>/run/`
- `GET /api/v1/checks/results/`
- `GET /api/v1/agent/actions/next/`
- `POST /api/v1/actions/`
- `POST /api/v1/agent/actions/<action_id>/result/`
- `POST /api/v1/auth/billing/checkout/`
- `POST /api/v1/auth/billing/portal/`
- `POST /api/v1/auth/billing/webhook/`

## Quality Gates

Backend tests:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/backend
python manage.py test
```

Frontend production build:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/frontend/process-monitor
npm run build
```

Go core agent build:

```bash
cd /Users/avinash/Desktop/process-monitoring-agent-repo/agent/go-core
go mod tidy
go build ./cmd/hostlens-agent
```

## Notes

- `agent/config.ini` is intentionally checked in with a placeholder key. Do not store real keys in git.
- the Go core agent is now the primary desktop and server collector
- Android direction is documented in [mobile/android/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/mobile/android/README.md)
- iPhone direction is documented in [mobile/ios/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/mobile/ios/README.md)
- The current MVP is responsive-web-first and polling-based. WebSocket support remains available in the backend but is not required for the first production release.
- Deep collector helper projects live in [agent/deep-collectors/README.md](/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/README.md).
- The mobile collector app now posts signed heartbeats through `POST /api/v1/mobile/heartbeat/`.
