#!/usr/bin/env python3
"""
Script pour mettre à jour l'utilisateur user22@efficience-dentaire.fr en younis@efficience.fr
et changer son mot de passe (younisefficience) dans MongoDB, sans supprimer les autres utilisateurs.
"""

import os
import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env.local')
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client['rayan_dev2']
users_collection = db['users']

old_email = "user22@efficience-dentaire.fr"
new_email = "younis@efficience.fr"
new_password = "younisefficience"

hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

result = users_collection.update_one(
    {"email": old_email},
    {"$set": {
        "email": new_email,
        "password": hashed_pw,
        "name": "Younis"
    }}
)

if result.modified_count:
    print(f"✅ Utilisateur modifié: {old_email} -> {new_email}, mot de passe changé.")
else:
    print(f"❌ Aucun utilisateur trouvé avec l'email {old_email}.")

client.close()
