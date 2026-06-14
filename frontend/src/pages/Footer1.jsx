import React, { useState } from 'react';

const PRIVACY_POLICY_TEXT = `PrimeMarket Privacy Policy

1. Introduction
This Privacy Policy describes your privacy rights regarding PrimeMarket's collection, use, storage, sharing, and protection of your Personal Information. It applies to the PrimeMarket website ("PrimeMarket" or the "Site") and all related sites, applications, services, and tools where this policy is referenced, regardless of how you access or use them, including mobile devices.

Business Location: Rajasthan, India.

This policy does not apply to the practices of third parties that PrimeMarket does not own or control, or to individuals that we do not employ or manage.

2. Scope and Consent
By using our Site, you acknowledge that you have read and accepted this Privacy Policy, the PrimeMarket User Agreement, and all Site policies, and you expressly consent to our collection, storage, use, and disclosure of your Personal Information as described in this Privacy Policy.

3. Amendments
PrimeMarket may amend this Privacy Policy at any time by posting updated terms on the Site. All amended terms automatically take effect 30 days after they are initially posted on the Site.

4. Collection of Personal Information
You can browse primemarket.co.in without telling us who you are. If you choose to provide us with Personal Information, you consent to the transfer and storage of that information on our servers.

We may collect and store:
- Email address
- Phone number
- Billing and contact information
- Transactional information
- Support communications
- IP address and browser information
- Cookies and website usage data

5. Marketing
We do not sell or rent your Personal Information to third parties for their marketing purposes without your explicit consent.

6. Use of Information
PrimeMarket may use your Personal Information to:
- Provide services and customer support
- Process transactions
- Prevent fraud and security breaches
- Improve website functionality
- Contact you regarding your account or purchases
- Send service updates and promotional communications

7. Information Sharing
PrimeMarket may disclose Personal Information:
- To comply with legal obligations
- To enforce our policies
- To service providers assisting with payment processing and website operations
- To law enforcement when legally required
- During business transfers or acquisitions

8. Cookies
PrimeMarket uses cookies and similar technologies to improve user experience, maintain security, analyze website traffic, and remember user preferences.

9. Account Security
We use reasonable technical and administrative safeguards to protect your information. However, no method of transmission over the Internet is completely secure.

10. Access and Updates
You may review and update your account information through your account settings on primemarket.co.in.

11. Children's Privacy
Users must be at least 13 years old to register and use PrimeMarket services.

12. Contact Information
Website: primemarket.co.in
Business Location: Rajasthan, India
For privacy-related questions, please contact us through the contact methods provided on the website.`;

