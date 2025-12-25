// 游戏画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
const TILE_SIZE = 32;
let MAP_WIDTH = 25;
let MAP_HEIGHT = 19;
let map = [];

// 根据屏幕尺寸计算地图大小
function calculateMapSize() {
    // 动态获取顶部栏高度
    const topBar = document.querySelector('.top-bar');
    const topBarHeight = topBar ? topBar.offsetHeight : 70;
    
    // 使用实际视口尺寸，减少padding以充分利用空间
    const padding = 10; // 最小边距
    
    const availableWidth = window.innerWidth - padding * 2;
    const availableHeight = window.innerHeight - topBarHeight - padding * 2;
    
    // 计算可以容纳的格子数（必须是奇数，方便生成迷宫）
    const maxTilesX = Math.floor(availableWidth / TILE_SIZE);
    const maxTilesY = Math.floor(availableHeight / TILE_SIZE);
    
    // 确保是奇数，并且有边界
    MAP_WIDTH = Math.max(15, Math.min(maxTilesX - (maxTilesX % 2 === 0 ? 1 : 0), 49));
    MAP_HEIGHT = Math.max(11, Math.min(maxTilesY - (maxTilesY % 2 === 0 ? 1 : 0), 37));
    
    // 确保是奇数
    if (MAP_WIDTH % 2 === 0) MAP_WIDTH--;
    if (MAP_HEIGHT % 2 === 0) MAP_HEIGHT--;
}

// 生成随机迷宫（使用递归回溯算法）
function generateMaze() {
    // 初始化地图：全部是墙
    map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = 1; // 1=墙
        }
    }
    
    // 递归回溯算法生成迷宫
    const stack = [];
    const visited = new Set();
    
    // 从(1,1)开始（必须是奇数坐标）
    const startX = 1;
    const startY = 1;
    
    function carve(x, y) {
        map[y][x] = 0; // 0=通道
        visited.add(`${x},${y}`);
        
        // 四个方向
        const directions = [
            { dx: 0, dy: -2 }, // 上
            { dx: 2, dy: 0 },  // 右
            { dx: 0, dy: 2 },  // 下
            { dx: -2, dy: 0 }  // 左
        ];
        
        // 随机打乱方向
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        for (let dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            if (nx > 0 && nx < MAP_WIDTH - 1 && 
                ny > 0 && ny < MAP_HEIGHT - 1 && 
                !visited.has(`${nx},${ny}`)) {
                
                // 打通中间的墙
                map[y + dir.dy / 2][x + dir.dx / 2] = 0;
                stack.push([x, y]);
                carve(nx, ny);
                return;
            }
        }
        
        // 如果没有未访问的邻居，回溯
        if (stack.length > 0) {
            const [px, py] = stack.pop();
            carve(px, py);
        }
    }
    
    carve(startX, startY);
    
    // 确保边界是墙
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y][0] = 1;
        map[y][MAP_WIDTH - 1] = 1;
    }
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[0][x] = 1;
        map[MAP_HEIGHT - 1][x] = 1;
    }
    
    // 确保起点和终点是通道
    map[1][1] = 0;
    map[MAP_HEIGHT - 2][MAP_WIDTH - 2] = 0;
}

function resizeCanvas() {
    // 根据屏幕尺寸计算地图大小
    calculateMapSize();
    
    // 生成随机地图
    generateMaze();
    
    // 设置canvas实际尺寸
    canvas.width = MAP_WIDTH * TILE_SIZE;
    canvas.height = MAP_HEIGHT * TILE_SIZE;
    
    // 计算显示尺寸（充分利用屏幕空间）
    const topBar = document.querySelector('.top-bar');
    const topBarHeight = topBar ? topBar.offsetHeight : 70;
    const padding = 5; // 最小边距
    
    const maxDisplayWidth = window.innerWidth - padding * 2;
    const maxDisplayHeight = window.innerHeight - topBarHeight - padding * 2;
    
    const aspectRatio = canvas.width / canvas.height;
    
    let displayWidth = maxDisplayWidth;
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > maxDisplayHeight) {
        displayHeight = maxDisplayHeight;
        displayWidth = displayHeight * aspectRatio;
    }
    
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // 调整游戏主区域的padding以适应顶部栏
    const gameMain = document.querySelector('.game-main');
    if (gameMain) {
        gameMain.style.paddingTop = topBarHeight + 'px';
    }
}

// 初始化时生成地图和调整尺寸
resizeCanvas();

// 窗口大小改变时重新生成地图
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        // 重新设置玩家和恶魔位置
        player.x = TILE_SIZE;
        player.y = TILE_SIZE;
        demons = [];
        demons.push(createDemon());
    }, 100);
});

