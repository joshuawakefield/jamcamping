// ===== JAMCAMPING MAIN APPLICATION =====
// Festival-themed DIY project browser with swipeable stages

class JamCampingApp {
    constructor() {
        this.projects = [];
        this.shopItems = [];
        this.currentStage = 0;
        this.stages = ['main', 'vendor', 'chill', 'submit', 'contact'];
        this.cart = JSON.parse(localStorage.getItem('jamcamping-cart') || '[]');
        this.theme = localStorage.getItem('jamcamping-theme') || 'light';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.applyTheme();
            this.renderProjects();
            this.renderShopItems();
            this.updateCartBadge();
            this.showFestivalGreeting();
            this.setupStageNavigation();
        } catch (error) {
            console.error('Failed to initialize JamCamping:', error);
            this.showErrorMessage('Failed to load the magic. Please refresh and try again.');
        }
    }

    async loadData() {
        try {
            const [projectsResponse, shopResponse] = await Promise.all([
                fetch('/data/projects.json'),
                fetch('/data/shop.json')
            ]);

            if (!projectsResponse.ok || !shopResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            this.projects = await projectsResponse.json();
            this.shopItems = await shopResponse.json();
        } catch (error) {
            console.error('Data loading error:', error);
            // Fallback to empty arrays
            this.projects = [];
            this.shopItems = [];
        }
    }

    setupEventListeners() {
        // Menu toggles
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            this.toggleMenu();
        });

        document.getElementById('menuClose')?.addEventListener('click', () => {
            this.closeMenu();
        });

        document.getElementById('menuOverlay')?.addEventListener('click', () => {
            this.closeMenu();
        });

        // Search functionality
        document.getElementById('searchToggle')?.addEventListener('click', () => {
            this.toggleSearch();
        });

        document.getElementById('searchClose')?.addEventListener('click', () => {
            this.closeSearch();
        });

        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Cart functionality
        document.getElementById('cartToggle')?.addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('cartClose')?.addEventListener('click', () => {
            this.closeCart();
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Help toggle
        document.getElementById('helpToggle')?.addEventListener('click', () => {
            window.open('mailto:jamcampinghq@gmail.com?subject=JamCamping Help Request', '_blank');
        });

        // Quick actions
        document.getElementById('surpriseMe')?.addEventListener('click', () => {
            this.surpriseMe();
        });

        document.getElementById('randomBuild')?.addEventListener('click', () => {
            this.showRandomProject();
        });

        document.getElementById('getInspired')?.addEventListener('click', () => {
            this.showInspiration();
        });

        // Filter controls
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        document.getElementById('difficultyFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        // Stage navigation
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToStage(index);
            });
        });

        document.querySelectorAll('[data-stage]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const stageIndex = parseInt(link.dataset.stage);
                this.goToStage(stageIndex);
                this.closeMenu();
            });
        });

        // Form submission
        document.getElementById('submitForm')?.addEventListener('submit', (e) => {
            this.handleProjectSubmission(e);
        });

        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('projectModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeModal();
            }
        });

        // Greeting close
        document.querySelector('.greeting-close')?.addEventListener('click', () => {
            this.closeFestivalGreeting();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Touch/swipe gestures
        this.setupTouchGestures();
    }

    setupTouchGestures() {
        let startX, startY, startTime;
        let currentX, currentY;
        let isDragging = false;

        const container = document.querySelector('.stage-container');
        if (!container) return;

        // Touch events
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isDragging = true;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
            }
        });

        container.addEventListener('touchend', (e) => {
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
            }
        });
    }

    setupStageNavigation() {
        // Initialize stage positions
        this.updateStagePosition();
        this.updateStageIndicators();
    }

    goToStage(index) {
        if (index >= 0 && index < this.stages.length && index !== this.currentStage) {
            this.currentStage = index;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL();
        }
    }

    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL();
        }
    }

    previousStage() {
        if (this.currentStage > 0) {
            this.currentStage--;
            this.updateStagePosition();
            this.updateStageIndicators();
            this.updateURL();
        }
    }

    updateStagePosition() {
        const container = document.querySelector('.stage-container');
        if (!container) return;

        const offset = -this.currentStage * 100;
        container.style.transform = `translateX(${offset}vw)`;

        // Update active stage
        document.querySelectorAll('.stage').forEach((stage, index) => {
            stage.classList.toggle('active', index === this.currentStage);
        });
    }

    updateStageIndicators() {
        document.querySelectorAll('.stage-indicator').forEach((indicator, index) => {
            const isActive = index === this.currentStage;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    }

    updateURL() {
        const stageName = this.stages[this.currentStage];
        const newURL = stageName === 'main' ? '/' : `/#${stageName}`;
        history.pushState({ stage: stageName }, '', newURL);
    }

    handleKeyboardNavigation(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return; // Don't interfere with form inputs
        }

        switch(e.key) {
            case 'Escape':
                this.closeModal();
                this.closeMenu();
                this.closeSearch();
                this.closeCart();
                break;
            case 'ArrowLeft':
            case 'h':
                this.previousStage();
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'l':
                this.nextStage();
                e.preventDefault();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const stageIndex = parseInt(e.key) - 1;
                if (stageIndex < this.stages.length) {
                    this.goToStage(stageIndex);
                }
                e.preventDefault();
                break;
        }
    }

    toggleMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        const isActive = menu.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
        toggle.setAttribute('aria-expanded', isActive);
        menu.setAttribute('aria-hidden', !isActive);
    }

    closeMenu() {
        const menu = document.getElementById('navigationMenu');
        const overlay = document.getElementById('menuOverlay');
        const toggle = document.getElementById('menuToggle');
        
        menu.classList.remove('active');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }

    toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        
        const isActive = searchOverlay.classList.toggle('active');
        searchOverlay.setAttribute('aria-hidden', !isActive);
        
        if (isActive) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        searchOverlay.classList.remove('active');
        searchOverlay.setAttribute('aria-hidden', 'true');
    }

    handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    searchContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        // Search projects
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

        // Search shop items
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

        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    calculateSearchScore(query, item) {
        let score = 0;
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();

        if (title.includes(query)) score += 10;
        if (description.includes(query)) score += 5;
        if (item.category && item.category.toLowerCase().includes(query)) score += 8;

        return score;
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result">
                    <div class="result-title">No results found</div>
                    <div class="result-description">Try searching for "shade", "lighting", or "cooling"</div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(result => `
                <div class="search-result" onclick="app.openSearchResult('${result.type}', '${result.id}')">
                    <div class="result-type">${result.type}</div>
                    <div class="result-title">${this.highlightQuery(result.title, query)}</div>
                    <div class="result-description">${this.highlightQuery(result.description, query)}</div>
                </div>
            `).join('');
        }
    }

    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    openSearchResult(type, id) {
        this.closeSearch();
        
        if (type === 'project') {
            this.showProjectModal(parseInt(id));
        } else if (type === 'shop') {
            this.goToStage(1); // Go to shop stage
        }
    }

    toggleCart() {
        const cart = document.getElementById('cartSidebar');
        cart.classList.toggle('active');
        cart.setAttribute('aria-hidden', !cart.classList.contains('active'));
    }

    closeCart() {
        const cart = document.getElementById('cartSidebar');
        cart.classList.remove('active');
        cart.setAttribute('aria-hidden', 'true');
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('jamcamping-theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    renderProjects() {
        const container = document.getElementById('projectsGrid');
        if (!container || this.projects.length === 0) return;

        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');

        // Add click listeners to project cards
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = parseInt(card.dataset.projectId);
                this.showProjectModal(projectId);
            });
        });
    }

    createProjectCard(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

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
                    <h3>${item.title}</h3>
                    <p class="shop-description">${item.description}</p>
                    
                    <div class="bundle-highlight">
                        <div class="format-item">
                            <span class="format-name">Digital Bundle (${item.bundle.formats.join(', ')})</span>
                            <span class="format-price">$${item.bundle.price}</span>
                            <a href="${item.bundle.buy_url}" target="_blank" class="buy-btn">Get Bundle</a>
                        </div>
                        <div class="bundle-savings">Save $${item.bundle.savings}!</div>
                    </div>

                    <div class="format-section">
                        <h4>📱 Digital Formats</h4>
                        <div class="format-list">
                            ${item.digital.map(format => `
                                <div class="format-item">
                                    <span class="format-name">${format.format}</span>
                                    <span class="format-price">$${format.price}</span>
                                    <a href="${format.buy_url}" target="_blank" class="buy-btn">Buy</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="format-section">
                        <h4>📚 Print Editions</h4>
                        <div class="format-list">
                            ${item.print.map(format => `
                                <div class="format-item">
                                    <span class="format-name">${format.format}</span>
                                    <span class="format-price">$${format.price}${format.shipping ? ' + shipping' : ''}</span>
                                    <a href="${format.buy_url}" target="_blank" class="buy-btn">Order</a>
                                </div>
                            `).join('')}
                        </div>
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
    }

    showProjectModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = this.createProjectModalContent(project);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    createProjectModalContent(project) {
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

    closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    addToCart(projectId, buildType) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const parts = buildType === 'functional' ? project.functionalParts : project.extravagantParts;
        const total = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        const cartItem = {
            id: `${projectId}-${buildType}`,
            projectId,
            buildType,
            title: project.title,
            emoji: project.image,
            total: total,
            parts: parts
        };

        // Check if item already exists
        const existingIndex = this.cart.findIndex(item => item.id === cartItem.id);
        if (existingIndex >= 0) {
            // Update existing item
            this.cart[existingIndex] = cartItem;
        } else {
            // Add new item
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.updateCartBadge();
        this.updateCartDisplay();
        this.showCartNotification(project.title, buildType);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartBadge();
        this.updateCartDisplay();
    }

    saveCart() {
        localStorage.setItem('jamcamping-cart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = this.cart.length;
            badge.classList.toggle('hidden', this.cart.length === 0);
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartItems) return;

        if (this.cart.length === 0) {
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

            const total = this.cart.reduce((sum, item) => sum + item.total, 0);
            if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
    }

    showCartNotification(projectTitle, buildType) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">Added ${projectTitle} (${buildType.toUpperCase()}) to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    surpriseMe() {
        const surprises = [
            () => this.showRandomProject(),
            () => this.showInspiration(),
            () => this.goToStage(Math.floor(Math.random() * this.stages.length)),
            () => this.filterProjects()
        ];

        const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
        randomSurprise();
    }

    showRandomProject() {
        if (this.projects.length === 0) return;

        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        this.goToStage(0); // Go to main stage
        
        setTimeout(() => {
            const projectCard = document.querySelector(`[data-project-id="${randomProject.id}"]`);
            if (projectCard) {
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectCard.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    projectCard.style.transform = '';
                }, 1000);
            }
        }, 300);
    }

    showInspiration() {
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

        const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
        
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

    showFestivalGreeting() {
        const greeting = document.getElementById('festivalGreeting');
        const greetingText = document.querySelector('.greeting-text');
        
        if (!greeting || !greetingText) return;

        const greetings = [
            "🎪 Welcome to the digital Shakedown Street!",
            "✨ Ready to make your campsite legendary?",
            "🌈 Festival family, let's build something magical!",
            "🎸 Time to turn your camp into a cosmic basecamp!",
            "🔥 Get ready for some epic DIY inspiration!"
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        greetingText.textContent = randomGreeting;
        
        setTimeout(() => {
            greeting.classList.add('show');
        }, 1000);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.closeFestivalGreeting();
        }, 6000);
    }

    closeFestivalGreeting() {
        const greeting = document.getElementById('festivalGreeting');
        if (greeting) {
            greeting.classList.remove('show');
        }
    }

    handleProjectSubmission(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData);
        
        // Simulate submission
        alert(`Thanks for submitting "${projectData.projectName}"! We'll review it and get back to you at ${projectData.submitterEmail}.`);
        e.target.reset();
    }

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
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JamCampingApp();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.stage && window.app) {
        const stageIndex = window.app.stages.indexOf(e.state.stage);
        if (stageIndex >= 0) {
            window.app.goToStage(stageIndex);
        }
    }
});

// Handle initial hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && window.app) {
        const stageIndex = window.app.stages.indexOf(hash);
        if (stageIndex >= 0) {
            window.app.goToStage(stageIndex);
        }
    }
});

// Service Worker registration for PWA capabilities
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