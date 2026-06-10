import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

interface VagasProps {
  mes: number;
  ano: number;
}

export default function Vagas({ mes, ano }: VagasProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    cargo: "",
    lojaId: "",
    descricao: "",
    quantidadeVagas: "1",
    dataAbertura: new Date().toISOString().split('T')[0],
  });

  const { data: vagas, isLoading, refetch } = trpc.vagas.list.useQuery({ mes, ano });
  const { data: lojas } = trpc.lojas.list.useQuery();
  const createVaga = trpc.vagas.create.useMutation();
  const updateVaga = trpc.vagas.update.useMutation();
  const deleteVaga = trpc.vagas.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.cargo || !formData.lojaId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateVaga.mutateAsync({
          id: editingId,
          cargo: formData.cargo,
          lojaId: parseInt(formData.lojaId),
          dataAbertura: formData.dataAbertura as any,
          descricao: formData.descricao,
          quantidadeVagas: parseInt(formData.quantidadeVagas),
        });
        toast.success("Vaga atualizada com sucesso");
      } else {
        await createVaga.mutateAsync({
          cargo: formData.cargo,
          lojaId: parseInt(formData.lojaId),
          dataAbertura: formData.dataAbertura as any,
          descricao: formData.descricao,
          quantidadeVagas: parseInt(formData.quantidadeVagas),
        });
        toast.success("Vaga criada com sucesso");
      }
      setFormData({ cargo: "", lojaId: "", descricao: "", quantidadeVagas: "1", dataAbertura: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar vaga");
    }
  };

  const handleEdit = (vaga: any) => {
    setFormData({
      cargo: vaga.cargo,
      lojaId: vaga.lojaId.toString(),
      descricao: vaga.descricao || "",
      quantidadeVagas: vaga.quantidadeVagas.toString(),
      dataAbertura: vaga.dataAbertura ? new Date(vaga.dataAbertura).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setEditingId(vaga.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta vaga?")) return;
    try {
      await deleteVaga.mutateAsync({ id });
      toast.success("Vaga deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar vaga");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Vagas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ cargo: "", lojaId: "", descricao: "", quantidadeVagas: "1", dataAbertura: new Date().toISOString().split('T')[0] });
                setEditingId(null);
              }}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cargo *</label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Loja *</label>
                <Select value={formData.lojaId} onValueChange={(val) => setFormData({ ...formData, lojaId: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {lojas?.map((loja: any) => (
                      <SelectItem key={loja.id} value={loja.id.toString()}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Data de Abertura *</label>
                <Input
                  type="date"
                  value={formData.dataAbertura}
                  onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantidade de Vagas</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantidadeVagas}
                  onChange={(e) => setFormData({ ...formData, quantidadeVagas: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da vaga..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                {editingId ? "Atualizar" : "Criar"} Vaga
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vagas List */}
      <div className="space-y-3">
        {vagas && vagas.length > 0 ? (
          vagas.map((vaga: any) => (
            <Card key={vaga.id} className="p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">{vaga.cargo}</h3>
                  <p className="text-sm text-gray-600">Loja: {lojas?.find((l: any) => l.id === vaga.lojaId)?.nome || 'Desconhecida'} | Vagas: {vaga.quantidadeVagas}</p>
                  <p className="text-sm text-gray-600">Data: {new Date(vaga.dataAbertura).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: <span className={`font-semibold ${vaga.status === 'aberta' ? 'text-green-600' : 'text-gray-600'}`}>{vaga.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(vaga)}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(vaga.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhuma vaga cadastrada para este período</div>
        )}
      </div>
    </div>
  );
}
