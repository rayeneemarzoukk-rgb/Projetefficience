import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI manquant'); process.exit(1); }

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash('younesefficience', 10);

  const userData = {
    email: 'younes@efficience.fr',
    password: hashedPassword,
    name: 'Younes',
    role: 'admin',
    twoFactorEmail: 'maarzoukrayan3@gmail.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Collection 'users' (utilisée par /api/auth/login et login-2fa)
  const usersCol = db.collection('users');
  await usersCol.deleteOne({ email: 'younes@efficience.fr' });
  await usersCol.insertOne({ ...userData });
  console.log('✅ Ajouté dans collection "users"');

  // Collection 'admins' (utilisée par le modèle Admin)
  const adminsCol = db.collection('admins');
  await adminsCol.deleteOne({ email: 'younes@efficience.fr' });
  await adminsCol.insertOne({ ...userData });
  console.log('✅ Ajouté dans collection "admins"');

  console.log('\n📋 Informations de connexion:');
  console.log('───────────────────────────────');
  console.log('Email:        younes@efficience.fr');
  console.log('Mot de passe: younesefficience');
  console.log('Email 2FA:    maarzoukrayan3@gmail.com');
  console.log('Rôle:         admin');
  console.log('───────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error('❌', e); process.exit(1); });