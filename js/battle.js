/**
 * 战斗系统
 * 回合制战斗、技能、属性相克、状态效果
 */

class BattleSystem {
    constructor() {
        this.active = false;
        this.monster = null;
        this.turn = 'player';  // player 或 monster
        this.log = [];
        this.selectedAction = 0;
        this.selectedSkill = 0;
        this.selectedItem = 0;
        this.state = 'action';  // action, skill, item, battle
        this.animationTimer = 0;
        this.animationType = null;
    }
    
    // 开始战斗
    startBattle(monsterId, isBoss = false) {
        let data = isBoss ? BOSS_DATA[monsterId] : MONSTER_DATA[monsterId];
        if (!data) return;
        
        this.monster = new Monster(monsterId, data);
        this.active = true;
        this.turn = 'player';
        this.log = [];
        this.state = 'action';
        this.selectedAction = 0;
        
        this.addLog(`遭遇了${this.monster.name}！`);
        
        if (isBoss) {
            this.addLog(`⚠️ Boss战！${this.monster.name}出现了！`);
        }
    }
    
    // 添加日志
    addLog(message) {
        this.log.unshift(message);
        if (this.log.length > 5) this.log.pop();
    }
    
    // 玩家行动
    playerAction(action) {
        if (this.turn !== 'player') return;
        
        switch(action) {
            case 'attack':
                this.playerAttack();
                break;
            case 'skill':
                this.state = 'skill';
                break;
            case 'item':
                this.state = 'item';
                break;
            case 'run':
                this.tryEscape();
                break;
        }
    }
    
    // 普通攻击
    playerAttack() {
        let damage = this.calculateDamage(player.getTotalAtk(), this.monster.def, 'normal');
        let isCrit = Math.random() < CONFIG.BATTLE.CRIT_RATE;
        
        if (isCrit) {
            damage = Math.floor(damage * CONFIG.BATTLE.CRIT_MULTIPLIER);
            this.addLog(`💥 暴击！对${this.monster.name}造成${damage}点伤害！`);
        } else {
            this.addLog(`⚔️ 攻击${this.monster.name}，造成${damage}点伤害！`);
        }
        
        this.monster.takeDamage(damage);
        
        if (!this.monster.isAlive()) {
            this.victory();
        } else {
            this.turn = 'monster';
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }
    
    // 使用技能
    useSkill(skillIndex) {
        if (skillIndex >= player.skills.length) return;
        
        let skill = player.skills[skillIndex];
        
        // 检查MP
        if (player.mp < skill.mp) {
            this.addLog('MP不足！');
            return;
        }
        
        player.mp -= skill.mp;
        
        let damage = 0;
        let isWeakness = false;
        
        // 计算伤害
        if (skill.type === 'physical' || skill.type === 'magic') {
            let baseAtk = skill.type === 'physical' ? player.getTotalAtk() : player.getTotalAtk() * 1.2;
            damage = this.calculateDamage(baseAtk, this.monster.def, skill.element);
            
            // 属性相克
            let elementMultiplier = this.getElementMultiplier(skill.element, this.monster.element);
            damage = Math.floor(damage * elementMultiplier);
            
            // 弱点检测
            if (this.monster.weakness && skill.element === this.monster.weakness) {
                damage *= 2;
                isWeakness = true;
            }
            
            // 暴击
            if (skill.critRate && Math.random() < skill.critRate) {
                damage = Math.floor(damage * CONFIG.BATTLE.CRIT_MULTIPLIER);
                this.addLog(`💥 暴击！`);
            }
            
            // HP消耗
            if (skill.hpCost) {
                let hpLoss = Math.floor(player.maxHp * skill.hpCost);
                player.hp = Math.max(1, player.hp - hpLoss);
                this.addLog(`消耗了${hpLoss} HP！`);
            }
            
            this.monster.takeDamage(damage);
            
            if (isWeakness) {
                this.addLog(`✨ 效果拔群！${this.monster.name}的弱点被击中！`);
            }
            
            this.addLog(`🔥 使用${skill.name}，造成${damage}点伤害！`);
            
            // 状态效果
            if (skill.status) {
                this.applyStatus(skill.status);
            }
        } else if (skill.type === 'heal') {
            let healAmount = Math.floor(player.maxHp * skill.power);
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            this.addLog(`💚 使用${skill.name}，恢复${healAmount} HP！`);
        } else if (skill.type === 'buff') {
            this.applyStatus(skill.status);
            this.addLog(`✨ 使用${skill.name}！`);
        }
        
        if (!this.monster.isAlive()) {
            this.victory();
        } else {
            this.turn = 'monster';
            this.state = 'action';
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }
    
    // 使用道具
    useItem(itemId) {
        let item = ITEM_DATA[itemId];
        if (!item) return;
        
        switch(item.effect) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + item.value);
                this.addLog(`💚 使用${item.name}，恢复${item.value} HP！`);
                break;
            case 'cure_poison':
                player.statusEffects = player.statusEffects.filter(s => s !== 'poison');
                this.addLog(`使用${item.name}，解除了中毒！`);
                break;
            case 'cure_freeze':
                player.statusEffects = player.statusEffects.filter(s => s !== 'freeze');
                this.addLog(`使用${item.name}，解除了冰冻！`);
                break;
            case 'escape':
                this.addLog(`使用${item.name}，逃跑成功！`);
                this.endBattle();
                return;
            case 'buff_atk':
                player.statusEffects.push({ type: 'berserk', duration: item.duration });
                this.addLog(`使用${item.name}，攻击力提升30%！`);
                break;
            case 'buff_def':
                player.statusEffects.push({ type: 'shield', duration: item.duration });
                this.addLog(`使用${item.name}，防御力提升30%！`);
                break;
        }
        
        // 减少道具数量
        let itemIndex = player.inventory.items.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            player.inventory.items[itemIndex].count--;
            if (player.inventory.items[itemIndex].count <= 0) {
                player.inventory.items.splice(itemIndex, 1);
            }
        }
        
