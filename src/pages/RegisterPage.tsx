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
import { Bike, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface RegisterPageProps {
  onNavigate: (page: "login" | "register" | "reset-password") => void;
}

/**
 * Página de registro de novos usuários
 * Valida email, senha, e nome de usuário com várias regras de segurança
 */
export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { signUp } = useAuth();
  // Estados de formulário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // Indica se o registro foi bem-sucedido
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Calcula a força da senha baseado em critérios
   */
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Nenhuma", color: "bg-gray-300" };
    
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Média", color: "bg-yellow-500" };
    if (score <= 3) return { score, label: "Boa", color: "bg-blue-500" };
    return { score, label: "Forte", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  /**
   * Valida e processa o registro de novo usuário
   * Realiza múltiplas validações antes de chamar signUp
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação: Username obrigatório
    if (!username.trim()) {
      setError("O nome de usuário é obrigatório.");
      return;
    }

    // Validação: Username entre 3 e 30 caracteres
    if (username.length < 3 || username.length > 30) {
      setError("O nome de usuário deve ter entre 3 e 30 caracteres.");
      return;
    }

    // Validação: Não permite múltiplos espaços consecutivos
    if (/  +/.test(username)) {
      setError("O nome de usuário não pode conter múltiplos espaços consecutivos.");
      return;
    }

    // Validação: Permite apenas letras, números, espaço, underscore e hífen
    if (!/^[a-zA-Z0-9_ -]+$/.test(username)) {
      setError("O nome de usuário pode conter apenas letras, números, espaço, underscore e hífen.");
      return;
    }

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

    // Validação: Senha obrigatória
    if (!password) {
      setError("A senha é obrigatória.");
      return;
    }

    // Validação: Senha com mínimo de 6 caracteres
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Validação: Senhas devem corresponder
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) {
      // Tratamento de erros específicos do Supabase
      if (error.toLowerCase().includes("already registered")) {
        setError("Este e-mail já está cadastrado. Tente fazer login.");
      } else if (error.toLowerCase().includes("duplicate")) {
        setError("Este nome de usuário já existe. Escolha outro.");
      } else {
        setError(error);
      }
    } else {
      // Registro bem-sucedido, exibe mensagem de confirmação
      setSuccess(true);
    }
    setLoading(false);
  };

  // Tela de sucesso após registro bem-sucedido
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-4 relative overflow-hidden">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 mb-4 shadow-lg hover:shadow-xl transition-shadow">
              <Bike className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">BikeService</h1>
          </div>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center py-4">
                {/* Ícone de sucesso */}
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-full p-3 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Conta criada!</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    Verifique seu e-mail <strong>{email}</strong> para confirmar
                    a conta antes de fazer login.
                  </p>
                </div>
                <Button 
                  onClick={() => onNavigate("login")} 
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Ir para o Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Formulário de registro
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
            <CardTitle className="text-2xl text-center text-gray-900">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Registre-se para começar a controlar suas manutenções
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
              {/* Campo de Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  disabled={loading}
                  maxLength={30}
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
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
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

                {/* Indicador de força da senha */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Força:</span>
                      <div className="flex gap-1 flex-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full flex-1 transition-colors ${
                              i < passwordStrength.score
                                ? passwordStrength.color
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`font-medium ${
                        passwordStrength.color.replace('bg-', 'text-')
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className={password.length >= 6 ? "text-green-600" : ""}>
                        ✓ Pelo menos 6 caracteres
                      </li>
                      <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600" : ""}>
                        ✓ Maiúsculas e minúsculas
                      </li>
                      <li className={/\d/.test(password) ? "text-green-600" : ""}>
                        ✓ Pelo menos 1 número
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Campo de Confirmação de Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Verificação de senhas iguais */}
                {confirmPassword && (
                  <div className={`text-xs flex items-center gap-1 ${
                    password === confirmPassword ? "text-green-600" : "text-red-600"
                  }`}>
                    {password === confirmPassword ? "✓" : "✗"} As senhas devem ser idênticas
                  </div>
                )}
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
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
              {/* Link para fazer login */}
              <p className="text-sm text-center text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
