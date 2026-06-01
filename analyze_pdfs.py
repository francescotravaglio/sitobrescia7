# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import pdfplumber

FORMS = [
    (r"C:\Users\mimi\Desktop\Sito Brescia 7\documents\modulo-adesione-minorenne.pdf",
     "modulo-adesione-minorenne.pdf"),
    (r"C:\Users\mimi\Desktop\Sito Brescia 7\documents\scheda-sanitaria-minorenne.pdf",
     "scheda-sanitaria-minorenne.pdf"),
]

# Human-readable field names keyed by (form_idx, page, x0_approx, top_approx)
FIELD_NAMES = {
    # ===== modulo-adesione-minorenne.pdf (form_idx=0) =====
    # PAGE 1 - Three blocks of guardian data (Genitore 1/2/3)
    # Block 1: tops 227,250,273,296,319,342
    (0,1,172,227): "Genitore1_NomeCognome",
    (0,1,453,227): "Genitore1_Sesso",
    (0,1,172,250): "Genitore1_NatoA_Citta",
    (0,1,379,250): "Genitore1_NatoA_Prov",
    (0,1,452,250): "Genitore1_DataNascita",
    (0,1,172,273): "Genitore1_CodiceFiscale",
    (0,1,472,273): "Genitore1_Telefono",
    (0,1,105,296): "Genitore1_Indirizzo",
    (0,1,472,296): "Genitore1_NumCivico",
    (0,1,105,319): "Genitore1_Citta",
    (0,1,398,319): "Genitore1_CAP",
    (0,1,465,319): "Genitore1_Provincia",
    (0,1,125,342): "Genitore1_Email",
    (0,1,397,342): "Genitore1_Cellulare",
    # Block 2: tops 370,393,416,439,462,486
    (0,1,172,370): "Genitore2_NomeCognome",
    (0,1,453,370): "Genitore2_Sesso",
    (0,1,172,393): "Genitore2_NatoA_Citta",
    (0,1,379,393): "Genitore2_NatoA_Prov",
    (0,1,452,393): "Genitore2_DataNascita",
    (0,1,172,416): "Genitore2_CodiceFiscale",
    (0,1,472,416): "Genitore2_Telefono",
    (0,1,105,439): "Genitore2_Indirizzo",
    (0,1,472,439): "Genitore2_NumCivico",
    (0,1,105,462): "Genitore2_Citta",
    (0,1,398,462): "Genitore2_CAP",
    (0,1,465,462): "Genitore2_Provincia",
    (0,1,125,486): "Genitore2_Email",
    (0,1,397,486): "Genitore2_Cellulare",
    # Block 3: tops 537,560,583,607,630,653
    (0,1,172,537): "Genitore3_NomeCognome",
    (0,1,453,537): "Genitore3_Sesso",
    (0,1,172,560): "Genitore3_NatoA_Citta",
    (0,1,379,560): "Genitore3_NatoA_Prov",
    (0,1,452,560): "Genitore3_DataNascita",
    (0,1,172,583): "Genitore3_CodiceFiscale",
    (0,1,472,583): "Genitore3_Telefono",
    (0,1,105,607): "Genitore3_Indirizzo",
    (0,1,471,607): "Genitore3_NumCivico",
    (0,1,105,630): "Genitore3_Citta",
    (0,1,398,630): "Genitore3_CAP",
    (0,1,465,630): "Genitore3_Provincia",
    (0,1,125,653): "Genitore3_Email",
    (0,1,397,653): "Genitore3_Cellulare",
    (0,1,191,699): "Gruppo_NomeGruppo",
    # PAGE 2 - il minore
    (0,2,134,150): "Minore_NomeCognome",
    (0,2,459,150): "Minore_Sesso",
    (0,2,179,173): "Minore_NatoA_Citta",
    (0,2,385,173): "Minore_NatoA_Prov",
    (0,2,459,173): "Minore_DataNascita",
    (0,2,152,196): "Minore_CodiceFiscale",
    (0,2,485,196): "Minore_Telefono",
    (0,2,238,219): "Minore_Indirizzo",
    (0,2,484,219): "Minore_NumCivico",
    (0,2,112,242): "Minore_Citta",
    (0,2,396,242): "Minore_CAP",
    (0,2,472,242): "Minore_Provincia",
    (0,2,118,266): "Minore_Email",
    (0,2,395,266): "Minore_Cellulare",
    (0,2,232,682): "Trasporto_Note",
    # PAGE 3 - firma/data
    (0,3,198,599): "Data_Domanda",
    (0,3,338,599): "Luogo_Domanda",
    (0,3,65,637):  "Firma1",
    (0,3,305,637): "Ruolo1",
    (0,3,65,665):  "Firma2",
    (0,3,305,665): "Ruolo2",
    # PAGE 5 - quote / ricevuta
    (0,5,485,166): "Quota_Censimento",
    (0,5,485,179): "Quota_IntegrativaGruppo",
    (0,5,485,193): "Quota_IntegrativaZona",
    (0,5,485,207): "Quota_IntegrativaRegione",
    (0,5,485,221): "Quota_Totale",
    (0,5,166,344): "Ricevuta1_NomeFirmatario",
    (0,5,72,367):  "Ricevuta1_Luogo",
    (0,5,246,367): "Ricevuta1_Data",
    (0,5,98,435):  "Ricevuta1_DataFirma",
    (0,5,212,435): "Ricevuta1_LuogoFirma",
    (0,5,152,550): "Ricevuta2_NomeSocio",
    (0,5,247,550): "Ricevuta2_NrSocio",
    (0,5,432,550): "Ricevuta2_Gruppo",
    (0,5,480,550): "Ricevuta2_NrGruppo",
    (0,5,253,573): "Ricevuta2_Versante",
    (0,5,106,596): "Ricevuta2_SommaNote",
    (0,5,66,636):  "Ricevuta2_Luogo",
    (0,5,228,636): "Ricevuta2_Data",
    (0,5,114,663): "Ricevuta2_DataFirma2",
    (0,5,227,663): "Ricevuta2_LuogoFirma2",

    # ===== scheda-sanitaria-minorenne.pdf (form_idx=1) =====
    # PAGE 1 - Three guardian blocks (same layout)
    # Block 1: tops 227,250,273,296,319,342
    (1,1,172,227): "SS_Genitore1_NomeCognome",
    (1,1,466,227): "SS_Genitore1_Sesso",
    (1,1,159,250): "SS_Genitore1_NatoA_Citta",
    (1,1,466,250): "SS_Genitore1_DataNascita",
    (1,1,159,273): "SS_Genitore1_CodiceFiscale",
    (1,1,472,273): "SS_Genitore1_Telefono",
    (1,1,106,296): "SS_Genitore1_Indirizzo",
    (1,1,472,296): "SS_Genitore1_NumCivico",
    (1,1,126,319): "SS_Genitore1_Citta",
    (1,1,398,319): "SS_Genitore1_CAP",
    (1,1,125,342): "SS_Genitore1_Email",
    (1,1,397,342): "SS_Genitore1_Cellulare",
    # Block 2: tops 370,393,416,439,462,486
    (1,1,172,370): "SS_Genitore2_NomeCognome",
    (1,1,466,370): "SS_Genitore2_Sesso",
    (1,1,159,393): "SS_Genitore2_NatoA_Citta",
    (1,1,466,393): "SS_Genitore2_DataNascita",
    (1,1,159,416): "SS_Genitore2_CodiceFiscale",
    (1,1,472,416): "SS_Genitore2_Telefono",
    (1,1,106,439): "SS_Genitore2_Indirizzo",
    (1,1,472,439): "SS_Genitore2_NumCivico",
    (1,1,126,462): "SS_Genitore2_Citta",
    (1,1,398,462): "SS_Genitore2_CAP",
    (1,1,125,486): "SS_Genitore2_Email",
    (1,1,397,486): "SS_Genitore2_Cellulare",
    # Block 3: tops 537,560,583,607,630,653
    (1,1,172,537): "SS_Genitore3_NomeCognome",
    (1,1,466,537): "SS_Genitore3_Sesso",
    (1,1,159,560): "SS_Genitore3_NatoA_Citta",
    (1,1,466,560): "SS_Genitore3_DataNascita",
    (1,1,159,583): "SS_Genitore3_CodiceFiscale",
    (1,1,472,583): "SS_Genitore3_Telefono",
    (1,1,106,607): "SS_Genitore3_Indirizzo",
    (1,1,472,607): "SS_Genitore3_NumCivico",
    (1,1,126,630): "SS_Genitore3_Citta",
    (1,1,398,630): "SS_Genitore3_CAP",
    (1,1,125,653): "SS_Genitore3_Email",
    (1,1,397,653): "SS_Genitore3_Cellulare",
    # PAGE 2 - minore + health data
    (1,2,119,242): "SS_Minore_Cognome",
    (1,2,319,242): "SS_Minore_NomePadre",
    (1,2,426,242): "SS_Minore_Nome",
    (1,2,106,260): "SS_Minore_NatoA_Citta",
    (1,2,359,260): "SS_Minore_NatoA_Prov",
    (1,2,426,260): "SS_Minore_DataNascita",
    (1,2,139,277): "SS_Minore_CodiceFiscale",
    (1,2,193,277): "SS_Minore_CodiceFiscale2",
    (1,2,359,277): "SS_Minore_NrTesseraSanitaria",
    (1,2,192,295): "SS_ContattoEmergenza_NomeCognome",
    (1,2,353,295): "SS_ContattoEmergenza_Telefono",
    (1,2,66,366):  "SS_Condizioni_riga1",
    (1,2,66,384):  "SS_Condizioni_riga2",
    (1,2,65,402):  "SS_Profilassi_riga3",
    (1,2,66,448):  "SS_Allergie_riga1",
    (1,2,66,466):  "SS_Allergie_riga2",
    (1,2,65,483):  "SS_Allergie_riga3",
    (1,2,212,507): "SS_NoteSanitarie_riga1",
    (1,2,66,525):  "SS_NoteSanitarie_riga2",
    (1,2,65,543):  "SS_NoteSanitarie_riga3",
    (1,2,105,576): "SS_DataFirma",
    (1,2,225,576): "SS_LuogoFirma",
    (1,2,65,624):  "SS_Firma1",
    (1,2,305,624): "SS_Ruolo1",
    (1,2,65,666):  "SS_Firma2",
    (1,2,305,666): "SS_Ruolo2",
}

