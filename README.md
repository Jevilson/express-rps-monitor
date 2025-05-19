# Express RPS Monitor

Middleware para monitorar Requisições Por Segundo (RPS) e rotas em aplicações Express.

## Instalação

```bash
npm install git+https://github.com/Jevilson/express-rps-monitor.git
```

## Uso Básico

```javascript
const express = require('express');
const { rpsMonitor, renderRelatorioHTML } = require('express-rps-monitor');

const app = express();

// Adiciona o middleware de monitoramento
app.use(rpsMonitor());

// Suas rotas aqui...
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/relatorio', renderRelatorioHTML);


app.listen(3000);
```

## Exemplos

Veja exemplos de uso na pasta `examples/`:

- `basic-usage.js`: Exemplo básico de implementação
- `loadTester.js`: Simulador de carga para testar rotas
- Mais exemplos em breve...

## Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

-----------------

Execute os testes:
   ```bash
   npm test
   ```
Para simular o acesso a rotas específicas:
   ```bash
   npm run loadTester
   ```
