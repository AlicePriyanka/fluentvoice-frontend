# FluentVoice Selenium Test Suite

Standalone Node.js Selenium automation for the FluentVoice web application. It covers:

1. Functional testing
2. UI/UX testing
3. Chrome, Edge, and Firefox compatibility
4. Navigation performance
5. Security controls and headers
6. API behavior
7. Database persistence through authenticated APIs
8. WCAG accessibility with axe-core
9. Pixel 7 mobile emulation
10. Regression smoke testing
11. Patient and therapist end-to-end journeys

## Install

```powershell
cd selenium-tests
npm install
Copy-Item .env.example .env
```

Start FluentVoice in another terminal:

```powershell
npm run dev
```

Set valid test accounts in `selenium-tests/.env`:

```text
PATIENT_EMAIL=test-patient@example.com
PATIENT_PASSWORD=your-test-password
THERAPIST_EMAIL=test-therapist@example.com
THERAPIST_PASSWORD=your-test-password
```

Use dedicated test accounts. Authenticated tests are skipped when credentials are absent.

## Run

```powershell
npm test
npm run test:smoke
npm run test:compatibility
npm run test:headed
```

Examples:

```powershell
node run.js --url=https://your-test-site.example --browsers=chrome,edge,firefox
node run.js --suite=smoke --browsers=chrome
```

Browser executables must be installed. Selenium Manager resolves compatible drivers automatically.

## Reports

Every run writes:

- `artifacts/reports/FluentVoice_Selenium_Report_<timestamp>.xlsx`
- `artifacts/reports/FluentVoice_Selenium_Results_<timestamp>.json`
- Failure screenshots under `artifacts/screenshots/`

The Excel workbook contains executive summary, detailed results, browser analysis, performance, accessibility, and environment sheets.

## Controlled Database Writes

`DB-002` updates and restores the test patient's phone field. It is skipped by default. Enable it only against a test environment:

```text
ALLOW_DATA_MUTATION=true
```

The suite does not directly connect to MongoDB. It tests persistence through the application's authenticated API boundary, which preserves authorization and validation behavior.

## Important Limits

- Selenium navigation timing is a regression signal, not a load/stress test. Use k6 or JMeter for concurrent load testing.
- axe-core catches many WCAG issues, but manual screen-reader and usability review is still required.
- Security checks are a baseline, not a penetration test. Existing DAST scripts in `automated_test/` remain complementary.
