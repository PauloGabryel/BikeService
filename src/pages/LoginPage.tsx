import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Bike, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
 onNavigate: (page: "login" | "register" | "reset-password") => void;
}

/**
 * Página de login da aplicação
 * Permite que usuários autenticados entrem na conta
 * com email e senha
 */
export function LoginPage({ onNavigate }: LoginPageProps) {
 const { signIn } = useAuth();
 // Estados de formulário
 const [email, setEmail] = useState(() => {
   // Carrega email salvo do localStorage ao inicializar
   return localStorage.getItem("rememberedEmail") || "";
 });
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [showPassword, setShowPassword] = useState(false);
 const [rememberEmail, setRememberEmail] = useState(() => {
   return localStorage.getItem("rememberedEmail") ? true : false;
 });

 /**
 * Valida e processa o login
 * Realiza validação básica antes de chamar signIn
 */
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 // Validação: Email obrigatório
 if (!email.trim()) {
 setError("O e-mail é obrigatório.");
 return;
 }
 // Validação: Senha obrigatória
 if (!password) {
 setError("A senha é obrigatória.");
 return;
 }

 setLoading(true);
 const { error } = await signIn(email, password);
 if (error) {
 // Tratamento de erros específicos do Supabase
 if (error.toLowerCase().includes("invalid login credentials")) {
 setError("E-mail ou senha incorretos. Verifique suas credenciais.");
 } else if (error.toLowerCase().includes("email not confirmed")) {
 setError("Confirme seu e-mail antes de fazer login.");
 } else {
 setError(error);
 }
 } else {
 // Salvar email se checkbox estiver marcado
 if (rememberEmail) {
 localStorage.setItem("rememberedEmail", email);
 } else {
 localStorage.removeItem("rememberedEmail");
 }
 }
 setLoading(false);
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-4 relative overflow-hidden">
 {/* Padrão de fundo animado */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
 <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
 </div>

 <div className="w-full max-w-md relative z-10">
 {/* Logo/Header */}
 <div className="flex flex-col items-center mb-8">
 <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 mb-4 shadow-lg hover:shadow-xl transition-shadow">
 <Bike className="h-10 w-10" />
 </div>
 <h1 className="text-4xl font-bold text-gray-900">BikeService</h1>
 <p className="text-gray-600 mt-1 text-sm text-center">
 Controle financeiro de manutenções de bicicletas
 </p>
 </div>

 <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
 <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
 <CardTitle className="text-2xl text-center text-gray-900">Entrar na conta</CardTitle>
 <CardDescription className="text-center">
 Acesse para gerenciar suas manutenções
 </CardDescription>
 </CardHeader>
 <form onSubmit={handleSubmit}>
 <CardContent className="space-y-4">
 {/* Exibe mensagem de erro se houver */}
 {error && (
 <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
 <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
 <span>{error}</span>
 </div>
 )}
 {/* Campo de Email */}
 <div className="space-y-2">
 <Label htmlFor="email">E-mail</Label>
 <Input
 id="email"
 type="email"
 placeholder="seu@email.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 autoComplete="off"
 disabled={loading}
 />
 </div>
 {/* Campo de Senha */}
 <div className="space-y-2">
 <Label htmlFor="password">Senha</Label>
 <div className="relative">
 <Input
 id="password"
 type={showPassword ? "text" : "password"}
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 autoComplete="current-password"
 disabled={loading}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
 >
 {showPassword ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </button>
 </div>
 </div>
 {/* Link para recuperação de senha */}
 <div className="flex items-center justify-between">
 <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
 <input
 type="checkbox"
 checked={rememberEmail}
 onChange={(e) => setRememberEmail(e.target.checked)}
 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
 disabled={loading}
 />
 Lembrar email
 </label>
 <button
 type="button"
 onClick={() => onNavigate("reset-password")}
 className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
 >
 Esqueceu a senha?
 </button>
 </div>
 </CardContent>
 <CardFooter className="flex flex-col gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-lg pt-6">
 {/* Botão de envio */}
 <Button 
 type="submit" 
 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95" 
 disabled={loading}
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 Entrando...
 </>
 ) : (
 "Entrar"
 )}
 </Button>
 {/* Link para criar conta */}
 <p className="text-sm text-center text-gray-600 ">
 Não tem uma conta?{" "}
 <button
 type="button"
 onClick={() => onNavigate("register")}
 className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
 >
 Criar conta
 </button>
 </p>
 </CardFooter>
 </form>
 </Card>
 </div>
 </div>
 );
}
