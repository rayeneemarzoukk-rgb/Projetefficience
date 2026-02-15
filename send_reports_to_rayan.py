#!/usr/bin/env python3
"""
Envoie automatique des rapports mensuels par email pour TOUS les cabinets (modifié - plus de filtre par statut).
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']

# Adresse email cible
email_dest = "maarzoukrayan3@gmail.com"

# MODIFIÉ: Récupérer TOUS les cabinets (plus de filtre par statut)
cabinets = list(db.cabinets.find({}))
print(f"Envoi des rapports à TOUS les {len(cabinets)} cabinets")

print(f"Nombre de mails à envoyer : {len(cabinets)}")

for cab in cabinets:
    nom = cab.get('nom', 'N/A')
    score = cab.get('score', 0)
    # Ici, on simule l'envoi (remplacez par appel à votre service Node.js/TS si besoin)
    print(f"Envoi du rapport à {email_dest} pour cabinet : {nom} | score : {score}")
    # TODO: Appeler le service d'envoi réel (API ou script Node.js)

client.close()
