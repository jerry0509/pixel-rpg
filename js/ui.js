/**
 * UI系统
 * 对话框、菜单、状态栏、消息提示
 */

class UIManager {
    constructor() {
        this.messages = [];
        this.dialogue = null;
        this.menu = null;
        this.showInventory = false;
        this.showMap = false;
    }
    
    // 添加消息
    addMessage(text) {
        this.messages.push({ text, timer: 180 });  // 3秒
        if (this.messages.length > 5) this.messages.shift();
    }
    
    // 显示对话
    showDialogue(name, text) {
        this.dialogue = { name, text };
    }
    
    // 关闭对话
    closeDialogue() {
        this.dialogue = null;
    }
    
    // 显示菜单
    showMenu() {
        this.menu = {
            selected: 0,
            items: ['背包', '装备', '存档', '读档', '返回']
        };
    }
    
    // 关闭菜单
    closeMenu() {
        this.menu = null;
    }
    
    // 更新
    update() {
        this.messages = this.messages.filter(m => {
            m.timer--;
            return m.timer > 0;
        });
    }
    
    // 渲染
    render() {
        // 消息提示
        this.renderMessages();
        
        // 对话框
        if (this.dialogue) {
            this.renderDialogue();
        }
        
        // 菜单
        if (this.menu) {
            this.renderMenu();
        }
        
        // 背包
        if (this.showInventory) {
            this.renderInventory();
        }
        
        // 地图
        if (this.showMap) {
            this.renderMap();
        }
    }
    
    // 渲染消息
    renderMessages() {
        let ctx = renderer.ctx;
        let y = 10;
        
        for (let msg of this.messages) {
            let alpha = Math.min(1, msg.timer / 30);
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(10, y, 300, 30);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(10, y, 300, 30);
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(msg.text, 20, y + 20);
            
            y += 35;
        }
        
        ctx.globalAlpha = 1;
    }
    
    // 渲染对话框
    renderDialogue() {
        let ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(100, 500, 1080, 180);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 500, 1080, 180);
        
        // NPC名字
        ctx.fillStyle = '#f1c40f';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.dialogue.name, 130, 540);
        
        // 对话内容（自动换行）
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        let words = this.dialogue.text;
        let line = '';
        let y = 570;
        let maxWidth = 1020;
        
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            let metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                ctx.fillText(line, 130, y);
                line = words[i];
                y += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 130, y);
        
        // 提示
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按空格键继续', 640, 670);
    }
    
    // 渲染菜单
    renderMenu() {
        let ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(500, 200, 280, 300);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(500, 200, 280, 300);
        
        // 标题
        ctx.fillStyle = '#f1c40f';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('菜单', 640, 240);
        
        // 菜单项
        ctx.font = '16px Arial';
        for (let i = 0; i < this.menu.items.length; i++) {
            ctx.fillStyle = i === this.menu.selected ? '#f1c40f' : '#fff';
            ctx.fillText(this.menu.items[i], 640, 290 + i * 40);
        }
    }
    
    // 渲染背包
    renderInventory() {
        let ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(200, 100, 880, 568);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 100, 880, 568);
        
        // 标题
        ctx.fillStyle = '#f1c40f';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('背包', 640, 140);
        
        // 金币
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`💰 ${player.gold} 金币`, 640, 170);
        
        // 道具列表
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        let y = 200;
        
        // 消耗品
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('=== 消耗品 ===', 230, y);
        y += 25;
        
        let consumables = player.inventory.items.filter(i => i.type === 'consumable');
        for (let item of consumables) {
            ctx.fillStyle = '#fff';
            ctx.fillText(`${item.name} x${item.count}`, 250, y);
            y += 20;
        }
        
        y += 15;
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('=== 装备 ===', 230, y);
        y += 25;
        
        let equipment = player.inventory.items.filter(i => i.type === 'equipment');
        for (let item of equipment) {
            ctx.fillStyle = '#fff';
            ctx.fillText(item.name, 250, y);
            y += 20;
        }
        
        y += 15;
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('=== 材料 ===', 230, y);
        y += 25;
        
        let materials = player.inventory.items.filter(i => i.type === 'material');
        for (let item of materials) {
            ctx.fillStyle = '#fff';
            ctx.fillText(`${item.name} x${item.count}`, 250, y);
            y += 20;
        }
        
        // 提示
        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按ESC关闭', 640, 650);
    }
    
    // 渲染小地图
    renderMap() {
        let ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(340, 140, 600, 488);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(340, 140, 600, 488);
        
        // 标题
        ctx.fillStyle = '#f1c40f';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mapManager.currentMap?.name || '地图', 640, 170);
        
        // 地图预览（简化版）
        if (mapManager.currentMap) {
            let scale = 5;
            let offsetX = 360;
            let offsetY = 190;
            
            for (let y = 0; y < mapManager.currentMap.height; y += 2) {
                for (let x = 0; x < mapManager.currentMap.width; x += 2) {
                    let tile = mapManager.getTile(x, y);
                    let color;
                    
                    switch(tile) {
                        case CONFIG.TILE_TYPES.GRASS:
                        case CONFIG.TILE_TYPES.TALL_GRASS:
                            color = '#4a7c59';
                            break;
                        case CONFIG.TILE_TYPES.TREE:
                            color = '#2d5a27';
                            break;
                        case CONFIG.TILE_TYPES.WATER:
                            color = '#3498db';
                            break;
                        case CONFIG.TILE_TYPES.PATH:
                            color = '#95a5a6';
                            break;
                        case CONFIG.TILE_TYPES.HOUSE_WALL:
                            color = '#8b4513';
                            break;
                        case CONFIG.TILE_TYPES.LAVA:
                            color = '#ff4500';
                            break;
                        case CONFIG.TILE_TYPES.MOUNTAIN:
                            color = '#696969';
                            break;
                        default:
                            color = '#4a7c59';
                    }
                    
                    ctx.fillStyle = color;
                    ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale * 2, scale * 2);
                }
            }
            
            // 玩家位置
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(offsetX + player.x * scale, offsetY + player.y * scale, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 提示
        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按M关闭', 640, 610);
    }
    
    // 更新状态栏
    updateStatusBar() {
        document.getElementById('hp').textContent = player.hp;
        document.getElementById('max-hp').textContent = player.maxHp;
        document.getElementById('atk').textContent = player.getTotalAtk();
        document.getElementById('def').textContent = player.getTotalDef();
        document.getElementById('gold').textContent = player.gold;
        document.getElementById('level').textContent = player.level;
        document.getElementById('exp').textContent = player.exp;
        document.getElementById('next-exp').textContent = player.getNextLevelExp();
    }
}

// 导出
const uiManager = new UIManager();
