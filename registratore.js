/* Viaggi in Pullman · La Terra
 * COLLEGAMENTO AL REGISTRATORE TELEMATICO (Custom Q3X-F)
 *
 * In questo file c'è soltanto la parte del registratore: una sola funzione, «emetti scontrino».
 * Riceve il movimento di cassa e ciò che deve andare sullo scontrino, e restituisce l'esito.
 *
 * VERSIONE ATTUALE: NON COLLEGATA. Non manda nulla al registratore e risponde sempre
 * «registratore non ancora collegato»: lo scontrino resta «da emettere», come prima.
 * Più avanti l'app per Mac sostituirà questo file con il collegamento vero (protocollo XML Custom).
 *
 * Dati che riceve:
 *   mov  = il movimento di cassa (id, cliente, importi, pagamenti, agenzia...)
 *   ctx  = { agenzia: { id, nome, rtIp, rtMatricola },
 *            scontrino: { righe: [{ desc, q, prezzo, reparto, iva }], pagamenti: [{ metodo, n, d, importo }], totale } }
 *   desc = descrizione già pronta come sullo scontrino dell'agenzia («gita randazzo e floresta 08/11/26»),
 *          al massimo 38 caratteri; iva = 'NI', 'ES', 'NS' oppure l'aliquota ('22', '10'...) del reparto.
 * Esito da restituire:
 *   { ok: true/false, msg: 'testo', chiusura: '0012', numero: '0012-0034', dataOra: '2026-10-29T16:30:00', matricola: '...' }
 */
(function () {
  'use strict';
  async function emettiScontrino(mov, ctx) {
    return { ok: false, msg: 'registratore non ancora collegato' };
  }
  window.VIP_REGISTRATORE = { emettiScontrino: emettiScontrino };
})();
