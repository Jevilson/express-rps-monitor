const express = require('express');
const { monitorMiddleware, renderRelatorioHTML } = require('../src/index');

const app = express();
const port = 3000;

// Adiciona o middleware de monitoramento
app.use(monitorMiddleware);

// Rota para visualizar o relatório
app.get('/relatorio', renderRelatorioHTML);

// Rotas de exemplo
app.get('/home', (req, res) => res.send('Home'));
app.get('/login', (req, res) => res.send('Login'));
app.get('/produtos', (req, res) => res.send('Produtos'));
app.get('/contato', (req, res) => res.send('Contato'));
app.get('/contas', (req, res) => res.send('contas'));
app.get('/pagamentos', (req, res) => res.send('pagamentos'));
app.get('/receitas', (req, res) => res.send('receitas'));
app.get('/redes', (req, res) => res.send('redes'));
app.get('/sobre', (req, res) => res.send('Sobre'));
app.get('/ajuda', (req, res) => res.send('Ajuda'));
app.get('/perfil', (req, res) => res.send('Perfil'));
app.get('/configuracoes', (req, res) => res.send('Configurações'));
app.get('/notificacoes', (req, res) => res.send('Notificações'));
app.get('/mensagens', (req, res) => res.send('Mensagens'));
app.get('/carrinho', (req, res) => res.send('Carrinho'));
app.get('/favoritos', (req, res) => res.send('Favoritos'));
app.get('/historico', (req, res) => res.send('Histórico'));
app.get('/termos', (req, res) => res.send('Termos e Condições'));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('O middleware está monitorando todas as requisições!');
  console.log('Acesse http://localhost:3000/relatorio para ver as métricas');
}); 