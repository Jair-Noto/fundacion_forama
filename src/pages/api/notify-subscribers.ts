import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// ⚠️ IMPORTANTE: Este endpoint debe estar protegido con autenticación
// Solo administradores deberían poder enviar notificaciones masivas

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { publicacion_id, admin_token } = body;

    // ✅ Verificar token de admin (implementar tu propia autenticación)
    const ADMIN_TOKEN = import.meta.env.ADMIN_NOTIFICATION_TOKEN || 'tu-token-secreto';
    
    if (admin_token !== ADMIN_TOKEN) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No autorizado' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Obtener datos de la publicación
    const publicacion = await sql`
      SELECT 
        p.id,
        p.slug,
        p.titulo,
        p.resumen,
        p.imagen_portada,
        p.tipo,
        p.fecha_publicacion,
        c.nombre as categoria_nombre
      FROM publicaciones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ${publicacion_id}
      LIMIT 1
    `;

    if (publicacion.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Publicación no encontrada' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pub = publicacion[0];

    // ✅ Obtener suscriptores activos y confirmados
    const suscriptores = await sql`
      SELECT email, nombre 
      FROM suscriptores_boletin 
      WHERE estado = 'activo' 
        AND confirmado = TRUE
      ORDER BY fecha_suscripcion DESC
    `;

    if (suscriptores.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No hay suscriptores activos',
        stats: { total: 0, enviados: 0, fallidos: 0 }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Determinar tipo de publicación para el email
    const tipoPub = pub.tipo === 'noticia' ? 'noticia' : 
                    pub.tipo === 'articulo' ? 'artículo científico' : 
                    pub.tipo === 'libro' ? 'libro' : 'publicación';

    const iconoPub = pub.tipo === 'noticia' ? '📰' : 
                     pub.tipo === 'articulo' ? '🔬' : 
                     pub.tipo === 'libro' ? '📚' : '📄';

    // ✅ URL de la publicación
    const baseUrl = new URL(request.url).origin;
    let publicacionUrl = `${baseUrl}/noticias/${pub.slug}`;
    
    if (pub.tipo === 'articulo') publicacionUrl = `${baseUrl}/revista/${pub.slug}`;
    if (pub.tipo === 'libro') publicacionUrl = `${baseUrl}/publicaciones/${pub.slug}`;

    // ✅ Enviar emails en lotes (para evitar rate limits)
    const BATCH_SIZE = 50; // Resend permite hasta 100/segundo en plan gratuito
    const DELAY_MS = 1000; // 1 segundo entre lotes
    
    let totalEnviados = 0;
    let totalFallidos = 0;
    const errores: string[] = [];

    for (let i = 0; i < suscriptores.length; i += BATCH_SIZE) {
      const lote = suscriptores.slice(i, i + BATCH_SIZE);
      
      const promesas = lote.map(async (suscriptor) => {
        try {
          await resend.emails.send({
            from: 'FORAMA Noticias <noreply@email.forama.org>',
            to: [suscriptor.email],
            replyTo: 'contacto@forama.org',
            subject: `${iconoPub} Nueva ${tipoPub}: ${pub.titulo}`,
            headers: {
              'X-Entity-Ref-ID': `pub-${pub.id}-${Date.now()}`,
              'List-Unsubscribe': `<${baseUrl}/cancelar-boletin?email=${encodeURIComponent(suscriptor.email)}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            text: generarEmailNotificacionTexto(pub, tipoPub, publicacionUrl, suscriptor, baseUrl),
            html: generarEmailNotificacion(pub, tipoPub, iconoPub, publicacionUrl, suscriptor, baseUrl),
          });
          
          totalEnviados++;
          
          // Actualizar última notificación del suscriptor
          await sql`
            UPDATE suscriptores_boletin 
            SET ultima_notificacion = CURRENT_TIMESTAMP 
            WHERE email = ${suscriptor.email}
          `;
          
        } catch (error) {
          console.error(`Error enviando a ${suscriptor.email}:`, error);
          totalFallidos++;
          errores.push(`${suscriptor.email}: ${error}`);
        }
      });

      await Promise.allSettled(promesas);
      
      // Esperar antes del siguiente lote
      if (i + BATCH_SIZE < suscriptores.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    // ✅ Registrar notificación enviada
    await sql`
      INSERT INTO notificaciones_enviadas (
        publicacion_id,
        tipo_notificacion,
        total_enviados,
        total_exitosos,
        total_fallidos,
        detalles
      ) VALUES (
        ${publicacion_id},
        'nueva_publicacion',
        ${suscriptores.length},
        ${totalEnviados},
        ${totalFallidos},
        ${JSON.stringify({ errores: errores.slice(0, 10) })}
      )
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notificaciones enviadas exitosamente`,
      stats: {
        total: suscriptores.length,
        enviados: totalEnviados,
        fallidos: totalFallidos
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error al enviar notificaciones' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ✅ Función para generar versión de texto plano del email
function generarEmailNotificacionTexto(
  pub: any,
  tipoPub: string,
  publicacionUrl: string,
  suscriptor: any,
  baseUrl: string
): string {
  return `
Nueva ${tipoPub} en FORAMA

${pub.titulo}

${pub.categoria_nombre ? `Categoría: ${pub.categoria_nombre}` : ''}

${pub.resumen || 'Lee el contenido completo para más detalles.'}

Leer ${tipoPub} completo: ${publicacionUrl}

---
FORAMA · Conservación de la Amazonía

Recibiste este email porque estás suscrito a nuestro boletín.
Para cancelar tu suscripción: ${baseUrl}/cancelar-boletin?email=${encodeURIComponent(suscriptor.email)}
  `.trim();
}

// ✅ Función para generar el HTML del email
function generarEmailNotificacion(
  pub: any, 
  tipoPub: string, 
  iconoPub: string, 
  publicacionUrl: string, 
  suscriptor: any,
  baseUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 32px;">${iconoPub}</span>
            </div>
            <h1 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">
              Nueva ${tipoPub} en FORAMA
            </h1>
          </div>

         
          <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 24px;">
            
            
            ${pub.imagen_portada ? `
              <img 
                src="${pub.imagen_portada}" 
                alt="${pub.titulo}"
                style="width: 100%; height: 240px; object-fit: cover; display: block;"
              />
            ` : ''}

           
            <div style="padding: 32px;">
              
              ${pub.categoria_nombre ? `
                <div style="display: inline-block; background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 12px; border-radius: 9999px; margin-bottom: 16px;">
                  ${pub.categoria_nombre}
                </div>
              ` : ''}

              <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; line-height: 1.2; margin: 0 0 16px 0;">
                ${pub.titulo}
              </h2>

              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${pub.resumen || 'Lee el contenido completo para más detalles.'}
              </p>

              <a 
                href="${publicacionUrl}" 
                style="display: inline-block; background: linear-gradient(135deg, #15803d 0%, #166534 100%); color: white; font-weight: 700; font-size: 16px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px rgba(21, 128, 61, 0.2);"
              >
                Leer ${tipoPub} completo →
              </a>
            </div>
          </div>

        
          <div style="text-align: center; padding: 24px 0;">
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
              FORAMA · Conservación de la Amazonía
            </p>
            <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 16px 0;">
              Recibiste este email porque estás suscrito a nuestro boletín
            </p>
            <a href="${baseUrl}/cancelar-boletin?email=${encodeURIComponent(suscriptor.email)}" style="color: #94a3b8; font-size: 12px; text-decoration: underline;">
              Cancelar suscripción
            </a>
          </div>

        </div>
      </body>
    </html>
  `;
}