from django.core.mail import send_mail
from django.conf import settings


def send_verification_email(user, token):
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = "Verify your PrimeMarket account"

    message = f"""
Hi {user.first_name},

Welcome to PrimeMarket! Please verify your email address to activate your account.

Click the link below to verify:
{verify_url}

This link expires in 24 hours.

If you did not create an account, ignore this email.

— The PrimeMarket Team
"""

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
              <div style="color:rgba(255,255,255,0.7);margin-top:6px;font-size:14px;">
                Subscription Marketplace
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;font-family:Georgia,serif;">
                Hi {user.first_name}, confirm your email 👋
              </h2>
              <p style="color:#888;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Thanks for signing up for PrimeMarket. Click the button below
                to verify your email address and activate your account.
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
              <div style="margin-top:24px;padding:16px;background:#111;border-radius:10px;border:1px solid #1e1e2e;">
                <p style="color:#555;font-size:12px;margin:0 0 6px;">If the button doesn't work, copy this link:</p>
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

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )