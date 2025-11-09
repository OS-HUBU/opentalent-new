# OpenTalent: 开源人才评价与服务平台

## 项目简介

**OpenTalent** 是一个基于 Git 行为数据的开源人才评价与服务平台，旨在通过数据驱动的方式，客观、公正地评价开发者的开源贡献。我们希望通过透明、开放的评价体系，为开发者提供反馈，并帮助雇主发现和培养优质的开源人才。

## 功能特性

- **贡献分析**：基于 Git 数据，量化开发者在代码、文档、测试、治理、运营等方面的贡献。
- **开源影响力评分**：通过贡献的广度与深度，基于 OpenRank 算法评估开发者在开源项目中的影响力。
- **社区互动度**：分析开发者在开源社区中的活跃度，包括 issue、PR、讨论等互动行为。
- **定制化报告**：为开发者和企业提供详细的贡献与影响力报告，便于展示技能和发展职业生涯。
- **开源职业发展建议**：根据开发者的表现，提供个性化的职业发展建议和机会。

## 项目结构

```plaintext
opentalent-new/
├── .git/
├── .vercel/
├── bin/
├── html/
├── public/
├── src/
├── vite/
├── .env.development
├── .env.production
├── .env.staging
├── .gitignore
├── index.html
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
├── vite.config.js.timestamp-1755273080921-2a5b193c5d3e8.mjs
└── vite.config.js.timestamp-1760684179422-8d1f94bcd2c7f.mjs
```


## 安装与使用

### 1. 克隆项目

```bash
git clone https://github.com/OS-HUBU/opentalent-new
cd opentalent-new
```

## 安装运行步骤

### 1.项目初始化

安装项目所需的全部依赖包，首次运行项目或拉取代码后需要执行
```bash
npm install
```
### 2.启动开发环境
启动本地开发服务器，支持热更新，便于开发调试。
```bash
npm run dev
```

### 3.打包生产环境代码

将项目编译并压缩为可部署的生产版本，生成在 dist/ 目录下。
```bash
 npm run build:prod
```

### 自定义配置
如果需要修改默认构建行为（如端口、路径别名、代理转发等），可编辑根目录下的 vite.config.js 文件。

## 贡献指南

我们欢迎任何形式的贡献！您可以通过以下方式参与：

1. 提交 Issue 来报告错误或建议新功能。
2. 提交 Pull Request 来修复问题或添加新功能。
3. 提交文档改进或翻译。

### 开发流程

1. Fork 该仓库。
2. 创建您的功能分支：`git checkout -b feature/your-feature-name`。
3. 提交您的更改：`git commit -m 'Add some feature'`。
4. Push 到远程仓库：`git push origin feature/your-feature-name`。
5. 创建一个 Pull Request。

## 许可证

本项目基于 [木兰宽松](http://license.coscl.org.cn/MulanPSL2) 开源许可。

## 联系我们

如果您有任何问题或建议，请通过以下方式联系我们：

- 项目主页：https://github.com/OS-HUBU/opentalent-new
- 邮箱：646144127@qq.com

## 支持团队

团队负责人：雷永琪	联系方式：646144127@qq.com

团队成员：
