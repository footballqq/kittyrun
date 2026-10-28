// =========================================================
// Cute Sweet Cat Catch Game - Comprehensive Game Engine
// Features: Dynamic Screen Scaling, Magnet, Shield, Slow-mo,
// Milk, Hazards with Clear Warning Cues, Combo Milestones,
// Drop Break Penalty, Achievements & Share Poster Generator!
// =========================================================

// Polyfill roundRect for older browser engines
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        let r = radii || 0;
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        return this;
    };
}

class CuteCatGame {
    constructor() {
        window.game = this;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('gameContainer');

        // High DPI canvas support
        this.dpr = window.devicePixelRatio || 1;
        this.width = 680;
        this.height = 700;

        // Game State
        this.state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
        this.gameMode = 'timed'; // 'timed' (60s) | 'survival' (3 lives endless)
        this.timeLeft = 60000; // 60s
        this.score = 0;
        this.sweetsCaughtCount = 0;

        // Player Records & History in LocalStorage
        try {
            this.records = JSON.parse(localStorage.getItem('cute_cat_records') || '{}');
        } catch (e) {
            this.records = {};
        }
        if (!this.records.history) {
            this.records = {
                totalGames: 0,
                totalSweets: 0,
                timedBest: 0,
                survivalBest: 0,
                history: []
            };
        }
        this.highScore = Math.max(
            parseInt(localStorage.getItem('cute_cat_highscore') || '0', 10),
            this.records.timedBest || 0,
            this.records.survivalBest || 0
        );
        this.lives = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.feverTimer = 0;
        this.feverActive = false;
        this.feverMeter = 0; // 0 to 100

        // Buffs & Powerups
        this.hasShield = false;
        this.magnetTimer = 0; // ms
        this.slowTimer = 0;   // ms
        this.dashCooldown = 0; // ms
        this.dashTrail = [];

        // Shop, Currency & Outfits system
        this.coins = parseInt(localStorage.getItem('cute_cat_coins') || '0', 10);
        this.ownedSkins = JSON.parse(localStorage.getItem('cute_cat_owned_skins') || '["white"]');
        this.ownedHats = JSON.parse(localStorage.getItem('cute_cat_owned_hats') || '["bow", "none"]');
        this.nextShopScore = 300;

        this.shopCatalog = {
            skins: [
                { id: 'white', name: '纯白棉花糖', price: 0, icon: '🤍', desc: '纯真白雪，蓬松软萌' },
                { id: 'orange', name: '阳光大橘猫', price: 120, icon: '🍊', desc: '十橘九胖，活力满满' },
                { id: 'black', name: '酷帅黑猫警长', price: 200, icon: '🖤', desc: '黑夜行者，神秘优雅' },
                { id: 'capybara', name: '治愈小水豚', price: 300, icon: '🦭', desc: '情绪稳定，万物皆友' }
            ],
            hats: [
                { id: 'bow', name: '粉萌蝴蝶结', price: 0, icon: '🎀', desc: '经典少女心蝴蝶结' },
                { id: 'chef', name: '甜点大师帽', price: 40, icon: '👨‍🍳', desc: '法式烘焙甜品师' },
                { id: 'flower', name: '春日小樱花', price: 60, icon: '🌸', desc: '浪漫唯美樱花发夹' },
                { id: 'crown', name: '璀璨小皇冠', price: 100, icon: '👑', desc: '高贵可爱猫猫国王' },
                { id: 'tophat', name: '绅士高礼帽', price: 140, icon: '🎩', desc: '英伦典雅贵族范' },
                { id: 'glasses', name: '酷炫黑超墨镜', price: 180, icon: '🕶️', desc: '全街最靓的猫仔' },
                { id: 'none', name: '清爽无饰品', price: 0, icon: '🐱', desc: '自然纯粹原味' }
            ],
            supplies: [
                { id: 'heart_potion', name: '满血复活草', price: 50, icon: '💖', desc: '立即回复 +1 ❤️ 生命值' },
                { id: 'shield_pack', name: '彩虹护盾球', price: 60, icon: '🛡️', desc: '立即获得彩虹护盾保护' }
            ]
        };

        // Cat Character Properties
        this.cat = {
            x: 340,
            y: 620,
            targetX: 340,
            width: 72,
            height: 64,
            speed: 13,
            facing: 1, // 1: right, -1: left
            blinkTimer: 0,
            isBlinking: false,
            mouthState: 'normal', // 'normal' | 'open' | 'happy' | 'hurt'
            mouthTimer: 0,
            earWiggle: 0,
            breed: localStorage.getItem('cute_cat_current_breed') || 'white',
            accessory: localStorage.getItem('cute_cat_current_hat') || 'bow',
            squishX: 1,
            squishY: 1
        };

        this.breeds = ['white', 'orange', 'black', 'capybara'];
        this.hats = ['bow', 'chef', 'flower', 'crown', 'tophat', 'glasses', 'none'];

        // Mascot preview canvas setup
        this.mascotCanvas = document.getElementById('mascotCanvas');
        if (this.mascotCanvas) {
            this.mascotCtx = this.mascotCanvas.getContext('2d');
            const mDpr = window.devicePixelRatio || 1;
            this.mascotCanvas.width = 150 * mDpr;
            this.mascotCanvas.height = 150 * mDpr;
            this.mascotCtx.scale(mDpr, mDpr);
        }

        // Achievements system
        this.achievements = JSON.parse(localStorage.getItem('cute_cat_achievements') || '{}');
        this.achieveDefs = [
            { id: 'first_catch', name: '初尝甜头', desc: '接住第 1 个美味甜点', icon: '🍓' },
            { id: 'drink_milk', name: '元气满满', desc: '喝到 1 瓶香浓纯牛奶', icon: '🥛' },
            { id: 'shield_block', name: '绝对防御', desc: '使用护盾成功抵挡 1 次危险', icon: '🛡️' },
            { id: 'magnet_power', name: '万物皆可吸', desc: '激活猫薄荷磁铁吸取甜点', icon: '🧲' },
            { id: 'combo_15', name: '连击达人', desc: '达成 15 次不间断连击', icon: '🔥' },
            { id: 'score_1000', name: '甜点大亨', desc: '单局得分突破 1000 分', icon: '👑' }
        ];

        // Items and Particles
        this.items = [];
        this.particles = [];
        this.floatingTexts = [];
        this.clouds = [];

        // Timers & Spawning
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1100; // ms
        this.screenShake = 0;

        // Keys state
        this.keys = { left: false, right: false, shift: false };

        this.initClouds();
        this.resize();
        this.bindEvents();
        this.updateHUD();
        this.renderAchievementsList();
        this.checkSavedGame();
        this.updateWardrobeUI();

        if (window.I18N) {
            window.I18N.setLang(window.I18N.currentLang);
        }

        // Start render loop
        requestAnimationFrame((t) => this.loop(t));
    }

