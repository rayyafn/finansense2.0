// FinanSense 2.0 - Serviço de Integração com API REST e Banco de Dados MySQL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('finansense_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('finansense_token', token);
  else localStorage.removeItem('finansense_token');
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Verifica conectividade com a API e status da conexão com o banco MySQL
export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false, dbConnected: false };
    const data = await res.json();
    return { online: true, dbConnected: Boolean(data.database_connected) };
  } catch (err) {
    return { online: false, dbConnected: false };
  }
};

// Autenticação
export const apiLogin = async (email, senha) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha ao autenticar.');
  if (data.token) setAuthToken(data.token);
  return data;
};

export const apiRegister = async (nome, email, senha, turma) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, turma }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha no cadastro.');
  if (data.token) setAuthToken(data.token);
  return data;
};

export const apiForgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// Categorias
export const apiGetCategorias = async () => {
  const res = await fetch(`${API_BASE}/categorias`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erro ao buscar categorias.');
  return res.json();
};

export const apiCreateCategoria = async (cat) => {
  const res = await fetch(`${API_BASE}/categorias`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(cat),
  });
  if (!res.ok) throw new Error('Erro ao criar categoria.');
  return res.json();
};

export const apiDeleteCategoria = async (id) => {
  const res = await fetch(`${API_BASE}/categorias/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao excluir categoria.');
  return res.json();
};

// Receitas
export const apiGetReceitas = async () => {
  const res = await fetch(`${API_BASE}/receitas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erro ao buscar receitas.');
  return res.json();
};

export const apiCreateReceita = async (rec) => {
  const res = await fetch(`${API_BASE}/receitas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(rec),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar receita.');
  return res.json();
};

export const apiDeleteReceita = async (id) => {
  const res = await fetch(`${API_BASE}/receitas/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao excluir receita.');
  return res.json();
};

// Despesas e Parcelamentos
export const apiGetDespesas = async () => {
  const res = await fetch(`${API_BASE}/despesas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erro ao buscar despesas.');
  return res.json();
};

export const apiCreateDespesa = async (desp) => {
  const res = await fetch(`${API_BASE}/despesas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(desp),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar despesa.');
  return res.json();
};

export const apiUpdateDespesaStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/despesas/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar status da conta.');
  return res.json();
};

export const apiDeleteDespesa = async (id) => {
  const res = await fetch(`${API_BASE}/despesas/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao excluir despesa.');
  return res.json();
};
