export interface DadosLoja {
  lojaId: number;
  lojaNome: string;
  vagasAbertas: number;
  vagasFechadas: number;
  totalVagas: number;
  totalCandidatos: number;
  candidatosContratados: number;
}

export interface RelatorioData {
  mes: number;
  ano: number;
  vagasAbertas: number;
  vagasFechadas: number;
  totalCandidatos: number;
  contratacoes: number;
  tempoMedioFechamento: number;
  taxaAproveitamento: number;
  resumo: string;
  dadosPorLoja?: DadosLoja[];
}

export function exportRelatorioPDF(data: RelatorioData) {
  const monthName = new Date(data.ano, data.mes).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório - ${monthName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .page { max-width: 210mm; height: 297mm; margin: 0 auto; padding: 40px; background: white; }
        .header { border-bottom: 3px solid #1565C0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1565C0; font-size: 28px; margin-bottom: 5px; }
        .header p { color: #666; font-size: 12px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #F9A825; font-size: 14px; font-weight: bold; border-bottom: 2px solid #F9A825; padding-bottom: 8px; margin-bottom: 15px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .metric-box { border: 1px solid #e5e5e5; padding: 15px; border-radius: 4px; text-align: center; }
        .metric-label { color: #666; font-size: 11px; margin-bottom: 8px; }
        .metric-value { color: #1565C0; font-size: 24px; font-weight: bold; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th { background: #f5f5f5; color: #1565C0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #1565C0; }
        .table td { padding: 10px; border-bottom: 1px solid #e5e5e5; }
        .resumo { background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 12px; line-height: 1.6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 10px; color: #999; }
        @media print { body { margin: 0; padding: 0; } .page { margin: 0; height: auto; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>Inclusiva RH</h1>
          <p>Relatório de Indicadores de Recrutamento e Seleção</p>
          <p>Período: ${monthName}</p>
        </div>

        <div class="section">
          <div class="section-title">Métricas Principais</div>
          <div class="metrics">
            <div class="metric-box">
              <div class="metric-label">Vagas Abertas</div>
              <div class="metric-value">${data.vagasAbertas}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Vagas Fechadas</div>
              <div class="metric-value">${data.vagasFechadas}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Total de Candidatos</div>
              <div class="metric-value">${data.totalCandidatos}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Contratações</div>
              <div class="metric-value">${data.contratacoes}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Indicadores de Performance</div>
          <table class="table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tempo Médio de Fechamento</td>
                <td>${data.tempoMedioFechamento.toFixed(1)} dias</td>
              </tr>
              <tr>
                <td>Taxa de Aproveitamento</td>
                <td>${data.taxaAproveitamento.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${data.dadosPorLoja && data.dadosPorLoja.length > 0 ? `
        <div class="section">
          <div class="section-title">Dados por Loja</div>
          <table class="table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Vagas Abertas</th>
                <th>Vagas Fechadas</th>
                <th>Total Vagas</th>
                <th>Candidatos</th>
                <th>Contratados</th>
              </tr>
            </thead>
            <tbody>
              ${data.dadosPorLoja.map(loja => `
              <tr>
                <td>${loja.lojaNome}</td>
                <td>${loja.vagasAbertas}</td>
                <td>${loja.vagasFechadas}</td>
                <td>${loja.totalVagas}</td>
                <td>${loja.totalCandidatos}</td>
                <td>${loja.candidatosContratados}</td>
              </tr>
              `).join('')}
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td>TOTAL</td>
                <td>${data.dadosPorLoja.reduce((sum, l) => sum + l.vagasAbertas, 0)}</td>
                <td>${data.dadosPorLoja.reduce((sum, l) => sum + l.vagasFechadas, 0)}</td>
                <td>${data.dadosPorLoja.reduce((sum, l) => sum + l.totalVagas, 0)}</td>
                <td>${data.dadosPorLoja.reduce((sum, l) => sum + l.totalCandidatos, 0)}</td>
                <td>${data.dadosPorLoja.reduce((sum, l) => sum + l.candidatosContratados, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ""}

        ${data.resumo ? `
        <div class="section">
          <div class="section-title">Resumo do Período</div>
          <div class="resumo">${data.resumo.replace(/\n/g, "<br>")}</div>
        </div>
        ` : ""}

        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
          <p>Inclusiva RH - Sistema de Gestão de Indicadores</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const element = document.createElement("iframe");
  element.srcdoc = htmlContent;
  element.style.display = "none";
  document.body.appendChild(element);

  setTimeout(() => {
    element.contentWindow?.print();
    document.body.removeChild(element);
  }, 250);
}
