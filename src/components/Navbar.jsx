import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  LogOut, 
  User, 
  PlusCircle,
  Menu,
  X,
  Database,
  Cloud
} from 'lucide-react';

export const Navbar = ({ onOpenTransactionModal, activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { currentUser, logout, saldoDisponivel, riscoDeficit, dbConnected, apiOnline } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo e Nome do Projeto */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  FinanSense
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">3º B Info</span>
                </span>
                <p className="text-[10px] text-slate-600 leading-none">Controle Financeiro Inteligente</p>
              </div>
            </div>
          </div>

          {/* Saldo Rápido, Status do Banco & Ação de Novo Lançamento */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Status do Banco / Servidor */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50">
              {dbConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Database size={13} className="text-emerald-700" />
                  <span className="text-emerald-800 text-[11px] font-semibold">MySQL 8.0</span>
                </>
              ) : apiOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span className="text-sky-800 text-[11px] font-semibold">API REST Ativa</span>
                </>
              ) : (
                <>
                  <Cloud size={13} className="text-indigo-600" />
                  <span className="text-slate-600 text-[11px]">Nuvem / Demo</span>
                </>
              )}
            </div>

            {/* Pill de Saldo Disponível */}
            <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold border ${
              saldoDisponivel >= 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <span className="text-xs font-normal text-slate-600">Saldo:</span>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoDisponivel)}
              </span>
            </div>

            {/* Botão Novo Lançamento */}
            <button
              onClick={onOpenTransactionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-600/30 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Usuário e Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden xl:block text-right">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">{currentUser.nome}</p>
                  <p className="text-[10px] text-slate-600">{currentUser.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sair da conta"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
