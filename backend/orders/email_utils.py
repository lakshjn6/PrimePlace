import logging
import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def send_order_delivered_email(order):
    """
    Sends an email to the user when their order / payment status changes to Paid.
    Uses the configured Resend service.
    """
    if not order or not getattr(order, 'user', None) or not order.user.email:
        logger.warning(f"Cannot send delivery email: missing user or email for order {getattr(order, 'order_number', 'unknown')}")
        return False

    api_key = getattr(settings, 'RESEND_API_KEY', '')
    if not api_key:
        logger.warning("RESEND_API_KEY is not configured. Skipping order email.")
        return False

    resend.api_key = api_key

    # Gather customer name
    full_name = f"{order.user.first_name or ''} {order.user.last_name or ''}".strip()
    customer_name = full_name if full_name else (order.user.username or order.user.email.split('@')[0])

    # Gather all product names
    items = list(order.items.select_related('product').all())
    product_names = [item.product.name for item in items if item.product and item.product.name]
    products_display = ", ".join(product_names) if product_names else "your product"

    site_url = "https://primemarket.co.in"
    orders_url = f"{site_url}/orders"
    support_email = "primesmarket.in@gmail.com"

    # Per-product credentials / access details (if admin filled your_product)
    product_cards_html = ""
    product_cards_text = ""
    for item in items:
        p_name = item.product.name if item.product else "Product"
        if item.your_product:
            product_cards_html += f"""
            <div style="background:#111116;border:1px solid #232334;border-radius:10px;padding:14px;margin-bottom:12px;">
              <div style="font-weight:700;color:#a78bfa;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
                🔑 {p_name} — Access Details
              </div>
              <pre style="margin:0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre-wrap;word-break:break-word;line-height:1.5;">{item.your_product}</pre>
            </div>
            """
            product_cards_text += f"\n[{p_name} Access Details]:\n{item.your_product}\n"

    # General order note (if admin filled your_order)
    order_note_html = ""
    order_note_text = ""
    if order.your_order:
        order_note_html = f"""
        <div style="background:#111116;border:1px solid #232334;border-radius:10px;padding:14px;margin-bottom:16px;">
          <div style="font-weight:700;color:#4caf50;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
            📦 Order Note
          </div>
          <pre style="margin:0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre-wrap;word-break:break-word;line-height:1.5;">{order.your_order}</pre>
        </div>
        """
        order_note_text = f"\n[Order Note]:\n{order.your_order}\n"

    # Plain text email version
    plain_text_message = f"""Hi {customer_name},

Great news! Your purchase of {products_display} has been successfully dropped into your account.

How to access your product:

1. Log in to your account.
{site_url}/

2. Go to Past Orders (or My Purchases).
{orders_url}

3. View your product details.
{product_cards_text}{order_note_text}
If you have any questions or need assistance accessing your item, feel free to reach out to our team at {support_email}

Thank you for choosing us!

Best regards,

PrimeMarket Team
"""

    # HTML email version
    html_message = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#060608;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;color:#eee;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060608;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#0e0e12;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c5cfc,#5b3fdb);padding:32px;text-align:center;">
              <div style="font-size:26px;font-weight:900;color:#ffffff;font-family:Georgia,serif;letter-spacing:1px;">
                ◈ PrimeMarket
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="color:#ffffff;font-size:16px;margin:0 0 16px;font-weight:600;">
                Hi {customer_name},
              </p>

              <p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Great news! Your purchase of <strong style="color:#ffffff;">{products_display}</strong> has been successfully dropped into your account.
              </p>

              <!-- How to access card -->
              <div style="background:#13131c;border:1px solid #232338;border-radius:12px;padding:20px 22px;margin:0 0 24px;">
                <div style="color:#a78bfa;font-size:14px;font-weight:700;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.5px;">
                  📌 How to access your product:
                </div>
                <ol style="margin:0;padding-left:20px;color:#d1d5db;font-size:14px;line-height:1.9;">
                  <li style="margin-bottom:6px;">
                    Log in to your account.<br/>
                    <a href="{site_url}/" style="color:#7c5cfc;text-decoration:none;word-break:break-all;">{site_url}/</a>
                  </li>
                  <li style="margin-bottom:6px;">
                    Go to <strong>Past Orders</strong> (or My Purchases).
                  </li>
                  <li>
                    View your product details.
                  </li>
                </ol>
              </div>

              {product_cards_html}
              {order_note_html}

              <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 24px;">
                <tr>
                  <td align="center">
                    <a href="{orders_url}"
                       style="display:inline-block;background:#7c5cfc;color:#ffffff;
                              text-decoration:none;padding:14px 34px;border-radius:10px;
                              font-weight:700;font-size:15px;box-shadow:0 4px 18px rgba(124,92,252,0.4);">
                      📋 View Past Orders
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;">
                If you have any questions or need assistance accessing your item, feel free to reach out to our team at
                <a href="mailto:{support_email}" style="color:#7c5cfc;text-decoration:none;">{support_email}</a>
              </p>

              <p style="color:#d1d5db;font-size:14px;margin:0 0 8px;">
                Thank you for choosing us!
              </p>

              <p style="color:#ffffff;font-size:14px;margin:16px 0 0;line-height:1.6;">
                Best regards,<br/>
                <strong>PrimeMarket Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid #1e1e2e;text-align:center;background:#09090d;">
              <p style="color:#555566;font-size:12px;margin:0;">© 2026 PrimeMarket · All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        resend.Emails.send({
            "from": "PrimeMarket <noreply@primemarket.co.in>",
            "to": [order.user.email],
            "subject": f"Your purchase of {products_display} has been dropped into your account! — PrimeMarket",
            "text": plain_text_message,
            "html": html_message,
        })
        logger.info(f"Order delivery email sent to {order.user.email} for order #{order.order_number}")
        return True
    except Exception as e:
        logger.error(f"Failed to send order delivery email for #{order.order_number}: {e}")
        return False
