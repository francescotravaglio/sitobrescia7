// Banner cookie GDPR + Google Consent Mode v2.
// Il default "denied" è impostato inline nel <head> di ogni pagina, PRIMA di gtag config:
// Analytics non parte finché l'utente non accetta. Qui gestiamo banner e scelta salvata.
(function(){
    var KEY = 'cookie_consent_v1';
    function gtagSafe(){ if (typeof gtag === 'function') gtag.apply(null, arguments); }

    function applica(stato){
        // aggiorna Consent Mode
        gtagSafe('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': stato === 'accettato' ? 'granted' : 'denied'
        });
    }

    var scelta = null;
    try { scelta = localStorage.getItem(KEY); } catch(e){}

    if (scelta === 'accettato' || scelta === 'rifiutato') {
        applica(scelta);              // rispetta la scelta precedente
        return;                       // niente banner
    }

    // ── mostra il banner ──
    function salva(stato){
        try { localStorage.setItem(KEY, stato); } catch(e){}
        applica(stato);
        var b = document.getElementById('cookie-banner');
        if (b){ b.style.transform = 'translateY(120%)'; setTimeout(function(){ b.remove(); }, 350); }
    }

    function render(){
        if (document.getElementById('cookie-banner')) return;
        var div = document.createElement('div');
        div.id = 'cookie-banner';
        div.setAttribute('role','dialog');
        div.setAttribute('aria-label','Informativa cookie');
        div.style.cssText = 'position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:9500;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:1.25rem;box-shadow:0 20px 50px rgba(0,0,0,.18);padding:1.25rem 1.4rem;font-family:Montserrat,sans-serif;transition:transform .35s ease;transform:translateY(0)';
        div.innerHTML =
            '<div style="display:flex;gap:.9rem;align-items:flex-start">' +
                '<div style="font-size:1.6rem;line-height:1;flex-shrink:0">🍪</div>' +
                '<div style="flex:1">' +
                    '<div style="font-weight:900;color:#003366;font-size:.95rem;margin-bottom:.25rem">Rispettiamo la tua privacy</div>' +
                    '<p style="color:#6b7280;font-size:.8rem;line-height:1.45;margin:0 0 .9rem">Usiamo cookie tecnici (sempre attivi) e, solo col tuo consenso, Google Analytics per capire come migliorare il sito. Puoi cambiare idea quando vuoi.</p>' +
                    '<div style="display:flex;gap:.6rem;flex-wrap:wrap">' +
                        '<button id="cookie-ok" style="background:#003366;color:#fff;font-weight:800;font-size:.8rem;border:none;border-radius:.7rem;padding:.6rem 1.2rem;cursor:pointer">Accetta tutti</button>' +
                        '<button id="cookie-no" style="background:#f3f4f6;color:#374151;font-weight:700;font-size:.8rem;border:none;border-radius:.7rem;padding:.6rem 1.2rem;cursor:pointer">Solo necessari</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(div);
        document.getElementById('cookie-ok').onclick = function(){ salva('accettato'); };
        document.getElementById('cookie-no').onclick = function(){ salva('rifiutato'); };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();

    // permette un eventuale link "Gestisci cookie" nel footer
    window.riapriCookie = function(){ try { localStorage.removeItem(KEY); } catch(e){} render(); };
})();
