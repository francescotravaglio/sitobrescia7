// Gestione lead condivisa: pre-iscrizione completa (Firestore + GA4 + EmailJS)
// e tracking dei click WhatsApp. Caricare DOPO Firebase init.
// La pagina deve avere il modal #modal-pre standard.

window.submitPreIscrizione = function() {
    var hp = document.getElementById('pre-hp'); if (hp && hp.value) return;
    var last = +localStorage.getItem('pre_last')||0;
    if (Date.now()-last < 60000) { alert('Attendi un minuto prima di inviare di nuovo.'); return; }

    const genNome   = document.getElementById('pre-gen-nome').value.trim();
    const genCognome= document.getElementById('pre-gen-cognome').value.trim();
    const bimboNome = document.getElementById('pre-bimbo-nome').value.trim();
    const nascita   = document.getElementById('pre-bimbo-nascita').value;
    const email     = document.getElementById('pre-email').value.trim();
    const tel       = document.getElementById('pre-tel').value.trim();
    const errEl     = document.getElementById('pre-error');

    if (!genNome || !genCognome || !bimboNome || !nascita || !email) {
        errEl.classList.remove('hidden'); return;
    }
    errEl.classList.add('hidden');

    window.db.collection('pre_iscrizioni').add({
        genitore_nome: genNome, genitore_cognome: genCognome,
        bambino_nome: bimboNome, data_nascita: nascita,
        email, telefono: tel,
        timestamp: new Date().toISOString(), letta: false
    }).then(() => {
        localStorage.setItem('pre_last', Date.now());
        document.getElementById('form-pre').classList.add('hidden');
        document.getElementById('pre-success').classList.remove('hidden');

        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', { event_category: 'pre_iscrizione', event_label: 'form_inviato' });
        }

        if (typeof emailjs === 'undefined') return;
        const dataStr = new Date().toLocaleDateString('it-IT', {day:'2-digit', month:'long', year:'numeric'});
        // 1) notifica ai capi → 2) conferma alla famiglia
        emailjs.send('service_rtxg48l', 'template_fc1c77j', {
            to_email:  'brescia7@lombardia.agesci.it',
            nome:      'Nuova pre-iscrizione ricevuta',
            tipo:      'Pre-iscrizione',
            timestamp: dataStr,
            iban:      'Bambino: ' + bimboNome + '\n' +
                       'Data di nascita: ' + nascita + '\n\n' +
                       'Genitore: ' + genNome + ' ' + genCognome + '\n' +
                       'Email: ' + email + '\n' +
                       'Telefono: ' + (tel || '—')
        }).then(() => {
            return emailjs.send('service_rtxg48l', 'template_fc1c77j', {
                to_email:  email,
                nome:      'Ciao ' + genNome + ' ' + genCognome + '!',
                tipo:      'Conferma pre-iscrizione ricevuta',
                timestamp: dataStr,
                iban:      'Abbiamo ricevuto con successo la tua richiesta di pre-iscrizione per ' + bimboNome + '.\n\n' +
                           'A ridosso delle date di iscrizione ti ricontatteremo con tutte le informazioni e le modalità per completare l\'iscrizione ufficiale.\n\n' +
                           'Per qualsiasi domanda: info@agescibrescia7.com · +39 340 874 0678\n\n' +
                           'Buona strada!\nGruppo Scout AGESCI Brescia 7'
            });
        }).catch(e => { console.error('[EmailJS]', JSON.stringify(e)); });
    }).catch(err => { console.error(err); alert('Errore. Riprova.'); });
};

// Tracking click WhatsApp (GA4)
window.trackWhatsApp = function(origine) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_whatsapp', { event_category: 'contatto', event_label: origine || 'generico' });
    }
};

