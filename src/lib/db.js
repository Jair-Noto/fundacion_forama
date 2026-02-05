import postgres from 'postgres';

// Definimos la conexión
const sql = import.meta.env.DATABASE_URL
  ? // 1. MODO NUBE (Vercel/Neon): Usa la URL larga y SSL obligatorio
    postgres(import.meta.env.DATABASE_URL, {
      ssl: 'require',
      idle_timeout: 20
    })
  : // 2. MODO LOCAL (Tu PC): Usa las variables sueltas como antes
    postgres({
      host: import.meta.env.DB_HOST,
      database: import.meta.env.DB_NAME,
      username: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASSWORD,
      port: 5432,
      ssl: false,
      idle_timeout: 20
    });

export default sql;