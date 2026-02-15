import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire .env.local manuellement
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.substring(0, eqIndex).trim();
  const value = trimmed.substring(eqIndex + 1).trim();
  process.env[key] = value;
}

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI found:', MONGODB_URI ? 'YES' : 'NO');

if (!MONGODB_URI) {
  console.error('MONGODB_URI manquant');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

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

  const usersCol = db.collection('users');
  await usersCol.deleteOne({ email: 'younes@efficience.fr' });
  await usersCol.insertOne({ ...userData });
  console.log('Added to users collection');

  const adminsCol = db.collection('admins');
  await adminsCol.deleteOne({ email: 'younes@efficience.fr' });
  await adminsCol.insertOne({ ...userData });
  console.log('Added to admins collection');

  console.log('');
  console.log('=== CONNEXION INFO ===');
  console.log('Email:        younes@efficience.fr');
  console.log('Password:     younesefficience');
  console.log('2FA Email:    maarzoukrayan3@gmail.com');
  console.log('Role:         admin');
  console.log('======================');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
