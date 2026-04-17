const form = document.querySelector("#scan-form");
const urlInput = document.querySelector("#url-input");
const scanButton = document.querySelector("#scan-button");
const demoButtons = document.querySelectorAll("[data-demo-url]");
const emptyState = document.querySelector("#results-empty");
const loadingState = document.querySelector("#results-loading");
const errorState = document.querySelector("#results-error");
const contentState = document.querySelector("#results-content");
const scoreValue = document.querySelector("#score-value");
const scoreCaption = document.querySelector("#score-caption");
const summaryChips = document.querySelector("#summary-chips");
const finalUrlNode = document.querySelector("#final-url");
const scanTimeNode = document.querySelector("#scan-time");
const trackerCountNode = document.querySelector("#tracker-count");
const contactCountNode = document.querySelector("#contact-count");
const categoryGroups = document.querySelector("#category-groups");
const sourceLinks = document.querySelector("#source-links");

function setState(name) {
  emptyState.classList.toggle("hidden", name !== "empty");
  loadingState.classList.toggle("hidden", name !== "loading");
  errorState.classList.toggle("hidden", name !== "error");
  contentState.classList.toggle("hidden", name !== "content");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getScoreCaption(score) {
  if (score >= 82) {
    return "Base visible solide. Il reste surtout du peaufinage ou de la vérification métier.";
  }
  if (score >= 60) {
    return "Le site donne quelques bons signaux, mais plusieurs angles morts restent visibles.";
  }
  return "Le site expose des manques visibles qui fragilisent confiance, conversion et conformité.";
}

function renderSources(sources) {
  sourceLinks.innerHTML = sources
    .map(
      (source) => `
        <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
          ${escapeHtml(source.label)}
          <small>${escapeHtml(source.date)}</small>
        </a>
      `
    )
    .join("");
}

function renderSummary(summary) {
  const order = [
    { key: "critical", label: "Critiques" },
    { key: "warning", label: "À vérifier" },
    { key: "pass", label: "OK" },
  ];

  summaryChips.innerHTML = order
    .map(
      (item) => `
        <span class="summary-chip ${item.key}">
          ${escapeHtml(item.label)}: ${summary[item.key]}
        </span>
      `
    )
    .join("");
}

function renderCategories(categories) {
  categoryGroups.innerHTML = categories
    .map((category) => {
      const warnings = category.items.filter((item) => item.status !== "pass").length;
      const checksHtml = category.items
        .map(
          (item) => `
            <article class="check-item">
              <span class="status-badge ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span>
              <div class="check-copy">
                <h5>${escapeHtml(item.title)}</h5>
                <p>${escapeHtml(item.detail)}</p>
                <p><strong>Action:</strong> ${escapeHtml(item.recommendation)}</p>
                ${
                  item.evidence
                    ? `<p class="evidence"><strong>Signal:</strong> ${escapeHtml(item.evidence)}</p>`
                    : ""
                }
              </div>
            </article>
          `
        )
        .join("");

      return `
        <section class="category-group">
          <div class="category-group-head">
            <h4>${escapeHtml(category.name)}</h4>
            <span>${warnings} point(s) à corriger ou vérifier</span>
          </div>
          <div class="check-list">${checksHtml}</div>
        </section>
      `;
    })
    .join("");
}

function renderReport(report) {
  scoreValue.textContent = report.score;
  scoreCaption.textContent = getScoreCaption(report.score);
  finalUrlNode.textContent = report.finalUrl;
  scanTimeNode.textContent = `${report.fetchMs} ms`;
  trackerCountNode.textContent = `${report.meta.trackers.length} détecté(s)`;
  contactCountNode.textContent = `${report.topSignals.visibleContactPoints} signal(s)`;

  renderSummary(report.summary);
  renderCategories(report.categories);
  renderSources(report.sources);
}

async function runScan(url) {
  setState("loading");
  errorState.textContent = "";
  scanButton.disabled = true;
  scanButton.textContent = "Scan en cours...";

  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Le scan a échoué.");
    }

    renderReport(payload);
    setState("content");
  } catch (error) {
    errorState.textContent = error.message;
    setState("error");
  } finally {
    scanButton.disabled = false;
    scanButton.textContent = "Scanner le site";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) {
    return;
  }
  await runScan(url);
});

for (const button of demoButtons) {
  button.addEventListener("click", async () => {
    const url = button.dataset.demoUrl || "";
    urlInput.value = url;
    await runScan(url);
  });
}
