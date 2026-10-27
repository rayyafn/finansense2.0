import { Router } from 'express';
import pool, { getDbStatus } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/resumo (RF07, RF11, RF12, RF13, RF14, RF15, RF16, RF17, RF18)
router.get('/resumo', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  try {
    if (getDbStatus() && pool) {
      // 1. Receitas do usuário
      const [receitas] = await pool.execute(
        'SELECT * FROM receitas WHERE id_usuario = ?',
        [userId]
      );

      // 2. Despesas do usuário com categorias
      const [despesas] = await pool.execute(
        `SELECT d.*, c.nome AS categoria_nome, c.cor AS categoria_cor, c.icone AS categoria_icone 
         FROM despesas d
         LEFT JOIN categorias c ON d.id_categoria = c.id_categoria
         WHERE d.id_usuario = ?`,
        [userId]
      );

      // 3. Categorias disponíveis
      const [categorias] = await pool.execute(
        'SELECT * FROM categorias WHERE eh_padrao = TRUE OR id_usuario = ?',
        [userId]
      );

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeStr = hoje.toISOString().split('T')[0];

      const limite15Dias = new Date(hoje);
      limite15Dias.setDate(limite15Dias.getDate() + 15);
      const limite15Str = limite15Dias.toISOString().split('T')[0];

      // Cálculos financeiros principais (RF11, RF12, RF13)
      const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
      const totalDespesasPagas = despesas
        .filter((d) => d.status === 'paga')
        .reduce((sum, d) => sum + parseFloat(d.valor_total), 0);
      const saldoDisponivel = totalReceitas - totalDespesasPagas;

      const totalDespesasPendentes = despesas
        .filter((d) => d.status !== 'paga')
        .reduce((sum, d) => sum + parseFloat(d.valor_total), 0);

      // Contas Vencidas (RF07 / CA03)
      const contasVencidas = despesas.filter((d) => d.status !== 'paga' && d.data_vencimento < hojeStr);
      const totalContasVencidas = contasVencidas.reduce((sum, d) => sum + parseFloat(d.valor_total), 0);

      // Contas nos Próximos 15 dias (RF12)
      const contasProximos15Dias = despesas.filter(
        (d) => d.status !== 'paga' && d.data_vencimento >= hojeStr && d.data_vencimento <= limite15Str
      );
      const totalProximos15Dias = contasProximos15Dias.reduce((sum, d) => sum + parseFloat(d.valor_total), 0);

      // Gastos por Categoria (RF13)
      const gastosPorCategoria = categorias
        .filter((c) => c.tipo === 'despesa')
        .map((cat) => {
          const total = despesas
            .filter((d) => d.id_categoria === cat.id_categoria)
            .reduce((sum, d) => sum + parseFloat(d.valor_total), 0);
          return {
            id_categoria: cat.id_categoria,
            nome: cat.nome,
            cor: cat.cor,
            total
          };
        })
        .filter((c) => c.total > 0);

      return res.json({
        saldoDisponivel,
        totalReceitas,
        totalDespesasPagas,
        totalDespesasPendentes,
        totalContasVencidas,
        contasVencidas,
        totalProximos15Dias,
        contasProximos15Dias,
        gastosPorCategoria,
        isDatabaseMode: true
      });
    } else {
      return res.json({ isDatabaseMode: false });
    }
  } catch (err) {
    console.error('Erro no resumo do dashboard:', err);
    return res.status(500).json({ error: 'Erro ao gerar dados do dashboard.' });
  }
});

export default router;
