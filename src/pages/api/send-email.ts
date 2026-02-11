import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    const { 
      nombre, 
      institucion, 
      email, 
      asunto, 
      mensaje,
      tipo // 'contacto' o 'proyecto'
    } = data;

    // Determinar email de destino según el tipo
    const emailDestino = tipo === 'proyecto' 
      ? 'proyectos@forama.org'
      : 'contacto@forama.org';

    // Determinar asunto del email
    const emailSubject = tipo === 'proyecto'
      ? `[PROYECTOS] ${asunto}`
      : `[CONTACTO] ${asunto}`;

    // Template HTML profesional
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6; 
              color: #333;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #1e7e34 0%, #0d5c23 100%);
              color: white; 
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .badge {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content { 
              padding: 30px;
            }
            .field { 
              margin-bottom: 24px;
              border-left: 4px solid #1e7e34;
              padding-left: 16px;
            }
            .label { 
              font-weight: 700;
              color: #1e7e34;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
              display: block;
            }
            .value { 
              padding: 12px 16px;
              background: #f8f9fa;
              border-radius: 8px;
              font-size: 15px;
              color: #2c3e50;
              word-wrap: break-word;
            }
            .mensaje-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #1e7e34;
              margin-top: 20px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              color: #6c757d;
              font-size: 13px;
              margin-bottom: 8px;
            }
            .footer a {
              color: #1e7e34;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nuevo Mensaje</h1>
              <span class="badge">${tipo === 'proyecto' ? '🎯 Propuesta de Proyecto' : '💬 Consulta General'}</span>
            </div>
            
            <div class="content">
              <div class="field">
                <span class="label">👤 Nombre Completo</span>
                <div class="value">${nombre}</div>
              </div>
              
              ${institucion ? `
              <div class="field">
                <span class="label">🏢 Institución</span>
                <div class="value">${institucion}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <span class="label">📧 Correo Electrónico</span>
                <div class="value">
                  <a href="mailto:${email}" style="color: #1e7e34; text-decoration: none;">
                    ${email}
                  </a>
                </div>
              </div>
              
              <div class="field">
                <span class="label">📋 Asunto</span>
                <div class="value">${asunto}</div>
              </div>
              
              <div class="mensaje-box">
                <span class="label" style="margin-bottom: 12px;">💬 Mensaje</span>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #2c3e50;">
                  ${mensaje}
                </div>
              </div>
            </div>

            <div class="footer">
              <p><strong>FORAMA</strong> - Fundación para la Gestión e Investigación en el Manejo Forestal</p>
              <p>
                <a href="https://forama.org">forama.org</a> • 
                <a href="mailto:${emailDestino}">${emailDestino}</a>
              </p>
              <p style="margin-top: 12px; font-size: 11px; color: #adb5bd;">
                Este correo fue enviado automáticamente desde el formulario web de FORAMA.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email con Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'FORAMA Web <noreply@email.forama.org>',
      to: [emailDestino],
      replyTo: email,
      subject: emailSubject,
      html: htmlTemplate,
    });

    if (error) {
      console.error('Error al enviar email:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Email enviado exitosamente:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: emailData,
        message: 'Mensaje enviado correctamente'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error en el servidor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};