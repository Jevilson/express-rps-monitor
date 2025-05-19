const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '..', 'stats.json');

// Função para carregar dados do disco
function carregarStats() {
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { days: {}, rpsLog: [] }; // fallback padrão
  }
}

// Função para salvar dados no disco
function salvarStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error('Erro ao salvar stats:', err);
  }
}

// Inicializa com dados persistidos (ou vazios)
const stats = carregarStats();

let currentSecondCount = 0;
let lastRpsCalc = Date.now();

function monitorMiddleware(req, res, next) {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const route = req.path;

  stats.days[dateKey] = stats.days[dateKey] || { total: 0, routes: {} };
  stats.days[dateKey].total++;
  stats.days[dateKey].routes[route] = (stats.days[dateKey].routes[route] || 0) + 1;

  currentSecondCount++;
  salvarStats(); // salva após cada request
  next();
}

setInterval(() => {
  const now = Date.now();
  const elapsed = (now - lastRpsCalc) / 1000;
  const rps = currentSecondCount / elapsed;

  stats.rpsLog.push({
    timestamp: new Date().toISOString(),
    rps: Number(rps.toFixed(2))
  });

  currentSecondCount = 0;
  lastRpsCalc = now;

  salvarStats(); // salva a cada segundo também
}, 1000);

function renderRelatorioHTML(req, res) {
  // Função para formatar o horário no padrão brasileiro
  function formatarHoraBrasilia(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
  }

  // Função para formatar a data de YYYY-MM-DD para DD/MM/YYYY
  function formatarDataCompleta(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Gera HTML com dados embutidos
  const html = `
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Total HTTP request volume</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="data:image/png;base64,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" />
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          },
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
            },
            dark: {
              900: '#0f0f13',
              800: '#16161e',
              700: '#1e1e28',
              600: '#2a2a37',
              500: '#3a3a4a',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      overflow: auto;
    }
    .glass-card {
      background: rgba(22, 22, 30, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .hover-glow:hover {
      box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
    }
    .route-badge {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%);
    }
    .compact-table {
      font-size: 0.875rem;
    }
    .compact-table td, .compact-table th {
      padding: 0.5rem 1rem;
    }
    .compact-date {
      white-space: nowrap;
      font-size: 0.8rem;
      color: #a1a1aa;
    }
    .route-count {
      font-weight: 600;
      color: #0ea5e9;
    }
  </style>
</head>
<body class="bg-dark-900 text-gray-200 p-4">
  <div class="max-w-7xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Express Status
        </h1>
        <p class="text-gray-400 text-sm">Total HTTP request volume</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
        <span id="lastUpdate" class="text-xs text-gray-400"></span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="glass-card rounded-lg p-4 transition-all">
        <p class="text-gray-400 text-sm">Total de dias</p>
        <p class="text-2xl font-bold">${Object.keys(stats.days).length}</p>
      </div>
      <div class="glass-card rounded-lg p-4 transition-all">
        <p class="text-gray-400 text-sm">Requisições hoje</p>
        <p class="text-2xl font-bold">${stats.days[Object.keys(stats.days)[Object.keys(stats.days).length - 1]]?.total || 0}</p>
      </div>
      <div class="glass-card rounded-lg p-4 transition-all">
        <p class="text-gray-400 text-sm">Máximo RPS</p>
        <p class="text-2xl font-bold">${Math.max(...stats.rpsLog.map(e => e.rps))}</p>
      </div>
    </div>

    <!-- RPS Chart -->
    <div class="glass-card rounded-lg p-4 transition-all">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Requisições por Segundo</h2>
        <span class="text-xs text-primary-400">Últimos resultados</span>
      </div>
      <div style="height: 300px">
        <canvas id="rpsChart" height="300"></canvas>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="glass-card rounded-lg overflow-hidden transition-all">
      <div class="p-4 pb-2">
        <h2 class="text-lg font-semibold">Histórico de Requisições</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full compact-table">
          <thead>
            <tr class="border-b border-gray-800 text-gray-400 text-left">
              <th class="pb-2 pl-4">Data</th>
              <th class="pb-2">Total</th>
              <th class="pb-2 pr-4">Rotas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
           ${Object.entries(stats.days)
  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // ordena por data descrescente
  .map(([date, info]) => {
    // Ordena rotas por quantidade (maior para menor)
    const rotasOrdenadas = Object.entries(info.routes)
      .sort((a, b) => b[1] - a[1]);

    return `
      <tr class="hover:bg-dark-700 transition-colors">
        <td class="py-3 pl-4 compact-date">${formatarDataCompleta(date)}</td>
        <td class="py-3 font-mono route-count">${info.total}</td>
        <td class="py-3 pr-4">
          <div class="flex flex-wrap gap-1">
            ${rotasOrdenadas.map(([route, count]) => `
              <span class="route-badge px-2 py-0.5 rounded-full text-xs flex items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1"></span>
                ${route}: <span class="font-bold ml-0.5">${count}</span>
              </span>
            `).join('')}
          </div>
        </td>
      </tr>
    `;
  }).join('')}

          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    // Formata os timestamps para horário de Brasília
    const rpsLabels = ${JSON.stringify(stats.rpsLog.map(e => {
      return formatarHoraBrasilia(e.timestamp) + "s";
    }))};
    
    const rpsData = ${JSON.stringify(stats.rpsLog.map(e => e.rps))};

    const ctx = document.getElementById('rpsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: rpsLabels,
        datasets: [{
          label: 'RPS (req/s)',
          data: rpsData,
          borderColor: 'rgba(14, 165, 233, 1)',
          backgroundColor: 'rgba(14, 165, 233, 0.05)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointBackgroundColor: 'rgba(14, 165, 233, 1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(22, 22, 30, 0.95)',
            titleColor: 'white',
            bodyColor: '#d1d5db',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 8,
            usePointStyle: true,
            bodyFont: { size: 12 },
            titleFont: { size: 12 }
          }
        },
        scales: {
          x: { 
            grid: { display: false, drawBorder: false },
            ticks: { 
              color: '#6b7280',
              maxRotation: 0,
              minRotation: 0
            }
          },
          y: { 
            grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
            ticks: { color: '#6b7280' }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    // Função para formatar o horário no padrão brasileiro
    function formatarHoraBrasilia(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    // Atualiza a página a cada 5s
    setTimeout(() => {
      window.location.reload();
    }, 5000);

    // Mostra quando foi a última atualização
    function updateLastUpdateTime() {
      const now = new Date();
      document.getElementById('lastUpdate').textContent = 
        'Atualizado: ' + now.toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
    
    updateLastUpdateTime();
    setInterval(updateLastUpdateTime, 5000); // Atualiza o horário a 5s
  </script>
</body>
</html>
`;

  res.send(html);
}

module.exports = {
  monitorMiddleware,
  renderRelatorioHTML
}; 