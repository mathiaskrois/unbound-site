# Unbound website

Static website for Unbound, intended for GitHub Pages at `https://krois.dk/unbound/`.

## Local preview

Run `python3 -m http.server 8080` from this directory, then open `http://localhost:8080/unbound/`.

## Deployment

The GitHub Actions workflow deploys the repository root to GitHub Pages after a push to `main`. Set the Pages source to **GitHub Actions** and set its custom domain to `krois.dk`. The root `CNAME` file preserves that domain in deployments.

The requested App Store URLs are:

- `https://krois.dk/unbound/privacy`
- `https://krois.dk/unbound/terms`
- `https://krois.dk/unbound/support`
