#!/usr/bin/env python3
"""
Script pour mettre à jour le statut des rapports cabinets
"""
import os
import sys
from datetime import datetime
from pymongo import MongoClient

# Connexion MongoDB - connection string fixe
MONGODB_URI = "mongodb+srv://rayan_dev2:weshwesh123AA--@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2?retryWrites=true&w=majority&appName=efficienceprojet"

print(f"🔗 Connexion à MongoDB...")
client = MongoClient(MONGODB_URI)
db = client.get_default_database()
cabinets_collection = db['cabinets']

# Récupérer tous les cabinets
cabinets = list(cabinets_collection.find().sort('score', -1))

if not cabinets:
    print("❌ Aucun cabinet trouvé")
    sys.exit(1)

print(f"📊 Total de cabinets: {len(cabinets)}")

# Afficher les cabinets actuels
print("\n=== CABINETS AVANT MODIFICATION ===")
for i, cab in enumerate(cabinets, 1):
    print(f"{i}. {cab.get('nom', 'N/A')} - Score: {cab.get('score', 'N/A')}% - Statut: {cab.get('rapportStatut', 'N/A')}")

# Mettre à jour les 3 premiers (meilleurs scores) avec statut "sent"
now = datetime.now()
date_str = now.strftime("%d/%m/%Y %H:%M")

top_3_ids = []
for i, cab in enumerate(cabinets[:3]):
    top_3_ids.append(cab['_id'])
    result = cabinets_collection.update_one(
        {'_id': cab['_id']},
        {
            '$set': {
                'rapportStatut': 'sent',
                'dateEnvoiRapport': date_str,
                'dateGenerationRapport': date_str
            }
        }
    )
    print(f"\n✅ Cabinet '{cab['nom']}' (Score: {cab['score']}%) - MISE À JOUR: rapportStatut='sent'")

# Mettre à jour les autres avec statut "not_generated" ou "generated"
for i, cab in enumerate(cabinets[3:], 4):
    result = cabinets_collection.update_one(
        {'_id': cab['_id']},
        {
            '$set': {
                'rapportStatut': 'not_generated'
            }
        }
    )
    print(f"✅ Cabinet '{cab['nom']}' (Score: {cab['score']}%) - MISE À JOUR: rapportStatut='not_generated'")

# Vérification
print("\n=== CABINETS APRÈS MODIFICATION ===")
cabinets_updated = list(cabinets_collection.find().sort('score', -1))

sent_count = sum(1 for c in cabinets_updated if c.get('rapportStatut') == 'sent')
not_gen_count = sum(1 for c in cabinets_updated if c.get('rapportStatut') == 'not_generated')
gen_count = sum(1 for c in cabinets_updated if c.get('rapportStatut') == 'generated')

for i, cab in enumerate(cabinets_updated, 1):
    print(f"{i}. {cab.get('nom', 'N/A')} - Score: {cab.get('score', 'N/A')}% - Statut: {cab.get('rapportStatut', 'N/A')}")

print(f"\n📧 RésumÉ:")
print(f"   ✅ Emails Envoyés (sent): {sent_count}")
print(f"   📋 Rapports Générés (generated): {gen_count}")
print(f"   ❌ Non Générés (not_generated): {not_gen_count}")
print(f"   📊 Total: {len(cabinets_updated)}")
print("\n✅ Mise à jour terminée!")

client.close()