// 游戏状态
let cameraX = 0;
let cameraY = 0;
let gameScore = 0;
let gameTime = 0;
let caughtCount = 0; // 抓到的恶魔数量
let gameStartTime = Date.now();

// 玩家对象（始终是神）
const player = {
    x: 3 * TILE_SIZE,
    y: 3 * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    direction: 'down',
    animFrame: 0,
    canMove: true,
    lastInput: null
};

// 恶魔对象数组
let demons = [];

// 移动输入
const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

// 摇杆控制
const joystick = {
    base: document.getElementById('joystickBase'),
    stick: document.getElementById('joystickStick'),
    baseRect: null,
    isActive: false,
    x: 0,
    y: 0,
    maxDistance: 35
};

// 地图将在resizeCanvas中动态生成

// 检查碰撞
function checkCollision(x, y, width, height) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileY < 0 || tileX >= MAP_WIDTH || tileY >= MAP_HEIGHT) {
        return true;
    }
    
    return map[tileY][tileX] === 1;
}

// 检查两个角色是否碰撞
function checkCharacterCollision(char1, char2) {
    return char1.x === char2.x && char1.y === char2.y;
}

// 获取随机可移动位置
function getRandomValidPosition(excludeX, excludeY) {
    const validPositions = [];
    
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (map[y][x] === 0) {
                const posX = x * TILE_SIZE;
                const posY = y * TILE_SIZE;
                // 确保不与玩家和其他恶魔位置重叠
                let isValid = true;
                if (posX === excludeX && posY === excludeY) {
                    isValid = false;
                }
                for (let demon of demons) {
                    if (posX === demon.x && posY === demon.y) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    validPositions.push({ x: posX, y: posY });
                }
            }
        }
    }
    
    if (validPositions.length > 0) {
        return validPositions[Math.floor(Math.random() * validPositions.length)];
    }
    
    return { x: 3 * TILE_SIZE, y: 3 * TILE_SIZE };
}

// 创建新恶魔
function createDemon() {
    const pos = getRandomValidPosition(player.x, player.y);
    return {
        x: pos.x,
        y: pos.y,
        width: TILE_SIZE,
        height: TILE_SIZE,
        direction: 'down',
        animFrame: 0,
        canMove: true,
        moveTimer: 0,
        lastDirection: null,
        id: Date.now() + Math.random() // 唯一ID
    };
}

// 更新UI显示
function updateUI() {
    document.getElementById('scoreDisplay').textContent = gameScore;
    document.getElementById('swapCount').textContent = caughtCount;
    
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.getElementById('timeDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 抓恶魔
function catchDemon(demon) {
    caughtCount++;
    
    // 计算分数：基础分数 + 难度奖励
    const basePoints = 10;
    const difficultyBonus = caughtCount * 5; // 抓的越多奖励越高
    const timeBonus = Math.floor(gameTime / 10);
    const points = basePoints + difficultyBonus + timeBonus;
    gameScore += points;
    
    // 移除被抓的恶魔
    const demonIndex = demons.findIndex(d => d.id === demon.id);
    if (demonIndex !== -1) {
        demons.splice(demonIndex, 1);
    }
    
    // 根据抓到的数量增加恶魔（抓的越多，恶魔越多，越难）
    // 每抓2个恶魔，增加1个新恶魔
    const targetDemonCount = 1 + Math.floor(caughtCount / 2);
    while (demons.length < targetDemonCount && demons.length < 8) { // 最多8个恶魔
        demons.push(createDemon());
    }
    
    updateUI();
}

// 检测输入方向
function getInputDirection() {
    if (keys.up && !keys.down && !keys.left && !keys.right) {
        return 'up';
    } else if (keys.down && !keys.up && !keys.left && !keys.right) {
        return 'down';
    } else if (keys.left && !keys.right && !keys.up && !keys.down) {
        return 'left';
    } else if (keys.right && !keys.left && !keys.up && !keys.down) {
        return 'right';
    }
    
    if (joystick.isActive) {
        const threshold = 20;
        if (Math.abs(joystick.x) > Math.abs(joystick.y)) {
            if (joystick.x > threshold) return 'right';
            if (joystick.x < -threshold) return 'left';
        } else {
            if (joystick.y > threshold) return 'down';
            if (joystick.y < -threshold) return 'up';
        }
    }
    
    return null;
}

// 移动角色到指定方向（格子移动）
function moveCharacter(character, direction) {
    if (!character.canMove) return false;
    
    let newX = character.x;
    let newY = character.y;
    
    switch(direction) {
        case 'up': newY -= TILE_SIZE; break;
        case 'down': newY += TILE_SIZE; break;
        case 'left': newX -= TILE_SIZE; break;
        case 'right': newX += TILE_SIZE; break;
    }
    
    if (!checkCollision(newX, newY, character.width, character.height)) {
        character.x = newX;
        character.y = newY;
        character.direction = direction;
        character.animFrame = (character.animFrame + 1) % 2;
        character.canMove = false;
        
        setTimeout(() => {
            character.canMove = true;
        }, 200);
        return true;
    }
    return false;
}

// 更新玩家位置
function updatePlayer() {
    const currentInput = getInputDirection();
    
    if (currentInput) {
        if (currentInput !== player.lastInput || player.canMove) {
            if (moveCharacter(player, currentInput)) {
                player.lastInput = currentInput;
            }
        }
    } else {
        player.lastInput = null;
        player.animFrame = 0;
    }
    
    cameraX = player.x - canvas.width / 2;
    cameraY = player.y - canvas.height / 2;
    
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH * TILE_SIZE - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT * TILE_SIZE - canvas.height));
}

