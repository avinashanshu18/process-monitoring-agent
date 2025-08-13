
# Process Monitoring Agent with Django Backend

## Overview

This project is a system to monitor running processes on a Windows machine (or any OS), collect detailed process data, and display it through a Django backend with an interactive frontend UI.  
The system consists of:

- **Agent**: A standalone Python executable that collects process info and sends it to the backend REST API.  
- **Backend**: Django REST API server storing data in SQLite and serving it via authenticated endpoints.  
- **Frontend**: Web UI showing process hierarchy with expandable subprocesses, real-time updates, filters, and visualizations.

---

## Features

- Collects process name, PID, CPU & memory usage, parent-child relations, and hostname  
- Agent authenticates with per-host API keys  
- Stores process snapshots and history  
- REST API endpoints for ingesting data and querying snapshots  
- WebSocket support for real-time updates (via Django Channels)  
- Interactive frontend with expandable process trees, filtering, search, and charts  
- Easy deployment with environment-based settings using `.env` files  

---

## Tech Stack

- Python 3.13+  
- Django 4.x + Django REST Framework  
- Django Channels for WebSockets  
- SQLite (dev) / PostgreSQL (prod)  
- psutil for process info (agent)  
- Requests (agent HTTP client)  
- JavaScript, HTML, CSS (frontend)  
- PyInstaller (to build agent EXE for Windows)  

---

## Setup Instructions

### Prerequisites

- Python 3.13+ installed  
- Git installed  
- Node.js and npm (if frontend needs build tools)  

### Backend Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/avinashanshu18/process-monitoring-agent
   cd process-monitor/backend
   ```

2. Create and activate virtualenv:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install requirements:

   ```bash
   pip install -r requirements.txt
   ```

   ## start_monitor.bat – Process Monitoring Agent Starter
   start_monitor.bat is a simple Windows batch script to start 
   the Process Monitoring Agent. The agent collects system process 
   information (PID, CPU %, memory usage, parent-child relationships) 
   and sends it start_monitor.bat It allows the agent to be run without 
   installation double-click it to start monitoring.

4. Create `.env` file in root folder with content (see `.env.example`):

   ```
   ENVIRONMENT=dev
   DJANGO_SECRET_KEY=your_secret_key_here
   PROC_MONITOR_API_KEY=your_api_key_here
   SUPER_ADMIN_KEY=your_super_admin_key_here
   ```

5. Run migrations:

   ```bash
   python manage.py migrate
   ```

6. Run development server:

   ```bash
   python manage.py runserver
   ```

---

### Agent Setup

1. Navigate to the `agent` folder:

   ```bash
   cd ../agent
   ```

2. Create and activate virtualenv:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install requirements:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure `config.ini` with your backend endpoint and API key, or use environment variables `PROC_ENDPOINT` and `PROC_API_KEY`.

5. Run agent (on macOS/Linux) for testing:

   ```bash
   python agent.py
   ```

6. To build Windows EXE (on Windows machine):

   ```bash
   pyinstaller --onefile agent.py
   ```

---

### Frontend

- The frontend is a simple HTML/JS file located in `/frontend/index.html`.  
- Open it in your browser and configure the API endpoint URL inside the JavaScript as needed.

---

## API Endpoints

| Method | URL                                                           | Description                  | Authentication             |
|--------|---------------------------------------------------------------|------------------------------|----------------------------|
| POST   | `/api/v1/process-snapshots/`                                  | Ingest process snapshot data | Per-host API key in header |
| GET    | `/api/v1/process-snapshots/latest/?hostname=<host>`           | Get latest snapshot for host | None                       |
| GET    | `/api/v1/process-snapshots/history/?hostname=<host>&limit=10` | Get historical snapshots     | None                       |
| GET    | `/api/v1/hosts/`                                              | List all hostnames           | None                       |
| POST   | `/api/v1/hosts/rotate-key/`                                   | Rotate API key for host      | Admin key in header        |

---

## Environment Variables

| Variable               | Description                            | Example                                           |
|------------------------|----------------------------------------|---------------------------------------------------|
| `ENVIRONMENT`          | Use `dev` or `prod` to select settings | `prod`                                            |
| `DJANGO_SECRET_KEY`    | Django secret key                      | `your-very-secret-key`                            |
| `PROC_MONITOR_API_KEY` | Global API key for agent onboarding    | `supersecretkey`                                  |
| `SUPER_ADMIN_KEY`      | Admin key for rotating host API keys   | `adminsecretkey`                                  |
| `PROC_ENDPOINT`        | Agent backend API URL override         | `http://localhost:8000/api/v1/process-snapshots/` |
| `PROC_API_KEY`         | Agent API key override                 | `your-host-api-key`                               |

---

## Project Structure

```
process-monitor/
├── agent/               # Python agent code and config
├── backend/             # Django backend code
│   ├── processes/       # Django app
│   ├── procmon/         # Django project settings
│   └── requirements.txt
├── frontend/            # Frontend UI (static HTML/JS)
├── .env.example         # Environment variables example
├── README.md            # This file
```

---

## Notes

- The agent can be run on Windows, macOS, or Linux, but EXE build is for Windows only.  
- The project uses per-host API keys for security, rotating keys is possible via admin API.  
- For production, configure a real database (PostgreSQL recommended), proper `ALLOWED_HOSTS`, and secure environment variables.  
- WebSockets require Redis or use the in-memory channel layer (not recommended for production).

---

## License

MIT License

---

## Contact

For questions, contact Avinash Anshu.
