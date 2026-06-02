import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ConfirmPasswordResetPage } from "@/pages/ConfirmPasswordResetPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { Bike, Loader2 } from "lucide-react";

// Define tipos de páginas de autenticação que podem ser exibidas
type AuthPage = "login" | "register" | "reset-password" | "confirm-reset";

/**
 * Componente principal que renderiza o conteúdo da aplicação
 * Controla a navegação entre páginas de autenticação e dashboard
 * com base no estado do usuário
 */
function AppContent() {
 const { user, loading } = useAuth();
 const [authPage, setAuthPage] = useState<AuthPage>("login");
 const [urlCleared, setUrlCleared] = useState(false);

 // Detecta se há um token de recovery no URL (link de reset de senha)
 useEffect(() => {
   const hash = window.location.hash;
   if (hash.includes("type=recovery")) {
     setAuthPage("confirm-reset");
     // Aguarda um pouco para deixar o Supabase processar a sessão
     // Depois remove o hash do URL para limpar a interface
     setTimeout(() => {
       window.history.replaceState({}, document.title, window.location.pathname);
       setUrlCleared(true);
     }, 500);
   }
 }, []);

 // Exibe tela de carregamento enquanto valida autenticação
 if (loading) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ">
 <div className="bg-blue-600 text-white rounded-full p-4 mb-4 shadow-lg">
 <Bike className="h-10 w-10" />
 </div>
 <Loader2 className="h-6 w-6 animate-spin text-blue-600 " />
 <p className="text-gray-500 text-sm mt-3">Carregando...</p>
 </div>
 );
 }

 // Se usuário autenticado e tentar acessar reset-password, vai para confirm-reset
 if (user && authPage === "confirm-reset") {
   return <ConfirmPasswordResetPage onNavigate={setAuthPage} />;
 }

 // Se usuário autenticado, exibe dashboard
 if (user) {
 return <DashboardPage />;
 }

 // Renderiza página de confirmação de reset se selecionada
 if (authPage === "confirm-reset") {
   return <ConfirmPasswordResetPage onNavigate={setAuthPage} />;
 }

 // Renderiza página de registro se selecionada
 if (authPage === "register") {
 return <RegisterPage onNavigate={setAuthPage} />;
 }

 // Renderiza página de recuperação de senha se selecionada
 if (authPage === "reset-password") {
 return <ResetPasswordPage onNavigate={setAuthPage} />;
 }

 // Renderiza página de login por padrão
 return <LoginPage onNavigate={setAuthPage} />;
}

/**
 * Componente raiz da aplicação
 * Envolve tudo com AuthProvider para fornecer contexto de autenticação
 */
export default function App() {
 return (
 <AuthProvider>
 <AppContent />
 </AuthProvider>
 );
}
