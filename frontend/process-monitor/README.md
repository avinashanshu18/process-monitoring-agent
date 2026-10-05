# Frontend

Next.js dashboard for the Device Visibility Dashboard MVP.

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
```

## Runtime API Routing

The frontend defaults to calling `/api/v1` and relies on a Next.js rewrite to proxy those requests to the backend origin defined by `PROCESS_MONITOR_API_ORIGIN`.

Default backend origin:

- `http://127.0.0.1:8000` for local runs
- `http://backend:8000` inside Docker Compose

If you need to bypass the proxy, set `NEXT_PUBLIC_API_BASE_URL` explicitly.
