# LeniLani Consulting - Landing Page

Production-ready React landing page for LeniLani Consulting, a Google Cloud Partner offering AI & Cloud solutions in Hawaii.

**Live Site:** https://gcp-landing.lenilani.com

## Overview

This is a modern, mobile-responsive landing page showcasing LeniLani Consulting's services including AI solutions, cloud infrastructure, and app development. Built with React and deployed on Firebase Hosting.

## Features

- **5 Tabbed Sections:**
  - Overview - Hero, service packages, process, and CTAs
  - AI Solutions - Custom chatbots and automation packages
  - Cloud & Infrastructure - GCP setup, migration, and management
  - App Development - MVP, web, and mobile app packages
  - Contact - HubSpot form integration

- **Integrations:**
  - Google Analytics (GA4)
  - HubSpot Forms for lead capture
  - Calendly for booking calls

- **Design:**
  - Dark theme with Google Cloud brand colors
  - Monospace font (SF Mono, JetBrains Mono, Fira Code)
  - Fully mobile-responsive
  - Custom favicon with gradient branding
  - Custom SVG icons with animations (AI neural network, cloud infrastructure, mobile apps)
  - Product showcase with AI-generated mockup images
  - Hero section with split layout and circuit board background
  - Animated floating particles and process flow connectors

## Tech Stack

- **Frontend:** React 18
- **Build Tool:** Create React App (react-scripts)
- **Hosting:** Firebase Hosting
- **DNS:** Vercel DNS
- **Styling:** Inline styles with mobile-first responsive CSS

## Project Structure

```
lenilani/
├── public/
│   ├── index.html          # HTML template with GA4, mobile CSS
│   ├── favicon.svg         # Custom LeniLani branded favicon
│   └── images/             # Product mockup images
│       ├── ai-dashboard.png
│       ├── cloud-monitoring.png
│       ├── mobile-app.png
│       ├── multi-device-app.png
│       └── abstract.png
├── src/
│   ├── App.js              # Main application component (includes SVG icons)
│   └── index.js            # React entry point
├── firebase.json           # Firebase Hosting configuration
├── .firebaserc             # Firebase project settings
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/lenilani-landing.git
cd lenilani-landing
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploy to Firebase

1. Login to Firebase (if not already logged in):
```bash
firebase login
```

2. Deploy to hosting:
```bash
firebase deploy --only hosting
```

The site will be deployed to:
- Default: https://lenilani-gcp-landing.web.app
- Custom: https://gcp-landing.lenilani.com

## Configuration

### Google Analytics

GA4 Measurement ID is configured in `public/index.html`:
```javascript
gtag('config', 'G-328702746');
```

### HubSpot Form

HubSpot form integration is in `src/App.js`:
- Portal ID: 242173134
- Form ID: 1c48848d-0063-4ba5-ac12-b1e7c5933c3f

### Calendly

Booking link in `src/App.js`:
```javascript
const CALENDAR_URL = 'https://calendly.com/rprovine-kointyme/30min?month=2025-10';
```

## Custom Domain Setup

The site uses `gcp-landing.lenilani.com` as the custom domain.

### DNS Configuration (Vercel)

CNAME record pointing to Firebase:
```
Type: CNAME
Name: gcp-landing
Value: lenilani-gcp-landing.web.app
```

### Firebase Hosting

Custom domain configured in Firebase Console with automatic SSL provisioning via Let's Encrypt.

## Pricing & Services

Current pricing structure:

- **AI Chatbot Package:** Starting at $4,000 + $500/mo managed services
- **Cloud Infrastructure:** Starting at $2,000 + $300/mo managed services
- **Web & Mobile Apps:** Starting at $5,000 + $750/mo managed services
- **Fractional CTO:** $1,500/month

## Mobile Responsiveness

The site includes comprehensive mobile CSS (in `public/index.html`) that:
- Collapses multi-column grids to single column on mobile
- Reduces padding and font sizes appropriately
- Makes navigation tabs horizontally scrollable
- Prevents horizontal page scrolling
- Stacks header and footer elements vertically

Breakpoint: 768px (tablet and below)

## Key Files

### `src/App.js`
Main React component containing all tab content, navigation, HubSpot integration, and styling.

### `public/index.html`
HTML template with:
- SEO meta tags
- Google Analytics script
- Mobile responsive CSS
- Favicon link

### `firebase.json`
Firebase Hosting configuration with SPA rewrites to support client-side routing.

## Visual Assets

### Product Mockup Images

The `/public/images/` folder contains AI-generated product mockups:

- **ai-dashboard.png** - AI chatbot analytics dashboard on laptop
- **cloud-monitoring.png** - Cloud infrastructure monitoring dashboard
- **mobile-app.png** - Mobile app on iPhone mockup
- **multi-device-app.png** - Multi-device responsive app (hero image)
- **abstract.png** - Circuit board tech pattern (hero background)

### Custom SVG Icons

Animated SVG icons are defined in `src/App.js`:

- **AIIcon** - Neural network visualization with pulse animation
- **CloudIcon** - Cloud with server rack and blinking status lights
- **AppsIcon** - Phone mockup with app grid and code brackets
- **HeroIllustration** - Floating network nodes (replaced by abstract.png)
- **ProcessConnector** - Animated dashed line connecting process steps
- **FloatingParticles** - Colored dots with floating animation

### Replacing Images

To update product mockups:
1. Generate new images matching the dark theme (#0a0a0a background)
2. Use Google Cloud colors: blue (#4285f4), green (#34a853), yellow (#fbbc04), red (#ea4335)
3. Save to `/public/images/` with same filenames
4. Rebuild and deploy

## Development Notes

### HubSpot Form Styling

The HubSpot form uses default light theme styling. The form container has a white background to ensure labels are readable against the dark page theme.

### Color Palette

Based on Google Cloud brand colors:
- Blue: #4285f4
- Green: #34a853
- Yellow: #fbbc04
- Red: #ea4335
- Background: #0a0a0a (near black)

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private - All rights reserved by LeniLani Consulting

## Contact

- Website: https://www.lenilani.com
- Email: hello@lenilani.com
- Location: 1050 Queen Street, Suite 100, Honolulu, HI 96814

## Maintenance

### Updating Content

1. Edit service descriptions and pricing in `src/App.js`
2. Rebuild: `npm run build`
3. Deploy: `firebase deploy --only hosting`

### Analytics

Monitor site traffic in Google Analytics:
- Property ID: G-328702746
- Dashboard: https://analytics.google.com/

### Form Submissions

Lead submissions are captured in HubSpot:
- Portal: 242173134
- Access at: https://app.hubspot.com/

---

Built with React • Deployed on Firebase • Google Cloud Partner
