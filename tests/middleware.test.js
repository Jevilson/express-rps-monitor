const express = require('express');
const request = require('supertest');
const fs = require('fs');
const { monitorMiddleware, renderRelatorioHTML } = require('../src/index');

// Mock do fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

// Mock do setInterval e clearInterval
let intervalId;
jest.spyOn(global, 'setInterval').mockImplementation((cb, time) => {
  intervalId = setInterval(cb, time);
  return intervalId;
});

jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
  clearInterval(id);
});

describe('RPS Monitor Middleware', () => {
  let app;

  beforeEach(() => {
    // Limpa os mocks
    jest.clearAllMocks();
    fs.readFileSync.mockReturnValue(JSON.stringify({ days: {}, rpsLog: [] }));
    
    // Cria nova instância do app
    app = express();
    app.use(monitorMiddleware);
    
    // Rota de teste
    app.get('/test', (req, res) => res.status(200).json({ message: 'OK' }));
    app.get('/relatorio', renderRelatorioHTML);
  });

  afterEach(() => {
    // Limpa o intervalo após cada teste
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  afterAll(() => {
    // Limpa todos os mocks
    jest.restoreAllMocks();
  });

  it('deve registrar uma requisição', async () => {
    await request(app).get('/test');
    
    const savedData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    const today = new Date().toISOString().split('T')[0];
    
    expect(savedData.days[today].routes['/test']).toBe(1);
  });

  it('deve retornar status 200 para a rota de teste', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OK' });
  });

  it('deve retornar status 200 para o relatório', async () => {
    const response = await request(app).get('/relatorio');
    expect(response.status).toBe(200);
  });
}); 