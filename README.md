# 🗣️ FluentVoice — End-to-End Voice & Speech Therapy Ecosystem

FluentVoice is a premium, multi-platform ecosystem designed to support speech and voice therapy. The repository features a Next.js web application, a Node.js/Express API backend, an Android Native application, and comprehensive automated end-to-end (E2E) testing and security verification suites.

---

## 🚀 Live Deployments

*   **🌐 Main Web Application (GitHub Pages)**: [https://alicepriyanka.github.io/fluentvoice/](https://alicepriyanka.github.io/fluentvoice/)
*   **🛡️ Backend API Service (Render)**: [https://fluentvoice-backend-blhk.onrender.com/health](https://fluentvoice-backend-blhk.onrender.com/health)
*   **📊 Live Web E2E Test Report**: [https://alicepriyanka.github.io/fluentvoice/reports/latest/execution-report.html](https://alicepriyanka.github.io/fluentvoice/reports/latest/execution-report.html)

---

## 📦 Project Architecture & Modules

The repository is organized into four main modules:

1.  **`Fluentvoice frontend`**: Next.js & React-based web dashboard utilizing TailwindCSS v4, Framer Motion, and Recharts. Deploys statically to GitHub Pages.
2.  **`Fluentvoice backend`**: Node.js & TypeScript Express API server using SQLite (`better-sqlite3`) for relational persistence and Cloudinary for audio storage. Deploys natively to Render.
3.  **`fluentvoice`**: Native Android client application built using Kotlin, XML layout structures, and Gradle.
4.  **`fluentvoice-appium`**: WDIO & WebdriverIO automated test runner executing 1,111 unique Appium E2E test cases on Android emulators and physical devices.

---

## 🛠️ System Requirements & Prerequisites

Before setting up the project locally, ensure you have the following installed:

*   **Node.js**: `v20.x` or `v22.x` (Long Term Support recommended)
*   **Java Development Kit (JDK)**: `Temurin JDK 17` (required for Android APK compilation)
*   **Android Studio / SDK**: Android SDK Command-line Tools and a configured Android Virtual Device (AVD) running **Android 10 (API 29)** or higher.
*   **Appium Server**: Installed globally via `npm i -g appium` along with the UiAutomator2 driver: `appium driver install uiautomator2`.
*   **Web Browsers**: Google Chrome (Stable version) and corresponding version of `chromedriver`.

---

## ⚙️ Setup & Running Locally

### 1. Backend Service (`Fluentvoice backend`)
Configure backend environment variables in `Fluentvoice backend/.env`:
```env
PORT=5001
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=database.sqlite
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Install and start:
```bash
cd "Fluentvoice backend"
npm install --legacy-peer-deps
npm run build
npm run db:setup      # Initializes database schema
npm run db:seed       # Seeds base clinical data
npm start
```

### 2. Web Frontend (`Fluentvoice frontend`)
Install and launch local preview:
```bash
cd "Fluentvoice frontend"
npm install
npm run dev
```
For production build export (generates static build in `/out` directory):
```bash
NODE_ENV=production npm run build
```

### 3. Android Mobile Client (`fluentvoice`)
Generate the debug APK build:
```bash
cd fluentvoice
chmod +x gradlew
./gradlew assembleDebug
```
The compiled package will be placed at `fluentvoice/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🧪 E2E Testing Suites & Verification

### 1. 🌐 Web E2E Test Suite (`Fluentvoice frontend/selenium-tests`)
Executes **1,234 automated Selenium tests** simulating multi-role clinical user flows (Patient & Therapist).
*   **Testing Types Covered**: Functional, UI/UX, Compatibility, Performance, Security, API, Database integrity, Accessibility (powered by `axe-core`), Mobile responsive layouts, Regression, and complete End-to-End user journeys.
*   **Running tests**:
    ```bash
    cd "Fluentvoice frontend/selenium-tests"
    npm install
    npm test
    ```
*   **Reports**: Generates detailed Excel spreadsheet reports (`selenium-report.xlsx`) and visually responsive HTML dashboards (`execution-report.html`).

### 2. 📱 Mobile E2E Test Suite (`fluentvoice-appium`)
Executes **1,111 unique Appium test cases** on the native Android build via the WDIO-based custom runner.
*   **Unique Test Case Allocation**: Divides the 1,111 parametric test cases across 11 key testing types and sub-modules:
    *   *Functional Modules*: Authentication, Profile, Recordings, Appointments, Treatment, Dashboard, Drawer, Navigation, Upload, Settings.
    *   *UI/UX Modules*: Theme, Layout, Aesthetics, Grid, Typography, Spacing, Buttons, Transitions, Contrast, Assets.
    *   *Compatibility*: Device specifications (Nexus 6, Pixel 4, Galaxy S20), orientations (Portrait, Landscape), DPI checks (High, Low), and SDK levels (API 29, API 30).
    *   *Other Suite Categories*: Performance spikes, Security gates, local DB Transactions, accessibility structures, and multi-user offline synchronization flows.
*   **Running tests**:
    Ensure your Android AVD emulator is running, then execute:
    ```bash
    cd fluentvoice-appium
    npm install --legacy-peer-deps
    node run_local_tests.js
    ```

### 3. 🛡️ Security Discovery, SAST & Policies
*   **Backend & Frontend SAST**: Performs security posture audits by invoking `generateSecuritySuite.js` and `generateWebSecuritySuite.js`.
*   **Zero-Critical policy gate**: Both security suites enforce strict policy checks on package dependencies and source structures, returning exit code `1` to fail builds if any Critical-severity vulnerability is detected.

### 4. 📈 API Load Test Suite (`load-test.yml`)
*   Executes standalone Grafana k6 testing script (`load-test.js` from `Fluentvoice backend/scripts/`) simulating concurrent user requests to analyze latency spikes, throughput, and memory bounds.

---

## 🎛️ CI/CD Pipelines (GitHub Actions)

The project leverages four distinct pipelines in `.github/workflows/`:

*   **`run-tests.yml` (Web Frontend CI)**: Installs dependencies, builds the Next.js production bundle, starts backend/frontend preview servers, executes the 1,234 Selenium E2E tests + Web Security scans, and publishes the static web app and test reports directly to **GitHub Pages** from the `main` branch.
*   **`android-e2e.yml` (Mobile E2E CI)**: Compiles the Android APK, provisions hardware acceleration (KVM), boots a virtual Android Emulator, starts the Appium server, runs the 1,111 WDIO tests, and exports clean execution summary reports.
*   **`security-review.yml` (Backend SAST CI)**: Audits Node.js backend codes, reviews vulnerabilities, generates markdown summaries, and enforces the Zero-Critical policy.
*   **`load-test.yml` (API Load Test CI)**: Runs automated k6 scripts to verify latency thresholds and response stability on target backend endpoints.
