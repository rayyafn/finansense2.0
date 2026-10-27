import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'finansense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('⚠️ [FinanSense DB] Não foi possível inicializar o pool MySQL:', err.message);
}

// Testa a conexão inicial com o banco
export const testConnection = async () => {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`✅ [FinanSense DB] Conectado com sucesso ao MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ [FinanSense DB] Conexão MySQL indisponível (${err.code || err.message}). O sistema utilizará o modo híbrido/resiliente.`);
    return false;
  }
};

export const getDbStatus = () => isConnected;

export default pool;
