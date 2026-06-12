import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
        <div style={s.inner}>
          <span style={s.copy}>© {new Date().getFullYear()} PrimePlace. All rights reserved.</span>

          <button style={s.privacyBtn} onClick={() => setShowPrivacy(true)}>
            Privacy Policy
          </button>

          <div style={s.right}>
            <a href="mailto:primesmarket.in@gmail.com" style={s.emailLink}>
              primesmarket.in@gmail.com
            </a>
            
            <a
              href="https://www.instagram.com/primesmarket.in"
              target="_blank"
              rel="noopener noreferrer"
              style={s.igLink}
              title="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

const s = {
  footer: {
    background: '#0a0a0d',
    borderTop: '1px solid #1a1a2e',
    padding: '14px 24px',
    marginTop: 60,
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px 20px',
  },
  copy: { color: '#555', fontSize: 12, whiteSpace: 'nowrap' },
  privacyBtn: {
    background: 'none',
    border: 'none',
    color: '#7c5cfc',
    fontSize: 12,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  emailLink: { color: '#555', fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' },
  igLink: { color: '#888', display: 'flex', alignItems: 'center' },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '50vw',
    height: '50vh',
    background: '#0e0e12',
    border: '1px solid #2a2a3a',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 300,
    minHeight: 260,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 16,
    cursor: 'pointer',
    zIndex: 1,
  },
  modalInner: { flex: 1, overflowY: 'auto', padding: '20px 24px 20px 20px' },
  policyText: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    margin: 0,
  },
};