    // ==========================================
    // Screen & Canvas Responsive Resize
    // ==========================================
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 680;
        this.height = rect.height || 700;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);

        this.cat.y = this.height - 75;
        this.cat.targetX = Math.min(Math.max(this.cat.targetX, 42), this.width - 42);
        this.cat.x = this.cat.targetX;
    }

    initClouds() {
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random() * 800,
                y: 30 + Math.random() * 240,
                radius: 24 + Math.random() * 20,
                speed: 0.15 + Math.random() * 0.3,
                opacity: 0.3 + Math.random() * 0.25
            });
        }
    }

    // ==========================================
    // Event Listeners & UI Binding
    // ==========================================
    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = true;
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = true;
            } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.triggerDash();
            } else if (e.code === 'Space') {
                if (this.state === 'START' || this.state === 'GAMEOVER') {
                    this.startGame();
                } else if (this.state === 'PLAYING') {
                    this.togglePause();
                } else if (this.state === 'PAUSED') {
                    this.togglePause();
                }
            } else if (e.code === 'KeyM') {
                this.toggleMute();
            } else if (e.code === 'KeyF') {
                this.toggleFullscreen();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = false;
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = false;
            }
        });

        // Mouse & Touch controls with dynamic scaling
        const handleMove = (clientX) => {
            if (this.state !== 'PLAYING') return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const posX = (clientX - rect.left) * scaleX;
            this.cat.targetX = Math.max(40, Math.min(this.width - 40, posX));
        };

        this.canvas.addEventListener('mousemove', (e) => {
            handleMove(e.clientX);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX);
                e.preventDefault();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX);
            }
        });

        // Double-click/double-tap to dash on canvas
        let lastTapTime = 0;
        this.canvas.addEventListener('click', () => {
            const now = performance.now();
            if (now - lastTapTime < 280) {
                this.triggerDash();
            }
            lastTapTime = now;
        });

        // Mobile dash button
        document.getElementById('mobileDashBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerDash();
        });

        // UI Buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            this.startGame();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            this.togglePause();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            this.togglePause();
        });

        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Modals Open / Close
        document.getElementById('guideBtn').addEventListener('click', () => this.toggleModal('guideModal', true));
        document.getElementById('openGuideBtn').addEventListener('click', () => this.toggleModal('guideModal', true));
        document.getElementById('pauseGuideBtn').addEventListener('click', () => this.toggleModal('guideModal', true));
        document.getElementById('closeGuideBtn').addEventListener('click', () => this.toggleModal('guideModal', false));

        document.getElementById('legendBtn').addEventListener('click', () => this.toggleModal('legendModal', true));
        document.getElementById('openLegendBtn').addEventListener('click', () => this.toggleModal('legendModal', true));
        document.getElementById('pauseLegendBtn').addEventListener('click', () => this.toggleModal('legendModal', true));
        document.getElementById('closeLegendBtn').addEventListener('click', () => this.toggleModal('legendModal', false));

        // Player Records Modal
        const showRecords = () => {
            this.renderRecordsModal();
            this.toggleModal('recordsModal', true);
        };
        document.getElementById('openRecordsBtn').addEventListener('click', showRecords);
        document.getElementById('gameOverRecordsBtn').addEventListener('click', showRecords);
        document.getElementById('closeRecordsBtn').addEventListener('click', () => this.toggleModal('recordsModal', false));
        document.getElementById('clearRecordsBtn').addEventListener('click', () => this.clearRecords());

        // Manual End (见好就收)
        document.getElementById('manualEndBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            this.togglePause();
            this.gameOver('manual_end');
        });

        document.getElementById('hudEndBtn').addEventListener('click', () => {
            window.cuteAudio.playClick();
            if (this.state === 'PLAYING') {
                this.gameOver('manual_end');
            }
        });

        // Language toggle buttons (Start screen & Header)
        const handleLangToggle = () => {
            window.cuteAudio.playClick();
            window.I18N.toggleLang();
        };
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) langToggleBtn.addEventListener('click', handleLangToggle);
        const headerLangBtn = document.getElementById('headerLangBtn');
        if (headerLangBtn) headerLangBtn.addEventListener('click', handleLangToggle);

        // Game Mode Selection
        const modeTimedBtn = document.getElementById('modeTimedBtn');
        if (modeTimedBtn) {
            modeTimedBtn.addEventListener('click', () => this.selectMode('timed'));
        }
        const modeSurvivalBtn = document.getElementById('modeSurvivalBtn');
        if (modeSurvivalBtn) {
            modeSurvivalBtn.addEventListener('click', () => this.selectMode('survival'));
        }

        // Hero Character Stage: Cycle Breeds with arrows
        const prevBreedBtn = document.getElementById('prevBreedBtn');
        if (prevBreedBtn) {
            prevBreedBtn.addEventListener('click', () => this.cycleBreed(-1));
        }
        const nextBreedBtn = document.getElementById('nextBreedBtn');
        if (nextBreedBtn) {
            nextBreedBtn.addEventListener('click', () => this.cycleBreed(1));
        }

        // Breed avatar buttons (Pure visual selection)
        document.querySelectorAll('.breed-avatar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const breed = e.currentTarget.getAttribute('data-breed');
                this.selectBreed(breed);
            });
        });

        // Accessory / Hat bubble buttons
        document.querySelectorAll('.hat-bubble-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hat = e.currentTarget.getAttribute('data-hat');
                this.selectHat(hat);
            });
        });

        document.getElementById('openAchieveBtn').addEventListener('click', () => {
            this.renderAchievementsList();
            this.toggleModal('achieveModal', true);
        });
        document.getElementById('closeAchieveBtn').addEventListener('click', () => this.toggleModal('achieveModal', false));

        document.getElementById('posterBtn').addEventListener('click', () => {
            this.generatePoster();
            this.toggleModal('posterModal', true);
        });
        document.getElementById('closePosterBtn').addEventListener('click', () => this.toggleModal('posterModal', false));

        document.getElementById('downloadPosterBtn').addEventListener('click', () => {
            this.downloadPoster();
        });

        document.getElementById('copyShareBtn').addEventListener('click', () => {
            this.copyShareText();
        });

        // Shop Modal Open / Close
        const showShop = () => {
            this.openShopModal();
        };
        document.getElementById('openShopBtn').addEventListener('click', showShop);
        document.getElementById('pauseShopBtn').addEventListener('click', showShop);
        document.getElementById('gameOverShopBtn').addEventListener('click', showShop);
        document.getElementById('closeShopBtn').addEventListener('click', () => this.closeShopModal());
        document.getElementById('shopConfirmBtn').addEventListener('click', () => this.closeShopModal());

        // Save & Resume Game handlers
        document.getElementById('saveAndExitBtn').addEventListener('click', () => {
            this.saveGameProgress();
        });
        document.getElementById('loadGameBtn').addEventListener('click', () => {
            this.loadSavedGame();
        });
        document.getElementById('discardGameBtn').addEventListener('click', () => {
            this.discardSavedGame();
        });
    }

    // ==========================================
    // Fullscreen Toggle
    // ==========================================
    toggleFullscreen() {
        window.cuteAudio.playClick();
        const container = this.container;
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
            container.classList.add('is-fullscreen');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            container.classList.remove('is-fullscreen');
        }
        setTimeout(() => this.resize(), 150);
    }

    toggleModal(modalId, show) {
        window.cuteAudio.playClick();
        const modal = document.getElementById(modalId);
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    showToast(message, icon = '✨') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 2800);
    }

    unlockAchievement(id) {
        if (this.achievements[id]) return;
        this.achievements[id] = true;
        localStorage.setItem('cute_cat_achievements', JSON.stringify(this.achievements));

        const item = this.achieveDefs.find(a => a.id === id);
        if (item) {
            window.cuteAudio.playAchievement();
            const name = window.I18N.t(`ach_${item.id}`) || item.name;
            this.showToast(window.I18N.t('achieveToast', { name }), item.icon);
        }
    }

    renderAchievementsList() {
        const list = document.getElementById('achieveList');
        if (!list) return;
        const t = (k, p) => window.I18N.t(k, p);
        list.innerHTML = this.achieveDefs.map(a => {
            const unlocked = !!this.achievements[a.id];
            const name = t(`ach_${a.id}`) || a.name;
            const desc = t(`ach_${a.id}_desc`) || a.desc;
            const status = unlocked ? t('unlocked') : t('locked');
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
                    <div class="achievement-icon">${a.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-title">${name}</div>
                        <div class="achievement-desc">${desc}</div>
                    </div>
                    <div class="achievement-status">${status}</div>
                </div>
            `;
        }).join('');
    }

    renderRecordsModal() {
        document.getElementById('statTotalGames').textContent = this.records.totalGames || 0;
        document.getElementById('statTotalSweets').textContent = this.records.totalSweets || 0;
        document.getElementById('statTimedBest').textContent = this.records.timedBest || 0;
        document.getElementById('statSurvivalBest').textContent = this.records.survivalBest || 0;

        const listEl = document.getElementById('historyList');
        if (!listEl) return;

        if (!this.records.history || this.records.history.length === 0) {
            listEl.innerHTML = `<div class="empty-history-hint">${window.I18N.t('emptyHistory')}</div>`;
            return;
        }

        listEl.innerHTML = this.records.history.map(item => {
            const isTimed = item.mode === 'timed';
            let reasonBadge = window.I18N.currentLang === 'en' ? '😿 Hearts Out' : '😿 心心耗尽';
            if (item.reason === 'time_up') reasonBadge = window.I18N.currentLang === 'en' ? '⏰ Time\'s Up' : '⏰ 60s时间到';
            else if (item.reason === 'manual_end') reasonBadge = window.I18N.currentLang === 'en' ? '🏆 Settle Early' : '🏆 见好就收';

            const modeTag = isTimed 
                ? (window.I18N.currentLang === 'en' ? '⚡ 60s' : '⚡ 60秒') 
                : (window.I18N.currentLang === 'en' ? '💖 Endless' : '💖 生存');

            return `
                <div class="history-item">
                    <div class="history-left">
                        <span class="history-mode-tag ${isTimed ? 'timed' : 'survival'}">
                            ${modeTag}
                        </span>
                        <span class="history-date">${item.date}</span>
                        <span class="history-reason">${reasonBadge}</span>
                    </div>
                    <div class="history-right">
                        <span class="history-combo">🔥 x${item.combo}</span>
                        <span class="history-score">${item.score}${window.I18N.currentLang === 'en' ? ' pts' : '分'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearRecords() {
        if (!confirm(window.I18N.t('clearConfirm'))) return;
        this.records = {
            totalGames: 0,
            totalSweets: 0,
            timedBest: 0,
            survivalBest: 0,
            history: []
        };
        try {
            localStorage.removeItem('cute_cat_records');
        } catch (e) {}
        this.renderRecordsModal();
        this.showToast(window.I18N.t('recordsCleared'), '🗑️');
    }

    // ==========================================
    // Save & Resume Game (LocalStorage Snapshot)
    // ==========================================
    saveGameProgress() {
        if (this.state !== 'PLAYING' && this.state !== 'PAUSED') {
            this.showToast('只有在游戏中才能暂存进度哦！', '⚠️');
            return;
        }

        const savedState = {
            score: this.score,
            lives: this.lives,
            combo: this.combo,
            maxCombo: this.maxCombo,
            timeLeft: this.timeLeft,
            gameMode: this.gameMode,
            hasShield: this.hasShield,
            magnetTimer: this.magnetTimer,
            slowTimer: this.slowTimer,
            sweetsCaughtCount: this.sweetsCaughtCount,
            coins: this.coins,
            breed: this.cat.breed,
            accessory: this.cat.accessory,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('cute_cat_saved_game', JSON.stringify(savedState));
        } catch (e) {
            this.showToast('Storage error', '😿');
            return;
        }

        window.cuteAudio.stopBGM();
        window.cuteAudio.playClick();
        this.state = 'START';
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');

        this.checkSavedGame();
        this.showToast(window.I18N.t('savedToast'), '💾');
    }

    checkSavedGame() {
        const card = document.getElementById('savedGameCard');
        const info = document.getElementById('savedGameInfo');
        if (!card) return;

        let saved = null;
        try {
            const raw = localStorage.getItem('cute_cat_saved_game');
            if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        if (saved && saved.score !== undefined) {
            const modeLabel = saved.gameMode === 'timed' ? window.I18N.t('modeTimed') : window.I18N.t('modeSurvival');
            const timePart = saved.gameMode === 'timed' ? ` · ${Math.ceil((saved.timeLeft || 0) / 1000)}s` : '';
            if (info) {
                info.textContent = `${modeLabel} · ${window.I18N.t('score')}: ${saved.score} · ❤️x${saved.lives} · ${window.I18N.t('combo')}: x${saved.combo}${timePart}`;
            }
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    }

    loadSavedGame() {
        let saved = null;
        try {
            const raw = localStorage.getItem('cute_cat_saved_game');
            if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        if (!saved) {
            this.showToast('No saved game found', '😿');
            this.checkSavedGame();
            return;
        }

        this.score = saved.score || 0;
        this.lives = saved.lives !== undefined ? saved.lives : 3;
        this.combo = saved.combo || 0;
        this.maxCombo = saved.maxCombo || 0;
        this.timeLeft = saved.timeLeft !== undefined ? saved.timeLeft : 60000;
        this.gameMode = saved.gameMode || 'timed';
        this.hasShield = !!saved.hasShield;
        this.magnetTimer = saved.magnetTimer || 0;
        this.slowTimer = saved.slowTimer || 0;
        this.sweetsCaughtCount = saved.sweetsCaughtCount || 0;
        if (saved.breed) this.cat.breed = saved.breed;
        if (saved.accessory) this.cat.accessory = saved.accessory;

        this.nextShopScore = Math.floor(this.score / 350) * 350 + 300;
        this.items = [];
        this.particles = [];
        this.floatingTexts = [];

        // Mode UI buttons sync
        this.updateWardrobeUI();

        // Remove saved game snapshot once loaded
        try {
            localStorage.removeItem('cute_cat_saved_game');
        } catch (e) {}
        this.checkSavedGame();

        this.state = 'PLAYING';
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');

        this.updateHUD();
        this.updateBuffsHUD();
        this.updateWardrobeUI();

        window.cuteAudio.playClick();
        window.cuteAudio.startBGM();
        this.showToast(window.I18N.t('resumeToast'), '🐾');
    }

    discardSavedGame() {
        try {
            localStorage.removeItem('cute_cat_saved_game');
        } catch (e) {}
        this.checkSavedGame();
        window.cuteAudio.playPop(300);
        this.showToast(window.I18N.t('discardToast'), '🗑️');
    }

    // ==========================================
    // Shop, Outfits & Currency System
    // ==========================================
    openShopModal() {
        window.cuteAudio.playClick();
        if (this.state === 'PLAYING') {
            this.wasPlayingBeforeShop = true;
            this.state = 'PAUSED';
            window.cuteAudio.stopBGM();
        } else {
            this.wasPlayingBeforeShop = false;
        }
        this.renderShopModal();
        this.toggleModal('shopModal', true);
    }

    closeShopModal() {
        this.toggleModal('shopModal', false);
        if (this.wasPlayingBeforeShop) {
            this.wasPlayingBeforeShop = false;
            this.state = 'PLAYING';
            this.lastTime = performance.now();
            window.cuteAudio.startBGM();
        }
    }

    getShopItemName(category, item) {
        if (!window.I18N) return item.name;
        if (category === 'skins') return window.I18N.t(`breed_${item.id}`);
        if (category === 'hats') return window.I18N.t(`hat_${item.id}`);
        if (category === 'supplies') {
            return item.id.includes('heart') ? window.I18N.t('sup_heart_name') : window.I18N.t('sup_shield_name');
        }
        return item.name;
    }

    getShopItemDesc(category, item) {
        if (!window.I18N) return item.desc;
        if (category === 'skins') return window.I18N.t(`skin_${item.id}_desc`);
        if (category === 'hats') return window.I18N.t(`hat_${item.id}_desc`);
        if (category === 'supplies') {
            return item.id.includes('heart') ? window.I18N.t('sup_heart_desc') : window.I18N.t('sup_shield_desc');
        }
        return item.desc;
    }

    renderShopModal() {
        const coinsVal = document.getElementById('shopCoinsVal');
        if (coinsVal) coinsVal.textContent = this.coins;

        const t = (k, p) => (window.I18N ? window.I18N.t(k, p) : k);

        // 1. Skins
        const skinsGrid = document.getElementById('shopSkinsGrid');
        if (skinsGrid) {
            skinsGrid.innerHTML = this.shopCatalog.skins.map(s => {
                const isEquipped = this.cat.breed === s.id;
                const isOwned = this.ownedSkins.includes(s.id);
                let btnHtml = '';
                if (isEquipped) {
                    btnHtml = `<button class="shop-item-btn equipped" disabled>${t('equipped')}</button>`;
                } else if (isOwned) {
                    btnHtml = `<button class="shop-item-btn owned" data-action="equip" data-cat="skins" data-id="${s.id}">${t('equipBtn')}</button>`;
                } else {
                    btnHtml = `<button class="shop-item-btn buy" data-action="buy" data-cat="skins" data-id="${s.id}">🪙 ${s.price} ${t('buyBtn')}</button>`;
                }
                return `
                    <div class="shop-card">
                        <div class="icon">${s.icon}</div>
                        <div class="name">${this.getShopItemName('skins', s)}</div>
                        <div class="desc">${this.getShopItemDesc('skins', s)}</div>
                        ${btnHtml}
                    </div>
                `;
            }).join('');
        }

        // 2. Hats
        const hatsGrid = document.getElementById('shopHatsGrid');
        if (hatsGrid) {
            hatsGrid.innerHTML = this.shopCatalog.hats.map(h => {
                const isEquipped = this.cat.accessory === h.id;
                const isOwned = this.ownedHats.includes(h.id);
                let btnHtml = '';
                if (isEquipped) {
                    btnHtml = `<button class="shop-item-btn equipped" disabled>${t('equipped')}</button>`;
                } else if (isOwned) {
                    btnHtml = `<button class="shop-item-btn owned" data-action="equip" data-cat="hats" data-id="${h.id}">${t('equipBtn')}</button>`;
                } else {
                    btnHtml = `<button class="shop-item-btn buy" data-action="buy" data-cat="hats" data-id="${h.id}">🪙 ${h.price} ${t('buyBtn')}</button>`;
                }
                return `
                    <div class="shop-card">
                        <div class="icon">${h.icon}</div>
                        <div class="name">${this.getShopItemName('hats', h)}</div>
                        <div class="desc">${this.getShopItemDesc('hats', h)}</div>
                        ${btnHtml}
                    </div>
                `;
            }).join('');
        }

        // 3. Supplies
        const suppliesGrid = document.getElementById('shopSuppliesGrid');
        if (suppliesGrid) {
            suppliesGrid.innerHTML = this.shopCatalog.supplies.map(sup => {
                return `
                    <div class="shop-card">
                        <div class="icon">${sup.icon}</div>
                        <div class="name">${this.getShopItemName('supplies', sup)}</div>
                        <div class="desc">${this.getShopItemDesc('supplies', sup)}</div>
                        <button class="shop-item-btn buy" data-action="buy" data-cat="supplies" data-id="${sup.id}">🪙 ${sup.price} ${t('useBtn')}</button>
                    </div>
                `;
            }).join('');
        }

        // Bind event listeners on buttons
        const bindGridButtons = (grid) => {
            if (!grid) return;
            grid.querySelectorAll('button[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    const cat = btn.getAttribute('data-cat');
                    const id = btn.getAttribute('data-id');
                    if (action === 'buy') {
                        this.buyShopItem(cat, id);
                    } else if (action === 'equip') {
                        this.equipItem(cat, id);
                    }
                });
            });
        };

        bindGridButtons(skinsGrid);
        bindGridButtons(hatsGrid);
        bindGridButtons(suppliesGrid);
    }

    buyShopItem(category, id) {
        const list = this.shopCatalog[category];
        if (!list) return;
        const item = list.find(i => i.id === id);
        if (!item) return;

        if (this.coins < item.price) {
            window.cuteAudio.playHazard();
            this.showToast(window.I18N.t('coinsShort', { price: item.price, coins: this.coins }), '⚠️');
            return;
        }

        this.coins -= item.price;
        try {
            localStorage.setItem('cute_cat_coins', this.coins.toString());
        } catch (e) {}

        window.cuteAudio.playBuy();

        if (category === 'skins') {
            if (!this.ownedSkins.includes(id)) {
                this.ownedSkins.push(id);
                try {
                    localStorage.setItem('cute_cat_owned_skins', JSON.stringify(this.ownedSkins));
                } catch (e) {}
            }
            this.cat.breed = id;
            try {
                localStorage.setItem('cute_cat_current_breed', id);
            } catch (e) {}
            const name = this.getShopItemName('skins', item);
            this.showToast(window.I18N.t('unlockSkinToast', { name }), item.icon);
        } else if (category === 'hats') {
            if (!this.ownedHats.includes(id)) {
                this.ownedHats.push(id);
                try {
                    localStorage.setItem('cute_cat_owned_hats', JSON.stringify(this.ownedHats));
                } catch (e) {}
            }
            this.cat.accessory = id;
            try {
                localStorage.setItem('cute_cat_current_hat', id);
            } catch (e) {}
            const name = this.getShopItemName('hats', item);
            this.showToast(window.I18N.t('unlockHatToast', { name }), item.icon);
        } else if (category === 'supplies') {
            if (id === 'heart_potion') {
                this.lives = Math.min(3, this.lives + 1);
                this.updateHUD();
                this.showToast(window.I18N.t('potionUsed'), '💖');
            } else if (id === 'shield_pack') {
                this.hasShield = true;
                this.updateBuffsHUD();
                this.showToast(window.I18N.t('shieldUsed'), '🛡️');
            }
        }

        this.updateHUD();
        this.updateWardrobeUI();
        this.renderShopModal();
    }

    equipItem(category, id) {
        const list = this.shopCatalog[category];
        if (!list) return;
        const item = list.find(i => i.id === id);
        if (!item) return;

        if (category === 'skins') {
            this.cat.breed = id;
            try {
                localStorage.setItem('cute_cat_current_breed', id);
            } catch (e) {}
            const name = this.getShopItemName('skins', item);
            this.showToast(window.I18N.t('equipToast', { name }), item.icon);
        } else if (category === 'hats') {
            this.cat.accessory = id;
            try {
                localStorage.setItem('cute_cat_current_hat', id);
            } catch (e) {}
            const name = this.getShopItemName('hats', item);
            this.showToast(window.I18N.t('equipToast', { name }), item.icon);
        }

        window.cuteAudio.playPop(520);
        this.cat.squishX = 1.25;
        this.cat.squishY = 0.8;
        this.updateWardrobeUI();
        this.renderShopModal();
    }

    selectMode(mode) {
        this.gameMode = mode;
        this.timeLeft = mode === 'timed' ? 60000 : 0;
        window.cuteAudio.playPop(480);
        this.updateHUD();
        this.updateWardrobeUI();
    }

    selectBreed(breed) {
        if (!this.breeds.includes(breed)) return;
        this.cat.breed = breed;
        try {
            localStorage.setItem('cute_cat_current_breed', breed);
        } catch (e) {}
        window.cuteAudio.playPop(520);
        this.cat.squishX = 1.25;
        this.cat.squishY = 0.8;
        this.updateWardrobeUI();
    }

    cycleBreed(dir) {
        const idx = this.breeds.indexOf(this.cat.breed);
        const nextIdx = (idx + dir + this.breeds.length) % this.breeds.length;
        this.selectBreed(this.breeds[nextIdx]);
    }

    selectHat(hat) {
        this.cat.accessory = hat;
        try {
            localStorage.setItem('cute_cat_current_hat', hat);
        } catch (e) {}
        window.cuteAudio.playPop(560);
        this.cat.squishX = 1.2;
        this.cat.squishY = 0.85;
        this.updateWardrobeUI();
    }

    updateWardrobeUI() {
        // Breed avatar buttons
        document.querySelectorAll('.breed-avatar-btn').forEach(btn => {
            const breed = btn.getAttribute('data-breed');
            if (breed === this.cat.breed) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hat bubble buttons
        document.querySelectorAll('.hat-bubble-btn').forEach(btn => {
            const hat = btn.getAttribute('data-hat');
            if (hat === this.cat.accessory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Mode segmented pill
        const modeTimedBtn = document.getElementById('modeTimedBtn');
        const modeSurvivalBtn = document.getElementById('modeSurvivalBtn');
        if (modeTimedBtn && modeSurvivalBtn) {
            if (this.gameMode === 'survival') {
                modeSurvivalBtn.classList.add('active');
                modeTimedBtn.classList.remove('active');
            } else {
                modeTimedBtn.classList.add('active');
                modeSurvivalBtn.classList.remove('active');
            }
        }
    }

    onLanguageChanged() {
        this.updateHUD();
        this.renderAchievementsList();
        this.renderRecordsModal();
        this.checkSavedGame();
        if (document.getElementById('shopModal')?.classList.contains('active')) {
            this.renderShopModal();
        }
    }

    // ==========================================
    // Dash / Rush Ability
    // ==========================================
    triggerDash() {
        if (this.state !== 'PLAYING') return;
        const now = performance.now();
        if (now < this.dashCooldown) return;

        this.dashCooldown = now + 900; // 0.9s cooldown
        window.cuteAudio.playDash();

        // Dash burst in moving direction or towards target
        const dashDist = 120 * this.cat.facing;
        this.cat.targetX = Math.max(40, Math.min(this.width - 40, this.cat.x + dashDist));
        this.cat.squishX = 1.4;
        this.cat.squishY = 0.7;

        // Visual dash trail particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.cat.x - (i * 10 * this.cat.facing),
                y: this.cat.y + (Math.random() - 0.5) * 20,
                vx: -this.cat.facing * (2 + Math.random() * 4),
                vy: (Math.random() - 0.5) * 2,
                size: 6 + Math.random() * 4,
                color: 'rgba(255, 255, 255, 0.85)',
                alpha: 1,
                rotation: 0,
                rotSpeed: 0,
                life: 0.6
            });
        }

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate([25]);
        }
    }

    toggleMute() {
        const muted = window.cuteAudio.toggleMute();
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.textContent = muted ? '🔇' : '🔔';
        if (!muted && this.state === 'PLAYING') {
            window.cuteAudio.startBGM();
        }
    }

    startGame() {
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 60000; // Reset 60s
        this.sweetsCaughtCount = 0;
        this.feverActive = false;
        this.feverTimer = 0;
        this.feverMeter = 0;
        this.hasShield = false;
        this.magnetTimer = 0;
        this.slowTimer = 0;
        this.nextShopScore = 300;
        this.items = [];
        this.particles = [];
        this.floatingTexts = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1100;
        this.cat.x = this.width / 2;
        this.cat.targetX = this.width / 2;
        this.cat.mouthState = 'normal';

        this.state = 'PLAYING';
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');

        this.updateHUD();
        this.updateBuffsHUD();
        window.cuteAudio.startBGM();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pauseScreen').classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pauseScreen').classList.add('hidden');
            this.lastTime = performance.now();
        }
    }

    gameOver(reason = 'lives_out') {
        this.state = 'GAMEOVER';
        window.cuteAudio.stopBGM();
        window.cuteAudio.playGameOver();

        // 1. Update Player Records in LocalStorage
        this.records.totalGames = (this.records.totalGames || 0) + 1;
        this.records.totalSweets = (this.records.totalSweets || 0) + this.sweetsCaughtCount;

        if (this.gameMode === 'timed') {
            this.records.timedBest = Math.max(this.records.timedBest || 0, this.score);
        } else {
            this.records.survivalBest = Math.max(this.records.survivalBest || 0, this.score);
        }

        const now = new Date();
        const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (!Array.isArray(this.records.history)) {
            this.records.history = [];
        }

        this.records.history.unshift({
            id: Date.now(),
            date: dateStr,
            mode: this.gameMode,
            score: this.score,
            combo: this.maxCombo,
            reason: reason,
            accessory: this.cat.accessory
        });

        if (this.records.history.length > 30) {
            this.records.history.pop();
        }

        try {
            localStorage.setItem('cute_cat_records', JSON.stringify(this.records));
        } catch (e) {}

        // Clear any saved game snapshot upon game completion
        try {
            localStorage.removeItem('cute_cat_saved_game');
        } catch (e) {}
        this.checkSavedGame();

        // Global Highscore
        const isNewBest = this.score > this.highScore;
        if (isNewBest) {
            this.highScore = this.score;
            localStorage.setItem('cute_cat_highscore', this.highScore.toString());
        }

        // Title and Reason handling
        const titleEl = document.getElementById('gameOverTitle');
        const reasonEl = document.getElementById('gameOverReason');
        if (reason === 'time_up') {
            if (titleEl) titleEl.textContent = window.I18N.t('timeUpTitle');
            if (reasonEl) reasonEl.textContent = window.I18N.t('reasonTimeUp');
        } else if (reason === 'manual_end') {
            if (titleEl) titleEl.textContent = window.I18N.t('manualEndTitle');
            if (reasonEl) reasonEl.textContent = window.I18N.t('reasonManualEnd');
        } else {
            if (titleEl) titleEl.textContent = window.I18N.t('gameOverTitle');
            if (reasonEl) reasonEl.textContent = window.I18N.t('reasonLivesOut');
        }

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalBest').textContent = this.highScore;
        document.getElementById('finalCombo').textContent = this.maxCombo;

        const badge = document.getElementById('newBestBadge');
        if (isNewBest && this.score > 0) {
            badge.textContent = window.I18N.t('newBest');
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('bestDisplay').textContent = this.highScore;

        // Sweet Coins HUD
        const coinDisplay = document.getElementById('coinDisplay');
        if (coinDisplay) coinDisplay.textContent = this.coins;

        // Timer HUD for Timed 60s Mode
        const timePill = document.getElementById('timePill');
        const timeDisplay = document.getElementById('timeDisplay');
        if (this.gameMode === 'timed') {
            if (timePill) timePill.style.display = 'flex';
            const seconds = Math.max(0, Math.ceil(this.timeLeft / 1000));
            if (timeDisplay) timeDisplay.textContent = `${seconds}s`;
            if (seconds <= 10) {
                if (timePill) timePill.classList.add('warning');
            } else {
                if (timePill) timePill.classList.remove('warning');
            }
        } else {
            if (timePill) timePill.style.display = 'none';
        }

        // HUD End Button for Survival Mode
        const hudEndBtn = document.getElementById('hudEndBtn');
        if (hudEndBtn) {
            hudEndBtn.style.display = (this.gameMode === 'survival' && this.state === 'PLAYING') ? 'flex' : 'none';
        }

        // Combo HUD
        const comboEl = document.getElementById('hudCombo');
        const comboText = document.getElementById('hudComboText');
        if (this.combo >= 2) {
            comboEl.classList.remove('hidden');
            comboText.textContent = `${this.combo} COMBO`;
        } else {
            comboEl.classList.add('hidden');
        }

        // Lives hearts
        for (let i = 1; i <= 3; i++) {
            const heart = document.getElementById(`heart${i}`);
            if (heart) {
                if (i <= this.lives) {
                    heart.classList.remove('lost');
                } else {
                    heart.classList.add('lost');
                }
            }
        }

        // Fever meter update
        const feverFill = document.getElementById('feverFill');
        const feverText = document.getElementById('feverActiveText');
        if (this.feverActive) {
            feverFill.style.width = `${(this.feverTimer / 6000) * 100}%`;
            feverText.style.display = 'block';
        } else {
            feverFill.style.width = `${this.feverMeter}%`;
            feverText.style.display = 'none';
        }
    }

    updateBuffsHUD() {
        const container = document.getElementById('activeBuffs');
        if (!container) return;
        let html = '';
        if (this.hasShield) {
            html += `<div class="buff-badge shield"><span>🛡️</span><span>护盾</span></div>`;
        }
        if (this.magnetTimer > 0) {
            html += `<div class="buff-badge magnet"><span>🧲</span><span>磁力 ${Math.ceil(this.magnetTimer / 1000)}s</span></div>`;
        }
        if (this.slowTimer > 0) {
            html += `<div class="buff-badge slow"><span>⏰</span><span>减速 ${Math.ceil(this.slowTimer / 1000)}s</span></div>`;
        }
        container.innerHTML = html;
    }

    // ==========================================
    // Spawning Mechanics (11 Rich Items + Sky-Drop Shop)
    // ==========================================
    spawnItem() {
        // Sky-drop mystery boutique box!
        if (this.score >= this.nextShopScore) {
            this.nextShopScore += 350;
            const margin = 50;
            const x = margin + Math.random() * (this.width - margin * 2);
            this.items.push({
                x: x,
                y: -35,
                radius: 24,
                type: 'shop',
                points: 20,
                speed: 1.8,
                rotation: 0,
                rotationSpeed: 0,
                wobble: 0,
                isShop: true
            });
            window.cuteAudio.playStar();
            this.addFloatingText(window.I18N.t('shopDropped'), x, 45, '#FF8F00', 20);
            return;
        }

        const types = [
            { type: 'strawberry', name: '🍓 草莓', points: 10, speed: 2.3, weight: 32 },
            { type: 'donut', name: '🍩 甜甜圈', points: 20, speed: 2.6, weight: 24 },
            { type: 'taiyaki', name: '🐟 鲷鱼烧', points: 30, speed: 2.9, weight: 18 },
            { type: 'cupcake', name: '🧁 纸杯蛋糕', points: 40, speed: 3.2, weight: 12 },
            { type: 'milk', name: '🥛 纯牛奶', points: 30, speed: 2.5, weight: 8, isMilk: true },
            { type: 'magnet', name: '🧲 磁铁', points: 25, speed: 2.7, weight: 6, isMagnet: true },
            { type: 'shield', name: '🛡️ 护盾', points: 25, speed: 2.6, weight: 6, isShield: true },
            { type: 'clock', name: '⏰ 怀表', points: 25, speed: 2.5, weight: 6, isClock: true },
            { type: 'star', name: '🌟 彩虹星星', points: 50, speed: 3.4, weight: 5, isStar: true },
            { type: 'chili', name: '🌶️ 恶魔辣椒', points: -1, speed: 2.8, weight: 13, isHazard: true },
            { type: 'bomb', name: '💣 调皮炸弹', points: -1, speed: 3.1, weight: 9, isHazard: true, isBomb: true }
        ];

        // In fever mode, only spawn delicious sweets and powerups, NO hazards!
        let activeTypes = types;
        if (this.feverActive) {
            activeTypes = types.filter(t => !t.isHazard);
        }

        // Weighted random selection
        const totalWeight = activeTypes.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selected = activeTypes[0];

        for (const item of activeTypes) {
            if (random < item.weight) {
                selected = item;
                break;
            }
            random -= item.weight;
        }

        const margin = 42;
        const x = margin + Math.random() * (this.width - margin * 2);
        const rotationSpeed = (Math.random() - 0.5) * 0.05;

        // Difficulty multiplier based on score
        const speedBoost = Math.min(2.5, this.score / 260);

        this.items.push({
            x: x,
            y: -30,
            radius: 20,
            type: selected.type,
            points: selected.points,
            speed: (selected.speed + speedBoost) * (this.feverActive ? 1.25 : 1),
            rotation: 0,
            rotationSpeed: rotationSpeed,
            wobble: Math.random() * Math.PI * 2,
            isHazard: !!selected.isHazard,
            isBomb: !!selected.isBomb,
            isStar: !!selected.isStar,
            isMilk: !!selected.isMilk,
            isMagnet: !!selected.isMagnet,
            isShield: !!selected.isShield,
            isClock: !!selected.isClock
        });
    }

    triggerFever() {
        this.feverActive = true;
        this.feverTimer = 6000; // 6 seconds
        this.feverMeter = 100;
        window.cuteAudio.playStar();

        for (let i = 0; i < 35; i++) {
            this.addConfetti(this.width / 2, this.height / 2);
        }

        this.addFloatingText(window.I18N.t('starFever'), this.width / 2, this.height / 2 - 40, '#FF4081', 26);
    }

    addConfetti(x, y) {
        const colors = ['#FF80AB', '#FFD54F', '#80D8FF', '#B9F6CA', '#EA80FC'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5.5;

        this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            size: 4 + Math.random() * 6,
            color: color,
            alpha: 1,
            rotation: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.25,
            life: 1
        });
    }

    addFloatingText(text, x, y, color = '#FF6B8B', size = 18) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            size: size,
            alpha: 1,
            vy: -1.7
        });
    }

    // ==========================================
    // Catch Handling & Combo Rewards
    // ==========================================
    handleCatch(item) {
        // Sky-Drop Boutique Catch
        if (item.isShop) {
            window.cuteAudio.playStar();
            this.addFloatingText(window.I18N.t('shopFound'), item.x, item.y - 10, '#FF8F00', 22);
            for (let i = 0; i < 20; i++) this.addConfetti(item.x, item.y);
            this.coins += 25;
            try {
                localStorage.setItem('cute_cat_coins', this.coins.toString());
            } catch(e) {}
            this.updateHUD();
            setTimeout(() => {
                this.openShopModal();
            }, 150);
            return;
        }

        // 1. Hazard Handling (Chili or Bomb)
        if (item.isHazard) {
            // Check if protected by Rainbow Shield!
            if (this.hasShield) {
                this.hasShield = false;
                window.cuteAudio.playShieldBreak();
                this.screenShake = 6;
                this.cat.mouthState = 'open';
                this.cat.squishX = 1.2;
                this.cat.squishY = 0.8;
                this.addFloatingText(window.I18N.t('shieldBlock'), item.x, item.y - 10, '#00E676', 20);
                this.unlockAchievement('shield_block');
                this.updateBuffsHUD();
                return;
            }

            // No shield -> Take damage & reset combo
            this.lives--;
            this.combo = 0;
            this.screenShake = item.isBomb ? 24 : 16;
            this.cat.mouthState = 'hurt';
            this.cat.mouthTimer = 60; // 1s

            if (item.isBomb) {
                window.cuteAudio.playBomb();
                this.addFloatingText(window.I18N.t('bombHit'), item.x, item.y - 10, '#FF1744', 21);
            } else {
                window.cuteAudio.playHurt();
                this.addFloatingText(window.I18N.t('chiliHit'), item.x, item.y - 10, '#FF1744', 20);
            }

            if (navigator.vibrate) {
                navigator.vibrate([80, 40, 80]);
            }

            // Hurt confetti
            for (let i = 0; i < 12; i++) {
                this.addConfetti(item.x, item.y);
            }

            const currentHeart = document.getElementById(`heart${this.lives + 1}`);
            if (currentHeart) {
                currentHeart.classList.add('pop');
            }

            this.updateHUD();

            if (this.lives <= 0) {
                this.gameOver();
            }
            return;
        }

        // 2. Delicious Sweet / Powerup Caught!
        this.sweetsCaughtCount++;
        this.unlockAchievement('first_catch');
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // Cat squish effect and happy face
        this.cat.squishX = 1.25;
        this.cat.squishY = 0.78;
        this.cat.mouthState = 'happy';
        this.cat.mouthTimer = 26;
        this.cat.earWiggle = 16;

        // Specific Item Buffs
        if (item.isMilk) {
            window.cuteAudio.playHeal();
            this.unlockAchievement('drink_milk');
            if (this.lives < 3) {
                this.lives++;
                this.addFloatingText(window.I18N.t('milkHeal'), item.x, item.y - 10, '#FF4081', 20);
            } else {
                this.score += 80;
                this.addFloatingText(window.I18N.t('milkFull'), item.x, item.y - 10, '#00B0FF', 19);
            }
        } else if (item.isMagnet) {
            window.cuteAudio.playMagnet();
            this.magnetTimer = 6000; // 6 seconds
            this.unlockAchievement('magnet_power');
            this.addFloatingText(window.I18N.t('magnetOn'), item.x, item.y - 10, '#FF9100', 20);
            this.updateBuffsHUD();
        } else if (item.isShield) {
            window.cuteAudio.playShield();
            this.hasShield = true;
            this.addFloatingText(window.I18N.t('shieldOn'), item.x, item.y - 10, '#00E5FF', 20);
            this.updateBuffsHUD();
        } else if (item.isClock) {
            window.cuteAudio.playSlow();
            this.slowTimer = 5000; // 5 seconds slow-mo
            if (this.gameMode === 'timed') {
                this.timeLeft += 5000; // +5 seconds time bonus!
                this.addFloatingText(window.I18N.t('slowTimed'), item.x, item.y - 10, '#7C4DFF', 20);
            } else {
                this.addFloatingText(window.I18N.t('slowSurv'), item.x, item.y - 10, '#7C4DFF', 20);
            }
            this.updateBuffsHUD();
        } else if (item.isStar) {
            this.triggerFever();
        } else {
            window.cuteAudio.playCatch(Math.min(this.combo, 10));
        }

        // Points calculation with combo bonus
        const comboMultiplier = 1 + Math.min(2.5, (this.combo - 1) * 0.12);
        const feverMultiplier = this.feverActive ? 2 : 1;
        const earned = Math.round(item.points * comboMultiplier * feverMultiplier);
        this.score += earned;

        // Earn Sweet Coins for Outfit & Skin Shop!
        const earnedCoins = Math.max(1, Math.floor(earned / 12));
        this.coins += earnedCoins;
        if (item.isStar) {
            this.coins += 15;
        }
        try {
            localStorage.setItem('cute_cat_coins', this.coins.toString());
        } catch(e) {}

        if (this.sweetsCaughtCount % 3 === 0 || item.isStar) {
            window.cuteAudio.playCoin();
        }

        // Floating points
        let text = `+${earned}`;
        if (this.combo >= 3) {
            text += ` (x${this.combo})`;
        }
        this.addFloatingText(text, item.x, item.y - 10, item.isStar ? '#FFB300' : '#FF5A87', 18);

        // Combo Milestones Rewards!
        if (this.combo === 5) {
            this.score += 50;
            this.addFloatingText('🍬 SWEET! +50', this.width / 2, this.height / 2 - 30, '#FF4081', 22);
        } else if (this.combo === 10) {
            this.score += 150;
            this.addFloatingText('🔥 TASTY! +150', this.width / 2, this.height / 2 - 30, '#FF9100', 24);
        } else if (this.combo === 15) {
            this.score += 300;
            this.unlockAchievement('combo_15');
            this.addFloatingText('✨ FABULOUS! +300', this.width / 2, this.height / 2 - 30, '#9C27B0', 26);
            for (let i = 0; i < 20; i++) this.addConfetti(this.width / 2, this.height / 2);
        } else if (this.combo === 20) {
            this.score += 500;
            this.hasShield = true;
            const shieldWord = window.I18N && window.I18N.currentLang === 'en' ? 'Free Shield!' : '赠送护盾!';
            this.addFloatingText(`👑 UNSTOPPABLE! +500 & ${shieldWord}`, this.width / 2, this.height / 2 - 30, '#FFD700', 26);
            this.updateBuffsHUD();
            for (let i = 0; i < 30; i++) this.addConfetti(this.width / 2, this.height / 2);
        }

        // Score 1000 achievement
        if (this.score >= 1000) {
            this.unlockAchievement('score_1000');
        }

        // Confetti particles on catch
        for (let i = 0; i < 7; i++) {
            this.addConfetti(item.x, item.y);
        }

        // Charge fever meter
        if (!this.feverActive) {
            this.feverMeter = Math.min(100, this.feverMeter + 8);
            if (this.feverMeter >= 100) {
                this.triggerFever();
            }
        }

        this.updateHUD();
    }

    // ==========================================
    // Update Step
    // ==========================================
    update(dt) {
        // Elastic recovery of squish (always active)
        this.cat.squishX += (1 - this.cat.squishX) * 0.15;
        this.cat.squishY += (1 - this.cat.squishY) * 0.15;

        // Blinking timer (always active)
        this.cat.blinkTimer++;
        if (this.cat.blinkTimer > 180) {
            this.cat.isBlinking = true;
            if (this.cat.blinkTimer > 192) {
                this.cat.isBlinking = false;
                this.cat.blinkTimer = 0;
            }
        }

        // Mouth timer
        if (this.cat.mouthTimer > 0) {
            this.cat.mouthTimer--;
            if (this.cat.mouthTimer <= 0) {
                this.cat.mouthState = 'normal';
            }
        }

        // Ear wiggle
        if (this.cat.earWiggle > 0) {
            this.cat.earWiggle--;
        }

        if (this.state !== 'PLAYING') return;

        // Countdown timer in Timed 60s Mode
        if (this.gameMode === 'timed') {
            this.timeLeft -= dt;
            const timeDisplay = document.getElementById('timeDisplay');
            const timePill = document.getElementById('timePill');
            const seconds = Math.max(0, Math.ceil(this.timeLeft / 1000));
            if (timeDisplay) timeDisplay.textContent = `${seconds}s`;
            if (seconds <= 10) {
                if (timePill) timePill.classList.add('warning');
            } else {
                if (timePill) timePill.classList.remove('warning');
            }

            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.updateHUD();
                this.gameOver('time_up');
                return;
            }
        }

        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake *= 0.88;
            if (this.screenShake < 0.3) this.screenShake = 0;
        }

        // Buff Timers countdown
        if (this.magnetTimer > 0) {
            this.magnetTimer -= dt;
            if (this.magnetTimer <= 0) {
                this.magnetTimer = 0;
                this.updateBuffsHUD();
            }
        }

        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) {
                this.slowTimer = 0;
                this.updateBuffsHUD();
            }
        }

        // Keyboard movement
        if (this.keys.left) {
            this.cat.targetX -= this.cat.speed;
        }
        if (this.keys.right) {
            this.cat.targetX += this.cat.speed;
        }
        this.cat.targetX = Math.max(40, Math.min(this.width - 40, this.cat.targetX));

        // Smooth kitty interpolation
        const prevX = this.cat.x;
        this.cat.x += (this.cat.targetX - this.cat.x) * 0.25;

        if (Math.abs(this.cat.x - prevX) > 0.4) {
            this.cat.facing = this.cat.x > prevX ? 1 : -1;
        }

        // Fever mode countdown
        if (this.feverActive) {
            this.feverTimer -= dt;
            if (this.feverTimer <= 0) {
                this.feverActive = false;
                this.feverMeter = 0;
                this.updateHUD();
            } else {
                this.updateHUD();
            }
        }

        // Spawn timer
        this.spawnTimer += dt;
        const currentInterval = this.feverActive ? 420 : Math.max(520, this.spawnInterval - Math.floor(this.score / 60) * 25);
        if (this.spawnTimer >= currentInterval) {
            this.spawnTimer = 0;
            this.spawnItem();
        }

        // Update falling items
        const basketY = this.cat.y - 20;
        const basketLeft = this.cat.x - 38;
        const basketRight = this.cat.x + 38;
        const isSlowMo = this.slowTimer > 0;

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const actualSpeed = item.speed * (isSlowMo ? 0.5 : 1);
            item.y += actualSpeed;
            item.rotation += item.rotationSpeed;
            item.wobble += 0.05;

            // Catnip Magnet Attraction Effect
            if (this.magnetTimer > 0 && !item.isHazard) {
                const distToCat = Math.hypot(this.cat.x - item.x, basketY - item.y);
                if (distToCat < 260) {
                    item.x += (this.cat.x - item.x) * 0.085;
                    item.y += (basketY - item.y) * 0.085;
                }
            }

            // Cat opens mouth anticipating falling sweet if close!
            const dx = Math.abs(item.x - this.cat.x);
            const dy = basketY - item.y;
            if (!item.isHazard && dy > 0 && dy < 95 && dx < 50 && this.cat.mouthState === 'normal') {
                this.cat.mouthState = 'open';
            }

            // Collision check with cat basket
            if (item.y + item.radius >= basketY && item.y - item.radius <= basketY + 30) {
                if (item.x >= basketLeft && item.x <= basketRight) {
                    this.handleCatch(item);
                    this.items.splice(i, 1);
                    continue;
                }
            }

            // Fall off bottom (Drop penalty: Interrupts combo!)
            if (item.y > this.height + 40) {
                if (!item.isHazard && !this.feverActive) {
                    // Dropped a delicious sweet -> COMBO INTERRUPTED!
                    if (this.combo > 0) {
                        this.combo = 0;
                        const dropX = Math.max(50, Math.min(this.width - 50, item.x));
                        const dropText = window.I18N ? window.I18N.t('dropBreak') : '💧 Drop Break!';
                        this.addFloatingText(dropText, dropX, this.height - 35, '#5C93C4', 16);
                        window.cuteAudio.playMiss();
                        this.updateHUD();
                    }
                }
                this.items.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.16; // gravity
            p.rotation += p.rotSpeed;
            p.life -= 0.022;
            p.alpha = Math.max(0, p.life);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.alpha -= 0.024;
            if (t.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update clouds
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x - cloud.radius * 2 > this.width) {
                cloud.x = -cloud.radius * 2;
                cloud.y = 30 + Math.random() * 240;
            }
        }
    }

    // ==========================================
    // Drawing Pipeline
    // ==========================================
    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Apply screen shake
        if (this.screenShake > 0) {
            const sx = (Math.random() - 0.5) * this.screenShake;
            const sy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(sx, sy);
        }

        // 1. Background
        this.drawBackground();

        // 2. Falling Items (with Hazard Cues)
        for (const item of this.items) {
            this.drawItem(item);
        }

        // 3. Cat Character (with Rainbow Shield Aura & Accessories)
        this.drawCat(this.cat.x, this.cat.y);

        // 4. Particles
        for (const p of this.particles) {
            this.drawParticle(p);
        }

        // 5. Floating Scores & Alerts
        for (const t of this.floatingTexts) {
            this.drawFloatingText(t);
        }

        this.ctx.restore();

        // If start screen is visible, render interactive preview mascot
        if (this.state === 'START' && this.mascotCtx) {
            this.drawMascotPreview();
        }
    }

    drawMascotPreview() {
        if (!this.mascotCtx) return;
        const mCtx = this.mascotCtx;
        mCtx.clearRect(0, 0, 150, 150);

        const oldCtx = this.ctx;
        this.ctx = mCtx;

        // Draw preview cat centered
        this.drawCat(75, 95);

        this.ctx = oldCtx;
    }

    drawBackground() {
        const ctx = this.ctx;

        // Soft pastel gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        if (this.feverActive) {
            bgGrad.addColorStop(0, '#FFE8F0');
            bgGrad.addColorStop(0.5, '#FFF2D9');
            bgGrad.addColorStop(1, '#FFE3EC');
        } else if (this.slowTimer > 0) {
            bgGrad.addColorStop(0, '#EDE7F6');
            bgGrad.addColorStop(0.5, '#F3E5F5');
            bgGrad.addColorStop(1, '#EDE7F6');
        } else {
            bgGrad.addColorStop(0, '#F5FBFF');
            bgGrad.addColorStop(0.6, '#FFF9FB');
            bgGrad.addColorStop(1, '#FFF2F5');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Fluffy clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (const c of this.clouds) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.arc(c.x + c.radius * 0.8, c.y - c.radius * 0.2, c.radius * 0.7, 0, Math.PI * 2);
            ctx.arc(c.x - c.radius * 0.7, c.y + c.radius * 0.1, c.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cute kitchen floor line at bottom
        const groundY = this.height - 24;
        ctx.fillStyle = '#FFE0E9';
        ctx.fillRect(0, groundY, this.width, 24);

        // Dotted decorative ribbon
        ctx.fillStyle = '#FF9EBA';
        for (let x = 12; x < this.width; x += 24) {
            ctx.beginPath();
            ctx.arc(x, groundY + 12, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==========================================
    // Super Cute Cat & Pet Drawing Routine
    // ==========================================
    drawCat(x, y) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(this.cat.squishX, this.cat.squishY);

        const time = performance.now() * 0.004;
        const tailAngle = Math.sin(time) * 0.28;
        const earWiggleOffset = Math.sin(performance.now() * 0.04) * (this.cat.earWiggle > 0 ? 5 : 0);

        const breed = this.cat.breed || 'white';
        let coatColor = '#FFFFFF';
        let strokeColor = '#FFCCD8';
        let earInnerColor = '#FFAEC0';
        let tailColor = '#FFFFFF';
        let whiskerColor = '#D4A5A5';
        let eyeColor = '#3E2A2A';

        if (breed === 'orange') {
            coatColor = '#FFA726';
            strokeColor = '#F57C00';
            earInnerColor = '#FF8A65';
            tailColor = '#FFA726';
            whiskerColor = '#E65100';
            eyeColor = '#2E7D32';
        } else if (breed === 'black') {
            coatColor = '#263238';
            strokeColor = '#102027';
            earInnerColor = '#546E7A';
            tailColor = '#263238';
            whiskerColor = '#ECEFF1';
            eyeColor = '#FFD54F';
        } else if (breed === 'capybara') {
            coatColor = '#8D6E63';
            strokeColor = '#5D4037';
            earInnerColor = '#A1887F';
            tailColor = '#6D4C41';
            whiskerColor = '#4E342E';
            eyeColor = '#3E2723';
        }

        // Rainbow Shield Bubble Aura (if active)
        if (this.hasShield) {
            ctx.save();
            const pulse = (Math.sin(time * 3) + 1) * 0.5;
            const shieldGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 52 + pulse * 4);
            shieldGrad.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
            shieldGrad.addColorStop(0.7, 'rgba(234, 128, 252, 0.25)');
            shieldGrad.addColorStop(1, 'rgba(0, 229, 255, 0.6)');
            ctx.fillStyle = shieldGrad;
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 48 + pulse * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Soft ground shadow under cat
        ctx.fillStyle = 'rgba(230, 160, 180, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 24, 38, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy Tail behind body
        ctx.save();
        ctx.translate(-26 * this.cat.facing, 8);
        ctx.rotate(-tailAngle * this.cat.facing);
        ctx.strokeStyle = tailColor;
        ctx.lineWidth = breed === 'capybara' ? 8 : 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-14 * this.cat.facing, -12, -22 * this.cat.facing, -22);
        ctx.stroke();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Ears
        if (breed === 'capybara') {
            // Capybara has small rounded ears
            const drawCapyEar = (earX, earY) => {
                ctx.save();
                ctx.translate(earX, earY);
                ctx.fillStyle = coatColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = earInnerColor;
                ctx.beginPath();
                ctx.ellipse(0, 1, 4, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };
            drawCapyEar(-24, -14);
            drawCapyEar(24, -14);
        } else {
            // Cat Ears (Left & Right)
            const drawEar = (earX, earY, isLeft) => {
                ctx.save();
                ctx.translate(earX, earY + (isLeft ? earWiggleOffset : -earWiggleOffset));

                // Outer Ear
                ctx.fillStyle = coatColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(isLeft ? -12 : 12, 10);
                ctx.quadraticCurveTo(isLeft ? -20 : 20, -18, isLeft ? -10 : 10, -26);
                ctx.quadraticCurveTo(isLeft ? -2 : 2, -20, 0, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Inner Pink Ear
                ctx.fillStyle = earInnerColor;
                ctx.beginPath();
                ctx.moveTo(isLeft ? -10 : 10, 6);
                ctx.quadraticCurveTo(isLeft ? -16 : 16, -14, isLeft ? -9 : 9, -20);
                ctx.quadraticCurveTo(isLeft ? -3 : 3, -16, -1, 3);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            };

            drawEar(-20, -22, true);
            drawEar(20, -22, false);
        }

        // Pet Body / Head
        ctx.fillStyle = coatColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.ellipse(0, -2, 34, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Special breed markings
        if (breed === 'orange') {
            // Tabby stripes on forehead & cheeks
            ctx.fillStyle = '#E65100';
            ctx.beginPath();
            ctx.moveTo(0, -18); ctx.lineTo(-4, -26); ctx.lineTo(0, -23); ctx.lineTo(4, -26); ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-14, -12, 4, 1.5, -0.4, 0, Math.PI * 2);
            ctx.ellipse(14, -12, 4, 1.5, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Creamy chin
            ctx.fillStyle = '#FFF8E7';
            ctx.beginPath();
            ctx.ellipse(0, 10, 14, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (breed === 'black') {
            // Tuxedo white chest bib
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(0, 12, 16, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (breed === 'capybara') {
            // Capybara signature snout
            ctx.fillStyle = '#6D4C41';
            ctx.beginPath();
            ctx.roundRect(-15, 0, 30, 18, [6, 6, 12, 12]);
            ctx.fill();
            // Nostril dashes
            ctx.fillStyle = '#3E2723';
            ctx.fillRect(-6, 7, 3, 2);
            ctx.fillRect(3, 7, 3, 2);

            // Mini Yuzu orange on head if no hat
            if (this.cat.accessory === 'none') {
                ctx.fillStyle = '#FFA726';
                ctx.beginPath();
                ctx.arc(0, -28, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#66BB6A';
                ctx.beginPath();
                ctx.ellipse(2, -34, 3, 1.5, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Cheeks Blushing
        ctx.fillStyle = breed === 'black' ? 'rgba(255, 128, 171, 0.55)' : 'rgba(255, 140, 165, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-21, 2, 7, 4.5, -0.1, 0, Math.PI * 2);
        ctx.ellipse(21, 2, 7, 4.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers (for cats)
        if (breed !== 'capybara') {
            ctx.strokeStyle = whiskerColor;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-25, -1); ctx.lineTo(-40, -4);
            ctx.moveTo(-25, 4);  ctx.lineTo(-39, 6);
            ctx.moveTo(25, -1);  ctx.lineTo(40, -4);
            ctx.moveTo(25, 4);   ctx.lineTo(39, 6);
            ctx.stroke();
        }

        // Eyes
        const eyeOffset = 13;
        const eyeY = -4;

        if (this.cat.mouthState === 'hurt') {
            // Hurt dizzy spiral eyes @_@
            ctx.strokeStyle = breed === 'black' ? '#FFD54F' : '#6E4545';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-eyeOffset, eyeY, 5, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(eyeOffset, eyeY, 5, 0, Math.PI * 1.5);
            ctx.stroke();
        } else if (this.cat.isBlinking || this.cat.mouthState === 'happy') {
            // Happy closed eyes (^ ^)
            ctx.strokeStyle = breed === 'black' ? '#ECEFF1' : '#4A3535';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.arc(-eyeOffset, eyeY + 1, 5.5, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(eyeOffset, eyeY + 1, 5.5, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else if (breed === 'capybara') {
            // Calm sleepy zen slits for capybara (- -)
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-16, eyeY); ctx.lineTo(-8, eyeY);
            ctx.moveTo(8, eyeY);   ctx.lineTo(16, eyeY);
            ctx.stroke();
        } else {
            // Normal adorable eyes
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.ellipse(-eyeOffset, eyeY, 4.5, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(eyeOffset, eyeY, 4.5, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            if (breed === 'black') {
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.ellipse(-eyeOffset, eyeY, 2, 5, 0, 0, Math.PI * 2);
                ctx.ellipse(eyeOffset, eyeY, 2, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Specular highlights
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-eyeOffset - 1.5, eyeY - 2, 2, 0, Math.PI * 2);
            ctx.arc(eyeOffset - 1.5, eyeY - 2, 2, 0, Math.PI * 2);
            ctx.arc(-eyeOffset + 1.5, eyeY + 2, 1, 0, Math.PI * 2);
            ctx.arc(eyeOffset + 1.5, eyeY + 2, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Little Pink Nose (for cats)
        if (breed !== 'capybara') {
            ctx.fillStyle = breed === 'black' ? '#FF80AB' : '#FF8FA3';
            ctx.beginPath();
            ctx.moveTo(0, 1);
            ctx.lineTo(-2.5, -2);
            ctx.lineTo(2.5, -2);
            ctx.closePath();
            ctx.fill();

            // Mouth
            ctx.strokeStyle = breed === 'black' ? '#ECEFF1' : '#5A3D3D';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (this.cat.mouthState === 'open') {
                ctx.fillStyle = '#FF6B8B';
                ctx.beginPath();
                ctx.arc(0, 5, 6, 0, Math.PI);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#FFAEC0';
                ctx.beginPath();
                ctx.arc(0, 8, 3.5, 0, Math.PI);
                ctx.fill();
            } else if (this.cat.mouthState === 'happy') {
                ctx.fillStyle = '#FF7597';
                ctx.beginPath();
                ctx.arc(0, 4, 7, 0, Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (this.cat.mouthState === 'hurt') {
                ctx.beginPath();
                ctx.moveTo(-5, 7);
                ctx.quadraticCurveTo(0, 3, 5, 7);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(-3, 4, 3, 0.1, Math.PI * 0.9);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(3, 4, 3, 0.1, Math.PI * 0.9);
                ctx.stroke();
            }
        }

        // Accessories / Hats
        this.drawAccessory(this.cat.accessory);

        // Cat Paws holding the catch basket
        this.drawBasket();

        ctx.restore();
    }

    drawAccessory(type) {
        const ctx = this.ctx;
        if (type === 'bow') {
            ctx.save();
            ctx.translate(19, -24);
            ctx.rotate(0.3);

            ctx.fillStyle = '#FF5277';
            ctx.beginPath();
            ctx.ellipse(-8, 0, 7, 5, -0.3, 0, Math.PI * 2);
            ctx.ellipse(8, 0, 7, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FF2A55';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#FF5277';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-2, 3); ctx.lineTo(-6, 12);
            ctx.moveTo(2, 3);  ctx.lineTo(6, 12);
            ctx.stroke();

            ctx.restore();
        } else if (type === 'chef') {
            ctx.save();
            ctx.translate(0, -32);

            ctx.fillStyle = '#FFCCD8';
            ctx.fillRect(-18, 2, 36, 7);

            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#FFCCD8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-13, -8, 12, 0, Math.PI * 2);
            ctx.arc(0, -14, 15, 0, Math.PI * 2);
            ctx.arc(13, -8, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        } else if (type === 'flower') {
            ctx.save();
            ctx.translate(-18, -24);

            ctx.fillStyle = '#FFB6C1';
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 5);
                ctx.beginPath();
                ctx.ellipse(0, -7, 4.5, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = '#FFD54F';
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else if (type === 'crown') {
            ctx.save();
            ctx.translate(0, -32);

            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-14, 4);
            ctx.lineTo(-14, -10);
            ctx.lineTo(-7, -4);
            ctx.lineTo(0, -12);
            ctx.lineTo(7, -4);
            ctx.lineTo(14, -10);
            ctx.lineTo(14, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#FF1744';
            ctx.beginPath();
            ctx.arc(-14, -10, 2, 0, Math.PI * 2);
            ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
            ctx.arc(14, -10, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else if (type === 'tophat') {
            ctx.save();
            ctx.translate(0, -30);

            // Brim
            ctx.fillStyle = '#212121';
            ctx.strokeStyle = '#111111';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 4, 22, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cylinder
            ctx.fillStyle = '#263238';
            ctx.beginPath();
            ctx.roundRect(-13, -22, 26, 26, [3, 3, 0, 0]);
            ctx.fill();
            ctx.stroke();

            // Ribbon Band
            ctx.fillStyle = '#D32F2F';
            ctx.fillRect(-13, 0, 26, 4);

            // Gold Buckle
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-4, -1, 8, 6);

            ctx.restore();
        } else if (type === 'glasses') {
            ctx.save();
            ctx.translate(0, -4);

            // Dark sunglasses lenses
            ctx.fillStyle = 'rgba(25, 25, 30, 0.92)';
            ctx.strokeStyle = '#FFD700'; // Gold frame
            ctx.lineWidth = 1.8;

            // Left lens
            ctx.beginPath();
            ctx.roundRect(-22, -6, 17, 13, 3);
            ctx.fill();
            ctx.stroke();

            // Right lens
            ctx.beginPath();
            ctx.roundRect(5, -6, 17, 13, 3);
            ctx.fill();
            ctx.stroke();

            // Bridge
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -1);
            ctx.lineTo(5, -1);
            ctx.stroke();

            // Glare reflection
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-18, -3); ctx.lineTo(-12, -3);
            ctx.moveTo(9, -3);   ctx.lineTo(15, -3);
            ctx.stroke();

            ctx.restore();
        }
    }

    drawBasket() {
        const ctx = this.ctx;
        const basketY = 16;
        const basketWidth = 76;
        const basketHeight = 22;

        ctx.fillStyle = '#FFE0B2';
        ctx.strokeStyle = '#FFB74D';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(-basketWidth / 2, basketY - 6);
        ctx.lineTo(basketWidth / 2, basketY - 6);
        ctx.quadraticCurveTo(basketWidth / 2 - 4, basketY + basketHeight, 0, basketY + basketHeight);
        ctx.quadraticCurveTo(-basketWidth / 2 + 4, basketY + basketHeight, -basketWidth / 2, basketY - 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 167, 38, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-20, basketY - 4); ctx.lineTo(-10, basketY + 16);
        ctx.moveTo(0, basketY - 5);   ctx.lineTo(10, basketY + 18);
        ctx.moveTo(20, basketY - 4);  ctx.lineTo(26, basketY + 14);
        ctx.stroke();

        // Paws matching breed
        const breed = this.cat.breed || 'white';
        let pawFill = '#FFFFFF';
        let pawStroke = '#FFCCD8';
        if (breed === 'orange') {
            pawFill = '#FFA726';
            pawStroke = '#F57C00';
        } else if (breed === 'black') {
            pawFill = '#FFFFFF'; // Cute white mittens on black cat!
            pawStroke = '#B0BEC5';
        } else if (breed === 'capybara') {
            pawFill = '#8D6E63';
            pawStroke = '#5D4037';
        }

        const drawPaw = (pawX) => {
            ctx.fillStyle = pawFill;
            ctx.strokeStyle = pawStroke;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(pawX, basketY - 7, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#FFAEC0';
            ctx.beginPath();
            ctx.arc(pawX - 3, basketY - 8, 1.5, 0, Math.PI * 2);
            ctx.arc(pawX, basketY - 9, 1.5, 0, Math.PI * 2);
            ctx.arc(pawX + 3, basketY - 8, 1.5, 0, Math.PI * 2);
            ctx.fill();
        };

        drawPaw(-24);
        drawPaw(24);
    }

    // ==========================================
    // Drawing Desserts & Hazards (with Clear Visual Cues)
    // ==========================================
    drawItem(item) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(item.x, item.y);

        // Prominent Warning Cue for Hazards (Chili / Bomb)
        if (item.isHazard) {
            const pulse = (Math.sin(performance.now() * 0.01) + 1) * 0.5;
            // Red glowing danger ring
            ctx.fillStyle = `rgba(255, 23, 68, ${0.18 + pulse * 0.22})`;
            ctx.beginPath();
            ctx.arc(0, 0, item.radius + 8 + pulse * 4, 0, Math.PI * 2);
            ctx.fill();

            // Floating danger exclamation triangle
            ctx.save();
            ctx.translate(0, -item.radius - 14 + Math.sin(performance.now() * 0.012) * 3);
            ctx.fillStyle = '#FF1744';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-7, 4);
            ctx.lineTo(7, 4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('!', 0, 2.5);
            ctx.restore();
        }

        ctx.rotate(item.rotation);

        switch (item.type) {
            case 'strawberry':
                this.drawStrawberry();
                break;
            case 'donut':
                this.drawDonut();
                break;
            case 'taiyaki':
                this.drawTaiyaki();
                break;
            case 'cupcake':
                this.drawCupcake();
                break;
            case 'milk':
                this.drawMilk();
                break;
            case 'magnet':
                this.drawMagnet();
                break;
            case 'shield':
                this.drawShieldItem();
                break;
            case 'clock':
                this.drawClock();
                break;
            case 'star':
                this.drawStar();
                break;
            case 'chili':
                this.drawChili();
                break;
            case 'bomb':
                this.drawBomb();
                break;
            case 'shop':
                this.drawShopBox();
                break;
        }

        ctx.restore();
    }

    drawShopBox() {
        const ctx = this.ctx;
        const time = performance.now() * 0.005;
        const sway = Math.sin(time * 2) * 3;

        ctx.save();
        ctx.translate(sway, 0);

        // Parachute canopy above
        ctx.save();
        ctx.translate(0, -24);
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Striped patterns on canopy
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI * 1.25, Math.PI * 1.45);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#40C4FF';
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI * 1.55, Math.PI * 1.75);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Parachute ropes to gift box
        ctx.strokeStyle = '#B0BEC5';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(-8, 18);
        ctx.moveTo(16, 0);  ctx.lineTo(8, 18);
        ctx.moveTo(0, 0);   ctx.lineTo(0, 18);
        ctx.stroke();
        ctx.restore();

        // Gift box body
        ctx.fillStyle = '#FFB74D';
        ctx.strokeStyle = '#F57C00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-12, -4, 24, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Gift box lid
        ctx.fillStyle = '#FFA726';
        ctx.beginPath();
        ctx.roundRect(-14, -8, 28, 6, 2);
        ctx.fill();
        ctx.stroke();

        // Pink Ribbon across box
        ctx.fillStyle = '#FF4081';
        ctx.fillRect(-3, -4, 6, 20);
        ctx.fillRect(-12, 4, 24, 5);

        // Ribbon bow on top
        ctx.beginPath();
        ctx.ellipse(-4, -10, 4, 3, -0.4, 0, Math.PI * 2);
        ctx.ellipse(4, -10, 4, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Little Shop label/icon
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏪', 0, 11);

        // Sparkling glow aura
        const pulse = (Math.sin(time * 3) + 1) * 0.5;
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 4, 18 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawStrawberry() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FF4D6D';
        ctx.strokeStyle = '#C9184A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.bezierCurveTo(-18, 4, -16, -14, 0, -10);
        ctx.bezierCurveTo(16, -14, 18, 4, 0, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFF3B0';
        const seeds = [[-6, -2], [6, -2], [0, 4], [-4, 8], [4, 8], [0, -6]];
        for (const [sx, sy] of seeds) {
            ctx.beginPath();
            ctx.ellipse(sx, sy, 1.2, 2, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#70E000';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, -16);
        ctx.lineTo(-2, -12);
        ctx.lineTo(0, -18);
        ctx.lineTo(2, -12);
        ctx.lineTo(8, -16);
        ctx.closePath();
        ctx.fill();
    }

    drawDonut() {
        const ctx = this.ctx;
        ctx.fillStyle = '#E8985E';
        ctx.strokeStyle = '#C27038';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF85A1';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF9FB';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C27038';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const sprinkles = [
            [-8, -5, '#FFF'], [7, -6, '#FFE600'], [-6, 6, '#00E5FF'],
            [6, 6, '#76FF03'], [0, -9, '#FF3D00']
        ];
        for (const [x, y, col] of sprinkles) {
            ctx.fillStyle = col;
            ctx.fillRect(x, y, 3, 1.5);
        }
    }

    drawTaiyaki() {
        const ctx = this.ctx;
        ctx.fillStyle = '#F5B041';
        ctx.strokeStyle = '#D68910';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(2, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-22, -8);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-22, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#784212';
        ctx.beginPath();
        ctx.arc(10, -3, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(150, 75, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(1, -2, 4, 0, Math.PI);
        ctx.arc(1, 3, 4, 0, Math.PI);
        ctx.stroke();
    }

    drawCupcake() {
        const ctx = this.ctx;
        ctx.fillStyle = '#7BDCB5';
        ctx.strokeStyle = '#00D084';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 2);
        ctx.lineTo(-9, 16);
        ctx.lineTo(9, 16);
        ctx.lineTo(12, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFF0F5';
        ctx.strokeStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(-6, 2, 7, 0, Math.PI * 2);
        ctx.arc(6, 2, 7, 0, Math.PI * 2);
        ctx.arc(0, -4, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(0, -12, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMilk() {
        const ctx = this.ctx;
        // Milk bottle glass body
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#90CAF9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-9, -10, 18, 26, 4);
        ctx.fill();
        ctx.stroke();

        // Blue cap
        ctx.fillStyle = '#29B6F6';
        ctx.beginPath();
        ctx.roundRect(-7, -16, 14, 6, 2);
        ctx.fill();

        // Cute pink heart sticker on bottle
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.arc(-2.5, 2, 2.5, Math.PI, 0);
        ctx.arc(2.5, 2, 2.5, Math.PI, 0);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();
    }

    drawMagnet() {
        const ctx = this.ctx;
        // Horseshoe magnet
        ctx.lineWidth = 6;
        ctx.lineCap = 'butt';

        // Red left pole
        ctx.strokeStyle = '#E53935';
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI * 0.7, Math.PI * 1.5);
        ctx.stroke();

        // Blue right pole
        ctx.strokeStyle = '#1E88E5';
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI * 1.5, Math.PI * 2.3);
        ctx.stroke();

        // Silver tips
        ctx.fillStyle = '#EEEEEE';
        ctx.fillRect(-15, -4, 6, 6);
        ctx.fillRect(9, -4, 6, 6);
    }

    drawShieldItem() {
        const ctx = this.ctx;
        // Glowing cyan shield
        ctx.fillStyle = '#E0F7FA';
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(14, -8);
        ctx.lineTo(12, 8);
        ctx.quadraticCurveTo(0, 18, 0, 18);
        ctx.quadraticCurveTo(0, 18, -12, 8);
        ctx.lineTo(-14, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Star on shield
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawClock() {
        const ctx = this.ctx;
        // Pocket watch gold rim
        ctx.fillStyle = '#FFF8E1';
        ctx.strokeStyle = '#FFA000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Top ring
        ctx.strokeStyle = '#FFA000';
        ctx.beginPath();
        ctx.arc(0, -14, 4, 0, Math.PI * 2);
        ctx.stroke();

        // Clock hands
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 2); ctx.lineTo(0, -5);
        ctx.moveTo(0, 2); ctx.lineTo(5, 2);
        ctx.stroke();
    }

    drawStar() {
        const ctx = this.ctx;
        const spikes = 5;
        const outer = 18;
        const inner = 9;

        ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA000';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outer : inner;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.arc(-4, -1, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 2, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    drawChili() {
        const ctx = this.ctx;
        ctx.fillStyle = '#D50000';
        ctx.strokeStyle = '#9B0000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.quadraticCurveTo(-14, 4, -4, 18);
        ctx.quadraticCurveTo(8, 6, 4, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.moveTo(-7, -10);
        ctx.lineTo(5, -10);
        ctx.lineTo(2, -16);
        ctx.lineTo(-2, -14);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, -4); ctx.lineTo(-1, -2);
        ctx.moveTo(4, -4);  ctx.lineTo(1, -2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-2, 0, 1.5, 0, Math.PI * 2);
        ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBomb() {
        const ctx = this.ctx;
        // Spherical black bomb
        ctx.fillStyle = '#263238';
        ctx.strokeStyle = '#102027';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 3, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bomb cap & burning fuse
        ctx.fillStyle = '#78909C';
        ctx.fillRect(-4, -14, 8, 4);

        ctx.strokeStyle = '#FFE082';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.quadraticCurveTo(6, -20, 10, -18);
        ctx.stroke();

        // Sparkle flame on fuse
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(11, -19, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(11, -19, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Skull eyes on bomb
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-5, 1, 2.5, 0, Math.PI * 2);
        ctx.arc(5, 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, 7); ctx.lineTo(4, 7);
        ctx.stroke();
    }

    drawParticle(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
    }

    drawFloatingText(t) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.font = `bold ${t.size}px 'Quicksand', 'PingFang SC', sans-serif`;
        ctx.textAlign = 'center';

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText(t.text, t.x, t.y);

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    }

    // ==========================================
    // Poster Generator & Sharing System
    // ==========================================
    generatePoster() {
        const poster = document.getElementById('posterCanvas');
        if (!poster) return;
        const pCtx = poster.getContext('2d');
        const pw = poster.width;
        const ph = poster.height;

        pCtx.clearRect(0, 0, pw, ph);

        // Gradient background
        const grad = pCtx.createLinearGradient(0, 0, 0, ph);
        grad.addColorStop(0, '#FFF5F8');
        grad.addColorStop(0.5, '#FFF9FB');
        grad.addColorStop(1, '#FFF0F5');
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, pw, ph);

        // Decorative borders
        pCtx.strokeStyle = '#FFCCD8';
        pCtx.lineWidth = 8;
        pCtx.strokeRect(10, 10, pw - 20, ph - 20);

        // Header Title
        pCtx.fillStyle = '#FF5A87';
        pCtx.font = "bold 24px 'Quicksand', 'PingFang SC', sans-serif";
        pCtx.textAlign = 'center';
        pCtx.fillText(window.I18N ? window.I18N.t('posterTitle') : "🐾 Kitty Run 🍰", pw / 2, 54);

        pCtx.fillStyle = '#8C6D62';
        pCtx.font = "bold 13px 'Quicksand', sans-serif";
        const modeLabel = this.gameMode === 'timed' 
            ? (window.I18N ? window.I18N.t('posterModeSprint') : '⚡ 60s Sprint')
            : (window.I18N ? window.I18N.t('posterModeSurv') : '💖 Endless');
        pCtx.fillText(`Kitty Run · ${modeLabel}`, pw / 2, 78);

        // Draw Player Cat Mascot in center
        const oldCtx = this.ctx;
        this.ctx = pCtx;
        this.drawCat(pw / 2, 175);
        this.ctx = oldCtx;

        // Score Card Box
        pCtx.fillStyle = '#FFFFFF';
        pCtx.strokeStyle = '#FFD1DC';
        pCtx.lineWidth = 3;
        pCtx.beginPath();
        pCtx.roundRect(30, 240, pw - 60, 180, 16);
        pCtx.fill();
        pCtx.stroke();

        // Scores info
        pCtx.textAlign = 'left';
        pCtx.fillStyle = '#6E4545';
        pCtx.font = "bold 15px sans-serif";
        pCtx.fillText(window.I18N ? window.I18N.t('posterScore') : "Score:", 55, 280);
        pCtx.fillText(window.I18N ? window.I18N.t('posterCombo') : "Combo:", 55, 320);
        pCtx.fillText(window.I18N ? window.I18N.t('posterBest') : "Best:", 55, 360);

        pCtx.textAlign = 'right';
        pCtx.fillStyle = '#FF5A87';
        pCtx.font = "bold 24px sans-serif";
        pCtx.fillText(`${this.score}`, pw - 55, 282);

        pCtx.fillStyle = '#FF9100';
        pCtx.font = "bold 20px sans-serif";
        pCtx.fillText(`${this.maxCombo}`, pw - 55, 322);

        pCtx.fillStyle = '#4CAF50';
        pCtx.font = "bold 20px sans-serif";
        pCtx.fillText(`${this.highScore}`, pw - 55, 362);

        // Evaluation Stamp (特级甜点喵 / 烘焙小能手)
        pCtx.save();
        pCtx.translate(pw / 2, 475);
        pCtx.rotate(-0.06);

        let rankText = window.I18N ? window.I18N.t('rankGreedy') : "🍓 Sweet Tooth";
        if (this.score >= 1500) rankText = window.I18N ? window.I18N.t('rankMaster') : "👑 Master Chef";
        else if (this.score >= 800) rankText = window.I18N ? window.I18N.t('rankChef') : "🏆 Pastry Chef";
        else if (this.score >= 400) rankText = window.I18N ? window.I18N.t('rankBaker') : "🧁 Talented Baker";

        pCtx.fillStyle = '#FF4081';
        pCtx.strokeStyle = '#FF4081';
        pCtx.lineWidth = 3;
        pCtx.beginPath();
        pCtx.roundRect(-120, -22, 240, 44, 22);
        pCtx.stroke();

        pCtx.font = "bold 17px sans-serif";
        pCtx.textAlign = 'center';
        pCtx.fillText(rankText, 0, 6);
        pCtx.restore();

        // Footer date & cute paws
        pCtx.fillStyle = '#A38F8B';
        pCtx.font = "12px sans-serif";
        pCtx.textAlign = 'center';
        const dateStr = new Date().toLocaleDateString();
        const footerCert = window.I18N && window.I18N.currentLang === 'en' 
            ? `Verified Run · ${dateStr} · Meow~` 
            : `游戏记录认证于 ${dateStr} · 喵呜~`;
        pCtx.fillText(footerCert, pw / 2, 535);
    }

    downloadPoster() {
        const poster = document.getElementById('posterCanvas');
        if (!poster) return;
        const link = document.createElement('a');
        link.download = `kitty-run-${this.score}pts.png`;
        link.href = poster.toDataURL('image/png');
        link.click();
        this.showToast(window.I18N ? window.I18N.t('posterToast') : 'Poster saved! 💾', '💾');
    }

    copyShareText() {
        const url = window.location.href;
        const modeLabel = this.gameMode === 'timed' 
            ? (window.I18N ? window.I18N.t('modeTimed') : '60s Sprint') 
            : (window.I18N ? window.I18N.t('modeSurvival') : 'Endless');
        const shareText = window.I18N && window.I18N.currentLang === 'en'
            ? `🐾 Meow! I scored ${this.score} pts with a ${this.maxCombo} combo in Kitty Run [${modeLabel}]! Can you beat my record? ${url}`
            : `🐾 喵呜！我在《萌喵甜点大作战》【${modeLabel}】中斩获了 ${this.score} 分，达成了 ${this.maxCombo} 连击！快来挑战本喵的纪录吧：${url}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast(window.I18N ? window.I18N.t('shareSuccess') : 'Copied!', '📋');
            }).catch(() => {
                this.fallbackCopyText(shareText);
            });
        } else {
            this.fallbackCopyText(shareText);
        }
    }

    fallbackCopyText(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            this.showToast('已复制战绩到剪贴板！', '📋');
        } catch (e) {
            this.showToast('复制失败，请手动截图分享~', '😿');
        }
        document.body.removeChild(textarea);
    }

    // ==========================================
    // Main Game Loop
    // ==========================================
    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(64, timestamp - this.lastTime);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CuteCatGame();
});
