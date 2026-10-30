VIAGGI IN PULLMAN · LA TERRA
============================

Versione: 2.1.4
Pacchetto creato il: 30/10/2026

Come installarla o aggiornarla: vedi LEGGIMI.txt.
Aggiornamento: carica su GitHub TUTTI i file, config.js compreso (contiene già la chiave di Dropbox).

MODIFICHE
---------

VERSIONE 2.1.4 · 30/10/2026
LAVORO SENZA INTERNET E ARCHIVIO IN UN FILE SEPARATO
Per chi usa l'app cambia solo l'avviso quando manca internet: tutto il resto funziona come prima.

A. Quando manca internet
1. Appena cade la linea compare la finestra «Stai lavorando senza internet» con chi era collegato
   negli ultimi 2 minuti prima: nome, agenzia, cosa stava facendo (lista, piantina o incasso di quale
   viaggio) e telefono. Prima chi era sullo stesso viaggio. Se non c'era nessuno:
   «Nessun altro operatore era collegato». Pulsante «Ho capito».
2. Dopo «Ho capito» resta in alto una fascia rossa: «Senza internet · N modifiche da inviare ·
   Collegati prima: nome (agenzia, telefono)…», finché la linea non torna.
3. Senza internet, la prima volta su ogni viaggio che si mette o sposta una persona sulla piantina,
   si scrive una prenotazione nuova nella lista (anche da lista d'attesa, annullati o Word) o si
   registra un incasso, l'app chiede «Sei senza internet: hai sentito al telefono …?» con
   «Sì, ci siamo sentiti» e «Annulla». Ora, viaggio e risposta vanno nel registro del Super Master.
4. Telefoni: Impostazioni › Agenzie e casse › «Telefono dell'agenzia» (il telefono dei messaggi
   WhatsApp resta com'è); Impostazioni › Operatori e permessi › colonna «Cellulare» (facoltativa,
   si mostra al posto del telefono dell'agenzia; si può scrivere anche quando si crea l'account).
5. Quando internet torna: avviso verde «Internet tornato: invio N modifiche…», poi «Tutto
   sincronizzato». La fascia rossa sparisce.
   L'app si accorge che manca internet anche quando il computer risulta collegato ma Dropbox non
   risponde per due volte di fila; senza linea riprova ogni 20 secondi al massimo.

B. Controllo dopo il ritorno di internet
1. Al ritorno della linea l'app confronta le modifiche fatte senza internet con quelle arrivate
   dagli altri computer nello stesso periodo, prima dell'unione, e cerca:
   · stesso posto dello stesso bus dato a due persone diverse;
   · bus con più persone che posti;
   · prenotazione incassata due volte (pagato più del dovuto).
2. Se trova qualcosa compare la finestra «Da controllare dopo il ritorno di internet»: per ogni caso
   viaggio, bus, posto o prenotazione, chi ha fatto cosa, da quale agenzia e a che ora, con
   «Apri la piantina» o «Apri la prenotazione».
