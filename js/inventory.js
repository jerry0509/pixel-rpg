/**
 * 背包系统
 * 管理道具、装备、材料
 */

class InventorySystem {
    constructor() {
        // 背包已在player.js中定义
    }
    
    // 添加物品
    addItem(itemId, count = 1) {
        let itemData = ITEM_DATA[itemId];
        if (!itemData) return false;
        
        let existing = player.inventory.items.find(i => i.id === itemId);
        if (existing) {
            existing.count += count;
        } else {
            player.inventory.items.push({
                id: itemId,
                name: itemData.name,
                type: itemData.type,
                count: count
            });
        }
        
        uiManager.addMessage(`获得了${itemData.name} x${count}！`);
        return true;
    }
    
    // 移除物品
    removeItem(itemId, count = 1) {
        let index = player.inventory.items.findIndex(i => i.id === itemId);
        if (index === -1) return false;
        
        player.inventory.items[index].count -= count;
        if (player.inventory.items[index].count <= 0) {
            player.inventory.items.splice(index, 1);
        }
        
        return true;
    }
    
    // 检查是否有足够数量的物品
    hasItem(itemId, count = 1) {
        let item = player.inventory.items.find(i => i.id === itemId);
        return item && item.count >= count;
    }
    
    // 获取物品数量
    getItemCount(itemId) {
        let item = player.inventory.items.find(i => i.id === itemId);
        return item ? item.count : 0;
    }
    
    // 使用道具
    useItem(itemId) {
        let itemData = ITEM_DATA[itemId];
        if (!itemData) return false;
        
        // 检查是否有这个道具
        if (!this.hasItem(itemId)) {
            uiManager.addMessage('没有这个道具！');
            return false;
        }
        
        // 根据道具类型处理
        switch(itemData.type) {
            case 'consumable':
                return this.useConsumable(itemId, itemData);
            case 'equipment':
                return this.equipItem(itemId, itemData);
            default:
                uiManager.addMessage('这个道具不能使用。');
                return false;
        }
    }
    
    // 使用消耗品
    useConsumable(itemId, itemData) {
        switch(itemData.effect) {
            case 'heal':
                if (player.hp >= player.maxHp) {
                    uiManager.addMessage('HP已满！');
                    return false;
                }
                player.hp = Math.min(player.maxHp, player.hp + itemData.value);
                uiManager.addMessage(`使用了${itemData.name}，恢复${itemData.value} HP！`);
                break;
                
            case 'cure_poison':
                player.statusEffects = player.statusEffects.filter(s => s.type !== 'poison');
                uiManager.addMessage(`使用了${itemData.name}，解除了中毒！`);
                break;
                
            case 'cure_freeze':
                player.statusEffects = player.statusEffects.filter(s => s.type !== 'freeze');
                uiManager.addMessage(`使用了${itemData.name}，解除了冰冻！`);
                break;
                
            case 'revive':
                if (player.hp > 0) {
                    uiManager.addMessage('你还活着，不需要复活！');
                    return false;
                }
                player.hp = Math.floor(player.maxHp * 0.3);
                uiManager.addMessage(`使用了${itemData.name}，复活了！`);
                break;
                
            default:
                uiManager.addMessage('这个道具不能在这里使用。');
                return false;
        }
        
        // 减少数量
        this.removeItem(itemId, 1);
        return true;
    }
    
    // 穿戴装备
    equipItem(itemId, itemData) {
        let slot = itemData.slot;
        
        // 如果已有装备，先卸下
        if (player.equipment[slot]) {
            this.unequip(slot);
        }
        
        // 穿戴新装备
        player.equipment[slot] = {
            id: itemId,
            name: itemData.name,
            ...itemData
        };
        
        // 从背包移除
        this.removeItem(itemId, 1);
        
        uiManager.addMessage(`装备了${itemData.name}！`);
        return true;
    }
    
    // 卸下装备
    unequip(slot) {
        if (!player.equipment[slot]) return false;
        
        let item = player.equipment[slot];
        
        // 添加到背包
        this.addItem(item.id, 1);
        
        // 卸下
        player.equipment[slot] = null;
        
        uiManager.addMessage(`卸下了${item.name}！`);
        return true;
    }
    
    // 在商店购买物品
    buyItem(itemId, count = 1) {
        let itemData = ITEM_DATA[itemId];
        if (!itemData) return false;
        
        let totalPrice = itemData.price * count;
        
        if (player.gold < totalPrice) {
            uiManager.addMessage('金币不足！');
            return false;
        }
        
        player.gold -= totalPrice;
        this.addItem(itemId, count);
        
        uiManager.addMessage(`购买了${itemData.name} x${count}，花费${totalPrice}金币！`);
        return true;
    }
    
    // 在商店出售物品
    sellItem(itemId, count = 1) {
        let itemData = ITEM_DATA[itemId];
        if (!itemData) return false;
        
        if (!this.hasItem(itemId, count)) {
            uiManager.addMessage('没有足够的物品！');
            return false;
        }
        
        let sellPrice = Math.floor(itemData.price * 0.5) * count;
        
        this.removeItem(itemId, count);
        player.gold += sellPrice;
        
        uiManager.addMessage(`出售了${itemData.name} x${count}，获得${sellPrice}金币！`);
        return true;
    }
    
    // 获取装备属性加成
    getEquipmentBonus() {
        let bonus = {
            atk: 0,
            def: 0,
            spdBonus: 0,
            hpRegen: 0
        };
        
        for (let slot in player.equipment) {
            let item = player.equipment[slot];
            if (!item) continue;
            
            if (item.atk) bonus.atk += item.atk;
            if (item.def) bonus.def += item.def;
            if (item.spdBonus) bonus.spdBonus += item.spdBonus;
            if (item.effect === 'regen') bonus.hpRegen += item.value;
        }
        
        return bonus;
    }
}

// 导出
const inventorySystem = new InventorySystem();
