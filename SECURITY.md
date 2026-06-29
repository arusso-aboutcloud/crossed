# Security Policy

## Scope

crossed is a fully static, client-side web application. It runs no backend,
stores no user data, and makes no external API calls at runtime. The only
server-side component is the Cloudflare Worker stub under `worker/`, which
currently returns a plain 501 response.

Security issues most likely to be relevant:

- Cross-site scripting (XSS) in the game UI or badge renderer.
- Malicious or malformed content injected via the clue bank JSON.
- Supply chain issues in npm dependencies.

## Reporting a Vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately using GitHub's built-in private disclosure
feature:

1. Go to the Security tab of this repository.
2. Click "Report a vulnerability".
3. Fill in the details.

Alternatively, email: security@aboutcloud.io

You will receive an acknowledgement within 72 hours. We aim to triage and
patch confirmed vulnerabilities within 14 days for critical issues.

## Supported Versions

Only the latest commit on the `main` branch is supported. No patches are
backported to older commits.

## Disclosure Policy

We follow coordinated disclosure. Please give us reasonable time to
remediate before publishing details publicly. We will credit researchers
who report valid vulnerabilities unless they prefer to remain anonymous.

## Out of Scope

- Vulnerabilities in Cloudflare infrastructure itself.
- Denial of service against the Cloudflare CDN.
- Social engineering.
- Issues requiring physical access to a device.
