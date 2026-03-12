import { Resend } from 'resend';
import type { Invoice } from '@/types/invoice';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(
  invoice: Invoice,
  pdfBuffer: Buffer
): Promise<{ success: boolean; error?: string }> {
  const recipientEmail = invoice.customer.email;
  if (!recipientEmail) {
    return { success: false, error: 'El cliente no tiene email registrado' };
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'facturas@tuempresa.com',
      to: recipientEmail,
      subject: `Factura ${invoice.number} - ${invoice.customer.name}`,
      html: buildEmailHtml(invoice),
      attachments: [
        {
          filename: `${invoice.number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, error: message };
  }
}

function buildEmailHtml(invoice: Invoice): string {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0f2747; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">${process.env.COMPANY_NAME ?? 'Tu Empresa'}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Estimado/a <strong>${invoice.customer.name}</strong>,</p>
        <p>Adjuntamos su factura <strong>${invoice.number}</strong> por importe de
          <strong>${formatCurrency(invoice.total)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr style="background:#0f2747;color:white;">
            <th style="padding:8px 12px;text-align:left;">Nº Factura</th>
            <th style="padding:8px 12px;text-align:left;">Fecha</th>
            <th style="padding:8px 12px;text-align:right;">Importe</th>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${invoice.number}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${new Date(invoice.issueDate).toLocaleDateString('es-ES')}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:right;">${formatCurrency(invoice.total)}</td>
          </tr>
        </table>
        <p style="color:#666;font-size:14px;">Para cualquier consulta, no dude en contactarnos.</p>
        <p>Gracias por su confianza.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="color:#999;font-size:12px;">
          ${process.env.COMPANY_NAME} · ${process.env.COMPANY_ADDRESS ?? ''}<br/>
          ${process.env.COMPANY_PHONE ?? ''} · ${process.env.COMPANY_EMAIL ?? ''}
        </p>
      </div>
    </body>
    </html>
  `;
}
