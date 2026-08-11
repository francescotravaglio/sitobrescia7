// Libro dei Totem: libro 3D sfogliabile (popolato dai Totem approvati su Firestore)
// e form pubblico per proporre il proprio Totem. Caricare DOPO Firebase init.
(function () {
    if (!document.getElementById('tb-book')) return;

    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    var annoInput = document.getElementById('tf-anno');
    if (annoInput) annoInput.max = new Date().getFullYear();

    var PER_PAGE = 7;
    var pages = [];
    var leaves = 0;
    var currentFlipped = 0;

    function entryRow(e) {
        return '<li class="tb-entry"><span class="tb-entry-anno">' + esc(e.anno) + '</span>' +
            '<span class="tb-entry-nome">' + esc(e.nome) + '</span>' +
            '<i class="fas fa-paw tb-entry-sep"></i>' +
            '<span class="tb-entry-totem">' + esc(e.totem) + '</span></li>';
    }

    function pageHtml(entries, pageNum) {
        if (!entries.length) {
            return '<div class="tb-empty"><i class="fas fa-feather-alt"></i><p>Questa pagina è ancora bianca.<br>Sii tu a scriverla.</p></div>' +
                   '<div class="tb-page-num">' + pageNum + '</div>';
        }
        var lastAnno = null, html = '';
        entries.forEach(function (e) {
            if (e.anno !== lastAnno) { html += '<div class="tb-year-divider">' + esc(e.anno) + '</div>'; lastAnno = e.anno; }
            html += entryRow(e);
        });
        return '<div class="tb-page-inner"><ul class="tb-entry-list">' + html + '</ul></div><div class="tb-page-num">' + pageNum + '</div>';
    }

    function buildPages(entries) {
        entries = entries.slice().sort(function (a, b) {
            return String(a.anno).localeCompare(String(b.anno), 'it', { numeric: true }) || String(a.nome).localeCompare(String(b.nome), 'it');
        });
        var out = [];
        if (!entries.length) return [[], []];
        for (var i = 0; i < entries.length; i += PER_PAGE) out.push(entries.slice(i, i + PER_PAGE));
        if (out.length % 2 === 1) out.push([]);
        return out;
    }

    function render(entries) {
        pages = buildPages(entries);
        leaves = pages.length / 2;
        currentFlipped = 0;

        var wrap = document.getElementById('tb-pages');
        var html = '';
        for (var i = 0; i < leaves; i++) {
            html += '<div class="tb-leaf" id="tb-leaf-' + i + '">' +
                '<div class="tb-leaf-face tb-leaf-front">' + pageHtml(pages[i * 2], i * 2 + 1) + '</div>' +
                '<div class="tb-leaf-face tb-leaf-back">' + pageHtml(pages[i * 2 + 1], i * 2 + 2) + '</div>' +
                '</div>';
        }
        wrap.innerHTML = html;
        updateLeaves();
        updateControls();
    }

    function updateLeaves() {
        for (var i = 0; i < leaves; i++) {
            var leaf = document.getElementById('tb-leaf-' + i);
            if (!leaf) continue;
            if (i < currentFlipped) { leaf.style.zIndex = 20 + i; leaf.classList.add('flipped'); }
            else { leaf.style.zIndex = 20 + (leaves - i); leaf.classList.remove('flipped'); }
        }
    }

    function updateControls() {
        var counter = document.getElementById('tb-page-counter');
        var prevBtn = document.getElementById('tb-prev-btn');
        var nextBtn = document.getElementById('tb-next-btn');
        if (!counter) return;
        if (!leaves) { counter.textContent = ''; return; }
        var total = leaves * 2;
        if (currentFlipped === 0) {
            counter.textContent = '1 di ' + total;
        } else if (currentFlipped === leaves) {
            counter.textContent = total + ' di ' + total;
        } else {
            counter.textContent = (currentFlipped * 2) + '–' + (currentFlipped * 2 + 1) + ' di ' + total;
        }
        if (prevBtn) prevBtn.disabled = currentFlipped === 0;
        if (nextBtn) nextBtn.disabled = currentFlipped === leaves;
    }

    window.totemNextPage = function () {
        if (currentFlipped >= leaves) return;
        currentFlipped++;
        updateLeaves(); updateControls();
    };
    window.totemPrevPage = function () {
        if (currentFlipped <= 0) return;
        currentFlipped--;
        updateLeaves(); updateControls();
    };
    window.totemOpenBook = function () {
        var cover = document.getElementById('tb-cover');
        if (cover) cover.classList.add('opened');
        var book = document.getElementById('tb-book');
        book.classList.remove('closed');
        book.classList.add('open');
        document.getElementById('tb-controls').style.display = 'flex';
    };

    document.addEventListener('keydown', function (e) {
        var book = document.getElementById('tb-book');
        if (!book || !book.classList.contains('open')) return;
        if (e.key === 'ArrowRight') window.totemNextPage();
        if (e.key === 'ArrowLeft') window.totemPrevPage();
    });

    render([]);
    window.addEventListener('load', function () {
        if (!window.db) return;
        window.db.collection('totem').get().then(function (snap) {
            var ok = [];
            snap.forEach(function (d) { var t = d.data(); if (t.approvato) ok.push(t); });
            render(ok);
        }).catch(function (err) { console.error(err); });
    });

    // ── Form invio ──────────────────────────────────────────────
    window.submitTotem = function () {
        var hp = document.getElementById('tf-hp'); if (hp && hp.value) return;
        var last = +localStorage.getItem('totem_last') || 0;
        if (Date.now() - last < 60000) { alert('Attendi un minuto prima di inviare di nuovo.'); return; }

        var anno = document.getElementById('tf-anno').value.trim();
        var nome = document.getElementById('tf-nome').value.trim();
        var totemNome = document.getElementById('tf-totem').value.trim();
        var errEl = document.getElementById('tf-error');
        if (!anno || !nome || !totemNome) { errEl.classList.remove('hidden'); return; }
        errEl.classList.add('hidden');

        window.db.collection('totem').add({
            anno: anno, nome: nome, totem: totemNome,
            timestamp: new Date().toISOString(), approvato: false
        }).then(function () {
            localStorage.setItem('totem_last', Date.now());
            document.getElementById('form-totem').classList.add('hidden');
            document.getElementById('tf-success').classList.remove('hidden');
            if (typeof gtag !== 'undefined') gtag('event', 'totem_inviato', { event_category: 'engagement' });
            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_rtxg48l', 'template_fc1c77j', {
                    to_email: 'brescia7@lombardia.agesci.it',
                    nome: 'Nuovo Totem da approvare',
                    tipo: 'Libro dei Totem',
                    timestamp: new Date().toLocaleDateString('it-IT'),
                    iban: nome + ' — Totem "' + totemNome + '" (' + anno + ')\n\nPer approvarlo: admin.html → Libro dei Totem → Approva'
                }).catch(function (e) { console.error('[EmailJS]', e); });
            }
        }).catch(function (err) { console.error(err); alert('Errore. Riprova.'); });
    };
})();
