# 🎪 JamCamping - Digital Shakedown Street

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