3. L'app non cambia nulla da sola. I casi restano in un riquadro rosso nella pagina del viaggio e in
   Contabilità finché qualcuno non preme «Risolto». Tutto va nel registro del Super Master.
   (Da questa versione ogni posto e ogni riga ricordano anche l'agenzia di chi li ha cambiati.)

C. Archivio in un file separato (preparazione al server dell'ufficio)
1. Lettura, salvataggio e allineamento con gli altri computer sono passati da app.js al nuovo file
   archivio.js, senza cambiare il comportamento. In cima al file c'è l'elenco delle funzioni che
   l'app usa e cosa fa ognuna.
2. Anche la diagnostica del Super Master ora passa da archivio.js (prima parlava direttamente con
   Dropbox). Il registro tecnico ci passava già. L'accesso a Dropbox (login) resta in dropbox.js.
3. Più avanti basterà sostituire archivio.js con una versione che parla con il nostro server.
   ATTENZIONE: nel caricamento su GitHub c'è un file in più, archivio.js: caricate tutto il contenuto.

D. Correzioni grafiche trovate durante le prove
1. Lista prenotazioni: sugli schermi più stretti (e con la piantina accanto) le colonne cognome e
   nome si stringevano fino quasi a sparire e la colonna «note / mail» spariva del tutto. Ora hanno
   una larghezza minima; se lo spazio non basta, la lista scorre di lato dentro il suo riquadro.
2. Riquadri in testa alla lista (Quote e pagamenti, Date e hotel): «Saldo entro il» usciva dal
   riquadro e finiva sopra la riga di separazione. Ora i campi vanno a capo.

VERSIONE 2.1.3 · 30/10/2026
SCONTRINI COME QUELLI DELL'AGENZIA
1. Riga della gita come sullo scontrino del registratore: «gita randazzo e floresta 08/11/26»,
   in minuscolo, con quantità × prezzo (es. 2x72,00). Se il nome è troppo lungo per il registratore
   (38 caratteri, da verificare con il manuale Custom) si accorcia il nome e la data resta in fondo.
   Le quote ridotte hanno la loro riga: «gita randazzo e floresta ridotto 08/11/26  1x50,00».
2. Supplemento fila e diritti di prevendita su righe separate sotto la gita:
   «supplemento fila 2x4,00» (se tutti hanno lo stesso supplemento, altrimenti 1x il totale),
   «diritti di prevendita 2x2,00».
3. Gite: niente acconti. Se si sceglie «Scontrino» e l'importo è più basso del dovuto, l'app avvisa
   e non registra: si incassa tutto oppure si sceglie «Senza documento».
4. Anteprima dello scontrino nel riquadro dell'incasso, con l'impostazione dello scontrino vero:
   intestazione, DOCUMENTO COMMERCIALE, righe, TOTALE COMPLESSIVO, DI CUI IVA, PAGAMENTO CONTANTE /
   ELETTRONICO, IMPORTO PAGATO, «I: *NI Non imponibile», data e ora, matricola RT.
   È segnata «ANTEPRIMA · non è un documento fiscale»: lo scontrino vero lo stampa il registratore.
5. Impostazioni › Registratore telematico, due riquadri nuovi:
   · IVA dei reparti (quota viaggio, supplemento fila, diritti): di base «NI · Non imponibile»;
   · Intestazione dello scontrino per ogni agenzia (Ragusa già compilata con i dati dello scontrino).
Le fatture dei tour, la biglietteria e tutto il resto restano come prima.
L'app continua a NON mandare nulla al registratore: gli scontrini restano «da emettere».

VERSIONE 2.1.2 · 30/10/2026
DIAGNOSTICA: CONFLITTI RISOLTI AUTOMATICAMENTE
Quando due computer modificano nello stesso momento lo stesso file (es. la lista di un viaggio),
l'app unisce da sola le due versioni. Prima nella diagnostica compariva come «ERRORE rete … 409»;
ora compare (solo nella diagnostica del Super Master) come «Conflitto risolto automaticamente»
con cosa si è risolto, per esempio:
   «Conflitto risolto automaticamente · Coldplay (2026-11-28): riga 12: contatto e note di Martina
    + nome di Andrea (questo computer) · posti Bus 1 n. 5 e 6: scelta dell'altro computer»
   · liste dei viaggi: per ogni riga quali campi vengono dall'altro computer e quali da questo,
     righe aggiunte o tolte, posti dei bus, dati del viaggio;
   · anagrafica e account: quanti aggiunti e quanti uniti;
   · cassa e registro: quanti movimenti/righe dell'altro computer sono stati aggiunti.
Si scrivono solo i nomi dei campi e i numeri di riga, mai il testo scritto dagli operatori.
La risposta 409 di Dropbox nell'invio ora è una riga normale «Rete», non più un ERRORE.
Tutto il resto (anche gli errori di connessione) resta com'era.

VERSIONE 2.1.1 · 29/10/2026
LISTE, SUPPLEMENTI FILE E ANAGRAFICA
1. Anagrafica nelle liste: la riga NON si compila più da sola (né con Maiusc/Shift, né con Invio,
   né con Tab). Mentre scrivi il cognome compaiono i suggerimenti «Già in anagrafica», ma nessuno è
   scelto: per compilare la riga dall'anagrafica premi ↓ e poi Invio, oppure fai clic sul nome.
   Se non ti serve continua a scrivere: la riga resta come l'hai scritta tu.
2. Supplementi file con prezzario fisso: Impostazioni › nuova sezione «Supplementi file».
   Valgono solo per i tour e le gite in giornata (non per biglietteria e solo bus). Prezzi di partenza:
   · Tour (al giorno, a persona): 1ª fila 8 €, 2ª fila 6 €, 3ª fila 4 €, 4ª fila 2 €,
     1ª fila della 2ª porta 6 €. Nel tour il prezzo si moltiplica per i giorni del viaggio.
   · Gite in giornata (a persona): 1ª fila 4 €, 2ª fila 3 €, 3ª fila 2 €, 4ª fila 1 €,
     1ª fila della 2ª porta 3 €.
   I prezzi si possono cambiare e salvare. Tolti i riquadri dei supplementi sotto la lista.
3. Nuovo menu della fila (clic sulla casella «fila»): per ogni fila il supplemento (nel tour anche il
   calcolo, es. «+32 € (8 € × 4 giorni)»), pulsanti «Qualsiasi», «Sx», «Dx» con i posti ancora liberi
   in verde. Le file esaurite non compaiono (sono riassunte in «Esaurite: …»). Le richieste senza
   supplemento sono in una parte a scomparsa «Richieste senza supplemento». C'è anche «Togli la fila».
4. Liste più ordinate: colonne a larghezza fissa e regolare, righe più compatte, date sempre intere
   (anche nella testa della lista), niente spazio sprecato.
5. Nuova colonna «quota» tra «posto» e «€»: mostra quanto paga il cliente di quella riga
   (quota + eventuale supplemento fila, con la scritta arancione FILA quando c'è).

VERSIONE 2.1 · 29/10/2026
PREPARAZIONE ALLO SCONTRINO DIRETTO (senza Danea)
In questa versione si prepara tutto, ma NON si manda nulla al registratore: lo scontrino resta
«da emettere» come prima. Per chi lavora al banco non cambia niente.
1. File separato registratore.js: contiene solo la funzione «emetti scontrino», che riceve il
   movimento e restituisce l'esito. Per ora risponde sempre «registratore non ancora collegato».
   Più avanti l'app per Mac lo sostituirà con il collegamento vero (protocollo XML Custom).
2. Impostazioni › Agenzie e casse: per ogni agenzia «Indirizzo del registratore telematico»
   (es. 192.168.1.50) e «Matricola del registratore» (facoltativa). Vuoti di partenza.
3. Impostazioni › nuova sezione «Registratore telematico» (solo Master):
   · tabella dei pagamenti: per ogni metodo dell'app (Contanti, POS, Bonifico, PostePay, PayPal,
     Assegno, Buono regalo, Voucher) numero e descrizione del pagamento sul registratore, con la nota
     «Bonifico, PayPal, Buono regalo e Voucher: da verificare con il commercialista»;
   · tabella dei reparti: numero del reparto per quota viaggio/bus, supplemento fila e diritti,
     per tutte le categorie e, se serve, diverso per categoria (Gita, SoloBus, BusEdiritti…);
   · interruttore «File Danea degli scontrini» (spento di partenza).
   Tutti i campi sono vuoti: si compilano dopo gli scontrini di prova e la stampa della
   programmazione del tecnico.
4. Riquadro dell'incasso, solo per «Scontrino»: il riquadro «Cosa andrà sul registratore» mostra
   righe (parte agenzia: quota/bus, supplemento fila, diritti), quantità, prezzo, reparto e tipo di
   pagamento. Se si incassa solo una parte (acconto, o saldo di quanto pagato prima) c'è una riga sola
   «Pagamento parziale» con l'importo della parte agenzia incassato adesso.
   Se manca un abbinamento compare un avviso arancione (es. «Reparto dei diritti non impostato»).
5. Movimenti con scontrino: nuovi campi per la risposta del registratore (numero di chiusura,
   numero del documento es. 0012-0034, data e ora, matricola, esito). Quando ci sono si vedono negli
   incassi della prenotazione e nel resoconto giornaliero. Lo storno di uno scontrino conserva il
   riferimento allo scontrino originale. Per ora restano vuoti (l'esito dice «non ancora collegato»).
6. Contabilità › Resoconto giornaliero: pulsante «Scontrini del giorno per Danea» (accanto a «Fatture
   del giorno per Danea»), visibile solo con l'interruttore acceso. Crea un file Easyfatt-Xml con gli
   scontrini del giorno come «Vendita al banco» (DocumentType B): uno per scontrino, con cliente,
   righe della parte agenzia e metodo di pagamento. Gli scontrini stornati non entrano nel file e
   compaiono in un avviso, da sistemare a mano in Danea. Dopo il download ogni scontrino è segnato
   «preparato per Danea». Da accendere solo dopo la prova di importazione in Danea.
7. Registro del Super Master: ogni tentativo di emettere uno scontrino (con l'esito) e ogni file
   Danea degli scontrini creato.

VERSIONE 2.0.2 · 29/10/2026
ELENCO DEI VIAGGI
- Controllo apposta della scritta «EXTRA»: non tocca mai il riquadro colorato, il nome dell'hotel,
  le iconcine (compreso il bus) e i contatori. Provato in automatico su schermi larghi 1920, 1728,
  1512, 1440, 1366, 1280 e 1100 punti, anche con nomi d'hotel lunghissimi e viaggi con 3 bus.
- Contatori dei posti liberi con più bus: compatti su una riga sola («liberi B1 19 B2 51 B3 51»),
  così la riga non diventa più alta; passando sopra si legge il dettaglio di ogni bus. La loro
  colonna è larga quanto serve, quindi non si avvicinano mai alle iconcine o ai pulsanti.

VERSIONE 2.0.1 · 29/10/2026
CORREZIONE
- Elenco dei viaggi: nei viaggi senza codice (es. le date extra) il nome veniva tagliato dopo
  poche lettere («Outl…», «Sav…»). La casella del codice ora resta sempre al suo posto anche quando
  è vuota, quindi il nome è sempre nella sua colonna e si legge per intero.
- Elenco dei viaggi: con un nome d'hotel lungo, «EXTRA» finiva sopra le iconcine dei servizi.
  Ora ogni colonna ha il suo spazio garantito; se lo schermo è stretto si accorciano con «…» il nome
  del viaggio e quello dell'hotel (passando sopra con il mouse si leggono per intero), mai le iconcine.
- Schermi più stretti: sotto i 1600 punti i pulsanti Lista e Posti mostrano solo l'icona (il nome
  compare passandoci sopra); sotto i 1460 punti il nome dell'hotel si legge passando il mouse sul
  nome del viaggio, per lasciare spazio alle iconcine.
- Controllato in automatico su schermi larghi 1728, 1512, 1440, 1366 e 1280 punti, su tutti i viaggi
  dell'anno: nessuna scritta sopra un'altra e nessun nome tagliato.

VERSIONE 2.0 · 29/10/2026
CORREZIONI
- Elenco dei viaggi: la data non si sovrappone più al giorno della settimana con i mesi lunghi e i tour
  di più giorni («24–26 Settembre VEN–DOM», «12–19 Settembre», «30 Set – 4 Ott»). Ogni colonna del
  riquadro (data, giorno, codice, nome) è larga quanto la scritta più lunga dell'elenco, quindi tutte
  le righe restano allineate e nessuna scritta finisce sopra l'altra.
ELENCO DEI VIAGGI
- Il nome dell'hotel è scritto fuori dal riquadro colorato, in una colonna sua subito dopo, con
  l'iconcina dell'hotel accanto (bozza «A · testo semplice» scelta da voi). Nel riquadro restano solo
  data, giorno, codice e nome: tutte le righe hanno la stessa altezza. Il numero dei giorni si legge
  già dalla data (es. «12–14 Marzo»).
- Passando con il puntatore su un'iconcina dei servizi compare subito sotto il suo nome
  (es. «Guide», «Navigazione · non compreso»).
TESTA DELLA LISTA
- Tre riquadri della stessa larghezza (prima le partenze prendevano quasi metà dello spazio):
  · Quote e pagamenti: adulti, bambini (singola, 3° letto, neonati nei tour), poi acconto, saldo e
    «saldo entro il»;
  · Date e hotel: partenza, rientro e, nei tour, l'hotel;
  · Partenze.

VERSIONE 1.9.9 · 29/10/2026
COMITIVE E ORDINE DELLA LISTA
- Si può spostare una riga in un punto preciso della lista (anche dentro la stessa lista): si trascina
  ⠿ sopra la riga dove la si vuole mettere; una linea blu mostra se va sopra o sotto. Dalla prima riga
  si sposta tutta la prenotazione, dalle altre la singola persona. Serve per mettere in ordine le
  fermate (es. una comitiva di Ragusa con una persona che sale a Modica: la persona va tra quelli di
  Modica). Non si finisce mai in mezzo a un'altra comitiva: si va prima o dopo di essa.
- La persona spostata da sola resta nella sua comitiva (pagamento, cartelli) e sulla riga c'è il
  segno ↗ «comitiva Rossi x 4». Se invece deve diventare una prenotazione a sé: «Stacca dalla comitiva».
- Si può staccare anche il capogruppo: il secondo della comitiva prende il suo posto e diventa
  «Cognome x N-1»; gli incassi già fatti, il colore, «cliente abituale» e «saldato» restano alla
  comitiva. Il vecchio capogruppo diventa una prenotazione a sé con il segno ⛓ (da chi, quando).

VERSIONE 1.9.8 · 29/10/2026
ELENCO DEI VIAGGI
- I contatori dei posti liberi sono a destra, subito prima dei pulsanti Lista e Posti
  (allineati sul bordo destro); le iconcine dei servizi restano al centro.

VERSIONE 1.9.7 · 29/10/2026
ELENCO DEI VIAGGI
- A destra delle iconcine dei servizi: i posti ancora liberi. Con più bus un contatore per ogni bus
  (B1, B2…), con un bus solo un contatore unico. Verde quando c'è posto, arancione da 5 posti liberi
  in giù, rosso quando il bus è pieno o ci sono persone in più. Si contano anche i nomi che mancano
  nelle comitive (es. «Rossi x 4» con 2 nomi scritti occupa 4 posti) e i posti riservati alla guida.
  Al posto del vecchio riquadro grigio «2 bus · 12/130».

VERSIONE 1.9.6 · 29/10/2026
ELENCO DEI VIAGGI
- Le iconcine dei servizi stanno al centro dello spazio libero tra la colonna «EXTRA» e i pulsanti
  Lista / Posti, sempre allineate tra una riga e l'altra.

VERSIONE 1.9.5 · 29/10/2026
ELENCO DEI VIAGGI
- Riquadri colorati più corti: data, giorno e codice più stretti e il nome al massimo di circa
  35 caratteri; i nomi più lunghi finiscono con «…» (passando sopra con il mouse si legge tutto).
  Tutti i riquadri finiscono sempre allo stesso punto.

VERSIONE 1.9.4 · 29/10/2026
ELENCO DEI VIAGGI
- Tutti i riquadri colorati finiscono allo stesso punto, subito dopo il nome più lungo dell'elenco:
  le righe sono ordinate e non più sfalsate. (I nomi lunghissimi vanno a capo con «…» oltre 560 punti.)

VERSIONE 1.9.3 · 29/10/2026
ELENCO DEI VIAGGI
- Il riquadro colorato di ogni viaggio finisce subito dopo il nome dell'evento (prima arrivava fino
  alla colonna «EXTRA»). «EXTRA», le iconcine dei servizi e i pulsanti restano allineati in colonna.

VERSIONE 1.9.2 · 29/10/2026
ELENCO DEI VIAGGI
- Il riquadro colorato (giallo gite, verde tour, azzurro eventi, lilla biglietteria) va dalla data
  fino alla fine del nome del viaggio.
- Data più grande e senza anno (l'anno si sceglie in alto): «10 Gennaio», «3–6 Gennaio», «30 Dic – 2 Gen».
- «EXTRA» ha una colonna tutta sua: le etichette sono una sotto l'altra, allineate.
- Nello spazio centrale le iconcine dei servizi compresi: Bus, Guide, Ristorante, Hotel, Colazioni,
  Ingressi, Navigazione, Copertura, Extra, Accompagnatore. Colorate se il servizio c'è, grigie e
  trasparenti se non c'è (passando sopra con il mouse si legge il nome). Non per la biglietteria.
MODIFICA GITA
- Finestra ridisegnata: nome; tipo, partenza, rientro e codice su una riga; «Data extra»; le 10 caselle
  dei servizi da accendere e spegnere con un tocco; programma e codice Danea raccolti in fondo.
  Per i viaggi di prima: Bus acceso se il viaggio ha un bus, Hotel acceso se è un tour con hotel.
TESTA DELLA LISTA
- Tolto il riquadro a sinistra con il nome (resta in alto; si cambia da «Modifica gita»).
- Prezzi, date e pagamenti, hotel e partenze in un unico riquadro compatto, con i campi ben separati.
- Le note non ci sono più di serie: il pulsante «+ Aggiungi nota» ne aggiunge quante servono
  (ognuna si toglie con la ×). Le note già scritte restano; anche la stampa le riporta tutte.
COMITIVE
- Se «Rossi x 3» diventa «Rossi x 5», sotto la comitiva compaiono da sole le 2 righe vuote che servono
  e chi era sotto scende. Le righe vuote dentro una comitiva restano riservate a chi manca: chi è
  scritto più sotto non finisce più per sbaglio dentro la comitiva.
- Se con le persone in più la lista supera i posti del bus, compare un avviso con quante sono in più.
- «Stacca dalla comitiva»: una persona della comitiva diventa una prenotazione a sé e la comitiva
  scende (es. da x 3 a x 2). Sulla riga resta il segno ⛓ con da quale comitiva è stata staccata,
  quando e da chi; dal menu della riga si può rimettere nella comitiva. Si fa dal menu della riga,
  dalla barra delle righe selezionate o con la scorciatoia ⌃⌥D (si cambia in Gesti e scorciatoie,
  dove c'è anche come azione per il mouse).
LISTE DEI BUS
- Con più bus, sopra le liste: «Tutti i bus» (una sotto l'altra), «Lista Bus 1», «Lista Bus 2»…
  (solo quella) e «Affiancate» (liste compatte una accanto all'altra, da consultare; si può trascinare
  da una colonna all'altra). Si può anche trascinare una persona sul pulsante di un bus.
FILE A PAGAMENTO
- I riquadri dei supplementi diventano «File a pagamento»: si aggiungono e tolgono file e si scrive il
  prezzo di ognuna. Ogni riquadro dice quanti posti restano (contati sui bus del viaggio) e cambia colore:
  verde quando sono tutti liberi, sempre più rosso man mano che si vendono, rosso quando è esaurita.
- La colonna «fila» della lista è una tendina: per ogni fila prezzo e posti ancora liberi, con
  lato sinistro o destro; in fondo le richieste senza supplemento (lato, ultime file). Le scritte già
  presenti che non sono nell'elenco restano come sono.
- Il supplemento vale per tutte le file che hanno un prezzo (non più solo le prime 4).

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
