import React, { useState, useEffect } from 'react';

// CTA URLs
const CTA_URL = 'https://www.lenilani.com';
const CONTACT_URL = 'https://www.lenilani.com/contact';
const CALENDAR_URL = 'https://calendly.com/rprovine-kointyme/30min?month=2025-10';

// Google Cloud brand colors
const colors = {
  blue: '#4285f4',
  green: '#34a853',
  yellow: '#fbbc04',
  red: '#ea4335',
  purple: '#9334e6',
  cyan: '#00bcd4',
  orange: '#ff6d00',
  pink: '#e91e63',
  gray: '#607d8b'
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // HubSpot form integration
  useEffect(() => {
    if (activeTab === 'contact') {
      const existingScript = document.querySelector('script[src*="hsforms"]');

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '//js-na2.hsforms.net/forms/embed/v2.js';
        script.charset = 'utf-8';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
          if (window.hbspt) {
            window.hbspt.forms.create({
              portalId: "242173134",
              formId: "1c48848d-0063-4ba5-ac12-b1e7c5933c3f",
              region: "na2",
              target: "#hubspot-form"
            });
          }
        };
        document.body.appendChild(script);
      } else if (window.hbspt) {
        const formContainer = document.getElementById('hubspot-form');
        if (formContainer) formContainer.innerHTML = '';

        window.hbspt.forms.create({
          portalId: "242173134",
          formId: "1c48848d-0063-4ba5-ac12-b1e7c5933c3f",
          region: "na2",
          target: "#hubspot-form"
        });
      }
    }
  }, [activeTab]);

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
    color: '#fff'
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)'
  };

  return (
    <div style={{
      fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      color: '#e5e5e5'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '8px 16px',
            border: '2px solid transparent',
            backgroundImage: `linear-gradient(#0a0a0a, #0a0a0a), linear-gradient(135deg, ${colors.blue}, ${colors.green}, ${colors.yellow}, ${colors.red})`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: '700',
            fontSize: '18px'
          }}>
            LeniLani
          </div>
          <span style={{ color: '#606060', fontSize: '20px' }}>×</span>
          <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Google Cloud Partner</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ color: '#707070', fontSize: '14px' }}>Honolulu, Hawaii</span>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...primaryButtonStyle,
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(66,133,244,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Book a Call
          </a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '◈' },
          { id: 'ai', label: 'AI Solutions', icon: '◉' },
          { id: 'cloud', label: 'Cloud & Infrastructure', icon: '◆' },
          { id: 'apps', label: 'App Development', icon: '◇' },
          { id: 'contact', label: 'Contact', icon: '✉' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 24px',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#606060',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${colors.blue}` : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = '#a0a0a0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = '#606060';
              }
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main style={{
        padding: '32px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'ai' && <AITab setActiveTab={setActiveTab} />}
        {activeTab === 'cloud' && <CloudTab setActiveTab={setActiveTab} />}
        {activeTab === 'apps' && <AppsTab setActiveTab={setActiveTab} />}
        {activeTab === 'contact' && <ContactTab setActiveTab={setActiveTab} />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#606060',
        fontSize: '13px'
      }}>
        <div>
          © 2025 LeniLani Consulting • 1050 Queen Street, Suite 100, Honolulu, HI 96814
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href={CTA_URL} style={{ color: '#606060', textDecoration: 'none' }}>Website</a>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              background: 'none',
              border: 'none',
              color: '#606060',
              cursor: 'pointer',
              fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '13px'
            }}
          >
            Contact
          </button>
          <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#606060', textDecoration: 'none' }}>Book a Call</a>
        </div>
      </footer>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ setActiveTab }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s'
  };

  const primaryButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
    color: '#fff',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s'
  };

  const outlineButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s'
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        ...cardStyle,
        textAlign: 'center',
        padding: '64px 32px',
        background: `linear-gradient(135deg, rgba(66,133,244,0.1), rgba(52,168,83,0.1))`,
        marginBottom: '48px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '16px'
        }}>
          Transform Your Business with AI & Cloud
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#808080',
          marginBottom: '32px',
          maxWidth: '700px',
          margin: '0 auto 32px'
        }}>
          Hawaii's technology consulting partner. We design, build, and manage AI and cloud solutions so you can focus on running your business.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => setActiveTab('contact')}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(66,133,244,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Schedule a Free Consultation →
          </button>
          <button
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            style={outlineButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            See Our Services
          </button>
        </div>
        <div style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          color: '#a0a0a0',
          fontSize: '13px'
        }}>
          <div>✓ Google Cloud Partner</div>
          <div>✓ 20+ Years Experience</div>
          <div>✓ Hawaii-Based</div>
        </div>
      </div>

      {/* Service Packages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {/* AI Solutions Card */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Custom AI & Chatbots</h3>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Intelligent automation for customer support, sales, and operations
          </p>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.red, marginBottom: '16px' }}>
            Starting at $4,000
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Custom chatbot development',
              'RAG over your documents',
              'Website or Slack integration',
              'Analytics dashboard',
              '30-day support included'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.red }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            + $500/mo managed services
          </div>
          <button
            onClick={() => setActiveTab('ai')}
            style={{
              ...outlineButtonStyle,
              width: '100%'
            }}
          >
            Learn More →
          </button>
        </div>

        {/* Cloud Infrastructure Card */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.blue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>☁️</div>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Cloud Infrastructure</h3>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Secure, scalable hosting on Google Cloud Platform
          </p>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.blue, marginBottom: '16px' }}>
            Starting at $2,000
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Architecture design',
              'Setup & configuration',
              'Security hardening',
              'Monitoring setup',
              'Training included'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.blue }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            + $300/mo managed services
          </div>
          <button
            onClick={() => setActiveTab('cloud')}
            style={{
              ...outlineButtonStyle,
              width: '100%'
            }}
          >
            Learn More →
          </button>
        </div>

        {/* App Development Card */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📱</div>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Web & Mobile Apps</h3>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Custom applications built for your business needs
          </p>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.green, marginBottom: '16px' }}>
            Starting at $5,000
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Custom design & development',
              'Responsive web or mobile',
              'Admin dashboard',
              'Cloud deployment',
              '60-day warranty'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            + $750/mo managed services
          </div>
          <button
            onClick={() => setActiveTab('apps')}
            style={{
              ...outlineButtonStyle,
              width: '100%'
            }}
          >
            Learn More →
          </button>
        </div>
      </div>

      {/* How We Work */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '32px', textAlign: 'center' }}>
          How We Work
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          {[
            { step: '1', title: 'Discovery', desc: 'Free 30-minute call to understand your needs' },
            { step: '2', title: 'Proposal', desc: 'Fixed-price quote within one week' },
            { step: '3', title: 'Build', desc: 'Agile development with weekly updates' },
            { step: '4', title: 'Launch & Support', desc: 'Deployment, training, and ongoing care' }
          ].map((item, idx) => (
            <div key={idx} style={cardStyle}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px'
              }}>
                {item.step}
              </div>
              <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ color: '#a0a0a0', fontSize: '13px' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why LeniLani / Why Google Cloud */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {/* Why LeniLani */}
        <div style={{
          ...cardStyle,
          background: 'rgba(52,168,83,0.05)',
          border: `1px solid rgba(52,168,83,0.2)`
        }}>
          <h3 style={{ color: colors.green, fontSize: '20px', marginBottom: '16px' }}>
            Why LeniLani
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Hawaii-based, we understand local business',
              '20+ years technology experience',
              'Google Cloud Certified Partner',
              'Fixed pricing — no surprises',
              'Direct access to founders, not account managers'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Why Google Cloud */}
        <div style={{
          ...cardStyle,
          background: 'rgba(66,133,244,0.05)',
          border: `1px solid rgba(66,133,244,0.2)`
        }}>
          <h3 style={{ color: colors.blue, fontSize: '20px', marginBottom: '16px' }}>
            Why Google Cloud
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Same infrastructure as Google & YouTube',
              'Leading AI capabilities',
              'Predictable, transparent pricing',
              'Enterprise-grade security',
              'Global network with low latency'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ color: colors.blue }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fractional CTO */}
      <div style={{
        ...cardStyle,
        background: `linear-gradient(135deg, rgba(251,188,4,0.1), rgba(147,52,230,0.1))`,
        marginBottom: '48px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
          Need ongoing strategic guidance?
        </h3>
        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.yellow, marginBottom: '8px' }}>
          Fractional CTO — $1,500/month
        </div>
        <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
          Executive-level technology leadership. Architecture decisions, vendor management, roadmap planning, team guidance.
        </p>
        <button
          onClick={() => setActiveTab('contact')}
          style={{
            ...outlineButtonStyle
          }}
        >
          Learn More →
        </button>
      </div>

      {/* Bottom CTA */}
      <div style={{
        ...cardStyle,
        textAlign: 'center',
        padding: '48px 32px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '16px' }}>
          Ready to get started?
        </h3>
        <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '32px' }}>
          Tell us about your project and we'll get back to you within 24 hours
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              ...{
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                color: '#fff',
                fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
                transition: 'all 0.2s'
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(66,133,244,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Get in Touch
          </button>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...outlineButtonStyle,
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Book a Call
          </a>
        </div>
      </div>
    </div>
  );
}

// AI Solutions Tab Component
function AITab({ setActiveTab }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  };

  const outlineButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s',
    width: '100%'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px'
    }}>
      {/* Main Content */}
      <div>
        {/* AI Chatbot Package */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            AI Chatbot Package
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.red, marginBottom: '8px' }}>
            Starting at $4,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Custom conversational AI trained on your business
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Discovery & planning',
              'Custom chatbot development',
              'Training on your documents (RAG)',
              'Website, Slack, or SMS integration',
              'Analytics dashboard',
              'Training & documentation',
              '30 days post-launch support'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.red }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 3-4 weeks
          </div>
          <button
            onClick={() => setActiveTab('contact')}
            style={outlineButtonStyle}
          >
            Get a Quote →
          </button>
        </div>

        {/* AI Automation Package */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            AI Automation Package
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.red, marginBottom: '8px' }}>
            Starting at $3,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Automate repetitive tasks with AI workflows
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Process audit',
              'Custom workflow development',
              'Integration with your tools',
              'Testing & optimization',
              'Documentation'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.red }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 2-3 weeks
          </div>
        </div>

        {/* Ongoing Management */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Ongoing Management
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.red, marginBottom: '8px' }}>
            $500 - $800/month
          </div>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Hosting & infrastructure',
              'Monitoring & uptime',
              'Monthly performance reports',
              'Minor updates & tweaks',
              'Email support (24hr response)',
              'Quarterly review call'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.red }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        {/* Ideal For */}
        <div style={{
          ...cardStyle,
          background: 'rgba(234,67,53,0.05)',
          border: `1px solid rgba(234,67,53,0.2)`
        }}>
          <h4 style={{ color: colors.red, fontSize: '16px', marginBottom: '12px' }}>
            Ideal For
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Businesses answering repetitive questions',
              'Teams spending hours on manual tasks',
              'Companies with lots of documentation',
              'Anyone needing 24/7 availability'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Wins */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Quick Wins
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Customer support automation',
              'Internal knowledge base Q&A',
              'Lead qualification',
              'Appointment scheduling',
              'Document Q&A'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          background: `linear-gradient(135deg, rgba(234,67,53,0.1), rgba(66,133,244,0.1))`
        }}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Ready to automate?
          </h4>
          <button
            onClick={() => setActiveTab('contact')}
            style={outlineButtonStyle}
          >
            Start a Project →
          </button>
        </div>
      </div>
    </div>
  );
}

// Cloud & Infrastructure Tab Component
function CloudTab({ setActiveTab }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  };

  const outlineButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s',
    width: '100%'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px'
    }}>
      {/* Main Content */}
      <div>
        {/* Cloud Setup */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Cloud Setup
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.blue, marginBottom: '8px' }}>
            Starting at $2,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Get running on Google Cloud the right way
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Architecture design',
              'GCP project setup',
              'Networking & security',
              'Database setup',
              'Basic CI/CD pipeline',
              'Monitoring & alerts',
              'Team walkthrough'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.blue }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 1-2 weeks
          </div>
        </div>

        {/* Cloud Migration */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Cloud Migration
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.blue, marginBottom: '8px' }}>
            Starting at $3,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Move from legacy hosting to modern cloud
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Current setup audit',
              'Migration planning',
              'Data migration',
              'DNS cutover',
              'Testing & validation',
              'Documentation'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.blue }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 2-4 weeks
          </div>
        </div>

        {/* Ongoing Management */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Ongoing Management
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.blue, marginBottom: '8px' }}>
            $300 - $500/month
          </div>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              '24/7 monitoring',
              'Security patching',
              'Daily backups',
              'Uptime guarantee',
              'Email support',
              'Monthly cost review'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.blue }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        {/* Common Projects */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Common Projects
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Website hosting',
              'API backends',
              'Database management',
              'Legacy migrations',
              'Multi-environment setups'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Fractional CTO */}
        <div style={{
          ...cardStyle,
          background: 'rgba(251,188,4,0.05)',
          border: `1px solid rgba(251,188,4,0.2)`
        }}>
          <h4 style={{ color: colors.yellow, fontSize: '16px', marginBottom: '8px' }}>
            Fractional CTO
          </h4>
          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.yellow, marginBottom: '8px' }}>
            $1,500 - $2,500/month
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '12px' }}>
            For businesses that need ongoing tech leadership
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Architecture decisions',
              'Vendor negotiations',
              'Security oversight',
              'Team mentoring'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          background: `linear-gradient(135deg, rgba(66,133,244,0.1), rgba(52,168,83,0.1))`
        }}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Let's talk infrastructure
          </h4>
          <button
            onClick={() => setActiveTab('contact')}
            style={outlineButtonStyle}
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

// App Development Tab Component
function AppsTab({ setActiveTab }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  };

  const outlineButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s',
    width: '100%'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px'
    }}>
      {/* Main Content */}
      <div>
        {/* MVP Package */}
        <div style={{
          ...cardStyle,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px 12px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.green}, ${colors.blue})`,
            color: '#fff',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Popular
          </div>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            MVP Package
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.green, marginBottom: '8px' }}>
            Starting at $5,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Validate your idea with a focused first version
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'Discovery workshop',
              'Core feature development',
              'Simple admin panel',
              'Cloud deployment',
              '30-day support'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '8px' }}>
            Timeline: 3-5 weeks
          </div>
          <p style={{ color: '#808080', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
            Perfect for testing before full investment
          </p>
          <button
            onClick={() => setActiveTab('contact')}
            style={outlineButtonStyle}
          >
            Get a Quote →
          </button>
        </div>

        {/* Web Application */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Web Application
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.green, marginBottom: '8px' }}>
            Starting at $8,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Custom web apps for your business
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'UX design',
              'React frontend',
              'Python backend',
              'Database setup',
              'User authentication',
              'Admin dashboard',
              'Cloud deployment',
              '60-day bug warranty'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 6-10 weeks
          </div>
        </div>

        {/* Mobile App */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Mobile App
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.green, marginBottom: '8px' }}>
            Starting at $12,000
          </div>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
            Cross-platform iOS & Android
          </p>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {[
              'UX design',
              'React Native development',
              'Backend API',
              'Push notifications',
              'App store submission',
              '60-day bug warranty'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <div style={{ color: '#707070', fontSize: '12px', marginBottom: '16px' }}>
            Timeline: 8-12 weeks
          </div>
        </div>

        {/* Ongoing Management */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            Ongoing Management
          </h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.green, marginBottom: '8px' }}>
            $750 - $1,000/month
          </div>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>What's Included</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Hosting & infrastructure',
              'Bug fixes & patches',
              'Security updates',
              'Performance monitoring',
              '4 hours feature work',
              'Monthly planning call'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: colors.green }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        {/* Our Tech Stack */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Our Tech Stack
          </h4>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Frontend:</div>
            <div style={{ color: '#e5e5e5', fontSize: '13px' }}>React, Tailwind CSS</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Mobile:</div>
            <div style={{ color: '#e5e5e5', fontSize: '13px' }}>React Native</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Backend:</div>
            <div style={{ color: '#e5e5e5', fontSize: '13px' }}>Python, FastAPI</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Database:</div>
            <div style={{ color: '#e5e5e5', fontSize: '13px' }}>PostgreSQL, Firestore</div>
          </div>
          <div>
            <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Cloud:</div>
            <div style={{ color: '#e5e5e5', fontSize: '13px' }}>Google Cloud Platform</div>
          </div>
        </div>

        {/* We Build */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            We Build
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Customer portals',
              'Internal tools',
              'Booking systems',
              'Inventory management',
              'Data dashboards',
              'E-commerce'
            ].map((item, idx) => (
              <li key={idx} style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          background: `linear-gradient(135deg, rgba(52,168,83,0.1), rgba(66,133,244,0.1))`
        }}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Have a project in mind?
          </h4>
          <button
            onClick={() => setActiveTab('contact')}
            style={outlineButtonStyle}
          >
            Tell Us About It →
          </button>
        </div>
      </div>
    </div>
  );
}

