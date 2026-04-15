import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)

def send_email(to: str, subject: str, html_content: str) -> bool:
    api_key = os.environ.get('SENDGRID_API_KEY')
    sender = os.environ.get('SENDER_EMAIL')
    
    if not api_key or not sender:
        logger.warning("SendGrid not configured (SENDGRID_API_KEY or SENDER_EMAIL missing). Email not sent.")
        return False
    
    message = Mail(
        from_email=sender,
        to_emails=to,
        subject=subject,
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logger.info(f"Email sent to {to} - status: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def build_stock_alert_email(product_name: str, warehouse_name: str, current_qty: float, min_stock: float) -> tuple:
    subject = f"[Gestao TJ] Alerta de Estoque Baixo - {product_name}"
    html = f"""
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 12px; overflow: hidden;">
      <div style="background: #2563EB; color: white; padding: 20px 24px;">
        <h1 style="margin: 0; font-size: 20px;">Gestao TJ - Alerta de Estoque</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #DC2626; font-weight: 600; font-size: 16px;">Estoque Baixo Detectado</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #71717A;">Produto:</td><td style="padding: 8px 0; font-weight: 600;">{product_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Deposito:</td><td style="padding: 8px 0;">{warehouse_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Quantidade Atual:</td><td style="padding: 8px 0; color: #DC2626; font-weight: 600;">{current_qty}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Estoque Minimo:</td><td style="padding: 8px 0;">{min_stock}</td></tr>
        </table>
        <p style="color: #71717A; font-size: 14px;">Acesse o sistema para reabastecer o estoque.</p>
      </div>
      <div style="background: #FAFAFA; padding: 16px 24px; border-top: 1px solid #E4E4E7; text-align: center;">
        <p style="color: #A1A1AA; font-size: 12px; margin: 0;">Sistema Gestao TJ - Notificacao Automatica</p>
      </div>
    </div>
    """
    return subject, html


def build_invoice_pending_email(invoice_number: str, supplier_name: str, total_value: float) -> tuple:
    subject = f"[Gestao TJ] Nota Fiscal Pendente - {invoice_number}"
    html = f"""
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 12px; overflow: hidden;">
      <div style="background: #2563EB; color: white; padding: 20px 24px;">
        <h1 style="margin: 0; font-size: 20px;">Gestao TJ - Nota Fiscal</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #EAB308; font-weight: 600; font-size: 16px;">Nota Fiscal Pendente</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #71717A;">Numero:</td><td style="padding: 8px 0; font-weight: 600;">{invoice_number}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Fornecedor:</td><td style="padding: 8px 0;">{supplier_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Valor:</td><td style="padding: 8px 0; font-weight: 600;">R$ {total_value:.2f}</td></tr>
        </table>
      </div>
      <div style="background: #FAFAFA; padding: 16px 24px; border-top: 1px solid #E4E4E7; text-align: center;">
        <p style="color: #A1A1AA; font-size: 12px; margin: 0;">Sistema Gestao TJ - Notificacao Automatica</p>
      </div>
    </div>
    """
    return subject, html


def build_sale_completed_email(sale_number: str, total: float, customer_name: str) -> tuple:
    subject = f"[Gestao TJ] Venda Concluida - {sale_number}"
    html = f"""
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 12px; overflow: hidden;">
      <div style="background: #2563EB; color: white; padding: 20px 24px;">
        <h1 style="margin: 0; font-size: 20px;">Gestao TJ - Venda</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #16A34A; font-weight: 600; font-size: 16px;">Venda Concluida com Sucesso</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #71717A;">Numero:</td><td style="padding: 8px 0; font-weight: 600;">{sale_number}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Cliente:</td><td style="padding: 8px 0;">{customer_name or 'Nao informado'}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717A;">Total:</td><td style="padding: 8px 0; font-weight: 600; color: #16A34A;">R$ {total:.2f}</td></tr>
        </table>
      </div>
      <div style="background: #FAFAFA; padding: 16px 24px; border-top: 1px solid #E4E4E7; text-align: center;">
        <p style="color: #A1A1AA; font-size: 12px; margin: 0;">Sistema Gestao TJ - Notificacao Automatica</p>
      </div>
    </div>
    """
    return subject, html
