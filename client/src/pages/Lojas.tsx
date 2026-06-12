import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit2, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Lojas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    nomeResponsavel: "",
    cidade: "",
    estado: "",
  });

  const { data: lojas, isLoading, refetch } = trpc.lojas.list.useQuery();
  const createLoja = trpc.lojas.create.useMutation();
  const updateLoja = trpc.lojas.update.useMutation();
  const deleteLoja = trpc.lojas.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.nome) {
      toast.error("Preencha o nome da loja");
      return;
    }

    try {
      if (editingId) {
        await updateLoja.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Loja atualizada com sucesso");
      } else {
        await createLoja.mutateAsync(formData);
        toast.success("Loja criada com sucesso");
      }
      setFormData({ nome: "", cnpj: "", endereco: "", nomeResponsavel: "", cidade: "", estado: "" });
      setEditingId(null);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar loja");
    }
  };

  const handleEdit = (loja: any) => {
    setFormData({
      nome: loja.nome,
      cnpj: loja.cnpj || "",
      endereco: loja.endereco || "",
      nomeResponsavel: loja.nomeResponsavel || "",
      cidade: loja.cidade || "",
      estado: loja.estado || "",
    });
    setEditingId(loja.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta loja?")) return;
    try {
      await deleteLoja.mutateAsync({ id });
      toast.success("Loja deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar loja");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Cadastro de Lojas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ nome: "", cnpj: "", endereco: "", nomeResponsavel: "", cidade: "", estado: "" });
                setEditingId(null);
              }}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Loja" : "Nova Loja"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-sm font-medium">Nome da Loja *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Inclusiva RH - Florianópolis"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CNPJ</label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="Ex: 12.345.678/0001-90"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123, Centro"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nome do Responsável</label>
                <Input
                  value={formData.nomeResponsavel}
                  onChange={(e) => setFormData({ ...formData, nomeResponsavel: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cidade</label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: Florianópolis"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Input
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  placeholder="Ex: SC"
                  maxLength={2}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                {editingId ? "Atualizar" : "Criar"} Loja
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lojas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lojas && lojas.length > 0 ? (
          lojas.map((loja: any) => (
            <Card key={loja.id} className="p-6 border-2 border-primary/20 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">{loja.nome}</h3>
                    {loja.cidade && (
                      <p className="text-sm text-gray-600">
                        {loja.cidade}
                        {loja.estado && ` - ${loja.estado}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {loja.cnpj && (
                  <p className="text-gray-700">
                    <span className="font-medium">CNPJ:</span> {loja.cnpj}
                  </p>
                )}
                {loja.endereco && (
                  <p className="text-gray-700">
                    <span className="font-medium">Endereço:</span> {loja.endereco}
                  </p>
                )}
                {loja.nomeResponsavel && (
                  <p className="text-gray-700">
                    <span className="font-medium">Responsável:</span> {loja.nomeResponsavel}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => handleEdit(loja)}
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(loja.id)}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-8 text-center text-gray-500">
            <p>Nenhuma loja cadastrada</p>
          </Card>
        )}
      </div>
    </div>
  );
}
