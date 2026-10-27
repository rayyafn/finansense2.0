import { Router } from 'express';
import pool, { getDbStatus } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// 1. LISTAR CATEGORIAS (Padrão + do Usuário) (RF10)
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  try {
    if (getDbStatus() && pool) {
      const [rows] = await pool.execute(
        'SELECT * FROM categorias WHERE eh_padrao = TRUE OR id_usuario = ? ORDER BY eh_padrao DESC, nome ASC',
        [userId]
      );
      return res.json(rows);
    } else {
      return res.json([]);
    }
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Erro ao buscar categorias no banco de dados.' });
  }
});

// 2. CRIAR CATEGORIA PERSONALIZADA (RF10 / CA06)
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { nome, tipo, cor, icone } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ error: 'Nome e tipo (receita ou despesa) são obrigatórios.' });
  }

  try {
    if (getDbStatus() && pool) {
      const [result] = await pool.execute(
        'INSERT INTO categorias (id_usuario, nome, tipo, eh_padrao, cor, icone) VALUES (?, ?, ?, FALSE, ?, ?)',
        [userId, nome.trim(), tipo, cor || '#3b82f6', icone || 'Tag']
      );

      const novaCategoria = {
        id_categoria: result.insertId,
        id_usuario: userId,
        nome: nome.trim(),
        tipo,
        eh_padrao: false,
        cor: cor || '#3b82f6',
        icone: icone || 'Tag'
      };

      return res.status(201).json(novaCategoria);
    } else {
      const novaCategoria = {
        id_categoria: Date.now(),
        id_usuario: userId,
        nome: nome.trim(),
        tipo,
        eh_padrao: false,
        cor: cor || '#3b82f6',
        icone: icone || 'Tag'
      };
      return res.status(201).json(novaCategoria);
    }
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar categoria no banco de dados.' });
  }
});

// 3. EXCLUIR CATEGORIA PERSONALIZADA (RF10)
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const idCategoria = parseInt(req.params.id, 10);

  try {
    if (getDbStatus() && pool) {
      // Impede exclusão de categorias nativas/padrão
      const [cat] = await pool.execute('SELECT eh_padrao FROM categorias WHERE id_categoria = ?', [idCategoria]);
      if (cat.length > 0 && cat[0].eh_padrao) {
        return res.status(403).json({ error: 'Não é permitido excluir categorias padrão do sistema.' });
      }

      await pool.execute('DELETE FROM categorias WHERE id_categoria = ? AND id_usuario = ?', [idCategoria, userId]);
      return res.json({ message: 'Categoria excluída com sucesso.' });
    } else {
      return res.json({ message: 'Categoria excluída (Modo Local).' });
    }
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
    return res.status(500).json({ error: 'Erro ao excluir categoria no banco de dados.' });
  }
});

export default router;
