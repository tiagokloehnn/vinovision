import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega perfil do usuário da tabela public.profiles
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[AuthContext] Erro ao buscar perfil:', error.message);
        setProfile({ role: 'USER_COMMON' });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[AuthContext] Erro inesperado ao buscar perfil:', err);
      setProfile({ role: 'USER_COMMON' });
    }
  };

  useEffect(() => {
    // Carrega a sessão já existente ao iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças de autenticação (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
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
