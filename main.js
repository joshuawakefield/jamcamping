// ===== JAMCAMPING: DIGITAL SHAKEDOWN STREET =====
// Festival-first, mobile-native, conversion-optimized experience

class JamCampingApp {
    constructor() {
        this.projects = [];
        this.shopItems = [];
        this.cart = JSON.parse(localStorage.getItem('jamcamping-cart') || '[]');
        this.currentStage = 0;
        this.stages = ['main', 'vendor', 'chill', 'submit', 'contact'];
        this.theme = localStorage.getItem('jamcamping-theme') || 'light';
        this.isAnimating = false;
        this.searchIndex = [];
        
        // Analytics
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.events = [];
        
        // Festival greetings
        this.greetings = {
            morning: [
                "Good morning, sunshine! ☀️ Ready to build something legendary?",
                "Rise and shine, festival family! 🌅 Let's make some magic today!",
                "Morning vibes are the best vibes! ✨ What's your next build?"
            ],
            afternoon: [
                "Afternoon delight! 🌞 Time for some cosmic inspiration!",
                "Hope your day is as bright as the main stage! 🎪",
                "Sending good vibes your way! 🌈 Ready to explore?"
            ],
            evening: [
                "Evening, beautiful souls! 🌙 The night is young and full of magic!",
                "Time for some cosmic exploration! 🌌",
                "The magic never sleeps! ✨ What legendary build calls to you?"
            ],
            late: [
                "Burning the midnight oil? 🔥 We love the dedication!",
                "Late night festival planning! 🌙 You're our kind of people!",
                "The magic never sleeps! ✨ Neither do the best festival builders!"
            ]
        };
        
        // Lyric easter eggs
        this.lyrics = {
            grateful_dead: [
                "Once in a while you get shown the light, in the strangest of places if you look at it right",
                "What a long, strange trip it's been... and it's about to get even better!",
                "Keep on truckin' with the coolest camp on the playa!",
                "Sometimes the light's all shinin' on me, other times I can barely see...",
                "We're just walking each other home - might as well make the journey legendary!",
                "There is a road, no simple highway, between the dawn and the dark of night",
                "Steal your face right off your head... with these legendary builds!"
            ],
            phish: [
                "You can't always listen to what you feel, but you can always build what you dream",
                "The connection is complete... between you and your perfect campsite",
                "Everything's right, so just hold tight... to these cosmic build ideas",
                "Divided sky, the wind blows high... over your legendary festival setup",
                "Wilson, Wilson, Wilson... would be jealous of your campsite!",
                "Fluffhead was a man with a horrible campsite... don't be like Fluffhead",
                "You enjoy myself, you enjoy myself... and you'll enjoy these builds!"
            ],
            festival_general: [
                "Good vibes only, legendary builds always! ✨",
                "The magic happens when preparation meets opportunity - and a really cool campsite!",
                "Your campsite is your canvas - paint it with creativity and festival spirit!",
                "Every great festival memory starts with an epic basecamp",
                "Build it, and the good vibes will come",
                "In the desert of ordinary camping, be an oasis of awesome",
                "Keep the music playing and the camp legendary! 🎸"
            ]
        };
        
        this.init();
    }
    
