VIAGGI IN PULLMAN · LA TERRA
============================

Versione: 1.9.1
Pacchetto creato il: 29/10/2026

Come installarla o aggiornarla: vedi LEGGIMI.txt.
Aggiornamento: carica su GitHub TUTTI i file, config.js compreso (contiene già la chiave di Dropbox).

MODIFICHE
---------

VERSIONE 1.9.1 · 29/10/2026
SICUREZZA
- Due o più operatori sullo stesso viaggio: appena qualcuno entra nella stessa lista o nella stessa
  piantina, a TUTTI compare una finestra grande al centro dello schermo con il nome dell'operatore,
  l'agenzia da cui lavora e dove si trova (lista prenotazioni, piantina di quale bus, incasso).
  Dopo «Ho capito» resta una fascia arancione in alto finché l'altro non esce dal viaggio.
LISTE
- Con due o più bus c'è una lista per ogni bus («Lista Bus 1», «Lista Bus 2»…), ognuna numerata da 1,
  con quante persone ci sono e quante hanno il posto. Chi non è su nessun bus va in «Senza bus».
  Aggiungendo il secondo bus, tutta la lista attuale diventa la «Lista Bus 1».
  Viaggi che avevano già due bus: ognuno trova le sue persone nella lista del suo bus; chi non era
  ancora su un bus è nella lista «Senza bus». Le comitive divise tra due bus restano unite.
- Durante il trascinamento compare in basso una barra con le liste (Bus 1, Bus 2, Senza bus):
  si lascia lì senza dover scorrere la pagina fino alla lista giusta.
- Spostare persone da una lista all'altra:
  · trascinando ⠿ sulla lista di destinazione (dalla prima riga si sposta tutta la prenotazione);
  · selezionando le righe (⌘ + clic sul numero, Maiusc + clic per un intervallo, doppio clic per tutta
    la prenotazione) e poi con la barra che compare in basso, con il tasto destro o trascinandole insieme;
  · dal menu della riga («Sposta in Bus 2»).
  Chi cambia lista perde il posto sul vecchio bus; il nuovo posto si sceglie sulla piantina.
  Se si sposta da solo un membro di una comitiva, resta nella sua comitiva (pagamento e cartelli).
- Stampa lista: con più bus stampa una tabella per ogni bus.
- Menu della riga (tendina) rifatto: diviso in sezioni con icone, «Non parte più» raccolto in una voce
  sola, cliente abituale e saldato come interruttori. Si apre anche con il tasto destro.
PAGAMENTI
- Comitive: ogni persona può pagare la sua quota. Ogni riga della comitiva ha il suo pulsante «€»;
  nel riquadro dell'incasso «Chi paga» permette di scegliere tutta la comitiva o una sola persona.
  Lo scontrino o la fattura sono a nome di quella persona; il capogruppo paga solo per chi non paga
  da sé. Lo storno e il file per Danea tengono conto del pagamento individuale.
GESTI
- Nuova sezione Impostazioni › Gesti e scorciatoie, personale per ogni operatore: cosa fanno clic,
  doppio clic, ⌘ + clic, Maiusc + clic, ⌥ + clic sul numero della riga e il tasto destro, e le
  combinazioni di tasti (iniziali: ⌃⌥→ / ⌃⌥← sposta la selezione nella lista del bus dopo/prima,
  ⌃⌥S seleziona la riga, ⌃⌥A tutta la prenotazione, ⌃⌥E incasso, ⌃⌥M menu, ⌃⌥↓ / ⌃⌥↑ riga sotto/sopra,
  ⌃⌥P mostra sulla piantina). Esc toglie la selezione.

VERSIONE 1.9 · 28/10/2026
- Elenco dei viaggi impaginato in colonne, tutto allineato a sinistra e in ordine (grafica «calendario»):
  la data è un foglietto da calendario del colore del tipo di viaggio, con il giorno grande e sotto
  mese e anno (per i tour «3–6 Gennaio 2027»); poi il giorno della settimana
  (DOM, per i tour SAB–MAR), codice, titolo; sotto il titolo, in piccolo, i giorni del tour,
  l'hotel e «già fatta». A destra restano i bus e i pulsanti Lista e Posti.
- Tolte le intestazioni dei mesi con il numero dei viaggi («gennaio 2027 · 5 gite · 1 tour»):
  la barra dei mesi in alto porta comunque al mese scelto.
- Il tipo di viaggio si riconosce dal colore del foglietto della data (passando sopra con il mouse compare il nome).
- Tutte le pagine usano l'intera larghezza dello schermo del Mac, senza bordi vuoti ai lati.

VERSIONE 1.8 · 28/10/2026
- Pagina Viaggi: l'anno si sceglie da una tendina (senza i numeri accanto).
- Colori dei tipi di viaggio: Gite giallo chiaro, Tour verde chiaro, Eventi azzurro (Biglietteria lilla).
  I colori si vedono nei filtri, in tutte le righe dell'elenco dei viaggi e nella pagina del viaggio,
  così il tipo si riconosce a colpo d'occhio. Tolti i numeri accanto ai filtri.
- Barra dei mesi: solo il nome del mese, senza il numero dei viaggi.
- Elenco dei viaggi: tolto il riquadro giallo «persone · senza posto».
- Gita, tour o evento nuovo: parte già con un bus da 52 posti (si cambia da «Posti sul bus»).
- Lavoro in contemporanea sulla stessa prenotazione:
  · ogni campo di una riga ricorda quando è stato cambiato: se un operatore cambia il telefono e un
    altro la nota della stessa riga, restano tutte e due le modifiche (prima vinceva tutta la riga
    dell'ultimo che salvava);
  · posti sul bus: ogni posto ricorda quando è stato cambiato e i posti liberati restano liberi; due
    operatori che sistemano persone diverse sullo stesso bus non si cancellano a vicenda; se la stessa
    persona viene messa in due posti diversi, resta nel posto scelto per ultimo;
  · in alto nella lista compare chi altro la sta guardando in quel momento (e se sta incassando);
  · nel riquadro dell'incasso un avviso se un altro operatore ha aperto l'incasso della stessa
    prenotazione, per non incassare due volte;
  · le righe appena cambiate da un altro operatore si illuminano per qualche secondo e, passandoci
    sopra, dicono chi le ha cambiate.

VERSIONE 1.7 · 28/10/2026
- Lista dei tour: la colonna «hotel» è una tendina con Singola, Matrimoniale, Tripla, Quadrupla,
  Matrimoniale + lettino (le scritte delle liste Word come «matrim» o «singola» vengono riconosciute).
  In «Matrimoniale + lettino» la terza persona è il bambino nel lettino.
- Lista dei tour: l'ultima colonna ha il simbolo «€» (prima «P»).
- Rooming list rifatta: camere raggruppate per tipo (singole, doppie, matrimoniali, matrimoniali +
  lettino, triple, quadruple) con numero di camera e ospiti; l'età solo per i bambini; nelle note per
  l'hotel restano solo le cose utili (cibo, allergie, richieste) e spariscono pagamenti, bonifici,
  telefoni, email e richieste sui posti del pullman; tolti i trattini finali dai nomi.
- Nuova tabella «Staff in hotel» nella lista dei tour (accompagnatore, autista… con la loro camera):
  finiscono in fondo alla rooming list. Importando la lista Word si riempie da sola con le righe
  «accompagnatore» e «autista».
- Biglietteria eventi: al posto delle tre tabelle «Non partono più» c'è una sola sezione «Vuole vendere
  il biglietto» (dal menu del numero di riga: «Vuole vendere il biglietto»).

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
