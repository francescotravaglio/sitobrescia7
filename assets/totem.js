// Libro dei Totem: libro 3D sfogliabile (popolato dai Totem approvati su Firestore)
// e form pubblico per proporre il proprio Totem. Caricare DOPO Firebase init.
(function () {
    if (!document.getElementById('tb-book')) return;

    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    // "mario rossi" -> "Mario" (tiene solo il nome, scarta il cognome se c'è)
    function firstNameCapitalized(s) {
        var first = String(s).trim().split(/\s+/)[0] || '';
        return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    }
    // "scoiattolo LIETO" -> "Scoiattolo Lieto" (iniziale maiuscola per ogni parola)
    function titleCase(s) {
        return String(s).trim().split(/\s+/).map(function (w) {
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join(' ');
    }

    var annoInput = document.getElementById('tf-anno');
    if (annoInput) annoInput.max = new Date().getFullYear();

    var pages = [];
    var leaves = 0;
    var currentFlipped = -1; // -1 = libro chiuso; 0..leaves-1 = pagina visibile

    function entryRow(e) {
        return '<li class="tb-entry"><span class="tb-entry-nome">' + esc(e.nome) + '</span>' +
            '<span class="tb-entry-totem">' + esc(e.totem) + '</span></li>';
    }

    function pageHtml(entries, pageNum) {
        if (!entries.length) {
            return '<div class="tb-page-num">' + pageNum + '</div>';
        }
        var lastAnno = null, html = '';
        entries.forEach(function (e) {
            if (e.anno !== lastAnno) { html += '<div class="tb-year-divider">' + esc(e.anno) + '</div>'; lastAnno = e.anno; }
            html += entryRow(e);
        });
        return '<div class="tb-page-inner"><ul class="tb-entry-list">' + html + '</ul></div><div class="tb-page-num">' + pageNum + '</div>';
    }

    var MAX_PER_PAGE = 6;

    function buildPages(entries) {
        entries = entries.slice().sort(function (a, b) {
            return String(a.anno).localeCompare(String(b.anno), 'it', { numeric: true }) || String(a.nome).localeCompare(String(b.nome), 'it');
        });
        if (!entries.length) return [[]];
        var out = [], lastAnno = null;
        entries.forEach(function (e) {
            var current = out.length ? out[out.length - 1] : null;
            if (e.anno !== lastAnno || current.length >= MAX_PER_PAGE) { out.push([]); current = out[out.length - 1]; lastAnno = e.anno; }
            current.push(e);
        });
        return out;
    }

    function render(entries) {
        pages = buildPages(entries);
        leaves = pages.length;
        // se i dati arrivano/si aggiornano mentre il libro è già aperto (es.
        // dopo un ripristino da bfcache), resta aperto sulla prima pagina
        // invece di disallinearsi rispetto allo stato visivo della copertina
        var book = document.getElementById('tb-book');
        currentFlipped = (book && book.classList.contains('open')) ? 0 : -1;

        var wrap = document.getElementById('tb-pages');
        var html = '';
        for (var i = 0; i < leaves; i++) {
            html += '<div class="tb-leaf" id="tb-leaf-' + i + '">' +
                '<div class="tb-leaf-face" onclick="totemNextPage()">' + pageHtml(pages[i], i + 1) + '</div>' +
                '</div>';
        }
        wrap.innerHTML = html;
        updateLeaves();
        updateControls();
    }

    function restingZ(i) {
        return i < currentFlipped ? 20 + i : 20 + (leaves - i);
    }

    // activeIndex: la pagina che sta girando in questo momento. Il suo
    // z-index normale a fine animazione può essere più basso di quello della
    // pagina successiva (che resta ferma sopra di lei), il che nasconderebbe
    // subito la rotazione: per questo durante il transition la teniamo
    // temporaneamente sopra a tutte, per poi riportarla al valore definitivo
    // a transizione conclusa.
    function updateLeaves(activeIndex) {
        for (var i = 0; i < leaves; i++) {
            var leaf = document.getElementById('tb-leaf-' + i);
            if (!leaf) continue;
            if (i < currentFlipped) leaf.classList.add('flipped');
            else leaf.classList.remove('flipped');

            if (i === activeIndex) {
                leaf.style.zIndex = 100;
                leaf.addEventListener('transitionend', (function (el, z) {
                    return function (e) {
                        if (e.propertyName !== 'transform') return;
                        el.style.zIndex = z;
                    };
                })(leaf, restingZ(i)), { once: true });
            } else {
                leaf.style.zIndex = restingZ(i);
            }
        }
    }

    function updateControls() {
        var counter = document.getElementById('tb-page-counter');
        var prevBtn = document.getElementById('tb-prev-btn');
        var nextBtn = document.getElementById('tb-next-btn');
        if (!counter) return;
        if (currentFlipped < 0 || !leaves) { counter.textContent = ''; return; }
        counter.textContent = (currentFlipped + 1) + ' di ' + leaves;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = currentFlipped >= leaves - 1;
    }

    window.totemNextPage = function () {
        if (currentFlipped < 0 || currentFlipped >= leaves - 1) return;
        var active = currentFlipped;
        currentFlipped++;
        updateLeaves(active); updateControls();
    };
    window.totemPrevPage = function () {
        if (currentFlipped <= 0) { window.totemCloseBook(); return; }
        currentFlipped--;
        updateLeaves(currentFlipped); updateControls();
    };
    window.totemOpenBook = function () {
        var book = document.getElementById('tb-book');
        book.classList.remove('closed');
        book.classList.add('open');
        currentFlipped = 0;
        updateLeaves(); updateControls();
        document.getElementById('tb-controls').style.display = 'flex';
    };
    window.totemCloseBook = function () {
        var book = document.getElementById('tb-book');
        book.classList.remove('open');
        book.classList.add('closed');
        document.getElementById('tb-controls').style.display = 'none';
        currentFlipped = -1;
        updateLeaves(); updateControls();
    };

    document.addEventListener('keydown', function (e) {
        var book = document.getElementById('tb-book');
        if (!book || !book.classList.contains('open')) return;
        if (e.key === 'ArrowRight') window.totemNextPage();
        if (e.key === 'ArrowLeft') window.totemPrevPage();
    });

    render([]);
    function loadTotemEntries() {
        if (!window.db) return;
        window.db.collection('totem').where('approvato', '==', true).get().then(function (snap) {
            var ok = [];
            snap.forEach(function (d) { ok.push(d.data()); });
            render(ok);
        }).catch(function (err) { console.error(err); });
    }
    window.addEventListener('load', loadTotemEntries);
    // Se la pagina viene ripristinata dalla bfcache (es. tasto "indietro" del
    // browser), "load" non si ripete: senza questo, il libro resterebbe bloccato
    // sulla pagina vuota iniziale invece di ricaricare i Totem.
    window.addEventListener('pageshow', function (e) { if (e.persisted) loadTotemEntries(); });

    // ── Form invio ──────────────────────────────────────────────
    window.submitTotem = function () {
        var hp = document.getElementById('tf-hp'); if (hp && hp.value) return;
        var last = +localStorage.getItem('totem_last') || 0;
        if (Date.now() - last < 60000) { alert('Attendi un minuto prima di inviare di nuovo.'); return; }

        var anno = document.getElementById('tf-anno').value.trim();
        var nomeRaw = document.getElementById('tf-nome').value.trim();
        var totemRaw = document.getElementById('tf-totem').value.trim();
        var errEl = document.getElementById('tf-error');
        if (!anno || !nomeRaw || !totemRaw) { errEl.classList.remove('hidden'); return; }
        errEl.classList.add('hidden');

        var nome = firstNameCapitalized(nomeRaw);
        var totemNome = titleCase(totemRaw);

        window.db.collection('totem').add({
            anno: anno, nome: nome, totem: totemNome,
            timestamp: new Date().toISOString(), approvato: false
        }).then(function () {
            localStorage.setItem('totem_last', Date.now());
            document.getElementById('form-totem').classList.add('hidden');
            document.getElementById('tf-success').classList.remove('hidden');
            if (typeof gtag !== 'undefined') gtag('event', 'totem_inviato', { event_category: 'engagement' });
        }).catch(function (err) { console.error(err); alert('Errore. Riprova.'); });
    };
})();