// 检查方向是否可移动
function canMoveInDirection(character, direction) {
    let newX = character.x;
    let newY = character.y;
    
    switch(direction) {
        case 'up': newY -= TILE_SIZE; break;
        case 'down': newY += TILE_SIZE; break;
        case 'left': newX -= TILE_SIZE; break;
        case 'right': newX += TILE_SIZE; break;
    }
    
    return !checkCollision(newX, newY, character.width, character.height);
}

// 更新所有恶魔（AI逃跑逻辑，带难度递增）
function updateDemons() {
    demons.forEach(demon => {
        if (!demon.canMove) return;
        
        // 难度递增：抓的越多，恶魔移动越快
        const baseSpeed = 15;
        const difficultyMultiplier = Math.min(1 + Math.floor(caughtCount / 3), 4); // 每抓3个增加难度
        const moveInterval = Math.max(5, baseSpeed - difficultyMultiplier * 2);
        
        demon.moveTimer++;
        if (demon.moveTimer < moveInterval) return;
        demon.moveTimer = 0;
        
        // 计算到玩家的距离（恶魔要逃跑）
        const dx = player.x - demon.x;
        const dy = player.y - demon.y;
        
        const allDirections = ['up', 'down', 'left', 'right'];
        const validDirections = allDirections.filter(dir => canMoveInDirection(demon, dir));
        
        if (validDirections.length === 0) return;
        
        // 恶魔逃跑：选择远离玩家的方向
        let preferredDirections = [];
        if (Math.abs(dx) > Math.abs(dy)) {
            preferredDirections = dx > 0 ? ['left', 'up', 'down', 'right'] : ['right', 'up', 'down', 'left'];
        } else {
            preferredDirections = dy > 0 ? ['up', 'left', 'right', 'down'] : ['down', 'left', 'right', 'up'];
        }
        
        const validPreferred = preferredDirections.filter(dir => validDirections.includes(dir));
        
        let chosenDirection = null;
        
        if (validPreferred.length > 0) {
            const nonReverse = validPreferred.filter(dir => {
                if (!demon.lastDirection) return true;
                const reverseMap = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
                return dir !== reverseMap[demon.lastDirection];
            });
            
            chosenDirection = nonReverse.length > 0 ? nonReverse[0] : validPreferred[0];
        } else {
            const nonReverse = validDirections.filter(dir => {
                if (!demon.lastDirection) return true;
                const reverseMap = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
                return dir !== reverseMap[demon.lastDirection];
            });
            
            chosenDirection = nonReverse.length > 0 
                ? nonReverse[Math.floor(Math.random() * nonReverse.length)]
                : validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        if (chosenDirection) {
            if (moveCharacter(demon, chosenDirection)) {
                demon.lastDirection = chosenDirection;
            }
        }
    });
}

// 绘制地图
function drawMap() {
    const startTileX = Math.floor(cameraX / TILE_SIZE);
    const startTileY = Math.floor(cameraY / TILE_SIZE);
    const endTileX = Math.min(MAP_WIDTH, startTileX + Math.ceil(canvas.width / TILE_SIZE) + 1);
    const endTileY = Math.min(MAP_HEIGHT, startTileY + Math.ceil(canvas.height / TILE_SIZE) + 1);
    
    for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
            const screenX = x * TILE_SIZE - cameraX;
            const screenY = y * TILE_SIZE - cameraY;
            
            const tile = map[y][x];
            
            if (tile === 0) {
                // 空地（点阵风格）
                ctx.fillStyle = '#fff';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                
                // 点阵纹理
                ctx.fillStyle = '#ddd';
                for (let i = 0; i < 4; i++) {
                    const px = screenX + (i % 2) * 16;
                    const py = screenY + Math.floor(i / 2) * 16;
                    ctx.fillRect(px, py, 8, 8);
                }
            } else if (tile === 1) {
                // 墙
                ctx.fillStyle = '#000';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// 绘制恶魔（重新设计，更帅）
function drawDevil(x, y) {
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    
    // 身体（黑色，更修长）
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 9, screenY + 12, 14, 16);
    
    // 红色胸甲（V型设计）
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX + 11, screenY + 12, 10, 4);
    ctx.fillRect(screenX + 12, screenY + 14, 8, 2);
    // 红色肩甲
    ctx.fillRect(screenX + 9, screenY + 10, 4, 3);
    ctx.fillRect(screenX + 19, screenY + 10, 4, 3);
    
    // 头部（更圆润）
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 10, screenY + 6, 12, 8);
    
    // 两个弯曲的角（更帅的设计）
    ctx.fillStyle = '#000';
    // 左角 - 弯曲设计
    ctx.fillRect(screenX + 10, screenY + 2, 2, 6);
    ctx.fillRect(screenX + 9, screenY + 1, 4, 2);
    ctx.fillRect(screenX + 11, screenY, 2, 3);
    // 右角 - 弯曲设计
    ctx.fillRect(screenX + 20, screenY + 2, 2, 6);
    ctx.fillRect(screenX + 19, screenY + 1, 4, 2);
    ctx.fillRect(screenX + 19, screenY, 2, 3);
    
    // 红色眼睛（更大更亮）
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX + 11, screenY + 8, 5, 5);
    ctx.fillRect(screenX + 16, screenY + 8, 5, 5);
    // 眼睛高光（更明显）
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(screenX + 12, screenY + 9, 2, 2);
    ctx.fillRect(screenX + 17, screenY + 9, 2, 2);
    // 眼睛内部红色
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(screenX + 13, screenY + 10, 2, 2);
    ctx.fillRect(screenX + 18, screenY + 10, 2, 2);
    
    // 手臂（更粗壮，带红色装饰）
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 4, screenY + 13, 7, 11);
    ctx.fillRect(screenX + 21, screenY + 13, 7, 11);
    // 红色护腕（更宽）
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX + 4, screenY + 18, 7, 3);
    ctx.fillRect(screenX + 21, screenY + 18, 7, 3);
    // 红色肩部装饰
    ctx.fillRect(screenX + 5, screenY + 13, 5, 2);
    ctx.fillRect(screenX + 22, screenY + 13, 5, 2);
    
    // 脚（更大，带红色）
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 8, screenY + 26, 7, 5);
    ctx.fillRect(screenX + 17, screenY + 26, 7, 5);
    // 红色脚底
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX + 9, screenY + 29, 5, 2);
    ctx.fillRect(screenX + 18, screenY + 29, 5, 2);
    
    // 红色能量光晕（更强）
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fillRect(screenX + 6, screenY + 30, 20, 2);
    // 光晕边缘
    ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.fillRect(screenX + 4, screenY + 28, 24, 4);
}

