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
