/* Azienda Medei - script del sito */
(function () {
  'use strict';
  var D = window.MEDEI || { whatsapp: '', prodotti: [], spedizioni: [], foglio: {} };
  var en = document.documentElement.lang === 'en';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  function euro(v) {
    var s = (Math.round(v * 100) / 100).toFixed(2);
    return en ? '€' + s : s.replace('.', ',') + ' €';
  }
  function wa(testo, numero) {
    return 'https://wa.me/' + (numero || D.whatsapp) + '?text=' + encodeURIComponent(testo);
  }
  function voce(id) {
    for (var i = 0; i < D.prodotti.length; i++) if (D.prodotti[i].id === id) return D.prodotti[i];
    return null;
  }
  function etichetta(v) {
    return (en ? v.nome_en || v.nome : v.nome) + (v.formato ? ' ' + v.formato : '');
  }

  /* anteprima dal computer (doppio clic sul file): i link alle cartelle aprono index.html */
  if (location.protocol === 'file:') {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
      var p = h.split('#');
      if (p[0] === '' ) return;
      if (/\/$/.test(p[0]) || p[0] === '.' || p[0] === '..') {
        a.setAttribute('href', p[0].replace(/\/?$/, '/') + 'index.html' + (p[1] ? '#' + p[1] : ''));
      }
    });
  }

  /* menu */
  var bm = $('.apri-menu'), menu = $('#menu');
  if (bm && menu) {
    bm.addEventListener('click', function () {
      bm.setAttribute('aria-expanded', menu.classList.toggle('aperto'));
    });
  }

  /* schede */
  $$('.schede').forEach(function (box) {
    var tasti = $$('[role=tab]', box);
    function scegli(t) {
      tasti.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tasti.forEach(function (t, i) {
      t.addEventListener('click', function () { scegli(t); });
      t.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (d) { var n = tasti[(i + d + tasti.length) % tasti.length]; scegli(n); n.focus(); }
      });
    });
  });

  /* video YouTube: caricato solo al clic */
  $$('a.yt').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (location.protocol === 'file:') return;
      ev.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + a.dataset.yt + '?autoplay=1';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.title = 'Video';
      a.appendChild(f);
    });
  });

  /* contatori animati */
  var fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !fermo) {
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        oss.unobserve(v.target);
        var el = v.target, fine = +el.dataset.conta, sep = el.dataset.sep || '.', t0 = null;
        function f(n) { return fine >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n); }
        function passo(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1800);
          el.textContent = f(Math.round(fine * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.4 });
    $$('[data-conta]').forEach(function (el) { oss.observe(el); });
  }

  /* immagine che ruota scorrendo */
  var ruota = $('[data-ruota]');
  if (ruota && !fermo) {
    window.addEventListener('scroll', function () {
      ruota.style.transform = 'rotate(' + (window.scrollY / 5) + 'deg)';
    }, { passive: true });
  }

  /* ---------- prezzi e ordini ---------- */
  function aggiornaPrezzi() {
    $$('[data-prezzo]').forEach(function (el) {
      var v = voce(el.dataset.prezzo);
      if (v) el.textContent = euro(v.prezzo);
    });
    $$('.prodotto').forEach(function (card) {
      var sel = $('[data-formato]', card);
      if (sel) {
        var prezzi = [];
        $$('option', sel).forEach(function (o) {
          var v = voce(o.value);
          if (v) { o.textContent = v.formato + ' · ' + euro(v.prezzo); prezzi.push(v.prezzo); }
        });
        var pr = $('.prezzo', card);
        if (pr && prezzi.length) pr.textContent = euro(Math.min.apply(null, prezzi)) + ' – ' + euro(Math.max.apply(null, prezzi));
      }
      collegaOrdina(card);
    });
  }
  function sceltaCard(card) {
    var sel = $('[data-formato]', card);
    return voce(sel ? sel.value : card.dataset.prodotto);
  }
  function collegaOrdina(card) {
    var a = $('[data-ordina]', card);
    if (!a) return;
    function agg() {
      var v = sceltaCard(card);
      if (!v) return;
      a.href = wa(en
        ? 'Hello, I would like to order: ' + etichetta(v) + ' (' + euro(v.prezzo) + '). Could you confirm availability and shipping cost?'
        : 'Ciao, vorrei ordinare: ' + etichetta(v) + ' (' + euro(v.prezzo) + '). Mi confermi disponibilità e costo di spedizione?');
    }
    agg();
    var sel = $('[data-formato]', card);
    if (sel && !sel.dataset.ok) { sel.dataset.ok = 1; sel.addEventListener('change', agg); }
  }

  /* preventivo */
  var pv = $('#preventivo');
  var CHIAVE = 'medei-carrello';
  function leggi() { try { return JSON.parse(localStorage.getItem(CHIAVE)) || {}; } catch (e) { return {}; } }
  function salva(c) { try { localStorage.setItem(CHIAVE, JSON.stringify(c)); } catch (e) {} }
  function distintivo() {
    var c = leggi(), n = 0, tot = 0;
    Object.keys(c).forEach(function (id) { var v = voce(id); if (v && c[id] > 0) { n += c[id]; tot += v.prezzo * c[id]; } });
    var bb = $('#bb-tot'), hd = $('#hd-carrello');
    if (bb) bb.textContent = n ? euro(tot) : '';
    if (hd) { hd.hidden = !n; $('b', hd).textContent = n ? n + ' · ' + euro(tot) : ''; }
  }
  if (pv) {
    var iniziale = leggi();
    $$('tr[data-voce]', pv).forEach(function (tr) { var q = iniziale[tr.dataset.voce]; if (q > 0) $('input', tr).value = q; });
  }
  function calcola() {
    if (!pv) return;
    var interno = pv.hasAttribute('data-interno');
    var righe = [], sub = 0, stato = {};
    $$('tr[data-voce]', pv).forEach(function (tr) {
      var v = voce(tr.dataset.voce), inp = $('input', tr);
      var q = Math.max(0, Math.min(999, parseInt(inp.value, 10) || 0));
      tr.classList.toggle('scelto', q > 0);
      if (v && q > 0) { righe.push({ v: v, q: q }); sub += v.prezzo * q; stato[v.id] = q; }
    });
    salva(stato);
    distintivo();
    var zid = $('#pv-zona').value, zona = null;
    D.spedizioni.forEach(function (z) { if (z.id === zid) zona = z; });
    var sconto = 0;
    if (interno) {
      var pc = Math.max(0, Math.min(100, parseFloat($('#pv-sconto').value) || 0));
      sconto = sub * pc / 100;
      $('#pv-riga-sconto').hidden = !sconto;
      $('#pv-sc').textContent = '−' + euro(sconto);
    }
    var netto = sub - sconto;
    $('#pv-sub').textContent = righe.length ? euro(sub) : '–';
    $('#pv-sped').textContent = zona ? (zona.costo ? euro(zona.costo) : (en ? 'Free' : 'Gratis')) : '–';
    var pronto = righe.length && zona;
    $('#pv-tot').textContent = pronto ? euro(netto + zona.costo) : (righe.length ? euro(netto) + ' +' : '–');
    var avv = $('#pv-avviso');
    avv.hidden = !!pronto;
    if (!pronto) {
      avv.textContent = !righe.length
        ? (en ? 'Add at least one product to calculate the total.' : 'Aggiungi almeno un prodotto per calcolare il totale.')
        : (en ? 'Choose the delivery area to see shipping and total.' : 'Scegli la zona di consegna per vedere spedizione e totale.');
    }
    var testo = '';
    if (pronto) {
      var nomeZona = en ? zona.zona_en || zona.zona : zona.zona;
      var L = [];
      if (interno) {
        var cl = $('#pv-cliente').value.trim();
        L.push('Preventivo Azienda Medei' + (cl ? ' per ' + cl : ''));
      } else {
        L.push(en ? 'Hello, I would like to place this order:' : 'Ciao, vorrei fare questo ordine:');
      }
      righe.forEach(function (r) { L.push('• ' + r.q + ' x ' + etichetta(r.v) + ' = ' + euro(r.v.prezzo * r.q)); });
      L.push((en ? 'Products total: ' : 'Totale prodotti: ') + euro(sub));
      if (sconto) L.push('Sconto: −' + euro(sconto));
      L.push((en ? 'Delivery: ' : 'Consegna: ') + nomeZona + ' (' + (zona.costo ? euro(zona.costo) : (en ? 'free' : 'gratis')) + ')');
      L.push((en ? 'TOTAL: ' : 'TOTALE: ') + euro(netto + zona.costo));
      testo = L.join('\n');
    }
    var inv = $('#pv-invia');
    inv.setAttribute('aria-disabled', pronto ? 'false' : 'true');
    var num = interno ? ($('#pv-numero').value.replace(/\D/g, '') || '') : '';
    inv.href = pronto ? (interno && !num ? 'https://wa.me/?text=' + encodeURIComponent(testo) : wa(testo, num)) : '#preventivo';
    pv._testo = testo;
  }
  if (pv) {
    pv.addEventListener('input', calcola);
    pv.addEventListener('change', calcola);
    pv.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-piu],[data-meno]');
      if (b) {
        var inp = $('input', b.parentNode);
        inp.value = Math.max(0, Math.min(999, (parseInt(inp.value, 10) || 0) + (b.hasAttribute('data-piu') ? 1 : -1)));
        calcola();
      }
      if (ev.target.id === 'pv-invia' && ev.target.getAttribute('aria-disabled') === 'true') ev.preventDefault();
      if (ev.target.id === 'pv-copia') {
        var bt = ev.target;
        if (!pv._testo) { bt.textContent = 'Scegli prodotti e zona'; return; }
        (navigator.clipboard ? navigator.clipboard.writeText(pv._testo) : Promise.reject()).then(function () {
          bt.textContent = 'Copiato';
        }, function () { bt.textContent = 'Copia non riuscita'; }).then(function () {
          setTimeout(function () { bt.textContent = 'Copia il preventivo'; }, 2000);
        });
      }
    });
    /* svuota il preventivo */
    var rie = $('.pv-riepilogo', pv);
    if (rie) {
      var sv = document.createElement('button');
      sv.type = 'button'; sv.className = 'pv-svuota'; sv.textContent = en ? 'Empty the quote' : 'Svuota il preventivo';
      rie.appendChild(sv);
      sv.addEventListener('click', function () { $$('tr[data-voce] input', pv).forEach(function (i) { i.value = 0; }); calcola(); });
    }
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-aggiungi]');
    if (!b) return;
    var v = sceltaCard(b.closest('.prodotto'));
    if (!v) return;
    var tr = pv && $('tr[data-voce="' + v.id + '"]', pv);
    if (tr) { var inp = $('input', tr); inp.value = (parseInt(inp.value, 10) || 0) + 1; calcola(); }
    else { var c = leggi(); c[v.id] = (c[v.id] || 0) + 1; salva(c); distintivo(); }
    var testo = b.dataset.testo || (b.dataset.testo = b.textContent);
    b.textContent = en ? 'Added ✓' : 'Aggiunto ✓';
    b.classList.add('aggiunto');
    clearTimeout(b._t);
    b._t = setTimeout(function () { b.textContent = testo; b.classList.remove('aggiunto'); }, 1400);
    var live = $('#annuncio');
    if (live) live.textContent = (en ? 'Added to the quote: ' : 'Aggiunto al preventivo: ') + etichetta(v);
  });
  window.addEventListener('pageshow', distintivo);

  /* prezzi da Google Sheet (facoltativo): due fogli pubblicati come CSV */
  function csv(t) {
    var r = [], riga = [], c = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { riga.push(c); c = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; riga.push(c); c = ''; if (riga.length > 1 || riga[0]) r.push(riga); riga = []; }
      else c += ch;
    }
    riga.push(c); if (riga.length > 1 || riga[0]) r.push(riga);
    var h = r.shift().map(function (x) { return x.trim().toLowerCase().replace(/^﻿/, ''); });
    return r.map(function (x) { var o = {}; h.forEach(function (k, i) { o[k] = (x[i] || '').trim(); }); return o; });
  }
  function num(s) { var n = parseFloat(String(s).replace('€', '').replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? null : n; }
  function carica(url, fn) {
    if (!url || !window.fetch) return Promise.resolve();
    return fetch(url).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) { if (t) fn(csv(t)); }).catch(function () {});
  }
  var F = D.foglio || {};
  Promise.all([
    carica(F.prodotti, function (righe) {
      righe.forEach(function (r) { var v = voce(r.id), p = num(r.prezzo); if (v && p !== null) v.prezzo = p; });
    }),
    carica(F.spedizioni, function (righe) {
      righe.forEach(function (r) {
        var p = num(r.costo);
        D.spedizioni.forEach(function (z) { if (z.id === r.id && p !== null) z.costo = p; });
      });
    })
  ]).then(function () { aggiornaPrezzi(); calcola(); distintivo(); });
  aggiornaPrezzi();
  calcola();
  distintivo();
})();
