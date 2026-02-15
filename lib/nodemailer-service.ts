import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Service d'envoi d'emails avec Nodemailer
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Initialise le transporteur SMTP
   */
  initialize(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const config: EmailConfig = {
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
      secure: (process.env.SMTP_SECURE === 'true') || (process.env.EMAIL_PORT === '465'),
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
    return this.transporter;
  }

  /**
   * Vérifie la connexion SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.initialize();
      await transporter.verify();
      console.log('✅ Connexion SMTP vérifiée');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion SMTP:', error);
      return false;
    }
  }

  /**
   * Envoie un email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.initialize();

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('📧 Email envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Erreur envoi email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie un rapport mensuel par email
   */
  async sendMonthlyReport(
    cabinetEmail: string,
    cabinetName: string,
    period: string,
    pdfBuffer: Buffer,
    score: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : 'À améliorer';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a6e, #0d2444); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-badge { display: inline-block; background: ${scoreColor}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
          .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>≡FFICI≡NC≡ SUMMIT 2026</h1>
            <p>Rapport de Performance Mensuel</p>
          </div>
          <div class="content">
            <h2>Bonjour ${cabinetName},</h2>
            <p>Votre rapport de performance pour <strong>${period}</strong> est disponible.</p>
            
            <div style="text-align: center;">
              <div class="score-badge">Score: ${score}% - ${scoreLabel}</div>
            </div>
            
            <p>Vous trouverez en pièce jointe votre rapport détaillé contenant :</p>
            <ul>
              <li>📊 Vos indicateurs clés de performance</li>
              <li>📈 L'analyse de votre activité</li>
              <li>💡 Nos recommandations personnalisées</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="#" class="cta-button">Accéder à votre tableau de bord</a>
            </p>
            
            <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br><strong>L'équipe Efficience Summit</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 Efficience Summit - Tous droits réservés</p>
            <p>93 boulevard Magenta, 75010 Paris | contact@efficience-summit.fr</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: cabinetEmail,
      subject: `📊 Votre rapport mensuel ${period} - Score: ${score}%`,
      html,
      attachments: [
        {
          filename: `rapport_${cabinetName.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Envoie une notification d'alerte
   */
  async sendAlertNotification(
    email: string,
    cabinetName: string,
    alertType: 'critique' | 'warning' | 'info',
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    const colors = {
      critique: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    };

    const icons = { critique: '🚨', warning: '⚠️', info: 'ℹ️' };
    const titles = { critique: 'Alerte Critique', warning: 'Attention Requise', info: 'Information' };

    const style = colors[alertType];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: ${style.bg}; border-left: 4px solid ${style.border}; padding: 20px; border-radius: 5px;">
          <h2 style="color: ${style.text}; margin: 0 0 10px;">
            ${icons[alertType]} ${titles[alertType]}
          </h2>
          <p style="margin: 0 0 15px;"><strong>Cabinet:</strong> ${cabinetName}</p>
          <p style="margin: 0; color: ${style.text};">${message}</p>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
          Efficience Summit 2026 - Système d'alertes automatiques
        </p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `${icons[alertType]} ${titles[alertType]} - ${cabinetName}`,
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
