// Viaggi in Pullman · La Terra — primi passi della pagina.
// Raccoglie gli errori che capitano prima che parta l'app (li legge poi la diagnostica) e registra il
// service worker, che fa funzionare l'app anche senza internet.
// Sta in un file a parte, e non dentro index.html, perché la protezione CSP di index.html blocca
// qualsiasi codice scritto direttamente nella pagina.
(function () {
  "use strict";
  window.__earlyErr = [];
  window.addEventListener("error", function (e) {
    if (!window.__diagOn) window.__earlyErr.push({ m: e.message || "risorsa non caricata", file: e.filename || (e.target && (e.target.src || e.target.href)) || "", riga: e.lineno || 0 });
  }, true);
  document.addEventListener("securitypolicyviolation", function (e) {
    if (!window.__diagOn) window.__earlyErr.push({ m: "Bloccato dalla protezione CSP: " + (e.effectiveDirective || e.violatedDirective || ""), file: e.blockedURI || "", riga: e.lineNumber || 0 });
  });
  window.addEventListener("load", function () {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
  });
})();
