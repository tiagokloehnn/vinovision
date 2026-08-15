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

  // ── 2. Carregar vinhos da adega ativa ──────────────────────────────────────
  const loadActiveCellarWines = useCallback(async () => {
    if (!user) {
      setCellarWines([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let query = supabase.from('cellar').select('*');

      if (activeCellarId === 'personal') {
        // Vinhos da adega pessoal: user_id = user.id AND (cellar_id IS NULL OR cellar_id = 'personal')
        query = query.eq('user_id', user.id);
      } else {
        // Vinhos da adega compartilhada: cellar_id = activeCellarId
        query = query.eq('cellar_id', activeCellarId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        // Se a coluna cellar_id não existir na tabela ainda, filtra os vinhos do usuário
        const { data: fallbackData } = await supabase
          .from('cellar')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fallbackData) {
          setCellarWines(fallbackData.map(row => formatWineRow(row, user.id)));
        } else {
          setCellarWines([]);
        }
      } else if (Array.isArray(data)) {
        // Se for a adega pessoal, filtra os que não pertencem a adegas compartilhadas
        const filtered = activeCellarId === 'personal'
          ? data.filter(row => !row.cellar_id || row.cellar_id === 'personal')
          : data;
        setCellarWines(filtered.map(row => formatWineRow(row, user.id)));
      } else {
        setCellarWines([]);
      }
    } catch (err) {
      console.error('[useSharedCellar] Erro ao carregar vinhos:', err);
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

  // ── 4. Criar nova adega compartilhada ─────────────────────────────────────
  const createSharedCellar = async (name, description = '') => {
    if (!user) throw new Error('Usuário não autenticado.');

    // Gera código de convite único: ex: VINO-7821
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

  // ── 5. Entrar em adega por código de convite ──────────────────────────────
  const joinSharedCellar = async (inviteCode) => {
    if (!user) throw new Error('Usuário não autenticado.');

    const cleanCode = inviteCode.trim().toUpperCase();

    // Busca a adega pelo código de convite
    const { data: targetCellar, error: findError } = await supabase
      .from('shared_cellars')
      .select('*')
      .ilike('invite_code', cleanCode)
      .single();

    if (findError || !targetCellar) {
      throw new Error('Código de convite não encontrado. Verifique o código e tente novamente.');
    }

    // Adiciona o usuário como membro
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

  // ── 6. Sair ou excluir adega compartilhada ────────────────────────────────
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

  // ── 7. Adicionar / Remover Vinho ──────────────────────────────────────────
  const addWine = async (wine) => {
    if (!user) return;

    const alreadyIn = cellarWines.some(w => w.id === wine.id);
    if (alreadyIn) return;

    const authorName = profile?.full_name || user.email?.split('@')[0] || 'Sommelier';

    const enrichedWine = {
      ...wine,
      addedBy: {
        id: user.id,
        name: authorName,
        at: new Date().toISOString()
      },
      reviews: wine.reviews || {}
    };

    setCellarWines(prev => [enrichedWine, ...prev]);

    const insertPayload = {
      user_id: user.id,
      wine_id: wine.id,
      wine_data: enrichedWine,
      cellar_id: activeCellarId === 'personal' ? null : activeCellarId
    };

    const { data, error } = await supabase
      .from('cellar')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[useSharedCellar] Erro ao adicionar vinho:', error);
      setCellarWines(prev => prev.filter(w => w.id !== wine.id));
    } else {
      setCellarWines(prev =>
        prev.map(w => (w.id === wine.id ? { ...enrichedWine, _rowId: data.id } : w))
      );
    }
  };

  const removeWine = async (wineId) => {
    if (!user) return;

    const target = cellarWines.find(w => w.id === wineId);
    if (!target) return;

    setCellarWines(prev => prev.filter(w => w.id !== wineId));

    const { error } = await supabase
      .from('cellar')
      .delete()
      .eq('id', target._rowId);

    if (error) {
      console.error('[useSharedCellar] Erro ao remover vinho:', error);
      setCellarWines(prev => [target, ...prev]);
    }
  };

  const toggleWine = async (wine) => {
    const isIn = cellarWines.some(w => w.id === wine.id);
    if (isIn) await removeWine(wine.id);
    else       await addWine(wine);
  };

  const isInCellar = (wineId) => cellarWines.some(w => w.id === wineId);

  // ── 8. Atualizar avaliação colaborativa ───────────────────────────────────
  const updateWineReview = async (wineOrId, reviewData) => {
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

    // Calcula a média das notas de todos os membros que avaliaram a garrafa
    const ratingsArray = Object.values(updatedReviews).map(r => r.rating).filter(r => r > 0);
    const groupAverageRating = ratingsArray.length > 0
      ? Number((ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length).toFixed(1))
      : 0;

    // Se o vinho ainda não estiver salvo na adega, cria e adiciona
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

      setCellarWines(prev => [initialWine, ...prev]);

      const { data, error } = await supabase
        .from('cellar')
        .insert({
          user_id: user.id,
          wine_id: wineId,
          wine_data: initialWine,
          cellar_id: activeCellarId === 'personal' ? null : activeCellarId
        })
        .select()
        .single();

      if (error) {
        console.error('[useSharedCellar] Erro ao salvar avaliação:', error);
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
      userReviewedAt: new Date().toISOString(),
      reviews: updatedReviews,
      groupAverageRating
    };

    setCellarWines(prev => prev.map(w => (w.id === wineId ? updatedWine : w)));

    const { error } = await supabase
      .from('cellar')
      .update({ wine_data: updatedWine })
      .eq('id', target._rowId);

    if (error) {
      console.error('[useSharedCellar] Erro ao atualizar avaliação:', error);
      setCellarWines(prev => prev.map(w => (w.id === wineId ? target : w)));
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
