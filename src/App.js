import React, { useState, useEffect } from 'react';

// Custom SVG Icons
const AIIcon = ({ size = 64, color = '#ea4335' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#ff6d00" />
      </linearGradient>
    </defs>
    {/* Neural network nodes */}
    <circle cx="12" cy="20" r="4" fill="url(#aiGradient)" opacity="0.8" />
    <circle cx="12" cy="32" r="4" fill="url(#aiGradient)" opacity="0.8" />
    <circle cx="12" cy="44" r="4" fill="url(#aiGradient)" opacity="0.8" />
    <circle cx="32" cy="16" r="5" fill="url(#aiGradient)" />
    <circle cx="32" cy="32" r="5" fill="url(#aiGradient)" />
    <circle cx="32" cy="48" r="5" fill="url(#aiGradient)" />
    <circle cx="52" cy="32" r="6" fill="url(#aiGradient)" />
    {/* Connection lines */}
    <path d="M16 20 L27 16 M16 20 L27 32 M16 32 L27 16 M16 32 L27 32 M16 32 L27 48 M16 44 L27 32 M16 44 L27 48"
          stroke={color} strokeWidth="1.5" opacity="0.4" />
    <path d="M37 16 L46 32 M37 32 L46 32 M37 48 L46 32"
          stroke={color} strokeWidth="2" opacity="0.6" />
    {/* Pulse animation circles */}
    <circle cx="52" cy="32" r="10" stroke={color} strokeWidth="1" fill="none" opacity="0.3">
      <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const CloudIcon = ({ size = 64, color = '#4285f4' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#34a853" />
      </linearGradient>
    </defs>
    {/* Cloud shape */}
    <path d="M48 36c4.4 0 8-3.6 8-8s-3.6-8-8-8c-0.4-6.6-5.8-12-12.4-12-5.2 0-9.6 3.2-11.6 7.6C22.8 14.4 21 14 19 14c-5.5 0-10 4.5-10 10 0 0.4 0 0.8 0.1 1.2C6.1 26.4 4 29.4 4 33c0 5 4 9 9 9h35z"
          fill="url(#cloudGradient)" opacity="0.9" />
    {/* Server rack inside */}
    <rect x="20" y="42" width="24" height="16" rx="2" fill="#1a1a1a" stroke={color} strokeWidth="1" />
    <rect x="23" y="45" width="18" height="3" rx="1" fill={color} opacity="0.6" />
    <rect x="23" y="50" width="18" height="3" rx="1" fill={color} opacity="0.4" />
    <rect x="23" y="55" width="18" height="2" rx="1" fill={color} opacity="0.2" />
    {/* Status lights */}
    <circle cx="38" cy="46.5" r="1" fill="#34a853">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="38" cy="51.5" r="1" fill="#fbbc04">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Upload/download arrows */}
    <path d="M16 38 L16 28 M13 31 L16 28 L19 31" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
    </path>
    <path d="M48 38 L48 28 M45 35 L48 38 L51 35" stroke="#34a853" strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
    </path>
  </svg>
);

const AppsIcon = ({ size = 64, color = '#34a853' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="appsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#4285f4" />
      </linearGradient>
    </defs>
    {/* Phone frame */}
    <rect x="18" y="4" width="28" height="56" rx="4" fill="#1a1a1a" stroke="url(#appsGradient)" strokeWidth="2" />
    {/* Screen */}
    <rect x="21" y="10" width="22" height="40" rx="1" fill="#0a0a0a" />
    {/* App grid */}
    <rect x="24" y="14" width="6" height="6" rx="1.5" fill={color} opacity="0.8" />
    <rect x="33" y="14" width="6" height="6" rx="1.5" fill="#4285f4" opacity="0.8" />
    <rect x="24" y="23" width="6" height="6" rx="1.5" fill="#fbbc04" opacity="0.8" />
    <rect x="33" y="23" width="6" height="6" rx="1.5" fill="#ea4335" opacity="0.8" />
    {/* Content lines */}
    <rect x="24" y="33" width="15" height="2" rx="1" fill="#404040" />
    <rect x="24" y="38" width="12" height="2" rx="1" fill="#303030" />
    <rect x="24" y="43" width="14" height="2" rx="1" fill="#303030" />
    {/* Home button/notch */}
    <rect x="28" y="6" width="8" height="2" rx="1" fill="#303030" />
    <circle cx="32" cy="54" r="3" stroke="#404040" strokeWidth="1" fill="none" />
    {/* Floating code brackets */}
    <text x="8" y="32" fontSize="14" fill={color} fontFamily="monospace" opacity="0.6">&lt;/&gt;</text>
    <text x="48" y="40" fontSize="10" fill="#4285f4" fontFamily="monospace" opacity="0.5">{`{ }`}</text>
  </svg>
);

// Hero Illustration - Abstract tech/network visualization
const HeroIllustration = () => (
  <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
    <defs>
      <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285f4" />
        <stop offset="50%" stopColor="#34a853" />
        <stop offset="100%" stopColor="#fbbc04" />
      </linearGradient>
      <linearGradient id="heroGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ea4335" />
        <stop offset="100%" stopColor="#9334e6" />
      </linearGradient>
    </defs>
    {/* Network nodes */}
    <circle cx="100" cy="50" r="8" fill="url(#heroGrad1)">
      <animate attributeName="cy" values="50;60;50" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="200" cy="120" r="6" fill="url(#heroGrad2)">
      <animate attributeName="cy" values="120;110;120" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="350" cy="80" r="10" fill="url(#heroGrad1)">
      <animate attributeName="cy" values="80;90;80" dur="5s" repeatCount="indefinite" />
    </circle>
    <circle cx="500" cy="140" r="7" fill="url(#heroGrad2)">
      <animate attributeName="cy" values="140;130;140" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="650" cy="60" r="9" fill="url(#heroGrad1)">
      <animate attributeName="cy" values="60;70;60" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="750" cy="100" r="5" fill="url(#heroGrad2)">
      <animate attributeName="cy" values="100;90;100" dur="4.5s" repeatCount="indefinite" />
    </circle>
    {/* Connection lines */}
    <path d="M100 50 Q150 90 200 120 T350 80 T500 140 T650 60 T750 100"
          stroke="url(#heroGrad1)" strokeWidth="1" fill="none" opacity="0.5">
      <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="10s" repeatCount="indefinite" />
    </path>
    {/* Floating shapes */}
    <rect x="280" y="150" width="20" height="20" rx="4" fill="url(#heroGrad1)" opacity="0.3" transform="rotate(45 290 160)">
      <animate attributeName="y" values="150;140;150" dur="6s" repeatCount="indefinite" />
    </rect>
    <polygon points="600,170 610,150 620,170" fill="url(#heroGrad2)" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

// Process Flow Connector
const ProcessConnector = () => (
  <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', zIndex: 0 }}>
    <defs>
      <linearGradient id="connectorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4285f4" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#34a853" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fbbc04" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    <line x1="0" y1="12" x2="100" y2="12" stroke="url(#connectorGrad)" strokeWidth="2" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
    </line>
  </svg>
);

// Product showcase image component - replace src with your generated images
const ProductShowcase = ({
  imageSrc = null,
  alt = "Product screenshot",
  caption = null,
  aspectRatio = "16/9"
}) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {imageSrc ? (
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          aspectRatio: aspectRatio,
          objectFit: 'cover'
        }}
      />
    ) : (
      <div style={{
        aspectRatio: aspectRatio,
        background: 'linear-gradient(135deg, rgba(66,133,244,0.1), rgba(52,168,83,0.1))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#606060',
        fontSize: '14px',
        gap: '12px'
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="40" height="28" rx="2" stroke="#404040" strokeWidth="2" fill="none" />
          <circle cx="16" cy="20" r="4" stroke="#404040" strokeWidth="2" fill="none" />
          <path d="M4 30 L14 22 L22 28 L32 18 L44 28" stroke="#404040" strokeWidth="2" fill="none" />
          <rect x="14" y="38" width="20" height="4" rx="1" fill="#303030" />
        </svg>
        <span>Product Screenshot</span>
      </div>
    )}
    {caption && (
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#a0a0a0',
        fontSize: '13px'
      }}>
        {caption}
      </div>
    )}
  </div>
);

// Decorative floating particles component
const FloatingParticles = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9334e6', '#00bcd4'][i],
          left: `${15 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
          opacity: 0.4,
          animation: `float${i % 3} ${3 + i * 0.5}s ease-in-out infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes float0 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      @keyframes float1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
      @keyframes float2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    `}</style>
  </div>
);

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
        padding: '64px 48px',
        background: `linear-gradient(135deg, rgba(66,133,244,0.1), rgba(52,168,83,0.1))`,
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/images/abstract.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          pointerEvents: 'none'
        }} />
        <FloatingParticles />

        {/* Hero content grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Left side - Text */}
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              Transform Your Business with AI & Cloud
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#808080',
              marginBottom: '32px'
            }}>
              Hawaii's technology consulting partner. We design, build, and manage AI and cloud solutions so you can focus on running your business.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
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
              gap: '24px',
              color: '#a0a0a0',
              fontSize: '13px'
            }}>
              <div>✓ Google Cloud Partner</div>
              <div>✓ 20+ Years Experience</div>
              <div>✓ Hawaii-Based</div>
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/images/multi-device-app.png"
              alt="Multi-device application dashboard"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
            />
          </div>
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
          <div style={{ marginBottom: '16px' }}><AIIcon size={56} /></div>
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
          <div style={{ marginBottom: '16px' }}><CloudIcon size={56} /></div>
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
          <div style={{ marginBottom: '16px' }}><AppsIcon size={56} /></div>
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

      {/* Product Showcase Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>
          What We Build
        </h2>
        <p style={{ color: '#707070', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
          Real solutions for real businesses
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px'
        }}>
          <ProductShowcase
            imageSrc="/images/ai-dashboard.png"
            alt="AI Chatbot Dashboard"
            caption="AI-powered customer support dashboard"
          />
          <ProductShowcase
            imageSrc="/images/cloud-monitoring.png"
            alt="Cloud Infrastructure Monitoring"
            caption="Real-time cloud infrastructure monitoring"
          />
          <ProductShowcase
            imageSrc="/images/mobile-app.png"
            alt="Mobile Application"
            caption="Cross-platform mobile application"
          />
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
          gap: '24px',
          position: 'relative'
        }}>
          {/* Process connector line */}
          <ProcessConnector />
          {[
            { step: '1', title: 'Discovery', desc: 'Free 30-minute call to understand your needs', icon: '💬' },
            { step: '2', title: 'Proposal', desc: 'Fixed-price quote within one week', icon: '📋' },
            { step: '3', title: 'Build', desc: 'Agile development with weekly updates', icon: '⚡' },
            { step: '4', title: 'Launch & Support', desc: 'Deployment, training, and ongoing care', icon: '🚀' }
          ].map((item, idx) => (
            <div key={idx} style={{
              ...cardStyle,
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(66,133,244,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(66,133,244,0.3)'
              }}>
                {item.icon}
              </div>
              <div style={{
                color: colors.blue,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '1px'
              }}>
                STEP {item.step}
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
          border: `1px solid rgba(52,168,83,0.2)`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `linear-gradient(135deg, transparent 50%, rgba(52,168,83,0.1) 50%)`,
            pointerEvents: 'none'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#34a853" strokeWidth="2" fill="none" />
              <path d="M10 16 L14 20 L22 12" stroke="#34a853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 style={{ color: colors.green, fontSize: '20px', margin: 0 }}>
              Why LeniLani
            </h3>
          </div>
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
          border: `1px solid rgba(66,133,244,0.2)`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `linear-gradient(135deg, transparent 50%, rgba(66,133,244,0.1) 50%)`,
            pointerEvents: 'none'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {/* Google Cloud logo simplified */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 6 L26 12 L26 20 L16 26 L6 20 L6 12 Z" stroke="#4285f4" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="4" fill="#4285f4" opacity="0.6" />
            </svg>
            <h3 style={{ color: colors.blue, fontSize: '20px', margin: 0 }}>
              Why Google Cloud
            </h3>
          </div>
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
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Decorative element */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '2px solid rgba(251,188,4,0.2)',
          pointerEvents: 'none'
        }} />
        <div>
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
              ...outlineButtonStyle,
              width: 'auto'
            }}
          >
            Learn More →
          </button>
        </div>
        {/* CTO Icon */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="ctoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbc04" />
                <stop offset="100%" stopColor="#9334e6" />
              </linearGradient>
            </defs>
            {/* Strategy/leadership icon */}
            <circle cx="50" cy="50" r="40" stroke="url(#ctoGrad)" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="50" cy="50" r="30" stroke="url(#ctoGrad)" strokeWidth="2" fill="none" opacity="0.3" />
            {/* Crown/leadership symbol */}
            <path d="M35 55 L40 40 L50 50 L60 40 L65 55 L35 55" fill="url(#ctoGrad)" opacity="0.8" />
            {/* Network nodes */}
            <circle cx="50" cy="30" r="4" fill="#fbbc04" />
            <circle cx="30" cy="50" r="3" fill="#9334e6" />
            <circle cx="70" cy="50" r="3" fill="#9334e6" />
            <circle cx="50" cy="70" r="3" fill="#fbbc04" />
            {/* Connection lines */}
            <path d="M50 34 L50 46 M34 50 L46 50 M54 50 L66 50 M50 54 L50 66" stroke="url(#ctoGrad)" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
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
