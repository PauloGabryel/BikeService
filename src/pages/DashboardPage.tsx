import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Manutencao, ManutencaoInsert } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/ui/card";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ManutencaoForm } from "@/components/ManutencaoForm";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
 Bike,
 Plus,
 LogOut,
 Pencil,
 Trash2,
 DollarSign,
 Wrench,
 CalendarDays,
 Search,
 Loader2,
 TrendingUp,
 User,
 MapPin,
 ChevronDown,
 ChevronUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata valor numérico como moeda brasileira (BRL)
 */
function formatCurrency(value: number) {
 return new Intl.NumberFormat("pt-BR", {
 style: "currency",
 currency: "BRL",
 }).format(value);
}

/**
 * Formata string de data ISO para formato brasileiro (dd/MM/yyyy)
 */
function formatDate(dateStr: string) {
 try {
 return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
 } catch {
 return dateStr;
 }
}

// Tipos de campos disponíveis para ordenação
type SortField = "data" | "custo" | "tipo_servico";
// Direções de ordenação
type SortDir = "asc" | "desc";

/**
 * Dashboard principal da aplicação
 * Exibe histórico de manutenções com filtros, busca e ordenação
 * Permite criar, editar e deletar registros de manutenções
 */
export function DashboardPage() {
 const { user, signOut, username } = useAuth();
 const { toast } = useToast();

 // Estado da lista de manutenções
 const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
 const [loading, setLoading] = useState(true);

 // Filtros e ordenação
 const [search, setSearch] = useState("");
 const [sortField, setSortField] = useState<SortField>("data");
 const [sortDir, setSortDir] = useState<SortDir>("desc");

 // Gerenciamento de formulário e edição
 const [formOpen, setFormOpen] = useState(false);
 const [editingManutencao, setEditingManutencao] = useState<Manutencao | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 /**
 * Busca todas as manutenções do usuário do banco de dados
 * Utiliza useCallback para evitar recriação desnecessária
 */
 const fetchManutencoes = useCallback(async () => {
 setLoading(true);
 const { data, error } = await supabase
 .from("manutencoes")
 .select("*")
 .order("data", { ascending: false });

 if (error) {
 toast({
 title: "Erro ao carregar manutenções",
 description: error.message,
 variant: "destructive",
 });
 } else {
 setManutencoes(data as Manutencao[]);
 }
 setLoading(false);
 }, [toast]);

 // Carrega manutenções ao montar o componente
 useEffect(() => {
 fetchManutencoes();
 }, [fetchManutencoes]);

 /**
 * Salva uma nova manutenção ou atualiza uma existente
 * Realiza operação no banco e atualiza a lista local
 */
 const handleSave = async (formData: ManutencaoInsert): Promise<{ error: string | null }> => {
 if (editingManutencao) {
 // Modo de edição: atualiza registro existente
 const { error } = await supabase
 .from("manutencoes")
 .update({
 ...formData,
 updated_at: new Date().toISOString(),
 })
 .eq("id", editingManutencao.id);

 if (error) return { error: error.message };

 toast({
 title: "✅ Manutenção atualizada!",
 description: `${formData.tipo_servico} foi atualizado com sucesso.`,
 variant: "success",
 });
 fetchManutencoes();
 setEditingManutencao(null);
 return { error: null };
 } else {
 // Modo de criação: insere novo registro
 const { error } = await supabase.from("manutencoes").insert({
 ...formData,
 user_id: user!.id,
 });

 if (error) return { error: error.message };

 toast({
 title: "✅ Manutenção registrada!",
 description: `${formData.tipo_servico} foi registrado com sucesso.`,
 variant: "success",
 });
 fetchManutencoes();
 return { error: null };
 }
 };

 /**
 * Deleta um registro de manutenção do banco de dados
 */
 const handleDelete = async (id: string) => {
 setDeletingId(id);
 const { error } = await supabase.from("manutencoes").delete().eq("id", id);

 if (error) {
 toast({
 title: "Erro ao deletar",
 description: error.message,
 variant: "destructive",
 });
 } else {
 toast({
 title: "🗑️ Manutenção removida",
 description: "O registro foi excluído com sucesso.",
 variant: "default",
 });
 fetchManutencoes();
 }
 setDeletingId(null);
 };

 /**
 * Abre o formulário para editar uma manutenção existente
 */
 const handleEdit = (manutencao: Manutencao) => {
 setEditingManutencao(manutencao);
 setFormOpen(true);
 };

 /**
 * Abre o formulário para criar uma nova manutenção
 */
 const handleOpenNew = () => {
 setEditingManutencao(null);
 setFormOpen(true);
 };

 /**
 * Alterna a direção de ordenação quando clica no mesmo campo
 * Se clicar num novo campo, ordena em ordem decrescente por padrão
 */
 const handleSort = (field: SortField) => {
 if (field === sortField) {
 // Mesmo campo: inverte direção (asc <-> desc)
 setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 } else {
 // Novo campo: começa com desc
 setSortField(field);
 setSortDir("desc");
 }
 };

 /**
 * ETAPA 1: Filtrar registros por texto de busca
 * Busca em tipo_servico, local e observacoes
 */
 const filtered = manutencoes.filter((m) => {
 const q = search.toLowerCase();
 return (
 m.tipo_servico.toLowerCase().includes(q) ||
 m.local.toLowerCase().includes(q) ||
 (m.observacoes ?? "").toLowerCase().includes(q)
 );
 });

 /**
 * ETAPA 2: Ordenar registros filtrados por campo e direção selecionados
 */
 const sorted = [...filtered].sort((a, b) => {
 let cmp = 0;
 if (sortField === "data") {
 cmp = a.data.localeCompare(b.data); // Comparação de strings (ISO date)
 } else if (sortField === "custo") {
 cmp = a.custo - b.custo; // Comparação numérica
 } else if (sortField === "tipo_servico") {
 cmp = a.tipo_servico.localeCompare(b.tipo_servico); // Comparação alfabética
 }
 // Aplicar direção: se asc retorna cmp, se desc retorna -cmp
 return sortDir === "asc" ? cmp : -cmp;
 });

 /**
 * ETAPA 3: Calcular estatísticas dos registros
 * Estas estatísticas mostram dados TOTAIS, não apenas dos filtrados
 */
 const totalGasto = manutencoes.reduce((sum, m) => sum + m.custo, 0);
 const totalManutencoes = manutencoes.length;
 const mediaGasto = totalManutencoes > 0 ? totalGasto / totalManutencoes : 0;
 const ultimaManutencao = manutencoes.length > 0 ? manutencoes[0] : null;

 /**
 * Componente renderizado condicionalmente para exibir ícone de ordenação
 * Mostra seta para cima/baixo dependendo da direção
 */
 const SortIcon = ({ field }: { field: SortField }) => {
 if (sortField !== field) return null;
 return sortDir === "asc" ? (
 <ChevronUp className="h-3 w-3 inline ml-1" />
 ) : (
 <ChevronDown className="h-3 w-3 inline ml-1" />
 );
 };

 return (
 <div className="min-h-screen bg-gray-50 ">
 <Toaster />

 {/* ===== HEADER ===== */}
 <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo e título */}
 <div className="flex items-center gap-3">
 <div className="bg-blue-600 text-white rounded-lg p-2">
 <Bike className="h-5 w-5" />
 </div>
 <div>
 <h1 className="font-bold text-gray-900 text-lg leading-tight">BikeService</h1>
 <p className="text-xs text-gray-500 hidden sm:block">Controle de manutenções</p>
 </div>
 </div>
 {/* Usuário logado, botão de tema e botão de logout */}
 <div className="flex items-center gap-2 sm:gap-3">
 <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
 <User className="h-3.5 w-3.5" />
 <span className="max-w-[160px] truncate">{username || "Usuário"}</span>
 </div>
 {/* Botão de logout */}
 <Button
 variant="outline"
 size="sm"
 onClick={signOut}
 className="flex items-center gap-1.5 "
 >
 <LogOut className="h-4 w-4" />
 <span className="hidden sm:inline">Sair</span>
 </Button>
 </div>
 </div>
 </div>
 </header>

 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
 {/* ===== WELCOME BANNER ===== */}
 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-md">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-bold">
 Olá, {username || "Usuário"}! 👋
 </h2>
 <p className="text-blue-100 text-sm mt-1">
 Gerencie e acompanhe todas as manutenções da sua bicicleta em um só lugar.
 </p>
 </div>
 {/* Botão para nova manutenção */}
 <Button
 onClick={handleOpenNew}
 className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shrink-0 shadow"
 >
 <Plus className="h-4 w-4" />
 Nova manutenção
 </Button>
 </div>
 </div>

 {/* ===== STATISTICS CARDS ===== */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Total gasto */}
 <Card className="border-0 shadow-sm ">
 <CardContent className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total gasto</p>
 <p className="text-2xl font-bold text-gray-900 mt-1">
 {formatCurrency(totalGasto)}
 </p>
 </div>
 <div className="bg-green-100 text-green-600 rounded-lg p-2.5">
 <DollarSign className="h-5 w-5" />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Total de serviços */}
 <Card className="border-0 shadow-sm ">
 <CardContent className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Serviços</p>
 <p className="text-2xl font-bold text-gray-900 mt-1">{totalManutencoes}</p>
 </div>
 <div className="bg-blue-100 text-blue-600 rounded-lg p-2.5">
 <Wrench className="h-5 w-5" />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Média por serviço */}
 <Card className="border-0 shadow-sm ">
 <CardContent className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Média/serviço</p>
 <p className="text-2xl font-bold text-gray-900 mt-1">
 {formatCurrency(mediaGasto)}
 </p>
 </div>
 <div className="bg-purple-100 text-purple-600 rounded-lg p-2.5">
 <TrendingUp className="h-5 w-5" />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Último serviço */}
 <Card className="border-0 shadow-sm ">
 <CardContent className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Último serviço</p>
 <p className="text-base font-bold text-gray-900 mt-1 truncate max-w-[100px]">
 {ultimaManutencao ? formatDate(ultimaManutencao.data) : "—"}
 </p>
 </div>
 <div className="bg-orange-100 text-orange-600 rounded-lg p-2.5">
 <CalendarDays className="h-5 w-5" />
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* ===== TABLE SECTION ===== */}
 <Card className="border-0 shadow-sm ">
 <CardHeader className="pb-4 ">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <CardTitle className="text-lg ">Histórico de Manutenções</CardTitle>
 <CardDescription className="">
 {totalManutencoes > 0
 ? `${totalManutencoes} registro${totalManutencoes > 1 ? "s" : ""} encontrado${totalManutencoes > 1 ? "s" : ""}`
 : "Nenhum registro ainda"}
 </CardDescription>
 </div>
 {/* Campo de busca */}
 <div className="relative w-full sm:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 " />
 <Input
 placeholder="Buscar por serviço, local..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 "
 />
 </div>
 </div>
 </CardHeader>

 <Separator className="" />

 <CardContent className="p-0 ">
 {/* Estado de carregamento */}
 {loading ? (
 <div className="flex items-center justify-center py-16">
 <Loader2 className="h-8 w-8 animate-spin text-blue-600 " />
 </div>
 ) : sorted.length === 0 ? (
 // Estado vazio
 <div className="flex flex-col items-center justify-center py-16 text-center px-4">
 <div className="bg-gray-100 rounded-full p-5 mb-4">
 <Bike className="h-10 w-10 text-gray-400 " />
 </div>
 <h3 className="font-semibold text-gray-700 text-lg">
 {search ? "Nenhum resultado encontrado" : "Nenhuma manutenção registrada"}
 </h3>
 <p className="text-gray-400 text-sm mt-1 max-w-xs">
 {search
 ? "Tente buscar por outro termo."
 : "Clique em 'Nova manutenção' no banner acima para registrar o primeiro serviço."}
 </p>
 </div>
 ) : (
 <>
 {/* Desktop Table */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-gray-100 bg-gray-50/50 ">
 <th
 className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
 onClick={() => handleSort("data")}
 >
 Data <SortIcon field="data" />
 </th>
 <th
 className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
 onClick={() => handleSort("tipo_servico")}
 >
 Tipo de Serviço <SortIcon field="tipo_servico" />
 </th>
 <th className="text-left px-6 py-3 font-medium text-gray-500 ">
 Local
 </th>
 <th className="text-left px-6 py-3 font-medium text-gray-500 max-w-[200px]">
 Observações
 </th>
 <th
 className="text-right px-6 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
 onClick={() => handleSort("custo")}
 >
 Custo <SortIcon field="custo" />
 </th>
 <th className="text-right px-6 py-3 font-medium text-gray-500 ">
 Ações
 </th>
 </tr>
 </thead>
 <tbody>
 {sorted.map((m, index) => (
 <tr
 key={m.id}
 className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
 index % 2 === 0 ? "" : "bg-gray-50/30 "
 }`}
 >
 <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
 {formatDate(m.data)}
 </td>
 <td className="px-6 py-4">
 <Badge variant="secondary" className="font-medium ">
 {m.tipo_servico}
 </Badge>
 </td>
 <td className="px-6 py-4 text-gray-600 ">
 <div className="flex items-center gap-1.5">
 <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
 {m.local}
 </div>
 </td>
 <td className="px-6 py-4 text-gray-500 max-w-[200px]">
 <span className="truncate block" title={m.observacoes ?? ""}>
 {m.observacoes ? (
 m.observacoes.length > 50
 ? m.observacoes.substring(0, 50) + "..."
 : m.observacoes
 ) : (
 <span className="text-gray-300 italic">—</span>
 )}
 </span>
 </td>
 <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
 {formatCurrency(m.custo)}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(m)}
 className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 "
 >
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="ghost"
 size="sm"
 className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 "
 disabled={deletingId === m.id}
 >
 {deletingId === m.id ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 ) : (
 <Trash2 className="h-3.5 w-3.5" />
 )}
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className=" ">
 <AlertDialogHeader>
 <AlertDialogTitle className="">Confirmar exclusão</AlertDialogTitle>
 <AlertDialogDescription className="">
 Tem certeza que deseja excluir o registro de{" "}
 <strong>{m.tipo_servico}</strong> do dia{" "}
 <strong>{formatDate(m.data)}</strong>? Esta ação não pode
 ser desfeita.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className=" ">Cancelar</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleDelete(m.id)}
 className="bg-red-600 hover:bg-red-700 "
 >
 Excluir
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr className="bg-gray-50 border-t-2 border-gray-200 ">
 <td colSpan={4} className="px-6 py-3 font-semibold text-gray-700 text-sm">
 Total ({filtered.length} serviços)
 </td>
 <td className="px-6 py-3 text-right font-bold text-gray-900 text-base">
 {formatCurrency(filtered.reduce((s, m) => s + m.custo, 0))}
 </td>
 <td></td>
 </tr>
 </tfoot>
 </table>
 </div>

 {/* Mobile Cards */}
 <div className="md:hidden divide-y divide-gray-100 ">
 {sorted.map((m) => (
 <div key={m.id} className="p-4 hover:bg-gray-50 transition-colors">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <Badge variant="secondary" className="text-xs ">
 {m.tipo_servico}
 </Badge>
 <span className="text-xs text-gray-400 ">{formatDate(m.data)}</span>
 </div>
 <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-600 ">
 <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
 {m.local}
 </div>
 {m.observacoes && (
 <p className="text-xs text-gray-400 mt-1 truncate">
 {m.observacoes}
 </p>
 )}
 </div>
 <div className="text-right shrink-0">
 <p className="font-bold text-gray-900 ">{formatCurrency(m.custo)}</p>
 <div className="flex items-center gap-1 mt-1.5 justify-end">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(m)}
 className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 "
 >
 <Pencil className="h-3 w-3" />
 </Button>
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="ghost"
 size="sm"
 className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 "
 disabled={deletingId === m.id}
 >
 {deletingId === m.id ? (
 <Loader2 className="h-3 w-3 animate-spin" />
 ) : (
 <Trash2 className="h-3 w-3" />
 )}
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className=" ">
 <AlertDialogHeader>
 <AlertDialogTitle className="">Confirmar exclusão</AlertDialogTitle>
 <AlertDialogDescription className="">
 Tem certeza que deseja excluir{" "}
 <strong>{m.tipo_servico}</strong>? Esta ação não pode ser
 desfeita.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className=" ">Cancelar</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleDelete(m.id)}
 className="bg-red-600 hover:bg-red-700 "
 >
 Excluir
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </div>
 </div>
 </div>
 ))}
 {/* Mobile Total */}
 <div className="p-4 bg-gray-50 flex justify-between items-center">
 <span className="font-semibold text-gray-700 text-sm">
 Total ({filtered.length} serviços)
 </span>
 <span className="font-bold text-gray-900 ">
 {formatCurrency(filtered.reduce((s, m) => s + m.custo, 0))}
 </span>
 </div>
 </div>
 </>
 )}
 </CardContent>
 </Card>

 {/* Footer info */}
 <div className="text-center text-xs text-gray-400 pb-4">
 <p>
 Logado como <strong>{username || "Usuário"}</strong> · BikeService &copy; {new Date().getFullYear()}
 </p>
 </div>
 </main>

 {/* Maintenance Form Dialog */}
 <ManutencaoForm
 open={formOpen}
 onOpenChange={(open) => {
 setFormOpen(open);
 if (!open) setEditingManutencao(null);
 }}
 manutencao={editingManutencao}
 onSave={handleSave}
 />
 </div>
 );
}
