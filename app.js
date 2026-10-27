(function () {
  'use strict';
  const VERSION = '1.3';
  const LOGO = './logo.jpg';
  const KEY = 'laterra.prenotazioniPosti.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  const COLORS = ['#FFD3DC', '#CFE6FF', '#D8F1C2', '#FFE7AE', '#E6D6FA', '#C8EFE7', '#FFD9BF', '#F1EDA9', '#D7DCE8', '#F7CDEB', '#C6E6D1', '#FADDCB'];
  const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const MESI_L = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const DATA_VER = 1;

  const I = (d, extra = '') => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;
  const ICON = {
    bus: I('<path d="M5 17V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v11H5zM5 11h14M7 17v2.5M17 17v2.5M8 14h.01M16 14h.01"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    print: I('<path d="M7 9V3h10v6M7 17H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-3M7 14h10v7H7z"/>'),
    wa: I('<path d="M4 20l1.4-4A8 8 0 1 1 8.2 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>'),
    gear: I('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    upload: I('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    wand: I('<path d="M4 20L16 8M14 6l4 4M19 2v4M17 4h4M20 11v2M19 12h2"/>'),
    cards: I('<path d="M5 3h14v18H5zM5 9h14M5 15h14"/>'),
    trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    edit: I('<path d="M4 20h4L18 10l-4-4L4 16z"/>'),
    link: I('<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'),
    users: I('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-3.5-5.4"/>'),
    erase: I('<path d="M4 20h16M7 16l-3-3 9-9 7 7-6 6H8z"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    list: I('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
    dock: I('<path d="M3 4h18v16H3zM14 4v16"/>'),
    grip: I('<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke-width="3"/>'),
    euro: I('<path d="M17 6.5A6 6 0 1 0 17 17.5M4 10h9M4 14h9"/>'),
    pin: I('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    cash: I('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>'),
    chart: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    tool: I('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),
    out: I('<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>')
  };

  // ---------- piantine ----------
  const LMAP = {};
  function cellInfo(c) {
    if (c === 0) return { t: 'aisle', c: 1 };
    if (c === null || c === undefined) return { t: 'void', c: 1 };
    if (typeof c === 'number') return { t: 'seat', s: c, c: 1 };
    if (typeof c === 'string') return c === 'logo' ? { t: 'logo', c: 1 } : { t: 'feat', f: c, c: 1 };
    if (c.h) return { t: 'seat', s: c.h, h: true, c: c.c || 1 };
    if (c.s) return { t: 'seat', s: c.s, c: c.c || 1 };
    return { t: 'feat', f: c.f, c: c.c || 1 };
  }
  // Geometria dei posti: per ogni posto lato (sx/dx), numero di fila contato sul suo lato dal davanti,
  // finestrino/corridoio, ultima fila, posti vicino alla seconda porta.
  function analyze(L) {
    const all = [], host = new Set(), pair = {}, geo = {}, porta2 = new Set(), uscita = new Set();
    L.floors.forEach((fl, fi) => {
      let fL = 0, fR = 0, rowN = 0;
      const rows = fl.rows.map(row => { let col = 0; return row.map(c => { const ci = cellInfo(c); ci.col = col; col += ci.c; return ci; }); });
      rows.forEach(cells => {
        const at = {};
        const seats = cells.filter(x => x.t === 'seat');
        seats.forEach(x => { all.push(x.s); if (x.h) host.add(x.s); if (x.c === 1) at[x.col] = x; });
        [[0, 1], [3, 4]].forEach(([a, b]) => { if (at[a] && at[b] && !at[a].h && !at[b].h) { pair[at[a].s] = at[b].s; pair[at[b].s] = at[a].s; } });
        if (!seats.length) return;
        rowN++;
        const end = x => x.col + x.c - 1;
        if (seats.some(x => !x.h && end(x) <= 1)) fL++;
        if (seats.some(x => !x.h && x.col >= 3)) fR++;
        seats.forEach(x => {
          const side = x.col >= 3 ? 'dx' : end(x) <= 1 ? 'sx' : 'c';
          geo[x.s] = { floor: fi, row: rowN, side, fila: side === 'sx' ? fL : side === 'dx' ? fR : Math.max(fL, fR), col: x.col, win: x.col === 0 || end(x) === 4, aisle: x.col === 1 || x.col === 2 || x.col === 3, host: !!x.h };
        });
      });
      // seconda porta: la coppia di destra subito dopo l'uscita centrale (o subito prima, se dopo non c'è niente)
      rows.forEach((cells, ri) => {
        if (ri === 0 || !cells.some(x => x.t === 'feat' && x.f === 'uscita' && x.col + x.c - 1 >= 3)) return;
        const rightSeats = r => (rows[r] || []).filter(x => x.t === 'seat' && !x.h && x.col >= 3).map(x => x.s);
        let found = [];
        for (let r = ri + 1; r < rows.length && !found.length; r++) found = rightSeats(r);
        if (!found.length) for (let r = ri - 1; r > 0 && !found.length; r--) found = rightSeats(r);
        found.forEach(s => porta2.add(s));
        // «vicino uscita»: anche i posti sulla stessa fila della porta
        cells.filter(x => x.t === 'seat' && !x.h).forEach(x => uscita.add(x.s));
        found.forEach(s => uscita.add(s));
      });
    });
    all.sort((a, b) => a - b);
    const order = all.filter(s => !host.has(s));
    const maxS = order[order.length - 1]; const lastRow = geo[maxS];
    const last = new Set(order.filter(s => geo[s].floor === lastRow.floor && geo[s].row === lastRow.row));
    // file contate dal fondo (ultima = 1, penultima = 2…) sul piano dove c'è l'ultima fila
    const rowsLast = [...new Set(order.filter(s => geo[s].floor === lastRow.floor).map(s => geo[s].row))].sort((a, c) => c - a);
    order.forEach(s => { const g = geo[s]; g.back = g.floor === lastRow.floor ? rowsLast.indexOf(g.row) + 1 : 0; });
    const rank = {}; order.forEach((s, i) => { rank[s] = i; });
    const bySide = side => order.filter(s => geo[s].side === side || (side === 'sx' && geo[s].side === 'c')).sort((a, b) => geo[a].floor - geo[b].floor || geo[a].row - geo[b].row || a - b);
    return { all, order, host, pair, geo, porta2, uscita, last, rank, sideOrders: [bySide('sx'), bySide('dx')], cap: all.length - host.size };
  }
  window.LAYOUTS.forEach(L => { L.info = analyze(L); LMAP[L.id] = L; });

  // ---------- diagnostica completa (per il Super Master) ----------
  // Ogni computer annota TUTTO quello che succede nell'app: avvio, accessi, pagine aperte, pulsanti premuti,
  // campi modificati (solo QUALE campo, mai il contenuto), salvataggi, sincronizzazione con Dropbox
  // (richieste, errori, conflitti), avvisi mostrati, errori del programma, rallentamenti, rete persa e ritrovata.
  // Gli eventi restano 21 giorni su questo computer (IndexedDB) e ogni 10 minuti vengono copiati su Dropbox in
  // /diagnostica/aaaa-mm/aaaa-mm-gg_<computer>.log (file che l'app non scarica sugli altri computer).
  // Il Super Master scarica uno zip con gli eventi di tutti i computer, il registro e lo stato dell'app.
  // Non si annotano mai: password, contenuto dei campi, chiavi di Dropbox o di WhatsApp.
  const DIAG = (() => {
    const DBN = 'viaggi-laterra-diag', MAX = 80000, KEEP_DAYS = 21, UPK = 'vip-diag-up-v1';
    const SID = Date.now().toString(36) + Math.random().toString(36).slice(2, 5); // questa apertura dell'app
    let db = null, q = [], seq = 0, flushT = null, ctxFn = () => ({}), dev = '', lastUp = 0, newSinceUp = 0, upBusy = false;
    const ring = [];
    const dayOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cut = (s, n = 300) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) + '…' : s; };
    function clean(x, depth = 0) {
      if (x == null || typeof x === 'number' || typeof x === 'boolean') return x;
      if (typeof x === 'string') return cut(x);
      if (depth > 3) return '…';
      if (Array.isArray(x)) return x.slice(0, 25).map(v => clean(v, depth + 1));
      if (typeof x === 'object') { const o = {}; Object.keys(x).slice(0, 30).forEach(k => { if (/pass|pw|token|secret|hash|salt|key/i.test(k)) return; o[k] = clean(x[k], depth + 1); }); return o; }
      return cut(x);
    }
    function ev(k, m, x) {
      try {
        const d = new Date(); let c = {}; try { c = ctxFn() || {}; } catch (e) { /* niente */ }
        const r = { t: d.toISOString(), d: dayOf(d), s: SID, n: ++seq, k, m: cut(m, 500) };
        if (x !== undefined) r.x = clean(x);
        if (c.u) r.u = c.u; if (c.ag) r.ag = c.ag; if (c.v) r.v = c.v;
        q.push(r); ring.push(r); if (ring.length > 400) ring.shift(); newSinceUp++;
        if (!flushT) flushT = setTimeout(flush, 1500);
      } catch (e) { /* la diagnostica non deve mai fermare il lavoro */ }
    }
    function idb() {
      return new Promise((res) => {
        try {
          const r = indexedDB.open(DBN, 1);
          r.onupgradeneeded = () => { const s = r.result.createObjectStore('ev', { autoIncrement: true }); s.createIndex('d', 'd'); };
          r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null);
        } catch (e) { res(null); }
      });
    }
    async function flush() {
      flushT = null; if (!q.length) return; if (!db) return; const batch = q; q = [];
      try { await new Promise((res, rej) => { const t = db.transaction('ev', 'readwrite'); const s = t.objectStore('ev'); batch.forEach(r => s.add(r)); t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); }
      catch (e) { q = batch.concat(q).slice(-5000); }
    }
    async function prune() {
      if (!db) return; const old = dayOf(new Date(Date.now() - KEEP_DAYS * 864e5));
      try {
        await new Promise((res) => { const t = db.transaction('ev', 'readwrite'); const ix = t.objectStore('ev').index('d'); ix.openCursor(IDBKeyRange.upperBound(old, true)).onsuccess = e => { const c = e.target.result; if (c) { c.delete(); c.continue(); } }; t.oncomplete = res; t.onerror = res; });
        const n = await new Promise(res => { const t = db.transaction('ev', 'readonly'); const r = t.objectStore('ev').count(); r.onsuccess = () => res(r.result); r.onerror = () => res(0); });
        if (n > MAX) { let del = n - MAX; await new Promise((res) => { const t = db.transaction('ev', 'readwrite'); t.objectStore('ev').openCursor().onsuccess = e => { const c = e.target.result; if (c && del-- > 0) { c.delete(); c.continue(); } }; t.oncomplete = res; t.onerror = res; }); }
      } catch (e) { /* niente */ }
    }
    async function read(fromDay, toDay) {
      await flush(); if (!db) return ring.filter(r => r.d >= fromDay && r.d <= toDay);
      return new Promise(res => { try { const t = db.transaction('ev', 'readonly'); const r = t.objectStore('ev').index('d').getAll(IDBKeyRange.bound(fromDay, toDay)); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); } catch (e) { res([]); } });
    }

    // ---- statistiche delle richieste in rete (le riuscite si contano, gli errori e le lente si annotano una per una) ----
    const http = {}; let httpSince = Date.now();
    function httpNote(key, ok, ms) { const h = http[key] = http[key] || { n: 0, err: 0, ms: 0, max: 0 }; h.n++; if (!ok) h.err++; h.ms += ms; h.max = Math.max(h.max, ms); }
    function httpSummary() {
      const keys = Object.keys(http); if (!keys.length) return;
      ev('rete', `Richieste negli ultimi ${Math.round((Date.now() - httpSince) / 60000)} minuti`, Object.fromEntries(keys.map(k => [k, { n: http[k].n, errori: http[k].err, media_ms: Math.round(http[k].ms / http[k].n), max_ms: Math.round(http[k].max) }])));
      keys.forEach(k => delete http[k]); httpSince = Date.now();
    }
    function hookFetch() {
      const of = window.fetch; if (!of || of.__diag) return;
      const nf = async function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        let u; try { u = new URL(url, location.href); } catch (e) { return of.apply(this, arguments); }
        if (u.origin === location.origin) return of.apply(this, arguments);
        const hd = (init && init.headers) || {}; let arg = ''; try { arg = hd['Dropbox-API-Arg'] || (hd.get && hd.get('Dropbox-API-Arg')) || ''; } catch (e) { arg = ''; }
        let fpath = ''; try { fpath = arg ? JSON.parse(arg).path || '' : ''; } catch (e) { fpath = ''; }
        if (/^\/diagnostica\//.test(fpath)) return of.apply(this, arguments);
        const ep = u.host.replace(/\.(dropboxapi|facebook)\.com$/, '') + u.pathname.replace(/\/v\d+(\.\d+)?\//, '/').replace(/\/\d{6,}\//g, '/<id>/');
        const t0 = performance.now(); const lp = /longpoll/.test(u.pathname);
        try {
          const r = await of.apply(this, arguments); const ms = performance.now() - t0;
          httpNote(ep, r.ok, ms);
          if (!r.ok) ev('rete-errore', `${(init && init.method) || 'GET'} ${ep} → ${r.status}`, { file: fpath, ms: Math.round(ms), retryAfter: r.headers.get('Retry-After') || undefined });
          else if (ms > 8000 && !lp) ev('rete-lenta', `${ep} ${Math.round(ms)} ms`, { file: fpath });
          return r;
        } catch (e) {
          const ms = performance.now() - t0; httpNote(ep, false, ms);
          ev('rete-errore', `${(init && init.method) || 'GET'} ${ep} → ${e && e.name === 'AbortError' ? 'tempo scaduto' : 'nessuna risposta'}`, { file: fpath, ms: Math.round(ms), err: e && (e.name + ': ' + e.message) });
          throw e;
        }
      };
      nf.__diag = true; window.fetch = nf;
    }

    // ---- errori del programma, avvisi in console, rallentamenti, rete, finestra ----
    function hookErrors() {
      window.__diagOn = true;
      (window.__earlyErr || []).forEach(e => ev('errore', 'Prima dell\'avvio: ' + e.m + (e.file ? ' · ' + e.file : ''), e)); window.__earlyErr = [];
      window.addEventListener('error', e => { if (e.target && e.target !== window && (e.target.src || e.target.href)) { ev('errore', 'Risorsa non caricata: ' + cut(e.target.src || e.target.href, 200)); return; } ev('errore', e.message || 'Errore', { file: e.filename, riga: e.lineno, col: e.colno, stack: e.error && e.error.stack ? cut(e.error.stack, 1500) : '' }); }, true);
      window.addEventListener('unhandledrejection', e => { const r = e.reason || {}; ev('errore', 'Operazione non riuscita: ' + cut(r.message || r.code || r.summary || String(r), 300), { code: r.code, status: r.status, summary: r.summary ? cut(r.summary, 400) : undefined, stack: r.stack ? cut(r.stack, 1500) : undefined }); });
      ['error', 'warn'].forEach(lv => { const o = console[lv]; console[lv] = function () { try { ev('console-' + lv, Array.from(arguments).map(a => a && a.stack ? a.stack : typeof a === 'object' ? JSON.stringify(clean(a)) : String(a)).join(' ')); } catch (e) { /* niente */ } return o.apply(console, arguments); }; });
      window.addEventListener('online', () => ev('rete', 'Internet tornato'));
      window.addEventListener('offline', () => ev('rete', 'Internet assente'));
      document.addEventListener('visibilitychange', () => { ev('finestra', document.hidden ? 'App nascosta (altra finestra o schermo spento)' : 'App di nuovo in primo piano'); if (document.hidden) flush(); });
      window.addEventListener('pagehide', () => { ev('finestra', 'App chiusa o ricaricata'); flush(); });
      try { new PerformanceObserver(l => l.getEntries().forEach(en => { if (en.duration > 400) ev('lento', `Il programma si è bloccato per ${Math.round(en.duration)} ms`, { vista: (ctxFn() || {}).v }); })).observe({ type: 'longtask', buffered: true }); } catch (e) { /* non disponibile */ }
      if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('controllerchange', () => ev('avvio', 'Installata una nuova versione dell\'app (service worker)'));
    }
    // ---- cosa fa l'operatore: pulsanti, campi modificati (mai il testo), moduli ----
    function hookUser() {
      document.addEventListener('click', e => {
        const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return;
        const d = el.dataset; const x = {}; ['id', 'v', 'k', 'trip', 'bus', 'sec', 'i'].forEach(k => { if (d[k] != null) x[k] = d[k]; });
        ev('azione', d.act + (el.textContent ? ' · ' + cut(el.textContent.replace(/\s+/g, ' ').trim(), 60) : ''), Object.keys(x).length ? x : undefined);
      }, true);
      document.addEventListener('change', e => {
        const el = e.target; if (!el || !el.dataset) return; if (el.type === 'password') return;
        const keys = Object.entries(el.dataset).map(([k, v]) => `${k}=${cut(v, 30)}`).join(' ');
        const x = { campo: keys || el.id || el.name || el.tagName.toLowerCase(), tipo: el.type || el.tagName.toLowerCase() };
        if (el.type === 'checkbox' || el.type === 'radio') x.valore = el.checked; else if (el.tagName === 'SELECT' || el.type === 'date' || el.type === 'month') x.valore = el.value; else x.lunghezza = String(el.value || '').length;
        if (el.type === 'file') x.file = Array.from(el.files || []).map(f => `${f.name} (${Math.round(f.size / 1024)} KB)`);
        ev('campo', 'Modificato ' + x.campo, x);
      }, true);
      document.addEventListener('submit', e => { const f = e.target; ev('modulo', 'Inviato il modulo ' + (f.dataset.f || f.id || f.name || ''), { campi: Array.from(f.elements || []).filter(x => x.name && x.type !== 'password').map(x => x.name) }); }, true);
      document.addEventListener('drop', e => { const t = e.target.closest && e.target.closest('[data-seat],[data-droplist],[data-droptrip]'); ev('trascina', 'Rilasciato su ' + (t ? Object.entries(t.dataset).map(([k, v]) => `${k}=${v}`).join(' ') : 'pagina'), { files: Array.from((e.dataTransfer && e.dataTransfer.files) || []).map(f => `${f.name} (${Math.round(f.size / 1024)} KB)`) }); }, true);
    }
    async function bootInfo() {
      const n = navigator; const x = {
        versione: typeof VERSION !== 'undefined' ? VERSION : '', indirizzo: location.origin + location.pathname, browser: n.userAgent, sistema: n.platform, lingua: n.language,
        fuso: Intl.DateTimeFormat().resolvedOptions().timeZone, schermo: `${screen.width}x${screen.height} @${window.devicePixelRatio}`, finestra: `${innerWidth}x${innerHeight}`,
        installata: matchMedia('(display-mode: standalone)').matches, online: n.onLine, cpu: n.hardwareConcurrency, memoriaGB: n.deviceMemory,
        connessione: n.connection ? `${n.connection.effectiveType || ''} ${n.connection.downlink || ''}Mb/s` : '', serviceWorker: !!(n.serviceWorker && n.serviceWorker.controller), webcodecs: typeof window.VideoEncoder === 'function'
      };
      try { if (n.storage && n.storage.estimate) { const s = await n.storage.estimate(); x.spazioUsatoMB = Math.round((s.usage || 0) / 1048576); x.spazioMB = Math.round((s.quota || 0) / 1048576); } } catch (e) { /* niente */ }
      try { if (n.storage && n.storage.persisted) x.archivioPersistente = await n.storage.persisted(); } catch (e) { /* niente */ }
      ev('avvio', 'App aperta', x);
    }
    // ---- copia su Dropbox (ogni 10 minuti se ci sono eventi nuovi) ----
    async function upload(force) {
      const D = window.VIPDBX; if (upBusy || !dev || !D || !D.isLinked() || !navigator.onLine) return;
      if (!force && (!newSinceUp || Date.now() - lastUp < 10 * 60000)) return;
      upBusy = true;
      try {
        await flush(); const done = (() => { try { return JSON.parse(localStorage.getItem(UPK) || '{}'); } catch (e) { return {}; } })();
        const today = dayOf(new Date()); const days = [today];
        for (let i = 1; i <= 3; i++) { const d = dayOf(new Date(Date.now() - i * 864e5)); if (!done[d]) days.push(d); }
        for (const d of days) {
          const evs = await read(d, d); if (!evs.length) { if (d !== today) done[d] = 1; continue; }
          const body = new TextEncoder().encode(evs.map(r => JSON.stringify(Object.assign({ c: dev }, r))).join('\n') + '\n');
          await D.upload(`/diagnostica/${d.slice(0, 7)}/${d}_${dev}.log`, body, 'overwrite');
          if (d !== today) done[d] = 1;
        }
        Object.keys(done).forEach(k => { if (k < dayOf(new Date(Date.now() - 10 * 864e5))) delete done[k]; });
        try { localStorage.setItem(UPK, JSON.stringify(done)); } catch (e) { /* niente */ }
        lastUp = Date.now(); newSinceUp = 0;
      } catch (e) { ev('diagnostica', 'Copia della diagnostica su Dropbox non riuscita: ' + (e && (e.code || e.message)), { status: e && e.status }); }
      finally { upBusy = false; }
    }
    async function start() {
      db = await idb(); hookFetch(); hookErrors(); hookUser(); await prune(); bootInfo(); flush();
      setInterval(() => { httpSummary(); upload(false); }, 5 * 60000);
      setInterval(prune, 6 * 3600000);
    }
    return {
      ev, start, read, flush, upload, ring, SID,
      set ctx(f) { ctxFn = f; }, set dev(v) { dev = v; }, get dev() { return dev; },
      async remote(fromDay, toDay, skipDev) {
        const D = window.VIPDBX; if (!D || !D.isLinked()) return { files: [], err: 'Dropbox non collegato' };
        const out = []; let res;
        try { res = await D.listFolder('/diagnostica'); } catch (e) { return { files: [], err: 'Elenco non riuscito: ' + (e.code || e.message) }; }
        const entries = [];
        while (res) { entries.push(...(res.entries || [])); if (!res.has_more) break; res = await D.listFolder(null, res.cursor); }
        for (const en of entries) {
          const m = /\/(\d{4}-\d{2}-\d{2})_([^/]+)\.log$/.exec(en.path_lower || ''); if (en['.tag'] !== 'file' || !m) continue;
          if (m[1] < fromDay || m[1] > toDay || m[2] === skipDev) continue;
          try { const r = await D.download(en.path_lower); if (r) out.push({ name: en.name || en.path_lower.split('/').pop(), day: m[1], dev: m[2], text: new TextDecoder().decode(r.buf) }); } catch (e) { out.push({ name: en.name || en.path_lower.split('/').pop(), day: m[1], dev: m[2], text: '', err: e.code || e.message }); }
        }
        return { files: out };
      }
    };
  })();

  // ---------- stato ----------
  // S si costruisce dai file dell'archivio (STORE): un viaggio per file, più impostazioni, utenti e anagrafica.
  let S = null;
  const UI = { year: null, cat: 'tutte', hidePast: false, hq: '', view: 'home', tripId: null, busId: null, sec: 'lista', sel: null, selP: null, move: null, filter: 'prossime', modal: null, cartOrder: 'posto', dock: true, onlyFree: false };
  const P = { trip: id => `/viaggi/${id}.json`, users: '/config/utenti.json', cfg: '/config/impostazioni.json', clients: '/anagrafica/clienti.json' };
  const AGENZIE_DEF = [{ id: 'rg', nome: 'Ragusa', cassa: 'Cassa Ragusa', indirizzo: '' }, { id: 'md', nome: 'Modica', cassa: 'Cassa Modica', indirizzo: '' }, { id: 'mr', nome: 'Marina di Ragusa', cassa: 'Cassa Marina di Ragusa', indirizzo: '' }];
  const DEF_CFG = () => ({ u: 0, agenzie: JSON.parse(JSON.stringify(AGENZIE_DEF)), luoghi: [], waTemplate: '', postoUrl: '', telAgenzia: '', seeded: [] });
  // Viaggi del 2027 presi da «Elenco_2027_49.xlsm» (foglio Elenco), eventi e concerti compresi
  const SEED_2027 = [{"code": "", "cat": "tour", "extra": true, "nome": "Mercatini Basilicata", "data": "2027-01-03", "fine": "2027-01-06", "hotel": "Forliano"}, {"code": "", "cat": "gita", "extra": true, "nome": "Outlet Centro Sicilia", "data": "2027-01-10", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Savoca e Forza d’Agrò", "data": "2027-01-17", "fine": "", "hotel": ""}, {"code": "G01", "cat": "gita", "extra": false, "nome": "Etna e Acireale", "data": "2027-01-24", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Etna e Acireale", "data": "2027-01-31", "fine": "", "hotel": ""}, {"code": "G02", "cat": "gita", "extra": false, "nome": "Acireale Carnevale", "data": "2027-01-31", "fine": "", "hotel": ""}, {"code": "T01", "cat": "tour", "extra": false, "nome": "Carnevale Termini Imerese", "data": "2027-02-06", "fine": "2027-02-07", "hotel": "Ibis Styles"}, {"code": "G03", "cat": "gita", "extra": false, "nome": "Misterbianco Carnevale", "data": "2027-02-07", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Etna e Acireale", "data": "2027-02-07", "fine": "", "hotel": ""}, {"code": "G04", "cat": "gita", "extra": false, "nome": "Chiaramonte Carnevale", "data": "2027-02-08", "fine": "", "hotel": ""}, {"code": "G05", "cat": "gita", "extra": false, "nome": "Etna e Catania", "data": "2027-02-14", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Etna e Catania", "data": "2027-02-21", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Etna e Catania", "data": "2027-02-28", "fine": "", "hotel": ""}, {"code": "G06", "cat": "gita", "extra": false, "nome": "Villa del Casale e Aidone", "data": "2027-03-07", "fine": "", "hotel": ""}, {"code": "T02", "cat": "tour", "extra": false, "nome": "Palermo Florio", "data": "2027-03-12", "fine": "2027-03-14", "hotel": "Ibis Styles"}, {"code": "T03", "cat": "tour", "extra": false, "nome": "Gangi e Madonie", "data": "2027-03-20", "fine": "2027-03-21", "hotel": "Perla di Engio"}, {"code": "T04", "cat": "tour", "extra": false, "nome": "Cefalù e Fiumara d’Arte", "data": "2027-03-29", "fine": "2027-03-30", "hotel": "Le Sabbie D'Oro"}, {"code": "G07", "cat": "gita", "extra": false, "nome": "Vizzini e Militello", "data": "2027-03-29", "fine": "", "hotel": ""}, {"code": "G08", "cat": "gita", "extra": false, "nome": "San Biagio Platani", "data": "2027-04-04", "fine": "", "hotel": ""}, {"code": "G09", "cat": "gita", "extra": false, "nome": "Montalbano e Argimusco", "data": "2027-04-11", "fine": "", "hotel": ""}, {"code": "G10", "cat": "gita", "extra": false, "nome": "Castello Nelson e Adrano", "data": "2027-04-18", "fine": "", "hotel": ""}, {"code": "T05", "cat": "tour", "extra": false, "nome": "i dintorni di Milazzo", "data": "2027-04-24", "fine": "2027-04-25", "hotel": "Milazzo"}, {"code": "G11", "cat": "gita", "extra": false, "nome": "Cerda e Villarosa", "data": "2027-04-25", "fine": "", "hotel": ""}, {"code": "E01", "cat": "evento", "extra": false, "nome": "La Vedova Allegra a Catania", "data": "2027-04-25", "fine": "", "hotel": ""}, {"code": "T06", "cat": "tour", "extra": false, "nome": "Calabria Gelsomini", "data": "2027-04-30", "fine": "2027-05-02", "hotel": "Kennedy"}, {"code": "G12", "cat": "gita", "extra": false, "nome": "Caltanissetta e Mazzarino", "data": "2027-05-01", "fine": "", "hotel": ""}, {"code": "E02", "cat": "evento", "extra": false, "nome": "One Day a Catania", "data": "2027-05-01", "fine": "", "hotel": ""}, {"code": "G13", "cat": "gita", "extra": false, "nome": "Siracusa e Ortigia", "data": "2027-05-02", "fine": "", "hotel": ""}, {"code": "G14", "cat": "gita", "extra": false, "nome": "Pachino e Marzamemi", "data": "2027-05-09", "fine": "", "hotel": ""}, {"code": "G15", "cat": "gita", "extra": false, "nome": "Palazzolo e Noto Infiorata", "data": "2027-05-16", "fine": "", "hotel": ""}, {"code": "E03", "cat": "evento", "extra": false, "nome": "Troiane a Siracusa", "data": "2027-05-18", "fine": "", "hotel": ""}, {"code": "E04", "cat": "evento", "extra": false, "nome": "Venditti a Messina", "data": "2027-05-22", "fine": "", "hotel": ""}, {"code": "G16", "cat": "gita", "extra": false, "nome": "Casteltermini e San Leone", "data": "2027-05-23", "fine": "", "hotel": ""}, {"code": "E05", "cat": "evento", "extra": false, "nome": "Gli Uccelli a Siracusa", "data": "2027-05-26", "fine": "", "hotel": ""}, {"code": "G17", "cat": "gita", "extra": false, "nome": "Troina", "data": "2027-05-30", "fine": "", "hotel": ""}, {"code": "G18", "cat": "gita", "extra": false, "nome": "Castelbuono Infiorata", "data": "2027-06-02", "fine": "", "hotel": ""}, {"code": "E06", "cat": "evento", "extra": false, "nome": "Etnacomics a Catania", "data": "2027-06-06", "fine": "", "hotel": ""}, {"code": "E07", "cat": "evento", "extra": false, "nome": "Laura Pausini a Messina", "data": "2027-06-12", "fine": "", "hotel": ""}, {"code": "E08", "cat": "evento", "extra": false, "nome": "Filottete a Siracusa", "data": "2027-06-22", "fine": "", "hotel": ""}, {"code": "E09", "cat": "evento", "extra": false, "nome": "Ulisse a Siracusa", "data": "2027-06-23", "fine": "", "hotel": ""}, {"code": "E10", "cat": "evento", "extra": false, "nome": "Vasco a Roma", "data": "2027-06-23", "fine": "2027-06-25", "hotel": ""}, {"code": "E11", "cat": "evento", "extra": false, "nome": "Ultimo a Messina", "data": "2027-06-28", "fine": "", "hotel": ""}, {"code": "E12", "cat": "evento", "extra": false, "nome": "Ultimo a Messina", "data": "2027-06-29", "fine": "", "hotel": ""}, {"code": "T07", "cat": "tour", "extra": false, "nome": "Isole Eolie", "data": "2027-07-02", "fine": "2027-07-03", "hotel": "Giardino sul mare"}, {"code": "E13", "cat": "evento", "extra": false, "nome": "Pinguini Tattici Nucleari", "data": "2027-07-03", "fine": "", "hotel": ""}, {"code": "G19", "cat": "gita", "extra": false, "nome": "Etnaland Parco Acquatico", "data": "2027-07-04", "fine": "", "hotel": ""}, {"code": "G20", "cat": "gita", "extra": false, "nome": "Scala dei Turchi e Templi", "data": "2027-07-04", "fine": "", "hotel": ""}, {"code": "E14", "cat": "evento", "extra": false, "nome": "Olly", "data": "2027-07-06", "fine": "", "hotel": ""}, {"code": "E15", "cat": "evento", "extra": false, "nome": "Achille Lauro", "data": "2027-07-10", "fine": "", "hotel": ""}, {"code": "G21", "cat": "gita", "extra": false, "nome": "Gole Alcantara e Taormina", "data": "2027-07-11", "fine": "", "hotel": ""}, {"code": "T08", "cat": "tour", "extra": false, "nome": "Umbria", "data": "2027-07-15", "fine": "2027-07-20", "hotel": "Dal Moro Gallery"}, {"code": "G22", "cat": "gita", "extra": false, "nome": "Lipari e Vulcano", "data": "2027-07-18", "fine": "", "hotel": ""}, {"code": "E16", "cat": "evento", "extra": false, "nome": "Baglioni a Siracusa", "data": "2027-07-22", "fine": "", "hotel": ""}, {"code": "T09", "cat": "tour", "extra": false, "nome": "Isole Eolie", "data": "2027-07-22", "fine": "2027-07-24", "hotel": "Giardino sul mare"}, {"code": "G23", "cat": "gita", "extra": false, "nome": "Caltagirone San Giacomo", "data": "2027-07-25", "fine": "", "hotel": ""}, {"code": "E17", "cat": "evento", "extra": false, "nome": "Baglioni a Taormina", "data": "2027-07-30", "fine": "", "hotel": ""}, {"code": "T10", "cat": "tour", "extra": false, "nome": "Riserva dello Zingaro", "data": "2027-07-31", "fine": "2027-08-01", "hotel": "Centrale"}, {"code": "", "cat": "gita", "extra": true, "nome": "Scala dei Turchi e Templi", "data": "2027-08-01", "fine": "", "hotel": ""}, {"code": "G24", "cat": "gita", "extra": false, "nome": "San Lorenzo e Marzamemi", "data": "2027-08-01", "fine": "", "hotel": ""}, {"code": "T11", "cat": "tour", "extra": false, "nome": "Campania", "data": "2027-08-07", "fine": "2027-08-11", "hotel": "dei Platani"}, {"code": "", "cat": "gita", "extra": true, "nome": "Gole Alcantara e Taormina", "data": "2027-08-08", "fine": "", "hotel": ""}, {"code": "G25", "cat": "gita", "extra": false, "nome": "Marzamemi Ferragosto", "data": "2027-08-14", "fine": "", "hotel": ""}, {"code": "G26", "cat": "gita", "extra": false, "nome": "Panarea e Stromboli", "data": "2027-08-15", "fine": "", "hotel": ""}, {"code": "T12", "cat": "tour", "extra": false, "nome": "Abruzzo", "data": "2027-08-19", "fine": "2027-08-24", "hotel": "Santa Croce Ovidius"}, {"code": "G27", "cat": "gita", "extra": false, "nome": "Buccheri Medfest", "data": "2027-08-22", "fine": "", "hotel": ""}, {"code": "T13", "cat": "tour", "extra": false, "nome": "Egadi e Saline di Trapani", "data": "2027-08-28", "fine": "2027-08-29", "hotel": "President"}, {"code": "T14", "cat": "tour", "extra": false, "nome": "Egadi Segesta e Saline", "data": "2027-09-05", "fine": "2027-09-06", "hotel": "President"}, {"code": "T15", "cat": "tour", "extra": false, "nome": "Sardegna", "data": "2027-09-12", "fine": "2027-09-19", "hotel": "Grillo, Mariano IV, Mercure, Carlo Felice"}, {"code": "G28", "cat": "gita", "extra": false, "nome": "Sciacca", "data": "2027-09-19", "fine": "", "hotel": ""}, {"code": "T16", "cat": "tour", "extra": false, "nome": "Cous Cous Fest", "data": "2027-09-24", "fine": "2027-09-26", "hotel": "Villa Zina"}, {"code": "T17", "cat": "tour", "extra": false, "nome": "Puglia Salento", "data": "2027-09-30", "fine": "2027-10-04", "hotel": "Hermitage"}, {"code": "G29", "cat": "gita", "extra": false, "nome": "Zafferana e Catania", "data": "2027-10-03", "fine": "", "hotel": ""}, {"code": "G30", "cat": "gita", "extra": false, "nome": "Bronte ed Etnapolis", "data": "2027-10-10", "fine": "", "hotel": ""}, {"code": "G31", "cat": "gita", "extra": false, "nome": "Zafferana e Militello", "data": "2027-10-10", "fine": "", "hotel": ""}, {"code": "T18", "cat": "tour", "extra": false, "nome": "Crociera medit. da Palermo", "data": "2027-10-21", "fine": "2027-10-28", "hotel": ""}, {"code": "G32", "cat": "gita", "extra": false, "nome": "Boschi e Zafferana", "data": "2027-10-24", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Boschi e Zafferana", "data": "2027-10-31", "fine": "", "hotel": ""}, {"code": "T19", "cat": "tour", "extra": false, "nome": "Calabria Costa degli Dei", "data": "2027-11-05", "fine": "2027-11-07", "hotel": ""}, {"code": "G33", "cat": "gita", "extra": false, "nome": "Centuripe e Agira", "data": "2027-11-07", "fine": "", "hotel": ""}, {"code": "G34", "cat": "gita", "extra": false, "nome": "Randazzo e Floresta", "data": "2027-11-14", "fine": "", "hotel": ""}, {"code": "T20", "cat": "tour", "extra": false, "nome": "i dintorni di Palermo", "data": "2027-11-20", "fine": "2027-11-21", "hotel": "Ibis Styles"}, {"code": "G35", "cat": "gita", "extra": false, "nome": "Cefalù", "data": "2027-11-21", "fine": "", "hotel": ""}, {"code": "G36", "cat": "gita", "extra": false, "nome": "Outlet Etnapolis", "data": "2027-11-28", "fine": "", "hotel": ""}, {"code": "G37", "cat": "gita", "extra": false, "nome": "Messina e Tindari", "data": "2027-12-05", "fine": "", "hotel": ""}, {"code": "T21", "cat": "tour", "extra": false, "nome": "Mercatini Basilicata", "data": "2027-12-05", "fine": "2027-12-08", "hotel": "Forliano"}, {"code": "G38", "cat": "gita", "extra": false, "nome": "Catania Christmas Town", "data": "2027-12-08", "fine": "", "hotel": ""}, {"code": "T22", "cat": "tour", "extra": false, "nome": "Mercatini Campania", "data": "2027-12-09", "fine": "2027-12-12", "hotel": "Dei Platani"}, {"code": "G39", "cat": "gita", "extra": false, "nome": "Caltagirone e Catania", "data": "2027-12-19", "fine": "", "hotel": ""}, {"code": "G40", "cat": "gita", "extra": false, "nome": "Presepe di Monterossa", "data": "2027-12-26", "fine": "", "hotel": ""}, {"code": "T23", "cat": "tour", "extra": false, "nome": "Capodanno in Sicilia", "data": "2027-12-31", "fine": "2028-01-02", "hotel": ""}, {"code": "T24", "cat": "tour", "extra": false, "nome": "Mercatini Puglia", "data": "2028-01-03", "fine": "2028-01-06", "hotel": "D'Aragona"}, {"code": "G41", "cat": "gita", "extra": false, "nome": "Outlet Centro Sicilia", "data": "2028-01-09", "fine": "", "hotel": ""}, {"code": "G42", "cat": "gita", "extra": false, "nome": "Savoca e Forza d’Agrò", "data": "2028-01-16", "fine": "", "hotel": ""}, {"code": "G43", "cat": "gita", "extra": false, "nome": "Etna e Catania", "data": "2028-01-23", "fine": "", "hotel": ""}, {"code": "", "cat": "gita", "extra": true, "nome": "Etna e Catania", "data": "2028-01-30", "fine": "", "hotel": ""}];
  const seedSid = x => `2027:${x.code || x.nome}:${x.data}`;
  function hash36(s) { let h = 0x811c9dc5, g = 0x01000193; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 16777619); g = Math.imul(g ^ s.charCodeAt(i), 2246822519); } return (h >>> 0).toString(36) + (g >>> 0).toString(36); }
  const seedTripId = sid => 's' + hash36(sid);

  // ---- impronte delle modifiche: ogni riga, persona in attesa, annullato e bus porta l'ora della sua ultima modifica ----
  const LISTS = ['rows', 'attesa', 'annullati', 'buses'];
  // orologio comune: non va mai indietro rispetto alle modifiche già viste da altri computer
  // (un computer con l'ora sbagliata non può cancellare il lavoro degli altri)
  let HLC = 0;
  const tick = () => (HLC = Math.max(Date.now(), HLC + 1));
  function seeU(o) { if (!o || typeof o !== 'object') return; ['u', 'tu'].forEach(k => { if (+o[k] > HLC && +o[k] < Date.now() + 864e5 * 365) HLC = +o[k]; }); LISTS.forEach(k => (o[k] || []).forEach(x => { if (+x.u > HLC && +x.u < Date.now() + 864e5 * 365) HLC = +x.u; })); ['users', 'clienti'].forEach(k => Object.values(o[k] || {}).forEach(x => { if (+x.u > HLC && +x.u < Date.now() + 864e5 * 365) HLC = +x.u; })); }
  const SNAP = new Map(), MSNAP = { users: null, clients: null, cfg: null };
  const noTrans = (k, v) => (k === 'bookings' ? undefined : v);
  const itemJSON = x => JSON.stringify(x, (k, v) => (k === 'u' || k === 'bookings' ? undefined : v));
  const topJSON = t => JSON.stringify(t, function (k, v) { return this === t && (LISTS.includes(k) || k === 'u' || k === 'tu' || k === 'gone') ? undefined : v; });
  const effective = (t, k) => { const a = t[k] || []; if (k !== 'rows' && k !== 'attesa') return a; let n = a.length; while (n > 0 && isEmptyRow(a[n - 1])) n--; return a.slice(0, n); };
  function persistForm(t) { const o = JSON.parse(JSON.stringify(t, noTrans)); o.rows = effective(t, 'rows').map(x => JSON.parse(JSON.stringify(x))); o.attesa = effective(t, 'attesa').map(x => JSON.parse(JSON.stringify(x))); return o; }
  function snap(t) { SNAP.set(t.id, { top: topJSON(t), items: new Map(LISTS.flatMap(k => effective(t, k).map(x => [k + ':' + x.id, itemJSON(x)]))) }); }
  function stamp(t) {
    const now = tick(), s = SNAP.get(t.id); let ch = false;
    if (!s) { ch = true; t.tu = now; LISTS.forEach(k => effective(t, k).forEach(x => { if (!x.u) x.u = now; })); }
    else {
      const seen = new Set();
      LISTS.forEach(k => effective(t, k).forEach(x => { const key = k + ':' + x.id; seen.add(key); if (s.items.get(key) !== itemJSON(x)) { x.u = now; ch = true; } }));
      s.items.forEach((j, key) => { if (!seen.has(key)) { t.gone = t.gone || {}; t.gone[key] = now; ch = true; } });
      if (topJSON(t) !== s.top) { ch = true; t.tu = now; }
    }
    if (ch) { t.u = now; snap(t); }
    return ch;
  }
  function stampMap(obj, key, name) {
    const now = tick(); const prev = MSNAP[name] || {}; const cur = {}; let ch = false;
    Object.keys(obj[key] || {}).forEach(id => { const j = itemJSON(obj[key][id]); cur[id] = j; if (prev[id] !== j) { obj[key][id].u = now; ch = true; } });
    Object.keys(prev).forEach(id => { if (!(id in cur)) { obj.gone = obj.gone || {}; obj.gone[id] = now; ch = true; } });
    if (ch) { obj.u = now; MSNAP[name] = {}; Object.keys(obj[key] || {}).forEach(id => { MSNAP[name][id] = itemJSON(obj[key][id]); }); }
    return ch;
  }
  function snapMaps() {
    ['users', 'clients'].forEach(n => { const o = S[n], key = n === 'users' ? 'users' : 'clienti'; MSNAP[n] = {}; Object.keys(o[key] || {}).forEach(id => { MSNAP[n][id] = itemJSON(o[key][id]); }); });
    MSNAP.cfg = itemJSON(S.cfg);
  }

  function load() {
    const trips = STORE.list('/viaggi/').map(([, d]) => d).filter(t => t && t.id && !t.deleted).map(t => tripInit(JSON.parse(JSON.stringify(t))));
    S = { trips, cfg: Object.assign(DEF_CFG(), STORE.get(P.cfg) || {}), users: STORE.get(P.users) ? JSON.parse(JSON.stringify(STORE.get(P.users))) : { users: {} }, clients: STORE.get(P.clients) ? JSON.parse(JSON.stringify(STORE.get(P.clients))) : { clienti: {} } };
    S.users.users = S.users.users || {}; S.clients.clienti = S.clients.clienti || {};
    if (!Array.isArray(S.cfg.agenzie) || !S.cfg.agenzie.length) S.cfg.agenzie = JSON.parse(JSON.stringify(AGENZIE_DEF));
    S.trips.forEach(t => { seeU(t); snap(t); }); seeU(S.users); seeU(S.clients); snapMaps();
  }
  // i viaggi dell'elenco 2027 si aggiungono una volta sola per tutto l'archivio (stesso codice su tutti i computer)
  function seedCatalog() {
    S.cfg.seeded = S.cfg.seeded || [];
    if (S.cfg.seeded.includes('elenco2027b')) return false;
    SEED_2027.forEach(x => {
      const sid = seedSid(x), id = seedTripId(sid);
      if (S.trips.some(t => t.id === id || t.seedId === sid)) return;
      const t = tripInit({ id, seedId: sid, nome: x.nome, data: x.data, fine: x.fine, cat: x.cat, extra: x.extra, code: x.code, programma: '', quota: { hotel: x.hotel, suppl: {} }, rows: [], attesa: [], annullati: [], partenze: [], buses: [] });
      S.trips.push(t); stamp(t); t.u = 1; t.tu = 1; LISTS.forEach(k => t[k].forEach(i => { i.u = 1; })); snap(t);
      STORE.put(P.trip(t.id), persistForm(t));
    });
    S.cfg.seeded.push('elenco2027b'); save();
    return true;
  }
  let saveT = null;
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 250); }
  function flush() {
    clearTimeout(saveT); if (!S) return;
    S.trips.forEach(t => { if (stamp(t)) STORE.put(P.trip(t.id), persistForm(t)); });
    if (stampMap(S.users, 'users', 'users')) STORE.put(P.users, S.users);
    if (stampMap(S.clients, 'clienti', 'clients')) STORE.put(P.clients, S.clients);
    const cj = itemJSON(S.cfg); if (cj !== MSNAP.cfg) { S.cfg.u = tick(); MSNAP.cfg = itemJSON(S.cfg); STORE.put(P.cfg, S.cfg); }
  }
  window.addEventListener('beforeunload', () => { try { flush(); } catch (e) { /* niente */ } });
  function deleteTrip(id) {
    S.trips = S.trips.filter(x => x.id !== id); SNAP.delete(id);
    STORE.put(P.trip(id), { id, deleted: true, u: tick(), tu: HLC });
  }
  // arrivano modifiche da un altro computer: si uniscono con quelle di questo, senza perdere niente
  function applyRemote(paths) {
    if (!S) return;
    let touched = false;
    paths.forEach(p => {
      const d = STORE.get(p);
      if (p.startsWith('/viaggi/')) {
        const id = p.slice(8, -5); const i = S.trips.findIndex(t => t.id === id);
        if (!d || d.deleted) { if (i >= 0) { S.trips.splice(i, 1); SNAP.delete(id); touched = true; } return; }
        seeU(d); let merged = d;
        if (i >= 0) { stamp(S.trips[i]); merged = STORE.mergeTrip(persistForm(S.trips[i]), d); if (JSON.stringify(merged) !== JSON.stringify(d)) STORE.put(p, merged); }
        const nt = tripInit(JSON.parse(JSON.stringify(merged)));
        if (i >= 0) S.trips[i] = nt; else S.trips.push(nt);
        snap(nt); touched = true;
      } else if (p === P.users || p === P.clients || p === P.cfg) {
        const name = p === P.users ? 'users' : p === P.clients ? 'clients' : 'cfg';
        flush();
        const dd = STORE.get(p); seeU(dd);
        const merged = name === 'cfg' ? dd : STORE.mergeFor(p)(JSON.parse(JSON.stringify(S[name])), dd);
        if (name !== 'cfg' && JSON.stringify(merged) !== JSON.stringify(dd)) STORE.put(p, merged);
        S[name] = name === 'cfg' ? Object.assign(DEF_CFG(), JSON.parse(JSON.stringify(merged))) : JSON.parse(JSON.stringify(merged));
        if (name === 'users') S.users.users = S.users.users || {}; if (name === 'clients') S.clients.clienti = S.clients.clienti || {};
        snapMaps(); touched = true;
      } else touched = true;
    });
    if (touched && typeof onData === 'function') onData(paths);
  }
  let onData = null;

  const trip = () => S.trips.find(t => t.id === UI.tripId);
  const bus = () => { const t = trip(); return t && t.buses.find(b => b.id === UI.busId); };
  const bkById = (b, id) => b.bookings.find(x => x.id === id);
  const seatsOf = (b, bid) => Object.keys(b.seats).filter(s => b.seats[s].b === bid).map(Number).sort((a, c) => a - c);
  const personSeat = (b, pid) => { for (const s in b.seats) if (b.seats[s].pid === pid) return +s; return null; };
  const unplaced = (b, bk) => { const set = new Set(Object.values(b.seats).filter(a => a.b === bk.id).map(a => a.pid)); return bk.persone.filter(p => !set.has(p.id)); };
  const bkName = bk => bk.persone[0] ? bk.persone[0].cognome : '—';
  function busStats(b) {
    const L = LMAP[b.layout].info;
    const tot = b.bookings.reduce((n, k) => n + k.persone.length, 0);
    const placed = Object.values(b.seats).filter(a => a.pid).length;
    const usedPass = Object.keys(b.seats).filter(s => !L.host.has(+s)).length;
    return { tot, placed, cap: L.cap, free: L.cap - usedPass, todo: tot - placed };
  }
  function fmtSeats(arr) {
    if (!arr.length) return '';
    const out = []; let a = arr[0], p = arr[0];
    for (let i = 1; i <= arr.length; i++) {
      const x = arr[i];
      if (x === p + 1) { p = x; continue; }
      out.push(a === p ? `${a}` : (p === a + 1 ? `${a}, ${p}` : `${a}–${p}`));
      a = p = x;
    }
    return out.join(', ');
  }
  function seatsSentence(arr) {
    if (arr.length === 1) return `n. ${arr[0]}`;
    return 'n. ' + arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
  }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function parseD(s) { const [y, m, d] = (s || '').split('-').map(Number); return new Date(y || 2000, (m || 1) - 1, d || 1); }
  function fmtDate(s, long) { if (!s) return ''; const d = parseD(s); return long ? `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI_L[d.getMonth()]} ${d.getFullYear()}` : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
  function fmtTripDate(t, long) { return t.fine && t.fine !== t.data ? `dal ${fmtDate(t.data, long)} al ${fmtDate(t.fine, long)}` : fmtDate(t.data, long); }
  function nextColor(b) { const used = b.bookings.map(k => k.c); for (let i = 0; i < COLORS.length; i++) if (!used.includes(i)) return i; return b.bookings.length % COLORS.length; }
  const euro = v => v == null || v === '' || isNaN(v) ? '—' : '€ ' + (+v).toLocaleString('it-IT', { minimumFractionDigits: (+v % 1) ? 2 : 0, maximumFractionDigits: 2 });
  function parseEuro(s) {
    const t = String(s == null ? '' : s).replace(/\s|€/g, ''); if (!t) return null;
    const m = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?$/.exec(t); if (!m) return null;
    return +(m[1].replace(/\./g, '') + (m[2] ? '.' + m[2] : ''));
  }
  // camere: una camera inizia dove c'è il numero (colonna C) o il tipo; «+» e «3° letto» sono letti aggiunti nella stessa camera
  const isExtraBed = s => /^\s*\+|3\s*°?\s*lett|letto\s*agg|aggiunt/i.test(s || '');
  function normCam(s) {
    s = String(s || '').trim(); const l = s.toLowerCase(); if (!l) return '';
    if (/^sing/.test(l)) return 'singola'; if (/^dopp/.test(l)) return 'doppia'; if (/^matr/.test(l)) return 'matrimoniale';
    if (/^tripl/.test(l)) return 'tripla'; if (/^quadr/.test(l)) return 'quadrupla'; if (isExtraBed(l)) return /3/.test(l) ? '3° letto' : '+ letto';
    return s;
  }
  const roomStart = p => !!(p.ncam || (p.camera && !isExtraBed(p.camera)));
  function roomsOf(bk) {
    if (!bk.persone.some(p => p.camera || p.ncam)) return [];
    const rooms = []; let cur = null;
    bk.persone.forEach(p => { const st = roomStart(p); if (!cur || st) { cur = { tipo: st ? (isExtraBed(p.camera) ? '' : p.camera) : '', num: p.ncam || '', persone: [] }; rooms.push(cur); } cur.persone.push(p); });
    return rooms;
  }
  function roomKind(r) { const n = r.persone.length; if (n === 1) return 'singola'; if (n === 2) return r.tipo === 'doppia' ? 'doppia' : 'matrimoniale'; if (n === 3) return 'tripla'; if (n === 4) return 'quadrupla'; return `${n} letti`; }
  function roomLabel(r) { const k = roomKind(r); const base = r.tipo && r.tipo !== k ? `${r.tipo.slice(0, 6)}. +${r.persone.length - 2}` : k; return (r.num ? `n. ${r.num} ` : '') + base; }
  function ageAt(p, iso) {
    const m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(p.nascita || ''); if (!m) return null;
    const ref = iso ? parseD(iso) : new Date(); let y = +m[3]; if (y < 100) y += y > (ref.getFullYear() % 100) ? 1900 : 2000;
    let a = ref.getFullYear() - y; if (ref.getMonth() + 1 < +m[2] || (ref.getMonth() + 1 === +m[2] && ref.getDate() < +m[1])) a--;
    return a;
  }
  const TIPI = { ad: 'adulto', bam: 'bambino', '3l': '3° letto ad.', inf: 'neonato', free: 'gratuito' };
  function bamRange(t) { const m = /(\d+)\s*\/\s*(\d+)/.exec((t.quota && t.quota.bambiniL) || ''); return m ? [+m[1], +m[2]] : [3, 11]; }
  function autoTipo(t, p, room, idx) {
    const a = ageAt(p, t.data); const [lo, hi] = bamRange(t);
    if (a != null && a < lo) return 'inf';
    if (a != null && a <= hi) return 'bam';
    if (/3/.test(p.camera || '') && isExtraBed(p.camera)) return '3l';
    if (room && room.persone.length >= 3 && idx >= 2) return '3l';
    return 'ad';
  }
  function supplOf(t, bk, p) {
    const Q = t.quota, r = p.req && p.req.level === 'pagato' ? p.req : (bk.pref && bk.pref.level === 'pagato' ? bk.pref : null);
    if (!r) return 0;
    if (r.fila >= 1 && r.fila <= 4 && Q.suppl[r.fila] != null) return Q.suppl[r.fila];
    if (r.zone && r.zone.includes('porta2') && Q.suppl.p2 != null) return Q.suppl.p2;
    return 0;
  }
  function personPrice(t, bk, p, room, idx) {
    if (p.prezzo != null && p.prezzo !== '') return +p.prezzo;
    const Q = tripInit(t).quota; const tipo = p.tipo || autoTipo(t, p, room, idx);
    if (tipo === 'free') return 0;
    let base;
    if (tipo === 'inf') base = Q.infant ?? 0;
    else if (tipo === 'bam') base = Q.bambini ?? Q.adulti;
    else if (tipo === '3l') base = Q.terzo ?? Q.adulti;
    else base = room && room.persone.length === 1 && Q.singola != null ? Q.singola : Q.adulti;
    const tk = ticketOf(t, tipo);
    if (base == null && (tk || isBigl(t))) base = 0;
    if (base == null) return null;
    return base + supplOf(t, bk, p) + tk;
  }
  // biglietto dell'evento (intero o ridotto) + diritti di prevendita, per chi lo compra con l'agenzia
  const isBigl = t => t.cat === 'biglietteria';
  function ticketOf(t, tipo) {
    const Q = t.quota || {}; if (Q.tkt1 == null && Q.tkt2 == null) return 0;
    if (tipo === 'free') return 0;
    const tk = tipo === 'bam' || tipo === 'inf' ? (Q.tkt2 ?? Q.tkt1) : Q.tkt1;
    return (+tk || 0) + (+Q.diritti || 0);
  }
  function bkMoney(t, bk) {
    const ctx = new Map(); roomsOf(bk).forEach(r => r.persone.forEach((p, i) => ctx.set(p.id, { room: r, idx: i })));
    let due = 0, unknown = false;
    const per = bk.persone.map(p => { const c = ctx.get(p.id) || {}; const v = personPrice(t, bk, p, c.room, c.idx); if (v == null) unknown = true; else due += v; return { v, tipo: p.tipo || autoTipo(t, p, c.room, c.idx) }; });
    const paid = (bk.pagamenti || []).reduce((a, x) => a + (+x.importo || 0), 0) + (t && t.id && bk.id && typeof paidMovs === 'function' ? paidMovs(t.id, bk.id) : 0);
    const saldato = !unknown && paid >= due - 0.009;
    return { due: unknown ? null : due, paid, rest: unknown ? null : Math.max(0, due - paid), saldato, per, extra: unknown ? 0 : Math.max(0, paid - due) };
  }

  // ---------- posti richiesti dai clienti ----------
  // req = { fila: n (dal davanti, contata sul proprio lato) | -1 ultima | -2 penultima | -3 terzultima | null,
  //         lato: 'sx'|'dx'|null, pos: 'win'|'aisle'|null, zone: ['front','uscita','porta2'], noLast, level, text }
  // Le richieste possono essere della singola persona (colonna «fila», note delle altre righe)
  // oppure di tutta la prenotazione (nota sulla prima riga).
  const LEVELS = { pagato: 4, richiesta: 3, preferenza: 2 };
  const LEVEL_L = { pagato: 'pagato', richiesta: 'richiesto', preferenza: 'preferenza' };
  const ORD = { prima: 1, primo: 1, seconda: 2, secondo: 2, terza: 3, terzo: 3, quarta: 4, quarto: 4, quinta: 5, quinto: 5, sesta: 6, sesto: 6 };
  const BACK = { penult: 2, terzult: 3, quartult: 4 };
  const BACK_L = { 1: 'ultima fila', 2: 'penultima fila', 3: 'terzultima fila', 4: 'quartultima fila' };
  function normTxt(s) { return ' ' + String(s || '').toLowerCase().replace(/[’`]/g, "'").replace(/[°ºª]/g, '° ').replace(/\bf\.\s*/g, 'fila ').replace(/\bfil\.\s*/g, 'fila ').replace(/\s+/g, ' ') + ' '; }
  function scanPref(raw, inFila) {
    const t = normTxt(raw); const P = { fila: null, lato: null, pos: null, zone: [], noLast: false }; let found = false; let m;
    if ((m = /(\d{1,2})\s*°?\s*(?:a\s+)?fila/.exec(t))) { P.fila = +m[1]; found = true; }
    else if ((m = /\b(prima|primo|seconda|secondo|terza|terzo|quarta|quarto|quinta|quinto|sesta|sesto)\s+fila/.exec(t))) { P.fila = ORD[m[1]]; found = true; }
    else if ((m = /\b(penult|terzult|quartult)/.exec(t))) { P.fila = -BACK[m[1]]; found = true; }
    if (/\b(no|non)\s+(in\s+|nell'\s*|nella\s+|nelle\s+)?(ultima|ultime file|fondo|dietro|in fondo)/.test(t)) { P.noLast = true; found = true; }
    else if (!P.fila && (/ultima fila|ultime file|\bin fondo\b/.test(t) || (inFila && /\bultim[ae]\b/.test(t)))) { P.fila = -1; found = true; }
    if (/prime file|primi posti|\bdavanti\b|pi(ù|u'?) avanti/.test(t) && !P.fila) { P.zone.push('front'); found = true; }
    if (/(\d\s*°?\s*porta|seconda porta)/.test(t)) { P.zone.push('porta2'); found = true; }
    else if (/vicino (all'\s*|alla |la |l'\s*)?(uscita|porta)|porta (di )?dietro|porta posteriore|porta centrale|dopo la porta|\buscita\b/.test(t)) { P.zone.push('uscita'); found = true; }
    if (/\b(sx|sinistra|sinistro|sin)\b|lato autista|dietro (l'|lo |all'\s*)?autista/.test(t)) { P.lato = 'sx'; found = true; }
    else if (/\b(dx|destra|destro)\b|lato porta|lato hostess/.test(t)) { P.lato = 'dx'; found = true; }
    if (/dietro (l'|lo |all'\s*)?autista/.test(t) && !P.fila) P.fila = 1;
    if (/finestr/.test(t)) { P.pos = 'win'; found = true; } else if (/\bcorr(idoio|\.|\b)/.test(t)) { P.pos = 'aisle'; found = true; }
    if (/soffre|mal d[ia] (auto|pullman|viaggio|strada)|nausea/.test(t) && !P.fila && !P.zone.includes('front')) { P.zone.push('front'); found = true; }
    return found ? P : null;
  }
  // richiesta dalla colonna «fila»: le prime 4 file e la 2ª porta sono a supplemento (pagato)
  function reqFromFila(txt) {
    const P = scanPref(txt, true); if (!P) return null;
    P.level = ((P.fila > 0 && P.fila <= 4) || P.zone.includes('porta2')) ? 'pagato' : 'richiesta'; P.text = String(txt).trim(); return P;
  }
  function reqFromNote(txt) {
    const P = scanPref(txt, false); if (!P) return null;
    // «ok ultime file», «Ok dalla terzultima fila»: il cliente accetta, non chiede: è solo una preferenza
    P.level = /pref|preferi|possibil|se si pu|magari|\bo\b|^\s*ok\b|va bene|anche/.test(normTxt(txt)) ? 'preferenza' : 'richiesta'; P.text = String(txt).trim(); return P;
  }
  function combineReq(a, b) {
    if (!a) return b; if (!b) return a;
    const P = { ...a, zone: [...new Set([...(a.zone || []), ...(b.zone || [])])] };
    P.fila = a.fila || b.fila; P.lato = a.lato || b.lato; P.pos = a.pos || b.pos; P.noLast = a.noLast || b.noLast;
    if ((LEVELS[b.level] || 0) > (LEVELS[a.level] || 0)) P.level = b.level;
    P.text = [a.text, b.text].filter(Boolean).join(' · ');
    return P;
  }
  // compatibilità con i dati salvati prima: una nota qualsiasi diventa richiesta della prenotazione
  function parsePref(fila, note) { return combineReq(fila ? reqFromFila(fila) : null, note ? reqFromNote(note) : null); }
  const hasLoc = P => !!(P && (P.fila || P.lato || (P.zone && P.zone.length)));
  const hasAny = P => !!(P && (hasLoc(P) || P.pos || P.noLast));
  const restrictsRows = P => !!(P && (P.fila || (P.zone && P.zone.length)));
  function locMatch(L, s, P) {
    const g = L.info.geo[s]; if (!g || g.host) return false;
    if (P.fila > 0) { if (g.side === 'c' || g.fila !== P.fila) return false; }
    else if (P.fila < 0) { if (g.back !== -P.fila) return false; }
    if (P.lato && g.side !== P.lato) return false;
    if (P.zone && P.zone.length && !P.fila) {
      if (!P.zone.some(z => z === 'front' ? (g.side !== 'c' && g.fila <= 3) : z === 'porta2' ? L.info.porta2.has(s) : z === 'uscita' ? L.info.uscita.has(s) : true)) return false;
    }
    return true;
  }
  const posMatch = (L, s, P) => { const g = L.info.geo[s]; return !P.pos || (P.pos === 'win' ? g.win : g.aisle); };
  const reqOk = (L, s, P) => (!hasLoc(P) || locMatch(L, s, P)) && posMatch(L, s, P) && !(P.noLast && L.info.geo[s].back === 1);
  function wantSeats(L, P) { if (!hasAny(P)) return []; return L.info.order.filter(s => reqOk(L, s, P)); }
  function locCount(L, X, P) { return X.filter(s => locMatch(L, s, P)).length; }
  // abbina le persone con una richiesta personale ai posti adatti; restituisce {map: pid→posto, ok: quante rispettate}
  function matchPeople(L, people, X) {
    const left = [...X].sort((a, c) => a - c); const map = {}; let ok = 0;
    const withReq = people.filter(p => hasAny(p.req)).sort((a, c) => wantSeats(L, a.req).length - wantSeats(L, c.req).length);
    withReq.forEach(p => { const i = left.findIndex(s => reqOk(L, s, p.req)); if (i >= 0) { map[p.id] = left[i]; left.splice(i, 1); ok++; } });
    people.forEach(p => { if (map[p.id] == null) map[p.id] = left.shift(); });
    return { map, ok, need: withReq.length };
  }
  // stato delle richieste di una prenotazione: 'ok' | 'ko' | 'pending' | null (nessuna richiesta)
  function prefStatus(b, bk) {
    const P = bk.pref; const persReq = bk.persone.filter(p => hasAny(p.req));
    if (!hasAny(P) && !persReq.length) return null;
    const L = LMAP[b.layout]; const seats = seatsOf(b, bk.id);
    if (!seats.length) return 'pending';
    let ok = true, soft = false;
    if (hasAny(P)) {
      let pk = true;
      if (hasLoc(P)) { const need = Math.min(bk.persone.length, L.info.order.filter(s => locMatch(L, s, P)).length); if (!need || locCount(L, seats, P) < need) pk = false; }
      if (P.pos && !seats.some(s => posMatch(L, s, P))) pk = false;
      if (P.noLast && seats.some(s => L.info.geo[s].back === 1)) pk = false;
      if (!pk) { if (P.level === 'preferenza') soft = true; else ok = false; }
    }
    persReq.forEach(p => { const s = personSeat(b, p.id); if (s != null && !reqOk(L, s, p.req)) { if (p.req.level === 'preferenza') soft = true; else ok = false; } });
    if (persReq.some(p => personSeat(b, p.id) == null) && ok) return 'pending';
    // «pref»: le richieste vere sono rispettate, solo una preferenza («se possibile») non lo è
    return ok ? (soft ? 'pref' : 'ok') : 'ko';
  }
  function prefLabel(P, withLevel = true) {
    if (!P) return '';
    const parts = [];
    if (P.fila > 0) parts.push(`${P.fila}ª fila`); else if (P.fila < 0) parts.push(BACK_L[-P.fila] || 'in fondo');
    if (P.lato) parts.push(P.fila ? P.lato.toUpperCase() : `lato ${P.lato.toUpperCase()}`);
    if (P.zone && P.zone.length && !P.fila) parts.push(P.zone.map(z => z === 'front' ? 'prime file' : z === 'porta2' ? '2ª porta' : 'vicino uscita').join(' o '));
    if (P.pos) parts.push(P.pos === 'win' ? 'finestrino' : 'corridoio');
    if (P.noLast) parts.push('non in ultima fila');
    return parts.join(' ') + (withLevel && P.level ? ` · ${LEVEL_L[P.level]}` : '');
  }
  // riassunto per la lista: richiesta di tutta la prenotazione + richieste delle singole persone
  function reqSummary(bk) {
    const parts = []; let paid = false;
    if (hasAny(bk.pref)) { parts.push(prefLabel(bk.pref, false) + (bk.persone.length > 1 ? ' (tutti)' : '')); paid = paid || bk.pref.level === 'pagato'; }
    const groups = {};
    bk.persone.forEach(p => { if (!hasAny(p.req)) return; const k = prefLabel(p.req, false); groups[k] = groups[k] || []; groups[k].push(p.cognome); if (p.req.level === 'pagato') paid = true; });
    Object.keys(groups).forEach(k => parts.push(bk.persone.length > 1 ? `${k}: ${groups[k].join(', ')}` : k));
    return { text: parts.join(' · '), paid };
  }

  // ---------- assegnazione posti ----------
  function placeFrom(b, bk, start) {
    const L = LMAP[b.layout].info; const need = unplaced(b, bk); let k = 0;
    for (const s of L.all) {
      if (k >= need.length) break;
      if (s < start || b.seats[s]) continue;
      if (L.host.has(s) && s !== start) continue;
      b.seats[s] = { b: bk.id, pid: need[k++].id };
    }
    fixPersonSeats(b, bk);
    return k;
  }
  // dentro una prenotazione sposta le persone in modo che chi ha chiesto un posto preciso lo abbia
  function fixPersonSeats(b, bk) {
    const L = LMAP[b.layout]; const seats = seatsOf(b, bk.id); if (seats.length < 2) return;
    const placedP = bk.persone.filter(p => personSeat(b, p.id) != null);
    if (!placedP.some(p => hasAny(p.req))) return;
    const r = matchPeople(L, placedP, seats);
    placedP.forEach(p => { b.seats[r.map[p.id]] = { b: bk.id, pid: p.id }; });
  }
  // Le prenotazioni si dividono solo se le persone chiedono posti diversi: per camera (se indicata) o per coppie
  function unitsOf(bk, persons) {
    const sig = p => (p.req && restrictsRows(p.req)) ? prefLabel(p.req, false) : '';
    if (!persons.some(p => sig(p))) return [persons];
    const hasRooms = bk.persone.some(p => p.room);
    const segs = []; let cur = [];
    persons.forEach(p => { if (cur.length && (hasRooms ? p.room : cur.length === 2)) { segs.push(cur); cur = []; } cur.push(p); });
    if (cur.length) segs.push(cur);
    const segSig = seg => [...new Set(seg.map(sig).filter(Boolean))].sort().join('|');
    const units = [];
    segs.forEach(seg => { const last = units[units.length - 1]; if (last && segSig(last) === segSig(seg)) last.push(...seg); else units.push([...seg]); });
    return units;
  }
  function age(p) {
    const m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(p.nascita || ''); if (!m) return null;
    let y = +m[3]; if (y < 100) y += y > (new Date().getFullYear() % 100) ? 1900 : 2000;
    return new Date().getFullYear() - y;
  }
  function scoreSeats(b, L, u, X, ctx) {
    const I = L.info, n = X.length; const P = u.bk.pref; let sc = 0;
    const g = X.map(s => I.geo[s]);
    const rows = [...new Set(g.map(x => x.floor * 1000 + x.row))].sort((a, c) => a - c);
    sc -= 40 * Math.max(0, rows.length - Math.ceil(n / 2));
    sc -= 15 * (rows[rows.length - 1] - rows[0] - (rows.length - 1));
    sc -= 500 * (new Set(g.map(x => x.floor)).size - 1);
    const myBk = new Set(u.items.map(it => it.bk.id));
    X.forEach(s => {
      const p = I.pair[s]; if (p == null || X.includes(p)) return;
      const a = b.seats[p];
      if (!a) { sc -= n === 1 ? 20 : n % 2 ? 5 : 40; return; }
      if (a.res) return;
      if (myBk.has(a.b)) { sc += 80; return; }
      const ob = bkById(b, a.b); const obGroup = ob && ob.persone.length >= 2;
      if (obGroup) sc -= 400;                 // mai un estraneo accanto a una persona di un gruppo
      else sc += n === 1 ? 60 : -60;          // i singoli si siedono vicino ad altri singoli
    });
    const people = u.items.map(it => it.p);
    // ctx.anchor: posto scelto a mano (trascinamento): la scelta dell'ufficio conta più delle richieste
    const W = ctx.anchor != null ? 0.05 : 1;
    const m = matchPeople(L, people, X); sc += 1000 * W * m.ok;
    if (hasAny(P) && u.whole) {
      if (hasLoc(P)) sc += 1000 * W * locCount(L, X, P);
      if (P.pos && X.some(s => posMatch(L, s, P))) sc += 300 * W;
      if (P.noLast) sc -= 3000 * W * X.filter(s => I.geo[s].back === 1).length;
    }
    if (ctx.anchor != null) { const a = I.geo[ctx.anchor]; sc -= 12 * X.reduce((v, s) => v + Math.abs(I.geo[s].row - a.row) + (I.geo[s].floor !== a.floor ? 20 : 0) + (I.geo[s].side !== a.side ? 0.6 : 0), 0); return sc; }
    sc -= 70 * X.filter(s => ctx.wanted.has(s)).length;
    if (ctx.near.length) { const er = ctx.near.map(s => I.geo[s].floor * 1000 + I.geo[s].row); sc -= 10 * Math.min(...rows.map(r => Math.min(...er.map(e => Math.abs(e - r))))); }
    sc -= 0.4 * X.reduce((a, s) => a + I.rank[s], 0) / n;
    return sc;
  }
  // Ordine: prima chi ha pagato una fila, poi le richieste di fila/zona, poi le preferenze, poi gli altri
  // nell'ordine della lista (clienti abituali e anziani un po' avanti, gruppi di ragazzi in fondo).
  // I singoli senza richieste si abbinano a due a due. I posti assegnati a mano non si toccano.
  function autoAssign(b, only) {
    const L = LMAP[b.layout]; const I = L.info; let placed = 0; const skipped = []; const placedNow = new Set();
    let units = [];
    b.bookings.forEach((bk, i) => {
      if (only && !only.has(bk.id)) return;
      const un = unplaced(b, bk); if (!un.length) return;
      const parts = unitsOf(bk, un);
      parts.forEach(ps => units.push({ bk, i, whole: parts.length === 1, items: ps.map(p => ({ bk, p })) }));
    });
    units.forEach(u => {
      const reqs = u.items.map(it => it.p.req).filter(restrictsRows); if (u.whole && restrictsRows(u.bk.pref)) reqs.push(u.bk.pref);
      u.prio = reqs.length ? Math.max(...reqs.map(r => LEVELS[r.level] || 1)) : 0;
      const ages = u.items.map(it => age(it.p)).filter(x => x != null); const avg = ages.length ? ages.reduce((a, c) => a + c, 0) / ages.length : null;
      u.key = u.i + (u.bk.abituale ? -1000 : 0) + (avg != null && avg >= 75 ? -4 : 0) + (avg != null && avg < 30 && u.items.length > 1 ? 500 : 0);
    });
    // singoli senza richieste: a coppie, al posto del secondo
    const singles = units.filter(u => u.prio === 0 && u.items.length === 1 && u.whole && !hasAny(u.bk.pref) && !hasAny(u.items[0].p.req)).sort((x, y) => x.key - y.key);
    for (let k = 0; k + 1 < singles.length; k += 2) { const a = singles[k], c = singles[k + 1]; a.items.push(...c.items); a.key = c.key; a.pairOfSingles = true; units = units.filter(x => x !== c); }
    units.sort((x, y) => y.prio - x.prio || x.key - y.key);
    units.forEach((u, k) => {
      const n = u.items.length;
      const freeSet = new Set(I.order.filter(s => !b.seats[s]));
      if (freeSet.size < n) { u.items.forEach(it => { if (!skipped.includes(it.bk)) skipped.push(it.bk); }); return; }
      const wanted = new Set();
      units.slice(k + 1).forEach(o => { if (o.bk === u.bk) return; o.items.forEach(it => { if (restrictsRows(it.p.req)) I.order.forEach(s => { if (reqOk(L, s, it.p.req)) wanted.add(s); }); }); if (o.whole && restrictsRows(o.bk.pref)) I.order.forEach(s => { if (locMatch(L, s, o.bk.pref)) wanted.add(s); }); });
      const near = u.pairOfSingles ? [] : seatsOf(b, u.bk.id);
      const ctx = { wanted, near };
      let best = null, bestSc = -Infinity;
      const tryX = X => { const sc = scoreSeats(b, L, u, X, ctx); if (sc > bestSc) { bestSc = sc; best = X; } };
      [I.order, ...I.sideOrders].forEach(ord => { const fo = ord.filter(s => freeSet.has(s)); for (let i = 0; i + n <= fo.length; i++) tryX(fo.slice(i, i + n)); });
      // candidato mirato: prima i posti richiesti (persona per persona), poi i più vicini
      const targets = u.items.map(it => it.p.req).filter(r => hasAny(r) && restrictsRows(r));
      const P = u.bk.pref;
      if (targets.length || (u.whole && restrictsRows(P))) {
        const X = [];
        u.items.forEach(it => { const r = it.p.req; if (!(hasAny(r) && restrictsRows(r))) return; const s = I.order.find(x => freeSet.has(x) && !X.includes(x) && reqOk(L, x, r)); if (s != null) X.push(s); });
        if (u.whole && restrictsRows(P)) I.order.filter(x => freeSet.has(x) && !X.includes(x) && locMatch(L, x, P)).forEach(x => { if (X.length < n) X.push(x); });
        if (X.length) {
          const dist = s => Math.min(...X.map(x => Math.abs(I.geo[x].row - I.geo[s].row) * 4 + (I.geo[x].floor !== I.geo[s].floor ? 400 : 0) + (I.geo[x].side === I.geo[s].side ? 0 : 1) + (I.pair[x] === s ? -3 : 0)));
          I.order.filter(s => freeSet.has(s) && !X.includes(s)).sort((a, c) => dist(a) - dist(c) || a - c).slice(0, n - X.length).forEach(s => X.push(s));
          if (X.length === n) tryX(X);
        }
      }
      const m = matchPeople(L, u.items.map(it => it.p), best);
      u.items.forEach(it => { b.seats[m.map[it.p.id]] = { b: it.bk.id, pid: it.p.id }; placedNow.add(it.p.id); });
      placed += n;
    });
    improve(b, L, placedNow);
    reserveGuide(b);
    const ko = b.bookings.filter(bk => prefStatus(b, bk) === 'ko');
    return { placed, skipped, ko };
  }
  // Prenotazione lasciata su un posto: chi va lì e chi gli siede accanto lo decidono le stesse regole
  // dell'assegnazione automatica (gruppo unito, coppie vicine, posti richiesti), ma il posto scelto è sempre incluso.
  // Se la prenotazione va divisa (persone che hanno pagato file diverse), le altre parti si sistemano da sole.
  function placeAt(b, bk, s) {
    const L = LMAP[b.layout]; const I = L.info;
    if (b.seats[s]) return { ok: false };
    if (!unplaced(b, bk).length) clearBooking(b, bk.id);
    const people = unplaced(b, bk); if (!people.length) return { ok: false };
    const parts = unitsOf(bk, people);
    let ui = parts.findIndex(ps => ps.some(p => p.req && restrictsRows(p.req) && reqOk(L, s, p.req))); if (ui < 0) ui = 0;
    const unit = parts[ui];
    const u = { bk, i: b.bookings.indexOf(bk), whole: parts.length === 1, items: unit.map(p => ({ bk, p })) };
    const freeSet = new Set(I.order.filter(x => !b.seats[x])); freeSet.add(s);
    const n = Math.min(unit.length, freeSet.size);
    const wanted = new Set();
    b.bookings.forEach(o => { if (o === bk || prefStatus(b, o) === 'ok') return; unplaced(b, o).forEach(p => { if (restrictsRows(p.req)) I.order.forEach(x => { if (reqOk(L, x, p.req)) wanted.add(x); }); }); if (restrictsRows(o.pref) && !seatsOf(b, o.id).length) I.order.forEach(x => { if (locMatch(L, x, o.pref)) wanted.add(x); }); });
    const ctx = { wanted, near: [], anchor: s };
    let best = null, bestSc = -Infinity;
    const tryX = X => { if (X.length !== n || !X.includes(s)) return; const sc = scoreSeats(b, L, u, X, ctx); if (sc > bestSc) { bestSc = sc; best = X; } };
    [I.order, ...I.sideOrders].forEach(ord => { const fo = ord.filter(x => freeSet.has(x)); const k = fo.indexOf(s); if (k < 0) return; for (let i = Math.max(0, k - n + 1); i <= k && i + n <= fo.length; i++) tryX(fo.slice(i, i + n)); });
    const dist = x => Math.abs(I.geo[x].row - I.geo[s].row) * 4 + (I.geo[x].floor !== I.geo[s].floor ? 400 : 0) + (I.geo[x].side === I.geo[s].side ? 0 : 1) + (I.pair[s] === x ? -3 : 0);
    tryX([s, ...[...freeSet].filter(x => x !== s && !I.host.has(x)).sort((a, c) => dist(a) - dist(c) || a - c).slice(0, n - 1)]);
    if (!best) best = [s];
    const m = matchPeople(L, unit.slice(0, best.length), best);
    unit.slice(0, best.length).forEach(p => { b.seats[m.map[p.id]] = { b: bk.id, pid: p.id }; });
    let rest = 0;
    if (unplaced(b, bk).length) { autoAssign(b, new Set([bk.id])); rest = unplaced(b, bk).length; }
    return { ok: true, left: rest, split: parts.length > 1 };
  }
  // posto per la guida o il secondo autista: il posto rimasto vuoto accanto a un gruppo, il più avanti possibile
  function reserveGuide(b) {
    if (!b.guida || Object.values(b.seats).some(a => a.res)) return null;
    const I = LMAP[b.layout].info;
    const isGroupSeat = s => { const a = b.seats[s]; if (!a || a.res) return false; const bk = bkById(b, a.b); return bk && bk.persone.length >= 2; };
    let s = I.order.find(x => !b.seats[x] && I.pair[x] != null && isGroupSeat(I.pair[x]));
    if (s == null) s = I.order.find(x => !b.seats[x]);
    if (s == null) return null;
    b.seats[s] = { res: 'Guida / 2° autista' }; return s;
  }
  function moveSeat(b, from, to) {
    if (from === to) return; const a = b.seats[from]; if (!a) return; const t = b.seats[to];
    b.seats[to] = a; if (t) b.seats[from] = t; else delete b.seats[from];
  }
  function clearBooking(b, bid) { for (const s of seatsOf(b, bid)) delete b.seats[s]; }
  // Rifinitura: scambia due posti (o sposta su un posto libero) se la piantina migliora:
  // meno coppie divise, meno estranei accanto a un gruppo, gruppi più compatti, nessuna richiesta peggiorata.
  // Si spostano solo le persone sistemate in questo giro (quelle messe a mano restano dove sono).
  function layoutCost(b, L) {
    const I = L.info; let c = 0; const byBk = {}; const size = {};
    b.bookings.forEach(bk => { size[bk.id] = bk.persone.length; });
    for (const s in b.seats) { const a = b.seats[s]; if (a.res) continue; (byBk[a.b] = byBk[a.b] || []).push(+s); }
    for (const s in b.seats) {
      const a = b.seats[s]; if (a.res) continue; const p = I.pair[s]; if (p == null || p < +s) continue;
      const q = b.seats[p]; if (!q || q.res || q.b === a.b) continue;
      if (size[a.b] >= 2 || size[q.b] >= 2) c += 30;
    }
    for (const id in byBk) {
      const seats = byBk[id]; const n = seats.length; if (n < 2) continue;
      const broken = seats.filter(s => I.pair[s] != null && !(b.seats[I.pair[s]] && b.seats[I.pair[s]].b === id)).length;
      c += 40 * Math.max(0, broken - (n % 2));
      const rows = [...new Set(seats.map(s => I.geo[s].floor * 1000 + I.geo[s].row))].sort((x, y) => x - y);
      c += 15 * Math.max(0, rows.length - Math.ceil(n / 2)) + 10 * (rows[rows.length - 1] - rows[0] - (rows.length - 1));
    }
    b.bookings.forEach(bk => { const st = prefStatus(b, bk); if (st === 'ko') c += 1000; else if (st === 'pref') c += 80; });
    return c;
  }
  function improve(b, L, movable) {
    const I = L.info; let cur = layoutCost(b, L); let pass = 0, better = true;
    const swap = (x, y) => { const a = b.seats[x], c = b.seats[y]; if (c) b.seats[x] = c; else delete b.seats[x]; if (a) b.seats[y] = a; else delete b.seats[y]; };
    while (better && pass++ < 12) {
      better = false;
      const cand = I.order.filter(s => !b.seats[s] || (b.seats[s].pid && movable.has(b.seats[s].pid)));
      for (let i = 0; i < cand.length; i++) for (let j = i + 1; j < cand.length; j++) {
        const x = cand[i], y = cand[j]; if (!b.seats[x] && !b.seats[y]) continue;
        if (b.seats[x] && b.seats[y] && b.seats[x].b === b.seats[y].b) continue;
        swap(x, y); const c = layoutCost(b, L);
        if (c < cur - 0.5) { cur = c; better = true; } else swap(x, y);
      }
    }
    b.bookings.forEach(bk => fixPersonSeats(b, bk));
  }
  // (vecchia versione, non più usata) ricompone le coppie rimaste divise scambiando con un passeggero singolo
  function repairPairs(b, L) {
    const I = L.info; let guard = 0, changed = true;
    while (changed && guard++ < 60) {
      changed = false;
      for (const bk of b.bookings) {
        if (bk.persone.length < 2) continue;
        const mine = seatsOf(b, bk.id); const lone = mine.filter(s => I.pair[s] != null && !mine.includes(I.pair[s]));
        if (lone.length < 2) continue;
        const before = prefStatus(b, bk);
        for (const s of lone) {
          const p = I.pair[s]; const a = b.seats[p]; const t = lone.find(x => x !== s && x !== p); if (t == null) continue;
          if (a) { if (a.res) continue; const o = bkById(b, a.b); if (!o || o.persone.length !== 1 || hasAny(o.pref) || o.persone.some(x => hasAny(x.req))) continue; }
          moveSeat(b, t, p);
          if (before === 'ok' && prefStatus(b, bk) !== 'ok') { moveSeat(b, p, t); continue; }
          changed = true; break;
        }
        if (changed) break;
      }
    }
  }

  // ---------- regole dei cartelli (come la procedura "cartelli-posti-bus") ----------
  function righeCartello(bk) {
    const P = bk.persone; const n = P.length;
    if (n === 1) return [P[0].cognome, P[0].nome, 'x 1'].filter((x, i) => i === 2 || x);
    const pers = P.map(p => `${p.cognome} ${p.nome}`.trim());
    let sc;
    if (n <= 3) sc = pers;
    else {
      const pick = []; const seen = new Set();
      P.forEach((p, i) => { const k = (p.cognome || '').toLowerCase(); if (pick.length < 3 && !seen.has(k)) { seen.add(k); pick.push(i); } });
      for (let i = 0; i < n && pick.length < 3; i++) if (!pick.includes(i)) pick.push(i);
      sc = pick.sort((a, c) => a - c).map(i => pers[i]);
    }
    return [...sc, 'x ' + n];
  }
  // Se una prenotazione è seduta in due punti diversi del bus (es. Sorrenti x 4: 2 in 1ª fila e 2 in 5ª fila),
  // ogni parte ha i suoi cartelli con i suoi nomi (x 2). Se è seduta tutta vicina, cartelli della prenotazione intera.
  function seatClusters(b, bk) {
    const I = LMAP[b.layout].info; const seats = seatsOf(b, bk.id); if (!seats.length) return [];
    const parent = {}; seats.forEach(s => { parent[s] = s; });
    const find = s => parent[s] === s ? s : (parent[s] = find(parent[s]));
    seats.forEach(a => seats.forEach(c => { if (a < c) { const ga = I.geo[a], gc = I.geo[c]; if (ga.floor === gc.floor && (ga.row === gc.row || (Math.abs(ga.row - gc.row) === 1 && (ga.side === gc.side || ga.side === 'c' || gc.side === 'c')))) parent[find(a)] = find(c); } }));
    const groups = {}; seats.forEach(s => { const r = find(s); (groups[r] = groups[r] || []).push(s); });
    return Object.values(groups).sort((x, y) => x[0] - y[0]);
  }
  // Cartelli divisi per lato: un cartello per ogni coppia di posti occupata, sul lato autista (sinistra) o lato hostess (destra).
  // Il testo è quello della prenotazione (o della sua parte, se è seduta in due punti diversi del bus).
  function cartelliLati(b, order) {
    const I = LMAP[b.layout].info; const out = { sx: [], dx: [], senza: [] };
    b.bookings.forEach((bk, i) => {
      const cls = seatClusters(b, bk);
      if (!cls.length) { const r = righeCartello({ persone: bk.persone }); for (let k = 0; k < Math.floor((bk.persone.length + 1) / 2); k++) out.senza.push({ lines: r, first: 9999, i }); return; }
      cls.forEach((cl, k) => {
        let ps = cl.map(s => bk.persone.find(p => p.id === b.seats[s].pid)).filter(Boolean);
        if (cls.length === 1 || k === 0) bk.persone.forEach(p => { if (personSeat(b, p.id) == null && !ps.includes(p)) ps.push(p); });
        if (cls.length === 1) ps = bk.persone.slice();
        const lines = righeCartello({ persone: bk.persone.filter(p => ps.includes(p)) });
        const byRow = {}; cl.forEach(s => { const g = I.geo[s]; (byRow[g.floor * 1000 + g.row] = byRow[g.floor * 1000 + g.row] || []).push(s); });
        Object.values(byRow).forEach(seats => {
          seats.sort((x, y) => I.geo[x].col - I.geo[y].col);
          const side = s => { const g = I.geo[s]; if (g.side !== 'c') return g.side; return seats.some(x => I.geo[x].col === g.col - 1) ? 'sx' : 'dx'; };
          ['sx', 'dx'].forEach(sd => {
            const mine = seats.filter(s => side(s) === sd);
            for (let j = 0; j < mine.length; j += 2) out[sd].push({ lines, first: Math.min(...mine.slice(j, j + 2)), seats: mine.slice(j, j + 2), i: i + k / 100 });
          });
        });
      });
    });
    ['sx', 'dx', 'senza'].forEach(sd => out[sd].sort((x, y) => order === 'lista' ? x.i - y.i || x.first - y.first : x.first - y.first || x.i - y.i));
    return out;
  }
  function cartelli(b, order) {
    const items = [];
    b.bookings.forEach((bk, i) => {
      const cl = seatClusters(b, bk);
      if (cl.length <= 1) { items.push({ first: cl[0] ? cl[0][0] : 9999, i, persone: bk.persone }); return; }
      const placed = new Set();
      cl.forEach((seats, k) => {
        const ps = seats.map(s => b.seats[s].pid).map(pid => bk.persone.find(p => p.id === pid)).filter(Boolean);
        ps.forEach(p => placed.add(p.id));
        if (k === 0) bk.persone.forEach(p => { if (personSeat(b, p.id) == null) ps.push(p); });
        const ordered = bk.persone.filter(p => ps.includes(p));
        items.push({ first: seats[0], i: i + k / 100, persone: ordered });
      });
    });
    if (order === 'posto') items.sort((x, y) => x.first - y.first || x.i - y.i); else items.sort((x, y) => x.i - y.i);
    const out = [];
    items.forEach(it => { const r = righeCartello({ persone: it.persone }); const copie = Math.floor((it.persone.length + 1) / 2); for (let k = 0; k < copie; k++) out.push(r); });
    return out;
  }
  // ---------- lettura liste partecipanti ----------
  // Colonne riconosciute dall'intestazione: data (nascita), contatto, «P»/part (partenza; NON «nato/a a»),
  // hotel e C (camera: segnano l'inizio di una camera), fila (posto pagato o richiesto), note.
  const RX = /^(.*?)\s*x\s*(\d+)(?:\s*\/\s*\d+)?\s*$/i;
  function parseRows(rows) {
    rows = rows.map(r => r.map(c => String(c || '').replace(/\s+/g, ' ').trim()));
    const hdr = rows.findIndex(r => r.some(c => /contatto/i.test(c)) && r.some(c => /^data/i.test(c)));
    const idx = { data: 3, tel: 4, part: 5, fila: 6, note: 7, hotel: -1, cam: -1, paid: -1, nato: -1, ann: -1 };
    if (hdr >= 0) {
      const H = rows[hdr].map(c => c.toLowerCase());
      Object.keys(idx).forEach(k => { idx[k] = -1; });
      H.forEach((c, i) => {
        if (/^data/.test(c) && idx.data < 0) idx.data = i;
        if (/contatto/.test(c)) idx.tel = i;
        if ((c === 'p' || c === 'part' || /^partenz/.test(c)) && idx.part < 0) idx.part = i;
        if (c === 'hotel') idx.hotel = i;
        if (c === 'c' || c === 'camera' || c === 'cam') idx.cam = i;
        if (c === 'fila') idx.fila = i;
        if (/^note/.test(c)) idx.note = i;
        if (/^nato/.test(c)) idx.nato = i;
        if (/annullo|rimborso/.test(c)) idx.ann = i;
        // l'ultima colonna «P» (o «€») è quello che ha pagato ciascuno
        if ((c === 'p' || c === '€' || c === 'pagato' || c === 'importo') && idx.part >= 0 && i !== idx.part) idx.paid = i;
      });
      // nell'intestazione cognome e nome sono spesso una sola cella unita: riallineo le colonne
      const di = idx.data; const shift = di >= 0 ? 3 - di : 0;
      if (shift) Object.keys(idx).forEach(k => { if (idx[k] >= di) idx[k] += shift; });
    }
    const out = [], warn = [], raw = []; let cur = null, left = 0, guida = false, prevFila = '';
    for (let i = (hdr >= 0 ? hdr + 1 : 0); i < rows.length; i++) {
      const r = rows[i]; if (!r.length || !r.some(Boolean)) continue;
      const joined = r.join(' ');
      if (/lista d.?attesa|non partono|supplementi per i posti|amici\s*\/\s*tavoli/i.test(joined)) break;
      const hasN = /^\d{1,3}$/.test(r[0] || '');
      const off = hasN ? 0 : -1;
      const cog0 = r[1 + off] || '';
      if (/^-{2,}$/.test(cog0) || /^(accompagnat|autist)/i.test(cog0)) {
        if (/guida|2\s*°?\s*autista|second[oa] autista/i.test(joined)) guida = true;
        // dopo il separatore ci sono solo accompagnatore e autista: guardo se nelle righe successive si parla di guida
        for (let j = i + 1; j < rows.length && j < i + 4; j++) if (/guida|2\s*°?\s*autista/i.test(rows[j].join(' '))) guida = true;
        break;
      }
      if (!hasN && hdr < 0) continue;
      const g = k => idx[k] >= 0 ? (r[idx[k] + off] || '') : '';
      const nome = r[2 + off] || '';
      if (!cog0) continue;
      const m = RX.exec(cog0);
      const isHead = !!m || left === 0;
      // la colonna fila a volte va a capo nella riga sotto: «penult» + «fila», «Ultima» + «fila»
      let filaTxt = g('fila');
      if (/^fila\.?$/i.test(filaTxt.trim()) && !isHead && prevFila) filaTxt = prevFila + ' fila';
      prevFila = filaTxt;
      const note = g('note');
      const fr = filaTxt ? reqFromFila(filaTxt) : null;
      const nr = (!isHead && note) ? reqFromNote(note) : null;
      const hot = g('hotel'), cam = g('cam'), paidTxt = g('paid');
      const person = { id: uid(), cognome: cog0, nome, tel: g('tel'), part: g('part').toUpperCase(), nascita: g('data'), room: !!cam || (!!hot && !isExtraBed(hot)), note: [filaTxt, note].filter(Boolean).join(' · '), np: '', req: fr, _nr: nr, reqTxt: filaTxt };
      if (hot) person.camera = normCam(hot); if (cam) person.ncam = cam; if (g('nato')) person.natoA = g('nato');
      if (/^g(ratis|ratuito)?\.?$/i.test(paidTxt)) person.tipo = 'free'; else if (parseEuro(paidTxt) != null) person._paid = parseEuro(paidTxt);
      if (g('ann')) person._ann = g('ann');
      raw.push({ cognome: cog0, nome, nascita: g('data'), tel: g('tel'), natoA: g('nato'), part: g('part'), hotel: hot, cam, fila: g('fila'), note, pagato: paidTxt, dataAnn: g('ann') });
      if (m) {
        if (left > 0) warn.push(`${cur.persone[0].cognome} x ${cur.n}: nella lista ci sono solo ${cur.n - left} nomi`);
        person.cognome = m[1].trim();
        cur = { n: +m[2], persone: [person], riga: r[0], pref: note ? reqFromNote(note) : null }; out.push(cur); left = cur.n - 1;
      } else if (left > 0) { cur.persone.push(person); left--; }
      else { cur = { n: 1, persone: [person], riga: r[0], pref: note ? reqFromNote(note) : null }; out.push(cur); }
      if (/sostitu|annull|non parte|disdir|disdett/i.test(note)) warn.push(`Riga ${r[0] || '?'} ${person.cognome} ${person.nome}: nota «${note}»`);
    }
    if (left > 0 && cur) warn.push(`${cur.persone[0].cognome} x ${cur.n}: nella lista ci sono solo ${cur.n - left} nomi`);
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1], c = out[i];
      if (a.n === 1 && c.n === 1 && a.persone[0].cognome.toLowerCase() === c.persone[0].cognome.toLowerCase()) warn.push(`Righe ${a.riga}-${c.riga}: due ${c.persone[0].cognome} senza «x N» di seguito, forse manca il gruppo`);
    }
    out.forEach(g => {
      while (g.persone.length < g.n) g.persone.push({ id: uid(), cognome: g.persone[0].cognome, nome: '(da completare)', tel: '', part: g.persone[0].part, note: '', np: '', req: null });
      // Note sulle righe dopo la prima: se chiedono una fila o una zona (es. «Prime file o 2° porta») valgono per
      // tutta la prenotazione, che resta unita; se la prima riga ha già una richiesta, restano della singola persona.
      g.persone.forEach(p => {
        const nr = p._nr; delete p._nr; if (!nr) return;
        if (restrictsRows(nr) && !g.pref) g.pref = nr;
        else { p.req = combineReq(p.req, nr); p.reqTxt = [p.reqTxt, nr.text].filter(Boolean).join(' · '); }
      });
      if (g.persone.length === 1 && g.pref) { g.persone[0].req = combineReq(g.persone[0].req, g.pref); g.persone[0].reqTxt = [g.persone[0].reqTxt, g.pref.text].filter(Boolean).join(' · '); g.pref = null; }
      // pagato secondo la lista (ultima colonna), data di annullo
      g.paid = g.persone.reduce((a, p) => a + (p._paid || 0), 0); g.ann = (g.persone.find(p => p._ann) || {})._ann || '';
      g.bonifico = g.persone.some(p => /bonific/i.test(p.note || ''));
      g.persone.forEach(p => { delete p._paid; delete p._ann; });
    });
    return { bookings: out, warn, guida, raw };
  }
  function parsePaste(text) { return parseRows(text.split(/\r?\n/).map(l => l.split('\t'))); }
  async function docxTables(file) {
    if (!window.JSZip) throw new Error('Per leggere i file .docx serve la connessione a internet.');
    const zip = await window.JSZip.loadAsync(file);
    const f = zip.file('word/document.xml'); if (!f) throw new Error('Il file non sembra un documento Word .docx.');
    const xml = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
    const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const txt = el => Array.from(el.getElementsByTagNameNS(W, 'p')).map(p => Array.from(p.getElementsByTagNameNS(W, 't')).map(t => t.textContent).join('')).join(' ');
    return Array.from(xml.getElementsByTagNameNS(W, 'tbl')).map(t => Array.from(t.getElementsByTagNameNS(W, 'tr')).filter(tr => tr.parentNode === t).map(tr => Array.from(tr.getElementsByTagNameNS(W, 'tc')).filter(tc => tc.parentNode === tr).map(txt)));
  }
  const isPartTable = rows => rows.some(r => r.some(c => /contatto/i.test(c)) && r.some(c => /^\s*data/i.test(c))) && !/lista d.?attesa|non partono/i.test((rows[0] || []).join(' '));
  async function parseDocx(file) {
    const tables = await docxTables(file); const before = [];
    for (const rows of tables) { if (isPartTable(rows)) return parseRows(before.concat(rows)); before.push(...rows); }
    throw new Error('Nel file non ho trovato la tabella dei partecipanti (quella con le colonne «data» e «contatto»).');
  }
  // Lista completa della gita: prezzi in testa, partecipanti, lista d'attesa, annullati (da rimborsare, rimborsati, senza rimborso)
  function isoFromDMY(d, m, y) { y = +y; if (y < 100) y += 2000; return `${y}-${String(+m).padStart(2, '0')}-${String(+d).padStart(2, '0')}`; }
  function parseTripTables(tables) {
    const res = { quota: { suppl: {} }, titolo: '', data: '', fine: '', note: [], part: null, attesa: [], annullati: [], partenze: [] };
    const Q = res.quota; const before = [];
    const val = (r, i) => { for (let j = i + 1; j < r.length && j <= i + 2; j++) { const v = parseEuro(r[j]); if (v != null) return v; } return null; };
    tables.forEach((rows, ti) => {
      rows = rows.map(r => r.map(c => String(c || '').replace(/\s+/g, ' ').trim()));
      const first = (rows[0] || []).join(' ');
      if (/lista d.?attesa/i.test(first)) { res.attesa.push(...parseWaitRows(rows)); return; }
      if (/non partono/i.test(first)) { const kind = /senza/i.test(first) ? 'no' : /gi[aà]\W{0,3}\s*rimbors/i.test(first) ? 'fatto' : 'da'; parseRows(rows).raw.forEach(r => res.annullati.push({ ...r, stato: kind })); return; }
      if (!res.part && isPartTable(rows)) {
        res.part = parseRows(before.concat(rows));
        const h = rows.find(r => r.some(c => /contatto/i.test(c))); if (h && h[1] && !/^cognome$/i.test(h[1]) && !res.titolo) res.titolo = h[1];
        return;
      }
      const flat = rows.map(r => r.join(' ')).join(' ').trim();
      if (rows.length === 1 && /^not[ae]\s*\d*\s*:/i.test(flat)) { const tx = flat.replace(/^not[ae]\s*\d*\s*:\s*/i, '').trim(); if (tx) res.note.push(tx); return; }
      if (!res.part) before.push(...rows);
      if (/amici\s*\/\s*tavoli/i.test(first)) return;
      if (ti === 0 && rows[0] && rows[0][0] && !/^(adulti|data|hotel)$/i.test(rows[0][0])) res.titolo = rows[0][0];
      rows.forEach(r => {
        const lastC = r[r.length - 1] || '';
        if (ti === 0 && r.length >= 3 && /^(\d{1,2}[:.]\d{2}|no)$/i.test(lastC) && r[r.length - 3] && !/€/.test(r[r.length - 3])) res.partenze.push({ citta: r[r.length - 3], luogo: r[r.length - 2], ora: lastC });
        r.forEach(c => { const d = /^([A-Za-z]{2,4})\s*-\s*(.+?):\s*(\d{1,2}[:.]\d{2})$/.exec(c); if (d) res.partenze.push({ citta: d[1], luogo: d[2], ora: d[3] }); });
        r.forEach((c, i) => {
          const l = c.toLowerCase();
          if (l === 'adulti') Q.adulti = val(r, i);
          else if (l === 'singola') Q.singola = val(r, i);
          else if (/^\d+\s*\/\s*1\d\s*anni$/.test(l)) { Q.bambini = val(r, i); Q.bambiniL = c.replace(/\s*\/\s*/, '/'); }
          else if (/^0\s*\/\s*[123]\s*anni$/.test(l)) { Q.infant = val(r, i); Q.infantL = c.replace(/\s*\/\s*/, '/'); }
          else if (/^3\s*°?\s*letto/.test(l)) Q.terzo = val(r, i);
          else if (l === 'acconto') Q.acconto = val(r, i);
          else if (l === 'saldo') { Q.saldo = val(r, i); const d = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(r.slice(i + 1, i + 4).join(' ')); if (d) Q.saldoEntro = isoFromDMY(d[1], d[2], d[3]); }
          else if (l === 'hotel' && r[i + 1]) Q.hotel = r[i + 1];
          else if (l === 'data' && r[i + 1]) { const d = [...r[i + 1].matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g)]; if (d[0]) res.data = isoFromDMY(d[0][1], d[0][2], d[0][3]); if (d[1]) res.fine = isoFromDMY(d[1][1], d[1][2], d[1][3]); }
          else if (!res.data) { const d = /^(lun|mar|mer|gio|ven|sab|dom)\w*\.?\s*-?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i.exec(c); if (d) res.data = isoFromDMY(d[2], d[3], d[4]); }
        });
        // supplementi per i posti assegnati: 1ª–4ª fila sx, 1ª–4ª fila dx, 2ª porta
        const eu = r.filter(c => /€/.test(c)).map(parseEuro).filter(v => v != null);
        if (eu.length >= 8) { [1, 2, 3, 4].forEach((f, k) => { Q.suppl[f] = eu[k]; }); Q.suppl.p2 = eu.length >= 9 ? eu[8] : null; }
      });
    });
    return res;
  }
  function parseWaitRows(rows) {
    const h = rows.findIndex(r => r.some(c => /cognome/i.test(c))); if (h < 0) return [];
    const H = rows[h].map(c => c.toLowerCase()); const col = re => H.findIndex(c => re.test(c));
    const ix = { cog: col(/cognome/), nome: col(/^nome/), nasc: col(/nascita/), tel: col(/contatto/), part: col(/^part/), note: col(/^note/), ric: col(/richiest/), avv: col(/avviso/), risp: col(/risposta/) };
    const out = [];
    rows.slice(h + 1).forEach(r => {
      const g = k => ix[k] >= 0 ? (r[ix[k]] || '').trim() : '';
      const cg = g('cog'); if (!cg) return;
      const m = RX.exec(cg); const n = m ? +m[2] : 1;
      out.push({ cognome: cg, nome: g('nome'), nascita: g('nasc'), tel: g('tel'), part: g('part'), note: g('note'), richiesta: g('ric'), avviso: g('avv'), risposta: g('risp') });
    });
    return out;
  }
  async function parseTripDocx(file) { const res = parseTripTables(await docxTables(file)); if (!res.part) throw new Error('Nel file non ho trovato la tabella dei partecipanti (quella con le colonne «data» e «contatto»).'); return res; }
  // ---------- disegno della piantina ----------
  // Piantina scritta come in ufficio: nel primo posto della coppia i cognomi (con l'iniziale del nome),
  // nel secondo «x 2», «x 5»…; chi è da solo ha cognome, nome e «x 1» nel suo posto;
  // il posto vuoto accanto all'ultimo di un gruppo è barrato.
  function officeLabels(b) {
    const I = LMAP[b.layout].info; const out = {};
    const nm = p => `${String(p.cognome || '').toUpperCase()}${p.nome && !/^\(/.test(p.nome) ? ' ' + p.nome.trim()[0].toUpperCase() + '.' : ''}`;
    b.bookings.forEach(bk => {
      const cls = seatClusters(b, bk); const total = bk.full ? bk.full.persone.length : bk.persone.length;
      cls.forEach(cl => {
        const ps = bk.persone.filter(p => cl.some(s => b.seats[s] && b.seats[s].pid === p.id));
        if (!ps.length) return;
        const n = cls.length > 1 || bk.persone.length < total ? ps.length : total;
        const lines = n === 1 ? [String(ps[0].cognome || '').toUpperCase(), String(ps[0].nome || '').toUpperCase()].filter(Boolean) : ps.slice(0, 2).map(nm);
        const byRow = {}; cl.forEach(s => { const g = I.geo[s]; const k = g.floor * 1000 + g.row; (byRow[k] = byRow[k] || []).push(s); });
        Object.values(byRow).forEach(seats => {
          seats.sort((x, y) => I.geo[x].col - I.geo[y].col);
          const runs = []; let cur = [];
          seats.forEach(s => { if (cur.length && I.geo[s].col !== I.geo[cur[cur.length - 1]].col + 1) { runs.push(cur); cur = []; } cur.push(s); });
          if (cur.length) runs.push(cur);
          runs.forEach(r => {
            if (r.length === 1) { out[r[0]] = { t: 'both', lines, x: n }; return; }
            const m = Math.floor((r.length - 1) / 2);
            r.forEach(s => { out[s] = { t: 'occ' }; }); out[r[m]] = { t: 'names', lines }; out[r[m + 1]] = { t: 'x', x: n };
          });
        });
      });
    });
    I.order.forEach(s => {
      if (b.seats[s]) return; const p = I.pair[s]; if (p == null) return; const a = b.seats[p]; if (!a || a.res) return;
      const bk = bkById(b, a.b); if (bk && (bk.full ? bk.full.persone.length : bk.persone.length) >= 2) out[s] = { t: 'cross' };
    });
    return out;
  }
  function seatCell(b, s, host, span, o) {
    const a = b && b.seats[s]; const lab = o.lab && o.lab[s];
    let cls = 'c seat', style = `grid-column:span ${span}`, inner = `<span class="sn">${s}</span>`, title = '';
    if (host) cls += ' host';
    const attrs = drag => o.interactive ? ` data-seat="${s}" tabindex="0" draggable="${drag}"` : '';
    if (a && a.res) {
      cls += ' res cross'; inner += `<span class="ores">${esc(/guida/i.test(a.res) ? 'GUIDA o 2° AUTISTA' : a.res)}</span>`;
      return `<div class="${cls}" style="${style}"${attrs(false)}>${inner}</div>`;
    }
    let filled = false;
    if (a) {
      const bk = bkById(b, a.b); const p = bk && bk.persone.find(x => x.id === a.pid);
      if (bk && p) {
        filled = true; cls += ' occ';
        if (!o.print) style += `;background:${COLORS[(bk.c || 0) % COLORS.length]}`;
        title = `Posto ${s}: ${p.cognome} ${p.nome} — ${bkName(bk)} x ${bk.full ? bk.full.persone.length : bk.persone.length}${p.part ? ' · ' + p.part : ''}${p.np ? ' · ' + p.np : ''}`;
        if (lab && (lab.t === 'names' || lab.t === 'both')) inner += `<span class="ol">${lab.lines.map(esc).join('<br>')}</span>`;
        if (lab && lab.t === 'both') cls += ' both';
        if (lab && (lab.t === 'x' || lab.t === 'both')) inner += `<span class="ox${lab.t === 'both' ? ' in' : ''}">x${lab.x}</span>`;
        if (lab && lab.t === 'occ' && !o.print) inner += `<span class="ofaint">${esc(String(p.cognome || '').toUpperCase())}</span>`;
        if (p.np) inner += `<span class="onp">${esc(p.np)}</span>`;
        if (o.interactive) { const on = UI.sel === bk.id || UI.selP === p.id; if (on) cls += ' hl'; else if (UI.sel || UI.selP) cls += ' dim'; if (UI.move === s) cls += ' moving'; }
      }
    }
    if (!filled) {
      cls += ' free'; if (lab && lab.t === 'cross') cls += ' cross';
      if (host) inner += `<span class="tagh">${b && b.accompagnatore ? esc(b.accompagnatore) : 'hostess'}</span>`;
      if (o.want && o.want.has(s)) cls += ' want';
    }
    return `<div class="${cls}" style="${style}"${title ? ` title="${esc(title)}"` : ''}${attrs(filled)}>${inner}</div>`;
  }
  function rowHTML(row, b, o) {
    let hasSeat = false; let h = '';
    row.forEach(c => {
      const ci = cellInfo(c); const sp = `grid-column:span ${ci.c}`;
      if (ci.t === 'seat') { hasSeat = true; h += o.mini ? `<div class="c seat${ci.h ? ' host' : ''}" style="${sp}"><span class="sn">${ci.s}</span></div>` : seatCell(b, ci.s, ci.h, ci.c, o); }
      else if (ci.t === 'aisle') h += `<div class="c aisle" style="${sp}"></div>`;
      else if (ci.t === 'void') h += `<div class="c void" style="${sp}"></div>`;
      else if (ci.t === 'logo') h += `<div class="c logo" style="${sp};background-image:url(${LOGO})"></div>`;
      else {
        const label = ci.f === 'autista' && b && b.autista && !o.mini ? `autista<small>${esc(b.autista)}</small>` : esc(ci.f);
        h += `<div class="c feat feat-${ci.f}" style="${sp}">${label}</div>`;
      }
    });
    return `<div class="${o.print ? 'prow' : 'row'}${hasSeat ? '' : ' thin'}">${h}</div>`;
  }
  function deckHTML(b, L, fi, o) {
    const fl = L.floors[fi]; if (b && !o.lab) o.lab = officeLabels(b);
    return `<div class="deck">${fi === 0 ? '<span class="front">Davanti</span>' : '<span class="front">Davanti · piano sopra</span>'}${fl.nome ? `<div class="fname">${esc(fl.nome)}</div>` : ''}${fl.rows.map(r => rowHTML(r, b, o)).join('')}</div>`;
  }

  // ---------- la lista della gita (come il file Word) ----------
  // t.rows = righe della tabella partecipanti, scritte come in Word: «Rossi x 3» sulla prima riga e poi le altre persone.
  // Le prenotazioni si ricavano dalle righe; ogni riga sa su quale bus è (row.bus) e i bus sanno quale posto ha ogni persona.
  const ROWF = ['cognome', 'nome', 'nascita', 'tel', 'natoA', 'part', 'hotel', 'cam', 'fila', 'note', 'pagato'];
  const blankRow = () => ({ id: uid(), cognome: '', nome: '', nascita: '', tel: '', natoA: '', part: '', hotel: '', cam: '', fila: '', note: '', pagato: '' });
  const blankAtt = () => ({ id: uid(), cognome: '', nome: '', nascita: '', tel: '', part: '', note: '', richiesta: '', avviso: '', risposta: '' });
  const isEmptyRow = r => !ROWF.some(f => String(r[f] || '').trim()) && !['richiesta', 'avviso', 'risposta', 'dataAnn'].some(f => String(r[f] || '').trim());
  function tripInit(t) {
    t.quota = t.quota || {}; t.quota.suppl = t.quota.suppl || {};
    t.rows = t.rows || []; t.attesa = t.attesa || []; t.annullati = t.annullati || []; t.partenze = t.partenze || []; t.buses = t.buses || [];
    return t;
  }
  const isTourT = t => !!(t.fine && t.fine !== t.data) || (t.rows || []).some(r => r.hotel || r.cam);
  function ensureBlank(t) {
    tripInit(t);
    let k = 0; for (let i = t.rows.length - 1; i >= 0 && isEmptyRow(t.rows[i]); i--) k++;
    while (k < 3) { t.rows.push(blankRow()); k++; }
    let a = 0; for (let i = t.attesa.length - 1; i >= 0 && isEmptyRow(t.attesa[i]); i--) a++;
    while (a < 2) { t.attesa.push(blankAtt()); a++; }
  }
  function deriveBookings(t) {
    tripInit(t);
    const out = []; let cur = null, left = 0, prevFila = '';
    t.rows.forEach((r, i) => {
      const cg = String(r.cognome || '').trim(), nm = String(r.nome || '').trim();
      if (!cg && !nm) return;
      const m = RX.exec(cg);
      const isHead = !!m || left === 0;
      let filaTxt = String(r.fila || '').trim();
      if (/^fila\.?$/i.test(filaTxt) && !isHead && prevFila) filaTxt = prevFila + ' fila';
      prevFila = filaTxt;
      const note = String(r.note || '').trim();
      const fr = filaTxt ? reqFromFila(filaTxt) : null;
      const nr = (!isHead && note) ? reqFromNote(note) : null;
      const p = { id: r.id, row: r, riga: i + 1, cognome: m ? m[1].trim() : cg, nome: nm, tel: r.tel || '', part: String(r.part || '').toUpperCase(), nascita: r.nascita || '', natoA: r.natoA || '', note: [filaTxt, note].filter(Boolean).join(' · '), np: r.np || '', req: fr, _nr: nr, reqTxt: filaTxt };
      const hot = String(r.hotel || '').trim(), cam = String(r.cam || '').trim();
      p.room = !!cam || (!!hot && !isExtraBed(hot)); if (hot) p.camera = normCam(hot); if (cam) p.ncam = cam;
      const pg = String(r.pagato || '').trim();
      if (/^g(ratis|ratuito)?\.?$/i.test(pg)) p.tipo = 'free';
      p._paid = parseEuro(pg) || 0;
      if (m) { cur = { id: r.id, n: +m[2], persone: [p], ord: i + 1, pref: note ? reqFromNote(note) : null, head: r }; out.push(cur); left = cur.n - 1; }
      else if (left > 0) { cur.persone.push(p); left--; }
      else { cur = { id: r.id, n: 1, persone: [p], ord: i + 1, pref: note ? reqFromNote(note) : null, head: r }; out.push(cur); }
    });
    out.forEach(g => {
      g.persone.forEach(p => {
        const nr = p._nr; delete p._nr; if (!nr) return;
        if (restrictsRows(nr) && !g.pref) g.pref = nr;
        else { p.req = combineReq(p.req, nr); p.reqTxt = [p.reqTxt, nr.text].filter(Boolean).join(' · '); }
      });
      if (g.persone.length === 1 && g.pref) { g.persone[0].req = combineReq(g.persone[0].req, g.pref); g.pref = null; }
      g.mancano = Math.max(0, g.n - g.persone.length);
      g.abituale = !!g.head.abituale; g.c = g.head.c;
      g.pagamenti = [{ importo: g.persone.reduce((a, p) => a + (p._paid || 0), 0) }];
      g.persone.forEach(p => { p.full = g; });
    });
    return out;
  }
  // prenotazioni (o parti di prenotazione) che stanno su un bus, nel formato che usa il motore dei posti
  function syncBus(t, b, D) {
    D = D || deriveBookings(t);
    const pmap = {}; D.forEach(bk => bk.persone.forEach(p => { pmap[p.id] = { bk, p }; }));
    b.bookings = D.map(bk => {
      const ps = bk.persone.filter(p => p.row.bus === b.id); if (!ps.length) return null;
      return { id: bk.id, c: bk.head.c != null ? bk.head.c : (bk.ord % COLORS.length), persone: ps, pref: bk.pref, abituale: bk.abituale, ord: bk.ord, full: bk };
    }).filter(Boolean);
    for (const s in b.seats) { const a = b.seats[s]; if (a.res) continue; const x = pmap[a.pid]; if (!x || x.p.row.bus !== b.id) { delete b.seats[s]; continue; } a.b = x.bk.id; }
    return b.bookings;
  }
  function syncAll(t) { const D = deriveBookings(t); t.buses.forEach(b => syncBus(t, b, D)); return D; }
  function seatIndex(t) { const SI = {}; t.buses.forEach(b => { for (const s in b.seats) { const a = b.seats[s]; if (a.pid) SI[a.pid] = { b, s: +s }; } }); return SI; }
  const rowById = (t, id) => t.rows.find(r => r.id === id);
  function unseatRow(t, r) { t.buses.forEach(x => { for (const s in x.seats) if (x.seats[s].pid === r.id) delete x.seats[s]; }); }
  function giveColor(t, b, bk) {
    const used = b.bookings.filter(o => o.id !== bk.id).map(o => o.full.head.c).filter(v => v != null);
    if (bk.head.c != null && !used.includes(bk.head.c)) return;
    let c = 0; while (used.includes(c) && c < COLORS.length) c++; bk.head.c = c % COLORS.length;
  }
  // una prenotazione intera lasciata su un posto: il posto scelto resta, il resto del gruppo si siede accanto con le regole
  function dropFamily(t, bkId, b, s) {
    let D = syncAll(t); const bk = D.find(x => x.id === bkId); if (!bk) return { ok: false };
    const a = b.seats[s];
    if (a && (a.res || a.b !== bk.id)) return { ok: false, msg: a.res ? `Il posto ${s} è riservato (${a.res})` : `Il posto ${s} è già occupato` };
    bk.persone.forEach(p => { unseatRow(t, p.row); p.row.bus = b.id; });
    D = syncAll(t); const bb = bkById(b, bkId); giveColor(t, b, D.find(x => x.id === bkId)); syncBus(t, b, D);
    placeAt(b, bkById(b, bkId), s);
    return { ok: true, bk: bkById(b, bkId) };
  }
  // una sola persona: va esattamente sul posto scelto (se è occupato da uno dello stesso bus, si scambiano)
  function dropPerson(t, pid, b, s) {
    const r = rowById(t, pid); if (!r) return { ok: false };
    const SI = seatIndex(t); const cur = SI[pid]; const a = b.seats[s];
    if (a && a.res) return { ok: false, msg: `Il posto ${s} è riservato (${a.res})` };
    if (a && a.pid === pid) return { ok: true };
    if (a) {
      if (cur && cur.b === b) { moveSeat(b, cur.s, s); syncAll(t); return { ok: true, swap: true }; }
      return { ok: false, msg: `Il posto ${s} è già occupato: liberalo prima, oppure trascina qui una persona già su questo bus per scambiarli` };
    }
    unseatRow(t, r); r.bus = b.id;
    const D = syncAll(t); const bk = D.find(x => x.persone.some(p => p.id === pid));
    giveColor(t, b, bk); b.seats[s] = { pid, b: bk.id }; syncAll(t);
    return { ok: true };
  }
  function toBusAuto(t, bkIds, b) {
    let D = syncAll(t);
    bkIds.forEach(id => { const bk = D.find(x => x.id === id); if (!bk) return; bk.persone.forEach(p => { if (p.row.bus !== b.id) { unseatRow(t, p.row); p.row.bus = b.id; } }); });
    D = syncAll(t); bkIds.forEach(id => { const bk = D.find(x => x.id === id); if (bk) giveColor(t, b, bk); });
    syncBus(t, b, D);
    return autoAssign(b, new Set(bkIds));
  }
  function summaryOf(t, D, SI) {
    let pers = 0, due = 0, paid = 0, unknown = 0, daSaldare = 0, seated = 0, mancano = 0; const rooms = {}; let nRooms = 0;
    D.forEach(bk => {
      pers += bk.persone.length; mancano += bk.mancano;
      const m = bkMoney(t, bk); bk._m = m;
      if (m.due == null) unknown++; else due += m.due; paid += m.paid;
      if (!m.saldato && !bk.head.saldato) daSaldare++;
      bk.persone.forEach(p => { if (SI[p.id]) seated++; });
      roomsOf(bk).forEach(r => { const k = roomKind(r); rooms[k] = (rooms[k] || 0) + 1; nRooms++; });
    });
    const cap = t.buses.reduce((a, b) => a + LMAP[b.layout].info.cap, 0);
    const att = t.attesa.filter(r => !isEmptyRow(r)).reduce((a, r) => { const m = RX.exec(String(r.cognome || '').trim()); return a + (m ? +m[2] : 1); }, 0);
    return { pers, nBk: D.length, due, paid, unknown, daSaldare, seated, mancano, rooms, nRooms, cap, att, ann: t.annullati.filter(r => !isEmptyRow(r)).length };
  }
  const saldato = bk => !!(bk.head.saldato || (bk._m && bk._m.saldato));
  function roomsText(rooms) {
    const order = ['singola', 'doppia', 'matrimoniale', 'tripla', 'quadrupla'];
    const pl = { singola: 'singole', doppia: 'doppie', matrimoniale: 'matrimoniali', tripla: 'triple', quadrupla: 'quadruple' };
    return Object.keys(rooms).sort((a, c) => order.indexOf(a) - order.indexOf(c)).map(k => `${rooms[k]} ${rooms[k] > 1 ? (pl[k] || k) : k}`).join(' · ');
  }

  // ---------- viste ----------
  const listCols = (tour, bigl) => bigl
    ? [['cognome', 'cognome'], ['nome', 'nome'], ['tel', 'contatto'], ['note', 'note / mail'], ['pagato', '€']]
    : tour
    ? [['cognome', 'cognome'], ['nome', 'nome'], ['nascita', 'data'], ['tel', 'contatto'], ['natoA', 'nato/a a'], ['part', 'P'], ['hotel', 'hotel'], ['cam', 'C'], ['fila', 'fila'], ['note', 'note / mail'], ['pagato', 'P']]
    : [['cognome', 'cognome'], ['nome', 'nome'], ['nascita', 'data'], ['tel', 'contatto'], ['part', 'part'], ['fila', 'fila'], ['note', 'note / mail'], ['pagato', '€']];
  const ATTC = [['cognome', 'Cognome'], ['nome', 'Nome'], ['nascita', 'data di nascita'], ['tel', 'contatto'], ['part', 'part'], ['note', 'note'], ['richiesta', 'data di richiesta'], ['avviso', 'data di avviso'], ['risposta', 'risposta del cliente']];
  function syncInfo(st) {
    st = st || STORE.status();
    if (!st.hasKey || !st.linked) return ['local', 'Solo questo computer', 'I dati restano su questo computer: per lavorare con le altre agenzie collega Dropbox in Impostazioni › Sincronizzazione'];
    if (!st.online) return ['off', `Senza internet${st.pending ? ' · ' + st.pending + ' da inviare' : ''}`, 'Puoi continuare a lavorare: le modifiche partono appena torna la connessione'];
    if (st.error) return ['err', 'Sincronizzazione in pausa', 'Dropbox non risponde: riprovo da solo tra poco'];
    if (st.syncing || st.pending) return ['busy', st.pending ? `Invio ${st.pending}…` : 'Aggiorno…', 'Sto allineando i dati con gli altri computer'];
    return ['ok', 'Sincronizzato', st.last ? `Ultimo aggiornamento alle ${st.last.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : ''];
  }
  function topbar() {
    const me = ACC.me(); const ag = ACC.agency(); const [sk, sl, st] = syncInfo();
    const v = UI.view; const nb = (view, label, ico, perm) => !perm || ACC.can(perm) ? `<button class="tlink" data-act="nav" data-v="${view}" aria-current="${v === view ? 'page' : 'false'}">${ico}<span>${label}</span></button>` : '';
    return `<header class="topbar"><div class="in">
      <button class="brand" data-act="nav" data-v="${ACC.can('viaggi') ? 'home' : 'conta'}" aria-label="Viaggi in Pullman, pagina iniziale"><img class="logo" src="${LOGO}" alt="La Terra"><span class="appname">Viaggi <span>in Pullman</span></span></button>
      ${ACC.can('viaggi') ? `<nav class="nav" aria-label="Sezioni"><button data-act="nav" data-v="home" aria-pressed="${v === 'home' || v === 'trip'}">Viaggi</button><button data-act="nav" data-v="models" aria-pressed="${v === 'models'}">Piantine</button></nav>` : ''}
      <span class="spacer"></span>
      <span id="syncpill" class="sync ${sk}" title="${esc(st)}" role="status"><i></i>${esc(sl)}</span>
      ${ag ? `<button class="agchip" data-act="changeag" title="Cambia agenzia">${ICON.pin}${esc(ag.nome)}<span class="agc"> · ${esc(ag.cassa || ag.nome)}</span></button>` : ''}
      ${nb('cassa', 'Cassa', ICON.cash, ACC.can('cassa') || ACC.can('cassaAll') ? null : 'x')}${nb('conta', 'Contabilità', ICON.chart, 'conta')}${nb('anag', 'Anagrafica', ICON.users, 'anag')}${nb('settings', 'Impostazioni', ICON.gear)}${nb('super', 'Super Master', ICON.tool, 'tech')}
      ${me ? `<button class="me" data-act="memenu" aria-label="${esc(me.name)}: account"><span class="av">${esc((me.name || '?')[0].toUpperCase())}</span><span class="mt"><b>${esc(me.name)}</b><small>${esc(ROLE_L[me.role])}</small></span></button>` : ''}
    </div></header>`;
  }
  const CAT_L = { gita: 'Gita', tour: 'Tour', evento: 'Evento', biglietteria: 'Biglietteria' };
  const tripCat = t => t.cat || (t.fine && t.fine !== t.data ? 'tour' : 'gita');
  const nGiorni = t => !t.fine || t.fine === t.data ? 1 : Math.round((parseD(t.fine) - parseD(t.data)) / 864e5) + 1;
  function homeYear() {
    const today = todayISO(), y0 = today.slice(0, 4);
    const years = [...new Set(S.trips.map(t => t.data.slice(0, 4)))].sort();
    if (UI.year && years.includes(UI.year)) return { years, y: UI.year };
    const real = S.trips.filter(t => !t.demo && (t.fine || t.data) >= today).map(t => t.data.slice(0, 4)).sort();
    return { years, y: real.includes(y0) ? y0 : (real[0] || years.find(y => y >= y0) || years[years.length - 1] || y0) };
  }
  function homeView() {
    const today = todayISO(); const { years, y } = homeYear(); UI.year = y;
    const ofYear = S.trips.filter(t => t.data.slice(0, 4) === y);
    const cnt = c => ofYear.filter(t => tripCat(t) === c).length;
    let list = ofYear.slice();
    const cat = UI.cat || 'tutte';
    if (cat !== 'tutte') list = list.filter(t => tripCat(t) === cat);
    if (UI.hidePast) list = list.filter(t => (t.fine || t.data) >= today);
    const q = (UI.hq || '').toLowerCase().trim(); if (q) list = list.filter(t => `${t.nome} ${t.code || ''}`.toLowerCase().includes(q));
    list.sort((a, b) => a.data.localeCompare(b.data) || (tripCat(a) === 'tour' ? -1 : 1) || a.nome.localeCompare(b.nome));
    const byM = {}; list.forEach(t => { const m = +t.data.slice(5, 7) - 1; (byM[m] = byM[m] || []).push(t); });
    const demo = '';
    const ycnt = yy => S.trips.filter(t => t.data.slice(0, 4) === yy).length;
    const mcount = arr => { const g = arr.filter(t => tripCat(t) === 'gita').length, tt = arr.filter(t => tripCat(t) === 'tour').length, e = arr.filter(t => tripCat(t) === 'evento').length, bg = arr.filter(t => tripCat(t) === 'biglietteria').length; return [g ? `${g} ${g > 1 ? 'gite' : 'gita'}` : '', tt ? `${tt} tour` : '', e ? `${e} ${e > 1 ? 'eventi' : 'evento'}` : '', bg ? `${bg} biglietteria` : ''].filter(Boolean).join(' · '); };
    return `${demo}
      <div class="pagehead"><div><h1>Viaggi ${esc(y)}</h1><div class="sub">${ofYear.length} ${ofYear.length === 1 ? 'viaggio' : 'viaggi'} in programma${mcount(ofYear) ? ' · ' + mcount(ofYear) : ''}. Apri la lista per le prenotazioni, «Posti sul bus» per la piantina.</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" data-act="newfromdoc">${ICON.upload} Nuovo viaggio da lista Word</button>
          <button class="btn primary" data-act="newtrip">${ICON.plus} Nuovo viaggio</button>
        </div></div>
      <div class="hfilters">
        <div class="seg" role="group" aria-label="Anno">${years.map(yy => `<button data-act="year" data-v="${yy}" aria-pressed="${yy === y}">${yy} <small>${ycnt(yy)}</small></button>`).join('')}</div>
        <div class="seg catseg" role="group" aria-label="Tipo">${[['tutte', `Tutte ${ofYear.length}`], ['gita', `Gite ${cnt('gita')}`], ['tour', `Tour ${cnt('tour')}`], ...(cnt('evento') ? [['evento', `Eventi ${cnt('evento')}`]] : []), ...(cnt('biglietteria') ? [['biglietteria', `Biglietteria ${cnt('biglietteria')}`]] : [])].map(([v, l]) => `<button data-act="hcat" data-v="${v}" aria-pressed="${cat === v}" class="c-${v}">${l}</button>`).join('')}</div>
        <label class="chk small"><input type="checkbox" data-act="hidepast"${UI.hidePast ? ' checked' : ''}> Nascondi quelle già fatte</label>
        <input class="search" type="search" data-hq="1" placeholder="Cerca viaggio o codice (es. T08)" value="${esc(UI.hq || '')}" aria-label="Cerca">
      </div>
      <nav class="mstrip" aria-label="Mesi">${MESI.map((m, i) => byM[i] ? `<a class="mchip" href="#m-${i}"><b>${m}</b><span>${byM[i].length}</span></a>` : `<span class="mchip off"><b>${m}</b><span>–</span></span>`).join('')}</nav>
      <div class="months">${Object.keys(byM).map(Number).sort((a, b) => a - b).map(m => `<section class="month" id="m-${m}">
          <div class="mh"><h2>${MESI_L[m]} <span>${esc(y)}</span></h2><span class="mc">${mcount(byM[m])}</span></div>
          <div class="tl">${byM[m].map(t => tripRow(t, today)).join('')}</div></section>`).join('') || `<div class="empty">Nessuna gita con questi filtri.</div>`}</div>`;
  }
  function tripRow(t, today) {
    tripInit(t); const D = syncAll(t); const SI = seatIndex(t); const T = summaryOf(t, D, SI);
    const c = tripCat(t); const d = parseD(t.data); const n = nGiorni(t); const f = t.fine ? parseD(t.fine) : null;
    const past = (t.fine || t.data) < today;
    const when = n > 1 ? `${GIORNI[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESI[d.getMonth()]} → ${GIORNI[f.getDay()].slice(0, 3)} ${f.getDate()} ${MESI[f.getMonth()]} · ${n} giorni` : `${GIORNI[d.getDay()]} · in giornata`;
    const st = !T.pers ? '<span class="pill neutral">lista vuota</span>' : c === 'biglietteria' ? `<span class="pill neutral">${T.pers} biglietti</span>` : `<span class="pill ${T.seated === T.pers ? 'ok' : 'tbd'}">${T.pers} persone${T.seated < T.pers ? ` · ${T.pers - T.seated} senza posto` : ''}</span>`;
    const buses = t.buses.length ? `<span class="pill neutral">${ICON.bus} ${t.buses.length} bus · ${t.buses.reduce((a, b) => a + busStats(b).tot, 0)}/${T.cap}</span>` : '';
    return `<article class="trow c-${c}${t.extra ? ' extra' : ''}${past ? ' past' : ''}" data-droptrip="${t.id}">
      <div class="tr-d" data-act="opentrip" data-id="${t.id}"><b>${d.getDate()}${n > 1 && f.getMonth() === d.getMonth() ? `<small>–${f.getDate()}</small>` : ''}</b><span>${GIORNI[d.getDay()].slice(0, 3)}</span></div>
      <div class="tr-b" data-act="opentrip" data-id="${t.id}">
        <div class="tr-t"><span class="cat">${CAT_L[c]}</span>${t.code ? `<span class="tcode">${esc(t.code)}</span>` : ''}${t.extra ? '<span class="xtra">extra</span>' : ''}<h3>${esc(t.nome)}</h3></div>
        <div class="tr-m"><span>${esc(when)}</span>${t.quota && t.quota.hotel ? `<span>Hotel ${esc(t.quota.hotel)}</span>` : ''}${past ? '<span>già fatta</span>' : ''}</div>
      </div>
      <div class="tr-s">${st}${buses}</div>
      <div class="tr-a"><button class="btn sm" data-act="opentrip" data-id="${t.id}" data-sec="lista">${ICON.list} Lista</button>${c !== 'biglietteria' ? `<button class="btn sm" data-act="opentrip" data-id="${t.id}" data-sec="posti">${ICON.bus} Posti</button>` : ''}</div>
    </article>`;
  }
  function busRow(t, b) {
    const L = LMAP[b.layout]; const st = busStats(b);
    const pill = !st.tot ? '<span class="pill neutral">vuoto</span>' : st.todo > 0 ? `<span class="pill tbd">${st.todo} da sistemare</span>` : '<span class="pill ok">posti assegnati</span>';
    const wPlaced = Math.min(100, st.placed / st.cap * 100), wTodo = Math.min(100 - wPlaced, st.todo / st.cap * 100);
    return `<button class="busrow" data-act="openbus" data-trip="${t.id}" data-bus="${b.id}">
      <span class="bi">${ICON.bus}</span>
      <span><span class="bn">${esc(b.label)}</span> <span class="bm">· ${esc(L.nome)} · ${st.tot}/${st.cap} posti${b.autista ? ' · ' + esc(b.autista) : ''}</span></span>
      <span style="display:flex;gap:4px">${pill}</span>
      <span class="bar" aria-hidden="true"><i style="width:${wPlaced}%"></i><i class="part" style="width:${Math.max(0, wTodo)}%"></i></span>
    </button>`;
  }
  function modelsView() {
    return `<div class="pagehead"><div><h1>Piantine dei pullman</h1><div class="sub">Le piantine della flotta, come nei vostri file Word. Si scelgono quando aggiungi un bus a una gita.</div></div></div>
      <div class="models">${window.LAYOUTS.map(L => modelCard(L)).join('')}</div>
      <div class="infobox">Manca la piantina del minibus da 19 posti: quando me la mandi la aggiungo. Nel Setra 417 (63 posti) il vostro file riporta «39» al posto del 30 nella fila 29–32: qui è corretto in 30.</div>`;
  }
  function modelCard(L, pick) {
    return `<div class="model${pick && pick === L.id ? ' on' : ''}"${pick !== undefined ? ` data-act="picklayout" data-id="${L.id}" tabindex="0"` : ''}>
      <div><h3>${esc(L.nome)}</h3><div class="meta">${esc(L.desc)}${L.flotta ? ` · in flotta: ${L.flotta}` : ''}</div></div>
      <div class="mini">${L.floors.map((f, i) => deckHTML(null, L, i, { mini: true })).join('')}</div>
    </div>`;
  }
  function progBox(t) {
    const pdf = t.pdf ? `<span class="prog"><button class="btn sm" data-act="openpdf" data-id="${t.id}">${ICON.link} ${esc(t.pdf.name)}</button><button class="kebab" data-act="delpdf" data-id="${t.id}" aria-label="Togli il PDF">${ICON.close}</button></span>` : '';
    const link = t.programma ? `<a class="btn sm" href="${esc(t.programma)}" target="_blank" rel="noopener">${ICON.link} Link programma</a>` : '';
    const drop = !t.pdf ? `<label class="pdfdrop" for="pdf-in-${t.id}">${ICON.upload} Trascina qui il programma (PDF o foto)<input id="pdf-in-${t.id}" class="pdf-in" data-trip="${t.id}" type="file" accept="application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png" hidden></label>` : '';
    return pdf + link + drop;
  }
  function tripView() {
    const t = trip(); if (!t) { UI.view = 'home'; return homeView(); }
    tripInit(t); ensureBlank(t); const bigl = tripCat(t) === 'biglietteria'; if (bigl) UI.sec = 'lista';
    if (!bus() && t.buses.length) UI.busId = t.buses[0].id;
    const D = syncAll(t); const SI = seatIndex(t); const T = summaryOf(t, D, SI);
    const head = `<div class="crumbs"><a data-act="nav" data-v="home">Viaggi</a><span>›</span><span>${esc(t.nome)}</span></div>
      <div class="tripbar" data-droptrip="${t.id}"><h1>${esc(t.nome)}</h1><span class="pill neutral">${esc(fmtTripDate(t, true))}</span>${progBox(t)}<button class="btn sm ghost" data-act="edittrip">${ICON.edit} Modifica gita</button></div>
      <div class="ptabs" role="tablist"><button role="tab" data-act="sec" data-v="lista" aria-selected="${UI.sec !== 'posti'}">${ICON.list} ${bigl ? 'Biglietti venduti' : 'Lista prenotazioni'} <span>${T.pers} persone${T.att ? ` · ${T.att} in attesa` : ''}</span></button>${bigl ? '' : `<button role="tab" data-act="sec" data-v="posti" aria-selected="${UI.sec === 'posti'}">${ICON.bus} Posti sul bus <span>${T.seated}/${T.pers} con il posto</span></button>`}</div>`;
    return head + (UI.sec === 'posti' ? postiView(t, D, SI, T) : listaView(t, D, SI, T));
  }

  // ----- sezione 1: la lista prenotazioni, come il file Word -----
  function headBlock(t) {
    const Q = t.quota; const tour = isTourT(t); const cat = tripCat(t); const bigl = cat === 'biglietteria'; const tk = bigl || cat === 'evento';
    const e = (k, ph = '') => `<input class="hc num" data-q="${k}" inputmode="decimal" value="${Q[k] != null ? esc(String(Q[k]).replace('.', ',')) : ''}" placeholder="${ph}">`;
    const tx = (k, ph = '') => `<input class="hc" data-qt="${k}" value="${esc(Q[k] || '')}" placeholder="${ph}">`;
    const tkRow = tk ? `<div class="wh-tkt"><b>${bigl ? 'Biglietto' : 'Biglietto dell\'evento (se lo vendete voi)'}</b><label>intero €${e('tkt1')}</label><label><input class="hc lab" data-qt="tkt2L" value="${esc(Q.tkt2L || 'ridotto')}" aria-label="Nome del ridotto"> €${e('tkt2')}</label><label>diritti € (a biglietto)${e('diritti')}</label><label>circuito<select class="hc" data-qt="circuito"><option value="">—</option>${CIRCUITI.map(c => `<option${Q.circuito === c ? ' selected' : ''}>${c}</option>`).join('')}</select></label></div>` : '';
    const deps = [0, 1, 2].map(i => { const d = t.partenze[i] || {}; return `<div class="hdep"><input class="hc" data-dep2="${i}" data-k="citta" value="${esc(d.citta || '')}" placeholder="città"><input class="hc" data-dep2="${i}" data-k="luogo" value="${esc(d.luogo || '')}" placeholder="luogo"><input class="hc" data-dep2="${i}" data-k="ora" value="${esc(d.ora || '')}" placeholder="ora"></div>`; }).join('');
    return `<div class="whead${bigl ? ' bigl' : ''}">
      <div class="wh-title"><textarea class="hc big" data-tf="nome" rows="3" aria-label="Nome della gita">${esc(t.nome)}</textarea></div>
      ${bigl ? '' : `<div class="wh-grid">
        <label>Adulti €</label>${e('adulti')}${tour ? `<label>singola €</label>${e('singola')}` : '<span></span><span></span>'}
        <label>Data</label><div class="hdates"><input class="hc" type="date" data-tf="data" value="${esc(t.data)}" aria-label="Partenza"><span>al</span><input class="hc" type="date" data-tf="fine" value="${esc(t.fine || '')}" aria-label="Rientro"></div>
        <label><input class="hc lab" data-qt="bambiniL" value="${esc(Q.bambiniL || (tour ? '3/11 anni' : '4/11 anni'))}" aria-label="Età bambini"> €</label>${e('bambini')}${tour ? `<label>3° letto ad. €</label>${e('terzo')}` : '<span></span><span></span>'}
        <label>acconto €</label>${e('acconto')}${tour ? `<label>${esc(Q.infantL || '0/2 anni')} €</label>${e('infant', '0')}` : '<span></span><span></span>'}
        <label>saldo €</label><div class="hdates">${e('saldo')}<span>il</span><input class="hc" type="date" data-qt="saldoEntro" value="${esc(Q.saldoEntro || '')}" aria-label="Saldo entro il"></div>
        ${tour ? `<label>Hotel</label><div class="span3">${tx('hotel', 'nome hotel, città')}</div>` : ''}
      </div>`}${bigl ? `<div class="wh-grid"><label>Data</label><div class="hdates"><input class="hc" type="date" data-tf="data" value="${esc(t.data)}" aria-label="Data dell'evento"></div></div>` : ''}
      ${tkRow}
      ${bigl ? '' : `<div class="wh-deps"><b>Partenze</b>${deps}</div>`}
    </div>
    <div class="wnotes"><label>Nota 1: <input class="hc" data-tf="note1" value="${esc(t.note1 || '')}"></label><label>Nota 2: <input class="hc" data-tf="note2" value="${esc(t.note2 || '')}"></label></div>`;
  }
  function wRow(t, r, i, cols, ctx, bigl) {
    const x = ctx.byRow[r.id]; const head = x && x.k === 0; const bk = x && x.bk;
    const ok = bk && saldato(bk); const seat = ctx.SI[r.id];
    let cls = x ? `g${x.gi % 2}` : 'blank'; if (head) cls += ' gh'; if (ok) cls += ' paid'; if (bk && UI.sel === bk.id) cls += ' sel'; if (UI.selP === r.id) cls += ' selp';
    const drag = x ? `<span class="dh" draggable="true" ${head ? `data-dragbk="${bk.id}" title="Trascina tutta la prenotazione (${esc(bkName(bk))} x ${bk.persone.length}) sulla piantina"` : `data-dragp="${r.id}" title="Trascina solo questa persona sulla piantina"`}>${ICON.grip}</span>` : '';
    let seatTxt = '';
    if (seat) { const p = bk.persone.find(q => q.id === r.id); const bad = p && p.req && hasAny(p.req) && !reqOk(LMAP[seat.b.layout], seat.s, p.req); seatTxt = `<span class="pill ${bad ? 'warn' : 'ok'}" title="${bad ? 'Il posto non rispetta la richiesta' : ''}">${esc(seat.b.label.replace(/^Bus\s*/i, 'B'))} · ${seat.s}</span>`; }
    else if (x && r.bus) seatTxt = '<span class="pill tbd">da sistemare</span>';
    const tip = head && bk._m ? `Totale ${euro(bk._m.due)} · pagato ${euro(bk._m.paid)}${bk._m.rest ? ' · da pagare ' + euro(bk._m.rest) : ''}${bk.mancano ? ` · mancano ${bk.mancano} nomi` : ''}` : '';
    return `<tr class="${cls}" data-rowid="${r.id}">
      <td class="wn">${drag}<button class="rn" data-act="rowmenu" data-id="${r.id}" aria-label="Riga ${i + 1}: azioni">${i + 1}</button></td>
      ${cols.map(([f, l]) => head && f === 'pagato' ? `<td class="c-pagato"><button class="eurobtn${ok ? ' ok' : bk._m && bk._m.paid ? ' part' : ''}${UI.pay && UI.pay.bkId === bk.id ? ' on' : ''}" data-act="paypanel" data-id="${bk.id}" title="Incasso e documento (scontrino o fattura)" aria-label="Incasso e documento di ${esc(bkName(bk))}">${bk._m && bk._m.paid ? esc(fmtNum(bk._m.paid)) : '€'}</button></td>` : `<td class="c-${f}${head && f === 'cognome' && bk.mancano ? ' miss' : ''}"${head && f === 'cognome' && tip ? ` title="${esc(tip)}"` : ''}><input class="wc" data-r="${r.id}" data-f="${f}" value="${esc(r[f] || '')}" aria-label="${esc(l)} riga ${i + 1}" autocomplete="off"></td>`).join('')}
      ${bigl ? '' : `<td class="wpos">${seatTxt}</td>`}</tr>`;
  }
  function listaView(t, D, SI, T) {
    const bigl = tripCat(t) === 'biglietteria'; const tour = !bigl && isTourT(t); const cols = listCols(tour, bigl);
    const pp = UI.pay && UI.pay.tripId === t.id ? payPanelHTML(t) : ''; if (UI.pay && !pp) UI.pay = null;
    const byRow = {}; D.forEach((bk, gi) => bk.persone.forEach((p, k) => { byRow[p.id] = { bk, gi, k }; }));
    const ctx = { byRow, SI };
    const Q = t.quota;
    const sup = (k, l) => `<td><span class="sl">${l}</span><input class="hc num" data-qs="${k}" inputmode="decimal" value="${Q.suppl[k] != null ? esc(String(Q.suppl[k]).replace('.', ',')) : ''}" placeholder="€"></td>`;
    const annTable = (k, title) => {
      const rows = t.annullati.filter(r => r.stato === k);
      return `<h3 class="wt">${title}</h3><div class="wtw"><table class="wl wl-ann"><thead><tr><th>N</th>${cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}<th>data di annullo</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td class="wn"><button class="rn" data-act="annmenu" data-id="${r.id}" aria-label="Azioni">${i + 1}</button></td>${cols.map(([f, l]) => `<td><input class="wc" data-nr="${r.id}" data-f="${f}" value="${esc(r[f] || '')}" aria-label="${esc(l)}"></td>`).join('')}<td><input class="wc" data-nr="${r.id}" data-f="dataAnn" value="${esc(r.dataAnn || '')}" aria-label="data di annullo"></td></tr>`).join('') || `<tr><td colspan="${cols.length + 2}" class="emptyrow">—</td></tr>`}
      </tbody></table></div><button class="btn sm ghost" data-act="annadd" data-k="${k}">${ICON.plus} riga</button>`;
    };
    const main = `
      ${headBlock(t)}
      <div class="wbar">
        <div class="wsum"><b>${T.pers}</b> persone · ${T.nBk} prenotazioni${T.nRooms ? ` · <b>${T.nRooms}</b> camere (${esc(roomsText(T.rooms))})` : ''} · incassato <b>${euro(T.paid)}</b>${T.due ? ` su ${euro(T.due)}` : ''}${T.mancano ? ` · <span class="neg">mancano ${T.mancano} nomi</span>` : ''}</div>
        <button class="btn sm" data-act="timport">${ICON.upload} Importa da Word</button>
        <button class="btn sm" data-act="printlist">${ICON.print} Stampa lista</button>
        ${tour ? `<button class="btn sm" data-act="rooming">${ICON.print} Rooming list</button>` : ''}
        ${bigl ? '' : `<button class="btn sm${UI.dock && !pp ? ' dark' : ' primary'}" data-act="dock" aria-pressed="${!!UI.dock && !pp}">${ICON.dock} ${UI.dock && !pp ? 'Nascondi piantina' : 'Piantina accanto'}</button>`}
      </div>
      <div class="wtw" data-droplist="1"><table class="wl"><thead><tr><th>N</th>${cols.map(([f, l]) => `<th class="c-${f}">${esc(l)}</th>`).join('')}${bigl ? '' : '<th>posto</th>'}</tr></thead>
        <tbody>${t.rows.map((r, i) => wRow(t, r, i, cols, ctx, bigl)).join('')}</tbody></table></div>
      <div class="whelp small">${bigl ? 'Una riga per cliente: «Rossi x 2» e i nomi sotto. Con il pulsante «€» si registra l\'incasso e si prepara lo scontrino.' : `Si scrive come in Word`}${bigl ? '' : `: «Rossi x 3» sulla prima riga e le altre persone sotto. Invio = riga sotto. Il numero a sinistra apre il menu della riga (inserisci, elimina, lista d'attesa, non parte più). Cognome <span class="pos">verde</span> = saldato. Per mettere i posti trascina ${ICON.grip} sulla piantina: dalla prima riga si sposta tutta la prenotazione, dalle altre la singola persona. Il pulsante «€» della prima riga apre l'incasso con scontrino o fattura.`}</div>
      ${bigl ? '' : `<div class="wsupp"><h3 class="wt">Supplementi per i posti assegnati</h3><table class="wl wl-s"><tr>${sup(1, '1ª fila')}${sup(2, '2ª fila')}${sup(3, '3ª fila')}${sup(4, '4ª fila')}${sup('p2', '2° porta')}</tr></table>
        <label class="chk"><input type="checkbox" data-tchk="guida"${t.guida ? ' checked' : ''}> ------- x guida e 2° autista (sul bus resta un posto per loro)</label></div>`}
      <h3 class="wt">Lista d'attesa</h3>
      <div class="wtw"><table class="wl wl-att"><thead><tr><th>N</th>${ATTC.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>
        ${t.attesa.map((r, i) => `<tr${isEmptyRow(r) ? ' class="blank"' : ''}><td class="wn"><button class="rn" data-act="attmenu" data-id="${r.id}" aria-label="Azioni">${i + 1}</button></td>${ATTC.map(([f, l]) => `<td><input class="wc" data-ar="${r.id}" data-f="${f}" value="${esc(r[f] || '')}" aria-label="${esc(l)}"></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      ${annTable('da', 'Non partono più – da rimborsare')}${annTable('fatto', 'Non partono più – già rimborsati')}${annTable('no', 'Non partono più – hanno rinunciato senza avere rimborso')}`;
    const side = pp || (UI.dock && !bigl ? mapPanel(t, 'dock') : '');
    return `<div class="lwrap${side ? ' dock' : ''}${pp ? ' paying' : ''}"><div class="lmain">${main}</div>${side ? `<aside class="ldock">${side}</aside>` : ''}</div>`;
  }

  // ----- sezione 2: posti sul bus (lista + piantina insieme) -----
  function bkSeatsText(t, bk, SI) {
    const by = {}; let none = 0;
    bk.persone.forEach(p => { const x = SI[p.id]; if (!x) { none++; return; } (by[x.b.id] = by[x.b.id] || { b: x.b, s: [] }).s.push(x.s); });
    const parts = Object.values(by).map(o => `${o.b.label.replace(/^Bus\s*/i, 'B')} · ${fmtSeats(o.s.sort((a, c) => a - c))}`);
    return { txt: parts.join(' / '), none };
  }
  function postiList(t, D, SI) {
    const list = UI.onlyFree ? D.filter(bk => bk.persone.some(p => !SI[p.id])) : D;
    const free = D.reduce((a, bk) => a + bk.persone.filter(p => !SI[p.id]).length, 0);
    return `<section class="panel side-l" aria-label="Lista della gita">
      <div class="panel-h"><h3>Lista della gita</h3><button class="btn sm" data-act="sec" data-v="lista">${ICON.edit} Modifica lista</button></div>
      <div class="panel-b"><div class="stats">
        <div class="stat"><b>${D.reduce((a, bk) => a + bk.persone.length, 0)}</b><span>persone</span></div>
        <div class="stat"><b>${D.reduce((a, bk) => a + bk.persone.length, 0) - free}</b><span>con il posto</span></div>
        <div class="stat${free ? ' alert' : ''}"><b>${free}</b><span>senza posto</span></div></div>
        <label class="chk small"><input type="checkbox" data-act="onlyfree"${UI.onlyFree ? ' checked' : ''}> Mostra solo chi non ha il posto</label>
      </div>
      <div class="bklist" id="bklist" data-droplist="1">${list.map(bk => {
        const st = bkSeatsText(t, bk, SI); const rs = reqSummary(bk);
        const onBus = bk.persone.map(p => SI[p.id] && SI[p.id].b).find(Boolean);
        const ps = onBus ? prefStatus(onBus, bkById(onBus, bk.id) || bk) : null;
        const parts = [...new Set(bk.persone.map(p => p.part).filter(Boolean))];
        return `<div class="lb${UI.sel === bk.id ? ' sel' : ''}${st.none ? ' todo' : ''}" data-act="selbk" data-id="${bk.id}" draggable="true" data-dragbk="${bk.id}">
          <div class="lb-h"><span class="ln">${bk.ord}</span><span class="dot" style="background:${bk.head.c != null ? COLORS[bk.head.c % COLORS.length] : 'transparent'}"></span><b>${esc(bkName(bk))}</b> <small>x ${bk.persone.length}${bk.mancano ? ` (mancano ${bk.mancano})` : ''}</small> ${parts.map(p => `<span class="code">${esc(p)}</span>`).join(' ')}
            <span class="lb-s">${st.txt ? `<span class="pill ${st.none ? 'tbd' : 'ok'}">${esc(st.txt)}${st.none ? ` · ${st.none} senza` : ''}</span>` : '<span class="pill neutral">senza posto</span>'}</span></div>
          ${rs.text ? `<div class="req ${ps || 'pending'}"><span class="rq-l">${esc(rs.text)}${rs.paid ? ' · pagato' : ''}</span><span class="rq-s">${ps === 'ok' ? '✓ rispettato' : ps === 'ko' ? '✗ non rispettato' : ps === 'pref' ? '≈ preferenza non possibile' : 'da sistemare'}</span></div>` : ''}
          <div class="chips">${bk.persone.map(p => `<span class="pchip${SI[p.id] ? ' on' : ''}${UI.selP === p.id ? ' sel' : ''}" draggable="true" data-dragp="${p.id}" data-act="selp" data-id="${p.id}" title="Trascina solo questa persona">${esc(p.cognome)} ${esc(p.nome)}${SI[p.id] ? ` <i>${SI[p.id].s}</i>` : ''}</span>`).join('')}</div>
        </div>`;
      }).join('') || '<div class="small" style="padding:14px">La lista è vuota: scrivila nella sezione «Lista prenotazioni» oppure importa il file Word.</div>'}</div>
    </section>`;
  }
  function mapPanel(t, mode) {
    const b = bus();
    const tabs = `<div class="mtabs">${t.buses.map(x => { const st = busStats(x); return `<button class="mtab" data-act="tab" data-id="${x.id}" data-dropbus="${x.id}" aria-pressed="${x.id === UI.busId}" title="Lascia qui una prenotazione: la sistemo da sola su questo bus"><b>${esc(x.label)}</b><span>${st.tot}/${st.cap}</span></button>`; }).join('')}<button class="mtab add" data-act="addbus" data-trip="${t.id}" title="Aggiungi bus">${ICON.plus}${t.buses.length ? '' : ' Aggiungi bus'}</button></div>`;
    if (!b) return `<section class="panel mapp ${mode}"><div class="panel-h">${tabs}</div><div class="panel-b"><div class="empty">Questa gita non ha ancora pullman: premi «+» e scegli la piantina.</div></div></section>`;
    return `<section class="panel mapp ${mode}"><div class="panel-h">${tabs}</div><div class="mapwrap${mode === 'dock' ? ' compact' : ''}" id="mapwrap">${mapInner(t, b, mode)}</div>${mode === 'dock' ? `<div class="panel-f"><button class="btn primary sm" data-act="fill">${ICON.wand} Sistema chi non ha il posto</button><button class="btn sm" data-act="sec" data-v="posti">Apri «Posti sul bus»</button></div>` : ''}</section>`;
  }
  function mapInner(t, b, mode) {
    const L = LMAP[b.layout]; const D = deriveBookings(t);
    const sel = UI.sel && D.find(x => x.id === UI.sel); const selP = UI.selP && rowById(t, UI.selP);
    let hint;
    if (UI.move != null) {
      const a = b.seats[UI.move]; const r = a && rowById(t, a.pid);
      hint = `<div class="hint">Sposta <b>${esc(r ? `${String(r.cognome).replace(RX, '$1')} ${r.nome}` : '')}</b> dal posto ${UI.move}: clicca il nuovo posto. Se è occupato, i due si scambiano.<button class="btn sm" data-act="cancel">Annulla</button></div>`;
    } else if (sel) {
      const rs = reqSummary(sel);
      hint = `<div class="hint"><span>Clicca il posto per <b>${esc(bkName(sel))} x ${sel.persone.length}</b>: va lì e gli altri del gruppo si siedono accanto.${rs.text ? `<span class="hreq">Richiesta: <b>${esc(rs.text)}</b> — posti adatti in verde</span>` : ''}</span><button class="btn sm" data-act="cancel">Fine</button></div>`;
    } else if (selP) {
      hint = `<div class="hint"><span>Clicca il posto per <b>${esc(String(selP.cognome).replace(RX, '$1'))} ${esc(selP.nome)}</b> (solo questa persona).</span><button class="btn sm" data-act="cancel">Fine</button></div>`;
    } else hint = `<div class="hint idle">Trascina dalla lista una prenotazione o una persona e lasciala sul posto. Lasciandola sul nome del bus in alto, i posti li sceglie l'app con le vostre regole.</div>`;
    let want = null;
    const reqs = sel ? [sel.pref, ...sel.persone.map(p => p.req)] : [];
    if (reqs.some(hasAny)) { want = new Set(); reqs.filter(hasAny).forEach(r => wantSeats(L, r).forEach(s => { if (!b.seats[s]) want.add(s); })); }
    return `${hint}<div class="floors${UI.sel || UI.selP ? ' placing' : ''}">${L.floors.map((f, i) => deckHTML(b, L, i, { interactive: true, want })).join('')}</div>
      <div class="legend"><span><i class="lg-x"></i>«x 2», «x 5»: quanti sono nel gruppo</span><span><i class="lg-cross"></i>posto vuoto a fine gruppo</span>${want ? '<span><i style="background:#E3F5E9;border-color:#2B7A4B"></i>adatto alla richiesta</span>' : ''}<span>${busStats(b).free} posti liberi</span></div>`;
  }
  function depCounts(b) { const c = {}; b.bookings.forEach(bk => bk.persone.forEach(p => { const k = (p.part || '').toUpperCase(); c[k] = (c[k] || 0) + 1; })); return c; }
  function depsHTML(b) {
    const c = depCounts(b);
    const rows = (b.partenze || []).map((d, i) => `<div class="dep"><input aria-label="Codice" value="${esc(d.code)}" data-dep="${i}" data-k="code" placeholder="codice"><input aria-label="Luogo" value="${esc(d.luogo)}" data-dep="${i}" data-k="luogo" placeholder="luogo di salita"><input aria-label="Ora" value="${esc(d.ora)}" data-dep="${i}" data-k="ora" placeholder="ora"><button class="kebab" data-act="deldep" data-i="${i}" aria-label="Togli partenza">${ICON.close}</button><span class="cnt">${c[(d.code || '').toUpperCase()] || 0} persone salgono qui</span></div>`).join('');
    return rows || '<div class="small">Scrivi i punti di partenza con l\'orario: compaiono nella piantina stampata.</div>';
  }
  function busPanel(t, b) {
    const L = LMAP[b.layout];
    const f = (id, label, key, ph = '') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-bind="${key}" value="${esc(b[key] || '')}" placeholder="${esc(ph)}"></div>`;
    const noBus = deriveBookings(t).filter(bk => bk.persone.every(p => !p.row.bus)).length;
    return `<section class="panel side-r" aria-label="Dati del bus">
      <div class="panel-h"><h3>${esc(b.label)}</h3></div>
      <div class="panel-b">
        <div class="actions">
          <button class="btn primary" data-act="fill">${ICON.wand} ${noBus ? `Metti su ${esc(b.label)} chi non ha il bus e sistema i posti` : 'Sistema automaticamente chi non ha il posto'}</button>
          <button class="btn dark" data-act="printmap">${ICON.print} Stampa piantina</button>
          <button class="btn dark" data-act="printcards">${ICON.cards} Stampa cartelli</button>
          <button class="btn wa" data-act="wa">${ICON.wa} Messaggi WhatsApp ai clienti</button>
        </div>
        <div class="sep"></div>
        ${f('b-label', 'Nome del bus', 'label', 'Bus 1 RAG')}
        <div class="field"><label>Piantina</label><div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><span><b>${esc(L.nome)}</b><br><span class="small">${esc(L.desc)}</span></span><button class="btn sm" data-act="changelayout">Cambia</button></div></div>
        <div class="grid2">${f('b-mezzo', 'Mezzo (ID o targa)', 'mezzo', 'es. 46')}${f('b-autista', 'Autista', 'autista')}</div>
        <div class="grid2">${f('b-acc', 'Accompagnatore', 'accompagnatore')}${f('b-telacc', 'Tel. accompagnatore', 'telAcc')}</div>
        <div class="field"><label>Partenze e orari</label><div class="deps" id="deps">${depsHTML(b)}</div><button class="btn sm" data-act="adddep" style="align-self:flex-start">${ICON.plus} Aggiungi partenza</button></div>
        <div class="field"><label for="b-note">Da sapere per autista e accompagnatore</label><textarea id="b-note" data-bind="note" placeholder="Es. sosta a metà strada; rientro previsto alle 23:30">${esc(b.note || '')}</textarea></div>
        <label class="chk"><input type="checkbox" data-bindchk="guida"${b.guida ? ' checked' : ''}> Tieni un posto per guida / 2° autista</label>
        <div class="sep"></div>
        <div class="actions">
          <button class="btn" data-act="clearall">${ICON.erase} Libera tutti i posti</button>
          <button class="btn danger" data-act="delbus">${ICON.trash} Elimina questo bus</button>
        </div>
      </div></section>`;
  }
  function postiView(t, D, SI) {
    const b = bus();
    return `<div class="work">${postiList(t, D, SI)}<div class="mapcol">${mapPanel(t, 'main')}</div>${b ? busPanel(t, b) : '<div></div>'}</div>`;
  }

  // ---------- menu a comparsa ----------
  function closePop() { const p = $('#pop'); if (p) p.remove(); }
  function openPop(anchor, html) {
    closePop();
    const p = document.createElement('div'); p.className = 'pop'; p.id = 'pop'; p.innerHTML = html; document.body.appendChild(p);
    const r = anchor.getBoundingClientRect(); const pw = p.offsetWidth, ph = p.offsetHeight;
    let x = Math.min(r.left, window.innerWidth - pw - 12); let yy = r.bottom + 6;
    if (yy + ph > window.innerHeight - 12) yy = Math.max(12, r.top - ph - 6);
    p.style.left = Math.max(12, x) + 'px'; p.style.top = yy + 'px';
    const inp = p.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 30);
  }
  // ---------- finestre ----------
  let pending = null;
  function openModal(title, body, foot, wide) {
    DIAG.ev('finestra', 'Aperta la finestra «' + String(title).replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, ' ').trim() + '»');
    $('#modal-root').innerHTML = `<div class="scrim" data-act="scrim"><div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><h2>${title}</h2><button class="btn ghost" data-act="close" aria-label="Chiudi">${ICON.close}</button></div><div class="modal-b">${body}</div><div class="modal-f">${foot}</div></div></div>`;
    const first = $('#modal-root input, #modal-root textarea'); if (first) setTimeout(() => first.focus(), 30);
  }
  function closeModal() { $('#modal-root').innerHTML = ''; UI.modal = null; pending = null; }
  function confirmBox(title, text, label, fn) {
    pending = fn;
    openModal(title, `<p style="margin:0">${text}</p>`, `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="doconfirm">${label}</button>`);
  }
  function tripModal(t) {
    UI.modal = { kind: 'trip', id: t ? t.id : null };
    openModal(t ? 'Modifica gita' : 'Nuova gita', `
      <div class="field"><label for="t-nome">Nome della gita</label><input id="t-nome" value="${esc(t ? t.nome : '')}" placeholder="es. Notre Dame de Paris - Messina"></div>
      <div class="grid2"><div class="field"><label for="t-data">Data di partenza</label><input id="t-data" type="date" value="${esc(t ? t.data : todayISO())}"></div>
      <div class="field"><label for="t-fine">Data di rientro (se più giorni)</label><input id="t-fine" type="date" value="${esc(t ? t.fine || '' : '')}"></div></div>
      <div class="grid3"><div class="field"><label for="t-cat">Tipo</label><select id="t-cat">${['gita', 'tour', 'evento', 'biglietteria'].map(c => `<option value="${c}"${(t ? tripCat(t) : 'gita') === c ? ' selected' : ''}>${CAT_L[c]}</option>`).join('')}</select></div>
      <div class="field"><label for="t-code">Codice (es. G07, T08)</label><input id="t-code" value="${esc(t ? t.code || '' : '')}"></div>
      <label class="chk" style="align-self:end"><input type="checkbox" id="t-extra"${t && t.extra ? ' checked' : ''}> Data extra (replica)</label></div>
      <div class="field"><label for="t-prog">Link al programma (PDF su Dropbox o pagina del sito)</label><input id="t-prog" value="${esc(t ? t.programma || '' : '')}" placeholder="https://www.laterra.it/..."></div>`,
      `${t ? `<button class="btn danger" data-act="deltrip" style="margin-right:auto">${ICON.trash} Elimina gita</button>` : ''}<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="savetrip">${t ? 'Salva' : 'Crea e aggiungi il primo bus'}</button>`);
  }
  function busModal(tripId, change) {
    const t = S.trips.find(x => x.id === tripId); const b = change ? bus() : null;
    UI.modal = { kind: change ? 'layout' : 'bus', tripId, pick: b ? b.layout : '52' };
    const n = t.buses.length + 1;
    openModal(change ? 'Cambia piantina' : 'Aggiungi bus', `
      ${change ? '<div class="infobox">I posti già assegnati restano dove sono se il nuovo pullman ha quel numero di posto; gli altri tornano «senza posto».</div>' : `<div class="grid2"><div class="field"><label for="nb-label">Nome del bus</label><input id="nb-label" value="Bus ${n}"></div><div class="field"><label for="nb-mezzo">Mezzo (ID o targa)</label><input id="nb-mezzo" placeholder="facoltativo"></div></div>
      <div class="grid2"><div class="field"><label for="nb-autista">Autista</label><input id="nb-autista" placeholder="facoltativo"></div><div class="field"><label for="nb-acc">Accompagnatore</label><input id="nb-acc" placeholder="facoltativo"></div></div>`}
      <div class="field"><label>Scegli la piantina</label></div>
      <div class="models pick" id="pickgrid">${window.LAYOUTS.map(L => modelCard(L, UI.modal.pick)).join('')}</div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="${change ? 'savelayout' : 'savebus'}">${change ? 'Cambia piantina' : 'Aggiungi bus'}</button>`, true);
  }

  // ---------- stampa ----------
  function pmHeader(L) {
    return `<div class="pm-h"><img src="${LOGO}" alt="La Terra"><div>Tel. 0932/626240 - 0932/944640<br>Cell. ${esc(L.cell)}</div><div>www.laterra.it<br>info@laterra.it</div><div class="mod">Modello: ${esc(L.nome)}<br>${esc(L.desc)}</div></div>`;
  }
  function notesBox(t, b) {
    const c = depCounts(b);
    const deps = (b.partenze || []).filter(d => d.code || d.luogo).map(d => `<span><b>${esc(d.code)}</b> ${esc(d.luogo)}${d.ora ? ' · ore ' + esc(d.ora) : ''} — ${c[(d.code || '').toUpperCase()] || 0} pers.</span>`);
    const seatNotes = Object.keys(b.seats).map(Number).sort((x, y) => x - y).map(s => { const a = b.seats[s]; const bk = bkById(b, a.b); const p = bk && bk.persone.find(x => x.id === a.pid); return p && p.np ? `${s} ${p.cognome}: ${p.np}` : null; }).filter(Boolean);
    const txt = [b.note || '', seatNotes.length ? 'Note sui posti: ' + seatNotes.join(' · ') : ''].filter(Boolean).join('\n');
    if (!deps.length && !txt) return '';
    return `<div class="pm-n"><h4>Da sapere</h4><div class="deps-p">${deps.join('') || '<span>—</span>'}</div><div class="txt">${esc(txt) || '—'}</div></div>`;
  }
  function roomingPages(t) {
    const D = deriveBookings(t); const T = summaryOf(t, D, seatIndex(t)); const Q = t.quota;
    const rooms = []; D.forEach(bk => roomsOf(bk).forEach(r => rooms.push({ r, bk })));
    const num = x => { const n = parseInt(x.r.num, 10); return isNaN(n) ? 1e6 : n; };
    rooms.sort((a, c) => num(a) - num(c));
    const rows = rooms.map(({ r }) => `<tr><td class="rn">${esc(r.num || '—')}</td><td>${esc(roomKind(r))}${r.tipo && r.tipo !== roomKind(r) ? ` <small>(${esc(r.tipo)} + letto)</small>` : ''}</td><td>${r.persone.map(p => `${esc(p.cognome)} ${esc(p.nome)}${ageAt(p, t.data) != null && ageAt(p, t.data) < 12 ? ` <small>(${ageAt(p, t.data)} anni)</small>` : ''}`).join('<br>')}</td><td class="rnote">${esc([...new Set(r.persone.map(p => p.row.note).filter(Boolean))].join(' · '))}</td></tr>`).join('');
    return `<div class="page rl">${pmHeader({ cell: (LMAP['54'] || {}).cell || '', nome: '', desc: '' }).replace('<div class="mod">Modello: <br></div>', '')}
      <div class="pm-t"><h2>Rooming list · ${esc(t.nome)}</h2><span>${esc(fmtTripDate(t))}</span>${Q.hotel ? `<span><b>${esc(Q.hotel)}</b></span>` : ''}<span>${T.nRooms} camere: ${esc(roomsText(T.rooms))} · ${T.pers} persone</span></div>
      <table class="rlt"><thead><tr><th>Camera</th><th>Tipo</th><th>Ospiti</th><th>Note</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nessuna camera indicata nella lista.</td></tr>'}</tbody></table>
      <div class="pm-foot"><span>Accompagnatore e autista non compresi</span><span>Stampato il ${fmtDate(todayISO())}</span></div></div>`;
  }
  // la lista stampata come il file Word
  function listPages(t) {
    const bigl = tripCat(t) === 'biglietteria'; const tour = !bigl && isTourT(t); const Q = t.quota; const SI = seatIndex(t);
    const cols = listCols(tour, bigl);
    const paidH = {}; deriveBookings(t).forEach(bk => { const v = bkMoney(t, bk).paid; if (v) paidH[bk.id] = fmtNum(v); });
    const full = t.rows.filter(r => !isEmptyRow(r));
    const tr = (r, i, extra) => `<tr><td>${i + 1}</td>${cols.map(([f]) => `<td>${esc(f === 'pagato' && paidH[r.id] ? paidH[r.id] : r[f] || '')}</td>`).join('')}${extra ? extra(r) : ''}</tr>`;
    const head = `<thead><tr><th>N</th>${cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}`;
    const ann = k => t.annullati.filter(r => r.stato === k && !isEmptyRow(r));
    const annT = (k, title) => ann(k).length ? `<h3 class="lt">${title}</h3><table class="lpt">${head}<th>data di annullo</th></tr></thead><tbody>${ann(k).map((r, i) => tr(r, i, x => `<td>${esc(x.dataAnn || '')}</td>`)).join('')}</tbody></table>` : '';
    const att = t.attesa.filter(r => !isEmptyRow(r));
    const sp = [1, 2, 3, 4].map(f => Q.suppl[f]); 
    return `<div class="page lp">
      ${bigl ? `<table class="lph"><tr><td class="tt">${esc(t.nome)}</td><td>Data</td><td>${esc(fmtTripDate(t))}</td><td>intero</td><td>${euro(Q.tkt1)}</td><td>${esc(Q.tkt2L || 'ridotto')}</td><td>${euro(Q.tkt2)}</td><td>diritti</td><td>${euro(Q.diritti)}</td></tr></table>` : `<table class="lph"><tr><td class="tt" rowspan="3">${esc(t.nome)}</td><td>Adulti</td><td>${euro(Q.adulti)}</td>${tour ? `<td>singola</td><td>${euro(Q.singola)}</td>` : ''}<td rowspan="3" class="deps">${(t.partenze || []).map(d => `${esc(d.citta)} ${esc(d.luogo)} ${esc(d.ora)}`).join('<br>')}</td></tr>
        <tr><td>Data</td><td>${esc(fmtTripDate(t))}</td>${tour ? `<td>${esc(Q.bambiniL || '3/11 anni')}</td><td>${euro(Q.bambini)}</td>` : ''}</tr>
        <tr><td>${tour ? 'Hotel' : esc(Q.bambiniL || '4/11 anni')}</td><td>${tour ? esc(Q.hotel || '') : euro(Q.bambini)}</td>${tour ? `<td>acconto / saldo</td><td>${euro(Q.acconto)} / ${euro(Q.saldo)}${Q.saldoEntro ? ' il ' + esc(fmtDate(Q.saldoEntro)) : ''}</td>` : ''}</tr></table>`}
      ${t.note1 ? `<div class="lnote">Nota 1: ${esc(t.note1)}</div>` : ''}${t.note2 ? `<div class="lnote">Nota 2: ${esc(t.note2)}</div>` : ''}
      <table class="lpt">${head}${bigl ? '' : '<th>posto</th>'}</tr></thead><tbody>${full.map((r, i) => tr(r, i, bigl ? null : x => `<td>${SI[x.id] ? esc(SI[x.id].b.label.replace(/^Bus\s*/i, 'B')) + ' · ' + SI[x.id].s : ''}</td>`)).join('')}</tbody></table>
      ${t.guida ? '<div class="lnote">------- x guida e 2° autista</div>' : ''}
      ${sp.some(v => v != null) || Q.suppl.p2 != null ? `<h3 class="lt">Supplementi per i posti assegnati</h3><div class="lnote">1ª fila ${euro(sp[0])} · 2ª fila ${euro(sp[1])} · 3ª fila ${euro(sp[2])} · 4ª fila ${euro(sp[3])} · 2° porta ${euro(Q.suppl.p2)}</div>` : ''}
      ${att.length ? `<h3 class="lt">Lista d'attesa</h3><table class="lpt"><thead><tr><th>N</th>${ATTC.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${att.map((r, i) => `<tr><td>${i + 1}</td>${ATTC.map(([f]) => `<td>${esc(r[f] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
      ${annT('da', 'Non partono più – da rimborsare')}${annT('fatto', 'Non partono più – già rimborsati')}${annT('no', 'Non partono più – hanno rinunciato senza avere rimborso')}
      <div class="pm-foot"><span>${full.length} righe</span><span>Stampato il ${fmtDate(todayISO())}</span></div></div>`;
  }
  function mapPages(t, b) {
    const L = LMAP[b.layout]; const st = busStats(b);
    return L.floors.map((fl, fi) => `<div class="page pm">
      ${pmHeader(L)}
      <div class="pm-t"><h2>${esc(t.nome)}</h2><span>${esc(fmtTripDate(t))}</span><span><b>${esc(b.label)}</b>${b.mezzo ? ' · mezzo ' + esc(b.mezzo) : ''}</span>${b.autista ? `<span>Autista: <b>${esc(b.autista)}</b></span>` : ''}${b.accompagnatore ? `<span>Accompagnatore: <b>${esc(b.accompagnatore)}</b>${b.telAcc ? ' ' + esc(b.telAcc) : ''}</span>` : ''}${fl.nome ? `<span><b>${esc(fl.nome)}</b></span>` : ''}</div>
      <div class="pm-map">${(() => { const o = { print: true, lab: officeLabels(b) }; return fl.rows.map(r => rowHTML(r, b, o)).join(''); })()}</div>
      ${fi === 0 ? notesBox(t, b) : ''}
      <div class="pm-foot"><span>Passeggeri: ${st.tot} · posti liberi: ${st.free}</span><span>Stampato il ${fmtDate(todayISO())}</span></div>
    </div>`).join('');
  }
  function cardPages(b, order) {
    const L = cartelliLati(b, order); let html = '', n = 0;
    const SEZ = [['sx', 'Lato autista'], ['dx', 'Lato hostess'], ['senza', 'Senza posto sul bus']];
    SEZ.forEach(([k, label]) => {
      const list = L[k]; if (!list.length) return; n += list.length;
      html += `<div class="cp-sec">${label} · ${list.length} cartelli</div>`;
      for (let i = 0; i < list.length; i += 3) html += `<div class="page cp">${list.slice(i, i + 3).map(c => `<div class="card"><div class="strip"><span>${label.toUpperCase()}${c.seats ? ' · posti ' + c.seats.join('-') : ''}</span></div><div class="ct">${c.lines.map(esc).join('<br>')}</div></div>`).join('')}</div>`;
    });
    return { html, n, sx: L.sx.length, dx: L.dx.length };
  }
  function fitCards() {
    const cv = document.createElement('canvas').getContext('2d');
    const maxW = 193 * 96 / 25.4, maxH = 90 * 96 / 25.4;
    $$('#print-root .ct').forEach(el => {
      const lines = el.innerHTML.split('<br>').map(s => { const d = document.createElement('div'); d.innerHTML = s; return d.textContent; });
      let size = 47;
      for (; size > 20; size--) {
        cv.font = `${size}pt "Times New Roman", Times, "Liberation Serif", serif`;
        const w = Math.max(...lines.map(l => cv.measureText(l).width));
        if (w <= maxW && lines.length * size * 1.15 * 96 / 72 <= maxH) break;
      }
      el.style.fontSize = size + 'pt';
    });
  }
  function openPrint(kind) {
    const t = trip(); syncAll(t); const b = bus(); const root = $('#print-root');
    let body, title, extra = '';
    if (kind === 'list') { body = listPages(t); title = `Lista · ${t.nome}`; }
    else if (kind === 'rooming') { body = roomingPages(t); title = `Rooming list · ${t.nome}`; }
    else if (kind === 'map') { body = mapPages(t, b); title = `Piantina · ${b.label}`; }
    else {
      const r = cardPages(b, UI.cartOrder); body = r.html; title = `Cartelli · ${b.label} · lato autista ${r.sx} · lato hostess ${r.dx}`;
      extra = `<div class="seg" role="group" aria-label="Ordine"><button data-act="cartorder" data-v="posto" aria-pressed="${UI.cartOrder === 'posto'}">Dal davanti al fondo</button><button data-act="cartorder" data-v="lista" aria-pressed="${UI.cartOrder === 'lista'}">Come la lista</button></div>`;
      if (!r.n) body = '<div class="page cp" style="display:grid;place-items:center;font-size:18px">Nessuna prenotazione su questo bus.</div>';
    }
    root.innerHTML = `<div class="pv-bar"><b>${esc(title)}</b>${extra}<button class="btn primary" data-act="doprint">${ICON.print} Stampa</button><button class="btn" data-act="closeprint">Chiudi</button></div><div class="pv-pages">${body}</div>`;
    root.hidden = false; root.dataset.kind = kind; root.scrollTop = 0;
    root.style.setProperty('--pz', Math.min(1, (window.innerWidth - 24) / 800).toFixed(3));
    if (kind === 'cards') fitCards();
  }
  function closePrint() { const r = $('#print-root'); r.hidden = true; r.innerHTML = ''; document.body.classList.remove('printing'); }
  window.addEventListener('afterprint', () => document.body.classList.remove('printing'));

  // ---------- programma del viaggio (PDF o foto): sta in Dropbox, cartella /programmi, e su ogni computer che lo apre ----------
  const safeName = n => String(n || 'programma').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'programma';
  async function attachPdf(tripId, file) {
    const t = S.trips.find(x => x.id === tripId); if (!t || !file) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name) && !/^(application\/pdf|image\/(jpeg|png))$/.test(file.type)) return toast('Il programma deve essere un PDF oppure una foto JPG o PNG');
    try {
      if (t.pdf && t.pdf.path) await STORE.delBlob(t.pdf.path).catch(() => {});
      const path = `/programmi/${t.id}/${safeName(file.name)}`.toLowerCase();
      await STORE.putBlob(path, file); t.pdf = { name: file.name, size: file.size, path, type: file.type }; commit(); toast(`Programma «${file.name}» collegato a ${t.nome}`);
    } catch (e) { toast('Non riesco a salvare il programma'); }
  }
  async function openPdf(tripId) {
    const t = S.trips.find(x => x.id === tripId);
    try { const f = t && t.pdf && await STORE.getBlob(t.pdf.path || ''); if (!f) return toast('Il programma non si trova: trascinalo di nuovo'); const url = URL.createObjectURL(f); const w = window.open(url, '_blank'); if (!w) toast('Il browser ha bloccato l\'apertura: consenti i popup per questa pagina'); setTimeout(() => URL.revokeObjectURL(url), 60000); }
    catch (e) { toast('Non riesco ad aprire il programma (serve internet la prima volta)'); }
  }


  // ---------- messaggio WhatsApp al cliente: posto, dati utili, programma ----------
  // Ora: un clic per cliente (si apre WhatsApp Business col testo pronto). Poi: invio automatico con la WhatsApp Business Platform.
  const POSTO_URL = 'https://max-laterra.github.io/onboard/posto.html';
  const DEFAULT_WA = 'Buongiorno {nome},\nle scrive La Terra Viaggi per «{gita}».\n\n🚌 Si parte {data}\n📍 Partenza: {partenza}\n🗺️ Il punto preciso sulla mappa: {mappa}\n💺 {posti_frase}\n👤 Accompagnatore: {accompagnatore}\n\nQui sotto le mandiamo il video del pullman con i posti in rosso e il programma.\nPer qualsiasi domanda ci chiami allo {telefono}.\nBuon viaggio da La Terra!';
  const WA_PH = ['nome', 'cliente', 'gita', 'data', 'posti', 'posti_frase', 'bus', 'partenza', 'mappa', 'accompagnatore', 'telefono', 'link_posto', 'programma'];
  function waNumber(tel) {
    let d = String(tel || '').replace(/[^\d+]/g, '');
    if (d.startsWith('+')) d = d.slice(1); else if (d.startsWith('00')) d = d.slice(2); else if (/^3\d{8,9}$/.test(d)) d = '39' + d; else if (/^0\d{5,10}$/.test(d)) d = '39' + d;
    return d.length >= 10 ? d : '';
  }
  // «RG» trova «Ragusa», «MOD» trova «Modica»: le lettere del codice in ordine dentro il nome della città
  const codeIn = (code, city) => { const c = String(code || '').toUpperCase().replace(/[^A-Z]/g, ''), s = String(city || '').toUpperCase(); if (!c || !s) return false; if (s.startsWith(c)) return true; let i = 0; for (const ch of s) if (ch === c[i]) i++; return i === c.length && s[0] === c[0]; };
  // luogo di partenza delle impostazioni (con il link di Google Maps) per il codice della colonna «part»
  function luogoOf(part, pt) {
    const code = String(part || '').toUpperCase().trim(); const L = (S.cfg.luoghi || []).filter(l => l.code || l.citta);
    return L.find(l => code && String(l.code || '').toUpperCase() === code) || L.find(l => code && codeIn(code, l.citta)) || (pt && pt.luogo ? L.find(l => l.citta && String(pt.luogo).toUpperCase().includes(String(l.citta).toUpperCase())) : null) || null;
  }
  function mapsLink(part, pt) {
    const l = luogoOf(part, pt); if (l && l.maps) return l.maps;
    const q = l ? [l.luogo, l.citta].filter(Boolean).join(', ') : (pt && pt.luogo) || ''; return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
  }
  function partenzaOf(t, b, part) {
    const code = String(part || '').toUpperCase();
    const lg = luogoOf(code);
    const bd = (b.partenze || []).find(d => d.code && d.code.toUpperCase() === code);
    if (bd) return { luogo: bd.luogo || bd.code, ora: bd.ora || '' };
    const td = (t.partenze || []).find(d => codeIn(code, d.citta));
    if (td) return { luogo: [td.citta, td.luogo].filter(x => x && !/^no$/i.test(x)).join(' · '), ora: /^no$/i.test(td.ora || '') ? '' : td.ora || '' };
    if (lg) return { luogo: [lg.citta, lg.luogo].filter(Boolean).join(', '), ora: '' };
    return { luogo: code, ora: '' };
  }
  function b64url(obj) { const bytes = new TextEncoder().encode(JSON.stringify(obj)); let bin = ''; bytes.forEach(x => { bin += String.fromCharCode(x); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function waData(t, b, bk) {
    const seats = seatsOf(b, bk.id); const p0 = bk.persone.find(p => waNumber(p.tel)) || bk.persone[0] || {};
    const pt = partenzaOf(t, b, (bk.persone[0] || {}).part);
    const nomi = seats.map(s => { const p = bk.persone.find(x => x.id === b.seats[s].pid); return p ? `${p.cognome} ${p.nome}`.trim() : ''; }).filter(Boolean);
    return { p0, seats, pt, part: (bk.persone[0] || {}).part, d: { v: 1, g: t.nome, d: t.data, f: t.fine || '', b: `${b.label}${LMAP[b.layout] ? ' · ' + LMAP[b.layout].nome : ''}`, l: b.layout, s: seats, n: nomi, c: (p0.nome || p0.cognome || '').split(' ')[0], pl: pt.luogo, po: pt.ora, a: b.accompagnatore || '', at: b.telAcc || '', h: (t.quota && t.quota.hotel) || '', r: t.programma || '' } };
  }
  const postoBase = () => S.cfg.postoUrl || (/^https?:$/.test(location.protocol) ? new URL('./posto.html', location.href).href : POSTO_URL);
  const postoLink = d => `${postoBase()}#d=${b64url(d)}`;
  function waMessage(t, b, bk) {
    const x = waData(t, b, bk); const n = x.seats.length;
    const frase = !n ? 'Il posto sul pullman le verrà comunicato a breve.' : n === 1 ? `Il suo posto sul pullman è il n. ${x.seats[0]}.` : `I vostri posti sul pullman sono i n. ${x.seats.slice(0, -1).join(', ')} e ${x.seats[n - 1]}.`;
    const map = { nome: String(x.p0.nome || '').split(' ')[0] || x.p0.cognome || '', cliente: `${x.p0.cognome || ''} ${x.p0.nome || ''}`.trim(), gita: t.nome, data: waDay(t.data) + (t.fine && t.fine !== t.data ? `, rientro ${waDay(t.fine)}` : ''), posti: fmtSeats(x.seats) || 'da assegnare', posti_frase: frase, bus: b.label, partenza: [x.pt.luogo, x.pt.ora ? 'ore ' + x.pt.ora : ''].filter(Boolean).join(', '), accompagnatore: [b.accompagnatore, b.telAcc].filter(Boolean).join(' '), link_posto: postoLink(x.d), programma: t.programma || '', mappa: mapsLink(x.part, x.pt), telefono: S.cfg.telAgenzia || '' };
    return (S.cfg.waTemplate || DEFAULT_WA).split('\n').map(line => line.replace(/\{(\w+)\}/g, (m0, k) => (k in map ? map[k] : m0))).filter((line, i, arr) => !/:\s*$/.test(line.trim())).join('\n');
  }
  function postoPreview(t, b, bk) {
    const url = new URL('./posto.html', location.href).href + '#d=' + b64url(waData(t, b, bk).d);
    const w = window.open(url, '_blank'); if (!w) toast('Il browser ha bloccato la finestra: consenti i popup per questa pagina');
  }


// Foto del posto da mandare in chat: grande, leggibile anche da chi non tocca link.
// drawSeatCard(canvas, D, layout, logoImg) — D come nella pagina del posto: g, d, f, b, s, n, pl, po, a, at, fila
(function () {
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const pd = s => { const [y, m, d] = String(s || '').split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const ci = c => c === 0 ? { t: 'aisle', c: 1 } : c == null ? { t: 'void', c: 1 } : typeof c === 'number' ? { t: 'seat', s: c, c: 1 } : typeof c === 'string' ? { t: 'feat', f: c, c: 1 } : c.h ? { t: 'seat', s: c.h, h: 1, c: c.c || 1 } : c.s ? { t: 'seat', s: c.s, c: c.c || 1 } : { t: 'feat', f: c.f, c: c.c || 1 };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrap(ctx, text, maxW) { const words = String(text).split(' '); const lines = []; let cur = ''; words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function whereTxt(L, mine) {
    const geo = {};
    L.floors.forEach((fl, fi) => { let fL = 0, fR = 0; fl.rows.forEach(row => { let col = 0; const cells = row.map(c => { const k = ci(c); k.col = col; col += k.c; return k; }); const seats = cells.filter(k => k.t === 'seat' && !k.h); if (!seats.length) return; if (seats.some(k => k.col + k.c - 1 <= 1)) fL++; if (seats.some(k => k.col >= 3)) fR++; seats.forEach(k => { const side = k.col >= 3 ? 'dx' : (k.col + k.c - 1 <= 1 ? 'sx' : 'c'); geo[k.s] = { fi, side, fila: side === 'sx' ? fL : side === 'dx' ? fR : Math.max(fL, fR) }; }); }); });
    const g = mine.map(s => geo[s]).filter(Boolean); if (!g.length) return '';
    const sides = [...new Set(g.map(x => x.side))];
    return `${Math.min(...g.map(x => x.fila))}ª fila · ${sides.length > 1 ? 'tutti e due i lati' : sides[0] === 'sx' ? 'lato autista' : sides[0] === 'dx' ? 'lato porta' : 'centro'}${L.floors.length > 1 ? (g[0].fi === 0 ? ' · piano basso' : ' · piano alto') : ''}`;
  }
  window.seatWhere = whereTxt;
  window.drawSeatCard = function (cv, D, L, logo, opts) {
    const W = 1080, H = 1350; const SC = (opts && opts.scale) || 1; const T = opts && opts.t != null ? opts.t : 99;
    if (cv.width !== Math.round(W * SC)) { cv.width = Math.round(W * SC); cv.height = Math.round(H * SC); }
    const ctx = cv.getContext('2d'); ctx.setTransform(SC, 0, 0, SC, 0, 0);
    const RED = '#D90D36', INK = '#1E2226', MUTED = '#5F666D', COND = '"Barlow Condensed","Arial Narrow",Arial,sans-serif', SANS = 'Barlow,Arial,sans-serif';
    const mine = (D.s || []).map(Number);
    ctx.fillStyle = '#FBF8F5'; ctx.fillRect(0, 0, W, H);
    // testata
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, 130); ctx.fillStyle = RED; ctx.fillRect(0, 130, W, 8);
    if (logo && logo.complete && logo.naturalWidth) { const h = 78, w = logo.naturalWidth * h / logo.naturalHeight; ctx.drawImage(logo, 48, 26, w, h); }
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right'; ctx.font = `800 54px ${COND}`; ctx.fillStyle = INK; const ob = 'Board'; ctx.fillText(ob, W - 48, 88); const wb = ctx.measureText(ob).width; ctx.fillStyle = RED; ctx.fillText('On', W - 48 - wb, 88);
    // gita e data
    ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = `800 58px ${COND}`;
    let y = 215; wrap(ctx, String(D.g || '').toUpperCase(), W - 96).slice(0, 2).forEach(l => { ctx.fillText(l, 48, y); y += 60; });
    const d = pd(D.d); ctx.font = `600 36px ${SANS}`; ctx.fillStyle = MUTED; ctx.fillText(`${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}${D.f && D.f !== D.d ? ' → ' + pd(D.f).getDate() + ' ' + MESI[pd(D.f).getMonth()] : ''}`, 48, y + 4); y += 40;
    // riquadro posti
    const by = y + 10, bh = 230; rr(ctx, 48, by, W - 96, bh, 34); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.font = `700 34px ${SANS}`; ctx.fillText(mine.length > 1 ? 'I VOSTRI POSTI' : 'IL SUO POSTO', 84, by + 58);
    ctx.font = `800 132px ${COND}`; ctx.fillText(mine.join(' e '), 84, by + 186);
    ctx.textAlign = 'right'; ctx.font = `700 34px ${SANS}`; const wt = whereTxt(L, mine); wrap(ctx, wt, 420).forEach((l, i) => ctx.fillText(l, W - 84, by + 120 + i * 42)); ctx.textAlign = 'left';
    // piantina in orizzontale: muso a destra, lato autista in alto
    const my = by + bh + 30, mhMax = H - my - 230; const rows = []; L.floors.forEach(fl => { if (L.floors.length > 1 && !fl.rows.some(r => r.some(c => { const k = ci(c); return k.t === 'seat' && mine.includes(k.s); }))) return; fl.rows.forEach(r => rows.push(r)); });
    const units = rows.reduce((a, r) => a + (r.some(c => ci(c).t === 'seat') ? 1 : 0.45), 0);
    const busX = 48, busW = W - 96, innerW = busW - 70;
    const rowW = innerW / units; const colH = Math.min(76, (mhMax - 60) / 4.6); const aisleH = colH * 0.55; const gap = 5;
    const cols = [colH, colH, aisleH, colH, colH]; const busH = cols.reduce((a, b) => a + b, 0) + gap * 4 + 36;
    const myy = my + (mhMax - busH) / 2;
    ctx.beginPath(); ctx.moveTo(busX + 30, myy); ctx.lineTo(busX + busW - 60, myy); ctx.quadraticCurveTo(busX + busW, myy, busX + busW, myy + 60); ctx.lineTo(busX + busW, myy + busH - 60); ctx.quadraticCurveTo(busX + busW, myy + busH, busX + busW - 60, myy + busH); ctx.lineTo(busX + 30, myy + busH); ctx.quadraticCurveTo(busX, myy + busH, busX, myy + busH - 30); ctx.lineTo(busX, myy + 30); ctx.quadraticCurveTo(busX, myy, busX + 30, myy); ctx.closePath();
    ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#2B2F33'; ctx.stroke();
    const rings = []; let ri = 0;
    ctx.save(); ctx.translate(busX + busW - 22, myy + busH / 2); ctx.rotate(Math.PI / 2); ctx.fillStyle = MUTED; ctx.font = `700 22px ${COND}`; ctx.textAlign = 'center'; ctx.fillText('DAVANTI', 0, 0); ctx.restore();
    const ys = []; let yv = myy + 18; cols.forEach(h => { ys.push(yv); yv += h + gap; });
    let xr = busX + busW - 44;
    rows.forEach(row => {
      const has = row.some(c => ci(c).t === 'seat'); const w = rowW * (has ? 1 : 0.45); const x0 = xr - w; const appear = 0.1 + ri * 0.07; ri++;
      let col = 0;
      row.forEach(c => {
        const k = ci(c); const h = cols.slice(col, col + k.c).reduce((a, b) => a + b, 0) + gap * (k.c - 1); const y0 = ys[col];
        if (k.t === 'seat') { if (T < appear) { col += k.c; return; } const pop = Math.min(1, (T - appear) / 0.18); const mineSeat = mine.includes(k.s); const on = mineSeat && T >= 1.6; if (mineSeat && T >= 1.6) rings.push([x0 + 3, y0, w - 6, h]); ctx.save(); ctx.translate(x0 + w / 2, y0 + h / 2); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.translate(-(x0 + w / 2), -(y0 + h / 2)); ctx.globalAlpha = pop; rr(ctx, x0 + 3, y0, w - 6, h, 10); ctx.fillStyle = on ? RED : k.h ? '#EBC3C3' : '#E6E3DE'; ctx.fill(); ctx.textAlign = 'center'; if (on) { ctx.fillStyle = '#FFFFFF'; ctx.font = `800 ${Math.round(Math.min(w, h) * 0.62)}px ${COND}`; ctx.fillText(String(k.s), x0 + w / 2, y0 + h / 2 + Math.min(w, h) * 0.22); } else { ctx.fillStyle = '#9A9FA5'; ctx.font = `600 ${Math.round(Math.min(w, h) * 0.34)}px ${SANS}`; ctx.fillText(String(k.s), x0 + w / 2, y0 + h / 2 + Math.min(w, h) * 0.12); } ctx.restore(); }
        else if (k.t === 'feat' && (k.f === 'autista' || k.f === 'uscita')) { rr(ctx, x0 + 3, y0 + 2, w - 6, h - 4, 8); ctx.fillStyle = k.f === 'autista' ? '#BDD0E6' : '#A6D86A'; ctx.fill(); ctx.save(); ctx.translate(x0 + w / 2, y0 + h / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#3b3f44'; ctx.textAlign = 'center'; ctx.font = `600 ${Math.round(Math.min(w * 0.42, 24))}px ${SANS}`; ctx.fillText(k.f === 'autista' ? 'autista' : 'porta', 0, 8); ctx.restore(); }
        col += k.c;
      });
      xr = x0;
    });
    // il posto che si illumina: anelli che si allargano e l'etichetta «qui»
    if (rings.length) {
      const ph = ((T - 1.6) % 1.2) / 1.2;
      rings.forEach(([x, y, w, h]) => { ctx.save(); ctx.globalAlpha = Math.max(0, 0.9 * (1 - ph)); ctx.strokeStyle = RED; ctx.lineWidth = 6; const g = 4 + ph * 26; rr(ctx, x - g, y - g, w + 2 * g, h + 2 * g, 12 + g / 2); ctx.stroke(); ctx.restore(); });
      const minX = Math.min(...rings.map(r => r[0])), maxX = Math.max(...rings.map(r => r[0] + r[2])), minY = Math.min(...rings.map(r => r[1]));
      const a = Math.min(1, (T - 1.6) / 0.3); ctx.save(); ctx.globalAlpha = a; const lbl = mine.length > 1 ? 'VOI SIETE QUI' : 'LEI È QUI'; ctx.font = `800 30px ${COND}`; const tw = ctx.measureText(lbl).width + 36; const cx = (minX + maxX) / 2; let lx = Math.max(busX + 8, Math.min(cx - tw / 2, busX + busW - tw - 8)); const ly = Math.max(my - 6, minY - 62);
      rr(ctx, lx, ly, tw, 46, 23); ctx.fillStyle = '#2B2F33'; ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 10, ly + 46); ctx.lineTo(cx + 10, ly + 46); ctx.lineTo(cx, ly + 58); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.fillText(lbl, lx + tw / 2, ly + 33); ctx.restore(); ctx.textAlign = 'left';
    }
    // partenza
    ctx.textAlign = 'left'; const py = H - 190; ctx.fillStyle = '#FFFFFF'; rr(ctx, 48, py, W - 96, 150, 28); ctx.fill(); ctx.strokeStyle = '#ECE7E1'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = `700 28px ${SANS}`; ctx.fillText('PARTENZA', 84, py + 46);
    ctx.fillStyle = INK; ctx.font = `800 54px ${COND}`; ctx.fillText(`${D.po ? 'ore ' + D.po : ''}${D.pl ? (D.po ? ' · ' : '') + D.pl : ''}`, 84, py + 106);
    if (D.a) { ctx.textAlign = 'right'; ctx.fillStyle = MUTED; ctx.font = `600 26px ${SANS}`; ctx.fillText(`Accompagnatore ${D.a}${D.at ? ' · ' + D.at : ''}`, W - 84, py + 46); }
    return cv;
  };
})();

/* Contenitore MP4 minimo per un video H.264 senza audio (quello che WhatsApp accetta).
   muxMp4({ width, height, timescale, avcC: Uint8Array, samples: [{ data: Uint8Array (AVCC), key: bool, dur: tick }] }) → Uint8Array
   Il «moov» va all'inizio, così il video parte subito anche mentre si scarica. */
(function (root) {
  const enc = new TextEncoder();
  function box(type, ...parts) {
    let len = 8; parts.forEach(p => { len += p.length; });
    const out = new Uint8Array(len), dv = new DataView(out.buffer);
    dv.setUint32(0, len); out.set(enc.encode(type), 4);
    let o = 8; parts.forEach(p => { out.set(p, o); o += p.length; });
    return out;
  }
  function u(bytes, vals) { // vals: [[bit, valore], ...]
    let len = 0; vals.forEach(([b]) => { len += b / 8; });
    const out = new Uint8Array(len), dv = new DataView(out.buffer); let o = 0;
    vals.forEach(([b, v]) => { if (b === 8) dv.setUint8(o, v); else if (b === 16) dv.setUint16(o, v); else dv.setUint32(o, v >>> 0); o += b / 8; });
    return out;
  }
  const full = (type, ver, flags, ...parts) => box(type, u(0, [[8, ver], [8, (flags >> 16) & 255], [16, flags & 0xFFFF]]), ...parts);
  const MATRIX = [[32, 0x00010000], [32, 0], [32, 0], [32, 0], [32, 0x00010000], [32, 0], [32, 0], [32, 0], [32, 0x40000000]];
  function moov(o, offset) {
    const n = o.samples.length, ts = o.timescale;
    let dur = 0; o.samples.forEach(s => { dur += s.dur; });
    const mdur = Math.round(dur * 1000 / ts);
    const mvhd = full('mvhd', 0, 0, u(0, [[32, 0], [32, 0], [32, 1000], [32, mdur], [32, 0x00010000], [16, 0x0100], [16, 0], [32, 0], [32, 0], ...MATRIX, [32, 0], [32, 0], [32, 0], [32, 0], [32, 0], [32, 0], [32, 2]]));
    const tkhd = full('tkhd', 0, 3, u(0, [[32, 0], [32, 0], [32, 1], [32, 0], [32, mdur], [32, 0], [32, 0], [16, 0], [16, 0], [16, 0], [16, 0], ...MATRIX, [32, o.width * 65536], [32, o.height * 65536]]));
    const mdhd = full('mdhd', 0, 0, u(0, [[32, 0], [32, 0], [32, ts], [32, dur], [16, 0x55C4], [16, 0]]));
    const hdlr = full('hdlr', 0, 0, u(0, [[32, 0]]), enc.encode('vide'), new Uint8Array(12), enc.encode('VideoHandler\0'));
    const vmhd = full('vmhd', 0, 1, new Uint8Array(8));
    const dinf = box('dinf', full('dref', 0, 0, u(0, [[32, 1]]), full('url ', 0, 1)));
    const avc1 = box('avc1', new Uint8Array(6), u(0, [[16, 1], [16, 0], [16, 0], [32, 0], [32, 0], [32, 0], [16, o.width], [16, o.height], [32, 0x00480000], [32, 0x00480000], [32, 0], [16, 1]]), new Uint8Array(32), u(0, [[16, 0x0018], [16, 0xFFFF]]), box('avcC', o.avcC));
    const stsd = full('stsd', 0, 0, u(0, [[32, 1]]), avc1);
    const runs = []; o.samples.forEach(s => { const r = runs[runs.length - 1]; if (r && r[1] === s.dur) r[0]++; else runs.push([1, s.dur]); });
    const stts = full('stts', 0, 0, u(0, [[32, runs.length], ...runs.flatMap(r => [[32, r[0]], [32, r[1]]])]));
    const keys = []; o.samples.forEach((s, i) => { if (s.key) keys.push(i + 1); });
    const stss = full('stss', 0, 0, u(0, [[32, keys.length], ...keys.map(k => [32, k])]));
    const stsc = full('stsc', 0, 0, u(0, [[32, 1], [32, 1], [32, n], [32, 1]]));
    const stsz = full('stsz', 0, 0, u(0, [[32, 0], [32, n], ...o.samples.map(s => [32, s.data.length])]));
    const stco = full('stco', 0, 0, u(0, [[32, 1], [32, offset]]));
    const stbl = box('stbl', stsd, stts, stss, stsc, stsz, stco);
    return box('moov', mvhd, box('trak', tkhd, box('mdia', mdhd, hdlr, box('minf', vmhd, dinf, stbl))));
  }
  function muxMp4(o) {
    const ftyp = box('ftyp', enc.encode('isom'), u(0, [[32, 0x200]]), enc.encode('isomiso2avc1mp41'));
    let size = 0; o.samples.forEach(s => { size += s.data.length; });
    const m0 = moov(o, 0), offset = ftyp.length + m0.length + 8, m = moov(o, offset);
    const out = new Uint8Array(ftyp.length + m.length + 8 + size), dv = new DataView(out.buffer);
    out.set(ftyp, 0); out.set(m, ftyp.length);
    let p = ftyp.length + m.length; dv.setUint32(p, 8 + size); out.set(enc.encode('mdat'), p + 4); p += 8;
    o.samples.forEach(s => { out.set(s.data, p); p += s.data.length; });
    return out;
  }
  root.muxMp4 = muxMp4;
  if (typeof module !== 'undefined') module.exports = muxMp4;
})(typeof window !== 'undefined' ? window : globalThis);

  // ---------- invio automatico WhatsApp (WhatsApp Business Platform di Meta) ----------
  // Per ogni prenotazione: video del pullman con i suoi posti + testo (modello «posto_pullman»), poi le foto del programma (modello «programma_gita»).
  // Il token di Meta resta solo in questo browser (chiave a parte): non entra nei dati, nella copia di sicurezza né su GitHub.
  const WAKEY = 'laterra.onboard.waapi';
  const WA_DEF = { ver: 'v23.0', phoneId: '', token: '', tplPosto: 'posto_pullman', tplProg: 'programma_gita', lang: 'it', tel: '' };
  // le chiavi di Meta stanno in /config/chiavi.json (le modifica solo il Super Master; servono a tutti i computer per inviare)
  function waCfg() { const k = STORE.get('/config/chiavi.json'); return Object.assign({}, WA_DEF, (k && k.wa) || {}, { tel: S.cfg.telAgenzia || '' }); }
  function waCfgSave(c) { const k = Object.assign({}, STORE.get('/config/chiavi.json') || {}); delete c.tel; k.wa = c; k.u = Date.now(); STORE.put('/config/chiavi.json', k); }
  const waReady = c => !!(c.phoneId && c.token);
  const WA_GG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const WA_MM = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const waDay = iso => { const [y, m, d] = String(iso || '').split('-').map(Number); if (!y) return ''; const dt = new Date(y, m - 1, d); return `${WA_GG[dt.getDay()]} ${d} ${WA_MM[m - 1]}`; };
  const waNow = () => { const d = new Date(); return `${fmtDate(todayISO())} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  // Meta non accetta a capo, tabulazioni o più di 4 spazi di fila dentro i campi del modello
  const waClean = s => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/ {4,}/g, '   ').trim() || '-';

  // ---- i testi dei due modelli da registrare su Meta (categoria Utility, lingua Italiano) ----
  const WA_TPL_POSTO = 'Buongiorno {{1}}, le scrive La Terra Viaggi per la gita «{{2}}».\n\n🚌 Si parte {{3}} alle ore {{4}}\n📍 da {{5}}\n💺 {{6}}\n👤 Accompagnatore: {{7}}\n🗺️ Il punto preciso sulla mappa: {{9}}\n\nNel video vede il pullman con i posti in rosso. Subito dopo le mandiamo il programma.\nPer qualsiasi domanda ci chiami allo {{8}}. Buon viaggio!';
  const WA_TPL_PROG = 'Ecco il programma: {{1}}. Lo tenga a portata di mano. Buon viaggio con La Terra!';
  const WA_TPL_POSTO_EX = ['Maria', 'Tour della Puglia', 'sabato 5 dicembre', '5:00', 'Ragusa, Palazama', 'I vostri posti sono il 13 e il 14 (4ª fila, lato autista)', 'Rita, tel. 333 000 0000', '0932 000000', 'https://maps.app.goo.gl/esempio'];
  const WA_TPL_PROG_EX = ['Tour della Puglia, pagina 1 di 2'];

  function waParams(t, b, bk, c) {
    const x = waData(t, b, bk), n = x.seats.length, L = LMAP[b.layout];
    const where = n && L && window.seatWhere ? window.seatWhere(L, x.seats).split(' · ').join(', ') : '';
    const posti = !n ? 'Il posto sul pullman le verrà comunicato a breve' : n === 1 ? `Il suo posto è il ${x.seats[0]}` : `I vostri posti sono il ${x.seats.slice(0, -1).join(', il ')} e il ${x.seats[n - 1]}`;
    const nome = String(x.p0.nome || '').split(' ')[0] || x.p0.cognome || 'cliente';
    const acc = b.accompagnatore ? `${b.accompagnatore}${b.telAcc ? ', tel. ' + b.telAcc : ''}` : 'verrà comunicato a breve';
    return [nome, t.nome, waDay(t.data), x.pt.ora || 'da confermare', x.pt.luogo || 'da confermare', posti + (where ? ` (${where})` : ''), acc, c.tel || 'agenzia', mapsLink(x.part, x.pt) || 'chieda all\'agenzia'].map(waClean);
  }
  const waFill = (tpl, ps) => tpl.replace(/\{\{(\d+)\}\}/g, (m, i) => ps[i - 1] != null ? ps[i - 1] : m);

  // ---- stato di ogni prenotazione per l'invio ----
  function waState(t, b, bk) {
    const head = bk.full && bk.full.head; const x = waData(t, b, bk);
    const num = waNumber(x.p0.tel);
    if (head && head.waApi) return { k: 'sent', num, x, txt: `inviato il ${head.waApi.at}` };
    if (!num) return { k: 'nonum', num, x, txt: 'manca il cellulare' };
    if (!x.seats.length) return { k: 'noseat', num, x, txt: 'senza posto' };
    const cl = head && head.cid && S.clients.clienti[head.cid];
    if (!(head && (head.waOk || (cl && cl.waOk)))) return { k: 'nook', num, x, txt: 'manca il consenso' };
    if (head && head.waErr) return { k: 'err', num, x, txt: 'errore: ' + head.waErr };
    return { k: 'ready', num, x, txt: 'pronto' };
  }

  // ---- logo e caratteri per disegnare la scheda ----
  let waLogoP = null;
  const waLogo = () => waLogoP || (waLogoP = new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = LOGO; }));
  const waFonts = () => document.fonts && document.fonts.load ? Promise.all(['800 60px "Barlow Condensed"', '700 60px "Barlow Condensed"', '700 30px "Barlow"', '600 30px "Barlow"'].map(f => document.fonts.load(f).catch(() => null))) : Promise.resolve();

  // ---- il video MP4 (H.264, senza audio): il pullman si riempie, poi i posti del cliente si accendono ----
  async function seatVideo(D, L, onp) {
    if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') throw new Error('questo browser non sa creare il video: usa Google Chrome o Microsoft Edge aggiornati');
    const logo = await waLogo(); await waFonts();
    const FPS = 25, N = FPS * 7, SC = 2 / 3, W = 720, H = 900;
    let cfg = null;
    for (const codec of ['avc1.42001f', 'avc1.42e01f', 'avc1.4d401f', 'avc1.640028']) {
      const c = { codec, width: W, height: H, bitrate: 2000000, framerate: FPS, avc: { format: 'avc' } };
      try { const r = await VideoEncoder.isConfigSupported(c); if (r && r.supported) { cfg = c; break; } } catch (e) { /* provo il prossimo */ }
    }
    if (!cfg) throw new Error('questo computer non riesce a creare video H.264: prova con Google Chrome aggiornato');
    const samples = []; let avcC = null, fail = null;
    const enc = new VideoEncoder({
      output: (chunk, meta) => {
        const ds = meta && meta.decoderConfig && meta.decoderConfig.description;
        if (ds && !avcC) avcC = ds instanceof ArrayBuffer ? new Uint8Array(ds.slice(0)) : new Uint8Array(ds.buffer.slice(ds.byteOffset, ds.byteOffset + ds.byteLength));
        const d = new Uint8Array(chunk.byteLength); chunk.copyTo(d); samples.push({ data: d, key: chunk.type === 'key', dur: 1000 });
      },
      error: e => { fail = e; }
    });
    enc.configure(cfg);
    const cv = document.createElement('canvas');
    for (let i = 0; i < N && !fail; i++) {
      window.drawSeatCard(cv, D, L, logo, { t: i / FPS, scale: SC });
      const fr = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      enc.encode(fr, { keyFrame: i % (FPS * 2) === 0 }); fr.close();
      while (enc.encodeQueueSize > 8 && !fail) await new Promise(r => setTimeout(r, 5));
      if (onp && i % 10 === 0) onp(i / N);
    }
    await enc.flush(); enc.close();
    if (fail) throw new Error('errore nel creare il video (' + (fail.message || fail) + ')');
    if (!avcC || !samples.length) throw new Error('il video è venuto vuoto');
    return new Blob([window.muxMp4({ width: W, height: H, timescale: FPS * 1000, avcC, samples })], { type: 'video/mp4' });
  }

  // ---- il programma come foto: JPG/PNG così com'è, PDF → una foto per pagina (massimo 4) ----
  const PDFJS = new URL('./vendor/pdfjs/', location.href).href;
  let pdfjsP = null;
  const loadPdfJs = () => pdfjsP || (pdfjsP = import(PDFJS + 'pdf.min.mjs').then(m => { m.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs'; return m; }).catch(e => { pdfjsP = null; throw new Error('non riesco a leggere il PDF. In alternativa carica il programma come foto JPG'); }));
  async function progImages(t) {
    if (!t.pdf) return [];
    const f = await STORE.getBlob(t.pdf.path || ''); if (!f) throw new Error('il programma non si trova: trascinalo di nuovo sulla gita');
    if (/^image\/(jpeg|png)$/.test(f.type)) return [f];
    const lib = await loadPdfJs();
    const doc = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
    const out = [];
    for (let p = 1; p <= Math.min(doc.numPages, 4); p++) {
      const pg = await doc.getPage(p); const v1 = pg.getViewport({ scale: 1 }); const vp = pg.getViewport({ scale: 1500 / v1.width });
      const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: ctx, canvas: c, viewport: vp }).promise;
      out.push(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.86)));
    }
    return out;
  }

  // ---- chiamate a Meta ----
  const WA_ERR = { 190: 'il codice di accesso (token) non è valido o è scaduto: rifallo su Meta', 10: 'il token non ha il permesso per WhatsApp', 200: 'il token non ha il permesso per WhatsApp', 100: 'un dato inviato non va bene (controlla l\'ID del numero)', 131026: 'questo numero non ha WhatsApp o non può ricevere', 131030: 'numero non autorizzato: in prova Meta accetta solo i numeri aggiunti alla lista di test', 131047: 'sono passate più di 24 ore: serve il modello approvato', 131051: 'tipo di messaggio non supportato', 131053: 'Meta non ha accettato il file (video o foto)', 131056: 'troppi messaggi di fila allo stesso numero: riprova tra poco', 132000: 'il numero di campi non corrisponde al modello registrato su Meta', 132001: 'il modello non esiste su Meta o non è ancora approvato (controlla nome e lingua)', 132005: 'il testo è troppo lungo per il modello', 132012: 'il tipo di allegato non corrisponde al modello (video per il posto, immagine per il programma)', 133010: 'il numero non è registrato sulla piattaforma WhatsApp', 368: 'l\'account è bloccato temporaneamente da Meta', 80007: 'troppe richieste: riprova tra qualche minuto' };
  async function gapi(c, path, body, form) {
    let r;
    try { r = await fetch(`https://graph.facebook.com/${c.ver || WA_DEF.ver}/${path}`, { method: 'POST', headers: form ? { Authorization: 'Bearer ' + c.token } : { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' }, body: form ? body : JSON.stringify(body) }); }
    catch (e) { throw new Error('nessuna risposta da Meta: controlla la connessione internet'); }
    let j = null; try { j = await r.json(); } catch (e) { /* risposta vuota */ }
    if (!r.ok || (j && j.error)) { const e = (j && j.error) || {}; const code = e.error_subcode && WA_ERR[e.error_subcode] ? e.error_subcode : e.code; throw new Error((WA_ERR[code] || e.message || 'errore ' + r.status) + (code ? ` [${code}]` : '')); }
    return j || {};
  }
  async function waUpload(c, blob, name) { const fd = new FormData(); fd.append('messaging_product', 'whatsapp'); fd.append('type', blob.type); fd.append('file', blob, name); const j = await gapi(c, `${c.phoneId}/media`, fd, true); if (!j.id) throw new Error('Meta non ha restituito il file caricato'); return j.id; }
  const waTpl = (c, name, to, kind, mediaId, params) => ({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'template', template: { name, language: { code: c.lang || 'it' }, components: [{ type: 'header', parameters: [{ type: kind, [kind]: { id: mediaId } }] }, { type: 'body', parameters: params.map(p => ({ type: 'text', text: waClean(p) })) }] } });

  // ---- invio a tutti (o a uno solo) ----
  async function waSend(ids, noProg) {
    const t = trip(), b = bus(), c = waCfg(); if (!waReady(c)) return toast("L'invio automatico non è ancora attivo: i codici di Meta li inserisce il tecnico");
    if (UI.waRun) return;
    if (!String(S.cfg.telAgenzia || '').trim()) return toast("Prima scrivi il telefono dell'agenzia in Impostazioni › WhatsApp ai clienti: va nel messaggio");
    syncAll(t); if (!UI.modal || UI.modal.kind !== 'wa') waModal();
    UI.waRun = { done: 0, tot: ids.length, cur: 'Preparo il programma…', ok: 0, ko: 0, p: 0 }; waRefresh();
    let prog = [], progErr = '';
    if (!noProg) {
      try { const imgs = await progImages(t); for (let i = 0; i < imgs.length; i++) prog.push(await waUpload(c, imgs[i], `Programma ${i + 1}.${imgs[i].type === 'image/png' ? 'png' : 'jpg'}`)); }
      catch (e) { progErr = e.message; }
    }
    if (progErr) { UI.waRun = null; return confirmBox('Programma non pronto', `Il programma non si può mandare: ${esc(progErr)}.<br><br>Mando lo stesso i messaggi col posto, senza il programma?`, 'Manda senza programma', () => waSend(ids, true)); }
    for (const id of ids) {
      syncAll(t); const bk = bkById(b, id); if (!bk || !bk.full) { UI.waRun.done++; continue; }
      const head = bk.full.head, st = waState(t, b, bk);
      UI.waRun.cur = `${bkName(bk)} x ${bk.persone.length}`; UI.waRun.p = 0; waRefresh();
      try {
        if (!st.num) throw new Error('manca il cellulare');
        const vid = await seatVideo(st.x.d, LMAP[b.layout], p => { UI.waRun.p = p; waProg(); });
        UI.waRun.cur += ' · invio'; waProg();
        const mid = await waUpload(c, vid, 'Il vostro posto.mp4');
        const r = await gapi(c, `${c.phoneId}/messages`, waTpl(c, c.tplPosto, st.num, 'video', mid, waParams(t, b, bk, c)));
        for (let i = 0; i < prog.length; i++) await gapi(c, `${c.phoneId}/messages`, waTpl(c, c.tplProg, st.num, 'image', prog[i], [prog.length > 1 ? `${t.nome}, pagina ${i + 1} di ${prog.length}` : t.nome]));
        head.waApi = { at: waNow(), to: st.num, id: (r.messages && r.messages[0] && r.messages[0].id) || '', prog: prog.length }; delete head.waErr; UI.waRun.ok++;
      } catch (e) { head.waErr = e.message; UI.waRun.ko++; }
      UI.waRun.done++; save(); waRefresh();
      if (head.waErr && /token|permesso|bloccato|modello non esiste|ID del numero/.test(head.waErr)) break; // inutile continuare: lo stesso errore per tutti
    }
    const R = UI.waRun; UI.waRun = null; waRefresh();
    toast(R.ko ? `Inviati ${R.ok}, non inviati ${R.ko}: guarda il motivo accanto ai nomi` : `Inviati ${R.ok} messaggi su WhatsApp`);
  }
  async function waVideoPreview(id) {
    const t = trip(), b = bus(); syncAll(t); const bk = bkById(b, id); if (!bk) return;
    if (UI.waPrev && UI.waPrev.url) URL.revokeObjectURL(UI.waPrev.url);
    UI.waPrev = { id, busy: true, name: `${bkName(bk)} x ${bk.persone.length}` }; waRefresh();
    try { const v = await seatVideo(waData(t, b, bk).d, LMAP[b.layout]); UI.waPrev = { id, url: URL.createObjectURL(v), name: UI.waPrev.name, kb: Math.round(v.size / 1024), params: waParams(t, b, bk, waCfg()) }; }
    catch (e) { UI.waPrev = { id, err: e.message, name: UI.waPrev.name }; }
    waRefresh();
  }
  function waProg() { const el = $('#wa-run-bar'); if (el && UI.waRun) { el.style.width = `${Math.round(((UI.waRun.done + (UI.waRun.p || 0)) / Math.max(1, UI.waRun.tot)) * 100)}%`; const l = $('#wa-run-l'); if (l) l.textContent = `${UI.waRun.done} di ${UI.waRun.tot} · ${UI.waRun.cur}`; } }
  function waRefresh() { if (!UI.modal || UI.modal.kind !== 'wa') return; const sc = $('.modal-b') ? $('.modal-b').scrollTop : 0; waModal(); if ($('.modal-b')) $('.modal-b').scrollTop = sc; }

  function waModal() {
    const t = trip(), b = bus(); syncAll(t);
    UI.modal = { kind: 'wa' };
    const c = waCfg(), ready = waReady(c), run = UI.waRun;
    const list = b.bookings.map(bk => ({ bk, st: waState(t, b, bk) }));
    const cnt = k => list.filter(x => x.st.k === k).length;
    const todo = list.filter(x => x.st.k === 'ready' || x.st.k === 'err');
    const telWarn = ready && !String(S.cfg.telAgenzia || '').trim() ? '<div class="warnbox">Manca il <b>telefono dell\'agenzia</b> da scrivere nel messaggio: aggiungilo in <b>Impostazioni › WhatsApp ai clienti</b>.</div>' : '';
    const progTxt = t.pdf ? `<div class="infobox">📎 Programma: <b>${esc(t.pdf.name)}</b>. Arriva al cliente come foto${/\.pdf$/i.test(t.pdf.name) ? ', una per pagina' : ''}, subito dopo il video.</div>` : '<div class="warnbox">Manca il programma: trascina il PDF (o la foto JPG) sulla barra della gita. Senza, parte solo il messaggio col posto.</div>';
    const head = ready
      ? `<div class="wa-top"><div><b>Invio automatico attivo</b><span>Ogni cliente riceve: il testo con giorno, ora, luogo, posti e accompagnatore; il video del pullman con i suoi posti in rosso; le foto del programma.</span></div>
         <button class="btn primary" data-act="wasendall" ${run || !todo.length ? 'disabled' : ''}>${ICON.wa} Invia a tutti${todo.length ? ` (${todo.length})` : ''}</button></div>`
      : `<div class="warnbox"><b>L'invio automatico non è ancora attivo.</b> Servono i codici dell'account WhatsApp Business di Meta: la guida passo passo è in <b>Impostazioni › WhatsApp ai clienti</b>; i codici li inserisce il tecnico. Intanto puoi segnare i consensi e vedere i video con il pulsante <b>Video</b>.</div>`;
    const runBox = run ? `<div class="wa-run" role="status"><div class="bar"><i id="wa-run-bar" style="width:${Math.round(((run.done + (run.p || 0)) / Math.max(1, run.tot)) * 100)}%"></i></div><span id="wa-run-l">${run.done} di ${run.tot} · ${esc(run.cur)}</span><span class="small">Non chiudere questa finestra finché non ha finito.</span></div>` : '';
    const pv = UI.waPrev;
    const prevBox = pv ? `<div class="wa-prev"><div class="wa-prev-h"><b>Video per ${esc(pv.name)}</b><button class="btn sm ghost" data-act="waprevclose" aria-label="Chiudi anteprima">${ICON.close}</button></div>
        ${pv.busy ? '<span class="small">Sto creando il video…</span>' : pv.err ? `<div class="warnbox">${esc(pv.err)}</div>` : `<div class="wa-prev-b"><video src="${pv.url}" controls autoplay muted playsinline></video><div><div class="msg">${esc(waFill(WA_TPL_POSTO, pv.params))}</div><a class="btn sm" href="${pv.url}" download="Posto ${esc(pv.name)}.mp4">${ICON.upload} Scarica il video (${pv.kb} KB)</a></div></div>`}</div>` : '';
    const pill = st => `<span class="pill ${st.k === 'sent' ? 'ok' : st.k === 'ready' ? 'neutral' : st.k === 'err' ? 'warn' : 'tbd'}">${esc(st.txt)}</span>`;
    openModal(`Messaggi WhatsApp · ${esc(b.label)}`, `
      ${head}${runBox}${telWarn}${progTxt}
      <div class="wa-sum"><span><b>${cnt('ready') + cnt('err')}</b> da inviare</span><span><b>${cnt('sent')}</b> inviati</span><span><b>${cnt('nook')}</b> senza consenso</span><span><b>${cnt('nonum')}</b> senza cellulare</span><span><b>${cnt('noseat')}</b> senza posto</span>
        ${cnt('nook') ? `<button class="btn sm" data-act="waokall" ${run ? 'disabled' : ''}>Segna il consenso a tutti</button>` : ''}</div>
      ${prevBox}
      <div class="walist">${list.map(({ bk, st }) => {
        const h = bk.full && bk.full.head; const msg = waMessage(t, b, bk);
        return `<div class="wa"><div class="who"><b>${esc(bkName(bk))} x ${bk.persone.length}</b><span>${st.num ? esc(`${st.x.p0.cognome} ${st.x.p0.nome} · ${st.x.p0.tel}`) : 'nessun numero di cellulare nella lista'}${st.x.seats.length ? ` · posti ${fmtSeats(st.x.seats)}` : ''}</span>
            <label class="wa-ok"><input type="checkbox" data-act="waok" data-id="${bk.id}" ${h && (h.waOk || (h.cid && S.clients.clienti[h.cid] && S.clients.clienti[h.cid].waOk)) ? 'checked' : ''} ${run ? 'disabled' : ''}> consenso WhatsApp</label></div>
          <div class="act">${pill(st)}<button class="btn sm" data-act="wavideo" data-id="${bk.id}" ${run || !st.x.seats.length ? 'disabled' : ''}>Video</button>
            ${ready && (st.k === 'ready' || st.k === 'err' || st.k === 'sent') ? `<button class="btn sm" data-act="wasendone" data-id="${bk.id}" ${run ? 'disabled' : ''}>${st.k === 'sent' ? 'Rimanda' : 'Invia'}</button>` : ''}
            ${st.num ? `<a class="btn sm ghost" href="https://wa.me/${st.num}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" data-act="wasent" data-id="${bk.id}" title="Apre WhatsApp con il testo pronto: il video lo alleghi a mano">A mano</a>` : ''}</div>
        </div>`;
      }).join('') || '<div class="small" style="padding:12px">Nessuna prenotazione su questo bus.</div>'}</div>
      <div class="small">«A mano» apre WhatsApp Business con il testo pronto, per i casi singoli o se l'invio automatico non è attivo: il video lo scarichi con «Video» e lo alleghi tu.</div>`,
      `<button class="btn" data-act="settings" style="margin-right:auto">${ICON.edit} Impostazioni</button><button class="btn primary" data-act="close">Chiudi</button>`, true);
  }

  // ---- impostazioni e guida ----
  function waSettingsHTML() {
    const c = waCfg();
    return `<div class="grid2">
        <div class="field"><label for="w-phone">ID del numero di telefono</label><input id="w-phone" value="${esc(c.phoneId)}" inputmode="numeric" placeholder="es. 123456789012345" autocomplete="off"></div>
        <div class="field"><label for="w-token">Token di accesso</label><input id="w-token" type="password" value="${esc(c.token)}" placeholder="EAAG…" autocomplete="off"></div>
        <div class="field"><label for="w-ver">Versione API Meta</label><input id="w-ver" value="${esc(c.ver)}"></div>
        <div class="field"><label for="w-tp">Nome modello «posto»</label><input id="w-tp" value="${esc(c.tplPosto)}"></div>
        <div class="field"><label for="w-tg">Nome modello «programma»</label><input id="w-tg" value="${esc(c.tplProg)}"></div>
      </div>${WA_GUIDE()}`;
  }
  function WA_GUIDE() {
    return `<details class="wa-guide"><summary>Come si attiva, passo passo</summary>
        <ol>${[
          'Apri <b>business.facebook.com</b> e accedi con il profilo Facebook dell\'agenzia.',
          'Se non c\'è già, crea il <b>portafoglio business</b> (Business portfolio) intestato a La Terra viaggi in pullman.',
          'Vai in <b>Impostazioni › Centro sicurezza</b> e avvia la <b>verifica dell\'azienda</b> (servono partita IVA e un documento della società).',
          'Collega il numero WhatsApp Business che usate già: il passaggio si chiama <b>coexistence</b> (WhatsApp Business app + piattaforma). Di solito si fa tramite un partner Meta (BSP): verifichiamo insieme quale conviene prima di farlo, perché alcune funzioni dell\'app cambiano.',
          'In <b>WhatsApp Manager › Modelli di messaggio</b> crea il modello <b>posto_pullman</b>: categoria <b>Utility</b>, lingua <b>Italiano</b>, intestazione <b>Video</b>, e come testo quello qui sotto (pulsante «Copia»). Negli esempi metti i valori di prova indicati.',
          'Crea il secondo modello <b>programma_gita</b>: categoria <b>Utility</b>, lingua <b>Italiano</b>, intestazione <b>Immagine</b>, testo qui sotto.',
          'Aspetta l\'approvazione di Meta (da pochi minuti a un giorno): arriva una notifica.',
          'In <b>Impostazioni business › Utenti di sistema</b> crea un utente di sistema, assegnagli l\'account WhatsApp e genera un <b>token</b> con i permessi <b>whatsapp_business_messaging</b> e <b>whatsapp_business_management</b>.',
          'Il tecnico entra nel <b>Super Master</b> (10 tocchi sul logo nella schermata di accesso) e in «Chiavi e collegamenti» incolla il token e l\'<b>ID del numero di telefono</b> (WhatsApp Manager › Numeri di telefono).',
          'Apri un bus e prova con «Invia» su una prenotazione con il tuo cellulare.'
        ].map(x => `<li>${x}</li>`).join('')}</ol>
        <div class="wa-tpl"><div class="wa-tpl-h"><b>Modello posto_pullman</b> · intestazione Video<button class="btn sm" data-act="wacopy" data-k="posto">Copia testo</button></div><pre>${esc(WA_TPL_POSTO)}</pre><span class="small">Esempi: ${WA_TPL_POSTO_EX.map((x, i) => `{{${i + 1}}} = ${esc(x)}`).join(' · ')}</span></div>
        <div class="wa-tpl"><div class="wa-tpl-h"><b>Modello programma_gita</b> · intestazione Immagine<button class="btn sm" data-act="wacopy" data-k="prog">Copia testo</button></div><pre>${esc(WA_TPL_PROG)}</pre><span class="small">Esempio: {{1}} = ${esc(WA_TPL_PROG_EX[0])}</span></div>
        <span class="small">Costo indicativo: circa 0,025 € a messaggio Utility in Italia (listino Meta da verificare). Un bus da 25 prenotazioni con programma di una pagina: circa 50 messaggi, poco più di 1 €.</span>
      </details>`;
  }
  function waSettingsSave() {
    const g = id => ($('#' + id) ? $('#' + id).value.trim() : '');
    if (!$('#w-phone')) return;
    waCfgSave({ phoneId: g('w-phone').replace(/\D/g, ''), token: g('w-token'), ver: g('w-ver') || WA_DEF.ver, tplPosto: g('w-tp') || WA_DEF.tplPosto, tplProg: g('w-tg') || WA_DEF.tplProg, lang: 'it' });
  }
  function waCopy(k) {
    const txt = k === 'prog' ? WA_TPL_PROG : WA_TPL_POSTO;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Testo copiato: incollalo nel modello su Meta')).catch(() => toast('Non riesco a copiare: seleziona il testo e premi Ctrl+C'));
  }

  // ---------- archivio: copia su questo computer (IndexedDB) + Dropbox per tenere allineati tutti i computer ----------
  // Cartella dell'app su Dropbox (Applicazioni › Viaggi in Pullman La Terra):
  //   /viaggi/<id>.json                   un file per viaggio (lista, attesa, annullati, bus e posti)
  //   /config/utenti.json                 account, ruoli, agenzie permesse, impronte delle password
  //   /config/impostazioni.json           agenzie e casse, luoghi di partenza, testi WhatsApp
  //   /anagrafica/clienti.json            anagrafica clienti
  //   /cassa/aaaa-mm/aaaa-mm-gg_<pc>.json incassi registrati da ogni computer (ognuno scrive solo i suoi)
  //   /cassa/chiusure/aaaa-mm-gg_<ag>.json chiusure di cassa
  //   /programmi/<id-viaggio>/<file>      PDF o foto del programma
  //   /registro/aaaa-mm/aaaa-mm-gg_<pc>.json log tecnico (lo legge solo il Super Master)
  // Due computer che modificano lo stesso file nello stesso momento non si cancellano a vicenda: ogni riga,
  // persona, bus, cliente e utente porta l'ora della sua ultima modifica e vince la più recente.
  const STORE = (() => {
    const DBN = 'viaggi-laterra', QK = 'vip-queue-v1', CK = 'vip-cursor-v1', DK = 'vip-device-v1', PK = 'vip-pulled-v1';
    const files = new Map();
    const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
    const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* pieno o bloccato */ } };
    let dirty = new Set(lsGet(QK, []));
    const blobQ = new Set(lsGet(QK + '-b', []));
    let device = lsGet(DK, null);
    if (!device || !device.id) { device = { id: 'pc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), since: new Date().toISOString() }; lsSet(DK, device); }
    const st = { online: navigator.onLine, syncing: false, error: '', last: null, pulled: lsGet(PK, false) };
    let db = null, onRemote = () => {}, onStatus = () => {};
    const DBX = () => window.VIPDBX;
    const linked = () => !!(DBX() && DBX().isLinked());

    // ---- IndexedDB ----
    function idbOpen() {
      return new Promise((res, rej) => {
        if (!window.indexedDB) return rej(new Error('noidb'));
        const r = indexedDB.open(DBN, 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('files')) d.createObjectStore('files'); if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs'); };
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('blocked'));
      });
    }
    const tx = (store, mode, fn) => new Promise((res, rej) => { if (!db) return res(null); const t = db.transaction(store, mode); const s = t.objectStore(store); const rq = fn(s); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
    async function open() {
      try { db = await idbOpen(); } catch (e) { db = null; }
      if (db) {
        await new Promise((res) => { const t = db.transaction('files', 'readonly'); t.objectStore('files').openCursor().onsuccess = (e) => { const c = e.target.result; if (c) { files.set(c.key, c.value); c.continue(); } }; t.oncomplete = res; t.onerror = res; });
      }
      window.addEventListener('online', () => { st.online = true; kick(); emit(); });
      window.addEventListener('offline', () => { st.online = false; emit(); });
    }
    const persist = (path) => { const rec = files.get(path); tx('files', 'readwrite', (s) => (rec ? s.put(rec, path) : s.delete(path))).catch(() => {}); };
    const saveQ = () => lsSet(QK, [...dirty]);

    // ---- unione di due versioni dello stesso file ----
    const u = (x) => (x && +x.u) || 0;
    function mergeList(a, b, gone, key) {
      a = a || []; b = b || [];
      const bm = new Map(b.map((x) => [x.id, x])), am = new Set(a.map((x) => x.id));
      const out = a.map((x) => { const y = bm.get(x.id); return y && u(y) > u(x) ? y : x; });
      b.forEach((y, i) => { if (am.has(y.id)) return; let at = out.length; for (let k = i - 1; k >= 0; k--) { const j = out.findIndex((z) => z.id === b[k].id); if (j >= 0) { at = j + 1; break; } } out.splice(at, 0, y); am.add(y.id); });
      return out.filter((x) => !(gone && gone[key + ':' + x.id] && gone[key + ':' + x.id] >= u(x)));
    }
    function mergeGone(a, b) { const g = Object.assign({}, a || {}); Object.keys(b || {}).forEach((k) => { g[k] = Math.max(g[k] || 0, b[k]); }); const old = Date.now() - 90 * 864e5; Object.keys(g).forEach((k) => { if (g[k] < old) delete g[k]; }); return g; }
    function mergeTrip(L, R) {
      if (!L) return R; if (!R) return L;
      if (L.deleted || R.deleted) return u(L) >= u(R) ? L : R;
      // i dati del viaggio (prezzi, partenze, date…) vincono per l'ora della LORO modifica (tu), non per quella delle righe
      const tu = (x) => (x && +x.tu) || u(x);
      const base = tu(L) >= tu(R) ? L : R, other = base === L ? R : L;
      const out = JSON.parse(JSON.stringify(base));
      out.u = Math.max(u(L), u(R)); out.tu = Math.max(tu(L), tu(R));
      out.gone = mergeGone(L.gone, R.gone);
      const LS = ['rows', 'attesa', 'annullati'];
      ['rows', 'attesa', 'annullati', 'buses'].forEach((k) => { out[k] = mergeList(base[k], other[k], out.gone, k); });
      // una persona spostata da una lista all'altra resta solo dove è stata messa per ultima
      const best = new Map(); LS.forEach((k) => out[k].forEach((x) => { const b = best.get(x.id); if (!b || u(x) > b.u) best.set(x.id, { k, u: u(x) }); }));
      LS.forEach((k) => { out[k] = out[k].filter((x) => best.get(x.id).k === k); });
      return out;
    }
    function mergeMap(key) {
      return (L, R) => {
        if (!L) return R; if (!R) return L;
        const out = Object.assign({}, u(L) >= u(R) ? L : R); const m = Object.assign({}, R[key] || {});
        Object.keys(L[key] || {}).forEach((id) => { const a = L[key][id], b = m[id]; m[id] = !b || u(a) >= u(b) ? a : b; });
        out.gone = mergeGone(L.gone, R.gone); Object.keys(out.gone).forEach((id) => { if (m[id] && out.gone[id] >= u(m[id])) delete m[id]; });
        out[key] = m; out.u = Math.max(u(L), u(R)); return out;
      };
    }
    function mergeUnion(key) {
      return (L, R) => {
        if (!L) return R; if (!R) return L;
        const seen = new Map(); [...(R[key] || []), ...(L[key] || [])].forEach((x) => { const y = seen.get(x.id); if (!y || u(x) >= u(y)) seen.set(x.id, x); });
        return Object.assign({}, R, L, { [key]: [...seen.values()].sort((a, b) => String(a.at || '').localeCompare(String(b.at || ''))) });
      };
    }
    const lww = (L, R) => (!L ? R : !R ? L : u(L) >= u(R) ? L : R);
    function mergeFor(path) {
      if (path.startsWith('/viaggi/')) return mergeTrip;
      if (path === '/config/utenti.json') return mergeMap('users');
      if (path === '/anagrafica/clienti.json') return mergeMap('clienti');
      if (path.startsWith('/cassa/movimenti/')) return mergeUnion('movs');
      if (path.startsWith('/registro/') && !path.startsWith('/registro/dispositivi/')) return mergeUnion('ev');
      return lww;
    }

    // ---- lettura e scrittura per l'app ----
    const get = (path) => { const r = files.get(path); return r ? r.data : null; };
    const list = (prefix) => [...files.keys()].filter((p) => p.startsWith(prefix)).map((p) => [p, files.get(p).data]);
    let ver = 0;
    function put(path, data) {
      const rec = files.get(path) || { rev: null };
      let d = JSON.parse(JSON.stringify(data));
      if (rec.data && mergeFor(path) !== lww) d = mergeFor(path)(d, rec.data);
      files.set(path, { rev: rec.rev, data: d }); ver++;
      persist(path); dirty.add(path); saveQ(); kick(); emit();
      const now = Date.now(); if (!putSeen[path] || now - putSeen[path] > 15000) { putSeen[path] = now; DIAG.ev('salva', 'Salvato ' + path, { inAttesa: dirty.size }); }
    }
    const putSeen = {};

    // ---- Dropbox ----
    const enc = new TextEncoder(), dec = new TextDecoder();
    let lock = Promise.resolve();
    const locked = (fn) => { const p = lock.then(fn, fn); lock = p.catch(() => {}); return p; };
    async function pullOnce() {
      const D = DBX(); let cursor = lsGet(CK, null); let res;
      try { res = cursor ? await D.listFolder(null, cursor) : await D.listFolder(''); }
      catch (e) { if (e.code === 'reset') { lsSet(CK, null); res = await D.listFolder(''); } else throw e; }
      if (res === null) { lsSet(CK, null); markPulled(); return []; }
      const changed = [];
      for (;;) {
        for (const en of res.entries || []) {
          const p = en.path_lower;
          if (en['.tag'] === 'deleted') { if (files.has(p) && !dirty.has(p)) { files.delete(p); persist(p); changed.push(p); DIAG.ev('sync', 'Cancellato da un altro computer: ' + p); } continue; }
          if (en['.tag'] !== 'file' || !/\.json$/.test(p)) continue;
          const loc = files.get(p); if (loc && loc.rev === en.rev) continue;
          const r = await D.download(p); if (!r) continue;
          let remote; try { remote = JSON.parse(dec.decode(r.buf)); } catch (e) { DIAG.ev('sync-errore', 'File illeggibile su Dropbox: ' + p, { bytes: r.buf && r.buf.byteLength }); continue; }
          if (dirty.has(p) && loc) { files.set(p, { rev: r.meta.rev || en.rev, data: mergeFor(p)(loc.data, remote) }); DIAG.ev('sync-unione', 'Unito con le modifiche di un altro computer: ' + p); }
          else files.set(p, { rev: r.meta.rev || en.rev, data: remote });
          persist(p); changed.push(p); ver++;
        }
        lsSet(CK, res.cursor);
        if (!res.has_more) break;
        res = await D.listFolder(null, res.cursor);
      }
      markPulled();
      if (changed.length) DIAG.ev('sync', `Ricevuti ${changed.length} file da Dropbox`, { file: changed.slice(0, 25) });
      return changed;
    }
    function markPulled() { if (!st.pulled) { st.pulled = true; lsSet(PK, true); } }
    async function pushOnce() {
      const D = DBX(); const changed = []; let fail = null; const sent = [];
      for (const p of [...dirty]) {
       try {
        const rec = files.get(p); if (!rec) { dirty.delete(p); continue; }
        for (let tryN = 0; tryN < 4; tryN++) {
          try {
            const meta = await D.upload(p, enc.encode(JSON.stringify(rec.data)), rec.rev ? { update: rec.rev } : 'add');
            const cur = files.get(p); files.set(p, { rev: meta.rev, data: cur ? cur.data : rec.data }); persist(p);
            if (cur && JSON.stringify(cur.data) === JSON.stringify(rec.data)) dirty.delete(p);
            sent.push(p); break;
          } catch (e) {
            if (e.code !== 'conflict') throw e;
            DIAG.ev('sync-conflitto', `${p}: cambiato nel frattempo da un altro computer, unisco (tentativo ${tryN + 1})`);
            const r = await D.download(p);
            if (!r) { rec.rev = null; continue; }
            let remote = null; try { remote = JSON.parse(dec.decode(r.buf)); } catch (x) { remote = null; }
            const merged = remote ? mergeFor(p)(files.get(p).data, remote) : files.get(p).data;
            files.set(p, { rev: r.meta.rev, data: merged }); persist(p); Object.assign(rec, files.get(p)); changed.push(p); ver++;
          }
        }
       } catch (e) { fail = fail || e; DIAG.ev('sync-errore', 'Invio non riuscito: ' + p, { code: e.code, status: e.status, summary: e.summary }); if (e.code === 'network' || e.code === 'no_auth') break; }
      }
      saveQ();
      if (sent.length) DIAG.ev('sync', `Inviati ${sent.length} file a Dropbox`, { file: sent.slice(0, 25), restano: dirty.size });
      if (fail) { const e = fail; e.changed = changed; throw e; }
      return changed;
    }
    async function pushBlobs() {
      const D = DBX();
      for (const p of [...blobQ]) {
        const b = await tx('blobs', 'readonly', (s) => s.get(p)).catch(() => null);
        if (!b) { blobQ.delete(p); continue; }
        try { await D.upload(p, b, 'overwrite'); blobQ.delete(p); DIAG.ev('sync', 'Inviato il file ' + p, { KB: Math.round((b.size || 0) / 1024) }); } catch (e) { DIAG.ev('sync-errore', 'Invio del file non riuscito: ' + p, { code: e.code, status: e.status }); if (e.code === 'network' || e.code === 'no_auth') break; }
      }
      lsSet(QK + '-b', [...blobQ]);
    }
    async function syncNow() {
      if (!linked() || !navigator.onLine) return;
      return locked(async () => {
        st.syncing = true; emit();
        try {
          const a = await pullOnce(); if (a.length) onRemote(a);
          let b = []; try { b = await pushOnce(); } catch (e) { if (e.changed && e.changed.length) onRemote(e.changed); throw e; }
          if (b.length) onRemote(b);
          await pushBlobs();
          st.error = ''; st.last = new Date();
        } catch (e) { st.error = e && e.code ? e.code : 'errore'; DIAG.ev('sync-errore', 'Sincronizzazione interrotta: ' + st.error, { code: e && e.code, status: e && e.status, summary: e && e.summary, msg: e && e.message }); if (window.ACC) ACC.tlog('errore', 'Sincronizzazione Dropbox: ' + (e && (e.code + (e.status ? ' ' + e.status : '')) || e)); throw e; }
        finally { st.syncing = false; emit(); }
      });
    }
    let kickT = null; let looping = false;
    function kick() { clearTimeout(kickT); kickT = setTimeout(() => { syncNow().catch(() => {}); }, 1200); }
    async function loop() {
      if (looping) return; looping = true;
      let wait = 2000;
      for (;;) {
        if (!linked() || !navigator.onLine) { await sleep(4000); continue; }
        try {
          await syncNow(); wait = 2000;
          const cur = lsGet(CK, null);
          if (cur) { const lp = await DBX().longpoll(cur, 45); if (lp && lp.backoff) { DIAG.ev('sync', `Dropbox chiede di aspettare ${lp.backoff} s`); await sleep(lp.backoff * 1000); } }
          else await sleep(5000);
        } catch (e) { DIAG.ev('sync', `Nuovo tentativo tra ${Math.round(wait / 1000)} s`); await sleep(wait); wait = Math.min(60000, wait * 2); }
      }
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    function emit() { try { onStatus(status()); } catch (e) { /* niente */ } }
    function status() { return Object.assign({ linked: linked(), pending: dirty.size + blobQ.size, hasKey: !!(DBX() && DBX().hasKey()) }, st); }

    // ---- file non di testo (programmi) ----
    async function putBlob(path, blob) { await tx('blobs', 'readwrite', (s) => s.put(blob, path)).catch(() => {}); blobQ.add(path); lsSet(QK + '-b', [...blobQ]); kick(); }
    async function getBlob(path) {
      const b = await tx('blobs', 'readonly', (s) => s.get(path)).catch(() => null); if (b) return b;
      if (!linked()) return null;
      const r = await DBX().download(path); if (!r) return null;
      const bl = new Blob([r.buf], { type: /\.pdf$/i.test(path) ? 'application/pdf' : /\.png$/i.test(path) ? 'image/png' : 'image/jpeg' });
      await tx('blobs', 'readwrite', (s) => s.put(bl, path)).catch(() => {});
      return bl;
    }
    async function delBlob(path) { await tx('blobs', 'readwrite', (s) => s.delete(path)).catch(() => {}); blobQ.delete(path); lsSet(QK + '-b', [...blobQ]); if (linked()) DBX().remove(path).catch(() => {}); }

    return {
      pendingList: () => [...dirty, ...blobQ],
      sizes() { const o = {}; files.forEach((r, p) => { const k = p.split('/').slice(0, 2).join('/') || '/'; const b = JSON.stringify(r.data || null).length; const x = o[k] = o[k] || { file: 0, KB: 0, senzaRev: 0 }; x.file++; x.KB += b / 1024; if (!r.rev) x.senzaRev++; }); Object.values(o).forEach(x => { x.KB = Math.round(x.KB); }); return o; },
      cursor: () => !!lsGet(CK, null),
      dropUnsynced() { DIAG.ev('sync', 'Primo collegamento a Dropbox: tolti i dati di prova di questo computer'); [...files.keys()].forEach((p) => { const r = files.get(p); if (r && !r.rev) { files.delete(p); persist(p); dirty.delete(p); } }); blobQ.clear(); lsSet(QK + '-b', []); saveQ(); },
      ver: () => ver,
      open, get, list, put, putBlob, getBlob, delBlob, syncNow, loop, kick, status, device,
      mergeTrip, mergeFor, set onRemote(f) { onRemote = f; }, set onStatus(f) { onStatus = f; },
      // per le prove: svuota la copia locale
      async wipe() { DIAG.ev('sync', 'Copia di questo computer cancellata: la riscarico da Dropbox'); files.clear(); dirty.clear(); blobQ.clear(); saveQ(); lsSet(CK, null); lsSet(PK, null); st.pulled = false; await tx('files', 'readwrite', (s) => s.clear()); await tx('blobs', 'readwrite', (s) => s.clear()); }
    };
  })();

  // ---------- account, accesso e registro tecnico ----------
  // Ruoli: «super» (Super Master: il tecnico per la manutenzione, invisibile agli altri), «master», «operatore»,
  // «contabilita» (ufficio contabilità: vede solo cassa e contabilità, senza modificare).
  // Le password non si salvano mai: si salva solo un'impronta PBKDF2 (150.000 passaggi) con un sale diverso per ognuno.
  const ROLE_L = { super: 'Super Master', master: 'Master', operatore: 'Operatore', contabilita: 'Contabilità' };
  const PERM = {
    super: ['viaggi', 'anag', 'cassa', 'cassaAll', 'conta', 'settings', 'users', 'tech'],
    master: ['viaggi', 'anag', 'cassa', 'cassaAll', 'conta', 'settings', 'users'],
    operatore: ['viaggi', 'anag', 'cassa'],
    contabilita: ['cassaAll', 'conta', 'readonly']
  };
  const SESK = 'vip-session-v1', LASTAG = 'vip-last-ag', FAILK = 'vip-login-fails';
  const ITER = 150000;
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  async function pwHash(pw, salt, iter) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(atob(salt), c => c.charCodeAt(0)), iterations: iter, hash: 'SHA-256' }, k, 256);
    return b64(bits);
  }
  const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));
  const normName = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const ACC = {
    sess: null,
    loadSess() { try { this.sess = JSON.parse(localStorage.getItem(SESK) || sessionStorage.getItem(SESK) || 'null'); } catch (e) { this.sess = null; } },
    saveSess(remember) { if (remember === undefined) remember = !!(this.sess && this.sess.r); if (this.sess) this.sess.r = !!remember; const v = JSON.stringify(this.sess); try { localStorage.removeItem(SESK); sessionStorage.removeItem(SESK); if (this.sess) (remember ? localStorage : sessionStorage).setItem(SESK, v); } catch (e) { /* niente */ } },
    users() { return (S && S.users && S.users.users) || {}; },
    me() { const s = this.sess; const u = s && this.users()[s.uid]; if (!u || u.active === false) return null; if ((u.resetN || 0) !== (s.rn || 0)) return null; return Object.assign({ id: s.uid }, u); },
    role() { const m = this.me(); return m ? m.role : ''; },
    can(p) { return (PERM[this.role()] || []).includes(p); },
    agency() { const s = this.sess; return s && s.ag ? (S.cfg.agenzie.find(a => a.id === s.ag) || null) : null; },
    allowedAg(u) { u = u || this.me(); const all = S.cfg.agenzie.map(a => a.id); return !u || u.role === 'super' || !u.agencies || !u.agencies.length ? all : u.agencies.filter(x => all.includes(x)); },
    find(name) { const n = normName(name); return Object.entries(this.users()).find(([, u]) => normName(u.name) === n && u.active !== false) || null; },
    async create(name, pw, role, agencies) {
      const salt = newSalt(); const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      S.users.users[id] = { name: String(name).trim(), role, agencies: agencies || [], salt, iter: ITER, hash: await pwHash(pw, salt, ITER), active: true, created: new Date().toISOString(), mustChange: false };
      flush(); return id;
    },
    async setPw(id, pw, mustChange) { const u = this.users()[id]; const salt = newSalt(); Object.assign(u, { salt, iter: ITER, hash: await pwHash(pw, salt, ITER), mustChange: !!mustChange, pwAt: new Date().toISOString() }); if (mustChange) u.resetN = (u.resetN || 0) + 1; flush(); },
    async check(name, pw) { const n = normName(name); for (const [id, u] of Object.entries(this.users())) { if (normName(u.name) !== n || u.active === false) continue; if ((await pwHash(pw, u.salt, u.iter || ITER)) === u.hash) return id; } return null; },
    // registro tecnico: un file al giorno per computer, letto solo dal Super Master
    tlog(lv, m) {
      DIAG.ev('registro-' + lv, m);
      try {
        const d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const p = `/registro/${day.slice(0, 7)}/${day}_${STORE.device.id}.json`;
        const cur = STORE.get(p) || { dev: STORE.device.id, ev: [] }; const me = this.me();
        cur.ev = (cur.ev || []).concat([{ id: uid(), at: d.toISOString(), lv, m: String(m).slice(0, 400), who: me ? me.name : '', ag: this.sess && this.sess.ag || '' }]).slice(-2000);
        STORE.put(p, cur);
      } catch (e) { /* il registro non deve mai fermare il lavoro */ }
    },
    log(m) { this.tlog('info', m); }
  };
  window.ACC = ACC;

  // ---------- schermate prima di entrare ----------
  const GATE = { step: null, taps: 0, msg: '', busy: false, setup: 1, hello: '', remember: true };
  const LOCAL_MODE = 'vip-local-mode';
  function gateStep() {
    const st = STORE.status();
    const local = localStorage.getItem(LOCAL_MODE) === '1' || !st.hasKey;
    if (!local && !st.linked) return 'link';
    if (st.linked && !st.pulled) return 'wait';
    const act = Object.values(ACC.users()).filter(u => u.active !== false);
    if (!act.length) { GATE.setup = 1; return 'setup'; }
    const me = ACC.me();
    if (!act.some(u => u.role !== 'super')) { if (me && me.role === 'super') { GATE.setup = 2; return 'setup'; } return GATE.step === 'tech' ? 'tech' : 'login'; }
    if (!me) return GATE.step === 'tech' ? 'tech' : 'login';
    if (S.cfg.maint && me.role !== 'super') return 'maint';
    if (me.mustChange) return 'pwchange';
    if (GATE.step === 'hello') return 'hello';
    if (needsAgency(me) && (!ACC.agency() || !ACC.allowedAg(me).includes(ACC.sess.ag))) return 'agency';
    return null;
  }
  const needsAgency = u => u.role === 'operatore' || u.role === 'master';
  const gLogo = (tap) => `<button type="button" class="g-logo"${tap ? ' data-act="gtap"' : ''} aria-label="La Terra"><img src="${LOGO}" alt="La Terra"></button>`;
  const gTitle = () => `<h1 class="g-title">Viaggi <span>in Pullman</span></h1>`;
  function gateView(step) {
    const msg = GATE.msg ? `<div class="g-msg" role="alert">${esc(GATE.msg)}</div>` : '';
    if (step === 'link') return `<div class="gate"><div class="g-card">${gLogo()}${gTitle()}<p class="g-sub">Per lavorare con le altre agenzie collega l'archivio Dropbox di Viaggi in Pullman. Si fa una volta sola su questo computer.</p>${msg}
      <button class="g-btn" data-act="glink">Collega Dropbox</button>
      <button class="g-link" data-act="glocal">Prova l'app solo su questo computer</button></div></div>`;
    if (step === 'maint') return `<div class="gate"><div class="g-card">${gLogo(true)}${gTitle()}<p class="g-sub"><b>L'app è in manutenzione.</b> Il tecnico sta sistemando qualcosa: riprova tra poco.</p><button class="g-link" data-act="logout">Esci</button></div></div>`;
    if (step === 'wait') return `<div class="gate"><div class="g-card">${gLogo()}${gTitle()}<div class="g-spin" aria-hidden="true"></div><p class="g-sub" role="status">Scarico i dati da Dropbox…</p>${msg}</div></div>`;
    if (step === 'setup') {
      const s1 = GATE.setup === 1;
      return `<div class="gate"><div class="g-card wide">${gLogo()}${gTitle()}
        <p class="g-sub">${s1 ? '<b>Primo avvio · passo 1 di 2.</b> Crea l\'account del tecnico (Super Master): serve per la manutenzione, gli altri non lo vedono. Si apre toccando 10 volte il logo nella schermata di accesso.' : '<b>Primo avvio · passo 2 di 2.</b> Crea l\'account Master: gestisce operatori, agenzie e impostazioni.'}</p>${msg}
        <form class="g-form" data-form="${s1 ? 'setup1' : 'setup2'}">
          <label>Nome account<input name="n" autocomplete="username" required value="${s1 ? 'Tecnico' : ''}"></label>
          <label>Password (almeno 8 caratteri)<input name="p" type="password" autocomplete="new-password" required minlength="8"></label>
          <label>Ripeti la password<input name="p2" type="password" autocomplete="new-password" required minlength="8"></label>
          <button class="g-btn" type="submit"${GATE.busy ? ' disabled' : ''}>${s1 ? 'Crea il Super Master' : 'Crea il Master ed entra'}</button>
        </form></div></div>`;
    }
    if (step === 'login') return `<div class="gate"><div class="g-card">${gLogo(true)}${gTitle()}<p class="g-sub">Accedi con il tuo account</p>${msg}
      <form class="g-form" data-form="login">
        <label>Nome account<input name="n" autocomplete="username" required></label>
        <label>Password<input name="p" type="password" autocomplete="current-password" required></label>
        <label class="g-chk"><input name="r" type="checkbox"${GATE.remember ? ' checked' : ''}> Ricordami su questo computer</label>
        <button class="g-btn" type="submit"${GATE.busy ? ' disabled' : ''}>${GATE.busy ? 'Controllo…' : 'Accedi'}</button>
      </form>
      <p class="g-foot">Password dimenticata? Chiedi al tuo Master di reimpostarla.</p></div>
      <p class="g-agz">La Terra viaggi in pullman · ${S.cfg.agenzie.map(a => esc(a.nome)).join(' · ')}</p></div>`;
    if (step === 'tech') return `<div class="gate dark"><div class="g-card dark">
      <div class="g-th"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FF6B81" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg><div><h1>Accesso tecnico</h1><p>Solo per la manutenzione dell'app</p></div></div>${msg}
      <form class="g-form" data-form="tech">
        <label>Account tecnico<input name="n" autocomplete="username" required></label>
        <label>Password tecnica<input name="p" type="password" autocomplete="current-password" required></label>
        <button class="g-btn light" type="submit"${GATE.busy ? ' disabled' : ''}>Entra come Super Master</button>
      </form><button class="g-link" data-act="gback">Torna all'accesso normale</button></div></div>`;
    if (step === 'pwchange') return `<div class="gate"><div class="g-card">${gLogo()}<h1 class="g-title">Nuova password</h1><p class="g-sub">La password è stata reimpostata: scegline una nuova, che conosci solo tu.</p>${msg}
      <form class="g-form" data-form="pwchange">
        <label>Nuova password (almeno 8 caratteri)<input name="p" type="password" autocomplete="new-password" required minlength="8"></label>
        <label>Ripeti la password<input name="p2" type="password" autocomplete="new-password" required minlength="8"></label>
        <button class="g-btn" type="submit"${GATE.busy ? ' disabled' : ''}>Salva ed entra</button>
      </form></div></div>`;
    if (step === 'hello') return `<div class="gate"><div class="g-hello"><img class="g-hlogo" src="${LOGO}" alt="La Terra"><h1 class="ciao">Ciao <span>${esc(GATE.hello)}</span></h1><p class="sub">Sto preparando la tua scrivania…</p>
      <div class="g-road sub" aria-hidden="true"><i class="track"></i><i class="bar"></i><svg class="bus" width="64" height="30" viewBox="0 0 64 30"><rect x="2" y="3" width="56" height="20" rx="6" fill="#D90D36"/><rect x="8" y="7" width="10" height="7" rx="2" fill="#fff"/><rect x="21" y="7" width="10" height="7" rx="2" fill="#fff"/><rect x="34" y="7" width="10" height="7" rx="2" fill="#fff"/><rect x="47" y="7" width="8" height="10" rx="2" fill="#fff"/><circle cx="15" cy="24" r="4" fill="#1D1D1F"/><circle cx="45" cy="24" r="4" fill="#1D1D1F"/></svg></div></div></div>`;
    if (step === 'agency') {
      const me = ACC.me(); const ok = ACC.allowedAg(me); let last = ''; try { last = localStorage.getItem(LASTAG) || ''; } catch (e) { /* niente */ }
      return `<div class="gate top"><div class="g-ag">${gLogo()}<h1>Dove lavori oggi, ${esc(me.name)}?</h1><p class="g-sub">Scegli l'agenzia: gli incassi di oggi andranno nella sua cassa.</p>
        <div class="g-agrid">${S.cfg.agenzie.map(a => ok.includes(a.id)
          ? `<button class="g-agc${a.id === last ? ' last' : ''}" data-act="gpickag" data-id="${a.id}"><span class="g-pin">${PIN}</span>${a.id === last ? '<span class="g-tag">Ultima usata</span>' : ''}<b>${esc(a.nome)}</b><span class="g-addr">${esc(a.indirizzo || '')}</span><span class="g-cassa"><span>${esc(a.cassa || 'Cassa ' + a.nome)}</span><span class="go">Entra ›</span></span></button>`
          : `<div class="g-agc off"><span class="g-pin">${LOCK}</span><span class="g-tag">Non abilitata</span><b>${esc(a.nome)}</b><span class="g-addr">Il Master ha limitato il tuo account ad altre agenzie.</span><span class="g-cassa">${esc(a.cassa || a.nome)}</span></div>`).join('')}</div>
        <div class="g-who"><span class="av">${esc((me.name || '?')[0].toUpperCase())}</span><span><b>${esc(me.name)}</b> · ${esc(ROLE_L[me.role])}</span><button class="g-link" data-act="logout">Non sei tu? Esci</button></div></div></div>`;
    }
    return '';
  }
  const PIN = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const LOCK = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  function fails() { try { return JSON.parse(localStorage.getItem(FAILK) || '{"n":0,"t":0}'); } catch (e) { return { n: 0, t: 0 }; } }
  async function gateSubmit(form) {
    const f = Object.fromEntries(new FormData(form).entries()); const kind = form.dataset.form;
    GATE.msg = '';
    const pwOk = () => { if ((f.p || '').length < 8) { GATE.msg = 'La password deve avere almeno 8 caratteri.'; return false; } if (f.p !== f.p2) { GATE.msg = 'Le due password non sono uguali.'; return false; } return true; };
    if (kind === 'setup1' || kind === 'setup2') {
      if (!String(f.n || '').trim()) { GATE.msg = 'Scrivi il nome dell\'account.'; return render(); }
      if (!pwOk()) return render();
      if (ACC.find(f.n)) { GATE.msg = 'Questo nome non si può usare: scegline un altro.'; return render(); }
      GATE.busy = true; render();
      // un altro computer potrebbe aver appena fatto il primo avvio: prima si guarda su Dropbox
      if (kind === 'setup1' && STORE.status().linked) { try { await STORE.syncNow(); } catch (e) { /* si riprova dopo */ } if (Object.values(ACC.users()).some(u => u.active !== false)) { GATE.busy = false; GATE.msg = 'Il primo avvio è già stato fatto da un altro computer: entra con il tuo account.'; return render(); } }
      const id = await ACC.create(f.n, f.p, kind === 'setup1' ? 'super' : 'master', []);
      GATE.busy = false;
      if (kind === 'setup1') { ACC.sess = { uid: id, at: Date.now() }; ACC.saveSess(false); GATE.setup = 2; ACC.tlog('info', 'Primo avvio: creato il Super Master'); return render(); }
      ACC.sess = { uid: id, at: Date.now() }; ACC.saveSess(true); ACC.tlog('info', `Primo avvio: creato il Master «${f.n}»`);
      GATE.hello = String(f.n).trim(); return hello();
    }
    if (kind === 'login' || kind === 'tech') {
      const fl = fails(); if (fl.n >= 5 && Date.now() - fl.t < 30000) { GATE.msg = 'Troppi tentativi sbagliati: aspetta 30 secondi e riprova.'; return render(); }
      GATE.busy = true; GATE.remember = !!f.r || kind === 'tech'; render();
      const id = await ACC.check(f.n, f.p); GATE.busy = false;
      const u = id && ACC.users()[id];
      if (!u || (kind === 'login' && u.role === 'super') || (kind === 'tech' && u.role !== 'super')) {
        try { localStorage.setItem(FAILK, JSON.stringify({ n: fl.n + 1, t: Date.now() })); } catch (e) { /* niente */ }
        ACC.tlog('avviso', `${kind === 'tech' ? 'Accesso tecnico' : 'Accesso'} non riuscito con il nome «${String(f.n).slice(0, 40)}»`);
        GATE.msg = 'Nome o password non corretti.'; return render();
      }
      try { localStorage.removeItem(FAILK); } catch (e) { /* niente */ }
      ACC.sess = { uid: id, at: Date.now(), rn: u.resetN || 0 }; ACC.saveSess(GATE.remember); ACC.tlog('info', u.role === 'super' ? 'Accesso tecnico del Super Master' : 'Accesso');
      GATE.hello = u.name; GATE.step = null; UI.view = u.role === 'contabilita' ? 'conta' : u.role === 'super' ? 'super' : 'home';
      return u.mustChange ? render() : hello();
    }
    if (kind === 'pwchange') {
      if (!pwOk()) return render();
      GATE.busy = true; render(); await ACC.setPw(ACC.sess.uid, f.p, false); GATE.busy = false; ACC.tlog('info', 'Password cambiata dopo la reimpostazione');
      GATE.hello = ACC.me().name; return hello();
    }
    if (kind === 'mypw') {
      const id = await ACC.check(ACC.me().name, f.old);
      if (id !== ACC.sess.uid) { toast('La password attuale non è giusta'); return; }
      if ((f.p || '').length < 8 || f.p !== f.p2) { toast(f.p !== f.p2 ? 'Le due password non sono uguali' : 'Almeno 8 caratteri'); return; }
      await ACC.setPw(ACC.sess.uid, f.p, false); ACC.tlog('info', 'Password cambiata'); form.reset(); toast('Password cambiata');
    }
  }
  function hello() {
    GATE.step = 'hello'; render();
    setTimeout(() => { if (GATE.step === 'hello') { GATE.step = null; render(); } }, 2600);
  }
  function logout() { ACC.tlog('info', 'Uscita'); ACC.sess = null; ACC.saveSess(false); GATE.step = null; GATE.msg = ''; UI.view = 'home'; UI.tripId = null; closeModal(); render(); }

  // ---------- anagrafica clienti ----------
  // Si riempie da sola con le persone scritte nelle liste dei viaggi; si può anche modificare a mano.
  // Mentre scrivi il cognome nella lista, i clienti già conosciuti compaiono tra i suggeriti: Invio compila la riga.
  const CLF = [['cognome', 'Cognome'], ['nome', 'Nome'], ['nascita', 'Data di nascita'], ['natoA', 'Nato/a a'], ['tel', 'Cellulare'], ['tel2', 'Altro telefono'], ['email', 'Email'], ['indirizzo', 'Indirizzo'], ['cap', 'CAP'], ['citta', 'Città'], ['cf', 'Codice fiscale / P. IVA'], ['sdi', 'Codice SDI o PEC (fattura)'], ['part', 'Partenza abituale (codice)'], ['pref', 'Preferenze (es. posto davanti)'], ['note', 'Note']];
  const clients = () => S.clients.clienti;
  const nk = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const baseCognome = cg => { const m = RX.exec(String(cg || '').trim()); return (m ? m[1] : String(cg || '')).trim(); };
  const telK = s => String(s || '').replace(/\D/g, '').replace(/^(0039|39)(?=3\d{8,9}$)/, '');
  function findClient(cg, nm, nascita, tel) {
    const c = nk(baseCognome(cg)), n = nk(nm); if (!c || !n) return null;
    const same = Object.entries(clients()).filter(([, x]) => nk(x.cognome) === c && nk(x.nome) === n);
    if (!same.length) return null;
    const byN = nascita && same.find(([, x]) => x.nascita && x.nascita === nascita); if (byN) return byN[0];
    const byT = tel && same.find(([, x]) => telK(x.tel) && telK(x.tel) === telK(tel)); if (byT) return byT[0];
    const free = same.filter(([, x]) => !(nascita && x.nascita && x.nascita !== nascita));
    return free.length === 1 ? free[0][0] : null;
  }
  // una riga della lista entra in anagrafica (o aggiorna il cliente già collegato)
  function upsertFromRow(r) {
    if (ACC.can('readonly')) return null;
    const cg = baseCognome(r.cognome), nm = String(r.nome || '').trim(); if (!cg || !nm) return null;
    let id = r.cid && clients()[r.cid] ? r.cid : findClient(cg, nm, r.nascita, r.tel);
    if (id && r.cid && r.cid === id) { const x = clients()[id]; if (nk(x.cognome) !== nk(cg) || nk(x.nome) !== nk(nm)) id = findClient(cg, nm, r.nascita, r.tel); }
    if (!id) { id = 'c' + uid(); clients()[id] = { cognome: cg, nome: nm, nascita: '', natoA: '', tel: '', email: '', indirizzo: '', part: '', pref: '', note: '', since: todayISO() }; }
    const x = clients()[id];
    [['nascita', 'nascita'], ['natoA', 'natoA'], ['tel', 'tel'], ['part', 'part']].forEach(([f, rf]) => { const v = String(r[rf] || '').trim(); if (v && x[f] !== v) x[f] = rf === 'part' ? v.toUpperCase() : v; });
    if (/@/.test(r.note || '') && !x.email) { const m = /[\w.+-]+@[\w-]+\.[\w.]+/.exec(r.note); if (m) x.email = m[0]; }
    if (r.cid !== id) r.cid = id;
    return id;
  }
  function buildAnagrafica() {
    if (S.cfg.anagBuilt) return;
    S.trips.forEach(t => (t.rows || []).forEach(r => upsertFromRow(r)));
    S.cfg.anagBuilt = todayISO(); save();
  }
  // in quali viaggi compare ogni cliente
  function clientIndex() {
    const ix = {};
    S.trips.forEach(t => { const D = deriveBookings(t); D.forEach(bk => bk.persone.forEach(p => { const id = p.row.cid; if (!id) return; (ix[id] = ix[id] || []).push({ t, bk, p }); })); });
    Object.values(ix).forEach(a => a.sort((x, y) => y.t.data.localeCompare(x.t.data)));
    return ix;
  }

  // ---- suggerimenti mentre scrivi nella lista ----
  const AC = { el: null, rowId: null, items: [], i: 0, f: '' };
  function acClose() { if (AC.el) AC.el.remove(); AC.el = null; AC.items = []; AC.rowId = null; }
  function acOpen(input) {
    const f = input.dataset.f; if (f !== 'cognome' && f !== 'nome') return acClose();
    const t = trip(); const r = t && rowById(t, input.dataset.r); if (!r) return acClose();
    const cgq = nk(baseCognome(f === 'cognome' ? input.value : r.cognome)), nmq = nk(f === 'nome' ? input.value : '');
    if (cgq.length < 2 && !(f === 'nome' && cgq)) return acClose();
    const ix = AC.ix || (AC.ix = { at: 0 }); if (Date.now() - ix.at > 15000) { AC.cnt = {}; Object.entries(clientIndex()).forEach(([id, a]) => { AC.cnt[id] = a.length; }); ix.at = Date.now(); }
    const items = Object.entries(clients()).filter(([, x]) => nk(x.cognome).startsWith(cgq) && (!nmq || nk(x.nome).startsWith(nmq)))
      .sort((a, b) => (AC.cnt[b[0]] || 0) - (AC.cnt[a[0]] || 0) || nk(a[1].cognome + ' ' + a[1].nome).localeCompare(nk(b[1].cognome + ' ' + b[1].nome))).slice(0, 6);
    if (!items.length || (items.length === 1 && r.cid === items[0][0] && nk(r.nome) === nk(items[0][1].nome))) return acClose();
    AC.items = items; AC.i = 0; AC.rowId = r.id; AC.f = f;
    if (!AC.el) { AC.el = document.createElement('div'); AC.el.className = 'acbox'; AC.el.setAttribute('role', 'listbox'); AC.el.setAttribute('aria-label', 'Clienti già in anagrafica'); document.body.appendChild(AC.el); }
    const rc = input.getBoundingClientRect();
    AC.el.style.left = `${Math.max(8, Math.min(rc.left + window.scrollX, window.scrollX + window.innerWidth - 480))}px`; AC.el.style.top = `${rc.bottom + window.scrollY + 4}px`;
    acPaint();
  }
  function acPaint() {
    if (!AC.el) return;
    AC.el.innerHTML = `<div class="ac-h">Già in anagrafica</div>${AC.items.map(([id, x], i) => `<div class="ac-i${i === AC.i ? ' on' : ''}" role="option" aria-selected="${i === AC.i}" data-act="acpick" data-id="${id}"><span class="av">${esc(((x.nome || '')[0] || '') + ((x.cognome || '')[0] || ''))}</span><span class="ac-t"><b>${esc(x.cognome)} ${esc(x.nome)}</b><span>${esc([x.nascita ? `${/a$/i.test(x.nome || '') ? 'nata' : 'nato'} il ${x.nascita}` : '', x.tel, x.part ? 'parte da ' + x.part : ''].filter(Boolean).join(' · '))}</span></span><span class="ac-n">${AC.cnt[id] ? `${AC.cnt[id]} ${AC.cnt[id] === 1 ? 'viaggio' : 'viaggi'}` : 'nuovo'}</span></div>`).join('')}<div class="ac-f">Invio compila la riga · Esc per scrivere un cliente nuovo</div>`;
  }
  function acPick(id) {
    const t = trip(); const r = t && rowById(t, AC.rowId); const x = clients()[id]; if (!r || !x) return acClose();
    const m = RX.exec(String(r.cognome || '').trim()); const suf = m ? ` x ${m[2]}` : '';
    r.cognome = x.cognome + suf; r.nome = x.nome; if (x.nascita) r.nascita = x.nascita; if (x.tel) r.tel = x.tel; if (x.natoA) r.natoA = x.natoA; if (x.part && !r.part) r.part = x.part;
    if (x.pref && !r.fila && /fila|davanti|dietro|porta|finestr/i.test(x.pref)) r.note = r.note || x.pref;
    r.cid = id; const rid = r.id; acClose(); commit();
    const i = t.rows.findIndex(z => z.id === rid); const nx = t.rows[i + 1];
    const inp = nx && $(`[data-r="${nx.id}"][data-f="cognome"]`); if (inp) inp.focus(); else { const me = $(`[data-r="${rid}"][data-f="part"]`); if (me) me.focus(); }
    toast(`${x.cognome} ${x.nome}: dati compilati dall'anagrafica`);
  }
  function acKey(e) {
    if (!AC.el || !AC.items.length) return false;
    if (e.key === 'ArrowDown') { AC.i = (AC.i + 1) % AC.items.length; acPaint(); return true; }
    if (e.key === 'ArrowUp') { AC.i = (AC.i - 1 + AC.items.length) % AC.items.length; acPaint(); return true; }
    if (e.key === 'Enter' || e.key === 'Tab') { if (e.key === 'Tab' && e.shiftKey) return false; acPick(AC.items[AC.i][0]); return true; }
    if (e.key === 'Escape') { acClose(); return true; }
    return false;
  }

  // ---- pagina Anagrafica ----
  function anagView() {
    const q = nk(UI.aq || ''); const ix = clientIndex();
    let list = Object.entries(clients()).filter(([, x]) => !q || nk(`${x.cognome} ${x.nome} ${x.tel} ${x.natoA} ${x.part} ${x.email}`).includes(q) || telK(x.tel).includes(q.replace(/\D/g, '') || '§'));
    list.sort((a, b) => nk(a[1].cognome + ' ' + a[1].nome).localeCompare(nk(b[1].cognome + ' ' + b[1].nome)));
    const tot = Object.keys(clients()).length;
    if (!UI.cl || !clients()[UI.cl]) UI.cl = list[0] ? list[0][0] : null;
    const groups = []; list.slice(0, 400).forEach(([id, x]) => { const l = (nk(x.cognome)[0] || '#').toUpperCase(); let g = groups[groups.length - 1]; if (!g || g.l !== l) { g = { l, items: [] }; groups.push(g); } g.items.push([id, x]); });
    const sel = UI.cl && clients()[UI.cl]; const hist = (sel && ix[UI.cl]) || [];
    const ro = ACC.can('readonly');
    const paidOf = h => { const m = bkMoney(h.t, h.bk); return m; };
    const detail = sel ? `<div class="cl-head"><span class="av big">${esc(((sel.nome || '')[0] || '') + ((sel.cognome || '')[0] || ''))}</span>
        <div class="cl-ht"><h2>${esc(sel.cognome)} ${esc(sel.nome)}</h2><div class="sub">${sel.since ? `In anagrafica dal ${esc(fmtDate(sel.since))} · ` : ''}${hist.length} ${hist.length === 1 ? 'viaggio' : 'viaggi'}${sel.part ? ` · parte di solito da ${esc(sel.part)}` : ''}</div>
          <div class="chips">${sel.waOk ? '<span class="pill ok">Consenso WhatsApp</span>' : '<span class="pill neutral">Senza consenso WhatsApp</span>'}</div></div>
        ${ro ? '' : `<label class="chk"><input type="checkbox" data-clchk="waOk"${sel.waOk ? ' checked' : ''}> Consenso WhatsApp</label>`}</div>
      <div class="cl-grid"><div class="box cl-f">${CLF.map(([f, l]) => `<label class="cl-r"><span>${esc(l)}</span><input data-cl="${f}" value="${esc(sel[f] || '')}"${ro ? ' readonly' : ''} autocomplete="off"></label>`).join('')}
          ${ro ? '' : `<div class="cl-act"><button class="btn sm danger" data-act="cldel" data-id="${UI.cl}">${ICON.trash} Elimina dall'anagrafica</button></div>`}</div>
        <div class="box cl-h"><h3>Viaggi fatti e prenotati</h3>${hist.map(h => { const m = paidOf(h); const fut = (h.t.fine || h.t.data) >= todayISO(); return `<button class="cl-trip" data-act="opentrip" data-id="${h.t.id}"><span><b>${esc(h.t.nome)}</b><span>${esc(fmtTripDate(h.t))}${h.bk.persone.length > 1 ? ` · ${esc(bkName(h.bk))} x ${h.bk.persone.length}` : ''}</span></span><span class="pill ${m.saldato ? 'ok' : fut ? 'neutral' : 'tbd'}">${m.saldato ? 'Saldato' : fut ? 'Prenotato' : 'Da saldare'}</span></button>`; }).join('') || '<div class="small">Ancora nessun viaggio collegato.</div>'}</div></div>` : '<div class="empty">Nessun cliente. Si aggiungono da soli quando scrivi le liste dei viaggi.</div>';
    return `<div class="pagehead"><div><h1>Anagrafica</h1><div class="sub">${tot} clienti · si aggiorna da sola con le liste dei viaggi</div></div>${ro ? '' : `<div class="hbtns"><label class="btn" for="imp-cl">${ICON.upload} Importa da Word o Excel<input id="imp-cl" type="file" accept=".xlsx,.xlsm,.csv,.txt,.docx,.xls,.doc" hidden data-impfile="1"></label><button class="btn primary" data-act="clnew">${ICON.plus} Nuovo cliente</button></div>`}</div>
      <div class="anag"><section class="box cl-list" aria-label="Elenco clienti"><input class="search" type="search" data-aq="1" placeholder="Cerca per nome, telefono, città" value="${esc(UI.aq || '')}" aria-label="Cerca cliente">
        <div class="cl-scroll">${groups.map(g => `<div class="cl-g">${esc(g.l)}</div>${g.items.map(([id, x]) => `<button class="cl-i${id === UI.cl ? ' on' : ''}" data-act="clsel" data-id="${id}"><span class="av">${esc(((x.nome || '')[0] || '') + ((x.cognome || '')[0] || ''))}</span><span><b>${esc(x.cognome)} ${esc(x.nome)}</b><span>${esc([x.part, ix[id] ? `${ix[id].length} viaggi` : ''].filter(Boolean).join(' · '))}</span></span></button>`).join('')}`).join('') || '<div class="small" style="padding:12px">Nessun cliente trovato.</div>'}${list.length > 400 ? `<div class="small" style="padding:12px">Ne mostro 400 su ${list.length}: affina la ricerca.</div>` : ''}</div></section>
        <section class="cl-det" aria-label="Scheda cliente">${detail}</section></div>`;
  }

  // ---------- anagrafica: importazione da Word o Excel ----------
  // Legge .xlsx (Excel), .csv e .docx (Word, tabelle). Riconosce da solo le colonne dall'intestazione
  // (cognome, nome, data di nascita, cellulare, email…) o dal contenuto; prima di importare si vede l'anteprima
  // e si può correggere a mano ogni colonna. I clienti già presenti si completano: nessun dato esistente viene sovrascritto.
  const IMPF = [['', '— non importare —'], ['cognome', 'Cognome'], ['nome', 'Nome'], ['cn', 'Cognome e nome insieme'], ['nascita', 'Data di nascita'], ['natoA', 'Nato/a a'], ['tel', 'Cellulare'], ['tel2', 'Altro telefono'], ['email', 'Email'], ['indirizzo', 'Indirizzo'], ['cap', 'CAP'], ['citta', 'Città'], ['cf', 'Codice fiscale / P. IVA'], ['part', 'Partenza abituale'], ['note', 'Note']];
  const IMPF_L = Object.fromEntries(IMPF);
  const HDR = [
    ['cn', /^(cognome\s*(e|\/|&)\s*nome|nome\s*(e|\/)\s*cognome|nominativo|cliente|partecipante|intestatario)$/],
    ['cognome', /^cognome|^surname$/], ['nome', /^nome$|^nome\s*(di\s*battesimo)?$|^first\s*name$/],
    ['nascita', /nascita|nato\s*il|^data\s*n|^data$|^d\.?\s*n\.?$|birth/], ['natoA', /nato\/?a?\s*a|luogo\s*(di\s*)?nascita|^nato a/],
    ['tel', /^(cell|cellulare|telefono|tel\.?|contatto|recapito|mobile|whatsapp)/], ['tel2', /(altro|secondo)\s*tel|tel\.?\s*2|fisso/],
    ['email', /mail|posta/], ['indirizzo', /indirizzo|via|residenza/], ['cap', /^c\.?a\.?p\.?$/], ['citta', /citt[aà]|comune|paese|localit/],
    ['cf', /codice\s*fiscale|^c\.?\s*f\.?$|partita\s*iva|p\.?\s*iva/], ['part', /^part(enza)?$|^p$|salita/], ['note', /^note|osserv/]
  ];
  // ---- lettura dei file ----
  async function xlsxTables(file) {
    const zip = await window.JSZip.loadAsync(file);
    const rd = async p => { const f = zip.file(p); return f ? new DOMParser().parseFromString(await f.async('string'), 'application/xml') : null; };
    const wb = await rd('xl/workbook.xml'); if (!wb) throw new Error('Il file non sembra un Excel .xlsx.');
    const rels = await rd('xl/_rels/workbook.xml.rels'); const relMap = {};
    if (rels) Array.from(rels.getElementsByTagName('Relationship')).forEach(r => { relMap[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const ssx = await rd('xl/sharedStrings.xml');
    const ss = ssx ? Array.from(ssx.getElementsByTagName('si')).map(si => Array.from(si.getElementsByTagName('t')).map(t => t.textContent).join('')) : [];
    const colN = ref => { const m = /^([A-Z]+)/.exec(ref || ''); let n = 0; if (m) for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
    const out = [];
    for (const sh of Array.from(wb.getElementsByTagName('sheet'))) {
      const rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let target = relMap[rid] || ''; target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
      const x = await rd('xl/' + target); if (!x) continue;
      const rows = [];
      Array.from(x.getElementsByTagName('row')).forEach(r => {
        const arr = [];
        Array.from(r.getElementsByTagName('c')).forEach(c => {
          const t = c.getAttribute('t'); const v = c.getElementsByTagName('v')[0]; let val = '';
          if (t === 's') val = ss[+((v && v.textContent) || 0)] || '';
          else if (t === 'inlineStr') val = Array.from(c.getElementsByTagName('t')).map(z => z.textContent).join('');
          else if (t === 'b') val = v && v.textContent === '1' ? 'VERO' : 'FALSO';
          else val = v ? v.textContent : '';
          arr[colN(c.getAttribute('r'))] = String(val).trim();
        });
        rows.push(Array.from(arr, z => z || ''));
      });
      out.push({ name: sh.getAttribute('name') || 'Foglio', rows });
    }
    return out;
  }
  function csvTable(text) {
    const first = text.split(/\r?\n/).find(l => l.trim()) || '';
    const sep = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0];
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; continue; }
      if (ch === '"') q = true; else if (ch === sep) { row.push(cur.trim()); cur = ''; } else if (ch === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch;
    }
    if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
    return [{ name: 'File', rows }];
  }
  async function readClientFile(file) {
    const n = file.name.toLowerCase();
    if (/\.(xls|doc)$/.test(n)) throw new Error(`I file ${n.endsWith('.xls') ? '.xls' : '.doc'} vecchi non si possono leggere: aprilo con ${n.endsWith('.xls') ? 'Excel' : 'Word'} e scegli File › Salva con nome › ${n.endsWith('.xls') ? 'Cartella di lavoro di Excel (.xlsx)' : 'Documento di Word (.docx)'}, poi riprova.`);
    if (/\.(xlsx|xlsm)$/.test(n)) return xlsxTables(file);
    if (/\.(csv|txt)$/.test(n)) return csvTable(await file.text());
    if (/\.docx$/.test(n)) {
      const tabs = (await docxTables(file)).map((rows, i) => ({ name: `Tabella ${i + 1}`, rows: rows.map(r => r.map(c => String(c || '').replace(/\s+/g, ' ').trim())) })).filter(t => t.rows.length);
      if (tabs.length) return tabs;
      throw new Error('Nel documento Word non ho trovato tabelle: i clienti devono essere in una tabella (una riga per cliente).');
    }
    throw new Error('Formato non riconosciuto: usa un file Excel (.xlsx), Word (.docx) o .csv.');
  }
  // ---- riconoscimento delle colonne ----
  const RXD = /^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}$/, RXT = /^\+?[\d\s\/.\-]{8,16}$/, RXM = /@/, RXCF = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$|^\d{11}$/i;
  function guessTable(tab) {
    const rows = tab.rows.filter(r => r.some(c => String(c).trim()));
    let best = { score: 0, i: -1, map: [] };
    rows.slice(0, 12).forEach((r, i) => {
      const used = new Set(); const map = r.map(c => { const h = nk(c); if (!h || h.length > 40) return ''; const f = (HDR.find(([k, rx]) => !used.has(k) && rx.test(h)) || [])[0] || ''; if (f) used.add(f); return f; });
      const score = map.filter(Boolean).length + (map.includes('cognome') || map.includes('cn') ? 2 : 0);
      if (score > best.score) best = { score, i, map };
    });
    const width = Math.max(0, ...rows.map(r => r.length));
    let head = best.score >= 2 ? best.i : -1, map = head >= 0 ? best.map : [];
    const body = rows.slice(head + 1);
    map = Array.from({ length: width }, (_, c) => map[c] || '');
    // colonne senza intestazione riconosciuta: si guarda il contenuto
    const used = new Set(map.filter(Boolean));
    for (let c = 0; c < width; c++) {
      if (map[c]) continue;
      const vals = body.map(r => String(r[c] || '').trim()).filter(Boolean).slice(0, 40); if (!vals.length) continue;
      const share = rx => vals.filter(v => rx.test(v)).length / vals.length;
      const isNum = vals.every(v => /^\d+(\.\d+)?$/.test(v));
      let f = '';
      if (share(RXM) > .6) f = 'email'; else if (share(RXCF) > .6) f = 'cf'; else if (share(RXD) > .6 || (isNum && vals.every(v => +v > 3000 && +v < 50000))) f = 'nascita';
      else if (share(RXT) > .6 && vals.some(v => v.replace(/\D/g, '').length >= 9)) f = used.has('tel') ? 'tel2' : 'tel';
      else if (!isNum && share(/^[A-Za-zÀ-ÿ'`’ .\-]+(\s*x\s*\d+)?$/) > .8) f = !used.has('cognome') && !used.has('cn') ? 'cognome' : !used.has('nome') ? 'nome' : '';
      if (f && !used.has(f)) { map[c] = f; used.add(f); }
    }
    // numero di riga (1, 2, 3…) nella prima colonna: non si importa
    if (map[0] === '' || map[0] === 'nascita') { const v = body.map(r => String(r[0] || '').trim()).filter(Boolean); if (v.length && v.every((x, i) => /^\d{1,4}$/.test(x))) map[0] = ''; }
    // «Cognome» con il nome dentro (Rossi Maria) e nessuna colonna «nome»: diventa «cognome e nome»
    if (map.includes('cognome') && !map.includes('nome')) { const c = map.indexOf('cognome'); const v = body.map(r => String(r[c] || '').trim()).filter(Boolean); if (v.length && v.filter(x => /\S\s+\S/.test(baseCognome(x))).length / v.length > .7) map[c] = 'cn'; }
    return { head, map, rows };
  }
  // ---- normalizzazione dei valori ----
  function impDate(v) {
    v = String(v || '').trim(); if (!v) return '';
    if (/^\d+(\.\d+)?$/.test(v) && +v > 1000 && +v < 60000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(+v) * 864e5); return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCFullYear()).slice(2)}`; }
    let m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/.exec(v); if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3].slice(-2)}`;
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v); if (m) return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
    return v;
  }
  const impTel = v => { v = String(v || '').trim(); if (/^\d+\.\d+E\+\d+$/i.test(v)) v = String(Math.round(+v)); return v.replace(/[^\d+]/g, ''); };
  const cap1 = s => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s'’\-])(\p{L})/gu, (a, b, c) => b + c.toUpperCase());
  // «Cognome Nome» scritti insieme: il cognome è la prima parola, oppure le prime due se inizia con
  // De, Di, Lo, La, Li, Del, Della, Dal, D', San, Santa… (es. «Lo Presti Carlo», «Russo Maria Grazia»)
  const PART = /^(de|di|da|del|dei|degli|della|dello|delle|dal|dalla|dell|lo|la|li|le|san|santa|santo|mc|mac|van|von|d['’]?)$/i;
  function splitCN(v) {
    const w = baseCognome(v).replace(/[,;]/g, ' ').split(/\s+/).filter(Boolean); if (w.length < 2) return [w[0] || '', ''];
    let k = 1; while (k < w.length - 1 && PART.test(w[k - 1])) k++;
    if (/^d['’]\S/i.test(w[0])) k = 1;
    return [w.slice(0, k).join(' '), w.slice(k).join(' ')];
  }
  function impRecord(r, map) {
    const o = {}; map.forEach((f, c) => { if (!f) return; const v = String(r[c] == null ? '' : r[c]).trim(); if (!v) return; o[f] = o[f] ? o[f] + ' ' + v : v; });
    if (o.cn) { const sp = splitCN(o.cn); if (!o.cognome && !o.nome) { o.cognome = sp[0]; o.nome = sp[1]; } else if (!o.cognome) o.cognome = baseCognome(o.cn); delete o.cn; }
    if (o.cognome) o.cognome = cap1(baseCognome(o.cognome)); if (o.nome) o.nome = cap1(o.nome.replace(/[-–]\s*$/, ''));
    if (o.nascita) o.nascita = impDate(o.nascita); if (o.tel) o.tel = impTel(o.tel); if (o.tel2) o.tel2 = impTel(o.tel2);
    if (o.part) o.part = o.part.toUpperCase(); if (o.cf) o.cf = o.cf.toUpperCase().replace(/\s/g, ''); if (o.natoA) o.natoA = cap1(o.natoA); if (o.citta) o.citta = cap1(o.citta);
    if (o.email) { const m = /[\w.+-]+@[\w-]+\.[\w.]+/.exec(o.email); o.email = m ? m[0].toLowerCase() : o.email; }
    return o;
  }
  function impPlan() {
    const I = UI.imp; const tab = I.tabs[I.ti]; const body = tab.rows.slice(I.head + 1);
    const recs = body.map(r => impRecord(r, I.map)).filter(o => o.cognome && o.nome && !/^(cognome|nome|totale|accompagnat|autist)/i.test(o.cognome));
    let nuovi = 0, agg = 0, uguali = 0; const seen = new Set(); let dup = 0;
    recs.forEach(o => { const k = nk(o.cognome + ' ' + o.nome + ' ' + (o.nascita || o.tel || '')); if (seen.has(k)) { o._dup = true; dup++; return; } seen.add(k); const id = findClient(o.cognome, o.nome, o.nascita, o.tel); o._id = id; if (!id) nuovi++; else { const x = clients()[id]; Object.keys(o).some(f => !f.startsWith('_') && o[f] && !x[f]) ? agg++ : uguali++; } });
    return { recs, nuovi, agg, uguali, dup, scarti: body.filter(r => r.some(c => String(c).trim())).length - recs.length - dup };
  }
  // ---- finestra di importazione ----
  async function impOpenFile(file) {
    try {
      const tabs = await readClientFile(file);
      const guesses = tabs.map(guessTable); let ti = 0, bs = -1;
      guesses.forEach((g, i) => { const s = g.map.filter(Boolean).length * 10 + Math.min(g.rows.length, 500) / 100 + (g.map.includes('cognome') || g.map.includes('cn') ? 50 : 0); if (s > bs) { bs = s; ti = i; } });
      UI.imp = { file: file.name, tabs: guesses.map((g, i) => ({ name: tabs[i].name, rows: g.rows })), guesses, ti, head: guesses[ti].head, map: guesses[ti].map.slice() };
      DIAG.ev('import', `Anagrafica: letto il file ${file.name}`, { tabelle: tabs.length, righe: guesses[ti].rows.length, colonne: guesses[ti].map });
      impModal();
    } catch (e) { toast(e.message || 'Non riesco a leggere il file'); DIAG.ev('import', 'Anagrafica: file non letto ' + file.name + ' · ' + (e.message || e), { stack: e.stack }); }
  }
  function impModal() {
    const I = UI.imp; const tab = I.tabs[I.ti]; const P = impPlan(); const width = I.map.length;
    const prev = tab.rows.slice(I.head + 1, I.head + 9);
    UI.modal = { kind: 'imp' };
    openModal(`Importa clienti · ${esc(I.file)}`, `
      ${I.tabs.length > 1 ? `<div class="field"><label for="imp-tab">Foglio o tabella</label><select id="imp-tab" data-impt="1">${I.tabs.map((t, i) => `<option value="${i}"${i === I.ti ? ' selected' : ''}>${esc(t.name)} · ${t.rows.length} righe</option>`).join('')}</select></div>` : ''}
      <div class="infobox">Controlla la riga grigia: sopra ogni colonna c'è cosa contiene. Se è sbagliato, cambialo dal menu. Le colonne «— non importare —» si saltano.</div>
      <label class="chk"><input type="checkbox" data-imph="1"${I.head >= 0 ? ' checked' : ''}> La prima riga è l'intestazione (non è un cliente)${I.head >= 0 ? `: «${esc(tab.rows[I.head].filter(Boolean).slice(0, 5).join(' · '))}»` : ''}</label>
      <div class="imp-w"><table class="imp-t"><thead><tr><th class="res">Risultato</th>${Array.from({ length: width }, (_, c) => `<th><select data-impc="${c}" aria-label="Colonna ${c + 1}">${IMPF.map(([k, l]) => `<option value="${k}"${I.map[c] === k ? ' selected' : ''}>${l}</option>`).join('')}</select></th>`).join('')}</tr></thead>
        <tbody>${prev.map(r => { const o = impRecord(r, I.map); return `<tr><td class="res">${o.cognome && o.nome ? `<b>${esc(o.cognome)}</b> ${esc(o.nome)}${o.nascita ? '<br><small>' + esc(o.nascita) + '</small>' : ''}` : '<small>saltata</small>'}</td>${Array.from({ length: width }, (_, c) => `<td class="${I.map[c] ? '' : 'off'}">${esc(String(r[c] || '').slice(0, 40))}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>
      <div class="imp-sum"><div><b>${P.recs.length - P.dup}</b><span>clienti nel file</span></div><div><b>${P.nuovi}</b><span>nuovi</span></div><div><b>${P.agg}</b><span>già presenti, si completano</span></div><div><b>${P.uguali}</b><span>già presenti, uguali</span></div></div>
      ${P.scarti > 0 || P.dup ? `<div class="small">${P.scarti > 0 ? `${P.scarti} righe senza cognome o nome saltate. ` : ''}${P.dup ? `${P.dup} righe ripetute nel file contate una volta sola.` : ''}</div>` : ''}
      ${!I.map.includes('cognome') && !I.map.includes('cn') ? '<div class="warnbox">Scegli quale colonna contiene il cognome (o «Cognome e nome insieme»).</div>' : ''}
      <div class="small">Per i clienti già presenti si riempiono solo i dati mancanti: niente di quello che c'è già viene cambiato.</div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="impgo"${P.nuovi + P.agg ? '' : ' disabled'}>Importa ${P.nuovi + P.agg} clienti</button>`, true);
  }
  function impInput(el) {
    const I = UI.imp; if (!I) return false; const d = el.dataset;
    if (d.impc !== undefined) { const f = el.value; if (f) I.map = I.map.map((x, i) => (x === f && i !== +d.impc && f !== 'note' ? '' : x)); I.map[+d.impc] = f; impModal(); return true; }
    if (d.imph) { I.head = el.checked ? Math.max(0, I.guesses[I.ti].head) : -1; impModal(); return true; }
    if (d.impt) { I.ti = +el.value; I.head = I.guesses[I.ti].head; I.map = I.guesses[I.ti].map.slice(); impModal(); return true; }
    return false;
  }
  function impGo() {
    if (ACC.can('readonly')) return;
    const P = impPlan(); let nuovi = 0, agg = 0;
    P.recs.forEach(o => {
      if (o._dup) return; let id = findClient(o.cognome, o.nome, o.nascita, o.tel);
      if (!id) { id = 'c' + uid(); clients()[id] = { cognome: o.cognome, nome: o.nome, nascita: '', natoA: '', tel: '', email: '', indirizzo: '', part: '', pref: '', note: '', since: todayISO(), src: 'import' }; nuovi++; }
      else { const x = clients()[id]; if (Object.keys(o).some(f => !f.startsWith('_') && o[f] && !x[f])) agg++; }
      const x = clients()[id];
      if (o.tel && x.tel && telK(o.tel) !== telK(x.tel) && !x.tel2 && !o.tel2) o.tel2 = o.tel;
      Object.keys(o).forEach(f => { if (f.startsWith('_') || !o[f]) return; if (!x[f]) x[f] = o[f]; else if (f === 'note' && !String(x.note).includes(o.note)) x.note = (x.note + ' · ' + o.note).slice(0, 500); });
    });
    ACC.tlog('info', `Anagrafica: importati da «${UI.imp.file}» ${nuovi} clienti nuovi, ${agg} completati`);
    UI.imp = null; closeModal(); save(); render(); toast(`Importazione fatta: ${nuovi} clienti nuovi, ${agg} completati`);
  }

  // ---------- incassi, cassa del giorno, chiusura e contabilità ----------
  // Ogni incasso è un «movimento» con operatore, agenzia, cassa, metodo (anche misto) e cliente.
  // Ogni computer scrive i suoi movimenti in un suo file del giorno: due agenzie che incassano insieme non si disturbano.
  // Gli incassi non si cancellano: si corregge con uno «storno» (movimento uguale e contrario), così il resoconto resta vero.
  // metodi con cui si incassa (come le colonne Cash, Pos, € altro + Modalità del foglio CASSA)
  const METODI = [['contanti', 'Contanti'], ['pos', 'POS'], ['bonifico', 'Bonifico'], ['postepay', 'PostePay'], ['paypal', 'PayPal'], ['assegno', 'Assegno'], ['buono', 'Buono regalo'], ['voucher', 'Voucher']];
  const MET_L = Object.fromEntries(METODI);
  // nei resoconti i metodi meno usati vanno insieme in «Altri»
  const METG = [['contanti', 'Contanti'], ['pos', 'POS'], ['bonifico', 'Bonifico'], ['postepay', 'PostePay'], ['altro', 'Altri']];
  const mg = m => (['contanti', 'pos', 'bonifico', 'postepay'].includes(m) ? m : 'altro');
  const MET_C = { contanti: 'm-cont', pos: 'm-pos', bonifico: 'm-bon', postepay: 'm-pp', altro: 'm-alt', paypal: 'm-alt', assegno: 'm-alt', buono: 'm-alt', voucher: 'm-alt' };
  const isInc = m => m.tipo !== 'prelievo' && m.tipo !== 'apporto';
  const dayISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // ora locale (gli orari si salvano in UTC)
  const hm = iso => { const d = new Date(iso); return isNaN(d) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const money = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const movPath = day => `/cassa/movimenti/${day.slice(0, 7)}/${day}_${STORE.device.id}.json`;
  const okMov = m => m && m.id && typeof m.day === 'string' && typeof m.at === 'string' && Array.isArray(m.parts);
  const allMovs = () => STORE.list('/cassa/movimenti/').flatMap(([, d]) => (d && d.movs) || []).filter(okMov);
  // quanto ha pagato una prenotazione con gli incassi registrati nell'app (la colonna «pagato» della lista resta per quelli di prima)
  let PMI = null, PMV = -1;
  function paidMovs(tripId, bkId) {
    if (PMV !== STORE.ver() || !PMI) { PMI = new Map(); allMovs().filter(isInc).forEach(m => { const k = m.tripId + '|' + m.bkId; PMI.set(k, (PMI.get(k) || 0) + (+m.tot || 0)); }); PMV = STORE.ver(); }
    return PMI.get(tripId + '|' + bkId) || 0;
  }
  const chiusura = (day, ag) => STORE.get(`/cassa/chiusure/${day}_${ag}.json`);
  const agName = id => { const a = S.cfg.agenzie.find(x => x.id === id); return a ? a.nome : id || '—'; };
  const cassaName = id => { const a = S.cfg.agenzie.find(x => x.id === id); return a ? a.cassa || a.nome : '—'; };
  const sumBy = (movs, f) => { const o = {}; movs.forEach(m => (m.parts || []).forEach(p => { const k = f(m, p); o[k] = (o[k] || 0) + (+p.a || 0); })); return o; };
  const totOf = movs => movs.filter(isInc).reduce((a, m) => a + (+m.tot || 0), 0);
  function addMov(m) {
    const d = new Date(); const day = dayISO(d);
    const mv = Object.assign({ id: 'm' + uid(), at: d.toISOString(), day, uid: ACC.sess.uid, who: ACC.me().name, ag: ACC.sess.ag || '', cassa: cassaName(ACC.sess.ag), dev: STORE.device.id }, m);
    mv.tot = Math.round(mv.parts.reduce((a, p) => a + (+p.a || 0), 0) * 100) / 100;
    const p = movPath(day); const cur = STORE.get(p) || { dev: STORE.device.id, movs: [] };
    cur.movs = (cur.movs || []).concat([mv]); STORE.put(p, cur);
    return mv;
  }
  const fmtNum = v => { const r = Math.round(v * 100) / 100; return Number.isInteger(r) ? String(r) : String(r).replace('.', ','); };

  function storno(id) {
    const m = allMovs().find(x => x.id === id); if (!m) return;
    if (allMovs().some(x => x.storno === id)) return toast('Questo incasso è già stato stornato');
    confirmBox('Storna incasso', `Annullo l'incasso di <b>${money(m.tot)}</b> di ${esc(m.cliente)}? Nel resoconto resta segnato, con un movimento uguale e contrario${m.doc === 'scontrino' ? ' (nota di credito dello scontrino)' : m.doc === 'fattura' ? ' (nota di credito della fattura)' : ''}.`, 'Storna', () => {
      const t = S.trips.find(x => x.id === m.tripId);
      addMov({ tripId: m.tripId, tripN: m.tripN, tripD: m.tripD, bkId: m.bkId, cliente: m.cliente, tipo: 'storno', storno: id, ag: m.ag, cassa: m.cassa, doc: m.doc === 'fattura' ? 'ncfattura' : m.doc === 'scontrino' ? 'ncscontrino' : m.doc, docStato: m.doc === 'fattura' || m.doc === 'scontrino' ? 'da_emettere' : '', cat: m.cat, desc: m.desc, circuito: m.circuito, lines: (m.lines || []).map(l => Object.assign({}, l, { q: -l.q })), suppl: -(m.suppl || 0), dir: m.dir, docTot: -(m.docTot || 0), agenzia: -(m.agenzia || 0), biglietti: -(m.biglietti || 0), parts: m.parts.map(p => ({ m: p.m, a: -p.a })), note: `storno dell'incasso del ${fmtDate(m.day)}${ACC.sess.ag && ACC.sess.ag !== m.ag ? ' (fatto da ' + agName(ACC.sess.ag) + ')' : ''}` });
      ACC.tlog('avviso', `Storno ${money(m.tot)} · ${m.cliente} · ${m.tripN}`);
      commit(); if (UI.pay) payRefresh(); toast('Incasso stornato');
    });
  }

  // ---- pagina «Cassa»: il resoconto del giorno ----
  function cassaView() {
    const day = UI.cday || todayISO(); const all = ACC.can('cassaAll');
    const agf = all ? (UI.cag || 'tutte') : ACC.sess.ag;
    const movs = allMovs().filter(m => m.day === day && (agf === 'tutte' || m.ag === agf)).sort((a, b) => a.at.localeCompare(b.at));
    const inc = movs.filter(isInc); const per = sumBy(inc, (m, p) => mg(p.m)); const perAg = sumBy(inc, m => m.ag); const tot = totOf(movs);
    const cnt = k => inc.filter(m => m.parts.some(p => mg(p.m) === k)).length;
    const d = parseD(day); const prev = new Date(d); prev.setDate(d.getDate() - 1); const next = new Date(d); next.setDate(d.getDate() + 1);
    const agBtns = all ? `<div class="seg" role="group" aria-label="Agenzia">${[['tutte', 'Tutte'], ...S.cfg.agenzie.map(a => [a.id, a.nome])].map(([k, l]) => `<button data-act="cag" data-v="${k}" aria-pressed="${agf === k}">${esc(l)}</button>`).join('')}</div>` : `<span class="pill neutral">${esc(agName(agf))} · ${esc(cassaName(agf))}</span>`;
    const closeAg = agf !== 'tutte' ? agf : (ACC.sess.ag || '');
    const ch = closeAg && chiusura(day, closeAg);
    const canClose = !ACC.can('readonly') && closeAg && (ACC.sess.ag === closeAg || ACC.can('cassaAll'));
    const stornati = new Set(movs.filter(m => m.storno).map(m => m.storno));
    return `<div class="pagehead"><div><h1>${day === todayISO() ? 'Resoconto di oggi' : 'Resoconto del ' + esc(fmtDate(day))}</h1><div class="sub">${esc(fmtDate(day, true))} · ${movs.length} ${movs.length === 1 ? 'movimento' : 'movimenti'}${ch ? ` · <b>cassa ${esc(agName(closeAg))} chiusa</b> da ${esc(ch.who)} alle ${esc(hm(ch.at))}` : ''}</div></div>
        <div class="hbtns">${agBtns}<button class="btn" data-act="cday" data-v="${dayISO(prev)}">‹ Giorno prima</button>${day < todayISO() ? `<button class="btn" data-act="cday" data-v="${dayISO(next)}">Giorno dopo ›</button>` : ''}<input type="date" class="btn" data-cdate="1" value="${esc(day)}" aria-label="Scegli il giorno"><button class="btn" data-act="cprint">${ICON.print} Stampa</button>${!ACC.can('readonly') && ACC.sess.ag ? '<button class="btn" data-act="cashmov" data-k="prelievo">Prelievo</button><button class="btn" data-act="cashmov" data-k="apporto">Apporto</button>' : ''}${canClose ? `<button class="btn primary" data-act="cclose">${ch ? 'Rivedi la chiusura' : 'Chiudi la cassa'}${agf === 'tutte' ? ' di ' + esc(agName(closeAg)) : ''}</button>` : ''}</div></div>
      <div class="tiles"><div class="tile dark"><span>Totale del giorno</span><b>${money(tot)}</b></div>${METG.map(([k, l]) => `<div class="tile"><span><i class="mdot ${MET_C[k]}"></i>${l}</span><b>${money(per[k] || 0)}</b><small>${cnt(k)} ${cnt(k) === 1 ? 'incasso' : 'incassi'}</small></div>`).join('')}</div>
      <section class="box tablecard"><div class="tscroll"><table class="rt"><thead><tr><th>Ora</th><th>Cliente</th><th>Viaggio</th><th>Documento</th><th>Operatore</th><th>Agenzia</th><th>Metodo</th><th class="r">Importo</th><th></th></tr></thead><tbody>
        ${movs.map(m => `<tr class="${m.tipo === 'storno' || m.tipo === 'prelievo' ? 'neg' : ''}${stornati.has(m.id) ? ' gone' : ''}"><td>${esc(hm(m.at))}</td><td><b>${esc(m.cliente)}</b><br><small>${esc(m.tipo)}${m.note ? ' · ' + esc(m.note) : ''}</small></td><td>${esc(m.tripN || m.desc || '')}${m.cat ? `<br><small>${esc(m.cat)}</small>` : ''}</td><td>${docPill(m)}</td><td>${esc(m.who)}</td><td>${esc(agName(m.ag))}</td><td>${(m.parts || []).map(p => `<span class="mpill ${MET_C[p.m]}">${esc(MET_L[p.m] || p.m)}${m.parts.length > 1 ? ' ' + esc(fmtNum(p.a)) : ''}</span>`).join(' ')}</td><td class="r"><b>${money(m.tot)}</b></td><td class="r">${isInc(m) && m.tipo !== 'storno' && !stornati.has(m.id) && !ACC.can('readonly') && (ACC.can('cassaAll') || (m.uid === ACC.sess.uid && m.day === todayISO())) ? `<button class="btn sm ghost" data-act="storno" data-id="${m.id}">Storna</button>` : stornati.has(m.id) ? '<small>stornato</small>' : ''}</td></tr>`).join('') || `<tr><td colspan="9" class="emptyrow">Nessun incasso in questo giorno.</td></tr>`}
      </tbody></table></div>
      ${movs.length && agf === 'tutte' ? `<div class="rt-foot">${S.cfg.agenzie.map(a => `<span>${esc(a.nome)} <b>${money(perAg[a.id] || 0)}</b></span>`).join('')}<span>Totale <b>${money(tot)}</b></span></div>` : ''}</section>`;
  }
  // chiusura della cassa: resoconto completo di contanti, POS, bonifici e PostePay
  function closeModalCassa() {
    const day = UI.cday || todayISO(); const ag = (ACC.can('cassaAll') && UI.cag && UI.cag !== 'tutte') ? UI.cag : ACC.sess.ag;
    const movs = allMovs().filter(m => m.day === day && m.ag === ag && isInc(m)); const per = sumBy(movs, (m, p) => mg(p.m)); const tot = totOf(movs);
    const ch = chiusura(day, ag); const sal = cashSaldo(ag, day);
    UI.modal = { kind: 'cclose', day, ag };
    openModal(`Chiusura cassa · ${esc(agName(ag))} · ${esc(fmtDate(day))}`, `
      <div class="infobox">Resoconto completo della <b>${esc(cassaName(ag))}</b>: controlla i totali di ogni metodo con lo scontrino del POS, l'estratto dei bonifici e i contanti in cassa.</div>
      <table class="rt close"><thead><tr><th>Metodo</th><th class="r">Movimenti</th><th class="r">Totale</th><th class="r">Controllato</th></tr></thead><tbody>
        ${METG.map(([k, l]) => `<tr><td><i class="mdot ${MET_C[k]}"></i>${l}</td><td class="r">${movs.filter(m => m.parts.some(p => mg(p.m) === k)).length}</td><td class="r"><b>${money(per[k] || 0)}</b></td><td class="r"><input class="cc-in" data-cc="${k}" inputmode="decimal" placeholder="${esc(fmtNum(per[k] || 0))}" value="${ch && ch.contati && ch.contati[k] != null ? esc(fmtNum(ch.contati[k])) : ''}" aria-label="${l} controllato"></td></tr>`).join('')}
        <tr class="tot"><td>Totale</td><td class="r">${movs.length}</td><td class="r"><b>${money(tot)}</b></td><td class="r" id="cc-diff"></td></tr></tbody></table>
      <div class="infobox">Contanti in cassa secondo l'app: <b>${money(sal.fine)}</b> (inizio giornata ${money(sal.inizio)}, incassati ${money(sal.inc)}${sal.prel ? `, prelievi ${money(sal.prel)}` : ''}${sal.app ? `, apporti ${money(sal.app)}` : ''}).</div>
      <div class="small">Nella colonna «Controllato» scrivi quanto risulta a te (contanti contati, totale dello scontrino POS…). Se lasci vuoto, vale il totale dell'app.</div>
      <div class="field"><label for="cc-note">Nota sulla chiusura</label><input id="cc-note" value="${esc(ch ? ch.note || '' : '')}" placeholder="es. versati in banca 300 €"></div>
      ${ch ? `<div class="small">Già chiusa da <b>${esc(ch.who)}</b> il ${esc(fmtDate(dayISO(new Date(ch.at))))} alle ${esc(hm(ch.at))}: se salvi di nuovo, la chiusura si aggiorna.</div>` : ''}`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn" data-act="ccprint">${ICON.print} Stampa</button><button class="btn primary" data-act="ccsave">${ch ? 'Aggiorna la chiusura' : 'Chiudi la cassa'}</button>`);
    ccDiff();
  }
  function ccRead() {
    const { day, ag } = UI.modal; const movs = allMovs().filter(m => m.day === day && m.ag === ag && isInc(m)); const per = sumBy(movs, (m, p) => mg(p.m));
    const contati = {}; let diff = 0;
    METG.forEach(([k]) => { const el = $(`[data-cc="${k}"]`); const v = el && el.value.trim() ? parseEuro(el.value) : null; if (v != null) { contati[k] = v; diff += v - (per[k] || 0); } });
    return { movs, per, contati, diff: Math.round(diff * 100) / 100 };
  }
  function ccDiff() { const el = $('#cc-diff'); if (!el) return; const r = ccRead(); el.innerHTML = !Object.keys(r.contati).length ? '' : Math.abs(r.diff) < 0.009 ? '<span class="pill ok">Quadra</span>' : `<span class="pill warn">${r.diff > 0 ? 'In più' : 'Manca'} ${money(Math.abs(r.diff))}</span>`; }
  function ccSave() {
    const { day, ag } = UI.modal; const r = ccRead();
    const rec = { day, ag, cassa: cassaName(ag), at: new Date().toISOString(), uid: ACC.sess.uid, who: ACC.me().name, n: r.movs.length, tot: totOf(r.movs), per: r.per, contati: r.contati, diff: r.diff, note: ($('#cc-note').value || '').trim(), u: Date.now() };
    STORE.put(`/cassa/chiusure/${day}_${ag}.json`, rec);
    ACC.tlog(Math.abs(r.diff) < 0.009 ? 'info' : 'avviso', `Chiusura cassa ${agName(ag)} del ${fmtDate(day)}: ${money(rec.tot)}${Math.abs(r.diff) < 0.009 ? '' : ` · differenza ${money(r.diff)}`}`);
    closeModal(); render(); toast(`Cassa ${agName(ag)} chiusa: ${money(rec.tot)}`);
  }
  function printCassa(day, ag) {
    const movs = allMovs().filter(m => m.day === day && (!ag || ag === 'tutte' || m.ag === ag)).sort((a, b) => a.at.localeCompare(b.at));
    const per = sumBy(movs.filter(isInc), (m, p) => mg(p.m)); const ch = ag && ag !== 'tutte' ? chiusura(day, ag) : null;
    const html = `<div class="page flow rep"><div class="rep-h"><img src="${LOGO}" alt=""><div><h2>Resoconto di cassa${ag && ag !== 'tutte' ? ' · ' + esc(agName(ag)) : ''}</h2><span>${esc(fmtDate(day, true))}</span></div></div>
      <table class="rt"><thead><tr><th>Metodo</th><th class="r">Totale</th>${ch ? '<th class="r">Controllato</th>' : ''}</tr></thead><tbody>${METG.map(([k, l]) => `<tr><td>${l}</td><td class="r">${money(per[k] || 0)}</td>${ch ? `<td class="r">${ch.contati && ch.contati[k] != null ? money(ch.contati[k]) : '—'}</td>` : ''}</tr>`).join('')}<tr class="tot"><td>Totale</td><td class="r">${money(totOf(movs))}</td>${ch ? `<td class="r">${Math.abs(ch.diff || 0) < 0.009 ? 'quadra' : 'differenza ' + money(ch.diff)}</td>` : ''}</tr></tbody></table>
      <table class="rt"><thead><tr><th>Ora</th><th>Cliente</th><th>Viaggio</th><th>Operatore</th><th>Agenzia</th><th>Metodo</th><th class="r">Importo</th></tr></thead><tbody>${movs.map(m => `<tr><td>${esc(hm(m.at))}</td><td>${esc(m.cliente)}${m.tipo === 'storno' ? ' (storno)' : m.tipo === 'prelievo' ? ' (prelievo)' : m.tipo === 'apporto' ? ' (apporto)' : ''}</td><td>${esc(m.tripN || '')}</td><td>${esc(m.who)}</td><td>${esc(agName(m.ag))}</td><td>${m.parts.map(p => esc(MET_L[p.m] || p.m) + (m.parts.length > 1 ? ' ' + esc(fmtNum(p.a)) : '')).join(' + ')}</td><td class="r">${money(m.tot)}</td></tr>`).join('') || '<tr><td colspan="7">Nessun incasso.</td></tr>'}</tbody></table>
      ${ch ? `<p>Chiusa da ${esc(ch.who)} alle ${esc(hm(ch.at))}${ch.note ? ' · ' + esc(ch.note) : ''}</p>` : ''}<div class="pm-foot"><span>Viaggi in Pullman · La Terra</span><span>Stampato il ${esc(fmtDate(todayISO()))}</span></div></div>`;
    showPrint(`Resoconto ${fmtDate(day)}`, html);
  }
  function showPrint(title, body) {
    const root = $('#print-root');
    root.innerHTML = `<div class="pv-bar"><b>${esc(title)}</b><button class="btn primary" data-act="doprint">${ICON.print} Stampa</button><button class="btn" data-act="closeprint">Chiudi</button></div><div class="pv-pages">${body}</div>`;
    root.hidden = false; root.dataset.kind = 'rep'; root.scrollTop = 0;
  }

  // ---- pagina «Contabilità» (Master e ufficio contabilità) ----
  function contaView() {
    const mon = UI.cmon || todayISO().slice(0, 7);
    if (UI.ctab !== 'mese') return giornoView();
    const movs = allMovs().filter(m => m.day.slice(0, 7) === mon && isInc(m));
    const [yy, mm] = mon.split('-').map(Number); const prev = `${mm === 1 ? yy - 1 : yy}-${String(mm === 1 ? 12 : mm - 1).padStart(2, '0')}`; const next = `${mm === 12 ? yy + 1 : yy}-${String(mm === 12 ? 1 : mm + 1).padStart(2, '0')}`;
    const cell = (ag, k) => movs.filter(m => !ag || m.ag === ag).reduce((a, m) => a + m.parts.filter(p => !k || mg(p.m) === k).reduce((x, p) => x + p.a, 0), 0);
    const days = [...new Set(movs.map(m => m.day))].sort().reverse();
    const chRows = days.flatMap(d => S.cfg.agenzie.filter(a => movs.some(m => m.day === d && m.ag === a.id)).map(a => { const c = chiusura(d, a.id); const t = totOf(movs.filter(m => m.day === d && m.ag === a.id)); return `<tr><td>${esc(fmtDate(d).slice(0, 5))}</td><td><b>${esc(a.nome)}</b><br><small>${c ? `chiusa da ${esc(c.who)} alle ${esc(hm(c.at))}` : 'non ancora chiusa'}</small></td><td class="r"><b>${money(t)}</b></td><td class="r">${!c ? '<span class="pill tbd">Da chiudere</span>' : Math.abs(c.diff || 0) < 0.009 ? '<span class="pill ok">Quadra</span>' : `<span class="pill warn">${c.diff > 0 ? 'In più' : 'Manca'} ${money(Math.abs(c.diff))}</span>`}</td></tr>`; }));
    const tripsM = [...new Set(movs.map(m => m.tripId))].map(id => S.trips.find(t => t.id === id)).filter(Boolean);
    const upcoming = S.trips.filter(t => (t.fine || t.data) >= todayISO() && t.rows.some(r => !isEmptyRow(r)));
    const tl = [...new Set([...tripsM, ...upcoming])].sort((a, b) => a.data.localeCompare(b.data)).slice(0, 40);
    const tripLine = t => { let due = 0, paid = 0, unk = false; deriveBookings(t).forEach(bk => { const m = bkMoney(t, bk); paid += m.paid; if (m.due == null) unk = true; else due += m.due; }); const inMon = totOf(movs.filter(m => m.tripId === t.id)); const pc = due ? Math.min(100, Math.round(paid / due * 100)) : 0;
      return `<tr><td><b>${esc(t.nome)}</b><br><small>${esc(fmtTripDate(t))}</small></td><td class="r">${money(inMon)}</td><td class="r">${money(paid)}</td><td class="r">${unk ? 'prezzi da completare' : money(due)}</td><td class="bar-c"><span class="bar1"><i style="width:${pc}%"></i></span></td></tr>`; };
    return `${contaTabs()}<div class="pagehead"><div><h1>Contabilità · ${esc(MESI_L[mm - 1])} ${yy}</h1><div class="sub">Incassi, chiusure di cassa e viaggi: tutto in sola lettura, pronto da esportare.</div></div>
        <div class="hbtns"><button class="btn" data-act="cmon" data-v="${prev}">‹</button><input type="month" class="btn" data-cmon="1" value="${esc(mon)}" aria-label="Mese"><button class="btn" data-act="cmon" data-v="${next}">›</button><button class="btn" data-act="cexport">Scarica per Excel</button><button class="btn" data-act="cprintm">${ICON.print} Stampa il mese</button></div></div>
      <section class="box tablecard"><h2 class="ch">Incassi di ${esc(MESI_L[mm - 1])} ${yy} per agenzia e metodo</h2><div class="tscroll"><table class="rt"><thead><tr><th>Agenzia · cassa</th>${METG.map(([, l]) => `<th class="r">${l}</th>`).join('')}<th class="r">Totale</th></tr></thead><tbody>
        ${S.cfg.agenzie.map(a => `<tr><td>${esc(a.nome)} · ${esc(a.cassa || a.nome)}</td>${METG.map(([k]) => `<td class="r">${money(cell(a.id, k))}</td>`).join('')}<td class="r"><b>${money(cell(a.id))}</b></td></tr>`).join('')}
        <tr class="tot"><td>Totale</td>${METG.map(([k]) => `<td class="r">${money(cell(null, k))}</td>`).join('')}<td class="r"><b>${money(cell(null))}</b></td></tr></tbody></table></div></section>
      <div class="two"><section class="box tablecard"><h2 class="ch">Chiusure di cassa</h2><div class="tscroll"><table class="rt"><tbody>${chRows.join('') || '<tr><td class="emptyrow">Nessun incasso in questo mese.</td></tr>'}</tbody></table></div></section>
        <section class="box tablecard"><h2 class="ch">Situazione per viaggio</h2><div class="tscroll"><table class="rt"><thead><tr><th>Viaggio</th><th class="r">Nel mese</th><th class="r">Incassato</th><th class="r">Totale</th><th></th></tr></thead><tbody>${tl.map(tripLine).join('') || '<tr><td class="emptyrow">Nessun viaggio.</td></tr>'}</tbody></table></div></section></div>`;
  }
  function exportMonth() {
    const mon = UI.cmon || todayISO().slice(0, 7);
    exportCassa(allMovs().filter(m => m.day.slice(0, 7) === mon), `cassa-${mon}.csv`);
    ACC.tlog('info', `Esportati gli incassi di ${mon}`);
  }
  function printMonth() {
    const mon = UI.cmon || todayISO().slice(0, 7); const [yy, mm] = mon.split('-').map(Number);
    const movs = allMovs().filter(m => m.day.slice(0, 7) === mon && isInc(m));
    const cell = (ag, k) => movs.filter(m => !ag || m.ag === ag).reduce((a, m) => a + m.parts.filter(p => !k || mg(p.m) === k).reduce((x, p) => x + p.a, 0), 0);
    showPrint(`Contabilità ${MESI_L[mm - 1]} ${yy}`, `<div class="page flow rep"><div class="rep-h"><img src="${LOGO}" alt=""><div><h2>Incassi di ${esc(MESI_L[mm - 1])} ${yy}</h2><span>per agenzia e metodo di pagamento</span></div></div>
      <table class="rt"><thead><tr><th>Agenzia</th>${METG.map(([, l]) => `<th class="r">${l}</th>`).join('')}<th class="r">Totale</th></tr></thead><tbody>${S.cfg.agenzie.map(a => `<tr><td>${esc(a.nome)}</td>${METG.map(([k]) => `<td class="r">${money(cell(a.id, k))}</td>`).join('')}<td class="r">${money(cell(a.id))}</td></tr>`).join('')}<tr class="tot"><td>Totale</td>${METG.map(([k]) => `<td class="r">${money(cell(null, k))}</td>`).join('')}<td class="r">${money(cell(null))}</td></tr></tbody></table>
      <div class="pm-foot"><span>Viaggi in Pullman · La Terra</span><span>Stampato il ${esc(fmtDate(todayISO()))}</span></div></div>`);
  }

  // ---------- riquadro «Incasso e documento» accanto alla lista ----------
  // Si apre dal pulsante «€» della prenotazione. I campi sono quelli del foglio CASSA dell'agenzia:
  // documento, categoria, cliente, descrizione, righe (quantità, € bus, € biglietto), supplemento fila, diritti,
  // circuito ed emissione dei biglietti, pagamento (anche misto), pratica e canale.
  // Nello scontrino va solo la parte agenzia (bus + supplementi + diritti); i biglietti del circuito restano a parte.
  const CATS = ['Gita', 'SoloBus', 'BusEdiritti', 'TicketEdiritti', 'SoloTicket', 'EscursioniEstive', 'Aretusa', 'MaltaEdiritti', 'Tour', 'BuonoRegalo'];
  const DOCS = [['scontrino', 'Scontrino'], ['fattura', 'Fattura'], ['caparra', 'Caparra'], ['nessuno', 'Senza documento']];
  const DOC_L = { scontrino: 'Scontrino', fattura: 'Fattura', caparra: 'Caparra', nessuno: 'Senza documento', ncscontrino: 'Nota di credito scontrino', ncfattura: 'Nota di credito fattura', prelievo: 'Prelievo', apporto: 'Apporto' };
  const DOC_X = { scontrino: 'V.Banco', fattura: 'Fattura', caparra: 'Caparra', nessuno: 'Sospeso', ncscontrino: 'NC V.Banco', ncfattura: 'NC Fattura', prelievo: 'PRELIEVO', apporto: 'APPORTO' };
  const CIRCUITI = ['T.OneRG', 'T.OneMD', 'BoxRG', 'BoxMD', 'Viva', 'CiaoRG', 'CiaoMD', 'CiaoMDR', 'LiveRG', 'LiveMD', 'B-Fast', 'On-Line'];
  const CANALI = ['In agenzia', 'WA Agenzia', 'Mail', 'Facebook', 'Sito Web', 'WA Andrea'];
  const AGC = { rg: 'RAG', md: 'MOD', mr: 'MAR' };
  const r2 = v => Math.round((+v || 0) * 100) / 100;
  const sigla = (uidv, name) => { const u = ACC.users()[uidv]; return (u && u.sigla) || String(name || '').trim().slice(0, 2).toUpperCase(); };
  function docPill(m) {
    if (!m.doc) return m.tipo === 'storno' ? '<small>storno</small>' : '';
    const l = DOC_L[m.doc] || m.doc;
    return `<span class="mpill ${m.docStato === 'da_emettere' ? 'm-pp' : 'm-alt'}" title="${m.docStato === 'da_emettere' ? 'Documento da emettere: la stampante non è ancora collegata' : ''}">${esc(l)}${m.docStato === 'da_emettere' ? ' · da emettere' : ''}</span>`;
  }
  const yy2 = iso => { const [y, m, d] = String(iso || '').split('-'); return d ? `${d}/${m}/${y.slice(2)}` : ''; };

  // proposta dei campi, presa dalla lista e dai prezzi del viaggio
  function payDraft(t, bk) {
    const Q = t.quota || {}; const m = bkMoney(t, bk); const cat = tripCat(t);
    const tkOn = Q.tkt1 != null || Q.tkt2 != null; const dir = tkOn ? (+Q.diritti || 0) : 0;
    const groups = []; let suppl = 0;
    bk.persone.forEach((p, i) => {
      const per = m.per[i] || {}; const tipo = per.tipo; const sup = supplOf(t, bk, p) || 0; suppl += sup;
      const tk = tkOn && tipo !== 'free' ? (+(tipo === 'bam' || tipo === 'inf' ? (Q.tkt2 ?? Q.tkt1) : Q.tkt1) || 0) : 0;
      const bus = per.v != null ? r2(per.v - sup - (tk ? tk + dir : 0)) : 0;
      const l = tipo === 'bam' || tipo === 'inf' ? 'Ridotto' : 'Intero';
      const g = groups.find(x => x.bus === bus && x.tkt === tk && x.l === l); if (g) g.q++; else groups.push({ l, q: 1, bus, tkt: tk });
    });
    while (groups.length > 3) { const x = groups.pop(); groups[2].q += x.q; }
    while (groups.length < 3) groups.push({ l: groups.length === 1 ? 'Ridotto' : 'Ridotto 3', q: 0, bus: 0, tkt: 0 });
    const nT = groups.reduce((a, g) => a + (g.tkt ? g.q : 0), 0);
    const autoCat = cat === 'tour' ? 'Tour' : cat === 'gita' ? 'Gita' : cat === 'evento' ? (nT ? 'BusEdiritti' : 'SoloBus') : cat === 'biglietteria' ? (dir ? 'TicketEdiritti' : 'SoloTicket') : 'Gita';
    const h = bk.head; const cl = h.cid && S.clients.clienti[h.cid];
    const circ = Q.circuito || (tkOn ? (ACC.sess.ag === 'md' ? 'T.OneMD' : 'T.OneRG') : '');
    return {
      bigl: cat === 'biglietteria', tour: cat === 'tour',
      doc: cat === 'tour' ? 'fattura' : 'scontrino', cat: autoCat, cliente: `${bkName(bk)} ${bk.persone[0] ? bk.persone[0].nome : ''}`.trim().toUpperCase(),
      desc: `${yy2(t.data)} ${t.nome}`.toLowerCase(), lines: groups, suppl: r2(suppl), dir, circuito: circ, emis: todayISO(), ant: false,
      imp: m.rest != null && m.rest > 0 ? r2(m.rest) : '', met: 'contanti', mix: {}, pratica: '', canale: 'In agenzia', dataPag: todayISO(), pagante: '', note: '',
      legacy: h.pagato || '',
      fatt: { cf: (cl && cl.cf) || '', ind: (cl && cl.indirizzo) || '', cap: (cl && cl.cap) || '', citta: (cl && cl.citta) || '', sdi: (cl && cl.sdi) || '', pec: (cl && cl.pec) || '' }
    };
  }
  function payTotals(f) {
    const nT = f.lines.reduce((a, l) => a + (+l.tkt ? +l.q || 0 : 0), 0);
    const bus = r2(f.lines.reduce((a, l) => a + (+l.q || 0) * (+l.bus || 0), 0));
    const tkt = r2(f.lines.reduce((a, l) => a + (+l.q || 0) * (+l.tkt || 0), 0));
    const dirT = r2(nT * (+f.dir || 0)); const sup = r2(+f.suppl || 0);
    return { nT, bus, tkt, dirT, sup, tot: r2(bus + tkt + dirT + sup), agenzia: r2(bus + dirT + sup) };
  }
  function payOpen(bkId) {
    const t = trip(); if (!t) return; const bk = deriveBookings(t).find(x => x.id === bkId); if (!bk) return;
    UI.pay = { tripId: t.id, bkId, f: payDraft(t, bk) }; UI.sec = 'lista'; render();
    setTimeout(() => { const i = $('#pf-imp'); if (i) { i.focus(); i.select(); } const p = $('.paypanel'); if (p && p.scrollIntoView && window.innerWidth < 1100) p.scrollIntoView({ block: 'start' }); }, 30);
  }
  function payClose() { UI.pay = null; render(); }
  function payRefresh() { if (!UI.pay) return; const t = trip(); const bk = t && t.id === UI.pay.tripId && deriveBookings(t).find(x => x.id === UI.pay.bkId); if (!bk) UI.pay = null; render(); }
  const nIn = (k, v, extra = '') => `<input class="pf-in num" data-pf="${k}" inputmode="decimal" value="${v === '' || v == null ? '' : esc(fmtNum(+v))}" ${extra} autocomplete="off">`;
  function payPanelHTML(t) {
    const D = deriveBookings(t); const bk = D.find(x => x.id === UI.pay.bkId); if (!bk) return '';
    const f = UI.pay.f; const m = bkMoney(t, bk); const T = payTotals(f);
    const hist = allMovs().filter(x => x.tripId === t.id && x.bkId === bk.id).sort((a, b) => a.at.localeCompare(b.at));
    const storn = new Set(hist.filter(x => x.storno).map(x => x.storno));
    const canPay = ACC.can('cassa') && ACC.sess.ag;
    const tkOn = f.lines.some(l => +l.tkt) || tripCat(t) === 'biglietteria' || tripCat(t) === 'evento';
    const mainBtn = f.doc === 'fattura' ? 'Fattura' : f.doc === 'scontrino' ? 'Scontrino' : f.doc === 'caparra' ? 'Registra la caparra' : 'Registra senza documento';
    return `<section class="panel paypanel" aria-label="Incasso e documento">
      <div class="panel-h"><h3>${esc(bkName(bk))} x ${Math.max(bk.n || 0, bk.persone.length)}</h3><button class="btn sm ghost" data-act="pfclose" aria-label="Chiudi il riquadro">${ICON.close}</button></div>
      <div class="pp-b">
        <div class="pay-sum"><div><span>Totale</span><b>${m.due != null ? money(m.due) : '—'}</b></div><div><span>Già pagato</span><b>${money(m.paid)}</b></div><div class="hi"><span>Da pagare</span><b>${m.rest != null ? money(m.rest) : '—'}</b></div></div>
        ${m.due == null ? '<div class="warnbox small">Mancano i prezzi del viaggio in testa alla lista: il totale si calcola dalle righe qui sotto.</div>' : ''}
        <div class="pp-sec"><span class="pp-l">Documento</span><div class="seg wrap" role="radiogroup" aria-label="Documento">${DOCS.filter(([k]) => k !== 'fattura' || f.tour || f.doc === 'fattura').map(([k, l]) => `<button type="button" role="radio" data-act="pfdoc" data-k="${k}" aria-pressed="${f.doc === k}">${l}</button>`).join('')}</div></div>
        <div class="pp-g2"><label>Categoria<select data-pf="cat">${CATS.map(c => `<option${c === f.cat ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
          <label>Cognome e nome<input data-pf="cliente" value="${esc(f.cliente)}" autocomplete="off"></label></div>
        <label class="pp-1">Descrizione<input data-pf="desc" value="${esc(f.desc)}" autocomplete="off"></label>
        ${f.doc === 'fattura' ? `<div class="pp-fatt"><span class="pp-l">Dati per la fattura</span><div class="pp-g2"><label>Codice fiscale o P. IVA<input data-pff="cf" value="${esc(f.fatt.cf)}" autocomplete="off"></label><label>Codice SDI o PEC<input data-pff="sdi" value="${esc(f.fatt.sdi || f.fatt.pec)}" autocomplete="off"></label></div><div class="pp-g3"><label>Indirizzo<input data-pff="ind" value="${esc(f.fatt.ind)}"></label><label>CAP<input data-pff="cap" value="${esc(f.fatt.cap)}" inputmode="numeric"></label><label>Città<input data-pff="citta" value="${esc(f.fatt.citta)}"></label></div></div>` : ''}
        <table class="pp-lines"><thead><tr><th></th><th>Q</th>${f.bigl ? '' : '<th>€ bus</th>'}${tkOn ? '<th>€ biglietto</th>' : ''}<th class="r">Totale</th></tr></thead><tbody>
          ${f.lines.map((l, i) => `<tr><td><input class="pf-in lab" data-pl="${i}" data-k="l" value="${esc(l.l)}" aria-label="Riga ${i + 1}"></td><td><input class="pf-in num q" data-pl="${i}" data-k="q" inputmode="numeric" value="${l.q ? esc(String(l.q)) : ''}" aria-label="Quantità riga ${i + 1}"></td>${f.bigl ? '' : `<td><input class="pf-in num" data-pl="${i}" data-k="bus" inputmode="decimal" value="${+l.bus ? esc(fmtNum(+l.bus)) : ''}" aria-label="Euro bus riga ${i + 1}"></td>`}${tkOn ? `<td><input class="pf-in num" data-pl="${i}" data-k="tkt" inputmode="decimal" value="${+l.tkt ? esc(fmtNum(+l.tkt)) : ''}" aria-label="Euro biglietto riga ${i + 1}"></td>` : ''}<td class="r" id="pl-t${i}">${l.q ? money((+l.q) * ((+l.bus || 0) + (+l.tkt || 0))) : ''}</td></tr>`).join('')}
        </tbody></table>
        <div class="pp-g3">${f.bigl ? '' : `<label>Suppl. fila €${nIn('suppl', f.suppl)}</label>`}${tkOn ? `<label>Diritti € (per biglietto)${nIn('dir', f.dir)}</label><label>Circuito<select data-pf="circuito"><option value="">—</option>${CIRCUITI.map(c => `<option${c === f.circuito ? ' selected' : ''}>${c}</option>`).join('')}</select></label>` : ''}</div>
        ${tkOn ? `<div class="pp-g2"><label>Emissione biglietti<input type="date" data-pf="emis" value="${esc(f.emis)}"></label><label class="chk pp-chk"><input type="checkbox" data-pfc="ant"${f.ant ? ' checked' : ''}> Emissione anticipata</label></div>` : ''}
        <div class="pp-tot" id="pp-tot">${payTotHTML(T, f.bigl)}</div>
        <div class="pp-sec"><span class="pp-l">Incassato adesso</span><input id="pf-imp" class="pf-in num pay-imp" data-pf="imp" inputmode="decimal" value="${f.imp === '' ? '' : esc(fmtNum(+f.imp))}" placeholder="0,00" autocomplete="off"><span class="pay-warn" id="pp-warn" role="status">${payWarnTxt(f, m)}</span></div>
        <div class="pay-met" role="radiogroup" aria-label="Metodo di pagamento">${[...METODI, ['misto', 'Misto']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${f.met === k}" data-act="pfmet" data-k="${k}">${l}</button>`).join('')}</div>
        ${f.met === 'misto' ? `<div class="pp-mix">${METODI.map(([k, l]) => `<div class="pay-row"><span>${l}</span><input data-pfm="${k}" inputmode="decimal" value="${f.mix[k] ? esc(fmtNum(f.mix[k])) : ''}" placeholder="0,00" aria-label="${l}" autocomplete="off"></div>`).join('')}</div>` : ''}
        ${f.met !== 'contanti' && f.met !== 'pos' ? `<div class="pp-g3"><label>N. pratica<input data-pf="pratica" value="${esc(f.pratica)}"></label><label>Canale<select data-pf="canale">${CANALI.map(c => `<option${c === f.canale ? ' selected' : ''}>${c}</option>`).join('')}</select></label><label>Data pagamento<input type="date" data-pf="dataPag" value="${esc(f.dataPag)}"></label></div><label class="pp-1">Pagante (se diverso)<input data-pf="pagante" value="${esc(f.pagante)}"></label>` : ''}
        <label class="pp-1">Note pratica<input data-pf="note" value="${esc(f.note)}" placeholder="es. buono n° 26001"></label>
        <label class="pp-1">Pagato prima, fuori dall'app (come nella lista Word)<input data-pf="legacy" class="num" inputmode="decimal" value="${esc(f.legacy)}" placeholder="0"></label>
        <div class="small">${canPay ? `Registrato da <b>${esc(ACC.me().name)}</b> · <b>${esc(agName(ACC.sess.ag))}</b> · ${esc(cassaName(ACC.sess.ag))}` : 'Per incassare scegli l\'agenzia in cui lavori (in alto).'}</div>
        ${canPay ? `<div class="pp-act"><button class="btn primary big" data-act="pfsave">${f.doc === 'scontrino' ? ICON.print + ' ' : ''}${mainBtn}${+f.imp ? ' · ' + money(+f.imp) : ''}</button></div>` : ''}
        ${hist.length ? `<div class="pp-sec"><span class="pp-l">Incassi registrati</span><div class="pay-hist">${hist.map(x => `<div class="${x.tipo === 'storno' ? 'neg' : ''}${storn.has(x.id) ? ' gone' : ''}"><span>${esc(fmtDate(x.day).slice(0, 5))} · ${esc(x.who)}<br>${docPill(x)}</span><span>${(x.parts || []).map(p => `<span class="mpill ${MET_C[p.m] || 'm-alt'}">${esc(MET_L[p.m] || p.m)}</span>`).join(' ')}</span><b>${money(x.tot)}</b>${x.tipo !== 'storno' && !storn.has(x.id) && ACC.can('cassa') && (ACC.can('cassaAll') || (x.uid === ACC.sess.uid && x.day === todayISO())) ? `<button class="btn sm ghost" data-act="storno" data-id="${x.id}">Storna</button>` : ''}</div>`).join('')}</div></div>` : ''}
      </div></section>`;
  }
  function payTotHTML(T, bigl) {
    return `${bigl ? '' : `<div><span>Bus</span><b>${money(T.bus)}</b></div>`}${T.tkt ? `<div><span>Biglietti (${T.nT})</span><b>${money(T.tkt)}</b></div>` : ''}${T.dirT ? `<div><span>Diritti</span><b>${money(T.dirT)}</b></div>` : ''}${T.sup ? `<div><span>Suppl. fila</span><b>${money(T.sup)}</b></div>` : ''}
      <div class="tot"><span>Totale</span><b>${money(T.tot)}</b></div><div class="ag"><span>Nello scontrino (parte agenzia)</span><b>${money(T.agenzia)}</b></div>${T.tkt ? `<div><span>Biglietti del circuito, a parte</span><b>${money(T.tkt)}</b></div>` : ''}`;
  }
  function payWarnTxt(f, m) { const v = +f.imp; if (!v || m.rest == null) return ''; return v > m.rest + 0.009 ? (m.rest <= 0 ? 'Attenzione: risulta già pagato tutto.' : `Attenzione: è più del dovuto di ${money(v - m.rest)}.`) : v < m.rest - 0.009 ? `Acconto: restano ${money(m.rest - v)}.` : ''; }
  // aggiorna i totali senza ridisegnare il riquadro (così non si perde il cursore)
  function payRecalc() {
    const f = UI.pay && UI.pay.f; if (!f) return; const T = payTotals(f); const el = $('#pp-tot'); if (el) el.innerHTML = payTotHTML(T, f.bigl);
    f.lines.forEach((l, i) => { const c = $('#pl-t' + i); if (c) c.textContent = l.q ? money((+l.q) * ((+l.bus || 0) + (+l.tkt || 0))) : ''; });
    const t = trip(); const bk = t && deriveBookings(t).find(x => x.id === UI.pay.bkId); const w = $('#pp-warn'); if (w && bk) w.textContent = payWarnTxt(f, bkMoney(t, bk));
  }
  function payInput(el) {
    const f = UI.pay && UI.pay.f; if (!f) return false; const d = el.dataset;
    if (d.pf) { const k = d.pf; f[k] = ['imp', 'suppl', 'dir'].includes(k) ? (parseEuro(el.value) ?? (el.value.trim() ? f[k] : '')) : el.value; if (k === 'legacy') { const t = trip(); const h = t && rowById(t, UI.pay.bkId); if (h) { h.pagato = el.value.trim(); save(); } } payRecalc(); return true; }
    if (d.pl !== undefined) { const l = f.lines[+d.pl]; l[d.k] = d.k === 'l' ? el.value : d.k === 'q' ? (parseInt(el.value, 10) || 0) : (parseEuro(el.value) || 0); payRecalc(); return true; }
    if (d.pff) { f.fatt[d.pff] = el.value; return true; }
    if (d.pfm) { f.mix[d.pfm] = parseEuro(el.value) || 0; return true; }
    if (d.pfc) { f[d.pfc] = el.checked; return true; }
    return false;
  }
  // collegamento al registratore telematico: si attiva quando scegliete la stampante
  function fiscalPrint(mv) { return { ok: false, msg: 'stampante non ancora collegata' }; }
  function paySave() {
    const t = trip(); const D = deriveBookings(t); const bk = D.find(x => x.id === UI.pay.bkId); if (!bk) return payClose();
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia in cui lavori (in alto)');
    const f = UI.pay.f; const imp = r2(+f.imp);
    if (!imp || imp <= 0) return toast('Scrivi l\'importo incassato adesso');
    let parts;
    if (f.met === 'misto') {
      parts = METODI.map(([k]) => ({ m: k, a: r2(f.mix[k] || 0) })).filter(p => p.a > 0);
      const s = r2(parts.reduce((a, p) => a + p.a, 0));
      if (parts.length < 2) return toast('Nel pagamento misto scrivi almeno due metodi');
      if (Math.abs(s - imp) > 0.009) return toast(`I metodi fanno ${money(s)}, l'importo è ${money(imp)}`);
    } else parts = [{ m: f.met, a: imp }];
    if (f.doc === 'fattura' && !String(f.fatt.cf || '').trim()) return toast('Per la fattura scrivi il codice fiscale o la partita IVA');
    const T = payTotals(f); const m = bkMoney(t, bk);
    const tipo = m.rest != null && imp >= m.rest - 0.009 ? 'saldo' : 'acconto';
    const agz = T.tot > 0 ? r2(imp * T.agenzia / T.tot) : imp;
    const mv = addMov({ tripId: t.id, tripN: t.nome, tripD: t.data, bkId: bk.id, cliente: f.cliente || `${bkName(bk)} x ${bk.persone.length}`, tel: (bk.persone.find(p => p.tel) || {}).tel || '', tipo, parts,
      doc: f.doc, docStato: f.doc === 'scontrino' || f.doc === 'fattura' ? 'da_emettere' : '', cat: f.cat, desc: f.desc, circuito: T.tkt ? f.circuito : '', emis: T.tkt ? f.emis : '', ant: !!f.ant,
      lines: f.lines.filter(l => +l.q).map(l => ({ l: l.l, q: +l.q, bus: +l.bus || 0, tkt: +l.tkt || 0 })), suppl: T.sup, dir: +f.dir || 0, nT: T.nT, docTot: T.tot, agenzia: agz, biglietti: r2(imp - agz),
      pratica: f.pratica, canale: f.met === 'contanti' || f.met === 'pos' ? '' : f.canale, dataPag: f.met === 'contanti' || f.met === 'pos' ? '' : f.dataPag, pagante: f.pagante, note: f.note, fatt: f.doc === 'fattura' ? Object.assign({}, f.fatt) : null, sigla: sigla(ACC.sess.uid, ACC.me().name) });
    if (f.doc === 'fattura' && bk.head.cid && S.clients.clienti[bk.head.cid]) { const c = S.clients.clienti[bk.head.cid]; Object.assign(c, { cf: f.fatt.cf, sdi: f.fatt.sdi, cap: f.fatt.cap, citta: f.fatt.citta }); if (f.fatt.ind) c.indirizzo = f.fatt.ind; save(); }
    ACC.tlog('info', `Incasso ${money(mv.tot)} (${parts.map(p => MET_L[p.m]).join(' + ')}) · ${DOC_L[f.doc]} · ${mv.cliente} · ${t.nome}`);
    let msg = `Incasso registrato: ${money(mv.tot)} · ${tipo}`;
    if (f.doc === 'scontrino') { const r = fiscalPrint(mv); msg += r.ok ? ' · scontrino stampato' : ` · scontrino di ${money(agz)} da emettere (${r.msg})`; }
    if (f.doc === 'fattura') msg += ' · fattura da emettere';
    UI.pay.f = payDraft(t, deriveBookings(t).find(x => x.id === bk.id) || bk); commit(); toast(msg);
  }

  // ---------- prelievi e apporti di contanti ----------
  function cashMovModal(kind) {
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia');
    UI.modal = { kind: 'cashmov', k: kind };
    openModal(`${kind === 'prelievo' ? 'Prelievo dalla cassa' : 'Apporto in cassa'} · ${esc(agName(ACC.sess.ag))}`, `
      <div class="field"><label for="cm-imp">Importo in contanti</label><input id="cm-imp" class="pay-imp" inputmode="decimal" placeholder="0,00" autocomplete="off"></div>
      <div class="field"><label for="cm-note">Motivo</label><input id="cm-note" placeholder="${kind === 'prelievo' ? 'es. versamento in banca' : 'es. fondo cassa'}"></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="cashsave">Registra</button>`);
  }
  function cashMovSave() {
    const v = parseEuro($('#cm-imp').value); if (!v || v <= 0) return toast('Scrivi l\'importo');
    const k = UI.modal.k; const note = ($('#cm-note').value || '').trim();
    addMov({ tipo: k, doc: k, cliente: k === 'prelievo' ? 'Prelievo' : 'Apporto', note, parts: [{ m: 'contanti', a: k === 'prelievo' ? -v : v }], sigla: sigla(ACC.sess.uid, ACC.me().name) });
    ACC.tlog('avviso', `${k === 'prelievo' ? 'Prelievo' : 'Apporto'} di ${money(v)} in ${agName(ACC.sess.ag)}${note ? ' · ' + note : ''}`);
    closeModal(); render(); toast(`${k === 'prelievo' ? 'Prelievo' : 'Apporto'} registrato`);
  }
  // contanti in cassa: quelli all'inizio (impostazioni dell'agenzia) + tutti i movimenti in contanti fino a quel giorno
  function cashSaldo(ag, day) {
    const ags = !ag || ag === 'tutte' ? S.cfg.agenzie.map(a => a.id) : [ag];
    let inizio = ags.reduce((a, id) => a + (parseEuro(String((S.cfg.agenzie.find(x => x.id === id) || {}).cassaIniziale || '')) || 0), 0), inc = 0, prel = 0, app = 0;
    allMovs().filter(m => ags.includes(m.ag)).forEach(m => {
      const c = (m.parts || []).filter(p => p.m === 'contanti').reduce((a, p) => a + p.a, 0); if (!c) return;
      if (m.day < day) inizio += c; else if (m.day === day) { if (m.tipo === 'prelievo') prel += -c; else if (m.tipo === 'apporto') app += c; else inc += c; }
    });
    return { inizio: r2(inizio), inc: r2(inc), prel: r2(prel), app: r2(app), fine: r2(inizio + inc - prel + app) };
  }

  // ---------- Contabilità · resoconto giornaliero (come il foglio CASSA) ----------
  const contaTabs = () => `<div class="ctabs seg" role="tablist" aria-label="Contabilità"><button role="tab" data-act="ctab" data-v="giorno" aria-pressed="${UI.ctab !== 'mese'}">Resoconto giornaliero</button><button role="tab" data-act="ctab" data-v="mese" aria-pressed="${UI.ctab === 'mese'}">Mese</button></div>`;
  const XL_H = ['Data', 'Op.', 'Doc.', 'V.Banco', 'Fattura', 'Categoria', 'Cognome e Nome', 'Descrizione', 'Circuito', 'Emis. Cont.', 'Emis. Antic.', 'Note prat.', 'Q1', '€ 1 Bus', 'Tkt intero', 'Q2', '€ 2 Bus', 'Tkt ridotto2', 'Q3', '€ 3 Bus', 'Tkt ridotto3', 'Suppl. Fila', 'Diritti', 'Totale', 'CHECK', 'Cash', 'Pos', '€ altro', 'Modalità', 'Pratica', 'Data.Pag.', 'Pagante', 'Saldo', 'Danea', 'Check D.', '€ Tot.Tkt', 'N.Tot. Tkt', 'Check Tkt', 'Tot.Diritti', 'Tot. Bus', 'Note', 'Tkt+Diritti', 'Agenzia'];
  function xlRow(m, saldo) {
    const L = m.lines || []; const ln = i => L[i] || {}; const sumP = f => r2((m.parts || []).filter(f).reduce((a, p) => a + p.a, 0));
    const cash = sumP(p => p.m === 'contanti'), pos = sumP(p => p.m === 'pos'), alt = sumP(p => p.m !== 'contanti' && p.m !== 'pos');
    const altM = (m.parts || []).filter(p => p.m !== 'contanti' && p.m !== 'pos').map(p => MET_L[p.m] || p.m).join('+');
    const totBus = r2(L.reduce((a, l) => a + l.q * l.bus, 0)), totTkt = r2(L.reduce((a, l) => a + l.q * l.tkt, 0)), nT = m.nT || L.reduce((a, l) => a + (l.tkt ? l.q : 0), 0), dirT = r2((m.dir || 0) * nT);
    const tot = isInc(m) ? (m.docTot != null ? m.docTot : m.tot) : 0;
    return [fmtDate(m.day), m.sigla || sigla(m.uid, m.who), DOC_X[m.doc] || (m.tipo === 'storno' ? 'NC V.Banco' : ''), '', '', m.cat || '', m.cliente || '', m.desc || m.tripN || '', m.circuito || 'NO', m.emis && !m.ant ? fmtDate(m.emis) : 'NO', m.emis && m.ant ? fmtDate(m.emis) : 'NO', m.note || '',
      ln(0).q || 0, ln(0).bus || 0, ln(0).tkt || 0, ln(1).q || 0, ln(1).bus || 0, ln(1).tkt || 0, ln(2).q || 0, ln(2).bus || 0, ln(2).tkt || 0, m.suppl || 0, m.dir || 0, tot,
      !isInc(m) ? 'CONTROLLA' : Math.abs(r2(cash + pos + alt) - tot) < 0.01 ? 'ok' : 'acconto', cash, pos, alt, altM, m.pratica || '', m.dataPag ? fmtDate(m.dataPag) : '', m.pagante || '', saldo, isInc(m) ? (m.agenzia != null ? m.agenzia : m.tot) : 0, '', totTkt, nT, '', dirT, totBus, m.tipo === 'acconto' ? 'acconto' : '', r2(totTkt + dirT), AGC[m.ag] || m.ag || ''];
  }
  function exportCassa(movs, name) {
    movs = movs.slice().sort((a, b) => a.at.localeCompare(b.at));
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; const n = v => typeof v === 'number' ? String(r2(v)).replace('.', ',') : v;
    const run = {}; const rows = [XL_H];
    movs.forEach(m => { const c = (m.parts || []).filter(p => p.m === 'contanti').reduce((a, p) => a + p.a, 0); if (run[m.ag] == null) run[m.ag] = cashSaldo(m.ag, m.day).inizio; run[m.ag] = r2(run[m.ag] + c); rows.push(xlRow(m, run[m.ag]).map(n)); });
    const csv = '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function giornoData() {
    const day = UI.gday || todayISO(); const ag = UI.gag || 'tutte';
    const movs = allMovs().filter(m => m.day === day && (ag === 'tutte' || m.ag === ag)).sort((a, b) => a.at.localeCompare(b.at));
    return { day, ag, movs, inc: movs.filter(isInc) };
  }
  function giornoView() {
    const { day, ag, movs, inc } = giornoData();
    const per = sumBy(inc, (m, p) => mg(p.m)); const tot = totOf(movs); const sal = cashSaldo(ag, day);
    const altri = {}; inc.forEach(m => m.parts.forEach(p => { if (mg(p.m) === 'altro') altri[p.m] = (altri[p.m] || 0) + p.a; }));
    const scon = inc.filter(m => m.doc === 'scontrino' || m.doc === 'ncscontrino'), fatt = inc.filter(m => m.doc === 'fattura' || m.doc === 'ncfattura');
    const agTot = r2(inc.reduce((a, m) => a + (m.agenzia != null ? m.agenzia : m.tot), 0)), tkTot = r2(inc.reduce((a, m) => a + (m.biglietti || 0), 0));
    const byCat = {}; inc.forEach(m => { const k = m.cat || '—'; const o = byCat[k] = byCat[k] || { n: 0, tot: 0, ag: 0, tk: 0 }; o.n++; o.tot += m.tot; o.ag += m.agenzia != null ? m.agenzia : m.tot; o.tk += m.biglietti || 0; });
    const byCirc = {}; inc.filter(m => m.circuito).forEach(m => { const o = byCirc[m.circuito] = byCirc[m.circuito] || { n: 0, tk: 0 }; o.n += m.nT || 0; o.tk += m.biglietti || 0; });
    const ch = ag !== 'tutte' ? chiusura(day, ag) : null;
    const d = parseD(day); const prev = new Date(d); prev.setDate(d.getDate() - 1); const next = new Date(d); next.setDate(d.getDate() + 1);
    let run = sal.inizio;
    return `${contaTabs()}<div class="pagehead"><div><h1>Resoconto del ${esc(fmtDate(day))}</h1><div class="sub">${esc(fmtDate(day, true))} · ${inc.length} ${inc.length === 1 ? 'incasso' : 'incassi'}${ag !== 'tutte' ? ' · ' + esc(agName(ag)) : ' · tutte le agenzie'}</div></div>
        <div class="hbtns"><div class="seg" role="group" aria-label="Agenzia">${[['tutte', 'Tutte'], ...S.cfg.agenzie.map(a => [a.id, a.nome])].map(([k, l]) => `<button data-act="gag" data-v="${k}" aria-pressed="${ag === k}">${esc(l)}</button>`).join('')}</div>
          <button class="btn" data-act="gday" data-v="${dayISO(prev)}">‹</button><input type="date" class="btn" data-gdate="1" value="${esc(day)}" aria-label="Giorno"><button class="btn" data-act="gday" data-v="${dayISO(next)}">›</button>
          <button class="btn" data-act="gexport">Scarica per Excel (foglio CASSA)</button></div></div>
      <div class="tiles"><div class="tile dark"><span>Incassato</span><b>${money(tot)}</b><small>${inc.length} movimenti</small></div>${METG.map(([k, l]) => `<div class="tile"><span><i class="mdot ${MET_C[k]}"></i>${l}</span><b>${money(per[k] || 0)}</b>${k === 'altro' && Object.keys(altri).length ? `<small>${Object.entries(altri).map(([x, v]) => `${esc(MET_L[x] || x)} ${esc(fmtNum(v))}`).join(' · ')}</small>` : ''}</div>`).join('')}</div>
      <div class="three">
        <section class="box form"><h3>Cassa contanti</h3><div class="kv"><span>Inizio giornata</span><b>${money(sal.inizio)}</b></div><div class="kv"><span>Contanti incassati</span><b>${money(sal.inc)}</b></div>${sal.prel ? `<div class="kv"><span>Prelievi</span><b>− ${money(sal.prel)}</b></div>` : ''}${sal.app ? `<div class="kv"><span>Apporti</span><b>+ ${money(sal.app)}</b></div>` : ''}<div class="kv tot"><span>Fine giornata</span><b>${money(sal.fine)}</b></div>${ch && ch.contati && ch.contati.contanti != null ? `<div class="kv"><span>Contati alla chiusura</span><b>${money(ch.contati.contanti)} ${Math.abs(ch.contati.contanti - (per.contanti || 0)) < 0.01 ? '<span class="pill ok">quadra</span>' : ''}</b></div>` : ''}</section>
        <section class="box form"><h3>Documenti</h3><div class="kv"><span>Scontrini (parte agenzia)</span><b>${scon.length} · ${money(scon.reduce((a, m) => a + (m.agenzia != null ? m.agenzia : m.tot), 0))}</b></div><div class="kv"><span>Da emettere</span><b>${inc.filter(m => m.docStato === 'da_emettere').length}</b></div><div class="kv"><span>Fatture</span><b>${fatt.length} · ${money(fatt.reduce((a, m) => a + m.tot, 0))}</b></div><div class="kv"><span>Caparre</span><b>${money(inc.filter(m => m.doc === 'caparra').reduce((a, m) => a + m.tot, 0))}</b></div><div class="kv tot"><span>Totale parte agenzia (Danea)</span><b>${money(agTot)}</b></div></section>
        <section class="box form"><h3>Biglietti dei circuiti</h3>${Object.entries(byCirc).map(([c, o]) => `<div class="kv"><span>${esc(c)}</span><b>${o.n} tkt · ${money(o.tk)}</b></div>`).join('') || '<div class="small">Nessun biglietto venduto.</div>'}${tkTot ? `<div class="kv tot"><span>Da versare ai circuiti</span><b>${money(tkTot)}</b></div>` : ''}</section></div>
      <section class="box tablecard"><h2 class="ch">Per categoria</h2><div class="tscroll"><table class="rt"><thead><tr><th>Categoria</th><th class="r">Incassi</th><th class="r">Totale</th><th class="r">Parte agenzia</th><th class="r">Biglietti</th></tr></thead><tbody>${Object.entries(byCat).map(([k, o]) => `<tr><td>${esc(k)}</td><td class="r">${o.n}</td><td class="r">${money(o.tot)}</td><td class="r">${money(o.ag)}</td><td class="r">${money(o.tk)}</td></tr>`).join('') || '<tr><td colspan="5" class="emptyrow">Nessun incasso.</td></tr>'}</tbody></table></div></section>
      <section class="box tablecard"><h2 class="ch">Movimenti del giorno</h2><div class="tscroll"><table class="rt xl"><thead><tr><th>Ora</th><th>Op.</th><th>Doc.</th><th>Categoria</th><th>Cognome e nome</th><th>Descrizione</th><th>Circuito</th><th class="r">Q</th><th class="r">€ bus</th><th class="r">€ tkt</th><th class="r">Suppl.</th><th class="r">Diritti</th><th class="r">Totale</th><th class="r">Cash</th><th class="r">POS</th><th class="r">Altro</th><th class="r">Danea</th><th class="r">Saldo</th><th>Agenzia</th></tr></thead><tbody>
        ${movs.map(m => { const c = (m.parts || []).filter(p => p.m === 'contanti').reduce((a, p) => a + p.a, 0); run = r2(run + c); const x = xlRow(m, run); const L = m.lines || [];
          return `<tr class="${m.tipo === 'storno' || m.tipo === 'prelievo' ? 'neg' : ''}"><td>${esc(hm(m.at))}</td><td>${esc(x[1])}</td><td>${esc(x[2])}${m.docStato === 'da_emettere' ? '<br><small>da emettere</small>' : ''}</td><td>${esc(x[5])}</td><td>${esc(x[6])}</td><td>${esc(x[7])}</td><td>${esc(m.circuito || '')}</td><td class="r">${L.reduce((a, l) => a + l.q, 0) || ''}</td><td class="r">${L.length ? money(L.reduce((a, l) => a + l.q * l.bus, 0)) : ''}</td><td class="r">${L.some(l => l.tkt) ? money(L.reduce((a, l) => a + l.q * l.tkt, 0)) : ''}</td><td class="r">${m.suppl ? money(m.suppl) : ''}</td><td class="r">${x[38] ? money(x[38]) : ''}</td><td class="r"><b>${isInc(m) ? money(x[23]) : ''}</b></td><td class="r">${x[25] ? money(x[25]) : ''}</td><td class="r">${x[26] ? money(x[26]) : ''}</td><td class="r">${x[27] ? money(x[27]) + '<br><small>' + esc(x[28]) + '</small>' : ''}</td><td class="r">${isInc(m) ? money(x[33]) : ''}</td><td class="r">${money(run)}</td><td>${esc(x[42])}</td></tr>`; }).join('') || '<tr><td colspan="19" class="emptyrow">Nessun movimento.</td></tr>'}
      </tbody></table></div></section>`;
  }

  // ---------- impostazioni a sezioni ----------
  const SSEC = [
    ['account', 'Il mio account', 'A', '#6E6E73', null],
    ['utenti', 'Operatori e permessi', 'O', '#D90D36', 'users'],
    ['agenzie', 'Agenzie e casse', '€', '#2DA160', 'settings'],
    ['luoghi', 'Luoghi di partenza e mappe', 'M', '#0A6CD6', 'settings'],
    ['whatsapp', 'WhatsApp ai clienti', 'W', '#1FA855', 'settings'],
    ['sync', 'Sincronizzazione', 'S', '#2B2F33', null],
    ['backup', 'Copia di sicurezza', 'C', '#6E6E73', 'settings']
  ];
  const CHK = '/config/chiavi.json';
  function settingsView() {
    const secs = SSEC.filter(s => !s[4] || ACC.can(s[4]));
    if (!secs.some(s => s[0] === UI.ssec)) UI.ssec = secs[0][0];
    const me = ACC.me();
    let body = '';
    const sec = UI.ssec;
    if (sec === 'account') body = `<h2>Il mio account</h2><p class="sub">${esc(me.name)} · ${esc(ROLE_L[me.role])}${me.agencies && me.agencies.length ? ' · ' + me.agencies.map(agName).join(', ') : ''}</p>
      <form class="box form" data-form="mypw"><h3>Cambia la password</h3>
        <label>Password attuale<input name="old" type="password" autocomplete="current-password" required></label>
        <label>Nuova password (almeno 8 caratteri)<input name="p" type="password" autocomplete="new-password" required minlength="8"></label>
        <label>Ripeti la nuova password<input name="p2" type="password" autocomplete="new-password" required minlength="8"></label>
        <div><button class="btn primary" type="submit">Cambia la password</button></div></form>
      <div class="box form"><h3>Su questo computer</h3><div class="small">Agenzia di oggi: <b>${esc(ACC.agency() ? ACC.agency().nome : '—')}</b>.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${needsAgency(me) ? '<button class="btn" data-act="changeag">Cambia agenzia</button>' : ''}<button class="btn danger" data-act="logout">Esci</button></div></div>`;
    else if (sec === 'utenti') {
      const list = Object.entries(ACC.users()).filter(([, u]) => u.role !== 'super' || ACC.role() === 'super').sort((a, b) => (a[1].active === false) - (b[1].active === false) || a[1].name.localeCompare(b[1].name));
      body = `<div class="sh"><div><h2>Operatori e permessi</h2><p class="sub">Chi può entrare, con quale ruolo e in quali agenzie. Senza agenzie spuntate, l'account può entrare in tutte.</p></div><button class="btn primary" data-act="unew">${ICON.plus} Nuovo account</button></div>
        <div class="box tablecard"><div class="tscroll"><table class="rt users"><thead><tr><th>Account</th><th>Sigla</th><th>Ruolo</th>${S.cfg.agenzie.map(a => `<th class="ctr">${esc(a.nome)}</th>`).join('')}<th>Attivo</th><th></th></tr></thead><tbody>
        ${list.map(([id, u]) => { const self = id === ACC.sess.uid; const lockRole = self || (u.role === 'master' && ACC.role() !== 'super' && false); return `<tr class="${u.active === false ? 'off' : ''}"><td><span class="av">${esc((u.name || '?')[0].toUpperCase())}</span> <b>${esc(u.name)}</b>${self ? ' <small>(tu)</small>' : ''}${u.mustChange ? '<br><small>deve cambiare la password</small>' : ''}</td><td><input class="code-in" data-usig="${id}" value="${esc(u.sigla || '')}" maxlength="3" placeholder="${esc(String(u.name || '').slice(0, 2).toUpperCase())}" aria-label="Sigla di ${esc(u.name)} nel resoconto (colonna Op.)"></td>
          <td>${u.role === 'super' ? 'Super Master' : `<select data-urole="${id}" aria-label="Ruolo di ${esc(u.name)}"${lockRole ? ' disabled' : ''}>${['operatore', 'master', 'contabilita'].map(r => `<option value="${r}"${u.role === r ? ' selected' : ''}>${ROLE_L[r]}</option>`).join('')}</select>`}</td>
          ${S.cfg.agenzie.map(a => `<td class="ctr"><input type="checkbox" class="sw" data-uag="${id}" data-ag="${a.id}"${(u.agencies || []).includes(a.id) ? ' checked' : ''} aria-label="${esc(u.name)} in ${esc(a.nome)}"${u.role === 'super' || u.role === 'contabilita' ? ' disabled' : ''}></td>`).join('')}
          <td class="ctr"><input type="checkbox" class="sw" data-uact="${id}"${u.active !== false ? ' checked' : ''}${self || u.role === 'super' ? ' disabled' : ''} aria-label="${esc(u.name)} attivo"></td>
          <td class="r">${u.role === 'super' && ACC.role() !== 'super' ? '' : `<button class="btn sm" data-act="ureset" data-id="${id}">Reimposta password</button>`}</td></tr>`; }).join('')}
        </tbody></table></div></div>
        <div class="two"><div class="box form"><h3>Cosa può fare ogni ruolo</h3><ul class="small ul"><li><b>Operatore</b>: liste, posti sul bus, anagrafica, incassi e resoconto della sua agenzia, messaggi ai clienti.</li><li><b>Master</b>: tutto quello dell'operatore, più contabilità, impostazioni e account.</li><li><b>Contabilità</b>: vede cassa e contabilità di tutte le agenzie, senza modificare.</li></ul></div>
        <div class="box form"><h3>Password dimenticata</h3><div class="small">Premi «Reimposta password»: scegli una password provvisoria e dilla alla persona. Al primo accesso l'app le chiede di sceglierne una nuova.</div></div></div>`;
    } else if (sec === 'agenzie') body = `<h2>Agenzie e casse</h2><p class="sub">Ogni agenzia ha la sua cassa: gli incassi vanno nella cassa dell'agenzia scelta all'accesso.</p>
      ${S.cfg.agenzie.map((a, i) => `<div class="box form agf"><div class="grid3"><label>Agenzia<input data-cfgag="${i}" data-k="nome" value="${esc(a.nome)}"></label><label>Nome della cassa<input data-cfgag="${i}" data-k="cassa" value="${esc(a.cassa || '')}"></label><label>Indirizzo<input data-cfgag="${i}" data-k="indirizzo" value="${esc(a.indirizzo || '')}" placeholder="via, numero, città"></label></div><div class="grid3"><label>Contanti in cassa all'inizio (riporto) €<input data-cfgag="${i}" data-k="cassaIniziale" inputmode="decimal" value="${esc(a.cassaIniziale || '')}" placeholder="0"></label><span class="small" style="grid-column:span 2;align-self:end">Il fondo cassa da cui parte il conto dei contanti nel resoconto giornaliero (colonna «Saldo» del foglio CASSA).</span></div></div>`).join('')}`;
    else if (sec === 'luoghi') body = `<div class="sh"><div><h2>Luoghi di partenza e mappe</h2><p class="sub">Per ogni punto di salita incolla il link di Google Maps: nel messaggio WhatsApp il cliente lo tocca e trova il punto preciso. Il codice è quello della colonna «part» della lista (es. RG, MD).</p></div><button class="btn primary" data-act="lnew">${ICON.plus} Aggiungi luogo</button></div>
      <div class="box tablecard"><div class="tscroll"><table class="rt luoghi"><thead><tr><th>Codice</th><th>Città</th><th>Punto di salita</th><th>Link Google Maps</th><th></th></tr></thead><tbody>
      ${(S.cfg.luoghi || []).map((l, i) => `<tr><td><input data-cfgl="${i}" data-k="code" value="${esc(l.code || '')}" placeholder="RG" aria-label="Codice" class="code-in"></td><td><input data-cfgl="${i}" data-k="citta" value="${esc(l.citta || '')}" placeholder="Ragusa" aria-label="Città"></td><td><input data-cfgl="${i}" data-k="luogo" value="${esc(l.luogo || '')}" placeholder="es. Palazama" aria-label="Punto di salita"></td><td><input data-cfgl="${i}" data-k="maps" value="${esc(l.maps || '')}" placeholder="https://maps.app.goo.gl/…" aria-label="Link Google Maps"></td>
        <td class="r nowrap"><a class="btn sm" href="${esc(l.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([l.luogo, l.citta].filter(Boolean).join(', '))}`)}" target="_blank" rel="noopener">${l.maps ? 'Prova il link' : 'Cerca su Maps'}</a><button class="kebab" data-act="ldel" data-i="${i}" aria-label="Togli">${ICON.close}</button></td></tr>`).join('') || '<tr><td colspan="5" class="emptyrow">Nessun luogo: premi «Aggiungi luogo».</td></tr>'}
      </tbody></table></div></div>
      <div class="box form"><h3>Come si prende il link</h3><ol class="small ul"><li>Premi «Cerca su Maps» accanto al luogo: si apre Google Maps.</li><li>Clicca sul punto esatto della fermata, poi su <b>Condividi</b> › <b>Copia link</b>.</li><li>Torna qui e incolla il link nella colonna «Link Google Maps».</li></ol></div>`;
    else if (sec === 'whatsapp') { const c = waCfg(); body = `<h2>WhatsApp ai clienti</h2>
      <div class="box form"><h3>Testo del messaggio «a mano»</h3><textarea id="s-wa" style="min-height:190px">${esc(S.cfg.waTemplate || DEFAULT_WA)}</textarea>
      <span class="small">Le parole tra graffe si riempiono con i dati del cliente; una riga che resta vuota non viene mandata. Clicca per inserirle:</span><div class="chips">${WA_PH.map(p => `<code data-act="insph" data-p="${p}">{${p}}</code>`).join('')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="savewa">Salva il testo</button><button class="btn" data-act="resetwa">Ripristina il testo standard</button></div></div>
      <div class="box form"><h3>Telefono dell'agenzia nel messaggio</h3><input id="s-tel" value="${esc(S.cfg.telAgenzia || '')}" placeholder="es. 0932 000000"><div><button class="btn" data-act="savetel">Salva</button></div></div>
      <div class="box form"><h3>Invio automatico</h3><div class="small">${waReady(c) ? '<span class="pill ok">Attivo</span> I codici di Meta sono inseriti.' : '<span class="pill tbd">Non ancora attivo</span> I codici di Meta li inserisce il tecnico dal Super Master.'}</div>${WA_GUIDE()}</div>`; }
    else if (sec === 'sync') { const st = STORE.status(); body = `<h2>Sincronizzazione</h2><p class="sub">I dati stanno nella cartella Dropbox «Applicazioni › Viaggi in Pullman La Terra» e su ogni computer collegato.</p>
      <div class="box form"><div class="kv"><span>Stato</span><b>${!st.hasKey ? 'Dropbox non configurato (manca la chiave in config.js)' : st.linked ? (st.error ? 'Errore: ' + esc(st.error) : st.pending ? `${st.pending} modifiche da inviare` : 'Tutto sincronizzato') : 'Non collegato: i dati restano solo su questo computer'}</b></div>
        <div class="kv"><span>Ultima sincronizzazione</span><b>${st.last ? esc(st.last.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })) : '—'}</b></div><div class="kv"><span>Questo computer</span><b>${esc(STORE.device.id)}</b></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${st.linked ? '<button class="btn" data-act="syncnow">Sincronizza adesso</button>' : st.hasKey ? '<button class="btn primary" data-act="glink">Collega Dropbox</button>' : ''}</div></div>`; }
    else if (sec === 'backup') body = `<h2>Copia di sicurezza</h2><p class="sub">Dropbox tiene già tutto, anche le versioni precedenti dei file. Qui puoi scaricare una copia completa o recuperare i dati della versione di prova.</p>
      <div class="box form"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="export">Scarica una copia</button><label class="btn" for="s-restore">Recupera da una copia (anche della versione OnBoard)<input id="s-restore" type="file" accept=".json,application/json" hidden></label></div>
      <div class="small">Recuperando una copia, i viaggi si aggiungono a quelli che ci sono già: se un viaggio dell'elenco 2027 è ancora vuoto, la lista della copia ci entra dentro.</div></div>`;
    return `<div class="setp"><nav class="snav" aria-label="Sezioni delle impostazioni"><h1>Impostazioni</h1>
        <div class="sme"><span class="av">${esc((me.name || '?')[0].toUpperCase())}</span><span><b>${esc(me.name)}</b><br><small>${esc(ROLE_L[me.role])}</small></span></div>
        ${secs.map(([k, l, i, c]) => `<button class="sitem" data-act="ssec" data-v="${k}" aria-current="${UI.ssec === k ? 'page' : 'false'}"><span class="sic" style="background:${c}" aria-hidden="true">${i}</span>${esc(l)}</button>`).join('')}
        <div class="small sver">Versione ${esc(VERSION)}</div></nav><section class="sbody">${body}</section></div>`;
  }
  function userModal(id) {
    const u = id ? ACC.users()[id] : null;
    if (u && u.role === 'super' && ACC.role() !== 'super') return;
    if (!ACC.can('users')) return;
    UI.modal = { kind: 'user', id };
    openModal(u ? `Reimposta la password · ${esc(u.name)}` : 'Nuovo account', `
      ${u ? '' : `<div class="field"><label for="nu-n">Nome dell'account</label><input id="nu-n" autocomplete="off" placeholder="es. Giulia"></div>
      <div class="field"><label for="nu-r">Ruolo</label><select id="nu-r">${['operatore', 'master', 'contabilita'].map(r => `<option value="${r}">${ROLE_L[r]}</option>`).join('')}</select></div>
      <div class="field"><label>Agenzie in cui può entrare</label><div class="chips">${S.cfg.agenzie.map(a => `<label class="chk"><input type="checkbox" data-nuag="${a.id}"> ${esc(a.nome)}</label>`).join('')}</div><span class="small">Nessuna spunta = tutte le agenzie.</span></div>`}
      <div class="field"><label for="nu-p">Password provvisoria (almeno 8 caratteri)</label><input id="nu-p" autocomplete="new-password" value="${esc(tempPw())}"><span class="small">Dilla alla persona: al primo accesso ne sceglie una sua.</span></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="usave">${u ? 'Reimposta' : 'Crea l\'account'}</button>`);
  }
  const tempPw = () => { const w = ['pullman', 'viaggio', 'sicilia', 'gita', 'tour', 'mare', 'etna']; return w[Math.floor(Math.random() * w.length)] + (1000 + Math.floor(Math.random() * 9000)); };
  async function userSave() {
    const id = UI.modal.id; const pw = ($('#nu-p').value || '').trim();
    if (pw.length < 8) return toast('La password provvisoria deve avere almeno 8 caratteri');
    if (id) { await ACC.setPw(id, pw, true); ACC.tlog('avviso', `Password reimpostata per «${ACC.users()[id].name}»`); closeModal(); render(); return toast('Password reimpostata: al primo accesso ne sceglierà una nuova'); }
    const n = ($('#nu-n').value || '').trim(); if (!n) return toast('Scrivi il nome dell\'account');
    if (ACC.find(n)) return toast('Questo nome non si può usare: scegline un altro');
    const ags = $$('[data-nuag]').filter(x => x.checked).map(x => x.dataset.nuag);
    const nid = await ACC.create(n, pw, $('#nu-r').value, ags); ACC.users()[nid].mustChange = true; save();
    ACC.tlog('info', `Creato l'account «${n}» (${ROLE_L[$('#nu-r').value]})`); closeModal(); render(); toast(`Account «${n}» creato`);
  }

  // ---------- Super Master (solo il tecnico) ----------
  function superView() {
    const days = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); days.push(dayISO(d)); }
    const ev = STORE.list('/registro/').filter(([p]) => days.some(d => p.includes('/' + d + '_'))).flatMap(([p, d]) => (d.ev || []).map(e => Object.assign({ dev: d.dev || p.split('_').pop().replace('.json', '') }, e)))
      .filter(e => UI.lgf !== 'err' || e.lv !== 'info').sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300);
    const c = waCfg(); const st = STORE.status();
    return `<div class="sup"><div class="pagehead"><div><h1>Super Master</h1><div class="sub">Invisibile agli altri account · ${st.linked ? 'Dropbox collegato' : 'solo su questo computer'} · versione ${esc(VERSION)}</div></div><div class="hbtns"><button class="btn" data-act="lexport">Scarica il registro</button><button class="btn" data-act="logout">Esci</button></div></div>
      <div class="two"><section class="box sup-log" aria-label="Log tecnico"><div class="sh"><h2>Log tecnico · ultimi 7 giorni</h2><div class="seg"><button data-act="lgf" data-v="all" aria-pressed="${UI.lgf !== 'err'}">Tutto</button><button data-act="lgf" data-v="err" aria-pressed="${UI.lgf === 'err'}">Errori e avvisi</button></div></div>
        <div class="logl">${ev.map(e => `<div class="lg ${e.lv}"><span>${esc(dayISO(new Date(e.at)).slice(5).split('-').reverse().join('/'))} ${esc(hm(e.at))}</span><span class="lv">${esc(e.lv.toUpperCase())}</span><span>${esc(e.who ? e.who + ' · ' : '')}${esc(e.ag ? agName(e.ag) + ' · ' : '')}${esc(e.m)}<small> · ${esc(e.dev)}</small></span></div>`).join('') || '<div class="small">Niente nel registro.</div>'}</div></section>
        <div class="sup-col">${diagBox()}<section class="box form"><h2>Password e account</h2>
          ${Object.entries(ACC.users()).filter(([id]) => id !== ACC.sess.uid).map(([id, u]) => `<div class="kv"><span><b>${esc(u.name)}</b> · ${esc(ROLE_L[u.role])}${u.active === false ? ' · disattivato' : ''}</span><button class="btn sm" data-act="ureset" data-id="${id}">Reimposta</button></div>`).join('') || '<div class="small">Nessun altro account.</div>'}
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn danger" data-act="resetall">Reimposta tutte le password, Master compresi</button><button class="btn" data-act="unewm">+ Nuovo Master</button></div></section>
        <section class="box form"><h2>Solo per il tecnico</h2>
          <label class="kv"><span><b>Modalità manutenzione</b><br><small>Gli altri account non possono entrare finché è attiva</small></span><input type="checkbox" class="sw" data-maint="1"${S.cfg.maint ? ' checked' : ''}></label>
          <div class="kv"><span><b>Sincronizzazione</b><br><small>${st.linked ? `${st.pending} modifiche in attesa${st.error ? ' · errore ' + esc(st.error) : ''}` : 'Dropbox non collegato'}</small></span>${st.linked ? '<button class="btn sm" data-act="syncnow">Sincronizza</button>' : ''}</div>
          <div class="kv"><span><b>Copia di questo computer</b><br><small>Cancella i dati salvati qui e li riscarica da Dropbox (le modifiche non inviate si perdono)</small></span><button class="btn sm danger" data-act="wipelocal"${st.linked ? '' : ' disabled'}>Riscarica</button></div></section>
        <section class="box form"><h2>Chiavi e collegamenti</h2><div class="small">Codici dell'invio automatico WhatsApp (Meta). Si salvano in Dropbox e servono a tutti i computer per l'invio; li vede solo il Super Master.</div>${waSettingsHTML()}<div><button class="btn primary" data-act="savekeys">Salva le chiavi</button></div></section></div></div></div>`;
  }
  function exportLog() {
    const ev = STORE.list('/registro/').flatMap(([, d]) => (d.ev || []).map(e => Object.assign({ dev: d.dev }, e))).sort((a, b) => a.at.localeCompare(b.at));
    const st = STORE.status(); const blob = new Blob([JSON.stringify({ at: new Date().toISOString(), version: VERSION, device: STORE.device, status: st, users: Object.values(ACC.users()).map(u => ({ name: u.name, role: u.role, active: u.active !== false })), ev }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `registro-viaggi-${todayISO()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function resetAllModal() {
    UI.modal = { kind: 'resetall' };
    openModal('Reimposta tutte le password', `<div class="warnbox">Tutti gli account (Master compresi, escluso il tuo) dovranno entrare con la password provvisoria qui sotto e sceglierne subito una nuova.</div>
      <div class="field"><label for="ra-p">Password provvisoria per tutti</label><input id="ra-p" value="${esc(tempPw())}"></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn danger" data-act="doresetall">Reimposta tutte</button>`);
  }
  async function doResetAll() {
    const pw = ($('#ra-p').value || '').trim(); if (pw.length < 8) return toast('Almeno 8 caratteri');
    const ids = Object.keys(ACC.users()).filter(id => id !== ACC.sess.uid);
    for (const id of ids) await ACC.setPw(id, pw, true);
    ACC.tlog('avviso', `Reimpostate tutte le password (${ids.length} account)`); closeModal(); render(); toast(`Reimpostate ${ids.length} password`);
  }

  // ---------- diagnostica completa: uno zip con tutto quello che serve per capire un guasto ----------
  async function diagExport() {
    const days = +(($('#dg-days') || {}).value || 7); const all = !!($('#dg-all') || {}).checked;
    const to = dayISO(new Date()); const from = dayISO(new Date(Date.now() - (days - 1) * 864e5));
    const btn = $('[data-act=diagexport]'); if (btn) { btn.disabled = true; btn.textContent = 'Preparo il file…'; }
    DIAG.ev('diagnostica', `Il Super Master scarica la diagnostica (${days} giorni${all ? ', tutti i computer' : ''})`);
    try {
      const mine = await DIAG.read(from, to);
      const byDev = { [STORE.device.id]: mine.map(r => Object.assign({ c: STORE.device.id }, r)) };
      let remErr = '';
      if (all) {
        const R = await DIAG.remote(from, to, STORE.device.id); remErr = R.err || '';
        R.files.forEach(f => { const arr = byDev[f.dev] = byDev[f.dev] || []; f.text.split('\n').forEach(l => { if (!l.trim()) return; try { arr.push(JSON.parse(l)); } catch (e) { /* riga rovinata */ } }); if (f.err) remErr += ` ${f.name}: ${f.err}`; });
      }
      const devNames = {}; Object.keys(byDev).forEach(d => { const rev = byDev[d].slice().reverse(); const a = rev.find(r => r.k === 'accesso' && r.u) || rev.find(r => r.u); devNames[d] = a ? `${a.u}${a.ag ? ' · ' + agName(a.ag) : ''}` : ''; });
      const allEv = Object.values(byDev).flat().sort((a, b) => a.t.localeCompare(b.t) || (a.n - b.n));
      const reg = STORE.list('/registro/').filter(([p]) => !p.startsWith('/registro/dispositivi/')).flatMap(([, d]) => (d.ev || []).map(e => Object.assign({ dev: d.dev }, e))).filter(e => { const dd = dayISO(new Date(e.at)); return dd >= from && dd <= to; }).sort((a, b) => a.at.localeCompare(b.at));
      const hm2 = iso => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`; };
      const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
      const KL = { avvio: 'Avvio', accesso: 'Accesso', pagina: 'Pagina aperta', azione: 'Pulsante', campo: 'Campo modificato', modulo: 'Modulo', trascina: 'Trascinamento', finestra: 'Finestra', avviso: 'Messaggio mostrato', salva: 'Salvataggio', sync: 'Sincronizzazione', 'sync-unione': 'Unione con altro computer', 'sync-conflitto': 'Conflitto risolto', 'sync-errore': 'ERRORE sincronizzazione', rete: 'Rete', 'rete-errore': 'ERRORE rete', 'rete-lenta': 'Rete lenta', errore: 'ERRORE programma', 'console-error': 'ERRORE console', 'console-warn': 'Avviso console', lento: 'Rallentamento', stato: 'Stato', diagnostica: 'Diagnostica', 'registro-info': 'Registro', 'registro-avviso': 'Registro · avviso', 'registro-errore': 'ERRORE registro' };
      const isErr = r => /errore/.test(r.k);
      const csv = '﻿' + [['Data', 'Ora', 'Computer', 'Chi c\'era', 'Sessione', 'N.', 'Utente', 'Agenzia', 'Pagina', 'Tipo', 'Cosa è successo', 'Dettagli'].map(q).join(';')]
        .concat(allEv.map(r => [fmtDate(r.d), hm2(r.t), r.c, devNames[r.c] || '', r.s, r.n, r.u || '', r.ag ? agName(r.ag) : '', r.v || '', KL[r.k] || r.k, r.m, r.x ? JSON.stringify(r.x) : ''].map(q).join(';'))).join('\r\n');
      const errs = allEv.filter(isErr);
      const cnt = {}; allEv.forEach(r => { cnt[r.k] = (cnt[r.k] || 0) + 1; });
      const st = STORE.status(); const n = navigator;
      let est = {}; try { est = n.storage && n.storage.estimate ? await n.storage.estimate() : {}; } catch (e) { est = {}; }
      const users = Object.values(ACC.users()).map(u => `  - ${u.name} · ${ROLE_L[u.role]}${u.active === false ? ' · DISATTIVATO' : ''}${u.mustChange ? ' · deve cambiare password' : ''} · agenzie: ${(u.agencies || []).length ? u.agencies.map(agName).join(', ') : 'tutte'}${u.sigla ? ' · sigla ' + u.sigla : ''}${u.pwAt ? ' · password del ' + fmtDate(dayISO(new Date(u.pwAt))) : ''}`).join('\n');
      const sizes = STORE.sizes(); const wc = waCfg();
      const lines = [
        'VIAGGI IN PULLMAN · LA TERRA — DIAGNOSTICA', '='.repeat(44), '',
        `Creato il ${fmtDate(to)} alle ${hm2(new Date().toISOString())} da ${ACC.me().name} su questo computer (${STORE.device.id})`,
        `Periodo: dal ${fmtDate(from)} al ${fmtDate(to)} (${days} giorni)`,
        `Versione dell'app: ${VERSION}`, `Indirizzo: ${location.origin + location.pathname}`, '',
        'COMPUTER NEL FILE', ...Object.keys(byDev).map(d => `  - ${d}${d === STORE.device.id ? ' (questo)' : ''}: ${byDev[d].length} eventi${devNames[d] ? ' · ultimo utente ' + devNames[d] : ''}`),
        all ? (remErr ? `  ! Altri computer: ${remErr}` : '  (gli altri computer copiano la loro diagnostica su Dropbox ogni 10 minuti)') : '  (solo questo computer: non è stata spuntata la casella «tutti i computer»)', '',
        'RIEPILOGO', `  Eventi: ${allEv.length} · errori: ${errs.length}`, ...Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `    ${(KL[k] || k).padEnd(28)} ${v}`), '',
        'ULTIMI ERRORI (i più recenti in alto)', ...(errs.slice(-40).reverse().map(r => `  ${fmtDate(r.d)} ${hm2(r.t)} · ${r.c} · ${r.u || '-'} · ${r.m}`)), errs.length ? '' : '  Nessun errore nel periodo.', '',
        'QUESTO COMPUTER', `  Browser: ${n.userAgent}`, `  Schermo: ${screen.width}x${screen.height} · finestra ${innerWidth}x${innerHeight} · app installata: ${matchMedia('(display-mode: standalone)').matches ? 'sì' : 'no'}`,
        `  Internet: ${n.onLine ? 'sì' : 'no'} · spazio usato ${Math.round((est.usage || 0) / 1048576)} MB su ${Math.round((est.quota || 0) / 1048576)} MB`, '',
        'SINCRONIZZAZIONE', `  Dropbox: ${st.hasKey ? (st.linked ? 'collegato' : 'NON collegato') : 'chiave mancante in config.js'} · primo scaricamento fatto: ${st.pulled ? 'sì' : 'NO'} · segnalibro Dropbox: ${STORE.cursor() ? 'sì' : 'no'}`,
        `  Ultima sincronizzazione: ${st.last ? st.last.toLocaleString('it-IT') : '—'} · errore attuale: ${st.error || 'nessuno'} · modifiche in attesa: ${st.pending}`,
        ...STORE.pendingList().slice(0, 50).map(p => `    in attesa: ${p}`), '',
        'ARCHIVIO DI QUESTO COMPUTER (cartella · file · dimensione · file mai arrivati su Dropbox)', ...Object.entries(sizes).sort().map(([k, v]) => `  ${k.padEnd(14)} ${String(v.file).padStart(5)} file · ${String(v.KB).padStart(6)} KB${v.senzaRev ? ' · ' + v.senzaRev + ' mai inviati' : ''}`), '',
        `DATI: ${S.trips.length} viaggi · ${Object.keys(S.clients.clienti || {}).length} clienti in anagrafica · ${allMovs().length} movimenti di cassa · agenzie: ${S.cfg.agenzie.map(a => a.nome).join(', ')}`,
        `WhatsApp automatico: ${waReady(wc) ? 'attivo' : 'non configurato'} · telefono agenzia: ${S.cfg.telAgenzia ? 'sì' : 'no'} · manutenzione: ${S.cfg.maint ? 'ATTIVA' : 'no'}`, '',
        'ACCOUNT', users, '',
        'Nel file non ci sono password, chiavi di Dropbox o di WhatsApp, né il contenuto dei campi scritti dagli operatori.'
      ];
      const readme = `COME SI LEGGE QUESTO FILE\n=========================\n\n1. riepilogo.txt: versione, computer, stato della sincronizzazione, ultimi errori, account.\n2. eventi.csv: tutti gli eventi in ordine di tempo, di tutti i computer. Si apre con Excel\n   (doppio clic). Usa i filtri sulla colonna «Tipo»: le righe con ERRORE sono i guasti.\n3. registro.csv: il registro tecnico (accessi, incassi, chiusure, password) che vedi anche nella pagina Super Master.\n4. computer/<codice>.jsonl: gli eventi grezzi di ogni computer, una riga per evento (per l'analisi tecnica).\n\nTipi di evento: ${Object.entries(KL).map(([k, v]) => `${v} (${k})`).join(', ')}.\n\nPer capire un guasto: cerca in eventi.csv l'ora in cui è successo e guarda le righe prima e dopo\n(cosa ha premuto l'operatore, quale pagina era aperta, se internet c'era, cosa ha risposto Dropbox).\n`;
      const regCsv = '﻿' + [['Data', 'Ora', 'Computer', 'Livello', 'Utente', 'Agenzia', 'Messaggio'].map(q).join(';')].concat(reg.map(e => [fmtDate(dayISO(new Date(e.at))), hm2(e.at), e.dev, e.lv, e.who || '', e.ag ? agName(e.ag) : '', e.m].map(q).join(';'))).join('\r\n');
      const zip = new window.JSZip();
      zip.file('LEGGIMI.txt', readme); zip.file('riepilogo.txt', lines.join('\r\n')); zip.file('eventi.csv', csv); zip.file('registro.csv', regCsv);
      Object.entries(byDev).forEach(([d, arr]) => zip.file(`computer/${d}.jsonl`, arr.sort((a, b) => a.t.localeCompare(b.t) || a.n - b.n).map(r => JSON.stringify(r)).join('\n') + '\n'));
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `diagnostica-viaggi-${to}.zip`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast(`Diagnostica pronta: ${allEv.length} eventi da ${Object.keys(byDev).length} ${Object.keys(byDev).length === 1 ? 'computer' : 'computer'}${errs.length ? ` · ${errs.length} errori` : ''}`);
    } catch (e) { DIAG.ev('errore', 'Diagnostica non riuscita: ' + (e.message || e.code), { stack: e.stack }); toast('Non sono riuscito a preparare la diagnostica: ' + (e.message || e.code || 'errore')); }
    finally { if (btn) { btn.disabled = false; btn.textContent = 'Scarica la diagnostica completa'; } }
  }
  function diagBox() {
    const r = DIAG.ring; const today = dayISO(new Date()); const errs = r.filter(x => /errore/.test(x.k));
    return `<section class="box form diag"><h2>Diagnostica completa</h2>
      <div class="small">Ogni computer annota tutto quello che succede nell'app (pagine, pulsanti, salvataggi, sincronizzazione, errori, rete, rallentamenti) e lo copia su Dropbox ogni 10 minuti. Non annota password né il testo scritto nei campi.</div>
      <div class="kv"><span>Su questo computer da quando è aperta l'app</span><b>${r.length >= 400 ? 'oltre 400' : r.length} eventi · ${errs.length} errori</b></div>
      ${errs.slice(-3).reverse().map(x => `<div class="kv"><span class="small">${esc(hm(x.t))} · ${esc(x.m)}</span></div>`).join('')}
      <div class="dg-row"><label>Periodo<select id="dg-days"><option value="1">Oggi</option><option value="3">Ultimi 3 giorni</option><option value="7" selected>Ultimi 7 giorni</option><option value="14">Ultimi 14 giorni</option><option value="21">Ultimi 21 giorni</option></select></label>
        <label class="chk"><input type="checkbox" id="dg-all"${STORE.status().linked ? ' checked' : ' disabled'}> Anche gli altri computer</label></div>
      <div><button class="btn primary" data-act="diagexport">Scarica la diagnostica completa</button></div>
      <div class="small">Si scarica uno zip: dentro c'è «eventi.csv» da aprire con Excel e «riepilogo.txt» con lo stato dell'app. Giorno di oggi: ${esc(fmtDate(today))}.</div></section>`;
  }

  // ---------- render ----------
  const FOCUS_KEYS = ['hq', 'aq', 'r', 'ar', 'nr', 'f', 'q', 'qs', 'qt', 'tf', 'dep2', 'dep', 'k', 'bind', 'cl', 'cfgag', 'cfgl', 'pf', 'pl', 'pff', 'pfm', 'usig'];
  const ACT_PERM = { unew: 'users', unewm: 'tech', ureset: 'users', usave: 'users', resetall: 'tech', doresetall: 'tech', savekeys: 'tech', wipelocal: 'tech', lgf: 'tech', lexport: 'tech', diagexport: 'tech', lnew: 'settings', ldel: 'settings', savewa: 'settings', savetel: 'settings', export: 'settings', pay: 'cassa', paypanel: 'viaggi', pfsave: 'cassa', cashmov: 'cassa', cashsave: 'cassa', storno: 'cassa', cclose: 'cassa', ccsave: 'cassa', clnew: 'anag', cldel: 'anag', impgo: 'anag', newtrip: 'viaggi', deltrip: 'viaggi' };
  const VIEW_PERM = { home: 'viaggi', models: 'viaggi', trip: 'viaggi', anag: 'anag', conta: 'conta', super: 'tech' };
  let lastNav = '', lastSess = '';
  function render() {
    const t0 = performance.now();
    try { renderIn(); } catch (e) { DIAG.ev('errore', 'Errore nel disegnare la pagina: ' + e.message, { stack: e.stack, vista: UI.view, sezione: UI.sec }); throw e; }
    const ms = performance.now() - t0;
    const sk = ACC.sess ? `${ACC.sess.uid}|${ACC.sess.ag || ''}` : '';
    if (sk !== lastSess) { const me = ACC.me(); DIAG.ev('accesso', sk ? `Dentro come ${me ? me.name + ' (' + ROLE_L[me.role] + ')' : '?'}${ACC.sess.ag ? ' · ' + agName(ACC.sess.ag) : ''}` : 'Nessuno collegato (schermata di accesso)'); lastSess = sk; }
    const nk = gateStep() ? 'accesso:' + gateStep() : `${UI.view}|${UI.tripId || ''}|${UI.sec || ''}|${UI.ssec || ''}|${UI.ctab || ''}`;
    if (nk !== lastNav) { const t = UI.view === 'trip' && trip(); DIAG.ev('pagina', gateStep() ? 'Schermata ' + gateStep() : `${UI.view}${t ? ' · ' + t.nome + ' (' + t.data + ')' : ''}${UI.view === 'trip' ? ' · ' + (UI.sec || 'lista') : ''}`, { ms: Math.round(ms) }); lastNav = nk; }
    else if (ms > 250) DIAG.ev('lento', `Pagina ridisegnata in ${Math.round(ms)} ms`, { vista: UI.view });
  }
  function renderIn() {
    acClose();
    const step = gateStep();
    if (step) {
      document.body.classList.add('gated');
      const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest('#app');
      $('#app').innerHTML = gateView(step);
      const f = $('#app form input:not([type=checkbox])'); if (f && !hadFocus) setTimeout(() => f.focus(), 30);
      return;
    }
    document.body.classList.remove('gated');
    if (VIEW_PERM[UI.view] && !ACC.can(VIEW_PERM[UI.view])) UI.view = ACC.can('viaggi') ? 'home' : 'conta';
    if (UI.view === 'cassa' && !(ACC.can('cassa') || ACC.can('cassaAll'))) UI.view = 'home';
    const ae = document.activeElement; let fsel = null, fpos = null;
    if (ae && ae.dataset && FOCUS_KEYS.some(k => ae.dataset[k] !== undefined && k !== 'f' && k !== 'k')) {
      fsel = FOCUS_KEYS.filter(k => ae.dataset[k] !== undefined).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${CSS.escape(ae.dataset[k])}"]`).join('');
      try { fpos = ae.selectionStart; } catch (e) { fpos = null; }
    }
    const keep = ['#bklist', '.mapwrap', '.wtw', '.ldock .mapwrap', '.pp-b'].map(s => { const el = $(s); return el ? [s, el.scrollTop, el.scrollLeft] : null; }).filter(Boolean);
    const y = window.scrollY;
    const V = { home: homeView, models: modelsView, trip: tripView, anag: anagView, cassa: cassaView, conta: contaView, settings: settingsView, super: superView };
    const view = (V[UI.view] || homeView)();
    $('#app').innerHTML = topbar() + `<main class="wrap v-${esc(UI.view)}${UI.view === 'trip' && UI.sec !== 'posti' ? ' wide' : ''}">${view}</main>`;
    keep.forEach(([s, top, left]) => { const el = $(s); if (el) { el.scrollTop = top; el.scrollLeft = left; } });
    window.scrollTo(0, y);
    if (fsel) { const el = $(fsel); if (el) { el.focus({ preventScroll: true }); try { if (fpos != null) el.selectionStart = el.selectionEnd = fpos; } catch (e) { /* campo data */ } } }
  }
  function commit() { save(); render(); }
  let toastT;
  function toast(msg) { DIAG.ev('avviso', msg); const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3600); }
  const ddmm = () => fmtDate(todayISO()).slice(0, 5);

  // ---------- menu delle righe ----------
  function rowMenu(id, el) {
    const t = trip(); const D = deriveBookings(t); const bk = D.find(x => x.persone.some(p => p.id === id)); const r = rowById(t, id);
    const head = bk && bk.id === id;
    openPop(el, `<div class="ph"><b>Riga ${t.rows.indexOf(r) + 1}</b><span>${bk ? `${esc(bkName(bk))} x ${bk.persone.length}` : 'riga vuota'}</span></div>
      <button data-act="rowins" data-id="${id}" data-d="0">Inserisci una riga sopra</button>
      <button data-act="rowins" data-id="${id}" data-d="1">Inserisci una riga sotto</button>
      ${bk ? `<button data-act="selbk" data-id="${bk.id}">Mostra sulla piantina</button>
      ${head && ACC.can('cassa') ? `<button data-act="pay" data-id="${bk.id}">${ICON.euro} Incasso e documento (scontrino, fattura…)</button>` : ''}
      ${head ? `<button data-act="abituale" data-id="${bk.id}">${bk.head.abituale ? '✓ ' : ''}Cliente abituale (precedenza nelle prime file)</button>
      <button data-act="saldato" data-id="${bk.id}">${bk.head.saldato ? '✓ ' : ''}Segna come saldato (anche se il prezzo è diverso)</button>` : ''}
      <button data-act="toatt" data-id="${bk.id}">Sposta tutta la prenotazione in lista d'attesa</button>
      <button data-act="toann" data-id="${bk.id}" data-k="da">Non parte più – da rimborsare</button>
      <button data-act="toann" data-id="${bk.id}" data-k="fatto">Non parte più – già rimborsato</button>
      <button data-act="toann" data-id="${bk.id}" data-k="no">Non parte più – senza rimborso</button>` : ''}
      <button class="danger" data-act="rowdel" data-id="${id}">Elimina questa riga</button>`);
  }
  function attMenu(id, el) {
    openPop(el, `<div class="ph"><b>Lista d'attesa</b><span>Quando si libera il posto</span></div>
      <button data-act="attconf" data-id="${id}">Conferma: passa nella lista partecipanti</button>
      <button class="danger" data-act="attdel" data-id="${id}">Elimina questa riga</button>`);
  }
  function annMenu(id, el) {
    const r = trip().annullati.find(x => x.id === id); if (!r) return;
    openPop(el, `<div class="ph"><b>${esc(r.cognome || 'Riga')}</b><span>non parte più</span></div>
      ${r.stato !== 'da' ? `<button data-act="annmove" data-id="${id}" data-k="da">Sposta in «da rimborsare»</button>` : ''}
      ${r.stato !== 'fatto' ? `<button data-act="annmove" data-id="${id}" data-k="fatto">Sposta in «già rimborsati»</button>` : ''}
      ${r.stato !== 'no' ? `<button data-act="annmove" data-id="${id}" data-k="no">Sposta in «senza rimborso»</button>` : ''}
      <button data-act="annrest" data-id="${id}">Riparte: rimetti nella lista partecipanti</button>
      <button class="danger" data-act="anndel" data-id="${id}">Elimina questa riga</button>`);
  }
  function seatMenu(s, el) {
    const t = trip(), b = bus(); const a = b.seats[s]; const bk = bkById(b, a.b); const p = bk.persone.find(x => x.id === a.pid);
    openPop(el, `<div class="ph"><b>${esc(p.cognome)} ${esc(p.nome)}</b><span>Posto ${s} · ${esc(bkName(bk))} x ${bk.full ? bk.full.persone.length : bk.persone.length}${p.tel ? ' · ' + esc(p.tel) : ''}</span></div>
      <button data-act="mv" data-s="${s}">Sposta o scambia con un altro posto</button>
      <button data-act="selbk" data-id="${bk.id}">Seleziona tutta la prenotazione</button>
      <div class="npin"><input id="np-in" placeholder="Nota sul posto (es. no lattosio)" value="${esc(p.np || '')}" data-s="${s}" maxlength="40"><button class="btn sm" data-act="savenp" data-s="${s}">OK</button></div>
      <button data-act="freeseat" data-s="${s}">Togli dal posto (resta su questo bus)</button>
      <button data-act="unbus" data-s="${s}">Togli dal bus</button>
      <button class="danger" data-act="freebk" data-id="${bk.id}">Togli tutta la prenotazione dal bus</button>`);
  }
  const insertAt = t => { let i = t.rows.length; while (i > 0 && isEmptyRow(t.rows[i - 1])) i--; return i; };
  function moveBookingOut(t, bkId) {
    const D = deriveBookings(t); const bk = D.find(x => x.id === bkId); if (!bk) return null;
    const ids = new Set(bk.persone.map(p => p.id)); bk.persone.forEach(p => { unseatRow(t, p.row); delete p.row.bus; });
    const rows = t.rows.filter(r => ids.has(r.id)); t.rows = t.rows.filter(r => !ids.has(r.id));
    return { bk, rows };
  }

  // ---------- importazione ----------
  function importModal(mode) {
    UI.modal = { kind: 'import', parsed: null, mode: mode || 'trip' };
    const t = mode === 'new' ? null : trip(); const has = t && t.rows.some(r => !isEmptyRow(r));
    openModal(mode === 'new' ? 'Nuova gita dalla lista Word' : 'Importa la lista Word', `
      <div class="infobox">Carica la lista in formato <b>.docx</b> com'è in ufficio: leggo i prezzi in testa, le partenze, la tabella dei partecipanti riga per riga, la lista d'attesa e i «non partono più». I file .doc vecchio formato vanno prima salvati come .docx (in Word: File › Salva con nome › Documento Word). In alternativa copia la tabella in Word e incollala qui sotto.</div>
      <label class="dropzone" id="dropzone" for="imp-file">Trascina qui il file .docx oppure <u>sceglilo dal computer</u><input id="imp-file" type="file" accept=".docx" hidden></label>
      <div class="field"><label for="imp-text">…oppure incolla qui la tabella copiata da Word</label><textarea id="imp-text" style="min-height:70px"></textarea></div>
      <div id="imp-res"></div>`,
      `${has ? '<label class="small" style="margin-right:auto;display:flex;gap:6px;align-items:center"><input type="checkbox" id="imp-replace" checked> Sostituisci la lista attuale (i posti sul bus si azzerano)</label>' : ''}<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="doimport" id="imp-go" disabled>Importa</button>`, true);
  }
  function showParsed(res) {
    UI.modal.parsed = res; const P = res.part;
    const pers = P.bookings.reduce((n, g) => n + g.persone.length, 0);
    $('#imp-res').innerHTML = `
      ${res.titolo || res.data ? `<div class="field"><label>Gita</label><div><b>${esc(res.titolo || '—')}</b>${res.data ? ` · ${esc(fmtTripDate(res))}` : ''}</div></div>` : ''}
      <div class="field"><label>Ho trovato ${P.raw.length} righe: ${P.bookings.length} prenotazioni, ${pers} persone · ${res.attesa.length} in lista d'attesa · ${res.annullati.length} righe «non partono più»</label></div>
      ${P.warn.length ? `<div class="warnbox"><b>Da controllare:</b><ul>${P.warn.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
      <div class="preview-list">${P.bookings.map(g => `<div><b>${esc(g.persone[0].cognome)} x ${g.n}</b> ${g.persone[0].part ? `<span class="code">${esc(g.persone[0].part)}</span>` : ''} — ${esc(g.persone.map(p => `${p.cognome} ${p.nome}`).join(', '))}${(() => { const rs = reqSummary(g); return rs.text ? ` <span class="pill ${rs.paid ? 'warn' : 'tbd'}">${esc(rs.text)}</span>` : ''; })()}</div>`).join('')}</div>`;
    $('#imp-go').disabled = !P.raw.length;
    $('#imp-go').textContent = UI.modal.mode === 'new' ? 'Crea la gita' : `Importa ${P.raw.length} righe`;
  }
  async function readImportFile(f) {
    if (/\.doc$/i.test(f.name)) { $('#imp-res').innerHTML = '<div class="warnbox">Questo è un file .doc del vecchio formato: aprilo in Word e salvalo come .docx.</div>'; return; }
    try { showParsed(await parseTripDocx(f)); } catch (err) { $('#imp-res').innerHTML = `<div class="warnbox">${esc(err.message)}</div>`; }
  }
  const pickRow = r => { const o = blankRow(); ROWF.forEach(f => { o[f] = String(r[f] || '').trim(); }); return o; };
  function applyImport(t, res, replace) {
    tripInit(t);
    if (replace) { t.rows = []; t.attesa = []; t.annullati = []; t.buses.forEach(b => { b.seats = {}; }); }
    const Q = res.quota || {}; Object.keys(Q).forEach(k => { if (k === 'suppl') Object.keys(Q.suppl).forEach(f => { if (Q.suppl[f] != null) t.quota.suppl[f] = Q.suppl[f]; }); else if (Q[k] != null && Q[k] !== '') t.quota[k] = Q[k]; });
    if ((res.partenze || []).length && (replace || !t.partenze.length)) t.partenze = res.partenze.slice(0, 3);
    (res.note || []).forEach((n, i) => { const k = i === 0 ? 'note1' : 'note2'; if (replace || !t[k]) t[k] = n; });
    const at = insertAt(t); t.rows.splice(at, 0, ...res.part.raw.map(pickRow));
    let ai = t.attesa.length; while (ai > 0 && isEmptyRow(t.attesa[ai - 1])) ai--;
    t.attesa.splice(ai, 0, ...(res.attesa || []).map(r => ({ ...blankAtt(), ...r })));
    (res.annullati || []).forEach(r => t.annullati.push({ ...pickRow(r), dataAnn: r.dataAnn || '', stato: r.stato }));
    if (res.part.guida) { t.guida = true; t.buses.forEach(b => { b.guida = true; }); }
    t.rows.forEach(r => upsertFromRow(r));
  }

  // ---------- azioni sulla piantina ----------
  function afterFamily(r, t, b, id) {
    if (!r.ok) return toast(r.msg || 'Non riesco a mettere qui la prenotazione');
    const bb = bkById(b, id); const I = LMAP[b.layout].info; const ss = seatsOf(b, id);
    const rows = new Set(ss.map(x => I.geo[x].floor * 1000 + I.geo[x].row)); const st = prefStatus(b, bb); const left = unplaced(b, bb).length;
    toast(`${bkName(bb)} x ${bb.persone.length}: ${ss.length > 1 ? 'posti' : 'posto'} ${fmtSeats(ss)}${left ? ` — ${left} senza posto: non ci sono abbastanza posti liberi` : ''}${st === 'ko' ? ` — attenzione: aveva chiesto ${reqSummary(bb).text}` : ''}${ss.length > 1 && rows.size > Math.ceil(ss.length / 2) ? ' — attenzione: non c\'erano abbastanza posti vicini' : ''}`);
  }
  function onSeat(s, el) {
    const t = trip(), b = bus(); if (!b) return; const a = b.seats[s];
    closePop();
    if (a && a.res && UI.move == null) return openPop(el, `<div class="ph"><b>Posto ${s}</b><span>${esc(a.res)}</span></div><button data-act="unreserve" data-s="${s}">Togli la riserva</button>`);
    if (UI.move != null) { const from = UI.move; UI.move = null; moveSeat(b, from, s); toast(a ? `Scambiati i posti ${from} e ${s}` : `Spostato dal ${from} al ${s}`); return commit(); }
    if (UI.sel) { if (a && a.b === UI.sel) return seatMenu(s, el); const id = UI.sel; const r = dropFamily(t, id, b, s); if (r.ok) UI.sel = null; afterFamily(r, t, b, id); return commit(); }
    if (UI.selP) { const r = dropPerson(t, UI.selP, b, s); if (!r.ok) return toast(r.msg); UI.selP = null; toast(r.swap ? 'Posti scambiati' : `Messo al posto ${s}`); return commit(); }
    if (a) seatMenu(s, el);
    else openPop(el, `<div class="ph"><b>Posto ${s} libero</b><span>Trascina qui una prenotazione o una persona dalla lista</span></div><button data-act="reserve" data-s="${s}">Riserva per guida / 2° autista</button>`);
  }
  function fillBus(t, b) {
    let D = syncAll(t); const st = busStats(b); let room = st.cap - st.tot; const moved = []; let left = 0;
    D.filter(bk => bk.persone.every(p => !p.row.bus)).forEach(bk => { if (bk.persone.length <= room) { moved.push(bk.id); room -= bk.persone.length; } else left++; });
    if (moved.length) toBusAuto(t, moved, b);
    syncAll(t); const r = autoAssign(b); syncAll(t);
    const ko = b.bookings.filter(bk => prefStatus(b, bk) === 'ko');
    toast(`${moved.length ? `${moved.length} prenotazioni messe su ${b.label}. ` : ''}Posti sistemati${left ? ` · ${left} prenotazioni non entrano: aggiungi un bus` : ''}${ko.length ? ` · richieste non rispettate: ${ko.map(bkName).join(', ')}` : ' · richieste rispettate'}${r.skipped.length ? ` · non c'è spazio per ${r.skipped.map(bkName).join(', ')}` : ''}`);
  }
  function exportData() {
    flush();
    const o = { app: 'viaggi-in-pullman', ver: VERSION, at: new Date().toISOString(), trips: S.trips.map(persistForm), cfg: S.cfg, clients: S.clients, movs: allMovs(), chiusure: STORE.list('/cassa/chiusure/').map(([, d]) => d) };
    const blob = new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `viaggi-in-pullman-${todayISO()}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000); ACC.tlog('info', 'Scaricata una copia di sicurezza');
  }
  // recupera una copia: anche quella della versione di prova «OnBoard» (un file con tutti i viaggi)
  function importBackup(o) {
    if (!o || !Array.isArray(o.trips)) throw new Error('copia');
    let add = 0, into = 0, skip = 0;
    o.trips.forEach(src => {
      if (!src || !src.id || src.deleted) return;
      if (src.demo) { skip++; return; }
      const t = tripInit(JSON.parse(JSON.stringify(src))); delete t.u; delete t.gone; LISTS.forEach(k => t[k].forEach(x => { delete x.u; }));
      const target = src.seedId ? S.trips.find(x => x.seedId === src.seedId || x.id === seedTripId(src.seedId)) : S.trips.find(x => x.id === src.id);
      if (target) {
        const empty = !target.rows.some(r => !isEmptyRow(r)) && !target.buses.length;
        if (!empty) { skip++; return; }
        const keep = { id: target.id, seedId: target.seedId }; Object.keys(target).forEach(k => delete target[k]); Object.assign(target, t, keep); tripInit(target); into++;
      } else { S.trips.push(t); add++; }
    });
    if (o.clients && o.clients.clienti) Object.entries(o.clients.clienti).forEach(([id, c]) => { if (!S.clients.clienti[id]) S.clients.clienti[id] = c; });
    if (Array.isArray(o.movs) && o.movs.length) { const have = new Set(allMovs().map(m => m.id)); const nw = o.movs.filter(m => okMov(m) && !have.has(m.id)); if (nw.length) { const p = `/cassa/movimenti/importati/${todayISO()}_${STORE.device.id}.json`; const cur = STORE.get(p) || { movs: [] }; cur.movs = cur.movs.concat(nw); STORE.put(p, cur); } }
    S.trips.forEach(t => t.rows.forEach(r => upsertFromRow(r)));
    flush(); ACC.tlog('info', `Recuperata una copia: ${add} viaggi nuovi, ${into} liste dentro i viaggi dell'elenco, ${skip} saltati`);
    return { add, into, skip };
  }

  document.addEventListener('click', e => {
    const seatEl = e.target.closest('#mapwrap .seat[data-seat]');
    const el = e.target.closest('[data-act]');
    if (!e.target.closest('#pop') && !(el && ['rowmenu', 'attmenu', 'annmenu', 'memenu'].includes(el.dataset.act))) closePop();
    if (!e.target.closest('.acbox') && !e.target.closest('input.wc')) acClose();
    if (seatEl && !el) return onSeat(+seatEl.dataset.seat, seatEl);
    if (!el) return;
    const act = el.dataset.act; const t = trip(); const b = bus();
    if (ACT_PERM[act] && !ACC.can(ACT_PERM[act])) { closeModal(); toast('Questa funzione non è disponibile per il tuo account'); render(); return; }
    switch (act) {
      case 'nav': UI.pay = null; UI.view = el.dataset.v; if (el.dataset.ssec) UI.ssec = el.dataset.ssec; UI.sel = UI.selP = null; UI.move = null; closePop(); render(); window.scrollTo(0, 0); break;
      // accesso
      case 'gtap': GATE.taps++; if (GATE.taps >= 10) { GATE.taps = 0; GATE.step = 'tech'; GATE.msg = ''; render(); } break;
      case 'gback': GATE.step = null; GATE.msg = ''; GATE.taps = 0; render(); break;
      case 'glink': if (!window.VIPDBX || !VIPDBX.hasKey()) { toast('Manca la chiave Dropbox nel file config.js (vedi LEGGIMI)'); break; } localStorage.removeItem(LOCAL_MODE); VIPDBX.startLogin().catch(() => toast('Non riesco ad aprire Dropbox')); break;
      case 'glocal': try { localStorage.setItem(LOCAL_MODE, '1'); } catch (x) { /* niente */ } seedCatalog(); buildAnagrafica(); render(); break;
      case 'gpickag': { const a = S.cfg.agenzie.find(x => x.id === el.dataset.id); ACC.sess.ag = a.id; ACC.saveSess(); try { localStorage.setItem(LASTAG, a.id); } catch (x) { /* niente */ } ACC.tlog('info', `Lavora nell'agenzia di ${a.nome}`); render(); window.scrollTo(0, 0); break; }
      case 'changeag': closePop(); ACC.sess.ag = null; ACC.saveSess(); render(); break;
      case 'logout': closePop(); logout(); break;
      case 'memenu': { e.stopPropagation(); const me = ACC.me(); openPop(el, `<div class="ph"><b>${esc(me.name)}</b><span>${esc(ROLE_L[me.role])}${ACC.agency() ? ' · ' + esc(ACC.agency().nome) : ''}</span></div><button data-act="nav" data-v="settings" data-ssec="account">Il mio account e la password</button>${needsAgency(me) ? '<button data-act="changeag">Cambia agenzia</button>' : ''}<button class="danger" data-act="logout">${ICON.out} Esci</button>`); break; }
      // impostazioni
      case 'ssec': UI.ssec = el.dataset.v; render(); window.scrollTo(0, 0); break;
      case 'unew': userModal(null); break;
      case 'unewm': userModal(null); if ($('#nu-r')) $('#nu-r').value = 'master'; break;
      case 'ureset': userModal(el.dataset.id); break;
      case 'usave': userSave(); break;
      case 'resetall': resetAllModal(); break;
      case 'doresetall': doResetAll(); break;
      case 'lnew': S.cfg.luoghi = S.cfg.luoghi || []; S.cfg.luoghi.push({ code: '', citta: '', luogo: '', maps: '' }); save(); render(); { const ins = $$('[data-cfgl][data-k="code"]'); if (ins.length) ins[ins.length - 1].focus(); } break;
      case 'ldel': S.cfg.luoghi.splice(+el.dataset.i, 1); save(); render(); break;
      case 'savewa': S.cfg.waTemplate = $('#s-wa').value; save(); toast('Testo del messaggio salvato'); break;
      case 'savetel': S.cfg.telAgenzia = ($('#s-tel').value || '').trim(); save(); toast('Telefono salvato'); break;
      case 'syncnow': STORE.syncNow().then(() => { toast('Sincronizzato'); render(); }).catch(() => toast('Dropbox non risponde adesso: riprovo da solo')); break;
      case 'savekeys': waSettingsSave(); ACC.tlog('avviso', 'Chiavi WhatsApp aggiornate'); toast('Chiavi salvate'); render(); break;
      case 'lgf': UI.lgf = el.dataset.v; render(); break;
      case 'lexport': exportLog(); break;
      case 'diagexport': diagExport(); break;
      case 'wipelocal': confirmBox('Riscarica da Dropbox', 'Cancello la copia dei dati su questo computer e la riscarico da Dropbox. Le modifiche non ancora inviate si perdono.', 'Riscarica', () => { ACC.tlog('avviso', 'Copia locale cancellata e riscaricata'); setTimeout(() => STORE.wipe().then(() => location.reload()), 400); }); break;
      // anagrafica
      case 'clsel': UI.cl = el.dataset.id; render(); break;
      case 'clnew': { const id = 'c' + uid(); S.clients.clienti[id] = { cognome: '', nome: '', nascita: '', natoA: '', tel: '', email: '', indirizzo: '', part: '', pref: '', note: '', since: todayISO() }; UI.cl = id; UI.aq = ''; save(); render(); const f = $('[data-cl="cognome"]'); if (f) f.focus(); break; }
      case 'impgo': impGo(); break;
      case 'cldel': { const id = el.dataset.id; const x = S.clients.clienti[id]; confirmBox('Elimina cliente', `Tolgo ${esc(x.cognome)} ${esc(x.nome)} dall'anagrafica? Le liste dei viaggi non cambiano.`, 'Elimina', () => { delete S.clients.clienti[id]; UI.cl = null; save(); render(); }); break; }
      case 'acpick': acPick(el.dataset.id); break;
      // incassi e cassa
      case 'pay': case 'paypanel': closePop(); if (UI.pay && UI.pay.bkId === el.dataset.id && el.dataset.act === 'paypanel') payClose(); else payOpen(el.dataset.id); break;
      case 'pfclose': payClose(); break;
      case 'pfdoc': if (UI.pay) { UI.pay.f.doc = el.dataset.k; render(); } break;
      case 'pfmet': if (UI.pay) { UI.pay.f.met = el.dataset.k; if (el.dataset.k === 'misto' && !Object.keys(UI.pay.f.mix).length) UI.pay.f.mix = {}; render(); } break;
      case 'pfsave': if (UI.pay) paySave(); break;
      case 'cashmov': cashMovModal(el.dataset.k); break;
      case 'cashsave': cashMovSave(); break;
      case 'ctab': UI.ctab = el.dataset.v; render(); break;
      case 'gag': UI.gag = el.dataset.v; render(); break;
      case 'gday': UI.gday = el.dataset.v; render(); break;
      case 'gexport': { const g = giornoData(); exportCassa(g.movs, `cassa-${g.day}${g.ag !== 'tutte' ? '-' + (AGC[g.ag] || g.ag) : ''}.csv`); ACC.tlog('info', `Esportato il resoconto del ${fmtDate(g.day)}`); break; }
      case 'storno': storno(el.dataset.id); break;
      case 'cday': UI.cday = el.dataset.v; render(); break;
      case 'cag': UI.cag = el.dataset.v; render(); break;
      case 'cclose': closeModalCassa(); break;
      case 'ccsave': ccSave(); break;
      case 'ccprint': printCassa(UI.modal.day, UI.modal.ag); break;
      case 'cprint': printCassa(UI.cday || todayISO(), ACC.can('cassaAll') ? (UI.cag || 'tutte') : ACC.sess.ag); break;
      case 'cmon': UI.cmon = el.dataset.v; render(); break;
      case 'cexport': exportMonth(); break;
      case 'cprintm': printMonth(); break;
      case 'filter': UI.filter = el.dataset.v; render(); break;
      case 'year': UI.year = el.dataset.v; render(); window.scrollTo(0, 0); break;
      case 'hcat': UI.cat = el.dataset.v; render(); break;
      case 'hidepast': UI.hidePast = el.checked; render(); break;
      case 'opentrip': { UI.pay = null; UI.view = 'trip'; UI.tripId = el.dataset.id; const tt = trip(); UI.busId = tt && tt.buses[0] ? tt.buses[0].id : null; UI.sel = UI.selP = null; UI.sec = el.dataset.sec || 'lista'; render(); window.scrollTo(0, 0); break; }
      case 'openbus': UI.view = 'trip'; UI.tripId = el.dataset.trip; UI.busId = el.dataset.bus; UI.sel = UI.selP = null; UI.sec = 'posti'; render(); window.scrollTo(0, 0); break;
      case 'sec': UI.sec = el.dataset.v; UI.sel = UI.selP = null; UI.move = null; render(); window.scrollTo(0, 0); break;
      case 'tab': UI.busId = el.dataset.id; UI.move = null; render(); break;
      case 'dock': if (UI.pay) { UI.pay = null; UI.dock = true; } else UI.dock = !UI.dock; render(); break;
      case 'onlyfree': UI.onlyFree = el.checked; render(); break;
      case 'newtrip': tripModal(null); break;
      case 'edittrip': tripModal(t); break;
      case 'savetrip': {
        const v = { nome: $('#t-nome').value.trim(), data: $('#t-data').value, fine: $('#t-fine').value, programma: $('#t-prog').value.trim(), cat: $('#t-cat').value, code: $('#t-code').value.trim(), extra: $('#t-extra').checked };
        if (!v.nome) { toast('Scrivi il nome della gita'); $('#t-nome').focus(); break; }
        if (!v.data) { toast('Scegli la data di partenza'); break; }
        if (UI.modal.id) { Object.assign(S.trips.find(x => x.id === UI.modal.id), v); closeModal(); commit(); }
        else { const nt = tripInit({ id: uid(), ...v, buses: [] }); S.trips.push(nt); UI.tripId = nt.id; UI.view = 'trip'; UI.sec = 'lista'; UI.busId = null; closeModal(); commit(); toast(v.cat === 'biglietteria' ? 'Creata: scrivi i prezzi del biglietto e i clienti; il pulsante «€» registra l\'incasso' : 'Gita creata: scrivi la lista o importa il file Word, poi aggiungi il bus'); }
        break;
      }
      case 'deltrip': { const id = UI.modal.id; const tr = S.trips.find(x => x.id === id); confirmBox('Elimina viaggio', `Elimino «${esc(tr.nome)}» con la lista e i bus, su tutti i computer? Non si può annullare.`, 'Elimina', () => { ACC.tlog('avviso', `Eliminato il viaggio «${tr.nome}» (${fmtDate(tr.data)})`); deleteTrip(id); UI.view = 'home'; UI.tripId = null; commit(); }); break; }
      case 'addbus': busModal(el.dataset.trip); break;
      case 'picklayout': UI.modal.pick = el.dataset.id; $$('#pickgrid .model').forEach(m => m.classList.toggle('on', m.dataset.id === el.dataset.id)); break;
      case 'savebus': {
        const tr = S.trips.find(x => x.id === UI.modal.tripId);
        const nb = { id: uid(), label: $('#nb-label').value.trim() || `Bus ${tr.buses.length + 1}`, layout: UI.modal.pick, mezzo: $('#nb-mezzo').value.trim(), autista: $('#nb-autista').value.trim(), accompagnatore: $('#nb-acc').value.trim(), telAcc: '', note: '', partenze: [], seats: {}, guida: !!tr.guida };
        tr.buses.push(nb); UI.view = 'trip'; UI.tripId = tr.id; UI.busId = nb.id; closeModal(); commit(); toast(`${nb.label} aggiunto: trascina le prenotazioni sui posti`); break;
      }
      case 'changelayout': busModal(t.id, true); break;
      case 'savelayout': { const L = LMAP[UI.modal.pick]; const lost = Object.keys(b.seats).filter(s => !L.info.all.includes(+s)); lost.forEach(s => delete b.seats[s]); b.layout = UI.modal.pick; closeModal(); commit(); toast(lost.length ? `Piantina cambiata: ${lost.length} persone sono tornate senza posto` : 'Piantina cambiata'); break; }
      case 'delbus': confirmBox('Elimina bus', `Elimino «${esc(b.label)}»? Le persone restano nella lista, senza posto.`, 'Elimina', () => { t.rows.forEach(r => { if (r.bus === b.id) delete r.bus; }); t.buses = t.buses.filter(x => x.id !== b.id); UI.busId = t.buses[0] ? t.buses[0].id : null; commit(); }); break;
      case 'selbk': if (e.target.closest('[data-dragp], .kebab')) break; closePop(); UI.move = null; UI.selP = null; UI.sel = UI.sel === el.dataset.id ? null : el.dataset.id; { const SI = seatIndex(t); const D = deriveBookings(t); const bk = UI.sel && D.find(x => x.id === UI.sel); const on = bk && bk.persone.map(p => SI[p.id]).find(Boolean); if (on) UI.busId = on.b.id; } render(); break;
      case 'selp': e.stopPropagation(); UI.move = null; UI.sel = null; UI.selP = UI.selP === el.dataset.id ? null : el.dataset.id; { const x = UI.selP && seatIndex(t)[UI.selP]; if (x) UI.busId = x.b.id; } render(); break;
      case 'cancel': UI.sel = UI.selP = null; UI.move = null; render(); break;
      case 'mv': UI.move = +el.dataset.s; UI.sel = UI.selP = null; closePop(); render(); break;
      case 'savenp': { const a = b.seats[+el.dataset.s]; const r = a && rowById(t, a.pid); if (!r) { closePop(); break; } r.np = $('#np-in').value.trim(); closePop(); commit(); break; }
      case 'freeseat': delete b.seats[+el.dataset.s]; closePop(); commit(); break;
      case 'unbus': { const a = b.seats[+el.dataset.s]; const r = rowById(t, a.pid); unseatRow(t, r); delete r.bus; closePop(); commit(); break; }
      case 'freebk': { const D = deriveBookings(t); const bk = D.find(x => x.id === el.dataset.id); bk.persone.forEach(p => { if (p.row.bus === b.id) { unseatRow(t, p.row); delete p.row.bus; } }); closePop(); commit(); toast(`${bkName(bk)} tolta da ${b.label}`); break; }
      case 'reserve': b.seats[+el.dataset.s] = { res: 'Guida / 2° autista' }; closePop(); commit(); break;
      case 'unreserve': delete b.seats[+el.dataset.s]; closePop(); commit(); break;
      case 'fill': fillBus(t, b); commit(); break;
      case 'clearall': confirmBox('Libera tutti i posti', `Tolgo tutti i posti assegnati su «${esc(b.label)}»? Le persone restano su questo bus, senza posto.`, 'Libera', () => { b.seats = {}; commit(); }); break;
      case 'adddep': b.partenze = b.partenze || []; b.partenze.push({ code: '', luogo: '', ora: '' }); save(); $('#deps').innerHTML = depsHTML(b); break;
      case 'deldep': b.partenze.splice(+el.dataset.i, 1); save(); $('#deps').innerHTML = depsHTML(b); break;
      case 'openpdf': openPdf(el.dataset.id); break;
      case 'delpdf': { const tr = S.trips.find(x => x.id === el.dataset.id); confirmBox('Togli il programma', `Tolgo «${esc(tr.pdf.name)}» da questo viaggio?`, 'Togli', () => { if (tr.pdf.path) STORE.delBlob(tr.pdf.path).catch(() => {}); delete tr.pdf; commit(); }); break; }
      case 'printmap': openPrint('map'); break;
      case 'printcards': openPrint('cards'); break;
      case 'printlist': openPrint('list'); break;
      case 'rooming': openPrint('rooming'); break;
      case 'cartorder': UI.cartOrder = el.dataset.v; openPrint('cards'); break;
      case 'doprint': document.body.classList.add('printing'); setTimeout(() => window.print(), 50); break;
      case 'closeprint': closePrint(); break;
      // righe della lista
      case 'rowmenu': e.stopPropagation(); rowMenu(el.dataset.id, el); break;
      case 'rowins': { const i = t.rows.findIndex(r => r.id === el.dataset.id); t.rows.splice(i + (+el.dataset.d), 0, blankRow()); closePop(); commit(); const nr = t.rows[i + (+el.dataset.d)]; const inp = $(`[data-r="${nr.id}"][data-f="cognome"]`); if (inp) inp.focus(); break; }
      case 'rowdel': { const r = rowById(t, el.dataset.id); closePop(); const go = () => { unseatRow(t, r); t.rows = t.rows.filter(x => x !== r); commit(); }; if (isEmptyRow(r)) go(); else confirmBox('Elimina riga', `Elimino la riga di ${esc(r.cognome)} ${esc(r.nome)}?`, 'Elimina', go); break; }
      case 'abituale': case 'saldato': { const r = rowById(t, el.dataset.id); r[act] = !r[act]; closePop(); commit(); break; }
      case 'toatt': { const m = moveBookingOut(t, el.dataset.id); if (!m) break; const h = m.rows[0]; let ai = t.attesa.length; while (ai > 0 && isEmptyRow(t.attesa[ai - 1])) ai--; t.attesa.splice(ai, 0, { ...blankAtt(), cognome: /x\s*\d/i.test(h.cognome) ? h.cognome : `${h.cognome} x ${m.rows.length}`, nome: h.nome, nascita: h.nascita, tel: h.tel, part: h.part, note: h.note, richiesta: ddmm() }); closePop(); commit(); toast(`${bkName(m.bk)} spostata in lista d'attesa`); break; }
      case 'toann': { const m = moveBookingOut(t, el.dataset.id); if (!m) break; m.rows.forEach(r => t.annullati.push({ ...r, stato: el.dataset.k, dataAnn: ddmm() })); closePop(); commit(); toast(`${bkName(m.bk)}: non parte più`); break; }
      case 'attmenu': e.stopPropagation(); attMenu(el.dataset.id, el); break;
      case 'attconf': { const r = t.attesa.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } const m = RX.exec(String(r.cognome || '').trim()); const n = m ? +m[2] : 1; const base = m ? m[1].trim() : String(r.cognome || '').trim();
        const add = [{ ...blankRow(), cognome: r.cognome, nome: r.nome, nascita: r.nascita, tel: r.tel, part: r.part, note: r.note }]; for (let k = 1; k < n; k++) add.push({ ...blankRow(), cognome: base, part: r.part });
        t.rows.splice(insertAt(t), 0, ...add); t.attesa = t.attesa.filter(x => x !== r); closePop(); commit(); toast(`${base} x ${n} è nella lista partecipanti: completa i nomi`); break; }
      case 'attdel': t.attesa = t.attesa.filter(x => x.id !== el.dataset.id); closePop(); commit(); break;
      case 'annmenu': e.stopPropagation(); annMenu(el.dataset.id, el); break;
      case 'annmove': { const r = t.annullati.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } r.stato = el.dataset.k; closePop(); commit(); break; }
      case 'annrest': { const r = t.annullati.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } t.annullati = t.annullati.filter(x => x !== r); const o = { ...r }; delete o.stato; delete o.dataAnn; t.rows.splice(insertAt(t), 0, o); closePop(); commit(); break; }
      case 'anndel': t.annullati = t.annullati.filter(x => x.id !== el.dataset.id); closePop(); commit(); break;
      case 'annadd': t.annullati.push({ ...blankRow(), stato: el.dataset.k, dataAnn: '' }); commit(); break;
      // import
      case 'timport': importModal('trip'); break;
      case 'newfromdoc': importModal('new'); break;
      case 'doimport': {
        const res = UI.modal.parsed; if (!res) break;
        if (UI.modal.mode === 'new') {
          const nt = tripInit({ id: uid(), nome: res.titolo || 'Nuova gita', data: res.data || todayISO(), fine: res.fine || '', cat: res.fine && res.fine !== res.data ? 'tour' : 'gita', programma: '', buses: [] });
          applyImport(nt, res, true); S.trips.push(nt); UI.view = 'trip'; UI.tripId = nt.id; UI.sec = 'lista'; UI.busId = null; closeModal(); commit(); window.scrollTo(0, 0);
          toast(`Gita «${nt.nome}» creata: ora aggiungi il bus`); busModal(nt.id); break;
        }
        applyImport(t, res, $('#imp-replace') ? $('#imp-replace').checked : false); closeModal(); commit(); toast(`Lista importata: ${res.part.raw.length} righe`); break;
      }
      case 'settings': { const fromWa = UI.modal && UI.modal.kind === 'wa'; closeModal(); UI.view = 'settings'; UI.ssec = el.dataset.ssec || (fromWa ? 'whatsapp' : UI.ssec); } render(); window.scrollTo(0, 0); break;
      case 'insph': { const ta = $('#s-wa'); const p = `{${el.dataset.p}}`; const s0 = ta.selectionStart, s1 = ta.selectionEnd; ta.value = ta.value.slice(0, s0) + p + ta.value.slice(s1); ta.focus(); ta.selectionStart = ta.selectionEnd = s0 + p.length; break; }
      case 'resetwa': $('#s-wa').value = DEFAULT_WA; break;
      case 'wa': UI.waPrev = null; waModal(); break;
      case 'wasendall': { syncAll(t); const ids = b.bookings.filter(bk => ['ready', 'err'].includes(waState(t, b, bk).k)).map(bk => bk.id); if (!ids.length) break; confirmBox('Invia a tutti', `Mando il messaggio WhatsApp con video e programma a <b>${ids.length}</b> prenotazioni di ${esc(b.label)}?<br><span class="small">Costo indicativo: circa 0,025 € a messaggio.</span>`, `Invia a ${ids.length}`, () => waSend(ids)); break; }
      case 'wasendone': waSend([el.dataset.id]); break;
      case 'waok': { syncAll(t); const bk = bkById(b, el.dataset.id); if (bk && bk.full) { const h = bk.full.head; h.waOk = el.checked; const c = h.cid && S.clients.clienti[h.cid]; if (c) c.waOk = el.checked; save(); setTimeout(waRefresh, 0); } break; }
      case 'waokall': { syncAll(t); b.bookings.forEach(bk => { if (bk.full) { bk.full.head.waOk = true; const c = bk.full.head.cid && S.clients.clienti[bk.full.head.cid]; if (c) c.waOk = true; } }); save(); waRefresh(); toast('Consenso segnato per tutte le prenotazioni del bus'); break; }
      case 'wavideo': waVideoPreview(el.dataset.id); break;
      case 'waprevclose': if (UI.waPrev && UI.waPrev.url) URL.revokeObjectURL(UI.waPrev.url); UI.waPrev = null; waRefresh(); break;
      case 'wacopy': waCopy(el.dataset.k); break;
      case 'waprev': { syncAll(t); const bk = bkById(b, el.dataset.id); if (bk) postoPreview(t, b, bk); break; }
      case 'wasent': { syncAll(t); const bk = bkById(b, el.dataset.id); if (bk && bk.full) { const d = new Date(); bk.full.head.waSent = `${fmtDate(todayISO())} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; save(); setTimeout(() => { if (UI.modal && UI.modal.kind === 'wa') { const sc = $('.modal-b') ? $('.modal-b').scrollTop : 0; waModal(); if ($('.modal-b')) $('.modal-b').scrollTop = sc; } }, 300); } break; }
      case 'export': exportData(); break;
      case 'doconfirm': { const fn = pending; closeModal(); if (fn) fn(); break; }
      case 'close': closeModal(); break;
      case 'scrim': if (e.target === el) closeModal(); break;
    }
  });

  let renderT = null;
  const later = () => { clearTimeout(renderT); renderT = setTimeout(render, 0); };
  document.addEventListener('input', e => {
    const el = e.target; const t = trip(); const b = bus(); const d = el.dataset;
    if (d.hq) { UI.hq = el.value; clearTimeout(el._t); el._t = setTimeout(render, 200); return; }
    if (d.aq) { UI.aq = el.value; clearTimeout(el._t); el._t = setTimeout(render, 200); return; }
    if (d.cl && UI.cl && S.clients.clienti[UI.cl]) { S.clients.clienti[UI.cl][d.cl] = d.cl === 'part' ? el.value.toUpperCase() : el.value; save(); return; }
    if ((d.cfgag !== undefined || d.cfgl !== undefined) && !ACC.can('settings')) return;
    if (d.cfgag !== undefined) { S.cfg.agenzie[+d.cfgag][d.k] = el.value; save(); return; }
    if (d.cfgl !== undefined) { S.cfg.luoghi[+d.cfgl][d.k] = d.k === 'code' ? el.value.toUpperCase() : el.value; save(); return; }
    if (d.cc) { ccDiff(); return; }
    if (d.usig) { if (!ACC.can('users')) return; const u = ACC.users()[d.usig]; if (u) { u.sigla = el.value.toUpperCase().trim(); save(); } return; }
    if (UI.pay && (d.pf || d.pl !== undefined || d.pff || d.pfm || d.pfc)) { payInput(el); return; }
    if (d.r && t) { const r = rowById(t, d.r); if (r) { r[d.f] = el.value; if (d.f === 'cognome' || d.f === 'nome') { if (r.cid && S.clients.clienti[r.cid]) { const x = S.clients.clienti[r.cid]; if (nk(baseCognome(r.cognome)) !== nk(x.cognome) || nk(r.nome) !== nk(x.nome)) delete r.cid; } acOpen(el); } save(); } return; }
    if (d.ar && t) { const r = t.attesa.find(x => x.id === d.ar); if (r) { r[d.f] = el.value; save(); } return; }
    if (d.nr && t) { const r = t.annullati.find(x => x.id === d.nr); if (r) { r[d.f] = el.value; save(); } return; }
    if (d.q && t) { t.quota[d.q] = parseEuro(el.value); save(); return; }
    if (d.qs && t) { t.quota.suppl[d.qs] = parseEuro(el.value); save(); return; }
    if (d.qt && t) { t.quota[d.qt] = el.value.trim(); save(); return; }
    if (d.tf && t) { if (d.tf !== 'nome' || el.value.trim()) t[d.tf] = el.type === 'date' ? el.value : el.value; save(); return; }
    if (d.dep2 !== undefined && t) { t.partenze[+d.dep2] = t.partenze[+d.dep2] || { citta: '', luogo: '', ora: '' }; t.partenze[+d.dep2][d.k] = el.value; save(); return; }
    if (d.bind && b) { b[d.bind] = el.value; save(); return; }
    if (d.dep !== undefined && b) { b.partenze[+d.dep][d.k] = d.k === 'code' ? el.value.toUpperCase() : el.value; save(); return; }
    if (el.id === 'imp-text') { clearTimeout(el._t); el._t = setTimeout(() => { if (!el.value.trim()) return; const P = parsePaste(el.value); showParsed({ part: P, quota: { suppl: {} }, attesa: [], annullati: [], note: [], partenze: [] }); }, 250); }
  });
  document.addEventListener('change', e => {
    const el = e.target; const t = trip(); const b = bus(); const d = el.dataset;
    if (d.impfile) { if (!ACC.can('anag') || ACC.can('readonly')) return; const f = el.files && el.files[0]; el.value = ''; if (f) impOpenFile(f); return; }
    if ((d.impc !== undefined || d.imph || d.impt) && UI.imp) { impInput(el); return; }
    if (d.r && t) { const r = rowById(t, d.r); if (r && !AC.el) upsertFromRow(r); save(); later(); return; }
    if ((d.ar || d.nr || d.q || d.qs || d.qt || d.tf) && t) { later(); return; }
    if (d.cl) { later(); return; }
    if (d.clchk && UI.cl) { S.clients.clienti[UI.cl][d.clchk] = el.checked; save(); render(); return; }
    if ((d.urole || d.uag || d.uact) && !ACC.can('users')) { render(); return; }
    if (d.maint && !ACC.can('tech')) { render(); return; }
    if (d.urole) { const u = ACC.users()[d.urole]; u.role = el.value; if (u.role === 'contabilita') u.agencies = []; ACC.tlog('avviso', `Ruolo di «${u.name}» cambiato in ${ROLE_L[u.role]}`); save(); render(); return; }
    if (d.uag) { const u = ACC.users()[d.uag]; const set = new Set(u.agencies || []); if (el.checked) set.add(d.ag); else set.delete(d.ag); u.agencies = S.cfg.agenzie.map(a => a.id).filter(x => set.has(x)); ACC.tlog('info', `Agenzie di «${u.name}»: ${u.agencies.length ? u.agencies.map(agName).join(', ') : 'tutte'}`); save(); return; }
    if (d.uact) { const u = ACC.users()[d.uact]; u.active = el.checked; ACC.tlog('avviso', `Account «${u.name}» ${el.checked ? 'riattivato' : 'disattivato'}`); save(); render(); return; }
    if (d.maint) { S.cfg.maint = el.checked; ACC.tlog('avviso', el.checked ? 'Modalità manutenzione attivata' : 'Modalità manutenzione tolta'); save(); render(); return; }
    if (d.cdate) { if (el.value) { UI.cday = el.value; render(); } return; }
    if (d.cmon) { if (el.value) { UI.cmon = el.value; render(); } return; }
    if (d.gdate) { if (el.value) { UI.gday = el.value; render(); } return; }
    if (d.bind === 'label' || d.bind === 'accompagnatore') { later(); return; }
    if (d.tchk && t) { t[d.tchk] = el.checked; t.buses.forEach(x => { x.guida = el.checked; if (!el.checked) Object.keys(x.seats).forEach(k => { if (x.seats[k].res) delete x.seats[k]; }); else { syncAll(t); reserveGuide(x); } }); commit(); return; }
    if (d.bindchk && b) { b[d.bindchk] = el.checked; if (!el.checked) Object.keys(b.seats).forEach(k => { if (b.seats[k].res) delete b.seats[k]; }); else reserveGuide(b); commit(); return; }
    if (el.id === 'imp-file' && el.files[0]) readImportFile(el.files[0]);
    if (el.classList.contains('pdf-in') && el.files[0]) attachPdf(el.dataset.trip, el.files[0]);
    if (el.id === 's-restore' && el.files[0]) {
      const r = new FileReader(); r.onload = () => { try { const res = importBackup(JSON.parse(r.result)); render(); toast(`Copia recuperata: ${res.add} viaggi nuovi, ${res.into} liste inserite${res.skip ? `, ${res.skip} saltati (già presenti o di esempio)` : ''}`); } catch (err) { toast('Il file non è una copia valida'); } }; r.readAsText(el.files[0]); el.value = '';
    }
  });
  document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); gateSubmit(f).catch(err => { GATE.busy = false; GATE.msg = 'Qualcosa non ha funzionato: riprova.'; ACC.tlog('errore', 'Accesso: ' + (err && err.message || err)); render(); }); });
  window.addEventListener('scroll', () => { if (AC.el) acClose(); }, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AC.el && !(e.target.classList && e.target.classList.contains('wc'))) { acClose(); return; }
    if (e.key === 'Escape') { if ($('#pop')) return closePop(); if (!$('#print-root').hidden) return closePrint(); if ($('#modal-root').innerHTML) return closeModal(); if (UI.pay) return payClose(); if (UI.sel || UI.selP || UI.move != null) { UI.sel = UI.selP = null; UI.move = null; render(); } return; }
    const el = e.target;
    if (el.classList && el.classList.contains('wc') && acKey(e)) { e.preventDefault(); return; }
    if (el.classList && el.classList.contains('wc') && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault(); const tr = el.closest('tr'); const to = e.key === 'ArrowUp' ? tr.previousElementSibling : tr.nextElementSibling;
      const inp = to && to.querySelector(`input[data-f="${el.dataset.f}"]`); if (inp) { inp.focus(); inp.select(); }
      return;
    }
    if (e.key === 'Enter') { if (el.id === 'np-in') $('#pop [data-act="savenp"]').click(); else if (el.closest && el.closest('.seat[data-seat]')) onSeat(+el.dataset.seat, el); else if (el.closest && el.closest('.model[data-act="picklayout"]')) el.click(); }
  });

  // ---------- trascinamento: prenotazione intera, singola persona, posto ----------
  let drag = null;
  document.addEventListener('dragstart', e => {
    const c = e.target.closest ? e.target : e.target.parentElement;
    const st = c.closest('#mapwrap .seat[data-seat]'); const pe = c.closest('[data-dragp]'); const bk = c.closest('[data-dragbk]');
    if (st) drag = { seat: +st.dataset.seat }; else if (pe) drag = { p: pe.dataset.dragp }; else if (bk) drag = { bk: bk.dataset.dragbk }; else return;
    e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'posto'); } catch (err) { /* ignorato */ }
    const row = c.closest('tr'); if (row && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(row, 20, 14);
  });
  document.addEventListener('dragover', e => {
    if (!drag || !e.target.closest) return;
    const st = e.target.closest('#mapwrap .seat[data-seat]'); const tb = e.target.closest('[data-dropbus]'); const dl = e.target.closest('[data-droplist]');
    $$('.drop').forEach(x => x !== st && x !== tb && x !== dl && x.classList.remove('drop'));
    if (st && !st.classList.contains('res')) { e.preventDefault(); st.classList.add('drop'); }
    else if (tb && (drag.bk || drag.p)) { e.preventDefault(); tb.classList.add('drop'); }
    else if (dl && drag.seat != null) { e.preventDefault(); dl.classList.add('drop'); }
  });
  document.addEventListener('drop', e => {
    const tgt = e.target.closest ? e.target : e.target.parentElement;
    const st = tgt.closest('#mapwrap .seat[data-seat]'); const dz = tgt.closest('#dropzone'); const tb = tgt.closest('[data-dropbus]'); const dl = tgt.closest('[data-droplist]');
    $$('.drop').forEach(x => x.classList.remove('drop'));
    if (dz) { e.preventDefault(); dz.classList.remove('on'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) readImportFile(f); return; }
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length && !$('#modal-root').innerHTML) {
      e.preventDefault(); $$('.droptarget').forEach(x => x.classList.remove('droptarget'));
      const f = files[0]; const card = tgt.closest('[data-droptrip]'); const tid = card ? card.dataset.droptrip : (UI.view === 'trip' ? UI.tripId : null);
      if (/\.(pdf|jpe?g|png)$/i.test(f.name) || /^(application\/pdf|image\/(jpeg|png))$/.test(f.type)) { if (tid) attachPdf(tid, f); else toast('Trascina il programma sulla scheda della gita'); }
      else if (/\.docx?$/i.test(f.name)) { importModal(UI.view === 'trip' ? 'trip' : 'new'); readImportFile(f); }
      else toast('Qui si possono trascinare il PDF del programma o la lista in .docx');
      drag = null; return;
    }
    if (!drag) return;
    e.preventDefault(); const t = trip(); const b = bus(); const dr = drag; drag = null;
    if (st) {
      const s = +st.dataset.seat;
      if (dr.seat != null) { if (dr.seat !== s) { const was = b.seats[s]; moveSeat(b, dr.seat, s); toast(was ? `Scambiati i posti ${dr.seat} e ${s}` : `Spostato dal ${dr.seat} al ${s}`); commit(); } return; }
      if (dr.bk) { const r = dropFamily(t, dr.bk, b, s); UI.sel = null; afterFamily(r, t, b, dr.bk); return commit(); }
      if (dr.p) { const r = dropPerson(t, dr.p, b, s); if (!r.ok) return toast(r.msg); toast(r.swap ? 'Posti scambiati' : `Messo al posto ${s}`); return commit(); }
    }
    if (tb && (dr.bk || dr.p)) {
      const to = t.buses.find(x => x.id === tb.dataset.dropbus); let id = dr.bk;
      if (dr.p) { const r = rowById(t, dr.p); unseatRow(t, r); r.bus = to.id; id = deriveBookings(t).find(x => x.persone.some(p => p.id === dr.p)).id; syncAll(t); autoAssign(to, new Set([id])); }
      else toBusAuto(t, [id], to);
      syncAll(t); UI.busId = to.id; const bb = bkById(to, id);
      toast(`${bkName(bb)}: su ${to.label}, ${seatsOf(to, id).length ? 'posti ' + fmtSeats(seatsOf(to, id)) : 'senza posto (bus pieno?)'}`); return commit();
    }
    if (dl && dr.seat != null) { const a = b.seats[dr.seat]; if (a && a.pid) { const r = rowById(t, a.pid); unseatRow(t, r); delete r.bus; toast(`${String(r.cognome).replace(RX, '$1')} ${r.nome} tolto dal bus`); commit(); } }
  });
  document.addEventListener('dragend', () => { drag = null; $$('.drop').forEach(x => x.classList.remove('drop')); });
  document.addEventListener('dragenter', e => { const dz = e.target.closest && e.target.closest('#dropzone'); if (dz && e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) { e.preventDefault(); dz.classList.add('on'); } });
  window.addEventListener('dragover', e => {
    if (!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files'))) return;
    e.preventDefault(); const card = e.target.closest && e.target.closest('[data-droptrip]');
    $$('.droptarget').forEach(x => x !== card && x.classList.remove('droptarget')); if (card) card.classList.add('droptarget');
  });
  window.addEventListener('dragleave', e => { if (!e.relatedTarget) $$('.droptarget').forEach(x => x.classList.remove('droptarget')); });
  window.addEventListener('resize', () => { const r = $('#print-root'); if (r && !r.hidden) r.style.setProperty('--pz', Math.min(1, (window.innerWidth - 24) / 800).toFixed(3)); });

  // ---------- dati di esempio (nomi e telefoni inventati) ----------
  function demoState() {
    let tel = 100; const T = () => `333000${String(tel++).padStart(4, '0')}`;
    const R = a => ({ ...blankRow(), cognome: a[0], nome: a[1], nascita: a[2] || '', tel: a[3] === '#' ? T() : (a[3] || ''), natoA: a[4] || '', part: a[5] || '', hotel: a[6] || '', cam: a[7] || '', fila: a[8] || '', note: a[9] || '', pagato: a[10] || '' });
    const y = new Date().getFullYear();
    const future = (m, d) => { let yy = y; const iso = (yy, mm, dd) => `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`; if (iso(yy, m, d) < todayISO()) yy++; return iso(yy, m, d); };
    const addDays = (iso, n) => { const d = parseD(iso); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const tourRows = [
      ['Amato x 1', 'Maria', '02/06/52', '#', 'Noto', 'RG', 'singola', '01', '', 'Salda dopo il tour', '100'],
      ['Barone x 4', 'Giuseppe', '20/06/56', '#', 'Ragusa', 'RG', 'matrim', '02', '1° f. sx', '', '527'], ['Cannizzaro', 'Carmela', '07/08/62', '', 'Ragusa', 'RG', '', '', '1° f. sx', '', '527'],
      ['Distefano', 'Salvatore', '08/03/59', '#', 'Ragusa', 'RG', 'matrim', '03', '5 fila dx', '', '100'], ['Errante', 'Rosa', '29/11/56', '', 'Ragusa', 'RG', '', '', '5 fila dx', '', '100'],
      ['Floridia x 2', 'Giovanni', '29/04/63', '#', 'Ragusa', 'RG', 'matrim', '04', '', 'Pref. vicino uscita', '495'], ['Gulino', 'Lucia', '21/02/73', '', 'Ragusa', 'RG', '', '', '', '', '495'],
      ['Iacono x 1', 'Vincenzo', '23/06/72', '#', 'Ragusa', 'RG', 'singola', '05', '', '', '585'],
      ['Lissandrello x 5', 'Concetta', '29/01/65', '#', 'Comiso', 'RG', 'tripla', '06', '', 'bonifico', '100'], ['Migliore', 'Giorgio', '25/07/64', '', 'Vittoria', 'RG', '', '', '', '', '100'], ['Nobile', 'Angela', '13/09/68', '', 'Vittoria', 'RG', '', '', '', '', '100'],
      ['Occhipinti', 'Carmelo', '29/06/65', '', 'Catania', 'RG', 'doppia', '07', '', 'No aglio', '100'], ['Pitino', 'Francesca', '26/08/55', '', 'Vittoria', 'RG', '', '', '', '', '100'],
      ['Quattrocchi x 2', 'Emanuele', '30/11/60', '#', 'Ragusa', 'RG', 'matrim', '08', '2° f. dx', '', '519'], ['Russo', 'Giusy', '27/01/64', '', 'Pozzallo', 'RG', '', '', '2° f. dx', '', '519'],
      ['Scollo x 3', 'Orazio', '22/10/73', '#', 'Ragusa', 'RG', 'tripla', '09', '', '', '470'], ['Tumino', 'Teresa', '10/04/64', '', 'Ragusa', 'RG', '', '', '', '', '470'], ['Vindigni', 'Rosario', '14/06/64', '', 'Ragusa', 'RG', '', '', 'Lato dx', '', '470'],
      ['Zocco x 2', 'Valeria', '04/01/57', '#', 'Modica', 'MD', 'matrim', '10', 'terzult', '', '100'], ['Caruso', 'Marco', '07/12/57', '', 'Modica', 'MD', '', '', 'fila', '', '100'],
      ['Fidone x 1', 'Grazia', '22/04/73', '#', 'Modica', 'MD', 'singol', '11', '', '', '100'],
      ['Licitra x 6', 'Antonio', '22/04/64', '#', 'Scicli', 'MD', 'matrim', '12', 'Ultima', '', '495'], ['Battaglia', 'Elena', '25/09/67', '', 'Scicli', 'MD', '', '', 'fila', '', '495'],
      ['Schembari', 'Paolo', '25/09/95', '', 'Ragusa', 'MD', 'tripla', '13', '', 'Ok ultima fila', '495'], ['Cascone', 'Luigi', '22/05/93', '', 'Ragusa', 'MD', '', '', '', '', '495'], ['Cascone', 'Giovanni', `07/06/${String((y - 6) % 100).padStart(2, '0')}`, '', 'Ragusa', 'MD', '', '', '', 'Menu bambino', '390'],
      ['Giunta', 'Rosa', '05/11/66', '', 'Scicli', 'MD', 'singola', '14', 'penult', '', '585'],
      ['Arezzo x 2', 'Salvatore', '02/08/71', '#', 'Avola', 'MD', 'matrim', '15', '2° f. sx', 'bonifico', '519'], ['Leggio', 'Maria', '30/10/70', '', 'Avola', 'MD', '', '', '2° f. sx', '', '519'],
      ['Spadola x 2', 'Orazio', '12/03/60', '#', 'Modica', 'MD', 'matrim', '16', '', '', '990'], ['Padua', 'Grazia', '15/05/62', '', 'Modica', 'MD', '', '', '', '', ''],
    ].map(R);
    const t2 = tripInit({ id: uid(), demo: true, nome: 'Tour della Puglia (esempio)', data: future(12, 5), programma: '', guida: true,
      quota: { adulti: 495, singola: 585, bambini: 390, bambiniL: '3/11 anni', terzo: 420, infant: 0, infantL: '0/2 anni', acconto: 100, saldo: 395, hotel: 'Hotel di esempio, Bari', suppl: { 1: 32, 2: 24, 3: 16, 4: 8, p2: 24 } },
      partenze: [{ citta: 'Ragusa', luogo: 'Piazza di esempio', ora: '05:00' }, { citta: 'Modica', luogo: 'Parcheggio di esempio', ora: '05:25' }], note1: 'Esempio: confermate 10 camere + 8 in opzione', rows: tourRows,
      attesa: [{ ...blankAtt(), cognome: 'Mallia x 1', nome: 'Franco', tel: T(), part: 'MD', note: '1 singola', richiesta: '25/09' }, { ...blankAtt(), cognome: 'Ragusa x 2', nome: 'Giovanni', tel: T(), part: 'MD', richiesta: '20/10' }],
      annullati: [{ ...R(['Garofalo x 2', 'Angela', '25/11/80', '#', 'Ragusa', 'RG', 'doppia', '', '', '', '100']), stato: 'fatto', dataAnn: '08/09' }, { ...R(['Garofalo', 'Paolo', '16/06/79', '', 'Ragusa', 'RG', '', '', '', '', '100']), stato: 'fatto', dataAnn: '08/09' }] });
    t2.fine = addDays(t2.data, 3); t2.quota.saldoEntro = addDays(t2.data, -45);
    const bt = { id: uid(), label: 'Bus 1', layout: '52', mezzo: '', autista: 'Autista di esempio', accompagnatore: '', telAcc: '', note: '', partenze: [{ code: 'RG', luogo: 'Ragusa', ora: '05:00' }, { code: 'MD', luogo: 'Modica', ora: '05:25' }], seats: {}, guida: true };
    t2.buses.push(bt); t2.rows.forEach(r => { if (!isEmptyRow(r)) r.bus = bt.id; });
    const D2 = syncAll(t2); D2.forEach((bk, i) => { bk.head.c = i % COLORS.length; }); syncAll(t2); autoAssign(bt);
    // gita in giornata: lista più semplice, metà già sul bus
    const C = ['Amato', 'Barone', 'Cannizzaro', 'Distefano', 'Errante', 'Floridia', 'Gulino', 'Iacono', 'Lissandrello', 'Migliore', 'Nobile', 'Occhipinti', 'Pitino', 'Quattrocchi', 'Russo', 'Scollo', 'Tumino', 'Vindigni', 'Zocco', 'Caruso'];
    const N = ['Maria', 'Giuseppe', 'Carmela', 'Salvatore', 'Rosa', 'Giovanni', 'Lucia', 'Vincenzo', 'Concetta', 'Giorgio', 'Angela', 'Carmelo', 'Francesca', 'Emanuele'];
    const sizes = [2, 1, 4, 2, 3, 2, 1, 2, 6, 2, 1, 2, 3, 2, 1, 2]; const rows1 = []; let k = 0;
    const filaOf = { 2: '1 fila sx', 5: '2 fila dx', 11: '' };
    sizes.forEach((n, i) => { for (let j = 0; j < n; j++) { const cg = C[(i * 3 + j) % C.length]; rows1.push(R([j === 0 ? `${C[i % C.length]} x ${n}` : cg, N[(k++) % N.length], `${String(1 + (k * 7) % 27).padStart(2, '0')}/${String(1 + k % 12).padStart(2, '0')}/${String(48 + (k * 5) % 30)}`, j === 0 ? '#' : '', '', i % 3 === 2 ? 'MOD' : 'RAG', '', '', filaOf[i] || '', i === 7 && j === 0 ? 'Preferisce vicino porta dietro' : '', i % 4 === 3 ? '' : String(65 + (filaOf[i] ? 4 : 0))])); } });
    const t1 = tripInit({ id: uid(), demo: true, nome: 'Concerto a Messina (esempio)', data: future(11, 14), fine: '', programma: 'https://www.laterra.it', rows: rows1,
      quota: { adulti: 65, bambini: 47, bambiniL: '4/11 anni', suppl: { 1: 4, 2: 3, 3: 2, 4: 1, p2: 3 } }, partenze: [{ citta: 'RAG', luogo: 'Piazza di esempio', ora: '12:30' }, { citta: 'MOD', luogo: 'Parcheggio di esempio', ora: '12:50' }] });
    const b1 = { id: uid(), label: 'Bus 1', layout: '54', mezzo: '', autista: '', accompagnatore: '', telAcc: '', note: '', partenze: [], seats: {} };
    t1.buses.push(b1);
    const D1 = deriveBookings(t1); D1.slice(0, 8).forEach((bk, i) => { bk.head.c = i; bk.persone.forEach(p => { p.row.bus = b1.id; }); }); syncAll(t1); autoAssign(b1);
    return { demo: true, ver: DATA_VER, trips: [t1, t2] };
  }

  // test interni (usati solo in fase di verifica)
  window.__posti = { get S() { return S; }, UI, render, deriveBookings, syncAll, seatIndex, officeLabels, parseTripDocx, autoAssign, prefStatus, bkMoney, summaryOf, LMAP, dropFamily, dropPerson, STORE, ACC, flush, allMovs, payTotals, cashSaldo, giornoData, xlRow, DIAG,
    demo() { const d = demoState(); d.trips.forEach(t => { delete t.demo; S.trips.push(t); t.rows.forEach(r => upsertFromRow(r)); }); flush(); render(); return d.trips.map(t => t.id); } };

  // ---------- avvio ----------
  function softRender() { if ($('#print-root') && !$('#print-root').hidden) return; render(); }
  // una sola finestra per computer: due finestre aperte si rubano gli aggiornamenti a vicenda
  async function oneWindow() {
    if (!navigator.locks || !navigator.locks.request) return;
    return new Promise(res => {
      navigator.locks.request('viaggi-laterra-app', { ifAvailable: true }, lock => {
        if (lock) { res(); return new Promise(() => {}); }
        $('#app').innerHTML = `<div class="gate"><div class="g-card"><img src="${LOGO}" alt="La Terra" style="height:40px;align-self:center"><h1 class="g-title">Viaggi <span>in Pullman</span></h1><p class="g-sub">L'app è già aperta in un'altra finestra di questo computer. Usa quella, oppure chiudila e premi il pulsante qui sotto.</p><button class="g-btn" onclick="location.reload()">Riprova</button></div></div>`;
        return null;
      });
    });
  }
  (async () => {
    await oneWindow();
    DIAG.ctx = () => { const me = ACC.sess && ACC.me(); return { u: me ? me.name : '', ag: ACC.sess && ACC.sess.ag || '', v: UI.view === 'trip' ? 'trip:' + (UI.tripId || '') : UI.view }; };
    await DIAG.start();
    await STORE.open(); DIAG.dev = STORE.device.id; DIAG.ev('avvio', 'Archivio aperto', { computer: STORE.device.id, dal: STORE.device.since, stato: STORE.status(), inAttesa: STORE.pendingList().slice(0, 30) });
    if (window.VIPDBX && VIPDBX.isMine && VIPDBX.isMine()) {
      try { if (await VIPDBX.finishLogin()) STORE.dropUnsynced(); localStorage.removeItem(LOCAL_MODE); } catch (e) { GATE.msg = 'Il collegamento a Dropbox non è riuscito: riprova.'; }
    }
    load(); ACC.loadSess();
    if (ACC.sess && !ACC.me()) { ACC.sess = null; ACC.saveSess(false); }
    let lastGate = gateStep();
    STORE.onRemote = paths => applyRemote(paths);
    onData = () => { const st = STORE.status(); if (st.pulled) { seedCatalog(); buildAnagrafica(); } softRender(); };
    STORE.onStatus = st => {
      const el = $('#syncpill'); if (el) { const [k, l, tt] = syncInfo(st); el.className = 'sync ' + k; el.title = tt; el.innerHTML = '<i></i>' + esc(l); }
      const g = gateStep(); if (g !== lastGate) { lastGate = g; if (st.pulled) { seedCatalog(); buildAnagrafica(); } render(); }
    };
    { const st = STORE.status(); const local = localStorage.getItem(LOCAL_MODE) === '1' || !st.hasKey; if ((local && !st.linked) || st.pulled) { seedCatalog(); buildAnagrafica(); } }
    render();
    STORE.loop();
    setInterval(() => { const st = STORE.status(); DIAG.ev('stato', `Stato: ${st.linked ? (st.error ? 'errore ' + st.error : 'sincronizzato') : 'non collegato'} · ${st.pending} in attesa`, { online: navigator.onLine, ultimaSync: st.last ? st.last.toISOString() : null, pagina: UI.view, memoriaMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : undefined, viaggi: S.trips.length }); }, 10 * 60000);
    if (ACC.me()) ACC.tlog('info', 'Apertura dell\'app');
  })();
})();
