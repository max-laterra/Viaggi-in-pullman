// ============================================================
//  PIANTINE DEI PULLMAN LA TERRA
//  Ogni riga ha 5 colonne: sinistra (2) | corridoio (1) | destra (2)
//  numero = posto · {h:n} = posto hostess · {s:n,c:2} = posto largo
//  'autista' 'tv' 'uscita' 'toilette' 'tavolino' 'scale' 'logo' = elementi fissi
//  0 = corridoio vuoto · null = spazio vuoto
// ============================================================
(function () {
  const q = a => [a, a + 1, 0, a + 2, a + 3];          // 2 + 2 posti
  const m = a => [a + 3, a + 2, 0, a + 1, a];          // 2 + 2 posti numerati a specchio (Setra 417)
  const qs = (from, to) => { const r = []; for (let a = from; a <= to; a += 4) r.push(q(a)); return r; };
  const ms = (from, to) => { const r = []; for (let a = from; a <= to; a += 4) r.push(m(a)); return r; };
  const A = { f: 'autista', c: 2 };
  const CELL_STD = '333/6950178 - 339/4100526';
  const CELL_ALT = '333/6950178 - 328/4227430';

  window.LAYOUTS = [
    {
      id: '81', posti: 81, nome: 'Setra 431 DT', desc: '81 posti + 1 autista', cell: CELL_STD, flotta: 2,
      floors: [
        { nome: 'Piano inferiore', rows: [
          [A, 0, { f: 'uscita', c: 2 }],
          [{ f: 'scale', c: 2 }, 0, { h: 81, c: 2 }],
          [{ f: 'scale', c: 2 }, 0, 1, 2],
          [3, 4, 0, 5, 6],
          [{ f: 'tavolino', c: 2 }, 'logo', { f: 'tavolino', c: 2 }],
          ...qs(7, 19),
          ['toilette', null, 0, { f: 'uscita', c: 2 }],
          [null, null, 0, null, 'scale']
        ] },
        { nome: 'Piano superiore', rows: [
          [23, 24, 'tv', 25, 26],
          [{ f: 'scale', c: 2 }, 0, 27, 28],
          [{ f: 'scale', c: 2 }, 0, 29, 30],
          ...qs(31, 55),
          [59, 60, 'logo', 'tv', 'scale'],
          ...qs(61, 73),
          [77, 78, 0, 79, 80]
        ] }
      ]
    },
    {
      id: '79', posti: 79, nome: 'Setra S 328 DT', desc: '79 posti + 1 autista', cell: CELL_ALT, flotta: 1,
      floors: [
        { nome: 'Piano inferiore', rows: [
          [A, 0, { f: 'uscita', c: 2 }],
          q(1),
          ['tv', null, 0, null, 'tv'],
          q(5),
          [{ f: 'tavolino', c: 2 }, 'logo', { f: 'tavolino', c: 2 }],
          ...qs(9, 17),
          ['toilette', null, 0, 21, 22],
          [null, null, 0, { f: 'uscita', c: 2 }],
          [null, null, 0, null, 'scale']
        ] },
        { nome: 'Piano superiore', rows: [
          [23, 24, 'tv', 25, 26],
          ...qs(27, 55),
          [59, 60, 'logo', null, 'tv'],
          [61, 62, 0, { f: 'scale', c: 2 }],
          ...qs(63, 71),
          [75, 76, 77, 78, 79]
        ] }
      ]
    },
    {
      id: '64', posti: 63, nome: 'Setra 417 HDH', desc: '63 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 1,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 64, c: 2 }],
        ...ms(1, 13),
        [20, 19, 'tv', 18, 17],
        ...ms(21, 29),
        [34, 33, 'logo', 'toilette', 'uscita'],
        [38, 37, 'tv', 36, 35],
        ...ms(39, 55),
        [63, 62, 61, 60, 59]
      ] }]
    },
    {
      id: '58', posti: 57, nome: 'Setra 416 HDH', desc: '57 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 2,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 58, c: 2 }],
        ...qs(1, 21),
        [25, 26, 'logo', { f: 'toilette', c: 2 }],
        [27, 28, 0, null, 'uscita'],
        [29, 30, 'tv', 31, 32],
        ...qs(33, 49),
        [53, 54, 55, 56, 57]
      ] }]
    },
    {
      id: '54', posti: 53, nome: 'Setra 315 HDH', desc: '53 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 3,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 54 }, 'uscita'],
        ...qs(1, 21),
        [25, 26, 0, 'tv', 'toilette'],
        [27, 28, 'logo', { f: 'uscita', c: 2 }],
        ...qs(29, 45),
        [49, 50, 51, 52, 53]
      ] }]
    },
    {
      id: '52', posti: 51, nome: 'Mercedes Tourismo', desc: '51 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 4,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 52 }, 'uscita'],
        ...qs(1, 17),
        [21, 22, 0, 'tv', 'toilette'],
        [23, 24, 'logo', null, null],
        [25, 26, 0, { f: 'uscita', c: 2 }],
        ...qs(27, 43),
        [47, 48, 49, 50, 51]
      ] }]
    },
    {
      id: '52h', posti: 51, nome: 'Irizar Scania PB (H)', desc: '51 posti + 1 hostess + 1 autista', cell: CELL_ALT, flotta: 1,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 52 }, 'uscita'],
        ...qs(1, 21),
        [25, 26, 'tv', 'toilette', 'uscita'],
        ...qs(27, 43),
        [47, 48, 49, 50, 51]
      ] }]
    },
    {
      id: '50', posti: 49, nome: 'Mercedes Tourismo', desc: '49 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 1,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 50 }, 'uscita'],
        ...qs(1, 17),
        [21, 22, 'logo', 'tv', 'toilette'],
        [23, 24, 0, null, 'uscita'],
        ...qs(25, 41),
        [45, 46, 47, 48, 49]
      ] }]
    },
    {
      id: '42', posti: 41, nome: 'Setra 411 HD', desc: '41 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 2,
      floors: [{ nome: '', rows: [
        [A, 'tv', { h: 42 }, 'uscita'],
        ...qs(1, 13),
        [17, 18, 0, 'tv', 'toilette'],
        [19, 20, 'logo', { f: 'uscita', c: 2 }],
        ...qs(21, 33),
        [37, 38, 39, 40, 41]
      ] }]
    },
    {
      id: '28', posti: 27, nome: 'Voyager', desc: '27 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 2,
      floors: [{ nome: '', rows: [
        [A, 'tv', { f: 'uscita', c: 2 }],
        [null, null, 0, { h: 28, c: 2 }],
        ...qs(1, 17),
        [21, 22, 'logo', { f: 'uscita', c: 2 }],
        [23, 24, 25, 26, 27]
      ] }]
    },
    {
      id: '20', posti: 19, nome: 'Mercedes Trend XL', desc: '19 posti + 1 hostess + 1 autista', cell: CELL_STD, flotta: 3,
      floors: [{ nome: '', rows: [
        [A, 'tv', { f: 'uscita', c: 2 }],
        [null, null, 0, { h: 20, c: 2 }],
        [1, 2, 0, { s: 3, c: 2 }],
        [4, 5, 0, { s: 6, c: 2 }],
        [7, 8, 'logo', { s: 9, c: 2 }],
        [10, 11, 0, { s: 12, c: 2 }],
        [13, 14, 0, { s: 15, c: 2 }],
        [16, 17, 18, { s: 19, c: 2 }]
      ] }]
    }
  ];
})();
