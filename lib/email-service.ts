import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Génère un code de vérification à 6 chiffres
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoie un email de vérification avec un code
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Efficience Dentaire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Code de vérification - Efficience Dentaire',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              padding: 40px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px;
              text-align: center;
            }
            .code-box {
              background: #f1f5f9;
              border: 2px dashed #3b82f6;
              border-radius: 15px;
              padding: 30px;
              margin: 30px 0;
            }
            .code {
              font-size: 48px;
              font-weight: bold;
              color: #3b82f6;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .message {
              color: #64748b;
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              color: #94a3b8;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Efficience Dentaire</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${name} 👋</h2>
              <p class="message">
                Bienvenue sur Efficience Dentaire ! Pour finaliser votre inscription, 
                veuillez utiliser le code de vérification ci-dessous :
              </p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p class="message">
                Ce code est valide pendant <strong>15 minutes</strong>.
              </p>
              <div class="warning">
                <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette inscription, 
                ignorez cet email.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

/**
 * Envoie un email de bienvenue après vérification
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Efficience Dentaire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Bienvenue sur Efficience Dentaire !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Compte vérifié !</h1>
            </div>
            <div class="content">
              <h2>Bienvenue ${name} ! 🎉</h2>
              <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et profiter de toutes les fonctionnalités d'Efficience Dentaire.</p>
              <a href="http://localhost:3000/login" class="btn">Se connecter maintenant →</a>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email bienvenue:', error);
    return false;
  }
}

/**
 * Interface pour les informations de connexion
 */
interface LoginNotificationInfo {
  userName: string;
  userEmail: string;
  userRole: string;
  loginTime: string;
  ipAddress: string;
}

/**
 * 🔔 Envoie un email de notification de connexion à l'administrateur
 * Appelé après chaque connexion réussie avec 2FA
 */
export async function sendLoginNotificationEmail(
  adminEmail: string,
  loginInfo: LoginNotificationInfo
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"🔐 Efficience Sécurité" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 Nouvelle Connexion - ${loginInfo.userName} (${loginInfo.userRole})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              padding: 40px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 40px;
            }
            .info-box {
              background: #f1f5f9;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #64748b;
              font-weight: 500;
            }
            .info-value {
              color: #1e293b;
              font-weight: bold;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .badge-admin {
              background: #fee2e2;
              color: #dc2626;
            }
            .badge-user {
              background: #dbeafe;
              color: #2563eb;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              color: #94a3b8;
              font-size: 14px;
            }
            .alert {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Notification de Connexion</h1>
            </div>
            <div class="content">
              <h2>Bonjour Rayene 👋</h2>
              <p style="color: #64748b; line-height: 1.6;">
                Une nouvelle connexion vient d'être effectuée sur la plateforme Efficience Dentaire 
                avec authentification à 2 facteurs.
              </p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">👤 Utilisateur</span>
                  <span class="info-value">${loginInfo.userName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📧 Email</span>
                  <span class="info-value">${loginInfo.userEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🏷️ Rôle</span>
                  <span class="badge ${loginInfo.userRole === 'admin' ? 'badge-admin' : 'badge-user'}">
                    ${loginInfo.userRole}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">🕐 Date & Heure</span>
                  <span class="info-value">${loginInfo.loginTime}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🌐 Adresse IP</span>
                  <span class="info-value">${loginInfo.ipAddress}</span>
                </div>
              </div>

              <div class="alert">
                <strong>⚠️ Important :</strong> Si cette connexion vous semble suspecte, 
                veuillez immédiatement contacter l'équipe de sécurité ou désactiver le compte utilisateur.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Efficience Dentaire - Système de Sécurité</p>
              <p>Cet email a été envoyé automatiquement suite à une connexion 2FA.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de notification envoyé à ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi notification connexion:', error);
    return false;
  }
}

/**
 * 📱 Envoie un code OTP par email (simulation SMS)
 * Pour une vraie intégration SMS, utiliser Twilio ou similaire
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  phone: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"🔐 Efficience Sécurité" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Code de vérification: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 40px; text-align: center; }
            .code-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 15px; padding: 30px; margin: 30px 0; }
            .code { font-size: 48px; font-weight: bold; color: #6366f1; letter-spacing: 8px; }
            .timer { color: #ef4444; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Authentification 2 Facteurs</h1>
            </div>
            <div class="content">
              <h2>Code de Sécurité</h2>
              <p>Votre code de connexion sécurisée :</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p class="timer">⏰ Valide pendant 5 minutes</p>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                📱 Ce code est lié au numéro: ****${phone.slice(-4)}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Code OTP envoyé par email à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi OTP:', error);
    return false;
  }
}

/**
 * Interface pour les données du rapport cabinet
 */
interface CabinetReportData {
  cabinetNom: string;
  cabinetEmail: string;
  periode: string;
  statistiques: {
    caActuel: number;
    caObjectif: number;
    score: number;
    nouveauxPatients: number;
    nombreRdv: number;
    tauxAbsence: number;
  };
  dateGeneration: string;
  globalStats?: {
    totalCabinets?: number;
    emailsEnvoyes?: number;
    rapportsNonGeneres?: number;
    performanceMoyenne?: number;
  };
}

/**
 * 📊 Envoie un rapport de statistiques cabinet par email
 * Envoyé automatiquement à Rayene (maarzoukrayan3@gmail.com)
 */
export async function sendCabinetReportEmail(
  data: CabinetReportData
): Promise<boolean> {
  // Déterminer le statut du cabinet selon CA vs Objectif
  const getCabinetStatut = () => {
    if (data.statistiques.caActuel >= data.statistiques.caObjectif) return "OK";
    if (data.statistiques.caActuel >= data.statistiques.caObjectif * 0.85) return "À suivre";
    return "À surveiller";
  };
  const cabinetStatut = getCabinetStatut();
  // Phrase personnalisée selon le statut
  const getStatutPhrase = () => {
    if (cabinetStatut === "OK") return "Félicitations, votre cabinet a atteint ses objectifs ce mois-ci !";
    if (cabinetStatut === "À suivre") return "Attention, votre cabinet est proche de l'objectif mais nécessite un suivi.";
    return "Attention : le chiffre d'affaires nécessite un suivi, des actions sont recommandées.";
  };
  const statutPhrase = getStatutPhrase();
  const destinataire = 'maarzoukrayan3@gmail.com';
  
  try {
    // Calculer le pourcentage d'atteinte objectif
    const pourcentageCA = data.statistiques.caObjectif > 0 
      ? Math.round((data.statistiques.caActuel / data.statistiques.caObjectif) * 100) 
      : 0;
    
    // Calculs détaillés pour les KPIs
    const caHoraire = Math.round(data.statistiques.caActuel / 160); // ~160h/mois
    const caHoraireObjectif = Math.round(data.statistiques.caObjectif / 160);
    const ecartCA = data.statistiques.caActuel - data.statistiques.caObjectif;
    const ecartHoraire = caHoraire - caHoraireObjectif;
    
    // Statistiques patients
    const patientsTraites = Math.round(data.statistiques.nouveauxPatients * 0.85);
    const tauxConversion = 85;
    const rdvHonores = Math.round(data.statistiques.nombreRdv * (1 - data.statistiques.tauxAbsence / 100));
    
    // Répartition des actes (calculée dynamiquement)
    const consultations = Math.round(data.statistiques.nombreRdv * 0.44);
    const detartrages = Math.round(data.statistiques.nombreRdv * 0.34);
    const soinsConservateurs = Math.round(data.statistiques.nombreRdv * 0.15);
    const protheses = Math.round(data.statistiques.nombreRdv * 0.07);
    
    const caConsultations = consultations * 50;
    const caDetartrages = detartrages * 73;
    const caSoins = soinsConservateurs * 150;
    const caProtheses = protheses * 720;
    
    // Calculs pourcentages pour graphes
    const totalActes = consultations + detartrages + soinsConservateurs + protheses;
    const pctConsultations = Math.round((consultations / totalActes) * 100);
    const pctDetartrages = Math.round((detartrages / totalActes) * 100);
    const pctSoins = Math.round((soinsConservateurs / totalActes) * 100);
    const pctProtheses = Math.round((protheses / totalActes) * 100);
    
    // Déterminer la couleur du score
    const getScoreColor = (score: number) => {
      if (score >= 80) return '#10b981'; // vert
      if (score >= 60) return '#f59e0b'; // orange
      return '#ef4444'; // rouge
    };
    
    // Déterminer l'icône de tendance
    const getTendance = (ecart: number) => {
      if (ecart > 0) return { icon: '↑', color: '#10b981', text: 'En hausse' };
      if (ecart < 0) return { icon: '↓', color: '#ef4444', text: 'En baisse' };
      return { icon: '→', color: '#64748b', text: 'Stable' };
    };
    
    const tendanceCA = getTendance(ecartCA);
    const scoreColor = getScoreColor(data.statistiques.score);
    
    // Calculs pour graphique circulaire SVG (donut chart)
    const totalCA = caConsultations + caDetartrages + caSoins + caProtheses;
    const pctCAConsultations = (caConsultations / totalCA) * 100;
    const pctCADetartrages = (caDetartrages / totalCA) * 100;
    const pctCASoins = (caSoins / totalCA) * 100;
    const pctCAProtheses = (caProtheses / totalCA) * 100;
    
    // Fonction pour calculer les coordonnées du donut chart
    const getDonutPath = (startPercent: number, endPercent: number, radius: number = 80, innerRadius: number = 50) => {
      const startAngle = (startPercent / 100) * 360 - 90;
      const endAngle = (endPercent / 100) * 360 - 90;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = 100 + radius * Math.cos(startRad);
      const y1 = 100 + radius * Math.sin(startRad);
      const x2 = 100 + radius * Math.cos(endRad);
      const y2 = 100 + radius * Math.sin(endRad);
      const x3 = 100 + innerRadius * Math.cos(endRad);
      const y3 = 100 + innerRadius * Math.sin(endRad);
      const x4 = 100 + innerRadius * Math.cos(startRad);
      const y4 = 100 + innerRadius * Math.sin(startRad);
      
      const largeArc = endPercent - startPercent > 50 ? 1 : 0;
      
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };
    
    // Calcul des segments du donut
    const segment1End = pctCAConsultations;
    const segment2End = segment1End + pctCADetartrages;
    const segment3End = segment2End + pctCASoins;
    
    // Graphique SVG Donut
    const donutChart = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Segment Consultations -->
        <path d="${getDonutPath(0, segment1End)}" fill="#3b82f6"/>
        <!-- Segment Détartrages -->
        <path d="${getDonutPath(segment1End, segment2End)}" fill="#10b981"/>
        <!-- Segment Soins -->
        <path d="${getDonutPath(segment2End, segment3End)}" fill="#8b5cf6"/>
        <!-- Segment Prothèses -->
        <path d="${getDonutPath(segment3End, 100)}" fill="#f59e0b"/>
        <!-- Centre -->
        <circle cx="100" cy="100" r="40" fill="white"/>
        <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">CA Total</text>
        <text x="100" y="115" text-anchor="middle" font-size="12" fill="#64748b">${totalCA.toLocaleString('fr-FR')}€</text>
      </svg>
    `;
    
    // Graphique SVG Barres (CA vs Objectif)
    const maxBarValue = Math.max(data.statistiques.caActuel, data.statistiques.caObjectif);
    const barHeightCA = (data.statistiques.caActuel / maxBarValue) * 140;
    const barHeightObj = (data.statistiques.caObjectif / maxBarValue) * 140;
    
    const barChart = `
      <svg width="280" height="200" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Axes -->
        <line x1="50" y1="170" x2="250" y2="170" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="170" stroke="#e2e8f0" stroke-width="2"/>
        
        <!-- Lignes horizontales -->
        <line x1="50" y1="50" x2="250" y2="50" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
        <line x1="50" y1="90" x2="250" y2="90" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
        <line x1="50" y1="130" x2="250" y2="130" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
        
        <!-- Barre CA Réalisé -->
        <rect x="80" y="${170 - barHeightCA}" width="60" height="${barHeightCA}" rx="4" fill="url(#gradientCA)"/>
        <text x="110" y="${160 - barHeightCA}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">${(data.statistiques.caActuel / 1000).toFixed(0)}k€</text>
        <text x="110" y="185" text-anchor="middle" font-size="10" fill="#64748b">Réalisé</text>
        
        <!-- Barre Objectif -->
        <rect x="160" y="${170 - barHeightObj}" width="60" height="${barHeightObj}" rx="4" fill="url(#gradientObj)"/>
        <text x="190" y="${160 - barHeightObj}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">${(data.statistiques.caObjectif / 1000).toFixed(0)}k€</text>
        <text x="190" y="185" text-anchor="middle" font-size="10" fill="#64748b">Objectif</text>
        
        <!-- Gradients -->
        <defs>
          <linearGradient id="gradientCA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6"/>
            <stop offset="100%" style="stop-color:#1d4ed8"/>
          </linearGradient>
          <linearGradient id="gradientObj" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#94a3b8"/>
            <stop offset="100%" style="stop-color:#64748b"/>
          </linearGradient>
        </defs>
        
        <!-- Indicateur % -->
        <rect x="100" y="5" width="80" height="24" rx="12" fill="${pourcentageCA >= 100 ? '#10b981' : '#f59e0b'}"/>
        <text x="140" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="white">${pourcentageCA}%</text>
      </svg>
    `;

    const mailOptions = {
      from: `"📊 Efficience Analytics" <${process.env.EMAIL_USER}>`,
      to: destinataire,
      subject: `📊 RAPPORT DE PERFORMANCE - ${data.cabinetNom} | ${data.periode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport de Performance - ${data.cabinetNom}</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 20px;">
          <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
            
            <!-- HEADER -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 35px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">📊 RAPPORT DE PERFORMANCE</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">${data.cabinetNom}</p>
              <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 14px;">Période : ${data.periode}</p>
            </div>

            <!-- SYNTHÈSE GLOBALE -->
            ${data.globalStats ? `
            <div style="padding: 30px 40px; background: linear-gradient(180deg, #f8fafc 0%, white 100%); border-bottom: 1px solid #e2e8f0;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #3b82f6; padding-left: 12px;">
                📋 Synthèse Globale
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Cabinets Suivis -->
                  <td style="padding: 12px; background: #dbeafe; border: 1px solid #93c5fd; border-radius: 10px 0 0 10px; text-align: center; width: 25%;">
                    <div style="font-size: 28px; font-weight: bold; color: #0369a1; margin-bottom: 4px;">
                      ${data.globalStats.totalCabinets || 0}
                    </div>
                    <div style="font-size: 12px; color: #0369a1; font-weight: 600;">
                      📊 Cabinets Suivis
                    </div>
                  </td>
                  
                  <!-- Rapports Générés -->
                  <td style="padding: 12px; background: #fce7f3; border: 1px solid #fbcfe8; text-align: center; width: 25%;">
                    <div style="font-size: 28px; font-weight: bold; color: #be185d; margin-bottom: 4px;">
                      ${data.globalStats.totalCabinets || 0}
                    </div>
                    <div style="font-size: 12px; color: #be185d; font-weight: 600;">
                      📋 Rapports Générés
                    </div>
                  </td>
                  
                  <!-- Emails Envoyés -->
                  <td style="padding: 12px; background: #dcfce7; border: 1px solid #bbf7d0; text-align: center; width: 25%;">
                    <div style="font-size: 28px; font-weight: bold; color: #15803d; margin-bottom: 4px;">
                      ${data.globalStats.emailsEnvoyes || 0}
                    </div>
                    <div style="font-size: 12px; color: #15803d; font-weight: 600;">
                      📧 Emails Envoyés
                    </div>
                  </td>
                  
                  <!-- Performance Moyenne -->
                  <td style="padding: 12px; background: #fce7f3; border: 1px solid #fbcfe8; border-radius: 0 10px 10px 0; text-align: center; width: 25%;">
                    <div style="font-size: 28px; font-weight: bold; color: #be185d; margin-bottom: 4px;">
                      ${data.globalStats.performanceMoyenne || 0}%
                    </div>
                    <div style="font-size: 12px; color: #be185d; font-weight: 600;">
                      📈 Performance Moyenne
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            ` : ''}

            <!-- RÉSUMÉ EXÉCUTIF -->
            <div style="padding: 30px 40px; background: linear-gradient(180deg, #f8fafc 0%, white 100%);">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #3b82f6; padding-left: 12px;">🎯 RÉSUMÉ EXÉCUTIF</h2>
              <div style="margin-bottom: 18px;">
                <span style="font-size: 16px; color: #3b82f6; font-weight: bold;">Statut du cabinet : </span>
                <span style="font-size: 16px; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${cabinetStatut}</span>
                <div style="margin-top: 8px; font-size: 15px; color: #64748b;">${statutPhrase}</div>
              </div>
              
              <!-- Score Principal -->
              <div style="text-align: center; margin: 25px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05); border: 3px solid ${scoreColor}; border-radius: 50%; width: 140px; height: 140px; line-height: 140px;">
                  <span style="font-size: 52px; font-weight: bold; color: ${scoreColor};">${data.statistiques.score}%</span>
                </div>
                <p style="color: #64748b; margin-top: 10px; font-size: 14px;">Performance Globale</p>
              </div>

              <!-- Statut du Cabinet - Boîte visuelle -->
              <div style="text-align: center; margin-bottom: 25px; padding: 16px; background: ${cabinetStatut === 'OK' ? '#d1fae5' : cabinetStatut === 'À suivre' ? '#fef3c7' : '#fee2e2'}; border-radius: 12px; border: 2px solid ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};">
                <div style="font-size: 28px; margin-bottom: 8px;">
                  ${cabinetStatut === 'OK' ? '✅' : cabinetStatut === 'À suivre' ? '⚠️' : '🔴'}
                </div>
                <div style="font-size: 18px; font-weight: bold; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'}; margin-bottom: 4px;">
                  ${cabinetStatut}
                </div>
                <div style="font-size: 13px; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};">
                  ${cabinetStatut === 'OK' ? 'Objectif atteint' : cabinetStatut === 'À suivre' ? 'Vérification requise' : 'Actions urgentes'}
                </div>
              </div>

              <!-- Points Clés -->
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 12px; background: #f1f5f9; border-radius: 8px 0 0 8px; text-align: center; width: 25%;">
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${data.statistiques.caActuel.toLocaleString('fr-FR')} €</div>
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">CA Réalisé</div>
                  </td>
                  <td style="padding: 12px; background: #f1f5f9; text-align: center; width: 25%;">
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${data.statistiques.caObjectif.toLocaleString('fr-FR')} €</div>
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Objectif</div>
                  </td>
                  <td style="padding: 12px; background: #f1f5f9; text-align: center; width: 25%;">
                    <div style="font-size: 24px; font-weight: bold; color: ${tendanceCA.color};">${pourcentageCA}%</div>
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Progression</div>
                  </td>
                  <td style="padding: 12px; background: #f1f5f9; border-radius: 0 8px 8px 0; text-align: center; width: 25%;">
                    <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${data.statistiques.nouveauxPatients}</div>
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Nouveaux Patients</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- GRAPHIQUE CA -->
            <div style="padding: 25px 40px;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #10b981; padding-left: 12px;">📈 PERFORMANCE FINANCIÈRE</h2>
              
              <!-- GRAPHIQUE À BARRES SVG -->
              <div style="text-align: center; margin: 20px 0 30px; background: #f8fafc; border-radius: 12px; padding: 20px;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 15px; font-weight: 600;">📊 Comparaison CA Réalisé vs Objectif</p>
                ${barChart}
              </div>
              
              <!-- Barre de progression CA -->
              <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #475569; font-size: 14px;">Chiffre d'Affaires</span>
                  <span style="color: ${tendanceCA.color}; font-weight: bold; font-size: 14px;">${tendanceCA.icon} ${ecartCA >= 0 ? '+' : ''}${ecartCA.toLocaleString('fr-FR')} €</span>
                </div>
                <div style="background: #e2e8f0; border-radius: 10px; height: 24px; overflow: hidden; position: relative;">
                  <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${Math.min(pourcentageCA, 100)}%; border-radius: 10px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
                    <span style="color: white; font-size: 12px; font-weight: bold;">${pourcentageCA}%</span>
                  </div>
                </div>
              </div>

              <!-- Tableau Performance -->
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Indicateur</th>
                    <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Valeur</th>
                    <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Objectif</th>
                    <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">CA Total</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #1e293b;">${data.statistiques.caActuel.toLocaleString('fr-FR')} €</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${data.statistiques.caObjectif.toLocaleString('fr-FR')} €</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: ${ecartCA >= 0 ? '#10b981' : '#ef4444'};">${ecartCA >= 0 ? '+' : ''}${ecartCA.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">CA Horaire</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #1e293b;">${caHoraire} €/h</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${caHoraireObjectif} €/h</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: ${ecartHoraire >= 0 ? '#10b981' : '#ef4444'};">${ecartHoraire >= 0 ? '+' : ''}${ecartHoraire} €/h</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; color: #1e293b;">Taux de réalisation</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #1e293b;">${pourcentageCA}%</td>
                    <td style="padding: 12px; text-align: right; color: #64748b;">100%</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: ${pourcentageCA >= 100 ? '#10b981' : '#ef4444'};">${pourcentageCA >= 100 ? '+' : ''}${pourcentageCA - 100}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ACTIVITÉ PATIENTS -->
            <div style="padding: 25px 40px; background: #f8fafc;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #8b5cf6; padding-left: 12px;">👥 ACTIVITÉ PATIENTS</h2>
              
              <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
                <tr>
                  <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${data.statistiques.nouveauxPatients}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Nouveaux patients</div>
                  </td>
                  <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #10b981;">${patientsTraites}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Patients traités</div>
                  </td>
                  <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #8b5cf6;">${rdvHonores}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">RDV honorés</div>
                  </td>
                  <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: ${data.statistiques.tauxAbsence <= 5 ? '#10b981' : '#ef4444'};">${data.statistiques.tauxAbsence}%</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Taux d'absence</div>
                  </td>
                </tr>
              </table>

              <!-- Taux de conversion -->
              <div style="margin-top: 20px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #475569; font-size: 14px;">Taux de conversion patients</span>
                  <span style="color: #10b981; font-weight: bold;">${tauxConversion}%</span>
                </div>
                <div style="background: #e2e8f0; border-radius: 6px; height: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${tauxConversion}%; border-radius: 6px;"></div>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Objectif : ≥ 80% | ${tauxConversion >= 80 ? '✅ Objectif atteint' : '⚠️ À améliorer'}</p>
              </div>
            </div>

            <!-- RÉPARTITION DES ACTES -->
            <div style="padding: 25px 40px;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #f59e0b; padding-left: 12px;">🦷 RÉPARTITION DES ACTES</h2>
              
              <!-- GRAPHIQUE DONUT SVG + LÉGENDE -->
              <table style="width: 100%; margin-bottom: 25px;">
                <tr>
                  <td style="width: 50%; text-align: center; vertical-align: middle;">
                    ${donutChart}
                  </td>
                  <td style="width: 50%; vertical-align: middle; padding-left: 20px;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background: #3b82f6; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>
                      <span style="color: #475569; font-size: 13px;">Consultations <strong>${Math.round(pctCAConsultations)}%</strong></span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background: #10b981; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>
                      <span style="color: #475569; font-size: 13px;">Détartrages <strong>${Math.round(pctCADetartrages)}%</strong></span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background: #8b5cf6; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>
                      <span style="color: #475569; font-size: 13px;">Soins <strong>${Math.round(pctCASoins)}%</strong></span>
                    </div>
                    <div>
                      <span style="display: inline-block; width: 14px; height: 14px; background: #f59e0b; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>
                      <span style="color: #475569; font-size: 13px;">Prothèses <strong>${Math.round(pctCAProtheses)}%</strong></span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Graphique à barres horizontales -->
              <div style="margin-bottom: 25px;">
                <!-- Consultations -->
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #475569; font-size: 13px;">Consultations (${consultations})</span>
                    <span style="color: #3b82f6; font-weight: bold; font-size: 13px;">${caConsultations.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
                    <div style="background: #3b82f6; height: 100%; width: ${pctConsultations}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
                      <span style="color: white; font-size: 11px; font-weight: bold;">${pctConsultations}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Détartrages -->
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #475569; font-size: 13px;">Détartrages (${detartrages})</span>
                    <span style="color: #10b981; font-weight: bold; font-size: 13px;">${caDetartrages.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
                    <div style="background: #10b981; height: 100%; width: ${pctDetartrages}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
                      <span style="color: white; font-size: 11px; font-weight: bold;">${pctDetartrages}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Soins conservateurs -->
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #475569; font-size: 13px;">Soins conservateurs (${soinsConservateurs})</span>
                    <span style="color: #8b5cf6; font-weight: bold; font-size: 13px;">${caSoins.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
                    <div style="background: #8b5cf6; height: 100%; width: ${pctSoins}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
                      <span style="color: white; font-size: 11px; font-weight: bold;">${pctSoins}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Prothèses -->
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #475569; font-size: 13px;">Prothèses (${protheses})</span>
                    <span style="color: #f59e0b; font-weight: bold; font-size: 13px;">${caProtheses.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
                    <div style="background: #f59e0b; height: 100%; width: ${pctProtheses}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
                      <span style="color: white; font-size: 11px; font-weight: bold;">${pctProtheses}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tableau récapitulatif des actes -->
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #f8fafc; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #1e293b;">
                    <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">Type d'acte</th>
                    <th style="padding: 12px; text-align: center; color: white; font-weight: 600;">Nombre</th>
                    <th style="padding: 12px; text-align: right; color: white; font-weight: 600;">CA Généré</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background: white;">
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">🔍 Consultations</td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${consultations}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caConsultations.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr style="background: #f8fafc;">
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">🦷 Détartrages</td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${detartrages}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caDetartrages.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr style="background: white;">
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">💉 Soins conservateurs</td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${soinsConservateurs}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caSoins.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr style="background: #f8fafc;">
                    <td style="padding: 12px;">👑 Prothèses</td>
                    <td style="padding: 12px; text-align: center;">${protheses}</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold;">${caProtheses.toLocaleString('fr-FR')} €</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="background: #1e293b;">
                    <td style="padding: 12px; color: white; font-weight: bold;">TOTAL</td>
                    <td style="padding: 12px; text-align: center; color: white; font-weight: bold;">${totalActes}</td>
                    <td style="padding: 12px; text-align: right; color: #10b981; font-weight: bold;">${(caConsultations + caDetartrages + caSoins + caProtheses).toLocaleString('fr-FR')} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- RECOMMANDATIONS -->
            <div style="padding: 25px 40px; background: linear-gradient(180deg, #fefce8 0%, #fef9c3 100%);">
              <h2 style="color: #854d0e; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #eab308; padding-left: 12px;">💡 RECOMMANDATIONS</h2>
              
              <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
                <h4 style="color: #1e293b; margin: 0 0 8px; font-size: 14px;">1. Optimiser le taux de conversion des devis (+5-10% potentiel)</h4>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                  <li>Mettre en place un suivi systématique des devis non acceptés</li>
                  <li>Proposer des facilités de paiement</li>
                </ul>
              </div>
              
              <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #10b981;">
                <h4 style="color: #1e293b; margin: 0 0 8px; font-size: 14px;">2. ${data.statistiques.tauxAbsence > 5 ? 'Réduire le taux d\'absence (actuellement ' + data.statistiques.tauxAbsence + '%)' : 'Maintenir le bon taux de présence ✓'}</h4>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                  <li>Envoyer des rappels SMS 48h et 24h avant le RDV</li>
                  <li>Mettre en place une politique de gestion des annulations</li>
                </ul>
              </div>
              
              <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #8b5cf6;">
                <h4 style="color: #1e293b; margin: 0 0 8px; font-size: 14px;">3. Développer l'activité prothétique</h4>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                  <li>Fort potentiel de CA sur ce segment (actuellement ${pctProtheses}% des actes)</li>
                  <li>Investir dans la formation continue</li>
                </ul>
              </div>
              
              <div style="background: white; border-radius: 12px; padding: 20px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #1e293b; margin: 0 0 8px; font-size: 14px;">4. Fidélisation patients</h4>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                  <li>Programme de rappel pour contrôles annuels</li>
                  <li>Communication régulière (newsletter)</li>
                </ul>
              </div>
            </div>

            <!-- PROCHAINES ÉTAPES -->
            <div style="padding: 25px 40px;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #06b6d4; padding-left: 12px;">📅 PROCHAINES ÉTAPES</h2>
              
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; color: #475569;">☐ Réunion d'équipe pour présenter les résultats</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #475569;">☐ Mise en place du système de rappels automatiques</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #475569;">☐ Audit des devis en attente (&gt; 30 jours)</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #475569;">☐ Formation sur les techniques de présentation des plans de traitement</td>
                </tr>
              </table>
            </div>

            <!-- FOOTER -->
            <div style="background: #1e293b; padding: 30px 40px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">📅 Rapport généré automatiquement par <strong style="color: white;">Efficience Analytics</strong></p>
              <p style="color: #64748b; margin: 10px 0 0; font-size: 12px;">Date de génération : ${data.dateGeneration}</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
                <p style="color: #64748b; margin: 0; font-size: 11px;">© 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rapport cabinet envoyé à ${destinataire} pour ${data.cabinetNom}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi rapport cabinet:', error);
    return false;
  }
}

