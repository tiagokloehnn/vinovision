import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Previne buscas duplicadas concorrentes do mesmo perfil
  const fetchingIdRef = React.useRef(null);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    // Se já estamos buscando o perfil deste mesmo userId, evita chamada duplicada
    if (fetchingIdRef.current === userId) return;
    fetchingIdRef.current = userId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Ignora erros de cancelamento de requisição pelo cliente (ex: HTTP 499 / AbortError)
        if (!error.message?.includes('abort') && !error.message?.includes('canceled')) {
          console.error('[AuthContext] Erro ao buscar perfil:', error.message);
        }
        setProfile({ role: 'USER_COMMON' });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[AuthContext] Erro inesperado ao buscar perfil:', err);
      setProfile({ role: 'USER_COMMON' });
    } finally {
      fetchingIdRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout de segurança (3.5s): garante liberação do loading se a rede oscilar
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3500);

    // Escuta eventos de auth do Supabase (trata INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, etc)
    let listener = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        if (isMounted) setLoading(false);
        clearTimeout(safetyTimer);
      });
      listener = data;
    } catch (err) {
      console.error('[AuthContext] Erro ao registrar escutador de auth:', err);
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      if (listener?.subscription?.unsubscribe) {
        try {
          listener.subscription.unsubscribe();
        } catch (e) {
          // ignora falhas de cleanup
        }
      }
    };
  }, []);

  // Recarrega o perfil manualmente se necessário
  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // ── Métodos de Autenticação ──────────────────────────────────────────

  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Erro ao deslogar no Supabase:', err);
    } finally {
      // Garante que o estado local seja limpo independentemente de erros da API
      setUser(null);
      setProfile(null);
      
      // Limpa os tokens do Supabase salvos no localStorage
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error('[AuthContext] Erro ao limpar localStorage:', e);
      }
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const role = profile?.role || 'USER_COMMON';
  const isAdmin = role === 'ADMIN';
  const isPremium = role === 'USER_PREMIUM' || role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      isAdmin,
      isPremium,
      loading,
      refreshProfile,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniência
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
