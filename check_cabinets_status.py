#!/usr/bin/env python3
"""
Afficher les statuts, rapportStatut et mailStatut de tous les cabinets dans MongoDB
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']

print("\nDétails des cabinets :\n")
for doc in db.cabinets.find({}, {"nom": 1, "statut": 1, "rapportStatut": 1, "mailStatut": 1}):
    print(f"- {doc.get('nom', 'N/A')} | statut: {doc.get('statut', 'N/A')} | rapportStatut: {doc.get('rapportStatut', 'N/A')} | mailStatut: {doc.get('mailStatut', 'N/A')}")

client.close()
