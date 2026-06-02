/**
 * Tipo que representa um registro completo de manutenção no banco de dados
 * Inclui todos os campos retornados do Supabase
 */
export interface Manutencao {
  id: string; // UUID gerado automaticamente
  user_id: string; // ID do usuário proprietário (FK para auth.users)
  tipo_servico: string; // Tipo de serviço realizado
  data: string; // Data da manutenção (formato ISO YYYY-MM-DD)
  custo: number; // Custo em BRL (com até 2 casas decimais)
  local: string; // Local/oficina onde foi realizado o serviço
  observacoes: string | null; // Notas adicionais (opcional)
  created_at: string; // Timestamp de criação
  updated_at: string; // Timestamp de última atualização
}

/**
 * Tipo para inserção de nova manutenção (omite campos de sistema)
 * Usado ao criar novo registro (sem id, user_id, timestamps)
 */
export type ManutencaoInsert = Omit<Manutencao, "id" | "user_id" | "created_at" | "updated_at">;

/**
 * Tipo para atualização parcial de manutenção
 * Permite atualizar qualquer combinação de campos
 */
export type ManutencaoUpdate = Partial<ManutencaoInsert>;

/**
 * Lista de tipos de serviços predefinidos
 * Usada para popular o select no formulário de manutenção
 * O tipo "Outro" permite serviços não listados
 */
export const TIPOS_SERVICO = [
  "Troca de pneu",
  "Troca de câmara",
  "Ajuste de freios",
  "Troca de pastilhas",
  "Lubrificação da corrente",
  "Troca de corrente",
  "Ajuste de marchas",
  "Troca de cabo",
  "Troca de pedal",
  "Troca de selim",
  "Regulagem geral",
  "Troca de rolamentos",
  "Limpeza completa",
  "Troca de guidão",
  "Troca de garfo",
  "Reparo de quadro",
  "Troca de movimento central",
  "Troca de cassete",
  "Troca de pinhão",
  "Outro",
] as const;
