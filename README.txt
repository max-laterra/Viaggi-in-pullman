VIAGGI IN PULLMAN · LA TERRA
============================

Versione: 1.6
Pacchetto creato il: 28/10/2026

Come installarla o aggiornarla: vedi LEGGIMI.txt.
Aggiornamento: carica su GitHub TUTTI i file, config.js compreso (contiene già la chiave di Dropbox).

MODIFICHE
---------

VERSIONE 1.6 · 28/10/2026
- Pagamento misto più semplice (pulsante «Misto (es. contanti + POS)»): con contanti e POS basta
  scrivere uno dei due importi, l'altro si riempie da solo con quello che manca. Il pulsante «resto»
  accanto a ogni metodo ci mette la differenza. Sotto si vede la somma e se torna con l'importo.
  Gli altri metodi (bonifico, PostePay, buono…) sono in «Altri metodi». Se l'importo è vuoto, diventa
  la somma dei metodi. Nel resoconto, nella chiusura di cassa e nel file per Excel ogni metodo
  resta separato.
- Lo zip ha la versione nel nome (es. viaggi-in-pullman-1.6.zip).

VERSIONE 1.5 · 28/10/2026
- Fatture dei tour: pulsante «Apri in Danea». L'app scarica la fattura in formato Easyfatt-Xml
  (cliente con codice fiscale o partita IVA, codice SDI o PEC, indirizzo, righe del viaggio,
  supplementi, acconti già pagati e saldo da pagare). Con un doppio clic sul file si apre Danea con la
  fattura pronta: si preme «Importa», si controlla e si invia come fattura elettronica.
  In alternativa, in Danea: Documenti › Utilità › Importa documenti Easyfatt-Xml.
- Contabilità › Resoconto giornaliero: «Fatture del giorno per Danea» prepara un solo file con tutte.
- Le fatture già preparate per Danea si riconoscono («preparata per Danea»).
- Impostazioni › Danea Easyfatt: codice IVA dei viaggi (74ter) e tipo di pagamento per ogni metodo,
  scritti come nelle tabelle di Danea.
- Viaggio: nuovo campo «Codice prodotto Danea» (in Modifica gita), così la riga della fattura si
  collega al prodotto giusto in Danea.

VERSIONE 1.4 · 28/10/2026
- Lista: la colonna «€» è l'ultima a destra (dopo «posto»).
- Partenze in testa alla lista: si scelgono dai luoghi di Impostazioni › Luoghi di partenza, con l'ora
  (fino a 6 partenze). Nella lista, la colonna «part» è una tendina con le partenze del viaggio, cliente
  per cliente (se il viaggio non ha partenze, propone tutti i luoghi).
- Tour: il documento è sempre la Fattura (niente scelta Scontrino/Caparra). Tolta la tendina «Categoria»
  dal riquadro dell'incasso: la categoria si mette da sola in base al tipo di viaggio.
- Dati per la fattura più completi: cognome, nome, sesso, data e luogo di nascita (presi dall'anagrafica
  o dalla lista se ci sono). Il codice fiscale si calcola da solo (comuni italiani, anche soppressi, e
  stati esteri); un codice scritto a mano viene controllato. Alla registrazione i dati si salvano
  nella scheda del cliente. In rari casi (omocodia) il codice vero è diverso: fa fede la tessera sanitaria.
- Anagrafica: nuovo campo «Sesso».
- Corretto: l'animazione «Ciao …» all'accesso ripartiva due volte.
- Corretto: cliccando un cliente suggerito dall'anagrafica la riga non si compilava (bisognava usare
  la tastiera). Ora basta un clic.

VERSIONE 1.3.1 · 27/10/2026
- Importazione clienti: nell'anteprima le date di nascita si vedono già giuste (es. 20/06/75) anche
  quando Excel le salva come numero (27565), e i cellulari senza spazi.
- Anagrafica molto grande (decine di migliaia di clienti): ora è divisa in 32 file su Dropbox, così
  modificare un cliente invia solo una piccola parte dell'anagrafica e non tutta. Il passaggio dal
  vecchio file unico avviene da solo alla prima apertura, senza perdere clienti.
- Ricerca, suggerimenti mentre scrivi nella lista e importazione molto più veloci con tanti clienti.

VERSIONE 1.3 · 27/10/2026
- Biglietteria eventi (senza bus): nel riquadro «Incasso e documento» non ci sono più la colonna
  «€ bus», la riga «Bus» nei totali e il supplemento fila. Restano biglietto, diritti e circuito.
- Il documento «Fattura» si sceglie solo nei tour: in gite giornaliere, eventi e biglietteria restano
  Scontrino, Caparra e Senza documento.
- Anagrafica: pulsante «Importa da Word o Excel» (file .xlsx, .docx con tabella, .csv). L'app riconosce
  da sola le colonne (cognome, nome, data di nascita, cellulare, email, indirizzo, città, codice fiscale…),
  mostra l'anteprima e si può correggere ogni colonna prima di importare. I clienti già presenti si
  completano senza cambiare i dati che ci sono già; le righe ripetute nel file contano una volta sola.
- Scheda cliente: nuovi campi CAP, Città, Codice fiscale / P. IVA e Codice SDI o PEC (servono per le fatture).

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
