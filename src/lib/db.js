import postgres from 'postgres';

// PASO 1: Detectar si estamos en Producción (SPanel o Vercel)
const isProduction = import.meta.env.PROD; 

// PASO 2: Obtener la URL de conexión (si existe)
// En SPanel configuramos process.env.DATABASE_URL
// En Vercel se usa process.env.DATABASE_URL o import.meta.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;

// PASO 3: Configurar SSL inteligentemente
// - Vercel (Neon/Supabase) NECESITA 'require'.
// - SPanel (Localhost) NECESITA false.
// - Tu PC (Localhost) NECESITA false.

// ¿Cómo diferenciamos Vercel de SPanel?
// Generalmente, las URLs de Vercel/Neon empiezan con 'postgres://' y apuntan a un servidor remoto (aws, neon.tech, etc).
// La de SPanel apunta a 127.0.0.1.
let sslConfig = false;

if (connectionString && connectionString.includes('127.0.0.1')) {
  // Estamos en SPanel (Local) -> SSL APAGADO
  sslConfig = false;
} else if (connectionString && !connectionString.includes('localhost')) {
  // Estamos en Vercel/Nube (URL remota) -> SSL ENCENDIDO
  sslConfig = 'require';
}

// PASO 4: Crear la configuración final
let sql;

if (connectionString) {
  // MODO SERVIDOR (SPanel o Vercel)
  sql = postgres(connectionString, {
    ssl: sslConfig,
    idle_timeout: 20,
  });
} else {
  // MODO DESARROLLO (Tu PC sin variable DATABASE_URL definida)
  sql = postgres({
    host: import.meta.env.DB_HOST,
    database: import.meta.env.DB_NAME,
    username: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    port: 5432,
    ssl: false,
    idle_timeout: 20,
  });
}

export default sql;