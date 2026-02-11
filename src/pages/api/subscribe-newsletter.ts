import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, nombre } = body;

    // ✅ Validación de email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email es requerido' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email inválido' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Verificar si el email YA existe en la BD
    const existente = await sql`
      SELECT id, email, estado, confirmado 
      FROM suscriptores_boletin 
      WHERE email = ${email.toLowerCase()}
    `;

    if (existente.length > 0) {
      const suscriptor = existente[0];
      
      // 🔒 Email CANCELADO → NO permitir re-suscripción
      if (suscriptor.estado === 'cancelado') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Este correo electrónico canceló su suscripción anteriormente. La función de re-suscripción estará disponible próximamente.',
          tipo: 'email_cancelado'
        }), { 
          status: 403, // Forbidden
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 🔒 Email ACTIVO → Ya está registrado
      if (suscriptor.estado === 'activo') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Este correo electrónico ya está registrado en nuestro boletín.',
          tipo: 'ya_registrado'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 🔄 Email INACTIVO → Reactivar (único caso especial permitido)
      if (suscriptor.estado === 'inactivo') {
        await sql`
          UPDATE suscriptores_boletin 
          SET estado = 'activo',
              confirmado = TRUE,
              fecha_suscripcion = CURRENT_TIMESTAMP
          WHERE email = ${email.toLowerCase()}
        `;
        
        // Enviar email de reactivación
        await enviarEmailBienvenida(email, nombre, true, new URL(request.url).origin);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: '¡Tu suscripción ha sido reactivada! Revisa tu email.' 
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ✨ Email NUEVO → Crear suscripción
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await sql`
      INSERT INTO suscriptores_boletin (
        email, 
        nombre, 
        token_confirmacion, 
        ip_suscripcion, 
        user_agent,
        estado,
        confirmado
      ) VALUES (
        ${email.toLowerCase()},
        ${nombre || null},
        ${token},
        ${clientIP},
        ${userAgent},
        'activo',
        TRUE
      )
    `;

    // ✅ Enviar email de bienvenida
    await enviarEmailBienvenida(email, nombre, false, new URL(request.url).origin);

    return new Response(JSON.stringify({ 
      success: true, 
      message: '¡Te has suscrito exitosamente! Revisa tu email.' 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en suscripción:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error al procesar la suscripción. Inténtalo de nuevo.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ✅ Función auxiliar para enviar email de bienvenida
async function enviarEmailBienvenida(
  email: string, 
  nombre: string | null, 
  esReactivacion: boolean,
  baseUrl: string
) {
  try {
    const emailResult = await resend.emails.send({
      from: 'FORAMA Boletín <noreply@email.forama.org>',
      to: [email],
      replyTo: 'contacto@forama.org',
      subject: esReactivacion 
        ? '🌿 ¡Tu suscripción ha sido reactivada!' 
        : '🌿 ¡Bienvenido al Boletín de FORAMA!',
      headers: {
        'X-Entity-Ref-ID': `newsletter-${Date.now()}`,
        'List-Unsubscribe': `<${baseUrl}/cancelar-boletin?email=${encodeURIComponent(email)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      text: `
Hola${nombre ? ` ${nombre}` : ''},

${esReactivacion 
  ? '¡Tu suscripción al boletín de FORAMA ha sido reactivada exitosamente!' 
  : '¡Estamos emocionados de tenerte en nuestra comunidad!'}

A partir de ahora recibirás:

• Noticias y actualizaciones sobre nuestros proyectos de conservación
• Artículos científicos y descubrimientos de la Amazonía
• Publicaciones de investigación y recursos educativos
• Historias de impacto de nuestro trabajo en el campo

¿Sabías que? La Amazonía brasileña representa aproximadamente el 60% de toda la región amazónica de América del Sur y es uno de los principales patrimonios de biodiversidad del planeta.

Puedes esperar nuestro boletín en tu bandeja de entrada cada vez que publiquemos contenido nuevo.

${esReactivacion ? '¡Bienvenido de vuelta! 🎉' : '¡Bienvenido a bordo! 🚀'}

---
Fundación para la Conservación de la Amazonía y Manejo Forestal (FORAMA)

Sin spam ni publicidad — solo contenido de valor
Cancela cuando quieras — sin compromisos
100% gratuito — sin tarjeta de crédito requerida

Para cancelar tu suscripción: ${baseUrl}/cancelar-boletin?email=${encodeURIComponent(email)}
      `,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              
              <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 32px;">
                <h1 style="color: white; margin: 0 0 16px 0; font-size: 32px; font-weight: 800;">
                  🌿 ${esReactivacion ? '¡Suscripción Reactivada!' : '¡Bienvenido a FORAMA!'}
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px; font-weight: 400;">
                  ${esReactivacion 
                    ? 'Tu suscripción ha sido reactivada exitosamente' 
                    : 'Gracias por suscribirte a nuestro boletín'}
                </p>
              </div>

              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 24px;">
                
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hola${nombre ? ` ${nombre}` : ''},
                </p>

                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  ${esReactivacion 
                    ? '¡Tu suscripción al boletín de FORAMA ha sido reactivada exitosamente!' 
                    : '¡Estamos emocionados de tenerte en nuestra comunidad!'}
                </p>

                ${!esReactivacion ? `
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    A partir de ahora recibirás:
                  </p>
                  <ul style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0; padding-left: 24px;">
                    <li style="margin-bottom: 12px;">📰 <strong>Noticias y actualizaciones</strong> sobre nuestros proyectos de conservación</li>
                    <li style="margin-bottom: 12px;">🔬 <strong>Artículos científicos</strong> y descubrimientos de la Amazonía</li>
                    <li style="margin-bottom: 12px;">📚 <strong>Publicaciones</strong> de investigación y recursos educativos</li>
                    <li style="margin-bottom: 12px;">🌱 <strong>Historias de impacto</strong> de nuestro trabajo en el campo</li>
                  </ul>
                ` : ''}

                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #15803d; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                  <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">
                    💡 <strong>¿Sabías que?</strong> La Amazonía brasileña representa aproximadamente el 60% de toda la región amazónica de América del Sur y es uno de los principales patrimonios de biodiversidad del planeta.
                  </p>
                </div>

                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Puedes esperar nuestro boletín en tu bandeja de entrada cada vez que publiquemos contenido nuevo.
                </p>

                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0;">
                  ${esReactivacion ? '¡Bienvenido de vuelta! 🎉' : '¡Bienvenido a bordo! 🚀'}
                </p>
              </div>

              <div style="text-align: center; padding: 24px 0;">
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  Fundación para la Conservación de la Amazonía y Manejo Forestal (FORAMA)
                </p>
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin: 0;">
                  <strong>Sin spam ni publicidad</strong> — solo contenido de valor<br>
                  <strong>Cancela cuando quieras</strong> — sin compromisos<br>
                  <strong>100% gratuito</strong> — sin tarjeta de crédito requerida
                </p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <a href="${baseUrl}/cancelar-boletin?email=${encodeURIComponent(email)}" style="color: #64748b; font-size: 12px; text-decoration: underline;">
                    Cancelar suscripción
                  </a>
                </div>
              </div>

            </div>
          </body>
        </html>
      `,
    });
    
    console.log('✅ Email de bienvenida enviado:', emailResult);
    
  } catch (emailError: any) {
    console.error('❌ Error enviando email:', emailError);
    console.error('Detalles:', {
      message: emailError.message,
      statusCode: emailError.statusCode,
      name: emailError.name
    });
  }
}