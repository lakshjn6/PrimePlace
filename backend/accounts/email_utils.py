import resend
from django.conf import settings


def send_verification_email(user, token):
    resend.api_key = settings.RESEND_API_KEY

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    html_message = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#060608;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#0e0e12;border:1px solid #1e1e2e;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c5cfc,#5b3fdb);padding:40px;text-align:center;">
              <div style="font-size:28px;font-weight:900;color:#fff;font-family:Georgia,serif;">
                ◈ PrimeMarket
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">
                Hi {user.first_name}, confirm your email 👋
              </h2>
              <p style="color:#888;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Click the button below to verify your email and activate your account.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="{verify_url}"
                       style="display:inline-block;background:#7c5cfc;color:#fff;
                              text-decoration:none;padding:15px 40px;border-radius:12px;
                              font-weight:700;font-size:16px;">
                      ✓ Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#555;font-size:13px;margin:28px 0 0;text-align:center;">
                This link expires in <strong style="color:#888;">24 hours</strong>.
              </p>
              <div style="margin-top:24px;padding:16px;background:#111;border-radius:10px;">
                <p style="color:#555;font-size:12px;margin:0 0 6px;">If button doesn't work, copy this link:</p>
                <p style="color:#7c5cfc;font-size:12px;margin:0;word-break:break-all;">{verify_url}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e2e;text-align:center;">
              <p style="color:#444;font-size:12px;margin:0;">© 2026 PrimeMarket · All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    resend.Emails.send({
        "from": "PrimeMarket <noreply@primemarket.co.in>",  # use this until you add your domain
        "to": [user.email],
        "subject": "Verify your PrimeMarket account",
        "html": html_message,
    })