import postgres from 'postgres';

const sql = postgres({
  host: import.meta.env.DB_HOST,
  database: import.meta.env.DB_NAME,
  username: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
  port: 5432,
  ssl: import.meta.env.PROD ? 'require' : false, // En producción (servidor) usa SSL
  idle_timeout: 20, // Cierra conexiones inactivas para no saturar el servidor
});

export default sql;