    // ===== INITIALIZATION =====
    async init() {
        try {
            this.showLoading();
            
            await Promise.all([
                this.loadProjects(),
                this.loadShopItems()
            ]);
            
            this.setupEventListeners();
            this.setupGestureNavigation();
            this.setupAnalytics();
            this.applyTheme();
            this.updateCartBadge();
            this.renderProjects();
            this.renderShopItems();
            this.buildSearchIndex();
            this.showFestivalGreeting();
            this.setupSocialProof();
            
            // Track page view
            this.trackEvent('page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize JamCamping:', error);
            this.hideLoading();
        }
    }
    
    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            this.projects = await response.json();
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.projects = [];
        }
    }
    
    async loadShopItems() {
        try {
            const response = await fetch('shop.json');
            this.shopItems = await response.json();
        } catch (error) {
            console.error('Failed to load shop items:', error);
            this.shopItems = [];
        }
    }
    
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Header actions
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleMenu();
        });
        
        document.getElementById('searchToggle').addEventListener('click', () => {
            this.toggleSearch();
        });
        
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });
        
        // Menu
        document.getElementById('menuClose').addEventListener('click', () => {
            this.closeMenu();
        });
        
        document.getElementById('menuOverlay').addEventListener('click', () => {
            this.closeMenu();
        });
        
        // Navigation
        document.querySelectorAll('[data-stage]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const stage = parseInt(e.target.dataset.stage);
                this.goToStage(stage);
                this.closeMenu();
            });
        });
        
        // Stage indicators
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToStage(index);
            });
        });
        
        // Search
        document.getElementById('searchClose').addEventListener('click', () => {
            this.closeSearch();
        });
        
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Cart
        document.getElementById('cartClose').addEventListener('click', () => {
            this.closeCart();
        });
        
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.handleCheckout();
        });
        
        // Quick actions
        document.getElementById('surpriseMe').addEventListener('click', () => {
            this.surpriseMe();
        });
        
        document.getElementById('randomBuild').addEventListener('click', () => {
            this.showRandomProject();
        });
        
        document.getElementById('getInspired').addEventListener('click', () => {
            this.showInspiration();
        });
        
        // Floating actions
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.getElementById('helpToggle').addEventListener('click', () => {
            this.openHelp();
        });
        
        // Filters
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });
        
        document.getElementById('difficultyFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });
        
        // Form submission
        document.getElementById('submitForm')?.addEventListener('submit', (e) => {
            this.handleProjectSubmission(e);
        });
        
        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Inspiration modal
        document.querySelector('.inspiration-close')?.addEventListener('click', () => {
            this.closeInspiration();
        });
        
        // Festival greeting
        document.querySelector('.greeting-close')?.addEventListener('click', () => {
            this.closeFestivalGreeting();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        window.addEventListener('beforeunload', () => {
            this.trackTimeOnPage();
        });
    }
    
    // ===== GESTURE NAVIGATION =====
    setupGestureNavigation() {
        let startX, startY, startTime;
        let currentX, currentY;
        let isDragging = false;
        
        const container = document.querySelector('.stage-container');
        
        // Touch events
        container.addEventListener('touchstart', (e) => {
            if (this.isAnimating) return;
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isDragging = true;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isDragging || this.isAnimating) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                e.preventDefault();
                this.updateStagePosition(deltaX);
            }
        });
        
        container.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            const deltaTime = Date.now() - startTime;
            const velocity = Math.abs(deltaX) / deltaTime;
            
            isDragging = false;
            
            // Determine if swipe should trigger navigation
            if (Math.abs(deltaX) > 50 || velocity > 0.3) {
                if (deltaX > 0) {
                    this.previousStage();
                } else {
                    this.nextStage();
                }
            } else {
                this.snapToCurrentStage();
            }
        });
    }
    
    updateStagePosition(offset) {
        const container = document.querySelector('.stage-container');
        const dampening = this.getRubberBandDampening(offset);
        const currentOffset = -this.currentStage * 100;
        const newOffset = currentOffset + (offset / window.innerWidth * 100 * dampening);
        
        container.style.transform = `translateX(${newOffset}vw)`;
    }
    
    getRubberBandDampening(deltaX) {
        const isAtBoundary = 
            (deltaX > 0 && this.currentStage === 0) ||
            (deltaX < 0 && this.currentStage === this.stages.length - 1);
        
        return isAtBoundary ? 0.3 : 1;
    }
    
    snapToCurrentStage() {
        this.goToStage(this.currentStage);
    }
    
    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.goToStage(this.currentStage + 1);
        } else {
            this.snapToCurrentStage();
        }
    }
    
    previousStage() {
        if (this.currentStage > 0) {
            this.goToStage(this.currentStage - 1);
        } else {
            this.snapToCurrentStage();
        }
    }
    
    goToStage(stageIndex) {
        if (stageIndex < 0 || stageIndex >= this.stages.length || this.isAnimating) return;
        
        this.isAnimating = true;
        const previousStage = this.currentStage;
        this.currentStage = stageIndex;
        
        // Update container position
        const container = document.querySelector('.stage-container');
        const offset = -this.currentStage * 100;
        
        container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        container.style.transform = `translateX(${offset}vw)`;
        
        // Update stage indicators
        this.updateStageIndicators();
        
        // Update active stage
        this.updateActiveStage();
        
        // Track navigation
        this.trackEvent('stage_navigation', {
            from_stage: this.stages[previousStage],
            to_stage: this.stages[this.currentStage],
            stage_index: this.currentStage
        });
        
        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
            container.style.transition = '';
        }, 600);
    }
    
    updateStageIndicators() {
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            const isActive = index === this.currentStage;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    }
    
    updateActiveStage() {
        document.querySelectorAll('.stage').forEach((stage, index) => {
            stage.classList.toggle('active', index === this.currentStage);
        });
    }
    
    // ===== MENU MANAGEMENT =====
    toggleMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        const isOpen = menu.classList.contains('active');
        
        if (isOpen) {
            this.closeMenu();
        } else {
            menu.classList.add('active');
            overlay.classList.add('active');
            menu.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            
            // Focus first menu item
            const firstMenuItem = menu.querySelector('a');
            if (firstMenuItem) firstMenuItem.focus();
            
            this.trackEvent('menu_opened');
        }
    }
    
    closeMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        menu.classList.remove('active');
        overlay.classList.remove('active');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        
        searchOverlay.classList.add('active');
        searchOverlay.setAttribute('aria-hidden', 'false');
        searchInput.focus();
        
        this.trackEvent('search_opened');
    }
    
    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        searchOverlay.classList.remove('active');
        searchOverlay.setAttribute('aria-hidden', 'true');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
    
    buildSearchIndex() {
        this.searchIndex = [];
        
        // Index projects
        this.projects.forEach(project => {
            this.searchIndex.push({
                id: project.id,
                type: 'project',
                title: project.title,
                description: project.description,
                category: project.category,
                difficulty: project.difficulty,
                searchText: `${project.title} ${project.description} ${project.category} ${project.difficulty}`.toLowerCase()
            });
        });
        
        // Index shop items
        this.shopItems.forEach(item => {
            this.searchIndex.push({
                id: item.id,
                type: 'shop',
                title: item.title,
                description: item.description,
                searchText: `${item.title} ${item.description}`.toLowerCase()
            });
        });
    }
    
    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = this.performSearch(query.toLowerCase());
        this.displaySearchResults(results, query);
        
        this.trackEvent('search_performed', {
            query: query,
            results_count: results.length
        });
    }
    
    performSearch(query) {
        const results = [];
        const queryWords = query.split(/\s+/);
        
        this.searchIndex.forEach(item => {
            let score = 0;
            
            queryWords.forEach(word => {
                if (item.title.toLowerCase().includes(word)) score += 10;
                if (item.description.toLowerCase().includes(word)) score += 5;
                if (item.category && item.category.toLowerCase().includes(word)) score += 8;
                if (item.searchText.includes(word)) score += 3;
            });
            
            if (score > 0) {
                results.push({ ...item, score });
            }
        });
        
        return results.sort((a, b) => b.score - a.score).slice(0, 8);
    }
    
    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result">
                    <div class="result-title">No results found</div>
                    <div class="result-description">Try searching for "shade", "lighting", or "cooling"</div>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.map(result => `
            <div class="search-result" onclick="app.openSearchResult('${result.type}', '${result.id}')">
                <div class="result-type">${result.type}</div>
                <div class="result-title">${this.highlightQuery(result.title, query)}</div>
                <div class="result-description">${this.highlightQuery(result.description, query)}</div>
            </div>
        `).join('');
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    openSearchResult(type, id) {
        this.closeSearch();
        
        if (type === 'project') {
            const project = this.projects.find(p => p.id == id);
            if (project) {
                this.showProjectModal(project);
            }
        } else if (type === 'shop') {
            this.goToStage(1); // Go to vendor row
        }
        
        this.trackEvent('search_result_clicked', {
            result_type: type,
            result_id: id
        });
    }
    
    // ===== CART MANAGEMENT =====
    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const isOpen = cartSidebar.classList.contains('active');
        
        if (isOpen) {
            this.closeCart();
        } else {
            cartSidebar.classList.add('active');
            cartSidebar.setAttribute('aria-hidden', 'false');
            
            this.trackEvent('cart_opened', {
                cart_items: this.cart.length,
                cart_total: this.getCartTotal()
            });
        }
    }
    
    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.remove('active');
        cartSidebar.setAttribute('aria-hidden', 'true');
    }
    
    addToCart(projectId, buildType) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const parts = buildType === 'functional' ? project.functionalParts : project.extravagantParts;
        const total = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        
        const cartItem = {
            id: `${projectId}-${buildType}`,
            projectId: projectId,
            buildType: buildType,
            title: project.title,
            emoji: project.image,
            price: total,
            parts: parts
        };
        
        // Check if item already exists
        const existingIndex = this.cart.findIndex(item => item.id === cartItem.id);
        if (existingIndex >= 0) {
            // Item already in cart
            this.showNotification('Already in cart! 🎪', 'info');
            return;
        }
        
        this.cart.push(cartItem);
        this.saveCart();
        this.updateCartBadge();
        this.renderCartItems();
        
        // Show success animation
        this.animateAddToCart(event.target, cartItem);
        
        // Track event
        this.trackEvent('add_to_cart', {
            project_id: projectId,
            build_type: buildType,
            price: total,
            cart_size: this.cart.length
        });
        
        // Show social proof
        this.showSocialProof(`Someone just added ${project.title} to their cart! 🎪`);
    }
    
    removeFromCart(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartBadge();
            this.renderCartItems();
            
            this.trackEvent('remove_from_cart', {
                project_id: removedItem.projectId,
                build_type: removedItem.buildType,
                cart_size: this.cart.length
            });
        }
    }
    
    saveCart() {
        localStorage.setItem('jamcamping-cart', JSON.stringify(this.cart));
    }
    
    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.cart.length;
        
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
        
        // Update checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = count === 0;
    }
    
    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="empty-emoji">🎪</div>
                    <p>Your cart is empty</p>
                    <p class="empty-subtitle">Add some legendary builds!</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-emoji">${item.emoji}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.title}</div>
                        <div class="cart-item-type">${item.buildType.toUpperCase()} Build</div>
                    </div>
                    <div class="cart-item-price">$${item.price.toFixed(0)}</div>
                    <button class="cart-item-remove" onclick="app.removeFromCart('${item.id}')" aria-label="Remove item">
                        ×
                    </button>
                </div>
            `).join('');
        }
        
        cartTotal.textContent = `$${this.getCartTotal().toFixed(2)}`;
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    }
    
    animateAddToCart(button, item) {
        // Button success state
        const originalText = button.innerHTML;
        button.innerHTML = '✨ Added!';
        button.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
        // Flying emoji animation
        const flyingEmoji = document.createElement('div');
        flyingEmoji.innerHTML = item.emoji;
        flyingEmoji.style.cssText = `
            position: fixed;
            font-size: 2rem;
            z-index: 9999;
            pointer-events: none;
            left: ${button.getBoundingClientRect().left}px;
            top: ${button.getBoundingClientRect().top}px;
        `;
        
        document.body.appendChild(flyingEmoji);
        
        const cartBtn = document.getElementById('cartToggle');
        const cartRect = cartBtn.getBoundingClientRect();
        
        flyingEmoji.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${cartRect.left - button.getBoundingClientRect().left}px, ${cartRect.top - button.getBoundingClientRect().top}px) scale(0.3)`, opacity: 0.8 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            flyingEmoji.remove();
            
            // Cart bounce animation
            cartBtn.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            });
        };
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
    }
    
    handleCheckout() {
        if (this.cart.length === 0) return;
        
        // For now, show a message about affiliate links
        const total = this.getCartTotal();
        const message = `
            🚀 Ready to build something legendary!
            
            Total: $${total.toFixed(2)}
            
            You'll be redirected to our affiliate partners to complete your purchase. 
            This helps keep JamCamping free and supports the festival community!
            
            Thanks for being part of the family! ✨
        `;
        
        alert(message);
        
        this.trackEvent('checkout_initiated', {
            cart_items: this.cart.length,
            cart_total: total,
            items: this.cart.map(item => ({
                project_id: item.projectId,
                build_type: item.buildType,
                price: item.price
            }))
        });
    }
    
    // ===== PROJECT RENDERING =====
    renderProjects() {
        const container = document.getElementById('projectsGrid');
        if (!container || this.projects.length === 0) return;
        
        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
        
        // Add click listeners
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = parseInt(card.dataset.projectId);
                const project = this.projects.find(p => p.id === projectId);
                if (project) {
                    this.showProjectModal(project);
                }
            });
        });
    }
    
    createProjectCard(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        
        return `
            <article class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-difficulty="${project.difficulty}" role="gridcell" tabindex="0">
                <div class="project-image" aria-hidden="true">${project.image}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span class="project-category">${this.formatCategory(project.category)}</span>
                        <span class="project-difficulty">${this.formatDifficulty(project.difficulty)}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn-festival btn-primary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'functional')" aria-label="Add GA build to cart for $${functionalTotal.toFixed(0)}">
                            🎸 GA $${functionalTotal.toFixed(0)}
                        </button>
                        <button class="btn-festival btn-secondary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'extravagant')" aria-label="Add VIP build to cart for $${extravagantTotal.toFixed(0)}">
                            ✨ VIP $${extravagantTotal.toFixed(0)}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
    
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
    
    formatDifficulty(difficulty) {
        const difficulties = {
            'beginner': '🌱 Beginner',
            'intermediate': '🌿 Intermediate',
            'advanced': '🌳 Advanced'
        };
        return difficulties[difficulty] || difficulty;
    }
    
    filterProjects() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const difficultyFilter = document.getElementById('difficultyFilter')?.value || 'all';
        
        document.querySelectorAll('.project-card').forEach(card => {
            const category = card.dataset.category;
            const difficulty = card.dataset.difficulty;
            
            const categoryMatch = categoryFilter === 'all' || category === categoryFilter;
            const difficultyMatch = difficultyFilter === 'all' || difficulty === difficultyFilter;
            
            card.style.display = categoryMatch && difficultyMatch ? 'block' : 'none';
        });
        
        this.trackEvent('projects_filtered', {
            category_filter: categoryFilter,
            difficulty_filter: difficultyFilter
        });
    }
    
    // ===== SHOP RENDERING =====
    renderShopItems() {
        const container = document.getElementById('shopGrid');
        if (!container || this.shopItems.length === 0) return;
        
        container.innerHTML = this.shopItems.map(item => this.createShopCard(item)).join('');
    }
    
    createShopCard(item) {
        const bundlePrice = item.bundle.price;
        
        return `
            <article class="shop-card">
                <div class="shop-cover">
                    <img src="${item.cover}" alt="${item.title}" loading="lazy">
                    <div class="shop-overlay">
                        <h3 class="shop-title">${item.title}</h3>
                        <div class="shop-price">From $${bundlePrice}</div>
                    </div>
                </div>
                <div class="shop-content">
                    <p class="shop-description">${item.description}</p>
                    
                    <div class="bundle-highlight">
                        <div class="format-item">
                            <span class="format-name">Digital Bundle (${item.bundle.formats.join(', ')})</span>
                            <span class="format-price">$${item.bundle.price}</span>
                            <a href="${item.bundle.buy_url}" target="_blank" rel="noopener" class="buy-btn">Get Bundle</a>
                        </div>
                        <div class="bundle-savings">Save $${item.bundle.savings}! Best value for all formats.</div>
                    </div>
                    
                    <div class="format-section">
                        <h3>📱 Individual Digital Formats</h3>
                        <div class="format-list">
                            ${item.digital.map(format => `
                                <div class="format-item">
                                    <span class="format-name">${format.format}</span>
                                    <span class="format-price">$${format.price}</span>
                                    <a href="${format.buy_url}" target="_blank" rel="noopener" class="buy-btn">Buy</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="format-section">
                        <h3>📚 Print Editions</h3>
                        <div class="format-list">
                            ${item.print.map(format => `
                                <div class="format-item">
                                    <span class="format-name">${format.format}</span>
                                    <span class="format-price">$${format.price}${format.shipping ? ' + shipping' : ''}</span>
                                    <a href="${format.buy_url}" target="_blank" rel="noopener" class="buy-btn">Order</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }
    
    // ===== PROJECT MODAL =====
    showProjectModal(project) {
        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.createProjectModalContent(project);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        this.trackEvent('project_viewed', {
            project_id: project.id,
            project_title: project.title,
            project_category: project.category
        });
    }
    
    createProjectModalContent(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        
        return `
            <div class="project-modal-header">
                <div class="project-modal-image" aria-hidden="true">${project.image}</div>
                <h2 id="modal-title">${project.title}</h2>
                <p class="project-modal-description">${project.description}</p>
                <div class="project-modal-meta">
                    <div><strong>Problem Solved:</strong> ${project.problemSolved}</div>
                    <div><strong>Build Time:</strong> ${project.buildTime}</div>
                    <div><strong>Difficulty:</strong> ${this.formatDifficulty(project.difficulty)}</div>
                </div>
            </div>
            
            <div class="project-modal-instructions">
                <h3>🔧 Build Instructions</h3>
                <p>${project.instructions}</p>
                ${project.lyricEasterEgg ? `<blockquote class="stage-lyric">${project.lyricEasterEgg}</blockquote>` : ''}
            </div>
            
            <div class="project-modal-parts">
                <div class="parts-section">
                    <h3>🎸 GA Build - $${functionalTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.functionalParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-festival btn-primary full-width" onclick="app.addToCart(${project.id}, 'functional'); app.closeModal();">
                        🎸 Add GA Build to Cart - $${functionalTotal.toFixed(2)}
                    </button>
                </div>
                
                <div class="parts-section">
                    <h3>✨ VIP Build - $${extravagantTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.extravagantParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-festival btn-secondary full-width" onclick="app.addToCart(${project.id}, 'extravagant'); app.closeModal();">
                        ✨ Add VIP Build to Cart - $${extravagantTotal.toFixed(2)}
                    </button>
                </div>
            </div>
        `;
    }
    
    closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    // ===== QUICK ACTIONS =====
    surpriseMe() {
        const surprises = [
            () => this.showRandomProject(),
            () => this.showInspiration(),
            () => this.goToStage(Math.floor(Math.random() * this.stages.length)),
            () => this.showRandomLyric()
        ];
        
        const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
        randomSurprise();
        
        this.trackEvent('surprise_me_clicked');
    }
    
    showRandomProject() {
        if (this.projects.length === 0) return;
        
        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        
        // Go to projects stage if not already there
        if (this.currentStage !== 0) {
            this.goToStage(0);
        }
        
        // Highlight the random project
        setTimeout(() => {
            const projectCard = document.querySelector(`[data-project-id="${randomProject.id}"]`);
            if (projectCard) {
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectCard.style.transform = 'scale(1.05)';
                projectCard.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.4)';
                
                setTimeout(() => {
                    projectCard.style.transform = '';
                    projectCard.style.boxShadow = '';
                }, 2000);
            }
        }, this.currentStage === 0 ? 100 : 700);
        
        
        this.trackEvent('random_project_shown', {
            project_id: randomProject.id,
            project_title: randomProject.title
        });
    }
    
    showInspiration() {
        const inspirations = [
            ...this.lyrics.grateful_dead,
            ...this.lyrics.phish,
            ...this.lyrics.festival_general
        ];
        
        const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
        
        const modal = document.getElementById('inspirationModal');
        const text = document.getElementById('inspirationText');
        
        text.textContent = randomInspiration;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeInspiration();
        }, 5000);
        
        this.trackEvent('inspiration_shown', {
            inspiration_text: randomInspiration
        });
    }
    
    closeInspiration() {
        const modal = document.getElementById('inspirationModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    showRandomLyric() {
        const allLyrics = Object.values(this.lyrics).flat();
        const randomLyric = allLyrics[Math.floor(Math.random() * allLyrics.length)];
        this.showNotification(randomLyric, 'lyric');
    }
    
    // ===== THEME MANAGEMENT =====
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('jamcamping-theme', this.theme);
        
        this.trackEvent('theme_changed', {
            new_theme: this.theme
        });
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    // ===== FESTIVAL GREETING =====
    showFestivalGreeting() {
        const greeting = this.getFestivalGreeting();
        const greetingEl = document.getElementById('festivalGreeting');
        const greetingText = document.querySelector('.greeting-text');
        
        if (greetingText && greeting) {
            greetingText.textContent = greeting;
            greetingEl.classList.add('show');
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                this.closeFestivalGreeting();
            }, 8000);
        }
    }
    
    getFestivalGreeting() {
        const hour = new Date().getHours();
        let timeCategory;
        
        if (hour < 12) timeCategory = 'morning';
        else if (hour < 17) timeCategory = 'afternoon';
        else if (hour < 22) timeCategory = 'evening';
        else timeCategory = 'late';
        
        const greetings = this.greetings[timeCategory];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    closeFestivalGreeting() {
        const greetingEl = document.getElementById('festivalGreeting');
        greetingEl.classList.remove('show');
    }
    
    // ===== SOCIAL PROOF =====
    setupSocialProof() {
        const activities = [
            "Someone in California just added Monkey Hut to cart! 🏛️",
            "3 people are viewing LED Totem project right now 🌈",
            "Festival-goer in Texas just bought the Cosmic Knowledge bundle 📚",
            "Someone just completed their Swamp Cooler build! ❄️",
            "New builder from Colorado exploring shade projects 🏠",
            "Someone's building their dream campsite right now! ✨"
        ];
        
        // Show social proof every 30-60 seconds
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance
                const activity = activities[Math.floor(Math.random() * activities.length)];
                this.showSocialProof(activity);
            }
        }, 45000);
    }
    
    showSocialProof(message) {
        const container = document.getElementById('socialProof');
        
        const notification = document.createElement('div');
        notification.className = 'social-proof-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">👥</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // ===== FORM HANDLING =====
    handleProjectSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData);
        
        // Basic validation
        const errors = this.validateProjectForm(projectData);
        if (errors.length > 0) {
            this.showFormErrors(errors);
            return;
        }
        
        // Clear any existing errors
        this.clearFormErrors();
        
        // Simulate submission
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.showNotification(`Thanks for submitting "${projectData.projectName}"! We'll review it and get back to you with some cosmic feedback! ✨`, 'success');
            e.target.reset();
            
            this.trackEvent('project_submitted', {
                project_name: projectData.projectName,
                project_category: projectData.projectCategory
            });
        }, 2000);
    }
    
    validateProjectForm(data) {
        const errors = [];
        
        if (!data.projectName || data.projectName.trim().length < 3) {
            errors.push({ field: 'projectName', message: 'Project name must be at least 3 characters' });
        }
        
        if (!data.projectDescription || data.projectDescription.trim().length < 10) {
            errors.push({ field: 'projectDescription', message: 'Description must be at least 10 characters' });
        }
        
        if (!data.projectCategory) {
            errors.push({ field: 'projectCategory', message: 'Please select a category' });
        }
        
        if (!data.submitterEmail || !this.isValidEmail(data.submitterEmail)) {
            errors.push({ field: 'submitterEmail', message: 'Please enter a valid email address' });
        }
        
        return errors;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showFormErrors(errors) {
        errors.forEach(error => {
            const errorEl = document.getElementById(`${error.field}-error`);
            if (errorEl) {
                errorEl.textContent = error.message;
                errorEl.classList.add('show');
            }
        });
    }
    
    clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(errorEl => {
            errorEl.classList.remove('show');
        });
    }
    
    // ===== UTILITIES =====
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: var(--card-color);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    box-shadow: var(--shadow-lg);
                    z-index: var(--z-popover);
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-color);
                }
                
                .notification-lyric {
                    border-left: 4px solid var(--accent-color);
                    font-style: italic;
                }
                
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-3);
                }
                
                .notification-text {
                    flex: 1;
                    font-size: var(--text-sm);
                    line-height: 1.5;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: var(--text-lg);
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    openHelp() {
        window.open('mailto:jamcampinghq@gmail.com?subject=JamCamping Help Request&body=Hey there! I need some help with...', '_blank');
        
        this.trackEvent('help_opened');
    }
    
    handleKeyboard(e) {
        // Escape key handling
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeSearch();
            this.closeCart();
            this.closeMenu();
            this.closeInspiration();
        }
        
        // Arrow key navigation for stages
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft' || e.key === 'h') {
                this.previousStage();
                e.preventDefault();
            } else if (e.key === 'ArrowRight' || e.key === 'l') {
                this.nextStage();
                e.preventDefault();
            }
        }
        
        // Number keys for direct stage navigation
        if (e.key >= '1' && e.key <= '5') {
            const stageIndex = parseInt(e.key) - 1;
            this.goToStage(stageIndex);
            e.preventDefault();
        }
    }
    
    handleResize() {
        // Update any responsive calculations if needed
        this.snapToCurrentStage();
    }
    
    // ===== ANALYTICS =====
    setupAnalytics() {
        this.startTime = Date.now();
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDepth = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollDepth)) {
                    this.trackEvent('scroll_depth', {
                        depth_percentage: scrollDepth
                    });
                }
            }
        });
    }
    
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getUserId() {
        let userId = localStorage.getItem('jamcamping-user-id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            localStorage.setItem('jamcamping-user-id', userId);
        }
        return userId;
    }
    
    trackEvent(eventName, parameters = {}) {
        const event = {
            event_name: eventName,
            timestamp: Date.now(),
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            current_stage: this.stages[this.currentStage],
            ...parameters
        };
        
        this.events.push(event);
        
        // Send to Google Analytics 4 if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Store locally for analysis
        this.storeEventLocally(event);
        
        console.log('📊 Event tracked:', eventName, parameters);
    }
    
    storeEventLocally(event) {
        const localEvents = JSON.parse(localStorage.getItem('jamcamping-events') || '[]');
        localEvents.push(event);
        
        // Keep only last 100 events
        if (localEvents.length > 100) {
            localEvents.splice(0, localEvents.length - 100);
        }
        
        localStorage.setItem('jamcamping-events', JSON.stringify(localEvents));
    }
    
    trackTimeOnPage() {
        const timeOnPage = Date.now() - this.startTime;
        this.trackEvent('time_on_page', {
            duration_ms: timeOnPage,
            duration_seconds: Math.round(timeOnPage / 1000)
        });
    }
}

