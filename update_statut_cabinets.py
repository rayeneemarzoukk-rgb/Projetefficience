import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']

def get_statut(score):
    if score >= 90:
        return "OK"
    elif score >= 80:
        return "À surveiller"
    else:
        return "À surveiller"

for cab in db.cabinets.find():
    statut = get_statut(cab.get('score', 0))
    db.cabinets.update_one({'_id': cab['_id']}, {'$set': {'statut': statut}})
    print(f"{cab.get('nom')} → statut mis à jour : {statut}")

client.close()