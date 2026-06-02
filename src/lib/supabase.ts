import { createClient } from "@supabase/supabase-js";

// Carrega variáveis de ambiente do Vite
// VITE_SUPABASE_URL: URL do projeto Supabase
// VITE_SUPABASE_ANON_KEY: Chave anônima para operações públicas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Valida se as variáveis de ambiente foram configuradas
 * Avisa o desenvolvedor se alguma estiver faltando
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Variáveis de ambiente do Supabase não encontradas. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env"
  );
}

/**
 * Instancia cliente Supabase para a aplicação
 * Usa placeholder se variáveis não estiverem configuradas (para evitar erro na inicialização)
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