// 绘制神（带金黄色光环）
function drawGod(x, y) {
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    
    // 金黄色光环光晕
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.fillRect(screenX + 4, screenY + 2, 24, 4);
    ctx.fillRect(screenX + 6, screenY, 20, 8);
    
    // 金黄色光环（头顶的圆环）
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX + 16, screenY + 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // 光环填充（金黄色）
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(screenX + 12, screenY, 8, 2);
    // 高光
    ctx.fillStyle = '#ffed4e';
    ctx.fillRect(screenX + 13, screenY - 1, 6, 1);
    
    // 身体（白色长袍，带金色装饰）
    ctx.fillStyle = '#fff';
    ctx.fillRect(screenX + 8, screenY + 10, 16, 18);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX + 8, screenY + 10, 16, 18);
    
    // 金色腰带
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(screenX + 8, screenY + 18, 16, 2);
    
    // 头部
    ctx.fillStyle = '#fff';
    ctx.fillRect(screenX + 10, screenY + 6, 12, 8);
    ctx.strokeRect(screenX + 10, screenY + 6, 12, 8);
    
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 11, screenY + 8, 3, 3);
    ctx.fillRect(screenX + 18, screenY + 8, 3, 3);
    
    // 手臂（白色长袖）
    ctx.fillStyle = '#fff';
    ctx.fillRect(screenX + 4, screenY + 12, 6, 10);
    ctx.fillRect(screenX + 22, screenY + 12, 6, 10);
    ctx.strokeRect(screenX + 4, screenY + 12, 6, 10);
    ctx.strokeRect(screenX + 22, screenY + 12, 6, 10);
    
    // 脚
    ctx.fillRect(screenX + 8, screenY + 26, 6, 4);
    ctx.fillRect(screenX + 18, screenY + 26, 6, 4);
    ctx.strokeRect(screenX + 8, screenY + 26, 6, 4);
    ctx.strokeRect(screenX + 18, screenY + 26, 6, 4);
    
    // 底部金黄色光晕
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(screenX + 6, screenY + 28, 20, 2);
}

