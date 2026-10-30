// ARCHIVIO DI VIAGGI IN PULLMAN
// ==============================
// Qui c'è tutto quello che serve a leggere e salvare i dati: la copia su questo computer (IndexedDB)
// e l'allineamento con gli altri computer (oggi Dropbox). Le schermate (app.js) non parlano mai
// direttamente con Dropbox: chiedono tutto a questo file, attraverso window.VIPARCHIVIO.
// Quando i dati passeranno al server dell'ufficio basterà sostituire questo file con uno che parla
// con il server e offre le stesse funzioni. L'accesso a Dropbox (login) resta in dropbox.js.
//
// FUNZIONI CHE L'APP USA
//   open()                 apre la copia su questo computer; va chiamata una volta all'avvio
//   get(path)              legge un file (es. '/viaggi/<id>.json'); null se non c'è
//   list(prefix)           tutti i file che iniziano con prefix, come coppie [path, dati]
//   put(path, dati)        salva un file su questo computer e lo mette in coda per gli altri computer;
//                          se il file c'è già, unisce le due versioni (vedi mergeFor)
//   mergeTrip(a, b)        unisce due versioni dello stesso viaggio senza perdere righe né posti
//   mergeFor(path)         la regola di unione giusta per quel file
//   putBlob(path, blob)    salva un file non di testo (PDF o foto del programma)
//   getBlob(path)          legge un file non di testo (prima da questo computer, poi da Dropbox)
//   delBlob(path)          toglie un file non di testo
//   status()               stato: linked (collegato), online, offline (manca internet), pending (modifiche
//                          da inviare), syncing, error, last (ultimo allineamento), lastOk (ultimo contatto
//                          riuscito, anche dopo un riavvio), pulled (primo scaricamento fatto), hasKey
//   onStatus = f           f(stato) a ogni cambio di stato
//   onRemote = f           f([path…]) quando arrivano file cambiati da altri computer
//   onMerge = f            f(path, mio, altro, unito) quando una modifica di questo computer non ancora
//                          inviata si unisce con quella di un altro computer (serve al controllo dopo
//                          il ritorno di internet: posti dati due volte, incassi doppi…)
//   loop()                 tiene allineati i dati finché l'app è aperta
//   syncNow()              allinea subito (Impostazioni › Sincronizza)
//   kick()                 allinea tra poco (dopo un salvataggio)
//   pendingList()          elenco dei file non ancora inviati
//   dropUnsynced()         al primo collegamento toglie i dati di prova di questo computer
//   wipe()                 cancella la copia di questo computer e la riscarica (Super Master)
//   sizes(), cursor()      numeri per la diagnostica del Super Master
//   device                 { id, since }: il codice di questo computer
//   ver()                  numero che cresce a ogni modifica (per sapere se ricalcolare)
//   diag = DIAG            dove scrivere la diagnostica (lo imposta l'app all'avvio)
//   rawUpload(path, byte)  scrive un file così com'è (diagnostica del Super Master)
//   rawList(cartella)      elenca tutti i file di una cartella (diagnostica del Super Master)
//   rawDownload(path)      legge un file così com'è: { buf } oppure null
//
(function () {
  'use strict';
  // ---------- archivio: copia su questo computer (IndexedDB) + Dropbox per tenere allineati tutti i computer ----------
  // Cartella dell'app su Dropbox (Applicazioni › Viaggi in Pullman La Terra):
  //   /viaggi/<id>.json                   un file per viaggio (lista, attesa, annullati, bus e posti)
  //   /config/utenti.json                 account, ruoli, agenzie permesse, impronte delle password
  //   /config/impostazioni.json           agenzie e casse, luoghi di partenza, testi WhatsApp
  //   /anagrafica/clienti-00…31.json      anagrafica clienti, divisa in 32 file (ogni cliente sta sempre nello stesso file)
  //   /cassa/aaaa-mm/aaaa-mm-gg_<pc>.json incassi registrati da ogni computer (ognuno scrive solo i suoi)
  //   /cassa/chiusure/aaaa-mm-gg_<ag>.json chiusure di cassa
  //   /programmi/<id-viaggio>/<file>      PDF o foto del programma
  //   /registro/aaaa-mm/aaaa-mm-gg_<pc>.json log tecnico (lo legge solo il Super Master)
  // Due computer che modificano lo stesso file nello stesso momento non si cancellano a vicenda: ogni riga,
  // persona, bus, cliente e utente porta l'ora della sua ultima modifica e vince la più recente.
  window.VIPARCHIVIO = (() => {
    const DBN = 'viaggi-laterra', QK = 'vip-queue-v1', CK = 'vip-cursor-v1', DK = 'vip-device-v1', PK = 'vip-pulled-v1', OK = 'vip-lastok-v1';
    let DIAG = { ev() {} };
    const files = new Map();
    const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
    const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* pieno o bloccato */ } };
    let dirty = new Set(lsGet(QK, []));
    const blobQ = new Set(lsGet(QK + '-b', []));
    let device = lsGet(DK, null);
    if (!device || !device.id) { device = { id: 'pc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), since: new Date().toISOString() }; lsSet(DK, device); }
    const st = { online: navigator.onLine, syncing: false, error: '', last: null, pulled: lsGet(PK, false), lastOk: lsGet(OK, null) };
    // internet manca davvero: il computer dice di essere scollegato, oppure Dropbox non si raggiunge per due volte di fila
    let netFail = 0;
    let db = null, onRemote = () => {}, onStatus = () => {}, onMerge = () => {};
    const mergeSeen = (p, a, b, m) => { try { onMerge(p, a, b, m); } catch (e) { DIAG.ev('errore', 'Controllo dell\'unione non riuscito: ' + (e && e.message)); } };
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
      window.addEventListener('online', () => { st.online = true; netFail = 0; kick(); emit(); });
      window.addEventListener('offline', () => { st.online = false; emit(); });
    }
    const persist = (path) => { const rec = files.get(path); tx('files', 'readwrite', (s) => (rec ? s.put(rec, path) : s.delete(path))).catch(() => {}); };
    const saveQ = () => lsSet(QK, [...dirty]);

    // ---- unione di due versioni dello stesso file ----
    const u = (x) => (x && +x.u) || 0;
    // stessa riga cambiata su due computer: si tiene, campo per campo, la modifica più recente
    function mergeFields(x, y) {
      const base = u(y) > u(x) ? y : x; const out = JSON.parse(JSON.stringify(base)); const uf = {};
      new Set([...Object.keys(x), ...Object.keys(y)]).forEach((f) => {
        if (f === 'u' || f === 'uf' || f === 'by' || f === 'bya') return;
        const tx = (x.uf && +x.uf[f]) || 0, ty = (y.uf && +y.uf[f]) || 0; if (tx || ty) uf[f] = Math.max(tx, ty);
        const src = tx > ty ? x : ty > tx ? y : base;
        if (src[f] === undefined) delete out[f]; else out[f] = JSON.parse(JSON.stringify(src[f]));
      });
      out.uf = uf; out.u = Math.max(u(x), u(y)); return out;
    }
    // posti dei bus: posto per posto vince l'ultima modifica; un posto liberato resta libero
    function mergeSeats(x, y) {
      const gone = Object.assign({}, x.seatGone || {}); Object.keys(y.seatGone || {}).forEach((s) => { gone[s] = Math.max(gone[s] || 0, y.seatGone[s]); });
      const seats = {}; const xs = x.seats || {}, ys = y.seats || {};
      new Set([...Object.keys(xs), ...Object.keys(ys)]).forEach((s) => {
        const a = xs[s], c = ys[s]; const pick = !a ? c : !c ? a : ((+c.u || 0) > (+a.u || 0) ? c : a);
        if (gone[s] && gone[s] >= (+pick.u || 0)) return; seats[s] = JSON.parse(JSON.stringify(pick));
      });
      return { seats, seatGone: gone };
    }
    function mergeList(a, b, gone, key) {
      a = a || []; b = b || [];
      const bm = new Map(b.map((x) => [x.id, x])), am = new Set(a.map((x) => x.id));
      const out = a.map((x) => { const y = bm.get(x.id); if (!y) return x; if (key === 'buses') { const base = u(y) > u(x) ? y : x; return Object.assign(JSON.parse(JSON.stringify(base)), mergeSeats(x, y)); } if ((x.uf || y.uf) && JSON.stringify(x) !== JSON.stringify(y)) return mergeFields(x, y); return u(y) > u(x) ? y : x; });
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
      // una persona messa in due posti diversi da due computer: resta nel posto scelto per ultimo
      const where = new Map(); (out.buses || []).forEach((b) => Object.keys(b.seats || {}).forEach((s) => { const a = b.seats[s]; if (!a || !a.pid) return; const w = where.get(a.pid); if (!w || (+a.u || 0) > w.u) { if (w) delete w.b.seats[w.s]; where.set(a.pid, { b, s, u: +a.u || 0 }); } else delete b.seats[s]; }));
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
    // ---- conflitto risolto: cosa si è unito (solo nomi dei campi e numeri di riga, mai il testo scritto) ----
    const CF_F = { cognome: 'cognome', nome: 'nome', nascita: 'data di nascita', tel: 'contatto', natoA: 'luogo di nascita', part: 'partenza', hotel: 'hotel', cam: 'camera', fila: 'fila', note: 'note', pagato: '€', richiesta: 'data di richiesta', avviso: 'data di avviso', risposta: 'risposta', dataAnn: 'data di annullo', g: 'comitiva', go: 'ordine nella comitiva', list: 'lista del bus', bus: 'lista del bus', solo: 'persona staccata', stacc: 'persona staccata', cid: 'collegamento all\'anagrafica', np: 'numero persone', stato: 'stato', ag: 'agenzia', req: 'richiesta fila' };
    const CF_L = { rows: '', attesa: ' (lista d\'attesa)', annullati: ' (annullati)' };
    const cfJoin = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
    function conflictInfo(path, L, R, M) {
      const det = [];
      try {
        if (!L || !R) return ['il file era stato tolto su Dropbox: rimandata la versione di questo computer'];
        if (path.startsWith('/viaggi/')) {
          const other = (x) => (x && x.by ? x.by : 'l\'altro computer'), mine = (x) => (x && x.by ? x.by + ' (questo computer)' : 'questo computer');
          ['rows', 'attesa', 'annullati'].forEach((k) => {
            const lm = new Map((L[k] || []).map((x) => [x.id, x])), rm = new Map((R[k] || []).map((x) => [x.id, x])), mm = (M[k] || []).map((x) => x.id);
            const pos = (id) => mm.indexOf(id) + 1;
            (R[k] || []).forEach((b) => {
              const a = lm.get(b.id); const n = pos(b.id);
              if (!a) { if (n) det.push(`riga ${n}${CF_L[k]}: aggiunta da ${other(b)}`); return; }
              if (JSON.stringify(a) === JSON.stringify(b)) return;
              const fromR = [], fromL = [];
              new Set([...Object.keys(a), ...Object.keys(b)]).forEach((f) => {
                if (f === 'u' || f === 'uf' || f === 'by' || f === 'bya' || JSON.stringify(a[f]) === JSON.stringify(b[f])) return;
                const ta = (a.uf && +a.uf[f]) || 0, tb = (b.uf && +b.uf[f]) || 0;
                const winR = tb > ta || (tb === ta && u(b) > u(a)); const lab = CF_F[f] || f;
                (winR ? fromR : fromL).includes(lab) || (winR ? fromR : fromL).push(lab);
              });
              const p = []; if (fromR.length) p.push(`${cfJoin(fromR)} di ${other(b)}`); if (fromL.length) p.push(`${cfJoin(fromL)} di ${mine(a)}`);
              if (p.length && n) det.push(`riga ${n}${CF_L[k]}: ${p.join(' + ')}`);
              else if (!n) det.push(`una riga${CF_L[k]} tolta da uno dei due computer`);
            });
            (L[k] || []).forEach((a) => { if (rm.has(a.id)) return; if (mm.includes(a.id)) det.push(`riga ${pos(a.id)}${CF_L[k]}: aggiunta da ${mine(a)}`); else det.push(`una riga${CF_L[k]} tolta dall'altro computer`); });
          });
          (M.buses || []).forEach((bm, i) => {
            const bl = (L.buses || []).find((x) => x.id === bm.id), br = (R.buses || []).find((x) => x.id === bm.id); if (!bl || !br) return;
            const fromR = [], fromL = [];
            new Set([...Object.keys(bl.seats || {}), ...Object.keys(br.seats || {})]).forEach((s) => {
              const a = JSON.stringify((bl.seats || {})[s] || null), c = JSON.stringify((br.seats || {})[s] || null); if (a === c) return;
              (JSON.stringify((bm.seats || {})[s] || null) === c ? fromR : fromL).push(s);
            });
            const lab = (M.buses || []).length > 1 ? `Bus ${i + 1}` : 'bus';
            if (fromR.length) det.push(`posti ${lab} n. ${cfJoin(fromR.slice(0, 12))}${fromR.length > 12 ? '…' : ''}: scelta dell'altro computer`);
            if (fromL.length) det.push(`posti ${lab} n. ${cfJoin(fromL.slice(0, 12))}${fromL.length > 12 ? '…' : ''}: scelta di questo computer`);
          });
          const skip = new Set(['rows', 'attesa', 'annullati', 'buses', 'u', 'tu', 'gone', 'by', 'bya']);
          const keys = [...new Set([...Object.keys(L), ...Object.keys(R)])].filter((f) => !skip.has(f) && JSON.stringify(L[f]) !== JSON.stringify(R[f]));
          if (keys.length) { const tu = (x) => (x && +x.tu) || u(x); det.push(`dati del viaggio (${cfJoin(keys.slice(0, 8))}): tenuta la modifica più recente, di ${tu(R) > tu(L) ? 'l\'altro computer' : 'questo computer'}`); }
        } else if (path.startsWith('/anagrafica/') || path === '/config/utenti.json') {
          const key = path.startsWith('/anagrafica/') ? 'clienti' : 'users', lab = key === 'clienti' ? 'clienti in anagrafica' : 'account';
          const a = L[key] || {}, b = R[key] || {}; let nuovi = 0, diversi = 0;
          Object.keys(b).forEach((id) => { if (!a[id]) nuovi++; else if (JSON.stringify(a[id]) !== JSON.stringify(b[id])) diversi++; });
          if (nuovi) det.push(`${nuovi} ${lab} aggiunti dall'altro computer`);
          if (diversi) det.push(`${diversi} ${lab} cambiati su tutti e due: per ognuno tenuta la modifica più recente`);
        } else if (path.startsWith('/cassa/movimenti/') || path.startsWith('/registro/')) {
          const key = path.startsWith('/cassa/') ? 'movs' : 'ev', lab = key === 'movs' ? 'movimenti di cassa' : 'righe del registro';
          const ids = new Set((L[key] || []).map((x) => x.id)); const n = (R[key] || []).filter((x) => !ids.has(x.id)).length;
          det.push(`${n} ${lab} dell'altro computer aggiunti, tenuti anche quelli di questo computer`);
        } else det.push(`tenuta la versione più recente, di ${u(R) > u(L) ? 'l\'altro computer' : 'questo computer'}`);
      } catch (e) { det.push('unione fatta (dettaglio non disponibile)'); }
      return det.length ? det : ['stesso contenuto su tutti e due i computer: nessuna differenza da unire'];
    }
    function mergeFor(path) {
      if (path.startsWith('/viaggi/')) return mergeTrip;
      if (path === '/config/utenti.json') return mergeMap('users');
      if (path.startsWith('/anagrafica/')) return mergeMap('clienti');
      if (path.startsWith('/controlli/')) return mergeMap('casi');
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
      const now = Date.now(); if (!path.startsWith('/presenza/') && (!putSeen[path] || now - putSeen[path] > 15000)) { putSeen[path] = now; DIAG.ev('salva', 'Salvato ' + path, { inAttesa: dirty.size }); }
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
          if (dirty.has(p) && loc) { const m = mergeFor(p)(loc.data, remote); files.set(p, { rev: r.meta.rev || en.rev, data: m }); mergeSeen(p, loc.data, remote, m); DIAG.ev('sync-unione', 'Unito con le modifiche di un altro computer: ' + p); }
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
            const r = await D.download(p);
            if (!r) { DIAG.ev('sync-conflitto', `Conflitto risolto automaticamente · ${p}: il file era stato tolto su Dropbox, rimando la versione di questo computer`, { file: p }); rec.rev = null; continue; }
            let remote = null; try { remote = JSON.parse(dec.decode(r.buf)); } catch (x) { remote = null; }
            const mine = files.get(p).data;
            const merged = remote ? mergeFor(p)(mine, remote) : mine;
            const det = remote ? conflictInfo(p, mine, remote, merged) : ['il file su Dropbox era illeggibile: tenuta la versione di questo computer'];
            const what = p.startsWith('/viaggi/') && merged && merged.nome ? `${merged.nome}${merged.data ? ' (' + merged.data + ')' : ''}` : p;
            DIAG.ev('sync-conflitto', `Conflitto risolto automaticamente · ${what}: ${det.slice(0, 6).join(' · ')}${det.length > 6 ? ` · e altre ${det.length - 6}` : ''}`, { file: p, tentativo: tryN + 1, dettagli: det.slice(0, 25) });
            if (remote) mergeSeen(p, mine, remote, merged);
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
          st.error = ''; st.last = new Date(); netFail = 0; st.lastOk = Date.now(); lsSet(OK, st.lastOk);
        } catch (e) {
          st.error = e && e.code ? e.code : 'errore';
          if (e && e.code === 'network') { netFail++; e.vipCounted = true; } else netFail = 0;
          DIAG.ev('sync-errore', 'Sincronizzazione interrotta: ' + st.error, { code: e && e.code, status: e && e.status, summary: e && e.summary, msg: e && e.message, tentativiSenzaRete: netFail });
          // senza internet il registro segna solo il primo tentativo fallito, non tutti quelli dopo
          if (window.ACC && netFail <= 1) ACC.tlog('errore', 'Sincronizzazione Dropbox: ' + (e && (e.code + (e.status ? ' ' + e.status : '')) || e));
          throw e;
        }
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
        } catch (e) {
          if (e && e.code === 'network' && !e.vipCounted) { netFail++; emit(); }
          DIAG.ev('sync', `Nuovo tentativo tra ${Math.round(wait / 1000)} s`); await sleep(wait);
          // senza internet si riprova più spesso, così ci si accorge presto che la linea è tornata
          wait = Math.min(netFail ? 20000 : 60000, wait * 2);
        }
      }
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    function emit() { try { onStatus(status()); } catch (e) { /* niente */ } }
    function status() { return Object.assign({ linked: linked(), pending: dirty.size + blobQ.size, hasKey: !!(DBX() && DBX().hasKey()), offline: !st.online || netFail >= 2 }, st); }

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
      mergeTrip, mergeFor, set onRemote(f) { onRemote = f; }, set onStatus(f) { onStatus = f; }, set onMerge(f) { onMerge = f; },
      set diag(d) { DIAG = d || { ev() {} }; },
      // per la diagnostica del Super Master: file scritti e letti così come sono
      async rawUpload(path, bytes) { if (!linked()) throw { code: 'no_auth' }; return DBX().upload(path, bytes, 'overwrite'); },
      async rawList(folder) { if (!linked()) throw { code: 'no_auth' }; const out = []; let res = await DBX().listFolder(folder); while (res) { out.push(...(res.entries || [])); if (!res.has_more) break; res = await DBX().listFolder(null, res.cursor); } return out; },
      async rawDownload(path) { if (!linked()) throw { code: 'no_auth' }; return DBX().download(path); },
      // per le prove: svuota la copia locale
      async wipe() { DIAG.ev('sync', 'Copia di questo computer cancellata: la riscarico da Dropbox'); files.clear(); dirty.clear(); blobQ.clear(); saveQ(); lsSet(CK, null); lsSet(PK, null); st.pulled = false; await tx('files', 'readwrite', (s) => s.clear()); await tx('blobs', 'readwrite', (s) => s.clear()); }
    };
  })();
})();
