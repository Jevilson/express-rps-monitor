const axios = require('axios');

// Configurações
const BASE_URL = 'http://localhost:3000'; // URL do seu servidor
const  TOTAL_REQUESTS_PER_SECONDS = 150;    // Total de requisições por segundo
const ROUTES = ["/home","/login","/produtos","/contato","/contas","/pagamentos","/receitas","/redes","/sobre","/ajuda","/perfil","/configuracoes","/notificacoes","/mensagens","/carrinho","/favoritos","/historico","/termos","/home","/login","/produtos","/contato","/contas","/pagamentos","/receitas","/redes","/sobre","/ajuda","/perfil","/configuracoes","/notificacoes","/mensagens","/carrinho","/favoritos?teste=teste","/historico","/termos",];

// Cálculo do intervalo entre as requisições
const INTERVAL_MS = (1_000 /  TOTAL_REQUESTS_PER_SECONDS);

// Função para fazer uma requisição aleatória
function hitRandomRoute() {
    const randomRoute = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    axios.get(BASE_URL + randomRoute)
        .then(() => {
            console.log(`✅ Hit: ${randomRoute}`);
        })
        .catch((err) => {
            console.error(`❌ Erro ao acessar ${randomRoute}:`, err.message);
        });
}

// Iniciar loop
setInterval(hitRandomRoute, INTERVAL_MS);

console.log(`Simulador iniciado com ${ TOTAL_REQUESTS_PER_SECONDS} req/min (${(INTERVAL_MS).toFixed(0)} ms entre cada).`);
