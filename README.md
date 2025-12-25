# Don't Play God

一个像素风格的静态网页游戏，主题为"Don't Play God"。

## 游戏说明

这是一个简单的像素风格飞行游戏：
- 点击屏幕或按空格键让角色跳跃
- 躲避障碍物
- 收集星星获得额外分数
- 尽可能获得高分！

## 功能特点

- 🎮 像素风格设计
- 📱 响应式布局，支持手机和电脑
- 🎯 简单易上手的游戏机制
- 💾 本地存储最高分记录
- ✨ 流畅的游戏体验

## 部署到 GitHub Pages

### 方法一：通过 GitHub 网页界面

1. 在 GitHub 上创建一个新仓库（例如：`dontplaygod`）
2. 将所有文件上传到仓库
3. 进入仓库的 Settings（设置）
4. 在左侧菜单找到 Pages
5. 在 Source 下选择 `main` 分支（或 `master` 分支）
6. 点击 Save
7. 等待几分钟，GitHub 会提供一个网址，格式为：`https://你的用户名.github.io/dontplaygod`

### 方法二：通过 Git 命令行

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Don't Play God game"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/dontplaygod.git

# 推送到 GitHub
git push -u origin main
```

然后在 GitHub 仓库设置中启用 Pages（参考方法一的步骤 3-7）。

## 文件结构

```
dontplaygod/
├── index.html      # 主页面
├── style.css       # 样式文件
├── game.js         # 游戏逻辑
└── README.md       # 说明文档
```

## 技术栈

- HTML5
- CSS3（响应式设计）
- JavaScript（Canvas API）
- Google Fonts（Press Start 2P 像素字体）

## 浏览器支持

支持所有现代浏览器：
- Chrome
- Firefox
- Safari
- Edge

## 许可证

MIT License

