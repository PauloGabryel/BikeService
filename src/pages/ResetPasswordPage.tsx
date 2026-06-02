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
import { Bike, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

interface ResetPasswordPageProps {
 onNavigate: (page: "login" | "register" | "reset-password") => void;
}

/**
 * Página de recuperação de senha
 * Permite que usuários solicitem um link de reset de senha
 */
export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
 const { resetPassword } = useAuth();
 // Estados de formulário
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false); // Indica se o email foi enviado com sucesso

 /**
 * Valida email e envia link de recuperação
 */
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 // Validação: Email obrigatório
 if (!email.trim()) {
 setError("O e-mail é obrigatório.");
 return;
 }

 // Validação: Formato de email válido
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(email)) {
 setError("Informe um e-mail válido.");
 return;
 }

 setLoading(true);
 const { error } = await resetPassword(email);
 if (error) {
 setError(error);
 } else {
 // Email enviado com sucesso
 setSuccess(true);
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
 <CardTitle className="text-2xl text-center text-gray-900">Recuperar senha</CardTitle>
 <CardDescription className="text-center">
 {success
 ? "Verifique seu e-mail para redefinir a senha."
 : "Informe seu e-mail para receber o link de recuperação."}
 </CardDescription>
 </CardHeader>

 {/* Tela de sucesso após envio do email */}
 {success ? (
 <CardContent className="bg-white">
 <div className="flex flex-col items-center gap-4 text-center py-4">
 {/* Ícone de sucesso */}
 <div className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-full p-3 animate-bounce">
 <CheckCircle2 className="h-10 w-10" />
 </div>
 <p className="text-gray-700 text-sm">
 Enviamos um link de recuperação para <strong className="text-gray-900">{email}</strong>.
 Verifique sua caixa de entrada (e o spam).
 </p>
 <Button 
 onClick={() => onNavigate("login")} 
 className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
 >
 Voltar ao Login
 </Button>
 </div>
 </CardContent>
 ) : (
 // Formulário de recuperação
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
 <Label htmlFor="email">E-mail cadastrado</Label>
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
 Enviando...
 </>
 ) : (
 "Enviar link de recuperação"
 )}
 </Button>
 {/* Link para voltar ao login */}
 <button
 type="button"
 onClick={() => onNavigate("login")}
 className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
 >
 <ArrowLeft className="h-4 w-4" />
 Voltar ao login
 </button>
 </CardFooter>
 </form>
 )}
 </Card>
 </div>
 </div>
 );
}
