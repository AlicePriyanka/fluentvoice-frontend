const fs = require("node:fs");
const path = require("node:path");

function generateHtmlReport(results, performance, accessibility, config, runStartedAt, outputPath) {
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const skip = results.filter((r) => r.status === "SKIP").length;
  const total = results.length;
  const passRate = total ? ((pass / total) * 100).toFixed(2) : "0.00";
  const durationTotal = results.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);

  // Group by category for metrics
  const categories = {};
  for (const r of results) {
    if (!categories[r.category]) {
      categories[r.category] = { total: 0, pass: 0, fail: 0, skip: 0 };
    }
    categories[r.category].total++;
    categories[r.category][r.status.toLowerCase()]++;
  }

  const categoryRowsHtml = Object.entries(categories)
    .map(([name, stats]) => {
      const rate = stats.total ? ((stats.pass / stats.total) * 100).toFixed(1) : "0.0";
      return `
        <tr>
          <td>${name}</td>
          <td>${stats.total}</td>
          <td class="text-pass">${stats.pass}</td>
          <td class="text-fail">${stats.fail}</td>
          <td class="text-skip">${stats.skip}</td>
          <td>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${rate}%"></div>
            </div>
            <span style="font-size: 0.8rem; margin-top: 4px; display: inline-block;">${rate}%</span>
          </td>
        </tr>
      `;
    })
    .join("");

  const testRowsHtml = results
    .map((r) => {
      const statusBadge = `<span class="badge badge-${r.status.toLowerCase()}">${r.status}</span>`;
      const errorSection = r.error
        ? `<div class="error-stack"><strong>Error:</strong><pre>${r.error}</pre></div>`
        : "";
      return `
        <tr class="test-row" onclick="toggleDetails(this)">
          <td><strong>${r.id}</strong></td>
          <td>${r.category}</td>
          <td>${r.name}</td>
          <td>${statusBadge}</td>
          <td>${r.durationMs}ms</td>
        </tr>
        <tr class="details-row" style="display: none;">
          <td colspan="5">
            <div class="details-content">
              <p><strong>Description:</strong> ${r.description}</p>
              <p><strong>Steps:</strong></p>
              <pre>${r.steps}</pre>
              <p><strong>Expected:</strong> ${r.expected}</p>
              <p><strong>Actual:</strong> ${r.actual}</p>
              ${errorSection}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const perfRowsHtml = performance
    .map((p) => `
      <tr>
        <td><strong>${p.testId}</strong></td>
        <td>${p.route}</td>
        <td>${p.duration}ms</td>
        <td>${p.domContentLoaded}ms</td>
        <td>${p.loadEvent}ms</td>
        <td>${p.responseTime}ms</td>
        <td>${(p.transferSize / 1024).toFixed(1)} KB</td>
      </tr>
    `)
    .join("");

  const a11yRowsHtml = accessibility
    .map((a) => `
      <tr>
        <td><strong>${a.testId}</strong></td>
        <td>${a.page}</td>
        <td><span class="badge badge-fail">${a.impact.toUpperCase()}</span></td>
        <td>${a.description}</td>
        <td><code>${a.nodes}</code></td>
        <td><a href="${a.helpUrl}" target="_blank" class="link">View Rule</a></td>
      </tr>
    `)
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FluentVoice E2E Execution Report</title>
  <style>
    :root {
      --bg-main: #0B0F19;
      --bg-card: #151B26;
      --bg-hover: #1E2633;
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --primary: #4F46E5;
      --success: #10B981;
      --danger: #EF4444;
      --warning: #F59E0B;
      --border: #2D3748;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
      background-color: var(--bg-main);
      color: var(--text-main);
      line-height: 1.6;
      padding: 2rem;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #A5B4FC, #6366F1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .meta-info {
      font-size: 0.9rem;
      color: var(--text-muted);
      text-align: right;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }

    .card-title {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 2rem;
      font-weight: 700;
    }

    .text-pass { color: var(--success); }
    .text-fail { color: var(--danger); }
    .text-skip { color: var(--warning); }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.2s, color 0.2s;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background-color: var(--bg-hover);
    }

    .tab-btn.active {
      color: var(--text-main);
      background-color: var(--primary);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      background-color: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    tbody tr:hover {
      background-color: var(--bg-hover);
      cursor: pointer;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-pass {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .badge-fail {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .badge-skip {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .progress-bar-bg {
      background-color: rgba(255, 255, 255, 0.1);
      height: 8px;
      border-radius: 4px;
      width: 100%;
      overflow: hidden;
    }

    .progress-bar-fill {
      background-color: var(--success);
      height: 100%;
      border-radius: 4px;
    }

    pre {
      font-family: 'Fira Code', 'Courier New', Courier, monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
    }

    .details-row {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .details-content {
      padding: 1.5rem;
      border-left: 4px solid var(--primary);
    }

    .details-content p {
      margin-bottom: 0.5rem;
    }

    .error-stack {
      background-color: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
      padding: 1rem;
      margin-top: 1rem;
      overflow-x: auto;
    }

    .error-stack pre {
      color: #FCA5A5;
    }

    .link {
      color: #818CF8;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }
  </style>
  <script>
    function showTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      event.target.classList.add('active');
    }

    function toggleDetails(row) {
      const detailsRow = row.nextElementSibling;
      if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row';
      } else {
        detailsRow.style.display = 'none';
      }
    }
  </script>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>FluentVoice Automated Test Report</h1>
        <p style="color: var(--text-muted);">End-to-End & System Quality Test Suite Results</p>
      </div>
      <div class="meta-info">
        <p><strong>Environment:</strong> \${config.baseUrl}</p>
        <p><strong>Date:</strong> \${new Date(runStartedAt).toLocaleString()}</p>
        <p><strong>Total Duration:</strong> \${(durationTotal / 1000).toFixed(2)} seconds</p>
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-title">TOTAL TEST CASES</div>
        <div class="card-value">\${total}</div>
      </div>
      <div class="card">
        <div class="card-title">PASSED TESTS</div>
        <div class="card-value text-pass">\${pass}</div>
      </div>
      <div class="card">
        <div class="card-title">FAILED TESTS</div>
        <div class="card-value text-fail">\${fail}</div>
      </div>
      <div class="card">
        <div class="card-title">SKIPPED TESTS</div>
        <div class="card-value text-skip">\${skip}</div>
      </div>
      <div class="card">
        <div class="card-title">PASS RATE</div>
        <div class="card-value text-pass">\${passRate}%</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="showTab('summary-tab')">Executive Summary</button>
      <button class="tab-btn" onclick="showTab('detailed-tab')">Detailed Results (\${total})</button>
      <button class="tab-btn" onclick="showTab('perf-tab')">Performance Metrics (\${performance.length})</button>
      <button class="tab-btn" onclick="showTab('a11y-tab')">Accessibility Audits (\${accessibility.length})</button>
    </div>

    <!-- SUMMARY TAB -->
    <div id="summary-tab" class="tab-content active">
      <table>
        <thead>
          <tr>
            <th>Testing Category</th>
            <th>Total Cases</th>
            <th class="text-pass">Pass</th>
            <th class="text-fail">Fail</th>
            <th class="text-skip">Skip</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          \${categoryRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- DETAILED RESULTS TAB -->
    <div id="detailed-tab" class="tab-content">
      <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">* Click on any row to expand details, steps, expectations, and full error logs.</p>
      <table>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Category</th>
            <th>Name</th>
            <th>Status</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          \${testRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- PERFORMANCE METRICS TAB -->
    <div id="perf-tab" class="tab-content">
      <table>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Route Checked</th>
            <th>Response duration</th>
            <th>DOM Content Loaded</th>
            <th>Load Event</th>
            <th>Response Connection</th>
            <th>Transfer size</th>
          </tr>
        </thead>
        <tbody>
          \${perfRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- ACCESSIBILITY FINDINGS TAB -->
    <div id="a11y-tab" class="tab-content">
      <table>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Target Route</th>
            <th>Impact</th>
            <th>Description</th>
            <th>Affected Nodes</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          \${a11yRowsHtml}
        </tbody>
      </table>
    </div>

  </div>
</body>
</html>
  `;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, htmlContent, "utf-8");
}

module.exports = { generateHtmlReport };
