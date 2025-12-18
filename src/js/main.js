/**
 * ===== JAMCAMPING MAIN APPLICATION =====
 * 
 * This is the core JavaScript file that powers the JamCamping festival DIY website.
 * It implements a single-page application (SPA) with swipeable "stage" navigation,
 * project browsing, shopping cart functionality, and festival-themed interactions.
 * 
 * ARCHITECTURE OVERVIEW:
 * - Class-based structure for maintainability and organization
 * - Event-driven architecture for loose coupling between components
 * - Local storage for cart persistence across sessions
 * - Progressive enhancement for accessibility and performance
 * - Festival culture integration throughout the user experience
 * 
 * MAIN FEATURES:
 * - Swipeable stage navigation (mimics walking through festival areas)
 * - Dynamic project loading and filtering
 * - Shopping cart with local persistence
 * - Search functionality with fuzzy matching
 * - Responsive design with touch gesture support
 * - Festival-themed easter eggs and cultural references
 * 
 * TARGET AUDIENCE:
 * - Music festival attendees (Grateful Dead, Phish, Burning Man, etc.)
 * - DIY enthusiasts and makers
 * - Mobile-first users (80%+ of traffic expected on phones)
 * 
 * @author Josh Wakefield
 * @version 1.0.0
 * @since 2025
 */
import '../css/style.css';
/**
 * Main Application Class
 * 
 * This class orchestrates all the functionality of the JamCamping site.
 * It follows the singleton pattern - only one instance should exist.
 * 
 * RESPONSIBILITIES:
 * - Initialize all subsystems and event listeners
 * - Manage application state (current stage, cart contents, theme)
 * - Coordinate between different components
 * - Handle data loading from JSON files
 * - Provide public API for other components to use
 */
class JamCampingApp {
    /**
     * Constructor - Initialize the application
     * 
     * Sets up initial state and calls the main initialization method.
     * All properties are initialized here to make the class structure clear.
     */
    constructor() {
        // ===== DATA STORAGE =====
        // These arrays hold the core content loaded from JSON files
        this.projects = [];      // DIY project data from projects.json
        this.shopItems = [];     // Shop product data from shop.json
        
        // ===== NAVIGATION STATE =====
        // Track which "stage" (section) the user is currently viewing
        this.currentStage = 0;   // 0=Main, 1=Shop, 2=About, 3=Submit, 4=Contact
        this.stages = ['main', 'vendor', 'chill', 'submit', 'contact']; // Stage names for URL routing
        
        // ===== USER PREFERENCES =====
        // Cart contents persisted in localStorage for session continuity
        this.cart = JSON.parse(localStorage.getItem('jamcamping-cart') || '[]');
        
        // Theme preference (light/dark mode) with fallback to light
        this.theme = localStorage.getItem('jamcamping-theme') || 'light';
        
        // Start the application initialization process
        this.init();
    }

    /**
     * Main Initialization Method
     * 
     * This is the entry point that sets up the entire application.
     * Order matters here - data must be loaded before UI setup.
     * 
     * INITIALIZATION SEQUENCE:
     * 1. Load data from JSON files (projects and shop items)
     * 2. Set up all event listeners for user interactions
     * 3. Apply saved theme preference
     * 4. Render dynamic content (projects and shop items)
     * 5. Update cart display with any saved items
     * 6. Show welcome greeting to establish festival vibe
     * 7. Initialize stage navigation system
     */
    async init() {
        try {
            // Load data first - everything else depends on this
            await this.loadData();
            
            // Set up all user interaction handlers
            this.setupEventListeners();
            
            // Apply visual theme (light/dark mode)
            this.applyTheme();
            
            // Generate dynamic content from loaded data
            this.renderProjects();
            this.renderShopItems();
            
            // Restore cart state from previous session
            this.updateCartBadge();
            
            // Show personalized greeting to establish community feeling
            this.showFestivalGreeting();
            
            // Initialize the stage navigation system
            this.setupStageNavigation();
            
        } catch (error) {
            // If anything fails during initialization, show user-friendly error
            console.error('Failed to initialize JamCamping:', error);
            this.showErrorMessage('Failed to load the magic. Please refresh and try again.');
        }
    }