function PrivacyModal({ onClose }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <div style={s.modalInner}>
          <pre style={s.policyText}>{PRIVACY_POLICY_TEXT}</pre>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <footer style={s.footer}>
        <div style={s.glowLine} />

        <div style={s.inner}>

          {/* LOGO ROW */}
          <div style={s.logoRow}>
            <img src="images/logo.png" alt="PrimeMarket" style={s.logoImg} />
            <div style={s.logoTextGroup}>
              <span style={s.logoName}>PrimeMarket</span>
              <span style={s.logoTag}>Rajasthan, India</span>
            </div>
          </div>

          <div style={s.divider} />

          {/* MIDDLE ROW */}
          <div style={s.midRow}>

            {/* SOCIALS */}
            <div>
              <div style={s.sectionLabel}>Connect with us</div>
              <div style={s.socialLinks}>

                {/* Email */}
                <a href="mailto:primesmarket.in@gmail.com" style={s.socialLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                  </svg>
                  <span>primesmarket.in@gmail.com</span>
                </a>

                {/* Telegram */}
                <a href="https://t.me/@utkarsh_bst_1" target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#2AABEE"/>
                    <path d="M17.5 7L5.5 11.5l3.5 1L10.5 17l2-3 3 2.5L17.5 7z" fill="white"/>
                  </svg>
                  <span>@utkarsh_bst_1</span>
                </a>

                {/* Instagram */}
                <a href="https://www.instagram.com/primemarket1234" target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f09433"/>
                        <stop offset="25%" stopColor="#e6683c"/>
                        <stop offset="50%" stopColor="#dc2743"/>
                        <stop offset="75%" stopColor="#cc2366"/>
                        <stop offset="100%" stopColor="#bc1888"/>
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/>
                    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
                    <circle cx="17" cy="7" r="1" fill="white"/>
                  </svg>
                  <span>@primemarket1234</span>
                </a>

              </div>
            </div>

            {/* PAYMENTS */}
            <div>
              <div style={s.sectionLabel}>Payment accepted</div>
              <div style={s.payBadges}>

                {/* UPI */}
                <div style={s.payBadge}>
                  <img src="images/up.png" alt="UPI" style={s.payImg} />
                </div>

                {/* Binance */}
                <div style={s.payBadge}>
                  <img src="images/bin.png" alt="Binance" style={s.payImg} />
                </div>

              </div>
            </div>

          </div>

          <div style={s.divider} />

          {/* BOTTOM BAR */}
          <div style={s.bottomBar}>
            <span style={s.copy}>© {new Date().getFullYear()} PrimeMarket. All rights reserved.</span>
            <button style={s.privacyBtn} onClick={() => setShowPrivacy(true)}>
              Privacy Policy
            </button>
          </div>

        </div>
      </footer>
    </>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(180deg, #0a0a10 0%, #0d0d18 100%)',
    borderTop: '1px solid #1e1e35',
    padding: '36px 24px 24px',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 60,
  },
  glowLine: {
    position: 'absolute',
    top: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: '60%', height: 1,
    background: 'linear-gradient(90deg, transparent, #7c5cfc55, #a78bfa55, transparent)',
  },
  inner: {
    maxWidth: 960,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logoImg: {
    width: 40, height: 40,
    objectFit: 'contain',
    borderRadius: 10,
    flexShrink: 0,
  },
  logoTextGroup: { display: 'flex', flexDirection: 'column', gap: 1 },
  logoName: { fontSize: 16, fontWeight: 700, color: '#e8e0ff', letterSpacing: 0.3 },
  logoTag: { fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 1, background: '#1a1a2e' },
  midRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 9, letterSpacing: 1.5,
    textTransform: 'uppercase', color: '#444', marginBottom: 10,
  },
  socialLinks: { display: 'flex', flexDirection: 'column', gap: 8 },
  socialLink: {
    display: 'flex', alignItems: 'center', gap: 9,
    textDecoration: 'none', color: '#888', fontSize: 12,
    padding: '7px 12px', borderRadius: 8,
    border: '1px solid #1a1a2e', background: '#0e0e18',
  },
  payBadges: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  payBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0e0e18', border: '1px solid #1e1e32',
    borderRadius: 8, padding: '8px 14px',
  },
  payImg: {
    height: 28,
    width: 'auto',
    objectFit: 'contain',
  },
  bottomBar: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
  },
  copy: { fontSize: 11, color: '#333' },
  privacyBtn: {
    background: 'none', border: 'none',
    color: '#6b4fcf', fontSize: 11, cursor: 'pointer',
    textDecoration: 'underline', textUnderlineOffset: 2, padding: 0,
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 600, height: '80vh', maxHeight: 700,
    background: '#0e0e12', border: '1px solid #2a2a3a',
    borderRadius: 16, display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute', top: 12, right: 14,
    background: '#1a1a2e', border: '1px solid #2a2a3a',
    borderRadius: '50%', width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ccc', fontSize: 14, cursor: 'pointer', zIndex: 1,
  },
  modalInner: { flex: 1, overflowY: 'auto', padding: 24 },
  policyText: {
    color: '#ccc', fontSize: 13, lineHeight: 1.8,
    whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0,
  },
};