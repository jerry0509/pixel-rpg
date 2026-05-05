/**
 * 渲染引擎
 * 处理Canvas绘制、精灵动画
 */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 动画计数器
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 10; // 每10帧切换一次动画
        
        // 时间（用于昼夜循环）
        this.gameTime = 0; // 0-1440（24小时 * 60分钟）
        this.timeSpeed = 0.5; // 游戏时间速度
    }
    
    // 清屏
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 更新动画帧
    updateAnimation() {
        this.animTimer++;
        if (this.animTimer >= this.animSpeed) {
            this.animFrame = (this.animFrame + 1) % 60; // 循环60帧
            this.animTimer = 0;
        }
        
        // 更新游戏时间
        this.gameTime = (this.gameTime + this.timeSpeed) % 1440;
    }
    
    // 获取当前动画帧
    getAnimFrame(maxFrames) {
        return this.animFrame % maxFrames;
    }
    
    // 获取时间阶段（白天/夜晚等）
    getTimePhase() {
        let hour = Math.floor(this.gameTime / 60);
        if (hour >= 6 && hour < 18) return 'day';
        if (hour >= 18 && hour < 20) return 'sunset';
        if (hour >= 20 || hour < 4) return 'night';
        return 'dawn';
    }
    
    // 绘制瓦片
    drawTile(x, y, type, cameraX, cameraY) {
        let screenX = (x - cameraX) * CONFIG.TILE_SIZE;
        let screenY = (y - cameraY) * CONFIG.TILE_SIZE;
        
        // 跳过屏幕外的瓦片
        if (screenX < -CONFIG.TILE_SIZE || screenX > this.canvas.width ||
            screenY < -CONFIG.TILE_SIZE || screenY > this.canvas.height) {
            return;
        }
        
        let color;
        let frame = this.getAnimFrame(60);
        
        switch(type) {
            case CONFIG.TILE_TYPES.GRASS:
                color = CONFIG.COLORS.GRASS;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                break;
                
            case CONFIG.TILE_TYPES.TREE:
                // 树干
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(screenX + 24, screenY + 32, 16, 32);
                // 树冠
                this.ctx.fillStyle = CONFIG.COLORS.TREE_TOP;
                this.ctx.beginPath();
                this.ctx.arc(screenX + 32, screenY + 24, 20, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.WATER:
                // 动态水流
                let waterOffset = Math.sin(frame * 0.1) * 2;
                this.ctx.fillStyle = CONFIG.COLORS.WATER;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                this.ctx.fillStyle = CONFIG.COLORS.WATER_ANIM;
                this.ctx.fillRect(screenX + waterOffset, screenY + 10, 20, 4);
                this.ctx.fillRect(screenX + 20 + waterOffset, screenY + 30, 25, 4);
                this.ctx.fillRect(screenX + 10 + waterOffset, screenY + 50, 18, 4);
                break;
                
            case CONFIG.TILE_TYPES.PATH:
                color = CONFIG.COLORS.PATH;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                break;
                
            case CONFIG.TILE_TYPES.HOUSE_WALL:
                color = CONFIG.COLORS.HOUSE_WALL;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 砖块纹理
                this.ctx.strokeStyle = '#6D3A1A';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(screenX + 2, screenY + 2, 30, 15);
                this.ctx.strokeRect(screenX + 34, screenY + 2, 28, 15);
                this.ctx.strokeRect(screenX + 2, screenY + 19, 20, 15);
                this.ctx.strokeRect(screenX + 24, screenY + 19, 38, 15);
                break;
                
            case CONFIG.TILE_TYPES.HOUSE_DOOR:
                // 门框
                this.ctx.fillStyle = CONFIG.COLORS.HOUSE_WALL;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 门
                this.ctx.fillStyle = CONFIG.COLORS.HOUSE_DOOR;
                this.ctx.fillRect(screenX + 16, screenY + 10, 32, 54);
                // 门把手
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(screenX + 40, screenY + 40, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.TALL_GRASS:
                // 动态高草丛
                this.ctx.fillStyle = CONFIG.COLORS.GRASS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                let grassFrame = this.getAnimFrame(3);
                let grassOffset = grassFrame * 3 - 3;
                
                this.ctx.fillStyle = CONFIG.COLORS.TALL_GRASS;
                // 草叶
                for (let i = 0; i < 4; i++) {
                    let gx = screenX + 8 + i * 14;
                    let gy = screenY + 20;
                    let go = Math.sin(frame * 0.15 + i) * 4;
                    this.ctx.fillRect(gx + go, gy, 4, 30);
                    this.ctx.fillRect(gx + go - 2, gy + 10, 8, 3);
                }
                break;
                
            case CONFIG.TILE_TYPES.FLOWER:
                // 草地背景
                this.ctx.fillStyle = CONFIG.COLORS.GRASS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 花朵
                let flowerColors = [CONFIG.COLORS.FLOWER_PINK, CONFIG.COLORS.FLOWER_RED, CONFIG.COLORS.FLOWER_YELLOW];
                let flowerColor = flowerColors[(x + y) % 3];
                this.ctx.fillStyle = flowerColor;
                this.ctx.beginPath();
                this.ctx.arc(screenX + 32, screenY + 32, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(screenX + 32, screenY + 32, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.BRIDGE:
                this.ctx.fillStyle = CONFIG.COLORS.BRIDGE;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 木纹
                this.ctx.strokeStyle = '#8B4513';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(screenX, screenY + 10 + i * 20);
                    this.ctx.lineTo(screenX + CONFIG.TILE_SIZE, screenY + 10 + i * 20);
                    this.ctx.stroke();
                }
                break;
                
            case CONFIG.TILE_TYPES.STAIRS:
                this.ctx.fillStyle = CONFIG.COLORS.STAIRS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 台阶纹理
                this.ctx.fillStyle = '#5F6B70';
                for (let i = 0; i < 4; i++) {
                    this.ctx.fillRect(screenX + 4, screenY + 4 + i * 15, 56, 10);
                }
                break;
                
            case CONFIG.TILE_TYPES.MOUNTAIN:
                this.ctx.fillStyle = CONFIG.COLORS.MOUNTAIN;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 山峰
                this.ctx.fillStyle = '#555';
                this.ctx.beginPath();
                this.ctx.moveTo(screenX + 32, screenY + 10);
                this.ctx.lineTo(screenX + 10, screenY + 54);
                this.ctx.lineTo(screenX + 54, screenY + 54);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.LAVA:
                // 动态岩浆
                let lavaFrame = this.getAnimFrame(2);
                this.ctx.fillStyle = lavaFrame === 0 ? CONFIG.COLORS.LAVA : CONFIG.COLORS.LAVA_ANIM;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 气泡
                this.ctx.fillStyle = '#FF6347';
                let bubbleY = screenY + 20 + Math.sin(frame * 0.2) * 10;
                this.ctx.beginPath();
                this.ctx.arc(screenX + 20, bubbleY, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(screenX + 45, bubbleY + 10, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.SWAMP:
                this.ctx.fillStyle = CONFIG.COLORS.SWAMP;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 气泡
                this.ctx.fillStyle = '#6B8E23';
                let swampBubble = Math.sin(frame * 0.1 + x + y) * 3;
                this.ctx.beginPath();
                this.ctx.arc(screenX + 30, screenY + 30 + swampBubble, 6, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.CHEST:
                // 宝箱
                this.ctx.fillStyle = CONFIG.COLORS.GRASS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                this.ctx.fillStyle = CONFIG.COLORS.CHEST;
                this.ctx.fillRect(screenX + 16, screenY + 20, 32, 24);
                this.ctx.fillStyle = '#B8860B';
                this.ctx.fillRect(screenX + 16, screenY + 20, 32, 8);
                // 锁
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(screenX + 28, screenY + 32, 8, 8);
                break;
                
            case CONFIG.TILE_TYPES.TORCH:
                // 火把
                this.ctx.fillStyle = CONFIG.COLORS.GRASS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 火把杆
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(screenX + 28, screenY + 20, 8, 44);
                // 火焰（动态）
                let torchFrame = this.getAnimFrame(2);
                this.ctx.fillStyle = torchFrame === 0 ? CONFIG.COLORS.TORCH : CONFIG.COLORS.TORCH_FLAME;
                this.ctx.beginPath();
                this.ctx.arc(screenX + 32, screenY + 16, 10, 0, Math.PI * 2);
                this.ctx.fill();
                // 光晕
                this.ctx.fillStyle = 'rgba(255, 200, 0, 0.2)';
                this.ctx.beginPath();
                this.ctx.arc(screenX + 32, screenY + 16, 20, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case CONFIG.TILE_TYPES.SIGN:
                // 草地背景
                this.ctx.fillStyle = CONFIG.COLORS.GRASS;
                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                // 路牌
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(screenX + 28, screenY + 24, 8, 40);
                this.ctx.fillStyle = CONFIG.COLORS.SIGN;
                this.ctx.fillRect(screenX + 12, screenY + 12, 40, 16);
                break;
        }
    }
    
    // 绘制角色（玩家或NPC）
    drawCharacter(x, y, direction, type, cameraX, cameraY, isMoving) {
        let screenX = (x - cameraX) * CONFIG.TILE_SIZE;
        let screenY = (y - cameraY) * CONFIG.TILE_SIZE;
        
        // 跳过屏幕外的角色
        if (screenX < -CONFIG.TILE_SIZE || screenX > this.canvas.width ||
            screenY < -CONFIG.TILE_SIZE || screenY > this.canvas.height) {
            return;
        }
        
        let bodyColor = type === 'player' ? CONFIG.COLORS.PLAYER_BODY : CONFIG.COLORS.NPC_BODY;
        let headColor = type === 'player' ? CONFIG.COLORS.PLAYER_HEAD : CONFIG.COLORS.NPC_HEAD;
        let dirColor = CONFIG.COLORS.PLAYER_DIR;
        
        // 移动动画
        let bounce = isMoving ? Math.sin(this.animFrame * 0.5) * 3 : 0;
        
        // 身体
        this.ctx.fillStyle = bodyColor;
        this.ctx.fillRect(screenX + 16, screenY + 24 + bounce, 32, 28);
        
        // 头
        this.ctx.fillStyle = headColor;
        this.ctx.beginPath();
        this.ctx.arc(screenX + 32, screenY + 20 + bounce, 14, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 方向指示（眼睛）
        this.ctx.fillStyle = dirColor;
        switch(direction) {
            case 'up':
                this.ctx.fillRect(screenX + 26, screenY + 14 + bounce, 4, 4);
                this.ctx.fillRect(screenX + 34, screenY + 14 + bounce, 4, 4);
                break;
            case 'down':
                this.ctx.fillRect(screenX + 26, screenY + 22 + bounce, 4, 4);
                this.ctx.fillRect(screenX + 34, screenY + 22 + bounce, 4, 4);
                break;
            case 'left':
                this.ctx.fillRect(screenX + 20, screenY + 18 + bounce, 4, 4);
                this.ctx.fillRect(screenX + 20, screenY + 24 + bounce, 4, 4);
                break;
            case 'right':
                this.ctx.fillRect(screenX + 40, screenY + 18 + bounce, 4, 4);
                this.ctx.fillRect(screenX + 40, screenY + 24 + bounce, 4, 4);
                break;
        }
        
        // NPC名字
        if (type === 'npc') {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            // 需要在外部传入名字
        }
    }
    
    // 绘制文本
    drawText(text, x, y, color = '#fff', size = 14, align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
    
    // 绘制矩形
    drawRect(x, y, width, height, color, alpha = 1) {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }
    
    // 绘制边框
    drawBorder(x, y, width, height, color = '#fff', lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    // 应用昼夜效果
    applyDayNightEffect() {
        let phase = this.getTimePhase();
        let alpha = 0;
        
        switch(phase) {
            case 'day':
                alpha = 0;
                break;
            case 'sunset':
                alpha = 0.2;
                break;
            case 'night':
                alpha = 0.4;
                break;
            case 'dawn':
                alpha = 0.15;
                break;
        }
        
        if (alpha > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 50, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// 导出
const renderer = new Renderer('gameCanvas');
