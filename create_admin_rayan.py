#!/usr/bin/env python3
"""
Script pour créer un utilisateur admin avec l'email maarzoukrayan3@gmail.com
"""

from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt
from datetime import datetime

# Charger les variables d'environnement
load_dotenv('.env.local')

MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = os.getenv('MONGODB_DB', 'rayan_dev2')

def create_admin():
    # Connexion MongoDB
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Vérifier si l'utilisateur existe déjà
    existing = db.users.find_one({'email': 'maarzoukrayan3@gmail.com'})
    if existing:
        print("⚠️  L'utilisateur existe déjà!")
        return
    
    # Hash du mot de passe
    password = "Rayene2026"  # Changez ce mot de passe !
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Créer l'utilisateur admin
    user = {
        'name': 'Rayan Maarzouk',
        'email': 'maarzoukrayan3@gmail.com',
        'phone': '06 12 34 56 78',
        'password': password_hash,
        'role': 'admin',
        'isActive': True,
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    }
    
    # Insérer dans MongoDB
    result = db.users.insert_one(user)
    
    print("✅ Utilisateur admin créé avec succès!")
    print(f"📧 Email: maarzoukrayan3@gmail.com")
    print(f"🔑 Mot de passe: {password}")
    print(f"👤 Rôle: admin")
    print(f"🆔 ID: {result.inserted_id}")
    
    client.close()

if __name__ == '__main__':
    create_admin()
