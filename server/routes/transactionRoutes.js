import { Router } from 'express';
import pool, { getDbStatus } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ========================================================
// MÓDULO DE RECEITAS (RF05, RF09)
// ========================================================

// 1. Listar receitas do usuário autenticado (RF04)
router.get('/receitas', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  try {
    if (getDbStatus() && pool) {
      const [rows] = await pool.execute(
        `SELECT r.*, c.nome AS categoria_nome, c.cor AS categoria_cor, c.icone AS categoria_icone 
         FROM receitas r
         LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
         WHERE r.id_usuario = ? 
         ORDER BY r.data_recebimento DESC`,
        [userId]
      );
      return res.json(rows);
    } else {
      return res.json([]);
    }
  } catch (err) {
    console.error('Erro ao listar receitas:', err);
    return res.status(500).json({ error: 'Erro ao consultar receitas no banco de dados.' });
  }
});

// 2. Criar nova receita (RF05)
router.post('/receitas', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { descricao, valor, data_recebimento, id_categoria, eh_recorrente } = req.body;

  const parsedValor = parseFloat(valor);
  if (!descricao || isNaN(parsedValor) || parsedValor <= 0) {
    return res.status(400).json({ error: 'Descrição e valor positivo são obrigatórios.' });
  }

  const dataReceb = data_recebimento || new Date().toISOString().split('T')[0];

  try {
    if (getDbStatus() && pool) {
      const [result] = await pool.execute(
        `INSERT INTO receitas (id_usuario, id_categoria, descricao, valor, data_recebimento, eh_recorrente)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, parseInt(id_categoria, 10), descricao.trim(), parsedValor, dataReceb, Boolean(eh_recorrente)]
      );

      const novaReceita = {
        id_receita: result.insertId,
        id_usuario: userId,
        id_categoria: parseInt(id_categoria, 10),
        descricao: descricao.trim(),
        valor: parsedValor,
        data_recebimento: dataReceb,
        eh_recorrente: Boolean(eh_recorrente)
      };

      return res.status(201).json(novaReceita);
    } else {
      const novaReceita = {
        id_receita: Date.now(),
        id_usuario: userId,
        id_categoria: parseInt(id_categoria, 10),
        descricao: descricao.trim(),
        valor: parsedValor,
        data_recebimento: dataReceb,
        eh_recorrente: Boolean(eh_recorrente)
      };
      return res.status(201).json(novaReceita);
    }
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    return res.status(500).json({ error: 'Erro ao registrar receita no banco de dados.' });
  }
});

// 3. Excluir receita (RF09)
router.delete('/receitas/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const idReceita = parseInt(req.params.id, 10);

  try {
    if (getDbStatus() && pool) {
      await pool.execute('DELETE FROM receitas WHERE id_receita = ? AND id_usuario = ?', [idReceita, userId]);
      return res.json({ message: 'Receita excluída com sucesso.' });
    } else {
      return res.json({ message: 'Receita excluída.' });
    }
  } catch (err) {
    console.error('Erro ao deletar receita:', err);
    return res.status(500).json({ error: 'Erro ao remover receita.' });
  }
});

// ========================================================
// MÓDULO DE DESPESAS E PARCELAMENTOS (RF06, RF07, RF08, RF09 / CA02, CA03)
// ========================================================

// 4. Listar despesas do usuário
router.get('/despesas', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  try {
    if (getDbStatus() && pool) {
      const [despesas] = await pool.execute(
        `SELECT d.*, c.nome AS categoria_nome, c.cor AS categoria_cor, c.icone AS categoria_icone 
         FROM despesas d
         LEFT JOIN categorias c ON d.id_categoria = c.id_categoria
         WHERE d.id_usuario = ? 
         ORDER BY d.data_vencimento DESC`,
        [userId]
      );

      // Busca dados de parcelamento associados
      const [parcelamentos] = await pool.execute(
        `SELECT p.* 
         FROM parcelamentos p
         JOIN despesas d ON p.id_despesa = d.id_despesa
         WHERE d.id_usuario = ?
         ORDER BY p.numero_parcela ASC`,
        [userId]
      );

      const formatted = despesas.map((d) => {
        const parcelas = parcelamentos.filter((p) => p.id_despesa === d.id_despesa);
        return {
          ...d,
          parcelamentos: parcelas,
          parcelamento_info: parcelas.length > 0 ? {
            total_parcelas: parcelas[0].total_parcelas,
            valor_parcela: parcelas[0].valor_parcela,
            numero_parcela_atual: 1
          } : null
        };
      });

      return res.json(formatted);
    } else {
      return res.json([]);
    }
  } catch (err) {
    console.error('Erro ao listar despesas:', err);
    return res.status(500).json({ error: 'Erro ao consultar despesas no banco de dados.' });
  }
});

// 5. Cadastrar nova despesa (com geração automática de parcelas se for parcelada - RF08 / CA02)
router.post('/despesas', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const {
    descricao,
    valor_total,
    data_vencimento,
    id_categoria,
    tipo = 'variavel',
    total_parcelas = 1,
    status = 'a_pagar'
  } = req.body;

  const parsedValor = parseFloat(valor_total);
  if (!descricao || isNaN(parsedValor) || parsedValor <= 0) {
    return res.status(400).json({ error: 'Descrição e valor válido maior que zero são obrigatórios.' });
  }

  const dataVenc = data_vencimento || new Date().toISOString().split('T')[0];
  const isParcelada = tipo === 'parcelada' && parseInt(total_parcelas, 10) > 1;
  const numParcelas = isParcelada ? parseInt(total_parcelas, 10) : 1;
  const valorParcela = parseFloat((parsedValor / numParcelas).toFixed(2));

  try {
    if (getDbStatus() && pool) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Insere a despesa principal
        const [despesaRes] = await conn.execute(
          `INSERT INTO despesas (id_usuario, id_categoria, descricao, valor_total, data_vencimento, status, tipo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, parseInt(id_categoria, 10), descricao.trim(), parsedValor, dataVenc, status, tipo]
        );

        const idDespesa = despesaRes.insertId;
        const parcelasCriadas = [];

        // Geração automática das N parcelas nos meses subsequentes (RF08 / CA02)
        if (isParcelada) {
          const baseDate = new Date(dataVenc);

          for (let i = 1; i <= numParcelas; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + (i - 1));
            const dueDateStr = dueDate.toISOString().split('T')[0];
            const statusParc = i === 1 && status === 'paga' ? 'paga' : 'a_pagar';

            const [parcRes] = await conn.execute(
              `INSERT INTO parcelamentos (id_despesa, numero_parcela, total_parcelas, valor_parcela, data_vencimento, status_parcela)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [idDespesa, i, numParcelas, valorParcela, dueDateStr, statusParc]
            );

            parcelasCriadas.push({
              id_parcelamento: parcRes.insertId,
              id_despesa: idDespesa,
              numero_parcela: i,
              total_parcelas: numParcelas,
              valor_parcela: valorParcela,
              data_vencimento: dueDateStr,
              status_parcela: statusParc
            });
          }
        }

        await conn.commit();

        return res.status(201).json({
          id_despesa: idDespesa,
          id_usuario: userId,
          id_categoria: parseInt(id_categoria, 10),
          descricao: descricao.trim(),
          valor_total: parsedValor,
          data_vencimento: dataVenc,
          status,
          tipo,
          parcelamentos: parcelasCriadas,
          parcelamento_info: isParcelada ? {
            total_parcelas: numParcelas,
            valor_parcela: valorParcela,
            numero_parcela_atual: 1
          } : null
        });
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    } else {
      // Fallback para simulação local sem banco ativo
      const idDespesa = Date.now();
      return res.status(201).json({
        id_despesa: idDespesa,
        id_usuario: userId,
        id_categoria: parseInt(id_categoria, 10),
        descricao: descricao.trim(),
        valor_total: parsedValor,
        data_vencimento: dataVenc,
        status,
        tipo,
        parcelamento_info: isParcelada ? {
          total_parcelas: numParcelas,
          valor_parcela: valorParcela,
          numero_parcela_atual: 1
        } : null
      });
    }
  } catch (err) {
    console.error('Erro ao criar despesa:', err);
    return res.status(500).json({ error: 'Erro ao registrar despesa no banco de dados.' });
  }
});

// 6. Atualizar status de uma despesa (alternar 'paga' / 'a_pagar')
router.patch('/despesas/:id/status', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const idDespesa = parseInt(req.params.id, 10);
  const { status } = req.body;

  try {
    if (getDbStatus() && pool) {
      await pool.execute(
        'UPDATE despesas SET status = ? WHERE id_despesa = ? AND id_usuario = ?',
        [status, idDespesa, userId]
      );
      return res.json({ message: 'Status atualizado com sucesso.', status });
    } else {
      return res.json({ message: 'Status atualizado.', status });
    }
  } catch (err) {
    console.error('Erro ao atualizar status da despesa:', err);
    return res.status(500).json({ error: 'Erro ao alterar status da conta.' });
  }
});

// 7. Excluir despesa (RF09)
router.delete('/despesas/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const idDespesa = parseInt(req.params.id, 10);

  try {
    if (getDbStatus() && pool) {
      // As parcelas serão removidas em cascata via ON DELETE CASCADE da chave estrangeira
      await pool.execute('DELETE FROM despesas WHERE id_despesa = ? AND id_usuario = ?', [idDespesa, userId]);
      return res.json({ message: 'Despesa excluída com sucesso.' });
    } else {
      return res.json({ message: 'Despesa excluída.' });
    }
  } catch (err) {
    console.error('Erro ao excluir despesa:', err);
    return res.status(500).json({ error: 'Erro ao excluir despesa do banco de dados.' });
  }
});

export default router;
