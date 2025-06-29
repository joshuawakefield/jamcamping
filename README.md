# 🎪 JamCamping - Digital Shakedown Street for Festival DIY

> The ultimate digital Shakedown Street for festival DIY projects. Swipe through legendary builds, cosmic knowledge, and festival magic. Make your campsite legendary.

## 🌈 What is JamCamping?

JamCamping is a curated collection of DIY festival projects designed for music festival goers, vanlifers, and outdoor dreamers who want to create legendary campsites. Built with festival culture at its core, featuring:

- **🎸 Festival-Ready Builds** - Curated projects for heads who want to stand out
- **📱 Mobile-First Magic** - Swipeable stages optimized for thumb navigation
- **💰 Smart Shopping** - GA and VIP builds with instant affiliate links
- **✨ Psychedelic Spirit** - Zero generic advice, pure festival vibes
- **🎵 Cultural Easter Eggs** - Lyrical references from Dead, Phish, and more

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Production Deployment

```bash
# Build and deploy to Netlify
npm run deploy

# Or build only
npm run build
```

## 🏗️ Project Structure

```
jamcamping/
├── src/                    # Source files
│   ├── index.html         # Main HTML template
│   ├── css/               # Stylesheets
│   │   └── style.css      # Main CSS file
│   ├── js/                # JavaScript modules
│   │   └── main.js        # Main application logic
│   └── data/              # JSON data files
│       ├── projects.json  # Project data
│       └── shop.json      # Shop items data
├── public/                # Static assets
│   ├── images/            # Images and graphics
│   ├── fonts/             # Web fonts
│   ├── icons/             # App icons and favicons
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── robots.txt         # SEO robots file
├── dist/                  # Build output (generated)
├── scripts/               # Build and utility scripts
│   └── build-seo.js       # SEO page generation
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🎨 Features

### Core Functionality
- **Swipeable Stage Navigation** - Gesture-based navigation between sections
- **Project Browser** - Grid of DIY festival projects with filtering
- **Shop Integration** - Digital and print products with affiliate links
- **Search & Discovery** - Smart search with fuzzy matching
- **Cart System** - Local storage-based shopping cart
- **Responsive Design** - Mobile-first, works on all devices

### Technical Features
- **Progressive Web App (PWA)** - Installable, offline-capable
- **Service Worker** - Caching and offline functionality
- **SEO Optimized** - Dynamic meta tags, structured data, sitemap
- **Performance Optimized** - Lazy loading, code splitting, optimized assets
- **Accessibility** - WCAG 2.1 AA compliant, keyboard navigation
- **Dark/Light Theme** - User preference with system detection

### Festival Culture
- **Lyrical Easter Eggs** - References to Grateful Dead, Phish, and more
- **Festival Greetings** - Time-based welcome messages
- **Inspiration System** - Random motivational quotes and lyrics
- **Community Feel** - Language and design that speaks to festival family

## 🛠️ Development

### Tech Stack
- **Build Tool**: Vite 5.x
- **Styling**: CSS Custom Properties (CSS Variables)
- **JavaScript**: Vanilla ES6+ (no framework dependencies)
- **PWA**: Service Worker with Workbox
- **Deployment**: Netlify (configured)

### Key Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with SEO generation
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to Netlify
- `npm run clean` - Clean build directory
- `npm run lint` - Lint JavaScript files
- `npm run format` - Format code with Prettier

### Environment Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Open `http://localhost:3000` in your browser

### Adding New Projects
1. Edit `src/data/projects.json`
2. Follow the existing project structure
3. Include both `functionalParts` and `extravagantParts`
4. Add appropriate `lyricEasterEgg` for festival flavor
5. Build will automatically generate SEO pages

### Adding Shop Items
1. Edit `src/data/shop.json`
2. Include cover image URL (preferably from Pexels)
3. Set up digital, bundle, and print pricing
4. Include affiliate/purchase URLs

## 🎯 How It Works

### The "Digital Shakedown Street" Experience

JamCamping uses a unique **"Swipeable Festival Stages"** navigation system that mimics walking through different areas of a music festival:

#### 🎪 Main Stage (Projects)
- **Hero Project**: Featured build with prominent pricing and CTAs
- **Project Grid**: Filterable cards showing all DIY projects
- **Quick Actions**: "Surprise Me", "Random Build", and "Get Inspired" buttons
- **Smart Filtering**: Category and difficulty filters with instant results

#### 📚 Vendor Row (Shop)
- **Cosmic Knowledge**: Digital guides and books
- **Bundle Deals**: Multi-format packages with savings
- **Print Editions**: Physical books via print-on-demand
- **Instant Purchase**: Direct affiliate links to payment processors

#### 🌀 Chill Zone (About)
- **Community Story**: Mission and values
- **Feature Highlights**: What makes JamCamping special
- **Festival Culture**: Deep connection to jam band community

#### ✨ Submit Tent (Community)
- **Project Submission**: Form for community contributions
- **Validation**: Client-side form validation with festival flair
- **Email Integration**: Direct submission to site maintainers

#### 📧 Info Booth (Contact)
- **Contact Information**: Email and social media links
- **Creator Story**: About Josh Wakefield and the project origins
- **Community Connection**: Ways to get involved

### Navigation System

#### Swipe Gestures (Mobile)
```javascript
// Touch-based navigation between stages
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

// Smooth transitions with rubber-band effects at boundaries
function updateStagePosition(offset) {
  const dampening = isAtBoundary ? 0.3 : 1;
  container.style.transform = `translateX(${offset * dampening}px)`;
}
```

#### Keyboard Navigation
- **Arrow Keys**: Navigate between stages
- **Number Keys (1-5)**: Jump directly to specific stages
- **Tab Navigation**: Accessible keyboard navigation
- **Escape**: Close modals and overlays

