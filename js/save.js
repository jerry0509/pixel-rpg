/**
 * 存档系统
 * LocalStorage存档/读档
 */

class SaveSystem {
    constructor() {
        this.saveKey = 'pixel_rpg_save';
    }
    
    // 保存游戏
    save() {
        let saveData = {
            player: {
                x: player.x,
                y: player.y,
                direction: player.direction,
                name: player.name,
                level: player.level,
                exp: player.exp,
                gold: player.gold,
                hp: player.hp,
                maxHp: player.maxHp,
                atk: player.atk,
                def: player.def,
                spd: player.spd,
                currentMap: player.currentMap,
                inventory: player.inventory,
                equipment: player.equipment,
                skills: player.skills,
                favorability: player.favorability
            },
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            uiManager.addMessage('游戏已保存！');
            return true;
        } catch (e) {
            uiManager.addMessage('保存失败：' + e.message);
            return false;
        }
    }
    
    // 读取存档
    load() {
        try {
            let data = localStorage.getItem(this.saveKey);
            if (!data) {
                uiManager.addMessage('没有找到存档！');
                return false;
            }
            
            let saveData = JSON.parse(data);
            
            // 恢复玩家数据
            player.x = saveData.player.x;
            player.y = saveData.player.y;
            player.direction = saveData.player.direction;
            player.name = saveData.player.name;
            player.level = saveData.player.level;
            player.exp = saveData.player.exp;
            player.gold = saveData.player.gold;
            player.hp = saveData.player.hp;
            player.maxHp = saveData.player.maxHp;
            player.atk = saveData.player.atk;
            player.def = saveData.player.def;
            player.spd = saveData.player.spd;
            player.currentMap = saveData.player.currentMap;
            player.inventory = saveData.player.inventory;
            player.equipment = saveData.player.equipment;
            player.skills = saveData.player.skills;
            player.favorability = saveData.player.favorability || {};
            
            // 加载地图
            mapManager.loadMap(player.currentMap);
            
            uiManager.addMessage('游戏已读取！');
            return true;
        } catch (e) {
            uiManager.addMessage('读取失败：' + e.message);
            return false;
        }
    }
    
    // 检查是否有存档
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    // 删除存档
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        uiManager.addMessage('存档已删除！');
    }
}

// 导出
const saveSystem = new SaveSystem();
