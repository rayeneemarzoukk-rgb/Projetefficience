import { useState, useEffect } from 'react';

export interface RapportStats {
  totalCabinets: number;
  rapportsEnvoyes: number;
  rapportsGeneresNonEnvoyes: number;
  rapportsNonGeneres: number;
}

const defaultStats: RapportStats = {
  totalCabinets: 0,
  rapportsEnvoyes: 0,
  rapportsGeneresNonEnvoyes: 0,
  rapportsNonGeneres: 0,
};

/**
 * Hook personnalisé pour récupérer et mettre à jour automatiquement les statistiques des rapports
 * Synchronisé avec l'API /api/rapports
 */
export function useRapportStats() {
  const [stats, setStats] = useState<RapportStats>(defaultStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/rapports', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data) {
        setStats({
          totalCabinets: data.totalCabinets || 0,
          rapportsEnvoyes: data.rapportsEnvoyes || 0,
          rapportsGeneresNonEnvoyes: data.rapportsGeneresNonEnvoyes || 0,
          rapportsNonGeneres: data.rapportsNonGeneres || 0,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.warn('⚠️ Erreur chargement rapport stats:', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les stats au montage
    fetchStats();

    // Configurer l'auto-refresh toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
