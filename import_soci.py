"""
Importa ElencoCensimentoGruppo.xlsx in Firestore soci_lista
Doc ID = CodiceSocio (stringa)
"""
import pandas as pd
import requests
import json

EXCEL = r'C:\Users\mimi\Downloads\ElencoCensimentoGruppo_20260410.xlsx'
API_KEY = 'AIzaSyCABGrbUk5baqcak-iejkJtDsfkaY66III'
PROJECT = 'agescibrescia7-508b0'
COLLECTION = 'soci_lista'
BASE = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'

def to_fs(value):
    """Converti un valore Python nel formato Firestore."""
    if value is None or (isinstance(value, float) and str(value) == 'nan'):
        return {'nullValue': None}
    if isinstance(value, bool):
        return {'booleanValue': value}
    if isinstance(value, int):
        return {'integerValue': str(value)}
    if isinstance(value, float):
        return {'doubleValue': value}
    # Dates from pandas come as Timestamp
    try:
        import pandas as pd
        if isinstance(value, pd.Timestamp):
            return {'stringValue': value.strftime('%d/%m/%Y')}
    except Exception:
        pass
    return {'stringValue': str(value)}

df = pd.read_excel(EXCEL, sheet_name='ElencoSoci', dtype=str)
# Rimuovi spazi extra nei nomi colonne
df.columns = [c.strip() for c in df.columns]

print(f'Trovati {len(df)} soci. Avvio importazione...\n')
ok = 0
err = 0

for _, row in df.iterrows():
    codice = str(row.get('CodiceSocio', '')).strip()
    if not codice or codice == 'nan':
        continue

    fields = {}
    for col, val in row.items():
        fields[col] = to_fs(val if str(val) != 'nan' else None)

    body = {'fields': fields}
    url = f'{BASE}/{COLLECTION}/{codice}?key={API_KEY}'
    r = requests.patch(url, json=body)

    if r.status_code in (200, 201):
        nome = str(row.get('Nome','')).strip()
        cognome = str(row.get('Cognome','')).strip()
        print(f'  OK {codice} - {nome} {cognome}')
        ok += 1
    else:
        print(f'  ERR {codice} - {r.status_code}: {r.text[:120]}')
        err += 1

print(f'\nImportazione completata: {ok} OK, {err} errori.')
