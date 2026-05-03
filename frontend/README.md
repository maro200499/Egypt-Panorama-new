# egypt-panorama

Tourism discovery platform for Egypt built with Next.js.

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Backend Connection

The Next.js app now proxies authentication, planner, and subscription requests to the PHP backend.

Set a backend base URL in `.env.local`:

```bash
BACKEND_BASE_URL=http://localhost/backend
```

Or use:

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost/backend
```

Expected backend paths include:

- `/auth/signup.php`
- `/auth/login.php`
- `/api/generate_plan.php`
- `/api/subscription/subscribe.php`
- `/api/subscription/status.php`

When running locally, make sure your PHP backend is available under that base URL before starting the Next.js app.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
