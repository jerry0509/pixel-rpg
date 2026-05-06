/**
 * Coromon风格精灵系统
 * 用于AI像素冒险游戏
 *
 * 这个文件定义了一个精灵系统，可以将像素数据渲染到Canvas上
 * 精灵数据使用紧凑的字符串格式，每个字符代表一个颜色
 */

class CoromonSpriteSystem {
    constructor() {
        // Coromon风格调色板
        this.palette = {
            // 基础颜色
            '0': 'transparent',    // 透明
            '1': '#000000',        // 黑色
            '2': '#ffffff',        // 白色
            '3': '#f4c7a0',        // 肤色
            '4': '#2d2d2d',        // 深灰
            '5': '#666666',        // 中灰
            '6': '#999999',        // 浅灰

            // 绿色系（草地、树木）
            '7': '#3a7d44',        // 基础绿
            '8': '#5fa85f',        // 亮绿
            '9': '#1a4d1a',        // 深绿
            '!': '#8CD858',        // 高光绿
            '@': '#2C7214',        // 阴影绿
            ';': '#5CB038',        // 中间绿
            ':': '#3C8820',        // 暗绿
            ',': '#7CC848',        // 浅绿

            // 棕色系（树干、建筑）
            'a': '#8b5e3c',        // 基础棕
            'b': '#d4a76a',        // 亮棕
            'c': '#5d3a1a',        // 深棕
            'x': '#8b4513',        // 木色
            'Z': '#A0522d',        // 赭石

            // 蓝色系（水、窗户）
            'd': '#4a90d9',        // 基础蓝
            'e': '#3a78c0',        // 深蓝
            'f': '#a0d0ff',        // 浅蓝
            'N': '#87CEEB',        // 天蓝
            '}': '#4898D8',        // 水蓝
            '|': '#3080C0',        // 深水蓝

            // 红色系（花朵、伤害）
            'g': '#e74c3c',        // 基础红
            'h': '#ff7070',        // 亮红
            'i': '#d42020',        // 深红

            // 黄色系（金币、高光）
            'j': '#f39c12',        // 基础黄
            'k': '#ffd700',        // 金色
            '*': '#F0D050',        // 亮黄

            // 粉色系（花朵）
            'l': '#ff69b4',        // 粉红
            '(': '#F07888',        // 浅粉

            // 紫色系
            'm': '#6b4a8e',        // 基础紫
            'n': '#2e1a47',        // 深紫

            // 灰色系（石头、阴影）
            'o': '#708090',        // 石灰
            'p': '#505050',        // 暗灰
            'Q': '#696969',        // 中灰
            'R': '#808080',        // 灰色
            'S': '#A9A9A9',        // 浅灰
            '{': '#686058',        // 暖灰

            // 其他颜色
            'q': '#deb887',        // 浅棕
            'r': '#8b6914',        // 深金
            's': '#ff8c00',        // 橙色
            't': '#ff4500',        // 火橙
            'u': '#2c1810',        // 深褐
            'v': '#1e90ff',        // 道奇蓝
            'w': '#40e0d0',        // 青绿
            'y': '#6b8e23',        // 橄榄绿
            'z': '#f5f5dc',        // 米色

            // 建筑专用
            'A': '#8B2500',        // 深红棕
            'B': '#b87333',        // 铜色
            'C': '#ffd080',        // 浅橙
            'D': '#6ab4f7',        // 天蓝
            'E': '#c0392b',        // 深红
            'F': '#e8a040',        // 橙黄
            'G': '#CD6839',        // 陶土
            'H': '#E8A060',        // 浅陶土
            'I': '#C4A882',        // 沙色
            'J': '#D4C4A8',        // 浅沙
            'K': '#E8D5B8',        // 米色
            'L': '#F5E6D0',        // 奶油色
            'M': '#4A3520',        // 深褐
            'O': '#5F9EA0',        // 碧绿
            'P': '#3D2010',        // 深棕
            'T': '#B8860B',        // 暗金
            'U': '#DEB887',        // 小麦色
            'V': '#5A4A3A',        // 灰褐
            'W': '#F0E0C8',        // 浅米

            // Coromon风格扩展
            '#': '#78C8F8',        // 浅蓝
            '$': '#2068A0',        // 深蓝
            '%': '#70C848',        // 草绿
            '^': '#A08858',        // 沙棕
            '&': '#E8D0A0',        // 浅沙
            ')': '#F0F0E0',        // 象牙白
            '-': '#685028',        // 深棕
            '+': '#A08050',        // 中棕
            '=': '#C09060',        // 浅棕
            '[': '#806030',        // 深褐
            ']': '#C8C0B0',        // 浅灰
            '<': '#D8B888',        // 浅金
            '>': '#B89868',        // 中金
            '\\': '#F88028',       // 橙色
            '?': '#C03810',        // 深红
            '~': '#70C0A0',        // 青绿
            '`': '#508870',        // 深青
        };

        // 精灵缓存
        this.cache = {};
    }

    /**
     * 解码精灵字符串为Canvas
     * @param {string} data - 精灵数据字符串
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {HTMLCanvasElement}
     */
    decode(data, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < data.length && i < width * height; i++) {
            const ch = data[i];
            if (ch === '.' || ch === ' ') {
                // 透明像素
                imageData.data[i * 4 + 3] = 0;
            } else {
                const color = this.palette[ch];
                if (color && color !== 'transparent') {
                    const r = parseInt(color.substr(1, 2), 16);
                    const g = parseInt(color.substr(3, 2), 16);
                    const b = parseInt(color.substr(5, 2), 16);
                    imageData.data[i * 4] = r;
                    imageData.data[i * 4 + 1] = g;
                    imageData.data[i * 4 + 2] = b;
                    imageData.data[i * 4 + 3] = 255;
                } else {
                    // 未知颜色，显示为洋红色以便调试
                    imageData.data[i * 4] = 255;
                    imageData.data[i * 4 + 1] = 0;
                    imageData.data[i * 4 + 2] = 255;
                    imageData.data[i * 4 + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * 创建动画帧序列
     * @param {string[]} frames - 帧数据数组
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {HTMLCanvasElement[]}
     */
    createAnimation(frames, width, height) {
        return frames.map(frame => this.decode(frame, width, height));
    }

    /**
     * 绘制精灵到Canvas
     * @param {CanvasRenderingContext2D} ctx - 目标上下文
     * @param {HTMLCanvasElement} sprite - 精灵Canvas
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} scale - 缩放比例
     */
    drawSprite(ctx, sprite, x, y, scale = 1) {
        if (!sprite) return;

        if (scale === 1) {
            ctx.drawImage(sprite, x, y);
        } else {
            ctx.drawImage(sprite, x, y, sprite.width * scale, sprite.height * scale);
        }
    }

    /**
     * 绘制动画精灵
     * @param {CanvasRenderingContext2D} ctx - 目标上下文
     * @param {HTMLCanvasElement[]} frames - 帧数组
     * @param {number} frameIndex - 当前帧索引
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} scale - 缩放比例
     */
    drawAnimatedSprite(ctx, frames, frameIndex, x, y, scale = 1) {
        if (!frames || frames.length === 0) return;

        const frame = frames[frameIndex % frames.length];
        this.drawSprite(ctx, frame, x, y, scale);
    }
}

// 导出精灵系统
if (typeof module !== 'undefined') {
    module.exports = CoromonSpriteSystem;
}
