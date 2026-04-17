const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const SOURCE_LINKS = [
  {
    date: "11 décembre 2025",
    label: "Mentions obligatoires, cookies et résiliation d’abonnement",
    url: "https://www.economie.gouv.fr/entreprises/developper-son-entreprise/innover-et-numeriser-son-entreprise/mentions-sur-votre-site-internet-les-obligations-respecter",
  },
  {
    date: "31 mai 2023, mis à jour le 31 janvier 2025",
    label: "Résiliation en 3 clics",
    url: "https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/gestion-de-la-relation-client/resiliation-en-3-clics",
  },
  {
    date: "31 juillet 2025, mis à jour le 12 février 2026",
    label: "Avis clients vérifiés",
    url: "https://www.francenum.gouv.fr/guides-et-conseils/protection-contre-les-risques/gestion-de-la-reputation-de-lentreprise/les-avis",
  },
  {
    date: "15 septembre 2025, mis à jour le 7 avril 2026",
    label: "Baromètre France Num 2025",
    url: "https://www.francenum.gouv.fr/guides-et-conseils/strategie-numerique/comprendre-le-numerique/barometre-france-num-2025-le",
  },
  {
    date: "9 décembre 2025",
    label: "SignalConso et accessibilité numérique",
    url: "https://www.economie.gouv.fr/dgccrf/actualites-dgccrf/signalez-facilement-un-manquement-aux-obligations-daccessibilite-aux-personnes-en-situation-de-handicap-dans-signalconso",
  },
];

