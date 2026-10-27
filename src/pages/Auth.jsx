import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, ShieldCheck, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Database, Server } from 'lucide-react';

export const Auth = () => {
  const { login, register, requestPasswordReset, apiOnline, dbConnected } = useFinance();
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'

  // Estados dos formulários
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('raiany@finansense.com');
  const [senha, setSenha] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ tipo: '', mensagem: '' });
    setLoading(true);
    try {
      const res = await login(email, senha);
      if (!res.success) {
        setFeedback({ tipo: 'erro', mensagem: res.message });
      }
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message || 'Erro ao realizar login.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback({ tipo: '', mensagem: '' });
    setLoading(true);
    try {
      const res = await register(nome, email, senha);
      if (!res.success) {
        setFeedback({ tipo: 'erro', mensagem: res.message });
      }
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message || 'Erro ao realizar cadastro.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setFeedback({ tipo: '', mensagem: '' });
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setFeedback({ tipo: 'sucesso', mensagem: res.message });
      } else {
        setFeedback({ tipo: 'erro', mensagem: res.message });
      }
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message || 'Erro ao solicitar recuperação.' });
    } finally {
      setLoading(false);
    }
  };

  const prefillTestUser = (testEmail, testSenha) => {
    setEmail(testEmail);
    setSenha(testSenha);
    setFeedback({ tipo: '', mensagem: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-3">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          FinanSense
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Controle Financeiro Pessoal Inteligente para Jovens
        </p>

        {/* Badge de Status de Conexão com o Banco */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border bg-white shadow-sm">
          {dbConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database size={13} className="text-emerald-700" />
              <span className="text-emerald-800 font-semibold">MySQL 8.0 Conectado</span>
            </>
          ) : apiOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <Server size={13} className="text-sky-700" />
              <span className="text-sky-800 font-semibold">API REST Ativa</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-slate-600">Modo Nuvem / Demonstração Ativo</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200">
          
          {/* Seletor de Modo */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => { setView('login'); setFeedback({ tipo: '', mensagem: '' }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                view === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setView('register'); setFeedback({ tipo: '', mensagem: '' }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                view === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Feedbacks */}
          {feedback.mensagem && (
            <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 border ${
              feedback.tipo === 'erro' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {feedback.tipo === 'erro' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{feedback.mensagem}</span>
            </div>
          )}

          {/* 1. TELA DE LOGIN (RF02 / CA01) */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Senha Segura</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setFeedback({ tipo: '', mensagem: '' }); }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Validando acesso...' : 'Acessar Painel Financeiro'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Botões Rápidos de Usuário de Teste (Para Avaliação) */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-600 font-semibold mb-2 text-center">Contas de Teste Pré-configuradas:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => prefillTestUser('raiany@finansense.com', '123456')}
                    className="p-2 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition"
                  >
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Raiany (Estudante)</p>
                    <p className="text-[10px] text-slate-600 leading-tight">raiany@finansense.com</p>
                    <span className="text-[10px] text-emerald-700 font-mono">123456</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillTestUser('professor@finansense.com', 'teste123')}
                    className="p-2 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition"
                  >
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Docente Avaliador</p>
                    <p className="text-[10px] text-slate-600 leading-tight">professor@finansense.com</p>
                    <span className="text-[10px] text-emerald-700 font-mono">teste123</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. TELA DE AUTOCADASTRO (RF01) */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Criar Senha Criptografada</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Cadastrando no banco...' : 'Criar Minha Conta Gratuita'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 3. RECUPERAÇÃO DE SENHA POR TOKEN (RF03) */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <p className="text-xs text-slate-700 mb-3">
                  Informe seu e-mail cadastrado. Um token temporário de segurança será enviado para redefinição (RF03).
                </p>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <KeyRound size={16} />
                <span>{loading ? 'Gerando token...' : 'Enviar Token de Recuperação'}</span>
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-800 font-semibold pt-2"
              >
                Voltar para o Login
              </button>
            </form>
          )}

          {/* Rodapé de Segurança e Multi-tenant (RNF01 a RNF04) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Isolamento Multi-tenant e criptografia ativa</span>
          </div>

        </div>
      </div>
    </div>
  );
};