#### Stage Indicators
- **Visual Dots**: Show current position and allow direct navigation
- **Progress Tracking**: Visual feedback for user location
- **Responsive Labels**: Show stage names on larger screens

### Project System

#### Data Structure
```json
{
  "id": 1,
  "title": "Monkey Hut Shade Palace",
  "description": "Build the ultimate festival shade structure...",
  "category": "shade",
  "difficulty": "intermediate",
  "image": "🏛️",
  "functionalParts": [...],  // GA build components
  "extravagantParts": [...], // VIP build components
  "lyricEasterEgg": "Under the shade of a monkey hut...",
  "instructions": "Step-by-step build guide..."
}
```

#### Dynamic Pricing
- **Functional Build (GA)**: Budget-friendly component list
- **Extravagant Build (VIP)**: Premium components with extras
- **Real-time Totals**: Calculated from individual part prices
- **Affiliate Integration**: Direct links to purchase components

#### Modal System
- **Detailed View**: Full project information with parts lists
- **Add to Cart**: Both GA and VIP options available
- **Instructions**: Step-by-step building guidance
- **Cultural Elements**: Lyrical easter eggs and festival spirit

### Shopping Experience

#### Cart Management
```javascript
// Local storage-based cart system
const cartItem = {
  id: `${projectId}-${buildType}`,
  projectId,
  buildType: 'functional' | 'extravagant',
  title: project.title,
  emoji: project.image,
  total: calculatedTotal,
  parts: selectedParts
};

localStorage.setItem('jamcamping-cart', JSON.stringify(cart));
```

#### Conversion Optimization
- **Exit Intent**: Modals to prevent cart abandonment
- **Social Proof**: "Someone just bought..." notifications
- **Urgency Elements**: Limited-time offers and seasonal messaging
- **A/B Testing**: Built-in framework for testing variations

### SEO & Performance

#### Static Site Generation
```javascript
// Build-time SEO page generation
class SEOBuilder {
  generateProjectPages() {
    projects.forEach(project => {
      this.createStaticPage(`/projects/${project.id}`, {
        title: `${project.title} - DIY Festival Project`,
        description: project.description,
        structuredData: this.generateHowToSchema(project)
      });
    });
  }
}
```

#### Performance Features
- **Lazy Loading**: Images and components load on demand
- **Service Worker**: Offline caching and background sync
- **Code Splitting**: JavaScript modules loaded as needed
- **Image Optimization**: WebP format with fallbacks
- **Critical CSS**: Above-the-fold styles inlined

#### SEO Optimization
- **Dynamic Meta Tags**: Updated based on current content
- **Structured Data**: JSON-LD for projects (HowTo) and products
- **Sitemap Generation**: Automatic XML sitemap creation
- **Canonical URLs**: Proper URL canonicalization
- **Open Graph**: Social media sharing optimization

### Festival Culture Integration

#### Lyrical Easter Eggs
```javascript
const lyrics = {
  grateful_dead: [
    "Once in a while you get shown the light...",
    "What a long, strange trip it's been",
    "Keep on truckin'"
  ],
  phish: [
    "You enjoy myself",
    "The connection is complete"
  ]
};

// Contextual lyric display based on user actions
showLyric(category, trigger);
```

#### Time-Based Greetings
- **Morning**: "Good morning, sunshine! ☀️"
- **Afternoon**: "Afternoon delight! 🌞"
- **Evening**: "Evening, beautiful souls! 🌙"
- **Late Night**: "Burning the midnight oil? 🔥"

#### Community Language
- **Festival Family**: Inclusive, welcoming tone
- **Heads & Deadheads**: Authentic jam band terminology
- **Cosmic & Psychedelic**: Spiritual, creative language
- **Legendary Builds**: Aspirational project framing

## 🎯 SEO & Performance

### SEO Features
- **Dynamic Meta Tags** - Updates based on current content
- **Structured Data** - JSON-LD for projects (HowTo) and products
- **Sitemap Generation** - Automatic XML sitemap creation
- **Canonical URLs** - Proper URL canonicalization
- **Open Graph** - Social media sharing optimization

### Performance Optimizations
- **Code Splitting** - Lazy loading of non-critical features
- **Image Optimization** - Lazy loading with intersection observer
- **Caching Strategy** - Service worker with cache-first approach
- **Bundle Analysis** - Vite bundle analyzer for optimization
- **Core Web Vitals** - Optimized for Google's performance metrics

## 🌈 Contributing

We welcome contributions from the festival family! Here's how to get involved:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the existing code style
4. **Test thoroughly** on mobile and desktop
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Contribution Guidelines
- Maintain the festival culture and tone
- Ensure mobile-first responsive design
- Follow accessibility best practices
- Include appropriate tests for new features
- Update documentation as needed

## 📧 Contact & Support

- **Email**: [jamcampinghq@gmail.com](mailto:jamcampinghq@gmail.com)
- **Twitter**: [@JamCampingHQ](https://twitter.com/JamCampingHQ)
- **Issues**: [GitHub Issues](https://github.com/joshuawakefield/jamcamping/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Content Note**: All original written content, project curation, and descriptions are © 2025 Joshua Wakefield / JamCamping.com. Code is MIT licensed, content requires permission for reuse.

## 🎵 About the Creator

JamCamping is built by Josh Wakefield—electrical engineer, improvisational guitarist, sacred geometry artist, festival explorer, and serial experimenter. Born from two decades of jam band culture, deep DIY, and an obsession with helping people make their campsite an experience, not just a place to sleep.

---

*"Once in a while you get shown the light, in the strangest of places if you look at it right..."*

**Keep on truckin'!** 🎪✨