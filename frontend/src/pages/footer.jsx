import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.container}>
        <div style={s.content}>
          {/* Brand */}
          <div style={s.section}>
            <h3 style={s.brandTitle}>💎 PrimeMarket</h3>
            <p style={s.brandDesc}>
              Your premium subscription marketplace for the best services and content.
            </p>
            <div style={s.socialLinks}>
              <a href="https://t.me/your-telegram-channel" target="_blank" rel="noopener noreferrer" style={s.socialLink} title="Telegram">
                📱 Telegram
              </a>
              <a href="https://linkedin.com/company/primemarket" target="_blank" rel="noopener noreferrer" style={s.socialLink} title="LinkedIn">
                💼 LinkedIn
              </a>
              <a href="https://instagram.com/primemarket" target="_blank" rel="noopener noreferrer" style={s.socialLink} title="Instagram">
                📸 Instagram
              </a>
            </div>
          </div>

          {/* Links */}
          <div style={s.section}>
            <h4 style={s.sectionTitle}>Quick Links</h4>
            <Link to="/products" style={s.link}>Browse Plans</Link>
            <Link to="/" style={s.link}>Home</Link>
            <Link to="/privacy-policy" style={s.link}>Privacy Policy</Link>
          </div>

          {/* Contact */}
          <div style={s.section}>
            <h4 style={s.sectionTitle}>Contact</h4>
            <p style={s.contactInfo}>📧 primesmarket@gmail.com</p>
          </div>

          {/* Support */}
          <div style={s.section}>
            <h4 style={s.sectionTitle}>Support</h4>
            <a href="mailto:primesmarket@gmail.com" style={s.link}>Email Support</a>
            <a href="https://t.me/your-telegram-channel" target="_blank" rel="noopener noreferrer" style={s.link}>Telegram Support</a>
            <Link to="/privacy-policy" style={s.link}>Privacy Policy</Link>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider}></div>

        {/* Bottom */}
        <div style={s.bottom}>
          <p style={s.copyright}>
            © 2026 PrimeMarket. All rights reserved.
          </p>
          <div style={s.bottomLinks}>
            <Link to="/privacy-policy" style={s.bottomLink}>Privacy Policy</Link>
            <span style={s.separator}>•</span>
            <a href="mailto:primesmarket@gmail.com" style={s.bottomLink}>Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: '#0a0a0d',
    borderTop: '1px solid #1a1a2e',
    padding: '60px 24px 40px',
    marginTop: 80,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 40,
    marginBottom: 40,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: '#7c5cfc',
    margin: 0,
    marginBottom: 8,
  },
  brandDesc: {
    color: '#888',
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  link: {
    color: '#888',
    fontSize: 13,
    textDecoration: 'none',
    transition: 'color 0.3s',
    cursor: 'pointer',
  },
  socialLinks: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(124, 92, 252, 0.1)',
    color: '#7c5cfc',
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid rgba(124, 92, 252, 0.3)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  contactInfo: {
    color: '#888',
    fontSize: 13,
    margin: 0,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #1a1a2e, transparent)',
    marginBottom: 32,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  copyright: {
    color: '#555',
    fontSize: 12,
    margin: 0,
  },
  bottomLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  bottomLink: {
    color: '#666',
    fontSize: 12,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.3s',
  },
  separator: {
    color: '#444',
  },
};