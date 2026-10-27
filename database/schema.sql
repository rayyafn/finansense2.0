-- ========================================================
-- PROJETO FINANSENSE 2.0 - CONTROLE FINANCEIRO PESSOAL INTELIGENTE
-- Script DDL & DML para Banco de Dados Relacional MySQL 8.0+ / MariaDB
-- Autor: Raiany Alexandra Felix do Nascimento
-- ========================================================

CREATE DATABASE IF NOT EXISTS `finansense_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `finansense_db`;

-- Desativa temporariamente verificação de chaves estrangeiras para limpeza e recriação segura
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `parcelamentos`;
DROP TABLE IF EXISTS `despesas`;
DROP TABLE IF EXISTS `receitas`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 1. TABELA: usuarios
-- Gerencia o perfil, credenciais e isolamento de dados (multi-tenant)
-- ========================================================
CREATE TABLE `usuarios` (
  `id_usuario` BIGINT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL,
  `perfil` ENUM('estudante', 'trabalhador', 'freelancer', 'administrador') NOT NULL DEFAULT 'estudante',
  `turma` VARCHAR(100) DEFAULT '3º B - Técnico em Informática',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  INDEX `idx_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- 2. TABELA: categorias
-- Classificação de receitas e despesas (padrão ou personalizadas pelo usuário)
-- ========================================================
CREATE TABLE `categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` BIGINT DEFAULT NULL,
  `nome` VARCHAR(50) NOT NULL,
  `tipo` ENUM('receita', 'despesa') NOT NULL,
  `eh_padrao` BOOLEAN NOT NULL DEFAULT FALSE,
  `cor` VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
  `icone` VARCHAR(50) NOT NULL DEFAULT 'Tag',
  PRIMARY KEY (`id_categoria`),
  INDEX `idx_categorias_usuario` (`id_usuario`),
  CONSTRAINT `fk_categorias_usuario` 
    FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuarios` (`id_usuario`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- 3. TABELA: receitas
-- Lançamentos de entradas financeiras (bolsa, salário, freelance)
-- ========================================================
CREATE TABLE `receitas` (
  `id_receita` BIGINT NOT NULL AUTO_INCREMENT,
  `id_usuario` BIGINT NOT NULL,
  `id_categoria` INT NOT NULL,
  `descricao` VARCHAR(100) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `data_recebimento` DATE NOT NULL,
  `eh_recorrente` BOOLEAN NOT NULL DEFAULT FALSE,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_receita`),
  INDEX `idx_receitas_usuario` (`id_usuario`),
  INDEX `idx_receitas_categoria` (`id_categoria`),
  INDEX `idx_receitas_data` (`data_recebimento`),
  CONSTRAINT `fk_receitas_usuario` 
    FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuarios` (`id_usuario`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_receitas_categoria` 
    FOREIGN KEY (`id_categoria`) 
    REFERENCES `categorias` (`id_categoria`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT `chk_receita_valor_positivo` CHECK (`valor` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- 4. TABELA: despesas
-- Lançamentos de despesas e contas a pagar (fixas, variáveis e parceladas)
-- ========================================================
CREATE TABLE `despesas` (
  `id_despesa` BIGINT NOT NULL AUTO_INCREMENT,
  `id_usuario` BIGINT NOT NULL,
  `id_categoria` INT NOT NULL,
  `descricao` VARCHAR(100) NOT NULL,
  `valor_total` DECIMAL(10,2) NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `status` ENUM('a_pagar', 'paga', 'vencida') NOT NULL DEFAULT 'a_pagar',
  `tipo` ENUM('fixa', 'variavel', 'parcelada') NOT NULL DEFAULT 'variavel',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_despesa`),
  INDEX `idx_despesas_usuario` (`id_usuario`),
  INDEX `idx_despesas_categoria` (`id_categoria`),
  INDEX `idx_despesas_vencimento` (`data_vencimento`),
  INDEX `idx_despesas_status` (`status`),
  CONSTRAINT `fk_despesas_usuario` 
    FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuarios` (`id_usuario`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_despesas_categoria` 
    FOREIGN KEY (`id_categoria`) 
    REFERENCES `categorias` (`id_categoria`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT `chk_despesa_valor_positivo` CHECK (`valor_total` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- 5. TABELA: parcelamentos
-- Cronograma individual de compras parceladas vinculadas a uma despesa pai
-- ========================================================
CREATE TABLE `parcelamentos` (
  `id_parcelamento` BIGINT NOT NULL AUTO_INCREMENT,
  `id_despesa` BIGINT NOT NULL,
  `numero_parcela` INT NOT NULL,
  `total_parcelas` INT NOT NULL,
  `valor_parcela` DECIMAL(10,2) NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `status_parcela` ENUM('a_pagar', 'paga') NOT NULL DEFAULT 'a_pagar',
  PRIMARY KEY (`id_parcelamento`),
  INDEX `idx_parcelamentos_despesa` (`id_despesa`),
  INDEX `idx_parcelamentos_vencimento` (`data_vencimento`),
  CONSTRAINT `fk_parcelamentos_despesa` 
    FOREIGN KEY (`id_despesa`) 
    REFERENCES `despesas` (`id_despesa`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DADOS INICIAIS (SEEDS) PARA O SISTEMA FUNCIONAR IMEDIATAMENTE
-- ========================================================

-- Usuários de Teste:
-- Usuário 1: 'raiany@finansense.com' (senha: 123456)
-- Usuário 2: 'professor@finansense.com' (senha: teste123)
-- Ambas as senhas foram geradas com salt rounds 10 (bcrypt) conforme os requisitos de segurança.
INSERT INTO `usuarios` (`id_usuario`, `nome`, `email`, `senha_hash`, `perfil`, `turma`) VALUES
(1, 'Raiany Alexandra Felix do Nascimento', 'raiany@finansense.com', '$2b$10$WA3Om4purVeO6aa0R7IL4.vNlM2wKOlbDBJYKXrJNfnQNVGYUx6E.', 'estudante', '3º B - Técnico em Informática'),
(2, 'Professor Avaliador', 'professor@finansense.com', '$2b$10$acSa68qrT/bJyE1DqlRv5eblTkW3XwHpM4WdCAhGZM.oQn/aSo.vG', 'administrador', 'Docente Avaliador');

-- Categorias Padrão da Plataforma (RF10 / DER da Spec):
INSERT INTO `categorias` (`id_categoria`, `id_usuario`, `nome`, `tipo`, `eh_padrao`, `cor`, `icone`) VALUES
(1, NULL, 'Estágio / Salário', 'receita', TRUE, '#10b981', 'Briefcase'),
(2, NULL, 'Bolsa de Estudos', 'receita', TRUE, '#06b6d4', 'GraduationCap'),
(3, NULL, 'Freelance / Bicos', 'receita', TRUE, '#8b5cf6', 'Laptop'),
(4, NULL, 'Auxílio Familiar / Outros', 'receita', TRUE, '#ec4899', 'HeartHandshake'),
(5, NULL, 'Alimentação', 'despesa', TRUE, '#f97316', 'Utensils'),
(6, NULL, 'Transporte', 'despesa', TRUE, '#3b82f6', 'Bus'),
(7, NULL, 'Lazer & Entretenimento', 'despesa', TRUE, '#a855f7', 'Gamepad2'),
(8, NULL, 'Contas Fixas & Moradia', 'despesa', TRUE, '#ef4444', 'Home'),
(9, NULL, 'Educação & Material', 'despesa', TRUE, '#14b8a6', 'BookOpen'),
(10, NULL, 'Assinaturas & Celular', 'despesa', TRUE, '#6366f1', 'Smartphone');

-- Receitas Iniciais para Alimentar os Indicadores (RF05, RF11):
INSERT INTO `receitas` (`id_receita`, `id_usuario`, `id_categoria`, `descricao`, `valor`, `data_recebimento`, `eh_recorrente`) VALUES
(1, 1, 1, 'Bolsa Estágio em TI', 1100.00, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), TRUE),
(2, 1, 3, 'Freelance Manutenção Web', 400.00, CURRENT_DATE(), FALSE),
-- Histórico dos últimos 3 meses para alimentar cálculos de projeção e médias
(101, 1, 1, 'Bolsa Estágio (Mês Anterior)', 1100.00, DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), TRUE),
(102, 1, 1, 'Bolsa Estágio (Há 2 Meses)', 1100.00, DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), TRUE),
(103, 1, 1, 'Bolsa Estágio (Há 3 Meses)', 1100.00, DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), TRUE);

-- Despesas Iniciais Demonstrando Todos os Critérios de Aceite (CA02, CA03, CA04, CA05):
INSERT INTO `despesas` (`id_despesa`, `id_usuario`, `id_categoria`, `descricao`, `valor_total`, `data_vencimento`, `status`, `tipo`) VALUES
-- 1. Despesa paga no mês
(1, 1, 8, 'Contribuição Conta de Luz da Casa', 180.00, DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'paga', 'fixa'),
-- 2. Despesa VENCIDA para validação do CA03 (vencimento anterior a hoje e não paga)
(2, 1, 10, 'Plano Celular & Internet 4G', 69.90, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'a_pagar', 'fixa'),
-- 3. Despesa a vencer nos próximos 15 dias (RF12)
(3, 1, 5, 'Supermercado e Lanche Mensal', 350.00, DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY), 'a_pagar', 'variavel'),
-- 4. Despesa do mês em Lazer que ultrapassa em 30% a média histórica de R$ 200 (CA04: R$ 260 gastos)
(4, 1, 7, 'Cinema, Lanche e Jogos com amigos', 260.00, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'paga', 'variavel'),
-- 5. Transporte agendado para os próximos 10 dias
(5, 1, 6, 'Recarga Cartão Passe de Ônibus', 120.00, DATE_ADD(CURRENT_DATE(), INTERVAL 10 DAY), 'a_pagar', 'fixa'),
-- 6. Compra Parcelada em 6x de R$ 100 (CA02)
(6, 1, 9, 'Headset e Teclado para Estudos (6x)', 600.00, DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), 'a_pagar', 'parcelada'),
-- Histórico dos últimos 3 meses na categoria Lazer (Médias: 200, 190, 210 -> Média = 200,00)
(201, 1, 7, 'Passeio final de semana (Mês -1)', 200.00, DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), 'paga', 'variavel'),
(202, 1, 5, 'Mercado (Mês -1)', 310.00, DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), 'paga', 'variavel'),
(203, 1, 7, 'Cinema e lanches (Mês -2)', 190.00, DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), 'paga', 'variavel'),
(204, 1, 5, 'Feira e lanches (Mês -2)', 320.00, DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), 'paga', 'variavel'),
(205, 1, 7, 'Ingresso show local (Mês -3)', 210.00, DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), 'paga', 'variavel'),
(206, 1, 5, 'Alimentação básica (Mês -3)', 300.00, DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), 'paga', 'variavel');

-- Parcelas Geradas Automaticamente para a Despesa 6 (CA02):
INSERT INTO `parcelamentos` (`id_parcelamento`, `id_despesa`, `numero_parcela`, `total_parcelas`, `valor_parcela`, `data_vencimento`, `status_parcela`) VALUES
(1, 6, 1, 6, 100.00, DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), 'a_pagar'),
(2, 6, 2, 6, 100.00, DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), INTERVAL 1 MONTH), 'a_pagar'),
(3, 6, 3, 6, 100.00, DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), INTERVAL 2 MONTH), 'a_pagar'),
(4, 6, 4, 6, 100.00, DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), INTERVAL 3 MONTH), 'a_pagar'),
(5, 6, 5, 6, 100.00, DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), INTERVAL 4 MONTH), 'a_pagar'),
(6, 6, 6, 6, 100.00, DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), INTERVAL 5 MONTH), 'a_pagar');
