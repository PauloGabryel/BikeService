import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Interface que define a estrutura do contexto de autenticação
interface AuthContextType {
  user: User | null; // Usuário autenticado (do Supabase Auth)
  session: Session | null; // Sessão ativa do usuário
  username: string | null; // Nome de usuário (armazenado em user_profiles)
  loading: boolean; // Estado de carregamento
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Lock para evitar múltiplas chamadas simultâneas de fetchUsername
  const fetchingUserIdRef = useRef<string | null>(null);

  // Função para buscar o username do usuário
  const fetchUsername = async (userId: string) => {
    try {
      // Evitar múltiplas chamadas simultâneas
      if (fetchingUserIdRef.current === userId) {
        console.log("⏳ Já está buscando username para:", userId);
        return;
      }
      
      fetchingUserIdRef.current = userId;
      console.log("📍 Buscando username para userId:", userId);
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Erro ao buscar username:", error.message);
        setUsername(null);
      } else if (data?.username) {
        console.log("✅ Username encontrado:", data.username);
        setUsername(data.username);
      } else {
        console.log("⚠️ Nenhum username encontrado");
        setUsername(null);
      }
    } catch (error) {
      console.error("❌ Exceção ao buscar username:", error);
      setUsername(null);
    } finally {
      fetchingUserIdRef.current = null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchUsername(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        fetchUsername(session.user.id);
      } else {
        setUsername(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      
      // Verificar se o perfil existe
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", session.session.user.id)
          .maybeSingle();
        
        if (profileError || !profile) {
          // Perfil não encontrado, fazer logout
          await supabase.auth.signOut();
          setUsername(null);
          return { error: "Nenhuma conta encontrada no banco de dados" };
        }
        
        // Perfil existe, buscar username
        fetchUsername(session.session.user.id);
      }
      
      return { error: null };
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      return { error: "Erro ao fazer login" };
    }
  };

  // Registra um novo usuário com email, senha e username
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };

      if (data.user?.id) {
        console.log("✅ Usuário criado:", data.user.id);
        
        // Inserir perfil com username fornecido
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: data.user.id,
            username: username,
          });

        if (profileError) {
          console.error("❌ Erro ao inserir perfil:", profileError.message);
          return { error: "Erro ao criar perfil" };
        }
        
        console.log("✅ Perfil criado com username:", username);
        setUsername(username);
      }
    } catch (error) {
      console.error("❌ Erro no signup:", error);
      return { error: "Erro ao criar conta" };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    setUsername(null);
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    try {
      // Verifica se há uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { error: "Sessão expirada. Por favor, solicite um novo link de recuperação de senha." };
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      return { error: "Erro ao atualizar senha. Tente novamente." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, username, loading, signIn, signUp, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
