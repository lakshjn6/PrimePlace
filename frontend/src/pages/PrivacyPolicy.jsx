import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>Privacy Policy</h1>
        <p style={s.lastUpdated}>Last Updated: June 2026</p>

        <section style={s.section}>
          <h2 style={s.heading}>1. Introduction</h2>
          <p style={s.text}>
            This Privacy Policy describes your privacy rights regarding PrimeMarket's collection, use, storage, sharing, and protection of your Personal Information. It applies to the PrimeMarket website ("PrimeMarket" or the "Site") and all related sites, applications, services, and tools where this policy is referenced, regardless of how you access or use them, including mobile devices.
          </p>
          <p style={s.text}>
            <strong>Business Location:</strong> Rajasthan, India.
          </p>
          <p style={s.text}>
            This policy does not apply to the practices of third parties that PrimeMarket does not own or control, or to individuals that we do not employ or manage.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>2. Scope and Consent</h2>
          <p style={s.text}>
            By using our Site, you acknowledge that you have read and accepted this Privacy Policy, the PrimeMarket User Agreement, and all Site policies, and you expressly consent to our collection, storage, use, and disclosure of your Personal Information as described in this Privacy Policy.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>3. Amendments</h2>
          <p style={s.text}>
            PrimeMarket may amend this Privacy Policy at any time by posting updated terms on the Site. All amended terms automatically take effect 30 days after they are initially posted on the Site.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>4. Collection of Personal Information</h2>
          <p style={s.text}>
            You can browse primemarket.co.in without telling us who you are. If you choose to provide us with Personal Information, you consent to the transfer and storage of that information on our servers.
          </p>
          <p style={s.text}><strong>We may collect and store:</strong></p>
          <ul style={s.list}>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and contact information</li>
            <li>Transactional information</li>
            <li>Support communications</li>
            <li>IP address and browser information</li>
            <li>Cookies and website usage data</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>5. Marketing</h2>
          <p style={s.text}>
            We do not sell or rent your Personal Information to third parties for their marketing purposes without your explicit consent.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>6. Use of Information</h2>
          <p style={s.text}><strong>PrimeMarket may use your Personal Information to:</strong></p>
          <ul style={s.list}>
            <li>Provide services and customer support</li>
            <li>Process transactions</li>
            <li>Prevent fraud and security breaches</li>
            <li>Improve website functionality</li>
            <li>Contact you regarding your account or purchases</li>
            <li>Send service updates and promotional communications</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>7. Information Sharing</h2>
          <p style={s.text}><strong>PrimeMarket may disclose Personal Information:</strong></p>
          <ul style={s.list}>
            <li>To comply with legal obligations</li>
            <li>To enforce our policies</li>
            <li>To service providers assisting with payment processing and website operations</li>
            <li>To law enforcement when legally required</li>
            <li>During business transfers or acquisitions</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>8. Cookies</h2>
          <p style={s.text}>
            PrimeMarket uses cookies and similar technologies to improve user experience, maintain security, analyze website traffic, and remember user preferences.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>9. Account Security</h2>
          <p style={s.text}>
            We use reasonable technical and administrative safeguards to protect your information. However, no method of transmission over the Internet is completely secure.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>10. Access and Updates</h2>
          <p style={s.text}>
            You may review and update your account information through your account settings on primemarket.co.in.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>11. Children's Privacy</h2>
          <p style={s.text}>
            Users must be at least 13 years old to register and use PrimeMarket services.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.heading}>12. Contact Information</h2>
          <p style={s.text}>
            <strong>Website:</strong> primemarket.co.in
          </p>
          <p style={s.text}>
            <strong>Business Location:</strong> Rajasthan, India
          </p>
          <p style={s.text}>
            For privacy-related questions, please contact us through the contact methods provided on the website.
          </p>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: {
    background: '#060608',
    minHeight: '100vh',
    color: '#fff',
    paddingTop: 40,
    paddingBottom: 60,
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 24px',
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    marginBottom: 8,
    margin: 0,
  },
  lastUpdated: {
    color: '#888',
    fontSize: 14,
    marginBottom: 40,
    margin: 0,
  },
  section: {
    marginBottom: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
    marginTop: 0,
    color: '#7c5cfc',
  },
  text: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 1.8,
    marginBottom: 12,
  },
  list: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 1.8,
    paddingLeft: 24,
    margin: '12px 0',
  },
};