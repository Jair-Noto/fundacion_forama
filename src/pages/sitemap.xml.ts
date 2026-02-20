
// ✅ Sitemap dinámico que incluye páginas estáticas + slugs de la base de datos
import type { APIRoute } from 'astro';
import sql from '../lib/db.js';

// 🔧 CAMBIA ESTO por tu dominio real en producción
const SITE_URL = 'https://www.forama.org';

// Páginas estáticas con su prioridad y frecuencia de cambio
const STATIC_PAGES = [
  { url: '/',              changefreq: 'weekly',  priority: '1.0' },
  { url: '/quienes-somos', changefreq: 'monthly', priority: '0.8' },
  { url: '/que-hacemos',   changefreq: 'monthly', priority: '0.8' },
  { url: '/programas',     changefreq: 'monthly', priority: '0.8' },
  { url: '/equipo',        changefreq: 'monthly', priority: '0.7' },
  { url: '/noticias',      changefreq: 'daily',   priority: '0.9' },
  { url: '/publicaciones', changefreq: 'weekly',  priority: '0.7' },
  { url: '/revista',       changefreq: 'monthly', priority: '0.7' },
  { url: '/contacto',      changefreq: 'yearly',  priority: '0.5' },
  { url: '/como-apoyar',   changefreq: 'monthly', priority: '0.8' },
];

export const GET: APIRoute = async () => {
  // Traer slugs dinámicos de la base de datos
  let noticiaSlugs: { slug: string; fecha_publicacion: string }[] = [];
  let programaSlugs: { slug: string }[] = [];

  try {
    noticiaSlugs = await sql`
      SELECT slug, fecha_publicacion 
      FROM publicaciones 
      WHERE tipo = 'noticia'
      ORDER BY fecha_publicacion DESC
    `;

    programaSlugs = await sql`
      SELECT slug FROM programas
    `;
  } catch (error) {
    console.error('Error fetching slugs for sitemap:', error);
  }

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${noticiaSlugs.map(n => `  <url>
    <loc>${SITE_URL}/noticias/${n.slug}</loc>
    <lastmod>${new Date(n.fecha_publicacion).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
${programaSlugs.map(p => `  <url>
    <loc>${SITE_URL}/programas/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};