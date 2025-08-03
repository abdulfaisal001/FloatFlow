class FloatFocusApp {
    constructor() {
        this.initializeData();
        this.initializeElements();
        this.initializeFloatingFeatures();
        this.initializeEventListeners();
        this.initializeTimer();
        this.initializeWallpapers();
        this.initializeQuotes();
        this.updateDisplay();
        this.checkAchievements();
        this.updateHabitTracker();
        
        // Show onboarding after a short delay to ensure everything is loaded
        setTimeout(() => this.showOnboarding(), 500);
    }

    initializeData() {
        // Timer states
        this.timerState = {
            isRunning: false,
            currentMode: 'focus',
            timeLeft: 1500, // 25 minutes
            totalTime: 1500,
            cycles: 0
        };

        // Timer durations (in seconds)
        this.timerModes = {
            focus: 1500,      // 25 minutes
            'short-break': 300,   // 5 minutes
            'long-break': 900     // 15 minutes
        };

        // Load data from localStorage or set defaults
        this.userData = this.loadUserData();
        this.tasks = this.loadTasks();
        this.achievements = this.loadAchievements();
        
        // Wallpaper system
        this.currentWallpaperIndex = 0;
        this.wallpaperChangeInterval = null;
        this.currentCategory = 'general';
        
        // Quotes system
        this.currentQuoteIndex = 0;
        this.quoteInterval = null;
        
        // Timer interval
        this.timerInterval = null;
        
        // Floating features
        this.pipWindow = null;
        this.deferredPrompt = null;
        this.floatingDragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        
        // Feature detection
        this.features = {
            pip: 'documentPictureInPicture' in window,
            notifications: 'Notification' in window,
            pwa: 'serviceWorker' in navigator
        };
        
        // OS detection
        this.os = this.detectOS();
        
        // Unsplash categories
        this.unsplashCategories = {
            coding: ['coding setup', 'developer workspace', 'programming', 'tech desk', 'computer programming'],
            study: ['library', 'studying', 'books', 'academic', 'university'],
            writing: ['writing desk', 'notebook', 'typewriter', 'cozy office', 'literary'],
            creative: ['art studio', 'creative workspace', 'design', 'artistic', 'inspiration'],
            meeting: ['conference room', 'business meeting', 'professional office', 'corporate'],
            fitness: ['gym', 'workout', 'fitness motivation', 'exercise', 'healthy lifestyle'],
            reading: ['reading nook', 'bookshelf', 'cozy reading', 'library corner', 'literary scene'],
            general: ['minimalist workspace', 'clean desk', 'productivity', 'modern office', 'organized']
        };

        // Motivational quotes
        this.quotes = {
            general: [
                {text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney"},
                {text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill"},
                {text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson"},
                {text: "The future depends on what you do today.", author: "Mahatma Gandhi"},
                {text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle"}
            ],
            coding: [
                {text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House"},
                {text: "First, solve the problem. Then, write the code.", author: "John Johnson"},
                {text: "Talk is cheap. Show me the code.", author: "Linus Torvalds"},
                {text: "The best error message is the one that never shows up.", author: "Thomas Fuchs"}
            ],
            study: [
                {text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela"},
                {text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert"},
                {text: "Learning never exhausts the mind.", author: "Leonardo da Vinci"}
            ]
        };
    }

    initializeElements() {
        // Timer elements
        this.timerTime = document.getElementById('timer-time');
        this.timerLabel = document.getElementById('timer-label');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.progressRing = document.querySelector('.progress-ring__circle');
        this.modeButtons = document.querySelectorAll('.mode-btn');

        // Background elements
        this.backgroundImage1 = document.getElementById('background-image-1');
        this.backgroundImage2 = document.getElementById('background-image-2');
        this.newWallpaperBtn = document.getElementById('new-wallpaper-btn');

        // Task elements
        this.currentTaskDiv = document.getElementById('current-task');
        this.tasksListDiv = document.getElementById('tasks-list');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');

        // Progress elements
        this.completedPomodoros = document.getElementById('completed-pomodoros');
        this.currentStreak = document.getElementById('current-streak');
        this.focusTime = document.getElementById('focus-time');
        this.userLevel = document.getElementById('user-level');
        this.currentXP = document.getElementById('current-xp');
        this.xpProgress = document.getElementById('xp-progress');
        this.xpToNext = document.getElementById('xp-to-next');

        // Quote elements
        this.quoteText = document.getElementById('quote-text');
        this.quoteAuthor = document.getElementById('quote-author');

        // Floating timer
        this.floatingTimer = document.getElementById('floating-timer');
        this.floatingTime = document.getElementById('floating-time');
        this.floatingPlayPause = document.getElementById('floating-play-pause');
        this.floatingClose = document.getElementById('floating-close');
        this.floatToggle = document.getElementById('float-toggle');
        this.floatingProgressCircle = document.querySelector('.floating-progress-circle');

        // Enhanced floating elements
        this.pipToggle = document.getElementById('pip-toggle');
        this.floatingPip = document.getElementById('floating-pip');
        this.onboardingModal = document.getElementById('onboarding-modal');
        this.solutionsModal = document.getElementById('solutions-modal');
        this.floatingNotice = document.getElementById('floating-notice');
        this.pwaInstallBanner = document.getElementById('pwa-install-banner');

        // Other UI elements
        this.themeToggle = document.getElementById('theme-toggle');
        this.helpBtn = document.getElementById('help-btn');
        this.achievementsList = document.getElementById('achievements-list');
        this.habitChain = document.getElementById('habit-chain');
        this.habitStrengthBar = document.getElementById('habit-strength-bar');
        this.habitStrengthText = document.getElementById('habit-strength-text');
        this.notifications = document.getElementById('notifications');
    }

    initializeFloatingFeatures() {
        // Setup PWA manifest dynamically
        this.setupPWAManifest();
        
        // Check for PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showPWAInstallBanner();
        });

        // Request notification permission
        if (this.features.notifications && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Populate OS tools information
        this.populateOSTools();

        // Initialize draggable floating timer
        this.initializeDraggableTimer();
        
        // Show PWA install banner after a delay if supported
        setTimeout(() => {
            if (this.features.pwa && !localStorage.getItem('floatfocus_pwa_dismissed')) {
                this.showPWAInstallBanner();
            }
        }, 3000);
    }

    initializeEventListeners() {
        // Timer controls - Direct event binding
        if (this.startPauseBtn) {
            this.startPauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTimer();
            });
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetTimer();
            });
        }
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.skipSession();
            });
        }

        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode(btn.dataset.mode);
            });
        });

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Help button
        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSolutionsModal();
            });
        }

        // Floating timer controls
        if (this.floatToggle) {
            this.floatToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFloatingTimer();
            });
        }
        if (this.floatingPlayPause) {
            this.floatingPlayPause.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTimer();
            });
        }
        if (this.floatingClose) {
            this.floatingClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFloatingTimer();
            });
        }

        // Picture-in-Picture controls
        if (this.pipToggle) {
            this.pipToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePiP();
            });
        }
        if (this.floatingPip) {
            this.floatingPip.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePiP();
            });
        }

        // Wallpaper button
        if (this.newWallpaperBtn) {
            this.newWallpaperBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadNewWallpaper();
            });
        }

        // Task form
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Use event delegation for better compatibility
        document.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Onboarding controls
            if (e.target.id === 'skip-onboarding') {
                this.hideOnboarding();
                return;
            }
            if (e.target.id === 'try-pip') {
                this.hideOnboarding();
                this.togglePiP();
                return;
            }
            if (e.target.id === 'show-solutions') {
                this.showSolutionsModal();
                return;
            }
            if (e.target.id === 'dismiss-notice') {
                this.hideFloatingNotice();
                return;
            }

            // Solutions modal controls
            if (e.target.id === 'close-solutions') {
                this.hideSolutionsModal();
                return;
            }
            if (e.target.id === 'start-pip') {
                this.togglePiP();
                this.hideSolutionsModal();
                return;
            }
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
                return;
            }

            // PWA installation
            if (e.target.id === 'install-pwa-btn' || e.target.id === 'install-pwa-solutions' || e.target.id === 'pwa-install') {
                this.installPWA();
                return;
            }
            if (e.target.id === 'pwa-dismiss') {
                this.hidePWABanner();
                return;
            }

            // Task management
            if (e.target.id === 'add-task-btn' || e.target.id === 'add-task-header-btn') {
                this.showTaskModal();
                return;
            }
            if (e.target.id === 'close-modal' || e.target.id === 'cancel-task') {
                this.hideTaskModal();
                return;
            }

            // Dynamic task actions
            if (e.target.classList.contains('task-select-btn')) {
                const taskId = parseInt(e.target.dataset.taskId);
                this.selectTask(taskId);
                return;
            }
            if (e.target.classList.contains('task-delete-btn')) {
                const taskId = parseInt(e.target.dataset.taskId);
                this.deleteTask(taskId);
                return;
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Modal click outside to close
        if (this.taskModal) {
            this.taskModal.addEventListener('click', (e) => {
                if (e.target === this.taskModal) {
                    this.hideTaskModal();
                }
            });
        }

        if (this.solutionsModal) {
            this.solutionsModal.addEventListener('click', (e) => {
                if (e.target === this.solutionsModal) {
                    this.hideSolutionsModal();
                }
            });
        }

        if (this.onboardingModal) {
            this.onboardingModal.addEventListener('click', (e) => {
                if (e.target === this.onboardingModal) {
                    this.hideOnboarding();
                }
            });
        }
    }

    // Floating Features Implementation
    detectOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
    }

    setupPWAManifest() {
        const manifest = {
            name: "FloatFocus - Enhanced Pomodoro Timer",
            short_name: "FloatFocus",
            description: "Enhanced floating Pomodoro timer with always-on-top solutions",
            start_url: "/",
            display: "standalone",
            background_color: "#1f2121",
            theme_color: "#218085",
            icons: [
                {
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23218085'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white'%3E🍅%3C/text%3E%3C/svg%3E",
                    sizes: "192x192",
                    type: "image/svg+xml"
                },
                {
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23218085'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white'%3E🍅%3C/text%3E%3C/svg%3E",
                    sizes: "512x512",
                    type: "image/svg+xml"
                }
            ]
        };

        const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(manifestBlob);
        
        const manifestPlaceholder = document.getElementById('manifest-placeholder');
        if (manifestPlaceholder) {
            manifestPlaceholder.href = manifestURL;
        }
    }

    populateOSTools() {
        const osToolsContainer = document.getElementById('os-tools');
        const osInstructionsContainer = document.getElementById('os-instructions');
        
        const osTools = {
            windows: {
                name: 'Microsoft PowerToys',
                icon: '🪟',
                shortcut: 'Win + Ctrl + T',
                description: 'Built-in Windows tool for always-on-top',
                steps: [
                    'Install Microsoft PowerToys from the Microsoft Store',
                    'Enable the "Always On Top" feature in PowerToys settings',
                    'Use Win + Ctrl + T to toggle any window to stay on top',
                    'Works with FloatFocus PWA or browser windows'
                ]
            },
            macos: {
                name: 'Afloat or HyperDock',
                icon: '🍎',
                shortcut: 'System dependent',
                description: 'Third-party tools for window management',
                steps: [
                    'Install Afloat, HyperDock, or similar window manager',
                    'Grant necessary system permissions',
                    'Right-click on FloatFocus window title bar',
                    'Select "Keep on Top" or similar option'
                ]
            },
            linux: {
                name: 'Window Manager Settings',
                icon: '🐧',
                shortcut: 'Alt + F10 (usually)',
                description: 'Most Linux window managers support always-on-top',
                steps: [
                    'Right-click on FloatFocus window title bar',
                    'Look for "Always on Top" or "Keep Above" option',
                    'Or use Alt + F10 keyboard shortcut',
                    'Varies by desktop environment (GNOME, KDE, etc.)'
                ]
            }
        };

        const currentOSTool = osTools[this.os] || osTools.windows;

        // Populate onboarding OS tools
        if (osToolsContainer) {
            osToolsContainer.innerHTML = `
                <div class="os-tool">
                    <div class="os-tool-icon">${currentOSTool.icon}</div>
                    <div class="os-tool-info">
                        <h5>${currentOSTool.name}</h5>
                        <p>${currentOSTool.description}</p>
                        <div class="os-tool-shortcut">${currentOSTool.shortcut}</div>
                    </div>
                </div>
            `;
        }

        // Populate solutions modal OS instructions
        if (osInstructionsContainer) {
            osInstructionsContainer.innerHTML = Object.entries(osTools).map(([osName, tool]) => `
                <div class="os-instruction ${osName === this.os ? 'current-os' : ''}">
                    <h5>${tool.icon} ${tool.name}</h5>
                    <ul class="os-instruction-steps">
                        ${tool.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }

    showOnboarding() {
        // Show onboarding only on first visit
        const hasSeenOnboarding = localStorage.getItem('floatfocus_onboarding_seen');
        if (!hasSeenOnboarding && this.onboardingModal) {
            this.onboardingModal.classList.remove('hidden');
            this.updatePiPStatus();
            localStorage.setItem('floatfocus_onboarding_seen', 'true');
        } else {
            // Show floating notice for returning users
            setTimeout(() => this.showFloatingNotice(), 2000);
        }
    }

    hideOnboarding() {
        if (this.onboardingModal) {
            this.onboardingModal.classList.add('hidden');
        }
        setTimeout(() => this.showFloatingNotice(), 1000);
    }

    showFloatingNotice() {
        if (this.floatingNotice && !localStorage.getItem('floatfocus_notice_dismissed')) {
            this.floatingNotice.classList.remove('hidden');
        }
    }

    hideFloatingNotice() {
        if (this.floatingNotice) {
            this.floatingNotice.classList.add('hidden');
            localStorage.setItem('floatfocus_notice_dismissed', 'true');
        }
    }

    updatePiPStatus() {
        const pipStatus = document.getElementById('pip-status');
        const pipBrowserStatus = document.getElementById('pip-browser-status');
        
        const status = this.features.pip ? 'Available' : 'Not Supported';
        const statusClass = this.features.pip ? 'status--success' : 'status--warning';
        
        if (pipStatus) {
            pipStatus.textContent = status;
            pipStatus.className = `solution-status ${statusClass}`;
        }
        
        if (pipBrowserStatus) {
            const browserInfo = this.getBrowserPiPInfo();
            pipBrowserStatus.textContent = browserInfo;
        }
    }

    getBrowserPiPInfo() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome')) {
            return this.features.pip ? 'Chrome 116+ ✅' : 'Chrome version too old';
        }
        if (userAgent.includes('edge')) {
            return this.features.pip ? 'Edge 116+ ✅' : 'Edge version too old';
        }
        if (userAgent.includes('firefox')) {
            return 'Firefox: Not supported ❌';
        }
        if (userAgent.includes('safari')) {
            return 'Safari: Not supported ❌';
        }
        return 'Unknown browser';
    }

    async togglePiP() {
        if (!this.features.pip) {
            this.showNotification('Picture-in-Picture not supported in this browser. Try Chrome or Edge 116+', 'error');
            return;
        }

        if (this.pipWindow) {
            this.pipWindow.close();
            this.pipWindow = null;
            return;
        }

        try {
            this.pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 300,
                height: 250
            });

            this.setupPiPWindow();
            this.showNotification('Picture-in-Picture activated! 🎉', 'success');
        } catch (error) {
            console.error('Failed to open Picture-in-Picture:', error);
            this.showNotification('Failed to open Picture-in-Picture window', 'error');
        }
    }

    setupPiPWindow() {
        if (!this.pipWindow) return;

        // Copy styles to PiP window
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach(styleSheet => {
            try {
                const cssRules = Array.from(styleSheet.cssRules);
                const style = this.pipWindow.document.createElement('style');
                style.textContent = cssRules.map(rule => rule.cssText).join('\n');
                this.pipWindow.document.head.appendChild(style);
            } catch (e) {
                // Handle cross-origin stylesheets
                const link = this.pipWindow.document.createElement('link');
                link.rel = 'stylesheet';
                link.href = styleSheet.href || './style.css';
                this.pipWindow.document.head.appendChild(link);
            }
        });

        // Create PiP content
        this.pipWindow.document.body.innerHTML = `
            <div class="pip-window">
                <div class="pip-timer">
                    <div class="pip-timer-display" id="pip-time">25:00</div>
                    <div class="pip-label" id="pip-label">Focus Time</div>
                    <div class="pip-controls">
                        <button id="pip-play-pause" class="btn btn--primary">▶ Start</button>
                        <button id="pip-reset" class="btn btn--outline">⟲</button>
                        <button id="pip-skip" class="btn btn--outline">⏭</button>
                    </div>
                    <div class="pip-task-info" id="pip-task-info">
                        <div class="pip-task-name">No task selected</div>
                    </div>
                </div>
            </div>
        `;

        // Setup PiP event listeners
        this.pipWindow.document.getElementById('pip-play-pause').addEventListener('click', () => {
            this.toggleTimer();
        });

        this.pipWindow.document.getElementById('pip-reset').addEventListener('click', () => {
            this.resetTimer();
        });

        this.pipWindow.document.getElementById('pip-skip').addEventListener('click', () => {
            this.skipSession();
        });

        // Handle PiP window close
        this.pipWindow.addEventListener('pagehide', () => {
            this.pipWindow = null;
        });

        // Initial update
        this.updatePiPDisplay();
    }

    updatePiPDisplay() {
        if (!this.pipWindow) return;

        const minutes = Math.floor(this.timerState.timeLeft / 60);
        const seconds = this.timerState.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const pipTime = this.pipWindow.document.getElementById('pip-time');
        const pipLabel = this.pipWindow.document.getElementById('pip-label');
        const pipPlayPause = this.pipWindow.document.getElementById('pip-play-pause');
        const pipTaskInfo = this.pipWindow.document.getElementById('pip-task-info');

        if (pipTime) pipTime.textContent = timeString;
        
        if (pipLabel) {
            const labels = {
                focus: 'Focus Time',
                'short-break': 'Short Break',
                'long-break': 'Long Break'
            };
            pipLabel.textContent = labels[this.timerState.currentMode];
        }

        if (pipPlayPause) {
            pipPlayPause.innerHTML = this.timerState.isRunning ? '⏸ Pause' : '▶ Start';
        }

        if (pipTaskInfo && this.userData.currentTaskId) {
            const task = this.tasks.find(t => t.id === this.userData.currentTaskId);
            if (task) {
                pipTaskInfo.innerHTML = `
                    <div class="pip-task-name">${task.title}</div>
                    <div class="pip-task-progress">${task.completedPomodoros}/${task.estimatedPomodoros} completed</div>
                `;
            }
        }
    }

    showPWAInstallBanner() {
        if (this.pwaInstallBanner && !localStorage.getItem('floatfocus_pwa_dismissed')) {
            this.pwaInstallBanner.classList.remove('hidden');
        }
    }

    hidePWABanner() {
        if (this.pwaInstallBanner) {
            this.pwaInstallBanner.classList.add('hidden');
            localStorage.setItem('floatfocus_pwa_dismissed', 'true');
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            // Fallback: Show manual installation instructions
            this.showNotification('To install: Click browser menu → "Install FloatFocus" or "Add to Home Screen"', 'info');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                this.showNotification('FloatFocus installed successfully! 🎉', 'success');
                this.hidePWABanner();
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showNotification('Installation failed. Please try again.', 'error');
        }
    }

    showSolutionsModal() {
        if (this.solutionsModal) {
            this.solutionsModal.classList.remove('hidden');
            this.updatePiPStatus();
        }
    }

    hideSolutionsModal() {
        if (this.solutionsModal) {
            this.solutionsModal.classList.add('hidden');
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    initializeDraggableTimer() {
        if (!this.floatingTimer) return;

        let isDragging = false;
        let startX, startY, initialX, initialY;

        this.floatingTimer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('floating-btn')) return;
            
            isDragging = true;
            this.floatingTimer.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.floatingTimer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newX = Math.max(0, Math.min(window.innerWidth - this.floatingTimer.offsetWidth, initialX + deltaX));
            const newY = Math.max(0, Math.min(window.innerHeight - this.floatingTimer.offsetHeight, initialY + deltaY));
            
            this.floatingTimer.style.left = `${newX}px`;
            this.floatingTimer.style.top = `${newY}px`;
            this.floatingTimer.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.floatingTimer.classList.remove('dragging');
            }
        });
    }

    // Enhanced notification system with browser notifications
    async showNotification(message, type = 'info') {
        // In-app notification
        if (this.notifications) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            this.notifications.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideInNotification 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Browser notification for important events
        if (this.features.notifications && Notification.permission === 'granted' && 
            (type === 'success' || message.includes('completed'))) {
            try {
                new Notification('FloatFocus', {
                    body: message,
                    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23218085"/%3E%3Ctext x="50" y="65" font-size="40" text-anchor="middle" fill="white"%3E🍅%3C/text%3E%3C/svg%3E',
                    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23218085"/%3E%3Ctext x="50" y="65" font-size="40" text-anchor="middle" fill="white"%3E🍅%3C/text%3E%3C/svg%3E'
                });
            } catch (error) {
                console.log('Browser notification failed:', error);
            }
        }
    }

    // Timer methods
    initializeTimer() {
        this.updateTimerDisplay();
        this.updateProgressRing();
    }

    initializeWallpapers() {
        this.loadWallpaper(this.currentCategory);
        this.startWallpaperRotation();
    }

    initializeQuotes() {
        this.updateQuote();
        this.startQuoteRotation();
    }

    toggleTimer() {
        if (this.timerState.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerState.isRunning = true;
        if (this.startPauseBtn) {
            this.startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span>Pause';
        }
        if (this.floatingPlayPause) {
            this.floatingPlayPause.textContent = '⏸';
        }
        
        this.timerInterval = setInterval(() => {
            this.timerState.timeLeft--;
            this.updateTimerDisplay();
            this.updateProgressRing();
            this.updatePiPDisplay();
            
            if (this.timerState.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);

        this.showNotification('Timer started! ⏰', 'success');
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        if (this.startPauseBtn) {
            this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span>Start';
        }
        if (this.floatingPlayPause) {
            this.floatingPlayPause.textContent = '▶';
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.showNotification('Timer paused', 'info');
    }

    resetTimer() {
        this.timerState.isRunning = false;
        this.timerState.timeLeft = this.timerModes[this.timerState.currentMode];
        this.timerState.totalTime = this.timerState.timeLeft;
        
        if (this.startPauseBtn) {
            this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span>Start';
        }
        if (this.floatingPlayPause) {
            this.floatingPlayPause.textContent = '▶';
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateTimerDisplay();
        this.updateProgressRing();
        this.updatePiPDisplay();
        
        this.showNotification('Timer reset', 'info');
    }

    skipSession() {
        this.completeSession();
    }

    completeSession() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerState.isRunning = false;
        
        if (this.timerState.currentMode === 'focus') {
            this.userData.completedPomodoros++;
            this.userData.totalFocusTime += this.timerModes.focus / 60;
            this.userData.currentStreak++;
            this.userData.lastCompletionDate = new Date().toDateString();
            
            this.awardXP(25);
            
            if (this.userData.currentTaskId) {
                const task = this.tasks.find(t => t.id === this.userData.currentTaskId);
                if (task) {
                    task.completedPomodoros++;
                    if (task.completedPomodoros >= task.estimatedPomodoros) {
                        task.completed = true;
                        this.showNotification(`Task "${task.title}" completed! 🎉`, 'success');
                        this.awardXP(50);
                    }
                }
            }
            
            this.timerState.cycles++;
            
            if (this.timerState.cycles % 4 === 0) {
                this.switchMode('long-break');
            } else {
                this.switchMode('short-break');
            }
            
            this.showNotification('Focus session completed! Take a break. 🍅', 'success');
            this.playCompletionSound();
        } else {
            this.switchMode('focus');
            this.showNotification('Break over! Ready to focus? 💪', 'success');
        }
        
        this.saveUserData();
        this.saveTasks();
        this.updateDisplay();
        this.checkAchievements();
        this.updateHabitTracker();
    }

    switchMode(mode) {
        this.timerState.currentMode = mode;
        this.timerState.timeLeft = this.timerModes[mode];
        this.timerState.totalTime = this.timerState.timeLeft;
        
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.updateTimerDisplay();
        this.updateProgressRing();
        this.updatePiPDisplay();
        
        const labels = {
            focus: 'Focus Time',
            'short-break': 'Short Break',
            'long-break': 'Long Break'
        };
        if (this.timerLabel) {
            this.timerLabel.textContent = labels[mode];
        }
        
        if (mode === 'focus' && this.userData.currentTaskId) {
            const task = this.tasks.find(t => t.id === this.userData.currentTaskId);
            if (task) {
                this.currentCategory = task.category;
                this.loadWallpaper(this.currentCategory);
            }
        } else if (mode !== 'focus') {
            this.currentCategory = 'general';
            this.loadWallpaper(this.currentCategory);
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.timeLeft / 60);
        const seconds = this.timerState.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timerTime) {
            this.timerTime.textContent = timeString;
        }
        if (this.floatingTime) {
            this.floatingTime.textContent = timeString;
        }
        
        document.title = `${timeString} - FloatFocus Enhanced`;
    }

    updateProgressRing() {
        if (!this.progressRing) return;
        
        const circumference = 2 * Math.PI * 90;
        const progress = (this.timerState.totalTime - this.timerState.timeLeft) / this.timerState.totalTime;
        const offset = circumference - (progress * circumference);
        
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = offset;
        
        if (this.floatingProgressCircle) {
            const floatingCircumference = 2 * Math.PI * 35;
            const floatingOffset = floatingCircumference - (progress * floatingCircumference);
            this.floatingProgressCircle.style.strokeDasharray = `${floatingCircumference} ${floatingCircumference}`;
            this.floatingProgressCircle.style.strokeDashoffset = floatingOffset;
        }
    }

    async loadWallpaper(category = 'general') {
        try {
            const keywords = this.unsplashCategories[category] || this.unsplashCategories.general;
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            
            const imageUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(randomKeyword)}&${Date.now()}`;
            
            const nextImage = this.currentWallpaperIndex === 0 ? this.backgroundImage2 : this.backgroundImage1;
            const currentImage = this.currentWallpaperIndex === 0 ? this.backgroundImage1 : this.backgroundImage2;
            
            const img = new Image();
            img.onload = () => {
                if (nextImage) {
                    nextImage.style.backgroundImage = `url(${imageUrl})`;
                    nextImage.classList.add('active');
                }
                if (currentImage) {
                    currentImage.classList.remove('active');
                }
                this.currentWallpaperIndex = 1 - this.currentWallpaperIndex;
            };
            img.onerror = () => {
                const gradients = [
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                ];
                const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
                if (nextImage) {
                    nextImage.style.backgroundImage = randomGradient;
                    nextImage.classList.add('active');
                }
                if (currentImage) {
                    currentImage.classList.remove('active');
                }
                this.currentWallpaperIndex = 1 - this.currentWallpaperIndex;
            };
            img.src = imageUrl;
            
        } catch (error) {
            console.error('Failed to load wallpaper:', error);
        }
    }

    loadNewWallpaper() {
        this.loadWallpaper(this.currentCategory);
    }

    startWallpaperRotation() {
        if (this.wallpaperChangeInterval) {
            clearInterval(this.wallpaperChangeInterval);
        }
        
        this.wallpaperChangeInterval = setInterval(() => {
            if (this.timerState.isRunning) {
                this.loadWallpaper(this.currentCategory);
            }
        }, 120000);
    }

    updateQuote() {
        const categoryQuotes = this.quotes[this.currentCategory] || this.quotes.general;
        const quote = categoryQuotes[this.currentQuoteIndex];
        
        if (this.quoteText && this.quoteAuthor) {
            this.quoteText.textContent = `"${quote.text}"`;
            this.quoteAuthor.textContent = `- ${quote.author}`;
        }
        
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % categoryQuotes.length;
    }

    startQuoteRotation() {
        if (this.quoteInterval) {
            clearInterval(this.quoteInterval);
        }
        
        this.quoteInterval = setInterval(() => {
            this.updateQuote();
        }, 45000);
    }

    showTaskModal() {
        if (this.taskModal) {
            this.taskModal.classList.remove('hidden');
            const titleInput = document.getElementById('task-title');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 100);
            }
        }
    }

    hideTaskModal() {
        if (this.taskModal) {
            this.taskModal.classList.add('hidden');
        }
        if (this.taskForm) {
            this.taskForm.reset();
        }
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('task-title');
        const categorySelect = document.getElementById('task-category');
        const pomodorosInput = document.getElementById('task-pomodoros');
        
        if (!titleInput || !categorySelect || !pomodorosInput) return;
        
        const task = {
            id: Date.now(),
            title: titleInput.value,
            category: categorySelect.value,
            estimatedPomodoros: parseInt(pomodorosInput.value),
            completedPomodoros: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.updateTasksList();
        this.hideTaskModal();
        
        this.showNotification(`Task "${task.title}" added!`, 'success');
    }

    updateTasksList() {
        if (!this.tasksListDiv) return;
        
        this.tasksListDiv.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-item-title">${task.title}</div>
                    <div class="task-item-meta">
                        <span class="task-category">${task.category}</span>
                        <span>${task.completedPomodoros}/${task.estimatedPomodoros} 🍅</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn task-select-btn" data-task-id="${task.id}" title="Select Task">
                        ${this.userData.currentTaskId === task.id ? '✓' : '▶'}
                    </button>
                    <button class="task-btn task-delete-btn" data-task-id="${task.id}" title="Delete Task">🗑</button>
                </div>
            `;
            
            this.tasksListDiv.appendChild(taskElement);
        });
        
        if (this.tasks.length === 0) {
            this.tasksListDiv.innerHTML = '<p style="color: var(--color-text-secondary); padding: var(--space-32); text-align: center;">No tasks yet. Add your first task!</p>';
        }
    }

    selectTask(taskId) {
        this.userData.currentTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            this.currentCategory = task.category;
            this.loadWallpaper(this.currentCategory);
            this.updateCurrentTaskDisplay();
            this.updateTasksList();
            this.updatePiPDisplay();
            this.saveUserData();
            
            this.showNotification(`Selected task: ${task.title}`, 'success');
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        if (this.userData.currentTaskId === taskId) {
            this.userData.currentTaskId = null;
            this.updateCurrentTaskDisplay();
            this.updatePiPDisplay();
        }
        this.saveTasks();
        this.saveUserData();
        this.updateTasksList();
        
        this.showNotification('Task deleted', 'info');
    }

    updateCurrentTaskDisplay() {
        if (!this.currentTaskDiv) return;
        
        if (this.userData.currentTaskId) {
            const task = this.tasks.find(t => t.id === this.userData.currentTaskId);
            if (task) {
                const progress = (task.completedPomodoros / task.estimatedPomodoros) * 100;
                
                this.currentTaskDiv.innerHTML = `
                    <div class="task-active">
                        <div class="task-title">${task.title}</div>
                        <div class="task-category">${task.category}</div>
                        <div class="task-progress">
                            <div class="task-progress-bar">
                                <div class="task-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="task-progress-text">${task.completedPomodoros}/${task.estimatedPomodoros}</span>
                        </div>
                    </div>
                `;
                return;
            }
        }
        
        this.currentTaskDiv.innerHTML = `
            <div class="task-empty">
                <span class="task-icon">📝</span>
                <p>No task selected</p>
                <button id="add-task-btn" class="btn btn--primary btn--sm">Add Task</button>
            </div>
        `;
    }

    awardXP(amount) {
        this.userData.xp += amount;
        const newLevel = Math.floor(this.userData.xp / 500) + 1;
        
        if (newLevel > this.userData.level) {
            this.userData.level = newLevel;
            this.showNotification(`🎉 Level Up! You're now level ${newLevel}!`, 'success');
            this.awardXP(100);
        }
        
        this.updateXPDisplay();
    }

    updateXPDisplay() {
        const xpInCurrentLevel = this.userData.xp % 500;
        const xpToNextLevel = 500 - xpInCurrentLevel;
        const progressPercent = (xpInCurrentLevel / 500) * 100;
        
        if (this.userLevel) this.userLevel.textContent = this.userData.level;
        if (this.currentXP) this.currentXP.textContent = this.userData.xp;
        if (this.xpProgress) this.xpProgress.style.width = `${progressPercent}%`;
        if (this.xpToNext) this.xpToNext.textContent = xpToNextLevel;
    }

    checkAchievements() {
        const availableAchievements = [
            {
                id: 'first_pomodoro',
                name: 'Getting Started',
                description: 'Complete your first pomodoro',
                icon: '🍅',
                xp: 50,
                condition: () => this.userData.completedPomodoros >= 1
            },
            {
                id: 'streak_5',
                name: 'Consistency',
                description: 'Complete 5 pomodoros in a row',
                icon: '🔥',
                xp: 100,
                condition: () => this.userData.currentStreak >= 5
            },
            {
                id: 'level_5',
                name: 'Rising Star',
                description: 'Reach level 5',
                icon: '⭐',
                xp: 200,
                condition: () => this.userData.level >= 5
            },
            {
                id: 'habit_week',
                name: 'Week Warrior',
                description: 'Maintain a 7-day habit streak',
                icon: '📅',
                xp: 150,
                condition: () => this.calculateHabitStreak() >= 7
            },
            {
                id: 'pomodoro_100',
                name: 'Centurion',
                description: 'Complete 100 pomodoros',
                icon: '💯',
                xp: 500,
                condition: () => this.userData.completedPomodoros >= 100
            },
            {
                id: 'pip_user',
                name: 'Floating Master',
                description: 'Use Picture-in-Picture mode',
                icon: '📺',
                xp: 75,
                condition: () => this.pipWindow !== null
            }
        ];
        
        availableAchievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
                this.awardXP(achievement.xp);
            }
        });
        
        this.updateAchievementsDisplay(availableAchievements);
        this.saveAchievements();
    }

    updateAchievementsDisplay(availableAchievements) {
        if (!this.achievementsList) return;
        
        this.achievementsList.innerHTML = '';
        
        availableAchievements.forEach(achievement => {
            const isUnlocked = this.achievements.includes(achievement.id);
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            `;
            
            this.achievementsList.appendChild(achievementElement);
        });
    }

    updateHabitTracker() {
        this.generateHabitChain();
        this.updateHabitStrength();
    }

    generateHabitChain() {
        if (!this.habitChain) return;
        
        this.habitChain.innerHTML = '';
        const today = new Date();
        
        for (let i = 65; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'habit-day';
            
            const dateStr = date.toDateString();
            const hasActivity = this.userData.habitHistory.includes(dateStr);
            const isToday = dateStr === today.toDateString();
            
            if (hasActivity) {
                dayElement.classList.add('completed');
            }
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            dayElement.textContent = date.getDate();
            this.habitChain.appendChild(dayElement);
        }
    }

    calculateHabitStreak() {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 66; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            if (this.userData.habitHistory.includes(dateStr)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    updateHabitStrength() {
        const streak = this.calculateHabitStreak();
        const strength = Math.min(streak / 66 * 100, 100);
        
        if (this.habitStrengthBar) {
            this.habitStrengthBar.style.width = `${strength}%`;
        }
        
        let strengthText = 'Weak';
        if (strength >= 66) strengthText = 'Strong';
        else if (strength >= 33) strengthText = 'Developing';
        
        if (this.habitStrengthText) {
            this.habitStrengthText.textContent = strengthText;
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        if (this.themeToggle) {
            const themeIcon = this.themeToggle.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀';
            }
        }
        
        localStorage.setItem('theme', newTheme);
    }

    toggleFloatingTimer() {
        if (!this.floatingTimer || !this.floatToggle) return;
        
        const isVisible = !this.floatingTimer.classList.contains('hidden');
        
        if (isVisible) {
            this.floatingTimer.classList.add('hidden');
            this.floatToggle.textContent = 'Float Timer';
        } else {
            this.floatingTimer.classList.remove('hidden');
            this.floatToggle.textContent = 'Hide Float';
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.toggleTimer();
                break;
            case 'KeyR':
                e.preventDefault();
                this.resetTimer();
                break;
            case 'KeyS':
                e.preventDefault();
                this.skipSession();
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFloatingTimer();
                break;
            case 'KeyP':
                e.preventDefault();
                this.togglePiP();
                break;
            case 'KeyT':
                e.preventDefault();
                this.toggleTheme();
                break;
            case 'KeyH':
                e.preventDefault();
                this.showSolutionsModal();
                break;
        }
    }

    playCompletionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    updateDisplay() {
        if (this.completedPomodoros) {
            this.completedPomodoros.textContent = this.userData.completedPomodoros;
        }
        if (this.currentStreak) {
            this.currentStreak.textContent = this.userData.currentStreak;
        }
        if (this.focusTime) {
            this.focusTime.textContent = `${Math.floor(this.userData.totalFocusTime / 60)}h`;
        }
        
        this.updateXPDisplay();
        this.updateCurrentTaskDisplay();
        this.updateTasksList();
        
        const today = new Date().toDateString();
        if (this.userData.lastCompletionDate === today && !this.userData.habitHistory.includes(today)) {
            this.userData.habitHistory.push(today);
            this.saveUserData();
        }
    }

    loadUserData() {
        const defaultUserData = {
            completedPomodoros: 0,
            currentStreak: 0,
            totalFocusTime: 0,
            xp: 0,
            level: 1,
            currentTaskId: null,
            lastCompletionDate: null,
            habitHistory: []
        };
        
        try {
            const stored = localStorage.getItem('floatfocus_userdata');
            return stored ? { ...defaultUserData, ...JSON.parse(stored) } : defaultUserData;
        } catch (error) {
            return defaultUserData;
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('floatfocus_userdata', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('floatfocus_tasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('floatfocus_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }

    loadAchievements() {
        try {
            const stored = localStorage.getItem('floatfocus_achievements');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('floatfocus_achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FloatFocusApp();
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀';
        }
    }
    
    console.log('FloatFocus Enhanced Pomodoro Timer initialized!');
    console.log('🚀 Enhanced Floating Features:');
    console.log('📺 Picture-in-Picture: Creates truly floating windows');
    console.log('📱 PWA Installation: Install as desktop/mobile app');
    console.log('🔧 OS Tools Integration: Guidance for always-on-top');
    console.log('');
    console.log('⌨️ Keyboard shortcuts:');
    console.log('- Space: Start/Pause timer');
    console.log('- R: Reset timer');
    console.log('- S: Skip session');
    console.log('- F: Toggle floating timer');
    console.log('- P: Toggle Picture-in-Picture');
    console.log('- T: Toggle theme');
    console.log('- H: Show floating solutions help');
});