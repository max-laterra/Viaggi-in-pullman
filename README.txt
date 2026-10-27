VIAGGI IN PULLMAN · LA TERRA
============================

Versione: 1.2.1
Pacchetto creato il: 27/10/2026

Come installarla o aggiornarla: vedi LEGGIMI.txt.
Aggiornamento: carica su GitHub TUTTI i file, config.js compreso (contiene già la chiave di Dropbox).

MODIFICHE
---------

VERSIONE 1.2.1 · 27/10/2026
- La chiave dell'app Dropbox è già scritta nel config.js del pacchetto: negli aggiornamenti si caricano
  tutti i file, config.js compreso, e la chiave non si perde più.
- In più ogni computer si ricorda la chiave: se per errore arriva online un config.js vuoto, i computer
  già collegati continuano a sincronizzare.

VERSIONE 1.2 · 27/10/2026
- Super Master › «Diagnostica completa»: ogni computer annota tutto quello che succede nell'app
  (avvio, accessi, pagine aperte, pulsanti premuti, campi modificati, salvataggi, sincronizzazione
  con Dropbox, conflitti tra computer, errori del programma, problemi di rete, rallentamenti,
  messaggi mostrati). Gli eventi restano 21 giorni su ogni computer e ogni 10 minuti vengono copiati
  su Dropbox nella cartella «diagnostica».
- Pulsante «Scarica la diagnostica completa»: uno zip con eventi.csv (da aprire con Excel),
  riepilogo.txt (versione, stato della sincronizzazione, ultimi errori, account), registro.csv e gli
  eventi grezzi di ogni computer. Si sceglie il periodo (oggi … 21 giorni) e se includere gli altri computer.
- Nella diagnostica non finiscono mai password, chiavi di Dropbox o WhatsApp, né il testo scritto nei campi.
- Ogni pacchetto contiene questo README con la versione e le modifiche.
- Posti sul bus: ora si riconosce anche l'abbreviazione «lato corr» (corridoio) e «finestr…» nelle richieste.

VERSIONE 1.1 · 27/10/2026
- Nuovo tipo di viaggio «Biglietteria» (biglietti di eventi senza pullman), in viola.
  In testa alla lista: prezzo intero, ridotto, diritti e circuito. Prezzi del biglietto anche negli Eventi.
- Il «€» della lista è un pulsante: apre a destra il riquadro «Incasso e documento» con i campi del
  foglio CASSA (categoria, righe con quantità, € bus, € biglietto, supplemento fila, diritti, circuito,
  emissione, metodo anche misto, pratica, canale, pagante, dati per la fattura).
- Pulsante «Scontrino» per gite, eventi e biglietteria; «Fattura» per i tour. Nello scontrino va solo
  la parte agenzia. Stampante non ancora collegata: il documento resta «da emettere».
- Contabilità › «Resoconto giornaliero» come il foglio CASSA, con «Scarica per Excel» nelle stesse 43 colonne.
- Cassa: pulsanti «Prelievo» e «Apporto»; conto dei contanti dall'inizio alla fine della giornata.
- Impostazioni: sigla degli operatori (colonna «Op.») e fondo cassa iniziale di ogni agenzia.
- Orari dei movimenti mostrati nell'ora italiana; la lista stampata riporta anche gli incassi fatti nell'app.

VERSIONE 1.0 · 26/10/2026
- Prima versione dell'app «Viaggi in Pullman»: sincronizzazione tra computer con Dropbox, account
  operatori, Master, Contabilità e Super Master, agenzie Ragusa, Modica e Marina di Ragusa con la loro
  cassa, anagrafica clienti, incassi con POS, bonifico, contanti, PostePay o misti, chiusura di cassa,
  pagina Contabilità, viaggi ed eventi dell'elenco 2027, messaggio WhatsApp con link Google Maps.
