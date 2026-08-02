/**
 * Build dei partials condivisi (header/footer) nelle pagine del sito.
 *
 * Uso:  node build.js
 *
 * Per modificare navbar o footer NON toccare le pagine: modifica
 * partials/header.html o partials/footer.html e rilancia questo script.
 * (Per le classi Tailwind nuove rilanciare anche:
 *  npx tailwindcss -i tw-input.css -o assets/tailwind.css --minify)
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAGES = ['index.html','chi-siamo.html','unita.html','calendario.html','faq.html','rassegna-stampa.html','privacy.html'];

const header = fs.readFileSync(path.join(ROOT,'partials','header.html'),'utf8').trim();
const footer = fs.readFileSync(path.join(ROOT,'partials','footer.html'),'utf8').trim();

const H_START = '<!-- SITE-HEADER:START (generato da build.js — modificare partials/header.html) -->';
const H_END   = '<!-- SITE-HEADER:END -->';
const F_START = '<!-- SITE-FOOTER:START (generato da build.js — modificare partials/footer.html) -->';
const F_END   = '<!-- SITE-FOOTER:END -->';

for (const page of PAGES) {
  const file = path.join(ROOT, page);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  const hBlock = `${H_START}\n${header}\n${H_END}`;
  const fBlock = `${F_START}\n${footer}\n${F_END}`;

  if (html.includes(H_START)) {
    // aggiornamento: sostituisci il blocco esistente
    html = html.replace(new RegExp(escapeRe(H_START) + '[\\s\\S]*?' + escapeRe(H_END)), hBlock);
  } else {
    // prima migrazione: sostituisci il vecchio blocco topbar+nav
    html = html.replace(/<!--[^>]*TOP BAR[^>]*-->[\s\S]*?<\/nav>/, hBlock);
  }

  if (html.includes(F_START)) {
    html = html.replace(new RegExp(escapeRe(F_START) + '[\\s\\S]*?' + escapeRe(F_END)), fBlock);
  } else {
    // prima migrazione: footer principale (bg-gray-950), non i <footer> interni
    html = html.replace(/<footer[^>]*class="bg-gray-950[^"]*"[^>]*>[\s\S]*?<\/footer>/, fBlock);
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('OK  ' + page);
  } else {
    console.log('SKIP ' + page + ' (nessun blocco trovato)');
  }
}

function escapeRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
