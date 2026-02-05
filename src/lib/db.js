import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

const isLocal = connectionString?.includes('127.0.0.1') || connectionString?.includes('localhost');

// En SPanel con PostgreSQL local (127.0.0.1) => ssl false
const sql = postgres(connectionString, {
  ssl: isLocal ? false : 'require',
  idle_timeout: 20,
  max: 10,
});

export default sql;
