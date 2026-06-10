import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface IndicadoresProps {
  mes: number;
  ano: number;
}

const COLORS = ["#1565C0", "#F9A825", "#4CAF50", "#FF9800", "#9C27B0"];

export default function Indicadores({ mes, ano }: IndicadoresProps) {
  const { data: funilData, isLoading: funilLoading } = trpc.dashboard.funilSelecao.useQuery({
    mes,
    ano,
  });

  const { data: vagasStatusData, isLoading: vagasLoading } = trpc.dashboard.vagasPorStatus.useQuery({
    mes,
    ano,
  });

  if (funilLoading || vagasLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Indicadores e Gráficos</h2>

      {/* Funil de Seleção */}
      <Card className="p-6 border-2 border-primary/20">
        <h3 className="text-lg font-semibold text-primary mb-4">Funil de Seleção</h3>
        {funilData && funilData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funilData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#1565C0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </Card>

      {/* Vagas por Status */}
      <Card className="p-6 border-2 border-secondary/20">
        <h3 className="text-lg font-semibold text-secondary mb-4">Vagas por Status</h3>
        {vagasStatusData && vagasStatusData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vagasStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vagasStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {vagasStatusData.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.fill || COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </Card>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Candidatos em Triagem</h4>
          <p className="text-3xl font-bold text-blue-900">{funilData?.find((d: any) => d.name === "Triagem")?.value || 0}</p>
          <p className="text-xs text-blue-600 mt-2">Aguardando avaliação inicial</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-700 mb-2">Em Entrevista</h4>
          <p className="text-3xl font-bold text-yellow-900">{funilData?.find((d: any) => d.name === "Entrevista")?.value || 0}</p>
          <p className="text-xs text-yellow-600 mt-2">Passaram para próxima etapa</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <h4 className="text-sm font-medium text-green-700 mb-2">Contratados</h4>
          <p className="text-3xl font-bold text-green-900">{funilData?.find((d: any) => d.name === "Contratado")?.value || 0}</p>
          <p className="text-xs text-green-600 mt-2">Finalizados com sucesso</p>
        </Card>
      </div>
    </div>
  );
}
