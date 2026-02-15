import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']

# MODIFIÉ: Envoyer à TOUS les cabinets sans exception (filtre statut supprimé)
cabinets_envoyes = list(db.cabinets.find({}))  # Tous les cabinets
# Plus de cabinets non envoyés - tous reçoivent leur rapport
cabinets_non_envoyes = []

print(f"Nombre de mails à envoyer : {len(cabinets_envoyes)} (TOUS les cabinets)")
print(f"Nombre de rapports non envoyés : {len(cabinets_non_envoyes)}")

email_dest = "maarzoukrayan3@gmail.com"
api_url = "http://localhost:3000/api/send-monthly-report"

for cab in cabinets_envoyes:
    nom = cab.get('nom', 'N/A')
    score = cab.get('score', 0)
    period = "Décembre 2025"
    pdfBuffer = ""  # Remplacez par le PDF en base64 si disponible
    payload = {
        "cabinetName": nom,
        "score": score,
        "period": period,
        "pdfBuffer": pdfBuffer,
        "email": email_dest
    }
    response = requests.post(api_url, json=payload)
    print(f"Envoi du rapport à {email_dest} pour cabinet : {nom} | score : {score} | status: {response.status_code}")
    print(response.json())

client.close()