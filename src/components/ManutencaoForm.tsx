import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Manutencao, ManutencaoInsert } from "@/types";
import { TIPOS_SERVICO } from "@/types";

interface ManutencaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencao?: Manutencao | null;
  onSave: (data: ManutencaoInsert) => Promise<{ error: string | null }>;
}

const today = new Date().toISOString().split("T")[0];

const defaultForm: ManutencaoInsert = {
  tipo_servico: "",
  data: today,
  custo: 0,
  local: "",
  observacoes: "",
};

/**
 * Componente de formulário para criar/editar manutenção
 * Pode ser usado para criar novo registro ou editar existente
 * Valida todos os campos antes de permitir envio
 */
export function ManutencaoForm({
  open,
  onOpenChange,
  manutencao,
  onSave,
}: ManutencaoFormProps) {
  const [form, setForm] = useState<ManutencaoInsert>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Formata entrada de custo: aceita apenas números e limita a 2 casas decimais
   */
  const handleCustoChange = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/\D/g, "");

    if (!numbersOnly) {
      setForm((prev) => ({ ...prev, custo: 0 }));
      return;
    }

    const limited = numbersOnly.substring(0, 8);
    const numericValue = parseInt(limited) / 100;
    setForm((prev) => ({
      ...prev,
      custo: numericValue,
    }));
  };

  /**
   * Preenche o formulário com dados da manutenção ao abrir
   */
  useEffect(() => {
    if (open) {
      if (manutencao) {
        setForm({
          tipo_servico: manutencao.tipo_servico,
          data: manutencao.data,
          custo: manutencao.custo,
          local: manutencao.local,
          observacoes: manutencao.observacoes ?? "",
        });
      } else {
        setForm(defaultForm);
      }
      setError(null);
    }
  }, [open, manutencao]);

  /**
   * Valida todos os campos obrigatórios do formulário
   */
  const validate = (): string | null => {
    if (!form.tipo_servico) return "Selecione o tipo de serviço.";
    if (!form.data) return "A data é obrigatória.";
    if (isNaN(form.custo) || form.custo < 0) return "O custo deve ser um valor positivo.";
    if (!form.local.trim()) return "O local é obrigatório.";
    return null;
  };

  /**
   * Processa envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await onSave({
      ...form,
      custo: Number(form.custo),
      observacoes: form.observacoes || null,
    });

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {manutencao ? "Editar Manutenção" : "Nova Manutenção"}
          </DialogTitle>
          <DialogDescription>
            {manutencao
              ? "Atualize os dados da manutenção registrada."
              : "Preencha os dados do serviço realizado na bicicleta."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipo_servico">
              Tipo de Serviço <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.tipo_servico}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, tipo_servico: value }))
              }
            >
              <SelectTrigger id="tipo_servico">
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_SERVICO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, data: e.target.value }))
                }
                max={today}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custo">
                Custo (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="custo"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={form.custo.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                onChange={(e) => handleCustoChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">
              Local / Oficina <span className="text-red-500">*</span>
            </Label>
            <Input
              id="local"
              type="text"
              placeholder="Ex: Bike Shop Centro, Bicicletaria do João"
              value={form.local}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, local: e.target.value }))
              }
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Descreva detalhes do serviço, peças trocadas, problemas encontrados..."
              value={form.observacoes ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, observacoes: e.target.value }))
              }
              rows={6}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 text-right">
              {(form.observacoes ?? "").length}/500
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : manutencao ? (
                "Salvar alterações"
              ) : (
                "Registrar manutenção"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
