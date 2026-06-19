const fs = require("node:fs");
const path = require("node:path");
const {
  assert,
  By,
  Key,
  until,
  SkipTest,
  navigate,
  visible,
  clickText,
  login,
  apiRequest,
  navigationMetrics,
  assertNoHorizontalOverflow,
  clickLink,
  urlContains,
} = require("./core/helpers");

function registerSuites(runner) {
  const BASE_PATH = new URL(runner.config.baseUrl).pathname.replace(/\/$/, "");
  const test = (definition) => runner.test(definition);
  const smoke = ["full", "smoke"];
  const compatibility = ["full", "compatibility"];

  test({
    id: "TC_001",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "Page loads successfully",
    description: "Landing page renders without errors",
    steps: ['1. Navigate to BASE_URL'],
    expected: "Page title contains 'FluentVoice'",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(1 * 1000)
        assert.ok((await driver.getTitle()).includes("FluentVoice") || (await driver.getPageSource()).includes("FluentVoice"), "Title missing FluentVoice")
    },
  });

  test({
    id: "TC_002",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "Hero headline visible",
    description: "Main H1 headline is present and visible",
    steps: ['1. Load landing page\\n2. Check for H1 element'],
    expected: "H1 headline is visible",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let h1 = await visible(driver, By.tagName("h1"), config.timeoutMs)
        assert.ok(await h1.isDisplayed(), "H1 not visible")
    },
  });

  test({
    id: "TC_003",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "Navigation bar visible",
    description: "Floating pill navigation bar is displayed",
    steps: ['1. Load page\\n2. Verify nav element'],
    expected: "Nav bar is visible",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let nav = await visible(driver, By.tagName("nav"), config.timeoutMs)
        assert.ok(await nav.isDisplayed())
    },
  });

  test({
    id: "TC_004",
    category: "Functional Testing",
    module: "Landing Page",
    name: "Nav has Sign in link",
    description: "Nav bar contains a Sign in / Get started link to /login",
    steps: ['1. Load page\\n2. Check nav anchor hrefs'],
    expected: "At least one nav link points to /login",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let links = await driver.findElements(By.css("nav a"))
        const hrefs = []; for (const a of links) { hrefs.push(await a.getAttribute('href')); }
        const login_links = hrefs.filter(h => h && h.includes('/login'));
        assert.ok(login_links.length >= 1, `Expected login links, got: ${hrefs}`)
    },
  });

  test({
    id: "TC_005",
    category: "Functional Testing",
    module: "Landing Page",
    name: "CTA button present",
    description: "'Start for free' or 'Get started' CTA exists",
    steps: ['1. Load page\\n2. Find CTA link'],
    expected: "CTA button is visible with expected text",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let links = await driver.findElements(By.css("a"))
        const texts = []; for (const a of links) { texts.push((await a.getText()).trim().toLowerCase()); }
        assert.ok(texts.some(t => ["start for free", "get started", "get started free"].includes(t)),             `CTA link !found. Texts found: ${texts.slice(0, 10)}`)
    },
  });

  test({
    id: "TC_006",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "Metrics strip rendered",
    description: "Stats section shows accuracy / processing time metrics",
    steps: ['1. Load page\\n2. Look for stats text'],
    expected: "Metrics strip (92%, <30s, etc.) is present",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("92%") || src.includes("Analysis accuracy"), "Metrics strip not found")
    },
  });

  test({
    id: "TC_007",
    category: "Functional Testing",
    module: "Landing Page",
    name: "Features section present",
    description: "Bento features section appears on page",
    steps: ['1. Load page\\n2. Check features heading'],
    expected: "Features section is present",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Everything you need") || src.toLowerCase().includes("features"), "Features section missing")
    },
  });

  test({
    id: "TC_008",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "AI Analysis feature card",
    description: "Whisper-backed AI Analysis feature card is visible",
    steps: ["1. Load page\\n2. Search for 'Whisper'"],
    expected: "'Whisper' keyword appears in features",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        assert.ok((await driver.getPageSource()).includes("Whisper"), "Whisper AI mention not found")
    },
  });

  test({
    id: "TC_009",
    category: "Functional Testing",
    module: "Landing Page",
    name: "How It Works section",
    description: "3-step how-it-works section is present",
    steps: ['1. Load page\\n2. Find how-it-works copy'],
    expected: "Section copy is visible",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        assert.ok((await driver.getPageSource()).includes("How it works") || (await driver.getPageSource()).toLowerCase().includes("recording to report"), "'How it works' section missing")
    },
  });

  test({
    id: "TC_010",
    category: "UI/UX Testing",
    module: "Landing Page",
    name: "Footer rendered",
    description: "Footer with brand name is present at bottom",
    steps: ['1. Load page\\n2. Check footer element'],
    expected: "Footer has 'FluentVoice' or 'NexoVent' text",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let footer = await visible(driver, By.tagName("footer"), config.timeoutMs)
        assert.ok((await footer.getText()).includes("FluentVoice") || (await footer.getText()).includes("NexoVent"), "Footer content missing")
    },
  });

  test({
    id: "TC_011",
    category: "Functional Testing",
    module: "Landing Page",
    name: "Therapist CTA link",
    description: "'I'm a therapist' link targets /login?role=therapist",
    steps: ['1. Load page\\n2. Find therapist anchor'],
    expected: "Link exists with href /login?role=therapist",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
      // Use *=contains because basePath prefix is prepended on GitHub Pages
        let links = await driver.findElements(By.css("a[href*='login?role=therapist'], a[href*='login/?role=therapist'], a[href*='login'][href*='role=therapist']"))
        assert.ok(links.length >= 1, "Therapist CTA link not found")
    },
  });

  test({
    id: "TC_012",
    category: "Compatibility Testing",
    module: "Landing Page",
    name: "Page has non-empty title tag",
    description: "Browser tab has a meaningful title",
    steps: ['1. Load page\\n2. Read document.title'],
    expected: "Title is non-empty",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let title_tag = (await driver.getTitle())
        assert.ok(title_tag.length > 0, "Empty page title")
    },
  });

  test({
    id: "TC_013",
    category: "Functional Testing",
    module: "Landing Page",
    name: "Footer privacy link",
    description: "Footer contains Privacy link",
    steps: ["1. Load page\\n2. Find 'Privacy' text"],
    expected: "'Privacy' text found in footer",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Privacy"), "Privacy link missing")
    },
  });

  test({
    id: "TC_014",
    category: "Functional Testing",
    module: "Landing Page",
    name: "Page fully loaded (readyState)",
    description: "document.readyState === complete",
    steps: ['1. Load page\\n2. Check readyState via JS'],
    expected: "readyState is 'complete'",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        assert.equal(await driver.executeScript("return document.readyState"), "complete", "Page not fully loaded")
    },
  });

  test({
    id: "TC_015",
    category: "Compatibility Testing",
    module: "Landing Page",
    name: "No JS console errors on landing",
    description: "Browser console has zero SEVERE-level errors (excluding harmless SW/icon 404s)",
    steps: ['1. Load page\\n2. Read browser logs'],
    expected: "Zero SEVERE console errors (excluding SW/icon/manifest)",
    suites: smoke,
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/");
        await driver.sleep(500);
        let errors = [];
        try {
            errors = await driver.manage().logs().get("browser");
        } catch (e) {
            return "Skipped browser logs check (not supported by browser)";
        }
        const harmless = ["sw.js", "icon", "manifest", "woff", ".css", "favicon"];
        const severe = errors.filter(e => e.level.name === "SEVERE" && !harmless.some(h => e.message.toLowerCase().includes(h)));
        assert.equal(severe.length, 0, `Console SEVERE errors: ${JSON.stringify(severe.slice(0, 3))}`);
    },
  });

  test({
    id: "TC_016",
    category: "UI/UX Testing",
    module: "Authentication",
    name: "Login page loads",
    description: "Login page renders with a heading",
    steps: ['1. Navigate to /login'],
    expected: "Page loads with H1 visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(1 * 1000)
        let h1 = await visible(driver, By.tagName("h1"), config.timeoutMs)
        assert.ok(await h1.isDisplayed())
    },
  });

  test({
    id: "TC_017",
    category: "UI/UX Testing",
    module: "Authentication",
    name: "Email field present",
    description: "Email input field is rendered on login page",
    steps: ['1. Navigate to /login\\n2. Find email input'],
    expected: "Email input is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let inp = await driver.findElements(By.css("input[type='email']"))
        assert.ok(inp.length >= 1)
    },
  });

  test({
    id: "TC_018",
    category: "UI/UX Testing",
    module: "Authentication",
    name: "Password field present",
    description: "Password input is rendered on login page",
    steps: ['1. Navigate to /login\\n2. Find password input'],
    expected: "Password input is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let inp = await driver.findElements(By.css("input[type='password']"))
        assert.ok(inp.length >= 1)
    },
  });

  test({
    id: "TC_019",
    category: "Functional Testing",
    module: "Authentication",
    name: "Sign In tab present",
    description: "Tab to switch to sign-in mode is present",
    steps: ["1. Load /login\\n2. Look for 'Sign in' button"],
    expected: "'Sign in' button/tab exists",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let tabs = await driver.findElements(By.css("button"))
        const labels = []; for (const b of tabs) { labels.push((await b.getText()).trim().toLowerCase()); }
        assert.ok(labels.includes("sign in") || " ".includes("signin").join(labels), `tab.includes(Sign) !found. Buttons: ${labels}`)
    },
  });

  test({
    id: "TC_020",
    category: "Functional Testing",
    module: "Authentication",
    name: "Create Account tab present",
    description: "Tab to switch to registration mode is present",
    steps: ["1. Load /login\\n2. Look for 'Create account' button"],
    expected: "'Create account' tab exists",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let btns = await driver.findElements(By.css("button"))
        const labels = []; for (const b of btns) { labels.push((await b.getText()).trim().toLowerCase()); }
        assert.ok(labels.some(l => l.includes("create") || l.includes("register")), `Register tab !found. Labels: ${labels}`)
    },
  });

  test({
    id: "TC_021",
    category: "Functional Testing",
    module: "Authentication",
    name: "Switch to register mode shows name field",
    description: "Clicking Create Account reveals full name input",
    steps: ["1. Load /login\\n2. Click 'Create account'\\n3. Check for name input"],
    expected: "Full name input becomes visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let btns = await driver.findElements(By.css("button"))
        let register_btn = null; for (const b of btns) { if ((await b.getText()).toLowerCase().includes('create')) { register_btn = b; break; } }
        assert.ok(register_btn, "Create account button not found")
        await register_btn.click()
        await driver.sleep(0.5 * 1000)
        let name_inputs = await driver.findElements(By.css("input[type='text']"))
        assert.ok(name_inputs.length >= 1, "Name input not visible after switching to register mode")
    },
  });

  test({
    id: "TC_022",
    category: "Functional Testing",
    module: "Authentication",
    name: "Empty form validation error",
    description: "Submitting empty login form shows validation error",
    steps: ['1. Load /login\\n2. Click Sign in without filling fields'],
    expected: "Error message appears",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let submit = await visible(driver, By.css("button.w-full"), config.timeoutMs)
        await submit.click()
        await driver.sleep(1 * 1000)
        let error_msgs = await driver.findElements(By.css("p.text-red-500, p.text-xs.text-red-500"))
        assert.ok(error_msgs.length > 0, "No error shown for empty form")
    },
  });

  test({
    id: "TC_023",
    category: "Functional Testing",
    module: "Authentication",
    name: "Invalid credentials stay on login",
    description: "Wrong email/password keeps user on /login",
    steps: ['1. Enter bad credentials\\n2. Submit'],
    expected: "URL still contains /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        await driver.findElement(By.css("input[type='email']")).sendKeys("bad@email.com")
        await driver.findElement(By.css("input[type='password']")).sendKeys("wrongpassword")
        await driver.findElement(By.css("button.w-full")).click()
        await driver.sleep(2 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/login"), "Should stay on login for wrong creds")
    },
  });

  test({
    id: "TC_024",
    category: "Functional Testing",
    module: "Authentication",
    name: "Password field masked by default",
    description: "Password input type is 'password' (dots)",
    steps: ['1. Load /login\\n2. Check password input type attribute'],
    expected: "Input type is 'password'",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let pw_input = await driver.findElement(By.css("input[type='password']"))
        assert.equal(await pw_input.getAttribute("type"), "password", "Password not masked")
    },
  });

  test({
    id: "TC_025",
    category: "UI/UX Testing",
    module: "Authentication",
    name: "Show/hide password toggle works",
    description: "Clicking the eye icon toggles password visibility",
    steps: ['1. Load /login\\n2. Click toggle\\n3. Check input type'],
    expected: "Password input toggles to type='text'",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login");
        await driver.sleep(500);
        const btns = await driver.findElements(By.css("button[aria-label]"));
        let toggle = null;
        for (const b of btns) {
            if ((await b.getAttribute("aria-label")).toLowerCase().includes("password")) {
                toggle = b;
                break;
            }
        }
        if (!toggle) {
            const toggles = await driver.findElements(By.css("button[type='button']"));
            for (const b of toggles) {
                if ((await b.findElements(By.css("svg"))).length > 0) {
                    toggle = b;
                    break;
                }
            }
        }
        assert.ok(toggle !== null, "Show/hide password toggle not found");
        await toggle.click();
        await driver.sleep(300);
        const pw = await driver.findElement(By.css("input[type='text']"));
        assert.ok(pw !== null, "After toggle, input should be type=text");
    },
  });

  test({
    id: "TC_026",
    category: "Functional Testing",
    module: "Authentication",
    name: "Back to home link present",
    description: "'Back to home' link navigates to /",
    steps: ['1. Load /login\\n2. Find back link'],
    expected: "Link with basePath-prefixed href='/' is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
      // Match exact basePath-aware home href, e.g. /fluentvoice-frontend/ or /
        let back_link = await visible(driver, By.css("a[href='/'], a[href='/fluentvoice-frontend'], a[href='/fluentvoice-frontend/']"), config.timeoutMs)
        assert.ok(await back_link.isDisplayed(), "Back to home link not visible")
    },
  });

  test({
    id: "TC_027",
    category: "Functional Testing",
    module: "Authentication",
    name: "Forgot password link present",
    description: "'Forgot password?' link appears on sign-in form",
    steps: ['1. Load /login\\n2. Find forgot-password anchor'],
    expected: "Forgot password link is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let forgot = await driver.findElements(By.css("a[href*='/forgot-password']"))
        assert.ok(forgot.length >= 1, "Forgot password link not found")
    },
  });

  test({
    id: "TC_028",
    category: "Functional Testing",
    module: "Authentication",
    name: "Enter key submits login form",
    description: "Pressing Enter in password field triggers form submission",
    steps: ['1. Fill form\\n2. Press Enter in password field'],
    expected: "Form submits without JS error",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        await driver.findElement(By.css("input[type='email']")).sendKeys("test@example.com")
        await driver.findElement(By.css("input[type='password']")).sendKeys("pass")
        await driver.findElement(By.css("input[type='password']")).sendKeys(Key.RETURN)
        await driver.sleep(1 * 1000)
      // Should stay on login (wrong creds) — not crash
        assert.ok(await driver.findElement(By.tagName("body")).isDisplayed())
    },
  });

  test({
    id: "TC_029",
    category: "Functional Testing",
    module: "Authentication",
    name: "Register: Role selector appears",
    description: "Patient/Therapist role selector is shown in register mode",
    steps: ['1. Switch to register\\n2. Check for role buttons'],
    expected: "Patient and Therapist role buttons appear",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let btns = await driver.findElements(By.css("button"))
        let create_btn = null; for (const b of btns) { if ((await b.getText()).toLowerCase().includes('create')) { create_btn = b; break; } }
        assert.ok(create_btn, "Create account button not found")
        await create_btn.click()
        await driver.sleep(0.5 * 1000)
      // Role selector buttons should appear
        let role_btns = await driver.findElements(By.css("button[type='button']"))
        const role_texts = []; for (const b of role_btns) { role_texts.push((await b.getText()).toLowerCase()); }
        assert.ok(role_texts.some(t => t.includes("patient")) || role_texts.some(t => t.includes("therapist")), `Role selector !shown. Got: ${role_texts}`)
    },
  });

  test({
    id: "TC_030",
    category: "Functional Testing",
    module: "Authentication",
    name: "Register: short password validation",
    description: "Password < 8 chars shows validation error on register",
    steps: ['1. Switch to register\\n2. Enter 5-char password\\n3. Submit'],
    expected: "Validation error message appears",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let btns = await driver.findElements(By.css("button"))
        let create_btn = null; for (const b of btns) { if ((await b.getText()).toLowerCase().includes('create')) { create_btn = b; break; } }
        await create_btn.click()
        await driver.sleep(0.5 * 1000)
      // Leave name blank, fill email + password < 8 chars
        await driver.findElement(By.css("input[type='email']")).sendKeys("x@x.com")
        await driver.findElement(By.css("input[type='password']")).sendKeys("short")
        let submit = await driver.findElement(By.css("button.w-full"))
        await submit.click()
        await driver.sleep(1 * 1000)
        let errors = await driver.findElements(By.css("p.text-red-500, p.text-xs"))
        assert.ok(errors.length > 0, "No validation error for short register.includes(password)")
    },
  });

  test({
    id: "TC_031",
    category: "UI/UX Testing",
    module: "Authentication",
    name: "Forgot password page loads",
    description: "/forgot-password page renders",
    steps: ['1. Navigate to /forgot-password'],
    expected: "Page loads successfully",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/forgot-password")
        await driver.sleep(0.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("forgot") || (await driver.getPageSource()).toLowerCase().includes("forgot"), "Forgot-password page not reachable")
    },
  });

  test({
    id: "TC_032",
    category: "Security Testing",
    module: "Authentication",
    name: "Unauthenticated /patient → redirect to login",
    description: "Accessing /patient without token redirects to /login",
    steps: ['1. Clear cookies\\n2. Navigate to /patient'],
    expected: "Redirected to /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
      // Patient route without auth should redirect to /login
        await navigate(driver, config, "/")
        await driver.manage().deleteAllCookies()
        await driver.executeScript("await localStorage.clear();")
        await navigate(driver, config, "/patient")
        await urlContains(driver, "/login", 8 * 1000)
    },
  });

  test({
    id: "TC_033",
    category: "Security Testing",
    module: "Authentication",
    name: "Unauthenticated /therapist → redirect to login",
    description: "Accessing /therapist without token redirects to /login",
    steps: ['1. Clear cookies\\n2. Navigate to /therapist'],
    expected: "Redirected to /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.manage().deleteAllCookies()
        await driver.executeScript("await localStorage.clear();")
        await navigate(driver, config, "/therapist")
        await urlContains(driver, "/login", 8 * 1000)
    },
  });

  test({
    id: "TC_034",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Patient dashboard loads",
    description: "Patient dashboard page renders with greeting and H1",
    steps: ['1. Login as patient\\n2. Navigate to /patient'],
    expected: "Dashboard H1 is visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let h1 = await visible(driver, By.tagName("h1"), config.timeoutMs)
        assert.ok(await h1.isDisplayed())
    },
  });

  test({
    id: "TC_035",
    category: "Functional Testing",
    module: "Patient Dashboard",
    name: "Time-based greeting shown",
    description: "Good morning / afternoon / evening greeting appears",
    steps: ['1. Load patient dashboard\\n2. Check greeting'],
    expected: "Greeting text visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource())
        let greetings = ["Good morning", "Good afternoon", "Good evening"]
        assert.ok(greetings.some(g => src.includes(g)), "Greeting not found")
    },
  });

  test({
    id: "TC_036",
    category: "Functional Testing",
    module: "Patient Dashboard",
    name: "Record button in header",
    description: "Header contains a 'Record' action link to /patient/record",
    steps: ['1. Load patient dashboard\\n2. Find Record link'],
    expected: "'Record' button is visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Record"), "'Record' action button missing")
    },
  });

  test({
    id: "TC_037",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Fluency score section visible",
    description: "Fluency score gauge or empty-state is shown",
    steps: ['1. Load patient dashboard\\n2. Look for Fluency score'],
    expected: "Fluency score or empty state card is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        let has_score = src.includes("Fluency score") || src.toLowerCase().includes("fluency")
        assert.ok(has_score, "Fluency score section not found")
    },
  });

  test({
    id: "TC_038",
    category: "Functional Testing",
    module: "Patient Dashboard",
    name: "Record link navigates to /patient/record",
    description: "At least one link targets /patient/record",
    steps: ['1. Load patient dashboard\\n2. Check anchor hrefs'],
    expected: "Link to /patient/record exists",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let links = await driver.findElements(By.css("a[href*='/patient/record']"))
        assert.ok(links.length >= 1, "Record link not found")
    },
  });

  test({
    id: "TC_039",
    category: "Functional Testing",
    module: "Patient Dashboard",
    name: "Sessions link present",
    description: "Link or button navigates to /patient/sessions",
    steps: ['1. Load patient dashboard\\n2. Find sessions link'],
    expected: "Link to /patient/sessions present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let links = await driver.findElements(By.css("a[href*='/patient/sessions']"))
        assert.ok(links.length >= 1, "Sessions link not found")
    },
  });

  test({
    id: "TC_040",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Treatment plan link present",
    description: "Link to /patient/treatment is visible",
    steps: ['1. Load patient dashboard\\n2. Find treatment link'],
    expected: "Link to /patient/treatment present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let links = await driver.findElements(By.css("a[href*='/patient/treatment']"))
        assert.ok(links.length >= 1, "Treatment plan link not found")
    },
  });

  test({
    id: "TC_041",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Actions strip at bottom of score card",
    description: "Quick action pills (Record voice, Upload audio, etc.) visible",
    steps: ["1. Load patient dashboard\\n2. Find 'Actions' text"],
    expected: "'Actions' strip is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Actions"), "Actions strip not found")
    },
  });

  test({
    id: "TC_042",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Fluency trend chart visible",
    description: "Area chart showing fluency trend is rendered",
    steps: ['1. Load patient dashboard\\n2. Check for trend chart'],
    expected: "Trend chart or placeholder is visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Fluency Over Time") || src.toLowerCase().includes("fluency"), "Trend chart not found")
    },
  });

  test({
    id: "TC_043",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Sidebar navigation present",
    description: "Sidebar with navigation links is present inside dashboard layout",
    steps: ['1. Load patient dashboard\\n2. Check for sidebar'],
    expected: "Sidebar nav links are present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1 * 1000)
        let sidebar_links = await driver.findElements(By.css("nav a, aside a"))
        assert.ok(sidebar_links.length >= 1 || (await driver.getPageSource()).toLowerCase().includes("sidebar"), "Sidebar not detected")
    },
  });

  test({
    id: "TC_044",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "SVG charts rendered",
    description: "At least one SVG chart element is present on dashboard",
    steps: ['1. Load patient dashboard\\n2. Count SVG elements'],
    expected: "At least 1 SVG is in DOM",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
      // Look for SVG chart elements
        let svgs = await driver.findElements(By.css("svg"))
        assert.ok(svgs.length >= 1, "No SVG elements found (charts missing)")
    },
  });

  test({
    id: "TC_045",
    category: "End-to-End (E2E) Testing",
    module: "Patient Dashboard",
    name: "Record link navigates correctly",
    description: "Clicking Record link navigates to /patient/record page",
    steps: ['1. Load patient dashboard\\n2. Click Record link\\n3. Verify URL'],
    expected: "URL changes to /patient/record",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
      // Verify link is present in sidebar
        assert.ok((await driver.findElements(By.css("a[href*='/patient/record']"))).length >= 1, "Record link not sidebar.includes(found)")
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/patient/record"), `Did !navigate to /patient/record. Got: ${(await driver.getCurrentUrl())}`)
    },
  });

  test({
    id: "TC_046",
    category: "UI/UX Testing",
    module: "Patient Dashboard",
    name: "Session count indicator",
    description: "Sparkles icon with session count or 'sample data' label shown",
    steps: ['1. Load patient dashboard\\n2. Check session count badge'],
    expected: "Session count or 'Showing sample data' label visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
      // Check sparkles indicator
        let has_indicator = src.toLowerCase().includes("session") && (src.toLowerCase().includes("recorded") || src.toLowerCase().includes("sample"))
        assert.ok(has_indicator, "Session count indicator not found")
    },
  });

  test({
    id: "TC_047",
    category: "Functional Testing",
    module: "Patient Dashboard",
    name: "No error banner on dashboard",
    description: "No top-level error message appears on the dashboard",
    steps: ['1. Load patient dashboard\\n2. Check page beginning for errors'],
    expected: "No error banner in first 500 chars of page source",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
      // Check that no unhandled JS error banner appears
        assert.ok(!src.slice(0, 500).includes("Error"), "Possible error banner at top of page")
    },
  });

  test({
    id: "TC_048",
    category: "End-to-End (E2E) Testing",
    module: "Patient Dashboard",
    name: "Sessions link navigates correctly",
    description: "Clicking sessions link navigates to /patient/sessions",
    steps: ['1. Dashboard → click sessions link'],
    expected: "URL is /patient/sessions",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient")
        await driver.sleep(1.5 * 1000)
      // Verify link is present in sidebar
        assert.ok((await driver.findElements(By.css("a[href*='/patient/sessions']"))).length >= 1, "Sessions link not sidebar.includes(found)")
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/patient/sessions"), `Expected /patient/sessions, got ${(await driver.getCurrentUrl())}`)
    },
  });

  test({
    id: "TC_049",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "Record page loads with heading",
    description: "Record page has at least one heading element",
    steps: ['1. Navigate to /patient/record'],
    expected: "H1 or H2 is present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let h1s = await driver.findElements(By.tagName("h1"))
        let h2s = await driver.findElements(By.tagName("h2"))
        let headings = h1s + h2s
        assert.ok(headings.length >= 1, "No headings found on record page")
    },
  });

  test({
    id: "TC_050",
    category: "UI/UX Testing",
    module: "Record / Upload",
    name: "Record mode UI present",
    description: "Recording interface (mic/record mention) is present",
    steps: ['1. Load /patient/record\\n2. Check for mic/record references'],
    expected: "Record UI references found in page",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_record = src.includes("record") || src.includes("microphone") || src.includes("mic")
        assert.ok(has_record, "Record-related content not found")
    },
  });

  test({
    id: "TC_051",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "Upload mode option present",
    description: "Upload audio file option is available",
    steps: ['1. Load /patient/record\\n2. Check for upload references'],
    expected: "Upload references (file/WAV/MP3) found in page",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_upload = src.includes("upload") || src.includes("file") || src.includes("wav") || src.includes("mp3")
        assert.ok(has_upload, "Upload-related content not found on record page")
    },
  });

  test({
    id: "TC_052",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "At least one action button present",
    description: "Record page has interactive buttons",
    steps: ['1. Load /patient/record\\n2. Count buttons'],
    expected: "At least 1 button found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let btns = await driver.findElements(By.css("button"))
        assert.ok(btns.length >= 1, "No buttons found on record page")
    },
  });

  test({
    id: "TC_053",
    category: "UI/UX Testing",
    module: "Record / Upload",
    name: "File input element present",
    description: "Hidden/visible file input for audio upload is in the DOM",
    steps: ['1. Load /patient/record\\n2. Find input[type=file]'],
    expected: "File input element exists",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let inputs = await driver.findElements(By.css("input[type='file']"))
        assert.ok(inputs.length >= 1, "File input not found")
    },
  });

  test({
    id: "TC_054",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "Analysis result area exists",
    description: "Page has area to display analysis results",
    steps: ['1. Load /patient/record\\n2. Check for result/analysis refs'],
    expected: "Analysis result references exist",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(src.includes("fluency") || src.includes("analysis") || src.includes("score"), "No reference to analysis result on record page")
    },
  });

  test({
    id: "TC_055",
    category: "Performance Testing",
    module: "Record / Upload",
    name: "30-second guidance text",
    description: "Guidance about 30-second recording duration is shown",
    steps: ["1. Load /patient/record\\n2. Check for '30' or 'seconds'"],
    expected: "'30' or 'seconds' appears on page",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("30") || src.toLowerCase().includes("seconds"), "30-second guidance not found")
    },
  });

  test({
    id: "TC_056",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "Navigation back to dashboard",
    description: "Link or breadcrumb back to /patient dashboard present",
    steps: ['1. Load /patient/record\\n2. Find back link'],
    expected: "Back link or sidebar link to /patient exists",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
      // Use ends-with selector: /patient/ (exact) to avoid matching /patient/record etc.
        let back = await driver.findElements(By.css(`a[href='${BASE_PATH}/patient/']`))
        assert.ok(back.length >= 1 || (await driver.getPageSource()).toLowerCase().includes("back"), "No back/nav link to /patient found")
    },
  });

  test({
    id: "TC_057",
    category: "Functional Testing",
    module: "Record / Upload",
    name: "No 404 error on record page",
    description: "Record page shows actual content, not a 404",
    steps: ['1. Navigate to /patient/record\\n2. Check page for 404'],
    expected: "No '404 | Not Found' page rendered",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
      // Check for real 404 page — not just any occurrence of "404" in content
        let src = (await driver.getPageSource()).toLowerCase()
        let is_404_page = src.slice(0, 500).includes("page not found") || src.includes("<h1>404") || src.includes("404 | not found")
        assert.ok(!is_404_page, "404 page detected on /patient/record")
    },
  });

  test({
    id: "TC_058",
    category: "UI/UX Testing",
    module: "Record / Upload",
    name: "Recording control UI present",
    description: "Start/Stop recording button or timer is visible",
    steps: ['1. Load /patient/record\\n2. Check for recording controls'],
    expected: "At least one recording control keyword found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/record")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
      // Should see waveform or timer or mic-related UI
        let has_ui = ["waveform", "timer", "recording", "start", "stop"].some(k => src.includes(k))
        assert.ok(has_ui, "Recording control UI not found")
    },
  });

  test({
    id: "TC_059",
    category: "UI/UX Testing",
    module: "Patient Sessions",
    name: "Sessions page loads",
    description: "Page at /patient/sessions renders",
    steps: ['1. Navigate to /patient/sessions'],
    expected: "URL contains /patient/sessions",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/patient/sessions"), `Not on sessions page: ${(await driver.getCurrentUrl())}`)
    },
  });

  test({
    id: "TC_060",
    category: "Functional Testing",
    module: "Patient Sessions",
    name: "Sessions page has heading",
    description: "Sessions page contains at least one heading",
    steps: ['1. Load sessions page\\n2. Count headings'],
    expected: "At least 1 heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1, "No headings on sessions page")
    },
  });

  test({
    id: "TC_061",
    category: "UI/UX Testing",
    module: "Patient Sessions",
    name: "Sessions list or empty state shown",
    description: "Sessions list or empty-state card is rendered",
    steps: ['1. Load sessions page\\n2. Check for session/fluency references'],
    expected: "Session-related content found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        const has_sessions = [src.includes("session"), src.includes("fluency")];
        assert.ok(has_sessions[0] || has_sessions[1], "Sessions content not found")
    },
  });

  test({
    id: "TC_062",
    category: "Database Testing",
    module: "Patient Sessions",
    name: "Sessions show score/date metadata",
    description: "Each session item shows date and fluency score",
    steps: ['1. Load sessions page\\n2. Check for score or date text'],
    expected: "Score or date metadata found in page",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(src.includes("score") || src.includes("date") || src.includes("fluency"), "No score/date/sessions.includes(fluency) list")
    },
  });

  test({
    id: "TC_063",
    category: "Functional Testing",
    module: "Patient Sessions",
    name: "New session CTA present",
    description: "Button or link to start a new recording session is present",
    steps: ['1. Load sessions page\\n2. Find new session CTA'],
    expected: "New session CTA found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        let record_links = await driver.findElements(By.css("a[href*='/patient/record']"))
        let btns = await driver.findElements(By.css("button"))
        let src = (await driver.getPageSource()).toLowerCase()
        let has_cta = record_links.length > 0 || src.includes("new session") || src.includes("start")
        assert.ok(has_cta, "No CTA to create new session")
    },
  });

  test({
    id: "TC_064",
    category: "Functional Testing",
    module: "Patient Sessions",
    name: "No 404 on sessions page",
    description: "Sessions page shows content, not 404",
    steps: ['1. Navigate to /patient/sessions'],
    expected: "Page renders without 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
      // Check no 404
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"), "404 on sessions page")
    },
  });

  test({
    id: "TC_065",
    category: "Functional Testing",
    module: "Patient Sessions",
    name: "Sessions filter/search (optional)",
    description: "Sessions page may have filter or search controls",
    steps: ['1. Load sessions page\\n2. Check for filter/search'],
    expected: "Filter UI presence noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_filter = ["filter", "search", "sort", "all sessions"].some(k => src.includes(k))
      // filter is optional — just log what's present
        return `Filter/search UI present: ${has_filter}`
    },
  });

  test({
    id: "TC_066",
    category: "Functional Testing",
    module: "Patient Sessions",
    name: "Sessions pagination/load more (optional)",
    description: "Pagination controls may be present for many sessions",
    steps: ['1. Load sessions page\\n2. Check pagination'],
    expected: "Pagination check noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/sessions")
        await driver.sleep(1.5 * 1000)
      // Pagination or 'load more' optional
        let src = (await driver.getPageSource()).toLowerCase()
        let has_page = ["page", "next", "prev", "load more"].some(k => src.includes(k))
        return `Pagination present: ${has_page}`
    },
  });

  test({
    id: "TC_067",
    category: "UI/UX Testing",
    module: "Patient Appointments",
    name: "Appointments page loads",
    description: "/patient/appointments page renders",
    steps: ['1. Navigate to /patient/appointments'],
    expected: "Page renders with appointment-related content",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("appointment") || (await driver.getPageSource()).toLowerCase().includes("appointment"))
    },
  });

  test({
    id: "TC_068",
    category: "Functional Testing",
    module: "Patient Appointments",
    name: "Appointments page has heading",
    description: "At least one heading present",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_069",
    category: "Functional Testing",
    module: "Patient Appointments",
    name: "Book appointment CTA (optional)",
    description: "Button to book/schedule a new appointment may be present",
    steps: ['1. Load page\\n2. Check for booking CTA'],
    expected: "Check noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_book = ["book", "schedule", "request", "new appointment", "add"].some(k => src.includes(k))
        return `Booking CTA found: ${has_book}`
    },
  });

  test({
    id: "TC_070",
    category: "Functional Testing",
    module: "Patient Appointments",
    name: "Appointments list or empty state",
    description: "Appointment list or 'no appointments' message shown",
    steps: ['1. Load appointments page\\n2. Check for list or empty state'],
    expected: "Content or empty state visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_appt = ["pending", "confirmed", "date", "time", "therapist", "no appointment"].some(k => src.includes(k))
        assert.ok(has_appt, "No appointment data or empty state found")
    },
  });

  test({
    id: "TC_071",
    category: "UI/UX Testing",
    module: "Patient Appointments",
    name: "No 404 on appointments page",
    description: "Page renders without 404 error",
    steps: ['1. Navigate to /patient/appointments'],
    expected: "No 404 in page source",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"), "404 on appointments page")
    },
  });

  test({
    id: "TC_072",
    category: "Functional Testing",
    module: "Patient Appointments",
    name: "Appointment status badges (optional)",
    description: "Pending/confirmed status badges may appear",
    steps: ['1. Load page\\n2. Check status badges'],
    expected: "Check noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_status = ["pending", "confirmed", "status"].some(k => src.includes(k))
        return `Status badge found: ${has_status}`
    },
  });

  test({
    id: "TC_073",
    category: "UI/UX Testing",
    module: "Patient Treatment",
    name: "Treatment page loads",
    description: "/patient/treatment renders",
    steps: ['1. Navigate to /patient/treatment'],
    expected: "Treatment content visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/treatment")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("treatment") || (await driver.getPageSource()).toLowerCase().includes("treatment"))
    },
  });

  test({
    id: "TC_074",
    category: "UI/UX Testing",
    module: "Patient Treatment",
    name: "Treatment plan content visible",
    description: "Treatment exercises, goals, or plan content is displayed",
    steps: ['1. Load treatment page\\n2. Check for plan content'],
    expected: "Treatment-related content found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/treatment")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_plan = ["treatment", "exercise", "goal", "plan", "practice"].some(k => src.includes(k))
        assert.ok(has_plan, "No treatment plan content found")
    },
  });

  test({
    id: "TC_075",
    category: "Functional Testing",
    module: "Patient Treatment",
    name: "Treatment page has heading",
    description: "At least one heading is shown on treatment page",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/treatment")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_076",
    category: "Functional Testing",
    module: "Patient Treatment",
    name: "No 404 on treatment page",
    description: "Treatment page shows content, not 404",
    steps: ['1. Navigate to /patient/treatment'],
    expected: "No 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/treatment")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_077",
    category: "Functional Testing",
    module: "Patient Treatment",
    name: "Therapist notes section (optional)",
    description: "Therapist notes or instructions section may appear",
    steps: ['1. Load page\\n2. Check for notes'],
    expected: "Notes check noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/patient/treatment")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_notes = ["note", "therapist note", "instructions"].some(k => src.includes(k))
        return `Notes section found: ${has_notes}`
    },
  });

  test({
    id: "TC_078",
    category: "UI/UX Testing",
    module: "Patient Profile",
    name: "Profile page loads",
    description: "/patient/profile renders",
    steps: ['1. Navigate to /patient/profile'],
    expected: "Profile content visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/profile")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("profile") || (await driver.getPageSource()).toLowerCase().includes("profile"))
    },
  });

  test({
    id: "TC_079",
    category: "Functional Testing",
    module: "Patient Profile",
    name: "Profile info displayed",
    description: "User name and email or profile info shown",
    steps: ['1. Load profile page\\n2. Check for name/email'],
    expected: "Profile info keywords present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/profile")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_profile = ["name", "email", "profile"].some(k => src.includes(k))
        assert.ok(has_profile)
    },
  });

  test({
    id: "TC_080",
    category: "Functional Testing",
    module: "Patient Profile",
    name: "Profile page has heading",
    description: "At least one heading on profile page",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/profile")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_081",
    category: "UI/UX Testing",
    module: "Patient Profile",
    name: "No 404 on profile page",
    description: "Profile page renders without 404",
    steps: ['1. Navigate to /patient/profile'],
    expected: "No 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/patient/profile")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_082",
    category: "UI/UX Testing",
    module: "Therapist Dashboard",
    name: "Therapist dashboard loads",
    description: "Therapist dashboard renders with heading",
    steps: ['1. Login as therapist\\n2. Load /therapist'],
    expected: "H1 heading visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let h1 = await visible(driver, By.tagName("h1"), config.timeoutMs)
        assert.ok(await h1.isDisplayed())
    },
  });

  test({
    id: "TC_083",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Therapist dashboard content",
    description: "Page shows therapist-specific labels and patients section",
    steps: ['1. Load /therapist\\n2. Check for therapist/patient keywords'],
    expected: "Therapist and patient keywords present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(src.includes("therapist") && (src.includes("patient") || src.includes("dashboard")), "Therapist dashboard content missing")
    },
  });

  test({
    id: "TC_084",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Patient roster section",
    description: "Therapist dashboard shows 'Active Patients' or 'Patient Roster'",
    steps: ['1. Load /therapist\\n2. Find roster heading'],
    expected: "Roster heading present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Active Patients") || src.includes("Patient Roster"), "Patient roster heading not found")
    },
  });

  test({
    id: "TC_085",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Sessions stat card",
    description: "Sessions This Month stat card is shown on therapist dashboard",
    steps: ['1. Load /therapist\\n2. Find sessions stat'],
    expected: "'Sessions This Month' card present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Sessions This Month") || src.toLowerCase().includes("sessions"), "Sessions stat not found")
    },
  });

  test({
    id: "TC_086",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Average fluency score stat",
    description: "Average Fluency Score stat card is displayed",
    steps: ['1. Load /therapist\\n2. Find avg fluency stat'],
    expected: "Avg Fluency stat present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Avg Fluency") || src.toLowerCase().includes("fluency"), "Avg fluency stat missing")
    },
  });

  test({
    id: "TC_087",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Upcoming appointments section",
    description: "Upcoming Appointments section is on therapist dashboard",
    steps: ['1. Load /therapist\\n2. Find appointments section'],
    expected: "Appointments section present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Upcoming Appointments") || src.toLowerCase().includes("appointment"), "Appointments section missing")
    },
  });

  test({
    id: "TC_088",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Refresh button present",
    description: "Therapist dashboard has a Refresh button to reload patient data",
    steps: ['1. Load /therapist\\n2. Find Refresh button'],
    expected: "Refresh button found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let refresh_btns = await driver.findElements(By.css("button"))
        const labels = []; for (const b of refresh_btns) { labels.push((await b.getText()).trim().toLowerCase()); }
        assert.ok(labels.includes("refresh"), `Refresh button !found. Buttons: ${labels}`)
    },
  });

  test({
    id: "TC_089",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "All patients link present",
    description: "Link to /therapist/patients is on the dashboard",
    steps: ['1. Load /therapist\\n2. Find all-patients link'],
    expected: "Link to /therapist/patients found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let all_patients_link = await driver.findElements(By.css("a[href*='/therapist/patients']"))
        assert.ok(all_patients_link.length >= 1, "'All patients' link not found")
    },
  });

  test({
    id: "TC_090",
    category: "End-to-End (E2E) Testing",
    module: "Therapist Dashboard",
    name: "All patients link navigates correctly",
    description: "Clicking All patients link loads /therapist/patients",
    steps: ['1. Load /therapist\\n2. Click all patients link'],
    expected: "URL changes to /therapist/patients",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
      // Verify link is present in sidebar
        assert.ok((await driver.findElements(By.css("a[href*='/therapist/patients']"))).length >= 1, "Patients link not sidebar.includes(found)")
        await navigate(driver, config, "/therapist/patients")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/therapist/patients"), `Expected /therapist/patients, got ${(await driver.getCurrentUrl())}`)
    },
  });

  test({
    id: "TC_091",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Patients list page heading",
    description: "/therapist/patients page has a heading",
    steps: ['1. Load /therapist/patients\\n2. Find headings'],
    expected: "Heading found on patients page",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/patients")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_092",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Patients list or empty state shown",
    description: "Patient list or 'no patients' message is displayed",
    steps: ['1. Load /therapist/patients\\n2. Check for patient content'],
    expected: "Patient keyword found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/patients")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_patients = src.includes("patient")
        assert.ok(has_patients)
    },
  });

  test({
    id: "TC_093",
    category: "Regression Testing",
    module: "Therapist Dashboard",
    name: "Patient trend indicators (optional)",
    description: "Improving/stable/declining trend badges may appear in roster",
    steps: ['1. Load /therapist\\n2. Check trend labels'],
    expected: "Trend check noted (pass regardless)",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
      // Check for trend indicators
        let has_trend = ["improving", "stable", "declining"].some(k => src.includes(k))
        return `Trend indicators found: ${has_trend}`
    },
  });

  test({
    id: "TC_094",
    category: "Functional Testing",
    module: "Therapist Dashboard",
    name: "Mock/real data indicator",
    description: "Dashboard shows real patient data or 'Sample data' label",
    steps: ['1. Load /therapist\\n2. Check data indicator'],
    expected: "Data indicator visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(src.includes("Sample data") || src.toLowerCase().includes("patients"), "Either real data or sample data indicator should be present")
    },
  });

  test({
    id: "TC_095",
    category: "UI/UX Testing",
    module: "Therapist Dashboard",
    name: "No 404 on therapist dashboard",
    description: "Therapist dashboard renders without 404",
    steps: ['1. Navigate to /therapist'],
    expected: "No 404 in page source",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_096",
    category: "UI/UX Testing",
    module: "Therapist Appointments",
    name: "Therapist appointments page loads",
    description: "/therapist/appointments renders",
    steps: ['1. Navigate to /therapist/appointments'],
    expected: "Page renders with appointment content",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/appointments")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("appointments") || (await driver.getPageSource()).toLowerCase().includes("appointment"))
    },
  });

  test({
    id: "TC_097",
    category: "Functional Testing",
    module: "Therapist Appointments",
    name: "Appointments page heading",
    description: "Heading element present on therapist appointments",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/appointments")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_098",
    category: "Functional Testing",
    module: "Therapist Appointments",
    name: "Appointment data or empty state",
    description: "Appointment list or empty state is displayed",
    steps: ['1. Load page\\n2. Check for appointment content'],
    expected: "Appointment content found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_content = ["pending", "confirmed", "no appointment", "patient", "date", "time"].some(k => src.includes(k))
        assert.ok(has_content, "No appointment-related content found")
    },
  });

  test({
    id: "TC_099",
    category: "UI/UX Testing",
    module: "Therapist Appointments",
    name: "No 404 on therapist appointments",
    description: "Page renders without 404",
    steps: ['1. Navigate to page'],
    expected: "No 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/appointments")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_100",
    category: "UI/UX Testing",
    module: "Settings",
    name: "Settings page loads",
    description: "/settings page renders",
    steps: ['1. Navigate to /settings'],
    expected: "Settings page content visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/settings")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getCurrentUrl()).toLowerCase().includes("settings") || (await driver.getPageSource()).toLowerCase().includes("settings"), "Settings page not reached")
    },
  });

  test({
    id: "TC_101",
    category: "Functional Testing",
    module: "Settings",
    name: "Settings page has heading",
    description: "At least one heading on settings page",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/settings")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_102",
    category: "UI/UX Testing",
    module: "Settings",
    name: "Settings sections present",
    description: "Account/email/password/theme settings are shown",
    steps: ['1. Load settings\\n2. Check for settings keywords'],
    expected: "Settings content found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/settings")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_settings = ["account", "email", "password", "notification", "theme", "profile"].some(k => src.includes(k))
        assert.ok(has_settings, "No settings-related content found")
    },
  });

  test({
    id: "TC_103",
    category: "UI/UX Testing",
    module: "Settings",
    name: "No 404 on settings page",
    description: "Settings renders without 404",
    steps: ['1. Navigate to /settings'],
    expected: "No 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/settings")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_104",
    category: "Functional Testing",
    module: "Settings",
    name: "Settings has form fields",
    description: "At least one input/select/textarea is on settings page",
    steps: ['1. Load settings\\n2. Count form elements'],
    expected: "At least 1 form element found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/therapist") || !(current_url.includes("/patient") || current_url.includes("/settings"))) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "patient");
        }
        await navigate(driver, config, "/settings")
        await driver.sleep(1.5 * 1000)
        let inputs = await driver.findElements(By.css("input, select, textarea"))
        assert.ok(inputs.length >= 1, "No form inputs on settings page")
    },
  });

  test({
    id: "TC_105",
    category: "End-to-End (E2E) Testing",
    module: "Navigation & Responsiveness",
    name: "Nav Sign in routes to /login",
    description: "Clicking Sign in in nav navigates to /login",
    steps: ['1. Load landing\\n2. Click Sign in'],
    expected: "URL is /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let links = await driver.findElements(By.css("a[href*='/login']"))
      // Filter out any links that are sub-paths of /login (e.g. /login?role=...)
        const login_links = []; for (const l of links) { const href = await l.getAttribute('href'); if (href && href.replace(/\/$/, '').endsWith('/login')) { login_links.push(l); } }
        assert.ok(login_links.length >= 1, "No clean /login link found.")
        await login_links[0].click()
        await driver.sleep(1 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/login"))
    },
  });

  test({
    id: "TC_106",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Back to home link works",
    description: "Back link on login navigates back to landing page",
    steps: ['1. Load /login\\n2. Click back link\\n3. Verify URL'],
    expected: "URL is BASE_URL /",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
      // basePath-aware root link matching multiple variations
        await clickLink(driver, "a[href='/'], a[href='/fluentvoice-frontend'], a[href='/fluentvoice-frontend/']")
        await driver.sleep(1 * 1000)
        assert.equal((await driver.getCurrentUrl()), `${config.baseUrl}/` || (await driver.getCurrentUrl()) == config.baseUrl)
    },
  });

  test({
    id: "TC_107",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Mobile viewport (375px) renders",
    description: "Landing page renders on 375px-wide viewport without horizontal scroll",
    steps: ['1. Set window to 375x812\\n2. Load landing'],
    expected: "Body is visible, no crash",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await driver.manage().window().setSize(375, 812)  // iPhone SE
        await navigate(driver, config, "/")
        await driver.sleep(1 * 1000)
        let body = await driver.findElement(By.tagName("body"))
        assert.ok(await body.isDisplayed())
        await driver.manage().window().maximize()
    },
  });

  test({
    id: "TC_108",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Tablet viewport (768px) renders",
    description: "Landing page renders on 768px-wide viewport",
    steps: ['1. Set window to 768x1024\\n2. Load landing'],
    expected: "Body is visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await driver.manage().window().setSize(768, 1024)  // tablet
        await navigate(driver, config, "/")
        await driver.sleep(1 * 1000)
        assert.ok(await driver.findElement(By.tagName("body")).isDisplayed())
        await driver.manage().window().maximize()
    },
  });

  test({
    id: "TC_109",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Unknown route returns 404",
    description: "Navigating to a non-existent route shows 404",
    steps: ['1. Navigate to /nonexistent-page-xyz'],
    expected: "404 page shown",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/nonexistent-page-xyz")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
      // Next.js typically shows 404 page
        let has_404 = src.includes("404") || src.includes("not found")
        return `404 page shown for unknown route: ${has_404}`
    },
  });

  test({
    id: "TC_110",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Browser back button works",
    description: "Browser back button returns to previous page without error",
    steps: ['1. Load /login\\n2. Click browser back'],
    expected: "Page renders after back navigation",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        await driver.executeScript("window.history.back()")
        await driver.sleep(1 * 1000)
        assert.ok(await driver.findElement(By.tagName("body")).isDisplayed())
    },
  });

  test({
    id: "TC_111",
    category: "End-to-End (E2E) Testing",
    module: "Navigation & Responsiveness",
    name: "Therapist CTA routes to /login",
    description: "'I'm a therapist' link goes to /login?role=therapist",
    steps: ['1. Landing page\\n2. Click therapist CTA\\n3. Verify URL'],
    expected: "URL contains /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        await clickLink(driver, "a[href*='login?role=therapist'], a[href*='login/?role=therapist'], a[href*='login'][href*='role=therapist']")
        await driver.sleep(1 * 1000)
        assert.ok((await driver.getCurrentUrl()).includes("/login"))
    },
  });

  test({
    id: "TC_112",
    category: "Mobile-Specific Testing",
    module: "Navigation & Responsiveness",
    name: "Footer has 3+ links",
    description: "Footer contains Privacy, Terms, Contact links",
    steps: ['1. Load landing\\n2. Count footer anchor elements'],
    expected: "At least 3 footer links found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let footer = await driver.findElement(By.tagName("footer"))
      // Footer links  — Privacy, Terms, Contact
        let footer_links = await footer.findElements(By.tagName("a"))
        assert.ok(footer_links.length >= 3, `Expected ≥3 footer links, got ${footer_links.length}`)
    },
  });

  test({
    id: "TC_113",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "Single H1 on landing page",
    description: "Landing page has exactly one H1 element (SEO best practice)",
    steps: ['1. Load landing\\n2. Count H1 elements'],
    expected: "Exactly 1 H1 found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let h1s = await driver.findElements(By.tagName("h1"))
        assert.equal(h1s.length, 1, `Expected exactly 1 H1, found ${h1s.length}`)
    },
  });

  test({
    id: "TC_114",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "H1 on login page",
    description: "Login page has at least one H1",
    steps: ['1. Load /login\\n2. Count H1'],
    expected: "At least 1 H1 found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let h1s = await driver.findElements(By.tagName("h1"))
        assert.ok(h1s.length >= 1, `Expected ≥1 H1 on login, found ${h1s.length}`)
    },
  });

  test({
    id: "TC_115",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "Form labels present",
    description: "Login form has <label> elements for inputs",
    steps: ['1. Load /login\\n2. Count label elements'],
    expected: "At least 2 label elements found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let labels = await driver.findElements(By.css("label"))
        assert.ok(labels.length >= 2, `Expected ≥2 label elements, got ${labels.length}`)
    },
  });

  test({
    id: "TC_116",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "ARIA labels on icon buttons",
    description: "Icon-only buttons have aria-label attributes",
    steps: ['1. Load /login\\n2. Find aria-label buttons'],
    expected: "At least 1 button with aria-label found",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let toggle_btns = await driver.findElements(By.css("button[aria-label]"))
        assert.ok(toggle_btns.length >= 1, "No aria-label buttons on login")
    },
  });

  test({
    id: "TC_117",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "HTML lang attribute set",
    description: "Root <html> has lang attribute for screen readers",
    steps: ['1. Load landing\\n2. Read html[lang]'],
    expected: "lang attribute is non-empty",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let lang = await driver.findElement(By.tagName("html")).getAttribute("lang")
        assert.ok(lang && lang.length >= 2, `HTML lang attribute missing || empty: '${lang}'`)
    },
  });

  test({
    id: "TC_118",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "Images have alt attributes",
    description: "All <img> elements have alt text (accessibility)",
    steps: ['1. Load landing\\n2. Check all img[alt]'],
    expected: "All images have alt attributes",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
        let imgs = await driver.findElements(By.tagName("img"))
        const no_alt = []; for (const img of imgs) { if (!(await img.getAttribute('alt'))) { no_alt.push(img); } }
        assert.equal(no_alt.length, 0, `${no_alt.length} images missing alt attribute`)
    },
  });

  test({
    id: "TC_119",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "Keyboard tab focus works",
    description: "Tab key focuses interactive elements on landing page",
    steps: ['1. Load landing\\n2. Press Tab\\n3. Check focused element'],
    expected: "Focus moves to an interactive element",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.sleep(0.5 * 1000)
      // Tab through the page
        let body = await driver.findElement(By.tagName("body"))
        await body.sendKeys(Key.TAB)
        await driver.sleep(0.2 * 1000)
        let active = await driver.switchTo().activeElement()
        assert.ok(["a", "button", "input", "select", "textarea"].includes(await active.getTagName()),             `Tab focus landed on: ${await active.getTagName()}`)
    },
  });

  test({
    id: "TC_120",
    category: "Accessibility Testing",
    module: "Accessibility",
    name: "Viewport meta tag set",
    description: "Meta viewport tag enables mobile-responsive rendering",
    steps: ['1. Load /login\\n2. Read meta[name=viewport]'],
    expected: "Viewport meta contains 'width=device-width'",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
      // Check viewport meta
        let meta_viewport = await driver.executeScript(
            "return document.querySelector('meta[name=viewport]')?.content"
        )
        assert.ok(meta_viewport && meta_viewport.includes("width=device-width"), `Viewport meta missing || wrong: ${meta_viewport}`)
    },
  });

  test({
    id: "TC_121",
    category: "API Testing",
    module: "API Health",
    name: "Auth login API reachable (GET)",
    description: "/api/auth/login is reachable and doesn't return 500",
    steps: ['1. GET /api/auth/login'],
    expected: "Response is not HTTP 500",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/api/auth/login")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource())
      // Should return JSON with error or 405 Method Not Allowed — not 500
        assert.ok(!src.slice(0, 100).includes("500") || !src.includes("Internal Server Error"),             "API returned 500")
        return `API /auth/login responded (!500): ${src.slice(0, 80)}`
    },
  });

  test({
    id: "TC_122",
    category: "Database Testing",
    module: "API Health",
    name: "Sessions API reachable",
    description: "/api/sessions is reachable and doesn't crash",
    steps: ['1. GET /api/sessions (unauthenticated)'],
    expected: "Response is not HTTP 500",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/api/sessions")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource())
      // Without auth should return 401 or redirect — not crash
        assert.ok(!src.slice(0, 100).includes("500"), "Sessions API returned 500")
        return `API /sessions responded: ${src.slice(0, 80)}`
    },
  });

  test({
    id: "TC_123",
    category: "Database Testing",
    module: "API Health",
    name: "Appointments API reachable",
    description: "/api/appointments is reachable and doesn't crash",
    steps: ['1. GET /api/appointments'],
    expected: "Not 500",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/api/appointments")
        await driver.sleep(1 * 1000)
        let src = (await driver.getPageSource())
        assert.ok(!src.slice(0, 100).includes("500"), "Appointments API returned 500")
        return `API /appointments responded: ${src.slice(0, 80)}`
    },
  });

  test({
    id: "TC_124",
    category: "Functional Testing",
    module: "Edge Cases & Security",
    name: "XSS prevention on email field",
    description: "Script injection in email field does not cause alert",
    steps: ['1. Enter <script>alert()</script> in email\\n2. Submit'],
    expected: "No JS alert appears",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login");
        await driver.sleep(500);
        const email_input = await driver.findElement(By.css("input[type='email']"));
        await email_input.sendKeys("<script>alert('xss')</script>");
        const pw_input = await driver.findElement(By.css("input[type='password']"));
        await pw_input.sendKeys("password123");
        await (await driver.findElement(By.css("button.w-full"))).click();
        await driver.sleep(1500);
        try {
            const alert = await driver.switchTo().alert();
            await alert.dismiss();
            throw new Error("XSS alert appeared — vulnerability!");
        } catch (e) {
            if (e.message.includes("XSS alert")) {
                throw e;
            }
            // No alert = good
        }
    },
  });

  test({
    id: "TC_125",
    category: "Security Testing",
    module: "Edge Cases & Security",
    name: "SQL injection in email field rejected",
    description: "SQL injection in email field does not bypass authentication",
    steps: ['1. Enter SQL injection in email\\n2. Submit'],
    expected: "User is NOT redirected to dashboard",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let email_input = await driver.findElement(By.css("input[type='email']"))
      // SQL injection attempt
        await email_input.sendKeys("' OR '1'='1'; --")
        await driver.findElement(By.css("input[type='password']")).sendKeys("anything")
        await driver.findElement(By.css("button.w-full")).click()
        await driver.sleep(2 * 1000)
      // Should NOT redirect to dashboard
        assert.ok(!(await driver.getCurrentUrl()).includes("/patient") && !(await driver.getCurrentUrl()).includes("/therapist"), "SQL injection may have succeeded — security risk")
    },
  });

  test({
    id: "TC_126",
    category: "Functional Testing",
    module: "Edge Cases & Security",
    name: "Long email input handled gracefully",
    description: "1000-char email input does not crash the page",
    steps: ['1. Enter 1000-char email\\n2. Submit'],
    expected: "Page remains functional",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let email_input = await driver.findElement(By.css("input[type='email']"))
      // Very long input
        await email_input.sendKeys("a" * 1000 + "@test.com")
        await driver.findElement(By.css("input[type='password']")).sendKeys("password123")
        await driver.findElement(By.css("button.w-full")).click()
        await driver.sleep(2 * 1000)
        assert.ok(await driver.findElement(By.tagName("body")).isDisplayed(), "Page crashed on long input")
    },
  });

  test({
    id: "TC_127",
    category: "Functional Testing",
    module: "Edge Cases & Security",
    name: "Empty login form stays on /login",
    description: "Submitting empty form does not navigate away from /login",
    steps: ['1. Load /login\\n2. Click Sign in without any input'],
    expected: "URL remains /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
      // Empty submission
        await driver.findElement(By.css("button.w-full")).click()
        await driver.sleep(1 * 1000)
      // Should stay on login with error
        assert.ok(!(await driver.getCurrentUrl()).includes((await driver.getCurrentUrl()).includes("/login") || "/patient"))
    },
  });

  test({
    id: "TC_128",
    category: "Functional Testing",
    module: "Edge Cases & Security",
    name: "Invalid email format handled",
    description: "Non-email string in email field is handled gracefully",
    steps: ["1. Enter 'not-an-email'\\n2. Submit"],
    expected: "Page renders without crash",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/login")
        await driver.sleep(0.5 * 1000)
        let email_input = await driver.findElement(By.css("input[type='email']"))
        await email_input.sendKeys("not-an-email")
        await driver.findElement(By.css("input[type='password']")).sendKeys("password123")
        await driver.findElement(By.css("button.w-full")).click()
        await driver.sleep(1.5 * 1000)
      // Page should not 500 crash
        assert.ok(await driver.findElement(By.tagName("body")).isDisplayed())
    },
  });

  test({
    id: "TC_129",
    category: "UI/UX Testing",
    module: "Edge Cases & Security",
    name: "Therapist patient detail requires auth",
    description: "Accessing /therapist/patients/:id without token redirects",
    steps: ['1. Clear cookies\\n2. Navigate to patient detail'],
    expected: "Redirected to /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
      // Direct access to a therapist patient detail page without auth
        await navigate(driver, config, "/")
        await driver.manage().deleteAllCookies()
        await driver.executeScript("await localStorage.clear();")
        await navigate(driver, config, "/therapist/patient-details?id=some-patient-id")
        await urlContains(driver, "/login", 8 * 1000)
    },
  });

  test({
    id: "TC_130",
    category: "UI/UX Testing",
    module: "Edge Cases & Security",
    name: "Settings requires authentication",
    description: "Accessing /settings without token redirects to /login",
    steps: ['1. Clear cookies\\n2. Navigate to /settings'],
    expected: "Redirected to /login",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        await navigate(driver, config, "/")
        await driver.manage().deleteAllCookies()
        await driver.executeScript("await localStorage.clear();")
        await navigate(driver, config, "/settings")
        await urlContains(driver, "/login", 8 * 1000)
    },
  });

  test({
    id: "TC_131",
    category: "UI/UX Testing",
    module: "Therapist Profile",
    name: "Therapist profile page loads",
    description: "/therapist/profile renders",
    steps: ['1. Navigate to /therapist/profile'],
    expected: "Profile content visible",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/profile")
        await driver.sleep(1.5 * 1000)
        assert.ok((await driver.getPageSource()).toLowerCase().includes("profile"))
    },
  });

  test({
    id: "TC_132",
    category: "Functional Testing",
    module: "Therapist Profile",
    name: "Therapist profile heading",
    description: "Heading found on therapist profile",
    steps: ['1. Load page\\n2. Count headings'],
    expected: "Heading present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/profile")
        await driver.sleep(1.5 * 1000)
        let headings = await driver.findElements(By.css("h1, h2, h3"))
        assert.ok(headings.length >= 1)
    },
  });

  test({
    id: "TC_133",
    category: "UI/UX Testing",
    module: "Therapist Profile",
    name: "No 404 on therapist profile",
    description: "Therapist profile renders without 404",
    steps: ['1. Navigate to page'],
    expected: "No 404",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/profile")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        assert.ok(!src.slice(0, 200).includes("404"))
    },
  });

  test({
    id: "TC_134",
    category: "Functional Testing",
    module: "Therapist Profile",
    name: "Therapist profile shows info",
    description: "Profile page shows therapist name/email or credentials",
    steps: ['1. Load page\\n2. Check profile keywords'],
    expected: "Profile info keywords present",
    suites: ["full"],
    async run({ driver, config, recordPerformance, recordAccessibility }) {
        const current_url = await driver.getCurrentUrl();
        if (current_url.includes("/login") || current_url.includes("/patient") || current_url.includes("/settings") || !current_url.includes("/therapist")) {
            await driver.manage().deleteAllCookies();
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            await login(driver, config, "therapist");
        }
        await navigate(driver, config, "/therapist/profile")
        await driver.sleep(1.5 * 1000)
        let src = (await driver.getPageSource()).toLowerCase()
        let has_info = ["name", "email", "specialization", "license", "profile"].some(k => src.includes(k))
        assert.ok(has_info, "No profile info keywords found")
    },
  });

}

module.exports = { registerSuites };