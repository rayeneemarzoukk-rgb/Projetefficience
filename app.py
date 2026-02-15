import io
import os
import subprocess
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Charger les variables d'environnement (lien MongoDB)
load_dotenv()

app = Flask(__name__)

# Configuration CORS pour Next.js (ports 3000, 3001, 3002)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3002"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

# --- 1. CONNEXION MONGODB ATLAS ---
MONGO_URI = os.getenv('MONGODB_URI', "mongodb+srv://rayan_dev2:weshwesh123AA--@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2?retryWrites=true&w=majority&appName=efficienceprojet")
client = MongoClient(MONGO_URI)
db = client['rayan_dev2']

# --- 2. ROUTES CABINET ---
@app.route('/api/cabinet-info', methods=['GET'])
def get_cabinet():
    info = {
        "nom": "Cabinet Dentaire Efficience",
        "adresse": "12 Bis Avenue des Champs-Élysées, Paris",
        "telephone": "01 45 67 89 10",
        "taux_occupation": "10%"
    }
    return jsonify({"success": True, "info": info})

# --- 3. ROUTES PATIENTS (CRUD - MONGODB) ---
@app.route('/api/get-patients', methods=['GET'])
def get_patients():
    try:
        patients_from_db = list(db.patients.find())
        for p in patients_from_db:
            p['id'] = str(p['_id'])
            del p['_id']
        return jsonify({
            "success": True, 
            "patients": patients_from_db,
            "server_time": datetime.now().strftime("%H:%M:%S")
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/add-patient', methods=['POST'])
def add_patient():
    try:
        new_p = request.json
        if 'id' in new_p: del new_p['id']
        result = db.patients.insert_one(new_p)
        new_p['id'] = str(result.inserted_id)
        return jsonify({"success": True, "patient": new_p}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/delete-patient/<id>', methods=['DELETE'])
def delete_patient(id):
    try:
        if not id or id == 'undefined' or id == 'null':
            return jsonify({"success": False, "error": "ID invalide"}), 400
        try:
            result = db.patients.delete_one({"_id": ObjectId(id)})
        except:
            result = db.patients.delete_one({"id": id})
        if result.deleted_count == 0:
            return jsonify({"success": False, "error": "Patient non trouvé"}), 404
        return jsonify({"success": True, "message": "Supprimé"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# --- 4. ROUTES DASHBOARD & STATS ---
@app.route('/api/dashboard-stats', methods=['GET'])
def stats():
    try:
        total_patients = db.patients.count_documents({})
        return jsonify({
            "success": True, 
            "stats": {
                "totalPatients": total_patients, 
                "chiffreAffaires": total_patients * 60, 
                "rdvToday": 3
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# --- 5. EXPORT PDF DASHBOARD (Puppeteer) ---
@app.route('/api/pdf/rapport/<cabinet_id>', methods=['GET'])
def pdf_rapport(cabinet_id):
    """
    Génère un PDF du dashboard Next.js pour le cabinet donné.
    Nécessite Puppeteer installé localement dans le projet (npm install puppeteer).
    Compatible Windows : utilise ./tmp/ au lieu de /tmp/
    """
    try:
        # Créer le dossier tmp s'il n'existe pas
        os.makedirs("./tmp", exist_ok=True)

        # URL de la page Next.js à capturer (adapter si besoin)
        base_url = os.getenv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000")
        rapport_url = f"{base_url}/rapport/{cabinet_id}"
        output_path = f"./tmp/rapport-{cabinet_id}.pdf"

        # Script Puppeteer généré à la volée
        puppeteer_script = f"""
const puppeteer = require('puppeteer');
(async () => {{
  const browser = await puppeteer.launch({{ args: ['--no-sandbox', '--disable-setuid-sandbox'] }});
  const page = await browser.newPage();
  await page.goto('{rapport_url}', {{ waitUntil: 'networkidle0' }});
  await page.pdf({{ path: '{output_path}', format: 'A4' }});
  await browser.close();
}})();
"""
        # Écrire le script temporairement
        script_path = "./tmp/puppeteer-pdf.js"
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(puppeteer_script)

        # Exécuter le script Puppeteer dans le dossier du projet (pour node_modules local)
        subprocess.run(["node", script_path], check=True, cwd=os.path.abspath("."))

        # Envoyer le PDF généré
        return send_file(output_path, as_attachment=True, download_name=f"rapport-{cabinet_id}.pdf", mimetype='application/pdf')
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Serveur Flask lancé sur http://localhost:5001")
    app.run(debug=True, port=5001, use_reloader=False)