import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit2, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";

interface CandidatosProps {
  mes: number;
  ano: number;
}

const statusColors: Record<string, string> = {
  triagem: "bg-blue-100 text-blue-800",
  entrevista: "bg-yellow-100 text-yellow-800",
  teste: "bg-purple-100 text-purple-800",
  oferta: "bg-orange-100 text-orange-800",
  contratado: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
} as Record<string, string>;

const statusLabels: Record<string, string> = {
  triagem: "Triagem",
  entrevista: "Entrevista",
  teste: "Teste",
  oferta: "Oferta",
  contratado: "Contratado",
  rejeitado: "Rejeitado",
};

export default function Candidatos({ mes, ano }: CandidatosProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    vagaId: "",
    nome: "",
    email: "",
    telefone: "",
    status: "triagem",
    dataCandidatura: new Date().toISOString().split('T')[0],
  });

  const { data: vagas } = trpc.vagas.list.useQuery({ mes, ano });
  const { data: candidatos, isLoading, refetch } = trpc.candidatos.listByPeriod.useQuery({ mes, ano });
  const createCandidato = trpc.candidatos.create.useMutation();
  const updateCandidato = trpc.candidatos.update.useMutation();
  const deleteCandidato = trpc.candidatos.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.vagaId || !formData.nome) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateCandidato.mutateAsync({
          id: editingId,
          vagaId: parseInt(formData.vagaId),
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          status: formData.status as any,
        });
        toast.success("Candidato atualizado com sucesso");
      } else {
        await createCandidato.mutateAsync({
          vagaId: parseInt(formData.vagaId),
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          dataCandidatura: formData.dataCandidatura as any,
        });
        toast.success("Candidato criado com sucesso");
      }
      setFormData({ vagaId: "", nome: "", email: "", telefone: "", status: "triagem", dataCandidatura: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar candidato");
    }
  };

  const handleEdit = (candidato: any) => {
    setFormData({
      vagaId: candidato.vagaId.toString(),
      nome: candidato.nome,
      email: candidato.email || "",
      telefone: candidato.telefone || "",
      status: candidato.status,
      dataCandidatura: candidato.dataCandidatura ? new Date(candidato.dataCandidatura).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setEditingId(candidato.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este candidato?")) return;
    try {
      await deleteCandidato.mutateAsync({ id });
      toast.success("Candidato deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar candidato");
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

  // Filtrar candidatos por status e busca por nome
  const filteredCandidatos = (candidatos || [])
    .filter((c: any) => statusFilter === null || c.status === statusFilter)
    .filter((c: any) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Candidatos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ vagaId: "", nome: "", email: "", telefone: "", status: "triagem", dataCandidatura: new Date().toISOString().split('T')[0] });
                setEditingId(null);
              }}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Candidato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Candidato" : "Novo Candidato"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vaga *</label>
                <Select value={formData.vagaId} onValueChange={(val) => setFormData({ ...formData, vagaId: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {vagas?.map((vaga: any) => (
                      <SelectItem key={vaga.id} value={vaga.id.toString()}>
                        {vaga.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data de Candidatura *</label>
                <Input
                  type="date"
                  value={formData.dataCandidatura}
                  onChange={(e) => setFormData({ ...formData, dataCandidatura: e.target.value })}
                />
              </div>
              {editingId && (
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triagem">Triagem</SelectItem>
                      <SelectItem value="entrevista">Entrevista</SelectItem>
                      <SelectItem value="teste">Teste</SelectItem>
                      <SelectItem value="oferta">Oferta</SelectItem>
                      <SelectItem value="contratado">Contratado</SelectItem>
                      <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                {editingId ? "Atualizar" : "Criar"} Candidato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campo de Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full border border-gray-300 rounded-lg"
        />
      </div>

      {/* Filtro por Status */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            statusFilter === null
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Todos ({candidatos?.length || 0})
        </button>
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = (candidatos || []).filter((c: any) => c.status === status && c.nome.toLowerCase().includes(searchTerm.toLowerCase())).length || 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === status
                  ? statusColors[status]
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Candidatos List */}
      <div className="space-y-3">
        {filteredCandidatos && filteredCandidatos.length > 0 ? (
          filteredCandidatos.map((candidato: any) => (
            <Card key={candidato.id} className="p-4 border-l-4 border-l-secondary">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">{candidato.nome}</h3>
                  <p className="text-sm text-gray-600">Vaga: {vagas?.find((v: any) => v.id === candidato.vagaId)?.cargo || 'Desconhecida'}</p>
                  <p className="text-sm text-gray-600">{candidato.email || "Sem email"}</p>
                  <p className="text-sm text-gray-600">Data: {new Date(candidato.dataCandidatura).toLocaleDateString('pt-BR')}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[candidato.status] || "bg-gray-100"}`}>
                      {candidato.status}
                    </span>
                    {candidato.telefone && (
                      <span className="text-xs text-gray-500 py-1">{candidato.telefone}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(candidato)}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(candidato.id)}
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
          <div className="text-center py-8 text-gray-500">
            {statusFilter
              ? `Nenhum candidato em ${statusLabels[statusFilter]?.toLowerCase()} para este período`
              : "Nenhum candidato cadastrado para este período"}
          </div>
        )}
      </div>
    </div>
  );
}
