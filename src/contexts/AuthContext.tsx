import React, { createContext, useContext, useEffect, useState } from "react";
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

  // Função para buscar o username do usuário a partir da tabela user_profiles
  // Chamada após login bem-sucedido ou ao inicializar o contexto
  const fetchUsername = async (userId: string) => {
    try {
      console.log("📍 Buscando username para userId:", userId);
      // Query à tabela user_profiles com RLS ativa
      // Usando .maybeSingle() em vez de .single() para evitar erro 406
      // .maybeSingle() retorna null se não encontrar em vez de erro
      const { data, error } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle(); // .maybeSingle() retorna null se não encontrar, em vez de erro
      
      if (error) {
        console.error("❌ Erro ao buscar username:", error.message, error.code);
        setUsername(null);
        return;
      }
      
      console.log("📦 Dados retornados:", data);
      if (data?.username) {
        console.log("✅ Username encontrado:", data.username);
        setUsername(data.username);
      } else {
        console.log("⚠️ Nenhum username encontrado para este usuário, criando perfil padrão...");
        // Gerar um username único baseado no userId para evitar conflito de constraint UNIQUE
        const defaultUsername = `usuario_${userId.substring(0, 8)}`;
        
        // Se não existir perfil, usar upsert para evitar conflito de chave duplicada
        const { error: upsertError } = await supabase
          .from("user_profiles")
          .upsert({
            id: userId,
            username: defaultUsername,
          }, {
            onConflict: "id", // Se o id já existir, ignora
          });
        
        if (upsertError) {
          console.error("❌ Erro ao criar perfil padrão:", upsertError.message);
          setUsername(null);
        } else {
          console.log("✅ Perfil padrão criado/verificado com username:", defaultUsername);
          setUsername(defaultUsername);
        }
      }
    } catch (error) {
      console.error("❌ Exceção ao buscar username:", error);
      setUsername(null);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    
    // Buscar o username após o login bem-sucedido
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) {
      fetchUsername(data.session.user.id);
    }
    
    return { error: null };
  };

  // Registra um novo usuário com email, senha e username
  // Fluxo: 1) Criar usuário no auth 2) Inserir perfil em user_profiles 3) Atualizar contexto
  const signUp = async (email: string, password: string, username: string) => {
    // Etapa 1: Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    // Etapa 2: Se signup bem-sucedido, criar registro na tabela user_profiles
    if (data.user?.id) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id, // Chave estrangeira que referencia auth.users.id
          username: username,
        });

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        // IMPORTANTE: Não retornamos erro aqui pois o usuário JÁ foi criado no auth
        // Assim, o usuário pode fazer login e completar o perfil depois se necessário
      } else {
        // Etapa 3: Atualizar contexto local com o username
        setUsername(username);
      }
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
