import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
import base64

# Charger les variables d'environnement
load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')
client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']

# MODIFIÉ: Sélectionner TOUS les cabinets (plus de filtre par statut)
cabinets = list(db.cabinets.find({}))
print(f"Envoi des rapports à TOUS les {len(cabinets)} cabinets")

api_pdf_url = "http://localhost:5001/api/pdf/rapport"
api_mail_url = "http://localhost:3000/api/send-monthly-report"

for cab in cabinets:
    cabinet_id = cab.get('id')
    nom = cab.get('nom', 'N/A')
    email_dest = cab.get('email')
    period = "Décembre 2025"

    # Générer le PDF dashboard (identique à l'UI)
    pdf_response = requests.get(f"{api_pdf_url}/{cabinet_id}")
    if pdf_response.status_code != 200:
        print(f"Erreur PDF pour {nom}")
        continue
    pdf_base64 = base64.b64encode(pdf_response.content).decode()

    # Envoyer le mail avec le PDF
    payload = {
        "cabinetName": nom,
        "score": cab.get('score', 0),
        "period": period,
        "pdfBuffer": pdf_base64,
        "email": email_dest
    }
    response = requests.post(api_mail_url, json=payload)
    print(f"Envoi du rapport à {email_dest} pour {nom} | status: {response.status_code}")

client.close()