        this.turn = 'monster';
        this.state = 'action';
        setTimeout(() => this.monsterTurn(), 1000);
    }
    
    // 尝试逃跑
    tryEscape() {
        if (this.monster.isBoss) {
            this.addLog('无法从Boss战中逃跑！');
            return;
        }
        
        if (Math.random() < CONFIG.BATTLE.ESCAPE_RATE) {
            this.addLog('逃跑成功！');
            this.endBattle();
        } else {
            this.addLog('逃跑失败！');
            this.turn = 'monster';
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }
    
    // 怪物回合
    monsterTurn() {
        if (!this.monster || !this.monster.isAlive()) return;
        
        // 检查状态效果
        if (this.hasStatus('freeze') || this.hasStatus('stun')) {
            this.addLog(`${this.monster.name}无法行动！`);
            this.removeStatus('freeze');
            this.removeStatus('stun');
            this.turn = 'player';
            return;
        }
        
        // 怪物攻击
        let damage = this.calculateDamage(this.monster.atk, player.getTotalDef(), this.monster.element);
        
        // 护盾效果
        if (this.hasStatus('shield')) {
            damage = Math.floor(damage * 0.5);
        }
        
        player.hp = Math.max(0, player.hp - damage);
        this.addLog(`${this.monster.name}攻击了你，造成${damage}点伤害！`);
        
        // 状态效果伤害
        this.processStatusEffects();
        
        if (player.hp <= 0) {
            this.defeat();
        } else {
            this.turn = 'player';
        }
    }
    
    // 计算伤害
    calculateDamage(atk, def, element) {
        let baseDamage = atk * (1 + Math.random() * 0.1) - def * 0.5;
        return Math.max(1, Math.floor(baseDamage));
    }
    
    // 属性相克
    getElementMultiplier(attackElement, defenseElement) {
        if (!attackElement || !defenseElement || attackElement === 'normal') return 1;
        
        let chart = CONFIG.ELEMENT_CHART[attackElement];
        if (!chart) return 1;
        
        if (chart.strong === defenseElement) return 1.5;
        if (chart.weak === defenseElement) return 0.5;
        return 1;
    }
    
    // 应用状态效果
    applyStatus(statusType) {
        let status = CONFIG.STATUS_EFFECTS[statusType.toUpperCase()];
        if (status) {
            player.statusEffects.push({ type: statusType, duration: status.duration });
            this.addLog(`${this.monster.name}陷入了${status.name}状态！`);
        }
    }
    
    // 检查是否有某个状态
    hasStatus(statusType) {
        return player.statusEffects.some(s => s.type === statusType);
    }
    
    // 移除状态
    removeStatus(statusType) {
        player.statusEffects = player.statusEffects.filter(s => s.type !== statusType);
    }
    
    // 处理状态效果
    processStatusEffects() {
        player.statusEffects = player.statusEffects.filter(effect => {
            if (effect.type === 'poison') {
                let damage = Math.floor(player.maxHp * 0.05);
                player.hp = Math.max(0, player.hp - damage);
                this.addLog(`中毒！损失${damage} HP！`);
            } else if (effect.type === 'burn') {
                let damage = Math.floor(player.maxHp * 0.03);
                player.hp = Math.max(0, player.hp - damage);
                this.addLog(`灼烧！损失${damage} HP！`);
            }
            
            effect.duration--;
            return effect.duration > 0;
        });
    }
    
    // 胜利
    victory() {
        this.addLog(`🎉 击败了${this.monster.name}！`);
        this.addLog(`获得${this.monster.exp}经验，${this.monster.gold}金币！`);
        
        player.gainExp(this.monster.exp);
        player.gold += this.monster.gold;
        
        // 掉落物品
        let drops = this.monster.getDrops();
        for (let itemId of drops) {
            let item = ITEM_DATA[itemId];
            if (item) {
                this.addLog(`获得了${item.name}！`);
                // 添加到背包
                let existing = player.inventory.items.find(i => i.id === itemId);
                if (existing) {
                    existing.count++;
                } else {
                    player.inventory.items.push({ id: itemId, name: item.name, type: item.type, count: 1 });
                }
            }
        }
        
        setTimeout(() => this.endBattle(), 2000);
    }
    
    // 失败
    defeat() {
        this.addLog('你被击败了...');
        this.addLog('失去了一半的金币...');
        
        player.gold = Math.floor(player.gold / 2);
        player.hp = Math.floor(player.maxHp * 0.3);
        
        // 回到新手村
        player.currentMap = 'village';
        player.x = 49;
        player.y = 40;
        mapManager.loadMap('village');
        
        setTimeout(() => this.endBattle(), 2000);
    }
    
    // 结束战斗
    endBattle() {
        this.active = false;
        this.monster = null;
        this.log = [];
        this.state = 'action';
    }
    
    // 渲染战斗界面
    render() {
        if (!this.active || !this.monster) return;
        
        let ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height);
        
        // 怪物
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.monster.emoji, 640, 200);
        
        // 怪物信息
        ctx.fillStyle = '#e74c3c';
        ctx.font = '24px Arial';
        ctx.fillText(this.monster.name, 640, 280);
        
        // 怪物HP条
        let hpPercent = this.monster.hp / this.monster.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(440, 300, 400, 20);
        ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(440, 300, 400 * hpPercent, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.monster.hp}/${this.monster.maxHp}`, 640, 315);
        
        // 弱点提示
        if (this.monster.weakness) {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '16px Arial';
            ctx.fillText(`弱点: ${this.monster.weakness}`, 640, 350);
        }
        
        // 玩家信息
        ctx.fillStyle = '#3498db';
        ctx.font = '24px Arial';
        ctx.fillText(`Lv.${player.level} ${player.name}`, 640, 450);
        
        // 玩家HP条
        let playerHpPercent = player.hp / player.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(440, 470, 400, 20);
        ctx.fillStyle = playerHpPercent > 0.5 ? '#2ecc71' : playerHpPercent > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(440, 470, 400 * playerHpPercent, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, 640, 485);
        
        // 操作菜单
        if (this.state === 'action') {
            this.renderActionMenu();
        } else if (this.state === 'skill') {
            this.renderSkillMenu();
        } else if (this.state === 'item') {
            this.renderItemMenu();
        }
        
        // 战斗日志
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(50, 550, 1180, 150);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 550, 1180, 150);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        for (let i = 0; i < this.log.length; i++) {
            ctx.fillText(this.log[i], 70, 580 + i * 25);
        }
    }
    
    // 渲染操作菜单
    renderActionMenu() {
        let ctx = renderer.ctx;
        let actions = ['⚔️攻击', '🔥技能', '🎒道具', '🏃逃跑'];
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(400, 520, 480, 50);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(400, 520, 480, 50);
        
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < actions.length; i++) {
            ctx.fillStyle = i === this.selectedAction ? '#f1c40f' : '#fff';
            ctx.fillText(actions[i], 500 + i * 120, 550);
        }
    }
    
    // 渲染技能菜单
    renderSkillMenu() {
        let ctx = renderer.ctx;
        
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(300, 350, 680, 200);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(300, 350, 680, 200);
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('选择技能', 640, 380);
        
        ctx.font = '14px Arial';
        for (let i = 0; i < player.skills.length; i++) {
            let skill = player.skills[i];
            ctx.fillStyle = i === this.selectedSkill ? '#f1c40f' : '#fff';
            ctx.fillText(`${skill.name} (MP:${skill.mp})`, 440 + (i % 3) * 200, 420 + Math.floor(i / 3) * 30);
        }
        
        ctx.fillStyle = '#888';
        ctx.fillText('按ESC返回', 640, 530);
    }
    
    // 渲染道具菜单
    renderItemMenu() {
        let ctx = renderer.ctx;
        
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(300, 350, 680, 200);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(300, 350, 680, 200);
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('选择道具', 640, 380);
        
        ctx.font = '14px Arial';
        let consumables = player.inventory.items.filter(i => i.type === 'consumable');
        for (let i = 0; i < Math.min(consumables.length, 6); i++) {
            let item = consumables[i];
            ctx.fillStyle = i === this.selectedItem ? '#f1c40f' : '#fff';
            ctx.fillText(`${item.name} x${item.count}`, 440 + (i % 3) * 200, 420 + Math.floor(i / 3) * 30);
        }
        
        ctx.fillStyle = '#888';
        ctx.fillText('按ESC返回', 640, 530);
    }
}

// 导出
const battleSystem = new BattleSystem();