// ── TESTIMONIANZE (solo dove esiste #sez-testimonianze) ─────────
(function(){
    if (!document.getElementById('sez-testimonianze')) return;

    function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    function card(t, extra){
        return '<div class="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col ' + (extra||'') + '">' +
            '<i class="fas fa-quote-left text-gold text-2xl mb-4"></i>' +
            '<p class="text-gray-600 text-sm leading-relaxed italic flex-1">' + esc(t.testo) + '</p>' +
            '<div class="mt-5 pt-4 border-t border-gray-100 text-sm">' +
                '<span class="font-black text-scout">' + esc(t.nome) + '</span>' +
                (t.ruolo ? '<span class="text-gray-400"> · ' + esc(t.ruolo) + '</span>' : '') +
            '</div></div>';
    }

    // carica le recensioni approvate; la sezione è sempre visibile (con stato vuoto invitante)
    window.db.collection('testimonianze').get().then(snap => {
        const ok = [];
        snap.forEach(d => { const t = d.data(); if (t.approvata) ok.push(t); });
        if (!ok.length) return;                       // resta lo stato vuoto + bottone
        ok.sort((a,b) => (b.timestamp||'').localeCompare(a.timestamp||''));

        // GRIGLIA (pagina "Parlano di noi")
        var grid = document.getElementById('testi-grid');
        if (grid) grid.innerHTML = ok.slice(0,6).map(t => card(t)).join('');

        // NASTRO SCORREVOLE (homepage): due metà identiche, loop a -50%
        var track = document.getElementById('testi-track');
        if (track) {
            var unit = ok.map(t => card(t, 'flex-shrink-0 w-80 text-left')).join('');
            var reps = Math.max(2, Math.ceil(8 / ok.length));   // abbastanza card da riempire lo schermo
            var half = new Array(reps).fill(unit).join('');
            track.innerHTML = half + half;
            var mq = document.getElementById('testi-marquee');
            if (mq) mq.classList.remove('hidden');
        }

        var empty = document.getElementById('testi-empty');
        if (empty) empty.classList.add('hidden');     // nascondi l'invito quando ci sono recensioni
    }).catch(e => console.error('[testimonianze]', e));

    window.openTestiModal = function(){ document.getElementById('modal-testi').classList.remove('hidden'); document.body.style.overflow='hidden'; };
    window.closeTestiModal = function(){
        document.getElementById('modal-testi').classList.add('hidden'); document.body.style.overflow='';
        document.getElementById('form-testi').reset();
        document.getElementById('form-testi').classList.remove('hidden');
        document.getElementById('testi-success').classList.add('hidden');
        document.getElementById('testi-count').textContent = '0/300';
    };
    window.submitTestimonianza = function(){
        if (document.getElementById('testi-hp').value) return;
        var last = +localStorage.getItem('testi_last')||0;
        if (Date.now()-last < 60000) { alert('Attendi un minuto prima di inviare di nuovo.'); return; }

        const nome  = document.getElementById('testi-nome').value.trim();
        const ruolo = document.getElementById('testi-ruolo').value.trim();
        const testo = document.getElementById('testi-testo').value.trim();
        const errEl = document.getElementById('testi-error');
        if (!nome || !testo) { errEl.classList.remove('hidden'); return; }
        errEl.classList.add('hidden');

        window.db.collection('testimonianze').add({
            nome, ruolo, testo,
            timestamp: new Date().toISOString(), approvata: false
        }).then(() => {
            localStorage.setItem('testi_last', Date.now());
            document.getElementById('form-testi').classList.add('hidden');
            document.getElementById('testi-success').classList.remove('hidden');
            if (typeof gtag !== 'undefined') gtag('event', 'testimonianza_inviata', { event_category: 'engagement' });
            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_rtxg48l', 'template_fc1c77j', {
                    to_email:  'brescia7@lombardia.agesci.it',
                    nome:      'Nuova testimonianza da approvare',
                    tipo:      'Testimonianza genitore',
                    timestamp: new Date().toLocaleDateString('it-IT'),
                    iban:      '"' + testo + '"\n\n— ' + nome + (ruolo ? ' (' + ruolo + ')' : '') +
                               '\n\nPer approvarla: admin.html → Testimonianze → Approva e pubblica'
                }).catch(e => console.error('[EmailJS]', e));
            }
        }).catch(err => { console.error(err); alert('Errore. Riprova.'); });
    };
})();
