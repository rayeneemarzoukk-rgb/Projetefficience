import { useCallback, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Hook personnalisé pour télécharger un rapport en PDF
 * Récupère le HTML complet depuis l'API et le convertit en PDF
 */
export const usePdfDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReportAsPDF = useCallback(async (cabinetId: string, cabinetName: string) => {
    try {
      setDownloading(true);
      setError(null);

      // Récupérer le HTML complet du rapport via l'API
      const response = await fetch(`/api/rapports/html/${cabinetId}`);
      if (!response.ok) {
        throw new Error('Impossible de charger le rapport');
      }

      const htmlContent = await response.text();

      // Créer un élément temporaire pour contenir le HTML
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // Convertir l'HTML en canvas avec un délai pour le rendu
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Créer un PDF avec pages multiples si nécessaire
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // Largeur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let heightLeft = imgHeight;
      let position = 0;

      // Ajouter l'image au PDF avec pagination si nécessaire
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // Hauteur d'une page A4

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Télécharger le PDF
      const fileName = `rapport_${cabinetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Nettoyer
      document.body.removeChild(tempDiv);
      setDownloading(false);
    } catch (err) {
      console.error('❌ Erreur téléchargement PDF:', err);
      setError('Erreur lors du téléchargement du PDF');
      setDownloading(false);
    }
  }, []);

  return { downloadReportAsPDF, downloading, error };
};
