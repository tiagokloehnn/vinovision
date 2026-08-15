import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook que sincroniza a adega do usuário com o Supabase.
 * Substitui o useState + localStorage do App.jsx anterior.
 */
export function useCellar() {
  const { user } = useAuth();
  const [cellarWines, setCellarWines] = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── Carregar adega do Supabase ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setCellarWines([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    supabase
      .from('cellar')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('[Adega] Erro ao carregar:', error.message);
          setCellarWines([]);
        } else if (Array.isArray(data)) {
          setCellarWines(data.map(row => ({ ...(row?.wine_data || {}), _rowId: row.id })));
        } else {
          setCellarWines([]);
        }
      })
      .catch(err => {
        console.error('[Adega] Erro inesperado ao carregar:', err);
        setCellarWines([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  // ── Adicionar vinho ───────────────────────────────────────────────────
  const addWine = async (wine) => {
    if (!user) return;

    // Evita duplicatas
    const alreadyIn = cellarWines.some(w => w.id === wine.id);
    if (alreadyIn) return;

    // Otimista: atualiza a UI imediatamente
    setCellarWines(prev => [wine, ...prev]);

    const { data, error } = await supabase
      .from('cellar')
      .insert({ user_id: user.id, wine_id: wine.id, wine_data: wine })
      .select()
      .single();

    if (error) {
      console.error('[Adega] Erro ao adicionar:', error.message);
      // Reverte se falhou
      setCellarWines(prev => prev.filter(w => w.id !== wine.id));
    } else {
      // Atualiza o _rowId para poder deletar depois
      setCellarWines(prev =>
        prev.map(w => (w.id === wine.id ? { ...w, _rowId: data.id } : w))
      );
    }
  };

  // ── Remover vinho ─────────────────────────────────────────────────────
  const removeWine = async (wineId) => {
    if (!user) return;

    const target = cellarWines.find(w => w.id === wineId);
    if (!target) return;

    // Otimista
    setCellarWines(prev => prev.filter(w => w.id !== wineId));

    const { error } = await supabase
      .from('cellar')
      .delete()
      .eq('id', target._rowId);

    if (error) {
      console.error('[Adega] Erro ao remover:', error.message);
      // Reverte
      setCellarWines(prev => [target, ...prev]);
    }
  };

  // ── Toggle (add/remove) ───────────────────────────────────────────────
  const toggleWine = async (wine) => {
    const isIn = cellarWines.some(w => w.id === wine.id);
    if (isIn) await removeWine(wine.id);
    else       await addWine(wine);
  };

  // ── Atualizar avaliação pessoal do vinho ──────────────────────────────
  const updateWineReview = async (wineOrId, reviewData) => {
    if (!user) return;

    const wineId = typeof wineOrId === 'string' ? wineOrId : wineOrId.id;
    let target = cellarWines.find(w => w.id === wineId);

    // Se o vinho ainda não estiver salvo na adega, adiciona primeiro
    if (!target && typeof wineOrId === 'object') {
      const initialWine = {
        ...wineOrId,
        userRating: reviewData.userRating || 0,
        userReview: reviewData.userReview || '',
        userOccasion: reviewData.userOccasion || '',
        userReviewedAt: new Date().toISOString()
      };

      setCellarWines(prev => [initialWine, ...prev]);

      const { data, error } = await supabase
        .from('cellar')
        .insert({ user_id: user.id, wine_id: wineId, wine_data: initialWine })
        .select()
        .single();

      if (error) {
        console.error('[Adega] Erro ao salvar avaliação:', error.message);
        setCellarWines(prev => prev.filter(w => w.id !== wineId));
        throw error;
      } else {
        const fullWine = { ...initialWine, _rowId: data.id };
        setCellarWines(prev => prev.map(w => (w.id === wineId ? fullWine : w)));
        return fullWine;
      }
    }

    if (!target) return;

    const updatedWine = {
      ...target,
      userRating: reviewData.userRating !== undefined ? reviewData.userRating : target.userRating,
      userReview: reviewData.userReview !== undefined ? reviewData.userReview : target.userReview,
      userOccasion: reviewData.userOccasion !== undefined ? reviewData.userOccasion : target.userOccasion,
      userReviewedAt: new Date().toISOString()
    };

    // Atualização otimista no estado local
    setCellarWines(prev => prev.map(w => (w.id === wineId ? updatedWine : w)));

    const { error } = await supabase
      .from('cellar')
      .update({ wine_data: updatedWine })
      .eq('id', target._rowId);

    if (error) {
      console.error('[Adega] Erro ao atualizar avaliação:', error.message);
      // Reverte em caso de erro
      setCellarWines(prev => prev.map(w => (w.id === wineId ? target : w)));
      throw error;
    }

    return updatedWine;
  };

  const isInCellar = (wineId) => cellarWines.some(w => w.id === wineId);

  return { cellarWines, loading, addWine, removeWine, toggleWine, isInCellar, updateWineReview };
}
