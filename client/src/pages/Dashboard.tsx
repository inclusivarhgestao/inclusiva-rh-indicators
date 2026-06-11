import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardProps {
  mes: number;
  ano: number;
}

export default function Dashboard({ mes, ano }: DashboardProps) {
  const [lojaFilter, setLojaFilter] = useState<string>("all");

  const { data: lojas } = trpc.lojas.list.useQuery();
  const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery({
    mes,
    ano,
    lojaId: lojaFilter && lojaFilter !== "all" ? parseInt(lojaFilter) : undefined,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center text-gray-500">Nenhum dado disponível</div>;
  }

  const metricCards = [
    {
      title: "Vagas Abertas",
      value: metrics.vagasAbertas,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
      icon: "💼",
    },
    {
      title: "Total de Candidatos",
      value: metrics.totalCandidatos,
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-600",
      icon: "👥",
    },
    {
      title: "Contratações",
      value: metrics.contratados,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600",
      icon: "✅",
    },
    {
      title: "Tempo Médio (dias)",
      value: Math.round(Number(metrics.tempoMedioFechamento)),
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-600",
      icon: "⏱️",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtro por Loja */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <label className="text-sm font-medium text-gray-700">Filtrar por Loja:</label>
        <Select value={lojaFilter} onValueChange={(val) => setLojaFilter(val)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todas as lojas" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">Todas as lojas</SelectItem>
            {lojas?.map((loja: any) => (
              <SelectItem key={loja.id} value={loja.id.toString()}>
                {loja.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, idx) => (
          <Card key={idx} className={`p-6 border-2 ${metric.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className={`text-3xl font-bold mt-2 ${metric.textColor}`}>{metric.value}</p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Section */}
      <Card className="p-6 border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-primary mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Vagas Fechadas</p>
            <p className="text-2xl font-bold text-green-600">{metrics.vagasFechadas}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taxa de Aproveitamento</p>
            <p className="text-2xl font-bold text-secondary">{Number(metrics.taxaAproveitamento).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Candidatos por Vaga</p>
            <p className="text-2xl font-bold text-primary">
              {metrics.vagasAbertas > 0 ? (metrics.totalCandidatos / metrics.vagasAbertas).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
