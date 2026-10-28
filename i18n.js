// =========================================================
// Kitty Run (萌喵甜点大作战) - Bilingual Localization (i18n)
// Default Language: English ('en') | Supported: 'en', 'zh'
// =========================================================

const I18N = {
    currentLang: localStorage.getItem('kitty_lang') || 'en',

    strings: {
        en: {
            // General & Header
            langName: "English",
            gameTitle: "Kitty Run",
            gameSubtitle: "Sweet Bakery Rush · Catch Delicious Treats!",
            score: "Score",
            coins: "Coins",
            time: "Time",
            best: "Best",
            combo: "COMBO",
            feverText: "✨ FEVER TIME! 2X SCORE ✨",
            dash: "DASH",
            fullscreen: "Fullscreen",
            sound: "Sound",
            pause: "Pause",
            settleEarly: "Settle & Cash In",

            // Start Screen
            savedTitle: "Unfinished Game Found!",
            loadGame: "Resume ▶",
            discard: "Discard",
            modeTimed: "⚡ 60s Sprint",
            modeSurvival: "💖 Endless",
            play: "PLAY NOW",
            shop: "Shop",
            badges: "Badges",
            stats: "Stats",
            help: "Help",
            items: "Items",
            catchHint: "Catch: 🍓 🍩 🐟 🧁 🥛 🧲 🛡️ ⏰ 🌟",
            avoidHint: "Avoid: 🌶️ 💣",
            footerHint: "Controls: Drag Mouse / Touch or use Arrow Keys ⬅️ ➡️, Shift to Dash, Space to Pause, F for Fullscreen",

            // Breeds
            breed_white: "Marshmallow White",
            breed_orange: "Sunny Ginger",
            breed_black: "Tuxedo Black",
            breed_capybara: "Zen Capybara",

            // Hats
            hat_bow: "Pink Bow",
            hat_chef: "Master Chef",
            hat_flower: "Sakura Flower",
            hat_crown: "Royal Crown",
            hat_tophat: "Gentleman Top Hat",
            hat_glasses: "Cool Shades",
            hat_none: "Natural Look",

            // Pause Modal
            pauseTitle: "Game Paused",
            pauseSubtitle: "Kitty is taking a cozy nap...",
            resume: "▶️ Resume",
            manualEnd: "🏳️ Settle Early (Finish Run)",
            saveAndExit: "💾 Save Progress (Continue Later)",
            savedToast: "Progress saved locally! You can resume anytime 💾",
            resumeToast: "Restored saved run! Let's go! 🐾",
            discardToast: "Saved progress discarded 🗑️",

            // Game Over Modal
            gameOverTitle: "Game Over",
            timeUpTitle: "⏰ Time's Up!",
            manualEndTitle: "🎉 Run Settled!",
            reasonTimeUp: "1-minute sprint complete! Kitty is delightfully full!",
            reasonManualEnd: "Kitty safely secured all sweet treats in the basket!",
            reasonLivesOut: "Hearts ran out! Kitty needs a short rest!",
            finalScore: "Final Score:",
            finalCombo: "Max Combo:",
            finalBest: "All-Time Best:",
            playAgain: "🔄 Play Again",
            copyShare: "📋 Copy Result",
            sharePoster: "🖼️ Share Poster",
            newBest: "NEW BEST!",
            shareSuccess: "Result copied to clipboard! Share with friends 🐾",

            // Shop Modal
            shopTitle: "🏪 Kitty Boutique",
            shopCoinsLabel: "Sweet Coins:",
            shopCoinsTip: "(Catch treats, stars, & boutique boxes to earn coins)",
            shopSecSkins: "🐱 Kitty Breeds & Skins",
            shopSecHats: "🎀 Hats & Accessories",
            shopSecSupplies: "💖 Battle Emergency Supplies",
            shopClose: "Close & Play",
            equipped: "✨ Equipped",
            equipBtn: "🐾 Equip",
            buyBtn: "🪙 Buy",
            useBtn: "🪙 Use",
            coinsShort: "Not enough coins! Need {price} (You have {coins})",
            unlockSkinToast: "Unlocked breed 【{name}】 & equipped!",
            unlockHatToast: "Unlocked hat 【{name}】 & worn!",
            equipToast: "Equipped 【{name}】!",

            // Shop Item Descs
            skin_white_desc: "Pure, fluffy, and sweet classic white kitty",
            skin_orange_desc: "Chonky, cheerful ginger tabby full of sunshine",
            skin_black_desc: "Midnight tuxedo coat with adorable white paws",
            skin_capybara_desc: "Ultra calm & friendly with a cute yuzu orange",
            hat_bow_desc: "Sweet pink ribbon bow for lovely kitties",
            hat_chef_desc: "Authentic French bakery pastry master hat",
            hat_flower_desc: "Fresh blooming pink cherry blossom hairpin",
            hat_crown_desc: "Sparkling royal gold crown for kitty kings",
            hat_tophat_desc: "Classic British gentleman vintage silk hat",
            hat_glasses_desc: "Ultra-cool jet black shades with gold bridge",
            hat_none_desc: "Simple, natural, and purr-fect original look",
            sup_heart_name: "Heart Herb",
            sup_heart_desc: "Immediately restores +1 ❤️ Life",
            sup_shield_name: "Rainbow Shield",
            sup_shield_desc: "Immediately grants 1 Rainbow Shield",
            potionUsed: "Used Heart Herb! +1 ❤️ Life restored!",
            shieldUsed: "Rainbow Shield activated!",

            // In-Game Floats
            dropBreak: "💧 Drop Break!",
            milkHeal: "🥛 +1 Heart!",
            milkFull: "🥛 Bonus +80!",
            magnetOn: "🧲 Catnip Magnet Active!",
            shieldOn: "🛡️ Rainbow Shield Active!",
            shieldBlock: "🛡️ Blocked Hazard!",
            slowTimed: "⏰ Slow-mo & +5s Bonus!",
            slowSurv: "⏰ Slow-mo 50%!",
            starFever: "✨ FEVER TIME! ✨",
            bombHit: "💣 Boom! -1 Heart",
            chiliHit: "🌶️ Spicy! -1 Heart",
            shopDropped: "🎁 Mystery Boutique Dropped! Catch it!",
            shopFound: "🎁 Mystery Boutique Found! Opening...",

            // Achievements
            achieveTitle: "🏆 Kitty Hall of Fame",
            ach_first_catch: "First Taste",
            ach_first_catch_desc: "Catch your very first sweet treat",
            ach_drink_milk: "Energy Boost",
            ach_drink_milk_desc: "Drink 1 bottle of fresh milk",
            ach_shield_block: "Absolute Guard",
            ach_shield_block_desc: "Block a hazard with the Rainbow Shield",
            ach_magnet_power: "Sweet Vacuum",
            ach_magnet_power_desc: "Activate the Catnip Magnet",
            ach_combo_15: "Combo Master",
            ach_combo_15_desc: "Reach a 15x sweet streak without dropping",
            ach_score_1000: "Bakery Tycoon",
            ach_score_1000_desc: "Score 1000+ points in a single run",
            unlocked: "✨ Unlocked",
            locked: "🔒 Locked",
            achieveToast: "Achievement Unlocked: {name}!",

            // Stats / Records
            statsTitle: "📜 Career Records & Match History",
            statTotalGames: "Total Games",
            statTotalSweets: "Sweets Caught",
            statTimedBest: "60s Sprint Best",
            statSurvivalBest: "Endless Best",
            recentHistory: "📅 Recent Match Logs (Saved Locally)",
            clearHistory: "🗑️ Clear History",
            clearConfirm: "Clear all saved game records on this device?",
            emptyHistory: "No matches played yet. Start a run now! 🐾",
            recordsCleared: "All game records have been cleared!",

            // Guide / Help
            guideTitle: "❓ How to Play & Rules",
            guideTimeQ: "⏱️ How long is each game?",
            guideTimeTimed: "60s Sprint Challenge (Recommended):",
            guideTimeTimedDesc: "Fixed 1-minute sprint! Dash to grab as many treats as possible. Catching ⏰ Pocket Watch gives +5s extra time!",
            guideTimeSurv: "Classic Endless Survival:",
            guideTimeSurvDesc: "No time limit! You have 3 Hearts. Keep dodging hazards and catching sweets to chase world records!",
            guideGoalQ: "🎯 Scoring & Combo Mechanics",
            guideRuleCombo: "Combo Multiplier: Consecutive catches ramp up combo points up to 2.5x!",
            guideRuleMilestone: "Milestone Bonuses: Reach 5/10/15/20 combos for massive +50/+150/+300/+500 bonus points! 20 combo grants a Free Shield!",
            guideRuleDrop: "⚠️ Drop Penalty: Dropping any sweet treat immediately RESETS your combo to 0!",
            guideRuleFever: "🌟 FEVER Time: Catching Rainbow Stars fills energy and triggers 6 seconds of double score with zero hazards!",
            guideControlQ: "🕹️ Controls",
            guideControlMove: "Movement: Drag with mouse/touch, or use ⬅️ ➡️ / A D on keyboard.",
            guideControlDash: "💨 Dash: Press Shift, double tap canvas, or click the Dash button for an instant speed burst!",
            guideShopQ: "🏪 Boutique & 💾 Save System",
            guideShopDesc: "🎁 Mystery Boutique box drops from the sky every few hundred points! Catch it to open the shop & get 25 bonus coins. Pause anytime to save your run and resume later!",

            // Legend / Items
            legendTitle: "📖 Treats & Items Compendium",
            catSweets: "🍰 Delicious Sweets (Catch to score)",
            catMagic: "🌟 Magic Powerups (Super Boosts)",
            catHazards: "❌ Dangerous Hazards (DO NOT TOUCH!)",
            item_strawberry: "Fresh Strawberry",
            item_strawberry_desc: "+10 pts · Sweet starter",
            item_donut: "Strawberry Donut",
            item_donut_desc: "+20 pts · Glazed sprinkles",
            item_taiyaki: "Golden Taiyaki",
            item_taiyaki_desc: "+30 pts · Crispy waffle fish",
            item_cupcake: "Cherry Cupcake",
            item_cupcake_desc: "+40 pts · Luxurious frosting",
            item_milk: "Pure Milk",
            item_milk_desc: "+30 pts · Restores +1 Heart",
            item_magnet: "Catnip Magnet",
            item_magnet_desc: "Pulls sweets to kitty for 6s",
            item_shield: "Rainbow Shield",
            item_shield_desc: "Blocks 1 hazard impact",
            item_clock: "Pocket Watch",
            item_clock_desc: "Slow-mo 50% · +5s in 60s mode",
            item_star: "Rainbow Star",
            item_star_desc: "+50 pts · 6s Fever Rush",
            item_shop: "Sky Boutique",
            item_shop_desc: "+25 Coins · Opens shop modal",
            item_chili: "Devil Chili",
            item_chili_desc: "DANGER! -1 Heart & Combo break",
            item_bomb: "Naughty Bomb",
            item_bomb_desc: "DANGER! -1 Heart & Combo break",

            // Poster
            posterTitle: "🐾 Kitty Run · Sweet Bakery 🍰",
            posterModeSprint: "⚡ 60s Sprint Challenge",
            posterModeSurv: "💖 Endless Survival",
            posterScore: "Run Score:",
            posterCombo: "Max Combo:",
            posterBest: "All-Time Best:",
            rankMaster: "👑 Master Pastry Kitty",
            rankChef: "🏆 Supreme Head Chef",
            rankBaker: "🧁 Talented Baker",
            rankGreedy: "🍓 Sweet Tooth Kitten",
            downloadPoster: "💾 Save Poster Image",
            posterToast: "Poster downloaded successfully! 💾"
        },

        zh: {
            // 通用与顶部
            langName: "中文",
            gameTitle: "萌喵甜点大作战",
            gameSubtitle: "Sweet Bakery Rush · 移动猫猫接住美味甜点！",
            score: "得分",
            coins: "金币",
            time: "倒计时",
            best: "最高分",
            combo: "连击",
            feverText: "✨ FEVER 狂欢模式 (双倍得分) ✨",
            dash: "冲刺",
            fullscreen: "全屏",
            sound: "音效",
            pause: "暂停",
            settleEarly: "见好就收 (立即结算)",

            // 开始界面
            savedTitle: "检测到未完成的暂存进度！",
            loadGame: "继续上次对局 ▶",
            discard: "放弃存档",
            modeTimed: "⚡ 60秒极速挑战",
            modeSurvival: "💖 经典无尽生存",
            play: "开始游戏",
            shop: "商城",
            badges: "成就",
            stats: "战绩",
            help: "说明",
            items: "图鉴",
            catchHint: "快接住: 🍓 🍩 🐟 🧁 🥛 🧲 🛡️ ⏰ 🌟",
            avoidHint: "避开危险: 🌶️ 💣",
            footerHint: "控制指南: 拖动鼠标/触摸屏 或键盘 ⬅️ ➡️ 移动，Shift 冲刺，Space 暂停，F 全屏",

            // 品种
            breed_white: "纯白棉花糖",
            breed_orange: "阳光大橘猫",
            breed_black: "酷帅黑猫警长",
            breed_capybara: "治愈小水豚",

            // 饰品
            hat_bow: "粉萌蝴蝶结",
            hat_chef: "甜点大师帽",
            hat_flower: "春日小樱花",
            hat_crown: "璀璨小皇冠",
            hat_tophat: "绅士高礼帽",
            hat_glasses: "酷炫黑超墨镜",
            hat_none: "清爽无饰品",

            // 暂停弹窗
            pauseTitle: "游戏暂停中",
            pauseSubtitle: "猫猫正在偷吃小点心...",
            resume: "▶️ 继续游戏",
            manualEnd: "🏳️ 见好就收 (立即结算)",
            saveAndExit: "💾 暂存进度 (下次继续)",
            savedToast: "当前进度已存入本地！随时可继续挑战 💾",
            resumeToast: "已恢复上次对局进度，继续战斗吧！🐾",
            discardToast: "已放弃暂存对局进度 🗑️",

            // 结算弹窗
            gameOverTitle: "游戏结束",
            timeUpTitle: "⏰ 60秒时间到啦！",
            manualEndTitle: "🎉 见好就收，优雅收工！",
            reasonTimeUp: "1分钟限时冲刺结束，猫猫吃得超满足！",
            reasonManualEnd: "猫猫心满意足地捧着满满一篮子甜点凯旋啦！",
            reasonLivesOut: "哎呀，心心耗尽啦！猫猫需要休息一下！",
            finalScore: "本次得分:",
            finalCombo: "最高连击:",
            finalBest: "历史最佳:",
            playAgain: "🔄 再玩一次",
            copyShare: "📋 复制战绩",
            sharePoster: "🖼️ 战绩海报",
            newBest: "NEW BEST!",
            shareSuccess: "已复制战绩到剪贴板！快发给好友吧 🐾",

            // 商城弹窗
            shopTitle: "🏪 喵喵天降神秘小铺",
            shopCoinsLabel: "当前拥有甜点金币:",
            shopCoinsTip: "(捕获甜点、星星与天降礼盒可积累金币)",
            shopSecSkins: "🐱 萌宠皮肤与品种",
            shopSecHats: "🎀 精致服饰与头饰",
            shopSecSupplies: "💖 局内应急实战补给",
            shopClose: "关闭并继续游戏",
            equipped: "✨ 已穿戴",
            equipBtn: "🐾 换装装备",
            buyBtn: "🪙 购买",
            useBtn: "🪙 使用",
            coinsShort: "金币不足！需要 {price} 金币（当前拥有 {coins}）",
            unlockSkinToast: "成功解锁萌宠【{name}】并已更换！",
            unlockHatToast: "成功解锁饰品【{name}】并已佩戴！",
            equipToast: "已换装为【{name}】！",

            // 商城物品说明
            skin_white_desc: "纯真白雪，蓬松软萌经典白猫",
            skin_orange_desc: "十橘九胖，活力满满温暖大橘",
            skin_black_desc: "黑夜行者，神秘优雅纯白短袜",
            skin_capybara_desc: "情绪稳定，万物皆友头顶蜜桔",
            hat_bow_desc: "经典少女心粉红蝴蝶结",
            hat_chef_desc: "法式烘焙甜点大师高礼帽",
            hat_flower_desc: "浪漫唯美春日樱花发夹",
            hat_crown_desc: "高贵可爱猫猫国王小皇冠",
            hat_tophat_desc: "英伦典雅贵族复古礼帽",
            hat_glasses_desc: "全街最靓猫仔黑超金丝墨镜",
            hat_none_desc: "自然纯粹原汁原味小可爱",
            sup_heart_name: "满血复活草",
            sup_heart_desc: "立即回复 +1 ❤️ 生命值",
            sup_shield_name: "彩虹护盾球",
            sup_shield_desc: "立即激活 1 层彩虹护盾",
            potionUsed: "使用满血复活草，生命值+1 ❤️！",
            shieldUsed: "使用彩虹护盾球，护盾已激活！",

            // 悬浮飘字
            dropBreak: "💧 掉落断连!",
            milkHeal: "🥛 牛奶回复 +1 ❤️!",
            milkFull: "🥛 满血额外 +80 分!",
            magnetOn: "🧲 猫薄荷磁力启动!",
            shieldOn: "🛡️ 获得彩虹护盾!",
            shieldBlock: "🛡️ 护盾抵挡成功!",
            slowTimed: "⏰ 减速50% & +5秒时间奖励!",
            slowSurv: "⏰ 时光怀表 减速50%!",
            starFever: "✨ FEVER 狂欢开始! ✨",
            bombHit: "💣 轰隆爆炸! -1 ❤️",
            chiliHit: "🌶️ 恶魔辣椒! -1 ❤️",
            shopDropped: "🎁 天降神秘小铺来啦！快接住！",
            shopFound: "🎁 发现天降小铺！进入商城...",

            // 成就
            achieveTitle: "🏆 萌喵荣誉殿堂",
            ach_first_catch: "初尝甜头",
            ach_first_catch_desc: "接住第 1 个美味甜点",
            ach_drink_milk: "元气满满",
            ach_drink_milk_desc: "喝到 1 瓶香浓纯牛奶",
            ach_shield_block: "绝对防御",
            ach_shield_block_desc: "使用护盾成功抵挡 1 次危险",
            ach_magnet_power: "万物皆可吸",
            ach_magnet_power_desc: "激活猫薄荷磁铁吸取甜点",
            ach_combo_15: "连击达人",
            ach_combo_15_desc: "达成 15 次不间断连击",
            ach_score_1000: "甜点大亨",
            ach_score_1000_desc: "单局得分突破 1000 分",
            unlocked: "✨ 已解锁",
            locked: "🔒 待解锁",
            achieveToast: "成就达成: {name}!",

            // 战绩
            statsTitle: "📜 玩家战绩档案与历史纪录",
            statTotalGames: "总游玩局数",
            statTotalSweets: "累计捕获甜点",
            statTimedBest: "60秒挑战最高分",
            statSurvivalBest: "无尽生存最高分",
            recentHistory: "📅 最近对局记录 (保存在本地浏览器)",
            clearHistory: "🗑️ 清空历史",
            clearConfirm: "确定清空保存在本地的所有战绩记录吗？",
            emptyHistory: "暂无对局历史，快去玩一把吧~ 🐾",
            recordsCleared: "本地战绩记录已清空！",

            // 玩法说明
            guideTitle: "❓ 游戏玩法与规则说明",
            guideTimeQ: "⏱️ 每次游戏时间是多久？",
            guideTimeTimed: "60秒极速挑战模式（推荐默认）：",
            guideTimeTimedDesc: "每次游戏固定为 1 分钟（60秒倒计时）！在有限的 1 分钟内全力冲刺更高得分。接取 ⏰ 时光怀表更可获得 +5秒加时奖励！",
            guideTimeSurv: "经典无尽生存模式：",
            guideTimeSurvDesc: "不设时间限制！拥有 3 颗爱心，只要爱心未耗尽，就能一直接下去冲击最高连击与世界纪录！",
            guideGoalQ: "🎯 核心目标与得分技巧",
            guideRuleCombo: "连击加成：连续接住甜点可不断增加 Combo，倍率最高可达 2.5 倍！",
            guideRuleMilestone: "连击里程碑奖励：连击达到 5/10/15/20 次时直接奖励 +50/+150/+300/+500 分，20 连击更直接赠送护盾！",
            guideRuleDrop: "⚠️ 掉落惩罚：美味甜点一旦漏接掉出屏幕底端，连击立即清空！考验走位哦~",
            guideRuleFever: "🌟 FEVER 狂欢：接到彩虹星星或能量槽满 100% 触发 6 秒狂欢，双倍得分且屏蔽一切危险！",
            guideControlQ: "🕹️ 操作指南",
            guideControlMove: "平移移动：电脑端使用鼠标滑动或键盘 ⬅️ ➡️ / A D；手机/平板指尖按住屏幕滑动。",
            guideControlDash: "💨 疾跑冲刺 (Dash)：按键盘 Shift 键、快速双击屏幕、或点击屏幕右下角的“冲刺”按键，猫咪瞬间高速冲刺！",
            guideShopQ: "🏪 喵喵商城与 💾 存档机制",
            guideShopDesc: "🎁 天降神秘小铺礼盒会在得分达到一定阶段时从空中飘落，接住即可开启商城并免费获赠 25 金币！暂停时可随时暂存对局进度，下次在主界面继续挑战！",

            // 道具图鉴
            legendTitle: "📖 道具图鉴与得分指南",
            catSweets: "🍰 美味甜点 (快快接住得分)",
            catMagic: "🌟 神奇魔法道具 (超强增益)",
            catHazards: "❌ 危险障碍 (千万别碰！碰触扣血清连击)",
            item_strawberry: "鲜红草莓",
            item_strawberry_desc: "+10分 · 基础甜品",
            item_donut: "草莓甜甜圈",
            item_donut_desc: "+20分 · 糖霜点缀",
            item_taiyaki: "金黄鲷鱼烧",
            item_taiyaki_desc: "+30分 · 香脆可口",
            item_cupcake: "樱桃纸杯蛋糕",
            item_cupcake_desc: "+40分 · 奢华香浓",
            item_milk: "纯香牛奶",
            item_milk_desc: "+30分 · 回复+1❤️生命",
            item_magnet: "猫薄荷磁铁",
            item_magnet_desc: "持续6秒自动吸取甜点",
            item_shield: "彩虹护盾",
            item_shield_desc: "抵挡1次危险伤害",
            item_clock: "时光怀表",
            item_clock_desc: "减速50% · 60s模式+5秒",
            item_star: "彩虹星星",
            item_star_desc: "+50分 · 触发6秒狂欢",
            item_shop: "天降小铺",
            item_shop_desc: "+25金币 · 立即进入商城选购换装",
            item_chili: "恶魔小辣椒",
            item_chili_desc: "扣1❤️生命，连击立即中断",
            item_bomb: "调皮小炸弹",
            item_bomb_desc: "剧烈爆炸，扣1❤️生命断连",

            // 海报
            posterTitle: "🐾 萌喵甜点大作战 🍰",
            posterModeSprint: "⚡ 60秒限时冲刺",
            posterModeSurv: "💖 经典无尽生存",
            posterScore: "本次得分:",
            posterCombo: "最高连击:",
            posterBest: "历史最佳:",
            rankMaster: "👑 特级甜点大师喵",
            rankChef: "🏆 连击特级主厨",
            rankBaker: "🧁 甜品烘焙小能手",
            rankGreedy: "🍓 贪吃小猫咪",
            downloadPoster: "💾 下载保存海报",
            posterToast: "海报已开始下载保存！💾"
        }
    },

    t(key, params = {}) {
        const langDict = this.strings[this.currentLang] || this.strings.en;
        let str = langDict[key] || this.strings.en[key] || key;
        for (const [k, v] of Object.entries(params)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
        return str;
    },

    setLang(lang) {
        if (!this.strings[lang]) return;
        this.currentLang = lang;
        try {
            localStorage.setItem('kitty_lang', lang);
        } catch (e) {}

        // Apply HTML document lang attribute
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = this.t(key);
            }
        });

        // Update all elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                el.setAttribute('title', this.t(key));
            }
        });

        // Update lang toggle label
        const langLabel = document.getElementById('langLabel');
        if (langLabel) {
            langLabel.textContent = lang === 'en' ? 'EN' : '中文';
        }
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            langToggleBtn.setAttribute('title', lang === 'en' ? 'Switch to 中文' : 'Switch to English');
        }
        const headerLangBtn = document.getElementById('headerLangBtn');
        if (headerLangBtn) {
            headerLangBtn.setAttribute('title', lang === 'en' ? 'Switch to 中文' : 'Switch to English');
        }

        // Update document title
        document.title = lang === 'en' ? 'Kitty Run 🐾 Sweet Bakery Rush' : '萌喵甜点大作战 🐾 甜品烘焙小游戏';

        // Notify game to re-render dynamic contents
        if (window.game) {
            window.game.onLanguageChanged();
        }
    },

    toggleLang() {
        const next = this.currentLang === 'en' ? 'zh' : 'en';
        this.setLang(next);
        return next;
    }
};

window.I18N = I18N;
