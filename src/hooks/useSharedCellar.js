import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PERSONAL_CELLAR = {
  id: 'personal',
  name: 'Minha Adega Pessoal',
  description: 'Coleção particular e privada',
  isPersonal: true,
  role: 'OWNER'
};

export function useSharedCellar() {
  const { user, profile } = useAuth();
  const [cellarsList, setCellarsList]       = useState([PERSONAL_CELLAR]);
  const [activeCellarId, setActiveCellarId] = useState('personal');
  const [cellarWines, setCellarWines]       = useState([]);
  const [cellarMembers, setCellarMembers]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const activeCellar = cellarsList.find(c => c.id === activeCellarId) || PERSONAL_CELLAR;

  // ── 1. Carregar lista de adegas do usuário ──────────────────────────────────
  const loadUserCellars = useCallback(async () => {
    if (!user) {
      setCellarsList([PERSONAL_CELLAR]);
      setActiveCellarId('personal');
      return;
    }

    try {
      // 1. Adegas onde o usuário é dono
      const { data: owned, error: errOwned } = await supabase
        .from('shared_cellars')
        .select('*')
        .eq('owner_id', user.id);

      // 2. Adegas onde o usuário é membro
      const { data: memberRows, error: errMember } = await supabase
        .from('shared_cellar_members')
        .select('cellar_id, role, shared_cellars(*)')
        .eq('user_id', user.id);

      const list = [PERSONAL_CELLAR];

      if (!errOwned && Array.isArray(owned)) {
        owned.forEach(c => {
          list.push({ ...c, isPersonal: false, role: 'OWNER' });
        });
      }

      if (!errMember && Array.isArray(memberRows)) {
        memberRows.forEach(row => {
          if (row.shared_cellars && !list.some(c => c.id === row.shared_cellars.id)) {
            list.push({ ...row.shared_cellars, isPersonal: false, role: row.role || 'MEMBER' });
          }
        });
      }

      setCellarsList(list);

      // Se a adega ativa atual não existir mais na lista, volta para a pessoal
      if (!list.some(c => c.id === activeCellarId)) {
        setActiveCellarId('personal');
      }
    } catch (err) {
      console.warn('[useSharedCellar] Tabela shared_cellars indisponível ou erro:', err);
      setCellarsList([PERSONAL_CELLAR]);
    }
  }, [user, activeCellarId]);

  useEffect(() => {
    loadUserCellars();
  }, [loadUserCellars]);

  // ── 2. Carregar vinhos da adega ativa (COM ISOLAMENTO TOTAL) ─────────────────
  const loadActiveCellarWines = useCallback(async () => {
    if (!user) {
      setCellarWines([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (activeCellarId === 'personal') {
        // Adega pessoal: buscar apenas registros do usuário logado onde cellar_id IS NULL ou 'personal'
        const { data, error } = await supabase
          .from('cellar')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const personalOnly = data.filter(row => !row.cellar_id || row.cellar_id === 'personal');
          setCellarWines(personalOnly.map(row => formatWineRow(row, user.id)));
        } else {
          setCellarWines([]);
        }
      } else {
        // Adega compartilhada: buscar estritamente registros vinculados ao cellar_id da adega
        const { data, error } = await supabase
          .from('cellar')
          .select('*')
          .eq('cellar_id', activeCellarId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          setCellarWines(data.map(row => formatWineRow(row, user.id)));
        } else {
          // CRÍTICO: Não fazer fallback para os vinhos da adega pessoal!
          if (error) {
            console.warn('[useSharedCellar] Erro ao carregar vinhos da adega compartilhada:', error.message);
          }
          setCellarWines([]);
        }
      }
    } catch (err) {
      console.error('[useSharedCellar] Erro inesperado ao carregar vinhos:', err);
      setCellarWines([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeCellarId]);

  useEffect(() => {
    loadActiveCellarWines();
  }, [loadActiveCellarWines]);

  // ── 3. Carregar membros da adega ativa (se compartilhada) ─────────────────
  const loadActiveCellarMembers = useCallback(async () => {
    if (activeCellarId === 'personal' || !user) {
      setCellarMembers([]);
      return;
    }

    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('shared_cellar_members')
        .select('id, role, user_id, joined_at, profiles(id, email, full_name, role)')
        .eq('cellar_id', activeCellarId);

      if (!error && Array.isArray(data)) {
        setCellarMembers(data.map(m => ({
          id: m.id,
          userId: m.user_id,
          role: m.role,
          joinedAt: m.joined_at,
          fullName: m.profiles?.full_name || m.profiles?.email?.split('@')[0] || 'Sommelier',
          email: m.profiles?.email || ''
        })));
      } else {
        setCellarMembers([]);
      }
    } catch {
      setCellarMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [activeCellarId, user]);

  useEffect(() => {
    loadActiveCellarMembers();
  }, [loadActiveCellarMembers]);

  // ── 4. Obter status multi-adega de um vinho (em quais adegas ele está) ────
  const getWineCellars = useCallback(async (wineId) => {
    if (!user || !wineId) return [];
    try {
      const { data, error } = await supabase
        .from('cellar')
        .select('id, cellar_id, user_id')
        .eq('wine_id', wineId);

      if (error || !Array.isArray(data)) return [];

      const matchedCellarIds = [];
      data.forEach(row => {
        if (!row.cellar_id || row.cellar_id === 'personal') {
          if (row.user_id === user.id) {
            matchedCellarIds.push('personal');
          }
        } else {
          matchedCellarIds.push(row.cellar_id);
        }
      });

      return [...new Set(matchedCellarIds)];
    } catch (err) {
      console.error('[useSharedCellar] Erro ao obter adegas do vinho:', err);
      return [];
    }
  }, [user]);

  // ── 5. Adicionar Vinho a uma Adega Específica ──────────────────────────────
  const addWineToCellar = async (wine, targetCellarId = activeCellarId) => {
    if (!user || !wine) return;

    const authorName = profile?.full_name || user.email?.split('@')[0] || 'Sommelier';
    const isPersonal = !targetCellarId || targetCellarId === 'personal';
    const cellarIdPayload = isPersonal ? null : targetCellarId;

    const enrichedWine = {
      ...wine,
      addedBy: {
        id: user.id,
        name: authorName,
        at: new Date().toISOString()
      },
      reviews: wine.reviews || {}
    };

    // Atualização otimista caso seja a adega ativa atual
    if (targetCellarId === activeCellarId) {
      setCellarWines(prev => {
        if (prev.some(w => w.id === wine.id)) return prev;
        return [enrichedWine, ...prev];
      });
    }

    const insertPayload = {
      user_id: user.id,
      wine_id: wine.id,
      wine_data: enrichedWine,
      cellar_id: cellarIdPayload
    };

    const { data, error } = await supabase
      .from('cellar')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error(`[useSharedCellar] Erro ao adicionar vinho à adega (${targetCellarId}):`, error);
      if (targetCellarId === activeCellarId) {
        setCellarWines(prev => prev.filter(w => w.id !== wine.id));
      }
      throw error;
    } else if (targetCellarId === activeCellarId) {
      setCellarWines(prev =>
        prev.map(w => (w.id === wine.id ? { ...enrichedWine, _rowId: data.id } : w))
      );
    }

    return data;
  };

  // ── 6. Remover Vinho de uma Adega Específica (SEM AFETAR OUTRAS) ───────────
  const removeWineFromCellar = async (wineId, targetCellarId = activeCellarId) => {
    if (!user || !wineId) return;

    const isPersonal = !targetCellarId || targetCellarId === 'personal';
    const previousWines = [...cellarWines];

    // Atualização otimista na adega ativa
    if (targetCellarId === activeCellarId) {
      setCellarWines(prev => prev.filter(w => w.id !== wineId));
    }

    let query = supabase.from('cellar').delete().eq('wine_id', wineId);

    if (isPersonal) {
      // Deleta APENAS o registro pessoal deste usuário
      query = query.eq('user_id', user.id).is('cellar_id', null);
    } else {
      // Deleta APENAS o registro desta adega compartilhada
      query = query.eq('cellar_id', targetCellarId);
    }

    const { error } = await query;

    if (error) {
      console.error(`[useSharedCellar] Erro ao remover vinho da adega (${targetCellarId}):`, error);
      if (targetCellarId === activeCellarId) {
        setCellarWines(previousWines);
      }
      throw error;
    }
  };

  // ── 7. Toggle em adega específica ──────────────────────────────────────────
  const toggleWineInCellar = async (wine, targetCellarId = activeCellarId) => {
    const currentCellars = await getWineCellars(wine.id);
    const isInTarget = currentCellars.includes(targetCellarId);

    if (isInTarget) {
      await removeWineFromCellar(wine.id, targetCellarId);
      return false;
    } else {
      await addWineToCellar(wine, targetCellarId);
      return true;
    }
  };

  // ── 8. Salvar/Sincronizar em Múltiplas Adegas de Uma Vez ───────────────────
  const saveWineToCellars = async (wine, selectedCellarIds = []) => {
    if (!user || !wine) return;
    const currentCellars = await getWineCellars(wine.id);

    const toAdd = selectedCellarIds.filter(id => !currentCellars.includes(id));
    const toRemove = currentCellars.filter(id => !selectedCellarIds.includes(id));

    for (const cid of toAdd) {
      await addWineToCellar(wine, cid);
    }
    for (const cid of toRemove) {
      await removeWineFromCellar(wine.id, cid);
    }
  };

  // ── 9. Métodos de conveniência para compatibilidade ────────────────────────
  const addWine = async (wine) => addWineToCellar(wine, activeCellarId);
  const removeWine = async (wineId) => removeWineFromCellar(wineId, activeCellarId);
  const toggleWine = async (wine) => toggleWineInCellar(wine, activeCellarId);
  const isInCellar = (wineId) => cellarWines.some(w => w.id === wineId);

  // ── 10. Criar nova adega compartilhada ────────────────────────────────────
  const createSharedCellar = async (name, description = '') => {
    if (!user) throw new Error('Usuário não autenticado.');

    const randomCode = `VINO-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newCellar, error } = await supabase
      .from('shared_cellars')
      .insert({
        name: name.trim(),
        description: description.trim(),
        owner_id: user.id,
        invite_code: randomCode
      })
      .select()
      .single();

    if (error) {
      console.error('[useSharedCellar] Erro ao criar adega:', error);
      throw new Error(error.message || 'Falha ao criar adega compartilhada.');
    }

    // Adiciona o criador como membro OWNER
    await supabase.from('shared_cellar_members').insert({
      cellar_id: newCellar.id,
      user_id: user.id,
      role: 'OWNER'
    });

    await loadUserCellars();
    setActiveCellarId(newCellar.id);
    return newCellar;
  };

  // ── 11. Entrar em adega por código de convite ─────────────────────────────
  const joinSharedCellar = async (inviteCode) => {
    if (!user) throw new Error('Usuário não autenticado.');

    const cleanCode = inviteCode.trim().toUpperCase();

    const { data: targetCellar, error: findError } = await supabase
      .from('shared_cellars')
      .select('*')
      .ilike('invite_code', cleanCode)
      .single();

    if (findError || !targetCellar) {
      throw new Error('Código de convite não encontrado. Verifique o código e tente novamente.');
    }

    const { error: joinError } = await supabase
      .from('shared_cellar_members')
      .upsert({
        cellar_id: targetCellar.id,
        user_id: user.id,
        role: targetCellar.owner_id === user.id ? 'OWNER' : 'MEMBER'
      });

    if (joinError) {
      console.error('[useSharedCellar] Erro ao entrar na adega:', joinError);
      throw new Error('Erro ao registrar sua entrada na adega.');
    }

    await loadUserCellars();
    setActiveCellarId(targetCellar.id);
    return targetCellar;
  };

  // ── 12. Sair ou excluir adega compartilhada ───────────────────────────────
  const leaveSharedCellar = async (cellarId) => {
    if (!user) return;

    await supabase
      .from('shared_cellar_members')
      .delete()
      .eq('cellar_id', cellarId)
      .eq('user_id', user.id);

    await loadUserCellars();
    setActiveCellarId('personal');
  };

  const deleteSharedCellar = async (cellarId) => {
    if (!user) return;

    await supabase
      .from('shared_cellars')
      .delete()
      .eq('id', cellarId)
      .eq('owner_id', user.id);

    await loadUserCellars();
    setActiveCellarId('personal');
  };

  // ── 13. Atualizar avaliação colaborativa ──────────────────────────────────
  const updateWineReview = async (wineOrId, reviewData, targetCellarId = activeCellarId) => {
    if (!user) return;

    const wineId = typeof wineOrId === 'string' ? wineOrId : wineOrId.id;
    let target = cellarWines.find(w => w.id === wineId);
    const authorName = profile?.full_name || user.email?.split('@')[0] || 'Sommelier';

    const currentReviews = target?.reviews || (typeof wineOrId === 'object' && wineOrId.reviews) || {};
    const updatedReviews = {
      ...currentReviews,
      [user.id]: {
        userId: user.id,
        userName: authorName,
        rating: reviewData.userRating || 0,
        review: reviewData.userReview || '',
        occasion: reviewData.userOccasion || '',
        reviewedAt: new Date().toISOString()
      }
    };

    const ratingsArray = Object.values(updatedReviews).map(r => r.rating).filter(r => r > 0);
    const groupAverageRating = ratingsArray.length > 0
      ? Number((ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length).toFixed(1))
      : 0;

    const isPersonal = !targetCellarId || targetCellarId === 'personal';
    const cellarIdPayload = isPersonal ? null : targetCellarId;

    // Se o vinho ainda não estiver salvo nesta adega, cria e adiciona
    if (!target && typeof wineOrId === 'object') {
      const initialWine = {
        ...wineOrId,
        addedBy: {
          id: user.id,
          name: authorName,
          at: new Date().toISOString()
        },
        userRating: reviewData.userRating || 0,
        userReview: reviewData.userReview || '',
        userOccasion: reviewData.userOccasion || '',
        userReviewedAt: new Date().toISOString(),
        reviews: updatedReviews,
        groupAverageRating
      };

      if (targetCellarId === activeCellarId) {
        setCellarWines(prev => [initialWine, ...prev]);
      }

      const { data, error } = await supabase
        .from('cellar')
        .insert({
          user_id: user.id,
          wine_id: wineId,
          wine_data: initialWine,
          cellar_id: cellarIdPayload
        })
        .select()
        .single();

      if (error) {
        console.error('[useSharedCellar] Erro ao salvar avaliação:', error);
        if (targetCellarId === activeCellarId) {
          setCellarWines(prev => prev.filter(w => w.id !== wineId));
        }
        throw error;
      } else {
        const fullWine = { ...initialWine, _rowId: data.id };
        if (targetCellarId === activeCellarId) {
          setCellarWines(prev => prev.map(w => (w.id === wineId ? fullWine : w)));
        }
        return fullWine;
      }
    }

    if (!target) return;

    const updatedWine = {
      ...target,
      userRating: reviewData.userRating !== undefined ? reviewData.userRating : target.userRating,
      userReview: reviewData.userReview !== undefined ? reviewData.userReview : target.userReview,
      userOccasion: reviewData.userOccasion !== undefined ? reviewData.userOccasion : target.userOccasion,
      userReviewedAt: new Date().toISOString(),
      reviews: updatedReviews,
      groupAverageRating
    };

    if (targetCellarId === activeCellarId) {
      setCellarWines(prev => prev.map(w => (w.id === wineId ? updatedWine : w)));
    }

    const { error } = await supabase
      .from('cellar')
      .update({ wine_data: updatedWine })
      .eq('id', target._rowId);

    if (error) {
      console.error('[useSharedCellar] Erro ao atualizar avaliação:', error);
      if (targetCellarId === activeCellarId) {
        setCellarWines(prev => prev.map(w => (w.id === wineId ? target : w)));
      }
      throw error;
    }

    return updatedWine;
  };

  return {
    cellarsList,
    activeCellar,
    activeCellarId,
    setActiveCellarId,
    cellarWines,
    cellarMembers,
    loading,
    loadingMembers,
    createSharedCellar,
    joinSharedCellar,
    leaveSharedCellar,
    deleteSharedCellar,
    loadUserCellars,
    loadActiveCellarWines,
    getWineCellars,
    addWineToCellar,
    removeWineFromCellar,
    toggleWineInCellar,
    saveWineToCellars,
    addWine,
    removeWine,
    toggleWine,
    isInCellar,
    updateWineReview
  };
}

/**
 * Helper para formatar a linha de vinho do Supabase e extrair a nota do usuário logado
 */
function formatWineRow(row, currentUserId) {
  const wineData = row?.wine_data || {};
  const userSpecificReview = wineData.reviews?.[currentUserId];

  return {
    ...wineData,
    _rowId: row.id,
    cellarId: row.cellar_id,
    userRating: userSpecificReview?.rating !== undefined ? userSpecificReview.rating : (wineData.userRating || 0),
    userReview: userSpecificReview?.review !== undefined ? userSpecificReview.review : (wineData.userReview || ''),
    userOccasion: userSpecificReview?.occasion !== undefined ? userSpecificReview.occasion : (wineData.userOccasion || ''),
    userReviewedAt: userSpecificReview?.reviewedAt || wineData.userReviewedAt
  };
}
