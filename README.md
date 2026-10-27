# Genz Health

Remote patient monitoring prototype for rural Uttar Pradesh. It helps ASHA workers and doctors spot deteriorating patients early, using a NEWS2-based risk score, statistical anomaly checks, a short-term trend forecast and an AI triage assistant. Patients get a Hindi-friendly view with a daily check-in, medicine reminders, a running tracker and emergency help.

> All patients, vitals and alerts are **simulated**. This is a prototype, not a medical device. It does not diagnose.

**Live demo:** `https://<your-username>.github.io/genz-health/`

## Features

| Area | What it does |
|---|---|
| Doctor dashboard | Patients ranked by urgency, live early-warning alerts, SMS fallback text when offline |
| Risk engine | NEWS2 bands for pulse, systolic BP, SpO2, temperature, respiratory rate (plus glucose) |
| Anomaly checks | Per-patient z-scores and a chi-square test against each patient's own baseline |
| Forecast | Linear projection of the last 6 scores, warns when High risk is likely within 90 minutes |
| Data science check | Simulated 600-patient evaluation: detection rate, early-warning lead time and false-alarm rate, with Wilson 95% confidence intervals |
| Patient hub | Profile, reports, doctor consults, e-prescriptions, medical store, orders |
| SQL console | Read-only `SELECT` over 14 in-browser tables |
| Patient app | Daily check-in, health tracker, insights, routine, medicine reminders, running tracker, consent controls, emergency assistance |
| AI features | Triage chat, clinical copilot, daily briefing, Hindi advisory (needs Claude, see below) |

## Quick start (no installation)

1. Download or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

That is all. It is a single static file with no build step and no server.

### Run with a local server (optional)

```bash
git clone https://github.com/<your-username>/genz-health.git
cd genz-health
npx serve .          # or: python3 -m http.server 8000
```

Then open the printed address (for example `http://localhost:3000`).

### Deploy on GitHub Pages

Settings -> Pages -> Source: Deploy from a branch -> `main` / `(root)` -> Save.
Your app will be live at `https://<your-username>.github.io/genz-health/`.

## Environment variables

**None are required.** There are no API keys, no database and no backend. See `env.example`.

| Variable | Required | Purpose |
|---|---|---|
| (none) | - | The app runs fully in the browser |

### About the AI features

AI chat, copilot and briefing use the `window.claude` helper that exists only when the page is opened inside Claude. On GitHub Pages or a local file these features show a "not available" message and the rest of the app works normally. To use your own LLM, replace the calls around `window.claude` in `index.html` with a request to your own endpoint, and keep the key on a server, never in the HTML.

## Tests

Requires Node.js 16 or newer. No packages to install.

```bash
npm test
# or
node test_scoring.js
```

36 checks run against the real functions extracted from `index.html`: NEWS2 bands, risk levels, baseline and deterioration profiles, the erfc and chi-square maths, and the SQL `LIKE` helper. Expected output ends with `36 passed, 0 failed`.

## Repository contents

| File | Description |
|---|---|
| `index.html` | The complete application (HTML, CSS, JavaScript) |
| `TECHNICAL_DESIGN.md` | Architecture, diagrams, data model, algorithms, security notes |
| `sample_data.json` | Seven fictional patients with baseline and deteriorating vitals, plus scoring examples |
| `sample_vitals.csv` | 60-minute simulated vitals stream for six monitored patients |
| `test_scoring.js` | Automated tests |
| `package.json` | `npm test` and `npm start` shortcuts |
| `env.example` | Documents that no variables are needed |
| `LICENSE` | MIT License |

## Data and privacy

- Everything is fictional. Phone numbers and health IDs are masked demo values.
- Records are stored only in the browser (`localStorage`, key `genzhealth_db_v1`). Nothing is sent to a server by this prototype.
- A consent panel lets a patient control AI use and doctor sharing.

## Limitations

- Consciousness level and supplemental oxygen (parts of full NEWS2) are not collected.
- The forecast is a simple linear trend, not a trained model.
- The cohort evaluation uses simulated data, so the numbers show the method, not real clinical performance.
- Not clinically validated. Do not use for real patient care.

## License

MIT, see `LICENSE`.
