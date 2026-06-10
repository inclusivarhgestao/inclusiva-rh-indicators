import { ReactNode, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, LogOut } from "lucide-react";

interface InclusivaDashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const years = [2024, 2025, 2026, 2027];

export default function InclusivaDashboardLayout({
  children,
  currentPage,
  onPageChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: InclusivaDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "vagas", label: "Vagas", icon: "💼" },
    { id: "candidatos", label: "Candidatos", icon: "👥" },
    { id: "indicadores", label: "Indicadores", icon: "📈" },
    { id: "relatorio", label: "Relatório", icon: "📋" },
    { id: "lojas", label: "Lojas", icon: "🏢" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-primary to-primary/90 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-bold text-primary">
              IR
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Inclusiva RH</h1>
                <p className="text-xs text-white/70">R&S</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                currentPage === item.id
                  ? "bg-secondary text-primary font-semibold"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between gap-2">
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
                <p className="text-xs text-white/70 truncate">{user?.email}</p>
              </div>
            )}
            <Button
              onClick={() => logout()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>
              <h2 className="text-2xl font-bold text-primary">
                {navItems.find((item) => item.id === currentPage)?.label || "Dashboard"}
              </h2>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-3">
              <Select value={selectedMonth.toString()} onValueChange={(val) => onMonthChange(parseInt(val))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear.toString()} onValueChange={(val) => onYearChange(parseInt(val))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
