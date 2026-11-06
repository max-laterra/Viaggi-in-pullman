(function () {
  'use strict';
  const VERSION = '2.1.14';
  const LOGO = './logo.jpg';
  const KEY = 'laterra.prenotazioniPosti.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // indirizzo internet sicuro per un link: solo http:// o https:// (un «www.sito.it» senza https:// si completa da solo);
  // tutto il resto (javascript:, data:, file:…) diventa vuoto, così un link non può far partire comandi
  const safeUrl = u => { let s = String(u ?? '').trim(); if (!s) return ''; if (!/^[a-z][a-z0-9+.-]*:/i.test(s) && /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(s)) s = 'https://' + s; try { return /^https?:$/.test(new URL(s).protocol) ? s : ''; } catch (e) { return ''; } };
  // testo per i file CSV: un valore che comincia con = + - @ (non un numero) Excel lo prenderebbe per una formula
  // e potrebbe eseguirla; con un apostrofo davanti resta un semplice testo
  const csvSafe = v => { const s = String(v == null ? '' : v); return /^[=+\-@\t\r]/.test(s) && !/^[+-]?\d[\d.,]*$/.test(s.trim()) ? "'" + s : s; };
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
    out: I('<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>'),
    up: I('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    down: I('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    move: I('<path d="M4 12h14M13 7l5 5-5 5M4 5v14"/>'),
    star: I('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
    check: I('<path d="M5 12.5l4.5 4.5L19 7"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    xcirc: I('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
    sel: I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
    alert: I('<path d="M12 3L2 20h20zM12 10v4M12 17h.01"/>'),
    key: I('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
    mouse: I('<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v4"/>'),
    unlink: I('<path d="M9 7l-1-3M15 17l1 3M7 9l-3-1M17 15l3 1M10.5 13.5l-2 2a3 3 0 0 1-4-4l2-2M13.5 10.5l2-2a3 3 0 0 1 4 4l-2 2"/>'),
    link2: I('<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>')
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
          // 409 nell'invio = il file è cambiato da un altro computer: l'app unisce e rimanda da sola (evento «Conflitto risolto»)
          if (!r.ok && r.status === 409 && /files\/upload$/.test(ep)) ev('rete', `${(init && init.method) || 'GET'} ${ep} → 409 (cambiato da un altro computer, si unisce)`, { file: fpath, ms: Math.round(ms) });
          else if (!r.ok) ev('rete-errore', `${(init && init.method) || 'GET'} ${ep} → ${r.status}`, { file: fpath, ms: Math.round(ms), retryAfter: r.headers.get('Retry-After') || undefined });
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
      // la protezione CSP (index.html) ha bloccato qualcosa: si annota, così se una funzione smette di andare si capisce subito perché
      document.addEventListener('securitypolicyviolation', e => ev('errore', `Bloccato dalla protezione CSP: ${e.effectiveDirective || e.violatedDirective} · ${cut(e.blockedURI || 'codice nella pagina', 160)}`, { file: e.sourceFile, riga: e.lineNumber }));
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
      const A = window.VIPARCHIVIO; if (upBusy || !dev || !A || !A.status().linked || A.status().offline) return;
      if (!force && (!newSinceUp || Date.now() - lastUp < 10 * 60000)) return;
      upBusy = true;
      try {
        await flush(); const done = (() => { try { return JSON.parse(localStorage.getItem(UPK) || '{}'); } catch (e) { return {}; } })();
        const today = dayOf(new Date()); const days = [today];
        for (let i = 1; i <= 3; i++) { const d = dayOf(new Date(Date.now() - i * 864e5)); if (!done[d]) days.push(d); }
        for (const d of days) {
          const evs = await read(d, d); if (!evs.length) { if (d !== today) done[d] = 1; continue; }
          const body = new TextEncoder().encode(evs.map(r => JSON.stringify(Object.assign({ c: dev }, r))).join('\n') + '\n');
          await A.rawUpload(`/diagnostica/${d.slice(0, 7)}/${d}_${dev}.log`, body);
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
        const A = window.VIPARCHIVIO; if (!A || !A.status().linked) return { files: [], err: 'Dropbox non collegato' };
        const out = []; let entries;
        try { entries = await A.rawList('/diagnostica'); } catch (e) { return { files: [], err: 'Elenco non riuscito: ' + (e.code || e.message) }; }
        for (const en of entries) {
          const m = /\/(\d{4}-\d{2}-\d{2})_([^/]+)\.log$/.exec(en.path_lower || ''); if (en['.tag'] !== 'file' || !m) continue;
          if (m[1] < fromDay || m[1] > toDay || m[2] === skipDev) continue;
          try { const r = await A.rawDownload(en.path_lower); if (r) out.push({ name: en.name || en.path_lower.split('/').pop(), day: m[1], dev: m[2], text: new TextDecoder().decode(r.buf) }); } catch (e) { out.push({ name: en.name || en.path_lower.split('/').pop(), day: m[1], dev: m[2], text: '', err: e.code || e.message }); }
        }
        return { files: out };
      }
    };
  })();

  // ---------- codice fiscale: calcolo da cognome, nome, sesso, data e luogo di nascita ----------
  // L'elenco dei comuni (anche quelli soppressi, per chi è nato prima) e degli stati esteri con il loro
  // codice catastale sta in vendor/comuni.txt e si carica solo quando serve.
  // Attenzione: in rari casi (omocodia) l'Agenzia delle Entrate assegna un codice diverso: fa fede la tessera sanitaria.
  const CF = (() => {
    let rows = null, loading = null;
    const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’`]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
    function load() {
      if (rows) return Promise.resolve(rows);
      if (!loading) loading = fetch('./vendor/comuni.txt').then(r => { if (!r.ok) throw new Error('elenco comuni non disponibile'); return r.text(); }).then(txt => {
        const m = new Map();
        txt.split('\n').forEach(l => { if (!l) return; const [name, prov, code, from, to] = l.split('|'); const k = slug(name); const a = m.get(k) || []; a.push({ name, prov, code, from, to }); m.set(k, a); });
        rows = m; return m;
      }).catch(e => { loading = null; throw e; });
      return loading;
    }
    // «Ragusa», «Ragusa (RG)», «RAGUSA RG», «Venezuela»… → il comune valido alla data di nascita
    function find(place, isoDate) {
      if (!rows || !place) return null;
      let p = String(place).trim(), prov = '';
      const mm = /^(.*?)[\s,]*\(?\b([A-Za-z]{2})\)?\s*$/.exec(p); if (mm && rows.has(slug(mm[1])) && !rows.has(slug(p))) { p = mm[1]; prov = mm[2].toUpperCase(); }
      const list = rows.get(slug(p)); if (!list) return null;
      const d = isoDate || '';
      const ok = list.filter(x => (!prov || x.prov === prov) && (!d || ((!x.from || x.from <= d) && (!x.to || x.to >= d))));
      const cands = ok.length ? ok : list.filter(x => !x.to);
      const codes = [...new Set(cands.map(x => x.code))];
      if (codes.length !== 1) return codes.length ? { ambiguous: true, list: cands } : null;
      const x = cands[cands.length - 1]; return { code: x.code, name: x.name, prov: x.prov };
    }
    const VOW = /[AEIOU]/;
    const letters = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
    function part(s, isName) {
      const L = letters(s); const cons = L.split('').filter(c => !VOW.test(c)); const vow = L.split('').filter(c => VOW.test(c));
      if (isName && cons.length >= 4) return cons[0] + cons[2] + cons[3];
      return (cons.join('') + vow.join('') + 'XXX').slice(0, 3);
    }
    const MESI_CF = 'ABCDEHLMPRST';
    const ODD = { 0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21, A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23 };
    const EVEN = c => (/\d/.test(c) ? +c : c.charCodeAt(0) - 65);
    const control = s15 => { let t = 0; for (let i = 0; i < 15; i++) t += i % 2 === 0 ? ODD[s15[i]] : EVEN(s15[i]); return String.fromCharCode(65 + (t % 26)); };
    function calc({ cognome, nome, sesso, nascita, code }) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nascita || ''); if (!m || !code || !letters(cognome) || !letters(nome) || !/^[MF]$/.test(sesso || '')) return '';
      const day = +m[3] + (sesso === 'F' ? 40 : 0);
      const s15 = part(cognome) + part(nome, true) + m[1].slice(2) + MESI_CF[+m[2] - 1] + String(day).padStart(2, '0') + code.toUpperCase();
      return s15 + control(s15);
    }
    // controllo del codice scritto a mano (anche omocodici); per 11 cifre controlla la partita IVA
    function check(v) {
      v = String(v || '').toUpperCase().replace(/\s/g, '');
      if (/^\d{11}$/.test(v)) { let s = 0; for (let i = 0; i < 11; i++) { let n = +v[i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; } return s % 10 === 0 ? 'piva' : 'piva-errata'; }
      if (!/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(v)) return v ? 'formato' : '';
      return control(v.slice(0, 15)) === v[15] ? 'ok' : 'errato';
    }
    // il sesso dal nome, solo come proposta (si corregge dal menu)
    const MASC_A = /^(andrea|luca|nicola|mattia|elia|tobia|enea|battista|giosuè|gianluca|gianandrea|zaccaria|geremia|isaia|evangelista)$/i;
    const guessSex = nome => { const n = String(nome || '').trim().split(/\s+/)[0] || ''; if (!n) return ''; return MASC_A.test(n) ? 'M' : /a$/i.test(n) ? 'F' : 'M'; };
    // «20/06/75» → «1975-06-20» (le date a due cifre dopo l'anno in corso sono del Novecento)
    function isoFromIt(v) {
      v = String(v || '').trim(); let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); if (m) return v;
      m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/.exec(v); if (!m) return '';
      let y = +m[3]; if (m[3].length <= 2) { const cy = new Date().getFullYear() % 100; y += y > cy ? 1900 : 2000; }
      return `${y}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
    }
    const itFromIso = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? `${m[3]}/${m[2]}/${m[1].slice(2)}` : ''; };
    return { load, find, calc, check, guessSex, isoFromIt, itFromIso, ready: () => !!rows };
  })();

  // ---------- stato ----------
  // S si costruisce dai file dell'archivio (STORE): un viaggio per file, più impostazioni, utenti e anagrafica.
  let S = null;
  const UI = { year: null, cat: 'tutte', hidePast: false, hq: '', view: 'home', tripId: null, busId: null, sec: 'lista', sel: null, selP: null, move: null, filter: 'prossime', modal: null, cartOrder: 'posto', dock: true, onlyFree: false };
  const P = { trip: id => `/viaggi/${id}.json`, users: '/config/utenti.json', cfg: '/config/impostazioni.json', clients: '/anagrafica/clienti.json' };
  // L'anagrafica può avere decine di migliaia di clienti: si divide in 32 file, così modificare un cliente
  // invia a Dropbox solo il suo file (circa 1/32 dell'anagrafica) e non tutta. Il vecchio file unico
  // (/anagrafica/clienti.json, versioni fino alla 1.3) si legge ancora e si svuota dopo il passaggio.
  const NSH = 32;
  const shardPath = i => `/anagrafica/clienti-${String(i).padStart(2, '0')}.json`;
  const shardOf = id => { let h = 0x811c9dc5; for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619); return (h >>> 0) % NSH; };
  let legacyClients = false, lastCStamp = 0;
  function readClients() {
    const out = {}, gone = {};
    const add = d => { if (!d) return; Object.entries(d.gone || {}).forEach(([id, ts]) => { gone[id] = Math.max(gone[id] || 0, ts); }); Object.entries(d.clienti || {}).forEach(([id, x]) => { const y = out[id]; if (!y || (+x.u || 0) >= (+y.u || 0)) out[id] = x; }); };
    // nel vecchio file, dopo il passaggio, le «cancellazioni» vogliono dire solo «spostato nei 32 file»: non valgono per i clienti spostati
    const leg = STORE.get(P.clients); if (leg) add(leg.spostato ? { clienti: leg.clienti } : leg);
    legacyClients = !!(leg && Object.keys(leg.clienti || {}).length);
    for (let i = 0; i < NSH; i++) add(STORE.get(shardPath(i)));
    Object.keys(out).forEach(id => { if (gone[id] && gone[id] >= (+out[id].u || 0)) delete out[id]; });
    Object.keys(gone).forEach(id => { if (out[id]) delete gone[id]; });
    return JSON.parse(JSON.stringify({ clienti: out, gone }));
  }
  // come stampMap, ma salva solo i file dei clienti cambiati
  function flushClients(force) {
    if (!force && !legacyClients && Date.now() - lastCStamp < 2000) { clearTimeout(flushClients.t); flushClients.t = setTimeout(() => flushClients(true), 2100); return; }
    lastCStamp = Date.now();
    const obj = S.clients, now = tick(), prev = MSNAP.clients || {}, cur = obj.clienti || {}; const dirtyS = new Set();
    Object.keys(cur).forEach(id => { const j = itemJSON(cur[id]); if (prev[id] !== j) { cur[id].u = now; prev[id] = itemJSON(cur[id]); dirtyS.add(shardOf(id)); } });
    Object.keys(prev).forEach(id => { if (!(id in cur)) { obj.gone = obj.gone || {}; obj.gone[id] = now; delete prev[id]; dirtyS.add(shardOf(id)); } });
    MSNAP.clients = prev;
    if (legacyClients) { for (let i = 0; i < NSH; i++) dirtyS.add(i); }
    dirtyS.forEach(i => {
      const part = { clienti: {}, gone: {}, u: now };
      Object.keys(cur).forEach(id => { if (shardOf(id) === i) part.clienti[id] = cur[id]; });
      Object.keys(obj.gone || {}).forEach(id => { if (shardOf(id) === i) part.gone[id] = obj.gone[id]; });
      STORE.put(shardPath(i), part);
    });
    if (legacyClients) {
      const leg = STORE.get(P.clients) || {}; const g = {}; Object.keys(leg.clienti || {}).forEach(id => { g[id] = now; });
      STORE.put(P.clients, { clienti: {}, gone: g, u: now, spostato: 'in /anagrafica/clienti-00…31.json dalla versione 1.3.1' });
      legacyClients = false; DIAG.ev('sync', `Anagrafica divisa in ${NSH} file (${Object.keys(cur).length} clienti)`);
    }
  }
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
  // nel confronto non contano le ore delle modifiche, chi le ha fatte e le cancellazioni dei posti
  const itemJSON = x => JSON.stringify(x, (k, v) => (k === 'u' || k === 'uf' || k === 'by' || k === 'bya' || k === 'seatGone' || k === 'bookings' ? undefined : v));
  const myName = () => { try { const m = window.ACC && ACC.sess && ACC.me(); return m ? m.name : ''; } catch (e) { return ''; } };
  // agenzia da cui si lavora: con il nome (by) dice chi ha fatto una modifica, per il controllo dopo il ritorno di internet
  const myAg = () => { try { return (window.ACC && ACC.sess && ACC.sess.ag) || ''; } catch (e) { return ''; } };
  // Due operatori sulla stessa prenotazione: ogni CAMPO di una riga porta l'ora della sua modifica (uf),
  // così se uno cambia il telefono e l'altro la nota, all'unione restano entrambe le modifiche.
  // Nei bus ogni POSTO porta l'ora della sua modifica e i posti liberati restano segnati (seatGone):
  // due operatori che sistemano persone diverse sullo stesso bus non si cancellano a vicenda.
  function fieldStamp(x, prev, now) {
    x.uf = x.uf || {};
    new Set([...Object.keys(prev), ...Object.keys(x)]).forEach(f => { if (f === 'u' || f === 'uf' || f === 'by' || f === 'bya' || f === 'bookings') return; if (JSON.stringify(prev[f]) !== JSON.stringify(x[f])) x.uf[f] = now; });
  }
  function seatStamp(b, prev, now, me, ag) {
    const ps = (prev && prev.seats) || {}; const cur = b.seats || {};
    const strip = a => JSON.stringify(a, (k, v) => (k === 'u' || k === 'by' || k === 'bya' ? undefined : v));
    // ogni posto cambiato porta l'ora, chi l'ha cambiato e da quale agenzia
    Object.keys(cur).forEach(s => { if (strip(cur[s]) !== strip(ps[s])) { cur[s].u = now; if (me) { cur[s].by = me; cur[s].bya = ag; } } });
    Object.keys(ps).forEach(s => { if (!(s in cur)) { b.seatGone = b.seatGone || {}; b.seatGone[s] = now; } });
    if (b.seatGone) { const old = now - 90 * 864e5; Object.keys(b.seatGone).forEach(s => { if (b.seatGone[s] < old || (cur[s] && (+cur[s].u || 0) > b.seatGone[s])) delete b.seatGone[s]; }); }
  }
  const topJSON = t => JSON.stringify(t, function (k, v) { return this === t && (LISTS.includes(k) || k === 'u' || k === 'tu' || k === 'gone') ? undefined : v; });
  const effective = (t, k) => { const a = t[k] || []; if (k !== 'rows' && k !== 'attesa') return a; let n = a.length; while (n > 0 && isEmptyRow(a[n - 1])) n--; return a.slice(0, n); };
  function persistForm(t) { const o = JSON.parse(JSON.stringify(t, noTrans)); o.rows = effective(t, 'rows').map(x => JSON.parse(JSON.stringify(x))); o.attesa = effective(t, 'attesa').map(x => JSON.parse(JSON.stringify(x))); return o; }
  function snap(t) { SNAP.set(t.id, { top: topJSON(t), items: new Map(LISTS.flatMap(k => effective(t, k).map(x => [k + ':' + x.id, itemJSON(x)]))) }); }
  function stamp(t) {
    const now = tick(), s = SNAP.get(t.id); let ch = false;
    if (!s) { ch = true; t.tu = now; LISTS.forEach(k => effective(t, k).forEach(x => { if (!x.u) x.u = now; })); }
    else {
      const seen = new Set();
      const me = myName(), ag = myAg();
      LISTS.forEach(k => effective(t, k).forEach(x => {
        const key = k + ':' + x.id; seen.add(key); const pj = s.items.get(key); if (pj === itemJSON(x)) return;
        let prev = null; try { prev = pj ? JSON.parse(pj) : null; } catch (e) { prev = null; }
        if (k === 'buses') seatStamp(x, prev, now, me, ag); else if (prev) fieldStamp(x, prev, now);
        x.u = now; if (me) { x.by = me; x.bya = ag; } ch = true;
      }));
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
    S = { trips, cfg: Object.assign(DEF_CFG(), STORE.get(P.cfg) || {}), users: STORE.get(P.users) ? JSON.parse(JSON.stringify(STORE.get(P.users))) : { users: {} }, clients: readClients() };
    S.users.users = S.users.users || {}; S.clients.clienti = S.clients.clienti || {};
    if (!Array.isArray(S.cfg.agenzie) || !S.cfg.agenzie.length) S.cfg.agenzie = JSON.parse(JSON.stringify(AGENZIE_DEF));
    S.trips.forEach(t => { seeU(t); snap(t); }); seeU(S.users); seeU(S.clients); snapMaps();
    if (legacyClients) setTimeout(save, 0);
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
    // ogni viaggio cambiato: si salva e si annota nella cronologia (lista e piantina)
    S.trips.forEach(t => { if (stamp(t)) { const p = P.trip(t.id); const prev = STORE.get(p); const cur = persistForm(t); STORE.put(p, cur); if (typeof histNote === 'function') try { histNote(t, prev, cur); } catch (e) { DIAG.ev('errore', 'Cronologia: ' + e.message); } } });
    if (stampMap(S.users, 'users', 'users')) STORE.put(P.users, S.users);
    flushClients(false);
    const cj = itemJSON(S.cfg); if (cj !== MSNAP.cfg) { S.cfg.u = tick(); MSNAP.cfg = itemJSON(S.cfg); STORE.put(P.cfg, S.cfg); }
  }
  window.addEventListener('beforeunload', () => { try { flush(); flushClients(true); } catch (e) { /* niente */ } });
  function deleteTrip(id) {
    S.trips = S.trips.filter(x => x.id !== id); SNAP.delete(id);
    STORE.put(P.trip(id), { id, deleted: true, u: tick(), tu: HLC });
  }
  // arrivano modifiche da un altro computer: si uniscono con quelle di questo, senza perdere niente
  function applyRemote(paths) {
    if (!S) return;
    let touched = false, clientsDone = false;
    paths.forEach(p => {
      const d = STORE.get(p);
      if (p.startsWith('/viaggi/')) {
        const id = p.slice(8, -5); const i = S.trips.findIndex(t => t.id === id);
        if (!d || d.deleted) { if (i >= 0) { S.trips.splice(i, 1); SNAP.delete(id); touched = true; } return; }
        seeU(d); let merged = d;
        const prevU = i >= 0 ? new Map(S.trips[i].rows.map(r => [r.id, +r.u || 0])) : null;
        if (i >= 0) { stamp(S.trips[i]); merged = STORE.mergeTrip(persistForm(S.trips[i]), d); if (JSON.stringify(merged) !== JSON.stringify(d)) STORE.put(p, merged); }
        const nt = tripInit(JSON.parse(JSON.stringify(merged)));
        if (prevU) { const me = myName(); nt.rows.forEach(r => { if ((+r.u || 0) > (prevU.get(r.id) || 0) && r.by && r.by !== me) { UI.flash = UI.flash || {}; UI.flash[r.id] = { by: r.by, at: Date.now() }; } }); }
        if (i >= 0) S.trips[i] = nt; else S.trips.push(nt);
        snap(nt); touched = true;
      } else if (p.startsWith('/anagrafica/')) {
        if (!clientsDone) { clientsDone = true; flush(); flushClients(true); S.clients = readClients(); seeU(S.clients); snapMaps(); touched = true; if (legacyClients) save(); }
      } else if (p === P.users || p === P.cfg) {
        const name = p === P.users ? 'users' : 'cfg';
        flush();
        const dd = STORE.get(p); seeU(dd);
        const merged = name === 'cfg' ? dd : STORE.mergeFor(p)(JSON.parse(JSON.stringify(S[name])), dd);
        if (name !== 'cfg' && JSON.stringify(merged) !== JSON.stringify(dd)) STORE.put(p, merged);
        S[name] = name === 'cfg' ? Object.assign(DEF_CFG(), JSON.parse(JSON.stringify(merged))) : JSON.parse(JSON.stringify(merged));
        if (name === 'users') S.users.users = S.users.users || {}; if (name === 'clients') S.clients.clienti = S.clients.clienti || {};
        snapMaps(); touched = true;
      } else if (p.startsWith('/presenza/')) { if (typeof onPresence === 'function') onPresence(); }
      else touched = true;
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
    if (/lett(ino|o)?\b/.test(l) && /matr|dopp/.test(l)) return 'matrimoniale + lettino';
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
  function roomKind(r) { const n = r.persone.length; if (r.tipo === 'matrimoniale + lettino') return r.tipo; if (n === 1) return 'singola'; if (n === 2) return r.tipo === 'doppia' ? 'doppia' : 'matrimoniale'; if (n === 3) return 'tripla'; if (n === 4) return 'quadrupla'; return `${n} letti`; }
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
    if (room && room.tipo === 'matrimoniale + lettino' && idx >= 2) return 'inf';
    if (room && room.persone.length >= 3 && idx >= 2) return '3l';
    return 'ad';
  }
  // supplementi delle file: prezzario fisso in Impostazioni › Supplementi file (modificabile).
  // Tour: a persona AL GIORNO (moltiplicato per i giorni del tour). Gite in giornata: a persona.
  // Eventi e biglietteria: niente supplemento.
  const SUPPL_DEF = () => ({ tour: { 1: 8, 2: 6, 3: 4, 4: 2, p2: 6 }, gita: { 1: 4, 2: 3, 3: 2, 4: 1, p2: 3 } });
  const supplCfg = () => { const d = SUPPL_DEF(), c = (S && S.cfg && S.cfg.suppl) || {}; return { tour: Object.assign(d.tour, c.tour || {}), gita: Object.assign(d.gita, c.gita || {}) }; };
  const tripDays = t => !t.fine || t.fine === t.data ? 1 : Math.round((parseD(t.fine) - parseD(t.data)) / 864e5) + 1;
  // prezzi delle file per questo viaggio (già moltiplicati per i giorni nei tour); null se il viaggio non ha file a pagamento
  function supplPrices(t) {
    const c = tripCat(t); if (c !== 'tour' && c !== 'gita') return null;
    const P = supplCfg()[c]; const k = c === 'tour' ? tripDays(t) : 1; const o = {};
    [1, 2, 3, 4, 'p2'].forEach(x => { const v = +P[x]; o[x] = isNaN(v) ? 0 : Math.round(v * k * 100) / 100; });
    return o;
  }
  function supplOf(t, bk, p) {
    const SP = supplPrices(t); if (!SP) return 0;
    const paidFila = x => x && ((x.fila >= 1 && x.fila <= 4) || (x.zone && x.zone.includes('porta2')));
    const r = paidFila(p.req) ? p.req : (bk.pref && bk.pref.level === 'pagato' && paidFila(bk.pref) ? bk.pref : null);
    if (!r) return 0;
    if (r.fila >= 1 && r.fila <= 4) return SP[r.fila] || 0;
    if (r.zone && r.zone.includes('porta2')) return SP.p2 || 0;
    return 0;
  }
  function supplN() { return 4; }
  // posti di una fila (sommati su tutti i bus del viaggio), quanti l'hanno chiesta e quanti ne restano
  function filaInfo(t, D) {
    D = D || deriveBookings(t); const SP = supplPrices(t) || {};
    const B = t.buses.length ? t.buses : [{ layout: '52', seats: {} }];
    const capOf = test => B.reduce((a, b) => { const I = (LMAP[b.layout] || LMAP['52']).info; return a + I.all.filter(s => { const g = I.geo[s]; return g && !g.host && test(s, g, I) && !((b.seats || {})[s] || {}).res; }).length; }, 0);
    const pers = D.flatMap(bk => bk.persone);
    const rows = [1, 2, 3, 4].map(k => {
      const cap = capOf((s, g) => g.side !== 'c' && g.fila === k), capSx = capOf((s, g) => g.side === 'sx' && g.fila === k), capDx = capOf((s, g) => g.side === 'dx' && g.fila === k);
      const on = pers.filter(p => p.req && p.req.fila === k); const sold = on.length, sSx = on.filter(p => p.req.lato === 'sx').length, sDx = on.filter(p => p.req.lato === 'dx').length;
      const free = Math.max(0, cap - sold);
      return { k, label: `${k}ª fila`, price: SP[k], cap, sold, free, freeSx: Math.min(free, Math.max(0, capSx - sSx)), freeDx: Math.min(free, Math.max(0, capDx - sDx)) };
    });
    const pcap = capOf((s, g, I) => I.porta2.has(s)); const psold = pers.filter(p => p.req && !(p.req.fila > 0) && (p.req.zone || []).includes('porta2')).length;
    return { rows, porta: { k: 'p2', label: '1ª fila 2ª porta', price: SP.p2, cap: pcap, sold: psold, free: Math.max(0, pcap - psold) }, days: tripCat(t) === 'tour' ? tripDays(t) : 1 };
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
    const tk = ticketOf(t, tipo, p); if (tk == null) return null;
    if (base == null && (tk || isBigl(t))) base = 0;
    if (base == null) return null;
    return base + supplOf(t, bk, p) + tk;
  }
  // biglietto dell'evento (intero o ridotto) + diritti di prevendita, per chi lo compra con l'agenzia
  const isBigl = t => t.cat === 'biglietteria';
  // ---- tipi di biglietto (2.1.8) ----
  // Negli eventi si possono avere più tipi di biglietto (es. Parterre, Tribuna), ognuno con intero e ridotto.
  // Se il viaggio è collegato a un evento della Biglietteria valgono i settori, i diritti e il circuito di quell'evento;
  // altrimenti quelli scritti in testa alla lista (quota.tsett). Prima della 2.1.8: un solo biglietto, quota.tkt1 e quota.tkt2.
  const tkN = v => (v === '' || v == null || isNaN(+v) ? null : +v);
  // regola della 2.1.8 (biglietto solo a chi ha la «fila» scritta, fila = fila del biglietto, prezzi dalla Biglietteria se collegato):
  // vale per gli eventi creati dalla 2.1.8 e per quelli passati alla regola nuova (t.tkFila). Gli eventi di prima restano come erano.
  const evFila = t => !!t && tripCat(t) === 'evento' && !!t.tkFila;
  function tripTkt(t) {
    const c = t ? tripCat(t) : ''; const Q = (t && t.quota) || {};
    if (c !== 'evento' && c !== 'biglietteria') return { ev: null, sett: [], dir: 0, circ: '' };
    const e = evFila(t) && typeof bgTripEv === 'function' ? bgTripEv(t) : null;
    if (e) return { ev: e, sett: (e.settori || []).map(s => ({ id: s.id, nome: String(s.nome || '').trim(), intero: tkN(s.intero), ridotto: +s.ridotto ? +s.ridotto : null })), dir: +e.dir || 0, circ: e.circ || '' };
    const L = Array.isArray(Q.tsett) ? Q.tsett : (Q.tkt1 != null || Q.tkt2 != null ? [{ id: 'tk', nome: '', intero: Q.tkt1, ridotto: Q.tkt2 }] : []);
    // un tipo con il nome ma senza prezzo resta (chi lo ha nella fila ha la quota «—» finché non si scrive il prezzo)
    const sett = L.map(s => ({ id: s.id, nome: String(s.nome || '').trim(), intero: tkN(s.intero), ridotto: tkN(s.ridotto) })).filter(s => s.nome || s.intero != null || s.ridotto != null);
    return { ev: null, sett, dir: sett.length ? +Q.diritti || 0 : 0, circ: Q.circuito || '' };
  }
  const tkNorm = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // il biglietto di una persona (null = non lo compra con noi, paga solo il bus).
  // Eventi: il biglietto c'è solo se la colonna «fila» è scritta; se nella fila c'è il nome di un tipo si usa quello, altrimenti il primo.
  // Ridotto per bambini e neonati, se il tipo ha il prezzo ridotto.
  function personTkt(t, p, tipo, TK) {
    TK = TK || tripTkt(t); if (!TK.sett.length || tipo === 'free') return null;
    const fila = String((p && p.row ? p.row.fila : p && p.fila) || '').trim();
    if (evFila(t) && !fila) return null;
    const f = ' ' + tkNorm(fila) + ' '; let s = null;
    TK.sett.forEach(x => { const n = tkNorm(x.nome); if (n && f.includes(' ' + n + ' ') && (!s || n.length > tkNorm(s.nome).length)) s = x; });
    s = s || TK.sett[0];
    const rid = (tipo === 'bam' || tipo === 'inf') && s.ridotto != null;
    const prezzo = rid ? s.ridotto : (s.intero != null ? s.intero : s.ridotto);
    return { s, nome: s.nome || 'Biglietto', rid, prezzo: prezzo == null ? null : +prezzo, dir: TK.dir };
  }
  // data di emissione scritta nella lista («05/11/26», «5/11/2026», «5/11» o «2026-11-05») → «2026-11-05»; '' se non si capisce
  function emisISO(v) {
    v = String(v || '').trim(); if (!v) return ''; let m;
    if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v))) return v;
    if (!(m = /^(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2}|\d{4}))?$/.exec(v))) return '';
    const d = +m[1], mo = +m[2]; const T0 = todayISO(); let y = m[3] ? +m[3] : +T0.slice(0, 4); if (y < 100) y += 2000;
    // senza anno: l'emissione è già avvenuta, quindi una data che cadrebbe nel futuro è dell'anno scorso (es. 28/12 scritto a gennaio)
    if (!m[3] && `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` > T0) y--;
    if (mo < 1 || mo > 12 || d < 1 || d > new Date(y, mo, 0).getDate()) return '';
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  // null = il tipo di biglietto non ha ancora il prezzo
  function ticketOf(t, tipo, p) { const x = personTkt(t, p, tipo); return x ? (x.prezzo == null ? null : x.prezzo + x.dir) : 0; }
  function bkMoney(t, bk) {
    const ctx = new Map(); roomsOf(bk).forEach(r => r.persone.forEach((p, i) => ctx.set(p.id, { room: r, idx: i })));
    let due = 0, unknown = false;
    const per = bk.persone.map(p => { const c = ctx.get(p.id) || {}; const v = personPrice(t, bk, p, c.room, c.idx); if (v == null) unknown = true; else due += v; return { v, tipo: p.tipo || autoTipo(t, p, c.room, c.idx) }; });
    const paid = (bk.pagamenti || []).reduce((a, x) => a + (+x.importo || 0), 0) + (t && t.id && bk.id && typeof paidMovs === 'function' ? paidMovs(t.id, bk.id) : 0);
    const saldato = !unknown && paid >= due - 0.009;
    return { due: unknown ? null : due, paid, rest: unknown ? null : Math.max(0, due - paid), saldato, per, extra: unknown ? 0 : Math.max(0, paid - due) };
  }
  // ---- comitive: ognuno può pagare la sua quota ----
  const rnd2 = v => Math.round((+v || 0) * 100) / 100;
  // quota, pagato e da pagare di una sola persona (da pagare non supera mai quello che manca a tutta la prenotazione)
  function personMoney(t, bk, pid) {
    const m = bk._m || bkMoney(t, bk); const i = bk.persone.findIndex(p => p.id === pid); const per = m.per[i] || {};
    const paid = pidPaid(t.id, bk.id, pid); const due = per.v;
    const rest = due == null ? null : rnd2(Math.max(0, Math.min(due - paid, m.rest == null ? Infinity : m.rest)));
    return { due, paid, rest, tipo: per.tipo, i };
  }
  // la parte che paga il capogruppo: tutti tranne chi ha già pagato per conto suo
  function groupMoney(t, bk) {
    const m = bk._m || bkMoney(t, bk);
    const indiv = bk.persone.filter(p => Math.abs(pidPaid(t.id, bk.id, p.id)) > 0.009).map(p => p.id);
    if (!indiv.length) return { due: m.due, paid: m.paid, rest: m.rest, incl: bk.persone.map(p => p.id), indiv, m };
    const incl = bk.persone.filter(p => !indiv.includes(p.id)); let due = 0, unk = false;
    incl.forEach(p => { const v = (m.per[bk.persone.indexOf(p)] || {}).v; if (v == null) unk = true; else due += v; });
    const paid = rnd2(m.paid - indiv.reduce((a, id) => a + pidPaid(t.id, bk.id, id), 0));
    return { due: unk ? null : rnd2(due), paid, rest: unk ? null : rnd2(Math.max(0, Math.min(due - paid, m.rest == null ? Infinity : m.rest))), incl: incl.map(p => p.id), indiv, m };
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
    const out = [], warn = [], raw = [], staff = []; let cur = null, left = 0, guida = false, prevFila = '';
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
        // accompagnatore, autista, guida con la loro camera (servono alla rooming list)
        for (let j = i; j < rows.length && j < i + 8; j++) {
          const rr = rows[j]; if (/lista d.?attesa|non partono|supplementi/i.test(rr.join(' '))) break;
          const o2 = /^(\d{1,3}|-+|)$/.test(String(rr[0] || '').trim()) ? 0 : -1; const ro = String(rr[1 + o2] || '').trim();
          if (!/^(accompagnat|autist|guida|hostess|capogruppo)/i.test(ro)) continue;
          const gg = k => idx[k] >= 0 ? String(rr[idx[k] + o2] || '').trim() : '';
          staff.push({ ruolo: ro.charAt(0).toUpperCase() + ro.slice(1).toLowerCase(), nome: String(rr[2 + o2] || '').trim(), camera: gg('hotel') ? normCam(gg('hotel')) : '', num: gg('cam') });
        }
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
    return { bookings: out, warn, guida, raw, staff };
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
  // Piantina scritta come in ufficio: nel primo posto della coppia i cognomi (con il nome o la sua iniziale),
  // nel secondo «X 2», «X 5»…; chi è da solo ha cognome, nome e «X 1» nel suo posto;
  // il posto vuoto accanto all'ultimo di un gruppo è barrato.
  // 2.1.14: in ogni fila del gruppo i nomi di chi siede proprio lì (con 3 posti vicini il terzo va sotto il secondo),
  // nome intero se ci sta; nel riquadro «X N», in alto a destra, la fila pagata con il supplemento.
  function officeLabels(b) {
    const I = LMAP[b.layout].info; const out = {};
    const t = ((S && S.trips) || []).find(x => (x.buses || []).includes(b));
    const nm = p => { const c = String(p.cognome || '').toUpperCase().trim(), n = String(p.nome || '').trim(); if (!n || /^\(/.test(n)) return c; const full = `${c} ${n.toUpperCase()}`; return full.length <= 16 ? full : `${c} ${n[0].toUpperCase()}.`; };
    const paidFila = x => x && ((x.fila >= 1 && x.fila <= 4) || (x.zone || []).includes('porta2'));
    const filaLbl = (bk, ps) => { if (!t) return ''; const B = bk.full || bk; const L = []; ps.forEach(p => { if (!(supplOf(t, B, p) > 0)) return; const r = paidFila(p.req) ? p.req : B.pref; if (!paidFila(r)) return; const s = r.fila >= 1 && r.fila <= 4 ? `${r.fila}ª fila` : '2ª porta'; if (!L.includes(s)) L.push(s); }); return L.join(' · '); };
    b.bookings.forEach(bk => {
      const cls = seatClusters(b, bk); const total = bk.full ? bk.full.persone.length : bk.persone.length;
      cls.forEach(cl => {
        const ps = bk.persone.filter(p => cl.some(s => b.seats[s] && b.seats[s].pid === p.id));
        if (!ps.length) return;
        const n = cls.length > 1 || bk.persone.length < total ? ps.length : total;
        const single = n === 1 ? [String(ps[0].cognome || '').toUpperCase(), String(ps[0].nome || '').toUpperCase()].filter(Boolean) : null;
        const who = s => { const a = b.seats[s]; return a ? ps.find(p => p.id === a.pid) : null; };
        const byRow = {}; cl.forEach(s => { const g = I.geo[s]; const k = g.floor * 1000 + g.row; (byRow[k] = byRow[k] || []).push(s); });
        Object.values(byRow).forEach(seats => {
          seats.sort((x, y) => I.geo[x].col - I.geo[y].col);
          const runs = []; let cur = [];
          seats.forEach(s => { if (cur.length && I.geo[s].col !== I.geo[cur[cur.length - 1]].col + 1) { runs.push(cur); cur = []; } cur.push(s); });
          if (cur.length) runs.push(cur);
          runs.forEach(r => {
            const occ = r.map(who).filter(Boolean); const lines = single || occ.map(nm); const fila = filaLbl(bk, occ);
            if (r.length === 1) { out[r[0]] = { t: 'both', lines, x: n, fila }; return; }
            const m = Math.floor((r.length - 1) / 2);
            r.forEach(s => { out[s] = { t: 'occ' }; }); out[r[m]] = { t: 'names', lines }; out[r[m + 1]] = { t: 'x', x: n, fila };
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
    const attrs = drag => o.interactive ? ` data-seat="${esc(s)}" tabindex="0" draggable="${esc(drag)}"` : '';
    if (a && a.res) {
      cls += ' res cross'; inner += `<span class="ores">${esc(/guida/i.test(a.res) ? 'GUIDA o 2° AUTISTA' : a.res)}</span>`;
      return `<div class="${esc(cls)}" style="${esc(style)}"${attrs(false)}>${inner}</div>`;
    }
    let filled = false;
    if (a) {
      const bk = bkById(b, a.b); const p = bk && bk.persone.find(x => x.id === a.pid);
      if (bk && p) {
        filled = true; cls += ' occ';
        if (!o.print) style += `;background:${COLORS[(bk.c || 0) % COLORS.length]}`;
        title = `Posto ${s}: ${p.cognome} ${p.nome} — ${bkName(bk)} x ${bk.full ? bk.full.persone.length : bk.persone.length}${p.part ? ' · ' + p.part : ''}${p.np ? ' · ' + p.np : ''}`;
        if (lab && (lab.t === 'names' || lab.t === 'both')) inner += `<span class="ol${lab.lines.length > 2 ? ' l3' : ''}">${lab.lines.map(esc).join('<br>')}</span>`;
        if (lab && lab.t === 'both') cls += ' both';
        if (lab && (lab.t === 'x' || lab.t === 'both')) inner += `<span class="ox${esc(lab.t === 'both' ? ' in' : '')}">X ${esc(lab.x)}</span>`;
        if (lab && lab.fila && (lab.t === 'x' || lab.t === 'both')) inner += `<span class="ofila">${esc(lab.fila)}</span>`;
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
    return `<div class="${esc(cls)}" style="${esc(style)}"${title ? ` title="${esc(title)}"` : ''}${attrs(filled)}>${inner}</div>`;
  }
  function rowHTML(row, b, o) {
    let hasSeat = false; let h = '';
    row.forEach(c => {
      const ci = cellInfo(c); const sp = `grid-column:span ${ci.c}`;
      if (ci.t === 'seat') { hasSeat = true; h += o.mini ? `<div class="c seat${esc(ci.h ? ' host' : '')}" style="${esc(sp)}"><span class="sn">${ci.s}</span></div>` : seatCell(b, ci.s, ci.h, ci.c, o); }
      else if (ci.t === 'aisle') h += `<div class="c aisle" style="${esc(sp)}"></div>`;
      else if (ci.t === 'void') h += `<div class="c void" style="${esc(sp)}"></div>`;
      else if (ci.t === 'logo') h += `<div class="c logo" style="${esc(sp)};background-image:url(${LOGO})"></div>`;
      else {
        const label = ci.f === 'autista' && b && b.autista && !o.mini ? `autista<small>${esc(b.autista)}</small>` : esc(ci.f);
        h += `<div class="c feat feat-${esc(ci.f)}" style="${esc(sp)}">${label}</div>`;
      }
    });
    return `<div class="${esc(o.print ? 'prow' : 'row')}${hasSeat ? '' : ' thin'}">${h}</div>`;
  }
  function deckHTML(b, L, fi, o) {
    const fl = L.floors[fi]; if (b && !o.lab) o.lab = officeLabels(b);
    return `<div class="deck">${fi === 0 ? '<span class="front">Davanti</span>' : '<span class="front">Davanti · piano sopra</span>'}${fl.nome ? `<div class="fname">${esc(fl.nome)}</div>` : ''}${fl.rows.map(r => rowHTML(r, b, o)).join('')}</div>`;
  }

  // ---------- la lista della gita (come il file Word) ----------
  // t.rows = righe della tabella partecipanti, scritte come in Word: «Rossi x 3» sulla prima riga e poi le altre persone.
  // Le prenotazioni si ricavano dalle righe; ogni riga sa su quale bus è (row.bus) e i bus sanno quale posto ha ogni persona.
  const ROWF = ['cognome', 'nome', 'nascita', 'tel', 'natoA', 'part', 'hotel', 'cam', 'fila', 'emis', 'note', 'nota2', 'pagato'];
  const blankRow = () => ({ id: uid(), cognome: '', nome: '', nascita: '', tel: '', natoA: '', part: '', hotel: '', cam: '', fila: '', emis: '', note: '', nota2: '', pagato: '' });
  const blankAtt = () => ({ id: uid(), cognome: '', nome: '', nascita: '', tel: '', part: '', note: '', richiesta: '', avviso: '', risposta: '' });
  const isEmptyRow = r => !ROWF.some(f => String(r[f] || '').trim()) && !['richiesta', 'avviso', 'risposta', 'dataAnn'].some(f => String(r[f] || '').trim());
  function tripInit(t) {
    t.quota = t.quota || {}; t.quota.suppl = t.quota.suppl || {};
    t.rows = t.rows || []; t.attesa = t.attesa || []; t.annullati = t.annullati || []; t.partenze = t.partenze || []; t.buses = t.buses || [];
    return t;
  }
  const isTourT = t => !!(t.fine && t.fine !== t.data) || (t.rows || []).some(r => r.hotel || r.cam);
  // ---- una lista per ogni bus ----
  // Con due o più bus ogni bus ha la sua lista (righe con row.bus = id del bus) e c'è la lista «Senza bus» per chi non è ancora su un bus.
  // Con un bus solo (o nessuno) la lista è una sola, come prima.
  const multiBus = t => (t.buses || []).length > 1;
  const listKey = (t, r) => (multiBus(t) && r.bus && t.buses.some(b => b.id === r.bus) ? r.bus : '');
  function tripLists(t) {
    if (!multiBus(t)) return [{ id: '', label: 'Lista prenotazioni', b: null }];
    return t.buses.map(b => ({ id: b.id, label: 'Lista ' + b.label, b })).concat([{ id: '', label: 'Senza bus', b: null }]);
  }
  const listRows = (t, id) => multiBus(t) ? t.rows.filter(r => listKey(t, r) === id) : t.rows;
  const listName = (t, id) => { const l = tripLists(t).find(x => x.id === (id || '')); return l ? l.label : 'Lista'; };
  function ensureBlank(t) {
    tripInit(t);
    if (multiBus(t)) {
      t.buses.forEach(b => { const rs = t.rows.filter(r => listKey(t, r) === b.id); let k = 0; for (let i = rs.length - 1; i >= 0 && isEmptyRow(rs[i]); i--) k++; while (k < 3) { t.rows.push(Object.assign(blankRow(), { bus: b.id })); k++; } });
    } else { let k = 0; for (let i = t.rows.length - 1; i >= 0 && isEmptyRow(t.rows[i]); i--) k++; while (k < 3) { t.rows.push(blankRow()); k++; } }
    let a = 0; for (let i = t.attesa.length - 1; i >= 0 && isEmptyRow(t.attesa[i]); i--) a++;
    while (a < 2) { t.attesa.push(blankAtt()); a++; }
  }
  // le righe si leggono come in Word: «Rossi x 3» e sotto le altre due persone. Ogni lista si legge per conto suo.
  // Chi è stato spostato da solo in un'altra lista resta nella sua comitiva: la riga porta row.g = id della riga del capogruppo.
  // ev = evento: la «fila» è quella del biglietto del concerto, non dà richieste per il posto sul bus (2.1.8)
  function rowPerson(r, i, m, isHead, prevFila, ev) {
    let filaTxt = String(r.fila || '').trim();
    if (/^fila\.?$/i.test(filaTxt) && !isHead && prevFila) filaTxt = prevFila + ' fila';
    const cg = String(r.cognome || '').trim(), nm = String(r.nome || '').trim();
    const note = String(r.note || '').trim();
    const fr = filaTxt && !ev ? reqFromFila(filaTxt) : null;
    const nr = (!isHead && note) ? reqFromNote(note) : null;
    const p = { id: r.id, row: r, riga: i + 1, cognome: m ? m[1].trim() : cg, nome: nm, tel: r.tel || '', part: String(r.part || '').toUpperCase(), nascita: r.nascita || '', natoA: r.natoA || '', note: [filaTxt, note].filter(Boolean).join(' · '), np: r.np || '', req: fr, _nr: nr, reqTxt: filaTxt, _fila: filaTxt };
    const hot = String(r.hotel || '').trim(), cam = String(r.cam || '').trim();
    p.room = !!cam || (!!hot && !isExtraBed(hot)); if (hot) p.camera = normCam(hot); if (cam) p.ncam = cam;
    const pg = String(r.pagato || '').trim();
    if (/^g(ratis|ratuito)?\.?$/i.test(pg)) p.tipo = 'free';
    p._paid = parseEuro(pg) || 0;
    return p;
  }
  // lettura «una riga dopo l'altra» di un elenco di righe (con le righe fissate a un capogruppo messe da parte)
  function seqGroups(t, rows, pinned, pinCount, ix) {
    ix = ix || new Map(t.rows.map((r, i) => [r.id, i])); const out = []; let cur = null, left = 0, prevFila = ''; const ev = evFila(t);
    rows.forEach(r => {
      const cg = String(r.cognome || '').trim(), nm = String(r.nome || '').trim();
      // riga vuota dentro una comitiva non ancora completa: è il posto riservato per chi manca (non fa entrare chi sta sotto)
      if (!cg && !nm) { if (left > 0 && cur) { left--; cur.last = r.id; } return; }
      if (pinned && pinned.has(r.id)) return;
      const i = ix.get(r.id); const m = RX.exec(cg);
      const note = String(r.note || '').trim();
      // persona staccata dalla sua comitiva: prenotazione a sé, la comitiva sopra continua
      if (r.solo && !m) { const p = rowPerson(r, i, null, true, '', ev); delete p._fila; out.push({ id: r.id, n: 1, persone: [p], ord: i + 1, pref: note ? reqFromNote(note) : null, head: r, last: r.id }); return; }
      const isHead = !!m || left === 0;
      const p = rowPerson(r, i, m, isHead, prevFila, ev); prevFila = p._fila; delete p._fila;
      if (m) { cur = { id: r.id, n: +m[2], persone: [p], ord: i + 1, pref: note ? reqFromNote(note) : null, head: r, last: r.id }; out.push(cur); left = Math.max(0, cur.n - 1 - ((pinCount && pinCount[r.id]) || 0)); }
      else if (left > 0) { cur.persone.push(p); cur.last = r.id; left--; }
      else { cur = { id: r.id, n: 1, persone: [p], ord: i + 1, pref: note ? reqFromNote(note) : null, head: r, last: r.id }; out.push(cur); }
    });
    return out;
  }
  function deriveBookings(t) {
    tripInit(t);
    if (multiBus(t) && !t.gv) legacyPins(t);
    const live = new Set(t.rows.filter(r => !isEmptyRow(r) && (String(r.cognome || '').trim() || String(r.nome || '').trim())).map(r => r.id));
    const byId = new Map(t.rows.map(r => [r.id, r]));
    // righe fissate a un capogruppo che esiste ancora (e che non è a sua volta fissato ad altri)
    const pinned = new Set(); const pinCount = {};
    t.rows.forEach(r => { if (!r.g || r.g === r.id || !live.has(r.id) || !live.has(r.g)) return; const h = byId.get(r.g); if (h.g && h.g !== h.id && live.has(h.g)) return; pinned.add(r.id); pinCount[r.g] = (pinCount[r.g] || 0) + 1; });
    const out = []; const ix = new Map(t.rows.map((r, i) => [r.id, i]));
    tripLists(t).forEach(L => out.push(...seqGroups(t, listRows(t, L.id), pinned, pinCount, ix)));
    if (pinned.size) {
      const byP = new Map(); out.forEach(g => g.persone.forEach(p => byP.set(p.id, g)));
      t.rows.forEach((r, i) => {
        if (!pinned.has(r.id)) return; let g = byP.get(r.g);
        const p = rowPerson(r, i, null, false, '', evFila(t)); delete p._fila;
        if (!g) { g = { id: r.id, n: 1, persone: [], ord: i + 1, pref: null, head: r }; out.push(g); }
        g.persone.push(p); byP.set(r.id, g);
      });
      // l'ordine dentro la comitiva resta quello di prima dello spostamento (conta per le camere): row.go
      const go = p => (p.row.go != null ? +p.row.go : 1e6 + p.riga);
      out.forEach(g => { if (g.persone.length > 1) { const h = g.persone[0]; const rest = g.persone.slice(1).sort((a, b) => go(a) - go(b) || a.riga - b.riga); g.persone = [h, ...rest]; } });
    }
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
  // viaggi che avevano già più bus prima delle liste separate: le comitive divise tra due bus restano unite
  function legacyPins(t) {
    t.gv = 1;
    seqGroups(t, t.rows, null, null).forEach(g => { if (g.persone.length > 1) g.persone.slice(1).forEach((p, i) => { if (p.row.g !== g.id) p.row.g = g.id; p.row.go = i + 1; }); });
  }
  // prima di cambiare bus (o lista) a qualcuno: le comitive coinvolte restano unite anche se finiscono in liste diverse
  function pinGroup(t, ids) {
    const want = new Set(ids); const D = deriveBookings(t);
    D.forEach(bk => { if (bk.persone.length < 2 || !bk.persone.some(p => want.has(p.id))) return; bk.persone.slice(1).forEach((p, i) => { if (p.row.g !== bk.id) p.row.g = bk.id; if (p.row.go !== i + 1) p.row.go = i + 1; }); });
  }
  function setRowBus(t, r, busId) { if ((r.bus || '') === (busId || '')) return; unseatRow(t, r); if (busId) r.bus = busId; else delete r.bus; }
  // sposta delle righe in un'altra lista (bus): perdono il posto sul vecchio bus e vanno in fondo alla nuova lista
  function moveRowsToList(t, ids, busId) {
    const set = new Set(ids); const rows = t.rows.filter(r => set.has(r.id) && !isEmptyRow(r)); if (!rows.length) return 0;
    const before = groupMap(t); headsStay(t, rows.map(r => r.id));
    pinGroup(t, rows.map(r => r.id));
    rows.forEach(r => setRowBus(t, r, busId));
    // in fondo alla lista di destinazione, prima delle sue righe vuote
    t.rows = t.rows.filter(r => !set.has(r.id));
    const tgt = t.rows.filter(r => listKey(t, r) === (busId || '')); let k = tgt.length; while (k > 0 && isEmptyRow(tgt[k - 1])) k--;
    const at = k < tgt.length ? t.rows.indexOf(tgt[k]) : k > 0 ? t.rows.indexOf(tgt[k - 1]) + 1 : t.rows.length; t.rows.splice(at, 0, ...rows);
    keepGroups(t, before);
    return rows.length;
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
    // posti in sospeso (2.1.14): restano solo le persone ancora su questo bus e ancora senza posto
    if (Array.isArray(b.sosp) && b.sosp.length) { const on = new Set(); (t.buses || []).forEach(x => { for (const s in x.seats) if (x.seats[s].pid) on.add(x.seats[s].pid); }); const keep = b.sosp.filter((pid, i, arr) => typeof pid === 'string' && arr.indexOf(pid) === i && pmap[pid] && pmap[pid].p.row.bus === b.id && !on.has(pid)); if (keep.length !== b.sosp.length) b.sosp = keep; }
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
    if (multiBus(t)) pinGroup(t, bk.persone.map(p => p.id));
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
    if (multiBus(t) && r.bus !== b.id) pinGroup(t, [pid]);
    unseatRow(t, r); r.bus = b.id;
    const D = syncAll(t); const bk = D.find(x => x.persone.some(p => p.id === pid));
    giveColor(t, b, bk); b.seats[s] = { pid, b: bk.id }; syncAll(t);
    return { ok: true };
  }
  function toBusAuto(t, bkIds, b) {
    let D = syncAll(t); if (multiBus(t)) { pinGroup(t, D.filter(x => bkIds.includes(x.id)).flatMap(x => x.persone.map(p => p.id))); D = syncAll(t); }
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
    const order = ['singola', 'doppia', 'matrimoniale', 'matrimoniale + lettino', 'tripla', 'quadrupla'];
    const pl = { singola: 'singole', doppia: 'doppie', matrimoniale: 'matrimoniali', 'matrimoniale + lettino': 'matrimoniali + lettino', tripla: 'triple', quadrupla: 'quadruple' };
    return Object.keys(rooms).sort((a, c) => order.indexOf(a) - order.indexOf(c)).map(k => `${rooms[k]} ${rooms[k] > 1 ? (pl[k] || k) : k}`).join(' · ');
  }

  // «Rossi x 3» diventa «Rossi x 5»: sotto la comitiva servono 2 righe in più; chi c'era sotto scende
  function growGroup(t, r, oldV, nNew) {
    const now = r.cognome; r.cognome = oldV || ''; let D0; try { D0 = deriveBookings(t); } finally { r.cognome = now; }
    const bk = D0.find(b => b.id === r.id);
    const lastId = bk ? (bk.last || bk.persone[bk.persone.length - 1].id) : r.id;
    const slots = bk ? Math.max(bk.n, bk.persone.length) : 1;
    let need = nNew - slots; if (need <= 0) return 0;
    const lk = listKey(t, r); const rows = listRows(t, lk); let k = rows.findIndex(x => x.id === lastId) + 1;
    while (need > 0 && k < rows.length && isEmptyRow(rows[k])) { need--; k++; }
    if (need <= 0) return 0;
    const at = t.rows.findIndex(x => x.id === lastId) + 1;
    const add = Array.from({ length: need }, () => Object.assign(blankRow(), multiBus(t) && r.bus ? { bus: r.bus } : {}));
    t.rows.splice(at, 0, ...add); return need;
  }
  // persone nella lista (o nel bus) contando anche i nomi che mancano nelle comitive
  function listLoad(t, lk) {
    const D = deriveBookings(t); let n = 0;
    D.forEach(bk => { bk.persone.forEach(p => { if (listKey(t, p.row) === lk) n++; }); if (listKey(t, bk.head) === lk) n += Math.max(0, bk.n - bk.persone.length); });
    return n;
  }
  // ---- posti finiti (2.1.8) ----
  // Chi in lista è oltre i posti dei bus (contando anche i nomi che mancano nelle comitive «x N»).
  // Ogni bus: posti del modello meno quelli bloccati. Chi è in «Senza bus» occupa i posti rimasti liberi negli altri bus.
  const busCap = b => LMAP[b.layout].info.cap - Object.values(b.seats || {}).filter(x => x.res).length;
  function overCap(t, D) {
    const out = { ids: new Set(), cap: 0, n: 0, free: 0 }; if (!t || !t.buses || !t.buses.length || tripCat(t) === 'biglietteria') return out;
    D = D || deriveBookings(t); const multi = multiBus(t);
    // si conta riga per riga, nell'ordine della lista (anche chi è stato spostato da solo in un altro bus conta dove si trova);
    // i nomi che mancano in una comitiva «x N» occupano posti subito dopo la sua ultima riga
    const pids = new Set(); const miss = new Map();
    D.forEach(bk => { bk.persone.forEach(p => pids.add(p.id)); const k = Math.max(0, bk.n - bk.persone.length); if (k) { const at = bk.last || bk.head.id; miss.set(at, (miss.get(at) || 0) + k); } });
    const walk = (rows, cap) => { let n = 0; rows.forEach(r => { if (pids.has(r.id)) { n++; if (n > cap) out.ids.add(r.id); } if (miss.has(r.id)) n += miss.get(r.id); }); return n; };
    let spare = 0;
    const lists = multi ? t.buses.map(b => ({ id: b.id, cap: busCap(b) })) : [{ id: '', cap: t.buses.reduce((a, b) => a + busCap(b), 0) }];
    lists.forEach(L => { const n = walk(listRows(t, L.id), L.cap); out.cap += L.cap; out.n += n; spare += Math.max(0, L.cap - n); });
    if (multi) { const n = walk(listRows(t, ''), spare); out.n += n; spare = Math.max(0, spare - n); }
    out.free = spare; return out;
  }
  // staccare una persona dalla sua comitiva (resta traccia sulla riga).
  // Se si stacca il capogruppo, il suo posto lo prende il secondo: diventa «Cognome x N-1» e la prenotazione
  // (incassi, colore, cliente abituale, saldato) passa a lui.
  function detachRow(t, id, who) {
    const D = deriveBookings(t); const bk = D.find(b => b.persone.some(p => p.id === id)); if (!bk || bk.persone.length < 2) return null;
    const r = rowById(t, id); const h = bk.head; const m = RX.exec(String(h.cognome || '').trim());
    const N = Math.max(bk.n, bk.persone.length); const from = `${bkName(bk)} x ${N}`; const at = new Date().toISOString();
    if (bk.id !== id) {
      if (m) h.cognome = `${m[1].trim()} x ${Math.max(1, +m[2] - 1)}`;
      r.solo = true; delete r.g; delete r.go;
      r.stacc = { da: from, hid: bk.id, il: at, chi: who || '' };
      return { from, bk };
    }
    // capogruppo: prende il suo posto chi viene subito dopo di lui nella stessa lista (2.1.14: prima era il secondo
    // della comitiva anche se stava in un'altra lista, e chi era sotto restava senza «x N»)
    const nhP = nextInList(t, bk, h, [id]) || bk.persone[1];
    const nh = nhP.row; const base = String(nh.cognome || '').replace(RX, '$1').trim() || nhP.cognome;
    nh.cognome = `${base} x ${N - 1}`; delete nh.g; delete nh.go;
    ['abituale', 'saldato', 'c', 'waOk', 'waSent'].forEach(k => { if (h[k] != null && nh[k] == null) nh[k] = h[k]; });
    t.rows.forEach(x => { if (x.g === bk.id && x !== nh) x.g = nh.id; });
    t.bkMap = t.bkMap || {}; t.bkMap[bk.id] = nh.id; Object.keys(t.bkMap).forEach(k => { if (t.bkMap[k] === bk.id) t.bkMap[k] = nh.id; });
    h.cognome = m ? m[1].trim() : h.cognome; h.solo = true; delete h.g; delete h.go; delete h.saldato; delete h.abituale;
    h.stacc = { da: from, hid: nh.id, il: at, chi: who || '', capo: true };
    // la riga del nuovo capogruppo va dove era quella del vecchio (la comitiva non cambia posto nella lista)
    const i0 = t.rows.indexOf(h), i1 = t.rows.indexOf(nh); if (i0 >= 0 && i1 > i0 && listKey(t, nh) === listKey(t, h)) { t.rows.splice(i1, 1); t.rows.splice(i0, 0, nh); }
    if (typeof pmReset === 'function') pmReset();
    return { from, bk, capo: true, nuovo: base };
  }
  // ---- 2.1.14: spostamenti nella lista senza sorprese ----
  // la prima persona della comitiva (esclusi gli ids) che sta nella stessa lista della riga «ref», nell'ordine della lista
  function nextInList(t, bk, ref, skip) {
    const no = new Set(skip || []); const lk = listKey(t, ref); const ix = new Map(t.rows.map((r, i) => [r.id, i]));
    const rest = bk.persone.filter(p => p.id !== bk.id && !no.has(p.id));
    const same = rest.filter(p => listKey(t, p.row) === lk).sort((a, b) => ix.get(a.id) - ix.get(b.id));
    return same[0] || rest[0] || null;
  }
  // il capogruppo viene spostato da solo: «Cognome x N» passa a chi resta (la comitiva non resta senza numero)
  // e lui resta nella comitiva come gli altri. Incassi, colore, abituale e saldato passano al nuovo capogruppo.
  function passHead(t, bk, nhP) {
    const h = bk.head; const m = RX.exec(String(h.cognome || '').trim()); if (!m || !nhP || nhP.row === h) return false;
    const nh = nhP.row; const N = Math.max(bk.n, bk.persone.length);
    const base = String(nh.cognome || '').replace(RX, '$1').trim() || nhP.cognome;
    nh.cognome = `${base} x ${N}`; delete nh.g; delete nh.go; delete nh.solo;
    ['abituale', 'saldato', 'c', 'waOk', 'waSent'].forEach(k => { if (h[k] != null) { if (nh[k] == null) nh[k] = h[k]; delete h[k]; } });
    h.cognome = m[1].trim(); h.g = nh.id; h.go = 0;
    t.rows.forEach(x => { if (x.g === bk.id && x !== nh) x.g = nh.id; });
    t.bkMap = t.bkMap || {}; t.bkMap[bk.id] = nh.id; Object.keys(t.bkMap).forEach(k => { if (t.bkMap[k] === bk.id) t.bkMap[k] = nh.id; });
    if (typeof pmReset === 'function') pmReset();
    return true;
  }
  // prima di spostare delle righe: se un capogruppo si sposta senza la sua comitiva, il numero passa a chi resta
  function headsStay(t, ids) {
    const set = new Set(ids); let n = 0;
    deriveBookings(t).forEach(bk => { if (bk.persone.length < 2 || !set.has(bk.id)) return; const nhP = nextInList(t, bk, bk.head, ids); if (nhP && passHead(t, bk, nhP)) n++; });
    return n;
  }
  const normBk = (t, id) => { let x = id, k = 0; while (t.bkMap && t.bkMap[x] && k++ < 10) x = t.bkMap[x]; return x; };
  function groupMap(t) { const m = new Map(); deriveBookings(t).forEach(bk => bk.persone.forEach(p => m.set(p.id, { bk: bk.id, n: bk.persone.length }))); return m; }
  // dopo uno spostamento (o una riga tolta) nessuno deve entrare per sbaglio in un'altra comitiva: una comitiva
  // «x N» a cui mancano dei nomi prendeva chi le finiva sotto. Al suo posto si lasciano righe vuote (i nomi che mancano).
  function keepGroups(t, before) {
    for (let k = 0; k < 60; k++) {
      let fixed = false;
      for (const bk of deriveBookings(t)) {
        const own = normBk(t, bk.id);
        const intr = bk.persone.filter(p => p.id !== bk.id && !p.row.g && before.has(p.id) && before.get(p.id).n === 1 && normBk(t, before.get(p.id).bk) !== own);
        if (!intr.length) continue;
        const first = intr.map(p => p.row).sort((a, b) => t.rows.indexOf(a) - t.rows.indexOf(b))[0];
        t.rows.splice(t.rows.indexOf(first), 0, Object.assign(blankRow(), multiBus(t) && first.bus ? { bus: first.bus } : {}));
        fixed = true; break;
      }
      if (!fixed) return;
    }
  }
  // la prenotazione a cui appartengono gli incassi (se il capogruppo è stato staccato, passa al nuovo capogruppo)
  function resolveBk(tripId, bkId) { const t = S.trips.find(x => x.id === tripId); let id = bkId, n = 0; while (t && t.bkMap && t.bkMap[id] && n++ < 10) id = t.bkMap[id]; return id; }
  // spostare righe in un punto preciso della lista (anche in un'altra lista): prima o dopo la prenotazione su cui si lasciano.
  // Una persona spostata da sola resta nella sua comitiva (pagamento, cartelli) a meno che non la si stacchi.
  function moveRowsTo(t, ids, targetId, after) {
    const set = new Set(ids); const rows = t.rows.filter(r => set.has(r.id) && !isEmptyRow(r)); if (!rows.length || set.has(targetId)) return 0;
    const tgt = rowById(t, targetId); if (!tgt) return 0; const lk = listKey(t, tgt);
    const before = groupMap(t); headsStay(t, rows.map(r => r.id));
    pinGroup(t, rows.map(r => r.id));
    if (multiBus(t)) rows.forEach(r => setRowBus(t, r, lk));
    // non si entra in mezzo a un'altra comitiva: si va prima del suo capogruppo o dopo la sua ultima riga
    const D = deriveBookings(t); const tb = D.find(b => b.persone.some(p => p.id === targetId) && !b.persone.some(p => set.has(p.id)));
    let anchor = tgt;
    if (tb) { const own = tb.persone.filter(p => listKey(t, p.row) === lk).map(p => p.row); anchor = after ? own.reduce((a, x) => (t.rows.indexOf(x) > t.rows.indexOf(a) ? x : a), own[0]) : tb.head; if (tb.last && after) { const lr = rowById(t, tb.last); if (lr && t.rows.indexOf(lr) > t.rows.indexOf(anchor)) anchor = lr; } }
    t.rows = t.rows.filter(r => !set.has(r.id));
    const at = t.rows.indexOf(anchor) + (after ? 1 : 0); t.rows.splice(at, 0, ...rows);
    keepGroups(t, before);
    return rows.length;
  }
  // rimetterla nella comitiva da cui era stata staccata
  function reattachRow(t, id) {
    const r = rowById(t, id); if (!r || !r.stacc) return null; const h = rowById(t, r.stacc.hid); if (!h || isEmptyRow(h)) return null;
    const m = RX.exec(String(h.cognome || '').trim()); if (m) h.cognome = `${m[1].trim()} x ${+m[2] + 1}`;
    delete r.solo; r.g = h.id; delete r.go; const was = r.stacc.da; delete r.stacc; return was;
  }

  // ---------- servizi compresi nel viaggio (iconcine nell'elenco dei viaggi; si scelgono in «Modifica gita») ----------
  // Colorate quando il servizio c'è, grigie e trasparenti quando non c'è. Non valgono per la biglietteria.
  const SV = (body) => `<svg class="sv" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const SERV = [
    ['bus', 'Bus', SV('<rect x="2" y="5.5" width="20" height="11.5" rx="3" fill="#F5B83D"/><rect x="4" y="7.5" width="4" height="4" rx="1" fill="#3E86D8"/><rect x="9.5" y="7.5" width="4" height="4" rx="1" fill="#3E86D8"/><rect x="15" y="7.5" width="5" height="4" rx="1" fill="#3E86D8"/><rect x="2" y="13" width="20" height="1.4" fill="#E09A22"/><circle cx="7" cy="17.5" r="2.4" fill="#2B2B2B"/><circle cx="17" cy="17.5" r="2.4" fill="#2B2B2B"/><circle cx="7" cy="17.5" r="1" fill="#CFCFCF"/><circle cx="17" cy="17.5" r="1" fill="#CFCFCF"/>')],
    ['guide', 'Guide', SV('<path d="M13.5 21v-3.2h1.8a1.6 1.6 0 0 0 1.6-1.6v-2.6l1.7-.6-1.8-3.3A6.7 6.7 0 1 0 6.4 15v6z" fill="#5E3E91"/><path d="M19.6 8.3l2-1.1M20.2 11.6h2.3M19.6 14.9l2 1.1" stroke="#5E3E91" stroke-width="1.6" stroke-linecap="round"/>')],
    ['ristorante', 'Ristorante', SV('<ellipse cx="12" cy="16" rx="9.5" ry="4.6" fill="#E3DCC8"/><ellipse cx="12" cy="15.2" rx="6.6" ry="3" fill="#F3C64D"/><circle cx="10" cy="14.8" r="1.7" fill="#D2413C"/><circle cx="13.8" cy="15.6" r="1.5" fill="#D2413C"/><path d="M15.5 3v8.5M13.8 3v4.3a1.7 1.7 0 0 0 3.4 0V3" stroke="#9AA0A6" stroke-width="1.3" fill="none" stroke-linecap="round"/>')],
    ['hotel', 'Hotel', SV('<rect x="4.5" y="4" width="15" height="17" rx="1.6" fill="#E5624A"/><path d="M10 6v4.4M14 6v4.4M10 8.2h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><rect x="6.5" y="12.3" width="2.6" height="2.2" rx=".4" fill="#FFE7A3"/><rect x="10.7" y="12.3" width="2.6" height="2.2" rx=".4" fill="#FFE7A3"/><rect x="14.9" y="12.3" width="2.6" height="2.2" rx=".4" fill="#FFE7A3"/><rect x="6.5" y="16" width="2.6" height="2.2" rx=".4" fill="#FFE7A3"/><rect x="14.9" y="16" width="2.6" height="2.2" rx=".4" fill="#FFE7A3"/><rect x="10.6" y="17" width="2.8" height="4" fill="#8A3424"/>')],
    ['colazioni', 'Colazioni', SV('<path d="M2.5 15c0-5.3 4.3-9.5 9.5-9.5s9.5 4.2 9.5 9.5c-1.6 1.5-3.7 2-5.4 1.5-1-2.6-2.5-3.6-4.1-3.6s-3.1 1-4.1 3.6C6.2 17 4.1 16.5 2.5 15z" fill="#E9A44A"/><path d="M7.6 7.6l1.7 4.6M12 6v5.6M16.4 7.6l-1.7 4.6" stroke="#B9732A" stroke-width="1.3" stroke-linecap="round"/>')],
    ['ingressi', 'Ingressi', SV('<path d="M2.5 6.5h19v3.3a2.2 2.2 0 0 0 0 4.4v3.3h-19v-3.3a2.2 2.2 0 0 0 0-4.4z" fill="#E1483C"/><path d="M15.5 7.8v8.4" stroke="#fff" stroke-width="1.2" stroke-dasharray="1.4 1.4"/><circle cx="9" cy="12" r="2.4" fill="none" stroke="#fff" stroke-width="1.4"/>')],
    ['navigazione', 'Navigazione', SV('<rect x="12.6" y="3.5" width="2.2" height="3.2" rx=".4" fill="#C83848"/><rect x="8.8" y="6.6" width="6.8" height="3.2" rx=".6" fill="#AEB4C2"/><rect x="5.5" y="9.6" width="12.5" height="4" rx=".6" fill="#DADDE5"/><circle cx="8.5" cy="11.6" r=".75" fill="#4A5568"/><circle cx="11" cy="11.6" r=".75" fill="#4A5568"/><circle cx="13.5" cy="11.6" r=".75" fill="#4A5568"/><circle cx="16" cy="11.6" r=".75" fill="#4A5568"/><path d="M2.5 13.6h19l-2.6 4.6H5.3z" fill="#C83848"/><path d="M2 20.8c1.7 0 1.7-1 3.3-1s1.7 1 3.3 1 1.7-1 3.4-1 1.7 1 3.3 1 1.7-1 3.4-1 1.6 1 3.3 1" stroke="#3E86D8" stroke-width="1.4" fill="none" stroke-linecap="round"/>')],
    ['copertura', 'Copertura', SV('<path d="M12 3.2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" fill="#8D69C9"/><path d="M7.5 12.2a4.5 9 0 0 1 9 0" fill="#A585DA"/><path d="M12 12.2v6.4a2 2 0 0 1-4 0" stroke="#4E3F6B" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M12 1.8v1.6" stroke="#4E3F6B" stroke-width="1.5" stroke-linecap="round"/>')],
    ['extra', 'Extra', SV('<path d="M12 2.3l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16l-5.5 3 1.2-6.1-4.5-4.2 6.1-.8z" fill="#F2B90C"/><path d="M12 8.2v5.4M9.3 10.9h5.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>')],
    ['accomp', 'Accompagnatore', SV('<path d="M5.5 21.5v-3a6.5 6.5 0 0 1 13 0v3z" fill="#EF7A3E"/><path d="M17.2 15.4l2.4-6.4" stroke="#EF7A3E" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="7.6" r="1.7" fill="#F6C66F"/><circle cx="12" cy="9.2" r="3.8" fill="#F6C66F"/><path d="M8.2 8.8a3.8 3.8 0 0 1 7.6 0c-1.1-.9-2.5-1.4-3.8-1.4s-2.7.5-3.8 1.4z" fill="#DC912A"/>')]
  ];
  // servizi del viaggio: quelli scelti; per i viaggi di prima, il bus se c'è e l'hotel se è un tour con hotel
  function tripServ(t) {
    if (Array.isArray(t.serv)) return t.serv;
    const o = []; if ((t.buses || []).length) o.push('bus'); if (t.quota && t.quota.hotel) o.push('hotel'); return o;
  }
  function servIcons(t) {
    if (tripCat(t) === 'biglietteria') return '';
    const on = new Set(tripServ(t));
    return SERV.map(([k, l, svg]) => `<span class="svi${esc(on.has(k) ? ' on' : '')}" data-tip="${esc(l)}${on.has(k) ? '' : ' · non compreso'}" aria-label="${esc(l)}${on.has(k) ? ' compreso' : ' non compreso'}">${svg}</span>`).join('');
  }
  // caselle da accendere/spegnere nella finestra «Modifica gita»
  function servPicker(t) {
    const on = new Set(t ? tripServ(t) : ['bus']);
    return `<div class="svpick" role="group" aria-label="Servizi compresi">${SERV.map(([k, l, svg]) => `<button type="button" class="svp${esc(on.has(k) ? ' on' : '')}" data-act="svtoggle" data-k="${esc(k)}" aria-pressed="${esc(on.has(k))}">${svg}<span>${esc(l)}</span><i aria-hidden="true">${ICON.check}</i></button>`).join('')}</div>`;
  }

  // ---------- viste ----------
  // ev (2.1.8): negli eventi c'è anche la colonna «emissione» (data di emissione del biglietto) dopo «fila»
  const listCols = (tour, bigl, ev) => { const c = bigl
    ? [['cognome', 'cognome'], ['nome', 'nome'], ['tel', 'contatto'], ['note', 'note'], ['pagato', '€']]
    : tour
    ? [['cognome', 'cognome'], ['nome', 'nome'], ['nascita', 'data'], ['tel', 'contatto'], ['natoA', 'nato/a a'], ['part', 'P'], ['hotel', 'hotel'], ['cam', 'C'], ['fila', 'fila'], ['note', 'note'], ['pagato', '€']]
    : [['cognome', 'cognome'], ['nome', 'nome'], ['nascita', 'data'], ['tel', 'contatto'], ['part', 'part'], ['fila', 'fila'], ['note', 'note'], ['pagato', '€']];
    if (ev && !bigl) c.splice(c.findIndex(([f]) => f === 'fila') + 1, 0, ['emis', 'emissione']);
    return c; };
  const ATTC = [['cognome', 'Cognome'], ['nome', 'Nome'], ['nascita', 'data di nascita'], ['tel', 'contatto'], ['part', 'part'], ['note', 'note'], ['richiesta', 'data di richiesta'], ['avviso', 'data di avviso'], ['risposta', 'risposta del cliente']];
  function syncInfo(st) {
    st = st || STORE.status();
    if (!st.hasKey || !st.linked) return ['local', 'Solo questo computer', 'I dati restano su questo computer: per lavorare con le altre agenzie collega Dropbox in Impostazioni › Sincronizzazione'];
    if (st.offline) return ['off', `Senza internet${st.pending ? ' · ' + st.pending + ' da inviare' : ''}`, 'Puoi continuare a lavorare: le modifiche partono appena torna la connessione'];
    if (st.error) return ['err', 'Sincronizzazione in pausa', 'Dropbox non risponde: riprovo da solo tra poco'];
    if (st.syncing || st.pending) return ['busy', st.pending ? `Invio ${st.pending}…` : 'Aggiorno…', 'Sto allineando i dati con gli altri computer'];
    return ['ok', 'Sincronizzato', st.last ? `Ultimo aggiornamento alle ${st.last.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : ''];
  }
  function topbar() {
    const me = ACC.me(); const ag = ACC.agency(); const [sk, sl, st] = syncInfo();
    const v = UI.view; const nb = (view, label, ico, perm) => !perm || ACC.can(perm) ? `<button class="tlink" data-act="nav" data-v="${esc(view)}" aria-current="${esc(v === view ? 'page' : 'false')}">${ico}<span>${label}</span></button>` : '';
    return `<header class="topbar"><div class="in">
      <button class="brand" data-act="nav" data-v="${esc(ACC.can('viaggi') ? 'home' : 'conta')}" aria-label="Viaggi in Pullman, pagina iniziale"><img class="logo" src="${LOGO}" alt="La Terra"><span class="appname">Viaggi <span>in Pullman</span></span></button>
      ${ACC.can('viaggi') ? `<nav class="nav" aria-label="Sezioni"><button data-act="nav" data-v="home" aria-pressed="${esc(v === 'home' || v === 'trip')}">Viaggi</button><button data-act="nav" data-v="models" aria-pressed="${esc(v === 'models')}">Piantine</button></nav>` : ''}
      <span class="spacer"></span>
      <span id="syncpill" class="sync ${esc(sk)}" title="${esc(st)}" role="status"><i></i>${esc(sl)}</span>
      ${ag ? `<button class="agchip" data-act="changeag" title="Cambia agenzia">${ICON.pin}${esc(ag.nome)}<span class="agc"> · ${esc(ag.cassa || ag.nome)}</span></button>` : ''}
      ${nb('bigl', 'Biglietteria', ICON.tkt, ACC.can('cassa') || ACC.can('cassaAll') ? null : 'x')}${nb('cassa', 'Cassa', ICON.cash, ACC.can('cassa') || ACC.can('cassaAll') ? null : 'x')}${nb('conta', 'Contabilità', ICON.chart, 'conta')}${nb('anag', 'Anagrafica', ICON.users, 'anag')}${nb('settings', 'Impostazioni', ICON.gear)}<button class="tlink hlbtn" data-act="help" title="Aiuto: cerca nel manuale d'istruzioni (F1)" aria-label="Aiuto: cerca nel manuale d'istruzioni">${ICON.search}<span>Aiuto</span></button>${nb('super', 'Super Master', ICON.tool, 'tech')}
      ${me ? `<button class="me" data-act="memenu" aria-label="${esc(me.name)}: account"><span class="av">${esc((me.name || '?')[0].toUpperCase())}</span><span class="mt"><b>${esc(me.name)}</b><small>${esc(ROLE_L[me.role])}</small></span></button>` : ''}
    </div>${offBandHTML()}</header>`;
  }
  // la barra in alto deve stare su una riga sui computer: se non ci sta (nomi lunghi, più voci), si stringe a gradini
  function topFit() {
    const h = $('.topbar .in'); if (!h) return; const T = document.querySelector('.topbar');
    T.classList.remove('tf1', 'tf2', 'tf3'); if (innerWidth <= 1100) return;
    const br = h.querySelector('.brand'); if (!br) return;
    const wrapped = () => { const lim = br.getBoundingClientRect().bottom - 2; return [...h.children].some(x => { const r = x.getBoundingClientRect(); return r.width && r.top >= lim; }); };
    for (const c of ['tf1', 'tf2', 'tf3']) { if (!wrapped()) return; T.classList.add(c); }
  }
  window.addEventListener('resize', () => { cancelAnimationFrame(topFit.r); topFit.r = requestAnimationFrame(topFit); });
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
    if (UI.cat === 'biglietteria') UI.cat = 'tutte';   // 2.1.8: il tipo «Biglietteria» non c'è più (c'è la sezione Biglietteria)
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
        <label class="ysel"><span>Anno</span><select data-year="1" aria-label="Anno da vedere">${years.map(yy => `<option value="${esc(yy)}"${yy === y ? ' selected' : ''}>${esc(yy)}</option>`).join('')}</select></label>
        <div class="seg catseg" role="group" aria-label="Tipo">${[['tutte', 'Tutte'], ['gita', 'Gite'], ['tour', 'Tour'], ['evento', 'Eventi']].map(([v, l]) => `<button data-act="hcat" data-v="${esc(v)}" aria-pressed="${esc(cat === v)}" class="c-${esc(v)}">${l}</button>`).join('')}</div>
        <label class="chk small"><input type="checkbox" data-act="hidepast"${UI.hidePast ? ' checked' : ''}> Nascondi quelle già fatte</label>
        <input class="search" type="search" data-hq="1" placeholder="Cerca viaggio o codice (es. T08)" value="${esc(UI.hq || '')}" aria-label="Cerca">
      </div>
      <nav class="mstrip" aria-label="Mesi">${MESI.map((m, i) => byM[i] ? `<a class="mchip" href="#m-${i}"><b>${MESI_L[i]}</b></a>` : `<span class="mchip off"><b>${MESI_L[i]}</b></span>`).join('')}</nav>
      <div class="thead" aria-hidden="true"><span>Data</span><span>Giorno</span><span>Codice</span><span>Viaggio</span><span>Bus</span><span></span></div>
      <div class="months">${Object.keys(byM).map(Number).sort((a, b) => a - b).map(m => `<section class="month" id="m-${esc(m)}" aria-label="${esc(MESI_L[m])} ${esc(y)}">
          <div class="tl">${byM[m].map(t => tripRow(t, today)).join('')}</div></section>`).join('') || `<div class="empty">Nessuna gita con questi filtri.</div>`}</div>`;
  }
  function tripRow(t, today) {
    tripInit(t); const D = syncAll(t); const SI = seatIndex(t); const T = summaryOf(t, D, SI);
    const c = tripCat(t); const d = parseD(t.data); const n = nGiorni(t); const f = t.fine ? parseD(t.fine) : null;
    const past = (t.fine || t.data) < today;
    const when = n > 1 ? `${GIORNI[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESI[d.getMonth()]} → ${GIORNI[f.getDay()].slice(0, 3)} ${f.getDate()} ${MESI[f.getMonth()]} · ${n} giorni` : `${GIORNI[d.getDay()]} · in giornata`;
    const st = !T.pers ? '<span class="pill neutral">lista vuota</span>' : c === 'biglietteria' ? `<span class="pill neutral">${T.pers} biglietti</span>` : `<span class="pill ${esc(T.seated === T.pers ? 'ok' : 'tbd')}">${T.pers} persone${T.seated < T.pers ? ` · ${T.pers - T.seated} senza posto` : ''}</span>`;
    const buses = t.buses.length ? `<span class="pill neutral">${ICON.bus} ${t.buses.length} bus · ${t.buses.reduce((a, b) => a + busStats(b).tot, 0)}/${T.cap}</span>` : '';
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    // data grande, senza anno (l'anno si sceglie in alto): «10 Gennaio», per i tour «3–6 Gennaio» o «30 Dic – 2 Gen»
    const sameM = n <= 1 || (f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear());
    const dateL = n <= 1 ? `<b>${d.getDate()}</b><span>${cap(MESI_L[d.getMonth()])}</span>` : sameM ? `<b>${d.getDate()}–${f.getDate()}</b><span>${cap(MESI_L[d.getMonth()])}</span>` : `<b>${d.getDate()}</b><span>${cap(MESI[d.getMonth()])}</span><em>–</em><b>${f.getDate()}</b><span>${cap(MESI[f.getMonth()])}</span>`;
    const dayL = GIORNI[d.getDay()].slice(0, 3).toUpperCase() + (n > 1 ? '–' + GIORNI[f.getDay()].slice(0, 3).toUpperCase() : '');
    const det = [n > 1 ? `${n} giorni` : '', t.quota && t.quota.hotel ? `Hotel ${esc(t.quota.hotel)}` : '', past ? 'già fatta' : ''].filter(Boolean);
    return `<article class="trow v2 c-${esc(c)}${t.extra ? ' extra' : ''}${past ? ' past' : ''}" data-droptrip="${esc(t.id)}">
      <div class="t2-blk" data-act="opentrip" data-id="${esc(t.id)}" title="${esc(CAT_L[c])}">
        <div class="t2-d">${dateL}</div>
        <div class="t2-g">${dayL}</div>
        <div class="t2-c">${t.code ? `<span class="tcode">${esc(t.code)}</span>` : ''}</div>
        <div class="t2-n"><h3 title="${esc(t.nome)}${t.quota && t.quota.hotel ? ' · Hotel ' + esc(t.quota.hotel) : ''}">${esc(t.nome)}</h3></div>
      </div>
      <div class="t2-h">${t.quota && t.quota.hotel && tripCat(t) !== 'biglietteria' ? `<span class="hh" title="Hotel scelto: ${esc(t.quota.hotel)}">${SERV.find(x => x[0] === 'hotel')[2]}<span>${esc(t.quota.hotel)}</span></span>` : ''}</div>
      <div class="t2-x">${t.extra ? '<span class="xtra">extra</span>' : ''}</div>
      <div class="t2-sv"><div class="sv-i">${servIcons(t)}</div></div>
      <div class="t2-fc sv-c">${freeCounters(t)}</div>
      <div class="tr-a"><button class="btn sm" data-act="opentrip" data-id="${esc(t.id)}" data-sec="lista" title="Lista prenotazioni">${ICON.list}<span>Lista</span></button>${c !== 'biglietteria' ? `<button class="btn sm" data-act="opentrip" data-id="${esc(t.id)}" data-sec="posti" title="Posti sul bus">${ICON.bus}<span>Posti</span></button>` : ''}</div>
    </article>`;
  }
  // posti ancora liberi: uno per bus (con più bus ognuno ha la sua lista), contando anche i nomi che mancano nelle comitive
  function freeCounters(t) {
    if (tripCat(t) === 'biglietteria' || !t.buses.length) return '';
    const multi = multiBus(t);
    const one = (b, lk, lab) => { const cap = (multi ? [b] : t.buses).reduce((a, x) => a + LMAP[x.layout].info.cap - Object.values(x.seats || {}).filter(y => y.res).length, 0); const free = cap - listLoad(t, lk);
      const cls = free <= 0 ? 'full' : free <= 5 ? 'low' : 'ok';
      return `<span class="fc ${esc(cls)}" title="${esc(lab)}: ${cap} posti${free >= 0 ? `, ${free} liberi` : `, ${-free} persone in più`}">${ICON.bus}${multi ? `<em>${esc(b.label.replace(/^Bus\s*/i, 'B'))}</em>` : ''}${free > 0 ? `<b>${free}</b>${multi ? '' : ` ${free === 1 ? 'libero' : 'liberi'}`}` : free === 0 ? '<b>pieno</b>' : `<b>+${-free}</b>${multi ? '' : ' in più'}`}</span>`; };
    return multi ? `<span class="fc-l">liberi</span>${t.buses.map(b => one(b, b.id, b.label)).join('')}` : one(t.buses[0], '', t.buses.length > 1 ? 'Bus' : t.buses[0].label);
  }
  function busRow(t, b) {
    const L = LMAP[b.layout]; const st = busStats(b);
    const pill = !st.tot ? '<span class="pill neutral">vuoto</span>' : st.todo > 0 ? `<span class="pill tbd">${st.todo} da sistemare</span>` : '<span class="pill ok">posti assegnati</span>';
    const wPlaced = Math.min(100, st.placed / st.cap * 100), wTodo = Math.min(100 - wPlaced, st.todo / st.cap * 100);
    return `<button class="busrow" data-act="openbus" data-trip="${esc(t.id)}" data-bus="${esc(b.id)}">
      <span class="bi">${ICON.bus}</span>
      <span><span class="bn">${esc(b.label)}</span> <span class="bm">· ${esc(L.nome)} · ${st.tot}/${st.cap} posti${b.autista ? ' · ' + esc(b.autista) : ''}</span></span>
      <span style="display:flex;gap:4px">${pill}</span>
      <span class="bar" aria-hidden="true"><i style="width:${esc(wPlaced)}%"></i><i class="part" style="width:${esc(Math.max(0, wTodo))}%"></i></span>
    </button>`;
  }
  function modelsView() {
    return `<div class="pagehead"><div><h1>Piantine dei pullman</h1><div class="sub">Le piantine della flotta, come nei vostri file Word. Si scelgono quando aggiungi un bus a una gita.</div></div></div>
      <div class="models">${window.LAYOUTS.map(L => modelCard(L)).join('')}</div>
      <div class="infobox">Manca la piantina del minibus da 19 posti: quando me la mandi la aggiungo. Nel Setra 417 (63 posti) il vostro file riporta «39» al posto del 30 nella fila 29–32: qui è corretto in 30.</div>`;
  }
  function modelCard(L, pick) {
    return `<div class="model${esc(pick && pick === L.id ? ' on' : '')}"${pick !== undefined ? ` data-act="picklayout" data-id="${esc(L.id)}" tabindex="0"` : ''}>
      <div><h3>${esc(L.nome)}</h3><div class="meta">${esc(L.desc)}${L.flotta ? ` · in flotta: ${L.flotta}` : ''}</div></div>
      <div class="mini">${L.floors.map((f, i) => deckHTML(null, L, i, { mini: true })).join('')}</div>
    </div>`;
  }
  function progBox(t) {
    const pdf = t.pdf ? `<span class="prog"><button class="btn sm" data-act="openpdf" data-id="${esc(t.id)}">${ICON.link} ${esc(t.pdf.name)}</button><button class="kebab" data-act="delpdf" data-id="${esc(t.id)}" aria-label="Togli il PDF">${ICON.close}</button></span>` : '';
    const link = safeUrl(t.programma) ? `<a class="btn sm" href="${esc(safeUrl(t.programma))}" target="_blank" rel="noopener">${ICON.link} Link programma</a>` : '';
    const drop = !t.pdf ? `<label class="pdfdrop" for="pdf-in-${esc(t.id)}">${ICON.upload} Trascina qui il programma (PDF o foto)<input id="pdf-in-${esc(t.id)}" class="pdf-in" data-trip="${esc(t.id)}" type="file" accept="application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png" hidden></label>` : '';
    return pdf + link + drop;
  }
  function tripView() {
    const t = trip(); if (!t) { UI.view = 'home'; return homeView(); }
    tripInit(t); ensureBlank(t); const bigl = tripCat(t) === 'biglietteria'; if (bigl) UI.sec = 'lista';
    // piantina accanto alla lista: negli eventi parte nascosta; la scelta si ricorda per ogni viaggio
    if (UI.dockT !== t.id) { UI.dockT = t.id; const dm = UI.dockMap || {}; UI.dock = t.id in dm ? dm[t.id] : tripCat(t) !== 'evento'; }
    if (!bus() && t.buses.length) UI.busId = t.buses[0].id;
    const D = syncAll(t); const SI = seatIndex(t); const T = summaryOf(t, D, SI);
    const head = `<div class="crumbs"><a data-act="nav" data-v="home">Viaggi</a><span>›</span><span>${esc(t.nome)}</span></div>
      <div class="tripbar" data-droptrip="${esc(t.id)}"><h1>${esc(t.nome)}</h1><span class="tcat c-${esc(tripCat(t))}">${CAT_L[tripCat(t)]}</span><span class="pill neutral">${esc(fmtTripDate(t, true))}</span>${progBox(t)}<button class="btn sm ghost" data-act="edittrip">${ICON.edit} Modifica gita</button>${lockBtnHTML(t)}</div>
      ${closedBannerHTML(t)}
      <div id="presence">${presenceHTML(t)}</div>
      ${casiBoxHTML(t.id)}
      <div class="ptabs-row"><div class="ptabs" role="tablist"><button role="tab" data-act="sec" data-v="lista" aria-selected="${esc(UI.sec !== 'posti')}">${ICON.list} ${bigl ? 'Biglietti venduti' : 'Lista prenotazioni'} <span>${T.pers} persone${T.att ? ` · ${T.att} in attesa` : ''}</span></button>${bigl ? '' : `<button role="tab" data-act="sec" data-v="posti" aria-selected="${esc(UI.sec === 'posti')}">${ICON.bus} Posti sul bus <span>${T.seated}/${T.pers} con il posto</span></button>`}</div>${histBarHTML(t)}</div>`;
    const body = UI.sec === 'posti' ? postiView(t, D, SI, T) : listaView(t, D, SI, T);
    // l'incasso si apre in una finestra al centro, sia dalla lista sia dalla piantina
    const pp = UI.pay && UI.pay.tripId === t.id ? payPanelHTML(t) : ''; if (UI.pay && !pp) UI.pay = null;
    return head + body + pp;
  }

  // ----- sezione 1: la lista prenotazioni, come il file Word -----
  // testa della lista: prezzi, date e pagamenti, partenze, note (il nome del viaggio è già in alto e si cambia da «Modifica gita»)
  const notesOf = t => Array.isArray(t.notes) ? t.notes : [t.note1, t.note2].filter(x => x && String(x).trim());
  // ---- eventi (2.1.8): tipi di biglietto, diritti, circuito; collegamento alla Biglietteria ----
  function evTktSec(t) {
    const Q = t.quota; const TK = tripTkt(t); const e = TK.ev; const can = !ACC.can('readonly');
    const D = deriveBookings(t); const P = D.flatMap(bk => bk.persone);
    const withT = P.filter(p => personTkt(t, p, p.tipo || 'ad', TK)).length, noT = P.length - withT;
    const nv = v => (v == null || v === '' ? '' : esc(String(v).replace('.', ',')));
    const rows = e ? TK.sett : (Array.isArray(Q.tsett) ? Q.tsett : TK.sett.length ? TK.sett : [{ id: 'tk', nome: '', intero: null, ridotto: null }]);
    const tbl = `<table class="tk-t${esc(e ? '' : ' ed')}"><thead><tr><th>Tipo di biglietto</th><th>Intero</th><th>Ridotto</th>${e ? '' : '<th></th>'}</tr></thead><tbody>${rows.map((x, i) => e
      ? `<tr><td><b>${esc(x.nome || 'Biglietto')}</b></td><td>${x.intero != null ? money(x.intero) : '—'}</td><td>${x.ridotto != null ? money(x.ridotto) : '—'}</td></tr>`
      : `<tr><td><span class="th-in"><input class="hc" data-tks="${i}" data-k="nome" value="${esc(x.nome || '')}" placeholder="${esc(i ? 'es. Tribuna' : 'es. Parterre')}" aria-label="Tipo di biglietto ${i + 1}"></span></td><td><span class="th-in eur"><input class="hc num" data-tks="${i}" data-k="intero" inputmode="decimal" value="${esc(nv(x.intero))}" placeholder="intero" aria-label="Prezzo intero ${i + 1}"><i>€</i></span></td><td><span class="th-in eur"><input class="hc num" data-tks="${i}" data-k="ridotto" inputmode="decimal" value="${esc(nv(x.ridotto))}" placeholder="ridotto" aria-label="Prezzo ridotto ${i + 1}"><i>€</i></span></td><td>${rows.length > 1 && can ? `<button class="kebab" data-act="tksdel" data-i="${i}" aria-label="Togli il tipo ${i + 1}">${ICON.close}</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
    const dirCirc = e
      ? `<div class="tk-ro"><span>Diritti a biglietto <b>${money(TK.dir)}</b></span><span>Circuito <b>${esc(typeof circL === 'function' ? circL(TK.circ) : TK.circ)}</b></span></div>`
      : `<div class="tk-dc"><label class="th-f"><span>Diritti <small>a biglietto</small></span><span class="th-in eur"><input class="hc num" data-q="diritti" inputmode="decimal" value="${Q.diritti != null ? esc(String(Q.diritti).replace('.', ',')) : ''}" aria-label="Diritti a biglietto"><i>€</i></span></label><label class="th-f"><span>Circuito</span><span class="th-in"><select class="hc" data-qt="circuito"><option value="">—</option>${CIRCUITI.map(c => `<option${Q.circuito === c ? ' selected' : ''}>${c}</option>`).join('')}</select></span></label></div>`;
    const stk = e && typeof bgTripInfo === 'function' ? bgTripInfo(t, e) : '';
    const nuova = evFila(t);
    const old = nuova ? '' : `<div class="tk-old"><span><b>Regola di prima:</b> il biglietto si somma a tutti. Dalla versione 2.1.8 si somma solo a chi ha la «fila» scritta.</span>${can ? '<button class="btn sm" data-act="tkfila">Usa la regola nuova</button>' : ''}</div>`;
    return `<section class="th-sec tks"><div class="th-h">Biglietto dell'evento <small>${nuova ? 'si somma solo a chi ha la «fila» scritta' : 'si somma a tutti'}</small></div>${old}
      ${e ? `<div class="tk-ev">${ICON.tkt}<span>Collegato alla Biglietteria<br><b>${esc(e.nome)}</b> · ${esc(fmtDate(e.data))}</span><button class="btn sm ghost" data-act="tkbgopen">Apri in Biglietteria</button></div>` : ''}
      ${tbl}${e || !can ? '' : `<button class="btn sm ghost tk-add" data-act="tksadd">${ICON.plus} Aggiungi tipo di biglietto</button>`}
      ${dirCirc}
      <div class="tk-foot"><span class="small">${P.length ? `<b>${withT}</b> con biglietto · <b>${noT}</b> solo bus` : nuova ? 'Nella fila scrivi il tipo (es. «Parterre») o la fila del biglietto: se è vuota la persona paga solo il bus.' : ''}</span>${e || !can || !bgSee2() ? '' : `<button class="btn sm" data-act="tklink">${ICON.tkt} Collega alla Biglietteria</button>`}</div>
      ${stk}
      ${TK.sett.some(x => x.nome) ? `<datalist id="tk-dl">${TK.sett.filter(x => x.nome).map(x => `<option value="${esc(x.nome)}">`).join('')}</datalist>` : ''}</section>`;
  }
  const bgSee2 = () => ACC.can('cassa') || ACC.can('cassaAll');
  function headBlock(t) {
    const Q = t.quota; const tour = isTourT(t); const cat = tripCat(t); const bigl = cat === 'biglietteria'; const tk = bigl || cat === 'evento';
    const money = (k, l, ph = '') => `<label class="th-f"><span>${l}</span><span class="th-in eur"><input class="hc num" data-q="${esc(k)}" inputmode="decimal" value="${Q[k] != null ? esc(String(Q[k]).replace('.', ',')) : ''}" placeholder="${esc(ph)}" aria-label="${esc(String(l).replace(/<[^>]+>/g, ''))}"><i>€</i></span></label>`;
    const lab = (k, def, aria) => `<input class="hc lab" data-qt="${esc(k)}" value="${esc(Q[k] || def)}" aria-label="${esc(aria)}">`;
    const date = (attr, v, l) => `<label class="th-f"><span>${l}</span><span class="th-in"><input class="hc" type="date" ${attr} value="${esc(v || '')}" aria-label="${esc(l)}"></span></label>`;
    const LU = (S.cfg.luoghi || []).filter(l => l.code || l.citta);
    const nDep = Math.min(6, Math.max(2, t.partenze.filter(d => d && (d.citta || d.luogo || d.code)).length + 1));
    const deps = !LU.length
      ? Array.from({ length: 3 }, (_, i) => { const d = t.partenze[i] || {}; return `<div class="hdep"><input class="hc" data-dep2="${i}" data-k="citta" value="${esc(d.citta || '')}" placeholder="città"><input class="hc" data-dep2="${i}" data-k="luogo" value="${esc(d.luogo || '')}" placeholder="luogo"><input class="hc" data-dep2="${i}" data-k="ora" value="${esc(d.ora || '')}" placeholder="ora"></div>`; }).join('') + '<div class="small dephint">Per scegliere i luoghi da un elenco, aggiungili in Impostazioni › Luoghi di partenza.</div>'
      : Array.from({ length: nDep }, (_, i) => { const d = t.partenze[i] || {}; const cur = depLuogo(d); return `<div class="hdep sel"><select class="hc" data-depsel="${i}" aria-label="Partenza ${i + 1}"><option value="">${i ? '+ altra partenza' : 'Scegli il luogo'}</option>${LU.map((l, j) => `<option value="${j}"${cur === l ? ' selected' : ''}>${esc([l.code, l.citta, l.luogo].filter(Boolean).join(' · '))}</option>`).join('')}${!cur && (d.citta || d.luogo) ? `<option value="cur" selected>${esc([d.citta, d.luogo].filter(Boolean).join(' · '))} (non in elenco)</option>` : ''}</select><input class="hc" data-dep2="${i}" data-k="ora" value="${esc(d.ora || '')}" placeholder="ora" aria-label="Ora partenza ${i + 1}"></div>`; }).join('');
    const tkSec = tk && !bigl ? evTktSec(t) : tk ? `<section class="th-sec"><div class="th-h">${bigl ? 'Biglietto' : 'Biglietto dell\'evento <small>se lo vendete voi</small>'}</div><div class="th-g" style="--c:4">
        ${money('tkt1', 'Intero')}<label class="th-f"><span>${lab('tkt2L', 'ridotto', 'Nome del ridotto')}</span><span class="th-in eur"><input class="hc num" data-q="tkt2" inputmode="decimal" value="${Q.tkt2 != null ? esc(String(Q.tkt2).replace('.', ',')) : ''}" aria-label="Prezzo ridotto"><i>€</i></span></label>
        ${money('diritti', 'Diritti <small>a biglietto</small>')}<label class="th-f"><span>Circuito</span><span class="th-in"><select class="hc" data-qt="circuito"><option value="">—</option>${CIRCUITI.map(c => `<option${Q.circuito === c ? ' selected' : ''}>${c}</option>`).join('')}</select></span></label></div></section>` : '';
    const notes = notesOf(t);
    return `<div class="thead2${esc(bigl ? ' bigl' : '')}">
      ${bigl ? `<section class="th-sec"><div class="th-h">Data</div><div class="th-g">${date('data-tf="data"', t.data, 'Data dell\'evento')}</div></section>` : `
      <section class="th-sec"><div class="th-h">Quote e pagamenti</div><div class="th-g" style="--c:3">
        ${money('adulti', 'Adulti')}
        <label class="th-f"><span>${lab('bambiniL', tour ? '3/11 anni' : '4/11 anni', 'Età bambini')}</span><span class="th-in eur"><input class="hc num" data-q="bambini" inputmode="decimal" value="${Q.bambini != null ? esc(String(Q.bambini).replace('.', ',')) : ''}" aria-label="Prezzo bambini"><i>€</i></span></label>
        ${tour ? money('singola', 'Singola') + money('terzo', '3° letto adulto') + `<label class="th-f"><span>${lab('infantL', '0/2 anni', 'Età neonati')}</span><span class="th-in eur"><input class="hc num" data-q="infant" inputmode="decimal" value="${Q.infant != null ? esc(String(Q.infant).replace('.', ',')) : ''}" placeholder="0" aria-label="Prezzo neonati"><i>€</i></span></label>` : '<span></span>'}
        <div class="th-sep"></div>
        ${money('acconto', 'Acconto')}${money('saldo', 'Saldo')}${date('data-qt="saldoEntro"', Q.saldoEntro, 'Saldo entro il')}
      </div></section>
      <section class="th-sec${esc(cat === 'evento' && !tour ? ' dt' : '')}"><div class="th-h">${cat === 'evento' && !tour ? 'Data' : 'Date e hotel'}</div><div class="th-g" style="--c:2">
        ${date('data-tf="data"', t.data, 'Partenza')}${date('data-tf="fine"', t.fine, 'Rientro')}
        ${tour ? `<label class="th-f wide"><span>Hotel</span><span class="th-in"><input class="hc" data-qt="hotel" value="${esc(Q.hotel || '')}" placeholder="nome hotel, città"></span></label>` : ''}
      </div></section>`}
      ${tkSec}
      ${bigl ? '' : `<section class="th-sec deps"><div class="th-h">Partenze</div><div class="wh-deps">${deps}</div></section>`}
    </div>
    <div class="tnotes">${notes.map((n, i) => `<div class="tnote"><span>Nota ${i + 1}</span><input class="hc" data-note="${i}" value="${esc(n)}" placeholder="scrivi la nota" aria-label="Nota ${i + 1}"><button class="btn sm ghost" data-act="notedel" data-i="${i}" aria-label="Togli la nota ${i + 1}">${ICON.close}</button></div>`).join('')}<button class="btn sm ghost tn-add" data-act="noteadd">${ICON.plus} Aggiungi nota</button></div>`;
  }
  // il luogo predefinito che corrisponde a una partenza del viaggio (per codice, o per città e punto di salita)
  function depLuogo(d) {
    const LU = (S.cfg.luoghi || []); if (!d) return null;
    return (d.code && LU.find(l => String(l.code || '').toUpperCase() === String(d.code).toUpperCase())) || ((d.citta || d.luogo) && LU.find(l => nk(l.citta) === nk(d.citta) && (!d.luogo || nk(l.luogo) === nk(d.luogo)))) || null;
  }
  // codici di partenza da proporre nella colonna «part» della lista: quelli del viaggio, altrimenti tutti
  function partOpts(t) {
    const LU = (S.cfg.luoghi || []).filter(l => l.code);
    const fromTrip = (t.partenze || []).map(d => { const l = depLuogo(d); return l ? l : null; }).filter(Boolean);
    return (fromTrip.length ? fromTrip : LU).map(l => ({ code: String(l.code).toUpperCase(), label: [l.citta, l.luogo].filter(Boolean).join(' · ') }));
  }
  // tipi di camera della tendina «hotel» (si salva il nome; le liste Word con «matrim», «singol»… vengono riconosciute)
  const ROOMT = [['singola', 'Singola'], ['matrimoniale', 'Matrimoniale'], ['tripla', 'Tripla'], ['quadrupla', 'Quadrupla'], ['matrimoniale + lettino', 'Matrimoniale + lettino']];
  function roomSel(attr, v, label) {
    const cur = String(v || '').trim(); const k = cur ? normCam(cur) : ''; const known = ROOMT.some(([x]) => x === k);
    return `<select class="wc wsel room" ${attr} aria-label="${esc(label)}"><option value=""></option>${ROOMT.map(([x, l]) => `<option value="${esc(x)}"${known && k === x ? ' selected' : ''}>${l}</option>`).join('')}${cur && !known ? `<option value="${esc(cur)}" selected>${esc(cur)}</option>` : ''}</select>`;
  }
  function wRow(t, r, i, cols, ctx, bigl) {
    const x = ctx.byRow[r.id]; const head = x && x.k === 0; const bk = x && x.bk;
    const ok = bk && saldato(bk); const seat = ctx.SI[r.id];
    const fl = UI.flash && UI.flash[r.id] && Date.now() - UI.flash[r.id].at < 8000 ? UI.flash[r.id] : null;
    let cls = x ? `g${x.gi % 2}` : 'blank'; if (fl) cls += ' flash'; if (head) cls += ' gh'; if (ok) cls += ' paid'; if (bk && UI.sel === bk.id) cls += ' sel'; if (UI.selP === r.id) cls += ' selp'; if ((UI.lsel || []).includes(r.id)) cls += ' lsel';
    const pm = bk && !head && bk.persone.length > 1 ? personMoney(t, bk, r.id) : null; if (pm && pm.paid > 0 && pm.rest === 0 && !ok) cls += ' ppaid';
    const away = bk && !head && r.g && (() => { const rows = listRows(t, listKey(t, r)).filter(x => !isEmptyRow(x)); const k = rows.indexOf(r); const prev = rows[k - 1]; return !prev || !bk.persone.some(p => p.row === prev); })();
    const xg = bk && !head && multiBus(t) && listKey(t, r) !== listKey(t, bk.head) ? ` · comitiva ${bkName(bk)} x ${bk.persone.length} (${listName(t, listKey(t, bk.head))})` : away ? ` · comitiva ${bkName(bk)} x ${bk.persone.length} (spostata da sola in questo punto della lista)` : '';
    const drag = x ? `<span class="dh" draggable="true" ${head ? `data-dragbk="${esc(bk.id)}" title="Trascina tutta la prenotazione (${esc(bkName(bk))} x ${bk.persone.length}) sulla piantina"` : `data-dragp="${esc(r.id)}" title="Trascina solo questa persona sulla piantina"`}>${ICON.grip}</span>` : '';
    let seatTxt = '';
    if (seat) { const p = bk.persone.find(q => q.id === r.id); const bad = p && p.req && hasAny(p.req) && !reqOk(LMAP[seat.b.layout], seat.s, p.req); seatTxt = `<span class="pill ${esc(bad ? 'warn' : 'ok')}" title="${bad ? 'Il posto non rispetta la richiesta' : esc(seat.b.label + ' · posto ' + seat.s)}">B${t.buses.indexOf(seat.b) + 1} ${seat.s}</span>`; }
    else if (x && r.bus) seatTxt = '<span class="pill tbd">da sistemare</span>';
    // 2.1.8: negli eventi chi è oltre i posti dei bus non ha il posto (e non si può incassare)
    if (ctx.OV && ctx.OV.ids.has(r.id)) seatTxt = `<span class="pill bad" title="Oltre i posti del bus: aggiungi un bus o metti in lista d'attesa">senza posto</span>`;
    // anteprima di quanto paga la persona di questa riga (quota + supplemento fila)
    const quotaTxt = (() => { if (!bk) return ''; const m = bk._m || bkMoney(t, bk); const k = bk.persone.findIndex(p => p.id === r.id); const pv = m.per[k]; if (!pv || pv.v == null) return '<span class="q-na" title="Mancano i prezzi in testa alla lista">—</span>'; const P = bk.persone[k]; const sup = supplOf(t, bk, P);
      // eventi (2.1.8): il biglietto si somma solo a chi ha la fila scritta
      if (ctx.ev && ctx.TK && ctx.TK.sett.length) { const x = personTkt(t, P, pv.tipo, ctx.TK);
        return x ? `<span title="${esc(`${TIPI[pv.tipo] || ''} · bus ${fmtNum(pv.v - x.prezzo - x.dir)} € + biglietto ${x.nome}${x.rid ? ' ridotto' : ''} ${fmtNum(x.prezzo)} €${x.dir ? ` + diritti ${fmtNum(x.dir)} €` : ''}`)}">${esc(fmtNum(pv.v))} €</span>`
          : `<span title="${esc(`${TIPI[pv.tipo] || ''} · solo bus: la fila è vuota, il biglietto non si somma`)}"><small class="sb">solo bus</small>${esc(fmtNum(pv.v))} €</span>`; }
      return `<span title="${esc(`${TIPI[pv.tipo] || ''}${sup ? ` · ${fmtNum(pv.v - sup)} € + fila ${fmtNum(sup)} €` : ''}`)}">${sup ? '<small>fila</small>' : ''}${esc(fmtNum(pv.v))} €</span>`; })();
    const tip = head && bk._m ? `Totale ${euro(bk._m.due)} · pagato ${euro(bk._m.paid)}${bk._m.rest ? ' · da pagare ' + euro(bk._m.rest) : ''}${bk.mancano ? ` · mancano ${bk.mancano} nomi` : ''}` : '';
    return `<tr class="${esc(cls)}" data-rowid="${esc(r.id)}"${fl ? ` title="Modificata adesso da ${esc(fl.by)}"` : xg ? ` title="${esc(xg.slice(3))}"` : ''}>
      <td class="wn">${drag}<button class="rn" data-act="rowmenu" data-id="${esc(r.id)}" aria-label="Riga ${i + 1}: azioni${xg ? esc(xg) : ''}">${i + 1}</button>${xg ? '<i class="xg" aria-hidden="true">↗</i>' : ''}${r.stacc ? `<i class="stc" title="Staccata da ${esc(r.stacc.da)} il ${esc(fmtDate(r.stacc.il.slice(0, 10)))}${r.stacc.chi ? ' da ' + esc(r.stacc.chi) : ''}">${ICON.unlink}</i>` : ''}</td>
      ${cols.filter(([f]) => f !== 'pagato').concat(bigl ? [] : [['posto', 'posto']], [['quota', 'quota']], cols.filter(([f]) => f === 'pagato')).map(([f, l]) => f === 'posto' ? `<td class="wpos">${seatTxt}</td>` : f === 'quota' ? `<td class="c-quota">${quotaTxt}</td>` : f === 'hotel' ? `<td class="c-hotel">${roomSel(`data-r="${esc(r.id)}" data-f="hotel"`, r.hotel, 'Camera riga ' + (i + 1))}</td>` : f === 'fila' && ctx.FI ? `<td class="c-fila">${filaSel(r, ctx.FI, i)}</td>` : f === 'part' && ctx.parts.length ? `<td class="c-part"><select class="wc wsel" data-r="${esc(r.id)}" data-f="part" aria-label="Partenza riga ${i + 1}"><option value=""></option>${ctx.parts.map(o => `<option value="${esc(o.code)}"${String(r.part || '').toUpperCase() === o.code ? ' selected' : ''} title="${esc(o.label)}">${esc(o.code)}</option>`).join('')}${r.part && !ctx.parts.some(o => o.code === String(r.part).toUpperCase()) ? `<option value="${esc(r.part)}" selected>${esc(r.part)}</option>` : ''}</select></td>` : head && f === 'pagato' ? `<td class="c-pagato"><button class="eurobtn${esc(ok ? ' ok' : bk._m && bk._m.paid ? ' part' : '')}${UI.pay && UI.pay.bkId === bk.id ? ' on' : ''}" data-act="paypanel" data-id="${esc(bk.id)}" title="Incasso e documento (scontrino o fattura)" aria-label="Incasso e documento di ${esc(bkName(bk))}">${bk._m && bk._m.paid ? esc(fmtNum(bk._m.paid)) : '€'}</button></td>` : pm && f === 'pagato' ? `<td class="c-pagato"><button class="eurobtn pers${esc(pm.rest === 0 && pm.paid > 0 ? ' ok' : pm.paid ? ' part' : '')}${UI.pay && UI.pay.pid === r.id ? ' on' : ''}" data-act="paypanel" data-id="${esc(bk.id)}" data-pid="${esc(r.id)}" title="Paga solo ${esc(r.cognome)} ${esc(r.nome)} (la sua quota)" aria-label="Incasso solo di ${esc(r.cognome)} ${esc(r.nome)}">${pm.paid ? esc(fmtNum(pm.paid)) : '€'}</button></td>` : `<td class="c-${esc(f)}${head && f === 'cognome' && bk.mancano ? ' miss' : ''}${f === 'emis' && r.emis && !emisISO(r.emis) ? ' bad' : ''}"${head && f === 'cognome' && tip ? ` title="${esc(tip)}"` : ''}><input class="wc" data-r="${esc(r.id)}" data-f="${esc(f)}" value="${esc(r[f] || '')}"${f === 'fila' && ctx.ev && ctx.TK && ctx.TK.sett.some(s => s.nome) ? ' list="tk-dl"' : ''}${f === 'emis' ? `${String(r.fila || '').trim() && !r.emis ? ' placeholder="gg/mm/aa"' : ''} inputmode="numeric"` : ''}${(f === 'note' || f === 'nota2') && String(r[f] || '').trim() ? ` title="${esc(r[f])}"` : ''} aria-label="${esc(l)} riga ${i + 1}" autocomplete="off"></td>`).join('')}
</tr>`;
  }
  // accompagnatore, autista e altro personale che dorme in hotel (vanno nella rooming list)
  function staffBox(t) {
    const st = t.staff && t.staff.length ? t.staff : [{ ruolo: 'Accompagnatore' }, { ruolo: 'Autista' }];
    return `<h3 class="wt">Staff in hotel</h3><div class="wtw"><table class="wl wl-staff"><thead><tr><th>N</th><th>ruolo</th><th>cognome e nome</th><th>camera</th><th>C</th></tr></thead><tbody>
      ${st.map((s, i) => `<tr><td class="wn"><button class="rn" data-act="staffdel" data-i="${i}" aria-label="Togli">${i + 1}</button></td><td><input class="wc" data-st="${i}" data-k="ruolo" value="${esc(s.ruolo || '')}" aria-label="Ruolo"></td><td><input class="wc" data-st="${i}" data-k="nome" value="${esc(s.nome || '')}" placeholder="facoltativo" aria-label="Nome"></td><td>${roomSel(`data-st="${i}" data-k="camera"`, s.camera, 'Camera ' + (s.ruolo || ''))}</td><td><input class="wc" data-st="${i}" data-k="num" value="${esc(s.num || '')}" aria-label="Numero camera"></td></tr>`).join('')}
    </tbody></table></div><button class="btn sm ghost" data-act="staffadd">${ICON.plus} riga</button>`;
  }
  // colonna «fila»: un pulsante che mostra la scelta e apre il menu delle file (solo tour e gite)
  const filaLabel = v => { v = String(v || '').trim(); let m;
    if ((m = /^(\d)\s*fila(?:\s+(sx|dx))?$/i.exec(v))) return `${m[1]}ª fila${m[2] ? ' ' + m[2].toLowerCase() : ''}`;
    if (/^2\s*°?\s*porta$/i.test(v)) return '1ª fila 2ª porta';
    // scritte delle liste Word (es. «1° f. sx»): se si capisce la fila, si mostra in modo uniforme
    const P = v ? reqFromFila(v) : null; if (P && P.fila >= 1 && P.fila <= 4) return `${P.fila}ª fila${P.lato ? ' ' + P.lato : ''}`; if (P && (P.zone || []).includes('porta2') && !P.fila) return '1ª fila 2ª porta';
    return v; };
  function filaSel(r, FI, i) {
    const v = String(r.fila || '').trim();
    if (!v && isEmptyRow(r)) return `<button class="fsel" data-act="filapick" data-id="${esc(r.id)}" aria-label="Fila riga ${i + 1}"></button>`;
    return `<button class="fsel${esc(v ? ' on' : '')}" data-act="filapick" data-id="${esc(r.id)}" aria-label="Fila riga ${i + 1}: ${esc(v ? filaLabel(v) : 'nessuna')}" title="${esc(v)}">${v ? esc(filaLabel(v)) : '<span>—</span>'}</button>`;
  }
  // una tabella per lista (con più bus: una per bus, più «Senza bus» se c'è qualcuno senza bus)
  // una tabella per lista (con più bus: una per bus, più «Senza bus» se c'è qualcuno senza bus)
  // Con più bus, in alto: «Tutti i bus» (una sotto l'altra), «Bus 1», «Bus 2»… (solo quella) e «Affiancate» (compatte, una accanto all'altra)
  function listTables(t, cols, ctx, bigl, SI) {
    const multi = multiBus(t);
    const thead = `<thead><tr><th>N</th>${cols.filter(([f]) => f !== 'pagato').map(([f, l]) => `<th class="c-${esc(f)}">${esc(l)}</th>`).join('')}${bigl ? '' : '<th class="c-posto">posto</th>'}<th class="c-quota" title="Quanto paga la persona di questa riga">quota</th>${cols.filter(([f]) => f === 'pagato').map(([f, l]) => `<th class="c-${esc(f)}">${esc(l)}</th>`).join('')}</tr></thead>`;
    const Ls = tripLists(t).map(L => { const rows = listRows(t, L.id); const full = rows.filter(r => !isEmptyRow(r)); return Object.assign({}, L, { rows, full }); }).filter(L => !(multi && !L.id && !L.full.length));
    let view = multi ? (UI.lview || 'all') : 'all'; if (view !== 'all' && view !== 'side' && !t.buses.some(b => b.id === view)) view = UI.lview = 'all';
    const head = L => { const seated = L.full.filter(r => SI[r.id]).length; const cap = L.b ? busCap(L.b) : 0;
      return multi ? `<div class="lhead${esc(L.id ? '' : ' nobus')}"><h3>${L.b ? ICON.bus : ICON.alert} ${esc(L.label)}</h3><span>${L.full.length} ${L.full.length === 1 ? 'persona' : 'persone'}${L.b ? ` · ${seated} con il posto · ${cap} posti${L.full.length > cap ? ` · <b class="neg">${L.full.length - cap} in più dei posti</b>` : ''}` : ' · da mettere su un bus'}</span></div>` : ''; };
    const tabs = multi ? `<div class="lviews" role="tablist" aria-label="Liste dei bus"><button role="tab" data-act="lview" data-v="all" aria-selected="${esc(view === 'all')}">${ICON.list} Tutti i bus</button>${t.buses.map(b => `<button role="tab" data-act="lview" data-v="${esc(b.id)}" aria-selected="${esc(view === b.id)}" data-droplist="L:${esc(b.id)}">${ICON.bus} Lista ${esc(b.label)} <small>${listRows(t, b.id).filter(r => !isEmptyRow(r)).length}</small></button>`).join('')}<button role="tab" data-act="lview" data-v="side" aria-selected="${esc(view === 'side')}">${ICON.dock} Affiancate</button></div>` : '';
    if (view === 'side') return tabs + `<div class="lside" style="--n:${esc(Ls.length)}">${Ls.map(L => `<section class="lsec lcol" data-list="${esc(L.id)}">${head(L)}<div class="wtw" data-droplist="L:${esc(L.id)}">${sideTable(t, L, ctx)}</div></section>`).join('')}</div>`;
    const show = view === 'all' ? Ls : Ls.filter(L => L.id === view);
    const nob = view !== 'all' && Ls.find(L => !L.id);
    return tabs + show.map(L => `<section class="lsec" data-list="${esc(L.id)}">${head(L)}<div class="wtw" data-droplist="${multi ? 'L:' + esc(L.id) : '1'}"><table class="wl${esc(ctx.ev ? ' wl-ev' : '')}">${thead}
        <tbody>${rowsShown(t, L.rows).map((r, i) => wRow(t, r, i, cols, ctx, bigl)).join('')}</tbody></table></div></section>`).join('')
      + (nob ? `<div class="lnobus small">${ICON.alert} ${nob.full.length} ${nob.full.length === 1 ? 'persona non è' : 'persone non sono'} su nessun bus: le vedi in «Tutti i bus».</div>` : '');
  }
  // lista compatta per la vista «Affiancate»: numero, nome, posto
  function sideTable(t, L, ctx) {
    let n = 0;
    return `<table class="wl wl-side"><thead><tr><th>N</th><th>cognome e nome</th><th>posto</th></tr></thead><tbody>${L.full.map(r => {
      const x = ctx.byRow[r.id]; const bk = x && x.bk; const head = x && x.k === 0; const seat = ctx.SI[r.id]; n++;
      let cls = head ? 'gh' : ''; if (bk && saldato(bk)) cls += ' paid'; if ((UI.lsel || []).includes(r.id)) cls += ' lsel';
      const drag = x ? `<span class="dh" draggable="true" ${head ? `data-dragbk="${esc(bk.id)}" title="Trascina tutta la prenotazione"` : `data-dragp="${esc(r.id)}" title="Trascina solo questa persona"`}>${ICON.grip}</span>` : '';
      return `<tr class="${esc(cls)}" data-rowid="${esc(r.id)}"><td class="wn">${drag}<button class="rn" data-act="rowmenu" data-id="${esc(r.id)}" aria-label="Riga ${esc(n)}: azioni">${n}</button></td><td class="sd-n">${head ? `<b>${esc(String(r.cognome).replace(RX, '$1').trim())}</b>${bk.persone.length > 1 || bk.n > 1 ? ` <small>x ${Math.max(bk.n, bk.persone.length)}</small>` : ''}` : esc(String(r.cognome || '').trim())} ${esc(r.nome || '')}</td><td class="wpos">${seat ? `<span class="pill ok">${esc(seat.b.label.replace(/^Bus\s*/i, 'B'))} · ${seat.s}</span>` : '<span class="pill tbd">da sistemare</span>'}</td></tr>`;
    }).join('') || '<tr><td colspan="3" class="emptyrow">Nessuno: trascina qui le persone</td></tr>'}</tbody></table>`;
  }
  // barra in basso quando ci sono righe selezionate
  function selBar(t) {
    const ids = (UI.lsel || []).filter(id => { const r = rowById(t, id); return r && !isEmptyRow(r); }); if (!ids.length) return '';
    const D = deriveBookings(t); const nbk = new Set(ids.map(id => (D.find(b => b.persone.some(p => p.id === id)) || {}).id)).size;
    const here = new Set(ids.map(id => listKey(t, rowById(t, id))));
    const to = multiBus(t) ? tripLists(t).filter(L => !(here.size === 1 && here.has(L.id))) : [];
    return `<div class="selbar" role="toolbar" aria-label="Righe selezionate"><b>${ids.length} ${ids.length === 1 ? 'persona selezionata' : 'persone selezionate'}</b><span class="small">${nbk} ${nbk === 1 ? 'prenotazione' : 'prenotazioni'}</span>
      ${to.length ? `<span class="sb-l">Sposta in</span>${to.map(L => `<button class="btn sm" data-act="lmove" data-to="${esc(L.id)}">${L.b ? ICON.bus : ''} ${esc(L.b ? L.b.label : L.label)}</button>`).join('')}` : multiBus(t) ? '' : '<span class="small">Con due o più bus potrai spostarle da una lista all\'altra</span>'}
      ${ids.some(id => { const b = D.find(x => x.persone.some(p => p.id === id)); return b && b.persone.length > 1; }) ? `<button class="btn sm" data-act="detach" title="Le persone selezionate (non i capigruppo) diventano prenotazioni a sé">${ICON.unlink} Stacca dalla comitiva</button>` : ''}
      <button class="btn sm ghost" data-act="lselclear">${ICON.close} Deseleziona</button></div>`;
  }
  function listaView(t, D, SI, T) {
    const bigl = tripCat(t) === 'biglietteria'; const tour = !bigl && isTourT(t); const ev = tripCat(t) === 'evento'; const cols = listCols(tour, bigl, ev);
    // 2.1.12: «note 2» = note interne, solo qui nella lista (non vanno nella stampa, che usa listCols senza questa colonna)
    if (!bigl) cols.splice(cols.findIndex(([f]) => f === 'note') + 1, 0, ['nota2', 'note 2']);
    const byRow = {}; D.forEach((bk, gi) => bk.persone.forEach((p, k) => { byRow[p.id] = { bk, gi, k }; }));
    const ctx = { byRow, SI, parts: partOpts(t), FI: supplPrices(t) ? filaInfo(t, D) : null, ev, OV: ev ? overCap(t, D) : null, TK: ev ? tripTkt(t) : null };
    const Q = t.quota;
    const sup = (k, l) => `<td><span class="sl">${l}</span><input class="hc num" data-qs="${esc(k)}" inputmode="decimal" value="${Q.suppl[k] != null ? esc(String(Q.suppl[k]).replace('.', ',')) : ''}" placeholder="€"></td>`;
    const annTable = (k, title, dl = 'data di annullo') => {
      const rows = t.annullati.filter(r => r.stato === k);
      return `<h3 class="wt">${title}</h3><div class="wtw"><table class="wl wl-ann"><thead><tr><th>N</th>${cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}<th>${dl}</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td class="wn"><button class="rn" data-act="annmenu" data-id="${esc(r.id)}" aria-label="Azioni">${i + 1}</button></td>${cols.map(([f, l]) => `<td><input class="wc" data-nr="${esc(r.id)}" data-f="${esc(f)}" value="${esc(r[f] || '')}" aria-label="${esc(l)}"></td>`).join('')}<td><input class="wc" data-nr="${esc(r.id)}" data-f="dataAnn" value="${esc(r.dataAnn || '')}" aria-label="data di annullo"></td></tr>`).join('') || `<tr><td colspan="${esc(cols.length + 2)}" class="emptyrow">—</td></tr>`}
      </tbody></table></div><button class="btn sm ghost" data-act="annadd" data-k="${esc(k)}">${ICON.plus} riga</button>`;
    };
    const main = `
      ${headBlock(t)}
      <div class="wbar">
        <div class="wsum"><b>${T.pers}</b> persone · ${T.nBk} prenotazioni${T.nRooms ? ` · <b>${T.nRooms}</b> camere (${esc(roomsText(T.rooms))})` : ''} · incassato <b>${euro(T.paid)}</b>${T.due ? ` su ${euro(T.due)}` : ''}${T.mancano ? ` · <span class="neg">mancano ${T.mancano} nomi</span>` : ''}</div>
        <button class="btn sm" data-act="timport">${ICON.upload} Importa da Word</button>
        <button class="btn sm" data-act="printlist">${ICON.print} Stampa lista</button>
        ${tour ? `<button class="btn sm" data-act="rooming">${ICON.print} Rooming list</button>` : ''}
        ${bigl ? '' : `<button class="btn sm${esc(UI.dock ? ' dark' : ' primary')}" data-act="dock" aria-pressed="${esc(!!UI.dock)}">${ICON.dock} ${UI.dock ? 'Nascondi piantina' : 'Piantina accanto'}</button>`}
      </div>
      ${ctx.OV && (ctx.OV.n > ctx.OV.cap || ctx.OV.ids.size) ? `<div class="warnbox capw" role="alert">${ICON.alert}<span><b>Posti finiti: ${ctx.OV.n > ctx.OV.cap ? `${ctx.OV.n} persone per ${ctx.OV.cap} posti sul bus.` : 'un bus è pieno.'}</b> ${ctx.OV.ids.size ? `${ctx.OV.ids.size === 1 ? 'La persona segnata' : `Le ${ctx.OV.ids.size} persone segnate`} «senza posto» non ${ctx.OV.ids.size === 1 ? 'si può' : 'si possono'} incassare.` : 'Mancano posti per i nomi ancora da scrivere.'} Aggiungi un bus da «Posti sul bus» oppure sposta qualcuno in lista d'attesa.</span></div>` : ''}
      ${listTables(t, cols, ctx, bigl, SI)}
      <div class="whelp small">${bigl ? 'Una riga per cliente: «Rossi x 2» e i nomi sotto. Con il pulsante «€» si registra l\'incasso e si prepara lo scontrino.' : `Si scrive come in Word`}${bigl ? '' : `: «Rossi x 3» sulla prima riga e le altre persone sotto. Invio = riga sotto. Il numero a sinistra apre il menu della riga (anche con il tasto destro). ${gestHint()} Cognome <span class="pos">verde</span> = saldato. Per mettere i posti trascina ${ICON.grip} sulla piantina: dalla prima riga si sposta tutta la prenotazione, dalle altre la singola persona${multiBus(t) ? '; trascinando nell\'altra lista si cambia bus' : ''}. Il pulsante «€» della prima riga apre l'incasso di tutta la comitiva, quello delle altre righe l'incasso della singola persona.`}</div>
      ${selBar(t)}
      ${bigl ? '' : `<div class="wsupp2">
        <label class="chk"><input type="checkbox" data-tchk="guida"${t.guida ? ' checked' : ''}> ------- x guida e 2° autista (sul bus resta un posto per loro)</label></div>`}
      <h3 class="wt">Lista d'attesa</h3>
      <div class="wtw"><table class="wl wl-att"><thead><tr><th>N</th>${ATTC.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>
        ${t.attesa.map((r, i) => `<tr${isEmptyRow(r) ? ' class="blank"' : ''}><td class="wn"><button class="rn" data-act="attmenu" data-id="${esc(r.id)}" aria-label="Azioni">${i + 1}</button></td>${ATTC.map(([f, l]) => `<td><input class="wc" data-ar="${esc(r.id)}" data-f="${esc(f)}" value="${esc(r[f] || '')}" aria-label="${esc(l)}"></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      ${tour ? staffBox(t) : ''}
      ${bigl ? annTable('vende', 'Vuole vendere il biglietto', 'data richiesta') : annTable('da', 'Non partono più – da rimborsare') + annTable('fatto', 'Non partono più – già rimborsati') + annTable('no', 'Non partono più – hanno rinunciato senza avere rimborso')}`;
    const side = UI.dock && !bigl ? mapPanel(t, 'dock') : '';
    return `<div class="lwrap${esc(side ? ' dock' : '')}"><div class="lmain">${main}</div>${side ? `<aside class="ldock">${side}</aside>` : ''}</div>`;
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
        <div class="stat${esc(free ? ' alert' : '')}"><b>${free}</b><span>senza posto</span></div></div>
        <label class="chk small"><input type="checkbox" data-act="onlyfree"${UI.onlyFree ? ' checked' : ''}> Mostra solo chi non ha il posto</label>
      </div>
      <div class="bklist" id="bklist" data-droplist="1">${list.map(bk => {
        const st = bkSeatsText(t, bk, SI); const rs = reqSummary(bk);
        const onBus = bk.persone.map(p => SI[p.id] && SI[p.id].b).find(Boolean);
        const ps = onBus ? prefStatus(onBus, bkById(onBus, bk.id) || bk) : null;
        const parts = [...new Set(bk.persone.map(p => p.part).filter(Boolean))];
        const stTxt = st.txt ? `${esc(st.txt)}${st.none ? ` · ${st.none} senza` : ''}` : 'senza posto';
        const rqS = ps === 'ok' ? '✓ rispettata' : ps === 'ko' ? '✗ non rispettata' : ps === 'pref' ? '≈ non possibile' : 'da sistemare';
        const short = p => `${esc(p.cognome)} ${esc(String(p.nome || '').trim().slice(0, 1))}${p.nome ? '.' : ''}`;
        return `<div class="lb lb2${esc(UI.sel === bk.id ? ' sel' : '')}${st.none ? ' todo' : ''}" data-act="selbk" data-id="${esc(bk.id)}" draggable="true" data-dragbk="${esc(bk.id)}">
          <div class="lb2-h"><span class="ln">${bk.ord}</span><span class="dot" style="background:${esc(bk.head.c != null ? COLORS[bk.head.c % COLORS.length] : 'transparent')}"></span>
            <span class="lb2-n" title="${esc(bkName(bk))} x ${bk.persone.length}"><b>${esc(bkName(bk))}</b> <small>x ${bk.persone.length}</small></span>
            <span class="lb2-c">${parts.map(p => `<span class="code">${esc(p)}</span>`).join('')}</span><span class="lb2-s ${esc(st.none ? (st.txt ? 'part' : 'none') : 'ok')}">${stTxt}</span></div>
          ${bk.mancano ? `<div class="lb2-m"><span class="lb2-w">mancano ${bk.mancano} ${bk.mancano === 1 ? 'nome' : 'nomi'}</span></div>` : ''}
          ${rs.text ? `<div class="lb2-r ${esc(ps || 'pending')}"><span>${esc(rs.text)}${rs.paid ? ' · pagato' : ''}</span><b>${rqS}</b></div>` : ''}
          <div class="lb2-p">${bk.persone.map(p => `<span class="pchip${esc(SI[p.id] ? ' on' : '')}${UI.selP === p.id ? ' sel' : ''}" draggable="true" data-dragp="${esc(p.id)}" data-act="selp" data-id="${esc(p.id)}" title="${esc(p.cognome)} ${esc(p.nome)} · trascina solo questa persona">${short(p)}${SI[p.id] ? ` <i>${SI[p.id].s}</i>` : ''}</span>`).join('')}</div>
        </div>`;
      }).join('') || '<div class="small" style="padding:14px">La lista è vuota: scrivila nella sezione «Lista prenotazioni» oppure importa il file Word.</div>'}</div>
    </section>`;
  }
  function mapPanel(t, mode) {
    const b = bus();
    const tabs = `<div class="mtabs">${t.buses.map(x => { const st = busStats(x); const ns = (x.sosp || []).length; return `<button class="mtab" data-act="tab" data-id="${esc(x.id)}" data-dropbus="${esc(x.id)}" aria-pressed="${esc(x.id === UI.busId)}" title="Lascia qui una prenotazione: la sistemo da sola su questo bus"><b>${esc(x.label)}</b><span>${st.tot}/${st.cap}</span>${ns ? `<i class="sospb" title="${ns} in sospeso">${ns}</i>` : ''}</button>`; }).join('')}<button class="mtab add" data-act="addbus" data-trip="${esc(t.id)}" title="Aggiungi bus">${ICON.plus}${t.buses.length ? '' : ' Aggiungi bus'}</button></div>`;
    if (!b) return `<section class="panel mapp ${esc(mode)}"><div class="panel-h">${tabs}</div><div class="panel-b"><div class="empty">Questa gita non ha ancora pullman: premi «+» e scegli la piantina.</div></div></section>`;
    return `<section class="panel mapp ${esc(mode)}"><div class="panel-h">${tabs}</div><div class="mapwrap${esc(mode === 'dock' ? ' compact' : '')}" id="mapwrap">${mapInner(t, b, mode)}</div>${mode === 'dock' ? `<div class="panel-f"><button class="btn primary sm" data-act="fill">${ICON.wand} Sistema chi non ha il posto</button><button class="btn sm" data-act="sec" data-v="posti">Apri «Posti sul bus»</button></div>` : ''}</section>`;
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
    } else hint = `<div class="hint idle">Trascina dalla lista una prenotazione o una persona e lasciala sul posto. Lasciandola sul nome del bus in alto, i posti li sceglie l'app con le vostre regole.${(() => { const k = G_SEAT.find(([x]) => gest().seat[x] === 'mvbk'); return k ? ` ${k[1].replace(/ su un posto occupato$/, '')} su un posto occupato: sposti tutta la prenotazione.` : ''; })()}</div>`;
    let want = null;
    const reqs = sel ? [sel.pref, ...sel.persone.map(p => p.req)] : [];
    if (reqs.some(hasAny)) { want = new Set(); reqs.filter(hasAny).forEach(r => wantSeats(L, r).forEach(s => { if (!b.seats[s]) want.add(s); })); }
    const sp = (b.sosp || []).map(pid => rowById(t, pid)).filter(Boolean);
    const sosp = mode !== 'dock' || sp.length ? `<div class="sosp${sp.length ? ' on' : ''}" data-sospdrop="1"><div class="sosp-h"><b>${ICON.clock} Posti in sospeso</b><span>${sp.length ? `${sp.length === 1 ? '1 persona da rimettere' : sp.length + ' persone da rimettere'} sul bus: trascinala su un posto, oppure clicca il nome e poi il posto` : 'Trascina qui un posto per tenere da parte la persona mentre sistemi gli altri'}</span></div><div class="sosp-l">${sp.map(r => { const bk = D.find(x => x.persone.some(p => p.id === r.id)); return `<span class="schip${UI.selP === r.id ? ' on' : ''}" draggable="true" data-dragp="${esc(r.id)}"><button class="schip-n" data-act="selp" data-id="${esc(r.id)}" title="Clicca e poi tocca il posto dove metterla">${esc(String(r.cognome || '').replace(RX, '$1').trim())} ${esc(r.nome || '')}${bk && bk.persone.length > 1 ? ` <small>${esc(bkName(bk))} X ${bk.persone.length}</small>` : ''}${r.part ? ` <small>${esc(r.part)}</small>` : ''}</button><button class="schip-x" data-act="sospdel" data-id="${esc(r.id)}" title="Togli dal sospeso (resta senza posto)" aria-label="Togli dal sospeso">${ICON.close}</button></span>`; }).join('')}${Array.from({ length: Math.max(0, 3 - sp.length) }, () => '<span class="schip svuoto" aria-hidden="true"></span>').join('')}</div></div>` : '';
    return `${hint}${sosp}<div class="floors${esc(UI.sel || UI.selP ? ' placing' : '')}">${L.floors.map((f, i) => deckHTML(b, L, i, { interactive: true, want })).join('')}</div>
      <div class="legend"><span><i class="lg-x"></i>«X 2», «X 5»: quanti sono nel gruppo · in alto a destra la fila pagata</span><span><i class="lg-cross"></i>posto vuoto a fine gruppo</span>${want ? '<span><i style="background:#E3F5E9;border-color:#2B7A4B"></i>adatto alla richiesta</span>' : ''}<span>${busStats(b).free} posti liberi</span></div>`;
  }
  function depCounts(b) { const c = {}; b.bookings.forEach(bk => bk.persone.forEach(p => { const k = (p.part || '').toUpperCase(); c[k] = (c[k] || 0) + 1; })); return c; }
  function depsHTML(b) {
    const c = depCounts(b);
    const rows = (b.partenze || []).map((d, i) => `<div class="dep"><input aria-label="Codice" value="${esc(d.code)}" data-dep="${i}" data-k="code" placeholder="codice"><input aria-label="Luogo" value="${esc(d.luogo)}" data-dep="${i}" data-k="luogo" placeholder="luogo di salita"><input aria-label="Ora" value="${esc(d.ora)}" data-dep="${i}" data-k="ora" placeholder="ora"><button class="kebab" data-act="deldep" data-i="${i}" aria-label="Togli partenza">${ICON.close}</button><span class="cnt">${c[(d.code || '').toUpperCase()] || 0} persone salgono qui</span></div>`).join('');
    return rows || '<div class="small">Scrivi i punti di partenza con l\'orario: compaiono nella piantina stampata.</div>';
  }
  function busPanel(t, b) {
    const L = LMAP[b.layout];
    const f = (id, label, key, ph = '') => `<div class="field"><label for="${esc(id)}">${label}</label><input id="${esc(id)}" data-bind="${esc(key)}" value="${esc(b[key] || '')}" placeholder="${esc(ph)}"></div>`;
    const noBus = deriveBookings(t).filter(bk => bk.persone.every(p => !p.row.bus)).length;
    return `<section class="panel side-r" aria-label="Dati del bus">
      <div class="panel-h"><h3>${esc(b.label)}</h3></div>
      <div class="panel-b">
        <div class="actions">
          <button class="btn primary" data-act="fill">${ICON.wand} ${noBus ? `Metti su ${esc(b.label)} chi non ha il bus e sistema i posti` : 'Sistema automaticamente chi non ha il posto'}</button>
          <button class="btn dark" data-act="printmap">${ICON.print} Stampa piantina</button>
          <button class="btn dark" data-act="printcards">${ICON.cards} Stampa cartelli</button>
          <button class="btn wa" data-act="wa">${ICON.wa} Messaggi WhatsApp ai clienti</button>
          <button class="btn dark" data-act="printacc">${ICON.print} Stampa lista passeggeri</button>
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
  function openPop(anchor, html, cls) {
    closePop();
    const p = document.createElement('div'); p.className = 'pop' + (cls ? ' ' + cls : ''); p.id = 'pop'; p.innerHTML = html; document.body.appendChild(p);
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
    $('#modal-root').innerHTML = `<div class="scrim" data-act="scrim"><div class="modal${esc(wide ? ' wide' : '')}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><h2>${title}</h2><button class="btn ghost" data-act="close" aria-label="Chiudi">${ICON.close}</button></div><div class="modal-b">${body}</div><div class="modal-f">${foot}</div></div></div>`;
    const first = $('#modal-root input, #modal-root textarea'); if (first) setTimeout(() => first.focus(), 30);
  }
  function closeModal() { $('#modal-root').innerHTML = ''; UI.modal = null; pending = null; }
  function confirmBox(title, text, label, fn) {
    pending = fn;
    openModal(title, `<p style="margin:0">${text}</p>`, `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="doconfirm">${label}</button>`);
  }
  function tripModal(t) {
    UI.modal = { kind: 'trip', id: t ? t.id : null, serv: t ? tripServ(t).slice() : ['bus'] };
    const cat = t ? tripCat(t) : 'gita';
    openModal(t ? 'Modifica gita' : 'Nuova gita', `<div class="tm">
      <div class="field"><label for="t-nome">Nome</label><input id="t-nome" class="tm-name" value="${esc(t ? t.nome : '')}" placeholder="es. Notre Dame de Paris - Messina"></div>
      <div class="tm-row">
        <div class="field"><label for="t-cat">Tipo</label><select id="t-cat">${['gita', 'tour', 'evento'].concat(cat === 'biglietteria' ? ['biglietteria'] : []).map(c => `<option value="${esc(c)}"${cat === c ? ' selected' : ''}>${CAT_L[c]}</option>`).join('')}</select></div>
        <div class="field"><label for="t-data">Partenza</label><input id="t-data" type="date" value="${esc(t ? t.data : todayISO())}"></div>
        <div class="field"><label for="t-fine">Rientro <small>se più giorni</small></label><input id="t-fine" type="date" value="${esc(t ? t.fine || '' : '')}"></div>
        <div class="field"><label for="t-code">Codice</label><input id="t-code" value="${esc(t ? t.code || '' : '')}" placeholder="G07, T08"></div>
      </div>
      <label class="tm-extra"><input type="checkbox" id="t-extra"${t && t.extra ? ' checked' : ''}><span><b>Data extra</b> · replica di un viaggio già in programma</span></label>
      <div id="t-servbox" class="tm-sec"${cat === 'biglietteria' ? ' hidden' : ''}><div class="tm-h">Servizi compresi <small>tocca per accendere o spegnere: si vedono nell'elenco dei viaggi</small></div>${servPicker(t)}</div>
      <details class="tm-sec tm-more"${t && (t.codDanea || t.programma) ? ' open' : ''}><summary>Programma e Danea</summary>
        <div class="field"><label for="t-prog">Link al programma <small>PDF su Dropbox o pagina del sito</small></label><input id="t-prog" value="${esc(t ? t.programma || '' : '')}" placeholder="https://www.laterra.it/..."></div>
        <div class="field"><label for="t-danea">Codice prodotto Danea <small>per «Apri in Danea» nelle fatture</small></label><input id="t-danea" value="${esc(t ? t.codDanea || '' : '')}" placeholder="es. 261018 boschi e zafferana 18/10/26"></div>
      </details></div>`,
      `${t && (ACC.can('settings') || !(t.chiusa || t.histLock)) ? `<button class="btn danger" data-act="deltrip" style="margin-right:auto">${ICON.trash} Elimina gita</button>` : ''}<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="savetrip">${t ? 'Salva' : 'Crea'}</button>`);
  }
  function busModal(tripId, change) {
    const t = S.trips.find(x => x.id === tripId); const b = change ? bus() : null;
    UI.modal = { kind: change ? 'layout' : 'bus', tripId, pick: b ? b.layout : '52' };
    const n = t.buses.length + 1;
    openModal(change ? 'Cambia piantina' : 'Aggiungi bus', `
      ${change ? '<div class="infobox">I posti già assegnati restano dove sono se il nuovo pullman ha quel numero di posto; gli altri tornano «senza posto».</div>' : `<div class="grid2"><div class="field"><label for="nb-label">Nome del bus</label><input id="nb-label" value="Bus ${esc(n)}"></div><div class="field"><label for="nb-mezzo">Mezzo (ID o targa)</label><input id="nb-mezzo" placeholder="facoltativo"></div></div>
      <div class="grid2"><div class="field"><label for="nb-autista">Autista</label><input id="nb-autista" placeholder="facoltativo"></div><div class="field"><label for="nb-acc">Accompagnatore</label><input id="nb-acc" placeholder="facoltativo"></div></div>`}
      <div class="field"><label>Scegli la piantina</label></div>
      <div class="models pick" id="pickgrid">${window.LAYOUTS.map(L => modelCard(L, UI.modal.pick)).join('')}</div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="${esc(change ? 'savelayout' : 'savebus')}">${change ? 'Cambia piantina' : 'Aggiungi bus'}</button>`, true);
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
  // rooming list per l'hotel: camere divise per tipo, ospiti, solo le note utili all'hotel (niente pagamenti,
  // telefoni, email o richieste sui posti del pullman), e in fondo lo staff (accompagnatore, autista)
  const NOHOTEL = /@|\b\d{6,}\b|bonific|pagat|pagament|acconto|\bsald|caparr|buono|\bft\b|fattur|provvisori|n[°º]|ricevut|€|regalo|\bfila\b|bus|pullman|corridoio|finestrin|\blato\b|met[aà] bus|fondo|\bporta\b|davanti|dietro|\bposto\b|uscita|ultim|penultim|non alla fine/i;
  const hotelNote = s => String(s || '').split(/\s*(?:·|;|\n|,(?=\s*[A-Za-zÀ-ÿ]))\s*/).map(x => x.trim()).filter(x => x && !NOHOTEL.test(x)).join(' · ');
  const cleanN = s => String(s || '').replace(/\s*[-–]+\s*$/, '').trim();
  function roomingPages(t) {
    const D = deriveBookings(t); const T = summaryOf(t, D, seatIndex(t)); const Q = t.quota;
    const rooms = []; D.forEach(bk => roomsOf(bk).forEach(r => rooms.push({ r, bk })));
    const num = x => { const n = parseInt(x.r.num, 10); return isNaN(n) ? 1e6 : n; };
    const ORD = ['singola', 'doppia', 'matrimoniale', 'matrimoniale + lettino', 'tripla', 'quadrupla'];
    const PL = { singola: 'Singole', doppia: 'Doppie', matrimoniale: 'Matrimoniali', 'matrimoniale + lettino': 'Matrimoniali + lettino', tripla: 'Triple', quadrupla: 'Quadruple' };
    const groups = {}; rooms.forEach(x => { const k = roomKind(x.r); (groups[k] = groups[k] || []).push(x); });
    const keys = Object.keys(groups).sort((a, c) => (ORD.indexOf(a) < 0 ? 99 : ORD.indexOf(a)) - (ORD.indexOf(c) < 0 ? 99 : ORD.indexOf(c)));
    const guest = (p, i, r) => { const a = ageAt(p, t.data); const inf = r.tipo === 'matrimoniale + lettino' && i >= 2; return `${esc(cleanN(p.cognome))} ${esc(cleanN(p.nome))}${a != null && a < 12 ? ` <small>(${a} ${a === 1 ? 'anno' : 'anni'}${inf ? ', lettino' : ''})</small>` : inf ? ' <small>(lettino)</small>' : ''}`; };
    const staff = (t.staff || []).filter(s => s.camera || s.nome);
    const sec = k => `<tr class="rl-g"><td colspan="3">${esc(PL[k] || k)} · ${groups[k].length}</td></tr>` + groups[k].sort((a, c) => num(a) - num(c)).map(({ r }) => `<tr><td class="rn">${esc(r.num || '—')}</td><td>${r.persone.map((p, i) => guest(p, i, r)).join('<br>')}</td><td class="rnote">${esc([...new Set(r.persone.map(p => hotelNote(p.row.note)).filter(Boolean))].join(' · '))}</td></tr>`).join('');
    const staffRows = staff.length ? `<tr class="rl-g"><td colspan="3">Staff · ${staff.length}</td></tr>` + staff.map(s => `<tr><td class="rn">${esc(s.num || '—')}</td><td>${esc(s.nome || s.ruolo)}${s.nome ? ` <small>(${esc(s.ruolo)})</small>` : ''}</td><td class="rnote">${esc(s.camera ? s.camera : '')}</td></tr>`).join('') : '';
    const nStaff = staff.length; const cnt = keys.map(k => `${groups[k].length} ${groups[k].length === 1 ? k : (PL[k] || k).toLowerCase()}`).join(' · ');
    return `<div class="page rl">${pmHeader({ cell: (LMAP['54'] || {}).cell || '', nome: '', desc: '' }).replace('<div class="mod">Modello: <br></div>', '')}
      <div class="pm-t"><h2>Rooming list · ${esc(t.nome)}</h2><span>${esc(fmtTripDate(t))}</span>${Q.hotel ? `<span><b>${esc(Q.hotel)}</b></span>` : ''}<span>${rooms.length + nStaff} camere: ${esc(cnt)}${nStaff ? ' + ' + nStaff + ' staff' : ''} · ${T.pers + nStaff} persone</span></div>
      <table class="rlt"><thead><tr><th>Camera</th><th>Ospiti</th><th>Note per l'hotel</th></tr></thead><tbody>${keys.map(sec).join('') + staffRows || '<tr><td colspan="3">Nessuna camera indicata nella lista.</td></tr>'}</tbody></table>
      <div class="pm-foot"><span>${nStaff ? '' : 'Accompagnatore e autista non indicati (si aggiungono in «Staff in hotel» nella lista)'}</span><span>Stampato il ${fmtDate(todayISO())}</span></div></div>`;
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
    const annT = (k, title, dl = 'data di annullo') => ann(k).length ? `<h3 class="lt">${title}</h3><table class="lpt">${head}<th>${dl}</th></tr></thead><tbody>${ann(k).map((r, i) => tr(r, i, x => `<td>${esc(x.dataAnn || '')}</td>`)).join('')}</tbody></table>` : '';
    const att = t.attesa.filter(r => !isEmptyRow(r));
    const SP = supplPrices(t); 
    return `<div class="page lp">
      ${bigl ? `<table class="lph"><tr><td class="tt">${esc(t.nome)}</td><td>Data</td><td>${esc(fmtTripDate(t))}</td><td>intero</td><td>${euro(Q.tkt1)}</td><td>${esc(Q.tkt2L || 'ridotto')}</td><td>${euro(Q.tkt2)}</td><td>diritti</td><td>${euro(Q.diritti)}</td></tr></table>` : `<table class="lph"><tr><td class="tt" rowspan="3">${esc(t.nome)}</td><td>Adulti</td><td>${euro(Q.adulti)}</td>${tour ? `<td>singola</td><td>${euro(Q.singola)}</td>` : ''}<td rowspan="3" class="deps">${(t.partenze || []).map(d => `${esc(d.citta)} ${esc(d.luogo)} ${esc(d.ora)}`).join('<br>')}</td></tr>
        <tr><td>Data</td><td>${esc(fmtTripDate(t))}</td>${tour ? `<td>${esc(Q.bambiniL || '3/11 anni')}</td><td>${euro(Q.bambini)}</td>` : ''}</tr>
        <tr><td>${tour ? 'Hotel' : esc(Q.bambiniL || '4/11 anni')}</td><td>${tour ? esc(Q.hotel || '') : euro(Q.bambini)}</td>${tour ? `<td>acconto / saldo</td><td>${euro(Q.acconto)} / ${euro(Q.saldo)}${Q.saldoEntro ? ' il ' + esc(fmtDate(Q.saldoEntro)) : ''}</td>` : ''}</tr></table>`}
      ${notesOf(t).filter(n => String(n).trim()).map((n, i) => `<div class="lnote">Nota ${i + 1}: ${esc(n)}</div>`).join('')}
      ${tripLists(t).map(L => { const fr = listRows(t, L.id).filter(r => !isEmptyRow(r)); if (multiBus(t) && !fr.length) return ''; return `${multiBus(t) ? `<h3 class="lt">${esc(L.label)}${L.b && L.b.mezzo ? ' · ' + esc(L.b.mezzo) : ''} · ${fr.length} persone</h3>` : ''}<table class="lpt">${head}${bigl ? '' : '<th>posto</th>'}</tr></thead><tbody>${fr.map((r, i) => tr(r, i, bigl ? null : x => `<td>${SI[x.id] ? esc(SI[x.id].b.label.replace(/^Bus\s*/i, 'B')) + ' · ' + SI[x.id].s : ''}</td>`)).join('')}</tbody></table>`; }).join('')}
      ${t.guida ? '<div class="lnote">------- x guida e 2° autista</div>' : ''}
      ${SP ? `<h3 class="lt">Supplementi file${tripCat(t) === 'tour' ? ` (${tripDays(t)} giorni)` : ''}</h3><div class="lnote">${[1, 2, 3, 4].map(k => `${k}ª fila ${euro(SP[k])}`).join(' · ')} · 1ª fila 2ª porta ${euro(SP.p2)}</div>` : ''}
      ${att.length ? `<h3 class="lt">Lista d'attesa</h3><table class="lpt"><thead><tr><th>N</th>${ATTC.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${att.map((r, i) => `<tr><td>${i + 1}</td>${ATTC.map(([f]) => `<td>${esc(r[f] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
      ${bigl ? annT('vende', 'Vuole vendere il biglietto', 'data richiesta') : annT('da', 'Non partono più – da rimborsare') + annT('fatto', 'Non partono più – già rimborsati') + annT('no', 'Non partono più – hanno rinunciato senza avere rimborso')}
      <div class="pm-foot"><span>${full.length} righe</span><span>Stampato il ${fmtDate(todayISO())}</span></div></div>`;
  }
  // lista per l'accompagnatore (2.1.14): solo le persone di questo bus; niente prezzi, incassi, note della gita,
  // supplementi delle file e lista d'attesa. Restano data, partenze con gli orari, nome della gita e del bus, quante persone.
  // La partenza di ognuno è colorata con il colore del luogo (Impostazioni › Luoghi di partenza).
  function accPages(t, b) {
    const tour = isTourT(t); const SI = seatIndex(t); const lk = multiBus(t) ? b.id : '';
    const rows = listRows(t, lk).filter(r => !isEmptyRow(r)); const n = listLoad(t, lk);
    const cols = [['cognome', 'Cognome'], ['nome', 'Nome'], ['tel', 'Contatto'], ['part', 'Partenza']].concat(tour ? [['hotel', 'Hotel'], ['cam', 'Camera']] : [], [['note', 'Note']]);
    const bd = (b.partenze || []).filter(d => d.code || d.luogo);
    const deps = bd.length ? bd.map(d => ({ code: String(d.code || '').toUpperCase(), city: '', luogo: d.luogo || '', ora: d.ora || '' }))
      : (t.partenze || []).filter(d => d && (d.citta || d.luogo) && !/^no$/i.test(d.ora || '')).map(d => ({ code: '', city: d.citta || '', luogo: /^no$/i.test(d.luogo || '') ? '' : d.luogo || '', ora: d.ora || '' }));
    const depOf = part => { const c = String(part || '').toUpperCase().trim(); if (!c) return -1; return deps.findIndex(d => (d.code && d.code === c) || (!d.code && codeIn(c, d.city))); };
    const cnt = deps.map(() => 0); rows.forEach(r => { const i = depOf(r.part); if (i >= 0) cnt[i]++; });
    const depLines = deps.map((d, i) => `<div class="accdep"><span class="accsw" style="background:${esc(partColor(d.code, d.city) || 'transparent')}">${esc(d.code || d.city)}</span> ${esc(d.luogo)}${d.ora ? ' · ore ' + esc(d.ora) : ''} <small>— ${cnt[i]} pers.</small></div>`).join('');
    const cell = (r, f) => f === 'part' ? `<td class="accpart" style="background:${esc(partColor(r.part) || 'transparent')}">${esc(r.part || '')}</td>` : `<td>${esc(r[f] || '')}</td>`;
    return `<div class="page lp acc">
      <table class="lph"><tr><td class="tt" rowspan="2">${esc(t.nome)}</td><td>Data</td><td>${esc(fmtTripDate(t))}</td><td rowspan="2" class="deps">${depLines || '—'}</td></tr>
        <tr><td>Bus</td><td><b>${esc(b.label)}</b>${b.mezzo ? ' · mezzo ' + esc(b.mezzo) : ''}${b.autista ? `<br>Autista: ${esc(b.autista)}` : ''}${b.accompagnatore ? `<br>Accompagnatore: ${esc(b.accompagnatore)}` : ''}</td></tr></table>
      <h3 class="lt">Lista ${esc(b.label)} · ${n} ${n === 1 ? 'persona' : 'persone'}</h3>
      <table class="lpt"><thead><tr><th>N</th>${cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}<th>Posto</th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${cols.map(([f]) => cell(r, f)).join('')}<td>${SI[r.id] && SI[r.id].b === b ? esc(SI[r.id].s) : ''}</td></tr>`).join('') || `<tr><td colspan="${cols.length + 2}">Nessuna persona in questa lista.</td></tr>`}</tbody></table>
      <div class="pm-foot"><span>${rows.length} righe</span><span>Stampato il ${fmtDate(todayISO())}</span></div></div>`;
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
      for (let i = 0; i < list.length; i += 3) html += `<div class="page cp">${list.slice(i, i + 3).map(c => `<div class="card"><div class="strip"><span>${label.toUpperCase()}</span></div><div class="ct">${c.lines.map(esc).join('<br>')}</div></div>`).join('')}</div>`;
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
    else if (kind === 'acc') { body = accPages(t, b); title = `Lista per l'accompagnatore · ${b.label}`; }
    else {
      const r = cardPages(b, UI.cartOrder); body = r.html; title = `Cartelli · ${b.label} · lato autista ${r.sx} · lato hostess ${r.dx}`;
      extra = `<div class="seg" role="group" aria-label="Ordine"><button data-act="cartorder" data-v="posto" aria-pressed="${esc(UI.cartOrder === 'posto')}">Dal davanti al fondo</button><button data-act="cartorder" data-v="lista" aria-pressed="${esc(UI.cartOrder === 'lista')}">Come la lista</button></div>`;
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
  // ---- colori dei luoghi di partenza (2.1.14): si scelgono in Impostazioni › Luoghi e colorano la partenza nella lista dell'accompagnatore ----
  // I colori sono un elenco fisso (chiave → colore chiaro, leggibile anche in stampa).
  const LCOL = [['', 'Nessuno', ''], ['verde', 'Verde', '#BDE5B0'], ['giallo', 'Giallo', '#FFEE85'], ['azzurro', 'Azzurro', '#B3E0F5'], ['viola', 'Viola', '#D9C2EE'], ['arancio', 'Arancio', '#FFC985'], ['rosa', 'Rosa', '#F8C4D6'], ['rosso', 'Rosso', '#F4A79E'], ['grigio', 'Grigio', '#D6D6D6']];
  const LCOL_HEX = Object.fromEntries(LCOL.map(([k, , h]) => [k, h]));
  // se il colore non è stato scelto: Ragusa verde, Modica giallo, Coffa azzurro, Ispica viola, Rosolini arancio
  const LCOL_DEF = [['RAGUSA', 'verde'], ['MODICA', 'giallo'], ['COFFA', 'azzurro'], ['ISPICA', 'viola'], ['ROSOLINI', 'arancio']];
  const lcolDefault = (code, city) => { const c = String(city || '').toUpperCase(); const k = String(code || '').toUpperCase().replace(/[^A-Z]/g, ''); const hit = LCOL_DEF.find(([n]) => (c && c.includes(n)) || (k && codeIn(k, n))); return hit ? hit[1] : ''; };
  const lcolKey = l => (l && l.colore != null && Object.prototype.hasOwnProperty.call(LCOL_HEX, l.colore) ? l.colore : lcolDefault(l && l.code, l && l.citta));
  // colore (preso sempre dall'elenco fisso) per un codice della colonna «part» o per il nome di una città
  function partColor(part, city) {
    const code = String(part || city || '').toUpperCase().trim(); if (!code) return '';
    const l = luogoOf(code); const k = l ? lcolKey(l) : lcolDefault(code, city);
    return Object.prototype.hasOwnProperty.call(LCOL_HEX, k) ? LCOL_HEX[k] : '';
  }
  function mapsLink(part, pt) {
    const l = luogoOf(part, pt); if (l && safeUrl(l.maps)) return safeUrl(l.maps);
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
    return { p0, seats, pt, part: (bk.persone[0] || {}).part, d: { v: 1, g: t.nome, d: t.data, f: t.fine || '', b: `${b.label}${LMAP[b.layout] ? ' · ' + LMAP[b.layout].nome : ''}`, l: b.layout, s: seats, n: nomi, c: (p0.nome || p0.cognome || '').split(' ')[0], pl: pt.luogo, po: pt.ora, a: b.accompagnatore || '', at: b.telAcc || '', h: (t.quota && t.quota.hotel) || '', r: safeUrl(t.programma) } };
  }
  const postoBase = () => S.cfg.postoUrl || (/^https?:$/.test(location.protocol) ? new URL('./posto.html', location.href).href : POSTO_URL);
  const postoLink = d => `${postoBase()}#d=${b64url(d)}`;
  function waMessage(t, b, bk) {
    const x = waData(t, b, bk); const n = x.seats.length;
    const frase = !n ? 'Il posto sul pullman le verrà comunicato a breve.' : n === 1 ? `Il suo posto sul pullman è il n. ${x.seats[0]}.` : `I vostri posti sul pullman sono i n. ${x.seats.slice(0, -1).join(', ')} e ${x.seats[n - 1]}.`;
    const map = { nome: String(x.p0.nome || '').split(' ')[0] || x.p0.cognome || '', cliente: `${x.p0.cognome || ''} ${x.p0.nome || ''}`.trim(), gita: t.nome, data: waDay(t.data) + (t.fine && t.fine !== t.data ? `, rientro ${waDay(t.fine)}` : ''), posti: fmtSeats(x.seats) || 'da assegnare', posti_frase: frase, bus: b.label, partenza: [x.pt.luogo, x.pt.ora ? 'ore ' + x.pt.ora : ''].filter(Boolean).join(', '), accompagnatore: [b.accompagnatore, b.telAcc].filter(Boolean).join(' '), link_posto: postoLink(x.d), programma: safeUrl(t.programma), mappa: mapsLink(x.part, x.pt), telefono: S.cfg.telAgenzia || '' };
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
  // le chiavi di Meta stanno in /config/chiavi.json (le modifica solo il Super Master; servono a tutti i computer per inviare).
  // Attenzione: il file arriva su ogni computer collegato, quindi chi ha accesso a quei computer può leggerlo.
  // Su Meta usate un token di «utente di sistema» con i soli permessi WhatsApp, e rigeneratelo se un computer si perde.
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
    const runBox = run ? `<div class="wa-run" role="status"><div class="bar"><i id="wa-run-bar" style="width:${esc(Math.round(((run.done + (run.p || 0)) / Math.max(1, run.tot)) * 100))}%"></i></div><span id="wa-run-l">${run.done} di ${run.tot} · ${esc(run.cur)}</span><span class="small">Non chiudere questa finestra finché non ha finito.</span></div>` : '';
    const pv = UI.waPrev;
    const prevBox = pv ? `<div class="wa-prev"><div class="wa-prev-h"><b>Video per ${esc(pv.name)}</b><button class="btn sm ghost" data-act="waprevclose" aria-label="Chiudi anteprima">${ICON.close}</button></div>
        ${pv.busy ? '<span class="small">Sto creando il video…</span>' : pv.err ? `<div class="warnbox">${esc(pv.err)}</div>` : `<div class="wa-prev-b"><video src="${esc(pv.url)}" controls autoplay muted playsinline></video><div><div class="msg">${esc(waFill(WA_TPL_POSTO, pv.params))}</div><a class="btn sm" href="${esc(pv.url)}" download="Posto ${esc(pv.name)}.mp4">${ICON.upload} Scarica il video (${pv.kb} KB)</a></div></div>`}</div>` : '';
    const pill = st => `<span class="pill ${esc(st.k === 'sent' ? 'ok' : st.k === 'ready' ? 'neutral' : st.k === 'err' ? 'warn' : 'tbd')}">${esc(st.txt)}</span>`;
    openModal(`Messaggi WhatsApp · ${esc(b.label)}`, `
      ${head}${runBox}${telWarn}${progTxt}
      <div class="wa-sum"><span><b>${cnt('ready') + cnt('err')}</b> da inviare</span><span><b>${cnt('sent')}</b> inviati</span><span><b>${cnt('nook')}</b> senza consenso</span><span><b>${cnt('nonum')}</b> senza cellulare</span><span><b>${cnt('noseat')}</b> senza posto</span>
        ${cnt('nook') ? `<button class="btn sm" data-act="waokall" ${run ? 'disabled' : ''}>Segna il consenso a tutti</button>` : ''}</div>
      ${prevBox}
      <div class="walist">${list.map(({ bk, st }) => {
        const h = bk.full && bk.full.head; const msg = waMessage(t, b, bk);
        return `<div class="wa"><div class="who"><b>${esc(bkName(bk))} x ${bk.persone.length}</b><span>${st.num ? esc(`${st.x.p0.cognome} ${st.x.p0.nome} · ${st.x.p0.tel}`) : 'nessun numero di cellulare nella lista'}${st.x.seats.length ? ` · posti ${fmtSeats(st.x.seats)}` : ''}</span>
            <label class="wa-ok"><input type="checkbox" data-act="waok" data-id="${esc(bk.id)}" ${h && (h.waOk || (h.cid && S.clients.clienti[h.cid] && S.clients.clienti[h.cid].waOk)) ? 'checked' : ''} ${run ? 'disabled' : ''}> consenso WhatsApp</label></div>
          <div class="act">${pill(st)}<button class="btn sm" data-act="wavideo" data-id="${esc(bk.id)}" ${run || !st.x.seats.length ? 'disabled' : ''}>Video</button>
            ${ready && (st.k === 'ready' || st.k === 'err' || st.k === 'sent') ? `<button class="btn sm" data-act="wasendone" data-id="${esc(bk.id)}" ${run ? 'disabled' : ''}>${st.k === 'sent' ? 'Rimanda' : 'Invia'}</button>` : ''}
            ${st.num ? `<a class="btn sm ghost" href="https://wa.me/${esc(st.num)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" data-act="wasent" data-id="${esc(bk.id)}" title="Apre WhatsApp con il testo pronto: il video lo alleghi a mano">A mano</a>` : ''}</div>
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

  // ---------- archivio ----------
  // Lettura, salvataggio e allineamento con gli altri computer stanno in archivio.js (window.VIPARCHIVIO):
  // le schermate usano solo le funzioni elencate in cima a quel file.
  const STORE = window.VIPARCHIVIO;
  STORE.diag = DIAG;

  // ---------- account, accesso e registro tecnico ----------
  // Ruoli: «super» (Super Master: il tecnico per la manutenzione, invisibile agli altri), «master», «operatore»,
  // «contabilita» (ufficio contabilità: vede solo cassa e contabilità, senza modificare).
  // Le password non si salvano mai: si salva solo un'impronta PBKDF2 (600.000 passaggi) con un sale diverso per ognuno.
  const ROLE_L = { super: 'Super Master', master: 'Master', operatore: 'Operatore', contabilita: 'Contabilità' };
  const PERM = {
    super: ['viaggi', 'anag', 'cassa', 'cassaAll', 'conta', 'settings', 'users', 'tech'],
    master: ['viaggi', 'anag', 'cassa', 'cassaAll', 'conta', 'settings', 'users'],
    operatore: ['viaggi', 'anag', 'cassa'],
    contabilita: ['cassaAll', 'conta', 'readonly']
  };
  const SESK = 'vip-session-v1', LASTAG = 'vip-last-ag', FAILK = 'vip-login-fails';
  // 600.000 passaggi (raccomandazione OWASP per PBKDF2-SHA256). Le impronte vecchie (150.000) funzionano ancora
  // e si aggiornano da sole al primo accesso riuscito.
  const ITER = 600000, ITER_OLD = 150000;
  // Sicurezza: dopo 30 minuti senza usare l'app (o quando cambia il giorno) bisogna rientrare con la password
  const IDLE_MS = 30 * 60000;
  const dayKey = ts => { const d = new Date(ts || 0); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
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
    loadSess() { try { this.sess = JSON.parse(localStorage.getItem(SESK) || sessionStorage.getItem(SESK) || 'null'); } catch (e) { this.sess = null; } if (this.sess && this.expired()) { this.sess = null; this.saveSess(false); GATE.msg = 'Per sicurezza la sessione si è chiusa: accedi di nuovo.'; } },
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
    async check(name, pw) { const n = normName(name); for (const [id, u] of Object.entries(this.users())) { if (normName(u.name) !== n || u.active === false) continue; if ((await pwHash(pw, u.salt, u.iter || ITER_OLD)) === u.hash) return id; } return null; },
    // impronta vecchia (meno passaggi): si rifà con la password appena controllata, senza cambiare nient'altro
    async upgrade(id, pw) { const u = this.users()[id]; if (!u || (u.iter || ITER_OLD) >= ITER) return; const salt = newSalt(); Object.assign(u, { salt, iter: ITER, hash: await pwHash(pw, salt, ITER) }); flush(); },
    // sessione scaduta: troppo tempo senza usare l'app, oppure è cambiato il giorno
    expired(s) { s = s || this.sess; if (!s) return false; const last = +s.la || +s.at || 0; return Date.now() - last > IDLE_MS || dayKey(last) !== dayKey(Date.now()); },
    // l'operatore sta usando l'app: si annota l'ora (sul disco al massimo una volta al minuto)
    touch() { const s = this.sess; if (!s) return; const now = Date.now(); const old = +s.la || 0; s.la = now; if (now - old > 60000) this.saveSess(); },
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
  const GATE = { step: null, taps: 0, msg: '', busy: false, setup: 1, hello: '', remember: false };
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
        <form class="g-form" data-form="${esc(s1 ? 'setup1' : 'setup2')}">
          <label>Nome account<input name="n" autocomplete="username" required value="${esc(s1 ? 'Tecnico' : '')}"></label>
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
          ? `<button class="g-agc${esc(a.id === last ? ' last' : '')}" data-act="gpickag" data-id="${esc(a.id)}"><span class="g-pin">${PIN}</span>${a.id === last ? '<span class="g-tag">Ultima usata</span>' : ''}<b>${esc(a.nome)}</b><span class="g-addr">${esc(a.indirizzo || '')}</span><span class="g-cassa"><span>${esc(a.cassa || 'Cassa ' + a.nome)}</span><span class="go">Entra ›</span></span></button>`
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
      if (kind === 'setup1') { ACC.sess = { uid: id, at: Date.now(), la: Date.now() }; ACC.saveSess(false); GATE.setup = 2; ACC.tlog('info', 'Primo avvio: creato il Super Master'); return render(); }
      ACC.sess = { uid: id, at: Date.now(), la: Date.now() }; ACC.saveSess(false); ACC.tlog('info', `Primo avvio: creato il Master «${f.n}»`);
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
      ACC.sess = { uid: id, at: Date.now(), la: Date.now(), rn: u.resetN || 0 }; ACC.saveSess(GATE.remember); ACC.upgrade(id, f.p).catch(() => {}); ACC.tlog('info', u.role === 'super' ? 'Accesso tecnico del Super Master' : 'Accesso');
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
  function logout(why) { ACC.tlog('info', why ? 'Uscita automatica: ' + why : 'Uscita'); ACC.sess = null; ACC.saveSess(false); GATE.step = null; GATE.msg = why ? `Per sicurezza la sessione si è chiusa (${why}): accedi di nuovo.` : ''; UI.view = 'home'; UI.tripId = null; closeModal(); render(); }
  // controllo dell'inattività: ogni 30 secondi e quando l'app torna in primo piano
  function idleCheck() {
    const s = ACC.sess; if (!s) return;
    // un'altra finestra dell'app può aver lavorato nel frattempo: vale l'ora più recente
    try { const o = JSON.parse(localStorage.getItem(SESK) || sessionStorage.getItem(SESK) || 'null'); if (o && o.uid === s.uid && +o.la > (+s.la || 0)) s.la = +o.la; } catch (e) { /* niente */ }
    if (ACC.expired()) logout(dayKey(+s.la || +s.at) !== dayKey(Date.now()) ? 'è cambiato il giorno' : '30 minuti senza usare l\'app');
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, () => ACC.touch(), { capture: true, passive: true }));
  setInterval(idleCheck, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) idleCheck(); });

  // ---------- anagrafica clienti ----------
  // Si riempie da sola con le persone scritte nelle liste dei viaggi; si può anche modificare a mano.
  // Mentre scrivi il cognome nella lista, i clienti già conosciuti compaiono tra i suggeriti: Invio compila la riga.
  const CLF = [['cognome', 'Cognome'], ['nome', 'Nome'], ['nascita', 'Data di nascita'], ['natoA', 'Nato/a a'], ['sesso', 'Sesso (M/F)'], ['tel', 'Cellulare'], ['tel2', 'Altro telefono'], ['email', 'Email'], ['indirizzo', 'Indirizzo'], ['cap', 'CAP'], ['citta', 'Città'], ['cf', 'Codice fiscale / P. IVA'], ['sdi', 'Codice SDI o PEC (fattura)'], ['part', 'Partenza abituale (codice)'], ['pref', 'Preferenze (es. posto davanti)'], ['note', 'Note']];
  const clients = () => S.clients.clienti;
  const nk = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const baseCognome = cg => { const m = RX.exec(String(cg || '').trim()); return (m ? m[1] : String(cg || '')).trim(); };
  const telK = s => String(s || '').replace(/\D/g, '').replace(/^(0039|39)(?=3\d{8,9}$)/, '');
  // chiavi di ricerca dei clienti, ricalcolate solo quando un cliente cambia (l'anagrafica può essere molto grande)
  const CK = new Map();
  function ckey(id, x) {
    const raw = `${x.cognome}|${x.nome}|${x.tel}|${x.natoA}|${x.part}|${x.email}|${x.citta || ''}`; let k = CK.get(id);
    if (!k || k.raw !== raw) { k = { raw, c: nk(x.cognome), n: nk(x.nome), t: telK(x.tel) }; k.cn = k.c + ' ' + k.n; k.s = nk(`${x.cognome} ${x.nome} ${x.tel} ${x.natoA} ${x.part} ${x.email} ${x.citta || ''}`); CK.set(id, k); }
    return k;
  }
  // indice cognome+nome → clienti, per cercare in fretta tra decine di migliaia
  function clientIx() { const ix = new Map(); Object.entries(clients()).forEach(([id, x]) => { const k = ckey(id, x).cn; const a = ix.get(k); if (a) a.push(id); else ix.set(k, [id]); }); return ix; }
  function findClient(cg, nm, nascita, tel, ix) {
    const c = nk(baseCognome(cg)), n = nk(nm); if (!c || !n) return null;
    const same = ix ? (ix.get(c + ' ' + n) || []).map(id => [id, clients()[id]]).filter(([, x]) => x) : Object.entries(clients()).filter(([id, x]) => { const k = ckey(id, x); return k.c === c && k.n === n; });
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
    const items = Object.entries(clients()).filter(([id, x]) => { const k = ckey(id, x); return k.c.startsWith(cgq) && (!nmq || k.n.startsWith(nmq)); })
      .sort((a, b) => (AC.cnt[b[0]] || 0) - (AC.cnt[a[0]] || 0) || ckey(a[0], a[1]).cn.localeCompare(ckey(b[0], b[1]).cn)).slice(0, 6);
    if (!items.length || (items.length === 1 && r.cid === items[0][0] && nk(r.nome) === nk(items[0][1].nome))) return acClose();
    AC.items = items; AC.i = -1; AC.rowId = r.id; AC.f = f;
    if (!AC.el) { AC.el = document.createElement('div'); AC.el.className = 'acbox'; AC.el.setAttribute('role', 'listbox'); AC.el.setAttribute('aria-label', 'Clienti già in anagrafica'); document.body.appendChild(AC.el); }
    const rc = input.getBoundingClientRect();
    AC.el.style.left = `${Math.max(8, Math.min(rc.left + window.scrollX, window.scrollX + window.innerWidth - 480))}px`; AC.el.style.top = `${rc.bottom + window.scrollY + 4}px`;
    acPaint();
  }
  function acPaint() {
    if (!AC.el) return;
    AC.el.innerHTML = `<div class="ac-h">Già in anagrafica <span>↓ per scegliere, Invio per compilare la riga · se non serve continua a scrivere</span></div>${AC.items.map(([id, x], i) => `<div class="ac-i${esc(i === AC.i ? ' on' : '')}" role="option" aria-selected="${esc(i === AC.i)}" data-act="acpick" data-id="${esc(id)}"><span class="av">${esc(((x.nome || '')[0] || '') + ((x.cognome || '')[0] || ''))}</span><span class="ac-t"><b>${esc(x.cognome)} ${esc(x.nome)}</b><span>${esc([x.nascita ? `${/a$/i.test(x.nome || '') ? 'nata' : 'nato'} il ${x.nascita}` : '', x.tel, x.part ? 'parte da ' + x.part : ''].filter(Boolean).join(' · '))}</span></span><span class="ac-n">${AC.cnt[id] ? `${AC.cnt[id]} ${AC.cnt[id] === 1 ? 'viaggio' : 'viaggi'}` : 'nuovo'}</span></div>`).join('')}<div class="ac-f">Invio compila la riga · Esc per scrivere un cliente nuovo</div>`;
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
    // nessun cliente è scelto da solo: si sceglie con le frecce e poi Invio, oppure con un clic.
    // Invio, Tab e Maiusc senza aver scelto un cliente lasciano la riga com'è scritta (si chiude solo l'elenco).
    if (e.key === 'ArrowDown') { AC.i = (AC.i + 1) % AC.items.length; acPaint(); return true; }
    if (e.key === 'ArrowUp') { if (AC.i <= 0) { AC.i = -1; acPaint(); return AC.i !== -1; } AC.i = AC.i - 1; acPaint(); return true; }
    if (e.key === 'Enter' && AC.i >= 0 && !e.shiftKey) { acPick(AC.items[AC.i][0]); return true; }
    if (e.key === 'Enter' || e.key === 'Tab') { acClose(); return false; }
    if (e.key === 'Escape') { acClose(); return true; }
    return false;
  }

  // ---- pagina Anagrafica ----
  function anagView() {
    const q = nk(UI.aq || ''); const ix = clientIndex();
    const qd = q.replace(/\D/g, '');
    let list = Object.entries(clients()).filter(([id, x]) => { if (!q) return true; const k = ckey(id, x); return k.s.includes(q) || (qd.length >= 3 && k.t.includes(qd)); });
    list.sort((a, b) => { const x = ckey(a[0], a[1]).cn, y = ckey(b[0], b[1]).cn; return x < y ? -1 : x > y ? 1 : 0; });
    const tot = Object.keys(clients()).length;
    if (!UI.cl || !clients()[UI.cl]) UI.cl = list[0] ? list[0][0] : null;
    const groups = []; list.slice(0, 400).forEach(([id, x]) => { const l = (ckey(id, x).c[0] || '#').toUpperCase(); let g = groups[groups.length - 1]; if (!g || g.l !== l) { g = { l, items: [] }; groups.push(g); } g.items.push([id, x]); });
    const sel = UI.cl && clients()[UI.cl]; const hist = (sel && ix[UI.cl]) || [];
    const ro = ACC.can('readonly');
    const paidOf = h => { const m = bkMoney(h.t, h.bk); return m; };
    const detail = sel ? `<div class="cl-head"><span class="av big">${esc(((sel.nome || '')[0] || '') + ((sel.cognome || '')[0] || ''))}</span>
        <div class="cl-ht"><h2>${esc(sel.cognome)} ${esc(sel.nome)}</h2><div class="sub">${sel.since ? `In anagrafica dal ${esc(fmtDate(sel.since))} · ` : ''}${hist.length} ${hist.length === 1 ? 'viaggio' : 'viaggi'}${sel.part ? ` · parte di solito da ${esc(sel.part)}` : ''}</div>
          <div class="chips">${sel.waOk ? '<span class="pill ok">Consenso WhatsApp</span>' : '<span class="pill neutral">Senza consenso WhatsApp</span>'}</div></div>
        ${ro ? '' : `<label class="chk"><input type="checkbox" data-clchk="waOk"${sel.waOk ? ' checked' : ''}> Consenso WhatsApp</label>`}</div>
      <div class="cl-grid"><div class="box cl-f">${CLF.map(([f, l]) => `<label class="cl-r"><span>${esc(l)}</span><input data-cl="${esc(f)}" value="${esc(sel[f] || '')}"${ro ? ' readonly' : ''} autocomplete="off"></label>`).join('')}
          ${ro ? '' : `<div class="cl-act"><button class="btn sm danger" data-act="cldel" data-id="${esc(UI.cl)}">${ICON.trash} Elimina dall'anagrafica</button></div>`}</div>
        <div class="box cl-h"><h3>Viaggi fatti e prenotati</h3>${hist.map(h => { const m = paidOf(h); const fut = (h.t.fine || h.t.data) >= todayISO(); return `<button class="cl-trip" data-act="opentrip" data-id="${esc(h.t.id)}"><span><b>${esc(h.t.nome)}</b><span>${esc(fmtTripDate(h.t))}${h.bk.persone.length > 1 ? ` · ${esc(bkName(h.bk))} x ${h.bk.persone.length}` : ''}</span></span><span class="pill ${esc(m.saldato ? 'ok' : fut ? 'neutral' : 'tbd')}">${m.saldato ? 'Saldato' : fut ? 'Prenotato' : 'Da saldare'}</span></button>`; }).join('') || '<div class="small">Ancora nessun viaggio collegato.</div>'}</div></div>` : '<div class="empty">Nessun cliente. Si aggiungono da soli quando scrivi le liste dei viaggi.</div>';
    return `<div class="pagehead"><div><h1>Anagrafica</h1><div class="sub">${tot} clienti · si aggiorna da sola con le liste dei viaggi</div></div>${ro ? '' : `<div class="hbtns"><label class="btn" for="imp-cl">${ICON.upload} Importa da Word o Excel<input id="imp-cl" type="file" accept=".xlsx,.xlsm,.csv,.txt,.docx,.xls,.doc" hidden data-impfile="1"></label><button class="btn primary" data-act="clnew">${ICON.plus} Nuovo cliente</button></div>`}</div>
      <div class="anag"><section class="box cl-list" aria-label="Elenco clienti"><input class="search" type="search" data-aq="1" placeholder="Cerca per nome, telefono, città" value="${esc(UI.aq || '')}" aria-label="Cerca cliente">
        <div class="cl-scroll">${groups.map(g => `<div class="cl-g">${esc(g.l)}</div>${g.items.map(([id, x]) => `<button class="cl-i${esc(id === UI.cl ? ' on' : '')}" data-act="clsel" data-id="${esc(id)}"><span class="av">${esc(((x.nome || '')[0] || '') + ((x.cognome || '')[0] || ''))}</span><span><b>${esc(x.cognome)} ${esc(x.nome)}</b><span>${esc([x.part, ix[id] ? `${ix[id].length} viaggi` : ''].filter(Boolean).join(' · '))}</span></span></button>`).join('')}`).join('') || '<div class="small" style="padding:12px">Nessun cliente trovato.</div>'}${list.length > 400 ? `<div class="small" style="padding:12px">Ne mostro 400 su ${list.length}: affina la ricerca.</div>` : ''}</div></section>
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
    let nuovi = 0, agg = 0, uguali = 0; const seen = new Set(); let dup = 0; const ix = clientIx();
    recs.forEach(o => { const k = nk(o.cognome + ' ' + o.nome + ' ' + (o.nascita || o.tel || '')); if (seen.has(k)) { o._dup = true; dup++; return; } seen.add(k); const id = findClient(o.cognome, o.nome, o.nascita, o.tel, ix); o._id = id; if (!id) nuovi++; else { const x = clients()[id]; Object.keys(o).some(f => !f.startsWith('_') && o[f] && !x[f]) ? agg++ : uguali++; } });
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
      <div class="imp-w"><table class="imp-t"><thead><tr><th class="res">Risultato</th>${Array.from({ length: width }, (_, c) => `<th><select data-impc="${esc(c)}" aria-label="Colonna ${esc(c + 1)}">${IMPF.map(([k, l]) => `<option value="${esc(k)}"${I.map[c] === k ? ' selected' : ''}>${l}</option>`).join('')}</select></th>`).join('')}</tr></thead>
        <tbody>${prev.map(r => { const o = impRecord(r, I.map); return `<tr><td class="res">${o.cognome && o.nome ? `<b>${esc(o.cognome)}</b> ${esc(o.nome)}${o.nascita ? '<br><small>' + esc(o.nascita) + '</small>' : ''}` : '<small>saltata</small>'}</td>${Array.from({ length: width }, (_, c) => `<td class="${esc(I.map[c] ? '' : 'off')}">${esc(String(I.map[c] === 'nascita' ? impDate(r[c]) : (I.map[c] === 'tel' || I.map[c] === 'tel2') ? impTel(r[c]) : (r[c] || '')).slice(0, 40))}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>
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
    const P = impPlan(); let nuovi = 0, agg = 0; const ix = clientIx();
    P.recs.forEach(o => {
      if (o._dup) return; let id = findClient(o.cognome, o.nome, o.nascita, o.tel, ix);
      if (!id) { id = 'c' + uid(); const k = nk(o.cognome) + ' ' + nk(o.nome); const a = ix.get(k); if (a) a.push(id); else ix.set(k, [id]); clients()[id] = { cognome: o.cognome, nome: o.nome, nascita: '', natoA: '', tel: '', email: '', indirizzo: '', part: '', pref: '', note: '', since: todayISO(), src: 'import' }; nuovi++; }
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
    pmIndex(); return PMI.get(tripId + '|' + bkId) || 0;
  }
  function pmIndex() {
    if (PMV !== STORE.ver() || !PMI) { PMI = new Map(); allMovs().filter(isInc).forEach(m => { const k = m.tripId + '|' + resolveBk(m.tripId, m.bkId); PMI.set(k, (PMI.get(k) || 0) + (+m.tot || 0)); if (m.pid) { const kp = k + '|' + m.pid; PMI.set(kp, (PMI.get(kp) || 0) + (+m.tot || 0)); } }); PMV = STORE.ver(); }
  }
  function pmReset() { PMI = null; }
  // pagamento individuale: quanto ha pagato una sola persona della comitiva (incassi registrati a suo nome)
  function pidPaid(tripId, bkId, pid) { pmIndex(); return Math.round((PMI.get(tripId + '|' + bkId + '|' + pid) || 0) * 100) / 100; }
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
    offNoteMov(mv);
    return mv;
  }
  const fmtNum = v => { const r = Math.round(v * 100) / 100; return Number.isInteger(r) ? String(r) : String(r).replace('.', ','); };

  function storno(id) {
    const m = allMovs().find(x => x.id === id); if (!m) return;
    if (allMovs().some(x => x.storno === id)) return toast('Questo incasso è già stato stornato');
    confirmBox('Storna incasso', `Annullo l'incasso di <b>${money(m.tot)}</b> di ${esc(m.cliente)}? Nel resoconto resta segnato, con un movimento uguale e contrario${m.doc === 'scontrino' ? ' (nota di credito dello scontrino)' : m.doc === 'fattura' ? ' (nota di credito della fattura)' : ''}.`, 'Storna', () => {
      const t = S.trips.find(x => x.id === m.tripId);
      addMov({ tripId: m.tripId, tripN: m.tripN, tripD: m.tripD, bkId: m.bkId, pid: m.pid, pnome: m.pnome, rtRif: m.doc === 'scontrino' ? Object.assign({ chiusura: '', numero: '', dataOra: '', matricola: '' }, m.rt || {}, { mov: m.id }) : undefined, cliente: m.cliente, tipo: 'storno', storno: id, ag: m.ag, cassa: m.cassa, doc: m.doc === 'fattura' ? 'ncfattura' : m.doc === 'scontrino' ? 'ncscontrino' : m.doc, docStato: m.doc === 'fattura' || m.doc === 'scontrino' ? 'da_emettere' : '', cat: m.cat, desc: m.desc, circuito: m.circuito, venId: m.venId, emis: m.emis, ant: m.ant, stock: m.stock, nT: m.nT != null ? -m.nT : undefined, lines: (m.lines || []).map(l => Object.assign({}, l, { q: -l.q })), suppl: -(m.suppl || 0), dir: m.dir, docTot: -(m.docTot || 0), agenzia: -(m.agenzia || 0), biglietti: -(m.biglietti || 0), parts: m.parts.map(p => Object.assign({ m: p.m, a: -p.a }, p.buono ? { buono: p.buono, bnum: p.bnum } : {})), note: `storno dell'incasso del ${fmtDate(m.day)}${ACC.sess.ag && ACC.sess.ag !== m.ag ? ' (fatto da ' + agName(ACC.sess.ag) + ')' : ''}` });
      ACC.tlog('avviso', `Storno ${money(m.tot)} · ${m.cliente} · ${m.tripN}`);
      commit(); if (UI.pay) payRefresh(); toast('Incasso stornato');
    });
  }

  // ---- pagina «Cassa»: il resoconto del giorno ----
  function cassaView() {
    if (UI.ctabC === 'buoni') return buoniView();
    const day = UI.cday || todayISO(); const all = ACC.can('cassaAll');
    const agf = all ? (UI.cag || 'tutte') : ACC.sess.ag;
    const movs = allMovs().filter(m => m.day === day && (agf === 'tutte' || m.ag === agf)).sort((a, b) => a.at.localeCompare(b.at));
    const inc = movs.filter(isInc); const per = sumBy(inc, (m, p) => mg(p.m)); const perAg = sumBy(inc, m => m.ag); const tot = totOf(movs);
    const cnt = k => inc.filter(m => m.parts.some(p => mg(p.m) === k)).length;
    const d = parseD(day); const prev = new Date(d); prev.setDate(d.getDate() - 1); const next = new Date(d); next.setDate(d.getDate() + 1);
    const agBtns = all ? `<div class="seg" role="group" aria-label="Agenzia">${[['tutte', 'Tutte'], ...S.cfg.agenzie.map(a => [a.id, a.nome])].map(([k, l]) => `<button data-act="cag" data-v="${esc(k)}" aria-pressed="${esc(agf === k)}">${esc(l)}</button>`).join('')}</div>` : `<span class="pill neutral">${esc(agName(agf))} · ${esc(cassaName(agf))}</span>`;
    const closeAg = agf !== 'tutte' ? agf : (ACC.sess.ag || '');
    const ch = closeAg && chiusura(day, closeAg);
    const canClose = !ACC.can('readonly') && closeAg && (ACC.sess.ag === closeAg || ACC.can('cassaAll'));
    const stornati = new Set(movs.filter(m => m.storno).map(m => m.storno));
    return `${cassaTabs()}<div class="pagehead"><div><h1>${day === todayISO() ? 'Resoconto di oggi' : 'Resoconto del ' + esc(fmtDate(day))}</h1><div class="sub">${esc(fmtDate(day, true))} · ${movs.length} ${movs.length === 1 ? 'movimento' : 'movimenti'}${ch ? ` · <b>cassa ${esc(agName(closeAg))} chiusa</b> da ${esc(ch.who)} alle ${esc(hm(ch.at))}` : ''}</div></div>
        <div class="hbtns">${agBtns}<button class="btn" data-act="cday" data-v="${esc(dayISO(prev))}">‹ Giorno prima</button>${day < todayISO() ? `<button class="btn" data-act="cday" data-v="${esc(dayISO(next))}">Giorno dopo ›</button>` : ''}<input type="date" class="btn" data-cdate="1" value="${esc(day)}" aria-label="Scegli il giorno"><button class="btn" data-act="cprint">${ICON.print} Stampa</button>${!ACC.can('readonly') && ACC.sess.ag ? '<button class="btn" data-act="cashmov" data-k="prelievo">Prelievo</button><button class="btn" data-act="cashmov" data-k="apporto">Apporto</button>' : ''}${canClose ? `<button class="btn primary" data-act="cclose">${ch ? 'Rivedi la chiusura' : 'Chiudi la cassa'}${agf === 'tutte' ? ' di ' + esc(agName(closeAg)) : ''}</button>` : ''}</div></div>
      <div class="tiles"><div class="tile dark"><span>Totale del giorno</span><b>${money(tot)}</b></div>${METG.map(([k, l]) => `<div class="tile"><span><i class="mdot ${esc(MET_C[k])}"></i>${l}</span><b>${money(per[k] || 0)}</b><small>${cnt(k)} ${cnt(k) === 1 ? 'incasso' : 'incassi'}</small></div>`).join('')}</div>
      <section class="box tablecard"><div class="tscroll"><table class="rt"><thead><tr><th>Ora</th><th>Cliente</th><th>Viaggio</th><th>Documento</th><th>Operatore</th><th>Agenzia</th><th>Metodo</th><th class="r">Importo</th><th></th></tr></thead><tbody>
        ${movs.map(m => `<tr class="${esc(m.tipo === 'storno' || m.tipo === 'prelievo' ? 'neg' : '')}${stornati.has(m.id) ? ' gone' : ''}"><td>${esc(hm(m.at))}</td><td><b>${esc(m.cliente)}</b><br><small>${esc(m.tipo)}${m.note ? ' · ' + esc(m.note) : ''}</small></td><td>${esc(m.tripN || m.desc || '')}${m.cat ? `<br><small>${esc(m.cat)}</small>` : ''}</td><td>${docPill(m)}</td><td>${esc(m.who)}</td><td>${esc(agName(m.ag))}</td><td>${(m.parts || []).map(p => `<span class="mpill ${esc(MET_C[p.m])}">${esc(MET_L[p.m] || p.m)}${m.parts.length > 1 ? ' ' + esc(fmtNum(p.a)) : ''}</span>`).join(' ')}</td><td class="r"><b>${money(m.tot)}</b></td><td class="r">${isInc(m) && m.tipo !== 'storno' && !stornati.has(m.id) && !ACC.can('readonly') && (ACC.can('cassaAll') || (m.uid === ACC.sess.uid && m.day === todayISO())) ? `<button class="btn sm ghost" data-act="storno" data-id="${esc(m.id)}">Storna</button>` : stornati.has(m.id) ? '<small>stornato</small>' : ''}</td></tr>`).join('') || `<tr><td colspan="9" class="emptyrow">Nessun incasso in questo giorno.</td></tr>`}
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
        ${METG.map(([k, l]) => `<tr><td><i class="mdot ${esc(MET_C[k])}"></i>${l}</td><td class="r">${movs.filter(m => m.parts.some(p => mg(p.m) === k)).length}</td><td class="r"><b>${money(per[k] || 0)}</b></td><td class="r"><input class="cc-in" data-cc="${esc(k)}" inputmode="decimal" placeholder="${esc(fmtNum(per[k] || 0))}" value="${ch && ch.contati && ch.contati[k] != null ? esc(fmtNum(ch.contati[k])) : ''}" aria-label="${esc(l)} controllato"></td></tr>`).join('')}
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
      return `<tr><td><b>${esc(t.nome)}</b><br><small>${esc(fmtTripDate(t))}</small></td><td class="r">${money(inMon)}</td><td class="r">${money(paid)}</td><td class="r">${unk ? 'prezzi da completare' : money(due)}</td><td class="bar-c"><span class="bar1"><i style="width:${esc(pc)}%"></i></span></td></tr>`; };
    return `${contaTabs()}<div class="pagehead"><div><h1>Contabilità · ${esc(MESI_L[mm - 1])} ${yy}</h1><div class="sub">Incassi, chiusure di cassa e viaggi: tutto in sola lettura, pronto da esportare.</div></div>
        <div class="hbtns"><button class="btn" data-act="cmon" data-v="${esc(prev)}">‹</button><input type="month" class="btn" data-cmon="1" value="${esc(mon)}" aria-label="Mese"><button class="btn" data-act="cmon" data-v="${esc(next)}">›</button><button class="btn" data-act="cexport">Scarica per Excel</button><button class="btn" data-act="cprintm">${ICON.print} Stampa il mese</button></div></div>
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
    return `<span class="mpill ${esc(m.docStato === 'da_emettere' ? 'm-pp' : 'm-alt')}" title="${esc(m.docStato === 'da_emettere' ? 'Documento da emettere: la stampante non è ancora collegata' : '')}">${esc(l)}${m.docStato === 'da_emettere' ? (m.danea ? ' · preparata per Danea' : ' · da emettere') : ''}</span>`;
  }
  const yy2 = iso => { const [y, m, d] = String(iso || '').split('-'); return d ? `${d}/${m}/${y.slice(2)}` : ''; };

  // proposta dei campi, presa dalla lista e dai prezzi del viaggio
  // pid: paga una sola persona della comitiva (la sua quota); senza pid paga il capogruppo per tutti quelli che non pagano da soli
  function payMoney(t, bk, pid) { return pid ? personMoney(t, bk, pid) : groupMoney(t, bk); }
  function payDraft(t, bk, pid) {
    const Q = t.quota || {}; const m = bkMoney(t, bk); const cat = tripCat(t); bk._m = m;
    const pm = payMoney(t, bk, pid); const who = pid ? bk.persone.filter(p => p.id === pid) : bk.persone.filter(p => pm.incl.includes(p.id));
    const TK = tripTkt(t); const tkOn = TK.sett.length > 0; const dir = tkOn ? TK.dir : 0; const manyT = TK.sett.filter(x => x.nome).length > 1;
    const groups = []; let suppl = 0; const supL = []; const emL = [];
    bk.persone.forEach((p, i) => { if (!who.includes(p)) return;
      const per = m.per[i] || {}; const tipo = per.tipo; const sup = supplOf(t, bk, p) || 0; suppl += sup; if (sup) supL.push(sup);
      // 2.1.8: negli eventi il biglietto c'è solo per chi ha la fila scritta (gli altri pagano solo il bus)
      const x = tkOn ? personTkt(t, p, tipo, TK) : null; const tk = x ? +x.prezzo || 0 : 0; if (x) { const em = emisISO(p.row && p.row.emis); if (em) emL.push(em); }
      const bus = per.v != null ? r2(per.v - sup - (x ? tk + dir : 0)) : 0;
      const l = (x || !tkOn ? (tipo === 'bam' || tipo === 'inf' ? 'Ridotto' : 'Intero') : 'Solo bus') + (x && manyT && x.s.nome ? ' ' + x.s.nome : '');
      const g = groups.find(y => y.bus === bus && y.tkt === tk && y.l === l && !!y.hasT === !!x); if (g) g.q++; else groups.push({ l, q: 1, bus, tkt: tk, hasT: !!x });
    });
    // le righe con prezzi diversi non si uniscono più (il totale resta giusto anche con tanti tipi di biglietto).
    // tk1 = la riga ha il biglietto anche se costa 0 € (es. bambini gratis): i diritti si contano lo stesso
    groups.forEach(g => { g.tk1 = !!g.hasT; delete g.hasT; });
    while (groups.length < 3) groups.push({ l: groups.length === 1 ? 'Ridotto' : 'Ridotto 3', q: 0, bus: 0, tkt: 0 });
    const nT = groups.reduce((a, g) => a + (g.tkt || g.tk1 ? g.q : 0), 0);
    const autoCat = cat === 'tour' ? 'Tour' : cat === 'gita' ? 'Gita' : cat === 'evento' ? (nT ? 'BusEdiritti' : 'SoloBus') : cat === 'biglietteria' ? (dir ? 'TicketEdiritti' : 'SoloTicket') : 'Gita';
    const P0 = pid ? who[0] : bk.persone[0]; const h = pid ? P0.row : bk.head; const cl = h.cid && S.clients.clienti[h.cid];
    const circ = TK.circ || Q.circuito || (tkOn ? (ACC.sess.ag === 'md' ? 'T.OneMD' : 'T.OneRG') : '');
    return {
      bigl: cat === 'biglietteria', tour: cat === 'tour', gita: cat === 'gita',
      doc: cat === 'tour' ? 'fattura' : 'scontrino', cat: autoCat, cliente: (pid ? `${P0.cognome} ${P0.nome}` : `${bkName(bk)} ${bk.persone[0] ? bk.persone[0].nome : ''}`).trim().toUpperCase(),
      // gite: descrizione come sullo scontrino dell'agenzia, «gita randazzo e floresta 08/11/26»
      desc: (cat === 'gita' ? `${/^\s*gita\b/i.test(t.nome || '') ? '' : 'gita '}${t.nome || ''} ${yy2(t.data)}` : `${yy2(t.data)} ${t.nome}`).replace(/\s+/g, ' ').trim().toLowerCase(), lines: groups, suppl: r2(suppl), supN: supL.length > 1 && supL.every(v => v === supL[0]) ? supL.length : 1, dir, circuito: circ, emis: emL.length ? emL.sort()[0] : todayISO(), ant: false,
      imp: pm.rest != null && pm.rest > 0 ? r2(pm.rest) : '', rest: pm.rest != null ? r2(pm.rest) : null, met: 'contanti', mix: {}, pratica: '', canale: 'In agenzia', dataPag: todayISO(), pagante: '', note: '',
      legacy: h.pagato || '',
      fatt: (() => { const p0 = P0 || {}; const nm = (cl && cl.nome) || p0.nome || ''; return {
        cognome: (cl && cl.cognome) || (pid ? p0.cognome : bkName(bk)), nome: nm, sesso: (cl && cl.sesso) || CF.guessSex(nm),
        nascita: CF.isoFromIt((cl && cl.nascita) || p0.nascita || ''), natoA: (cl && cl.natoA) || p0.natoA || '',
        cf: (cl && cl.cf) || '', cfAuto: !(cl && cl.cf), ind: (cl && cl.indirizzo) || '', cap: (cl && cl.cap) || '', citta: (cl && cl.citta) || '', sdi: (cl && cl.sdi) || '', pec: (cl && cl.pec) || '' }; })()
    };
  }
  function payTotals(f) {
    const nT = f.lines.reduce((a, l) => a + (+l.tkt || l.tk1 ? +l.q || 0 : 0), 0);
    const bus = r2(f.lines.reduce((a, l) => a + (+l.q || 0) * (+l.bus || 0), 0));
    const tkt = r2(f.lines.reduce((a, l) => a + (+l.q || 0) * (+l.tkt || 0), 0));
    const dirT = r2(nT * (+f.dir || 0)); const sup = r2(+f.suppl || 0);
    return { nT, bus, tkt, dirT, sup, tot: r2(bus + tkt + dirT + sup), agenzia: r2(bus + dirT + sup) };
  }
  function payOpen(bkId, pid) {
    const t = trip(); if (!t) return; const bk = deriveBookings(t).find(x => x.id === bkId); if (!bk) return;
    if (pid && (pid === bk.id && bk.persone.length < 2 || !bk.persone.some(p => p.id === pid))) pid = '';
    UI.pay = { tripId: t.id, bkId, pid: pid || '', f: payDraft(t, bk, pid || '') }; render();
    setTimeout(() => { const i = $('#pf-imp'); if (i) { i.focus({ preventScroll: true }); i.select(); } }, 30);
  }
  function payClose() { UI.pay = null; render(); }
  // sezioni apribili del riquadro: restano aperte o chiuse anche quando la finestra si ridisegna
  document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.pdet && UI.pay) { UI.pay.open = UI.pay.open || {}; UI.pay.open[d.dataset.pdet] = d.open; } }, true);
  function payRefresh() { if (!UI.pay) return; const t = trip(); const bk = t && t.id === UI.pay.tripId && deriveBookings(t).find(x => x.id === UI.pay.bkId); if (!bk) UI.pay = null; render(); }
  const nIn = (k, v, extra = '') => `<input class="pf-in num" data-pf="${esc(k)}" inputmode="decimal" value="${v === '' || v == null ? '' : esc(fmtNum(+v))}" ${extra} autocomplete="off">`;
  // riepilogo delle righe in una frase, per la sezione chiusa «Righe del documento»
  function linesSummary(f, T) {
    const L = f.lines.filter(l => +l.q).map(l => `${l.q} × ${l.l || 'quota'} ${fmtNum((+l.bus || 0) + (+l.tkt || 0))} €`);
    if (T.sup) L.push(`suppl. fila ${fmtNum(T.sup)} €`); if (T.dirT) L.push(`diritti ${fmtNum(T.dirT)} €`);
    return L.length ? L.join(' · ') : 'nessuna riga';
  }
  // il riquadro dell'incasso: una finestra al centro dello schermo, con la «x» in alto a destra.
  // A sinistra quello che serve sempre (chi paga, documento, quanto e come paga, il pulsante),
  // a destra il dettaglio del documento (righe, totale, anteprima) e gli incassi già registrati.
  function payPanelHTML(t) {
    const D = deriveBookings(t); const bk = D.find(x => x.id === UI.pay.bkId); if (!bk) return '';
    const f = UI.pay.f; const pid = UI.pay.pid || ''; const m0 = bkMoney(t, bk); bk._m = m0; const m = payMoney(t, bk, pid); const T = payTotals(f);
    const P = pid && bk.persone.find(p => p.id === pid); const comit = bk.persone.length > 1;
    const hist = allMovs().filter(x => x.tripId === t.id && resolveBk(x.tripId, x.bkId) === bk.id && (!pid || x.pid === pid)).sort((a, b) => a.at.localeCompare(b.at));
    const pName = id => { const p = bk.persone.find(q => q.id === id); return p ? `${p.cognome} ${p.nome}`.trim() : ''; };
    const storn = new Set(hist.filter(x => x.storno).map(x => x.storno));
    const canPay = ACC.can('cassa') && ACC.sess.ag; const blk = payBlock(t, bk, pid, f);
    const tkOn = f.lines.some(l => +l.tkt) || tripCat(t) === 'biglietteria' || tripCat(t) === 'evento';
    const mainBtn = f.doc === 'fattura' ? 'Fattura' : f.doc === 'scontrino' ? 'Scontrino' : f.doc === 'caparra' ? 'Registra la caparra' : 'Registra senza documento';
    const op = UI.pay.open = UI.pay.open || {}; const isOpen = (k, def) => (op[k] != null ? op[k] : def);
    const easy = f.met === 'contanti' || f.met === 'pos';
    const altri = `<div class="pp-g3"><label>N. pratica<input data-pf="pratica" value="${esc(f.pratica)}"></label><label>Canale<select data-pf="canale">${CANALI.map(c => `<option${c === f.canale ? ' selected' : ''}>${c}</option>`).join('')}</select></label><label>Data pagamento<input type="date" data-pf="dataPag" value="${esc(f.dataPag)}"></label></div>
      <label class="pp-1">Pagante (se diverso)<input data-pf="pagante" value="${esc(f.pagante)}"></label>
      <label class="pp-1">Note pratica<input data-pf="note" value="${esc(f.note)}"></label>
      ${P ? '' : `<label class="pp-1">Pagato prima, fuori dall'app (come nella lista Word)<input data-pf="legacy" class="num" inputmode="decimal" value="${esc(f.legacy)}" placeholder="0"></label>`}`;
    const colA = `
      ${canPay && blk ? `<div class="warnbox pp-blk" role="alert">${ICON.alert}<span>${esc(blk)}</span></div>` : ''}
      ${comit ? `<div class="pp-sec"><span class="pp-l">Chi paga</span><div class="pp-who" role="radiogroup" aria-label="Chi paga">
        <button type="button" role="radio" data-act="paywho" data-id="${esc(bk.id)}" data-pid="" aria-checked="${esc(!pid)}">${ICON.users} Tutta la comitiva</button>
        ${bk.persone.map(p => { const pm = personMoney(t, bk, p.id); return `<button type="button" role="radio" data-act="paywho" data-id="${esc(bk.id)}" data-pid="${esc(p.id)}" aria-checked="${esc(pid === p.id)}">${esc(p.cognome)} ${esc(p.nome)}${pm.paid ? ` <small>${pm.rest === 0 ? '✓ ' : ''}${esc(fmtNum(pm.paid))}</small>` : ''}</button>`; }).join('')}</div></div>` : ''}
      <div class="pay-sum"><div><span>${P ? 'Quota' : m.indiv && m.indiv.length ? 'Totale (senza chi paga da sé)' : 'Totale'}</span><b>${m.due != null ? money(m.due) : '—'}</b></div><div><span>Già pagato</span><b>${money(m.paid)}</b></div><div class="hi"><span>Da pagare</span><b>${m.rest != null ? money(m.rest) : '—'}</b></div></div>
      ${P ? `<div class="small pp-gsum">Tutta la comitiva: totale ${m0.due != null ? money(m0.due) : '—'} · pagato ${money(m0.paid)} · da pagare ${m0.rest != null ? money(m0.rest) : '—'}</div>` : m.indiv && m.indiv.length ? `<div class="small pp-gsum">Pagano per conto loro: <b>${m.indiv.map(id => esc(pName(id))).join(', ')}</b> — non sono compresi qui.</div>` : ''}
      ${m.due == null ? '<div class="warnbox small">Mancano i prezzi del viaggio in testa alla lista: il totale si calcola dalle righe del documento.</div>' : ''}
      <div class="pp-sec"><span class="pp-l">Documento</span>${f.tour ? '<div class="pp-doc1">Fattura</div>' : `<div class="seg wrap" role="radiogroup" aria-label="Documento">${DOCS.filter(([k]) => k !== 'fattura').map(([k, l]) => `<button type="button" role="radio" data-act="pfdoc" data-k="${esc(k)}" aria-pressed="${esc(f.doc === k)}">${l}</button>`).join('')}</div>`}</div>
      <label class="pp-1">Cognome e nome${f.doc === 'fattura' ? ' (come appare nel resoconto)' : ''}<input data-pf="cliente" value="${esc(f.cliente)}" autocomplete="off"></label>
      <div class="pp-sec pp-paybox"><span class="pp-l">Incassato adesso</span><div class="pp-impr"><input id="pf-imp" class="pf-in num pay-imp" data-pf="imp" inputmode="decimal" value="${f.imp === '' ? '' : esc(fmtNum(+f.imp))}" placeholder="0,00" autocomplete="off" aria-label="Importo incassato adesso"><span class="pay-warn" id="pp-warn" role="status">${payWarnTxt(f, m)}</span></div>
        <div class="pay-met" role="radiogroup" aria-label="Metodo di pagamento">${[...METODI, ['misto', 'Misto']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${esc(f.met === k)}" data-act="pfmet" data-k="${esc(k)}"${k === 'misto' ? ' title="Più metodi insieme, es. contanti + POS"' : ''}>${l}</button>`).join('')}</div>
        ${f.met === 'misto' ? mixHTML(f) : ''}
        <div id="pp-buono">${typeof buonoPayHTML === 'function' ? buonoPayHTML(f) : ''}</div></div>
      <details class="pp-det" data-pdet="altri"${isOpen('altri', !easy) ? ' open' : ''}><summary><span>Altri dati: pratica, canale, pagante, note</span>${(() => { const x = [f.pratica ? 'pratica ' + f.pratica : '', f.pagante ? 'pagante ' + f.pagante : '', f.note ? 'note' : '', !P && f.legacy ? 'pagato prima ' + f.legacy + ' €' : ''].filter(Boolean); return x.length ? `<small>${esc(x.join(' · '))}</small>` : ''; })()}</summary><div class="pp-detb">${altri}</div></details>
      <div class="pp-foot"><div class="small">${canPay ? `Registrato da <b>${esc(ACC.me().name)}</b> · <b>${esc(agName(ACC.sess.ag))}</b> · ${esc(cassaName(ACC.sess.ag))}` : 'Per incassare scegli l\'agenzia in cui lavori (in alto).'}</div>
        ${canPay ? `<div class="pp-act"><button class="btn primary big" data-act="pfsave"${blk ? ' disabled' : ''}>${f.doc === 'scontrino' ? ICON.print + ' ' : ''}${mainBtn}${+f.imp ? ' · ' + money(+f.imp) : ''}</button></div>` : ''}</div>`;
    const colB = `
      ${f.doc === 'fattura' ? fattHTML(f.fatt) : ''}
      <details class="pp-det" data-pdet="righe"${isOpen('righe', m.due == null) ? ' open' : ''}><summary><span>Righe del documento</span><small id="pp-lsum">${esc(linesSummary(f, T))}</small></summary><div class="pp-detb">
        <label class="pp-1">Descrizione<input data-pf="desc" value="${esc(f.desc)}" autocomplete="off"></label>
        <table class="pp-lines"><thead><tr><th></th><th>Q</th>${f.bigl ? '' : '<th>€ bus</th>'}${tkOn ? '<th>€ biglietto</th>' : ''}<th class="r">Totale</th></tr></thead><tbody>
          ${f.lines.map((l, i) => `<tr><td><input class="pf-in lab" data-pl="${i}" data-k="l" value="${esc(l.l)}" title="${esc(l.l)}" aria-label="Riga ${i + 1}: ${esc(l.l)}"></td><td><input class="pf-in num q" data-pl="${i}" data-k="q" inputmode="numeric" value="${l.q ? esc(String(l.q)) : ''}" aria-label="Quantità riga ${i + 1}"></td>${f.bigl ? '' : `<td><input class="pf-in num" data-pl="${i}" data-k="bus" inputmode="decimal" value="${+l.bus ? esc(fmtNum(+l.bus)) : ''}" aria-label="Euro bus riga ${i + 1}"></td>`}${tkOn ? `<td><input class="pf-in num" data-pl="${i}" data-k="tkt" inputmode="decimal" value="${+l.tkt ? esc(fmtNum(+l.tkt)) : ''}" aria-label="Euro biglietto riga ${i + 1}"></td>` : ''}<td class="r" id="pl-t${i}">${l.q ? money((+l.q) * ((+l.bus || 0) + (+l.tkt || 0))) : ''}</td></tr>`).join('')}
        </tbody></table>
        <div class="pp-g3">${f.bigl ? '' : `<label>Suppl. fila €${nIn('suppl', f.suppl)}</label>`}${tkOn ? `<label>Diritti € (per biglietto)${nIn('dir', f.dir)}</label><label>Circuito<select data-pf="circuito"><option value="">—</option>${CIRCUITI.map(c => `<option${c === f.circuito ? ' selected' : ''}>${c}</option>`).join('')}</select></label>` : ''}</div>
        ${tkOn ? `<div class="pp-g2"><label>Emissione biglietti<input type="date" data-pf="emis" value="${esc(f.emis)}"></label><label class="chk pp-chk"><input type="checkbox" data-pfc="ant"${f.ant ? ' checked' : ''}> Emissione anticipata</label></div>` : ''}
        ${typeof bgTripStockHTML === 'function' ? bgTripStockHTML(t, f) : ''}
      </div></details>
      <div class="pp-tot" id="pp-tot">${payTotHTML(T, f.bigl)}</div>
      <div id="pp-rt">${rtPreviewHTML(f)}</div>
      ${hist.length ? `<div class="pp-sec"><span class="pp-l">Incassi registrati</span><div class="pay-hist">${hist.map(x => `<div class="${esc(x.tipo === 'storno' ? 'neg' : '')}${storn.has(x.id) ? ' gone' : ''}"><span>${esc(fmtDate(x.day).slice(0, 5))} · ${esc(x.who)}${x.pid && !pid ? ` · <b>${esc(pName(x.pid) || x.pnome || '')}</b>` : ''}<br>${docPill(x)}${rtInfo(x) ? `<br><small class="rt-num">${esc(rtInfo(x))}</small>` : ''}</span><span>${(x.parts || []).map(p => `<span class="mpill ${esc(MET_C[p.m] || 'm-alt')}">${esc(MET_L[p.m] || p.m)}${p.bnum ? ' ' + esc(p.bnum) : ''}</span>`).join(' ')}</span><b>${money(x.tot)}</b>${x.doc === 'fattura' && x.tipo !== 'storno' && !storn.has(x.id) ? `<button class="btn sm${esc(x.danea ? '' : ' primary')}" data-act="danea1" data-id="${esc(x.id)}" title="Scarica la fattura per Danea">${x.danea ? 'Di nuovo in Danea' : 'Apri in Danea'}</button>` : ''}${x.tipo !== 'storno' && !storn.has(x.id) && ACC.can('cassa') && (ACC.can('cassaAll') || (x.uid === ACC.sess.uid && x.day === todayISO())) ? `<button class="btn sm ghost" data-act="storno" data-id="${esc(x.id)}">Storna</button>` : ''}</div>`).join('')}</div></div>` : ''}`;
    return `<div class="paymodal" role="dialog" aria-modal="true" aria-label="Incasso e documento"><div class="pm-scrim"></div>
      <section class="panel paypanel">
      <div class="panel-h"><div class="pp-ht"><h3>${P ? `${esc(P.cognome)} ${esc(P.nome)}` : `${esc(bkName(bk))} x ${Math.max(bk.n || 0, bk.persone.length)}`}</h3><span>${P ? `della comitiva ${esc(bkName(bk))} x ${bk.persone.length} · ` : ''}${esc(t.nome)} · ${esc(fmtTripDate(t))}</span></div><button class="pm-x" data-act="pfclose" aria-label="Chiudi l'incasso">${ICON.close}</button></div>
      <div class="pp-b"><div id="pay-presence">${payPresenceHTML()}</div><div class="pp-cols"><div class="pp-col a">${colA}</div><div class="pp-col b">${colB}</div></div></div>
      </section></div>`;
  }
  // dati per la fattura, con il calcolo del codice fiscale
  function fattHTML(F) {
    return `<div class="pp-fatt"><span class="pp-l">Dati per la fattura</span>
      <div class="pp-g2"><label>Cognome<input data-pff="cognome" value="${esc(F.cognome)}" autocomplete="off"></label><label>Nome<input data-pff="nome" value="${esc(F.nome)}" autocomplete="off"></label></div>
      <div class="pp-g3"><label>Sesso<select data-pff="sesso"><option value=""${!F.sesso ? ' selected' : ''}>—</option><option value="F"${F.sesso === 'F' ? ' selected' : ''}>Femmina</option><option value="M"${F.sesso === 'M' ? ' selected' : ''}>Maschio</option></select></label>
        <label>Data di nascita<input type="date" data-pff="nascita" value="${esc(F.nascita)}"></label>
        <label>Luogo di nascita<input data-pff="natoA" value="${esc(F.natoA)}" placeholder="comune o stato estero" autocomplete="off"><small class="pp-hint" id="pf-cfplace"></small></label></div>
      <label class="pp-1">Codice fiscale o P. IVA<input data-pff="cf" id="pf-cf" value="${esc(F.cf)}" autocomplete="off" style="text-transform:uppercase"><small class="pp-hint" id="pf-cfst"></small></label>
      <label class="pp-1">Codice SDI o PEC<input data-pff="sdi" value="${esc(F.sdi || F.pec)}" autocomplete="off"></label>
      <div class="pp-g3"><label>Indirizzo<input data-pff="ind" value="${esc(F.ind)}"></label><label>CAP<input data-pff="cap" value="${esc(F.cap)}" inputmode="numeric"></label><label>Città<input data-pff="citta" value="${esc(F.citta)}"></label></div></div>`;
  }
  // ricalcola il codice fiscale quando cambiano cognome, nome, sesso, data o luogo di nascita
  function cfRecalc() {
    const f = UI.pay && UI.pay.f; if (!f || f.doc !== 'fattura') return; const F = f.fatt;
    const st = (id, txt, cls) => { const el = $('#' + id); if (el) { el.textContent = txt; el.className = 'pp-hint ' + (cls || ''); } };
    const status = () => { const c = CF.check(F.cf); st('pf-cfst', !F.cf ? 'Si calcola da solo con i dati qui sopra' : c === 'ok' ? (F.cfAuto ? '✓ Calcolato dai dati di nascita' : '✓ Codice fiscale corretto') : c === 'piva' ? '✓ Partita IVA' : c === 'errato' ? '✗ Il carattere finale non torna: ricontrolla' : c === 'piva-errata' ? '✗ Partita IVA non valida' : '✗ Non è un codice fiscale (16 caratteri) né una partita IVA (11 cifre)', /✓/.test(c === 'ok' || c === 'piva' ? '✓' : '') ? 'ok' : F.cf ? 'bad' : ''); };
    CF.load().then(() => {
      const pl = F.natoA ? CF.find(F.natoA, F.nascita) : null;
      st('pf-cfplace', !F.natoA ? '' : pl && pl.code ? `${pl.name}${pl.prov && pl.prov !== 'EE' ? ' (' + pl.prov + ')' : ' · estero'} · ${pl.code}` : pl && pl.ambiguous ? 'Più comuni con questo nome: aggiungi la provincia, es. «Castro (LE)»' : 'Non trovato: controlla come è scritto', pl && pl.code ? 'ok' : 'bad');
      const v = CF.calc({ cognome: F.cognome, nome: F.nome, sesso: F.sesso, nascita: F.nascita, code: pl && pl.code });
      if (v && (!F.cf || F.cfAuto)) { F.cf = v; F.cfAuto = true; const i = $('#pf-cf'); if (i && (document.activeElement !== i || !i.value.trim())) i.value = v; }
      status();
    }).catch(() => { st('pf-cfplace', 'Elenco dei comuni non disponibile (serve internet la prima volta)', 'bad'); status(); });
  }
  // pagamento misto: si scrive quanto con ogni metodo; il «resto» va dove serve con un tocco.
  // Con contanti e POS basta scriverne uno: l'altro si riempie da solo con quello che manca.
  const MIX_MAIN = ['contanti', 'pos'];
  function mixHTML(f) {
    const row = ([k, l]) => `<div class="pay-row"><span>${l}</span><input data-pfm="${esc(k)}" inputmode="decimal" value="${f.mix[k] ? esc(fmtNum(f.mix[k])) : ''}" placeholder="0,00" aria-label="${esc(l)}" autocomplete="off"><button type="button" class="btn sm ghost" data-act="pfrest" data-k="${esc(k)}" title="Metti qui quello che manca">resto</button></div>`;
    const others = METODI.filter(([k]) => !MIX_MAIN.includes(k)); const openO = others.some(([k]) => f.mix[k]);
    return `<div class="pp-mix">${METODI.filter(([k]) => MIX_MAIN.includes(k)).map(row).join('')}
      <details${openO ? ' open' : ''}><summary>Altri metodi (bonifico, PostePay, buono…)</summary>${others.map(row).join('')}</details>
      <div class="pp-mixsum" id="pp-mixsum">${mixSumTxt(f)}</div></div>`;
  }
  function mixSumTxt(f) {
    const parts = METODI.filter(([k]) => +f.mix[k] > 0).map(([k, l]) => `${l} ${money(f.mix[k])}`); const s = r2(METODI.reduce((a, [k]) => a + (+f.mix[k] || 0), 0)); const imp = r2(+f.imp || 0);
    if (!parts.length) return 'Scrivi quanto paga con ogni metodo: con contanti e POS basta scriverne uno.';
    const d = r2(imp - s);
    return `${parts.join(' + ')} = <b>${money(s)}</b> ${!imp ? '' : Math.abs(d) < 0.01 ? '<span class="ok">✓ torna con l\'importo</span>' : d > 0 ? `<span class="bad">mancano ${money(d)}</span>` : `<span class="bad">${money(-d)} in più</span>`}`;
  }
  function mixInput(k, v) {
    const f = UI.pay.f; f.mix[k] = v; f.mixT = f.mixT || {}; f.mixT[k] = true;
    // importo vuoto: diventa la somma dei metodi
    if (!(+f.imp > 0) || f.impFromMix) { f.imp = r2(METODI.reduce((a, [x]) => a + (+f.mix[x] || 0), 0)) || ''; f.impFromMix = true; const i = $('#pf-imp'); if (i) i.value = f.imp ? fmtNum(f.imp) : ''; }
    // contanti + POS: l'altro si riempie con il resto finché non lo tocchi
    else if (MIX_MAIN.includes(k)) { const o = MIX_MAIN.find(x => x !== k); if (!f.mixT[o]) { const rest = r2(+f.imp - METODI.filter(([x]) => x !== o).reduce((a, [x]) => a + (+f.mix[x] || 0), 0)); f.mix[o] = rest > 0 ? rest : 0; const i = $(`[data-pfm="${o}"]`); if (i) i.value = f.mix[o] ? fmtNum(f.mix[o]) : ''; } }
    const el = $('#pp-mixsum'); if (el) el.innerHTML = mixSumTxt(f);
    const rt = $('#pp-rt'); if (rt) rt.innerHTML = rtPreviewHTML(f);
    if (k === 'buono' || f.buono) { const bx = $('#pp-buono'); if (bx && !bx.contains(document.activeElement)) bx.innerHTML = buonoPayHTML(f); }
  }
  function mixRest(k) {
    const f = UI.pay.f; const rest = r2(+f.imp - METODI.filter(([x]) => x !== k).reduce((a, [x]) => a + (+f.mix[x] || 0), 0));
    if (!(+f.imp > 0)) return toast('Scrivi prima l\'importo incassato adesso');
    f.mix[k] = rest > 0 ? rest : 0; f.mixT = f.mixT || {}; f.mixT[k] = true; const i = $(`[data-pfm="${k}"]`); if (i) i.value = f.mix[k] ? fmtNum(f.mix[k]) : '';
    const el = $('#pp-mixsum'); if (el) el.innerHTML = mixSumTxt(f);
  }
  function payTotHTML(T, bigl) {
    return `${bigl ? '' : `<div><span>Bus</span><b>${money(T.bus)}</b></div>`}${T.tkt ? `<div><span>Biglietti (${T.nT})</span><b>${money(T.tkt)}</b></div>` : ''}${T.dirT ? `<div><span>Diritti</span><b>${money(T.dirT)}</b></div>` : ''}${T.sup ? `<div><span>Suppl. fila</span><b>${money(T.sup)}</b></div>` : ''}
      <div class="tot"><span>Totale</span><b>${money(T.tot)}</b></div>${UI.pay && UI.pay.f && UI.pay.f.doc === 'fattura' ? '' : `<div class="ag"><span>Nello scontrino (parte agenzia)</span><b>${money(T.agenzia)}</b></div>`}${T.tkt ? `<div><span>Biglietti del circuito, a parte</span><b>${money(T.tkt)}</b></div>` : ''}`;
  }
  function payWarnTxt(f, m) { const v = +f.imp; if (!v || m.rest == null) return ''; return v > m.rest + 0.009 ? (m.rest <= 0 ? 'Attenzione: risulta già pagato tutto.' : `Attenzione: è più del dovuto di ${money(v - m.rest)}.`) : v < m.rest - 0.009 ? `Acconto: restano ${money(m.rest - v)}.` : ''; }
  // aggiorna i totali senza ridisegnare il riquadro (così non si perde il cursore)
  function payRecalc() {
    const f = UI.pay && UI.pay.f; if (!f) return; const T = payTotals(f); const el = $('#pp-tot'); if (el) el.innerHTML = payTotHTML(T, f.bigl); const ls = $('#pp-lsum'); if (ls) ls.textContent = linesSummary(f, T);
    f.lines.forEach((l, i) => { const c = $('#pl-t' + i); if (c) c.textContent = l.q ? money((+l.q) * ((+l.bus || 0) + (+l.tkt || 0))) : ''; });
    const t = trip(); const bk = t && deriveBookings(t).find(x => x.id === UI.pay.bkId); const w = $('#pp-warn'); if (bk) { bk._m = bkMoney(t, bk); const pm = payMoney(t, bk, UI.pay.pid || ''); f.rest = pm.rest != null ? r2(pm.rest) : null; if (w) w.textContent = payWarnTxt(f, pm); }
    const rt = $('#pp-rt'); if (rt) rt.innerHTML = rtPreviewHTML(f);
    if (f.buono) { const bx = $('#pp-buono'); if (bx) bx.innerHTML = buonoPayHTML(f); }
  }
  function payInput(el) {
    const f = UI.pay && UI.pay.f; if (!f) return false; const d = el.dataset;
    if (d.pf === 'imp') f.impFromMix = false;
    if (d.pf) { const k = d.pf; f[k] = ['imp', 'suppl', 'dir'].includes(k) ? (parseEuro(el.value) ?? (el.value.trim() ? f[k] : '')) : el.value; if (k === 'legacy') { const t = trip(); const h = t && rowById(t, UI.pay.bkId); if (h) { h.pagato = el.value.trim(); save(); } } payRecalc(); if (k === 'stock') render(); return true; }
    if (d.pl !== undefined) { const l = f.lines[+d.pl]; l[d.k] = d.k === 'l' ? el.value : d.k === 'q' ? (parseInt(el.value, 10) || 0) : (parseEuro(el.value) || 0); payRecalc(); return true; }
    if (d.pff) { f.fatt[d.pff] = d.pff === 'cf' ? el.value.toUpperCase().replace(/\s/g, '') : el.value; if (d.pff === 'cf') f.fatt.cfAuto = !el.value.trim(); if (['cognome', 'nome', 'sesso', 'nascita', 'natoA', 'cf'].includes(d.pff)) cfRecalc(); return true; }
    if (d.pfm) { mixInput(d.pfm, parseEuro(el.value) || 0); return true; }
    if (d.pfc) { f[d.pfc] = el.checked; return true; }
    return false;
  }
  // 2.1.8: niente doppie vendite. Negli eventi non si incassa chi è oltre i posti dei bus;
  // i biglietti dell'agenzia non si usano oltre quelli rimasti liberi.
  function payBlock(t, bk, pid, f) {
    if (tripCat(t) === 'evento') { const OV = overCap(t); const over = bk.persone.filter(p => (!pid || p.id === pid) && OV.ids.has(p.id));
      if (over.length) return `${over.length === 1 ? `${over[0].cognome} ${over[0].nome} è` : `${over.length} persone di questa prenotazione sono`} oltre i posti del bus: il bus è pieno. Aggiungi un bus da «Posti sul bus» oppure sposta in lista d'attesa, poi incassa.`; }
    if (f.stock && typeof bgStockAvail === 'function') { const sk = bgStock().find(x => x.id === f.stock); const need = bgPayTypes(t);
      if (need.size > 1) return `In questo incasso ci sono biglietti di tipi diversi: con i biglietti dell'agenzia incassa una persona alla volta (in «Chi paga»), oppure scegli «nessuno».`;
      if (sk && need.size && !need.has(tkNorm(sk.sett))) return `I biglietti dell'agenzia scelti sono di «${sk.sett}»: le persone di questo incasso hanno un altro biglietto. Scegli «nessuno» oppure i biglietti giusti.`; }
    if (f.stock && typeof bgStockAvail === 'function') { const n = payTotals(f).nT; const av = bgStockAvail(f.stock, t.id, bk.id, pid); if (n > av) return `Dei biglietti dell'agenzia scelti ne ${av === 1 ? 'resta 1 libero' : `restano ${av} liberi`}, qui ne servono ${n}: scegli «nessuno» ed emetti i biglietti, oppure aggiungi altri biglietti comprati in Biglietteria.`; }
    return '';
  }
  function paySave() {
    const t = trip(); const D = deriveBookings(t); const bk = D.find(x => x.id === UI.pay.bkId); if (!bk) return payClose();
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia in cui lavori (in alto)');
    const f = UI.pay.f; const imp = r2(+f.imp);
    { const blk = payBlock(t, bk, UI.pay.pid || '', f); if (blk) { DIAG.ev('avviso', 'Incasso bloccato: ' + (blk.includes('oltre i posti') ? 'oltre i posti del bus' : 'biglietti dell\'agenzia finiti')); return toast(blk); } }
    if (!imp || imp <= 0) return toast('Scrivi l\'importo incassato adesso');
    let parts;
    if (f.met === 'misto') {
      parts = METODI.map(([k]) => ({ m: k, a: r2(f.mix[k] || 0) })).filter(p => p.a > 0);
      const s = r2(parts.reduce((a, p) => a + p.a, 0));
      if (parts.length < 2) return toast('Nel pagamento misto scrivi almeno due metodi');
      if (Math.abs(s - imp) > 0.009) return toast(`I metodi fanno ${money(s)}, l'importo è ${money(imp)}`);
    } else parts = [{ m: f.met, a: imp }];
    { const bErr = buonoCheck(f, parts); if (bErr) return toast(bErr); }
    if (f.doc === 'fattura' && !String(f.fatt.cf || '').trim()) return toast('Per la fattura scrivi il codice fiscale o la partita IVA');
    if (f.doc === 'fattura') { const c = CF.check(f.fatt.cf); if (c !== 'ok' && c !== 'piva') return toast(c === 'piva-errata' ? 'La partita IVA non è valida: ricontrollala' : 'Il codice fiscale non è valido: ricontrollalo'); }
    const T = payTotals(f); bk._m = bkMoney(t, bk); const pid = UI.pay.pid || ''; const m = payMoney(t, bk, pid); const P = pid && bk.persone.find(p => p.id === pid);
    f.rest = m.rest != null ? r2(m.rest) : null;
    if (rtGitaParziale(f)) return toast(`Per le gite lo scontrino si fa solo al saldo: incassa tutto quello che resta (${money(f.rest != null ? f.rest : T.tot)}) oppure scegli «Senza documento»`);
    const tipo = m.rest != null && imp >= m.rest - 0.009 ? 'saldo' : 'acconto';
    const agz = T.tot > 0 ? r2(imp * T.agenzia / T.tot) : imp;
    const mv = addMov({ tripId: t.id, tripN: t.nome, tripD: t.data, bkId: bk.id, pid: pid || undefined, pnome: P ? `${P.cognome} ${P.nome}`.trim() : undefined, cliente: f.cliente || (P ? `${P.cognome} ${P.nome}` : `${bkName(bk)} x ${bk.persone.length}`), tel: (P && P.tel) || (bk.persone.find(p => p.tel) || {}).tel || '', tipo, parts,
      doc: f.doc, docStato: f.doc === 'scontrino' || f.doc === 'fattura' ? 'da_emettere' : '', cat: f.cat, desc: f.desc, ...(() => { const sk = f.stock && bgStock().find(x => x.id === f.stock); return sk ? { circuito: sk.circ, emis: sk.emis, ant: true, stock: sk.id } : { circuito: T.tkt ? f.circuito : '', emis: T.tkt ? f.emis : '', ant: !!f.ant }; })(),
      rt: f.doc === 'scontrino' ? { chiusura: '', numero: '', dataOra: '', matricola: '', esito: '' } : undefined,
      lines: f.lines.filter(l => +l.q).map(l => ({ l: l.l, q: +l.q, bus: +l.bus || 0, tkt: +l.tkt || 0 })), suppl: T.sup, supN: f.supN || 1, dir: +f.dir || 0, nT: T.nT, docTot: T.tot, agenzia: agz, biglietti: r2(imp - agz),
      pratica: f.pratica, canale: f.met === 'contanti' || f.met === 'pos' ? '' : f.canale, dataPag: f.met === 'contanti' || f.met === 'pos' ? '' : f.dataPag, pagante: f.pagante, note: f.note, fatt: f.doc === 'fattura' ? Object.assign({}, f.fatt) : null, sigla: sigla(ACC.sess.uid, ACC.me().name) });
    const hc = P ? P.row.cid : bk.head.cid;
    if (f.doc === 'fattura' && hc && S.clients.clienti[hc]) { const c = S.clients.clienti[hc]; Object.assign(c, { cf: f.fatt.cf, sdi: f.fatt.sdi, cap: f.fatt.cap, citta: f.fatt.citta }); if (f.fatt.sesso) c.sesso = f.fatt.sesso; if (f.fatt.nascita) c.nascita = CF.itFromIso(f.fatt.nascita); if (f.fatt.natoA) c.natoA = f.fatt.natoA; if (f.fatt.ind) c.indirizzo = f.fatt.ind; save(); }
    ACC.tlog('info', `Incasso ${money(mv.tot)} (${parts.map(p => MET_L[p.m]).join(' + ')}) · ${DOC_L[f.doc]} · ${mv.cliente}${P ? ' (solo la sua quota, comitiva ' + bkName(bk) + ')' : ''} · ${t.nome}`);
    let msg = `Incasso registrato: ${money(mv.tot)} · ${tipo}`;
    if (f.doc === 'fattura') msg += ' · fattura pronta: premi «Apri in Danea» qui sotto';
    UI.pay.f = payDraft(t, deriveBookings(t).find(x => x.id === bk.id) || bk, pid); commit();
    if (f.doc === 'scontrino') fiscalPrint(mv).then(r => toast(msg + (r.ok ? ' · scontrino emesso' : ` · scontrino di ${money(agz)} da emettere (${r.msg})`))); else toast(msg);
  }

  // ---------- prelievi e apporti di contanti ----------
  function cashMovModal(kind) {
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia');
    UI.modal = { kind: 'cashmov', k: kind };
    openModal(`${kind === 'prelievo' ? 'Prelievo dalla cassa' : 'Apporto in cassa'} · ${esc(agName(ACC.sess.ag))}`, `
      <div class="field"><label for="cm-imp">Importo in contanti</label><input id="cm-imp" class="pay-imp" inputmode="decimal" placeholder="0,00" autocomplete="off"></div>
      <div class="field"><label for="cm-note">Motivo</label><input id="cm-note" placeholder="${esc(kind === 'prelievo' ? 'es. versamento in banca' : 'es. fondo cassa')}"></div>`,
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
  const contaTabs = () => `<div class="ctabs seg" role="tablist" aria-label="Contabilità"><button role="tab" data-act="ctab" data-v="giorno" aria-pressed="${esc(UI.ctab !== 'mese')}">Resoconto giornaliero</button><button role="tab" data-act="ctab" data-v="mese" aria-pressed="${esc(UI.ctab === 'mese')}">Mese</button></div>`;
  const XL_H = ['Data', 'Op.', 'Doc.', 'V.Banco', 'Fattura', 'Categoria', 'Cognome e Nome', 'Descrizione', 'Circuito', 'Emis. Cont.', 'Emis. Antic.', 'Note prat.', 'Q1', '€ 1 Bus', 'Tkt intero', 'Q2', '€ 2 Bus', 'Tkt ridotto2', 'Q3', '€ 3 Bus', 'Tkt ridotto3', 'Suppl. Fila', 'Diritti', 'Totale', 'CHECK', 'Cash', 'Pos', '€ altro', 'Modalità', 'Pratica', 'Data.Pag.', 'Pagante', 'Saldo', 'Danea', 'Check D.', '€ Tot.Tkt', 'N.Tot. Tkt', 'Check Tkt', 'Tot.Diritti', 'Tot. Bus', 'Note', 'Tkt+Diritti', 'Agenzia'];
  function xlRow(m, saldo) {
    // con più di 3 righe (es. più tipi di biglietto) dalla terza in poi si uniscono in Q3 = 1 con i totali: le somme restano giuste
    const L0 = m.lines || []; const L = L0.length > 3 ? L0.slice(0, 2).concat([{ l: L0.slice(2).map(l => `${l.q} × ${l.l}`).join(' + '), q: 1, bus: r2(L0.slice(2).reduce((a, l) => a + l.q * l.bus, 0)), tkt: r2(L0.slice(2).reduce((a, l) => a + l.q * l.tkt, 0)) }]) : L0; const ln = i => L[i] || {}; const sumP = f => r2((m.parts || []).filter(f).reduce((a, p) => a + p.a, 0));
    const cash = sumP(p => p.m === 'contanti'), pos = sumP(p => p.m === 'pos'), alt = sumP(p => p.m !== 'contanti' && p.m !== 'pos');
    const altM = (m.parts || []).filter(p => p.m !== 'contanti' && p.m !== 'pos').map(p => MET_L[p.m] || p.m).join('+');
    const totBus = r2(L.reduce((a, l) => a + l.q * l.bus, 0)), totTkt = r2(L.reduce((a, l) => a + l.q * l.tkt, 0)), nT = m.nT || L.reduce((a, l) => a + (l.tkt ? l.q : 0), 0), dirT = r2((m.dir || 0) * nT);
    const tot = isInc(m) ? (m.docTot != null ? m.docTot : m.tot) : 0;
    return [fmtDate(m.day), m.sigla || sigla(m.uid, m.who), DOC_X[m.doc] || (m.tipo === 'storno' ? 'NC V.Banco' : ''), '', '', m.cat || '', m.cliente || '', m.desc || m.tripN || '', m.circuito || 'NO', m.emis && !m.ant ? fmtDate(m.emis) : 'NO', m.emis && m.ant ? fmtDate(m.emis) : 'NO', m.note || '',
      ln(0).q || 0, ln(0).bus || 0, ln(0).tkt || 0, ln(1).q || 0, ln(1).bus || 0, ln(1).tkt || 0, ln(2).q || 0, ln(2).bus || 0, ln(2).tkt || 0, m.suppl || 0, m.dir || 0, tot,
      !isInc(m) ? 'CONTROLLA' : Math.abs(r2(cash + pos + alt) - tot) < 0.01 ? 'ok' : 'acconto', cash, pos, alt, altM, m.pratica || '', m.dataPag ? fmtDate(m.dataPag) : '', m.pagante || '', saldo, isInc(m) ? (m.agenzia != null ? m.agenzia : m.tot) : 0, '', totTkt, nT, '', dirT, totBus, [m.tipo === 'acconto' ? 'acconto' : '', L0.length > 3 ? 'Q3 = ' + L[2].l : ''].filter(Boolean).join(' · '), r2(totTkt + dirT), AGC[m.ag] || m.ag || ''];
  }
  function exportCassa(movs, name) {
    movs = movs.slice().sort((a, b) => a.at.localeCompare(b.at));
    const q = v => `"${csvSafe(v).replace(/"/g, '""')}"`; const n = v => typeof v === 'number' ? String(r2(v)).replace('.', ',') : v;
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
        <div class="hbtns"><div class="seg" role="group" aria-label="Agenzia">${[['tutte', 'Tutte'], ...S.cfg.agenzie.map(a => [a.id, a.nome])].map(([k, l]) => `<button data-act="gag" data-v="${esc(k)}" aria-pressed="${esc(ag === k)}">${esc(l)}</button>`).join('')}</div>
          <button class="btn" data-act="gday" data-v="${esc(dayISO(prev))}">‹</button><input type="date" class="btn" data-gdate="1" value="${esc(day)}" aria-label="Giorno"><button class="btn" data-act="gday" data-v="${esc(dayISO(next))}">›</button>
          ${inc.some(m => m.doc === 'fattura') ? '<button class="btn" data-act="daneaday">Fatture del giorno per Danea</button>' : ''}${rtCfg().daneaScontrini && inc.some(m => m.doc === 'scontrino') ? '<button class="btn" data-act="daneascon">Scontrini del giorno per Danea</button>' : ''}<button class="btn" data-act="gexport">Scarica per Excel (foglio CASSA)</button></div></div>
      <div class="tiles"><div class="tile dark"><span>Incassato</span><b>${money(tot)}</b><small>${inc.length} movimenti</small></div>${METG.map(([k, l]) => `<div class="tile"><span><i class="mdot ${esc(MET_C[k])}"></i>${l}</span><b>${money(per[k] || 0)}</b>${k === 'altro' && Object.keys(altri).length ? `<small>${Object.entries(altri).map(([x, v]) => `${esc(MET_L[x] || x)} ${esc(fmtNum(v))}`).join(' · ')}</small>` : ''}</div>`).join('')}</div>
      <div class="three">
        <section class="box form"><h3>Cassa contanti</h3><div class="kv"><span>Inizio giornata</span><b>${money(sal.inizio)}</b></div><div class="kv"><span>Contanti incassati</span><b>${money(sal.inc)}</b></div>${sal.prel ? `<div class="kv"><span>Prelievi</span><b>− ${money(sal.prel)}</b></div>` : ''}${sal.app ? `<div class="kv"><span>Apporti</span><b>+ ${money(sal.app)}</b></div>` : ''}<div class="kv tot"><span>Fine giornata</span><b>${money(sal.fine)}</b></div>${ch && ch.contati && ch.contati.contanti != null ? `<div class="kv"><span>Contati alla chiusura</span><b>${money(ch.contati.contanti)} ${Math.abs(ch.contati.contanti - (per.contanti || 0)) < 0.01 ? '<span class="pill ok">quadra</span>' : ''}</b></div>` : ''}</section>
        <section class="box form"><h3>Documenti</h3><div class="kv"><span>Scontrini (parte agenzia)</span><b>${scon.length} · ${money(scon.reduce((a, m) => a + (m.agenzia != null ? m.agenzia : m.tot), 0))}</b></div><div class="kv"><span>Da emettere</span><b>${inc.filter(m => m.docStato === 'da_emettere').length}</b></div><div class="kv"><span>Fatture</span><b>${fatt.length} · ${money(fatt.reduce((a, m) => a + m.tot, 0))}</b></div><div class="kv"><span>Caparre</span><b>${money(inc.filter(m => m.doc === 'caparra').reduce((a, m) => a + m.tot, 0))}</b></div><div class="kv tot"><span>Totale parte agenzia (Danea)</span><b>${money(agTot)}</b></div></section>
        <section class="box form"><h3>Biglietti dei circuiti</h3>${Object.entries(byCirc).map(([c, o]) => `<div class="kv"><span>${esc(c)}</span><b>${o.n} tkt · ${money(o.tk)}</b></div>`).join('') || '<div class="small">Nessun biglietto venduto.</div>'}${tkTot ? `<div class="kv tot"><span>Da versare ai circuiti</span><b>${money(tkTot)}</b></div>` : ''}</section></div>
      <section class="box tablecard"><h2 class="ch">Per categoria</h2><div class="tscroll"><table class="rt"><thead><tr><th>Categoria</th><th class="r">Incassi</th><th class="r">Totale</th><th class="r">Parte agenzia</th><th class="r">Biglietti</th></tr></thead><tbody>${Object.entries(byCat).map(([k, o]) => `<tr><td>${esc(k)}</td><td class="r">${o.n}</td><td class="r">${money(o.tot)}</td><td class="r">${money(o.ag)}</td><td class="r">${money(o.tk)}</td></tr>`).join('') || '<tr><td colspan="5" class="emptyrow">Nessun incasso.</td></tr>'}</tbody></table></div></section>
      <section class="box tablecard"><h2 class="ch">Movimenti del giorno</h2><div class="tscroll"><table class="rt xl"><thead><tr><th>Ora</th><th>Op.</th><th>Doc.</th><th>Categoria</th><th>Cognome e nome</th><th>Descrizione</th><th>Circuito</th><th class="r">Q</th><th class="r">€ bus</th><th class="r">€ tkt</th><th class="r">Suppl.</th><th class="r">Diritti</th><th class="r">Totale</th><th class="r">Cash</th><th class="r">POS</th><th class="r">Altro</th><th class="r">Danea</th><th class="r">Saldo</th><th>Agenzia</th></tr></thead><tbody>
        ${movs.map(m => { const c = (m.parts || []).filter(p => p.m === 'contanti').reduce((a, p) => a + p.a, 0); run = r2(run + c); const x = xlRow(m, run); const L = m.lines || [];
          return `<tr class="${esc(m.tipo === 'storno' || m.tipo === 'prelievo' ? 'neg' : '')}"><td>${esc(hm(m.at))}</td><td>${esc(x[1])}</td><td>${esc(x[2])}${m.docStato === 'da_emettere' ? '<br><small>da emettere</small>' : ''}${rtInfo(m) ? `<br><small class="rt-num">${esc(rtInfo(m))}</small>` : ''}</td><td>${esc(x[5])}</td><td>${esc(x[6])}</td><td>${esc(x[7])}</td><td>${esc(m.circuito || '')}</td><td class="r">${L.reduce((a, l) => a + l.q, 0) || ''}</td><td class="r">${L.length ? money(L.reduce((a, l) => a + l.q * l.bus, 0)) : ''}</td><td class="r">${L.some(l => l.tkt) ? money(L.reduce((a, l) => a + l.q * l.tkt, 0)) : ''}</td><td class="r">${m.suppl ? money(m.suppl) : ''}</td><td class="r">${x[38] ? money(x[38]) : ''}</td><td class="r"><b>${isInc(m) ? money(x[23]) : ''}</b></td><td class="r">${x[25] ? money(x[25]) : ''}</td><td class="r">${x[26] ? money(x[26]) : ''}</td><td class="r">${x[27] ? money(x[27]) + '<br><small>' + esc(x[28]) + '</small>' : ''}</td><td class="r">${isInc(m) ? money(x[33]) : ''}</td><td class="r">${money(run)}</td><td>${esc(x[42])}</td></tr>`; }).join('') || '<tr><td colspan="19" class="emptyrow">Nessun movimento.</td></tr>'}
      </tbody></table></div></section>`;
  }

  // ---------- buoni regalo (2.1.5) ----------
  // Un buono nasce incassando l'importo in cassa (categoria «BuonoRegalo» del foglio CASSA) e si può spendere
  // anche in più volte, fino a zero. Quanto resta si calcola dagli incassi pagati con «Buono regalo»
  // (ogni pagamento ricorda il numero del buono; uno storno lo restituisce al buono).
  // File: /buoni/buoni.json · { u, buoni: { id: { num, at, day, dest, from, tel, importo, note, who, uid, ag, movId, u } } }
  const BPATH = '/buoni/buoni.json';
  const buoniAll = () => Object.values((STORE.get(BPATH) || {}).buoni || {}).filter(x => x && x.id);
  const buonoById = id => buoniAll().find(x => x.id === id);
  // quanto è stato speso di un buono (gli storni tornano indietro da soli: hanno importi negativi)
  function buonoUsed(id) { let s = 0; allMovs().forEach(m => (m.parts || []).forEach(p => { if (p.m === 'buono' && p.buono === id) s += +p.a || 0; })); return r2(s); }
  const buonoAnnullato = b => !!(b.movId && allMovs().some(m => m.storno === b.movId));
  const buonoRes = b => (buonoAnnullato(b) ? 0 : Math.max(0, r2((+b.importo || 0) - buonoUsed(b.id))));
  const buonoUses = id => allMovs().filter(m => (m.parts || []).some(p => p.m === 'buono' && p.buono === id)).sort((a, b) => a.at.localeCompare(b.at));
  function buonoNum(ag) {
    const yy = todayISO().slice(2, 4); const pre = `${AGC[ag] || 'BR'}-${yy}-`;
    const n = buoniAll().filter(b => String(b.num || '').startsWith(pre)).reduce((a, b) => Math.max(a, parseInt(String(b.num).slice(pre.length), 10) || 0), 0);
    return pre + String(n + 1).padStart(3, '0');
  }
  const cassaTabs = () => `<div class="ctabs seg" role="tablist" aria-label="Cassa"><button role="tab" data-act="ctabc" data-v="cassa" aria-pressed="${esc(UI.ctabC !== 'buoni')}">Resoconto di cassa</button><button role="tab" data-act="ctabc" data-v="buoni" aria-pressed="${esc(UI.ctabC === 'buoni')}">${ICON.star} Buoni regalo</button></div>`;
  function buoniView() {
    const q = String(UI.bq || '').trim().toLowerCase(); const arch = UI.btab === 'arch';
    const L = buoniAll().map(b => Object.assign({}, b, { res: buonoRes(b), ann: buonoAnnullato(b) }))
      .filter(b => (arch ? b.res <= 0.009 : b.res > 0.009))
      .filter(b => !q || [b.num, b.dest, b.from, b.tel].some(v => String(v || '').toLowerCase().includes(q)))
      .sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const act = buoniAll().filter(b => buonoRes(b) > 0.009); const totRes = r2(act.reduce((a, b) => a + buonoRes(b), 0));
    const canNew = ACC.can('cassa') && ACC.sess.ag && !ACC.can('readonly');
    const lastUse = b => { const u = buonoUses(b.id); return u.length ? u[u.length - 1] : null; };
    return `${cassaTabs()}<div class="pagehead"><div><h1>Buoni regalo</h1><div class="sub">${act.length} ${act.length === 1 ? 'buono attivo' : 'buoni attivi'} · ancora da spendere <b>${money(totRes)}</b></div></div>
        <div class="hbtns"><input class="search" data-bq="1" value="${esc(UI.bq || '')}" placeholder="Cerca numero o nome" aria-label="Cerca un buono">${canNew ? `<button class="btn primary" data-act="bnew">${ICON.plus} Nuovo buono</button>` : ''}</div></div>
      <div class="seg bu-tabs" role="tablist"><button role="tab" data-act="btab" data-v="att" aria-pressed="${esc(!arch)}">Attivi</button><button role="tab" data-act="btab" data-v="arch" aria-pressed="${esc(arch)}">Archivio buoni · spesi o annullati</button></div>
      <section class="box tablecard"><div class="tscroll"><table class="rt bu-t"><thead><tr><th>N° pratica</th><th>Data</th><th>Chi riceve il buono</th><th class="r">${arch ? 'Importo' : 'Ancora da spendere'}</th><th>Chi fa il buono</th>${arch ? '<th>Speso</th>' : ''}<th></th></tr></thead><tbody>
        ${L.map(b => { const lu = arch ? lastUse(b) : null; return `<tr${b.ann ? ' class="gone"' : ''}><td><b class="bu-n">${esc(b.num)}</b></td><td>${esc(fmtDate(b.day || String(b.at).slice(0, 10)))}</td><td><b>${esc(b.dest || '—')}</b></td>
          <td class="r">${arch ? `${money(b.importo)}${b.ann ? '<br><small>annullato</small>' : ''}` : `<b class="bu-res">${money(b.res)}</b>${b.res < (+b.importo || 0) - 0.009 ? `<br><small>su ${money(b.importo)}</small>` : ''}`}</td>
          <td>${esc(b.from || '—')}<br><small>${esc(b.who || '')}${b.ag ? ' · ' + esc(agName(b.ag)) : ''}</small></td>${arch ? `<td>${b.ann ? 'annullato' : lu ? esc(fmtDate(lu.day)) + '<br><small>' + esc(lu.tripN || lu.desc || '') + '</small>' : '—'}</td>` : ''}
          <td class="r"><button class="btn sm" data-act="bdet" data-id="${esc(b.id)}">Dettagli</button></td></tr>`; }).join('') || `<tr><td colspan="${esc(arch ? 7 : 6)}" class="emptyrow">${q ? 'Nessun buono trovato' : arch ? 'Nessun buono speso o annullato' : 'Nessun buono attivo: premi «Nuovo buono»'}</td></tr>`}
      </tbody></table></div></section>
      <div class="small bu-help">Il buono si incassa quando si crea (va nel resoconto di cassa come «BuonoRegalo»). Quando il cliente paga un viaggio, nell'incasso scegli <b>Buono regalo</b> e il numero del buono: l'importo si scala da solo. Un buono si può usare anche in più volte, finché arriva a zero; poi passa nell'archivio.</div>`;
  }
  function buonoModal() {
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia in cui lavori (in alto)');
    UI.modal = { kind: 'buono', met: 'contanti' };
    openModal('Nuovo buono regalo', `<div class="bu-f">
      <div class="field"><label>N° pratica</label><div class="bu-num">${esc(buonoNum(ACC.sess.ag))} <small>si assegna da solo</small></div></div>
      <div class="field"><label for="bu-dest">Chi riceve il buono</label><input id="bu-dest" autocomplete="off" placeholder="es. Rossi Maria"></div>
      <div class="grid2"><div class="field"><label for="bu-from">Chi fa il buono (paga)</label><input id="bu-from" autocomplete="off" placeholder="es. Bianchi Ugo"></div><div class="field"><label for="bu-tel">Telefono di chi lo fa <small>facoltativo</small></label><input id="bu-tel" inputmode="tel" autocomplete="off"></div></div>
      <div class="field"><label for="bu-imp">Importo del buono</label><input id="bu-imp" class="pay-imp" inputmode="decimal" placeholder="0,00" autocomplete="off"></div>
      <div class="field"><label>Pagato con</label><div class="pay-met" role="radiogroup" aria-label="Pagato con">${METODI.filter(([k]) => k !== 'buono' && k !== 'voucher').map(([k, l]) => `<button type="button" role="radio" data-act="bmet" data-k="${esc(k)}" aria-checked="${esc(k === 'contanti')}">${l}</button>`).join('')}</div></div>
      <div class="field"><label for="bu-note">Note <small>facoltative</small></label><input id="bu-note" autocomplete="off" placeholder="es. regalo di compleanno"></div>
      <div class="small">L'incasso va nella <b>${esc(cassaName(ACC.sess.ag))}</b>, registrato da <b>${esc(ACC.me().name)}</b>.</div></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="bsave">Crea il buono e incassa</button>`);
  }
  function buonoSave() {
    const dest = ($('#bu-dest').value || '').trim(), from = ($('#bu-from').value || '').trim(), imp = parseEuro($('#bu-imp').value);
    if (!dest) return toast('Scrivi chi riceve il buono'); if (!from) return toast('Scrivi chi fa il buono'); if (!imp || imp <= 0) return toast('Scrivi l\'importo del buono');
    const ag = ACC.sess.ag; const num = buonoNum(ag); const id = 'b' + uid(); const met = UI.modal.met || 'contanti'; const note = ($('#bu-note').value || '').trim();
    const mv = addMov({ tipo: 'buono', cat: 'BuonoRegalo', doc: 'nessuno', cliente: from.toUpperCase(), desc: `buono regalo ${num} per ${dest}`.toLowerCase(), note: `Buono ${num}${note ? ' · ' + note : ''}`, buonoId: id, parts: [{ m: met, a: r2(imp) }], sigla: sigla(ACC.sess.uid, ACC.me().name) });
    const cur = JSON.parse(JSON.stringify(STORE.get(BPATH) || { buoni: {} })); cur.buoni = cur.buoni || {}; const now = tick();
    cur.buoni[id] = { id, num, at: mv.at, day: mv.day, dest, from, tel: ($('#bu-tel').value || '').trim(), importo: r2(imp), note, who: ACC.me().name, uid: ACC.sess.uid, ag, movId: mv.id, u: now }; cur.u = now;
    STORE.put(BPATH, cur);
    ACC.tlog('info', `Buono regalo ${num} · ${money(imp)} (${MET_L[met]}) · per ${dest}, fatto da ${from}`);
    closeModal(); UI.btab = 'att'; render(); toast(`Buono ${num} creato: ${money(imp)} per ${dest}`);
  }
  function buonoDet(id) {
    const b = buonoById(id); if (!b) return; const res = buonoRes(b); const uses = buonoUses(b.id); const ann = buonoAnnullato(b);
    UI.modal = { kind: 'bdet', id };
    openModal(`Buono ${esc(b.num)}`, `<div class="bu-d">
      <div class="bu-dt"><div><span>Chi riceve</span><b>${esc(b.dest || '—')}</b></div><div><span>Chi fa il buono</span><b>${esc(b.from || '—')}</b>${b.tel ? `<small>${esc(b.tel)}</small>` : ''}</div><div><span>Creato</span><b>${esc(fmtDate(b.day))}</b><small>${esc(b.who || '')}${b.ag ? ' · ' + esc(agName(b.ag)) : ''}</small></div></div>
      <div class="pay-sum"><div><span>Importo</span><b>${money(b.importo)}</b></div><div><span>Speso</span><b>${money(ann ? 0 : buonoUsed(b.id))}</b></div><div class="hi"><span>${ann ? 'Annullato' : 'Ancora da spendere'}</span><b>${money(res)}</b></div></div>
      ${b.note ? `<div class="small">Note: ${esc(b.note)}</div>` : ''}
      <h3 class="bu-h">Dove è stato usato</h3>
      ${uses.length ? `<div class="pay-hist">${uses.map(m => { const a = r2((m.parts || []).filter(p => p.m === 'buono' && p.buono === b.id).reduce((x, p) => x + p.a, 0)); return `<div class="${esc(a < 0 ? 'neg' : '')}"><span>${esc(fmtDate(m.day).slice(0, 5))} · ${esc(m.tripN || m.desc || '')}<br><small>${esc(m.cliente || '')} · ${esc(m.who || '')}${m.ag ? ' · ' + esc(agName(m.ag)) : ''}${a < 0 ? ' · storno' : ''}</small></span><b>${money(a)}</b></div>`; }).join('')}</div>` : '<div class="small">Non ancora usato.</div>'}</div>`,
      `<button class="btn" data-act="close">Chiudi</button>`);
  }
  // ---- nel riquadro dell'incasso: scegliere il buono con cui si paga ----
  const buonoPart = f => (f.met === 'buono' ? +f.imp || 0 : f.met === 'misto' ? +(f.mix || {}).buono || 0 : 0);
  function buonoPayHTML(f) {
    if (f.met !== 'buono' && !(f.met === 'misto' && +(f.mix || {}).buono > 0)) return '';
    const b = f.buono && buonoById(f.buono);
    if (b) { const res = buonoRes(b); const over = buonoPart(f) > res + 0.009;
      return `<div class="bu-pick sel"><div><span class="pp-l">Buono regalo</span><b>${esc(b.num)}</b> · per ${esc(b.dest || '—')}<br><small>ancora da spendere <b>${money(res)}</b>${buonoPart(f) ? ` · dopo questo incasso restano <b>${money(Math.max(0, res - buonoPart(f)))}</b>` : ''}</small>${over ? `<div class="bu-warn">Il buono copre solo ${money(res)}: scegli «Misto» e paga il resto con un altro metodo.</div>` : ''}</div><button type="button" class="btn sm ghost" data-act="bclr">Cambia</button></div>`; }
    const q = String(f.bq || '').trim().toLowerCase();
    const L = buoniAll().map(x => Object.assign({}, x, { res: buonoRes(x) })).filter(x => x.res > 0.009 && (!q || [x.num, x.dest, x.from].some(v => String(v || '').toLowerCase().includes(q)))).sort((a, c) => String(c.at).localeCompare(String(a.at))).slice(0, 6);
    return `<div class="bu-pick"><label class="pp-1">Quale buono regalo?<input data-bpq="1" value="${esc(f.bq || '')}" placeholder="numero (es. RAG-26-001) o nome" autocomplete="off"></label>
      <div class="bu-list">${L.map(x => `<button type="button" data-act="bsel" data-id="${esc(x.id)}"><b>${esc(x.num)}</b><span>${esc(x.dest || '—')}</span><i>${money(x.res)}</i></button>`).join('') || `<div class="small">${q ? 'Nessun buono attivo trovato' : 'Nessun buono attivo'}</div>`}</div></div>`;
  }
  function buonoPick(id) {
    const f = UI.pay && UI.pay.f; const b = buonoById(id); if (!f || !b) return; const res = buonoRes(b);
    f.buono = id;
    if (f.met === 'buono') { const want = f.rest != null && f.rest > 0 ? f.rest : +f.imp || res; if (want > res + 0.009) { f.imp = res; toast(`Il buono copre ${money(res)}: per il resto scegli «Misto»`); } else if (!(+f.imp > 0)) f.imp = r2(want); }
    else if (f.met === 'misto' && +f.mix.buono > res) { f.mix.buono = res; toast(`Il buono copre ${money(res)}: il resto va con un altro metodo`); }
    render();
  }
  // controllo prima di registrare l'incasso; restituisce un messaggio se qualcosa non va
  function buonoCheck(f, parts) {
    const bp = parts.filter(p => p.m === 'buono'); if (!bp.length) return '';
    const b = f.buono && buonoById(f.buono); if (!b) return 'Scegli il buono regalo con cui paga il cliente';
    const tot = r2(bp.reduce((a, p) => a + p.a, 0)); const res = buonoRes(b); if (tot > res + 0.009) return `Il buono ${b.num} copre solo ${money(res)}`;
    bp.forEach(p => { p.buono = b.id; p.bnum = b.num; }); return '';
  }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="ctabc"],[data-act="btab"],[data-act="bnew"],[data-act="bsave"],[data-act="bdet"],[data-act="bmet"],[data-act="bsel"],[data-act="bclr"]'); if (!el) return;
    const a = el.dataset.act;
    if (a === 'ctabc') { UI.ctabC = el.dataset.v; render(); window.scrollTo(0, 0); }
    else if (a === 'btab') { UI.btab = el.dataset.v; render(); }
    else if (a === 'bnew') { if (ACC.can('cassa') && !ACC.can('readonly')) buonoModal(); }
    else if (a === 'bsave') { if (ACC.can('cassa') && !ACC.can('readonly')) buonoSave(); }
    else if (a === 'bdet') buonoDet(el.dataset.id);
    else if (a === 'bmet') { if (UI.modal) UI.modal.met = el.dataset.k; $$('[data-act="bmet"]').forEach(x => x.setAttribute('aria-checked', String(x === el))); }
    else if (a === 'bsel') buonoPick(el.dataset.id);
    else if (a === 'bclr') { if (UI.pay) { UI.pay.f.buono = ''; render(); } }
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset && el.dataset.bq) { UI.bq = el.value; clearTimeout(el._t); el._t = setTimeout(render, 200); }
    else if (el.dataset && el.dataset.bpq && UI.pay) { UI.pay.f.bq = el.value; clearTimeout(el._t); el._t = setTimeout(() => { const box = $('#pp-buono'); if (box) { box.innerHTML = buonoPayHTML(UI.pay.f); const i = box.querySelector('[data-bpq]'); if (i) { i.focus(); i.selectionStart = i.selectionEnd = i.value.length; } } }, 150); }
  });

  // ---------- BIGLIETTERIA (2.1.6) ----------
  // Sezione a parte per i biglietti di concerti ed eventi venduti sui circuiti (TicketOne, Boxol, Vivaticket…).
  // Come il foglio CASSA e i fogli SOSPESI dell'agenzia:
  //  · ogni vendita ricorda il giorno in cui il biglietto è stato EMESSO sul circuito;
  //  · ogni incasso si attribuisce al giorno di quell'emissione, in qualsiasi agenzia venga fatto;
  //  · sospesi = emesso − incassato (biglietti emessi e non ancora pagati, compresi quelli comprati dall'agenzia);
  //  · TicketOne e B-Fast: ogni settimana (lunedì–domenica) l'addebito del portafoglio si confronta con le emissioni.
  // File (cartella /biglietteria/ dell'archivio):
  //  eventi.json   { eventi: { id: { nome, luogo, data, ora, circ, dir, settori:[{id,nome,intero,ridotto}], tripId, note } } }
  //  stock.json    { stock: { id: { evId, sett, circ, q, prezzo, emis, tripId, note } } }   biglietti comprati dall'agenzia
  //  addebiti.json { add: { "<circuito>|<lunedì>": { circ, week, data, importo } } }        addebiti settimanali
  //  vendite/aaaa-mm.json { ven: [ { evId, sett, circ, righe:[{tar,q,prezzo}], dir, nT, totTkt, totDir, tot, emis, stock, cliente, tel, tipo, rimb } ] }
  // Gli incassi sono normali movimenti di cassa (categoria TicketEdiritti o SoloTicket) con venId = la vendita.
  ICON.tkt = I('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v2M14 11v2M14 16v2"/>');
  ICON.search = I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>');
  const BGP = { ev: '/biglietteria/eventi.json', st: '/biglietteria/stock.json', add: '/biglietteria/addebiti.json', ven: mon => `/biglietteria/vendite/${mon}.json` };
  const CIRC_L = { 'T.OneRG': 'TicketOne RG', 'T.OneMD': 'TicketOne MD', BoxRG: 'Boxol RG', BoxMD: 'Boxol MD', Viva: 'Vivaticket', CiaoRG: 'CiaoTickets RG', CiaoMD: 'CiaoTickets MD', CiaoMDR: 'CiaoTickets MDR', LiveRG: 'LiveTicket RG', LiveMD: 'LiveTicket MD', 'B-Fast': 'B-Fast', 'On-Line': 'On-Line' };
  const CIRC_W = ['T.OneRG', 'T.OneMD', 'B-Fast'];   // circuiti con l'addebito settimanale del portafoglio
  const circL = c => CIRC_L[c] || c || '—';
  const circB = c => `<span class="bg-c c-${esc(String(c || '').replace(/[^a-z]/gi, ''))}">${esc(circL(c))}</span>`;
  const bgDirDef = c => (/^T\.One/.test(c) ? 2 : 3);
  const bgCan = () => ACC.can('cassa') && !ACC.can('readonly');
  const bgSee = () => ACC.can('cassa') || ACC.can('cassaAll');
  const bgEvents = () => Object.values((STORE.get(BGP.ev) || {}).eventi || {}).filter(e => e && e.id && !e.del);
  const bgEv = id => bgEvents().find(e => e.id === id);
  const bgStock = () => Object.values((STORE.get(BGP.st) || {}).stock || {}).filter(x => x && x.id && !x.del);
  const bgVend = () => STORE.list('/biglietteria/vendite/').flatMap(([, d]) => (d && d.ven) || []).filter(v => v && v.id && !v.del);
  const bgAdd = () => (STORE.get(BGP.add) || {}).add || {};
  function bgPutMap(path, key, obj) { const cur = JSON.parse(JSON.stringify(STORE.get(path) || {})); cur[key] = cur[key] || {}; obj.u = tick(); cur[key][obj.id] = obj; cur.u = obj.u; STORE.put(path, cur); }
  function bgPutVen(v) { v.u = tick(); const p = BGP.ven(v.day.slice(0, 7)); const cur = JSON.parse(JSON.stringify(STORE.get(p) || { ven: [] })); cur.ven = (cur.ven || []).filter(x => x.id !== v.id).concat([v]); cur.u = v.u; STORE.put(p, cur); }
  const evLbl = e => e ? `${e.nome}${e.luogo ? ' · ' + e.luogo.split('·')[0].trim() : ''} · ${fmtDate(e.data).slice(0, 5)}/${String(e.data).slice(2, 4)}` : 'evento tolto';
  const fmt2 = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // valore di un campo numerico: i numeri salvati con due decimali, quello che si sta scrivendo così com'è
  const bgNumV = v => (v === '' || v == null || (typeof v === 'number' && !v) ? '' : typeof v === 'number' ? esc(fmt2(v)) : esc(String(v)));
  const dd2 = iso => { const [y, m, d] = String(iso || '').split('-'); return d ? `${d}/${m}/${y.slice(2)}` : ''; };
  // ---- conti: pagato, sospeso, biglietti dell'agenzia ancora liberi ----
  function bgIdx() {
    const v = STORE.ver(); if (bgIdx.v === v && bgIdx.c) return bgIdx.c;
    const paid = new Map(), movs = allMovs(); const trSt = new Map();
    movs.forEach(m => {
      if (m.venId && m.tipo !== 'rimborso') paid.set(m.venId, r2((paid.get(m.venId) || 0) + (+m.tot || 0)));
      if (m.stock && m.tripId) { const k = m.stock + '|' + m.tripId + '|' + m.bkId + '|' + (m.pid || ''); trSt.set(k, Math.max(trSt.get(k) || 0, m.tipo === 'storno' ? 0 : (+m.nT || 0))); }
    });
    const used = new Map();
    bgVend().forEach(x => { if (x.stock && x.tipo !== 'rimborso') used.set(x.stock, (used.get(x.stock) || 0) + (+x.nT || 0) - (+x.rimb || 0)); });
    trSt.forEach((n, k) => { const s = k.split('|')[0]; used.set(s, (used.get(s) || 0) + n); });
    bgIdx.v = v; bgIdx.c = { paid, used, movs, trSt }; return bgIdx.c;
  }
  const venPaid = x => bgIdx().paid.get(x.id) || 0;
  const venQ = x => (+x.nT || 0) - (+x.rimb || 0);
  const venDue = x => (venQ(x) > 0 ? r2(x.tot - venPaid(x)) : 0);
  const venSosp = x => x.tipo !== 'rimborso' && venDue(x) > 0.009;
  const stLiberi = s => Math.max(0, (+s.q || 0) - (bgIdx().used.get(s.id) || 0));
  // biglietti dell'agenzia che una prenotazione del viaggio può ancora usare (quelli liberi + quelli che ha già)
  function bgStockAvail(sid, tripId, bkId, pid) { const s = bgStock().find(x => x.id === sid); if (!s) return 0; return stLiberi(s) + (bgIdx().trSt.get(sid + '|' + tripId + '|' + bkId + '|' + (pid || '')) || 0); }
  // ---- viaggi con il bus collegati a un evento (2.1.8) ----
  function bgTripEv(t) { return t ? bgEvents().filter(e => e.tripId === t.id).sort((a, b) => String(a.data).localeCompare(String(b.data)))[0] || null : null; }
  function bgTripOf(e) { return e && e.tripId ? S.trips.find(x => x.id === e.tripId) || null : null; }
  // biglietti nella lista del viaggio: quante persone hanno il biglietto, quante sono in prenotazioni non ancora saldate
  function bgTripTk(t) {
    const o = { n: 0, nS: 0, rest: 0, bks: [] }; if (!t) return o; const TK = tripTkt(t); if (!TK.sett.length) return o;
    deriveBookings(t).forEach(bk => { const m = bkMoney(t, bk); bk._m = m; const n = bk.persone.filter(p => personTkt(t, p, (m.per[bk.persone.indexOf(p)] || {}).tipo || 'ad', TK)).length; if (!n) return;
      o.n += n; if (!saldato(bk) && (m.rest == null || m.rest > 0.009)) { o.nS += n; o.rest = r2(o.rest + (m.rest || 0)); o.bks.push({ bk, n, rest: m.rest }); } });
    return o;
  }
  // riepilogo sotto i tipi di biglietto del viaggio collegato
  function bgTripInfo(t, e) {
    const S1 = bgStock().filter(s => s.evId === e.id); const q = S1.reduce((a, s) => a + (+s.q || 0), 0), lib = S1.reduce((a, s) => a + stLiberi(s), 0); const k = bgTripTk(t);
    return `<div class="tk-info"><span>Biglietti dell'agenzia: ${q ? `<b>${q}</b> comprati · <b>${lib}</b> liberi` : 'nessuno'}</span><span>Nella lista: <b>${k.n}</b> ${k.n === 1 ? 'biglietto' : 'biglietti'}${k.nS ? ` · <b class="neg">${k.nS}</b> non ancora saldati` : ''}</span>${bgCan() ? `<button class="btn sm ghost" data-act="tkunlink" title="Il viaggio non è più collegato all'evento: i prezzi restano scritti qui">${ICON.unlink || ''} Scollega</button>` : ''}</div>`;
  }
  // collegare un viaggio a un evento della Biglietteria (o crearne uno con i dati del viaggio)
  function bgLinkModal(t, keep) {
    if (!bgCan()) return toast('Il tuo account non può modificare la Biglietteria');
    const near = e => Math.abs(parseD(e.data) - parseD(t.data));
    const evs = bgEvents().filter(e => !bgTripOf(e) && (e.data >= todayISO() || e.data === t.data)).sort((a, b) => near(a) - near(b) || a.data.localeCompare(b.data));
    if (!keep) UI.modal = { kind: 'bglink', tripId: t.id, sel: (evs.find(e => e.data === t.data) || {}).id || 'new' };
    const M = UI.modal; const TK = tripTkt(t);
    const opt = (id, html) => `<button type="button" role="radio" class="bl-o" data-act="bglksel" data-id="${esc(id)}" aria-checked="${esc(M.sel === id)}">${html}</button>`;
    openModal('Collega alla Biglietteria', `<div class="bl">
      <p class="small">Il viaggio <b>${esc(t.nome)}</b> (${esc(fmtDate(t.data))}) diventa l'evento con il bus in Biglietteria: i tipi di biglietto, i diritti e il circuito saranno quelli dell'evento, e in Biglietteria vedrai anche i biglietti venduti con il bus e quelli non ancora pagati.</p>
      <div class="bl-l" role="radiogroup" aria-label="Evento">
        ${opt('new', `<b>${ICON.plus} Crea un nuovo evento con i dati di questo viaggio</b><small>${TK.sett.length ? esc(TK.sett.map(x => `${x.nome || 'Biglietto'} ${fmt2(+x.intero || 0)} €`).join(' · ')) : 'scrivi prima almeno un tipo di biglietto con il prezzo'}</small>`)}
        ${evs.map(e => opt(e.id, `<b>${esc(fmtDate(e.data))} · ${esc(e.nome)}</b><small>${esc(circL(e.circ))} · ${esc((e.settori || []).map(x => `${x.nome} ${fmt2(+x.intero || 0)} €`).join(' · '))}</small>`)).join('')}
      </div>
      ${evs.length ? '' : '<div class="small">In Biglietteria non ci sono altri eventi liberi da collegare.</div>'}
      <div class="small bl-n">Nella colonna «fila» della lista scrivi il nome del settore (es. «Parterre»): così ognuno paga il biglietto giusto.${t.tkFila ? '' : ' <b>Collegando, il biglietto si somma solo a chi ha la fila scritta</b> (regola della 2.1.8).'}</div></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="bglksave">Collega</button>`);
  }
  function bgLinkSave() {
    const M = UI.modal; const t = S.trips.find(x => x.id === M.tripId); if (!t) return closeModal();
    if (bgTripEv(t)) { closeModal(); return toast('Il viaggio è già collegato a un evento'); }
    let E;
    if (M.sel === 'new') {
      const TK = tripTkt(t); const sett = TK.sett.filter(x => (+x.intero || 0) > 0 || (+x.ridotto || 0) > 0);
      if (!sett.length) return toast('Scrivi prima almeno un tipo di biglietto con il prezzo, in alto nella lista');
      const circ = TK.circ || 'T.OneRG';
      E = { id: 'e' + uid(), nome: t.nome, luogo: '', data: t.data, ora: '', circ, dir: t.quota.diritti != null && t.quota.diritti !== '' ? +t.quota.diritti || 0 : bgDirDef(circ), settori: sett.map(x => ({ id: 's' + uid(), nome: x.nome || 'Biglietto', intero: r2(+x.intero || 0), ridotto: r2(+x.ridotto || 0) })), tripId: t.id, note: '' };
    } else { const e = bgEv(M.sel); if (!e || bgTripOf(e)) return toast('Scegli l\'evento'); E = Object.assign(JSON.parse(JSON.stringify(e)), { tripId: t.id }); }
    if (!t.tkFila) t.tkFila = true; save();
    bgPutMap(BGP.ev, 'eventi', E); ACC.tlog('info', `Biglietteria · viaggio «${t.nome}» collegato all'evento ${E.nome} (${E.data})`);
    closeModal(); render(); toast(`Collegato a «${E.nome}»: i prezzi del biglietto ora sono quelli della Biglietteria`);
  }
  // scollegare: l'evento resta in Biglietteria, i prezzi si copiano nel viaggio
  function bgUnlink(t) {
    const e = bgTripEv(t); if (!e || !bgCan()) return;
    confirmBox('Scollega dalla Biglietteria', `Il viaggio <b>${esc(t.nome)}</b> non sarà più collegato all'evento <b>${esc(e.nome)}</b>. I tipi di biglietto restano scritti nella lista.`, 'Scollega', () => {
      bgCopyPrices(e, t);
      bgPutMap(BGP.ev, 'eventi', Object.assign({}, e, { tripId: '' })); ACC.tlog('avviso', `Biglietteria · viaggio «${t.nome}» scollegato dall'evento ${e.nome}`); commit(); toast('Scollegato'); });
  }
  // i prezzi dell'evento si copiano nel viaggio quando si scollega (così le quote non cambiano)
  function bgCopyPrices(e, t) { tripInit(t); t.quota.tsett = (e.settori || []).map(x => ({ id: uid(), nome: x.nome, intero: +x.intero || null, ridotto: +x.ridotto || null })); t.quota.diritti = +e.dir || 0; t.quota.circuito = e.circ || ''; }
  // ---- vendere biglietto + bus dalla Biglietteria: il cliente entra nella lista del viaggio (2.1.8) ----
  function bgBusModal(evId, keep) {
    const e = bgEv(evId); const t = bgTripOf(e); if (!e || !t) return;
    if (tripCat(t) !== 'evento') return toast(`«${t.nome}» non è un evento: apri il viaggio e cambia il tipo in «Evento» (Modifica gita)`);
    if (!keep) UI.modal = { kind: 'bgbus', evId, n: 1, pp: [{ cognome: '', nome: '' }], tel: '', sett: ((e.settori || [])[0] || {}).nome || '', emis: todayISO() };
    const M = UI.modal; const OV = overCap(t); const free = OV.free;
    while (M.pp.length < M.n) M.pp.push({ cognome: '', nome: '' }); M.pp.length = M.n;
    openModal('Vendi biglietto + bus', `<div class="bge bgb">
      <div class="bg-busi">${ICON.bus}<span><b>${esc(t.nome)}</b> · ${esc(fmtDate(t.data))}<br><small>${t.buses.length ? `${OV.cap} posti sul bus · <b>${free}</b> ${free === 1 ? 'libero' : 'liberi'}` : 'il viaggio non ha ancora un bus'}</small></span></div>
      ${t.chiusa ? `<div class="warnbox small">${esc(closedMsg(t))}: non si possono aggiungere prenotazioni.</div>` : !t.buses.length || free <= 0 ? `<div class="warnbox small">${ICON.alert} Posti finiti: aggiungi un bus al viaggio prima di vendere altri pacchetti biglietto + bus.</div>` : `
      <div class="grid2"><div class="field"><label for="bgb-n">Quante persone</label><input id="bgb-n" data-bgb="n" class="pay-imp" inputmode="numeric" value="${esc(M.n)}" style="max-width:120px"></div><div class="field"><label for="bgb-t">Telefono</label><input id="bgb-t" data-bgb="tel" inputmode="tel" value="${esc(M.tel)}" autocomplete="off" placeholder="facoltativo"></div></div>
      <div class="field"><label>Nomi</label><div class="bgb-pp">${M.pp.map((p, i) => `<div class="bgb-p"><span>${i + 1}</span><input data-bgbp="${i}" data-k="cognome" value="${esc(p.cognome)}" placeholder="${esc(i ? 'Cognome (se diverso)' : 'Cognome')}" aria-label="Cognome ${i + 1}" autocomplete="off"><input data-bgbp="${i}" data-k="nome" value="${esc(p.nome)}" placeholder="Nome" aria-label="Nome ${i + 1}" autocomplete="off"></div>`).join('')}</div></div>
      <div class="field"><label>Biglietto</label><div class="bg-chips">${(e.settori || []).map(x => `<button type="button" data-act="bgbset" data-v="${esc(x.nome)}" aria-pressed="${esc(M.sett === x.nome)}">${esc(x.nome)} <small>${esc(fmt2(+x.intero || 0))} €${x.ridotto ? ' · rid. ' + esc(fmt2(+x.ridotto)) + ' €' : ''}</small></button>`).join('')}</div></div>
      <div class="grid2"><div class="field"><label for="bgb-d">Biglietti emessi il</label><input id="bgb-d" type="date" data-bgb="emis" value="${esc(M.emis)}"></div><div></div></div>
      <div class="small">Le persone entrano nella lista del viaggio con la fila «${esc(M.sett)}» e la data di emissione; poi si apre l'incasso con bus + biglietto. ${M.n > free ? `<b class="neg">Restano solo ${free} posti.</b>` : ''}</div>`}</div>`,
      `<button class="btn" data-act="close">Annulla</button>${!t.chiusa && t.buses.length && free > 0 ? `<button class="btn primary" data-act="bgbsave">Metti in lista e incassa</button>` : `<button class="btn" data-act="bgbusopen" data-id="${esc(t.id)}">Apri il viaggio</button>`}`);
  }
  function bgBusSave() {
    const M = UI.modal; const e = bgEv(M.evId); const t = bgTripOf(e); if (!e || !t || tripCat(t) !== 'evento') return closeModal();
    if (t.chiusa) return toast(closedMsg(t)); const n = M.n;
    // chi non ha il cognome prende quello della prima persona (famiglie)
    const c0 = String((M.pp[0] || {}).cognome || '').trim(); if (!c0) return toast('Scrivi il cognome della prima persona');
    const pp = M.pp.map(p => ({ cognome: String(p.cognome || '').trim() || c0, nome: String(p.nome || '').trim() }));
    const OV = overCap(t); if (n > OV.free) return toast(OV.free ? `Sul bus restano solo ${OV.free} posti` : 'Posti finiti: aggiungi un bus al viaggio');
    const iso = M.emis || todayISO(); const em = `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
    // in quale lista: con più bus quella che ha abbastanza posti liberi, altrimenti «Senza bus»
    let lk = ''; if (multiBus(t)) { const b = t.buses.find(b => busCap(b) - listLoad(t, b.id) >= n); lk = b ? b.id : ''; }
    // il capogruppo ha sempre «x N» (anche «x 1»): così non entra mai in una comitiva sopra che aspetta ancora dei nomi
    const rows = pp.map((p, i) => Object.assign(blankRow(), { cognome: i === 0 ? `${p.cognome} x ${n}` : p.cognome, nome: p.nome, tel: i === 0 ? String(M.tel || '').trim() : '', fila: M.sett, emis: em }, lk ? { bus: lk } : {}));
    // dopo l'ultima riga scritta e dopo le righe riservate ai nomi che mancano delle comitive di quella lista
    const ix = new Map(t.rows.map((r, i) => [r.id, i])); let at = -1; t.rows.forEach((r, i) => { if (!isEmptyRow(r) && (!multiBus(t) || listKey(t, r) === lk)) at = i; });
    deriveBookings(t).forEach(bk => { if (multiBus(t) && listKey(t, bk.head) !== lk) return; const j = ix.get(bk.last); if (j != null && j > at) at = j; });
    if (at < 0 && lk) { at = t.rows.findIndex(r => listKey(t, r) === lk) - 1; if (at < -1) at = t.rows.length - 1; }
    t.rows.splice(at + 1, 0, ...rows); ensureBlank(t);
    ACC.tlog('info', `Biglietteria · biglietto + bus: ${rows[0].cognome} ${pp[0].nome} (${n} ${n === 1 ? 'persona' : 'persone'}, ${M.sett}) nella lista di «${t.nome}»`);
    closeModal(); UI.view = 'trip'; UI.tripId = t.id; UI.sec = 'lista'; UI.lsel = []; UI.lview = 'all'; UI.sel = UI.selP = null; UI.busId = t.buses[0] ? t.buses[0].id : null;
    (UI.flash = UI.flash || {}); rows.forEach(r => { UI.flash[r.id] = { at: Date.now(), by: 'Biglietteria' }; });
    commit(); window.scrollTo(0, 0); payOpen(rows[0].id);
  }
  // ---- controllo per circuito: emesso, incassato per agenzia (per giorno di emissione), sospesi ----
  function bgCtl(circ) {
    const E = {}, add = (d, k, a, n, ag) => { const o = E[d] = E[d] || { em: 0, emN: 0, inc: {}, incN: {} }; if (k === 'em') { o.em = r2(o.em + a); o.emN += n; } else { o.inc[ag] = r2((o.inc[ag] || 0) + a); o.incN[ag] = (o.incN[ag] || 0) + n; } };
    const V = new Map(bgVend().map(x => [x.id, x])), ST = new Map(bgStock().map(s => [s.id, s]));
    V.forEach(x => { if (x.circ !== circ || x.stock || x.tipo === 'rimborso') return; add(x.emis, 'em', +x.totTkt || 0, +x.nT || 0); });
    ST.forEach(s => { if (s.circ === circ) add(s.emis, 'em', r2((+s.q || 0) * (+s.prezzo || 0)), +s.q || 0); });
    bgIdx().movs.forEach(m => {
      const b = +m.biglietti || 0; if (!b) return; let c, d;
      if (m.venId) { const x = V.get(m.venId); if (!x) return; c = x.circ; const s = x.stock && ST.get(x.stock); d = s ? s.emis : x.emis; }
      else if (m.circuito && m.tripId) { c = m.circuito; d = m.emis || m.day; if (!m.ant && !m.stock && m.tipo !== 'storno') add(d, 'em', b, +m.nT || 0); if (m.stock) { const s = ST.get(m.stock); if (s) d = s.emis; } }
      else return;
      if (c !== circ) return; const tb = x => (x && +x.totTkt) || 0; const x = m.venId && V.get(m.venId);
      const n = x && tb(x) ? Math.round((+x.nT || 0) * b / tb(x)) : (+m.nT || 0) * Math.sign(b);
      add(d, 'inc', b, n, m.ag || '');
    });
    return E;
  }
  const monday = iso => { const d = parseD(iso); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return dayISO(d); };
  const addDays = (iso, n) => { const d = parseD(iso); d.setDate(d.getDate() + n); return dayISO(d); };

  // ---- vista ----
  const BG_TABS = [['vendita', 'Vendita', 'tkt'], ['sospesi', 'Sospesi', 'clock'], ['eventi', 'Eventi', 'star'], ['agenzia', 'Biglietti dell\'agenzia', 'bus'], ['controllo', 'Controllo circuiti', 'check']];
  const bgS = () => (UI.bg = UI.bg || { tab: 'vendita', q: {}, pr: {}, src: 'new', emis: todayISO(), ccirc: 'T.OneRG', week: monday(todayISO()) });
  function bglView() {
    if (!bgSee()) return '<div class="infobox">La biglietteria non è disponibile per il tuo account.</div>';
    const st = bgS(); const nS = bgVend().filter(venSosp).length;
    const tabs = `<div class="seg bg-tabs" role="tablist" aria-label="Biglietteria">${BG_TABS.map(([k, l, ic]) => `<button role="tab" data-act="bgtab" data-v="${esc(k)}" aria-pressed="${esc(st.tab === k)}">${ICON[ic]}<span>${l}${k === 'sospesi' && nS ? ` <i>${nS}</i>` : ''}</span></button>`).join('')}</div>`;
    const V = { vendita: bgVendita, sospesi: bgSospesi, eventi: bgEventi, agenzia: bgAgenzia, controllo: bgControllo };
    return (V[st.tab] || bgVendita)(tabs);
  }
  const bgHead = (sub, btns) => `<div class="pagehead"><div><h1>Biglietteria</h1><div class="sub">${sub}</div></div><div class="hbtns">${btns || ''}</div></div>`;
  // ---- Vendita ----
  function bgVendita(tabs) {
    const st = bgS(); const today = todayISO(); const ag = ACC.sess.ag;
    const L = bgVend().filter(x => x.day === today && (!ag || ACC.can('cassaAll') || x.ag === ag)).sort((a, b) => b.at.localeCompare(a.at));
    const em = L.filter(x => x.tipo !== 'rimborso'); const nT = em.reduce((a, x) => a + (+x.nT || 0), 0); const tot = r2(em.reduce((a, x) => a + x.tot, 0));
    const inc = r2(em.reduce((a, x) => a + venPaid(x), 0)); const sos = r2(em.reduce((a, x) => a + venDue(x), 0)); const dir = r2(em.reduce((a, x) => a + (+x.totDir || 0), 0));
    const evs = bgEvents().filter(e => e.data >= today).sort((a, b) => a.data.localeCompare(b.data));
    const e = st.evId && bgEv(st.evId); const sett = e && (e.settori || []).find(s => s.id === st.sett);
    // i biglietti dell'agenzia comprati per un viaggio con il bus restano per il bus (si danno dalla lista del viaggio)
    const stk = e && sett ? bgStock().filter(s => s.evId === e.id && s.sett === sett.nome && stLiberi(s) > 0 && !(s.tripId && S.trips.some(x => x.id === s.tripId))) : [];
    const eT0 = e && bgTripOf(e); const eT = eT0 && tripCat(eT0) === 'evento' ? eT0 : null; const eOV = eT ? overCap(eT) : null;
    if (st.src === 'stock' && !stk.length) st.src = 'new';
    const SK = st.src === 'stock' ? stk.find(s => s.id === st.stockId) || stk[0] : null; if (SK) st.stockId = SK.id;
    const tar = sett ? [['Intero', sett.intero], ...(sett.ridotto ? [[sett.ridottoL || 'Ridotto', sett.ridotto]] : [])] : [];
    const dirV = e ? (st.dirV != null ? st.dirV : +e.dir || 0) : 0;
    const rows = tar.map(([l, p]) => { const q = +(st.q[l] || 0); const pr = SK ? +SK.prezzo : (st.pr[l] != null ? +st.pr[l] : +p); return { l, q, pr }; });
    const nq = rows.reduce((a, r) => a + r.q, 0), tTkt = r2(rows.reduce((a, r) => a + r.q * r.pr, 0)), tDir = r2(nq * dirV), T = r2(tTkt + tDir);
    const q = String(st.evq || '').trim().toLowerCase();
    const evList = !e ? evs.filter(x => !q || [x.nome, x.luogo, circL(x.circ)].some(v => String(v || '').toLowerCase().includes(q))).slice(0, 8) : [];
    const canSell = bgCan() && ag;
    const form = `<section class="box bg-new" aria-label="Nuova vendita"><h2>Nuova vendita</h2>
      ${e ? `<div class="bg-f"><span class="bg-l">Evento</span><div class="bg-sel on"><span><b>${esc(e.nome)}</b>${e.luogo ? ' · ' + esc(e.luogo) : ''} · ${esc(fmtDate(e.data, true))}${e.ora ? ' ore ' + esc(e.ora) : ''}</span>${circB(e.circ)}<button class="btn sm ghost" data-act="bgevclr">Cambia</button></div></div>`
        : `<label class="bg-f">Evento<div class="bg-sel">${ICON.search}<input data-bgq="1" value="${esc(st.evq || '')}" placeholder="scrivi il nome dell'evento o il luogo" autocomplete="off"></div></label>
        <div class="bu-list">${evList.map(x => `<button type="button" data-act="bgevpick" data-id="${esc(x.id)}"><b>${esc(dd2(x.data))}</b><span>${esc(x.nome)}${x.luogo ? ' · ' + esc(x.luogo) : ''}</span>${circB(x.circ)}</button>`).join('') || `<div class="small">${evs.length ? 'Nessun evento trovato.' : 'Nessun evento in vendita.'} Crealo nella scheda «Eventi».</div>`}</div>`}
      ${eT ? `<div class="bg-bus">${ICON.bus}<span>Con il bus: <b>${esc(eT.nome)}</b><br><small>${eT.buses.length ? (eOV.free > 0 ? `<b>${eOV.free}</b> ${eOV.free === 1 ? 'posto libero' : 'posti liberi'} sul bus` : '<b class="neg">posti finiti</b>') : 'il viaggio non ha ancora un bus'}${eT.chiusa ? ' · lista chiusa' : ''}</small></span><button type="button" class="btn sm primary" data-act="bgbus" data-id="${esc(e.id)}"${canSell && !eT.chiusa && eT.buses.length && eOV.free > 0 ? '' : ' disabled'}>${ICON.plus} Vendi biglietto + bus</button></div><div class="small">Qui sotto: solo il biglietto, senza il bus.</div>` : ''}
      ${e ? `<div class="bg-f"><span class="bg-l">Settore</span><div class="bg-chips">${(e.settori || []).map(s => `<button type="button" data-act="bgsett" data-id="${esc(s.id)}" aria-pressed="${esc(st.sett === s.id)}">${esc(s.nome)} <small>${esc(fmt2(+s.intero || 0))} €${s.ridotto ? ' · rid. ' + esc(fmt2(+s.ridotto)) + ' €' : ''}</small></button>`).join('') || '<span class="small">L\'evento non ha settori: aggiungili in «Eventi».</span>'}</div></div>` : ''}
      ${sett && stk.length ? `<div class="bg-f"><span class="bg-l">Da dove viene il biglietto</span><div class="seg bg-src"><button type="button" data-act="bgsrc" data-v="new" aria-pressed="${esc(st.src !== 'stock')}">Emetti un biglietto nuovo</button>${stk.map(s => `<button type="button" data-act="bgsrc" data-v="stock" data-id="${esc(s.id)}" aria-pressed="${esc(!!SK && SK.id === s.id)}">Biglietto dell'agenzia <small>${stLiberi(s)} liberi · emessi il ${esc(dd2(s.emis))}</small></button>`).join('')}</div></div>` : ''}
      ${sett ? `<table class="bg-tar"><thead><tr><th>Tariffa</th><th>Quantità</th><th class="r">Prezzo</th><th class="r">Diritti</th><th class="r">Totale</th></tr></thead><tbody>
        ${rows.map(r => `<tr${r.q ? '' : ' class="off"'}><td>${esc(r.l)}</td><td><input class="bg-q" data-bgqt="${esc(r.l)}" inputmode="numeric" value="${esc(r.q || '')}" placeholder="0" aria-label="Quantità ${esc(r.l)}"></td><td class="r"><input class="bg-p" data-bgpr="${esc(r.l)}" inputmode="decimal" value="${esc(fmt2(r.pr))}"${SK ? ' disabled' : ''} aria-label="Prezzo ${esc(r.l)}"></td><td class="r">${esc(fmt2(dirV))} €</td><td class="r" id="bgt-${esc(r.l.replace(/\W/g, ''))}">${r.q ? `<b>${money(r.q * (r.pr + dirV))}</b>` : '—'}</td></tr>`).join('')}</tbody></table>
        <div class="bg-g3"><label class="bg-f">Cliente<input data-bgf="cliente" value="${esc(st.cliente || '')}" placeholder="Cognome e nome" autocomplete="off"></label><label class="bg-f">Telefono<input data-bgf="tel" value="${esc(st.tel || '')}" inputmode="tel" autocomplete="off" placeholder="facoltativo"></label><label class="bg-f">Emesso sul circuito il<input type="date" data-bgf="emis" value="${esc(SK ? SK.emis : st.emis || today)}"${SK ? ' disabled' : ''}></label></div>
        <label class="bg-f">Diritti di prevendita a biglietto €<input class="bg-p sm" data-bgf="dirV" inputmode="decimal" value="${esc(fmt2(dirV))}"></label>
        <div class="bg-sum" id="bg-sum">${bgSumHTML(nq, tTkt, tDir, T)}</div>
        ${canSell ? `<div class="bg-act"><button class="btn primary big" data-act="bgsell" data-k="pay"${nq ? '' : ' disabled'}>${ICON.euro} Incassa${T ? ' ' + money(T) : ''}</button><button class="btn big" data-act="bgsell" data-k="sosp"${nq ? '' : ' disabled'}>${ICON.clock} Emesso, non pagato (sospeso)</button></div>` : `<div class="small">${ag ? 'Il tuo account può solo consultare.' : 'Per vendere scegli l\'agenzia in cui lavori (in alto).'}</div>`}
        <div class="small">«Incassa» registra la vendita e apre l'incasso (contanti, POS, misto, buono regalo…). «Sospeso» la mette tra i sospesi finché il cliente non paga.</div>` : ''}
    </section>`;
    const list = `<section class="box tablecard bg-today"><h2 class="ch">Vendite di oggi</h2><div class="tscroll"><table class="rt"><thead><tr><th>Ora</th><th>Cliente</th><th>Evento e settore</th><th class="r">Totale</th><th></th><th></th></tr></thead><tbody>
      ${L.map(x => `<tr${x.tipo === 'rimborso' ? ' class="neg"' : ''}><td>${esc(hm(x.at))}</td><td><b>${esc(x.cliente || '—')}</b><br><small>${esc((x.righe || []).filter(r => r.q).map(r => `${r.q} ${r.tar.toLowerCase()}`).join(' + '))}${x.rimb ? ' · ' + esc(x.rimb) + ' rimborsati' : ''}</small></td><td>${esc(evLbl(bgEv(x.evId)) || x.evN)}<br><small>${esc(x.sett || '')} · ${esc(circL(x.circ))}${x.stock ? ' · dell\'agenzia' : ''}</small></td><td class="r"><b>${money(x.tot)}</b></td><td>${venSosp(x) ? '<span class="pill tbd">sospeso</span>' : venQ(x) <= 0 ? '<span class="pill neutral">rimborsato</span>' : '<span class="pill ok">pagato</span>'}</td><td class="r"><button class="kebab" data-act="bgvmenu" data-id="${esc(x.id)}" aria-label="Azioni">⋯</button></td></tr>`).join('') || '<tr><td colspan="6" class="emptyrow">Nessuna vendita oggi</td></tr>'}
    </tbody></table></div></section>`;
    return `${bgHead(`${esc(agName(ag) || 'tutte le agenzie')} · ${esc(fmtDate(today, true))}${ACC.me() ? ' · ' + esc(ACC.me().name) : ''}`)}${tabs}
      <div class="tiles"><div class="tile dark"><span>Emessi oggi</span><b>${nT} ${nT === 1 ? 'biglietto' : 'biglietti'}</b><small>${money(tot)} con i diritti · ${em.length} ${em.length === 1 ? 'vendita' : 'vendite'}</small></div><div class="tile"><span>Incassati</span><b>${money(inc)}</b><small>biglietti e diritti</small></div><div class="tile"><span>Sospesi di oggi</span><b${sos ? ' class="neg"' : ''}>${money(sos)}</b><small>da incassare</small></div><div class="tile"><span>Diritti di prevendita</span><b>${money(dir)}</b><small>parte dell'agenzia</small></div></div>
      <div class="bg-two">${form}${list}</div>`;
  }
  const bgSumHTML = (n, tk, di, T) => `<div><span>Biglietti (${n})</span><b>${money(tk)}</b></div><div><span>Diritti di prevendita</span><b>${money(di)}</b></div><div class="tot"><span>Totale</span><b>${money(T)}</b></div><div class="ag"><span>Nello scontrino (solo i diritti, parte agenzia)</span><b>${money(di)}</b></div>`;
  function bgRecalc() {
    const st = bgS(); const e = st.evId && bgEv(st.evId); const sett = e && (e.settori || []).find(s => s.id === st.sett); if (!sett) return;
    const SK = st.src === 'stock' && bgStock().find(s => s.id === st.stockId);
    const dirV = st.dirV != null ? +st.dirV : +e.dir || 0;
    const tar = [['Intero', sett.intero], ...(sett.ridotto ? [[sett.ridottoL || 'Ridotto', sett.ridotto]] : [])];
    let n = 0, tk = 0; tar.forEach(([l, p]) => { const q = +(st.q[l] || 0); const pr = SK ? +SK.prezzo : (st.pr[l] != null ? +st.pr[l] : +p); n += q; tk += q * pr; const c = $('#bgt-' + l.replace(/\W/g, '')); if (c) c.innerHTML = q ? `<b>${money(q * (pr + dirV))}</b>` : '—'; });
    tk = r2(tk); const di = r2(n * dirV); const box = $('#bg-sum'); if (box) box.innerHTML = bgSumHTML(n, tk, di, r2(tk + di));
    $$('[data-act="bgsell"]').forEach(b => { b.disabled = !n; if (b.dataset.k === 'pay') b.innerHTML = `${ICON.euro} Incassa${n ? ' ' + money(r2(tk + di)) : ''}`; });
  }
  function bgSell(k) {
    const st = bgS(); const e = bgEv(st.evId); const sett = e && (e.settori || []).find(s => s.id === st.sett); if (!e || !sett) return toast('Scegli evento e settore');
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia in cui lavori (in alto)');
    const SK = st.src === 'stock' && bgStock().find(s => s.id === st.stockId);
    const dirV = st.dirV != null ? +st.dirV : +e.dir || 0;
    const tar = [['Intero', sett.intero], ...(sett.ridotto ? [[sett.ridottoL || 'Ridotto', sett.ridotto]] : [])];
    const righe = tar.map(([l, p]) => ({ tar: l, q: +(st.q[l] || 0), prezzo: r2(SK ? +SK.prezzo : (st.pr[l] != null ? +st.pr[l] : +p)) })).filter(r => r.q > 0);
    const nT = righe.reduce((a, r) => a + r.q, 0); if (!nT) return toast('Scrivi quanti biglietti');
    if (SK && nT > stLiberi(SK)) return toast(`Dell'agenzia restano solo ${stLiberi(SK)} biglietti liberi`);
    const cliente = String(st.cliente || '').trim(); if (!cliente) return toast('Scrivi il nome del cliente');
    const emis = SK ? SK.emis : (st.emis || todayISO());
    const totTkt = r2(righe.reduce((a, r) => a + r.q * r.prezzo, 0)), totDir = r2(nT * dirV);
    const d = new Date(); const me = ACC.me();
    const v = { id: 'v' + uid(), at: d.toISOString(), day: dayISO(d), who: me.name, uid: ACC.sess.uid, ag: ACC.sess.ag, dev: STORE.device.id, evId: e.id, evN: e.nome, evD: e.data, sett: sett.nome, circ: e.circ, righe, dir: dirV, nT, totTkt, totDir, tot: r2(totTkt + totDir), emis, stock: SK ? SK.id : '', cliente: cliente.toUpperCase(), tel: String(st.tel || '').trim(), tipo: 'vendita' };
    bgPutVen(v);
    ACC.tlog('info', `Biglietteria · ${nT} ${nT === 1 ? 'biglietto' : 'biglietti'} ${e.nome} (${sett.nome}) · ${v.cliente} · ${money(v.tot)} · ${k === 'pay' ? 'da incassare adesso' : 'sospeso'}${SK ? ' · dell\'agenzia' : ''}`);
    UI.bg = Object.assign(bgS(), { q: {}, pr: {}, cliente: '', tel: '', dirV: null, src: 'new' });
    render();
    if (k === 'pay') bgPayModal(v.id); else toast(`Registrato come sospeso: ${v.cliente} · ${money(v.tot)}`);
  }
  // ---- incasso di una vendita (finestra come quella del viaggio, più semplice) ----
  function bgPayModal(id, keep) {
    const x = bgVend().find(v => v.id === id); if (!x) return; const due = venDue(x);
    if (!keep) UI.modal = { kind: 'bgpay', id, met: 'contanti', doc: x.totDir > 0 ? 'scontrino' : 'nessuno', imp: due > 0 ? due : x.tot, mix: {}, buono: '', note: '' };
    const M = UI.modal; const isMix = M.met === 'misto'; const bpart = M.met === 'buono' ? +M.imp || 0 : isMix ? +M.mix.buono || 0 : 0;
    const buoni = buoniAll().map(b => Object.assign({}, b, { res: buonoRes(b) })).filter(b => b.res > 0.009);
    openModal(`Incasso biglietti · ${esc(x.cliente)}`, `<div class="bgp">
      <div class="bgp-ev"><b>${esc(x.evN)}</b> · ${esc(x.sett)} · ${esc(circL(x.circ))}<br><small>${esc((x.righe || []).map(r => `${r.q} ${r.tar.toLowerCase()} × ${fmt2(r.prezzo)} €`).join(' + '))} + diritti ${esc(fmt2(x.dir))} € a biglietto · emessi il ${esc(dd2(x.emis))}</small></div>
      <div class="pay-sum"><div><span>Totale</span><b>${money(x.tot)}</b></div><div><span>Già pagato</span><b>${money(venPaid(x))}</b></div><div class="hi"><span>Da pagare</span><b>${money(due)}</b></div></div>
      <div class="pp-sec"><span class="pp-l">Documento</span><div class="seg" role="radiogroup">${[['scontrino', 'Scontrino (diritti)'], ['nessuno', 'Senza documento']].map(([k, l]) => `<button type="button" data-act="bgpdoc" data-k="${esc(k)}" aria-pressed="${esc(M.doc === k)}">${l}</button>`).join('')}</div></div>
      <div class="pp-sec"><span class="pp-l">Incassato adesso</span><input class="pay-imp" data-bgp="imp" inputmode="decimal" value="${M.imp ? esc(fmt2(+M.imp)) : ''}" placeholder="0,00"></div>
      <div class="pay-met" role="radiogroup">${[...METODI, ['misto', 'Misto']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${esc(M.met === k)}" data-act="bgpmet" data-k="${esc(k)}">${l}</button>`).join('')}</div>
      ${isMix ? `<div class="pp-mix">${METODI.map(([k, l]) => `<div class="pay-row"><span>${l}</span><input data-bgpm="${esc(k)}" inputmode="decimal" value="${M.mix[k] ? esc(fmt2(M.mix[k])) : ''}" placeholder="0,00"></div>`).join('')}</div>` : ''}
      ${M.met === 'buono' || bpart ? `<label class="bg-f">Buono regalo<select data-bgp="buono"><option value="">— scegli il buono —</option>${buoni.map(b => `<option value="${esc(b.id)}"${M.buono === b.id ? ' selected' : ''}>${esc(b.num)} · ${esc(b.dest || '')} · ${esc(money(b.res))}</option>`).join('')}</select></label>` : ''}
      <label class="bg-f">Note pratica<input data-bgp="note" value="${esc(M.note || '')}" autocomplete="off"></label>
      <div class="small">Registrato da <b>${esc(ACC.me().name)}</b> · <b>${esc(agName(ACC.sess.ag))}</b> · ${esc(cassaName(ACC.sess.ag))}</div></div>`,
      `<button class="btn" data-act="close">Più tardi (resta sospeso)</button><button class="btn primary" data-act="bgpsave">${M.doc === 'scontrino' ? ICON.print + ' Scontrino' : 'Registra'} · ${money(+M.imp || 0)}</button>`);
  }
  function bgPaySave() {
    const M = UI.modal; const x = bgVend().find(v => v.id === M.id); if (!x) return closeModal();
    if (!ACC.sess.ag) return toast('Scegli prima l\'agenzia in cui lavori (in alto)');
    const imp = r2(+M.imp || 0); if (imp <= 0) return toast('Scrivi l\'importo incassato adesso');
    let parts;
    if (M.met === 'misto') { parts = METODI.map(([k]) => ({ m: k, a: r2(+M.mix[k] || 0) })).filter(p => p.a > 0); const s = r2(parts.reduce((a, p) => a + p.a, 0)); if (parts.length < 2) return toast('Nel pagamento misto scrivi almeno due metodi'); if (Math.abs(s - imp) > 0.009) return toast(`I metodi fanno ${money(s)}, l'importo è ${money(imp)}`); }
    else parts = [{ m: M.met, a: imp }];
    { const bErr = buonoCheck({ buono: M.buono }, parts); if (bErr) return toast(bErr); }
    const agz = x.tot > 0 ? r2(imp * x.totDir / x.tot) : 0; const SK = x.stock && bgStock().find(s => s.id === x.stock);
    const mv = addMov({ venId: x.id, cliente: x.cliente, tel: x.tel, doc: M.doc, docStato: M.doc === 'scontrino' ? 'da_emettere' : '', cat: x.totDir > 0 ? 'TicketEdiritti' : 'SoloTicket', desc: `${dd2(x.evD)} ${x.evN}`.toLowerCase(), circuito: x.circ, emis: SK ? SK.emis : x.emis, ant: !!SK || x.emis !== dayISO(new Date()),
      rt: M.doc === 'scontrino' ? { chiusura: '', numero: '', dataOra: '', matricola: '', esito: '' } : undefined, lines: (x.righe || []).map(r => ({ l: r.tar, q: r.q, bus: 0, tkt: r.prezzo })), suppl: 0, dir: x.dir, nT: x.nT, docTot: x.tot, agenzia: agz, biglietti: r2(imp - agz), note: M.note || '', parts, sigla: sigla(ACC.sess.uid, ACC.me().name) });
    ACC.tlog('info', `Biglietteria · incasso ${money(mv.tot)} (${parts.map(p => MET_L[p.m]).join(' + ')}) · ${x.cliente} · ${x.evN}`);
    closeModal(); render();
    const msg = `Incasso registrato: ${money(mv.tot)} · ${x.cliente}`;
    if (M.doc === 'scontrino') fiscalPrint(mv).then(r => toast(msg + (r.ok ? ' · scontrino emesso' : ` · scontrino dei diritti da emettere (${r.msg})`))); else toast(msg);
  }
  // ---- menu di una vendita: incassa, rimborso, cambio nome, annulla ----
  function bgVenMenu(id, el) {
    const x = bgVend().find(v => v.id === id); if (!x) return; const paid = venPaid(x);
    const B = (act, ico, txt, cls = '') => `<button class="${esc(cls)}" data-act="${esc(act)}" data-id="${esc(id)}">${ico}<span>${txt}</span></button>`;
    let h = `<div class="ph"><b>${esc(x.cliente)}</b><span>${esc(x.evN)} · ${esc(x.sett)} · ${venQ(x)} ${venQ(x) === 1 ? 'biglietto' : 'biglietti'}</span></div>`;
    if (bgCan()) {
      h += `<div class="pm-sec">${venSosp(x) ? B('bgvpay', ICON.euro, `Incassa <small>da pagare ${money(venDue(x))}</small>`) : ''}${x.tipo !== 'cambio' && venQ(x) > 0 ? B('bgvcambio', ICON.edit, 'Cambio nome <small>5,00 € + 5,00 € di diritti (si può cambiare)</small>') : ''}</div>`;
      h += `<div class="pm-sec">${paid > 0.009 && venQ(x) > 0 ? B('bgvrimb', ICON.undo, 'Rimborso <small>restituisci i biglietti al cliente</small>') : ''}${paid <= 0.009 ? B('bgvdel', ICON.trash, 'Annulla la vendita <small>registrata per sbaglio, senza incassi</small>', 'danger') : ''}</div>`;
    }
    openPop(el, h, 'rmenu');
  }
  function bgRimbModal(id) {
    const x = bgVend().find(v => v.id === id); if (!x) return;
    UI.modal = { kind: 'bgrimb', id, met: 'contanti' };
    const per = x.nT ? r2(x.totTkt / x.nT) : 0;
    openModal(`Rimborso biglietti · ${esc(x.cliente)}`, `<div class="bgp"><div class="bgp-ev"><b>${esc(x.evN)}</b> · ${esc(x.sett)}<br><small>${venQ(x)} biglietti · ${money(per)} a biglietto (i diritti non si rimborsano)</small></div>
      <div class="grid2"><div class="field"><label for="bgr-q">Quanti biglietti</label><input id="bgr-q" inputmode="numeric" value="${esc(venQ(x))}"></div><div class="field"><label for="bgr-a">Importo da restituire</label><input id="bgr-a" inputmode="decimal" value="${esc(fmt2(r2(per * venQ(x))))}"></div></div>
      <div class="field"><label>Come lo restituisci</label><div class="pay-met">${METODI.filter(([k]) => !['buono', 'voucher'].includes(k)).map(([k, l]) => `<button type="button" role="radio" aria-checked="${esc(k === 'contanti')}" data-act="bgrmet" data-k="${esc(k)}">${l}</button>`).join('')}</div></div></div>`,
      `<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="bgrsave">Registra il rimborso</button>`);
  }
  function bgRimbSave() {
    const M = UI.modal; const x = bgVend().find(v => v.id === M.id); if (!x) return closeModal();
    const q = parseInt($('#bgr-q').value, 10) || 0; const a = parseEuro($('#bgr-a').value) || 0;
    if (q <= 0 || q > venQ(x)) return toast(`Si possono rimborsare da 1 a ${venQ(x)} biglietti`); if (a < 0) return toast('Importo non valido');
    const SK = x.stock && bgStock().find(s => s.id === x.stock);
    if (a > 0) addMov({ venId: x.id, tipo: 'rimborso', cliente: x.cliente, doc: 'nessuno', cat: 'SoloTicket', desc: `${dd2(x.evD)} ${x.evN}`.toLowerCase(), circuito: x.circ, emis: SK ? SK.emis : x.emis, ant: true, lines: [{ l: 'Rimborso', q: -q, bus: 0, tkt: x.nT ? r2(x.totTkt / x.nT) : 0 }], dir: 0, nT: -q, docTot: -a, agenzia: 0, biglietti: -a, parts: [{ m: M.met, a: -a }], note: 'rimborso biglietti', sigla: sigla(ACC.sess.uid, ACC.me().name) });
    const v = Object.assign({}, x, { rimb: (+x.rimb || 0) + q }); bgPutVen(v);
    ACC.tlog('avviso', `Biglietteria · rimborso di ${q} ${q === 1 ? 'biglietto' : 'biglietti'} (${money(a)}) · ${x.cliente} · ${x.evN}`);
    closeModal(); render(); toast(`Rimborso registrato: ${q} ${q === 1 ? 'biglietto' : 'biglietti'} · ${money(a)}`);
  }
  function bgCambio(id) {
    const x = bgVend().find(v => v.id === id); if (!x || !ACC.sess.ag) return;
    const d = new Date(); const me = ACC.me(); const dir = 5, pr = 5;
    const v = { id: 'v' + uid(), at: d.toISOString(), day: dayISO(d), who: me.name, uid: ACC.sess.uid, ag: ACC.sess.ag, dev: STORE.device.id, evId: x.evId, evN: x.evN, evD: x.evD, sett: 'cambio nome', circ: x.circ, righe: [{ tar: 'Cambio nome', q: 1, prezzo: pr }], dir, nT: 1, totTkt: pr, totDir: dir, tot: pr + dir, emis: dayISO(d), stock: '', cliente: x.cliente, tel: x.tel, tipo: 'cambio', rif: x.id };
    bgPutVen(v); ACC.tlog('info', `Biglietteria · cambio nome · ${x.cliente} · ${x.evN}`); render(); bgPayModal(v.id);
  }
  // ---- Sospesi ----
  function bgSospesi(tabs) {
    const st = bgS(); const f = st.scirc || 'tutti';
    const L = bgVend().filter(venSosp).filter(x => f === 'tutti' || x.circ === f);
    const SL = bgStock().filter(s => stLiberi(s) > 0 && (f === 'tutti' || s.circ === f));
    const G = new Map(); L.forEach(x => { const k = x.evId; if (!G.has(k)) G.set(k, []); G.get(k).push(x); });
    const tot = r2(L.reduce((a, x) => a + venDue(x), 0)), n = L.reduce((a, x) => a + venQ(x), 0);
    const circs = [...new Set([...bgVend().filter(venSosp).map(x => x.circ), ...bgStock().filter(s => stLiberi(s) > 0).map(s => s.circ)])];
    const groups = [...G.entries()].map(([evId, xs]) => ({ e: bgEv(evId), xs: xs.sort((a, b) => a.emis.localeCompare(b.emis)) })).sort((a, b) => String(a.e ? a.e.data : '').localeCompare(String(b.e ? b.e.data : '')));
    // 2.1.8: pacchetti biglietto + bus dei viaggi collegati, non ancora saldati (si incassano dalla lista del viaggio)
    const TS = bgEvents().map(e => ({ e, t: bgTripOf(e) })).filter(x => x.t && (f === 'tutti' || x.e.circ === f)).map(x => Object.assign(x, { k: bgTripTk(x.t) })).filter(x => x.k.bks.length).sort((a, b) => String(a.e.data).localeCompare(String(b.e.data)));
    return `${bgHead(`${n} ${n === 1 ? 'biglietto emesso' : 'biglietti emessi'} e non ancora pagati · <b>${money(tot)}</b> da incassare`)}${tabs}
      <div class="bg-filt"><span class="bg-l">Circuito</span><div class="seg"><button data-act="bgscirc" data-v="tutti" aria-pressed="${esc(f === 'tutti')}">Tutti</button>${circs.map(c => `<button data-act="bgscirc" data-v="${esc(c)}" aria-pressed="${esc(f === c)}">${esc(circL(c))}</button>`).join('')}</div></div>
      ${groups.map(g => { const s = r2(g.xs.reduce((a, x) => a + venDue(x), 0)), q = g.xs.reduce((a, x) => a + venQ(x), 0); return `<section class="box tablecard bg-ev"><div class="bg-evh"><h2>${esc(g.e ? evLbl(g.e) : g.xs[0].evN)}</h2>${circB(g.xs[0].circ)}<span class="bg-evs">${q} ${q === 1 ? 'biglietto' : 'biglietti'} · <b>${money(s)}</b></span></div><div class="tscroll"><table class="rt"><thead><tr><th>Emesso il</th><th>Acquirente</th><th>Settore e tariffa</th><th class="r">N.</th><th class="r">€ a biglietto</th><th class="r">Da incassare</th><th>Agenzia</th><th></th></tr></thead><tbody>
        ${g.xs.map(x => `<tr><td>${esc(dd2(x.emis))}</td><td><b>${esc(x.cliente)}</b>${x.tel ? `<br><small>${esc(x.tel)}</small>` : ''}</td><td>${esc(x.sett)} · ${esc((x.righe || []).map(r => r.tar.toLowerCase()).join(' + '))}</td><td class="r">${venQ(x)}</td><td class="r">${esc((x.righe || []).map(r => fmt2(r.prezzo)).join(' / '))} €</td><td class="r"><b>${money(venDue(x))}</b></td><td>${esc(agName(x.ag))}</td><td class="r">${bgCan() ? `<button class="btn sm primary" data-act="bgvpay" data-id="${esc(x.id)}">${ICON.euro} Incassa</button>` : ''}</td></tr>`).join('')}</tbody></table></div></section>`; }).join('')}
      ${SL.length ? `<section class="box tablecard bg-ev"><div class="bg-evh"><h2>Biglietti dell'agenzia ancora liberi</h2><span class="bg-evs">${SL.reduce((a, s) => a + stLiberi(s), 0)} biglietti · <b>${money(r2(SL.reduce((a, s) => a + stLiberi(s) * s.prezzo, 0)))}</b></span></div><div class="tscroll"><table class="rt"><thead><tr><th>Emessi il</th><th>Evento</th><th>Settore</th><th>Circuito</th><th class="r">Liberi</th><th class="r">€ a biglietto</th></tr></thead><tbody>${SL.map(s => `<tr><td>${esc(dd2(s.emis))}</td><td><b>${esc(evLbl(bgEv(s.evId)))}</b></td><td>${esc(s.sett)}</td><td>${circB(s.circ)}</td><td class="r">${stLiberi(s)}</td><td class="r">${money(s.prezzo)}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      ${TS.map(x => `<section class="box tablecard bg-ev"><div class="bg-evh"><h2>${esc(evLbl(x.e))} <small>· biglietto + bus</small></h2>${circB(x.e.circ)}<span class="bg-evs">${x.k.nS} ${x.k.nS === 1 ? 'biglietto' : 'biglietti'} · <b>${money(x.k.rest)}</b> da incassare (bus e biglietto)</span></div><div class="tscroll"><table class="rt"><thead><tr><th>Prenotazione</th><th>Emesso il</th><th class="r">Biglietti</th><th class="r">Da incassare</th><th></th></tr></thead><tbody>
        ${x.k.bks.map(o => { const ems = [...new Set(o.bk.persone.map(p => emisISO(p.row && p.row.emis)).filter(Boolean))].sort(); return `<tr><td><b>${esc(bkName(o.bk))}</b>${o.bk.persone.length > 1 ? ` x ${o.bk.persone.length}` : ''}${o.bk.head.tel ? `<br><small>${esc(o.bk.head.tel)}</small>` : ''}</td><td>${ems.length ? esc(ems.map(dd2).join(', ')) : '<small>non scritta</small>'}</td><td class="r">${o.n}</td><td class="r"><b>${o.rest != null ? money(o.rest) : '—'}</b></td><td class="r"><button class="btn sm" data-act="opentrip" data-id="${esc(x.t.id)}">${ICON.list} Apri la lista</button></td></tr>`; }).join('')}</tbody></table></div></section>`).join('')}
      ${!groups.length && !SL.length && !TS.length ? '<div class="infobox">Nessun biglietto sospeso.</div>' : ''}`;
  }
  // ---- Eventi ----
  function bgEventi(tabs) {
    const st = bgS(); const today = todayISO(); const all = !!st.evAll;
    const E = bgEvents().filter(e => all || e.data >= today).sort((a, b) => a.data.localeCompare(b.data));
    const V = bgVend(); const cnt = id => { const xs = V.filter(x => x.evId === id && x.tipo !== 'rimborso' && x.tipo !== 'cambio'); const e = bgEv(id); const k = bgTripTk(bgTripOf(e)); return { v: xs.reduce((a, x) => a + venQ(x), 0), s: xs.filter(venSosp).reduce((a, x) => a + venQ(x), 0), bv: k.n, bs: k.nS }; };
    return `${bgHead('Eventi in vendita, con settori, tariffe e diritti per circuito', bgCan() ? `<button class="btn primary" data-act="bgevnew">${ICON.plus} Nuovo evento</button>` : '')}${tabs}
      <label class="chk small"><input type="checkbox" data-act="bgevall"${all ? ' checked' : ''}> Mostra anche gli eventi passati</label>
      <section class="box tablecard"><div class="tscroll"><table class="rt bg-evt"><thead><tr><th>Data</th><th>Evento</th><th>Circuito</th><th>Settori e prezzi (€)</th><th class="r">Diritti</th><th class="r">Venduti</th><th class="r">Sospesi</th><th>Viaggio con il bus</th><th></th></tr></thead><tbody>
        ${E.map(e => { const c = cnt(e.id); const t = e.tripId && S.trips.find(x => x.id === e.tripId); return `<tr><td class="nowrap">${esc(fmtDate(e.data))}${e.ora ? `<br><small>ore ${esc(e.ora)}</small>` : ''}</td><td><b>${esc(e.nome)}</b>${e.luogo ? `<br><small>${esc(e.luogo)}</small>` : ''}</td><td>${circB(e.circ)}</td><td><small>${(e.settori || []).map(s => `${esc(s.nome)} ${esc(fmt2(+s.intero || 0))}${s.ridotto ? ' (rid. ' + esc(fmt2(+s.ridotto)) + ')' : ''}`).join(' · ') || '—'}</small></td><td class="r">${esc(fmt2(+e.dir || 0))}</td><td class="r"><b>${c.v}</b>${c.bv ? `<br><small class="bg-cb">+ ${c.bv} con il bus</small>` : ''}</td><td class="r">${c.s ? `<span class="pill tbd">${c.s}</span>` : c.bs ? '' : '—'}${c.bs ? `${c.s ? '<br>' : ''}<small class="bg-cb">${c.bs} con il bus</small>` : ''}</td><td>${t ? `<button class="bg-link" data-act="opentrip" data-id="${esc(t.id)}">${ICON.bus} ${esc(t.nome)}</button>` : '<small>solo biglietto</small>'}</td><td class="r">${bgCan() ? `<button class="btn sm" data-act="bgevedit" data-id="${esc(e.id)}" title="Modifica l'evento" aria-label="Modifica l'evento ${esc(e.nome)}">${ICON.edit}<span>Modifica</span></button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="9" class="emptyrow">${all ? 'Nessun evento' : 'Nessun evento in programma: premi «Nuovo evento»'}</td></tr>`}
      </tbody></table></div></section>
      <div class="small bg-note">Per i concerti con il bus il viaggio resta in «Viaggi» (lista, piantina, cartelli). Lo colleghi all'evento da qui («Modifica» › «Viaggio con il bus») oppure dalla lista del viaggio con «Collega alla Biglietteria»: i prezzi del biglietto diventano quelli dell'evento e qui vedi anche i biglietti venduti con il bus.</div>`;
  }
  function bgEvModal(id, keep) {
    const e0 = id && bgEv(id);
    if (!keep) UI.modal = { kind: 'bgev', ev: JSON.parse(JSON.stringify(e0 || { id: 'e' + uid(), nome: '', luogo: '', data: '', ora: '', circ: 'T.OneRG', dir: 2, settori: [{ id: 's' + uid(), nome: '', intero: '', ridotto: '' }], tripId: '', note: '' })), isNew: !e0 };
    const E = UI.modal.ev; const today = todayISO();
    // si collegano solo i viaggi di tipo «Evento» (2.1.8), liberi o già collegati a questo evento
    const trips = S.trips.filter(t => t.id === E.tripId || ((t.fine || t.data) >= today && tripCat(t) === 'evento' && !bgEvents().some(x => x.id !== E.id && x.tripId === t.id))).sort((a, b) => a.data.localeCompare(b.data));
    openModal(UI.modal.isNew ? 'Nuovo evento' : 'Modifica evento', `<div class="bge">
      <div class="field"><label for="bge-n">Evento</label><input id="bge-n" data-bge="nome" value="${esc(E.nome)}" placeholder="es. Laura Pausini"></div>
      <div class="field"><label for="bge-l">Luogo</label><input id="bge-l" data-bge="luogo" value="${esc(E.luogo)}" placeholder="es. Messina · Stadio San Filippo"></div>
      <div class="grid3"><div class="field"><label for="bge-d">Data</label><input id="bge-d" type="date" data-bge="data" value="${esc(E.data)}"></div><div class="field"><label for="bge-o">Ora <small>facoltativa</small></label><input id="bge-o" data-bge="ora" value="${esc(E.ora || '')}" placeholder="21:00"></div>
        <div class="field"><label for="bge-c">Circuito</label><select id="bge-c" data-bge="circ">${CIRCUITI.map(c => `<option value="${esc(c)}"${E.circ === c ? ' selected' : ''}>${esc(circL(c))}</option>`).join('')}</select></div></div>
      <div class="field"><label for="bge-r">Diritti di prevendita a biglietto €</label><input id="bge-r" data-bge="dir" inputmode="decimal" value="${typeof E.dir === 'number' ? esc(fmt2(E.dir)) : esc(String(E.dir || ''))}" style="max-width:140px"></div>
      <div class="field"><label>Settori e prezzi</label><div class="bge-s">${(E.settori || []).map((s, i) => `<div class="bge-r"><input data-bges="${i}" data-k="nome" value="${esc(s.nome)}" placeholder="settore (es. Parterre)" aria-label="Settore ${i + 1}"><input data-bges="${i}" data-k="intero" inputmode="decimal" value="${esc(bgNumV(s.intero))}" placeholder="intero €" aria-label="Prezzo intero"><input data-bges="${i}" data-k="ridotto" inputmode="decimal" value="${esc(bgNumV(s.ridotto))}" placeholder="ridotto €" aria-label="Prezzo ridotto"><button class="kebab" data-act="bgesdel" data-i="${i}" aria-label="Togli il settore">${ICON.close}</button></div>`).join('')}</div><button class="btn sm ghost" data-act="bgesadd">${ICON.plus} Aggiungi settore</button></div>
      <div class="field"><label for="bge-t">Viaggio con il bus <small>facoltativo</small></label><select id="bge-t" data-bge="tripId"><option value="">— solo biglietto, senza bus —</option>${trips.map(t => `<option value="${esc(t.id)}"${E.tripId === t.id ? ' selected' : ''}>${esc(fmtDate(t.data))} · ${esc(t.nome)}</option>`).join('')}</select></div>
      <div class="field"><label for="bge-x">Note <small>facoltative</small></label><input id="bge-x" data-bge="note" value="${esc(E.note || '')}"></div></div>`,
      `${!UI.modal.isNew ? `<button class="btn danger" data-act="bgevdel" style="margin-right:auto">${ICON.trash} Togli l'evento</button>` : ''}<button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="bgevsave">${UI.modal.isNew ? 'Crea l\'evento' : 'Salva'}</button>`);
  }
  function bgEvSave() {
    const E = UI.modal.ev; E.nome = String(E.nome || '').trim(); if (!E.nome) return toast('Scrivi il nome dell\'evento'); if (!E.data) return toast('Scegli la data dell\'evento');
    E.settori = (E.settori || []).map(s => ({ id: s.id || 's' + uid(), nome: String(s.nome || '').trim(), intero: parseEuro(String(s.intero)) || 0, ridotto: parseEuro(String(s.ridotto)) || 0 })).filter(s => s.nome);
    if (!E.settori.length) return toast('Scrivi almeno un settore con il prezzo'); E.dir = parseEuro(String(E.dir)) || 0;
    if (E.tripId) { const o = bgEvents().find(x => x.id !== E.id && x.tripId === E.tripId); if (o) return toast(`Quel viaggio è già collegato all'evento «${o.nome}»`); }
    { const e0 = bgEv(E.id); const t0 = e0 && e0.tripId !== E.tripId && bgTripOf(e0); if (t0) { bgCopyPrices(e0, t0); save(); } }
    { const t1 = E.tripId && S.trips.find(x => x.id === E.tripId); if (t1 && tripCat(t1) === 'evento' && !t1.tkFila) { t1.tkFila = true; save(); } }
    bgPutMap(BGP.ev, 'eventi', E); ACC.tlog('info', `Biglietteria · evento ${UI.modal.isNew ? 'creato' : 'modificato'}: ${E.nome} (${E.data})`); closeModal(); render(); toast(`Evento «${E.nome}» salvato`);
  }
  // ---- Biglietti dell'agenzia ----
  function bgAgenzia(tabs) {
    const L = bgStock().sort((a, b) => String((bgEv(a.evId) || {}).data).localeCompare(String((bgEv(b.evId) || {}).data)));
    return `${bgHead('Biglietti comprati dall\'agenzia per i pacchetti bus + biglietto', bgCan() ? `<button class="btn primary" data-act="bgstnew">${ICON.plus} Biglietti comprati</button>` : '')}${tabs}
      <section class="box tablecard"><div class="tscroll"><table class="rt"><thead><tr><th>Evento</th><th>Settore</th><th>Circuito</th><th>Emessi il</th><th class="r">Comprati</th><th class="r">Dati ai clienti</th><th class="r">Ancora liberi</th><th class="r">€ a biglietto</th><th>Viaggio</th></tr></thead><tbody>
        ${L.map(s => { const e = bgEv(s.evId); const t = s.tripId && S.trips.find(x => x.id === s.tripId); const lib = stLiberi(s); return `<tr><td><b>${esc(evLbl(e))}</b>${s.note ? `<br><small>${esc(s.note)}</small>` : ''}</td><td>${esc(s.sett)}</td><td>${circB(s.circ)}</td><td>${esc(dd2(s.emis))}</td><td class="r">${esc(s.q)}</td><td class="r">${esc(s.q - lib)}</td><td class="r">${lib ? `<span class="pill tbd">${lib} liberi</span>` : '<span class="pill ok">finiti</span>'}</td><td class="r">${money(s.prezzo)}</td><td>${t ? `<button class="bg-link" data-act="opentrip" data-id="${esc(t.id)}">${ICON.bus} ${esc(t.nome)}</button>` : '—'}</td></tr>`; }).join('') || '<tr><td colspan="9" class="emptyrow">Nessun biglietto comprato dall\'agenzia: premi «Biglietti comprati»</td></tr>'}
      </tbody></table></div></section>
      <div class="small bg-note">I biglietti comprati entrano tra le emissioni del circuito nel giorno in cui li avete emessi e restano tra i sospesi dell'agenzia finché non li date ai clienti: in «Vendita» (scegli «Biglietto dell'agenzia») oppure nell'incasso del viaggio con il bus collegato.</div>`;
  }
  function bgStModal(keep) {
    const evs = bgEvents().filter(e => e.data >= todayISO()).sort((a, b) => a.data.localeCompare(b.data));
    if (!keep) UI.modal = { kind: 'bgst', evId: evs[0] ? evs[0].id : '', sett: '', q: '', prezzo: '', emis: todayISO(), tripId: '', note: '' };
    const M = UI.modal; const e = M.evId && bgEv(M.evId); if (e && !M.sett && (e.settori || [])[0]) M.sett = e.settori[0].nome;
    const sett = e && (e.settori || []).find(s => s.nome === M.sett); if (sett && (M.prezzo === '' || M.prezzo == null)) M.prezzo = sett.intero;
    if (e && !M.tripId && e.tripId) M.tripId = e.tripId;
    const trips = S.trips.filter(t => (t.fine || t.data) >= todayISO()).sort((a, b) => a.data.localeCompare(b.data));
    openModal('Biglietti comprati dall\'agenzia', evs.length ? `<div class="bge">
      <div class="field"><label for="bgs-e">Evento</label><select id="bgs-e" data-bgs="evId">${evs.map(x => `<option value="${esc(x.id)}"${x.id === M.evId ? ' selected' : ''}>${esc(fmtDate(x.data))} · ${esc(x.nome)} · ${esc(circL(x.circ))}</option>`).join('')}</select><span class="small">Se l'evento non c'è ancora, crealo prima nella scheda «Eventi».</span></div>
      ${e ? `<div class="field"><label>Settore</label><div class="bg-chips">${(e.settori || []).map(s => `<button type="button" data-act="bgsset" data-v="${esc(s.nome)}" aria-pressed="${esc(M.sett === s.nome)}">${esc(s.nome)} <small>${esc(fmt2(+s.intero || 0))} €</small></button>`).join('')}</div></div>` : ''}
      <div class="grid2"><div class="field"><label for="bgs-q">Quanti biglietti</label><input id="bgs-q" data-bgs="q" class="pay-imp" inputmode="numeric" value="${esc(String(M.q || ''))}" style="max-width:150px"></div><div class="field"><label for="bgs-p">Prezzo pagato a biglietto €</label><input id="bgs-p" data-bgs="prezzo" inputmode="decimal" value="${M.prezzo !== '' ? esc(fmt2(+M.prezzo)) : ''}"></div></div>
      <div class="grid2"><div class="field"><label for="bgs-d">Emessi sul circuito il</label><input id="bgs-d" type="date" data-bgs="emis" value="${esc(M.emis)}"></div><div class="field"><label for="bgs-t">Per il viaggio con il bus <small>facoltativo</small></label><select id="bgs-t" data-bgs="tripId"><option value="">—</option>${trips.map(t => `<option value="${esc(t.id)}"${t.id === M.tripId ? ' selected' : ''}>${esc(fmtDate(t.data))} · ${esc(t.nome)}</option>`).join('')}</select></div></div>
      <div class="field"><label for="bgs-n">Note <small>facoltative</small></label><input id="bgs-n" data-bgs="note" value="${esc(M.note || '')}" placeholder="es. blocco per il pacchetto bus + biglietto"></div>
      <div class="bg-sum" id="bgs-sum">${bgStSum(M, e)}</div></div>` : '<div class="infobox">Prima crea l\'evento nella scheda «Eventi».</div>',
      `<button class="btn" data-act="close">Annulla</button>${evs.length ? `<button class="btn primary" data-act="bgstsave">Aggiungi i biglietti</button>` : ''}`);
  }
  const bgStSum = (M, e) => { const q = parseInt(M.q, 10) || 0, p = parseEuro(String(M.prezzo)) || 0; return `<div><span>${q} biglietti × ${money(p)}</span><b>${money(r2(q * p))}</b></div><div class="small">Entrano tra le emissioni di ${esc(circL(e && e.circ))} del ${esc(dd2(M.emis))} e restano «sospesi dell'agenzia» finché non li date ai clienti.</div>`; };
  function bgStSave() {
    const M = UI.modal; const e = bgEv(M.evId); if (!e) return toast('Scegli l\'evento'); if (!M.sett) return toast('Scegli il settore');
    const q = parseInt(M.q, 10) || 0; if (q <= 0) return toast('Scrivi quanti biglietti'); const p = parseEuro(String(M.prezzo)) || 0; if (p <= 0) return toast('Scrivi il prezzo a biglietto');
    const me = ACC.me(); const s = { id: 'k' + uid(), evId: e.id, sett: M.sett, circ: e.circ, q, prezzo: r2(p), emis: M.emis || todayISO(), tripId: M.tripId || '', note: String(M.note || '').trim(), who: me.name, ag: ACC.sess.ag || '', at: new Date().toISOString() };
    bgPutMap(BGP.st, 'stock', s); ACC.tlog('info', `Biglietteria · comprati dall'agenzia ${q} biglietti ${e.nome} (${M.sett}) a ${money(p)}`); closeModal(); render(); toast(`Aggiunti ${q} biglietti dell'agenzia`);
  }
  // ---- Controllo circuiti ----
  function bgControllo(tabs) {
    const st = bgS(); const c = st.ccirc || 'T.OneRG'; const w0 = st.week || monday(todayISO()); const E = bgCtl(c);
    const used = [...new Set([...bgVend().map(x => x.circ), ...bgStock().map(s => s.circ), ...allMovs().filter(m => m.circuito).map(m => m.circuito), 'T.OneRG'])].filter(Boolean);
    const days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(w0, i)); const AG = S.cfg.agenzie;
    const row = d => { const o = E[d] || { em: 0, emN: 0, inc: {}, incN: {} }; const ti = r2(Object.values(o.inc).reduce((a, v) => a + v, 0)), tn = Object.values(o.incN).reduce((a, v) => a + v, 0); const s = r2(o.em - ti), sn = o.emN - tn;
      return `<tr><td><b>${esc(GIORNI[parseD(d).getDay()].slice(0, 3))} ${esc(dd2(d).slice(0, 5))}</b></td><td class="r">${money(o.em)}<br><small>${o.emN} tkt</small></td>${AG.map(a => `<td class="r">${money(o.inc[a.id] || 0)}<br><small>${o.incN[a.id] || 0} tkt</small></td>`).join('')}<td class="r">${Math.abs(s) < 0.01 ? (o.em ? '<span class="pill ok">tutto incassato</span>' : '—') : `<b class="neg">${money(s)}</b><br><small>${sn} tkt ${s > 0 ? 'da incassare' : '(incassi di emissioni vecchie)'}</small>`}</td></tr>`; };
    const tot = days.reduce((a, d) => { const o = E[d]; if (!o) return a; a.em += o.em; a.inc += Object.values(o.inc).reduce((x, v) => x + v, 0); return a; }, { em: 0, inc: 0 });
    let weekly = '';
    if (CIRC_W.includes(c)) {
      const A = bgAdd(); const W = []; for (let i = 0; i < 8; i++) W.push(addDays(monday(todayISO()), -7 * (i + 1)));
      weekly = `<section class="box tablecard"><h2 class="ch">Portafoglio ${esc(circL(c))} · settimane contabili</h2><div class="tscroll"><table class="rt"><thead><tr><th>Settimana</th><th>Addebito del</th><th class="r">Addebitato dal circuito</th><th class="r">Nostre emissioni</th><th class="r">Biglietti</th><th class="r">Differenza</th></tr></thead><tbody>
        ${W.map(w => { const k = c + '|' + w; const a = A[k] || {}; let em = 0, n = 0; for (let i = 0; i < 7; i++) { const o = E[addDays(w, i)]; if (o) { em += o.em; n += o.emN; } } em = r2(em); const has = a.importo != null && a.importo !== ''; const d = has ? r2(+a.importo - em) : null;
          return `<tr><td><b>${esc(dd2(w).slice(0, 5))} – ${esc(dd2(addDays(w, 6)).slice(0, 5))}</b></td><td><input type="date" class="bg-inp" data-bgadd="${esc(k)}" data-k="data" value="${esc(a.data || '')}"${bgCan() ? '' : ' disabled'} aria-label="Data dell'addebito"></td><td class="r"><input class="bg-inp r" data-bgadd="${esc(k)}" data-k="importo" inputmode="decimal" value="${has ? esc(fmt2(+a.importo)) : ''}" placeholder="0,00"${bgCan() ? '' : ' disabled'} aria-label="Importo addebitato"></td><td class="r">${money(em)}</td><td class="r">${n}</td><td class="r">${d == null ? '<small>scrivi l\'addebito</small>' : Math.abs(d) < 0.01 ? '<span class="pill ok">0,00 € · torna</span>' : `<b class="neg">${money(d)}</b><br><small>da controllare</small>`}</td></tr>`; }).join('')}
      </tbody></table></div></section>`;
    }
    return `${bgHead('Ogni giorno: emesso sul circuito, incassato nelle tre agenzie, sospesi')}${tabs}
      <div class="bg-filt"><span class="bg-l">Circuito</span><div class="seg">${used.map(x => `<button data-act="bgccirc" data-v="${esc(x)}" aria-pressed="${esc(x === c)}">${esc(circL(x))}</button>`).join('')}</div><span class="bg-l">Settimana</span><div class="seg"><button data-act="bgweek" data-v="-7" aria-label="Settimana prima">‹</button><button aria-pressed="true">${esc(dd2(w0).slice(0, 5))} – ${esc(dd2(addDays(w0, 6)).slice(0, 5))}</button><button data-act="bgweek" data-v="7" aria-label="Settimana dopo">›</button></div></div>
      <section class="box tablecard"><div class="tscroll"><table class="rt bg-ctl"><thead><tr><th>Emissioni del</th><th class="r">Emesso</th>${AG.map(a => `<th class="r">Incassato ${esc(a.nome)}</th>`).join('')}<th class="r">Sospesi</th></tr></thead><tbody>${days.map(row).join('')}
        <tr class="tot"><td><b>Settimana</b></td><td class="r"><b>${money(r2(tot.em))}</b></td>${AG.map(() => '<td></td>').join('')}<td class="r"><b>${money(r2(tot.em - tot.inc))}</b></td></tr></tbody></table></div></section>
      ${weekly}
      <div class="small bg-note">Gli incassi contano nel giorno in cui il biglietto è stato emesso, in qualsiasi agenzia siano fatti (come i fogli SOSPESI). Valori negativi = quel giorno si sono incassati biglietti emessi prima. L'addebito del circuito si scrive a mano quando arriva.</div>`;
  }
  // ---- nell'incasso di un viaggio con il bus collegato a un evento: biglietto dell'agenzia ----
  function bgTripStockHTML(t, f) {
    const evs = bgEvents().filter(e => e.tripId === t.id).map(e => e.id); if (!evs.length) return '';
    // 2.1.8: solo i biglietti dell'agenzia del settore che hanno le persone di questo incasso (es. Tribuna)
    const need = bgPayTypes(t); const L = bgStock().filter(s => evs.includes(s.evId) && (stLiberi(s) > 0 || s.id === f.stock) && (!need.size || need.has(tkNorm(s.sett)) || s.id === f.stock)); if (!L.length) return '';
    return `<label class="pp-1">Biglietti dell'agenzia<select data-pf="stock"><option value="">— nessuno (biglietto emesso adesso) —</option>${L.map(s => `<option value="${esc(s.id)}"${f.stock === s.id ? ' selected' : ''}>${esc(s.sett)} · ${esc(circL(s.circ))} · ${stLiberi(s)} liberi · emessi il ${esc(dd2(s.emis))}</option>`).join('')}</select></label>`;
  }
  // tipi di biglietto delle persone dell'incasso aperto (nomi normalizzati)
  function bgPayTypes(t) {
    const o = new Set(); const P = UI.pay; if (!t || !P) return o; const bk = deriveBookings(t).find(x => x.id === P.bkId); if (!bk) return o;
    const TK = tripTkt(t); const m = bk._m || bkMoney(t, bk);
    bk.persone.forEach((p, i) => { if (P.pid && p.id !== P.pid) return; const x = personTkt(t, p, (m.per[i] || {}).tipo || 'ad', TK); if (x) o.add(tkNorm(x.s.nome)); });
    return o;
  }
  // ---- eventi ----
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act^="bg"]'); if (!el) return; const a = el.dataset.act; const st = bgS();
    switch (a) {
      case 'bgtab': st.tab = el.dataset.v; render(); window.scrollTo(0, 0); break;
      case 'bgevpick': st.evId = el.dataset.id; st.sett = ''; st.q = {}; st.pr = {}; st.dirV = null; st.src = 'new'; render(); break;
      case 'bgevclr': st.evId = ''; st.sett = ''; st.q = {}; st.pr = {}; st.dirV = null; render(); setTimeout(() => { const i = $('[data-bgq]'); if (i) i.focus(); }, 30); break;
      case 'bgsett': st.sett = el.dataset.id; st.q = {}; st.pr = {}; st.src = 'new'; { const ev = bgEv(st.evId); const s = ev && ev.settori.find(x => x.id === st.sett); if (s) st.q.Intero = 1; } render(); break;
      case 'bgsrc': st.src = el.dataset.v; if (el.dataset.id) st.stockId = el.dataset.id; render(); break;
      case 'bgsell': if (bgCan()) bgSell(el.dataset.k); break;
      case 'bgvmenu': e.stopImmediatePropagation(); bgVenMenu(el.dataset.id, el); break;
      case 'bgvpay': closePop(); if (bgCan()) bgPayModal(el.dataset.id); break;
      case 'bgvrimb': closePop(); if (bgCan()) bgRimbModal(el.dataset.id); break;
      case 'bgvcambio': closePop(); if (bgCan()) bgCambio(el.dataset.id); break;
      case 'bgvdel': { closePop(); const x = bgVend().find(v => v.id === el.dataset.id); if (!x || !bgCan()) break; confirmBox('Annulla la vendita', `Tolgo la vendita di <b>${esc(x.cliente)}</b> (${esc(x.evN)}, ${venQ(x)} biglietti)? Non ha incassi.`, 'Annulla la vendita', () => { bgPutVen(Object.assign({}, x, { del: true })); ACC.tlog('avviso', `Biglietteria · annullata la vendita ${x.cliente} · ${x.evN}`); render(); toast('Vendita annullata'); }); break; }
      case 'bgpdoc': if (UI.modal && UI.modal.kind === 'bgpay') { UI.modal.doc = el.dataset.k; bgPayModal(UI.modal.id, true); } break;
      case 'bgpmet': if (UI.modal && UI.modal.kind === 'bgpay') { UI.modal.met = el.dataset.k; if (el.dataset.k === 'misto') UI.modal.mix = {}; bgPayModal(UI.modal.id, true); } break;
      case 'bgpsave': if (UI.modal && UI.modal.kind === 'bgpay') bgPaySave(); break;
      case 'bgrmet': if (UI.modal) { UI.modal.met = el.dataset.k; $$('[data-act="bgrmet"]').forEach(x => x.setAttribute('aria-checked', String(x === el))); } break;
      case 'bgrsave': if (UI.modal && UI.modal.kind === 'bgrimb') bgRimbSave(); break;
      case 'bgscirc': st.scirc = el.dataset.v; render(); break;
      case 'bgevnew': if (bgCan()) bgEvModal(null); break;
      case 'bgevedit': if (bgCan()) bgEvModal(el.dataset.id); break;
      case 'bgevall': st.evAll = el.checked; render(); break;
      case 'bgesadd': if (UI.modal && UI.modal.kind === 'bgev') { UI.modal.ev.settori.push({ id: 's' + uid(), nome: '', intero: '', ridotto: '' }); bgEvModal(null, true); const ins = $$('[data-bges][data-k="nome"]'); if (ins.length) ins[ins.length - 1].focus(); } break;
      case 'bgesdel': if (UI.modal && UI.modal.kind === 'bgev') { UI.modal.ev.settori.splice(+el.dataset.i, 1); bgEvModal(null, true); } break;
      case 'bgevsave': if (UI.modal && UI.modal.kind === 'bgev') bgEvSave(); break;
      case 'bgevdel': if (UI.modal && UI.modal.kind === 'bgev') { const E = UI.modal.ev; if (bgVend().some(x => x.evId === E.id) || bgStock().some(s => s.evId === E.id)) { toast('L\'evento ha già vendite o biglietti dell\'agenzia: non si può togliere'); break; } { const e0 = bgEv(E.id); const t0 = e0 && bgTripOf(e0); if (t0) { toast(`L'evento è collegato a «${t0.nome}»: prima scollegalo dalla lista del viaggio`); break; } } bgPutMap(BGP.ev, 'eventi', Object.assign({}, E, { del: true })); closeModal(); render(); toast('Evento tolto'); } break;
      case 'bgstnew': if (bgCan()) bgStModal(false); break;
      case 'bgsset': if (UI.modal && UI.modal.kind === 'bgst') { UI.modal.sett = el.dataset.v; const ev = bgEv(UI.modal.evId); const s = ev && ev.settori.find(x => x.nome === el.dataset.v); if (s) UI.modal.prezzo = s.intero; bgStModal(true); } break;
      case 'bgstsave': if (UI.modal && UI.modal.kind === 'bgst') bgStSave(); break;
      case 'bglksel': if (UI.modal && UI.modal.kind === 'bglink') { UI.modal.sel = el.dataset.id; $$('[data-act="bglksel"]').forEach(x => x.setAttribute('aria-checked', String(x === el))); } break;
      case 'bglksave': if (UI.modal && UI.modal.kind === 'bglink') bgLinkSave(); break;
      case 'bgbus': if (bgCan() && ACC.sess.ag) bgBusModal(el.dataset.id); else toast(ACC.sess.ag ? 'Il tuo account può solo consultare' : 'Scegli prima l\'agenzia in cui lavori (in alto)'); break;
      case 'bgbset': if (UI.modal && UI.modal.kind === 'bgbus') { UI.modal.sett = el.dataset.v; bgBusModal(UI.modal.evId, true); } break;
      case 'bgbsave': if (UI.modal && UI.modal.kind === 'bgbus') bgBusSave(); break;
      case 'bgbusopen': { closeModal(); UI.pay = null; UI.view = 'trip'; UI.tripId = el.dataset.id; UI.sec = 'posti'; UI.lsel = []; UI.lview = 'all'; const tt = trip(); UI.busId = tt && tt.buses[0] ? tt.buses[0].id : null; render(); window.scrollTo(0, 0); break; }
      case 'bgccirc': st.ccirc = el.dataset.v; render(); break;
      case 'bgweek': st.week = addDays(st.week || monday(todayISO()), +el.dataset.v); render(); break;
    }
  });
  document.addEventListener('input', e => {
    const el = e.target; const d = el.dataset || {}; const st = bgS();
    if (d.bgq) { st.evq = el.value; clearTimeout(el._t); el._t = setTimeout(() => { render(); const i = $('[data-bgq]'); if (i) { i.focus(); i.selectionStart = i.selectionEnd = i.value.length; } }, 200); }
    else if (d.bgqt) { st.q[d.bgqt] = parseInt(el.value, 10) || 0; bgRecalc(); }
    else if (d.bgpr) { st.pr[d.bgpr] = parseEuro(el.value) || 0; bgRecalc(); }
    else if (d.bgf) { st[d.bgf] = d.bgf === 'dirV' ? (parseEuro(el.value) ?? 0) : el.value; if (d.bgf === 'dirV') bgRecalc(); }
    else if (d.bgp && UI.modal && UI.modal.kind === 'bgpay') { UI.modal[d.bgp] = d.bgp === 'imp' ? (parseEuro(el.value) || 0) : el.value; if (d.bgp === 'imp') { const b = $('[data-act="bgpsave"]'); if (b) b.innerHTML = `${UI.modal.doc === 'scontrino' ? ICON.print + ' Scontrino' : 'Registra'} · ${money(+UI.modal.imp || 0)}`; } }
    else if (d.bgpm && UI.modal && UI.modal.kind === 'bgpay') { UI.modal.mix[d.bgpm] = parseEuro(el.value) || 0; if (d.bgpm === 'buono' && !$('[data-bgp="buono"]')) bgPayModal(UI.modal.id, true); }
    else if (d.bge && UI.modal && UI.modal.kind === 'bgev') { UI.modal.ev[d.bge] = el.value; if (d.bge === 'circ') { UI.modal.ev.dir = bgDirDef(el.value); const r = $('#bge-r'); if (r) r.value = fmt2(UI.modal.ev.dir); } }
    else if (d.bges !== undefined && UI.modal && UI.modal.kind === 'bgev') { UI.modal.ev.settori[+d.bges][d.k] = el.value; }
    else if (d.bgb && UI.modal && UI.modal.kind === 'bgbus') { if (d.bgb === 'n') { const n = Math.max(1, Math.min(20, parseInt(el.value, 10) || 1)); if (el.value.trim() && n !== UI.modal.n) { UI.modal.n = n; bgBusModal(UI.modal.evId, true); const i = $('#bgb-n'); if (i) { i.focus(); i.select(); } } } else UI.modal[d.bgb] = el.value; }
    else if (d.bgbp !== undefined && UI.modal && UI.modal.kind === 'bgbus') { const p = UI.modal.pp[+d.bgbp]; if (p) p[d.k] = el.value; }
    else if (d.bgs && UI.modal && UI.modal.kind === 'bgst') { UI.modal[d.bgs] = el.value; if (d.bgs === 'evId') { UI.modal.sett = ''; UI.modal.prezzo = ''; UI.modal.tripId = ''; bgStModal(true); } else { const sm = $('#bgs-sum'); if (sm) sm.innerHTML = bgStSum(UI.modal, bgEv(UI.modal.evId)); } }
  });
  document.addEventListener('change', e => {
    const el = e.target; const d = el.dataset || {};
    if (d.bgp === 'buono' && UI.modal && UI.modal.kind === 'bgpay') UI.modal.buono = el.value;
    if (d.bgadd && bgCan()) { const A = JSON.parse(JSON.stringify(STORE.get(BGP.add) || {})); A.add = A.add || {}; const [circ, week] = d.bgadd.split('|'); const o = A.add[d.bgadd] = Object.assign({ id: d.bgadd, circ, week }, A.add[d.bgadd] || {}); o[d.k] = d.k === 'importo' ? (el.value.trim() === '' ? '' : parseEuro(el.value)) : el.value; o.u = tick(); A.u = o.u; STORE.put(BGP.add, A); ACC.tlog('info', `Biglietteria · addebito ${circL(circ)} settimana del ${dd2(week)}: ${d.k === 'importo' ? money(+o.importo || 0) : o.data}`); render(); }
  });

  // ---------- «Apri in Danea»: la fattura preparata nell'app diventa un file Easyfatt-Xml ----------
  // Facendo doppio clic sul file scaricato (oppure in Danea: Documenti › Utilità › Importa documenti Easyfatt-Xml)
  // Danea mostra la fattura pronta: si preme «Importa», si controlla e si invia come fattura elettronica.
  // Danea abbina il cliente per codice fiscale, partita IVA, email o PEC; se non c'è lo crea.
  // Tracciato: https://www.danea.it/software/easyfatt/xml/documenti/
  const DANEA_DEF = () => ({ iva: '74ter', pag: {} });
  const daneaCfg = () => Object.assign(DANEA_DEF(), S.cfg.danea || {});
  const xq = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const xt = (tag, v) => (v === '' || v == null ? '' : `<${tag}>${xq(v)}</${tag}>`);
  const n2 = v => (Math.round((+v || 0) * 100) / 100).toFixed(2);
  // la fattura nell'app: il movimento di cassa con documento «fattura» (con le righe, i dati del cliente e il viaggio)
  function daneaDoc(m) {
    const C = daneaCfg(); const t = S.trips.find(x => x.id === m.tripId); const F = m.fatt || {};
    const cf = String(F.cf || '').toUpperCase().replace(/\s/g, ''); const piva = /^\d{11}$/.test(cf);
    const sdi = String(F.sdi || '').trim(); const isPec = /@/.test(sdi);
    const cl = t && (() => { const bk = deriveBookings(t).find(b => b.id === resolveBk(m.tripId, m.bkId)); const r = bk && (m.pid ? (bk.persone.find(p => p.id === m.pid) || {}).row : bk.head); return r && r.cid ? S.clients.clienti[r.cid] : null; })();
    const nome = [F.cognome, F.nome].filter(Boolean).join(' ').trim() || m.cliente;
    const when = t ? fmtTripDate(t) : '';
    const rows = (m.lines || []).filter(l => +l.q).map(l => `<Row>${xt('Code', t && t.codDanea)}${xt('Description', `${t ? t.nome : m.desc}${when ? ' · ' + when : ''}${(m.lines || []).filter(x => +x.q).length > 1 || l.l !== 'Intero' ? ' · ' + l.l : ''}`)}<Qty>${+l.q}</Qty><Price>${n2((+l.bus || 0) + (+l.tkt || 0))}</Price><VatCode>${xq(C.iva)}</VatCode></Row>`);
    if (+m.suppl) rows.push(`<Row><Description>Supplemento posti in pullman</Description><Qty>1</Qty><Price>${n2(m.suppl)}</Price><VatCode>${xq(C.iva)}</VatCode></Row>`);
    if (+m.dir && +m.nT) rows.push(`<Row><Description>Diritti di prevendita</Description><Qty>${+m.nT}</Qty><Price>${n2(m.dir)}</Price><VatCode>${xq(C.iva)}</VatCode></Row>`);
    if (!rows.length) rows.push(`<Row>${xt('Code', t && t.codDanea)}<Description>${xq(m.desc || (t && t.nome) || 'Viaggio')}</Description><Qty>1</Qty><Price>${n2(m.docTot || m.tot)}</Price><VatCode>${xq(C.iva)}</VatCode></Row>`);
    // pagamenti: tutti gli incassi registrati per questa prenotazione (già pagati) + l'eventuale saldo ancora da pagare
    // con il pagamento individuale ogni persona ha i suoi incassi: la fattura di una persona considera solo i suoi, quella della comitiva gli altri
    const pays = allMovs().filter(x => x.tripId === m.tripId && resolveBk(x.tripId, x.bkId) === resolveBk(m.tripId, m.bkId) && isInc(x) && (m.pid ? x.pid === m.pid : !x.pid)).sort((a, b) => a.at.localeCompare(b.at));
    const stornati = new Set(pays.filter(x => x.storno).map(x => x.storno));
    const paid = pays.filter(x => x.tipo !== 'storno' && !stornati.has(x.id));
    // quanto risultava già pagato nella lista prima dell'app (colonna «pagato» del Word)
    const bk0 = t && deriveBookings(t).find(b => b.id === resolveBk(m.tripId, m.bkId)); const legacy = bk0 && !m.pid ? Math.max(0, bkMoney(t, bk0).paid - paidMovs(t.id, bk0.id)) : 0;
    const tot = +m.docTot || +m.tot; const paidTot = paid.reduce((a, x) => a + (+x.tot || 0), 0) + legacy;
    const pl = (legacy > 0.009 ? [`<Payment><Advance>true</Advance><Date>${xq(paid[0] ? paid[0].day : m.day)}</Date><Amount>${n2(legacy)}</Amount><Paid>true</Paid></Payment>`] : []).concat(paid.map(x => `<Payment><Advance>${x.tipo === 'acconto' ? 'true' : 'false'}</Advance><Date>${xq(x.day)}</Date><Amount>${n2(x.tot)}</Amount><Paid>true</Paid></Payment>`));
    if (tot - paidTot > 0.009) pl.push(`<Payment><Advance>false</Advance><Date>${xq((t && t.quota && t.quota.saldoEntro) || (t && t.data) || todayISO())}</Date><Amount>${n2(tot - paidTot)}</Amount><Paid>false</Paid></Payment>`);
    const met = (m.parts || [])[0] ? m.parts[0].m : ''; const pn = (C.pag || {})[met] || '';
    const note = [`Viaggi in Pullman · ${m.cliente}`, m.pratica ? 'pratica ' + m.pratica : '', `incasso del ${fmtDate(m.day)} (${(m.parts || []).map(p => MET_L[p.m] || p.m).join(' + ')}) registrato da ${m.who} · ${agName(m.ag)}`, m.note].filter(Boolean).join(' · ');
    return `<Document><DocumentType>I</DocumentType><Date>${todayISO()}</Date>`
      + xt('CustomerName', nome) + xt('CustomerAddress', F.ind) + xt('CustomerPostcode', F.cap) + xt('CustomerCity', F.citta) + xt('CustomerCountry', 'Italia')
      + (piva ? xt('CustomerVatCode', cf) : xt('CustomerFiscalCode', cf))
      + (isPec ? xt('CustomerPec', sdi) : xt('CustomerEInvoiceDestCode', sdi.toUpperCase()))
      + xt('CustomerEmail', cl && cl.email) + xt('CustomerCellPhone', (cl && cl.tel) || m.tel)
      + `<PricesIncludeVat>true</PricesIncludeVat>` + xt('PaymentName', pn) + xt('InternalComment', note)
      + `<Rows>${rows.join('')}</Rows><Payments>${pl.join('')}</Payments></Document>`;
  }
  function daneaFile(movs) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<EasyfattDocuments AppVersion="2" Creator="Viaggi in Pullman ${xq(VERSION)}"><Documents>${movs.map(daneaDoc).join('')}</Documents></EasyfattDocuments>\n`;
  }
  function daneaDownload(movs, name) {
    movs = movs.filter(m => m && m.doc === 'fattura' && m.tipo !== 'storno');
    if (!movs.length) return toast('Nessuna fattura da preparare');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([daneaFile(movs)], { type: 'application/xml' })); a.download = name.replace(/[\\/:*?"<>|]+/g, ' ').trim() + '.DefXml';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    movs.forEach(m => movPatch(m.id, { danea: new Date().toISOString(), daneaBy: ACC.me().name }));
    ACC.tlog('info', `Danea: preparate ${movs.length} ${movs.length === 1 ? 'fattura' : 'fatture'} (${movs.map(m => m.cliente).join(', ').slice(0, 200)})`);
    toast(`File per Danea scaricato: aprilo con un doppio clic (o in Danea: Documenti › Utilità › Importa documenti Easyfatt-Xml)`);
  }
  // segna sul movimento che la fattura è stata preparata per Danea (il movimento resta nel file del computer che l'ha creato)
  function movPatch(id, patch) {
    const hit = STORE.list('/cassa/movimenti/').find(([, d]) => d && (d.movs || []).some(x => x.id === id)); if (!hit) return;
    const [p, d] = hit; const cur = JSON.parse(JSON.stringify(d));
    cur.movs = cur.movs.map(x => x.id === id ? Object.assign(x, patch, { u: tick() }) : x); STORE.put(p, cur); render();
  }
  function daneaSettingsHTML() {
    const C = daneaCfg();
    return `<h2>Danea Easyfatt</h2><p class="sub">Servono al pulsante «Apri in Danea» delle fatture dei tour. I valori devono essere scritti esattamente come in Danea.</p>
      <div class="box form"><label>Codice IVA dei viaggi (tabella «Categorie Iva» di Danea)<input id="dn-iva" value="${esc(C.iva)}" placeholder="74ter"></label>
        <h3>Tipo di pagamento per metodo (tabella «Tipi pagamento» di Danea)</h3><div class="small">Lascia vuoto se non vuoi indicarlo: lo sceglierete in Danea.</div>
        ${METODI.map(([k, l]) => `<label class="kv"><span>${esc(l)}</span><input data-dnpag="${esc(k)}" value="${esc((C.pag || {})[k] || '')}" placeholder="es. ${esc(k === 'bonifico' ? 'Bonifico bancario' : k === 'contanti' ? 'Contanti' : k === 'pos' ? 'Bancomat / POS' : '')}"></label>`).join('')}
        <div><button class="btn primary" data-act="savedanea">Salva</button></div></div>
      <div class="box form"><h3>Codice prodotto Danea dei viaggi</h3><div class="small">Si scrive in ogni viaggio: «Modifica gita» › «Codice prodotto Danea» (es. 261018 boschi e zafferana 18/10/26). Se manca, la riga della fattura ha solo la descrizione.</div></div>`;
  }
  function daneaSave() {
    const pag = {}; $$('[data-dnpag]').forEach(i => { if (i.value.trim()) pag[i.dataset.dnpag] = i.value.trim(); });
    S.cfg.danea = { iva: ($('#dn-iva').value || '').trim() || '74ter', pag }; save(); toast('Impostazioni di Danea salvate');
  }

  // ---------- registratore telematico: preparazione allo scontrino diretto (2.1) ----------
  // L'invio vero al registratore sta nel file registratore.js (per ora non collegato).
  // Qui: impostazioni (tipi di pagamento e reparti del registratore), anteprima nel riquadro dell'incasso,
  // dati dello scontrino emesso sul movimento, file Danea degli scontrini del giorno.
  const RT_PARTS = [['bus', 'Quota viaggio / bus'], ['suppl', 'Supplemento fila'], ['dir', 'Diritti di prevendita']];
  const RT_DEF = () => ({ pag: {}, rep: {}, iva: {}, intest: {}, daneaScontrini: false });
  const rtCfg = () => { const c = Object.assign(RT_DEF(), S.cfg.rt || {}); c.pag = c.pag || {}; c.rep = c.rep || {}; c.iva = c.iva || {}; c.intest = c.intest || {}; return c; };
  const rtRep = (cat, k) => { const R = rtCfg().rep; return String(((R[cat] || {})[k]) || ((R['*'] || {})[k]) || '').trim(); };
  const rtPag = m => { const p = rtCfg().pag[m] || {}; return { n: String(p.n || '').trim(), d: String(p.d || '').trim() }; };
  const rr2 = v => Math.round((+v || 0) * 100) / 100;
  // IVA dei reparti (2.1.3): di base «NI non imponibile», come sullo scontrino dell'agenzia
  const RT_IVA = [['NI', 'NI · Non imponibile'], ['ES', 'ES · Esente'], ['NS', 'NS · Non soggetta'], ['22', '22%'], ['10', '10%'], ['5', '5%'], ['4', '4%']];
  const RT_IVA_SIG = { NI: ['I', '*NI Non imponibile'], ES: ['E', '*ES Esente'], NS: ['S', '*NS Non soggetta'] };
  const rtIva = k => { const v = String(rtCfg().iva[k] || 'NI'); return RT_IVA.some(([x]) => x === v) ? v : 'NI'; };
  // intestazione per l'anteprima (sullo scontrino vero la stampa il registratore)
  const RT_INT_DEF = { rg: 'LA TERRA VIAGGI IN PULLMAN SNC\nVIA ARCHIMEDE 285/C\n97100 - RAGUSA\nP.IVA 01622470886' };
  const rtIntest = ag => { const v = rtCfg().intest[ag]; return v != null ? String(v) : (RT_INT_DEF[ag] || 'LA TERRA VIAGGI IN PULLMAN SNC\nP.IVA 01622470886'); };
  // descrizione della riga come sullo scontrino dell'agenzia: «gita randazzo e floresta 08/11/26».
  // Lunghezza massima della descrizione sul registratore: 38 caratteri (da verificare con il manuale Custom).
  // Se è più lunga si accorcia il nome e si tiene sempre la data in fondo.
  const RT_DESC_MAX = 38;
  function rtFit(s, extra) {
    s = String(s || '').replace(/\s+/g, ' ').trim(); const x = extra ? ' ' + String(extra).replace(/\s+/g, ' ').trim().toLowerCase() : '';
    const m = s.match(/^(.*?)(\s\d{2}\/\d{2}\/\d{2,4})$/); const head = m ? m[1] : s; const tail = x + (m ? m[2] : '');
    if (head.length + tail.length <= RT_DESC_MAX) return head + tail;
    // «ridotto» che non ci sta diventa «rid.»
    if (x.length > 5 && !/\s/.test(x.trim())) return rtFit(s, x.trim().slice(0, 3) + '.');
    // si taglia tra una parola e l'altra e si tolgono virgole e parole corte rimaste in fondo («e», «le», «di»…)
    let h = head.slice(0, Math.max(0, RT_DESC_MAX - tail.length + 1)); const sp = h.lastIndexOf(' ');
    h = sp > 4 ? h.slice(0, sp) : h.slice(0, RT_DESC_MAX - tail.length);
    for (let i = 0; i < 3; i++) h = h.replace(/[\s,;:.\-–]+$/, '').replace(/\s(e|ed|o|di|del|della|dei|delle|da|a|al|alle|in|la|le|il|lo|gli|i|l'|con|per|su|tra|fra)$/i, '');
    return h.replace(/[\s,;:.\-–]+$/, '') + tail;
  }
  // cosa andrà sul registratore: righe della parte agenzia (bus, supplemento fila, diritti) e tipi di pagamento.
  // Se si incassa solo una parte del documento (acconto o saldo di quanto già pagato prima), sul registratore va una riga sola «Pagamento parziale» con l'importo della parte agenzia.
  function rtDraft(m) {
    const L = (m.lines || []).filter(l => +l.q); const cat = m.cat || '';
    const bus = rr2(L.reduce((a, l) => a + (+l.q) * (+l.bus || 0), 0)); const sup = rr2(+m.suppl || 0); const nT = +m.nT || L.reduce((a, l) => a + (+l.tkt ? +l.q : 0), 0); const dirT = rr2(nT * (+m.dir || 0));
    const full = rr2(bus + sup + dirT); const ag = rr2(m.agenzia != null ? m.agenzia : full);
    let righe = [];
    if (full > 0 && Math.abs(ag - full) < 0.01) {
      L.filter(l => +l.bus).forEach(l => righe.push({ part: 'bus', desc: rtFit(m.desc || 'viaggio', l.l && !/^intero$/i.test(String(l.l).trim()) ? l.l : ''), q: +l.q, prezzo: rr2(l.bus), reparto: rtRep(cat, 'bus'), iva: rtIva('bus') }));
      // supplemento fila: «2x4,00» se tutte le persone hanno lo stesso supplemento, altrimenti «1x» con il totale
      const sN = +m.supN > 1 && Math.abs(rr2(sup / m.supN) * m.supN - sup) < 0.005 ? +m.supN : 1;
      if (sup) righe.push({ part: 'suppl', desc: 'supplemento fila', q: sN, prezzo: rr2(sup / sN), reparto: rtRep(cat, 'suppl'), iva: rtIva('suppl') });
      if (dirT) righe.push({ part: 'dir', desc: 'diritti di prevendita', q: nT, prezzo: rr2(m.dir), reparto: rtRep(cat, 'dir'), iva: rtIva('dir') });
    } else if (ag > 0) righe.push({ part: 'bus', desc: rtFit((cat === 'Gita' ? 'saldo ' : 'pagamento parziale ') + (m.desc || 'viaggio')), q: 1, prezzo: ag, reparto: rtRep(cat, 'bus'), iva: rtIva('bus'), acconto: true });
    const totale = rr2(righe.reduce((a, r) => a + r.q * r.prezzo, 0));
    // pagamenti in proporzione alla parte agenzia (i biglietti del circuito restano fuori dallo scontrino)
    const parts = (m.parts || []).filter(p => +p.a); const tp = rr2(parts.reduce((a, p) => a + (+p.a), 0));
    let rest = totale; const pagamenti = parts.map((p, i) => { const imp = i === parts.length - 1 ? rr2(rest) : rr2(tp ? totale * p.a / tp : 0); rest = rr2(rest - imp); const P = rtPag(p.m); return { metodo: p.m, n: P.n, d: P.d, importo: imp }; });
    const avvisi = [];
    const used = new Set(righe.map(r => r.part));
    RT_PARTS.forEach(([k, l]) => { if (used.has(k) && !rtRep(cat, k)) avvisi.push(k === 'dir' ? 'Reparto dei diritti non impostato' : k === 'suppl' ? 'Reparto del supplemento fila non impostato' : 'Reparto della quota viaggio (bus) non impostato'); });
    pagamenti.forEach(p => { if (!p.n) avvisi.push(`Tipo di pagamento del registratore per «${MET_L[p.metodo] || p.metodo}» non impostato`); });
    return { righe, pagamenti, totale, avvisi };
  }
  // anteprima nel riquadro dell'incasso (solo per lo scontrino)
  function rtPreviewHTML(f) {
    if (!f || f.doc !== 'scontrino') return '';
    const T = payTotals(f); const imp = rr2(+f.imp || 0);
    const parts = f.met === 'misto' ? METODI.map(([k]) => ({ m: k, a: rr2(f.mix[k] || 0) })).filter(p => p.a > 0) : (imp ? [{ m: f.met, a: imp }] : []);
    const noSaldo = rtGitaParziale(f);
    const ag = imp > 0 && T.tot > 0 && !noSaldo ? rr2(imp * T.agenzia / T.tot) : T.agenzia;
    const parts2 = parts.length && !noSaldo ? parts : f.met !== 'misto' ? [{ m: f.met, a: ag }] : parts;
    const d = rtDraft({ lines: f.lines, suppl: T.sup, supN: f.supN, dir: f.dir, nT: T.nT, cat: f.cat, desc: f.desc, agenzia: ag, parts: parts2 });
    if (!d.righe.length) return '';
    return `<div class="pp-rt"><div class="pp-rt-h">${ICON.print} Anteprima dello scontrino</div>
      ${noSaldo ? `<div class="rt-warn rt-stop">${ICON.alert}<div>Per le gite lo scontrino si fa solo al saldo: incassa tutto quello che resta (${esc(money(rtDue(f)))}) oppure scegli «Senza documento».</div></div>` : ''}
      ${rtReceiptHTML(d, ACC.sess.ag)}
      ${d.avvisi.length ? `<div class="rt-warn">${ICON.alert}<div>${d.avvisi.map(esc).join('<br>')}<br><small>Si imposta in Impostazioni › Registratore telematico.</small></div></div>` : ''}</div>`;
  }
  // quanto resta da pagare (se la lista non lo sa, il totale delle righe)
  const rtDue = f => f.rest != null ? rr2(f.rest) : payTotals(f).tot;
  // gita con scontrino e importo più basso del dovuto: per le gite niente acconti, lo scontrino si fa solo al saldo
  function rtGitaParziale(f) {
    if (!f || f.doc !== 'scontrino' || !f.gita) return false;
    const imp = rr2(+f.imp || 0); const due = rtDue(f);
    return imp > 0 && due > 0 && imp < due - 0.009;
  }
  // lo scontrino disegnato come quello del registratore dell'agenzia (solo anteprima)
  const rtN = v => (+v || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rtSig = v => RT_IVA_SIG[v] ? RT_IVA_SIG[v][0] : v + '%';
  const rtPagL = (k, d) => k === 'contanti' ? 'CONTANTE' : ['pos', 'paypal', 'postepay'].includes(k) ? 'ELETTRONICO' : String(d || MET_L[k] || k).toUpperCase();
  function rtReceiptHTML(d, agId) {
    const ag = S.cfg.agenzie.find(a => a.id === agId) || {};
    const head = rtIntest(agId).split('\n').map(x => x.trim()).filter(Boolean);
    const ivaTot = rr2(d.righe.reduce((a, r) => { const p = parseFloat(r.iva); return a + (isNaN(p) ? 0 : r.q * r.prezzo * p / (100 + p)); }, 0));
    const sigs = [...new Set(d.righe.map(r => r.iva))].filter(v => RT_IVA_SIG[v]);
    const now = new Date(); const p2 = x => String(x).padStart(2, '0');
    const amt = (v, iva) => `<span class="rcp-p">${esc(rtN(v))}<i>${iva ? esc(rtSig(iva)) : ''}</i></span>`;
    const rows = d.righe.map(r => r.q > 1 || r.desc.length > 24
      ? `<div class="rcp-d">${esc(r.desc)}</div><div class="rcp-r"><span class="rcp-q">${r.q > 1 ? `${r.q}x${esc(rtN(r.prezzo))}` : ''}</span>${amt(r.q * r.prezzo, r.iva)}</div>`
      : `<div class="rcp-r"><span class="rcp-d1">${esc(r.desc)}</span>${amt(r.prezzo, r.iva)}</div>`).join('');
    return `<div class="rcp" role="img" aria-label="Anteprima dello scontrino: totale ${esc(rtN(d.totale))} euro">
      <div class="rcp-badge">ANTEPRIMA · non è un documento fiscale</div>
      <div class="rcp-c rcp-h">${head.map((x, i) => `<div${i === 0 ? ' class="rcp-big"' : ''}>${esc(x)}</div>`).join('')}</div>
      <div class="rcp-c rcp-dc"><div>DOCUMENTO COMMERCIALE</div><div class="rcp-s">di vendita o prestazione</div></div>
      <div class="rcp-r rcp-th"><span>DESCRIZIONE</span><span>PREZZO(€) IVA</span></div>
      ${rows}
      <div class="rcp-r rcp-tot"><span>TOTALE COMPLESSIVO</span><span>${esc(rtN(d.totale))}</span></div>
      <div class="rcp-r"><span>DI CUI IVA</span><span>${esc(rtN(ivaTot))}</span></div>
      ${d.pagamenti.map(p => `<div class="rcp-r"><span>PAGAMENTO ${esc(rtPagL(p.metodo, p.d))}</span><span>${esc(rtN(p.importo))}</span></div>`).join('')}
      <div class="rcp-r"><span>IMPORTO PAGATO</span><span>${esc(rtN(d.pagamenti.length ? d.pagamenti.reduce((a, p) => a + p.importo, 0) : d.totale))}</span></div>
      ${sigs.length ? `<div class="rcp-leg">${sigs.map(v => `<div>${esc(RT_IVA_SIG[v][0])}: ${esc(RT_IVA_SIG[v][1])}</div>`).join('')}</div>` : ''}
      <div class="rcp-r rcp-ft"><span>${p2(now.getDate())}/${p2(now.getMonth() + 1)}/${String(now.getFullYear()).slice(2)} ${p2(now.getHours())}:${p2(now.getMinutes())}</span><span>DOC. ----</span></div>
      <div class="rcp-c rcp-rt"><i>RT</i> ${esc(ag.rtMatricola || '··········')}</div></div>`;
  }
  // emissione: chiede a registratore.js e scrive nel registro l'esito (per ora sempre «non ancora collegato»)
  async function fiscalPrint(mv) {
    const ag = S.cfg.agenzie.find(a => a.id === mv.ag) || {}; const d = rtDraft(mv);
    let r;
    try { r = window.VIP_REGISTRATORE && VIP_REGISTRATORE.emettiScontrino ? await VIP_REGISTRATORE.emettiScontrino(mv, { agenzia: { id: ag.id, nome: ag.nome, rtIp: ag.rtIp || '', rtMatricola: ag.rtMatricola || '' }, scontrino: d }) : { ok: false, msg: 'file registratore.js mancante' }; }
    catch (e) { r = { ok: false, msg: 'errore: ' + (e && e.message || e) }; }
    r = r || { ok: false, msg: 'nessuna risposta' };
    ACC.tlog(r.ok ? 'info' : 'avviso', `Registratore ${agName(mv.ag)}${ag.rtIp ? ' (' + ag.rtIp + ')' : ''}: scontrino di ${money(d.totale)} · ${mv.cliente} · esito: ${r.ok ? 'emesso' + (r.numero ? ' n. ' + r.numero : '') : r.msg}`);
    DIAG.ev(r.ok ? 'azione' : 'avviso', `Scontrino ${r.ok ? 'emesso' : 'non emesso'}: ${r.msg || ''}`, { mov: mv.id, totale: d.totale });
    if (r.ok) movPatch(mv.id, { docStato: 'emesso', rt: { chiusura: r.chiusura || '', numero: r.numero || '', dataOra: r.dataOra || new Date().toISOString(), matricola: r.matricola || ag.rtMatricola || '', esito: 'emesso' } });
    else movPatch(mv.id, { rt: Object.assign({ chiusura: '', numero: '', dataOra: '', matricola: '' }, mv.rt || {}, { esito: r.msg || 'non emesso' }) });
    return r;
  }
  // dati dello scontrino emesso (quando ci sono): «Scontrino n. 0012-0034 · chiusura 0012 · 29/10 16:30»
  function rtInfo(m) {
    const x = m.rt && m.rt.numero ? m.rt : null; const rif = m.rtRif && m.rtRif.numero ? m.rtRif : null; if (!x && !rif) return '';
    const dt = v => { const d = new Date(v); return isNaN(d) ? '' : `${fmtDate(dayISO(d)).slice(0, 5)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
    return x ? `Scontrino n. ${x.numero}${x.chiusura ? ' · chiusura ' + x.chiusura : ''}${x.dataOra ? ' · ' + dt(x.dataOra) : ''}${x.matricola ? ' · ' + x.matricola : ''}` : `Storno dello scontrino n. ${rif.numero}${rif.chiusura ? ' (chiusura ' + rif.chiusura + ')' : ''}`;
  }

  // ---- Impostazioni › Registratore telematico ----
  function rtSettingsHTML() {
    const C = rtCfg(); const rep = (key, k) => `<input class="rt-in" data-rtrep="${esc(key)}" data-k="${esc(k)}" value="${esc(((C.rep[key] || {})[k]) || '')}" inputmode="numeric" placeholder="${esc(key === '*' ? 'n°' : 'come sopra')}" aria-label="Reparto ${esc(key)} ${k}">`;
    return `<h2>Registratore telematico</h2><p class="sub">Preparazione allo scontrino diretto dall'app (Custom Q3X-F, uno per agenzia). L'indirizzo e la matricola di ogni registratore si scrivono in Impostazioni › Agenzie e casse. Per ora l'app non manda nulla al registratore: gli scontrini restano «da emettere» come prima.</p>
      <div class="box form"><h3>Tipi di pagamento del registratore</h3><div class="small">Per ogni metodo dell'app, il numero e la descrizione del pagamento come sono programmati sul registratore (es. 1 Contanti, 8 Bancomat).</div>
        <table class="rt rt-tab"><thead><tr><th>Metodo nell'app</th><th>N° sul registratore</th><th>Descrizione sul registratore</th></tr></thead><tbody>
        ${METODI.map(([k, l]) => `<tr><td>${esc(l)}</td><td><input class="rt-in" data-rtpag="${esc(k)}" data-k="n" value="${esc((C.pag[k] || {}).n || '')}" inputmode="numeric" placeholder="n°" aria-label="Numero pagamento ${esc(l)}"></td><td><input class="rt-in wide" data-rtpag="${esc(k)}" data-k="d" value="${esc((C.pag[k] || {}).d || '')}" placeholder="es. ${esc(k === 'contanti' ? 'Contanti' : k === 'pos' ? 'Bancomat' : l)}" aria-label="Descrizione pagamento ${esc(l)}"></td></tr>`).join('')}
        </tbody></table>
        <div class="rt-note">${ICON.alert}<span>Bonifico, PayPal, Buono regalo e Voucher: da verificare con il commercialista.</span></div></div>
      <div class="box form"><h3>Reparti del registratore</h3><div class="small">Il numero del reparto per ogni parte dello scontrino. La prima riga vale per tutte le categorie; nelle righe sotto si scrive solo dove una categoria usa un reparto diverso (vuoto = come la prima riga).</div>
        <table class="rt rt-tab"><thead><tr><th>Categoria</th>${RT_PARTS.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>
        <tr class="rt-all"><td><b>Tutte le categorie</b></td>${RT_PARTS.map(([k]) => `<td>${rep('*', k)}</td>`).join('')}</tr>
        ${CATS.map(c => `<tr><td>${esc(c)}</td>${RT_PARTS.map(([k]) => `<td>${rep(c, k)}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
      <div class="box form"><h3>IVA dei reparti</h3><div class="small">Come è programmato ogni reparto sul registratore. Serve per l'anteprima dello scontrino (riga «di cui IVA» e lettera accanto al prezzo). Sullo scontrino dell'agenzia le gite sono «NI · Non imponibile».</div>
        <div class="rt-int rt-ivag">${RT_PARTS.map(([k, l]) => `<label>${esc(l)}<select class="rt-sel" data-rtiva="${esc(k)}" aria-label="IVA del reparto ${esc(l)}">${RT_IVA.map(([v, t]) => `<option value="${esc(v)}"${rtIva(k) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="rt-note">${ICON.alert}<span>Diritti di prevendita: l'IVA giusta va verificata con il commercialista.</span></div></div>
      <div class="box form"><h3>Intestazione dello scontrino</h3><div class="small">Le righe in alto, come sono programmate su ogni registratore. Servono solo per l'anteprima: sullo scontrino vero l'intestazione la stampa il registratore da solo.</div>
        <div class="rt-int">${S.cfg.agenzie.map(a => `<label>${esc(a.nome)}<textarea class="rt-ta" data-rtint="${esc(a.id)}" rows="4" spellcheck="false" aria-label="Intestazione dello scontrino di ${esc(a.nome)}">${esc(rtIntest(a.id))}</textarea></label>`).join('')}</div></div>
      <div class="box form"><h3>File Danea degli scontrini</h3>
        <label class="kv"><span><b>Pulsante «Scontrini del giorno per Danea»</b> nel resoconto giornaliero<br><small>Accendilo solo dopo la prova di importazione: Danea deve registrare gli scontrini senza rimandarli al registratore.</small></span><input type="checkbox" class="sw" id="rt-dan"${C.daneaScontrini ? ' checked' : ''}></label></div>
      <div><button class="btn primary" data-act="savert">Salva</button></div>`;
  }
  function rtSave() {
    const C = { pag: {}, rep: {}, iva: {}, intest: {}, daneaScontrini: !!($('#rt-dan') && $('#rt-dan').checked) };
    $$('[data-rtiva]').forEach(i => { C.iva[i.dataset.rtiva] = i.value; });
    $$('[data-rtint]').forEach(i => { C.intest[i.dataset.rtint] = i.value.split('\n').map(x => x.trim()).filter(Boolean).join('\n'); });
    $$('[data-rtpag]').forEach(i => { const v = i.value.trim(); if (!v) return; (C.pag[i.dataset.rtpag] = C.pag[i.dataset.rtpag] || {})[i.dataset.k] = v; });
    $$('[data-rtrep]').forEach(i => { const v = i.value.trim(); if (!v) return; (C.rep[i.dataset.rtrep] = C.rep[i.dataset.rtrep] || {})[i.dataset.k] = v; });
    S.cfg.rt = C; save(); ACC.tlog('info', `Impostazioni del registratore salvate (pagamenti: ${Object.keys(C.pag).length}, reparti: ${Object.keys(C.rep).length}, file Danea scontrini: ${C.daneaScontrini ? 'acceso' : 'spento'})`); toast('Impostazioni del registratore salvate'); render();
  }

  // ---- Danea: scontrini del giorno come «Vendita al banco» ----
  function daneaScontrini(movs, name) {
    const st = new Set(movs.filter(x => x.storno).map(x => x.storno));
    const scon = movs.filter(m => m.doc === 'scontrino' && m.tipo !== 'storno');
    const ok = scon.filter(m => !st.has(m.id)); const fuori = scon.filter(m => st.has(m.id));
    if (!ok.length && !fuori.length) return toast('Nessuno scontrino in questo giorno');
    const C = daneaCfg();
    const doc = m => { const d = rtDraft(m); const t = S.trips.find(x => x.id === m.tripId);
      const rows = d.righe.map(r => `<Row>${xt('Code', (r.part === 'bus' && t && t.codDanea) || '')}${xt('Description', r.desc)}<Qty>${r.q}</Qty><Price>${n2(r.prezzo)}</Price><VatCode>${xq(C.iva)}</VatCode></Row>`).join('');
      const pays = d.pagamenti.map(p => `<Payment><Advance>false</Advance><Date>${xq(m.day)}</Date><Amount>${n2(p.importo)}</Amount><Paid>true</Paid></Payment>`).join('');
      const met = (m.parts || [])[0] ? m.parts[0].m : ''; const pn = (C.pag || {})[met] || MET_L[met] || '';
      const note = [`Viaggi in Pullman · scontrino del ${fmtDate(m.day)} ${hm(m.at)}`, rtInfo(m), `${(m.parts || []).map(p => MET_L[p.m] || p.m).join(' + ')} · ${m.who} · ${agName(m.ag)}`].filter(Boolean).join(' · ');
      return `<Document><DocumentType>B</DocumentType><Date>${xq(m.day)}</Date>${xt('CustomerName', m.cliente)}<PricesIncludeVat>true</PricesIncludeVat>${xt('PaymentName', pn)}${xt('InternalComment', note)}<Rows>${rows}</Rows><Payments>${pays}</Payments></Document>`; };
    if (ok.length) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<EasyfattDocuments AppVersion="2" Creator="Viaggi in Pullman ${xq(VERSION)}"><Documents>${ok.map(doc).join('')}</Documents></EasyfattDocuments>\n`;
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' })); a.download = name.replace(/[\\/:*?"<>|]+/g, ' ').trim() + '.DefXml';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      ok.forEach(m => movPatch(m.id, { danea: new Date().toISOString(), daneaBy: ACC.me().name }));
    }
    ACC.tlog('info', `Danea: file degli scontrini «${name}» · ${ok.length} scontrini${fuori.length ? ` · ${fuori.length} stornati lasciati fuori` : ''}`);
    if (fuori.length) openModal('Scontrini stornati', `<div class="warnbox">${ok.length ? `Nel file ci sono ${ok.length} scontrini. ` : 'Nessuno scontrino nel file. '}Questi scontrini sono stati stornati e <b>non</b> sono nel file: vanno sistemati a mano in Danea.</div>
      <table class="rt"><thead><tr><th>Ora</th><th>Cliente</th><th class="r">Importo</th><th>Scontrino</th></tr></thead><tbody>${fuori.map(m => `<tr><td>${esc(hm(m.at))}</td><td>${esc(m.cliente)}</td><td class="r">${money(m.agenzia != null ? m.agenzia : m.tot)}</td><td>${esc(rtInfo(m) || 'da emettere')}</td></tr>`).join('')}</tbody></table>`, `<button class="btn primary" data-act="close">Ho capito</button>`);
    else toast(`File per Danea scaricato: ${ok.length} scontrini (aprilo con un doppio clic)`);
  }

  // ---------- impostazioni a sezioni ----------
  const SSEC = [
    ['account', 'Il mio account', 'A', '#6E6E73', null],
    ['gesti', 'Gesti e scorciatoie', 'G', '#7A4DD8', null],
    ['utenti', 'Operatori e permessi', 'O', '#D90D36', 'users'],
    ['agenzie', 'Agenzie e casse', '€', '#2DA160', 'settings'],
    ['luoghi', 'Luoghi di partenza e mappe', 'M', '#0A6CD6', 'settings'],
    ['whatsapp', 'WhatsApp ai clienti', 'W', '#1FA855', 'settings'],
    ['danea', 'Danea Easyfatt', 'D', '#E07B00', 'settings'],
    ['registratore', 'Registratore telematico', 'R', '#5B6B7F', 'settings'],
    ['suppl', 'Supplementi file', 'F', '#C2410C', 'settings'],
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
    else if (sec === 'gesti') body = gestSettingsHTML();
    else if (sec === 'utenti') {
      const list = Object.entries(ACC.users()).filter(([, u]) => u.role !== 'super' || ACC.role() === 'super').sort((a, b) => (a[1].active === false) - (b[1].active === false) || a[1].name.localeCompare(b[1].name));
      body = `<div class="sh"><div><h2>Operatori e permessi</h2><p class="sub">Chi può entrare, con quale ruolo e in quali agenzie. Senza agenzie spuntate, l'account può entrare in tutte.</p></div><button class="btn primary" data-act="unew">${ICON.plus} Nuovo account</button></div>
        <div class="box tablecard"><div class="tscroll"><table class="rt users"><thead><tr><th>Account</th><th>Sigla</th><th>Cellulare</th><th>Ruolo</th>${S.cfg.agenzie.map(a => `<th class="ctr">${esc(a.nome)}</th>`).join('')}<th>Attivo</th><th></th></tr></thead><tbody>
        ${list.map(([id, u]) => { const self = id === ACC.sess.uid; const lockRole = self || (u.role === 'master' && ACC.role() !== 'super' && false); return `<tr class="${esc(u.active === false ? 'off' : '')}"><td><span class="av">${esc((u.name || '?')[0].toUpperCase())}</span> <b>${esc(u.name)}</b>${self ? ' <small>(tu)</small>' : ''}${u.mustChange ? '<br><small>deve cambiare la password</small>' : ''}</td><td><input class="code-in" data-usig="${esc(id)}" value="${esc(u.sigla || '')}" maxlength="3" placeholder="${esc(String(u.name || '').slice(0, 2).toUpperCase())}" aria-label="Sigla di ${esc(u.name)} nel resoconto (colonna Op.)"></td><td><input class="cell-in" data-ucell="${esc(id)}" value="${esc(u.cell || '')}" inputmode="tel" autocomplete="off" placeholder="facoltativo" aria-label="Cellulare di ${esc(u.name)}"></td>
          <td>${u.role === 'super' ? 'Super Master' : `<select data-urole="${esc(id)}" aria-label="Ruolo di ${esc(u.name)}"${lockRole ? ' disabled' : ''}>${['operatore', 'master', 'contabilita'].map(r => `<option value="${esc(r)}"${u.role === r ? ' selected' : ''}>${ROLE_L[r]}</option>`).join('')}</select>`}</td>
          ${S.cfg.agenzie.map(a => `<td class="ctr"><input type="checkbox" class="sw" data-uag="${esc(id)}" data-ag="${esc(a.id)}"${(u.agencies || []).includes(a.id) ? ' checked' : ''} aria-label="${esc(u.name)} in ${esc(a.nome)}"${u.role === 'super' || u.role === 'contabilita' ? ' disabled' : ''}></td>`).join('')}
          <td class="ctr"><input type="checkbox" class="sw" data-uact="${esc(id)}"${u.active !== false ? ' checked' : ''}${self || u.role === 'super' ? ' disabled' : ''} aria-label="${esc(u.name)} attivo"></td>
          <td class="r">${u.role === 'super' && ACC.role() !== 'super' ? '' : `<button class="btn sm" data-act="ureset" data-id="${esc(id)}">Reimposta password</button>`}</td></tr>`; }).join('')}
        </tbody></table></div></div>
        <div class="two"><div class="box form"><h3>Cosa può fare ogni ruolo</h3><ul class="small ul"><li><b>Operatore</b>: liste, posti sul bus, anagrafica, incassi e resoconto della sua agenzia, messaggi ai clienti.</li><li><b>Master</b>: tutto quello dell'operatore, più contabilità, impostazioni e account.</li><li><b>Contabilità</b>: vede cassa e contabilità di tutte le agenzie, senza modificare.</li></ul></div>
        <div class="box form"><h3>Password dimenticata</h3><div class="small">Premi «Reimposta password»: scegli una password provvisoria e dilla alla persona. Al primo accesso l'app le chiede di sceglierne una nuova.</div></div></div>`;
    } else if (sec === 'agenzie') body = `<h2>Agenzie e casse</h2><p class="sub">Ogni agenzia ha la sua cassa: gli incassi vanno nella cassa dell'agenzia scelta all'accesso.</p>
      ${S.cfg.agenzie.map((a, i) => `<div class="box form agf"><div class="grid3"><label>Agenzia<input data-cfgag="${i}" data-k="nome" value="${esc(a.nome)}"></label><label>Nome della cassa<input data-cfgag="${i}" data-k="cassa" value="${esc(a.cassa || '')}"></label><label>Indirizzo<input data-cfgag="${i}" data-k="indirizzo" value="${esc(a.indirizzo || '')}" placeholder="via, numero, città"></label></div><div class="grid3"><label>Contanti in cassa all'inizio (riporto) €<input data-cfgag="${i}" data-k="cassaIniziale" inputmode="decimal" value="${esc(a.cassaIniziale || '')}" placeholder="0"></label><span class="small" style="grid-column:span 2;align-self:end">Il fondo cassa da cui parte il conto dei contanti nel resoconto giornaliero (colonna «Saldo» del foglio CASSA).</span></div><div class="grid3"><label>Telefono dell'agenzia<input data-cfgag="${i}" data-k="tel" value="${esc(a.tel || '')}" inputmode="tel" autocomplete="off" placeholder="es. 0932 000000"></label><span class="small" style="grid-column:span 2;align-self:end">Compare agli altri operatori quando manca internet, per sentirsi al telefono prima di vendere posti o incassare (se l'operatore ha un cellulare nel suo account, si mostra quello). Il telefono dei messaggi WhatsApp resta quello di Impostazioni › WhatsApp.</span></div><div class="grid3"><label>Indirizzo del registratore telematico<input data-cfgag="${i}" data-k="rtIp" value="${esc(a.rtIp || '')}" placeholder="es. 192.168.1.50" inputmode="decimal" autocomplete="off"></label><label>Matricola del registratore (facoltativa)<input data-cfgag="${i}" data-k="rtMatricola" value="${esc(a.rtMatricola || '')}" placeholder="es. 99MEY012345" autocomplete="off"></label><span class="small" style="align-self:end">Custom Q3X-F collegato al router dell'agenzia. Per ora l'app non lo usa: serve per il collegamento diretto.</span></div></div>`).join('')}`;
    else if (sec === 'luoghi') body = `<div class="sh"><div><h2>Luoghi di partenza e mappe</h2><p class="sub">Per ogni punto di salita incolla il link di Google Maps: nel messaggio WhatsApp il cliente lo tocca e trova il punto preciso. Il codice è quello della colonna «part» della lista (es. RG, MD). Il colore serve a evidenziare la partenza nella lista dell'accompagnatore.</p></div><button class="btn primary" data-act="lnew">${ICON.plus} Aggiungi luogo</button></div>
      <div class="box tablecard"><div class="tscroll"><table class="rt luoghi"><thead><tr><th>Codice</th><th>Città</th><th>Punto di salita</th><th>Colore</th><th>Link Google Maps</th><th></th></tr></thead><tbody>
      ${(S.cfg.luoghi || []).map((l, i) => `<tr><td><input data-cfgl="${i}" data-k="code" value="${esc(l.code || '')}" placeholder="RG" aria-label="Codice" class="code-in"></td><td><input data-cfgl="${i}" data-k="citta" value="${esc(l.citta || '')}" placeholder="Ragusa" aria-label="Città"></td><td><input data-cfgl="${i}" data-k="luogo" value="${esc(l.luogo || '')}" placeholder="es. Palazama" aria-label="Punto di salita"></td><td class="nowrap"><span class="lcolw"><i class="lcold" style="background:${esc(LCOL_HEX[lcolKey(l)] || 'transparent')}"></i><select data-cfgl="${i}" data-k="colore" aria-label="Colore nella lista dell'accompagnatore">${LCOL.map(([k, lab]) => `<option value="${esc(k)}"${lcolKey(l) === k ? ' selected' : ''}>${esc(lab)}</option>`).join('')}</select></span></td><td><input data-cfgl="${i}" data-k="maps" value="${esc(l.maps || '')}" placeholder="https://maps.app.goo.gl/…" aria-label="Link Google Maps"></td>
        <td class="r nowrap"><a class="btn sm" href="${esc(safeUrl(l.maps) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([l.luogo, l.citta].filter(Boolean).join(', '))}`)}" target="_blank" rel="noopener">${safeUrl(l.maps) ? 'Prova il link' : 'Cerca su Maps'}</a><button class="kebab" data-act="ldel" data-i="${i}" aria-label="Togli">${ICON.close}</button></td></tr>`).join('') || '<tr><td colspan="6" class="emptyrow">Nessun luogo: premi «Aggiungi luogo».</td></tr>'}
      </tbody></table></div></div>
      <div class="box form"><h3>Come si prende il link</h3><ol class="small ul"><li>Premi «Cerca su Maps» accanto al luogo: si apre Google Maps.</li><li>Clicca sul punto esatto della fermata, poi su <b>Condividi</b> › <b>Copia link</b>.</li><li>Torna qui e incolla il link nella colonna «Link Google Maps».</li></ol></div>`;
    else if (sec === 'whatsapp') { const c = waCfg(); body = `<h2>WhatsApp ai clienti</h2>
      <div class="box form"><h3>Testo del messaggio «a mano»</h3><textarea id="s-wa" style="min-height:190px">${esc(S.cfg.waTemplate || DEFAULT_WA)}</textarea>
      <span class="small">Le parole tra graffe si riempiono con i dati del cliente; una riga che resta vuota non viene mandata. Clicca per inserirle:</span><div class="chips">${WA_PH.map(p => `<code data-act="insph" data-p="${esc(p)}">{${p}}</code>`).join('')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="savewa">Salva il testo</button><button class="btn" data-act="resetwa">Ripristina il testo standard</button></div></div>
      <div class="box form"><h3>Telefono dell'agenzia nel messaggio</h3><input id="s-tel" value="${esc(S.cfg.telAgenzia || '')}" placeholder="es. 0932 000000"><div><button class="btn" data-act="savetel">Salva</button></div></div>
      <div class="box form"><h3>Invio automatico</h3><div class="small">${waReady(c) ? '<span class="pill ok">Attivo</span> I codici di Meta sono inseriti.' : '<span class="pill tbd">Non ancora attivo</span> I codici di Meta li inserisce il tecnico dal Super Master.'}</div>${WA_GUIDE()}</div>`; }
    else if (sec === 'sync') { const st = STORE.status(); body = `<h2>Sincronizzazione</h2><p class="sub">I dati stanno nella cartella Dropbox «Applicazioni › Viaggi in Pullman La Terra» e su ogni computer collegato.</p>
      <div class="box form"><div class="kv"><span>Stato</span><b>${!st.hasKey ? 'Dropbox non configurato (manca la chiave in config.js)' : st.linked ? (st.error ? 'Errore: ' + esc(st.error) : st.pending ? `${st.pending} modifiche da inviare` : 'Tutto sincronizzato') : 'Non collegato: i dati restano solo su questo computer'}</b></div>
        <div class="kv"><span>Ultima sincronizzazione</span><b>${st.last ? esc(st.last.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })) : '—'}</b></div><div class="kv"><span>Questo computer</span><b>${esc(STORE.device.id)}</b></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${st.linked ? '<button class="btn" data-act="syncnow">Sincronizza adesso</button>' : st.hasKey ? '<button class="btn primary" data-act="glink">Collega Dropbox</button>' : ''}</div></div>`; }
    else if (sec === 'danea') body = daneaSettingsHTML();
    else if (sec === 'registratore') body = rtSettingsHTML();
    else if (sec === 'suppl') { const C = supplCfg(); const row = (k, l) => `<tr><td>${l}</td>${['tour', 'gita'].map(c => `<td><span class="sp-in"><input class="rt-in" data-spc="${esc(c)}" data-k="${esc(k)}" inputmode="decimal" value="${esc(String(C[c][k] ?? '').replace('.', ','))}" aria-label="${esc(l)} ${c}"><i>€</i></span></td>`).join('')}</tr>`;
      body = `<h2>Supplementi file</h2><p class="sub">Il prezzario fisso dei posti nelle prime file. Vale per tutti i tour e le gite in giornata (non per eventi e biglietteria); nella lista la fila si sceglie dalla colonna «fila» e il supplemento entra da solo nel prezzo della persona.</p>
        <div class="box form"><table class="rt rt-tab sp-tab"><thead><tr><th>Posto</th><th>Tour <small>a persona, al giorno</small></th><th>Gite in giornata <small>a persona</small></th></tr></thead><tbody>
        ${row(1, '1ª fila')}${row(2, '2ª fila')}${row(3, '3ª fila')}${row(4, '4ª fila')}${row('p2', '1ª fila 2ª porta')}</tbody></table>
        <div class="small">Esempio: tour di 3 giorni in 1ª fila = 3 × ${esc(fmtNum(C.tour[1]))} € = ${esc(fmtNum(3 * C.tour[1]))} € a persona.</div>
        <div><button class="btn primary" data-act="savesuppl">Salva</button></div></div>`; }
    else if (sec === 'backup') body = `<h2>Copia di sicurezza</h2><p class="sub">Dropbox tiene già tutto, anche le versioni precedenti dei file. Qui puoi scaricare una copia completa o recuperare i dati della versione di prova.</p>
      <div class="box form"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="export">Scarica una copia</button><label class="btn" for="s-restore">Recupera da una copia (anche della versione OnBoard)<input id="s-restore" type="file" accept=".json,application/json" hidden></label></div>
      <div class="small">Recuperando una copia, i viaggi si aggiungono a quelli che ci sono già: se un viaggio dell'elenco 2027 è ancora vuoto, la lista della copia ci entra dentro.</div></div>`;
    return `<div class="setp"><nav class="snav" aria-label="Sezioni delle impostazioni"><h1>Impostazioni</h1>
        <div class="sme"><span class="av">${esc((me.name || '?')[0].toUpperCase())}</span><span><b>${esc(me.name)}</b><br><small>${esc(ROLE_L[me.role])}</small></span></div>
        ${secs.map(([k, l, i, c]) => `<button class="sitem" data-act="ssec" data-v="${esc(k)}" aria-current="${esc(UI.ssec === k ? 'page' : 'false')}"><span class="sic" style="background:${esc(c)}" aria-hidden="true">${i}</span>${esc(l)}</button>`).join('')}
        <div class="small sver">Versione ${esc(VERSION)}</div></nav><section class="sbody">${body}</section></div>`;
  }
  function userModal(id) {
    const u = id ? ACC.users()[id] : null;
    if (u && u.role === 'super' && ACC.role() !== 'super') return;
    if (!ACC.can('users')) return;
    UI.modal = { kind: 'user', id };
    openModal(u ? `Reimposta la password · ${esc(u.name)}` : 'Nuovo account', `
      ${u ? '' : `<div class="field"><label for="nu-n">Nome dell'account</label><input id="nu-n" autocomplete="off" placeholder="es. Giulia"></div>
      <div class="field"><label for="nu-r">Ruolo</label><select id="nu-r">${['operatore', 'master', 'contabilita'].map(r => `<option value="${esc(r)}">${ROLE_L[r]}</option>`).join('')}</select></div>
      <div class="field"><label>Agenzie in cui può entrare</label><div class="chips">${S.cfg.agenzie.map(a => `<label class="chk"><input type="checkbox" data-nuag="${esc(a.id)}"> ${esc(a.nome)}</label>`).join('')}</div><span class="small">Nessuna spunta = tutte le agenzie.</span></div>
      <div class="field"><label for="nu-c">Cellulare (facoltativo)</label><input id="nu-c" inputmode="tel" autocomplete="off" placeholder="es. 333 000 0000"><span class="small">Si mostra agli altri operatori solo quando manca internet, per sentirsi al telefono.</span></div>`}
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
    const nid = await ACC.create(n, pw, $('#nu-r').value, ags); ACC.users()[nid].mustChange = true; { const c = ($('#nu-c') && $('#nu-c').value || '').trim(); if (c) ACC.users()[nid].cell = c; } save();
    ACC.tlog('info', `Creato l'account «${n}» (${ROLE_L[$('#nu-r').value]})`); closeModal(); render(); toast(`Account «${n}» creato`);
  }

  // ---------- Super Master (solo il tecnico) ----------
  function superView() {
    const days = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); days.push(dayISO(d)); }
    const ev = STORE.list('/registro/').filter(([p]) => days.some(d => p.includes('/' + d + '_'))).flatMap(([p, d]) => (d.ev || []).map(e => Object.assign({ dev: d.dev || p.split('_').pop().replace('.json', '') }, e)))
      .filter(e => UI.lgf !== 'err' || e.lv !== 'info').sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300);
    const c = waCfg(); const st = STORE.status();
    return `<div class="sup"><div class="pagehead"><div><h1>Super Master</h1><div class="sub">Invisibile agli altri account · ${st.linked ? 'Dropbox collegato' : 'solo su questo computer'} · versione ${esc(VERSION)}</div></div><div class="hbtns"><button class="btn" data-act="lexport">Scarica il registro</button><button class="btn" data-act="logout">Esci</button></div></div>
      <div class="two"><section class="box sup-log" aria-label="Log tecnico"><div class="sh"><h2>Log tecnico · ultimi 7 giorni</h2><div class="seg"><button data-act="lgf" data-v="all" aria-pressed="${esc(UI.lgf !== 'err')}">Tutto</button><button data-act="lgf" data-v="err" aria-pressed="${esc(UI.lgf === 'err')}">Errori e avvisi</button></div></div>
        <div class="logl">${ev.map(e => `<div class="lg ${esc(e.lv)}"><span>${esc(dayISO(new Date(e.at)).slice(5).split('-').reverse().join('/'))} ${esc(hm(e.at))}</span><span class="lv">${esc(e.lv.toUpperCase())}</span><span>${esc(e.who ? e.who + ' · ' : '')}${esc(e.ag ? agName(e.ag) + ' · ' : '')}${esc(e.m)}<small> · ${esc(e.dev)}</small></span></div>`).join('') || '<div class="small">Niente nel registro.</div>'}</div></section>
        <div class="sup-col">${diagBox()}<section class="box form"><h2>Password e account</h2>
          ${Object.entries(ACC.users()).filter(([id]) => id !== ACC.sess.uid).map(([id, u]) => `<div class="kv"><span><b>${esc(u.name)}</b> · ${esc(ROLE_L[u.role])}${u.active === false ? ' · disattivato' : ''}</span><button class="btn sm" data-act="ureset" data-id="${esc(id)}">Reimposta</button></div>`).join('') || '<div class="small">Nessun altro account.</div>'}
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn danger" data-act="resetall">Reimposta tutte le password, Master compresi</button><button class="btn" data-act="unewm">+ Nuovo Master</button></div></section>
        <section class="box form"><h2>Solo per il tecnico</h2>
          <label class="kv"><span><b>Modalità manutenzione</b><br><small>Gli altri account non possono entrare finché è attiva</small></span><input type="checkbox" class="sw" data-maint="1"${S.cfg.maint ? ' checked' : ''}></label>
          <div class="kv"><span><b>Sincronizzazione</b><br><small>${st.linked ? `${st.pending} modifiche in attesa${st.error ? ' · errore ' + esc(st.error) : ''}` : 'Dropbox non collegato'}</small></span>${st.linked ? '<button class="btn sm" data-act="syncnow">Sincronizza</button>' : ''}</div>
          <div class="kv"><span><b>Copia di questo computer</b><br><small>Cancella i dati salvati qui e li riscarica da Dropbox (le modifiche non inviate si perdono)</small></span><button class="btn sm danger" data-act="wipelocal"${st.linked ? '' : ' disabled'}>Riscarica</button></div></section>
        <section class="box form"><h2>Chiavi e collegamenti</h2><div class="small">Codici dell'invio automatico WhatsApp (Meta). Si salvano in Dropbox e servono a tutti i computer per l'invio: sullo schermo li vede solo il Super Master, ma restano salvati su ogni computer collegato. Usate un token con i soli permessi WhatsApp e rigeneratelo se un computer si perde.</div>${waSettingsHTML()}<div><button class="btn primary" data-act="savekeys">Salva le chiavi</button></div></section></div></div></div>`;
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
      const q = v => `"${csvSafe(v).replace(/"/g, '""')}"`;
      const KL = { avvio: 'Avvio', accesso: 'Accesso', pagina: 'Pagina aperta', azione: 'Pulsante', campo: 'Campo modificato', modulo: 'Modulo', trascina: 'Trascinamento', finestra: 'Finestra', avviso: 'Messaggio mostrato', salva: 'Salvataggio', sync: 'Sincronizzazione', 'sync-unione': 'Unione con altro computer', 'sync-conflitto': 'Conflitto risolto automaticamente', 'sync-errore': 'ERRORE sincronizzazione', rete: 'Rete', 'rete-errore': 'ERRORE rete', 'rete-lenta': 'Rete lenta', errore: 'ERRORE programma', 'console-error': 'ERRORE console', 'console-warn': 'Avviso console', lento: 'Rallentamento', stato: 'Stato', diagnostica: 'Diagnostica', 'registro-info': 'Registro', 'registro-avviso': 'Registro · avviso', 'registro-errore': 'ERRORE registro' };
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

  // ---------- gesti e scorciatoie (personali: ogni operatore sceglie i suoi in Impostazioni › Gesti e scorciatoie) ----------
  // Mouse e trackpad: cosa succede facendo clic sul numero della riga (da solo, doppio, con ⌘, Maiusc o ⌥) e con il tasto destro.
  // Tastiera: combinazioni per spostare la selezione tra le liste dei bus, selezionare, incassare, inserire righe.
  const G_ACT = [['menu', 'Apre il menu della riga'], ['sel', 'Seleziona / deseleziona la riga'], ['selbk', 'Seleziona tutta la prenotazione'], ['range', 'Seleziona da… a… (intervallo)'], ['pay', 'Apre l\'incasso (€) della riga'], ['map', 'Mostra la prenotazione sulla piantina'], ['detach', 'Stacca la persona dalla comitiva'], ['none', 'Niente']];
  const G_MOUSE = [['click', 'Clic sul numero della riga'], ['dbl', 'Doppio clic sul numero'], ['meta', '⌘ Cmd + clic sul numero'], ['shift', 'Maiusc + clic sul numero'], ['alt', '⌥ Opzione + clic sul numero'], ['right', 'Tasto destro sulla riga (sul trackpad: clic con due dita)']];
  const G_KEYS = [['next', 'Sposta la selezione nella lista del bus dopo'], ['prev', 'Sposta la selezione nella lista del bus prima'], ['selrow', 'Seleziona / deseleziona la riga dove stai scrivendo'], ['selbk', 'Seleziona tutta la prenotazione della riga dove stai scrivendo'], ['pay', 'Apre l\'incasso (€) della riga dove stai scrivendo'], ['menu', 'Apre il menu della riga dove stai scrivendo'], ['insB', 'Inserisce una riga vuota sotto'], ['insA', 'Inserisce una riga vuota sopra'], ['map', 'Mostra sulla piantina la riga dove stai scrivendo'], ['detach', 'Stacca dalla comitiva la persona della riga dove stai scrivendo (o quelle selezionate)']];
  // 2.1.14: gesti sulla piantina (clic su un posto occupato)
  const G_SACT = [['menu', 'Apre il menu del posto'], ['mvbk', 'Sposta tutta la prenotazione'], ['mv', 'Sposta o scambia la persona'], ['selbk', 'Seleziona tutta la prenotazione'], ['pay', 'Apre l\'incasso (€) della prenotazione'], ['none', 'Niente']];
  const G_SEAT = [['click', 'Clic su un posto occupato'], ['dbl', 'Doppio clic su un posto occupato'], ['alt', '⌥ Opzione + clic su un posto occupato'], ['meta', '⌘ Cmd + clic su un posto occupato'], ['shift', 'Maiusc + clic su un posto occupato']];
  const G_DEF = () => ({ seat: { click: 'menu', dbl: 'mvbk', alt: 'mv', meta: 'selbk', shift: 'none' }, mouse: { click: 'menu', dbl: 'selbk', meta: 'sel', shift: 'range', alt: 'pay', right: 'menu' },
    keys: { next: 'Ctrl+Alt+ArrowRight', prev: 'Ctrl+Alt+ArrowLeft', selrow: 'Ctrl+Alt+KeyS', selbk: 'Ctrl+Alt+KeyA', pay: 'Ctrl+Alt+KeyE', menu: 'Ctrl+Alt+KeyM', insB: 'Ctrl+Alt+ArrowDown', insA: 'Ctrl+Alt+ArrowUp', map: 'Ctrl+Alt+KeyP', detach: 'Ctrl+Alt+KeyD' }, dragSel: true });
  const myUser = () => (ACC.sess && ACC.users()[ACC.sess.uid]) || null;
  function gest() {
    const d = G_DEF(); const u = myUser(); const g = (u && u.gest) || {};
    return { mouse: Object.assign(d.mouse, g.mouse || {}), seat: Object.assign(d.seat, g.seat || {}), keys: Object.assign(d.keys, g.keys || {}), dragSel: g.dragSel == null ? d.dragSel : !!g.dragSel };
  }
  function gestSave(fn) { const u = myUser(); if (!u) return; const g = gest(); fn(g); u.gest = g; save(); }
  // combinazione di tasti → testo leggibile sul Mac («⌃⌥→»)
  const comboOf = e => [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta'].filter(Boolean).concat([e.code]).join('+');
  const KEYL = { ArrowRight: '→', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', Enter: '↩', Backspace: '⌫', Delete: '⌦', Space: 'Spazio', Tab: '⇥', Escape: 'Esc', Comma: ',', Period: '.', Slash: '/', Minus: '-', Equal: '=' };
  function comboLabel(c) {
    if (!c) return '—';
    const parts = c.split('+'); const code = parts.pop(); const mods = { Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Meta: '⌘' };
    return parts.map(m => mods[m] || m).join('') + (KEYL[code] || code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num '));
  }
  const gActL = k => (G_ACT.find(x => x[0] === k) || [k, k])[1];
  function gestHint() {
    const g = gest().mouse; const say = (k, txt) => g[k] && g[k] !== 'none' ? txt : '';
    return [say('meta', '⌘ + clic sul numero seleziona più righe'), say('shift', 'Maiusc + clic un intervallo'), say('dbl', 'doppio clic tutta la prenotazione')].filter(Boolean).join(', ') + (g.meta !== 'none' || g.shift !== 'none' ? ' (si cambia in Impostazioni › Gesti e scorciatoie).' : '');
  }

  // ---- azioni ----
  const rowList = (t, id) => { const r = rowById(t, id); return r ? listKey(t, r) : ''; };
  function gAct(act, id, anchor) {
    const t = trip(); if (!t || !id) return; const r = rowById(t, id); if (!r) return;
    const D = deriveBookings(t); const bk = D.find(x => x.persone.some(p => p.id === id));
    UI.lsel = (UI.lsel || []).filter(x => rowById(t, x));
    switch (act) {
      case 'menu': return rowMenu(id, anchor || $(`[data-act="rowmenu"][data-id="${id}"]`) || document.body);
      case 'sel': if (isEmptyRow(r)) return; UI.lsel = UI.lsel.includes(id) ? UI.lsel.filter(x => x !== id) : UI.lsel.concat([id]); UI.lanchor = id; return render();
      case 'selbk': { if (!bk) return; const ids = bk.persone.map(p => p.id); const all = ids.every(x => UI.lsel.includes(x)); UI.lsel = all ? UI.lsel.filter(x => !ids.includes(x)) : [...new Set(UI.lsel.concat(ids))]; UI.lanchor = id; return render(); }
      case 'range': {
        const a = UI.lanchor && rowById(t, UI.lanchor); if (!a || rowList(t, a.id) !== rowList(t, id)) return gAct('sel', id);
        const rows = listRows(t, rowList(t, id)); let i0 = rows.indexOf(a), i1 = rows.indexOf(r); if (i0 > i1) [i0, i1] = [i1, i0];
        UI.lsel = [...new Set(UI.lsel.concat(rows.slice(i0, i1 + 1).filter(x => !isEmptyRow(x)).map(x => x.id)))]; return render();
      }
      case 'pay': if (!bk) return toast('Riga vuota: niente da incassare'); return payOpen(bk.id, bk.id === id ? '' : id);
      case 'detach': return doDetach(t, (UI.lsel || []).includes(id) && UI.lsel.length > 1 ? UI.lsel.slice() : [id]);
      case 'map': if (!bk) return; UI.dock = true; (UI.dockMap = UI.dockMap || {})[t.id] = true; UI.pay = null; UI.sel = bk.id; UI.selP = null; { const SI = seatIndex(t); const on = bk.persone.map(p => SI[p.id]).find(Boolean); if (on) UI.busId = on.b.id; else if (multiBus(t) && bk.head.bus) UI.busId = bk.head.bus; } return render();
    }
  }
  // clic sul numero della riga: con il doppio clic configurato, il clic semplice aspetta un attimo per capire se arriva il secondo
  let numT = null;
  function onRowNum(e, el) {
    const g = gest().mouse; const id = el.dataset.id;
    const k = e.metaKey || e.ctrlKey ? 'meta' : e.shiftKey ? 'shift' : e.altKey ? 'alt' : 'click';
    if (k !== 'click') { clearTimeout(numT); if (g[k] !== 'none') gAct(g[k], id, el); return; }
    if (e.detail >= 2 && g.dbl !== 'none') { clearTimeout(numT); numT = null; closePop(); return gAct(g.dbl, id, el); }
    if (g.dbl === 'none' || e.detail === 0) return g.click !== 'none' && gAct(g.click, id, el);
    clearTimeout(numT); numT = setTimeout(() => { numT = null; if (g.click !== 'none') gAct(g.click, id, el); }, 240);
  }
  // tasto destro su una riga della lista
  document.addEventListener('contextmenu', e => {
    const tr = e.target.closest && e.target.closest('.lsec tr[data-rowid]'); if (!tr || UI.view !== 'trip') return;
    const inp = e.target.closest('input'); if (inp && inp.selectionStart !== inp.selectionEnd) return; // testo selezionato: resta il menu del Mac (copia/incolla)
    const a = gest().mouse.right; if (a === 'none') return;
    e.preventDefault(); const x = e.clientX, y = e.clientY;
    gAct(a, tr.dataset.rowid, { getBoundingClientRect: () => ({ left: x, right: x, top: y, bottom: y, width: 0, height: 0 }) });
  });
  // registrazione di una nuova combinazione (Impostazioni)
  let gRec = null;
  document.addEventListener('keydown', e => {
    if (gRec) {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation(); const k = gRec; gRec = null;
      if (e.code === 'Escape') { render(); return; }
      if (e.code === 'Backspace' && !e.ctrlKey && !e.altKey && !e.metaKey) { gestSave(g => { g.keys[k] = ''; }); toast('Scorciatoia tolta'); render(); return; }
      const c = comboOf(e);
      if (!e.ctrlKey && !e.altKey && !e.metaKey) { toast('Usa almeno un tasto tra ⌃ Ctrl, ⌥ Opzione e ⌘ Cmd: da soli i tasti servono per scrivere'); render(); return; }
      const busy = Object.entries(gest().keys).find(([x, v]) => v === c && x !== k);
      if (busy) { toast(`${comboLabel(c)} è già usata per: ${(G_KEYS.find(x => x[0] === busy[0]) || [])[1]}`); render(); return; }
      gestSave(g => { g.keys[k] = c; }); toast(`Scorciatoia salvata: ${comboLabel(c)}`); render(); return;
    }
    if (UI.view !== 'trip' || !ACC.sess || $('#modal-root').innerHTML) return;
    const c = comboOf(e); const hit = Object.entries(gest().keys).find(([, v]) => v && v === c); if (!hit) return;
    const t = trip(); if (!t) return; e.preventDefault(); e.stopPropagation();
    const cur = e.target && e.target.dataset && e.target.dataset.r; const k = hit[0];
    if (k === 'next' || k === 'prev') {
      if (!multiBus(t)) return toast('Con un solo bus c\'è una lista sola');
      let ids = (UI.lsel || []).length ? UI.lsel.slice() : cur ? [cur] : []; if (!ids.length) return toast('Seleziona prima le righe da spostare');
      // cursore sulla prima riga della prenotazione (senza selezione): si sposta tutta la prenotazione, come trascinando dalla prima riga
      if (!(UI.lsel || []).length) { const bk = deriveBookings(t).find(x => x.id === cur); if (bk) ids = bk.persone.map(p => p.id); }
      const Ls = tripLists(t).map(L => L.id); const at = Ls.indexOf(rowList(t, ids[0])); const to = Ls[at + (k === 'next' ? 1 : -1)];
      if (to === undefined) return toast(k === 'next' ? 'È già l\'ultima lista' : 'È già la prima lista');
      UI.lsel = []; return doListMove(t, ids, to);
    }
    if (k === 'detach' && !cur && (UI.lsel || []).length) return doDetach(t, UI.lsel.slice());
    if (!cur) return toast('Metti il cursore in una riga della lista');
    const anchor = $(`[data-act="rowmenu"][data-id="${cur}"]`);
    if (k === 'selrow') return gAct('sel', cur);
    if (k === 'selbk') return gAct('selbk', cur);
    if (k === 'pay') return gAct('pay', cur);
    if (k === 'menu') return gAct('menu', cur, anchor);
    if (k === 'map') return gAct('map', cur);
    if (k === 'detach') return gAct('detach', cur);
    if (k === 'insB' || k === 'insA') { const b = $(`[data-act="rowmenu"][data-id="${cur}"]`); if (!b) return; const i = t.rows.findIndex(r => r.id === cur); const ref = t.rows[i]; const nr = Object.assign(blankRow(), multiBus(t) && ref.bus ? { bus: ref.bus } : {}); t.rows.splice(i + (k === 'insB' ? 1 : 0), 0, nr); commit(); const inp = $(`[data-r="${nr.id}"][data-f="${e.target.dataset.f || 'cognome'}"]`); if (inp) inp.focus(); }
  }, true);

  // ---- Impostazioni › Gesti e scorciatoie ----
  function gestSettingsHTML() {
    const g = gest();
    return `<h2>Gesti e scorciatoie</h2><p class="sub">Valgono solo per il tuo account (${esc((ACC.me() || {}).name || '')}), su ogni computer. Servono soprattutto nelle liste: selezionare più persone, spostarle da un bus all'altro, aprire il menu o l'incasso.</p>
      <div class="box form gx"><h3>${ICON.mouse} Mouse e trackpad</h3>
        ${G_MOUSE.map(([k, l]) => `<label class="kv gx-r"><span>${esc(l)}</span><select data-gm="${esc(k)}">${G_ACT.filter(([a]) => k !== 'right' || a !== 'range').map(([a, al]) => `<option value="${esc(a)}"${g.mouse[k] === a ? ' selected' : ''}>${esc(al)}</option>`).join('')}</select></label>`).join('')}
        <label class="kv gx-r"><span>Trascinare ${ICON.grip} una riga già selezionata<br><small>sposta insieme tutte le righe selezionate (su un'altra lista o sulla linguetta di un bus)</small></span><input type="checkbox" class="sw" data-gdrag="1"${g.dragSel ? ' checked' : ''}></label></div>
      <div class="box form gx"><h3>${ICON.bus} Piantina del bus</h3><div class="small">Cosa succede facendo clic su un posto già occupato. «Sposta tutta la prenotazione»: poi tocchi il posto da cui farla partire e gli altri del gruppo si siedono accanto.</div>
        ${G_SEAT.map(([k, l]) => `<label class="kv gx-r"><span>${esc(l)}</span><select data-gs="${esc(k)}">${G_SACT.map(([a, al]) => `<option value="${esc(a)}"${g.seat[k] === a ? ' selected' : ''}>${esc(al)}</option>`).join('')}</select></label>`).join('')}</div>
      <div class="box form gx"><h3>${ICON.key} Tastiera</h3><div class="small">Funzionano mentre scrivi nella lista («la riga dove stai scrivendo» è quella con il cursore). Premi «Cambia» e poi la nuova combinazione, con almeno uno tra ⌃ Ctrl, ⌥ Opzione e ⌘ Cmd. Esc annulla, ⌫ toglie la scorciatoia.</div>
        ${G_KEYS.map(([k, l]) => `<div class="kv gx-r"><span>${esc(l)}</span><span class="gx-k"><kbd class="${esc(gRec === k ? 'rec' : '')}">${gRec === k ? 'Premi i tasti…' : esc(comboLabel(g.keys[k]))}</kbd><button class="btn sm" data-act="gkrec" data-k="${esc(k)}">Cambia</button></span></div>`).join('')}
        <div class="kv gx-r"><span>Togliere la selezione · chiudere menu e riquadri</span><span class="gx-k"><kbd>Esc</kbd></span></div></div>
      <div><button class="btn" data-act="gkreset">Ripristina i gesti iniziali</button></div>`;
  }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="gkrec"],[data-act="gkreset"]'); if (!el) return;
    if (el.dataset.act === 'gkrec') { gRec = el.dataset.k; render(); return; }
    confirmBox('Ripristina i gesti', 'Rimetto mouse, trackpad e scorciatoie come all\'inizio?', 'Ripristina', () => { const u = myUser(); if (u) { delete u.gest; save(); } render(); toast('Gesti ripristinati'); });
  });
  document.addEventListener('change', e => {
    const d = e.target.dataset || {};
    if (d.gm) { gestSave(g => { g.mouse[d.gm] = e.target.value; }); toast('Salvato'); return; }
    if (d.gdrag) { gestSave(g => { g.dragSel = e.target.checked; }); return; }
    if (d.gs) { if (G_SACT.some(([a]) => a === e.target.value) && G_SEAT.some(([k]) => k === d.gs)) gestSave(g => { g.seat[d.gs] = e.target.value; }); toast('Salvato'); return; }
  });

  // ---------- lavoro senza internet ----------
  // Senza internet si continua a lavorare, ma:
  //  1. l'operatore lo vede subito, con chi era collegato prima della caduta della linea (da telefonare);
  //  2. la prima volta su ogni viaggio che mette persone sui posti, aggiunge una prenotazione o incassa,
  //     l'app chiede se si è sentito con loro (la risposta va nel registro del Super Master);
  //  3. quando internet torna, l'app confronta le modifiche fatte senza linea con quelle degli altri
  //     computer e segnala posti dati due volte, bus con più persone che posti e incassi doppi.
  //     Non cambia nulla da sola: i casi restano nel viaggio e in Contabilità finché qualcuno li segna «Risolto».
  const OFFK = 'vip-offline-v1', CASI = '/controlli/casi.json';
  // OFFS: lo stato del periodo senza internet (resta anche se si ricarica la pagina)
  //   since: ultimo contatto riuscito con gli altri computer · at: quando ce ne siamo accorti
  //   ops: chi era collegato negli ultimi 2 minuti prima · ack: «Ho capito» premuto · ok: viaggi già confermati
  //   base: i posti di ogni bus al momento della caduta · pays: incassi registrati senza linea
  let OFFS = (() => { try { return JSON.parse(localStorage.getItem(OFFK) || 'null'); } catch (e) { return null; } })();
  const OFFR = { back: 0, merges: [], replay: false, ask: null };
  const offSave = () => { try { if (OFFS) localStorage.setItem(OFFK, JSON.stringify(OFFS)); else localStorage.removeItem(OFFK); } catch (e) { /* pieno o bloccato */ } };
  const isOff = st => { st = st || STORE.status(); return !!(st.linked && st.offline); };
  const hmOf = ms => { const d = new Date(+ms); return isNaN(d) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const tripLbl = t => t ? `${t.nome} (${fmtDate(t.data).slice(0, 5)})` : 'un viaggio';
  const telOf = d => { const u = d.uid && S && S.users.users[d.uid]; if (u && String(u.cell || '').trim()) return String(u.cell).trim(); const a = S && S.cfg.agenzie.find(x => x.id === d.ag); return a && String(a.tel || '').trim() ? String(a.tel).trim() : ''; };
  const OFF_VIEW = { home: 'era nell\'elenco dei viaggi', models: 'era nelle Piantine', cassa: 'era nella Cassa', conta: 'era in Contabilità', anag: 'era in Anagrafica', settings: 'era nelle Impostazioni' };
  function offDoing(d) {
    const t = d.tripId && S && S.trips.find(x => x.id === d.tripId); const tn = t ? `«${tripLbl(t)}»` : 'un viaggio';
    if (d.view === 'trip') return d.payBk ? `stava incassando una prenotazione di ${tn}` : d.sec === 'posti' ? `era sulla piantina${d.busL ? ' di ' + d.busL : ''} di ${tn}` : `era sulla lista di ${tn}`;
    return OFF_VIEW[d.view] || 'era collegato';
  }
  // chi era collegato: prima chi era sul viaggio aperto qui, poi gli altri dal più recente
  function offOps() {
    if (!OFFS) return [];
    const tid = UI.view === 'trip' ? UI.tripId : '';
    return (OFFS.ops || []).slice().sort((a, b) => ((b.tripId === tid && tid) ? 1 : 0) - ((a.tripId === tid && tid) ? 1 : 0) || (+b.at || 0) - (+a.at || 0));
  }
  const opShort = d => `${d.name}${d.ag ? ' (' + agName(d.ag) + ')' : ''}`;
  function offBegin(st) {
    const ref = st.lastOk || Date.now();
    const ops = STORE.list('/presenza/').map(([, d]) => d).filter(d => d && d.dev !== STORE.device.id && d.name && (+d.at || 0) >= ref - 120000)
      .map(d => ({ dev: d.dev, uid: d.uid, name: d.name, ag: d.ag || '', view: d.view, tripId: d.tripId || '', sec: d.sec || '', busL: d.busL || '', payBk: d.payBk || '', at: +d.at || 0 }));
    try { if (S) flush(); } catch (e) { /* niente */ }
    const base = {};
    STORE.list('/viaggi/').forEach(([, d]) => { if (!d || d.deleted || !(d.buses || []).length) return; const o = {}; d.buses.forEach(b => { const m = {}; Object.keys(b.seats || {}).forEach(s => { const a = b.seats[s]; m[s] = a.pid || (a.res ? 'res' : ''); }); o[b.id] = m; }); base[d.id] = o; });
    OFFS = { since: ref, at: Date.now(), ops, ack: false, ok: {}, base, pays: [] }; offSave();
    DIAG.ev('rete', 'Internet assente: si lavora senza linea', { ultimoContatto: new Date(ref).toISOString(), collegatiPrima: ops.length });
    if (ACC.sess) ACC.tlog('avviso', `Senza internet · collegati prima della caduta della linea: ${ops.length ? ops.map(opShort).join(', ') : 'nessun altro operatore'}`);
  }

  // ---- 1. finestra grande e fascia rossa ----
  function offAlert() {
    if ($('#off-alert')) return;
    const ops = offOps();
    const box = document.createElement('div'); box.id = 'off-alert'; box.className = 'pres-alert'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-label', 'Stai lavorando senza internet');
    box.innerHTML = `<div class="pa-card off"><div class="pa-ico">${ICON.alert}</div><div class="pa-h">Stai lavorando senza internet</div>
      <div class="pa-s">Puoi continuare a lavorare: le modifiche partiranno quando torna la connessione. <b>Prima di vendere posti o incassare, telefona a chi stava lavorando:</b></div>
      <div class="off-ops">${ops.length ? ops.map(d => { const tel = telOf(d); return `<div class="pa-p"><span class="pa-av">${esc(String(d.name || '?').trim().slice(0, 1).toUpperCase())}</span><div><b>${esc(d.name)}</b><span>${d.ag ? 'agenzia di <b>' + esc(agName(d.ag)) + '</b> · ' : ''}${esc(offDoing(d))}</span><span class="off-tel">${tel ? `Telefono <a href="tel:${esc(tel.replace(/[^\d+]/g, ''))}">${esc(tel)}</a>` : 'Telefono non indicato (Impostazioni › Agenzie e casse)'}</span></div></div>`; }).join('') : '<div class="off-none">Nessun altro operatore era collegato</div>'}</div>
      <button class="btn primary big" data-act="offok">Ho capito</button></div>`;
    document.body.appendChild(box); setTimeout(() => { const b = box.querySelector('button'); if (b) b.focus(); }, 30);
    DIAG.ev('avviso', `Avviso: senza internet · collegati prima: ${ops.map(opShort).join(', ') || 'nessuno'}`);
  }
  function offBandHTML(st) {
    st = st || STORE.status(); if (!isOff(st) || !OFFS) return '';
    const ops = offOps();
    return `<div id="offband" class="offband" role="status">${ICON.alert}<span><b>Senza internet</b> · ${st.pending === 1 ? '1 modifica' : st.pending + ' modifiche'} da inviare · Collegati prima: ${ops.length ? ops.map(d => { const tel = telOf(d); return `<span class="ob-p">${esc(d.name)} (${esc([d.ag ? agName(d.ag) : '', tel].filter(Boolean).join(', ') || 'telefono non indicato')})</span>`; }).join(', ') : 'nessuno'}</span></div>`;
  }
  // la fascia sta sotto la barra in alto: le colonne fisse (lista, piantina) scendono della sua altezza
  function offBand(st) {
    const hd = $('.topbar'); if (!hd) { document.documentElement.style.setProperty('--offh', '0px'); return; }
    const html = offBandHTML(st); const cur = $('#offband');
    if (!html) { if (cur) cur.remove(); }
    else if (cur) cur.outerHTML = html; else hd.insertAdjacentHTML('beforeend', html);
    const ob = $('#offband'); document.documentElement.style.setProperty('--offh', (ob ? Math.ceil(ob.getBoundingClientRect().height) : 0) + 'px');
  }
  // avvisi verdi uno dopo l'altro: «Internet tornato…» resta visibile almeno 2 secondi prima di «Tutto sincronizzato»
  let offTQ = Promise.resolve();
  function offToast(msg) {
    offTQ = offTQ.then(() => new Promise(res => { toast(msg); const el = $('#toast'); if (el) el.classList.add('ok'); setTimeout(res, 2000); }));
  }
  // ad ogni cambio di stato della sincronizzazione
  function offStatus(st) {
    st = st || STORE.status();
    const off = isOff(st);
    if (off && !OFFS) offBegin(st);
    if (off && OFFS) { OFFR.back = 0; if (!OFFS.ack && ACC.sess && ACC.me() && !gateStep()) offAlert(); }
    if (!off && OFFS && st.linked) {
      if (!OFFR.back) { OFFR.back = Date.now(); const x = $('#off-alert'); if (x) x.remove(); offToast(st.pending ? `Internet tornato: invio ${st.pending === 1 ? '1 modifica' : st.pending + ' modifiche'}…` : 'Internet tornato: aggiorno i dati…'); DIAG.ev('rete', 'Internet tornato', { inAttesa: st.pending }); }
      else if (!st.syncing && !st.pending && !st.error && st.pulled && (+st.lastOk || 0) > OFFR.back) offFinish();
    }
    offBand(st);
  }
  function offAfterRender() { try { offStatus(STORE.status()); } catch (e) { DIAG.ev('errore', 'Avviso senza internet: ' + e.message); } }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="offok"]'); if (!el) return;
    const x = $('#off-alert'); if (x) x.remove(); if (OFFS) { OFFS.ack = true; offSave(); } offBand();
  });

  // ---- 2. «hai sentito al telefono…?» la prima volta su ogni viaggio ----
  const OFF_KIND = { posto: 'mettere o spostare persone sui posti', prenotazione: 'aggiungere prenotazioni', incasso: 'incassare' };
  const offNeedAsk = t => !!(t && OFFS && isOff() && !(OFFS.ok || {})[t.id]);
  function offAsk(t, kind, go, cancel) {
    if (OFFR.ask) return; const ops = offOps(); const names = ops.map(opShort);
    const q = names.length ? `Sei senza internet: hai sentito al telefono ${names.length < 2 ? names[0] : names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1]}?` : 'Sei senza internet e prima della caduta della linea non c\'era nessun altro operatore collegato: hai sentito al telefono le altre agenzie?';
    const box = document.createElement('div'); box.id = 'off-ask'; box.className = 'pres-alert'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-label', 'Sei senza internet');
    box.innerHTML = `<div class="pa-card off"><div class="pa-ico">${ICON.alert}</div><div class="pa-h">${esc(q)}</div>
      <div class="pa-trip">${esc(tripLbl(t))}</div>
      <div class="pa-s">Prima di ${OFF_KIND[kind]} mettetevi d'accordo, così quando torna internet non risultano posti venduti due volte o incassi doppi.</div>
      ${ops.length ? `<div class="off-ops sm">${ops.map(d => { const tel = telOf(d); return `<div class="off-op"><b>${esc(d.name)}</b>${d.ag ? ' · ' + esc(agName(d.ag)) : ''}${tel ? ` · <a href="tel:${esc(tel.replace(/[^\d+]/g, ''))}">${esc(tel)}</a>` : ''}</div>`; }).join('')}</div>` : ''}
      <div class="off-btns"><button class="btn big" data-off="no">Annulla</button><button class="btn primary big" data-off="si">Sì, ci siamo sentiti</button></div></div>`;
    document.body.appendChild(box); OFFR.ask = box;
    const done = yes => {
      box.remove(); OFFR.ask = null;
      ACC.tlog('avviso', `Senza internet · ${tripLbl(t)} · prima di ${OFF_KIND[kind]}: «${yes ? 'Sì, ci siamo sentiti' : 'Annulla'}» (${names.length ? 'collegati prima: ' + names.join(', ') : 'nessun altro collegato prima'})`);
      if (yes) { OFFS.ok = OFFS.ok || {}; OFFS.ok[t.id] = Date.now(); offSave(); go(); } else if (cancel) cancel();
    };
    box.querySelectorAll('[data-off]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); done(b.dataset.off === 'si'); }));
    box.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.stopPropagation(); done(false); } });
    setTimeout(() => { const b = box.querySelector('[data-off="si"]'); if (b) b.focus(); }, 30);
  }
  const offTrip = () => (UI.view === 'trip' ? trip() : null);
  // clic che mettono persone sui posti, aggiungono prenotazioni o incassano
  function offClickKind(e) {
    if (e.target.closest('#off-ask, #off-alert, #cx-alert')) return null;
    const seatEl = e.target.closest('#mapwrap .seat[data-seat]'); const el = e.target.closest('[data-act]');
    if (seatEl && !el) return UI.move != null || UI.sel || UI.selP ? 'posto' : null;
    const a = el && el.dataset.act;
    if (a === 'fill') return 'posto';
    if (a === 'attconf' || a === 'annrest' || (a === 'doimport' && UI.modal && UI.modal.mode !== 'new')) return 'prenotazione';
    if (a === 'pfsave') return 'incasso';
    return null;
  }
  window.addEventListener('click', e => {
    if (OFFR.replay || !e.isTrusted) return; const t = offTrip(); if (!offNeedAsk(t)) return;
    const kind = offClickKind(e); if (!kind) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const tgt = e.target;
    offAsk(t, kind, () => { OFFR.replay = true; try { tgt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } finally { OFFR.replay = false; } });
  }, true);
  const offDropClean = () => { $$('.drop').forEach(x => x.classList.remove('drop')); $$('.drop-b,.drop-a').forEach(x => x.classList.remove('drop-b', 'drop-a')); const db = $('#dropbar'); if (db) db.remove(); };
  window.addEventListener('drop', e => {
    if (OFFR.replay || !drag) return; const t = offTrip(); if (!offNeedAsk(t)) return;
    const tgt = e.target.closest ? e.target : e.target.parentElement;
    if (!tgt.closest('#mapwrap .seat[data-seat]') && !tgt.closest('[data-dropbus]')) return;
    e.preventDefault(); e.stopImmediatePropagation(); const saved = drag; offDropClean();
    offAsk(t, 'posto', () => { drag = saved; OFFR.replay = true; try { tgt.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true })); } finally { OFFR.replay = false; drag = null; } }, () => { drag = null; });
  }, true);
  // si scrive in una riga vuota della lista: è una prenotazione nuova
  window.addEventListener('input', e => {
    if (OFFR.replay) return; const el = e.target; const d = el.dataset || {}; if (!d.r) return;
    const t = offTrip(); if (!offNeedAsk(t)) return; const r = rowById(t, d.r); if (!r || !isEmptyRow(r)) return;
    e.stopImmediatePropagation(); const v = el.value; el.value = '';
    offAsk(t, 'prenotazione', () => { el.value = v; OFFR.replay = true; try { el.dispatchEvent(new Event('input', { bubbles: true })); } finally { OFFR.replay = false; } try { el.focus(); el.selectionStart = el.selectionEnd = v.length; } catch (x) { /* niente */ } }, () => { try { el.focus(); } catch (x) { /* niente */ } });
  }, true);
  // incasso registrato senza internet: si ricorda quanto risultava pagato, per il controllo al ritorno
  function offNoteMov(mv) {
    try {
      if (!OFFS || !isOff() || !mv || !mv.tripId || !mv.bkId || mv.tipo === 'storno') return;
      const t = S.trips.find(x => x.id === mv.tripId); if (!t) return; const bid = resolveBk(mv.tripId, mv.bkId);
      const bk = deriveBookings(t).find(x => x.id === bid); const known = allMovs().filter(m => m.tripId === mv.tripId && resolveBk(m.tripId, m.bkId) === bid).map(m => m.id);
      OFFS.pays = (OFFS.pays || []).concat([{ tripId: mv.tripId, bkId: bid, mov: mv.id, paid: bk ? bkMoney(t, bk).paid : 0, known }]).slice(-300); offSave();
    } catch (e) { DIAG.ev('errore', 'Incasso senza internet non annotato: ' + e.message); }
  }

  // ---- 3. controllo dopo il ritorno di internet ----
  STORE.onMerge = (p, mine, other, merged) => {
    if (!OFFS || !p.startsWith('/viaggi/') || !mine || !other || mine.deleted || other.deleted) return;
    OFFR.merges.push({ p, L: JSON.parse(JSON.stringify(mine)), R: JSON.parse(JSON.stringify(other)), M: JSON.parse(JSON.stringify(merged)) });
  };
  const pName = (d, pid) => { if (pid === 'res') return 'posto riservato (guida / 2° autista)'; const r = (d.rows || []).concat(d.attesa || [], d.annullati || []).find(x => x.id === pid); return r ? `${String(r.cognome || '').replace(RX, '$1').trim()} ${r.nome || ''}`.trim() || 'persona senza nome' : 'una persona tolta dalla lista'; };
  const whoOf = (x, fb) => ({ by: (x && x.by) || (fb && fb.by) || '', ag: (x && x.bya) || (fb && fb.bya) || '', u: (x && +x.u) || 0 });
  const seatPid = a => (a ? a.pid || (a.res ? 'res' : '') : '');
  function caseSeats(mg, out) {
    const { L, R, M } = mg; const base = (OFFS.base || {})[L.id] || {};
    (L.buses || []).forEach(bl => {
      const br = (R.buses || []).find(x => x.id === bl.id); if (!br) return; const bm = (M.buses || []).find(x => x.id === bl.id) || { seats: {} }; const b0 = base[bl.id] || {};
      new Set([...Object.keys(bl.seats || {}), ...Object.keys(br.seats || {})]).forEach(s => {
        const a = (bl.seats || {})[s], c = (br.seats || {})[s]; const lp = seatPid(a), rp = seatPid(c), bp = b0[s] || '';
        if (!lp || !rp || lp === rp || lp === bp || rp === bp) return;
        const kept = seatPid((bm.seats || {})[s]); const lost = kept === lp ? rp : lp;
        let lostAt = ''; (M.buses || []).forEach(x => Object.keys(x.seats || {}).forEach(k => { if (x.seats[k].pid === lost) lostAt = `${(M.buses || []).length > 1 ? x.label + ', ' : ''}posto ${k}`; }));
        out.push({ id: 's' + hash36([L.id, bl.id, s, lp, rp].sort().join('|')), kind: 'posto', tripId: L.id, busId: bl.id, busL: bm.label || bl.label || 'Bus', seat: s,
          mine: Object.assign({ nome: pName(L, lp) }, whoOf(a, bl)), other: Object.assign({ nome: pName(R, rp) }, whoOf(c, br)),
          kept: pName(M, kept), lost: lost === 'res' ? '' : pName(M, lost), lostAt });
      });
    });
  }
  function busCount(d) {
    const o = {};
    try { const t = tripInit(JSON.parse(JSON.stringify(d))); const D = deriveBookings(t); t.buses.forEach(b => { if (!LMAP[b.layout]) return; syncBus(t, b, D); const st = busStats(b); o[b.id] = { n: st.tot, cap: st.cap, label: b.label, ids: new Set(b.bookings.flatMap(k => k.persone.map(p => p.id))) }; }); } catch (e) { DIAG.ev('errore', 'Conteggio dei posti non riuscito: ' + e.message); }
    return o;
  }
  function caseBus(mg, out) {
    const { L, R, M } = mg; const cl = busCount(L), cr = busCount(R), cm = busCount(M);
    Object.keys(cm).forEach(id => {
      const m = cm[id], l = cl[id] || { n: 0, ids: new Set() }, r = cr[id] || { n: 0, ids: new Set() };
      if (!(m.n > m.cap && m.n > Math.max(l.n, r.n))) return;
      const rowsOf = (d, ids) => (d.rows || []).filter(x => ids.has(x.id)).map(x => Object.assign({ nome: pName(d, x.id) }, whoOf(x)));
      const mine = rowsOf(L, new Set([...l.ids].filter(x => !r.ids.has(x)))), other = rowsOf(R, new Set([...r.ids].filter(x => !l.ids.has(x))));
      out.push({ id: 'b' + hash36([L.id, id, ...mine.map(x => x.nome), ...other.map(x => x.nome)].join('|')), kind: 'bus', tripId: L.id, busId: id, busL: m.label || 'Bus', n: m.n, cap: m.cap, mine: mine.slice(0, 12), other: other.slice(0, 12) });
    });
  }
  function casePays(out) {
    const seen = new Set();
    (OFFS.pays || []).forEach(x => {
      const key = x.tripId + '|' + x.bkId; if (seen.has(key)) return; seen.add(key);
      const t = S.trips.find(y => y.id === x.tripId); if (!t) return; const bk = deriveBookings(t).find(y => y.id === x.bkId); if (!bk) return;
      const m = bkMoney(t, bk); if (!(m.extra > 0.009)) return;
      const mine = new Set((OFFS.pays || []).filter(y => y.tripId === x.tripId && y.bkId === x.bkId).flatMap(y => [y.mov, ...(y.known || [])]));
      const movs = allMovs().filter(y => y.tripId === x.tripId && resolveBk(y.tripId, y.bkId) === x.bkId && isInc(y));
      const others = movs.filter(y => !mine.has(y.id) && (+y.tot || 0) > 0); if (!others.length) return;
      out.push({ id: 'p' + hash36([x.tripId, x.bkId, ...movs.map(y => y.id).sort()].join('|')), kind: 'incasso', tripId: x.tripId, bkId: x.bkId, cliente: bkName(bk) + (bk.persone.length > 1 ? ' x ' + bk.persone.length : ''),
        due: m.due, paid: m.paid, extra: m.extra, movs: movs.slice(-8).map(y => ({ tot: +y.tot || 0, by: y.who || '', ag: y.ag || '', at: y.at, qui: y.dev === STORE.device.id })) });
    });
  }
  function offFinish() {
    const mins = Math.max(1, Math.round((Date.now() - (OFFS.at || Date.now())) / 60000)); const found = [];
    try { OFFR.merges.forEach(mg => { caseSeats(mg, found); caseBus(mg, found); }); casePays(found); } catch (e) { DIAG.ev('errore', 'Controllo dopo il ritorno di internet non riuscito: ' + e.message, { stack: e.stack }); }
    const uniq = []; found.forEach(c => { if (!uniq.some(x => x.id === c.id)) uniq.push(c); });
    const cur = JSON.parse(JSON.stringify(STORE.get(CASI) || { casi: {} })); cur.casi = cur.casi || {}; const now = tick(); const me = ACC.me(); const fresh = [];
    uniq.forEach(c => { if (cur.casi[c.id]) return; const t = S.trips.find(x => x.id === c.tripId); Object.assign(c, { u: now, at: new Date().toISOString(), stato: 'aperto', tripN: t ? t.nome : '', tripD: t ? t.data : '', trovato: me ? me.name : '', trovatoAg: ACC.sess && ACC.sess.ag || '' }); cur.casi[c.id] = c; fresh.push(c); });
    if (fresh.length) { cur.u = now; STORE.put(CASI, cur); }
    ACC.tlog(fresh.length ? 'avviso' : 'info', `Internet tornato dopo circa ${mins} min · controllo delle modifiche fatte senza linea: ${fresh.length ? fresh.length + ' da controllare (' + fresh.map(caseTitle).join(' · ') + ')' : 'nessun problema'}`);
    DIAG.ev('rete', 'Controllo dopo il ritorno di internet', { minuti: mins, unioni: OFFR.merges.length, incassi: (OFFS.pays || []).length, casi: fresh.length });
    OFFS = null; offSave(); OFFR.merges = []; OFFR.back = 0;
    offToast('Tutto sincronizzato'); offBand();
    if (fresh.length) cxAlert(fresh);
    render();
  }

  // ---- casi da controllare: finestra, elenco nel viaggio e in Contabilità ----
  const casiAll = () => Object.values((STORE.get(CASI) || {}).casi || {});
  const casiOpen = tid => casiAll().filter(c => c.stato !== 'risolto' && (!tid || c.tripId === tid)).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const whoTxt = x => [x.by || 'un altro operatore', x.ag ? agName(x.ag) : '', x.u ? 'alle ' + hmOf(x.u) : ''].filter(Boolean).join(' · ');
  function caseTitle(c) {
    const t = S.trips.find(x => x.id === c.tripId); const tn = t ? tripLbl(t) : `${c.tripN || 'viaggio tolto'}${c.tripD ? ' (' + fmtDate(c.tripD).slice(0, 5) + ')' : ''}`;
    return c.kind === 'posto' ? `Posto ${c.seat} dato a due persone · ${c.busL} · ${tn}` : c.kind === 'bus' ? `${c.busL} con più persone che posti (${c.n} su ${c.cap}) · ${tn}` : `Prenotazione incassata due volte · ${c.cliente} · ${tn}`;
  }
  function caseBody(c) {
    if (c.kind === 'posto') return `<ul class="cx-l"><li><b>${esc(c.mine.nome)}</b> · messo da ${esc(whoTxt(c.mine))} <small>(senza internet)</small></li><li><b>${esc(c.other.nome)}</b> · messo da ${esc(whoTxt(c.other))}</li></ul>
      <div class="cx-n">Dopo l'unione sul posto ${esc(c.seat)} è rimasto <b>${esc(c.kept)}</b>.${c.lost ? ` ${esc(c.lost)} ${c.lostAt ? 'ora è al ' + esc(c.lostAt) : 'ora è <b>senza posto</b>'}.` : ''}</div>`;
    if (c.kind === 'bus') { const li = (a, tag) => a.map(x => `<li><b>${esc(x.nome)}</b> · ${esc(whoTxt(x))}${tag}</li>`).join(''); return `<div class="cx-n">Dopo l'unione sul ${esc(c.busL)} ci sono <b>${esc(c.n)} persone</b> e <b>${esc(c.cap)} posti</b>.</div><ul class="cx-l">${li(c.mine, ' <small>(senza internet)</small>')}${li(c.other, '')}</ul>`; }
    return `<div class="cx-n">Dovuto <b>${money(c.due)}</b> · pagato <b>${money(c.paid)}</b> · <b>${money(c.extra)} in più</b>.</div><ul class="cx-l">${(c.movs || []).map(m => `<li><b>${money(m.tot)}</b> · ${esc(whoTxt({ by: m.by, ag: m.ag }))} · ${esc(fmtDate(String(m.at).slice(0, 10)).slice(0, 5))} ${esc(hm(m.at))}${m.qui ? ' <small>(da questo computer)</small>' : ''}</li>`).join('')}</ul>`;
  }
  const caseOpenBtn = c => ACC.can('viaggi') && S.trips.some(x => x.id === c.tripId) ? `<button class="btn sm" data-act="cxopen" data-id="${esc(c.id)}">${c.kind === 'incasso' ? 'Apri la prenotazione' : 'Apri la piantina'}</button>` : '';
  function cxAlert(list) {
    const x = $('#cx-alert'); if (x) x.remove();
    const box = document.createElement('div'); box.id = 'cx-alert'; box.className = 'pres-alert'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-label', 'Da controllare dopo il ritorno di internet');
    box.innerHTML = `<div class="pa-card cx"><div class="pa-ico">${ICON.alert}</div><div class="pa-h">Da controllare dopo il ritorno di internet</div>
      <div class="pa-s">Mentre eri senza internet un altro computer ha cambiato le stesse cose. L'app non ha cambiato nulla da sola: decidi tu.</div>
      <div class="cx-list">${list.map(c => `<div class="cx-i"><div class="cx-t">${esc(caseTitle(c))}</div>${caseBody(c)}<div class="cx-b">${caseOpenBtn(c)}</div></div>`).join('')}</div>
      <div class="pa-s small">I casi restano nella pagina del viaggio e in Contabilità finché qualcuno non li segna «Risolto».</div>
      <button class="btn primary big" data-act="cxclose">Ho capito</button></div>`;
    document.body.appendChild(box); setTimeout(() => { const b = box.querySelector('[data-act="cxclose"]'); if (b) b.focus(); }, 30);
  }
  function casiBoxHTML(tid) {
    const L = casiOpen(tid); if (!L.length) return '';
    const canOk = !ACC.can('readonly');
    return `<section class="casi" aria-label="Da controllare dopo il ritorno di internet"><div class="casi-h">${ICON.alert}<b>Da controllare dopo il ritorno di internet</b><span>${L.length === 1 ? '1 caso' : L.length + ' casi'}</span></div>
      ${L.map(c => `<div class="cx-i"><div class="cx-t">${esc(caseTitle(c))}</div>${caseBody(c)}<div class="cx-f"><small>Trovato da ${esc(c.trovato || '—')}${c.trovatoAg ? ' · ' + esc(agName(c.trovatoAg)) : ''} il ${esc(fmtDate(String(c.at).slice(0, 10)).slice(0, 5))} alle ${esc(hm(c.at))}</small><span class="cx-b">${caseOpenBtn(c)}${canOk ? `<button class="btn sm primary" data-act="cxok" data-id="${esc(c.id)}">${ICON.check} Risolto</button>` : ''}</span></div></div>`).join('')}</section>`;
  }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="cxopen"],[data-act="cxok"],[data-act="cxclose"]'); if (!el) return;
    const act = el.dataset.act;
    if (act === 'cxclose') { const x = $('#cx-alert'); if (x) x.remove(); return; }
    const c = casiAll().find(x => x.id === el.dataset.id); if (!c) return;
    if (act === 'cxopen') {
      const x = $('#cx-alert'); if (x) x.remove(); const t = S.trips.find(y => y.id === c.tripId); if (!t) return;
      UI.view = 'trip'; UI.tripId = t.id; UI.pay = null; UI.sel = UI.selP = null; UI.move = null; UI.lsel = [];
      if (c.kind === 'incasso') { UI.sec = 'lista'; render(); payOpen(c.bkId, ''); }
      else { UI.sec = 'posti'; UI.busId = t.buses.some(b => b.id === c.busId) ? c.busId : (t.buses[0] && t.buses[0].id); render(); }
      window.scrollTo(0, 0); return;
    }
    if (act === 'cxok') {
      if (ACC.can('readonly')) return; const cur = JSON.parse(JSON.stringify(STORE.get(CASI) || { casi: {} })); const x = cur.casi[c.id]; if (!x) return; const me = ACC.me();
      Object.assign(x, { stato: 'risolto', risoltoDa: me ? me.name : '', risoltoAg: ACC.sess && ACC.sess.ag || '', risoltoAt: new Date().toISOString(), u: tick() }); cur.u = x.u; STORE.put(CASI, cur);
      ACC.tlog('info', `Segnato «Risolto»: ${caseTitle(c)}`); toast('Segnato come risolto'); render();
    }
  });

  // ---------- lista chiusa, tasto «Indietro» e cronologia (2.1.5) ----------
  ICON.lock = I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  ICON.unlock = I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.7-1.5"/>');
  ICON.undo = I('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>');
  ICON.hist = I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>');
  const isMaster = () => ACC.can('settings');
  const hmS = ms => { const d = new Date(+ms); return isNaN(d) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const ddS = ms => { const d = new Date(+ms); return isNaN(d) ? '' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; };

  // ---- 1. lista chiusa: niente nuove prenotazioni (chiude e riapre solo il Master) ----
  // Restano possibili: correggere i dati, completare i nomi che mancano nelle comitive, sistemare i posti,
  // incassare e scrivere nella lista d'attesa.
  // riga vuota che serve a completare una comitiva già prenotata («Rossi x 3» con un nome che manca)
  function isSlotRow(t, r) {
    const rows = listRows(t, listKey(t, r)); const i = rows.indexOf(r); if (i < 0) return false;
    let k = i - 1, gap = 1; while (k >= 0 && isEmptyRow(rows[k])) { k--; gap++; }
    if (k < 0) return false;
    const bk = deriveBookings(t).find(b => b.persone.some(p => p.id === rows[k].id)); return !!(bk && bk.mancano && gap <= bk.mancano);
  }
  // le righe vuote in fondo alla lista non si vedono quando la lista è chiusa
  function rowsShown(t, rows) {
    if (!t.chiusa) return rows; let n = rows.length;
    while (n > 0 && isEmptyRow(rows[n - 1]) && !isSlotRow(t, rows[n - 1])) n--;
    return rows.slice(0, n);
  }
  const closedMsg = t => `Lista chiusa${t.chiusa && t.chiusa.by ? ' da ' + t.chiusa.by : ''}: non si prendono nuove prenotazioni${isMaster() ? '' : ' (la riapre il Master)'}`;
  function lockBtnHTML(t) {
    if (tripCat(t) === 'biglietteria' && !t.chiusa && !isMaster()) return '';
    if (isMaster()) return `<button class="btn sm ${esc(t.chiusa ? 'lk-on' : 'ghost')}" data-act="tlock" title="${esc(t.chiusa ? 'Riapri la lista: si possono di nuovo prendere prenotazioni' : 'Chiudi la lista: niente nuove prenotazioni')}">${t.chiusa ? ICON.lock + ' Lista chiusa · riapri' : ICON.unlock + ' Chiudi la lista'}</button>`;
    return t.chiusa ? `<span class="pill lk-pill">${ICON.lock} Lista chiusa</span>` : '';
  }
  function closedBannerHTML(t) {
    if (!t.chiusa) return '';
    const c = t.chiusa;
    return `<div class="lk-ban" role="status">${ICON.lock}<div><b>Lista chiusa</b><span>Chiusa da ${esc(c.by || '—')}${c.ag ? ' (' + esc(agName(c.ag)) + ')' : ''} il ${esc(ddS(c.at))} alle ${esc(hmS(c.at))}: non si prendono nuove prenotazioni. Si possono ancora correggere i dati, completare i nomi delle comitive, sistemare i posti, incassare e usare la lista d'attesa.</span></div></div>`;
  }
  function toggleLock(t) {
    if (!isMaster()) return toast('Solo il Master può chiudere o riaprire la lista');
    const me = ACC.me();
    if (t.chiusa) { delete t.chiusa; ACC.tlog('avviso', `Lista riaperta · ${t.nome} (${t.data})`); toast('Lista riaperta: si possono di nuovo prendere prenotazioni'); }
    else { t.chiusa = { by: me ? me.name : '', ag: ACC.sess && ACC.sess.ag || '', at: Date.now() }; ACC.tlog('avviso', `Lista chiusa · ${t.nome} (${t.data}): niente nuove prenotazioni`); toast('Lista chiusa: niente nuove prenotazioni'); }
    commit();
  }
  const LK_ACTS = { attconf: 'confermare dalla lista d\'attesa', annrest: 'rimettere nella lista chi non partiva più', rowins: 'aggiungere righe' };
  window.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return; const a = el.dataset.act;
    const t = UI.view === 'trip' ? trip() : null; if (!t) return;
    if (a === 'tlock') { e.stopImmediatePropagation(); closePop(); toggleLock(t); return; }
    if (!t.chiusa) return;
    if (LK_ACTS[a] || (a === 'doimport' && UI.modal && UI.modal.mode !== 'new')) { e.preventDefault(); e.stopImmediatePropagation(); closePop(); toast(`${closedMsg(t)}: per ${LK_ACTS[a] || 'importare la lista'} va riaperta`); }
  }, true);
  // scrivere in una riga vuota della lista chiusa (che non completa una comitiva) = prenotazione nuova
  window.addEventListener('input', e => {
    const el = e.target; const d = el.dataset || {}; if (!d.r) return; const t = UI.view === 'trip' ? trip() : null; if (!t || !t.chiusa) return;
    const r = rowById(t, d.r); if (!r || !isEmptyRow(r) || isSlotRow(t, r)) return;
    e.stopImmediatePropagation(); el.value = ''; el.blur(); toast(closedMsg(t));
  }, true);

  // ---- 2. tasto «Indietro» e cronologia della lista e della piantina ----
  // Indietro: annulla le ultime modifiche fatte da QUESTO computer (solo le righe o i posti toccati, senza
  // cancellare quello che hanno fatto gli altri nel frattempo).
  // Cronologia: le versioni salvate da tutti i computer, con chi le ha fatte e da quale agenzia; si può
  // ripristinare una versione intera. Con il lucchetto chiuso Indietro e Ripristina li usa solo il Master.
  // Dove stanno: /cronologia/<viaggio>/<computer>.json è l'elenco delle versioni (piccolo, arriva a tutti);
  // il contenuto di ogni versione è un file a parte (/cronologia/<viaggio>/<versione>.ver) che si scarica
  // solo quando serve, così l'archivio non si appesantisce.
  const H = { undo: new Map(), burst: new Map(), applying: false, label: '' };
  const HSEC_L = { lista: 'lista', posti: 'piantina' };
  const histCan = t => !(t && t.histLock) || isMaster();
  const clean = x => JSON.parse(JSON.stringify(x || null, (k, v) => (k === 'u' || k === 'uf' || k === 'by' || k === 'bya' || k === 'bookings' ? undefined : v)));
  const snapOf = (d, sec) => sec === 'lista'
    ? { rows: clean(d.rows || []), attesa: clean(d.attesa || []), annullati: clean(d.annullati || []) }
    : { buses: (d.buses || []).map(b => ({ id: b.id, label: b.label, seats: Object.fromEntries(Object.entries(b.seats || {}).map(([s, a]) => [s, clean(Object.assign({}, a, { b: undefined }))])) })) };
  // chi ha fatto per ultimo la versione di partenza (per la versione «com'era prima»)
  function lastEditor(d, sec) {
    let best = { u: 0, by: '', ag: '' };
    const see = x => { if (x && (+x.u || 0) > best.u && x.by) best = { u: +x.u, by: x.by, ag: x.bya || '' }; };
    if (sec === 'lista') ['rows', 'attesa', 'annullati'].forEach(k => (d[k] || []).forEach(see));
    else (d.buses || []).forEach(b => Object.values(b.seats || {}).forEach(see));
    return best;
  }
  const LIST_L = { rows: 'lista', attesa: 'lista d\'attesa', annullati: 'non partono più' };
  const F_L = { cognome: 'cognome', nome: 'nome', nascita: 'data', tel: 'contatto', natoA: 'luogo di nascita', part: 'partenza', hotel: 'hotel', cam: 'camera', fila: 'fila', note: 'note', nota2: 'note 2', pagato: '€', bus: 'bus', stato: 'stato' };
  const nmOf = x => `${String(x.cognome || '').replace(RX, '$1').trim()} ${x.nome || ''}`.trim() || 'riga senza nome';
  const few = (a, n = 3) => a.length <= n ? a.join(', ') : a.slice(0, n).join(', ') + ` e altri ${a.length - n}`;
  function sumLista(a, b) {
    const flat = s => { const m = new Map(); ['rows', 'attesa', 'annullati'].forEach(k => (s[k] || []).forEach((x, i) => m.set(x.id, { k, i, x }))); return m; };
    const A = flat(a), B = flat(b); const add = [], del = [], mov = [], chg = [];
    B.forEach((v, id) => { const o = A.get(id); if (!o) { if (!isEmptyRow(v.x)) add.push(nmOf(v.x)); return; } if (o.k !== v.k) { mov.push(`${nmOf(v.x)} in ${LIST_L[v.k]}`); return; }
      if (JSON.stringify(o.x) !== JSON.stringify(v.x)) { const f = [...new Set([...Object.keys(o.x), ...Object.keys(v.x)])].filter(k => k !== 'id' && JSON.stringify(o.x[k]) !== JSON.stringify(v.x[k])).map(k => F_L[k] || k);
        if (f.length) chg.push(`${nmOf(isEmptyRow(v.x) ? o.x : v.x)} (${few(f, 2)})`); } });
    A.forEach((v, id) => { if (!B.has(id) && !isEmptyRow(v.x)) del.push(nmOf(v.x)); });
    const p = []; if (add.length) p.push(`aggiunt${add.length > 1 ? 'i' : 'o'} ${few(add)}`); if (del.length) p.push(`tolt${del.length > 1 ? 'i' : 'o'} ${few(del)}`); if (mov.length) p.push(`spostat${mov.length > 1 ? 'i' : 'o'} ${few(mov, 2)}`); if (chg.length) p.push(`cambiat${chg.length > 1 ? 'i' : 'o'} ${few(chg, 2)}`);
    return p.join(' · ') || 'ordine delle righe';
  }
  function sumPosti(a, b, t) {
    const nm = pid => { if (pid === 'res') return 'riserva guida'; const r = t && (t.rows.find(x => x.id === pid)); return r ? `${String(r.cognome || '').replace(RX, '$1').trim()} ${String(r.nome || '').slice(0, 1)}${r.nome ? '.' : ''}`.trim() : 'persona tolta'; };
    const out = []; const multi = (b.buses || []).length > 1;
    (b.buses || []).forEach(bb => {
      const ba = (a.buses || []).find(x => x.id === bb.id) || { seats: {} };
      const pos = s => { const m = {}; Object.entries(s || {}).forEach(([k, v]) => { const id = v.pid || (v.res ? 'res' : ''); if (id) (m[id] = m[id] || []).push(+k); }); return m; };
      const pa = pos(ba.seats), pb = pos(bb.seats); const L = [];
      Object.keys(pb).forEach(id => { const x = (pa[id] || []).sort((p, q) => p - q).join(','), y = pb[id].sort((p, q) => p - q).join(','); if (x === y) return; L.push(x ? `${nm(id)} dal ${fmtSeats(pa[id])} al ${fmtSeats(pb[id])}` : `${nm(id)} al ${fmtSeats(pb[id])}`); });
      Object.keys(pa).forEach(id => { if (!pb[id]) L.push(`tolto ${nm(id)} dal ${fmtSeats(pa[id])}`); });
      const notes = Object.keys(bb.seats || {}).filter(s => ((ba.seats || {})[s] || {}).np !== (bb.seats[s] || {}).np && (ba.seats || {})[s] && bb.seats[s]).length; if (notes) L.push(notes === 1 ? 'nota sul posto' : `${notes} note sui posti`);
      if (L.length) out.push((multi ? bb.label + ': ' : '') + few(L, 3));
    });
    return out.join(' · ') || 'posti';
  }
  const sumOf = (sec, a, b, t) => (sec === 'lista' ? sumLista(a, b) : sumPosti(a, b, t));
  // ogni salvataggio di un viaggio fatto da questo computer passa da qui (vedi flush in m_state.js)
  function histNote(t, prev, cur) {
    if (!prev || !cur || prev.deleted || !ACC.sess) return;
    ['lista', 'posti'].forEach(sec => {
      const a = snapOf(prev, sec), b = snapOf(cur, sec); const ja = JSON.stringify(a), jb = JSON.stringify(b); if (ja === jb) return;
      const now = Date.now();
      if (!H.applying) {
        const st = H.undo.get(t.id) || []; const last = st[st.length - 1];
        if (last && last.sec === sec && now - last.at < 2500 && !H.label && !last.label) { last.after = b; last.at = now; } else st.push({ sec, before: a, after: b, at: now, label: H.label || '' });
        while (st.length > 60) st.shift(); H.undo.set(t.id, st);
      }
      const key = t.id + '|' + sec; let B = H.burst.get(key);
      if (!B) { B = { tid: t.id, sec, start: a, jstart: ja, first: now, base: lastEditor(prev, sec) }; H.burst.set(key, B); }
      B.last = b; if (H.label) B.label = H.label;
      clearTimeout(B.tm); B.tm = setTimeout(() => histCapture(key), H.label || now - B.first > 60000 ? 50 : 8000);
    });
    histBtns();
  }
  const hashS = s => hash36(s);
  const idxPath = tid => `/cronologia/${tid}/${STORE.device.id}.json`;
  function histList(tid, sec) {
    return STORE.list(`/cronologia/${tid}/`).flatMap(([p, d]) => ((d && d.v) || []).map(v => Object.assign({ dev: d.dev || p.split('/').pop().replace('.json', '') }, v)))
      .filter(v => !sec || v.sec === sec).sort((a, b) => (+b.at || 0) - (+a.at || 0));
  }
  function saveVersion(tid, sec, snap, meta) {
    const id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); const js = JSON.stringify(snap);
    STORE.putBlob(`/cronologia/${tid}/${id}.ver`, new Blob([js], { type: 'application/json' }));
    const cur = JSON.parse(JSON.stringify(STORE.get(idxPath(tid)) || { dev: STORE.device.id, v: [] })); cur.v = cur.v || [];
    cur.v.push(Object.assign({ id, sec, h: hashS(js), kb: Math.round(js.length / 102.4) / 10 }, meta));
    // ogni computer tiene le ultime 150 versioni di ogni viaggio
    while (cur.v.length > 150) { const x = cur.v.shift(); STORE.delBlob(`/cronologia/${tid}/${x.id}.ver`).catch(() => {}); }
    cur.u = Date.now(); STORE.put(idxPath(tid), cur);
  }
  function histCapture(key) {
    const B = H.burst.get(key); if (!B) return; H.burst.delete(key);
    try {
      const jl = JSON.stringify(B.last); if (jl === B.jstart) return;
      const last = histList(B.tid, B.sec)[0]; const t = S.trips.find(x => x.id === B.tid);
      // la prima volta (o se nel frattempo è cambiato qualcosa che non era salvato) si salva anche com'era prima
      if (!last || last.h !== hashS(B.jstart)) saveVersion(B.tid, B.sec, B.start, { at: B.base.u || B.first - 1, by: B.base.by || '', ag: B.base.ag || '', txt: 'Com\'era prima di queste modifiche', base: 1 });
      const me = ACC.me();
      saveVersion(B.tid, B.sec, B.last, { at: Date.now(), by: me ? me.name : '', ag: ACC.sess && ACC.sess.ag || '', txt: (B.label ? B.label + ' · ' : '') + sumOf(B.sec, B.start, B.last, t) });
    } catch (e) { DIAG.ev('errore', 'Cronologia non salvata: ' + e.message, { stack: e.stack }); }
  }
  // ---- applicare una versione o annullare una modifica ----
  const cp = x => JSON.parse(JSON.stringify(x));
  function applyLista(t, snap) { t.rows = cp(snap.rows || []); t.attesa = cp(snap.attesa || []); t.annullati = cp(snap.annullati || []); ensureBlank(t); }
  function applyPosti(t, snap) { (snap.buses || []).forEach(sb => { const b = t.buses.find(x => x.id === sb.id); if (b) b.seats = cp(sb.seats || {}); }); }
  // inverso di un passo: solo le righe o i posti che quel passo aveva cambiato
  function undoStep(t, st) {
    if (st.sec === 'posti') {
      (st.after.buses || []).forEach(ab => { const bb = (st.before.buses || []).find(x => x.id === ab.id) || { seats: {} }; const b = t.buses.find(x => x.id === ab.id); if (!b) return;
        new Set([...Object.keys(ab.seats || {}), ...Object.keys(bb.seats || {})]).forEach(s => { const x = (bb.seats || {})[s], y = (ab.seats || {})[s]; if (JSON.stringify(x) === JSON.stringify(y)) return; if (x) b.seats[s] = cp(x); else delete b.seats[s]; }); });
      return;
    }
    const K = ['rows', 'attesa', 'annullati'];
    const where = (s, id) => { for (const k of K) { const i = (s[k] || []).findIndex(x => x.id === id); if (i >= 0) return { k, i, x: s[k][i] }; } return null; };
    const ids = new Set(); K.forEach(k => { (st.before[k] || []).forEach(x => ids.add(x.id)); (st.after[k] || []).forEach(x => ids.add(x.id)); });
    ids.forEach(id => {
      const b0 = where(st.before, id), a0 = where(st.after, id); if (b0 && a0 && b0.k === a0.k && JSON.stringify(b0.x) === JSON.stringify(a0.x)) return;
      K.forEach(k => { const i = t[k].findIndex(x => x.id === id); if (i >= 0) t[k].splice(i, 1); });
      if (b0) { const L = t[b0.k]; L.splice(Math.min(b0.i, L.length), 0, cp(b0.x)); }
    });
    ensureBlank(t);
  }
  function doUndo(t) {
    if (!histCan(t)) return toast('Il tasto Indietro è bloccato dal Master');
    flush(); const sec = UI.sec === 'posti' ? 'posti' : 'lista'; const st = H.undo.get(t.id) || [];
    let i = st.length - 1; while (i >= 0 && st[i].sec !== sec) i--;
    if (i < 0) return toast(`Nessuna modifica da annullare fatta da questo computer sulla ${HSEC_L[sec]}: per tornare a una versione precedente usa la Cronologia`);
    const step = st.splice(i, 1)[0]; const txt = step.label ? step.label.toLowerCase() : sumOf(sec, step.before, step.after, t);
    H.applying = true; H.label = 'Indietro (annullata: ' + txt + ')';
    try { undoStep(t, step); syncAll(t); flush(); } finally { H.applying = false; H.label = ''; }
    ACC.tlog('info', `Indietro sulla ${HSEC_L[sec]} · ${t.nome} (${t.data}) · annullato: ${txt}`);
    render(); toast(`Annullato: ${txt}`);
  }
  async function restoreVersion(t, v) {
    if (!histCan(t)) return toast('Il ripristino è bloccato dal Master');
    let snap = null;
    try { const bl = await STORE.getBlob(`/cronologia/${t.id}/${v.id}.ver`); if (bl) snap = JSON.parse(await bl.text()); } catch (e) { snap = null; }
    if (!snap) return toast('Non riesco a leggere questa versione: serve internet per scaricarla');
    flush(); const sec = v.sec; const cur = snapOf(persistForm(t), sec);
    if (JSON.stringify(cur) === JSON.stringify(snap)) return toast('La ' + HSEC_L[sec] + ' è già uguale a questa versione');
    const diff = sumOf(sec, cur, snap, t);
    let warn = '';
    if (sec === 'lista') { const ids = new Set((snap.rows || []).map(x => x.id)); const paid = deriveBookings(t).filter(bk => !ids.has(bk.id) && paidMovs(t.id, bk.id) > 0); if (paid.length) warn = `<div class="warnbox" style="margin-top:10px">Attenzione: ${paid.map(bk => esc(bkName(bk))).join(', ')} ${paid.length === 1 ? 'ha' : 'hanno'} incassi registrati e con questa versione ${paid.length === 1 ? 'esce' : 'escono'} dalla lista. Gli incassi restano nel resoconto.</div>`; }
    closeModal();
    confirmBox(`Ripristina la ${HSEC_L[sec]}`, `Versione di <b>${esc(v.by || (v.base ? 'Versione di partenza' : '—'))}</b>${v.ag ? ' (' + esc(agName(v.ag)) + ')' : ''} del ${esc(ddS(v.at))} alle ${esc(hmS(v.at))}: «${esc(v.txt || '')}».<br><br>La ${HSEC_L[sec]} torna com'era allora. Cosa cambia rispetto a adesso: <b>${esc(diff)}</b>.<br><small>Le modifiche fatte dopo restano nella cronologia, se servono.</small>${warn}`, 'Ripristina', () => {
      // il ripristino si può annullare con Indietro
      H.label = `Ripristinata la versione ${v.by ? 'di ' + v.by + ' ' : ''}delle ${hmS(v.at)} del ${ddS(v.at)}`;
      try { if (sec === 'lista') applyLista(t, snap); else applyPosti(t, snap); syncAll(t); flush(); } finally { H.label = ''; }
      ACC.tlog('avviso', `Ripristinata la ${HSEC_L[sec]} · ${t.nome} (${t.data}) · versione di ${v.by || '—'} del ${ddS(v.at)} alle ${hmS(v.at)}`);
      render(); toast(`${sec === 'lista' ? 'Lista ripristinata' : 'Piantina ripristinata'}: versione di ${v.by || '—'} delle ${hmS(v.at)}`);
    });
  }
  function histModal(t) {
    flush(); Object.keys(Object.fromEntries(H.burst)).forEach(k => { if (k.startsWith(t.id + '|')) histCapture(k); });
    const sec = UI.sec === 'posti' ? 'posti' : 'lista'; const L = histList(t.id, sec); const can = histCan(t);
    UI.modal = { kind: 'hist', tripId: t.id, sec };
    const days = []; L.forEach(v => { const d = ddS(v.at); let g = days.find(x => x.d === d); if (!g) days.push(g = { d, v: [] }); g.v.push(v); });
    openModal(`Cronologia della ${HSEC_L[sec]}`, `<div class="hi-top"><span>${esc(t.nome)} · ${esc(fmtTripDate(t))}</span>${t.histLock ? `<span class="pill lk-pill">${ICON.lock} Indietro e Ripristina bloccati dal Master</span>` : ''}</div>
      ${L.length ? days.map(g => `<div class="hi-day">${esc(g.d)}</div>${g.v.map((v, i) => `<div class="hi-v${esc(v === L[0] ? ' now' : '')}"><div class="hi-t">${esc(hmS(v.at))}</div><div class="hi-b"><div class="hi-w"><b>${esc(v.by || (v.base ? 'Versione di partenza' : '—'))}</b>${v.ag ? `<span class="code">${esc(agName(v.ag))}</span>` : ''}${v === L[0] ? '<span class="pill ok">ultima versione</span>' : ''}</div><div class="hi-x">${esc(v.txt || '')}</div></div>${v === L[0] ? '' : `<button class="btn sm" data-act="hrest" data-id="${esc(v.id)}"${can ? '' : ' disabled title="Bloccato dal Master"'}>Ripristina</button>`}</div>`).join('')}`).join('')
        : `<div class="infobox">Ancora nessuna versione salvata per la ${HSEC_L[sec]} di questo viaggio. Da adesso ogni modifica viene salvata qui, con chi l'ha fatta.</div>`}`,
      `<button class="btn" data-act="close">Chiudi</button>`, true);
  }
  function histBarHTML(t) {
    const sec = UI.sec === 'posti' ? 'posti' : 'lista'; const st = (H.undo.get(t.id) || []).filter(x => x.sec === sec); const can = histCan(t);
    const last = st[st.length - 1];
    return `<div class="hbar" role="group" aria-label="Indietro e cronologia">
      <button class="btn sm" id="h-undo" data-act="hundo"${!st.length || !can ? ' disabled' : ''} title="${!can ? 'Bloccato dal Master' : last ? 'Annulla: ' + esc(sumOf(sec, last.before, last.after, t)) : 'Nessuna modifica da annullare fatta da questo computer'}">${ICON.undo} Indietro</button>
      <button class="btn sm" data-act="hlist">${ICON.hist} Cronologia</button>
      ${isMaster() ? `<button class="btn sm ${esc(t.histLock ? 'lk-on' : 'ghost')} ico-only" data-act="hlock" title="${esc(t.histLock ? 'Sblocca: anche gli operatori possono usare Indietro e Ripristina' : 'Blocca Indietro e Ripristina per gli operatori')}" aria-label="${esc(t.histLock ? 'Sblocca Indietro' : 'Blocca Indietro')}">${t.histLock ? ICON.lock : ICON.unlock}</button>` : t.histLock ? `<span class="lk-ico" title="Indietro e Ripristina bloccati dal Master">${ICON.lock}</span>` : ''}</div>`;
  }
  // aggiorna i pulsanti senza ridisegnare la pagina (si chiama a ogni salvataggio)
  function histBtns() { const t = UI.view === 'trip' && trip(); const el = $('.hbar'); if (t && el) el.outerHTML = histBarHTML(t); }
  window.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="hundo"],[data-act="hlist"],[data-act="hlock"],[data-act="hrest"]'); if (!el) return;
    e.stopImmediatePropagation(); const t = trip(); if (!t) return; const a = el.dataset.act;
    if (a === 'hundo') doUndo(t);
    else if (a === 'hlist') histModal(t);
    else if (a === 'hlock') { if (!isMaster()) return; if (t.histLock) { delete t.histLock; ACC.tlog('avviso', `Sbloccato Indietro · ${t.nome} (${t.data})`); toast('Indietro e Ripristina di nuovo disponibili per tutti'); } else { const me = ACC.me(); t.histLock = { by: me ? me.name : '', at: Date.now() }; ACC.tlog('avviso', `Bloccato Indietro · ${t.nome} (${t.data})`); toast('Indietro e Ripristina bloccati: li usa solo il Master'); } commit(); }
    else if (a === 'hrest') { const v = histList(t.id).find(x => x.id === el.dataset.id); if (v) restoreVersion(t, v); }
  }, true);
  // Ctrl+Z / ⌘+Z fuori dai campi di testo = Indietro
  document.addEventListener('keydown', e => {
    if (!(e.key === 'z' || e.key === 'Z') || !(e.ctrlKey || e.metaKey) || e.shiftKey) return; const tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return; if ($('#modal-root').innerHTML || $('.paymodal')) return;
    const t = UI.view === 'trip' && trip(); if (!t) return; e.preventDefault(); doUndo(t);
  });

  // ---------- MANUALE D'ISTRUZIONI e ricerca «Aiuto» (2.1.7) ----------
  // Il manuale va aggiornato a ogni versione: mk.py si ferma se HELP_VER non è uguale alla versione dell'app.
  // Le «Novità» si prendono da sole da CHANGES.txt (le ultime 3 versioni): mk.py le scrive qui sotto, in HELP_NEWS.
  const HELP_VER = '2.1.14';
  const HELP_CAT = [['primi', 'Primi passi'], ['viaggi', 'Viaggi e liste'], ['posti', 'Posti sul bus'], ['stampe', 'Stampe e messaggi'], ['cassa', 'Incassi e cassa'], ['bigl', 'Biglietteria'], ['buoni', 'Buoni regalo'], ['rete', 'Internet e computer'], ['imp', 'Account e impostazioni']];
  const HELP = [
    // ---- primi passi ----
    { id: 'accesso', c: 'primi', t: 'Entrare nell\'app e scegliere l\'agenzia', k: 'login accedere password nome agenzia ragusa modica marina entrare ricordami',
      s: ['Apri l\'app dal suo indirizzo o dall\'icona sul computer.', 'Scrivi il tuo nome e la tua password.', 'Metti la spunta su «Ricordami su questo computer» solo se il computer è dell\'agenzia e non lo usano altri.', 'Clicca «Accedi».', 'Scegli l\'agenzia in cui lavori oggi (Ragusa, Modica o Marina di Ragusa): gli incassi vanno nella sua cassa.'],
      n: 'Per cambiare agenzia durante la giornata clicca il nome dell\'agenzia in alto (con la puntina rossa). Per sicurezza l\'app ti fa uscire da sola dopo 30 minuti in cui non la usi e quando cambia il giorno: rientri con nome e password.' },
    { id: 'password', c: 'primi', t: 'Cambiare la password o password dimenticata', k: 'password dimenticata cambiare nuova reimpostare account bloccato',
      s: ['Per cambiarla: in alto clicca «Impostazioni», poi «Il mio account».', 'Scrivi la password di adesso e due volte quella nuova (almeno 8 caratteri).', 'Clicca «Cambia la password».', 'Se l\'hai dimenticata: chiedi a un Master di andare in Impostazioni › «Operatori e permessi» e premere «Reimposta password» accanto al tuo nome.', 'Il Master ti dice una password provvisoria: al primo accesso l\'app ti chiede di sceglierne una nuova.'] },
    { id: 'menu', c: 'primi', t: 'Il menu in alto: a cosa serve ogni voce', k: 'menu barra voci sezioni dove trovo icone',
      s: ['«Viaggi»: l\'elenco di gite, tour ed eventi; da qui apri la lista prenotazioni e i posti sul bus.', '«Piantine»: i modelli dei pullman della flotta.', '«Biglietteria»: biglietti di concerti ed eventi, sospesi e controllo dei circuiti.', '«Cassa»: il resoconto del giorno, la chiusura della cassa e i buoni regalo.', '«Contabilità»: resoconto giornaliero e mensile di tutte le agenzie (Master e contabilità).', '«Anagrafica»: i clienti.', '«Impostazioni»: account, agenzie, luoghi di partenza, WhatsApp, registratore e altro.', '«Aiuto» (la lente): questo manuale, con la ricerca. Si apre anche con il tasto F1. Il pallino accanto all\'agenzia dice se i dati sono allineati con gli altri computer.'],
      n: 'Sugli schermi più piccoli le voci mostrano solo l\'icona: passa sopra con il mouse per leggere il nome.' },
    // ---- viaggi e liste ----
    { id: 'nuovoviaggio', c: 'viaggi', t: 'Creare un nuovo viaggio (gita, tour, evento)', k: 'nuovo viaggio gita tour evento creare aggiungere data partenza rientro codice',
      s: ['In alto clicca «Viaggi».', 'Clicca «Nuovo viaggio».', 'Scrivi il nome, scegli il tipo (Gita, Tour o Evento) e la data di partenza; per i viaggi di più giorni anche il rientro. I biglietti da soli (senza bus) si vendono in «Biglietteria».', 'Se vuoi, scrivi il codice (es. G07, T08) e accendi i servizi compresi.', 'Clicca «Crea»: il viaggio si apre con un bus da 52 posti, che puoi cambiare.'] },
    { id: 'importword', c: 'viaggi', t: 'Importare la lista dal file Word', k: 'word docx importare lista file trascinare elenco',
      s: ['Per un viaggio nuovo: in «Viaggi» clicca «Nuovo viaggio da lista Word».', 'Per un viaggio che c\'è già: apri il viaggio, «Lista prenotazioni», poi «Importa da Word».', 'Trascina il file Word nel riquadro (oppure cliccalo per sceglierlo).', 'Controlla l\'anteprima: persone, lista d\'attesa, annullati, quote e partenze.', 'Clicca il pulsante per importare.'],
      n: 'Puoi anche trascinare il file Word direttamente sulla pagina del viaggio.' },
    { id: 'scriverelista', c: 'viaggi', t: 'Scrivere le prenotazioni nella lista', k: 'lista prenotazioni scrivere riga comitiva x 2 x3 gruppo famiglia nomi aggiungere persona',
      s: ['Apri il viaggio e la scheda «Lista prenotazioni».', 'Scrivi come in Word: nella prima riga il cognome seguito da «x» e il numero di persone (es. «Rossi x 3») e il nome.', 'Nelle righe sotto scrivi le altre persone della comitiva.', 'Premi Invio per andare alla riga sotto.', 'Compila data, contatto, partenza (es. RG, MD), fila e note: si salva da solo.'],
      n: 'Se scrivi «x 4» su una comitiva da 3, l\'app aggiunge da sola le righe vuote da completare.' },
    { id: 'menuriga', c: 'viaggi', t: 'Il menu della riga: spostare, staccare, eliminare', k: 'menu riga numero tasto destro eliminare riga sopra sotto staccare capogruppo abituale saldato attesa',
      s: ['Clicca il numero a sinistra della riga (oppure tasto destro sulla riga).', 'Il menu ha due parti: in alto «Solo …» vale per la sola persona di quella riga; sotto «Tutta la comitiva …» vale per tutto il gruppo.', 'Se hai selezionato più righe (⌘ + clic sul numero, oppure «Seleziona tutta la comitiva») le voci valgono per le persone selezionate: la comitiva intera solo se è tutta selezionata.', 'Da qui: incasso, «Mostra sulla piantina», «Sposta in» un altro bus, «Stacca» dalla comitiva, «Riga sopra» e «Riga sotto», lista d\'attesa e «Non parte più».', 'Accendi «Cliente abituale» (precedenza nelle prime file) o «Saldato» (anche se il prezzo è diverso).', '«Elimina questa riga» in fondo, in rosso.'],
      n: 'Se sposti o metti in lista d\'attesa solo il capogruppo, «Cognome x N» passa alla persona che viene dopo nella lista: la comitiva non resta mai senza numero. Chi sposti da solo resta nella sua comitiva (per farne una prenotazione a sé usa «Stacca»).' },
    { id: 'attesa', c: 'viaggi', t: 'Lista d\'attesa e persone che non partono più', k: 'lista attesa conferma annullati non parte rimborso rinuncia',
      s: ['Sotto la lista c\'è la «Lista d\'attesa»: scrivi lì chi aspetta un posto.', 'Quando si libera un posto clicca il numero della riga d\'attesa e scegli «Conferma: passa nella lista partecipanti».', 'Chi non parte più: menu della riga › «Non parte più…» e scegli da rimborsare, già rimborsato o senza rimborso.', '«Solo …» toglie una persona sola (la comitiva scende di uno); «Tutta la comitiva …» toglie tutto il gruppo, che entra in lista d\'attesa come «Cognome x N».', 'Se ci ripensa: nelle tabelle in fondo clicca il numero della riga › «Riparte».'] },
    { id: 'listachiusa', c: 'viaggi', t: 'Chiudere la lista (niente nuove prenotazioni)', k: 'lucchetto chiudere lista chiusa bloccare prenotazioni riaprire completo esaurito',
      s: ['Solo il Master: apri il viaggio e in alto clicca «Chiudi la lista».', 'Con la lista chiusa non si aggiungono righe, le comitive non crescono e non si conferma dalla lista d\'attesa.', 'Si possono ancora correggere i dati, completare i nomi mancanti, sistemare i posti, incassare e scrivere nella lista d\'attesa.', 'Per riaprirla il Master clicca «Lista chiusa · riapri».'] },
    { id: 'indietro', c: 'viaggi', t: 'Annullare un errore: tasto Indietro e Cronologia', k: 'indietro annullare errore sbagliato ctrl z cronologia versione ripristinare tornare prima chi ha modificato',
      s: ['Nella pagina del viaggio, accanto alle schede, clicca «Indietro»: annulla l\'ultima modifica fatta da questo computer (anche Ctrl+Z, o ⌘+Z sul Mac).', 'Per tornare più indietro clicca «Cronologia»: vedi le versioni con ora, chi le ha fatte e da quale agenzia.', 'Clicca «Ripristina» sulla versione che vuoi: l\'app ti mostra cosa cambia e chiede conferma.', 'Anche un ripristino si può annullare con «Indietro».'],
      n: 'Il lucchetto accanto lo usa solo il Master: chiuso, Indietro e Ripristina li può usare solo lui. La lista e la piantina hanno ognuna la sua cronologia.' },
    { id: 'altrooperatore', c: 'viaggi', t: 'Un altro operatore sta lavorando sullo stesso viaggio', k: 'altro operatore stesso viaggio avviso arancione insieme contemporaneamente conflitto',
      s: ['Quando un collega apre lo stesso viaggio compare la finestra «Attenzione: non sei solo su questo viaggio»: clicca «Ho capito».', 'In alto resta la fascia arancione con chi c\'è e cosa sta facendo.', 'Mettetevi d\'accordo prima di spostare persone, cambiare posti o incassare.', 'Le modifiche si uniscono da sole; sulla stessa riga resta l\'ultima scritta per ogni campo.'] },
    { id: 'anagrafica', c: 'viaggi', t: 'Anagrafica clienti', k: 'anagrafica clienti cercare cliente codice fiscale importare excel suggerimenti',
      s: ['In alto clicca «Anagrafica».', 'Cerca il cliente per nome, telefono o codice fiscale.', 'Clicca il cliente per vedere e correggere i suoi dati e i viaggi fatti.', 'Quando scrivi un cognome nella lista, l\'app propone i clienti dell\'anagrafica: scegli quello giusto.'] },
    // ---- posti ----
    { id: 'posti', c: 'posti', t: 'Mettere le persone sui posti', k: 'posti piantina sistemare trascinare mettere posto bus sedile assegnare',
      s: ['Apri il viaggio e la scheda «Posti sul bus».', 'A sinistra c\'è la lista della gita: trascina una prenotazione sul posto della piantina (si siede tutta la comitiva) oppure un\'etichetta con il nome (solo quella persona).', 'In alternativa: clicca la prenotazione nella lista, poi clicca il posto.', 'Per sistemare tutti da soli con le vostre regole clicca «Sistema chi non ha il posto».'],
      n: 'Le richieste dei clienti (es. 1ª fila DX) si vedono sotto il nome: verde rispettata, rosso non rispettata.' },
    { id: 'spostaposto', c: 'posti', t: 'Spostare, scambiare o liberare un posto', k: 'spostare scambiare posto liberare togliere nota posto menu posto',
      s: ['Clicca il posto occupato sulla piantina: si apre il menu del posto.', '«Sposta o scambia», poi clicca il posto di arrivo (se è occupato, i due si scambiano).', '«Sposta tutta la prenotazione» (oppure doppio clic sul posto): poi clicca il posto da cui farla partire e gli altri del gruppo si siedono accanto.', 'Nel menu puoi scrivere una nota sul posto (es. no lattosio) e premere «Salva».', '«Togli dal posto» lascia la persona sul bus senza posto; «Togli dal bus» la toglie da quel bus.'],
      n: 'Puoi anche trascinare un posto su un altro. Cosa fanno il clic, il doppio clic e ⌥/⌘/Maiusc + clic sui posti si sceglie in Impostazioni › Gesti e scorciatoie › Piantina del bus.' },
    { id: 'sospeso', c: 'posti', t: 'Posti in sospeso: mettere da parte le persone mentre sistemi la piantina', k: 'sospeso posti in sospeso parcheggio da parte mettere da parte sistemare spostare liberare avviso dimenticato',
      s: ['Sopra la piantina c\'è il riquadro «Posti in sospeso».', 'Trascina lì un posto occupato, oppure clicca il posto › «Metti in sospeso»: il posto si libera e la persona resta da parte nel riquadro.', 'Sistema gli altri come vuoi.', 'Per rimetterla: trascina il suo nome su un posto, oppure clicca il nome e poi il posto.', 'La ✕ accanto al nome la toglie dal sospeso: resta sul bus senza posto.'],
      n: 'Se qualcuno resta in sospeso, la linguetta del bus mostra un numero rosso e l\'app avvisa prima di uscire dalla piantina, stampare o mandare i messaggi WhatsApp.' },
    { id: 'guida', c: 'posti', t: 'Riservare un posto per guida o 2° autista', k: 'guida secondo autista riservare posto accompagnatore',
      s: ['Clicca un posto libero sulla piantina.', 'Clicca «Riserva per guida / 2° autista».', 'Per togliere la riserva clicca di nuovo il posto e «Togli la riserva».'] },
    { id: 'piubus', c: 'posti', t: 'Più bus sullo stesso viaggio', k: 'secondo bus aggiungere bus piu bus lista per bus spostare bus cambiare piantina',
      s: ['Nella scheda «Posti sul bus» clicca il «+» accanto alle linguette dei bus.', 'Scegli la piantina del pullman e clicca «Aggiungi bus».', 'Nella lista prenotazioni ogni bus ha la sua lista: per spostare persone selezionale e usa «Sposta in».', 'Per cambiare il modello di un bus usa «Cambia» sotto «Piantina» nel pannello del bus.'] },
    // ---- stampe e messaggi ----
    { id: 'stampe', c: 'stampe', t: 'Stampare piantina, cartelli, lista e rooming list', k: 'stampare stampa piantina cartelli lista rooming autista accompagnatore pdf',
      s: ['Apri il viaggio.', 'Nella scheda «Posti sul bus» clicca «Stampa piantina» o «Stampa cartelli» (divisi per lato autista e lato hostess).', '«Stampa lista passeggeri» (sotto «Messaggi WhatsApp ai clienti») fa la lista per l\'accompagnatore: solo le persone di quel bus, con data, partenze e orari, nome del bus e numero di persone; niente prezzi, note della gita, supplementi o lista d\'attesa. La partenza di ognuno è colorata.', 'Nella «Lista prenotazioni» clicca «Stampa lista»; per i tour anche «Rooming list».', 'Nell\'anteprima clicca «Stampa» e scegli la stampante o «Salva come PDF».'],
      n: 'Sulla piantina «X 2», «X 5» dice quanti sono nel gruppo; in alto a destra del riquadro c\'è la fila pagata con il supplemento (es. «1ª fila»).' },
    { id: 'programma', c: 'stampe', t: 'Allegare il programma del viaggio (PDF o foto)', k: 'programma pdf foto allegare trascinare locandina',
      s: ['Apri il viaggio.', 'Trascina il PDF o la foto sul riquadro «Trascina qui il programma» in alto.', 'Per vederlo clicca il suo nome; per toglierlo usa la «x» accanto.'] },
    { id: 'whatsapp', c: 'stampe', t: 'Mandare ai clienti posto e programma su WhatsApp', k: 'whatsapp messaggio clienti inviare posto programma invia a tutti',
      s: ['Apri il viaggio, scheda «Posti sul bus».', 'Clicca «Messaggi WhatsApp ai clienti».', 'Controlla il messaggio e le persone pronte.', 'Clicca «Invia a tutti» oppure invia uno per uno.'],
      n: 'Il testo del messaggio si cambia in Impostazioni › «WhatsApp ai clienti».' },
    // ---- cassa ----
    { id: 'incasso', c: 'cassa', t: 'Incassare una prenotazione', k: 'incassare pagamento pagare soldi euro incasso acconto saldo contanti pos bonifico',
      s: ['Nella lista prenotazioni clicca il pulsante «€» della prenotazione (o dal menu della riga o del posto: «Incasso»).', 'Si apre la finestra al centro: in «Chi paga» scegli tutta la comitiva o una persona sola.', 'Scegli il documento (Scontrino, Caparra, Senza documento; per i tour Fattura).', 'In «Incassato adesso» controlla l\'importo e scegli come paga (Contanti, POS, Bonifico…).', 'Clicca il pulsante grande in basso (es. «Scontrino · 72,00 €»).', 'Per chiudere la finestra clicca la «x» in alto a destra (o Esc).'],
      n: 'Per le gite lo scontrino si fa solo al saldo: con un acconto scegli «Senza documento».' },
    { id: 'misto', c: 'cassa', t: 'Pagamento misto (es. contanti + POS)', k: 'misto contanti pos due metodi diviso parte',
      s: ['Nell\'incasso scrivi l\'importo totale in «Incassato adesso».', 'Clicca «Misto».', 'Scrivi quanto paga in contanti: il POS si riempie da solo con il resto (o viceversa).', 'Per altri metodi apri «Altri metodi» e usa «resto».', 'Quando la somma torna (✓) clicca il pulsante per registrare.'] },
    { id: 'righedoc', c: 'cassa', t: 'Righe del documento, fattura e dati della pratica', k: 'righe documento quantita prezzo supplemento fila descrizione fattura codice fiscale pratica canale pagante note',
      s: ['Nella finestra dell\'incasso, a destra, clicca «Righe del documento» per vedere o cambiare quantità, prezzi, supplemento fila e descrizione.', 'Per la fattura (tour) compila i dati sotto «Dati per la fattura»: il codice fiscale si calcola da solo dai dati di nascita.', '«Altri dati» (sotto il pagamento) contiene pratica, canale, pagante, note e «Pagato prima, fuori dall\'app».'] },
    { id: 'storno', c: 'cassa', t: 'Annullare un incasso sbagliato (storno)', k: 'storno annullare incasso sbagliato errore rimborso nota di credito',
      s: ['Apri l\'incasso della prenotazione (pulsante «€»).', 'A destra, in «Incassi registrati», clicca «Storna» accanto all\'incasso sbagliato.', 'Conferma: nel resoconto resta un movimento uguale e contrario.'],
      n: 'Un operatore può stornare solo i suoi incassi di oggi; chi gestisce tutte le casse (Master) anche gli altri.' },
    { id: 'scontrino', c: 'cassa', t: 'Lo scontrino e il registratore telematico', k: 'scontrino registratore custom stampante fiscale da emettere reparti iva',
      s: ['Nella finestra dell\'incasso vedi l\'anteprima dello scontrino come uscirà dal registratore.', 'Per ora l\'app non manda nulla al registratore: gli scontrini restano «da emettere» e si battono sul registratore come sempre.', 'Reparti, IVA e intestazione si impostano in Impostazioni › «Registratore telematico».'] },
    { id: 'resoconto', c: 'cassa', t: 'Chiudere la cassa: resoconto e chiusura della giornata', k: 'resoconto cassa giornata chiusura chiudere cassa contanti fine giornata stampa',
      s: ['In alto clicca «Cassa»: vedi i movimenti di oggi divisi per metodo.', 'Con «‹ Giorno prima» e «Giorno dopo ›» (o il calendario) cambi giorno.', 'A fine giornata clicca «Chiudi la cassa», conta i contanti e scrivili.', 'Controlla la differenza e clicca il pulsante per salvare; puoi anche stampare.'] },
    { id: 'prelievo', c: 'cassa', t: 'Prelievi e apporti di contanti', k: 'prelievo apporto contanti versamento banca fondo cassa',
      s: ['In «Cassa» clicca «Prelievo» (es. versamento in banca) o «Apporto» (es. fondo cassa).', 'Scrivi l\'importo e il motivo.', 'Clicca «Registra»: va nel resoconto e nel conto dei contanti.'] },
    { id: 'contabilita', c: 'cassa', t: 'Contabilità, Excel e Danea', k: 'contabilita resoconto mensile excel scaricare danea fatture csv',
      s: ['In alto clicca «Contabilità» (solo Master e contabilità).', '«Resoconto giornaliero»: come il foglio CASSA, con «Scarica per Excel».', '«Mese»: i totali del mese, le chiusure e i viaggi.', 'Per le fatture usa «Apri in Danea» nell\'incasso o «Fatture del giorno per Danea».'] },
    // ---- biglietteria ----
    { id: 'evbiglietto', c: 'viaggi', t: 'Eventi: tipi di biglietto e chi paga solo il bus', k: 'evento concerto biglietto tipi di biglietto parterre tribuna settore intero ridotto diritti solo bus fila somma quota prezzo biglietto compreso',
      s: ['Apri la lista dell\'evento: in alto, nel riquadro «Biglietto dell\'evento», scrivi il tipo (es. Parterre) con il prezzo intero e, se c\'è, ridotto.', 'Per altri tipi clicca «Aggiungi tipo di biglietto» (es. Tribuna); la «×» toglie un tipo.', 'Scrivi i diritti a biglietto e scegli il circuito.', 'Nella lista, colonna «fila»: scrivi il tipo o la fila del biglietto (es. «Parterre» o «Tribuna 12»). Il biglietto si somma solo a chi ha la fila scritta.', 'Se la fila è vuota la persona paga solo il bus: nella colonna «quota» c\'è scritto «solo bus».'],
      n: 'Se nella fila c\'è il nome di un tipo si usa il suo prezzo, altrimenti quello del primo tipo. Ai bambini si applica il prezzo ridotto, se c\'è. Negli eventi la fila è quella del biglietto: non dà indicazioni sul posto del bus (quelle si scrivono nelle note). Gli eventi creati prima della versione 2.1.8 restano con la regola di prima (biglietto a tutti) finché non clicchi «Usa la regola nuova» nel riquadro del biglietto.' },
    { id: 'evemissione', c: 'viaggi', t: 'Eventi: data di emissione dei biglietti', k: 'emissione data emissione biglietti emesso il quando emesso colonna emissione circuito',
      s: ['Nella lista dell\'evento c\'è la colonna «emissione», subito dopo «fila».', 'Scrivi il giorno in cui avete emesso il biglietto sul circuito, es. 05/11/26 (va bene anche 5/11).', 'Quando incassi, l\'app usa questa data come «Emissione biglietti» al posto della data di oggi.'],
      n: 'Se la data non si capisce la cella si sottolinea in rosso.' },
    { id: 'evcollega', c: 'bigl', t: 'Collegare un evento con il bus alla Biglietteria', k: 'collegare collega biglietteria evento bus viaggio importare legare sospesi venduti scollega pacchetto biglietto bus',
      s: ['Apri la lista dell\'evento con il bus.', 'Nel riquadro «Biglietto dell\'evento» clicca «Collega alla Biglietteria».', 'Scegli l\'evento già creato in Biglietteria, oppure «Crea un nuovo evento con i dati di questo viaggio».', 'Clicca «Collega»: tipi di biglietto, diritti e circuito diventano quelli dell\'evento in Biglietteria (si cambiano da lì, con «Apri in Biglietteria»).', 'In Biglietteria › Eventi vedi anche i biglietti venduti con il bus; in › Sospesi i pacchetti biglietto + bus non ancora saldati.'],
      n: 'Per togliere il collegamento clicca «Scollega»: l\'evento resta in Biglietteria e i prezzi restano scritti nella lista. Un viaggio si collega a un solo evento, e si collegano solo i viaggi di tipo «Evento». Un evento collegato non si può togliere dalla Biglietteria: prima scollegalo.' },
    { id: 'bgbus', c: 'bigl', t: 'Biglietteria: vendere biglietto + bus', k: 'vendere biglietto bus pacchetto biglietto piu bus concerto con il bus mettere in lista posti liberi',
      s: ['In «Biglietteria», scheda «Vendita», scegli l\'evento collegato al viaggio con il bus.', 'Nel riquadro azzurro vedi i posti liberi sul bus: clicca «Vendi biglietto + bus».', 'Scrivi quante persone, i nomi (il cognome si ripete da solo se è lo stesso), il telefono, il tipo di biglietto e il giorno di emissione.', 'Clicca «Metti in lista e incassa»: le persone entrano nella lista del viaggio e si apre l\'incasso con bus + biglietto.'],
      n: 'Se sul bus non ci sono abbastanza posti la vendita è bloccata. La parte sotto il riquadro azzurro vende solo il biglietto, senza il bus.' },
    { id: 'note2', c: 'viaggi', t: 'Note 2: note interne che non vanno in stampa', k: 'note 2 nota interna privata promemoria non stampare stampa lista appunti',
      s: ['Nella lista prenotazioni, accanto alla colonna «note», c\'è la colonna «note 2».', 'Scrivi lì gli appunti solo per voi dell\'agenzia (es. «ha pagato con bonifico», «richiamare venerdì»).', 'Quando stampi la lista, la colonna «note 2» non compare: nella stampa c\'è solo «note».'],
      n: 'Le note scritte in «note» vanno in stampa e servono anche per le richieste di posto (es. «vicino al finestrino»); quelle in «note 2» no.' },
    { id: 'piantinaaccanto', c: 'posti', t: 'Vedere la piantina accanto alla lista', k: 'piantina accanto lista vicino affiancata nascondere mostrare piantina nascosta dock',
      s: ['Apri la lista prenotazioni del viaggio.', 'Clicca «Piantina accanto» (sopra la lista, a destra): la piantina compare a fianco e puoi trascinare le persone sui posti.', 'Per toglierla clicca «Nascondi piantina».'],
      n: 'Negli eventi la piantina parte nascosta. L\'app ricorda la scelta per ogni viaggio.' },
    { id: 'postifiniti', c: 'posti', t: 'Posti finiti: persone «senza posto» e incasso bloccato', k: 'posti finiti pieno bus pieno senza posto oltre i posti doppia vendita bloccato non posso incassare capienza troppe persone',
      s: ['Negli eventi, se nella lista ci sono più persone dei posti del bus, sopra la lista compare l\'avviso rosso «Posti finiti».', 'Le ultime persone della lista sono segnate «senza posto» nella colonna «posto»: non si possono incassare.', 'Per sistemare: aggiungi un bus da «Posti sul bus» (pulsante «+»), oppure sposta qualcuno in lista d\'attesa.', 'Appena ci sono abbastanza posti l\'avviso sparisce e l\'incasso torna possibile.'],
      n: 'Serve a non vendere mai lo stesso posto due volte: anche «Vendi biglietto + bus» in Biglietteria controlla i posti liberi.' },
    { id: 'bgevento', c: 'bigl', t: 'Biglietteria: creare un evento con settori e prezzi', k: 'biglietteria evento concerto nuovo evento settori prezzi tariffe intero ridotto diritti circuito ticketone boxol vivaticket',
      s: ['In alto clicca «Biglietteria», poi la scheda «Eventi».', 'Clicca «Nuovo evento».', 'Scrivi nome, luogo, data e scegli il circuito (i diritti di prevendita si propongono da soli: 2 € TicketOne, 3 € gli altri).', 'In «Settori e prezzi» scrivi ogni settore con il prezzo intero e, se c\'è, ridotto; «Aggiungi settore» per gli altri.', 'Se c\'è il bus, in «Viaggio con il bus» scegli il viaggio.', 'Clicca «Crea l\'evento».'] },
    { id: 'bgvendita', c: 'bigl', t: 'Biglietteria: vendere biglietti', k: 'vendere biglietti vendita biglietto concerto cliente incassare emissione',
      s: ['In «Biglietteria» resta sulla scheda «Vendita».', 'Scrivi le prime lettere dell\'evento e sceglilo.', 'Clicca il settore e scrivi quanti biglietti interi e ridotti.', 'Scrivi il nome del cliente e controlla «Emesso sul circuito il».', 'Clicca «Incassa» e completa l\'incasso; oppure «Emesso, non pagato (sospeso)» se pagherà dopo.'],
      n: 'Nello scontrino vanno solo i diritti di prevendita (la parte dell\'agenzia).' },
    { id: 'bgsospesi', c: 'bigl', t: 'Biglietteria: biglietti sospesi (emessi e non pagati)', k: 'sospesi biglietti non pagati da incassare emessi pagare dopo',
      s: ['In «Biglietteria» clicca la scheda «Sospesi».', 'Vedi i biglietti per evento: data di emissione, acquirente, settore, prezzo, da incassare, agenzia.', 'Usa i pulsanti in alto per vedere un solo circuito.', 'Quando il cliente paga clicca «Incassa» sulla sua riga.'] },
    { id: 'bgagenzia', c: 'bigl', t: 'Biglietteria: biglietti comprati dall\'agenzia (pacchetti bus + biglietto)', k: 'biglietti agenzia comprati pre acquistati preacquistati blocco stock pacchetto liberi',
      s: ['In «Biglietteria» clicca la scheda «Biglietti dell\'agenzia».', 'Clicca «Biglietti comprati».', 'Scegli evento e settore, scrivi quanti biglietti, il prezzo e il giorno in cui li avete emessi; se servono per un viaggio con il bus, sceglilo.', 'Clicca «Aggiungi i biglietti».', 'Per darli ai clienti: in «Vendita» scegli «Biglietto dell\'agenzia», oppure nell\'incasso del viaggio collegato apri «Righe del documento» e scegli «Biglietti dell\'agenzia».'],
      n: 'I biglietti comprati per un viaggio con il bus restano per il bus: non si vendono da soli in «Vendita». Nell\'incasso del viaggio si vedono solo quelli del settore giusto e non si possono usare più biglietti di quelli rimasti liberi.' },
    { id: 'bgcontrollo', c: 'bigl', t: 'Biglietteria: controllo dei circuiti e portafoglio TicketOne', k: 'controllo circuiti emesso incassato sospesi portafoglio addebito ticketone b-fast settimana differenza',
      s: ['In «Biglietteria» clicca la scheda «Controllo circuiti».', 'Scegli il circuito e la settimana con ‹ e ›.', 'Per ogni giorno vedi l\'emesso, l\'incassato a Ragusa, Modica e Marina e i sospesi.', 'Per TicketOne e B-Fast, sotto, scrivi l\'addebito della settimana quando arriva: l\'app lo confronta con le vostre emissioni e mostra la differenza.'],
      n: 'Gli incassi contano nel giorno in cui il biglietto è stato emesso, in qualsiasi agenzia vengano fatti.' },
    { id: 'bgrimborso', c: 'bigl', t: 'Biglietteria: rimborso, cambio nome, vendita sbagliata', k: 'rimborso biglietto cambio nome annullare vendita sbagliata restituire',
      s: ['In «Vendita», nelle «Vendite di oggi», clicca i tre puntini «⋯» della vendita.', '«Cambio nome»: registra 5 € + 5 € di diritti e apre l\'incasso.', '«Rimborso»: scegli quanti biglietti e l\'importo da restituire (i diritti non si rimborsano).', '«Annulla la vendita»: solo per vendite registrate per sbaglio e senza incassi.'] },
    // ---- buoni ----
    { id: 'buononuovo', c: 'buoni', t: 'Creare un buono regalo', k: 'buono regalo nuovo creare regalare voucher pratica',
      s: ['In alto clicca «Cassa», poi «Buoni regalo».', 'Clicca «Nuovo buono».', 'Scrivi chi riceve il buono, chi lo fa, l\'importo e scegli come paga.', 'Clicca «Crea il buono e incassa»: il numero di pratica si assegna da solo (es. RAG-26-001) e l\'importo va in cassa.'] },
    { id: 'buonousa', c: 'buoni', t: 'Pagare con un buono regalo', k: 'pagare buono regalo usare scalare residuo',
      s: ['Nell\'incasso della prenotazione (o della biglietteria) scegli «Buono regalo» come metodo (o dentro «Misto»).', 'Scrivi il numero o il nome e scegli il buono.', 'L\'importo si scala da solo; se il buono non basta, paga il resto con «Misto».', 'Registra l\'incasso: il buono si aggiorna da solo e, finito, passa nell\'«Archivio buoni».'] },
    // ---- rete ----
    { id: 'offline', c: 'rete', t: 'Lavorare senza internet', k: 'senza internet offline connessione linea caduta cade manca non funziona wifi rete fascia rossa telefonare',
      s: ['Se cade la linea compare «Stai lavorando senza internet» con chi era collegato e il telefono: clicca «Ho capito».', 'Puoi continuare a lavorare: la fascia rossa in alto ricorda che le modifiche partiranno dopo.', 'Prima di vendere posti o incassare telefona a chi era collegato: l\'app ti chiede «hai sentito al telefono…?» la prima volta su ogni viaggio.', 'Quando torna la linea compare «Internet tornato» e poi «Tutto sincronizzato».'] },
    { id: 'controllocasi', c: 'rete', t: '«Da controllare dopo il ritorno di internet»', k: 'controllare dopo ritorno internet posto doppio incassato due volte bus pieno risolto',
      s: ['Se mentre eri senza linea un collega ha cambiato le stesse cose, compare la finestra «Da controllare…».', 'Per ogni caso clicca «Apri la piantina» o «Apri la prenotazione» e sistemalo.', 'Poi clicca «Risolto» nel riquadro rosso del viaggio (o in Contabilità).'],
      n: 'L\'app non cambia nulla da sola: decidi tu.' },
    { id: 'sync', c: 'rete', t: 'I dati non si aggiornano tra i computer', k: 'sincronizzazione dropbox non aggiorna altri computer dati vecchi pallino rosso errore',
      s: ['Guarda il pallino in alto accanto all\'agenzia: verde = allineato, giallo = sto inviando, rosso = senza internet o errore.', 'Controlla che il computer sia collegato a internet.', 'In Impostazioni › «Sincronizzazione» clicca «Sincronizza».', 'Ricarica la pagina (F5, o ⌘+R sul Mac).', 'L\'app deve essere aperta in una sola finestra per computer.'] },
    { id: 'aggiornare', c: 'rete', t: 'Aggiornare l\'app a una nuova versione', k: 'aggiornare versione nuova github zip caricare novita',
      s: ['Scarica lo zip della nuova versione ed estrailo.', 'Su GitHub, nel repository dell\'app, clicca «Add file», poi «Upload files».', 'Trascina tutto il contenuto della cartella «viaggi-in-pullman» e clicca «Commit changes».', 'Dopo 2–3 minuti apri l\'app e ricaricala due volte.', 'In Impostazioni controlla il numero di versione in basso a sinistra.'] },
    // ---- impostazioni ----
    { id: 'operatori', c: 'imp', t: 'Creare un account per un operatore', k: 'nuovo account operatore utente creare permessi ruolo master agenzie cellulare sigla',
      s: ['Solo il Master: Impostazioni › «Operatori e permessi».', 'Clicca «Nuovo account».', 'Scrivi il nome, scegli il ruolo (Operatore, Master, Contabilità) e le agenzie in cui può entrare.', 'Facoltativo: cellulare (si mostra ai colleghi quando manca internet).', 'Dì alla persona la password provvisoria: al primo accesso ne sceglie una sua.'] },
    { id: 'agenzie', c: 'imp', t: 'Agenzie, casse e telefoni', k: 'agenzia cassa telefono indirizzo fondo cassa registratore impostazioni',
      s: ['Solo il Master: Impostazioni › «Agenzie e casse».', 'Per ogni agenzia: nome, nome della cassa, indirizzo, contanti iniziali, telefono dell\'agenzia.', 'Le modifiche si salvano da sole.'] },
    { id: 'luoghi', c: 'imp', t: 'Luoghi di partenza e mappe', k: 'luoghi partenza fermata google maps link punto salita',
      s: ['Impostazioni › «Luoghi di partenza e mappe».', 'Clicca «Aggiungi luogo» e scrivi codice (es. RG), città e punto di salita.', 'Clicca «Cerca su Maps», poi su Google Maps «Condividi» › «Copia link» e incolla il link nella colonna.', 'Nella colonna «Colore» scegli il colore con cui la partenza è evidenziata nella lista per l\'accompagnatore (di partenza: Ragusa verde, Modica giallo, Coffa azzurro, Ispica viola, Rosolini arancio).'] },
    { id: 'backup', c: 'imp', t: 'Copia di sicurezza dei dati', k: 'copia sicurezza backup scaricare salvare dati',
      s: ['Solo il Master: Impostazioni › «Copia di sicurezza».', 'Clicca il pulsante per scaricare la copia: è un file con tutti i viaggi, i clienti e gli incassi.', 'Conservala in un posto sicuro (es. una cartella di Dropbox).'] }
  ];
  // ---- ricerca: parole senza accenti, sinonimi, radici delle parole ----
  const HSTOP = new Set('il lo la i gli le un uno una di a da in con su per tra fra e o ma se che chi cosa come dove quando non mi ti si ci vi ne del della dei degli delle al allo alla ai agli alle dal dalla dai nel nella nei nelle sul sulla sui è e ho ha hanno fare faccio posso devo voglio vorrei serve servono mio mia miei mie questo questa quello quella app'.split(' '));
  const HSYN = [['incasso incassare pagare pagamento pagato soldi euro'], ['scontrino ricevuta documento'], ['biglietto biglietti ticket tkt'], ['posto posti piantina sedile sedili'], ['prenotazione prenotazioni lista elenco cliente clienti persona persone'], ['internet offline linea connessione rete'], ['buono buoni regalo voucher'], ['cancellare eliminare togliere rimuovere'], ['annullare indietro errore sbagliato undo'], ['stampare stampa pdf'], ['sospeso sospesi'], ['viaggio viaggi gita gite tour evento'], ['password accesso login entrare'], ['whatsapp messaggio messaggi']].map(x => x[0].split(' '));
  const hnorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const hstem = w => (w.length > 5 ? w.replace(/(azione|azioni|amento|amenti|mente|zione|zioni|are|ere|ire|ato|ata|ati|ate|ito|ita|iti|ite|i|e|a|o)$/, '') : w.length > 3 ? w.replace(/[aeio]$/, '') : w);
  const hwords = s => hnorm(s).split(' ').filter(w => w && !HSTOP.has(w));
  function hexpand(w) { const st = hstem(w); const out = new Set([st]); HSYN.forEach(g => { if (g.some(x => hstem(x) === st)) g.forEach(x => out.add(hstem(x))); }); return [...out]; }
  const HIDX = HELP.map(a => ({ a, t: new Set(hwords(a.t).map(hstem)), k: new Set(hwords(a.k).map(hstem)), b: new Set(hwords((a.s || []).join(' ') + ' ' + (a.n || '')).map(hstem)) }));
  function helpSearch(q) {
    const ws = [...new Set(hwords(q))]; if (!ws.length) return [];
    const has = (s, e) => [...s].some(v => v === e || (e.length >= 4 && v.startsWith(e)) || (v.length >= 5 && e.startsWith(v)));
    const lev = (x, w) => { let best = 0; hexpand(w).forEach(e => { if (has(x.t, e)) best = Math.max(best, 3); else if (has(x.k, e)) best = Math.max(best, 2); else if (has(x.b, e)) best = Math.max(best, 1); }); return best; };
    const M = HIDX.map(x => ws.map(w => lev(x, w)));
    // le parole rare (es. «guida», «rooming») pesano più di quelle che compaiono dappertutto (es. «lista», «bus»)
    const idf = ws.map((w, j) => { const df = M.filter(r => r[j]).length; return df ? 1 + Math.log(HIDX.length / df) : 0; });
    const R = HIDX.map((x, i) => { const r = M[i]; const hit = r.filter(Boolean).length; return { a: x.a, hit, sc: r.reduce((s, v, j) => s + v * idf[j], 0) * (hit === ws.length ? 1.3 : 1) }; })
      .filter(r => r.hit && r.sc >= 2).sort((a, b) => b.sc - a.sc);
    return R.length ? R.filter(r => r.sc >= R[0].sc * 0.4).slice(0, 8) : [];
  }
  const HELP_NEWS = "VERSIONE 2.1.14 · 06/11/2026\nMIGLIORIE DEL 6/11: LISTA PER L'ACCOMPAGNATORE, POSTI IN SOSPESO, MENU E SPOSTAMENTI (da caricare al posto della 2.1.13)\n\n1. Posti sul bus › «Stampa lista passeggeri» (sotto «Messaggi WhatsApp ai clienti»): lista per l'accompagnatore con solo le persone di quel bus. Ci sono nome della gita, data, partenze con orari (e quante persone salgono in ognuna), nome del bus e numero di persone; per ognuno contatto, partenza, note e posto. Niente prezzi, note della gita, supplementi delle file e lista d'attesa.\n2. Colori delle partenze: nella lista per l'accompagnatore la partenza di ognuno è colorata. Il colore si sceglie in Impostazioni › Luoghi di partenza (colonna «Colore»); se non lo scegli: Ragusa verde, Modica giallo, Coffa azzurro, Ispica viola, Rosolini arancio.\n3. Piantina: «Sposta tutta la prenotazione» nel menu del posto, oppure doppio clic sul posto. Poi tocchi il posto da cui farla partire e gli altri del gruppo si siedono accanto. In Impostazioni › Gesti e scorciatoie c'è il riquadro «Piantina del bus» per scegliere cosa fanno clic, doppio clic e ⌥ / ⌘ / Maiusc + clic sui posti.\n4. Posti in sospeso: riquadro sopra la piantina per mettere da parte le persone mentre sistemi gli altri (trascina lì il posto, oppure menu del posto › «Metti in sospeso»). Si rimettono trascinando il nome su un posto, oppure clic sul nome e poi sul posto. Se qualcuno resta lì, la linguetta del bus mostra un numero rosso e l'app avvisa prima di uscire dalla piantina, stampare o mandare i messaggi.\n5. Scritte sulla piantina: «X 2», «X 6» staccati. In ogni fila del gruppo ci sono i nomi di chi siede proprio lì (con tre posti vicini il terzo va sotto il secondo), con il nome intero quando ci sta. Nel riquadro «X N», in alto a destra, la fila pagata con il supplemento (es. «1ª fila»).\n6. Menu della riga (tasto destro): parte «Solo …» per la persona di quella riga e parte «Tutta la comitiva …». Con più righe selezionate le voci valgono per le persone selezionate, e per la comitiva intera solo se è tutta selezionata. Nuove voci: solo questa persona in lista d'attesa o «Non parte più», «Seleziona tutta la comitiva», «Elimina le righe selezionate».\n7. Spostamenti nella lista: chi viene spostato non entra più per sbaglio in un'altra comitiva a cui mancano dei nomi (resta una riga vuota per il nome che manca). Se si sposta, si stacca o si elimina il capogruppo, «Cognome x N» passa alla persona che viene dopo nella stessa lista: prima poteva passare a chi stava in un'altra lista e chi era sotto restava senza numero.\n8. Eliminare la riga di una persona della comitiva: il numero «x N» resta e il nome che manca resta da scrivere; chi sta sotto non entra nella comitiva.\n9. Stampa della lista: il riquadro delle partenze in alto ora è alto come tutta l'intestazione.\n10. Manuale «Aiuto» aggiornato: menu della riga, posti in sospeso, spostare tutta la prenotazione, stampa per l'accompagnatore, colori dei luoghi.\n\nVERSIONE 2.1.13 · 06/11/2026\nCORREZIONI DI SICUREZZA (da caricare al posto della 2.1.12)\n\n1. «Recupera da una copia»: si accettano solo copie con dati in ordine. Gite, clienti e movimenti con codici interni, date o tipi non validi vengono scartati e l'avviso dice quanti sono. Una copia preparata ad arte non può più inserire comandi nelle pagine dell'app. Si usa solo dal Master.\n2. Programmi PDF e cronologia: l'app legge, scrive e cancella file su Dropbox solo dentro /programmi e /cronologia, mai altrove.\n3. «Link programma» della gita: si accettano solo indirizzi internet (https://…). Un indirizzo scritto senza https:// (es. www.laterra.it/…) si completa da solo. Vale anche per il link mandato ai clienti e per i link di Google Maps dei luoghi di partenza.\n4. Pagina del posto per i clienti: il link del programma si apre solo se è un indirizzo internet e non si possono più aggiungere note inventate al link.\n5. Accesso: dopo 30 minuti senza usare l'app, e quando cambia il giorno, l'app ti fa uscire e si rientra con nome e password. «Ricordami su questo computer» non è più spuntato di serie.\n6. Password: l'impronta è più robusta (600.000 passaggi invece di 150.000) e si aggiorna da sola al primo accesso di ciascuno, senza cambiare la password.\n7. File CSV (cassa e diagnostica): un testo che comincia con = + - @ non diventa più una formula quando si apre il file in Excel.\n8. Gite chiuse o bloccate dal Master: solo il Master può eliminarle.\n9. Protezione del browser (Content-Security-Policy): la pagina può usare solo i propri file e comunicare solo con Dropbox, Meta (WhatsApp) e Google Fonts. Se blocca qualcosa, lo annota nella diagnostica.\n10. File di Danea: le date sono controllate anche nel file per l'importazione.\n11. Nuovo file avvio.js: va caricato su GitHub insieme agli altri.\n\nVERSIONE 2.1.12 · 06/11/2026\nLISTA PRENOTAZIONI: NUOVA COLONNA «NOTE 2» E SPAZI SISTEMATI\n\n1. Nuova colonna «note 2», accanto a «note»: appunti interni che restano solo nella lista dell'app e non vanno nella stampa.\n2. La colonna «note / mail» si chiama solo «note».\n3. Colonna «posto» più corta: c'è scritto solo bus e posto, es. «B1 7» (il nome intero del bus si legge passando sopra con il mouse).\n4. Colonne «quota» ed «€» più strette; colonna «N» a sinistra più stretta.\n5. Cognome, nome, data e partenza restano larghi come prima; lo spazio che resta si divide tra «note» e «note 2». Sugli schermi stretti la lista scorre di lato.\n6. Con il tema scuro la lista resta chiara e leggibile (prima quota, posto e pulsanti € diventavano scuri o sbiaditi).\n\n\nVERSIONE 2.1.11 · 05/11/2026\nCARTELLI SENZA I NUMERI DEI POSTI\n\n1. Nei cartelli da stampare, sul bordo resta solo la scritta «LATO AUTISTA» o «LATO HOSTESS»: niente più numeri dei posti.\n\n\nVERSIONE 2.1.10 · 05/11/2026\nLISTA DEGLI EVENTI: COLONNE PIÙ EQUILIBRATE (da caricare al posto della 2.1.8 e della 2.1.9)\n\n1. Nella lista degli eventi la colonna «note / mail» non si prende più tutto lo spazio libero: le colonne strette (data, part, emissione, posto, quota, €) hanno la loro misura e lo spazio che resta si divide in parti uguali tra cognome, nome, contatto, fila e note. Sugli schermi stretti la lista scorre di lato come prima.\n2. Una nota lunga si legge tutta passando sopra con il mouse.\n";
  const GIOVANNI = 'SE PROPRIO NON STAI TROVANDO SOLUZIONE AL PROBLEMA ALLORA È GIUNTA L\'ORA DI CHIAMARE GIOVANNI';
  const HUI = { q: '', open: '', giov: false };
  function helpArt(a) {
    return `<article class="hl-a"><div class="hl-ac">${esc((HELP_CAT.find(c => c[0] === a.c) || [, ''])[1])}</div><h3>${esc(a.t)}</h3><ol>${(a.s || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol>${a.n ? `<div class="hl-n">${ICON.alert}<span>${esc(a.n)}</span></div>` : ''}
      <div class="hl-back"><button class="btn sm ghost" data-act="hlback">‹ Torna alla ricerca</button><button class="btn sm" data-act="hlgiov">Non ho risolto</button></div></article>`;
  }
  const giovHTML = () => `<div class="hl-giov" role="alert"><div class="hl-gi">☎</div><b>${esc(GIOVANNI)}</b></div>`;
  function helpBody() {
    if (HUI.open === '__news') return `<article class="hl-a"><div class="hl-ac">Novità</div><h3>Novità delle ultime versioni</h3><pre class="hl-news">${esc(HELP_NEWS || 'Le novità sono nel file README dello zip.')}</pre><div class="hl-back"><button class="btn sm ghost" data-act="hlback">‹ Torna alla ricerca</button></div></article>`;
    const a = HUI.open && HELP.find(x => x.id === HUI.open); if (a) return helpArt(a) + (HUI.giov ? giovHTML() : '');
    const q = HUI.q.trim(); const R = q ? helpSearch(q) : [];
    if (q && !R.length) return `<div class="hl-none">Nel manuale non ho trovato niente per «${esc(q)}». Prova con altre parole (es. «incassare», «spostare posto», «biglietto sospeso»).</div>${giovHTML()}`;
    if (q) return `<div class="hl-res">${R.map(r => `<button class="hl-r" data-act="hlopen" data-id="${esc(r.a.id)}"><b>${esc(r.a.t)}</b><span>${esc((r.a.s || [])[0] || '')}</span></button>`).join('')}</div><div class="hl-more"><button class="btn sm" data-act="hlgiov">Non trovo la soluzione</button></div>${HUI.giov ? giovHTML() : ''}`;
    return `<button class="hl-r hl-newsb" data-act="hlopen" data-id="__news"><b>Novità delle ultime versioni</b><span>Cosa è cambiato con gli ultimi aggiornamenti (questa è la ${esc(VERSION)})</span></button>
      ${HELP_CAT.map(([k, l]) => { const L = HELP.filter(x => x.c === k); return L.length ? `<div class="hl-cat"><h4>${esc(l)}</h4>${L.map(x => `<button class="hl-l" data-act="hlopen" data-id="${esc(x.id)}">${esc(x.t)}</button>`).join('')}</div>` : ''; }).join('')}
      <div class="hl-more"><button class="btn sm" data-act="hlgiov">Non trovo la soluzione</button></div>${HUI.giov ? giovHTML() : ''}`;
  }
  function helpOpen() {
    HUI.open = ''; HUI.giov = false;
    openModal(`${ICON.search} Aiuto`, `<div class="hl"><input class="hl-q" id="hl-q" data-hlq="1" value="${esc(HUI.q)}" placeholder="Scrivi la tua domanda, es. «come incasso un biglietto sospeso?»" autocomplete="off" aria-label="Cerca nel manuale"><div class="hl-v">Manuale d'istruzioni dell'app · aggiornato alla versione ${esc(HELP_VER)}</div><div id="hl-b">${helpBody()}</div></div>`, `<button class="btn" data-act="close">Chiudi</button>`, true);
    UI.modal = { kind: 'help' }; setTimeout(() => { const i = $('#hl-q'); if (i) { i.focus(); i.select(); } }, 40);
    DIAG.ev('aiuto', 'Aperto il manuale');
  }
  const helpRefresh = () => { const b = $('#hl-b'); if (b) b.innerHTML = helpBody(); const m = $('#modal-root .modal-b'); if (m) m.scrollTop = 0; };
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act="help"],[data-act="hlopen"],[data-act="hlback"],[data-act="hlgiov"]'); if (!el) return; const a = el.dataset.act;
    if (a === 'help') { closePop(); helpOpen(); return; }
    if (a === 'hlopen') { HUI.open = el.dataset.id; HUI.giov = false; DIAG.ev('aiuto', 'Letto: ' + el.dataset.id, { cerca: HUI.q.slice(0, 80) }); }
    else if (a === 'hlback') { HUI.open = ''; HUI.giov = false; }
    else if (a === 'hlgiov') { HUI.giov = true; DIAG.ev('aiuto', 'Nessuna soluzione trovata', { cerca: HUI.q.slice(0, 80), articolo: HUI.open }); }
    helpRefresh(); if (a === 'hlgiov') setTimeout(() => { const g = $('.hl-giov'); if (g) g.scrollIntoView({ block: 'nearest' }); }, 20);
  });
  document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.hlq) { HUI.q = e.target.value; HUI.open = ''; HUI.giov = false; clearTimeout(helpRefresh.t); helpRefresh.t = setTimeout(helpRefresh, 120); } });
  document.addEventListener('keydown', e => { if (e.key === 'F1' && ACC.me()) { e.preventDefault(); closePop(); helpOpen(); } });

  // ---------- render ----------
  const FOCUS_KEYS = ['note', 'st', 'depsel', 'hq', 'aq', 'r', 'ar', 'nr', 'f', 'q', 'qs', 'qt', 'tf', 'dep2', 'dep', 'k', 'bind', 'cl', 'cfgag', 'cfgl', 'pf', 'pl', 'pff', 'pfm', 'usig', 'tks'];
  const ACT_PERM = { unew: 'users', unewm: 'tech', ureset: 'users', usave: 'users', resetall: 'tech', doresetall: 'tech', savekeys: 'tech', wipelocal: 'tech', lgf: 'tech', lexport: 'tech', diagexport: 'tech', lnew: 'settings', ldel: 'settings', savewa: 'settings', savetel: 'settings', savedanea: 'settings', savert: 'settings', savesuppl: 'settings', filaset: 'viaggi', export: 'settings', pay: 'cassa', paypanel: 'viaggi', paywho: 'viaggi', lmove: 'viaggi', lmove1: 'viaggi', detach: 'viaggi', reattach: 'viaggi', noteadd: 'viaggi', notedel: 'viaggi', tksadd: 'viaggi', tksdel: 'viaggi', tkfila: 'viaggi', tklink: 'cassa', tkunlink: 'cassa', suppadd: 'viaggi', suppdel: 'viaggi', pfsave: 'cassa', cashmov: 'cassa', cashsave: 'cassa', storno: 'cassa', cclose: 'cassa', ccsave: 'cassa', clnew: 'anag', cldel: 'anag', impgo: 'anag', newtrip: 'viaggi', deltrip: 'viaggi' };
  const VIEW_PERM = { home: 'viaggi', models: 'viaggi', trip: 'viaggi', anag: 'anag', conta: 'conta', super: 'tech' };
  let lastNav = '', lastSess = '', lastGateHTML = '';
  function render() {
    const t0 = performance.now();
    try { renderIn(); topFit(); document.body.classList.toggle('pm-open', !!$('.paymodal')); if (UI.view === 'home') alignBlocks(); if (UI.pay) setTimeout(cfRecalc, 0); presenceBeat(false); presenceCheck(); offAfterRender(); } catch (e) { DIAG.ev('errore', 'Errore nel disegnare la pagina: ' + e.message, { stack: e.stack, vista: UI.view, sezione: UI.sec }); throw e; }
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
      const gh = gateView(step);
      // la stessa schermata non si ridisegna: altrimenti l'animazione «Ciao …» ripartiva quando arrivava la sincronizzazione
      if (gh === lastGateHTML && $('#app .gate')) return;
      lastGateHTML = gh; $('#app').innerHTML = gh;
      const f = $('#app form input:not([type=checkbox])'); if (f && !hadFocus) setTimeout(() => f.focus(), 30);
      return;
    }
    document.body.classList.remove('gated'); lastGateHTML = '';
    if (VIEW_PERM[UI.view] && !ACC.can(VIEW_PERM[UI.view])) UI.view = ACC.can('viaggi') ? 'home' : 'conta';
    if (UI.view === 'cassa' && !(ACC.can('cassa') || ACC.can('cassaAll'))) UI.view = 'home';
    const ae = document.activeElement; let fsel = null, fpos = null;
    if (ae && ae.dataset && FOCUS_KEYS.some(k => ae.dataset[k] !== undefined && k !== 'f' && k !== 'k')) {
      fsel = FOCUS_KEYS.filter(k => ae.dataset[k] !== undefined).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${CSS.escape(ae.dataset[k])}"]`).join('');
      try { fpos = ae.selectionStart; } catch (e) { fpos = null; }
    }
    const keep = ['#bklist', '.mapwrap', '.wtw', '.ldock .mapwrap', '.pp-b'].map(s => { const el = $(s); return el ? [s, el.scrollTop, el.scrollLeft] : null; }).filter(Boolean);
    const y = window.scrollY;
    const V = { home: homeView, models: modelsView, trip: tripView, anag: anagView, cassa: cassaView, bigl: bglView, conta: () => casiBoxHTML(null) + contaView(), settings: settingsView, super: superView };
    const view = (V[UI.view] || homeView)();
    $('#app').innerHTML = topbar() + `<main class="wrap v-${esc(UI.view)}${UI.view === 'trip' && UI.sec !== 'posti' ? ' wide' : ''}">${view}</main>`;
    keep.forEach(([s, top, left]) => { const el = $(s); if (el) { el.scrollTop = top; el.scrollLeft = left; } });
    window.scrollTo(0, y);
    if (fsel) { const el = $(fsel); if (el) { el.focus({ preventScroll: true }); try { if (fpos != null) el.selectionStart = el.selectionEnd = fpos; } catch (e) { /* campo data */ } } }
  }
  // elenco dei viaggi: tutti i riquadri colorati finiscono allo stesso punto, subito dopo il nome più lungo
  function alignBlocks() {
    const box = $('.months'); if (!box) return; ['--nw', '--dw', '--gw', '--cw', '--hw', '--fw'].forEach(v => box.style.removeProperty(v));
    // ogni colonna è larga quanto la scritta più lunga (così la data non va mai sopra il giorno, anche con «24–26 Settembre»)
    const mx = (sel, f) => $$(sel).reduce((w, el) => Math.max(w, f ? f(el) : Math.max(el.scrollWidth, el.getBoundingClientRect().width)), 0);
    const dw = mx('.months .t2-d'), gw = mx('.months .t2-g'), cw = mx('.months .t2-c .tcode', el => el.getBoundingClientRect().width), nw = mx('.months .t2-n h3'), hw = mx('.months .t2-h .hh span', el => el.scrollWidth + 26);
    if (dw) box.style.setProperty('--dw', (dw + 4) + 'px'); if (gw) box.style.setProperty('--gw', (gw + 4) + 'px');
    box.style.setProperty('--cw', (cw ? cw + 2 : 0) + 'px'); if (nw) box.style.setProperty('--nw', Math.min(nw + 2, 300) + 'px');
    // colonna dei posti liberi larga quanto i contatori più lunghi (così non toccano mai le iconcine)
    const fw = $$('.months .t2-fc').reduce((w, el) => Math.max(w, [...el.children].reduce((a, c) => a + c.getBoundingClientRect().width + 4, 0)), 0); box.style.setProperty('--fw', Math.max(90, Math.ceil(fw)) + 'px');
    let H = hw ? Math.min(hw + 2, window.innerWidth <= 1600 ? 180 : 220) : 0, N = nw ? Math.min(nw + 2, 300) : 0;
    box.style.setProperty('--hw', H + 'px');
    // se lo schermo è stretto, si accorciano nome e hotel (con «…») invece di far sovrapporre le colonne
    const row = $('.months .trow.v2'); if (!row) return;
    for (let k = 0; k < 6; k++) {
      const over = row.scrollWidth - row.clientWidth; if (over <= 0) break;
      if (N > 150) { N = Math.max(150, N - over - 4); box.style.setProperty('--nw', N + 'px'); }
      else if (H > 100) { H = Math.max(100, H - over - 4); box.style.setProperty('--hw', H + 'px'); }
      else break;
    }
  }
  function commit() { save(); render(); }
  let toastT;
  function toast(msg) { DIAG.ev('avviso', msg); const el = $('#toast'); el.classList.remove('ok'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3600); }
  const ddmm = () => fmtDate(todayISO()).slice(0, 5);

  // ---------- menu delle righe ----------
  // 2.1.14: il menu ragiona su chi tocca davvero. Con più righe selezionate (e la riga cliccata tra queste) le voci valgono
  // per le persone selezionate; la comitiva intera solo se è tutta selezionata. Senza selezione ci sono due parti
  // separate: le voci per la sola persona della riga e quelle per tutta la comitiva.
  function rowMenu(id, el) {
    const t = trip(); const D = deriveBookings(t); const bk = D.find(x => x.persone.some(p => p.id === id)); const r = rowById(t, id); if (!r) return;
    const head = bk && bk.id === id; const P = bk && bk.persone.find(p => p.id === id); const bigl = tripCat(t) === 'biglietteria';
    const multi = multiBus(t); const lk = listKey(t, r); const pos = listRows(t, lk).indexOf(r) + 1;
    const sel = (UI.lsel || []).filter(x => { const rr = rowById(t, x); return rr && !isEmptyRow(rr); });
    const inSel = sel.includes(id) && sel.length > 1;
    const B = (act, ico, txt, extra = '', cls = '') => `<button class="${esc(cls)}" data-act="${esc(act)}" ${extra}>${ico}<span>${txt}</span></button>`;
    const comit = bk && bk.persone.length > 1;
    const others = multi ? tripLists(t).filter(L => L.id !== lk) : [];
    const chips = (lbl, act, extra) => others.length ? `<div class="pm-chips"><span>${lbl}</span>${others.map(L => `<button data-act="${esc(act)}" ${extra} data-to="${esc(L.id)}">${esc(L.b ? L.b.label : L.label)}</button>`).join('')}</div>` : '';
    const annDet = (act, extra, what) => bigl ? B(act, ICON.xcirc, `${what} <small>vuole vendere il biglietto</small>`, `${extra} data-k="vende"`) : `<details class="pm-det"><summary>${ICON.xcirc}<span>${what}: non parte più…</span></summary>${B(act, '', 'da rimborsare', `${extra} data-k="da"`)}${B(act, '', 'già rimborsato', `${extra} data-k="fatto"`)}${B(act, '', 'senza rimborso', `${extra} data-k="no"`)}</details>`;
    const who = P ? esc(P.nome || P.cognome) : '';
    let h = `<div class="ph"><b>${bk ? `${esc(bkName(bk))}${comit ? ' x ' + bk.persone.length : ''}` : 'Riga vuota'}</b><span>Riga ${pos}${multi ? ' · ' + esc(listName(t, lk)) : ''}${bk && (!head || comit) ? ` · ${esc(P.cognome)} ${esc(P.nome)}` : ''}</span></div>`;
    if (inSel) {
      // persone selezionate: quali comitive sono intere e quali no
      const set = new Set(sel); const full = D.filter(b => b.persone.every(p => set.has(p.id)));
      const one = full.length === 1 && full[0].persone.length === sel.length && full[0].persone.length > 1 ? full[0] : null;
      const what = one ? `Tutta la comitiva ${esc(bkName(one))} x ${one.persone.length}` : `Le ${sel.length} persone selezionate`;
      const anyGroup = sel.some(x => { const b = D.find(y => y.persone.some(p => p.id === x)); return b && b.persone.length > 1 && !full.includes(b); });
      h += `<div class="pm-sec sel"><div class="pm-t">${one ? `Comitiva ${esc(bkName(one))} x ${one.persone.length} · selezionata tutta` : `${sel.length} righe selezionate${full.length ? ` · ${full.length === 1 ? '1 comitiva intera' : full.length + ' comitive intere'}` : ''}`}</div>`;
      h += chips('Sposta in', 'lmove', '');
      if (!bigl && one) h += B('selbk', ICON.pin, 'Mostra sulla piantina', `data-id="${esc(one.id)}"`);
      if (anyGroup) h += B('detach', ICON.unlink, 'Stacca dalle loro comitive <small>le persone selezionate diventano prenotazioni a sé</small>', '');
      h += B('toattsel', ICON.clock, `${what} in lista d'attesa`, '');
      h += annDet('toannsel', '', what);
      h += B('lselclear', ICON.close, 'Togli la selezione');
      h += B('rowdelsel', ICON.trash, `Elimina le ${sel.length} righe selezionate`, '', 'danger');
      h += '</div>';
      return openPop(el, h, 'rmenu');
    }
    if (bk) {
      // la sola persona di questa riga
      h += `<div class="pm-sec"><div class="pm-t">${comit ? `Solo ${who}${head ? ' <small>(capogruppo)</small>' : ''}` : 'Prenotazione'}</div>`;
      if (ACC.can('cassa')) h += comit ? (head ? '' : B('pay', ICON.euro, `Incasso solo di ${who}`, `data-id="${esc(bk.id)}" data-pid="${esc(id)}"`)) : B('pay', ICON.euro, 'Incasso e documento', `data-id="${esc(bk.id)}"`);
      if (!bigl && !comit) h += B('selbk', ICON.pin, 'Mostra sulla piantina', `data-id="${esc(bk.id)}"`);
      h += chips(comit ? `Sposta solo ${who} in` : 'Sposta in', 'lmove1', `data-id="${esc(id)}" data-whole="0"`);
      if (comit && !head) h += B('detach', ICON.unlink, `Stacca ${who} dalla comitiva <small>diventa una prenotazione a sé</small>`, `data-id="${esc(id)}"`);
      if (comit && head) { const nx = nextInList(t, bk, r, [id]); h += B('detach', ICON.unlink, `Stacca il capogruppo <small>${esc(nx ? nx.cognome : '')} ${esc(nx ? nx.nome : '')} diventa capogruppo (x ${Math.max(bk.n, bk.persone.length) - 1})</small>`, `data-id="${esc(id)}"`); }
      if (r.stacc) h += B('reattach', ICON.link2, `Rimetti nella comitiva ${esc(r.stacc.da.replace(/ x \d+$/, ''))} <small>staccata il ${esc(fmtDate(r.stacc.il.slice(0, 10)).slice(0, 5))}${r.stacc.chi ? ' da ' + esc(r.stacc.chi) : ''}</small>`, `data-id="${esc(id)}"`);
      h += B(comit ? 'toatt1' : 'toatt', ICON.clock, comit ? `Solo ${who} in lista d'attesa <small>la comitiva diventa x ${Math.max(bk.n, bk.persone.length) - 1}</small>` : 'In lista d\'attesa', comit ? `data-id="${esc(id)}"` : `data-id="${esc(bk.id)}"`);
      h += comit ? annDet('toann1', `data-id="${esc(id)}"`, `Solo ${who}`) : annDet('toann', `data-id="${esc(bk.id)}"`, 'Questa prenotazione');
      h += B('rsel', ICON.sel, (UI.lsel || []).includes(id) ? 'Togli dalla selezione' : 'Seleziona questa riga', `data-id="${esc(id)}"`);
      h += '</div>';
      // tutta la comitiva
      if (comit) {
        h += `<div class="pm-sec"><div class="pm-t">Tutta la comitiva ${esc(bkName(bk))} x ${bk.persone.length}</div>`;
        if (ACC.can('cassa')) h += B('pay', ICON.euro, 'Incasso di tutta la comitiva', `data-id="${esc(bk.id)}"`);
        if (!bigl) h += B('selbk', ICON.pin, 'Mostra sulla piantina', `data-id="${esc(bk.id)}"`);
        h += B('rselbk', ICON.sel, 'Seleziona tutta la comitiva', `data-id="${esc(id)}"`);
        h += chips('Sposta tutta la comitiva in', 'lmove1', `data-id="${esc(id)}" data-whole="1"`);
        h += B('toatt', ICON.clock, 'Tutta la comitiva in lista d\'attesa', `data-id="${esc(bk.id)}"`);
        h += annDet('toann', `data-id="${esc(bk.id)}"`, 'Tutta la comitiva');
        h += '</div>';
      }
    }
    h += `<div class="pm-sec"><div class="pm-two">${B('rowins', ICON.up, 'Riga sopra', `data-id="${esc(id)}" data-d="0"`)}${B('rowins', ICON.down, 'Riga sotto', `data-id="${esc(id)}" data-d="1"`)}</div></div>`;
    if (bk && !bigl) h += `<div class="pm-sec">${B('abituale', ICON.star, `Cliente abituale <small>${comit ? 'tutta la comitiva · ' : ''}precedenza nelle prime file</small>`, `data-id="${esc(bk.id)}"`, 'tg' + (bk.head.abituale ? ' on' : ''))}${B('saldato', ICON.check, `Saldato <small>${comit ? 'tutta la comitiva · ' : ''}anche se il prezzo è diverso</small>`, `data-id="${esc(bk.id)}"`, 'tg' + (bk.head.saldato ? ' on' : ''))}</div>`;
    h += `<div class="pm-sec">${B('rowdel', ICON.trash, comit ? `Elimina la riga di ${who} <small>la comitiva resta x ${Math.max(bk.n, bk.persone.length)}: il nome mancante resta da scrivere</small>` : 'Elimina questa riga', `data-id="${esc(id)}"`, 'danger')}</div>`;
    openPop(el, h, 'rmenu');
  }
  // menu della colonna «fila»: le file a pagamento con prezzo e posti liberi (le file finite non compaiono),
  // lato sinistro o destro; in fondo, a scomparsa, le richieste senza supplemento
  function filaMenu(id, el) {
    const t = trip(); const r = rowById(t, id); if (!r) return; const FI = filaInfo(t); const cur = String(r.fila || '').trim().toLowerCase();
    const D = deriveBookings(t); const bk = D.find(b => b.persone.some(p => p.id === id)); const P = bk && bk.persone.find(p => p.id === id);
    const tour = tripCat(t) === 'tour'; const pr = v => v ? `+${fmtNum(v)} €${tour ? ` <small>(${fmtNum(v / FI.days)} € × ${FI.days} giorni)</small>` : ''}` : '<small>senza prezzo</small>';
    const B = (v, l, n) => `<button class="fm-b${esc(cur === v.toLowerCase() ? ' on' : '')}" data-act="filaset" data-id="${esc(id)}" data-v="${esc(v)}">${l}${n != null ? `<i>${n}</i>` : ''}</button>`;
    const rows = FI.rows.map(x => { const mine = cur.startsWith(x.k + ' fila'); if (!x.free && !mine) return '';
      return `<div class="fm-r"><div class="fm-l"><b>${x.label}</b><span>${pr(x.price)}</span></div><div class="fm-o">${B(`${x.k} fila`, 'Qualsiasi', x.free)}${x.freeSx || cur === `${x.k} fila sx` ? B(`${x.k} fila sx`, 'Sx', x.freeSx) : ''}${x.freeDx || cur === `${x.k} fila dx` ? B(`${x.k} fila dx`, 'Dx', x.freeDx) : ''}</div></div>`; }).join('');
    const pmine = /porta/.test(cur);
    const porta = FI.porta.free || pmine ? `<div class="fm-r"><div class="fm-l"><b>${FI.porta.label}</b><span>${pr(FI.porta.price)}</span></div><div class="fm-o">${B('2° porta', 'Scegli', FI.porta.free)}</div></div>` : '';
    const full = FI.rows.filter(x => !x.free).map(x => x.label).concat(FI.porta.free ? [] : [FI.porta.label]);
    const free = [['Lato sx', 'Lato sinistro'], ['Lato dx', 'Lato destro'], ['Terzultima fila', 'Terzultima fila'], ['Penultima fila', 'Penultima fila'], ['Ultima fila', 'Ultima fila'], ['No ultima fila', 'Non in ultima fila']];
    const freeOn = free.some(([v]) => v.toLowerCase() === cur);
    openPop(el, `<div class="ph"><b>Fila${P ? ` di ${esc(P.cognome)} ${esc(P.nome)}` : ''}</b><span>Supplemento a persona · in verde i posti ancora liberi</span></div>
      <div class="fm">${rows}${porta}${full.length ? `<div class="fm-full">Esaurite: ${full.map(esc).join(', ')}</div>` : ''}
        <details class="fm-more"${freeOn ? ' open' : ''}><summary>Richieste senza supplemento</summary><div class="fm-free">${free.map(([v, l]) => B(v, l)).join('')}</div></details>
        ${cur ? `<button class="fm-none" data-act="filaset" data-id="${esc(id)}" data-v="">${ICON.close} Togli la fila</button>` : ''}</div>`, 'fmenu');
  }
  function attMenu(id, el) {
    openPop(el, `<div class="ph"><b>Lista d'attesa</b><span>Quando si libera il posto</span></div>
      <button data-act="attconf" data-id="${esc(id)}">Conferma: passa nella lista partecipanti</button>
      <button class="danger" data-act="attdel" data-id="${esc(id)}">Elimina questa riga</button>`);
  }
  function annMenu(id, el) {
    const r = trip().annullati.find(x => x.id === id); if (!r) return;
    if (r.stato === 'vende') return openPop(el, `<div class="ph"><b>${esc(r.cognome || 'Riga')}</b><span>vuole vendere il biglietto</span></div>
      <button data-act="annrest" data-id="${esc(id)}">Ci ripensa: rimetti tra i biglietti venduti</button>
      <button class="danger" data-act="anndel" data-id="${esc(id)}">Biglietto rivenduto: togli la riga</button>`);
    openPop(el, `<div class="ph"><b>${esc(r.cognome || 'Riga')}</b><span>non parte più</span></div>
      ${r.stato !== 'da' ? `<button data-act="annmove" data-id="${esc(id)}" data-k="da">Sposta in «da rimborsare»</button>` : ''}
      ${r.stato !== 'fatto' ? `<button data-act="annmove" data-id="${esc(id)}" data-k="fatto">Sposta in «già rimborsati»</button>` : ''}
      ${r.stato !== 'no' ? `<button data-act="annmove" data-id="${esc(id)}" data-k="no">Sposta in «senza rimborso»</button>` : ''}
      <button data-act="annrest" data-id="${esc(id)}">Riparte: rimetti nella lista partecipanti</button>
      <button class="danger" data-act="anndel" data-id="${esc(id)}">Elimina questa riga</button>`);
  }
  // menu del posto: stesso stile del menu della riga, diviso in Posto, Prenotazione e Togli
  function seatMenu(s, el) {
    const t = trip(), b = bus(); const a = b.seats[s]; const bk = bkById(b, a.b); const p = bk.persone.find(x => x.id === a.pid);
    const n = bk.full ? bk.full.persone.length : bk.persone.length; const ss = seatsOf(b, bk.id);
    const B = (act, ico, txt, extra = '', cls = '') => `<button class="${esc(cls)}" data-act="${esc(act)}" ${extra}>${ico}<span>${txt}</span></button>`;
    let h = `<div class="ph"><b>${esc(p.cognome)} ${esc(p.nome)}</b><span>Posto ${s}${multiBus(t) ? ' · ' + esc(b.label) : ''}${p.tel ? ' · ' + esc(p.tel) : ''}</span></div>`;
    h += `<div class="pm-sec"><div class="pm-t">Posto ${s}</div>${B('mv', ICON.move, 'Sposta o scambia <small>poi tocca il posto dove metterlo</small>', `data-s="${esc(s)}"`)}
      <div class="pm-note"><label for="np-in">Nota sul posto</label><div class="npin"><input id="np-in" placeholder="es. no lattosio" value="${esc(p.np || '')}" data-s="${esc(s)}" maxlength="40"><button class="btn sm" data-act="savenp" data-s="${esc(s)}">Salva</button></div></div></div>`;
    h += `<div class="pm-sec"><div class="pm-t">Prenotazione ${esc(bkName(bk))}${n > 1 ? ' x ' + n : ''}</div>${n > 1 ? B('mvbk', ICON.move, `Sposta tutta la prenotazione <small>poi tocca il posto da cui farla partire${gKeyFor('mvbk')}</small>`, `data-id="${esc(bk.id)}"`) : ''}${B('selbk', ICON.sel, `Seleziona tutta la prenotazione <small>${ss.length ? (ss.length > 1 ? 'posti ' : 'posto ') + esc(fmtSeats(ss)) : 'nessun posto'}</small>`, `data-id="${esc(bk.id)}"`)}${ACC.can('cassa') ? B('pay', ICON.euro, n > 1 ? 'Incasso di tutta la comitiva' : 'Incasso e documento', `data-id="${esc(bk.id)}"`) : ''}</div>`;
    h += `<div class="pm-sec"><div class="pm-t">Togli</div>${B('sosp', ICON.clock, 'Metti in sospeso <small>libera il posto e la tiene da parte sopra la piantina</small>', `data-s="${esc(s)}"`)}${B('freeseat', ICON.erase, 'Togli dal posto <small>resta su questo bus, senza posto</small>', `data-s="${esc(s)}"`)}${B('unbus', ICON.out, 'Togli dal bus <small>resta nella lista, senza bus</small>', `data-s="${esc(s)}"`)}${B('freebk', ICON.trash, n > 1 ? `Togli dal bus tutta la comitiva <small>${n} persone</small>` : 'Togli dal bus la prenotazione', `data-id="${esc(bk.id)}"`, 'danger')}</div>`;
    openPop(el, h, 'rmenu');
  }
  const insertAt = t => { let i = t.rows.length; while (i > 0 && isEmptyRow(t.rows[i - 1])) i--; return i; };
  function moveBookingOut(t, bkId) {
    const D = deriveBookings(t); const bk = D.find(x => x.id === bkId); if (!bk) return null;
    const ids = new Set(bk.persone.map(p => p.id)); bk.persone.forEach(p => { unseatRow(t, p.row); delete p.row.bus; });
    const rows = t.rows.filter(r => ids.has(r.id)); t.rows = t.rows.filter(r => !ids.has(r.id));
    return { bk, rows };
  }

  // 2.1.14: togliere dalla lista una o più persone. Le comitive tutte comprese escono intere («Cognome x N»);
  // le altre persone escono da sole e la loro comitiva scende di uno (come staccarle e poi toglierle).
  function takeOut(t, ids) {
    const before = groupMap(t); const set = new Set(ids); const out = []; const me = (ACC.me() || {}).name || '';
    deriveBookings(t).forEach(bk => { if (!bk.persone.every(p => set.has(p.id))) return; const m = moveBookingOut(t, bk.id); if (m) { out.push({ whole: true, rows: m.rows, bk: m.bk }); bk.persone.forEach(p => set.delete(p.id)); } });
    [...set].forEach(id => {
      const r = rowById(t, id); if (!r || isEmptyRow(r)) return;
      const bk = deriveBookings(t).find(b => b.persone.some(p => p.id === id));
      if (bk && bk.persone.length > 1) detachRow(t, id, me);
      const m = moveBookingOut(t, id); if (m) out.push({ whole: false, rows: m.rows, bk: m.bk, from: bk && bk.persone.length > 1 ? bkName(bk) : '' });
    });
    keepGroups(t, before);
    return out;
  }
  // eliminare righe: il numero «x N» della comitiva resta (il nome che manca resta da scrivere) e passa a chi rimane
  // se si elimina il capogruppo; chi sta sotto non entra nella comitiva al posto di chi è stato tolto
  function deleteRows(t, ids) {
    const before = groupMap(t); headsStay(t, ids);
    ids.forEach(id => { const r = rowById(t, id); if (r) { unseatRow(t, r); t.rows = t.rows.filter(x => x !== r); } });
    keepGroups(t, before);
  }
  function toWaiting(t, ids) {
    const out = takeOut(t, ids); if (!out.length) return toast('Niente da spostare');
    let ai = t.attesa.length; while (ai > 0 && isEmptyRow(t.attesa[ai - 1])) ai--;
    const add = out.map(o => { const h = o.rows[0]; const base = String(h.cognome || '').replace(RX, '$1').trim(); return { ...blankAtt(), cognome: o.whole ? (RX.test(String(h.cognome || '').trim()) ? h.cognome : `${base} x ${o.rows.length}`) : base, nome: h.nome, nascita: h.nascita, tel: h.tel, part: h.part, note: h.note, richiesta: ddmm() }; });
    t.attesa.splice(ai, 0, ...add); UI.lsel = []; closePop(); commit();
    toast(out.length === 1 ? `${out[0].whole ? `${bkName(out[0].bk)}${out[0].rows.length > 1 ? ' x ' + out[0].rows.length : ''}` : `${String(out[0].rows[0].cognome).replace(RX, '$1').trim()} ${out[0].rows[0].nome}`} in lista d'attesa${out[0].from ? ` · la comitiva ${out[0].from} ha una persona in meno` : ''}` : `${out.reduce((a, o) => a + o.rows.length, 0)} persone in lista d'attesa`);
  }
  function toCancelled(t, ids, k) {
    const out = takeOut(t, ids); if (!out.length) return toast('Niente da spostare');
    out.forEach(o => o.rows.forEach(r => t.annullati.push({ ...r, stato: k, dataAnn: ddmm() })));
    UI.lsel = []; closePop(); commit();
    const n = out.reduce((a, o) => a + o.rows.length, 0);
    toast(`${n === 1 ? `${String(out[0].rows[0].cognome).replace(RX, '$1').trim()} ${out[0].rows[0].nome}` : n + ' persone'}: ${k === 'vende' ? 'vuole vendere il biglietto' : 'non parte più'}`);
  }
  function doDetach(t, ids) {
    const done = []; const me = (ACC.me() || {}).name || '';
    ids.forEach(id => { const r = rowById(t, id); if (!r) return; const pid = (deriveBookings(t).find(b => b.persone.some(p => p.id === id)) || {}).id; const paid = pid ? pidPaid(t.id, pid, id) : 0; const x = detachRow(t, id, me); if (x) done.push({ r, from: x.from, paid, capo: x.capo, nuovo: x.nuovo }); });
    if (!done.length) return toast('Si può staccare solo una persona che è dentro una comitiva');
    UI.lsel = []; commit();
    DIAG.ev('azione', `Staccate dalla comitiva: ${done.map(x => `${x.r.cognome} ${x.r.nome} (da ${x.from})`).join(', ')}`);
    toast(`${done.length === 1 ? `${done[0].r.cognome} ${done[0].r.nome} ora è una prenotazione a sé (staccata da ${done[0].from})${done[0].capo ? ` · il nuovo capogruppo è ${done[0].nuovo}: incassi e posti restano alla comitiva` : ''}` : `${done.length} persone staccate dalle loro comitive`}${done.some(x => x.paid) ? ' · attenzione: aveva già pagato la sua quota nella comitiva, controlla gli incassi' : ''}`);
  }
  // valore del cognome quando si entra nel campo (per capire se «x 3» è diventato «x 5»)
  const OLDC = {};
  document.addEventListener('focusin', e => { const el = e.target; if (el && el.dataset && el.dataset.r && el.dataset.f === 'cognome' && !(el.dataset.r in OLDC)) OLDC[el.dataset.r] = el.value; });
  // avviso quando una lista supera i posti del bus
  // tipi di biglietto del viaggio: dalla prima modifica si salvano in quota.tsett (prima c'erano solo tkt1 e tkt2)
  function tksArr(t) { const Q = t.quota; if (Array.isArray(Q.tsett)) return Q.tsett; const L = tripTkt(t).sett; Q.tsett = L.length ? L.map(x => ({ id: uid(), nome: x.nome, intero: x.intero, ridotto: x.ridotto })) : [{ id: uid(), nome: '', intero: null, ridotto: null }]; return Q.tsett; }
  function capCheck(t, lk, why) {
    if (!t || tripCat(t) === 'biglietteria' || !t.buses.length) return;
    const B = multiBus(t) ? t.buses.filter(b => b.id === lk) : t.buses; if (!B.length) return;
    const cap = B.reduce((a, b) => a + LMAP[b.layout].info.cap - Object.values(b.seats || {}).filter(x => x.res).length, 0);
    const n = listLoad(t, multiBus(t) ? lk : '');
    if (n <= cap) return;
    DIAG.ev('avviso', `Capienza superata: ${n} persone su ${cap} posti (${why})`);
    openModal('Posti finiti', `<div class="capal">${ICON.alert}<div><b>Con ${esc(why)} ${multiBus(t) ? 'la ' + esc(listName(t, lk)) : 'la lista'} arriva a ${n} persone, ma ${B.length > 1 ? 'i bus hanno' : 'il bus ha'} ${cap} posti.</b><p>${n - cap === 1 ? 'C\'è 1 persona' : `Ci sono ${n - cap} persone`} in più. Puoi aggiungere un bus da «Posti sul bus» (pulsante «+»), spostare qualcuno ${multiBus(t) ? 'nella lista di un altro bus ' : ''}oppure mettere in lista d'attesa.</p></div></div>`, `<button class="btn primary" data-act="close">Ho capito</button>`);
  }
  // sposta righe in un'altra lista (bus) e lo dice
  function doListMove(t, ids, to) {
    if (!t || !multiBus(t)) return toast('Aggiungi un secondo bus per avere una lista per ogni bus');
    const D = deriveBookings(t); const rows = ids.map(id => rowById(t, id)).filter(r => r && !isEmptyRow(r) && listKey(t, r) !== (to || ''));
    if (!rows.length) return toast('Sono già in quella lista');
    const split = D.filter(bk => bk.persone.length > 1 && bk.persone.some(p => rows.includes(p.row)) && !bk.persone.every(p => rows.includes(p.row) || listKey(t, p.row) === (to || '')));
    const n = moveRowsToList(t, rows.map(r => r.id), to || ''); commit();
    // nomi delle comitive dopo lo spostamento (se si è spostato solo il capogruppo, il nome è quello del nuovo capogruppo)
    const D2 = split.length ? deriveBookings(t) : []; const splitN = [...new Set(rows.map(r => D2.find(b => b.persone.some(p => p.id === r.id))).filter(b => b && b.persone.length > 1).map(bkName))];
    toast(`${n === 1 ? `${String(rows[0].cognome).replace(RX, '$1')} ${rows[0].nome}`.trim() : n + ' persone'} ${n === 1 ? 'è' : 'sono'} in ${listName(t, to || '')}${(to || '') ? ': il posto si sceglie sulla piantina' : ''}${split.length && splitN.length ? ` · ${splitN.join(', ')}: la comitiva resta unita anche su due liste` : ''}`);
    DIAG.ev('azione', `Spostate ${n} righe in ${listName(t, to || '')}`);
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
      <div class="preview-list">${P.bookings.map(g => `<div><b>${esc(g.persone[0].cognome)} x ${g.n}</b> ${g.persone[0].part ? `<span class="code">${esc(g.persone[0].part)}</span>` : ''} — ${esc(g.persone.map(p => `${p.cognome} ${p.nome}`).join(', '))}${(() => { const rs = reqSummary(g); return rs.text ? ` <span class="pill ${esc(rs.paid ? 'warn' : 'tbd')}">${esc(rs.text)}</span>` : ''; })()}</div>`).join('')}</div>`;
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
    if ((res.note || []).length) { const cur = replace ? [] : notesOf(t).slice(); (res.note || []).forEach(n => { if (n && !cur.includes(n)) cur.push(n); }); t.notes = cur; delete t.note1; delete t.note2; }
    const at = insertAt(t); t.rows.splice(at, 0, ...res.part.raw.map(pickRow));
    let ai = t.attesa.length; while (ai > 0 && isEmptyRow(t.attesa[ai - 1])) ai--;
    t.attesa.splice(ai, 0, ...(res.attesa || []).map(r => ({ ...blankAtt(), ...r })));
    (res.annullati || []).forEach(r => t.annullati.push({ ...pickRow(r), dataAnn: r.dataAnn || '', stato: r.stato }));
    if (res.part.guida) { t.guida = true; t.buses.forEach(b => { b.guida = true; }); }
    if ((res.part.staff || []).length && (replace || !(t.staff || []).length)) t.staff = res.part.staff;
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
    if (a && a.res && UI.move == null) return openPop(el, `<div class="ph"><b>Posto ${s}</b><span>${esc(a.res)}</span></div><button data-act="unreserve" data-s="${esc(s)}">Togli la riserva</button>`);
    if (UI.move != null) { const from = UI.move; UI.move = null; moveSeat(b, from, s); toast(a ? `Scambiati i posti ${from} e ${s}` : `Spostato dal ${from} al ${s}`); return commit(); }
    if (UI.sel) { const whole = UI.moveBk && UI.moveBk === UI.sel; if (a && a.b === UI.sel && !whole) return seatMenu(s, el); const id = UI.sel; const r = dropFamily(t, id, b, s); if (r.ok) { UI.sel = null; UI.moveBk = null; } afterFamily(r, t, b, id); return commit(); }
    if (UI.selP) { const r = dropPerson(t, UI.selP, b, s); if (!r.ok) return toast(r.msg); UI.selP = null; toast(r.swap ? 'Posti scambiati' : `Messo al posto ${s}`); return commit(); }
    if (a) seatMenu(s, el);
    else openPop(el, `<div class="ph"><b>Posto ${s} libero</b><span>Trascina qui una prenotazione o una persona dalla lista</span></div><button data-act="reserve" data-s="${esc(s)}">Riserva per guida / 2° autista</button>`);
  }
  // 2.1.14 · posti in sospeso: persone tolte dal posto e tenute da parte accanto alla piantina mentre si sistemano gli altri.
  // Si rimettono trascinandole su un posto (oppure clic sul nome e poi sul posto). Se qualcuno resta lì, l'app avvisa.
  function sospPark(t, b, pid) { const r = rowById(t, pid); if (!r || isEmptyRow(r)) return false; if (multiBus(t) && r.bus !== b.id) pinGroup(t, [pid]); unseatRow(t, r); r.bus = b.id; b.sosp = (b.sosp || []).filter(x => x !== pid).concat([pid]); return true; }
  function sospAll(t) { if (!t || !t.buses) return []; syncAll(t); const out = []; t.buses.forEach(b => (b.sosp || []).forEach(pid => { const r = rowById(t, pid); if (r) out.push({ b, r, name: `${String(r.cognome || '').replace(RX, '$1').trim()} ${r.nome || ''}`.trim() + (multiBus(t) ? ` (${b.label})` : '') }); })); return out; }
  // prima di uscire dalla piantina, stampare o mandare i messaggi: se c'è qualcuno in sospeso si chiede conferma
  function sospGuard(t, fn) {
    const L = sospAll(t); if (!L.length) return fn();
    confirmBox('Posti in sospeso', `${L.length === 1 ? 'C\'è ancora una persona' : `Ci sono ancora ${L.length} persone`} nei posti in sospeso: <b>${L.map(x => esc(x.name)).join(', ')}</b>.<br>Rimettile su un posto, altrimenti restano senza posto.`, 'Continua lo stesso', fn);
  }
  // 2.1.14: spostare tutta la prenotazione dalla piantina (voce del menu del posto o gesto in Impostazioni › Gesti)
  function startMoveBk(bk) { closePop(); UI.move = null; UI.selP = null; UI.sel = bk.id; UI.moveBk = bk.id; render(); toast(`${bkName(bk)}: tocca il posto da cui farla partire, gli altri si siedono accanto`); }
  // gesto della piantina scritto nel menu (es. « · oppure doppio clic»)
  function gKeyFor(act) { const g = gest().seat; const k = G_SEAT.find(([x]) => g[x] === act && x !== 'click'); return k ? ` · oppure ${k[1].replace(/ su un posto occupato$/, '').toLowerCase()}` : ''; }
  let seatT = null;
  function onSeatClick(e, s, el) {
    const b = bus(); const a = b && b.seats[s];
    if (!a || a.res || UI.move != null || UI.sel || UI.selP) return onSeat(s, el);
    const g = gest().seat; const k = e.metaKey || e.ctrlKey ? 'meta' : e.shiftKey ? 'shift' : e.altKey ? 'alt' : 'click';
    if (k !== 'click') { clearTimeout(seatT); seatT = null; return seatAct(g[k], s, el); }
    if (e.detail >= 2 && g.dbl !== 'none') { clearTimeout(seatT); seatT = null; closePop(); return seatAct(g.dbl, s, el); }
    if (g.dbl === 'none' || e.detail === 0) return seatAct(g.click, s, el);
    clearTimeout(seatT); seatT = setTimeout(() => { seatT = null; seatAct(g.click, s, el); }, 240);
  }
  function seatAct(act, s, el) {
    const b = bus(); const a = b && b.seats[s]; if (!a || a.res || !act || act === 'none') return;
    const bk = bkById(b, a.b); if (!bk) return;
    if (act === 'menu') return onSeat(s, el);
    if (act === 'mvbk') return startMoveBk(bk);
    if (act === 'mv') { closePop(); UI.sel = UI.selP = null; UI.move = s; render(); return; }
    if (act === 'selbk') { closePop(); UI.move = null; UI.selP = null; UI.sel = UI.sel === bk.id ? null : bk.id; render(); return; }
    if (act === 'pay') { closePop(); if (!ACC.can('cassa')) return toast('Il tuo account non può incassare'); return payOpen(bk.id, ''); }
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
  // ---- controlli sulla copia da recuperare (sicurezza) ----
  // Una copia preparata ad arte non deve poter inserire codice nella pagina né far scrivere o cancellare
  // file fuori posto su Dropbox: si accettano solo codici interni fatti di lettere, numeri, «_» e «-»,
  // date aaaa-mm-gg, tipi di viaggio conosciuti e programmi salvati in /programmi/. Il resto si scarta.
  const ID_RE = /^[A-Za-z0-9_-]{1,64}$/, DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const ID_KEYS = new Set(['id', 'g', 'bus', 'hid', 'pid', 'cid', 'bkId', 'tripId', 'tid', 'rid']);
  const okId = v => typeof v === 'string' && ID_RE.test(v) && !BAD_KEYS.has(v);
  const okDay = v => v == null || v === '' || (typeof v === 'string' && DAY_RE.test(v));
  function safeData(x, depth = 0) {
    if (depth > 30) return false;
    if (Array.isArray(x)) return x.every(v => safeData(v, depth + 1));
    if (!x || typeof x !== 'object') return true;
    return Object.keys(x).every(k => {
      if (BAD_KEYS.has(k)) return false;
      const v = x[k];
      if (ID_KEYS.has(k) && !(v == null || v === '' || typeof v === 'number' || okId(v))) return false;
      return safeData(v, depth + 1);
    });
  }
  const okProgPath = p => typeof p === 'string' && /^\/programmi\/[a-z0-9_-]{1,64}\/[^/]{1,120}$/.test(p) && !/\/\.{1,2}$/.test(p);
  function safeTrip(t) {
    if (!t || typeof t !== 'object' || Array.isArray(t) || !okId(t.id)) return false;
    if (t.cat != null && t.cat !== '' && !Object.prototype.hasOwnProperty.call(CAT_L, t.cat)) return false;
    if (!okDay(t.data) || !okDay(t.fine)) return false;
    if (t.seedId != null && typeof t.seedId !== 'string') return false;
    return safeData(t);
  }
  // recupera una copia: anche quella della versione di prova «OnBoard» (un file con tutti i viaggi)
  function importBackup(o) {
    if (!o || !Array.isArray(o.trips)) throw new Error('copia');
    let add = 0, into = 0, skip = 0, bad = 0;
    o.trips.forEach(src => {
      if (!src || !src.id || src.deleted) return;
      if (src.demo) { skip++; return; }
      if (!safeTrip(src)) { bad++; return; }
      const t = tripInit(JSON.parse(JSON.stringify(src))); delete t.u; delete t.gone; LISTS.forEach(k => t[k].forEach(x => { delete x.u; }));
      if (t.pdf && !(t.pdf && typeof t.pdf === 'object' && okProgPath(t.pdf.path))) delete t.pdf;
      if (t.programma && !safeUrl(t.programma)) t.programma = '';
      const target = src.seedId ? S.trips.find(x => x.seedId === src.seedId || x.id === seedTripId(src.seedId)) : S.trips.find(x => x.id === src.id);
      if (target) {
        const empty = !target.rows.some(r => !isEmptyRow(r)) && !target.buses.length;
        if (!empty) { skip++; return; }
        const keep = { id: target.id, seedId: target.seedId }; Object.keys(target).forEach(k => delete target[k]); Object.assign(target, t, keep); tripInit(target); into++;
      } else { S.trips.push(t); add++; }
    });
    if (o.clients && o.clients.clienti && typeof o.clients.clienti === 'object') Object.entries(o.clients.clienti).forEach(([id, c]) => { if (!okId(id) || !c || typeof c !== 'object' || Array.isArray(c) || !safeData(c)) { bad++; return; } if (!Object.prototype.hasOwnProperty.call(S.clients.clienti, id)) S.clients.clienti[id] = c; });
    if (Array.isArray(o.movs) && o.movs.length) { const have = new Set(allMovs().map(m => m.id)); const nw = o.movs.filter(m => { if (!(okMov(m) && okId(m.id) && DAY_RE.test(m.day) && safeData(m))) { if (m) bad++; return false; } return !have.has(m.id); }); if (nw.length) { const p = `/cassa/movimenti/importati/${todayISO()}_${STORE.device.id}.json`; const cur = STORE.get(p) || { movs: [] }; cur.movs = cur.movs.concat(nw); STORE.put(p, cur); } }
    S.trips.forEach(t => t.rows.forEach(r => upsertFromRow(r)));
    flush(); ACC.tlog(bad ? 'avviso' : 'info', `Recuperata una copia: ${add} viaggi nuovi, ${into} liste dentro i viaggi dell'elenco, ${skip} saltati${bad ? `, ${bad} elementi scartati perché non validi` : ''}`);
    return { add, into, skip, bad };
  }

  document.addEventListener('click', e => {
    const seatEl = e.target.closest('#mapwrap .seat[data-seat]');
    const el = e.target.closest('[data-act]');
    if (!e.target.closest('#pop') && !(el && ['rowmenu', 'attmenu', 'annmenu', 'memenu', 'filapick'].includes(el.dataset.act))) closePop();
    if (!e.target.closest('.acbox') && !e.target.closest('input.wc')) acClose();
    if (seatEl && !el) return onSeatClick(e, +seatEl.dataset.seat, seatEl);
    if (!el) return;
    const act = el.dataset.act; const t = trip(); const b = bus();
    if (ACT_PERM[act] && !ACC.can(ACT_PERM[act])) { closeModal(); toast('Questa funzione non è disponibile per il tuo account'); render(); return; }
    switch (act) {
      case 'nav': { const go = () => { UI.pay = null; UI.lsel = []; UI.view = el.dataset.v; if (el.dataset.ssec) UI.ssec = el.dataset.ssec; UI.sel = UI.selP = null; UI.move = null; closePop(); render(); window.scrollTo(0, 0); }; if (UI.view === 'trip' && t) sospGuard(t, go); else go(); break; }
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
      case 'savedanea': daneaSave(); break;
      case 'savert': rtSave(); break;
      case 'savesuppl': { const C = supplCfg(); $$('[data-spc]').forEach(i => { const v = parseEuro(i.value); C[i.dataset.spc][i.dataset.k] = v == null ? 0 : v; }); S.cfg.suppl = C; save(); ACC.tlog('info', 'Supplementi file aggiornati'); toast('Supplementi file salvati'); render(); break; }
      case 'filapick': e.stopPropagation(); filaMenu(el.dataset.id, el); break;
      case 'filaset': { const r = rowById(t, el.dataset.id); if (!r) break; r.fila = el.dataset.v; closePop(); commit(); break; }
      case 'daneascon': { if (!(ACC.can('cassa') || ACC.can('conta'))) break; const g = giornoData(); daneaScontrini(g.movs, `Scontrini ${g.day}${g.ag !== 'tutte' ? ' ' + agName(g.ag) : ''}`); break; }
      case 'danea1': { if (!(ACC.can('cassa') || ACC.can('conta'))) break; const m = allMovs().find(x => x.id === el.dataset.id); if (m) daneaDownload([m], `Fattura ${m.cliente} ${m.day}`); break; }
      case 'daneaday': { if (!(ACC.can('cassa') || ACC.can('conta'))) break; const g = giornoData(); const st = new Set(g.movs.filter(x => x.storno).map(x => x.storno)); daneaDownload(g.movs.filter(x => x.doc === 'fattura' && x.tipo !== 'storno' && !st.has(x.id)), `Fatture ${g.day}${g.ag !== 'tutte' ? ' ' + agName(g.ag) : ''}`); break; }
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
      case 'pay': case 'paypanel': closePop(); if (UI.pay && UI.pay.bkId === el.dataset.id && (UI.pay.pid || '') === (el.dataset.pid || '') && el.dataset.act === 'paypanel') payClose(); else payOpen(el.dataset.id, el.dataset.pid || ''); break;
      case 'paywho': payOpen(el.dataset.id, el.dataset.pid || ''); break;
      // liste dei bus: selezione e spostamenti
      case 'detach': { closePop(); const ids = el.dataset.id ? [el.dataset.id] : (UI.lsel || []).slice(); doDetach(t, ids); break; }
      case 'reattach': { closePop(); const was = reattachRow(t, el.dataset.id); if (was) { commit(); toast(`Rimessa nella comitiva ${was.replace(/ x \d+$/, '')}`); } else toast('La comitiva da cui era stata staccata non c\'è più'); break; }
      case 'lview': UI.lview = el.dataset.v; render(); break;
      case 'lselclear': closePop(); UI.lsel = []; UI.lanchor = null; render(); break;
      case 'rsel': closePop(); gAct('sel', el.dataset.id); break;
      case 'lmove': { closePop(); const ids = (UI.lsel || []).slice(); doListMove(t, ids, el.dataset.to); UI.lsel = []; break; }
      case 'lmove1': { closePop(); const D = deriveBookings(t); const bk = D.find(x => x.persone.some(p => p.id === el.dataset.id)); const ids = el.dataset.whole === '1' && bk ? bk.persone.map(p => p.id) : [el.dataset.id]; doListMove(t, ids, el.dataset.to); break; }
      case 'pfclose': payClose(); break;
      case 'pfdoc': if (UI.pay) { UI.pay.f.doc = el.dataset.k; render(); } break;
      case 'pfmet': if (UI.pay) { const f = UI.pay.f; f.met = el.dataset.k; if (el.dataset.k === 'misto') { f.mix = {}; f.mixT = {}; f.impFromMix = !(+f.imp > 0); } render(); if (el.dataset.k === 'misto') setTimeout(() => { const i = $('[data-pfm="contanti"]'); if (i) i.focus(); }, 30); } break;
      case 'pfsave': if (UI.pay) paySave(); break;
      case 'pfrest': if (UI.pay) mixRest(el.dataset.k); break;
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
      case 'opentrip': { const go = () => { UI.pay = null; UI.lsel = []; UI.lview = 'all'; UI.view = 'trip'; UI.tripId = el.dataset.id; const tt = trip(); UI.busId = tt && tt.buses[0] ? tt.buses[0].id : null; UI.sel = UI.selP = null; UI.sec = el.dataset.sec || 'lista'; render(); window.scrollTo(0, 0); }; if (UI.view === 'trip' && t && t.id !== el.dataset.id) sospGuard(t, go); else go(); break; }
      case 'openbus': UI.view = 'trip'; UI.tripId = el.dataset.trip; UI.busId = el.dataset.bus; UI.sel = UI.selP = null; UI.sec = 'posti'; render(); window.scrollTo(0, 0); break;
      case 'sec': { const go = () => { UI.sec = el.dataset.v; UI.sel = UI.selP = null; UI.move = null; render(); window.scrollTo(0, 0); }; if (UI.sec === 'posti' && el.dataset.v !== 'posti' && t) sospGuard(t, go); else go(); break; }
      case 'tab': UI.busId = el.dataset.id; UI.move = null; render(); break;
      case 'dock': UI.dock = !UI.dock; (UI.dockMap = UI.dockMap || {})[UI.tripId] = UI.dock; render(); break;
      case 'onlyfree': UI.onlyFree = el.checked; render(); break;
      case 'newtrip': tripModal(null); break;
      case 'svtoggle': { const k = el.dataset.k; const L = UI.modal && UI.modal.serv; if (!L) break; const i = L.indexOf(k); if (i >= 0) L.splice(i, 1); else L.push(k); el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', String(i < 0)); break; }
      case 'edittrip': tripModal(t); break;
      case 'savetrip': {
        const v = { nome: $('#t-nome').value.trim(), data: $('#t-data').value, fine: $('#t-fine').value, programma: $('#t-prog').value.trim(), cat: $('#t-cat').value, codDanea: ($('#t-danea') ? $('#t-danea').value.trim() : ''), code: $('#t-code').value.trim(), extra: $('#t-extra').checked, serv: SERV.map(x => x[0]).filter(k => (UI.modal.serv || []).includes(k)) };
        if (!v.nome) { toast('Scrivi il nome della gita'); $('#t-nome').focus(); break; }
        if (!v.data) { toast('Scegli la data di partenza'); break; }
        if (v.programma && !safeUrl(v.programma)) { toast('Il link del programma deve essere un indirizzo internet (https://…)'); $('#t-prog').focus(); break; }
        v.programma = safeUrl(v.programma);
        if (UI.modal.id) { const tr0 = S.trips.find(x => x.id === UI.modal.id); if (v.cat === 'evento' && tripCat(tr0) !== 'evento') v.tkFila = true; Object.assign(tr0, v); closeModal(); commit(); }
        else { const nt = tripInit({ id: uid(), ...v, buses: [] }); if (v.cat === 'evento') nt.tkFila = true;   // 2.1.8: biglietto solo a chi ha la fila
          // ogni gita, tour o evento nuovo parte con un bus da 52 posti (si cambia da «Posti sul bus»)
          if (v.cat !== 'biglietteria') nt.buses.push({ id: uid(), label: 'Bus 1', layout: '52', mezzo: '', autista: '', accompagnatore: '', telAcc: '', note: '', partenze: [], seats: {}, guida: false });
          S.trips.push(nt); UI.tripId = nt.id; UI.view = 'trip'; UI.sec = 'lista'; UI.busId = nt.buses[0] ? nt.buses[0].id : null; closeModal(); commit(); toast(v.cat === 'biglietteria' ? 'Creata: scrivi i prezzi del biglietto e i clienti; il pulsante «€» registra l\'incasso' : 'Creato con un bus da 52 posti: scrivi la lista o importa il file Word'); }
        break;
      }
      case 'deltrip': { const id = UI.modal.id; const tr = S.trips.find(x => x.id === id); if (!tr) break; if (!ACC.can('settings') && (tr.chiusa || tr.histLock)) { toast('Il Master ha chiuso o bloccato questa gita: solo il Master può eliminarla'); break; } confirmBox('Elimina viaggio', `Elimino «${esc(tr.nome)}» con la lista e i bus, su tutti i computer? Non si può annullare.`, 'Elimina', () => { ACC.tlog('avviso', `Eliminato il viaggio «${tr.nome}» (${fmtDate(tr.data)})`); deleteTrip(id); UI.view = 'home'; UI.tripId = null; commit(); }); break; }
      case 'addbus': busModal(el.dataset.trip); break;
      case 'picklayout': UI.modal.pick = el.dataset.id; $$('#pickgrid .model').forEach(m => m.classList.toggle('on', m.dataset.id === el.dataset.id)); break;
      case 'savebus': {
        const tr = S.trips.find(x => x.id === UI.modal.tripId);
        const nb = { id: uid(), label: $('#nb-label').value.trim() || `Bus ${tr.buses.length + 1}`, layout: UI.modal.pick, mezzo: $('#nb-mezzo').value.trim(), autista: $('#nb-autista').value.trim(), accompagnatore: $('#nb-acc').value.trim(), telAcc: '', note: '', partenze: [], seats: {}, guida: !!tr.guida };
        if (tr.buses.length === 1) { const b0 = tr.buses[0]; if (!tr.gv) { tripInit(tr); deriveBookings(tr); } tr.gv = 1; tr.rows.forEach(r => { if (!r.bus || !tr.buses.some(x => x.id === r.bus)) r.bus = b0.id; }); }
        tr.buses.push(nb); UI.view = 'trip'; UI.tripId = tr.id; UI.busId = nb.id; closeModal(); commit(); toast(`${nb.label} aggiunto: trascina le prenotazioni sui posti`); break;
      }
      case 'changelayout': busModal(t.id, true); break;
      case 'savelayout': { const L = LMAP[UI.modal.pick]; const lost = Object.keys(b.seats).filter(s => !L.info.all.includes(+s)); lost.forEach(s => delete b.seats[s]); b.layout = UI.modal.pick; closeModal(); commit(); toast(lost.length ? `Piantina cambiata: ${lost.length} persone sono tornate senza posto` : 'Piantina cambiata'); break; }
      case 'delbus': confirmBox('Elimina bus', `Elimino «${esc(b.label)}»? Le persone restano nella lista, senza posto${multiBus(t) && t.buses.length > 2 ? ' (nella lista «Senza bus»)' : ''}.`, 'Elimina', () => { if (multiBus(t)) pinGroup(t, t.rows.filter(r => r.bus === b.id).map(r => r.id)); t.rows = t.rows.filter(r => !(r.bus === b.id && isEmptyRow(r) && t.buses.length > 2)); t.rows.forEach(r => { if (r.bus === b.id) delete r.bus; }); t.buses = t.buses.filter(x => x.id !== b.id); UI.busId = t.buses[0] ? t.buses[0].id : null; commit(); }); break;
      case 'selbk': if (e.target.closest('[data-dragp], .kebab')) break; closePop(); UI.move = null; UI.selP = null; UI.sel = UI.sel === el.dataset.id ? null : el.dataset.id; { const SI = seatIndex(t); const D = deriveBookings(t); const bk = UI.sel && D.find(x => x.id === UI.sel); const on = bk && bk.persone.map(p => SI[p.id]).find(Boolean); if (on) UI.busId = on.b.id; } render(); break;
      case 'selp': e.stopPropagation(); UI.move = null; UI.sel = null; UI.selP = UI.selP === el.dataset.id ? null : el.dataset.id; { const x = UI.selP && seatIndex(t)[UI.selP]; if (x) UI.busId = x.b.id; } render(); break;
      case 'cancel': UI.sel = UI.selP = null; UI.move = null; UI.moveBk = null; render(); break;
      case 'mvbk': { const D = syncAll(t); const bb = b && bkById(b, el.dataset.id); if (bb) startMoveBk(bb); break; }
      case 'mv': UI.move = +el.dataset.s; UI.sel = UI.selP = null; closePop(); render(); break;
      case 'savenp': { const a = b.seats[+el.dataset.s]; const r = a && rowById(t, a.pid); if (!r) { closePop(); break; } r.np = $('#np-in').value.trim(); closePop(); commit(); break; }
      case 'freeseat': delete b.seats[+el.dataset.s]; closePop(); commit(); break;
      case 'sosp': { const a = b.seats[+el.dataset.s]; closePop(); if (a && a.pid && sospPark(t, b, a.pid)) { const r = rowById(t, a.pid); commit(); toast(`${String(r.cognome).replace(RX, '$1').trim()} ${r.nome} in sospeso: rimettila su un posto quando hai finito`); } break; }
      case 'sospdel': { b.sosp = (b.sosp || []).filter(x => x !== el.dataset.id); if (UI.selP === el.dataset.id) UI.selP = null; commit(); toast('Tolta dai posti in sospeso: resta su questo bus, senza posto'); break; }
      case 'unbus': { const a = b.seats[+el.dataset.s]; const r = rowById(t, a.pid); if (multiBus(t)) pinGroup(t, [r.id]); unseatRow(t, r); delete r.bus; closePop(); commit(); break; }
      case 'freebk': { if (multiBus(t)) pinGroup(t, (deriveBookings(t).find(x => x.id === el.dataset.id) || { persone: [] }).persone.map(p => p.id)); const D = deriveBookings(t); const bk = D.find(x => x.id === el.dataset.id); bk.persone.forEach(p => { if (p.row.bus === b.id) { unseatRow(t, p.row); delete p.row.bus; } }); closePop(); commit(); toast(`${bkName(bk)} tolta da ${b.label}`); break; }
      case 'reserve': b.seats[+el.dataset.s] = { res: 'Guida / 2° autista' }; closePop(); commit(); break;
      case 'unreserve': delete b.seats[+el.dataset.s]; closePop(); commit(); break;
      case 'fill': fillBus(t, b); commit(); break;
      case 'clearall': confirmBox('Libera tutti i posti', `Tolgo tutti i posti assegnati su «${esc(b.label)}»? Le persone restano su questo bus, senza posto.`, 'Libera', () => { b.seats = {}; commit(); }); break;
      case 'adddep': b.partenze = b.partenze || []; b.partenze.push({ code: '', luogo: '', ora: '' }); save(); $('#deps').innerHTML = depsHTML(b); break;
      case 'deldep': b.partenze.splice(+el.dataset.i, 1); save(); $('#deps').innerHTML = depsHTML(b); break;
      case 'openpdf': openPdf(el.dataset.id); break;
      case 'delpdf': { const tr = S.trips.find(x => x.id === el.dataset.id); confirmBox('Togli il programma', `Tolgo «${esc(tr.pdf.name)}» da questo viaggio?`, 'Togli', () => { if (tr.pdf.path) STORE.delBlob(tr.pdf.path).catch(() => {}); delete tr.pdf; commit(); }); break; }
      case 'printmap': sospGuard(t, () => openPrint('map')); break;
      case 'printcards': sospGuard(t, () => openPrint('cards')); break;
      case 'printlist': sospGuard(t, () => openPrint('list')); break;
      case 'printacc': sospGuard(t, () => openPrint('acc')); break;
      case 'rooming': openPrint('rooming'); break;
      case 'cartorder': UI.cartOrder = el.dataset.v; openPrint('cards'); break;
      case 'doprint': document.body.classList.add('printing'); setTimeout(() => window.print(), 50); break;
      case 'closeprint': closePrint(); break;
      // righe della lista
      case 'rowmenu': e.stopPropagation(); onRowNum(e, el); break;
      case 'rowins': { const i = t.rows.findIndex(r => r.id === el.dataset.id); const ref = t.rows[i]; t.rows.splice(i + (+el.dataset.d), 0, Object.assign(blankRow(), multiBus(t) && ref && ref.bus ? { bus: ref.bus } : {})); closePop(); commit(); const nr = t.rows[i + (+el.dataset.d)]; const inp = $(`[data-r="${nr.id}"][data-f="cognome"]`); if (inp) inp.focus(); break; }
      case 'rowdel': { const r = rowById(t, el.dataset.id); closePop(); const go = () => { if (isEmptyRow(r)) { const before = groupMap(t); const n0 = t.rows.length; t.rows = t.rows.filter(x => x !== r); keepGroups(t, before); if (t.rows.length === n0) toast('La riga resta: è il posto di un nome che manca nella comitiva sopra (per toglierla cambia il numero «x N»)'); } else deleteRows(t, [r.id]); commit(); }; if (isEmptyRow(r)) go(); else confirmBox('Elimina riga', `Elimino la riga di ${esc(r.cognome)} ${esc(r.nome)}?`, 'Elimina', go); break; }
      case 'abituale': case 'saldato': { const r = rowById(t, el.dataset.id); r[act] = !r[act]; closePop(); commit(); break; }
      case 'toatt1': toWaiting(t, [el.dataset.id]); break;
      case 'toattsel': toWaiting(t, (UI.lsel || []).slice()); break;
      case 'toann1': toCancelled(t, [el.dataset.id], el.dataset.k); break;
      case 'toannsel': toCancelled(t, (UI.lsel || []).slice(), el.dataset.k); break;
      case 'rselbk': closePop(); gAct('selbk', el.dataset.id); break;
      case 'rowdelsel': { const ids = (UI.lsel || []).filter(x => { const rr = rowById(t, x); return rr && !isEmptyRow(rr); }); closePop(); if (!ids.length) break; confirmBox('Elimina righe', `Elimino le ${ids.length} righe selezionate?`, 'Elimina', () => { deleteRows(t, ids); UI.lsel = []; commit(); toast(`${ids.length} righe eliminate`); }); break; }
      case 'toatt': { const before = groupMap(t); const m = moveBookingOut(t, el.dataset.id); if (!m) break; keepGroups(t, before); const h = m.rows[0]; let ai = t.attesa.length; while (ai > 0 && isEmptyRow(t.attesa[ai - 1])) ai--; t.attesa.splice(ai, 0, { ...blankAtt(), cognome: /x\s*\d/i.test(h.cognome) ? h.cognome : `${h.cognome} x ${m.rows.length}`, nome: h.nome, nascita: h.nascita, tel: h.tel, part: h.part, note: h.note, richiesta: ddmm() }); closePop(); commit(); toast(`${bkName(m.bk)} spostata in lista d'attesa`); break; }
      case 'toann': { const before = groupMap(t); const m = moveBookingOut(t, el.dataset.id); if (!m) break; keepGroups(t, before); m.rows.forEach(r => t.annullati.push({ ...r, stato: el.dataset.k, dataAnn: ddmm() })); closePop(); commit(); toast(`${bkName(m.bk)}: ${el.dataset.k === 'vende' ? 'vuole vendere il biglietto' : 'non parte più'}`); break; }
      case 'attmenu': e.stopPropagation(); attMenu(el.dataset.id, el); break;
      case 'attconf': { const r = t.attesa.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } const m = RX.exec(String(r.cognome || '').trim()); const n = m ? +m[2] : 1; const base = m ? m[1].trim() : String(r.cognome || '').trim();
        const add = [{ ...blankRow(), cognome: r.cognome, nome: r.nome, nascita: r.nascita, tel: r.tel, part: r.part, note: r.note }]; for (let k = 1; k < n; k++) add.push({ ...blankRow(), cognome: base, part: r.part });
        { const before = groupMap(t); t.rows.splice(insertAt(t), 0, ...add); keepGroups(t, before); } t.attesa = t.attesa.filter(x => x !== r); closePop(); commit(); toast(`${base} x ${n} è nella lista partecipanti: completa i nomi`); break; }
      case 'attdel': t.attesa = t.attesa.filter(x => x.id !== el.dataset.id); closePop(); commit(); break;
      case 'annmenu': e.stopPropagation(); annMenu(el.dataset.id, el); break;
      case 'annmove': { const r = t.annullati.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } r.stato = el.dataset.k; closePop(); commit(); break; }
      case 'annrest': { const r = t.annullati.find(x => x.id === el.dataset.id); if (!r) { closePop(); break; } t.annullati = t.annullati.filter(x => x !== r); const o = { ...r }; delete o.stato; delete o.dataAnn; { const before = groupMap(t); before.set(o.id, { bk: o.id, n: 1 }); t.rows.splice(insertAt(t), 0, o); keepGroups(t, before); } closePop(); commit(); break; }
      case 'anndel': t.annullati = t.annullati.filter(x => x.id !== el.dataset.id); closePop(); commit(); break;
      case 'suppadd': { t.quota.supplN = supplN(t) + 1; commit(); const i = $(`[data-qs="${t.quota.supplN}"]`); if (i) i.focus(); break; }
      case 'suppdel': { const N = supplN(t); delete t.quota.suppl[N]; t.quota.supplN = Math.max(1, N - 1); commit(); break; }
      case 'tkfila': confirmBox('Usa la regola nuova', `Da adesso, in <b>${esc(t.nome)}</b>, il biglietto si somma solo a chi ha la colonna «fila» scritta: chi ha la fila vuota paga solo il bus. Prima controlla che chi ha il biglietto abbia la fila scritta.`, 'Usa la regola nuova', () => { t.tkFila = true; ACC.tlog('avviso', `«${t.nome}»: biglietto solo a chi ha la fila (regola 2.1.8)`); commit(); toast('Regola nuova attiva'); }); break;
      case 'tksadd': { tksArr(t); t.quota.tsett.push({ id: uid(), nome: '', intero: null, ridotto: null }); commit(); const ins = $$('[data-tks][data-k="nome"]'); if (ins.length) ins[ins.length - 1].focus(); break; }
      case 'tksdel': { tksArr(t); t.quota.tsett.splice(+el.dataset.i, 1); commit(); break; }
      case 'tklink': if (typeof bgLinkModal === 'function') bgLinkModal(t); break;
      case 'tkunlink': if (typeof bgUnlink === 'function') bgUnlink(t); break;
      case 'tkbgopen': { const e2 = typeof bgTripEv === 'function' && bgTripEv(t); UI.view = 'bigl'; const st = bgS(); st.tab = 'eventi'; st.evAll = e2 && e2.data < todayISO() ? true : st.evAll; UI.pay = null; render(); window.scrollTo(0, 0); break; }
      case 'noteadd': { t.notes = notesOf(t).slice(); t.notes.push(''); delete t.note1; delete t.note2; commit(); const ins = $$('[data-note]'); if (ins.length) ins[ins.length - 1].focus(); break; }
      case 'notedel': { t.notes = notesOf(t).slice(); t.notes.splice(+el.dataset.i, 1); delete t.note1; delete t.note2; commit(); break; }
      case 'staffadd': { t.staff = (t.staff && t.staff.length ? t.staff : [{ ruolo: 'Accompagnatore' }, { ruolo: 'Autista' }]); t.staff.push({ ruolo: '' }); commit(); break; }
      case 'staffdel': { t.staff = (t.staff && t.staff.length ? t.staff : [{ ruolo: 'Accompagnatore' }, { ruolo: 'Autista' }]); t.staff.splice(+el.dataset.i, 1); commit(); break; }
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
      case 'wa': sospGuard(t, () => { UI.waPrev = null; waModal(); }); break;
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
    if (d.cfgl !== undefined) { if (d.k === 'colore') { S.cfg.luoghi[+d.cfgl].colore = Object.prototype.hasOwnProperty.call(LCOL_HEX, el.value) ? el.value : ''; save(); render(); return; } S.cfg.luoghi[+d.cfgl][d.k] = d.k === 'code' ? el.value.toUpperCase() : el.value; save();
      // colore non ancora scelto: si aggiorna quello proposto per la città (senza ridisegnare la pagina mentre si scrive)
      if ((d.k === 'code' || d.k === 'citta') && S.cfg.luoghi[+d.cfgl].colore == null) { const k = lcolKey(S.cfg.luoghi[+d.cfgl]); const sl = document.querySelector(`select[data-cfgl="${+d.cfgl}"][data-k="colore"]`); if (sl) { sl.value = k; const dot = sl.parentElement && sl.parentElement.querySelector('.lcold'); if (dot) dot.style.background = LCOL_HEX[k] || 'transparent'; } }
      return; }
    if (d.cc) { ccDiff(); return; }
    if (d.ucell) { if (!ACC.can('users')) return; const u = ACC.users()[d.ucell]; if (u) { u.cell = el.value.trim(); save(); } return; }
    if (d.usig) { if (!ACC.can('users')) return; const u = ACC.users()[d.usig]; if (u) { u.sigla = el.value.toUpperCase().trim(); save(); } return; }
    if (UI.pay && (d.pf || d.pl !== undefined || d.pff || d.pfm || d.pfc)) { payInput(el); return; }
    if (d.r && t) { const r = rowById(t, d.r); if (r) { r[d.f] = el.value; if (d.f === 'cognome' || d.f === 'nome') { if (r.cid && S.clients.clienti[r.cid]) { const x = S.clients.clienti[r.cid]; if (nk(baseCognome(r.cognome)) !== nk(x.cognome) || nk(r.nome) !== nk(x.nome)) delete r.cid; } acOpen(el); } save(); } return; }
    if (d.ar && t) { const r = t.attesa.find(x => x.id === d.ar); if (r) { r[d.f] = el.value; save(); } return; }
    if (d.nr && t) { const r = t.annullati.find(x => x.id === d.nr); if (r) { r[d.f] = el.value; save(); } return; }
    if (d.tks !== undefined && t) { tksArr(t); const x = t.quota.tsett[+d.tks]; if (x) { x[d.k] = d.k === 'nome' ? el.value : parseEuro(el.value); save(); } return; }
    if (d.q && t) { t.quota[d.q] = parseEuro(el.value); save(); return; }
    if (d.qs && t) { t.quota.suppl[d.qs] = parseEuro(el.value); save(); return; }
    if (d.qt && t) { t.quota[d.qt] = el.value.trim(); save(); return; }
    if (d.tf && t) { if (d.tf !== 'nome' || el.value.trim()) t[d.tf] = el.type === 'date' ? el.value : el.value; save(); return; }
    if (d.depsel !== undefined && t) { const i = +d.depsel; const old = t.partenze[i] || {}; if (el.value === 'cur') return; if (el.value === '') { t.partenze[i] = { citta: '', luogo: '', ora: old.ora || '', code: '' }; } else { const l = (S.cfg.luoghi || [])[+el.value]; if (l) t.partenze[i] = { citta: l.citta || '', luogo: l.luogo || '', ora: old.ora || '', code: String(l.code || '').toUpperCase() }; } while (t.partenze.length && !(t.partenze[t.partenze.length - 1] || {}).citta && !(t.partenze[t.partenze.length - 1] || {}).ora) t.partenze.pop(); save(); later(); return; }
    if (d.st !== undefined && t) { if (!(t.staff && t.staff.length)) t.staff = [{ ruolo: 'Accompagnatore' }, { ruolo: 'Autista' }]; const s = t.staff[+d.st] = t.staff[+d.st] || {}; s[d.k] = el.value; save(); return; }
    if (d.note !== undefined && t) { t.notes = notesOf(t).slice(); t.notes[+d.note] = el.value; delete t.note1; delete t.note2; save(); return; }
    if (d.dep2 !== undefined && t) { t.partenze[+d.dep2] = t.partenze[+d.dep2] || { citta: '', luogo: '', ora: '' }; t.partenze[+d.dep2][d.k] = el.value; save(); return; }
    if (d.bind && b) { b[d.bind] = el.value; save(); return; }
    if (d.dep !== undefined && b) { b.partenze[+d.dep][d.k] = d.k === 'code' ? el.value.toUpperCase() : el.value; save(); return; }
    if (el.id === 'imp-text') { clearTimeout(el._t); el._t = setTimeout(() => { if (!el.value.trim()) return; const P = parsePaste(el.value); showParsed({ part: P, quota: { suppl: {} }, attesa: [], annullati: [], note: [], partenze: [] }); }, 250); }
  });
  document.addEventListener('change', e => {
    const el = e.target; const t = trip(); const b = bus(); const d = el.dataset;
    if (d.impfile) { if (!ACC.can('anag') || ACC.can('readonly')) return; const f = el.files && el.files[0]; el.value = ''; if (f) impOpenFile(f); return; }
    if ((d.impc !== undefined || d.imph || d.impt) && UI.imp) { impInput(el); return; }
    if (d.r && t && d.f === 'emis') { const r = rowById(t, d.r); if (r) { const iso = emisISO(r.emis); if (iso) r.emis = `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`; else if (String(r.emis || '').trim()) toast('Data di emissione non valida: scrivila come 05/11/26'); save(); later(); } return; }
    if (d.r && t) { const r = rowById(t, d.r); if (r && !AC.el) upsertFromRow(r);
      if (r && d.f === 'cognome' && (d.r in OLDC)) { const oldV = OLDC[d.r]; delete OLDC[d.r]; const mo = RX.exec(String(oldV || '').trim()), mn = RX.exec(String(r.cognome || '').trim());
        const nOld = mo ? +mo[2] : (String(oldV || '').trim() ? 1 : 0), nNew = mn ? +mn[2] : 0;
        if (nNew > 1 && nNew > nOld && t.chiusa) { r.cognome = oldV; toast(closedMsg(t) + ': la comitiva non può crescere'); save(); later(); return; }
        if (nNew > 1 && nNew > nOld) { const added = growGroup(t, r, oldV, nNew); if (added) toast(`${mn[1].trim()} x ${nNew}: ${added === 1 ? 'aggiunta 1 riga vuota' : `aggiunte ${added} righe vuote`} sotto la comitiva`); setTimeout(() => capCheck(t, listKey(t, r), `${mn[1].trim()} x ${nNew}`), 60); }
      }
      save(); later(); return; }
    if ((d.ar || d.nr || d.q || d.qs || d.qt || d.tf || d.tks !== undefined) && t) { later(); return; }
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
    if (d.year) { UI.year = el.value; render(); window.scrollTo(0, 0); return; }
    if (d.gdate) { if (el.value) { UI.gday = el.value; render(); } return; }
    if (d.bind === 'label' || d.bind === 'accompagnatore') { later(); return; }
    if (d.tchk && t) { t[d.tchk] = el.checked; t.buses.forEach(x => { x.guida = el.checked; if (!el.checked) Object.keys(x.seats).forEach(k => { if (x.seats[k].res) delete x.seats[k]; }); else { syncAll(t); reserveGuide(x); } }); commit(); return; }
    if (d.bindchk && b) { b[d.bindchk] = el.checked; if (!el.checked) Object.keys(b.seats).forEach(k => { if (b.seats[k].res) delete b.seats[k]; }); else reserveGuide(b); commit(); return; }
    if (el.id === 't-cat') { const sb = $('#t-servbox'); if (sb) sb.hidden = el.value === 'biglietteria'; return; }
    if (el.id === 'imp-file' && el.files[0]) readImportFile(el.files[0]);
    if (el.classList.contains('pdf-in') && el.files[0]) attachPdf(el.dataset.trip, el.files[0]);
    if (el.id === 's-restore' && el.files[0] && ACC.can('settings')) {
      const r = new FileReader(); r.onload = () => { try { const res = importBackup(JSON.parse(r.result)); render(); toast(`Copia recuperata: ${res.add} viaggi nuovi, ${res.into} liste inserite${res.skip ? `, ${res.skip} saltati (già presenti o di esempio)` : ''}${res.bad ? ` · ${res.bad} elementi scartati perché contenevano dati non validi` : ''}`); } catch (err) { toast('Il file non è una copia valida'); } }; r.readAsText(el.files[0]); el.value = '';
    }
  });
  document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); gateSubmit(f).catch(err => { GATE.busy = false; GATE.msg = 'Qualcosa non ha funzionato: riprova.'; ACC.tlog('errore', 'Accesso: ' + (err && err.message || err)); render(); }); });
  window.addEventListener('scroll', () => { if (AC.el) acClose(); }, { passive: true });
  // suggerimento dell'anagrafica: si sceglie appena si preme il tasto del mouse, prima che il campo perda il cursore
  // (prima, uscendo dal campo, la lista si ridisegnava e il clic andava perso)
  document.addEventListener('mousedown', e => {
    const it = e.target.closest && e.target.closest('.acbox [data-act=acpick]'); if (!it || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation(); acPick(it.dataset.id);
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AC.el && !(e.target.classList && e.target.classList.contains('wc'))) { acClose(); return; }
    if (e.key === 'Escape') { if ($('#pres-alert')) return closePresAlert(); if ($('#pop')) return closePop(); if (!$('#print-root').hidden) return closePrint(); if ($('#modal-root').innerHTML) return closeModal(); if (UI.pay) return payClose(); if (UI.sel || UI.selP || UI.move != null || (UI.lsel || []).length) { UI.sel = UI.selP = null; UI.move = null; UI.lsel = []; render(); } return; }
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
    const rid = (pe && pe.dataset.dragp) || (bk && bk.dataset.dragbk); const lsel = UI.lsel || [];
    if (rid && lsel.includes(rid) && lsel.length > 1 && gest().dragSel) drag = { rows: lsel.slice() };
    e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'posto'); } catch (err) { /* ignorato */ }
    const row = c.closest('tr');
    // con più bus: barra fissa in basso con le liste, così non serve scorrere fino alla lista di destinazione
    { const t = UI.view === 'trip' && trip(); if (t && multiBus(t) && !drag.seat && UI.sec !== 'posti') { const bar = document.createElement('div'); bar.id = 'dropbar'; bar.className = 'dropbar'; bar.innerHTML = `<span>Lascia qui per spostare in</span>${tripLists(t).map(L => `<div class="db-t" data-droplist="L:${esc(L.id)}">${L.b ? ICON.bus : ''} ${esc(L.b ? L.b.label : L.label)}</div>`).join('')}`; document.body.appendChild(bar); } }
    if (drag.rows && e.dataTransfer.setDragImage) { const g = document.createElement('div'); g.className = 'dragghost'; g.textContent = `${drag.rows.length} persone`; document.body.appendChild(g); e.dataTransfer.setDragImage(g, 16, 16); setTimeout(() => g.remove(), 0); }
    else if (row && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(row, 20, 14);
  });
  document.addEventListener('dragover', e => {
    if (!drag || !e.target.closest) return;
    const st = e.target.closest('#mapwrap .seat[data-seat]'); const tb = e.target.closest('[data-dropbus]'); const dl = e.target.closest('[data-droplist]');
    $$('.drop-b,.drop-a').forEach(x => x.classList.remove('drop-b', 'drop-a'));
    // sopra una riga della lista: la persona (o la prenotazione) va lì, prima o dopo
    const tr = (drag.bk || drag.p || drag.rows) && e.target.closest('.lsec tr[data-rowid]');
    if (tr && !isEmptyRowEl(tr)) { e.preventDefault(); $$('.drop').forEach(x => x.classList.remove('drop')); const rc = tr.getBoundingClientRect(); tr.classList.add(e.clientY > rc.top + rc.height / 2 ? 'drop-a' : 'drop-b'); return; }
    const sd = e.target.closest('[data-sospdrop]');
    $$('.drop').forEach(x => x !== st && x !== tb && x !== dl && x !== sd && x.classList.remove('drop'));
    if (sd && (drag.seat != null || drag.p || drag.bk)) { e.preventDefault(); sd.classList.add('drop'); return; }
    if (st && !st.classList.contains('res')) { e.preventDefault(); st.classList.add('drop'); }
    else if (tb && (drag.bk || drag.p || drag.rows)) { e.preventDefault(); tb.classList.add('drop'); }
    else if (dl && (drag.seat != null || (/^L:/.test(dl.dataset.droplist) && (drag.bk || drag.p || drag.rows)))) { e.preventDefault(); dl.classList.add('drop'); }
  });
  document.addEventListener('drop', e => {
    const tgt = e.target.closest ? e.target : e.target.parentElement;
    const st = tgt.closest('#mapwrap .seat[data-seat]'); const dz = tgt.closest('#dropzone'); const tb = tgt.closest('[data-dropbus]'); const dl = tgt.closest('[data-droplist]');
    const rtr = tgt.closest('.lsec tr[data-rowid]'); const rAfter = rtr && rtr.classList.contains('drop-a');
    $$('.drop').forEach(x => x.classList.remove('drop')); $$('.drop-b,.drop-a').forEach(x => x.classList.remove('drop-b', 'drop-a')); { const db = $('#dropbar'); if (db) setTimeout(() => db.remove(), 0); }
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
    if (rtr && (dr.bk || dr.p || dr.rows) && !isEmptyRowEl(rtr)) {
      let ids = dr.rows || (dr.p ? [dr.p] : []); if (dr.bk) { const bk = deriveBookings(t).find(x => x.id === dr.bk); ids = bk ? bk.persone.map(p => p.id) : []; }
      if (ids.includes(rtr.dataset.rowid)) return;
      const n = moveRowsTo(t, ids, rtr.dataset.rowid, rAfter); if (dr.rows) UI.lsel = [];
      if (n) { const r0 = rowById(t, ids[0]); const D = deriveBookings(t); const bk = D.find(b => b.persone.some(p => p.id === ids[0])); commit();
        toast(`${dr.bk ? `${bkName(bk)} x ${bk.persone.length} spostata` : n === 1 ? `${String(r0.cognome).replace(RX, '$1').trim()} ${r0.nome} spostato` : `${n} persone spostate`}${dr.p && bk && bk.persone.length > 1 ? ` · resta nella comitiva ${bkName(bk)} (per staccarla: menu della riga › Stacca)` : ''}`); }
      return;
    }
    if (dl && /^L:/.test(dl.dataset.droplist) && (dr.bk || dr.p || dr.rows || dr.seat != null)) {
      const to = dl.dataset.droplist.slice(2); let ids = dr.rows || (dr.p ? [dr.p] : []);
      if (dr.bk) { const bk = deriveBookings(t).find(x => x.id === dr.bk); ids = bk ? bk.persone.map(p => p.id) : []; }
      if (dr.seat != null) { const a = b && b.seats[dr.seat]; ids = a && a.pid ? [a.pid] : []; }
      if (dr.rows) UI.lsel = []; doListMove(t, ids, to); return;
    }
    const sdz = tgt.closest('[data-sospdrop]');
    if (sdz && b && (dr.seat != null || dr.p || dr.bk)) {
      let ids = dr.p ? [dr.p] : [];
      if (dr.seat != null) { const a = b.seats[dr.seat]; ids = a && a.pid ? [a.pid] : []; }
      if (dr.bk) { const bk = deriveBookings(t).find(x => x.id === dr.bk); ids = bk ? bk.persone.map(p => p.id) : []; }
      const n = ids.filter(id => sospPark(t, b, id)).length; if (!n) return;
      commit(); toast(n === 1 ? 'Messa nei posti in sospeso: rimettila su un posto quando hai finito' : `${n} persone nei posti in sospeso: rimettile sul bus quando hai finito`); return;
    }
    if (st && dr.rows) { const D = deriveBookings(t); const bks = new Set(dr.rows.map(id => (D.find(x => x.persone.some(p => p.id === id)) || {}).id)); if (bks.size === 1) { const id = [...bks][0]; const bk = D.find(x => x.id === id); if (bk.persone.every(p => dr.rows.includes(p.id))) { const r = dropFamily(t, id, b, +st.dataset.seat); UI.lsel = []; afterFamily(r, t, b, id); return commit(); } } return toast('Sulla piantina si trascina una prenotazione o una persona alla volta: per spostare tante persone usa la linguetta del bus'); }
    if (st) {
      const s = +st.dataset.seat;
      if (dr.seat != null) { if (dr.seat !== s) { const was = b.seats[s]; moveSeat(b, dr.seat, s); toast(was ? `Scambiati i posti ${dr.seat} e ${s}` : `Spostato dal ${dr.seat} al ${s}`); commit(); } return; }
      if (dr.bk) { const r = dropFamily(t, dr.bk, b, s); UI.sel = null; afterFamily(r, t, b, dr.bk); return commit(); }
      if (dr.p) { const r = dropPerson(t, dr.p, b, s); if (!r.ok) return toast(r.msg); toast(r.swap ? 'Posti scambiati' : `Messo al posto ${s}`); return commit(); }
    }
    if (tb && dr.rows) {
      const to = t.buses.find(x => x.id === tb.dataset.dropbus); moveRowsToList(t, dr.rows, to.id); UI.lsel = [];
      const D = syncAll(t); const ids = new Set(dr.rows.map(id => (D.find(x => x.persone.some(p => p.id === id)) || {}).id).filter(Boolean)); autoAssign(to, ids); syncAll(t); UI.busId = to.id;
      toast(`${dr.rows.length} persone su ${to.label}`); return commit();
    }
    if (tb && (dr.bk || dr.p)) {
      const to = t.buses.find(x => x.id === tb.dataset.dropbus); let id = dr.bk;
      if (dr.p) { const r = rowById(t, dr.p); if (multiBus(t) && r.bus !== to.id) pinGroup(t, [dr.p]); unseatRow(t, r); r.bus = to.id; id = deriveBookings(t).find(x => x.persone.some(p => p.id === dr.p)).id; syncAll(t); autoAssign(to, new Set([id])); }
      else toBusAuto(t, [id], to);
      syncAll(t); UI.busId = to.id; const bb = bkById(to, id);
      toast(`${bkName(bb)}: su ${to.label}, ${seatsOf(to, id).length ? 'posti ' + fmtSeats(seatsOf(to, id)) : 'senza posto (bus pieno?)'}`); return commit();
    }
    if (dl && dr.seat != null) { const a = b.seats[dr.seat]; if (a && a.pid) { const r = rowById(t, a.pid); unseatRow(t, r); delete r.bus; toast(`${String(r.cognome).replace(RX, '$1')} ${r.nome} tolto dal bus`); commit(); } }
  });
  const isEmptyRowEl = tr => { const t = trip(); const r = t && rowById(t, tr.dataset.rowid); return !r || isEmptyRow(r); };
  document.addEventListener('dragend', () => { drag = null; $$('.drop').forEach(x => x.classList.remove('drop')); $$('.drop-b,.drop-a').forEach(x => x.classList.remove('drop-b', 'drop-a')); const db = $('#dropbar'); if (db) db.remove(); });
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
  window.__posti = { get S() { return S; }, UI, render, deriveBookings, ensureBlank, blankRow, isEmptyRow, overCap, tripTkt, personTkt, bgEvents, emisISO, moveRowsToList, tripLists, listRows, listKey, multiBus, moveRowsToList, personMoney, groupMoney, pidPaid, gest, presenceCheck, syncAll, seatIndex, officeLabels, parseTripDocx, autoAssign, prefStatus, bkMoney, summaryOf, LMAP, dropFamily, dropPerson, STORE, ACC, flush, allMovs, payTotals, cashSaldo, giornoData, bkMoney, off: { get OFFS() { return OFFS; }, cxAlert, offAlert, casiAll, offStatus }, xlRow, DIAG,
    demo() { const d = demoState(); d.trips.forEach(t => { delete t.demo; S.trips.push(t); t.rows.forEach(r => upsertFromRow(r)); }); flush(); render(); return d.trips.map(t => t.id); } };

  // ---------- avvio ----------
  // ---- chi sta lavorando dove: ogni computer dice (via Dropbox) quale lista e quale incasso ha aperto ----
  const PRES = { key: '', at: 0, seen: new Set(), trip: '' };
  function presenceBeat(force) {
    try {
      if (!ACC.sess || !STORE.status().linked) return; const me = ACC.me(); if (!me || me.role === 'super') return;
      const t = UI.view === 'trip' && trip(); const bb = t && UI.sec === 'posti' && bus();
      const rec = { dev: STORE.device.id, uid: ACC.sess.uid, name: me.name, ag: ACC.sess.ag || '', view: UI.view, tripId: t ? t.id : '', sec: t ? (UI.sec === 'posti' ? 'posti' : 'lista') : '', busL: bb ? bb.label : '', payBk: UI.pay ? UI.pay.bkId : '', vis: !document.hidden, at: Date.now() };
      const key = JSON.stringify([rec.view, rec.tripId, rec.sec, rec.busL, rec.payBk, rec.vis, rec.ag]);
      if (!force && key === PRES.key && Date.now() - PRES.at < 60000) return;
      PRES.key = key; PRES.at = Date.now(); STORE.put(`/presenza/${STORE.device.id}.json`, rec);
    } catch (e) { /* niente */ }
  }
  const othersHere = () => STORE.list('/presenza/').map(([, d]) => d).filter(d => d && d.dev !== STORE.device.id && d.vis !== false && Date.now() - (+d.at || 0) < 150000);
  const presWhere = d => d.payBk ? 'sta incassando una prenotazione' : d.sec === 'posti' ? `è sulla piantina${d.busL ? ' di ' + d.busL : ''}` : 'è sulla lista prenotazioni';
  const presWho = d => `<b>${esc(d.name)}</b>${d.ag ? ` <span class="pr-ag">${esc(agName(d.ag))}</span>` : ''}`;
  // fascia arancione fissa in alto finché l'altro operatore resta sullo stesso viaggio
  function presenceHTML(t) {
    const o = othersHere().filter(d => d.view === 'trip' && d.tripId === t.id); if (!o.length) return '';
    return `<div class="presence big" role="alert">${ICON.alert}<div><div class="pr-t">${o.length === 1 ? 'Su questo viaggio sta lavorando anche un altro operatore' : `Su questo viaggio stanno lavorando altri ${o.length} operatori`}</div>
      <div class="pr-l">${o.map(d => `<span class="pr-p">${presWho(d)} · ${esc(presWhere(d))}</span>`).join('')}</div>
      <div class="pr-s">Le modifiche si uniscono da sole; se lavorate sulla stessa riga resta l'ultima scritta per ogni campo. Mettetevi d'accordo prima di spostare persone o incassare.</div></div></div>`;
  }
  // finestra grande quando qualcuno entra nel viaggio dove sei (o quando entri tu dove c'è già qualcuno)
  function presenceCheck() {
    const t = UI.view === 'trip' && trip(); const tid = t ? t.id : '';
    if (tid !== PRES.trip) { PRES.trip = tid; PRES.seen = new Set(); closePresAlert(); }
    if (!t || !ACC.sess) return;
    const o = othersHere().filter(d => d.view === 'trip' && d.tripId === t.id);
    const nw = o.filter(d => !PRES.seen.has(d.dev));
    const gone = [...PRES.seen].filter(dev => !o.some(d => d.dev === dev));
    PRES.seen = new Set(o.map(d => d.dev));
    if (nw.length) presAlert(t, nw);
    if (gone.length && !o.length) { closePresAlert(); toast('Ora su questo viaggio ci sei solo tu'); }
  }
  function presAlert(t, list) {
    closePresAlert(); const box = document.createElement('div'); box.id = 'pres-alert'; box.className = 'pres-alert'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-label', 'Un altro operatore sullo stesso viaggio');
    box.innerHTML = `<div class="pa-card"><div class="pa-ico">${ICON.users}</div><div class="pa-h">Attenzione: non sei solo su questo viaggio</div>
      <div class="pa-trip">${esc(t.nome)} · ${esc(fmtTripDate(t))}</div>
      ${list.map(d => `<div class="pa-p"><span class="pa-av">${esc(String(d.name || '?').trim().slice(0, 1).toUpperCase())}</span><div><b>${esc(d.name)}</b><span>${d.ag ? 'dall\'agenzia di <b>' + esc(agName(d.ag)) + '</b> · ' : ''}${esc(presWhere(d))}</span></div></div>`).join('')}
      <div class="pa-s">Lavorate sulla stessa lista: prima di spostare persone, cambiare posti o incassare, sentitevi con ${list.length === 1 ? esc(list[0].name) : 'gli altri operatori'}.</div>
      <button class="btn primary big" data-act="presok">Ho capito</button></div>`;
    document.body.appendChild(box); setTimeout(() => { const b = box.querySelector('button'); if (b) b.focus(); }, 30);
    DIAG.ev('avviso', `Avviso: sullo stesso viaggio anche ${list.map(d => d.name + (d.ag ? ' (' + agName(d.ag) + ')' : '')).join(', ')}`);
  }
  function closePresAlert() { const x = $('#pres-alert'); if (x) x.remove(); }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-act="presok"]')) closePresAlert(); });
  function payPresenceHTML() {
    if (!UI.pay) return ''; const o = othersHere().filter(d => d.payBk === UI.pay.bkId && d.tripId === UI.pay.tripId); if (!o.length) return '';
    return `<div class="warnbox">Attenzione: anche <b>${o.map(d => esc(d.name)).join(', ')}</b> ha aperto l'incasso di questa prenotazione. Mettetevi d'accordo per non incassare due volte.</div>`;
  }
  // arriva la presenza di un altro computer: si aggiornano solo i due avvisi, senza ridisegnare la pagina
  function onPresence() {
    const t = UI.view === 'trip' && trip(); const box = $('#presence'); if (box && t) box.innerHTML = presenceHTML(t);
    const pb = $('#pay-presence'); if (pb) pb.innerHTML = payPresenceHTML(); presenceCheck();
  }
  function softRender() { if ($('#print-root') && !$('#print-root').hidden) return; render(); }
  // una sola finestra per computer: due finestre aperte si rubano gli aggiornamenti a vicenda
  async function oneWindow() {
    if (!navigator.locks || !navigator.locks.request) return;
    return new Promise(res => {
      navigator.locks.request('viaggi-laterra-app', { ifAvailable: true }, lock => {
        if (lock) { res(); return new Promise(() => {}); }
        $('#app').innerHTML = `<div class="gate"><div class="g-card"><img src="${LOGO}" alt="La Terra" style="height:40px;align-self:center"><h1 class="g-title">Viaggi <span>in Pullman</span></h1><p class="g-sub">L'app è già aperta in un'altra finestra di questo computer. Usa quella, oppure chiudila e premi il pulsante qui sotto.</p><button class="g-btn" id="g-retry">Riprova</button></div></div>`;
        const rb = document.getElementById('g-retry'); if (rb) rb.addEventListener('click', () => location.reload());
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
      offStatus(st);
    };
    { const st = STORE.status(); const local = localStorage.getItem(LOCAL_MODE) === '1' || !st.hasKey; if ((local && !st.linked) || st.pulled) { seedCatalog(); buildAnagrafica(); } }
    render();
    STORE.loop();
    setInterval(() => { presenceBeat(false); onPresence(); }, 30000);
    document.addEventListener('visibilitychange', () => presenceBeat(true));
    setInterval(() => { const st = STORE.status(); DIAG.ev('stato', `Stato: ${st.linked ? (st.error ? 'errore ' + st.error : 'sincronizzato') : 'non collegato'} · ${st.pending} in attesa`, { online: navigator.onLine, ultimaSync: st.last ? st.last.toISOString() : null, pagina: UI.view, memoriaMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : undefined, viaggi: S.trips.length }); }, 10 * 60000);
    if (ACC.me()) ACC.tlog('info', 'Apertura dell\'app');
  })();
})();
