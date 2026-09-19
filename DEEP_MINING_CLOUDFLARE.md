# Cloudflare deployment

Hosting target: **Cloudflare Workers**.
Source of truth: private GitHub repository.

The app uses OpenNext because the current application is Next.js 14. Cloudflare documents OpenNext as supporting App Router, Route Handlers, SSR and middleware.

## GitHub repository secrets required

Add these repository Actions secrets before running the deployment workflow:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DMI_ACCESS_PASSWORD`
- `DMI_SESSION_SECRET`

Do not put their values in this repository.

Use a Cloudflare API token restricted to the minimum Workers permissions required for deployment.

## Deploy

GitHub → Actions → **Deploy Mining V2 to Cloudflare** → Run workflow.

The workflow:

1. installs the application from the lockfile;
2. installs OpenNext + Wrangler transiently;
3. builds the Next.js application for Workers;
4. deploys `deep-mining-intelligence-v2`.

After deployment, Cloudflare provides a `*.workers.dev` URL. A custom subdomain can be attached later.

## Password protection

`/mining-v2` is protected by application middleware.

- password: Cloudflare/GitHub secret `DMI_ACCESS_PASSWORD`
- session signing: `DMI_SESSION_SECRET`
- cookie: HttpOnly + SameSite=strict
- TTL: 12 hours by default

For a later public investor beta, place Cloudflare Access in front as a second perimeter and retain the application gate for privileged project rooms.
