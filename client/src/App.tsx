import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import InclusivaDashboardLayout from "@/components/InclusivaDashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Vagas from "@/pages/Vagas";
import Candidatos from "@/pages/Candidatos";
import Indicadores from "@/pages/Indicadores";
import Relatorio from "@/pages/Relatorio";
import Lojas from "@/pages/Lojas";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(to bottom right, #1565C0, #F9A825)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(to bottom right, #1565C0, #F9A825)' }}>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl font-bold" style={{ background: 'linear-gradient(to right, #1565C0, #F9A825)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              IR
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Inclusiva RH</h1>
          <p className="text-white/80 mb-8">Sistema de Gestao de Recrutamento e Selecao</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-white hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
            style={{ color: '#1565C0' }}
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard mes={selectedMonth} ano={selectedYear} />;
      case "vagas":
        return <Vagas mes={selectedMonth} ano={selectedYear} />;
      case "candidatos":
        return <Candidatos mes={selectedMonth} ano={selectedYear} />;
      case "indicadores":
        return <Indicadores mes={selectedMonth} ano={selectedYear} />;
      case "relatorio":
        return <Relatorio mes={selectedMonth} ano={selectedYear} />;
      case "lojas":
        return <Lojas />;
      default:
        return <Dashboard mes={selectedMonth} ano={selectedYear} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <InclusivaDashboardLayout
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        >
          {renderPage()}
        </InclusivaDashboardLayout>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
