/**
 * 游戏主循环
 * 连接所有模块，驱动游戏运行
 */

class Game {
    constructor() {
        this.state = 'playing';  // playing, battle, dialogue, menu, inventory, map
        this.cameraX = 0;
        this.cameraY = 0;
        this.encounterCooldown = 0;
        
        this.init();
    }
    
    init() {
        // 初始化地图
        initMaps();
        mapManager.loadMap('village');
        
        // 设置输入处理
        inputManager.onKeyDown = (key) => this.handleKeyDown(key);
        
        // 尝试读取存档
        if (saveSystem.hasSave()) {
            saveSystem.load();
        }
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    // 游戏主循环
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新
    update() {
        // 更新动画
        renderer.updateAnimation();
        
        // 更新UI消息
        uiManager.update();
        
        // 更新状态栏
        uiManager.updateStatusBar();
        
        // 更新遇敌冷却
        if (this.encounterCooldown > 0) {
            this.encounterCooldown--;
        }
        
        // 根据状态处理输入
        switch(this.state) {
            case 'playing':
                this.updatePlaying();
                break;
            case 'battle':
                this.updateBattle();
                break;
        }
    }
    
    // 游戏状态更新
    updatePlaying() {
        // 移动
        let direction = inputManager.getDirection();
        if (direction && !uiManager.dialogue && !uiManager.menu && !uiManager.showInventory && !uiManager.showMap) {
            let dx = 0, dy = 0;
            switch(direction) {
                case 'up': dy = -1; break;
                case 'down': dy = 1; break;
                case 'left': dx = -1; break;
                case 'right': dx = 1; break;
            }
            
            let moved = player.move(dx, dy);
            
            if (moved) {
                // 检查遇敌
                this.checkEncounter();
                
                // 检查NPC
                this.checkNPC();
                
                // 检查宝箱
                this.checkChest();
            }
        }
        
        // 更新摄像机
        this.updateCamera();
    }
    
    // 战斗状态更新
    updateBattle() {
        // 战斗输入在handleKeyDown中处理
    }
    
    // 更新摄像机
    updateCamera() {
        let targetX = player.x - CONFIG.VIEW_TILES_X / 2;
        let targetY = player.y - CONFIG.VIEW_TILES_Y / 2;
        
        // 平滑跟随
        this.cameraX += (targetX - this.cameraX) * 0.1;
        this.cameraY += (targetY - this.cameraY) * 0.1;
        
        // 限制边界
        this.cameraX = Math.max(0, Math.min(this.cameraX, CONFIG.MAP_WIDTH - CONFIG.VIEW_TILES_X));
        this.cameraY = Math.max(0, Math.min(this.cameraY, CONFIG.MAP_HEIGHT - CONFIG.VIEW_TILES_Y));
    }
    
    // 检查遇敌
    checkEncounter() {
        if (this.encounterCooldown > 0) return;
        if (!player.isInBattleArea()) return;
        
        if (Math.random() < CONFIG.BATTLE.ENCOUNTER_RATE) {
            // 根据当前地图选择怪物
            let map = mapManager.currentMap;
            if (!map || !map.monsterAreas || map.monsterAreas.length === 0) return;
            
            let area = map.monsterAreas[0];
            let monsterId = area.monsters[Math.floor(Math.random() * area.monsters.length)];
            
            battleSystem.startBattle(monsterId, false);
            this.state = 'battle';
            this.encounterCooldown = 60;  // 1秒冷却
        }
    }
    
    // 检查NPC
    checkNPC() {
        let npcs = mapManager.getNPCs();
        
        for (let npc of npcs) {
            let dx = Math.abs(player.x - npc.x);
            let dy = Math.abs(player.y - npc.y);
            
            if (dx <= 1 && dy <= 1) {
                // NPC朝向玩家
                if (player.x > npc.x) npc.direction = 'right';
                if (player.x < npc.x) npc.direction = 'left';
                if (player.y > npc.y) npc.direction = 'down';
                if (player.y < npc.y) npc.direction = 'up';
            }
        }
    }
    
    // 检查宝箱
    checkChest() {
        if (mapManager.isChest(player.x, player.y)) {
            let reward = mapManager.openChest(player.x, player.y);
            if (reward) {
                if (reward.type === 'gold') {
                    player.gold += reward.amount;
                    uiManager.addMessage(`打开了宝箱！获得${reward.amount}金币！`);
                } else if (reward.type === 'item') {
                    let existing = player.inventory.items.find(i => i.id === reward.id);
                    if (existing) {
                        existing.count++;
                    } else {
                        player.inventory.items.push({ id: reward.id, name: reward.name, type: 'consumable', count: 1 });
                    }
                    uiManager.addMessage(`打开了宝箱！获得${reward.name}！`);
                }
                
                // 将宝箱改为普通草地
                mapManager.setTile(player.x, player.y, CONFIG.TILE_TYPES.GRASS);
            }
        }
    }
    
    // 处理按键
    handleKeyDown(key) {
        switch(this.state) {
            case 'playing':
                this.handlePlayingInput(key);
                break;
            case 'battle':
                this.handleBattleInput(key);
                break;
        }
    }
    
    // 游戏状态输入
    handlePlayingInput(key) {
        // 对话中
        if (uiManager.dialogue) {
            if (key === ' ' || key === 'Escape') {
                uiManager.closeDialogue();
            }
            return;
        }
        
        // 菜单中
        if (uiManager.menu) {
            this.handleMenuInput(key);
            return;
        }
        
        // 背包中
        if (uiManager.showInventory) {
            if (key === 'Escape' || key === 'i') {
                uiManager.showInventory = false;
            }
            return;
        }
        
        // 地图中
        if (uiManager.showMap) {
            if (key === 'Escape' || key === 'm') {
                uiManager.showMap = false;
            }
            return;
        }
        
        // 正常游戏
        switch(key) {
            case ' ':
                this.interact();
                break;
            case 'Escape':
                uiManager.showMenu();
                break;
            case 'i':
                uiManager.showInventory = true;
                break;
            case 'm':
                uiManager.showMap = true;
                break;
            case 's':
                saveSystem.save();
                break;
        }
    }
    
    // 菜单输入
    handleMenuInput(key) {
        switch(key) {
            case 'ArrowUp':
                uiManager.menu.selected = (uiManager.menu.selected - 1 + uiManager.menu.items.length) % uiManager.menu.items.length;
                break;
            case 'ArrowDown':
                uiManager.menu.selected = (uiManager.menu.selected + 1) % uiManager.menu.items.length;
                break;
            case ' ':
                this.selectMenuItem();
                break;
            case 'Escape':
                uiManager.closeMenu();
                break;
        }
    }
    
    // 选择菜单项
    selectMenuItem() {
        let selected = uiManager.menu.items[uiManager.menu.selected];
        
        switch(selected) {
            case '背包':
                uiManager.closeMenu();
                uiManager.showInventory = true;
                break;
            case '装备':
                // TODO: 装备界面
                uiManager.addMessage('装备功能开发中...');
                uiManager.closeMenu();
                break;
            case '存档':
                saveSystem.save();
                uiManager.closeMenu();
                break;
            case '读档':
                saveSystem.load();
                uiManager.closeMenu();
                break;
            case '返回':
                uiManager.closeMenu();
                break;
        }
    }
    
    // 战斗输入
    handleBattleInput(key) {
        if (!battleSystem.active) {
            this.state = 'playing';
            return;
        }
        
        if (battleSystem.state === 'action') {
            switch(key) {
                case 'ArrowLeft':
                    battleSystem.selectedAction = (battleSystem.selectedAction - 1 + 4) % 4;
                    break;
                case 'ArrowRight':
                    battleSystem.selectedAction = (battleSystem.selectedAction + 1) % 4;
                    break;
                case ' ':
                    let actions = ['attack', 'skill', 'item', 'run'];
                    battleSystem.playerAction(actions[battleSystem.selectedAction]);
                    break;
            }
        } else if (battleSystem.state === 'skill') {
            switch(key) {
                case 'ArrowLeft':
                    battleSystem.selectedSkill = (battleSystem.selectedSkill - 1 + player.skills.length) % player.skills.length;
                    break;
                case 'ArrowRight':
                    battleSystem.selectedSkill = (battleSystem.selectedSkill + 1) % player.skills.length;
                    break;
                case ' ':
                    battleSystem.useSkill(battleSystem.selectedSkill);
                    break;
                case 'Escape':
                    battleSystem.state = 'action';
                    break;
            }
        } else if (battleSystem.state === 'item') {
            let consumables = player.inventory.items.filter(i => i.type === 'consumable');
            switch(key) {
                case 'ArrowLeft':
                    battleSystem.selectedItem = (battleSystem.selectedItem - 1 + consumables.length) % consumables.length;
                    break;
                case 'ArrowRight':
                    battleSystem.selectedItem = (battleSystem.selectedItem + 1) % consumables.length;
                    break;
                case ' ':
                    if (consumables.length > 0) {
                        battleSystem.useItem(consumables[battleSystem.selectedItem].id);
                    }
                    break;
                case 'Escape':
                    battleSystem.state = 'action';
                    break;
            }
        }
        
        // 战斗结束检查
        if (!battleSystem.active) {
            this.state = 'playing';
        }
    }
    
    // 互动（与NPC对话、检查路牌等）
    interact() {
        let checkX = player.x;
        let checkY = player.y;
        
        switch(player.direction) {
            case 'up': checkY--; break;
            case 'down': checkY++; break;
            case 'left': checkX--; break;
            case 'right': checkX++; break;
        }
        
        // 检查NPC
        let npcs = mapManager.getNPCs();
        for (let npc of npcs) {
            if (npc.x === checkX && npc.y === checkY) {
                // 随机选择对话
                let dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
                uiManager.showDialogue(npc.name, dialogue);
                
                // 增加好感度
                if (!player.favorability[npc.id]) {
                    player.favorability[npc.id] = 0;
                }
                player.favorability[npc.id]++;
                
                return;
            }
        }
        
        // 检查Boss
        if (mapManager.currentMap && mapManager.currentMap.boss) {
            let boss = mapManager.currentMap.boss;
            if (boss.x === checkX && boss.y === checkY) {
                battleSystem.startBattle(boss.id, true);
                this.state = 'battle';
                return;
            }
        }
        
        // 检查路牌
        if (mapManager.getTile(checkX, checkY) === CONFIG.TILE_TYPES.SIGN) {
            let messages = [
                '欢迎来到这片土地！',
                '小心草丛里的怪物！',
                '据说隐藏地图里有宝藏...'
            ];
            uiManager.showDialogue('路牌', messages[Math.floor(Math.random() * messages.length)]);
        }
        
        // 检查旅馆
        if (mapManager.currentMapId === 'village' && 
            ((checkX >= 65 && checkX <= 75 && checkY >= 35 && checkY <= 45))) {
            player.rest();
        }
    }
    
    // 渲染
    render() {
        renderer.clear();
        
        if (this.state === 'battle') {
            battleSystem.render();
        } else {
            // 渲染地图
            mapManager.render(this.cameraX, this.cameraY);
            
            // 渲染NPC
            this.renderNPCs();
            
            // 渲染玩家
            player.render(this.cameraX, this.cameraY);
            
            // 应用昼夜效果
            renderer.applyDayNightEffect();
            
            // 渲染UI
            uiManager.render();
        }
    }
    
    // 渲染NPC
    renderNPCs() {
        let npcs = mapManager.getNPCs();
        
        for (let npc of npcs) {
            renderer.drawCharacter(npc.x, npc.y, npc.direction, 'npc', this.cameraX, this.cameraY, false);
            
            // NPC名字
            let screenX = (npc.x - this.cameraX) * CONFIG.TILE_SIZE;
            let screenY = (npc.y - this.cameraY) * CONFIG.TILE_SIZE;
            
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.font = '10px Arial';
            renderer.ctx.textAlign = 'center';
            renderer.ctx.fillText(npc.name, screenX + 32, screenY - 5);
        }
        
        // 渲染Boss
        if (mapManager.currentMap && mapManager.currentMap.boss) {
            let boss = mapManager.currentMap.boss;
            let bossData = BOSS_DATA[boss.id];
            if (bossData) {
                renderer.ctx.font = '40px Arial';
                renderer.ctx.textAlign = 'center';
                let screenX = (boss.x - this.cameraX) * CONFIG.TILE_SIZE;
                let screenY = (boss.y - this.cameraY) * CONFIG.TILE_SIZE;
                renderer.ctx.fillText(bossData.emoji, screenX + 32, screenY + 40);
                
                renderer.ctx.fillStyle = '#ff0';
                renderer.ctx.font = '12px Arial';
                renderer.ctx.fillText(bossData.name, screenX + 32, screenY - 5);
            }
        }
    }
}

// 启动游戏
const game = new Game();
