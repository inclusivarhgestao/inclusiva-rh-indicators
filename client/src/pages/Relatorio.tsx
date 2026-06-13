import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportRelatorioPDF } from "@/lib/pdf-export";

interface RelatorioProps {
  mes: number;
  ano: number;
}

export default function Relatorio({ mes, ano }: RelatorioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vagasAbertas: 0,
    vagasFechadas: 0,
    totalCandidatos: 0,
    contratacoes: 0,
    tempoMedioFechamento: 0,
    taxaAproveitamento: 0,
    resumo: "",
  });

  const { data: indicador, isLoading, refetch } = trpc.indicadores.getMensal.useQuery({ mes, ano });
  const { data: lojas } = trpc.lojas.list.useQuery();
  const { data: vagas } = trpc.vagas.list.useQuery({ mes, ano });
  const { data: candidatos } = trpc.candidatos.list.useQuery({ mes, ano });
  const updateIndicador = trpc.indicadores.create.useMutation();

  // Calcular dados por loja
  const dadosPorLoja = lojas?.map((loja: any) => {
    const vagasLoja = vagas?.filter((v: any) => v.lojaId === loja.id) || [];
    const candidatosLoja = candidatos?.filter((c: any) => {
      const vagaCandidata = vagas?.find((v: any) => v.id === c.vagaId);
      return vagaCandidata?.lojaId === loja.id;
    }) || [];

    return {
      lojaId: loja.id,
      lojaNome: loja.nome,
      vagasAbertas: vagasLoja.filter((v: any) => v.status === 'aberta').length,
      vagasFechadas: vagasLoja.filter((v: any) => v.status === 'fechada').length,
      totalVagas: vagasLoja.length,
      totalCandidatos: candidatosLoja.length,
      candidatosContratados: candidatosLoja.filter((c: any) => c.status === 'contratado').length,
    };
  }) || [];

  useEffect(() => {
    if (indicador) {
      setFormData({
        vagasAbertas: indicador.vagasAbertas || 0,
        vagasFechadas: indicador.vagasFechadas || 0,
        totalCandidatos: indicador.totalCandidatos || 0,
        contratacoes: indicador.contratacoes || 0,
        tempoMedioFechamento: Number(indicador.tempoMedioFechamento) || 0,
        taxaAproveitamento: Number(indicador.taxaAproveitamento) || 0,
        resumo: indicador.resumo || "",
      });
    }
  }, [indicador]);

  const handleSave = async () => {
    try {
      await updateIndicador.mutateAsync({
        mes,
        ano,
        ...formData,
      });
      toast.success("Relatório atualizado com sucesso");
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar relatório");
    }
  };

  const handleExportPDF = () => {
    try {
      exportRelatorioPDF({
        mes,
        ano,
        vagasAbertas: formData.vagasAbertas,
        vagasFechadas: formData.vagasFechadas,
        totalCandidatos: formData.totalCandidatos,
        contratacoes: formData.contratacoes,
        tempoMedioFechamento: formData.tempoMedioFechamento,
        taxaAproveitamento: formData.taxaAproveitamento,
        resumo: formData.resumo,
        dadosPorLoja: dadosPorLoja,
      });
      toast.success("PDF aberto para impressão/download");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Relatório Mensal</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:bg-secondary/90"}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>
      </div>

      {/* Relatório Content */}
      <Card className="p-8 border-2 border-primary/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-primary">Inclusiva RH</h1>
            <p className="text-lg text-gray-600">Relatório de Indicadores de R&S</p>
            <p className="text-sm text-gray-500 mt-2">
              Período: {new Date(ano, mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Metrics Grid - Totalizados */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Totalizados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-l-primary">
                <label className="text-sm font-medium text-gray-600">Vagas Abertas</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.vagasAbertas}
                    onChange={(e) => setFormData({ ...formData, vagasAbertas: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-3xl font-bold text-primary mt-2">{formData.vagasAbertas}</p>
                )}
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-l-secondary">
                <label className="text-sm font-medium text-gray-600">Vagas Fechadas</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.vagasFechadas}
                    onChange={(e) => setFormData({ ...formData, vagasFechadas: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-3xl font-bold text-secondary mt-2">{formData.vagasFechadas}</p>
                )}
              </div>

              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-l-green-600">
                <label className="text-sm font-medium text-gray-600">Contratações</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.contratacoes}
                    onChange={(e) => setFormData({ ...formData, contratacoes: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-3xl font-bold text-green-600 mt-2">{formData.contratacoes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <label className="text-sm font-medium text-gray-600">Total de Candidatos</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.totalCandidatos}
                  onChange={(e) => setFormData({ ...formData, totalCandidatos: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              ) : (
                <p className="text-3xl font-bold text-purple-600 mt-2">{formData.totalCandidatos}</p>
              )}
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <label className="text-sm font-medium text-gray-600">Tempo Médio (dias)</label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.1"
                  value={formData.tempoMedioFechamento}
                  onChange={(e) => setFormData({ ...formData, tempoMedioFechamento: parseFloat(e.target.value) || 0 })}
                  className="mt-2"
                />
              ) : (
                <p className="text-3xl font-bold text-orange-600 mt-2">{formData.tempoMedioFechamento.toFixed(1)}</p>
              )}
            </div>

            <div className="bg-pink-50 p-6 rounded-lg">
              <label className="text-sm font-medium text-gray-600">Taxa de Aproveitamento (%)</label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.1"
                  value={formData.taxaAproveitamento}
                  onChange={(e) => setFormData({ ...formData, taxaAproveitamento: parseFloat(e.target.value) || 0 })}
                  className="mt-2"
                />
              ) : (
                <p className="text-3xl font-bold text-pink-600 mt-2">{formData.taxaAproveitamento.toFixed(1)}%</p>
              )}
            </div>
          </div>

          {/* Dados por Loja */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Dados por Loja</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border p-3 text-left font-semibold">Loja</th>
                    <th className="border p-3 text-center font-semibold">Vagas Abertas</th>
                    <th className="border p-3 text-center font-semibold">Vagas Fechadas</th>
                    <th className="border p-3 text-center font-semibold">Total Vagas</th>
                    <th className="border p-3 text-center font-semibold">Candidatos</th>
                    <th className="border p-3 text-center font-semibold">Contratados</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosPorLoja.map((loja: any) => (
                    <tr key={loja.lojaId} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">{loja.lojaNome}</td>
                      <td className="border p-3 text-center text-blue-600 font-semibold">{loja.vagasAbertas}</td>
                      <td className="border p-3 text-center text-yellow-600 font-semibold">{loja.vagasFechadas}</td>
                      <td className="border p-3 text-center text-gray-600">{loja.totalVagas}</td>
                      <td className="border p-3 text-center text-purple-600 font-semibold">{loja.totalCandidatos}</td>
                      <td className="border p-3 text-center text-green-600 font-semibold">{loja.candidatosContratados}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-bold">
                    <td className="border p-3">TOTAL</td>
                    <td className="border p-3 text-center text-blue-600">{dadosPorLoja.reduce((sum: number, l: any) => sum + l.vagasAbertas, 0)}</td>
                    <td className="border p-3 text-center text-yellow-600">{dadosPorLoja.reduce((sum: number, l: any) => sum + l.vagasFechadas, 0)}</td>
                    <td className="border p-3 text-center text-gray-600">{dadosPorLoja.reduce((sum: number, l: any) => sum + l.totalVagas, 0)}</td>
                    <td className="border p-3 text-center text-purple-600">{dadosPorLoja.reduce((sum: number, l: any) => sum + l.totalCandidatos, 0)}</td>
                    <td className="border p-3 text-center text-green-600">{dadosPorLoja.reduce((sum: number, l: any) => sum + l.candidatosContratados, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo */}
          <div>
            <label className="text-sm font-medium text-gray-600">Resumo do Período</label>
            {isEditing ? (
              <textarea
                value={formData.resumo}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                className="w-full mt-2 p-4 border rounded-lg min-h-32"
                placeholder="Digite o resumo do período..."
              />
            ) : (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg min-h-32 whitespace-pre-wrap">
                {formData.resumo || "Nenhum resumo adicionado"}
              </div>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
