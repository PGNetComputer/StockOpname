/* ================================================================
 * Jembatan GitHub Pages → Apps Script
 * Halaman aslinya memanggil google.script.run.withSuccessHandler(..)
 * .withFailureHandler(..).namaFungsi(args). File ini membuat versi
 * tiruannya yang memanggil Apps Script lewat fetch (doPost di Kode.gs),
 * jadi kode halaman tidak perlu diubah.
 * ================================================================ */
(function () {
  var PIN_KEY = 'so_pin_v1', BATAS_MS = 120000;

  function bacaPin() { try { return localStorage.getItem(PIN_KEY) || ''; } catch (e) { return ''; } }
  function simpanPin(p) { try { localStorage.setItem(PIN_KEY, p); } catch (e) {} }

  function panggil(fn, args) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, BATAS_MS) : null;
    return fetch(window.SO_API, {
      method: 'POST',
      // text/plain → tidak ada "preflight" CORS, Apps Script bisa menerimanya
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args, pin: bacaPin() }),
      redirect: 'follow',
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (t) clearTimeout(t);
      if (!res.ok) throw new Error('Server menjawab ' + res.status);
      return res.text();
    }).then(function (teks) {
      var d;
      try { d = JSON.parse(teks); }
      catch (e) { throw new Error('Jawaban server tidak terbaca. Cek: deployment Apps Script harus "Siapa saja" dan URL di config.js benar.'); }
      if (d.ok) return d.r;
      var err = new Error(d.err || 'Gagal');
      if (d.pin) err.pin = true;
      throw err;
    }, function (e) {
      if (t) clearTimeout(t);
      if (e && e.name === 'AbortError') throw new Error('Server terlalu lama menjawab, coba lagi.');
      if (!navigator.onLine) throw new Error('Tidak ada koneksi internet.');
      throw new Error('Tidak bisa menghubungi server (' + ((e && e.message) || e) + ').');
    });
  }

  /* ---------- minta PIN (sekali, lalu diingat di HP) ---------- */
  var antrePin = [], pinBuka = false;
  function mintaPin(lanjut) {
    antrePin.push(lanjut);
    if (pinBuka) return;
    pinBuka = true;
    var salah = !!bacaPin();
    var w = document.createElement('div');
    w.setAttribute('style', 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px');
    w.innerHTML =
      '<form style="background:#fff;border-radius:16px;padding:20px;width:100%;max-width:320px;text-align:center;font-family:system-ui,sans-serif">' +
      '<b style="font-size:17px;color:#1a6b4c">Stok Opname PGNet</b>' +
      '<p style="margin:8px 0 12px;color:' + (salah ? '#c62828' : '#555') + '">' + (salah ? 'PIN salah, coba lagi.' : 'Masukkan PIN (cukup sekali)') + '</p>' +
      '<input type="password" inputmode="numeric" autocomplete="off" style="font-size:22px;padding:10px;width:100%;box-sizing:border-box;text-align:center;border:1px solid #ccc;border-radius:10px">' +
      '<button style="margin-top:12px;width:100%;padding:12px;font-size:16px;border:0;border-radius:10px;background:#0e7a3a;color:#fff">Masuk</button></form>';
    document.body.appendChild(w);
    var inp = w.querySelector('input');
    setTimeout(function () { inp.focus(); }, 50);
    w.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault();
      if (!inp.value.trim()) return;
      simpanPin(inp.value.trim());
      w.remove(); pinBuka = false;
      var q = antrePin; antrePin = [];
      q.forEach(function (f) { f(); });
    };
  }

  /* ---------- tiruan google.script.run ---------- */
  function runner(ok, gagal) {
    return new Proxy({}, {
      get: function (_, nama) {
        if (nama === 'withSuccessHandler') return function (f) { return runner(f, gagal); };
        if (nama === 'withFailureHandler') return function (f) { return runner(ok, f); };
        if (nama === 'withUserObject') return function () { return runner(ok, gagal); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          var jalan = function () {
            panggil(nama, args).then(
              function (r) { if (ok) ok(r); },
              function (e) {
                if (e && e.pin) mintaPin(jalan);
                else if (gagal) gagal(e);
              });
          };
          jalan();
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: runner(null, null) };
})();