print("// ============================================================")
print("// AGESCI PDF Form Field Coordinates for pdf-lib")
print("// Page size: 612 x 792 pt (both forms)")
print("// Coordinate system: pdf-lib (origin = bottom-left of page)")
print("// y = 792 - top_from_top + 2  (text sits just above the underline)")
print("// x = x0 of underline + 2 (small left padding)")
print("// Recommended font size: 8pt")
print("// ============================================================")
print()

for form_idx, (path, name) in enumerate(FORMS):
    print("// " + "=" * 60)
    print("// FORM: " + name)
    print("// " + "=" * 60)
    with pdfplumber.open(path) as pdf:
        for pg_idx, page in enumerate(pdf.pages, 1):
            fields = [r for r in page.rects if (r['y1']-r['y0']) < 2 and (r['x1']-r['x0']) > 25]
            fields.sort(key=lambda r: (r['top'], r['x0']))
            if not fields:
                continue
            print("\n// --- Page %d ---" % pg_idx)
            for f in fields:
                x0 = int(round(f['x0']))
                x1 = int(round(f['x1']))
                top = f['top']
                y_pdfl = int(round(792 - top + 2))
                width = x1 - x0

                fname = None
                for (fi, fp, fx, ft), fn in FIELD_NAMES.items():
                    if fi == form_idx and fp == pg_idx and abs(fx - x0) < 6 and abs(ft - top) < 2:
                        fname = fn
                        break
                if fname is None:
                    fname = "field_p%d_x%d_y%d" % (pg_idx, x0, int(top))

                print("  { page: %d, field: '%-40s x: %3d, y: %3d, maxWidth: %3d }," % (
                    pg_idx, fname+"',", x0+2, y_pdfl, width-4))