// 绘制玩家（始终是神）
function drawPlayer() {
    drawGod(player.x, player.y);
}

// 绘制所有恶魔
function drawDemons() {
    demons.forEach(demon => {
        if (demon) {
            drawDevil(demon.x, demon.y);
        }
    });
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = false;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

// 摇杆事件
const joystickContainer = document.getElementById('joystickContainer');
let joystickCenterX = 0;
let joystickCenterY = 0;

function updateJoystickRect() {
    joystick.baseRect = joystick.base.getBoundingClientRect();
    joystickCenterX = joystick.baseRect.left + joystick.baseRect.width / 2;
    joystickCenterY = joystick.baseRect.top + joystick.baseRect.height / 2;
}

function handleJoystickStart(e) {
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // 将摇杆容器移动到触摸位置
    const baseSize = 120; // 摇杆基础大小
    const left = touchX - baseSize / 2;
    const top = touchY - baseSize / 2;
    
    joystickContainer.style.left = left + 'px';
    joystickContainer.style.top = top + 'px';
    joystickContainer.style.display = 'block';
    joystickContainer.classList.add('active');
    
    joystick.isActive = true;
    joystick.stick.classList.add('active');
    
    // 更新位置后重新计算rect
    setTimeout(() => {
        updateJoystickRect();
        handleJoystickMove(e);
    }, 0);
}

function handleJoystickMove(e) {
    if (!joystick.isActive) return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    
    // 使用初始中心点计算偏移
    const deltaX = touch.clientX - joystickCenterX;
    const deltaY = touch.clientY - joystickCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > joystick.maxDistance) {
        joystick.x = (deltaX / distance) * joystick.maxDistance;
        joystick.y = (deltaY / distance) * joystick.maxDistance;
    } else {
        joystick.x = deltaX;
        joystick.y = deltaY;
    }
    
    joystick.stick.style.transform = `translate(calc(-50% + ${joystick.x}px), calc(-50% + ${joystick.y}px))`;
}

function handleJoystickEnd(e) {
    e.preventDefault();
    joystick.isActive = false;
    joystick.x = 0;
    joystick.y = 0;
    joystick.stick.style.transform = 'translate(-50%, -50%)';
    joystick.stick.classList.remove('active');
    // 确保摇杆容器隐藏
    joystickContainer.classList.remove('active');
    joystickContainer.style.display = 'none';
}

// 摇杆事件监听 - 在canvas上监听触摸
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        handleJoystickStart(e);
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (joystick.isActive) {
        handleJoystickMove(e);
    }
});

canvas.addEventListener('touchend', handleJoystickEnd);
canvas.addEventListener('touchcancel', handleJoystickEnd);

// 鼠标支持（桌面端测试用）
canvas.addEventListener('mousedown', (e) => {
    handleJoystickStart(e);
    document.addEventListener('mousemove', handleJoystickMove);
    document.addEventListener('mouseup', () => {
        handleJoystickEnd(e);
        document.removeEventListener('mousemove', handleJoystickMove);
    });
});

// 游戏循环
let lastTimeUpdate = Date.now();

function gameLoop() {
    // 更新游戏时间
    const now = Date.now();
    if (now - lastTimeUpdate >= 1000) {
        gameTime = Math.floor((now - gameStartTime) / 1000);
        updateUI();
        lastTimeUpdate = now;
    }
    
    // 清空画布
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateDemons();
    
    // 检查玩家和所有恶魔的碰撞
    demons.forEach(demon => {
        if (checkCharacterCollision(player, demon)) {
            catchDemon(demon);
        }
    });
    
    drawMap();
    drawDemons();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
function initGame() {
    gameStartTime = Date.now();
    gameScore = 0;
    gameTime = 0;
    caughtCount = 0;
    demons = [];
    
    // 设置玩家初始位置（左上角通道）
    player.x = TILE_SIZE;
    player.y = TILE_SIZE;
    
    // 初始创建一个恶魔
    demons.push(createDemon());
    
    updateUI();
}

// 启动游戏循环
initGame();
gameLoop();
