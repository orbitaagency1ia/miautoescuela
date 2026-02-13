/**
 * Email Service
 * Servicio de envío de emails usando Resend
 */

import { Resend } from 'resend';

// Inicializar Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Enviar email de bienvenida con contraseña temporal
 */
export async function sendWelcomeEmail(
  email: string,
  schoolName: string,
  tempPassword: string
) {
  if (!resend) {
    console.warn('Resend no configurado, saltando envío de email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@miautoescuela.com',
      to: [email],
      subject: `Bienvenido a ${schoolName} - mIAutoescuela`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a ${schoolName}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0;">¡Bienvenido a ${schoolName}!</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Tu cuenta ha sido creada exitosamente</p>
              </div>

              <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0;">Tus credenciales de acceso</h2>
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Email:</p>
                  <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">${email}</p>
                </div>
                <div style="background: white; border-radius: 8px; padding: 20px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Contraseña temporal:</p>
                  <p style="color: #dc2626; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 2px;">${tempPassword}</p>
                </div>
                <p style="color: #dc2626; font-size: 14px; margin: 20px 0 0 0; padding: 10px; background: #fef2f2; border-radius: 6px;">⚠️ Por tu seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/iniciar-sesion" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600;">Iniciar Sesión</a>
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 14px;">
                <p style="margin: 0;">Si tienes problemas, contacta a <a href="mailto:soporte@miautoescuela.com" style="color: #2563eb; text-decoration: none;">soporte@miautoescuela.com</a></p>
                <p style="margin: 10px 0 0 0;">Este es un email automático, por favor no responder.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Enviar email de invitación
 */
export async function sendInviteEmail(
  email: string,
  schoolName: string,
  inviteToken: string,
  inviterName?: string,
  message?: string
) {
  if (!resend) {
    console.warn('Resend no configurado, saltando envío de email');
    return { success: false, error: 'Email service not configured' };
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${inviteToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@miautoescuela.com',
      to: [email],
      subject: `${inviterName ? `${inviterName} te ha invitado` : 'Invitación'} a ${schoolName} - mIAutoescuela`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitación a ${schoolName}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0;">${inviterName ? `${inviterName} te ha invitado` : 'Has sido invitado'} a ${schoolName}</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Únete a la plataforma de formación</p>
              </div>

              ${message ? `
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #1f2937; font-size: 16px; font-style: italic; margin: 0;">"${message}"</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${inviteLink}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600;">Aceptar Invitación</a>
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 14px;">
                <p style="margin: 0;">Este enlace expirará en 7 días por seguridad.</p>
                <p style="margin: 10px 0 0 0;">Si tienes problemas, contacta a <a href="mailto:soporte@miautoescuela.com" style="color: #2563eb; text-decoration: none;">soporte@miautoescuela.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending invite email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending invite email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Enviar email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  if (!resend) {
    console.warn('Resend no configurado, saltando envío de email');
    return { success: false, error: 'Email service not configured' };
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@miautoescuela.com',
      to: [email],
      subject: 'Restablecer tu contraseña - mIAutoescuela',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer contraseña</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0;">Restablecer tu contraseña</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Recibimos una solicitud para restablecer tu contraseña</p>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600;">Restablecer Contraseña</a>
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 14px;">
                <p style="margin: 0;">Si no solicitaste este cambio, puedes ignorar este email.</p>
                <p style="margin: 10px 0 0 0;">Este enlace expirará en 1 hora por seguridad.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
