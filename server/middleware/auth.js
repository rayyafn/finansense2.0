import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finansense_jwt_secret_dev_key_exemplo_2026_substituir_em_producao';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Permite fallback de header x-user-id para testes locais e desenvolvimento se necessário
    const devUserId = req.headers['x-user-id'];
    if (devUserId) {
      req.user = { id_usuario: parseInt(devUserId, 10), email: 'dev@finansense.com' };
      return next();
    }
    return res.status(401).json({ error: 'Acesso não autorizado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
