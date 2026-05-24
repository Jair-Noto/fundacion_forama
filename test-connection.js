// test-connection.js
// Script para diagnosticar problemas de conexión a PostgreSQL

import 'dotenv/config';
import postgres from 'postgres';

console.log('🔍 DIAGNÓSTICO DE CONEXIÓN POSTGRESQL\n');

// 1. Verificar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env');
  console.log('\n📝 Crea un archivo .env con:');
  console.log('DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');
console.log('📍 URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')); // Oculta password

// 2. Parsear la URL
const url = new URL(process.env.DATABASE_URL);
console.log('\n📊 DETALLES DE CONEXIÓN:');
console.log('  - Host:', url.hostname);
console.log('  - Puerto:', url.port || '5432');
console.log('  - Base de datos:', url.pathname.slice(1));
console.log('  - Usuario:', url.username);

// 3. Detectar si es local o remoto
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
console.log('  - Tipo:', isLocal ? 'LOCAL' : 'REMOTO');
console.log('  - SSL:', isLocal ? 'deshabilitado' : 'requerido');

// 4. Intentar conectar
console.log('\n🔌 Intentando conectar...\n');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: isLocal ? false : 'require',
  max: 1,
  connect_timeout: 5,
  idle_timeout: 5,
  onnotice: () => {}, // Silenciar notices
});

// ✅ SOLUCIÓN 1: Función orquestadora limpia (Baja Complejidad Cognitiva)
async function testConnection() {
  try {
    await runDiagnostics();
    printSuccessMessage();
  } catch (error) {
    handleConnectionError(error);
  } finally {
    await sql.end({ timeout: 1 });
    process.exit(0);
  }
}

// ✅ SOLUCIÓN 2: Extracción de los tests a una función delegada
async function runDiagnostics() {
  // Test 1: Conexión básica
  console.log('Test 1: Conexión básica...');
  const result = await sql`SELECT NOW() as time, version() as version`;
  console.log('✅ Conexión exitosa!');
  console.log('  - Hora del servidor:', result[0].time);
  console.log('  - Versión:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);

  // Test 2: Verificar base de datos actual
  console.log('\nTest 2: Base de datos actual...');
  const dbInfo = await sql`SELECT current_database() as db, current_user as user`;
  console.log('✅ Base de datos confirmada');
  console.log('  - Database:', dbInfo[0].db);
  console.log('  - Usuario:', dbInfo[0].user);

  // Test 3: Verificar tablas existentes
  console.log('\nTest 3: Tablas en la base de datos...');
  const tables = await sql`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  
  // Return temprano para evitar anidaciones innecesarias
  if (tables.length === 0) {
    console.log('⚠️  No hay tablas en la base de datos\n   Necesitas crear las tablas primero');
    return; 
  } 

  console.log('✅ Tablas encontradas:', tables.length);
  tables.forEach(t => console.log('   -', t.tablename));

  // Test 4: Verificar permisos
  console.log('\nTest 4: Verificando permisos...');
  await checkTablePermissions(tables, dbInfo[0].user);
}

// ✅ SOLUCIÓN 3: Extracción del bucle y try-catch anidado
async function checkTablePermissions(tables, dbUser) {
  for (const table of tables) {
    try {
      await sql`SELECT COUNT(*) FROM ${sql(table.tablename)}`;
      console.log(`  ✅ ${table.tablename}: permisos OK`);
    } catch (err) {
      console.log(`  ❌ ${table.tablename}: ${err.message}`);
      console.log(`     Ejecuta: GRANT ALL ON ${table.tablename} TO ${dbUser};`);
    }
  }
}

// ✅ SOLUCIÓN 4: Aislamiento de la enorme cadena if-else
function handleConnectionError(error) {
  console.error('\n❌ ERROR DE CONEXIÓN:\n');
  
  if (error.code === 'ECONNREFUSED') {
    console.error('🔴 PostgreSQL no está corriendo\n📝 SOLUCIONES:\n  1. Inicia PostgreSQL:\n     - Windows: Abre "Servicios" y busca PostgreSQL\n     - Mac: brew services start postgresql\n     - Linux: sudo systemctl start postgresql\n\n   2. Verifica que el puerto 5432 esté disponible');
  } else if (error.code === 'ENOTFOUND') {
    console.error('🔴 No se puede encontrar el servidor\n📝 SOLUCIONES:\n  1. Verifica el host en DATABASE_URL\n  2. Si es remoto, verifica tu conexión a internet');
  } else if (error.message?.includes('password authentication failed')) {
    console.error('🔴 Usuario o contraseña incorrectos\n📝 SOLUCIONES:\n  1. Verifica el usuario y password en .env\n  2. Conecta manualmente: psql -U usuario -d base_datos');
  } else if (error.message?.includes('database') && error.message?.includes('does not exist')) {
    console.error('🔴 La base de datos no existe\n📝 SOLUCIONES:\n  1. Crea la base de datos:\n     createdb -U postgres nombre_base_datos\n  2. O en psql:\n     CREATE DATABASE nombre_base_datos;');
  } else if (error.code === 'ECONNRESET') {
    console.error('🔴 La conexión se cerró inesperadamente\n📝 SOLUCIONES:\n  1. Verifica que PostgreSQL acepte conexiones\n  2. Revisa pg_hba.conf para permitir el usuario\n  3. Si es local, intenta con 127.0.0.1 en lugar de localhost');
  } else {
    console.error('🔴 Error desconocido:', error.message);
    console.error('\n📝 Detalles del error:\n', error);
  }
  
  console.error('\n💡 TIPS ADICIONALES:\n  - Verifica que PostgreSQL esté instalado: psql --version\n  - Verifica que el servicio esté corriendo\n  - Revisa los logs de PostgreSQL para más detalles');
}

function printSuccessMessage() {
  console.log('\n🎉 DIAGNÓSTICO COMPLETADO\n');
  console.log('✅ Todo está funcionando correctamente');
  console.log('✅ La conexión a PostgreSQL está OK');
}

// Ejecutar test con timeout
const timeout = setTimeout(() => {
  console.error('\n⏱️  TIMEOUT: La conexión tardó más de 10 segundos');
  console.error('Esto probablemente significa que PostgreSQL no está respondiendo\n');
  process.exit(1);
}, 10000);

// ✅ NUEVA SOLUCIÓN: Top-level await en lugar de .finally() de la promesa
try {
  await testConnection();
} finally {
  clearTimeout(timeout);
}