import postgres from 'postgres';

// Lógica inteligente:
// 1. Si estamos en SPanel, usará process.env.DATABASE_URL
// 2. Si estás en tu PC, usará tus variables del .env (DB_HOST, etc)
const connectionConfig = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL 
  : {
      host: import.meta.env.DB_HOST,
      database: import.meta.env.DB_NAME,
      username: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASSWORD,
      port: 5432,
    };

const sql = postgres(connectionConfig, {
  // IMPORTANTE: Ponemos ssl: false para que funcione en SPanel (127.0.0.1)
  // No te preocupes, es seguro porque la conexión no sale a internet.
  ssl: false, 
  idle_timeout: 20, 
});

export default sql;