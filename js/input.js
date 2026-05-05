/**
 * 输入处理模块
 * 处理键盘输入，防止重复触发
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.keyPressed = {};
        this.lastMoveTime = 0;
        
        this.setupListeners();
    }
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            // 防止默认行为（滚动页面等）
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
                e.preventDefault();
            }
            
            this.keys[e.key] = true;
            
            // 标记按键第一次按下
            if (!this.keyPressed[e.key]) {
                this.keyPressed[e.key] = true;
                this.onKeyDown(e.key);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keyPressed[e.key] = false;
        });
    }
    
    // 按键第一次按下时的回调（需要子类重写）
    onKeyDown(key) {
        // 由游戏逻辑处理
    }
    
    // 检查按键是否按下
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    // 检查方向键（带延迟）
    getDirection() {
        let now = Date.now();
        if (now - this.lastMoveTime < CONFIG.MOVE_DELAY) {
            return null;
        }
        
        if (this.keys['ArrowUp']) {
            this.lastMoveTime = now;
            return 'up';
        }
        if (this.keys['ArrowDown']) {
            this.lastMoveTime = now;
            return 'down';
        }
        if (this.keys['ArrowLeft']) {
            this.lastMoveTime = now;
            return 'left';
        }
        if (this.keys['ArrowRight']) {
            this.lastMoveTime = now;
            return 'right';
        }
        
        return null;
    }
    
    // 清除所有按键状态
    clear() {
        this.keys = {};
        this.keyPressed = {};
    }
}

// 导出
const inputManager = new InputManager();