// Contact Tab Component
function ContactTab({ setActiveTab }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  };

  const outlineButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    transition: 'all 0.2s',
    width: '100%',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px'
    }}>
      {/* Main Content */}
      <div>
        <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '12px' }}>
          Let's Build Something Together
        </h2>
        <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '32px' }}>
          Tell us about your project and we'll get back to you within 24 hours.
        </p>

        {/* HubSpot Form Container */}
        <div
          id="hubspot-form"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '40px',
            minHeight: '400px'
          }}
        />
      </div>

      {/* Sidebar */}
      <div>
        {/* Other Ways to Reach Us */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Other Ways to Reach Us
          </h4>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Book a Call
            </div>
            <p style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '8px' }}>
              Schedule a free 30-minute consultation
            </p>
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={outlineButtonStyle}
            >
              Book Now →
            </a>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Email
            </div>
            <a
              href="mailto:hello@lenilani.com"
              style={{ color: colors.blue, fontSize: '13px', textDecoration: 'none' }}
            >
              hello@lenilani.com
            </a>
          </div>

          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Location
            </div>
            <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5' }}>
              1050 Queen Street, Suite 100<br />
              Honolulu, HI 96814
            </p>
          </div>
        </div>

        {/* What Happens Next */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            What Happens Next
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', text: 'We review your submission' },
              { step: '2', text: 'We reach out within 24 hours' },
              { step: '3', text: 'Free discovery call to discuss your needs' },
              { step: '4', text: 'You receive a detailed proposal' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {item.step}
                </div>
                <p style={{ color: '#a0a0a0', fontSize: '13px', margin: 0 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={cardStyle}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.blue,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
                padding: '4px 0'
              }}
            >
              AI Solutions →
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.blue,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
                padding: '4px 0'
              }}
            >
              Cloud & Infrastructure →
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.blue,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
                padding: '4px 0'
              }}
            >
              App Development →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