const DEMO_PAGES = {
  "/demo/non-conforme": `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>FlashGrowth - Growth subscriptions</title>
      </head>
      <body>
        <header>
          <h1>Scale your pipeline in 14 days</h1>
          <p>Growth ops as a monthly subscription.</p>
          <a href="/signup">Start free trial</a>
          <a href="/pricing">Pricing</a>
        </header>
        <main>
          <section>
            <h2>Plans</h2>
            <p>Starter 99€/mois</p>
            <p>Scale 249€/mois</p>
            <button>Subscribe now</button>
          </section>
          <section>
            <h2>Book a demo</h2>
            <form action="/lead" method="post">
              <input type="text" name="name" placeholder="Your name">
              <input type="email" name="email" placeholder="Work email">
              <button type="submit">Send</button>
            </form>
          </section>
          <section>
            <img src="/hero.png">
            <img src="/dashboard.png" alt="">
          </section>
          <footer>
            <a href="/contact">Contact</a>
          </footer>
        </main>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TEST123');
        </script>
      </body>
    </html>
  `,
  "/demo/mieux-cadre": `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Studio Atlas - audit marketing en abonnement</title>
      </head>
      <body>
        <header>
          <h1>Audit marketing sous 72h</h1>
          <nav>
            <a href="/demo/mieux-cadre/mentions-legales">Mentions légales</a>
            <a href="/demo/mieux-cadre/confidentialite">Confidentialité</a>
            <a href="/demo/mieux-cadre/cookies">Cookies</a>
            <a href="/demo/mieux-cadre/cgv">CGV</a>
            <a href="/demo/mieux-cadre/accessibilite">Accessibilité</a>
            <a href="/demo/mieux-cadre/resiliation">Résilier votre contrat</a>
          </nav>
        </header>
        <main>
          <section>
            <p>Abonnement mensuel sans engagement - 190€/mois</p>
            <form action="/contact" method="post">
              <label>
                Email
                <input type="email" name="email">
              </label>
              <button type="submit">Recevoir un rappel</button>
            </form>
          </section>
          <section>
            <img src="/mockup.png" alt="Aperçu du tableau de bord d'audit juridique">
            <p>Studio Atlas SAS - SIRET 123 456 789 00012 - RCS Paris 123 456 789 - TVA intracom FR12123456789</p>
            <p>Contact : hello@studio-atlas.fr - 01 89 76 54 32</p>
          </section>
        </main>
      </body>
    </html>
  `,
  "/demo/mieux-cadre/mentions-legales": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Mentions légales</title></head>
    <body><h1>Mentions légales</h1><p>Studio Atlas SAS - capital 10 000€ - SIRET 123 456 789 00012 - RCS Paris 123 456 789 - TVA FR12123456789</p><p>Hébergeur : Example Cloud, 10 rue Exemple, Paris.</p></body></html>
  `,
  "/demo/mieux-cadre/confidentialite": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Politique de confidentialité</title></head>
    <body><h1>Politique de confidentialité</h1><p>Nous collectons les données strictement nécessaires et détaillons les droits RGPD.</p></body></html>
  `,
  "/demo/mieux-cadre/cookies": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Politique cookies</title></head>
    <body><h1>Cookies</h1><p>Vous pouvez accepter ou refuser les traceurs de mesure d'audience.</p></body></html>
  `,
  "/demo/mieux-cadre/cgv": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>CGV</title></head>
    <body><h1>Conditions générales de vente</h1><p>Prestations, paiement, médiation et droit applicable.</p></body></html>
  `,
  "/demo/mieux-cadre/accessibilite": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Accessibilité</title></head>
    <body><h1>Déclaration d'accessibilité</h1><p>Audit RGAA en cours, page de contact accessible.</p></body></html>
  `,
  "/demo/mieux-cadre/resiliation": `
    <!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Résilier votre contrat</title></head>
    <body><h1>Résilier votre contrat</h1><form><input name="email"><input name="contrat"><button>Confirmer votre résiliation</button></form></body></html>
  `,
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  send(res, statusCode, JSON.stringify(payload, null, 2), MIME_TYPES[".json"]);
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (_error) {
    return null;
  }
}

function stripTags(input) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getAnchorLinks(html, finalUrl) {
  const links = [];
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] || "";
    const text = stripTags(match[2] || "");
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) {
      continue;
    }

    const href = hrefMatch[1].trim();
    let absoluteHref = href;

    try {
      absoluteHref = new URL(href, finalUrl).toString();
    } catch (_error) {
      absoluteHref = href;
    }

    links.push({
      href,
      absoluteHref,
      text,
      haystack: `${text} ${href}`.toLowerCase(),
    });
  }

  return links;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function textMatch(haystack, patterns) {
  return patterns.some((pattern) => haystack.includes(pattern));
}

function findLink(links, patterns) {
  return links.find((link) => textMatch(link.haystack, patterns));
}

function countImagesWithoutAlt(html) {
  const images = html.match(/<img\b[^>]*>/gi) || [];
  let missingAlt = 0;

  for (const image of images) {
    const altMatch = image.match(/\balt\s*=\s*["']([^"']*)["']/i);
    if (!altMatch) {
      missingAlt += 1;
    }
  }

  return { total: images.length, missingAlt };
}

function detectTrackers(htmlLower) {
  const trackers = [
    { label: "Google Analytics / GTM", patterns: ["googletagmanager.com", "gtag(", "google-analytics.com"] },
    { label: "Meta Pixel", patterns: ["connect.facebook.net", "fbq("] },
    { label: "Hotjar", patterns: ["hotjar"] },
    { label: "Microsoft Clarity", patterns: ["clarity.ms", "clarity("] },
    { label: "Matomo", patterns: ["matomo", "_paq.push"] },
  ];

  return trackers
    .filter((tracker) => tracker.patterns.some((pattern) => htmlLower.includes(pattern)))
    .map((tracker) => tracker.label);
}

function detectPhones(rawText) {
  return unique(rawText.match(/(?:(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4})/g) || []);
}

function detectEmails(rawText) {
  return unique(rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []);
}

function detectLang(html) {
  const match = html.match(/<html\b[^>]*\blang\s*=\s*["']?([a-zA-Z-]+)/i);
  return match ? match[1] : "";
}

function detectForms(html) {
  const formCount = (html.match(/<form\b/gi) || []).length;
  const emailInputs = (html.match(/type\s*=\s*["']email["']/gi) || []).length;
  const passwordInputs = (html.match(/type\s*=\s*["']password["']/gi) || []).length;
  return { emailInputs, formCount, passwordInputs };
}

function detectSecurityHeaders(headers) {
  return {
    csp: headers["content-security-policy"] || "",
    hsts: headers["strict-transport-security"] || "",
    referrerPolicy: headers["referrer-policy"] || "",
    xFrameOptions: headers["x-frame-options"] || "",
  };
}

function hostLooksPrivate(targetUrl) {
  const hostname = (targetUrl.hostname || "").toLowerCase();

  if (hostname === "localhost" || hostname === "::1") {
    return true;
  }

  if (/^127\./.test(hostname)) {
    return true;
  }

  if (/^10\./.test(hostname)) {
    return true;
  }

  if (/^192\.168\./.test(hostname)) {
    return true;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) {
    return true;
  }

  return false;
}

function targetAllowed(targetUrl) {
  if (!hostLooksPrivate(targetUrl)) {
    return true;
  }

  const isLocalDemo =
    (targetUrl.hostname === "localhost" || targetUrl.hostname === "127.0.0.1") &&
    Number(targetUrl.port || PORT) === PORT;

  return isLocalDemo;
}

function normalizeTargetUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("Ajoute une URL à scanner.");
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Seules les URLs http et https sont acceptées.");
  }

  if (!targetAllowed(parsed)) {
    throw new Error("Cette URL n'est pas autorisée par le moteur de scan local.");
  }

  return parsed;
}

function getEcommerceSignals(htmlLower) {
  const patterns = ["ajouter au panier", "panier", "checkout", "commander", "livraison", "produit", "paiement"];
  return patterns.filter((pattern) => htmlLower.includes(pattern));
}

function getSubscriptionSignals(htmlLower) {
  const patterns = ["abonnement", "mensuel", "/mois", "sans engagement", "trial", "essai gratuit", "subscribe"];
  return patterns.filter((pattern) => htmlLower.includes(pattern));
}

function getVisibleSnippet(source, snippet) {
  const index = source.indexOf(snippet);
  if (index === -1) {
    return "";
  }

  const start = Math.max(0, index - 40);
  const end = Math.min(source.length, index + snippet.length + 40);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

function buildCheck(category, title, status, detail, recommendation, evidence = "") {
  return { category, detail, evidence, recommendation, status, title };
}

function computeScore(checks) {
  const penalties = { pass: 0, warning: 7, critical: 16 };
  const totalPenalty = checks.reduce((sum, check) => sum + penalties[check.status], 0);
  return Math.max(0, 100 - totalPenalty);
}

function buildSummary(checks) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { critical: 0, pass: 0, warning: 0 }
  );
}

function groupChecks(checks) {
  const grouped = new Map();

  for (const check of checks) {
    if (!grouped.has(check.category)) {
      grouped.set(check.category, []);
    }
    grouped.get(check.category).push(check);
  }

  return [...grouped.entries()].map(([name, items]) => ({
    name,
    items,
  }));
}

function analyzeSite({ fetchMs, finalUrl, headers, html, requestedUrl, statusCode }) {
  const htmlLower = html.toLowerCase();
  const text = stripTags(html);
  const textLower = text.toLowerCase();
  const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(finalUrl);
  const links = getAnchorLinks(html, finalUrl);
  const lang = detectLang(html);
  const forms = detectForms(html);
  const images = countImagesWithoutAlt(html);
  const trackers = detectTrackers(htmlLower);
  const phones = detectPhones(text);
  const emails = detectEmails(text);
  const securityHeaders = detectSecurityHeaders(headers);
  const ecommerceSignals = getEcommerceSignals(htmlLower);
  const subscriptionSignals = getSubscriptionSignals(htmlLower);

  const legalLink = findLink(links, ["mentions légales", "mentions legales", "legal notice", "mentions-legales"]);
  const privacyLink = findLink(links, ["confidentialité", "confidentialite", "privacy", "rgpd", "données personnelles", "donnees personnelles"]);
  const cookiesLink = findLink(links, ["cookies", "cookie policy", "gestion des cookies"]);
  const cgvLink = findLink(links, ["cgv", "conditions générales de vente", "conditions generales de vente", "terms of sale"]);
  const cguLink = findLink(links, ["cgu", "conditions générales d'utilisation", "conditions generales d'utilisation"]);
  const contactLink = findLink(links, ["contact", "nous écrire", "nous ecrire"]);
  const accessibilityLink = findLink(links, ["accessibilité", "accessibilite", "rgaa", "accessibility"]);
  const cancellationLink = findLink(links, ["résilier votre contrat", "resilier votre contrat", "résiliation", "resiliation", "cancel subscription"]);

  const hasCompanyIdentifiers =
    /siret|siren|rcs|tva\s+intracom|num[eé]ro\s+de\s+tva/i.test(text);
  const hasCookieWords = /cookie|cookies|consentement|préférences de confidentialité|preferences de confidentialite/i.test(textLower);
  const hasPrivacyWords = /rgpd|donn[eé]es personnelles|politique de confidentialit[eé]|privacy/i.test(textLower);
  const hasCancellationWords = /r[eé]silier votre contrat|r[eé]siliation|annuler l[' ]abonnement/i.test(textLower);
  const hasMediationWords = /m[eé]diateur|m[ée]diation/i.test(textLower);

  const checks = [];

  checks.push(
    buildCheck(
      "Fondations légales",
      "HTTPS et transport sécurisé",
      isLocalTarget || finalUrl.startsWith("https://") ? "pass" : "critical",
      isLocalTarget
        ? "Contexte local détecté. Le contrôle HTTPS n'est pas pénalisé pour la démo."
        : finalUrl.startsWith("https://")
          ? "Le site répond en HTTPS."
          : "Le site répond sans HTTPS. Pour un site vitrine ou marchand, c'est un signal de risque immédiat.",
      "Forcer HTTPS sur toute la navigation et configurer HSTS.",
      finalUrl
    )
  );

  checks.push(
    buildCheck(
      "Fondations légales",
      "Mentions légales visibles",
      legalLink ? "pass" : "critical",
      legalLink
        ? "Un accès visible aux mentions légales a été détecté."
        : "Aucun lien évident vers les mentions légales n'a été détecté sur la page scannée.",
      "Ajouter une page de mentions légales accessible depuis le footer ou la navigation principale.",
      legalLink ? `${legalLink.text} -> ${legalLink.absoluteHref}` : ""
    )
  );

  checks.push(
    buildCheck(
      "Fondations légales",
      "Identifiants société détectés",
      hasCompanyIdentifiers ? "pass" : "warning",
      hasCompanyIdentifiers
        ? "Des signaux SIRET, SIREN, RCS ou TVA intracom sont visibles dans le contenu."
        : "Aucun identifiant société évident n'a été détecté sur la page scannée.",
      "Vérifier que la page de mentions légales expose bien SIREN/SIRET, RCS, TVA et hébergeur si nécessaire."
    )
  );

  checks.push(
    buildCheck(
      "Données & cookies",
      "Politique de confidentialité",
      privacyLink || hasPrivacyWords ? "pass" : forms.formCount > 0 ? "critical" : "warning",
      privacyLink || hasPrivacyWords
        ? "Une politique de confidentialité ou un contenu RGPD a été repéré."
        : "Aucune page de confidentialité claire n'a été détectée alors que la page semble collecter des données.",
      "Ajouter une politique de confidentialité détaillant finalités, base légale, durée de conservation et droits RGPD.",
      privacyLink ? `${privacyLink.text} -> ${privacyLink.absoluteHref}` : ""
    )
  );

  checks.push(
    buildCheck(
      "Données & cookies",
      "Cookies et traceurs",
      trackers.length > 0 && !hasCookieWords && !cookiesLink ? "critical" : hasCookieWords || cookiesLink ? "pass" : "warning",
      trackers.length > 0 && !hasCookieWords && !cookiesLink
        ? `Des traceurs ont été détectés (${trackers.join(", ")}) sans signal clair de gestion des cookies.`
        : hasCookieWords || cookiesLink
          ? "Un contenu ou une page liée aux cookies a été repéré."
          : "Aucun wording clair sur les cookies n'a été détecté. À confirmer selon les scripts réellement déposés.",
      "Afficher un module de consentement et une page cookies si des traceurs non essentiels sont utilisés.",
      trackers.join(", ")
    )
  );

  checks.push(
    buildCheck(
      "Relation client",
      "Contact exploitable",
      emails.length > 0 || phones.length > 0 || contactLink ? "pass" : "warning",
      emails.length > 0 || phones.length > 0 || contactLink
        ? "Un moyen de contact exploitable a été détecté."
        : "Aucun email, téléphone ou lien contact évident n'a été détecté sur la page scannée.",
      "Ajouter un email, un téléphone ou une page contact accessible depuis le footer.",
      [...emails.slice(0, 1), ...phones.slice(0, 1)].join(" | ")
    )
  );

  checks.push(
    buildCheck(
      "Vente & abonnements",
      "CGV / CGU pour parcours commercial",
      ecommerceSignals.length > 0 && !(cgvLink || cguLink) ? "critical" : cgvLink || cguLink ? "pass" : "warning",
      ecommerceSignals.length > 0 && !(cgvLink || cguLink)
        ? "Des signaux de vente ou de commande ont été détectés sans lien évident vers CGV ou CGU."
        : cgvLink || cguLink
          ? "Un lien vers des CGV ou CGU a été détecté."
          : "Aucun lien CGV ou CGU n'a été détecté sur cette page. Ce point dépend du modèle commercial réel.",
      "Ajouter les CGV pour toute activité de vente ou d'abonnement, et les rendre accessibles avant conversion.",
      cgvLink ? `${cgvLink.text} -> ${cgvLink.absoluteHref}` : cguLink ? `${cguLink.text} -> ${cguLink.absoluteHref}` : ecommerceSignals.join(", ")
    )
  );

  checks.push(
    buildCheck(
      "Vente & abonnements",
      "Résiliation d’abonnement",
      subscriptionSignals.length > 0 && !(cancellationLink || hasCancellationWords) ? "critical" : cancellationLink || hasCancellationWords ? "pass" : "warning",
      subscriptionSignals.length > 0 && !(cancellationLink || hasCancellationWords)
        ? "Le site semble vendre un abonnement ou une offre mensuelle sans parcours visible de résiliation."
        : cancellationLink || hasCancellationWords
          ? "Un wording de résiliation ou un lien de désabonnement a été détecté."
          : "Aucun signal de résiliation détecté. À vérifier si le site vend réellement des contrats d'abonnement.",
      "Prévoir un accès direct à “Résilier votre contrat” si des contrats peuvent être conclus en ligne.",
      cancellationLink ? `${cancellationLink.text} -> ${cancellationLink.absoluteHref}` : subscriptionSignals.join(", ")
    )
  );

  checks.push(
    buildCheck(
      "Vente & abonnements",
      "Médiation consommation",
      hasMediationWords ? "pass" : ecommerceSignals.length > 0 || subscriptionSignals.length > 0 ? "warning" : "warning",
      hasMediationWords
        ? "Un signal de médiation ou médiateur a été détecté."
        : "Aucun signal de médiation consommation n'a été détecté sur la page scannée.",
      "Si vous vendez à des consommateurs, vérifier la mention du médiateur compétent dans vos CGV."
    )
  );

  checks.push(
    buildCheck(
      "Accessibilité & confiance",
      "Langue du document",
      lang ? "pass" : "warning",
      lang ? `La balise lang="${lang}" est présente.` : "Aucune langue document n'a été détectée sur la balise html.",
      "Ajouter l'attribut lang sur la balise html pour améliorer accessibilité et parsing."
    )
  );

  checks.push(
    buildCheck(
      "Accessibilité & confiance",
      "Images sans texte alternatif",
      images.total === 0 || images.missingAlt === 0 ? "pass" : "warning",
      images.total === 0 || images.missingAlt === 0
        ? "Aucune image sans alt n'a été détectée sur la page scannée."
        : `${images.missingAlt} image(s) semblent sans attribut alt.`,
      "Ajouter des alt pertinents sur les images informatives.",
      `${images.missingAlt}/${images.total}`
    )
  );

  checks.push(
    buildCheck(
      "Accessibilité & confiance",
      "Déclaration d’accessibilité",
      accessibilityLink ? "pass" : "warning",
      accessibilityLink
        ? "Une page accessibilité ou RGAA a été détectée."
        : "Aucune page accessibilité détectée. Ce point devient plus sensible pour certains services et entreprises concernées.",
      "Si votre activité entre dans le champ réglementaire, publier une page d'accessibilité et un contact de recours.",
      accessibilityLink ? `${accessibilityLink.text} -> ${accessibilityLink.absoluteHref}` : ""
    )
  );

  checks.push(
    buildCheck(
      "Sécurité technique",
      "En-têtes de sécurité visibles",
      securityHeaders.csp || securityHeaders.hsts || securityHeaders.xFrameOptions ? "pass" : "warning",
      securityHeaders.csp || securityHeaders.hsts || securityHeaders.xFrameOptions
        ? "Au moins un en-tête de sécurité structurant a été détecté."
        : "Aucun CSP, HSTS ou X-Frame-Options visible sur la réponse analysée.",
      "Ajouter au minimum CSP, HSTS, Referrer-Policy et X-Frame-Options sur la couche HTTP.",
      [securityHeaders.csp ? "CSP" : "", securityHeaders.hsts ? "HSTS" : "", securityHeaders.xFrameOptions ? "XFO" : ""].filter(Boolean).join(" | ")
    )
  );

  const score = computeScore(checks);
  const summary = buildSummary(checks);

  return {
    categories: groupChecks(checks),
    checks,
    fetchedAt: new Date().toISOString(),
    fetchMs,
    finalUrl,
    inputUrl: requestedUrl,
    meta: {
      ecommerceSignals,
      emails,
      forms,
      images,
      phones,
      statusCode,
      subscriptionSignals,
      trackers,
    },
    score,
    sources: SOURCE_LINKS,
    summary,
    topSignals: {
      companyIdentifiersDetected: hasCompanyIdentifiers,
      trackersDetected: trackers.length,
      visibleContactPoints: emails.length + phones.length,
    },
  };
}

async function fetchTargetPage(targetUrl) {
  const startedAt = Date.now();
  const response = await fetch(targetUrl.toString(), {
    headers: {
      "User-Agent": "SiteCheckLegal/1.0 (+local-audit)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });

  const html = await response.text();
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    fetchMs: Date.now() - startedAt,
    finalUrl: response.url,
    headers,
    html,
    statusCode: response.status,
  };
}

async function parseRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function serveStaticAsset(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const normalizedPath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!absolutePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden");
    return;
  }

  const asset = safeRead(absolutePath);
  if (!asset) {
    send(res, 404, "Not found");
    return;
  }

  const extension = path.extname(absolutePath);
  send(res, 200, asset, MIME_TYPES[extension] || "application/octet-stream");
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && DEMO_PAGES[req.url]) {
      send(res, 200, DEMO_PAGES[req.url], MIME_TYPES[".html"]);
      return;
    }

    if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/app.js") || req.url.startsWith("/styles.css"))) {
      serveStaticAsset(req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/api/scan") {
      const body = await parseRequestBody(req);
      const targetUrl = normalizeTargetUrl(body.url);
      const scanned = await fetchTargetPage(targetUrl);
      const report = analyzeSite({
        ...scanned,
        requestedUrl: targetUrl.toString(),
      });

      sendJson(res, 200, report);
      return;
    }

    if (req.method === "GET") {
      serveStaticAsset(req, res);
      return;
    }

    send(res, 405, "Method not allowed");
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    sendJson(res, statusCode, {
      error: error.message || "Une erreur est survenue pendant le scan.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`SiteCheck Legal disponible sur http://localhost:${PORT}`);
});