// ===== GLOBAL INITIALIZATION =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new JamCampingApp();
    window.app = app; // Make available globally for onclick handlers
});

// Handle browser navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && app) {
        const stageIndex = app.stages.indexOf(hash);
        if (stageIndex >= 0) {
            app.goToStage(stageIndex);
        }
    }
});

// Handle initial hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && app) {
        const stageIndex = app.stages.indexOf(hash);
        if (stageIndex >= 0) {
            app.goToStage(stageIndex);
        }
    }
});

// ===== KONAMI CODE EASTER EGG =====
(() => {
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let userInput = [];
    
    document.addEventListener('keydown', (e) => {
        userInput.push(e.code);
        userInput = userInput.slice(-konamiCode.length);
        
        if (userInput.join(',') === konamiCode.join(',')) {
            activateDeadheadMode();
        }
    });
    
    function activateDeadheadMode() {
        // Special deadhead theme
        document.body.classList.add('deadhead-mode');
        
        // Show special message
        if (app) {
            app.showNotification("Welcome to the family, fellow deadhead! 💀🌹 You've unlocked the secret cosmic mode!", 'success');
            app.trackEvent('konami_code_activated');
        }
        
        // Add dancing bears
        for (let i = 0; i < 5; i++) {
            const bear = document.createElement('div');
            bear.innerHTML = '🐻';
            bear.style.cssText = `
                position: fixed;
                font-size: 3rem;
                z-index: 9999;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: dancingBear 3s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            document.body.appendChild(bear);
            
            setTimeout(() => bear.remove(), 10000);
        }
        
        // Add dancing bear animation
        if (!document.querySelector('#dancing-bear-styles')) {
            const styles = document.createElement('style');
            styles.id = 'dancing-bear-styles';
            styles.textContent = `
                @keyframes dancingBear {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-20px) rotate(10deg); }
                    50% { transform: translateY(-10px) rotate(-5deg); }
                    75% { transform: translateY(-15px) rotate(8deg); }
                }
                
                .deadhead-mode {
                    --primary-color: #8b4513;
                    --secondary-color: #cd853f;
                    --accent-color: #ff6347;
                }
            `;
            document.head.appendChild(styles);
        }
    }
})();