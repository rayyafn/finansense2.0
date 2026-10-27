import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, getDbStatus } from './db.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de Segurança e CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Rota de Health Check da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'FinanSense 2.0 API',
    database_connected: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Registro de Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Em produção, serve os arquivos estáticos do build do Vite (dist/)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback SPA para navegação do frontend (compatível com Express 5 e path-to-regexp v8)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>💰 FinanSense 2.0 API Backend Ativo!</h2>
            <p>A API REST está rodando na porta <b>${PORT}</b>.</p>
            <p>Para abrir a interface frontend em desenvolvimento, execute <code>npm run dev</code>.</p>
          </body>
        </html>
      `);
    }
  });
});

// Inicialização do Servidor e Teste de Conexão com o Banco
const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [FinanSense 2.0] Servidor Backend rodando na porta ${PORT}`);
    console.log(`📍 URL da API: http://localhost:${PORT}/api`);
    console.log(`🔍 Status do MySQL: ${getDbStatus() ? 'Conectado (finansense_db)' : 'Aguardando configuração / Modo Nuvem'}`);
    console.log(`======================================================\n`);
  });
};

startServer();