    /**
     * Data Loading Method
     * 
     * Loads project and shop data from JSON files using the Fetch API.
     * Uses Promise.all for parallel loading to improve performance.
     * Includes error handling with graceful fallbacks.
     * 
     * WHY JSON FILES:
     * - Easy to edit content without touching code
     * - Can be generated by build scripts or CMS
     * - Cacheable by browsers and CDNs
     * - No database required for static hosting
     */
    async loadData() {
        try {
            // Load both JSON files in parallel for better performance
            const [projectsResponse, shopResponse] = await Promise.all([
                fetch('/data/projects.json'),  // DIY project data
                fetch('/data/products.json')       // Shop product data
            ]);

            // Check if both requests succeeded
            if (!projectsResponse.ok || !shopResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            // Parse JSON data and store in class properties
            this.projects = await projectsResponse.json();
            this.shopItems = await shopResponse.json();
            
        } catch (error) {
            console.error('Data loading error:', error);
            
            // Graceful fallback - empty arrays allow site to function
            // without content rather than completely breaking
            this.projects = [];
            this.shopItems = [];
        }
    }

    /**
     * Event Listener Setup
     * 
     * This method sets up all the event listeners that make the site interactive.
     * Organized by functionality area for maintainability.
     * 
     * EVENT HANDLING STRATEGY:
     * - Use event delegation where possible for performance
     * - Separate concerns (navigation, search, cart, etc.)
     * - Include both mouse and keyboard events for accessibility
     * - Add touch events for mobile gesture support
     */
    setupEventListeners() {
        // ===== MENU SYSTEM =====
        // Hamburger menu toggle - opens/closes the navigation menu
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Menu close button - explicit close action
        document.getElementById('menuClose')?.addEventListener('click', () => {
            this.closeMenu();
        });

        // Menu overlay - clicking outside menu closes it (common UX pattern)
        document.getElementById('menuOverlay')?.addEventListener('click', () => {
            this.closeMenu();
        });

        // ===== SEARCH FUNCTIONALITY =====
        // Search toggle - opens the search overlay
        document.getElementById('searchToggle')?.addEventListener('click', () => {
            this.toggleSearch();
        });

        // Search close button - explicit close action
        document.getElementById('searchClose')?.addEventListener('click', () => {
            this.closeSearch();
        });

        // Search input - real-time search as user types
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // ===== CART FUNCTIONALITY =====
        // Cart toggle - opens/closes the cart sidebar
        document.getElementById('cartToggle')?.addEventListener('click', () => {
            this.toggleCart();
        });

        // Cart close button - explicit close action
        document.getElementById('cartClose')?.addEventListener('click', () => {
            this.closeCart();
        });

        // ===== THEME AND HELP =====
        // Theme toggle - switches between light and dark modes
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Help button - opens email client for support
        document.getElementById('helpToggle')?.addEventListener('click', () => {
            window.open('mailto:jamcampinghq@gmail.com?subject=JamCamping Help Request', '_blank');
        });

        // ===== QUICK ACTIONS =====
        // "Surprise Me" button - random action to encourage exploration
        document.getElementById('surpriseMe')?.addEventListener('click', () => {
            this.surpriseMe();
        });

        // "Random Build" button - shows a random project
        document.getElementById('randomBuild')?.addEventListener('click', () => {
            this.showRandomProject();
        });

        // "Get Inspired" button - shows motivational content
        document.getElementById('getInspired')?.addEventListener('click', () => {
            this.showInspiration();
        });

        // ===== PROJECT FILTERING =====
        // Category filter dropdown - filters projects by type
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        // Difficulty filter dropdown - filters projects by skill level
        document.getElementById('difficultyFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        // ===== STAGE NAVIGATION =====
        // Stage indicator buttons - direct navigation to specific stages
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToStage(index);
            });
        });

        // Menu navigation links - navigate to stages from menu
        document.querySelectorAll('[data-stage]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const stageIndex = parseInt(link.dataset.stage);
                this.goToStage(stageIndex);
                this.closeMenu(); // Close menu after navigation
            });
        });

        // ===== FORM HANDLING =====
        // Project submission form - handles community contributions
        document.getElementById('submitForm')?.addEventListener('submit', (e) => {
            this.handleProjectSubmission(e);
        });

        // ===== MODAL CONTROLS =====
        // Modal close button - closes project detail modal
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Modal backdrop click - clicking outside modal closes it
        document.getElementById('projectModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeModal();
            }
        });

        // ===== GREETING BANNER =====
        // Greeting close button - dismisses welcome message
        document.querySelector('.greeting-close')?.addEventListener('click', () => {
            this.closeFestivalGreeting();
        });

        // ===== KEYBOARD NAVIGATION =====
        // Global keyboard shortcuts for power users and accessibility
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // ===== TOUCH GESTURES =====
        // Set up swipe gestures for mobile navigation
        this.setupTouchGestures();
    }

    /**
     * Touch Gesture Setup
     * 
     * Implements swipe gestures for mobile navigation between stages.
     * This is a key differentiator - most sites don't have smooth swipe navigation.
     * 
     * GESTURE RECOGNITION:
     * - Track touch start, move, and end events
     * - Calculate swipe distance and velocity
     * - Distinguish between horizontal swipes (navigation) and vertical scrolling
     * - Provide visual feedback during swipe with rubber-band effect
     * 
     * UX CONSIDERATIONS:
     * - Only horizontal swipes trigger navigation
     * - Minimum distance and velocity thresholds prevent accidental navigation
     * - Rubber-band effect at boundaries provides tactile feedback
     * - Smooth animations make transitions feel natural
     */
    setupTouchGestures() {
        // Variables to track touch state
        let startX, startY, startTime;  // Initial touch position and time
        let currentX, currentY;         // Current touch position during move
        let isDragging = false;         // Whether user is actively dragging

        // Get the main container that holds all stages
        const container = document.querySelector('.stage-container');
        if (!container) return; // Exit if container not found

        // ===== TOUCH START =====
        // Record initial touch position and time
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isDragging = true;
        });

        // ===== TOUCH MOVE =====
        // Track finger movement and provide visual feedback
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;  // Horizontal distance
            const deltaY = currentY - startY;  // Vertical distance
            
            // Only handle horizontal swipes (navigation)
            // If vertical movement is greater, let normal scrolling happen
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault(); // Prevent scrolling during horizontal swipe
            }
        });

        // ===== TOUCH END =====
        // Determine if swipe should trigger navigation
        container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;           // Total horizontal distance
            const deltaTime = Date.now() - startTime;   // Total time
            const velocity = Math.abs(deltaX) / deltaTime; // Swipe speed
            
            isDragging = false;
            
            // Check if swipe meets thresholds for navigation
            // Either sufficient distance (50px) OR sufficient velocity (0.3 px/ms)
            if (Math.abs(deltaX) > 50 || velocity > 0.3) {
                if (deltaX > 0) {
                    this.previousStage(); // Swipe right = go back
                } else {
                    this.nextStage();     // Swipe left = go forward
                }
            }
        });
    }

    /**
     * Stage Navigation Setup
     * 
     * Initializes the stage-based navigation system that makes JamCamping unique.
     * Each "stage" represents a different section, like areas at a music festival.
     */
    setupStageNavigation() {
        // Set initial visual state
        this.updateStagePosition();
        this.updateStageIndicators();
    }

    /**
     * Navigate to Specific Stage
     * 
     * @param {number} index - The stage index to navigate to (0-4)
     * 
     * This is the core navigation method that handles moving between stages.
     * Includes bounds checking and state updates.
     */
    goToStage(index) {
        // Validate the stage index and ensure it's different from current
        if (index >= 0 && index < this.stages.length && index !== this.currentStage) {
            this.currentStage = index;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL(); // Update browser URL for bookmarking/sharing
        }
    }

    /**
     * Navigate to Next Stage
     * 
     * Moves forward one stage if not at the end.
     * Used by swipe gestures and keyboard navigation.
     */
    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL();
        }
    }

    /**
     * Navigate to Previous Stage
     * 
     * Moves backward one stage if not at the beginning.
     * Used by swipe gestures and keyboard navigation.
     */
    previousStage() {
        if (this.currentStage > 0) {
            this.currentStage--;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL();
        }
    }

    /**
     * Update Stage Visual Position
     * 
     * Moves the stage container to show the current stage.
     * Uses CSS transforms for smooth, hardware-accelerated animation.
     * 
     * TECHNICAL DETAILS:
     * - Each stage is 100vw (viewport width) wide
     * - Container is 500vw wide (5 stages × 100vw each)
     * - Transform moves container left by (currentStage × 100vw)
     * - CSS transition provides smooth animation between positions
     */
    updateStagePosition() {
        const container = document.querySelector('.stage-container');
        if (!container) return;

        // Calculate offset: negative because we're moving left
        const offset = -this.currentStage * 100;
        container.style.transform = `translateX(${offset}vw)`;

        // Update active stage class for CSS styling
        document.querySelectorAll('.stage').forEach((stage, index) => {
            stage.classList.toggle('active', index === this.currentStage);
        });
    }

    /**
     * Update Stage Indicator Dots
     * 
     * Updates the visual dots that show current position and allow direct navigation.
     * Includes proper ARIA attributes for screen reader accessibility.
     */
    updateStageIndicators() {
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            const isActive = index === this.currentStage;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    }

    /**
     * Update Browser URL
     * 
     * Updates the URL to reflect current stage for bookmarking and sharing.
     * Uses HTML5 History API to avoid page reloads.
     */
    updateURL() {
        const stageName = this.stages[this.currentStage];
        const newURL = stageName === 'main' ? '/' : `/#${stageName}`;
        history.pushState({ stage: stageName }, '', newURL);
    }

    /**
     * Keyboard Navigation Handler
     * 
     * Provides keyboard shortcuts for power users and accessibility.
     * Only active when not typing in form fields.
     * 
     * @param {KeyboardEvent} e - The keyboard event
     * 
     * KEYBOARD SHORTCUTS:
     * - Escape: Close modals and overlays
     * - Arrow Left/H: Previous stage
     * - Arrow Right/L: Next stage  
     * - Number keys 1-5: Jump to specific stage
     */
    handleKeyboardNavigation(e) {
        // Don't interfere with form input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key) {
            case 'Escape':
                // Close any open overlays
                this.closeModal();
                this.closeMenu();
                this.closeSearch();
                this.closeCart();
                break;
                
            case 'ArrowLeft':
            case 'h': // Vim-style navigation
                this.previousStage();
                e.preventDefault();
                break;
                
            case 'ArrowRight':
            case 'l': // Vim-style navigation
                this.nextStage();
                e.preventDefault();
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                // Direct stage navigation
                const stageIndex = parseInt(e.key) - 1;
                if (stageIndex < this.stages.length) {
                    this.goToStage(stageIndex);
                }
                e.preventDefault();
                break;
        }
    }

    /**
     * Menu Toggle Method
     * 
     * Opens or closes the navigation menu with proper state management.
     * Includes accessibility attributes and overlay handling.
     */
    toggleMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        // Toggle active state
        const isActive = menu.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
        
        // Update ARIA attributes for screen readers
        toggle.setAttribute('aria-expanded', isActive);
        menu.setAttribute('aria-hidden', !isActive);
    }

    /**
     * Close Menu Method
     * 
     * Explicitly closes the navigation menu and updates all related states.
     */
    closeMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        menu.classList.remove('active');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }

    /**
     * Search Toggle Method
     * 
     * Opens or closes the search overlay with focus management.
     */
    toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        
        const isActive = searchOverlay.classList.toggle('active');
        searchOverlay.setAttribute('aria-hidden', !isActive);
        
        // Focus the search input when opening for immediate typing
        if (isActive) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    /**
     * Close Search Method
     * 
     * Explicitly closes the search overlay.
     */
    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        searchOverlay.classList.remove('active');
        searchOverlay.setAttribute('aria-hidden', 'true');
    }

    /**
     * Search Handler
     * 
     * Performs real-time search as user types in the search box.
     * Uses fuzzy matching to find relevant projects and shop items.
     * 
     * @param {string} query - The search term entered by user
     * 
     * SEARCH FEATURES:
     * - Minimum 2 characters to avoid too many results
     * - Searches project titles, descriptions, categories
     * - Fuzzy matching for typos and partial matches
     * - Real-time results update as user types
     * - Highlights matching terms in results
     */
    handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        
        // Don't search for very short queries
        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        // Perform the search and display results
        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    /**
     * Content Search Method
     * 
     * Searches through projects and shop items for matches.
     * Returns scored results sorted by relevance.
     * 
     * @param {string} query - The search term
     * @returns {Array} Array of search results with scores
     */
    searchContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        // Search through projects
        this.projects.forEach(project => {
            const score = this.calculateSearchScore(queryLower, project);
            if (score > 0) {
                results.push({
                    type: 'project',
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    score
                });
            }
        });

        // Search through shop items
        this.shopItems.forEach(item => {
            const score = this.calculateSearchScore(queryLower, item);
            if (score > 0) {
                results.push({
                    type: 'shop',
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    score
                });
            }
        });

        // Sort by relevance score (highest first) and limit results
        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    /**
     * Search Score Calculator
     * 
     * Calculates relevance score for search results.
     * Higher scores indicate better matches.
     * 
     * @param {string} query - The search term (lowercase)
     * @param {Object} item - The item to score (project or shop item)
     * @returns {number} Relevance score (higher = better match)
     * 
     * SCORING ALGORITHM:
     * - Title match: 10 points (most important)
     * - Description match: 5 points
     * - Category match: 8 points
     * - Multiple matches accumulate
     */
    calculateSearchScore(query, item) {
        let score = 0;
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();

        // Title matches are most important
        if (title.includes(query)) score += 10;
        
        // Description matches are valuable
        if (description.includes(query)) score += 5;
        
        // Category matches help with filtering
        if (item.category && item.category.toLowerCase().includes(query)) score += 8;

        return score;
    }

    /**
     * Display Search Results
     * 
     * Renders search results in the search overlay.
     * Highlights matching terms and provides click handlers.
     * 
     * @param {Array} results - Array of search result objects
     * @param {string} query - Original search query for highlighting
     */
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            // Show helpful message when no results found
            resultsContainer.innerHTML = `
                <div class="search-result">
                    <div class="result-title">No results found</div>
                    <div class="result-description">Try searching for "shade", "lighting", or "cooling"</div>
                </div>
            `;
        } else {
            // Render each result with highlighting and click handler
            resultsContainer.innerHTML = results.map(result => `
                <div class="search-result" onclick="app.openSearchResult('${result.type}', '${result.id}')">
                    <div class="result-type">${result.type}</div>
                    <div class="result-title">${this.highlightQuery(result.title, query)}</div>
                    <div class="result-description">${this.highlightQuery(result.description, query)}</div>
                </div>
            `).join('');
        }
    }

    /**
     * Query Highlighting
     * 
     * Wraps matching terms in <mark> tags for visual highlighting.
     * 
     * @param {string} text - Text to search within
     * @param {string} query - Term to highlight
     * @returns {string} Text with highlighted matches
     */
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Open Search Result
     * 
     * Handles clicking on a search result.
     * Navigates to appropriate section and shows relevant content.
     * 
     * @param {string} type - Type of result ('project' or 'shop')
     * @param {string} id - ID of the item to show
     */
    openSearchResult(type, id) {
        this.closeSearch();
        
        if (type === 'project') {
            this.showProjectModal(parseInt(id));
        } else if (type === 'shop') {
            this.goToStage(1); // Go to shop stage
        }
    }

    /**
     * Cart Toggle Method
     * 
     * Opens or closes the shopping cart sidebar.
     */
    toggleCart() {
        const cart = document.getElementById('cartSidebar');
        cart.classList.toggle('active');
        cart.setAttribute('aria-hidden', !cart.classList.contains('active'));
    }

    /**
     * Close Cart Method
     * 
     * Explicitly closes the shopping cart sidebar.
     */
    closeCart() {
        const cart = document.getElementById('cartSidebar');
        cart.classList.remove('active');
        cart.setAttribute('aria-hidden', 'true');
    }

    /**
     * Theme Toggle Method
     * 
     * Switches between light and dark themes.
     * Saves preference to localStorage for persistence.
     */
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('jamcamping-theme', this.theme);
    }

    /**
     * Apply Theme Method
     * 
     * Applies the current theme to the document.
     * Updates the theme toggle icon to reflect current state.
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            // Moon icon for light theme (click to go dark)
            // Sun icon for dark theme (click to go light)
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * Render Projects Method
     * 
     * Generates HTML for all projects and inserts into the DOM.
     * Creates interactive project cards with pricing and actions.
     */
    renderProjects() {
        const container = document.getElementById('projectsGrid');
        if (!container || this.projects.length === 0) return;

        // Generate HTML for all project cards
        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');

        // Add click listeners to project cards for modal opening
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = parseInt(card.dataset.projectId);
                this.showProjectModal(projectId);
            });
        });
    }

    /**
     * Render Shop Items Method
     * 
     * Generates HTML for all shop items and inserts into the DOM.
     * Creates product cards with pricing and purchase options.
     */
    renderShopItems() {
        const container = document.getElementById('shopGrid');
        if (!container || this.shopItems.length === 0) return;

        // Generate HTML for all shop item cards
        container.innerHTML = this.shopItems.map(item => this.createShopCard(item)).join('');
    }

    /**
     * Create Shop Card Method
     * 
     * Generates HTML for a single shop item card.
     * Includes cover image, pricing tiers, and purchase buttons.
     * 
     * @param {Object} item - Shop item data from shop.json
     * @returns {string} HTML string for the shop card
     */
    createShopCard(item) {
        // Generate HTML for digital format options
        const digitalFormats = item.digital.map(format => `
            <div class="format-item">
                <span class="format-name">${format.format}</span>
                <span class="format-price">$${format.price}</span>
                <a href="${format.buy_url}" target="_blank" class="buy-btn">Buy</a>
            </div>
        `).join('');

        // Generate HTML for print format options
        const printFormats = item.print.map(format => `
            <div class="format-item">
                <span class="format-name">${format.format}</span>
                <span class="format-price">
                    $${format.price}
                    ${format.shipping ? '<span class="format-shipping">+ shipping</span>' : ''}
                </span>
                <a href="${format.buy_url}" target="_blank" class="buy-btn lulu-btn">Order on Lulu</a>
            </div>
        `).join('');

        // Get bundle price for the cover overlay
        const bundlePrice = item.bundle.price;

        // Return complete shop card HTML
        return `
            <div class="product-card">
                <div class="product-cover-container">
                    <img src="${item.cover}" alt="${item.title}" class="product-cover">
                    <div class="product-cover-overlay">
                        <div class="product-cover-title">${item.title}</div>
                        <div class="product-cover-price">From $${bundlePrice}</div>
                    </div>
                </div>
                
                <div class="product-content">
                    <h2 class="product-title">${item.title}</h2>
                    <p class="product-description">${item.description}</p>

                    <div class="bundle-highlight">
                        <div class="format-item">
                            <span class="format-name">Digital Bundle (${item.bundle.formats.join(', ')})</span>
                            <span class="format-price">$${item.bundle.price}</span>
                            <a href="${item.bundle.buy_url}" target="_blank" class="buy-btn bundle-btn">Get Bundle</a>
                        </div>
                        <div class="bundle-savings">Save $${item.bundle.savings}! Best value for all formats.</div>
                    </div>

                    <div class="format-section">
                        <h3>📱 Individual Digital Formats</h3>
                        <div class="format-list">
                            ${digitalFormats}
                        </div>
                    </div>

                    <div class="format-section">
                        <h3>📚 Print Editions</h3>
                        <div class="format-list">
                            ${printFormats}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create Project Card Method
     * 
     * Generates HTML for a single project card.
     * Calculates pricing for both functional and extravagant builds.
     * 
     * @param {Object} project - Project data from projects.json
     * @returns {string} HTML string for the project card
     */
    createProjectCard(project) {
        // Calculate total prices for both build types
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        // Return complete project card HTML
        return `
            <article class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-difficulty="${project.difficulty}">
                <div class="project-image" aria-hidden="true">${project.image}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span class="project-category">${this.formatCategory(project.category)}</span>
                        <span class="project-difficulty">${this.formatDifficulty(project.difficulty)}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn-festival btn-primary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'functional')">
                            🎸 GA $${functionalTotal.toFixed(0)}
                        </button>
                        <button class="btn-festival btn-secondary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'extravagant')">
                            ✨ VIP $${extravagantTotal.toFixed(0)}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Format Category Method
     * 
     * Converts category codes to display-friendly names with emojis.
     * 
     * @param {string} category - Category code from project data
     * @returns {string} Formatted category name with emoji
     */
    formatCategory(category) {
        const categories = {
            'shade': '🏠 Shade & Shelter',
            'lighting': '💡 Lighting',
            'comfort': '🛋️ Comfort',
            'power': '⚡ Power & Tech',
            'cooling': '❄️ Cooling',
            'storage': '📦 Storage'
        };
        return categories[category] || category;
    }

    /**
     * Format Difficulty Method
     * 
     * Converts difficulty codes to display-friendly names with emojis.
     * 
     * @param {string} difficulty - Difficulty code from project data
     * @returns {string} Formatted difficulty name with emoji
     */
    formatDifficulty(difficulty) {
        const difficulties = {
            'beginner': '🌱 Beginner',
            'intermediate': '🌿 Intermediate',
            'advanced': '🌳 Advanced'
        };
        return difficulties[difficulty] || difficulty;
    }

    /**
     * Filter Projects Method
     * 
     * Filters visible projects based on category and difficulty selections.
     * Uses CSS display property to show/hide cards instantly.
     */
    filterProjects() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const difficultyFilter = document.getElementById('difficultyFilter')?.value || 'all';

        // Loop through all project cards and show/hide based on filters
        document.querySelectorAll('.project-card').forEach(card => {
            const category = card.dataset.category;
            const difficulty = card.dataset.difficulty;

            // Check if card matches both filters
            const categoryMatch = categoryFilter === 'all' || category === categoryFilter;
            const difficultyMatch = difficultyFilter === 'all' || difficulty === difficultyFilter;

            // Show card only if it matches both filters
            card.style.display = categoryMatch && difficultyMatch ? 'block' : 'none';
        });
    }

    /**
     * Show Project Modal Method
     * 
     * Opens a modal with detailed project information.
     * Includes full parts lists, instructions, and purchase options.
     * 
     * @param {number} projectId - ID of project to display
     */
    showProjectModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        // Generate and insert modal content
        modalBody.innerHTML = this.createProjectModalContent(project);
        
        // Show modal with proper accessibility attributes
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Prevent body scrolling while modal is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Create Project Modal Content Method
     * 
     * Generates detailed HTML content for the project modal.
     * Includes pricing, parts lists, and purchase buttons.
     * 
     * @param {Object} project - Project data object
     * @returns {string} HTML content for modal body
     */
    createProjectModalContent(project) {
        // Calculate totals for both build types
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        return `
            <div class="project-modal-header">
                <div class="project-modal-image">${project.image}</div>
                <h2>${project.title}</h2>
                <p class="project-modal-description">${project.description}</p>
                <div class="project-modal-meta">
                    <div><strong>Problem Solved:</strong> ${project.problemSolved}</div>
                    <div><strong>Build Time:</strong> ${project.buildTime}</div>
                    <div><strong>Difficulty:</strong> ${this.formatDifficulty(project.difficulty)}</div>
                </div>
            </div>

            <div class="project-modal-instructions">
                <h3>Build Instructions</h3>
                <p>${project.instructions}</p>
                ${project.lyricEasterEgg ? `<blockquote class="stage-lyric">${project.lyricEasterEgg}</blockquote>` : ''}
            </div>

            <div class="project-modal-parts">
                <div class="parts-section">
                    <h3>🎸 Functional Build (GA) - $${functionalTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.functionalParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-festival btn-primary full-width" onclick="app.addToCart(${project.id}, 'functional')">
                        Add All GA Parts to Cart - $${functionalTotal.toFixed(2)}
                    </button>
                </div>

                <div class="parts-section">
                    <h3>✨ Extravagant Build (VIP) - $${extravagantTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.extravagantParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-festival btn-secondary full-width" onclick="app.addToCart(${project.id}, 'extravagant')">
                        Add All VIP Parts to Cart - $${extravagantTotal.toFixed(2)}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Close Modal Method
     * 
     * Closes the project modal and restores normal page state.
     */
    closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    /**
     * Add to Cart Method
     * 
     * Adds a project build to the shopping cart.
     * Updates cart display and shows confirmation feedback.
     * 
     * @param {number} projectId - ID of project to add
     * @param {string} buildType - 'functional' or 'extravagant'
     */
    addToCart(projectId, buildType) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Get parts list based on build type
        const parts = buildType === 'functional' ? project.functionalParts : project.extravagantParts;
        const total = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        // Create cart item object
        const cartItem = {
            id: `${projectId}-${buildType}`,  // Unique ID for cart management
            projectId,
            buildType,
            title: project.title,
            emoji: project.image,
            total: total,
            parts: parts
        };

        // Check if item already exists in cart
        const existingIndex = this.cart.findIndex(item => item.id === cartItem.id);
        if (existingIndex >= 0) {
            // Update existing item
            this.cart[existingIndex] = cartItem;
        } else {
            // Add new item
            this.cart.push(cartItem);
        }

        // Update persistent storage and UI
        this.saveCart();
        this.updateCartBadge();
        this.updateCartDisplay();
        this.showCartNotification(project.title, buildType);
    }

    /**
     * Remove from Cart Method
     * 
     * Removes an item from the shopping cart.
     * 
     * @param {string} itemId - Unique ID of cart item to remove
     */
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartBadge();
        this.updateCartDisplay();
    }

    /**
     * Save Cart Method
     * 
     * Persists cart contents to localStorage for session continuity.
     */
    saveCart() {
        localStorage.setItem('jamcamping-cart', JSON.stringify(this.cart));
    }

    /**
     * Update Cart Badge Method
     * 
     * Updates the cart icon badge with current item count.
     */
    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = this.cart.length;
            badge.classList.toggle('hidden', this.cart.length === 0);
        }
    }

    /**
     * Update Cart Display Method
     * 
     * Updates the cart sidebar with current items and total.
     */
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            // Show empty cart state
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="empty-emoji">🎪</div>
                    <p>Your cart is empty</p>
                    <p class="empty-subtitle">Add some legendary builds!</p>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '$0.00';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            // Show cart items
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-emoji">${item.emoji}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.title}</div>
                        <div class="cart-item-type">${item.buildType.toUpperCase()} Build</div>
                    </div>
                    <div class="cart-item-price">$${item.total.toFixed(2)}</div>
                    <button class="cart-item-remove" onclick="app.removeFromCart('${item.id}')" aria-label="Remove item">×</button>
                </div>
            `).join('');

            // Update total and enable checkout
            const total = this.cart.reduce((sum, item) => sum + item.total, 0);
            if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
    }

    /**
     * Show Cart Notification Method
     * 
     * Shows a temporary notification when items are added to cart.
     * Provides immediate feedback for user actions.
     * 
     * @param {string} projectTitle - Name of project added
     * @param {string} buildType - Type of build added
     */
    showCartNotification(projectTitle, buildType) {
        // Create temporary notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">Added ${projectTitle} (${buildType.toUpperCase()}) to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in, wait, then animate out
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Surprise Me Method
     * 
     * Performs a random action to encourage exploration.
     * Adds an element of fun and discovery to the experience.
     */
    surpriseMe() {
        const surprises = [
            () => this.showRandomProject(),
            () => this.showInspiration(),
            () => this.goToStage(Math.floor(Math.random() * this.stages.length)),
            () => this.filterProjects()
        ];

        // Pick and execute a random surprise action
        const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
        randomSurprise();
    }

    /**
     * Show Random Project Method
     * 
     * Highlights a random project to encourage discovery.
     * Scrolls to the project and adds visual emphasis.
     */
    showRandomProject() {
        if (this.projects.length === 0) return;

        // Pick a random project
        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        
        // Navigate to main stage first
        this.goToStage(0);
        
        // After navigation animation, highlight the project
        setTimeout(() => {
            const projectCard = document.querySelector(`[data-project-id="${randomProject.id}"]`);
            if (projectCard) {
                // Scroll to project and add visual emphasis
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectCard.style.transform = 'scale(1.05)';
                
                // Remove emphasis after animation
                setTimeout(() => {
                    projectCard.style.transform = '';
                }, 1000);
            }
        }, 300);
    }

    /**
     * Show Inspiration Method
     * 
     * Displays motivational quotes and festival lyrics.
     * Reinforces community feeling and encourages engagement.
     */
    showInspiration() {
        // Collection of inspirational quotes and festival lyrics
        const inspirations = [
            "\"The magic happens when preparation meets opportunity - and a really cool campsite!\"",
            "\"Your campsite is your canvas - paint it with creativity and festival spirit!\"",
            "\"Every great festival memory starts with an epic basecamp.\"",
            "\"Build it, and the good vibes will come.\"",
            "\"In the desert of ordinary camping, be an oasis of awesome.\"",
            "\"Once in a while you get shown the light, in the strangest of places if you look at it right.\"",
            "\"What a long, strange trip it's been... and it's about to get even better!\"",
            "\"Keep on truckin' with the coolest camp on the playa!\"",
            "\"Sometimes the light's all shinin' on me, other times I can barely see...\"",
            "\"We're just walking each other home - might as well make the journey legendary!\""
        ];

        // Pick a random inspiration
        const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
        
        // Show in modal
        const modal = document.getElementById('inspirationModal');
        const text = document.getElementById('inspirationText');
        
        if (modal && text) {
            text.textContent = randomInspiration;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            }
        }, 5000);
    }

    /**
     * Show Festival Greeting Method
     * 
     * Displays a personalized greeting based on time of day.
     * Creates immediate connection with festival culture.
     */
    showFestivalGreeting() {
        const greeting = document.getElementById('festivalGreeting');
        const greetingText = document.querySelector('.greeting-text');
        
        if (!greeting || !greetingText) return;

        // Time-based greetings with festival flair
        const greetings = [
            "🎪 Welcome to the digital Shakedown Street!",
            "✨ Ready to make your campsite legendary?",
            "🌈 Festival family, let's build something magical!",
            "🎸 Time to turn your camp into a cosmic basecamp!",
            "🔥 Get ready for some epic DIY inspiration!"
        ];

        // Pick random greeting and display
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        greetingText.textContent = randomGreeting;
        
        // Show after brief delay for better UX
        setTimeout(() => {
            greeting.classList.add('show');
        }, 1000);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.closeFestivalGreeting();
        }, 6000);
    }

    /**
     * Close Festival Greeting Method
     * 
     * Hides the festival greeting banner.
     */
    closeFestivalGreeting() {
        const greeting = document.getElementById('festivalGreeting');
        if (greeting) {
            greeting.classList.remove('show');
        }
    }

    /**
     * Handle Project Submission Method
     * 
     * Processes the project submission form.
     * Validates input and provides user feedback.
     * 
     * @param {Event} e - Form submission event
     */
    handleProjectSubmission(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData);
        
        // In a real implementation, this would send to a server
        // For now, just show confirmation message
        alert(`Thanks for submitting "${projectData.projectName}"! We'll review it and get back to you at ${projectData.submitterEmail}.`);
        
        // Reset form
        e.target.reset();
    }

    /**
     * Show Error Message Method
     * 
     * Displays user-friendly error messages when things go wrong.
     * 
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// ===== APPLICATION INITIALIZATION =====

/**
 * Initialize the app when DOM is loaded
 * 
 * This ensures all HTML elements exist before JavaScript tries to access them.
 * Creates a global app instance for debugging and external access.
 */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JamCampingApp();
});

/**
 * Handle browser back/forward navigation
 * 
 * Responds to browser history changes to maintain proper navigation state.
 * Allows users to use browser back/forward buttons with stage navigation.
 */
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.stage && window.app) {
        const stageIndex = window.app.stages.indexOf(e.state.stage);
        if (stageIndex >= 0) {
            window.app.goToStage(stageIndex);
        }
    }
});

/**
 * Handle initial hash on page load
 * 
 * Allows direct linking to specific stages via URL hash.
 * Example: jamcamping.com/#vendor goes directly to shop
 */
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && window.app) {
        const stageIndex = window.app.stages.indexOf(hash);
        if (stageIndex >= 0) {
            window.app.goToStage(stageIndex);
        }
    }
});

/**
 * Service Worker registration for PWA capabilities
 * 
 * Registers the service worker for offline functionality and caching.
 * Only runs if service workers are supported by the browser.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}


