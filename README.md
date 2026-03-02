# CI/CD 示例项目

一个用于学习 GitHub Actions CI/CD 的 Node.js 示例项目。

![CI Status](https://github.com/YOUR_USERNAME/CI-CD/workflows/CI/badge.svg)

## 项目简介

这是一个简单的计算器应用，演示了完整的 CI/CD 流程：
- ✅ 自动化测试
- ✅ 代码质量检查
- ✅ 多版本兼容性测试
- ✅ 自动部署

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm

### 安装依赖

```bash
npm install
```

### 运行应用

```bash
npm start
```

### 运行测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## CI/CD 工作流程

本项目使用 GitHub Actions 实现 CI/CD，配置文件位于 `.github/workflows/ci.yml`。

### 触发条件

- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交 Pull Request

### 工作流程包含三个任务：

#### 1. Build and Test（构建和测试）
- 在 Node.js 18.x 和 20.x 上运行
- 安装依赖
- 运行应用
- 执行单元测试
- 生成测试覆盖率报告

#### 2. Code Quality Check（代码质量检查）
- 运行代码检查工具
- 执行安全审计
- 验证 package.json

#### 3. Deploy（部署）
- 仅在 `main` 分支执行
- 依赖前两个任务成功完成
- 模拟生产环境部署

## 项目结构

```
CI-CD/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions 工作流配置
├── src/
│   ├── calculator.js       # 计算器核心逻辑
│   └── index.js           # 应用入口
├── tests/
│   └── calculator.test.js  # 单元测试
├── package.json            # 项目配置
├── jest.config.js          # Jest 测试配置
└── README.md              # 项目文档
```

## 如何推送到 GitHub

### 方法一：使用已有仓库

如果你已经在 GitHub 上创建了仓库，执行以下命令：

```bash
# 添加所有文件到 Git
git add .

# 提交更改
git commit -m "Initial commit: Add CI/CD demo project"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/CI-CD.git

# 推送到 GitHub
git push -u origin main
```

### 方法二：创建新仓库

1. 访问 [GitHub](https://github.com/new) 创建新仓库
2. 仓库名称填写：`CI-CD`
3. 不要初始化 README、.gitignore 或 license
4. 创建后，按照页面提示执行命令

## 查看 CI/CD 运行结果

推送代码后：

1. 访问你的 GitHub 仓库
2. 点击顶部的 "Actions" 标签
3. 你会看到工作流的运行状态
4. 点击具体的运行记录查看详细日志

## 学习要点

通过这个项目，你可以学习到：

1. **GitHub Actions 基础**
   - 工作流配置语法
   - 触发条件设置
   - 环境变量使用

2. **CI/CD 最佳实践**
   - 自动化测试
   - 多版本兼容性测试
   - 代码质量检查
   - 条件部署

3. **任务依赖和并行执行**
   - 并行执行加快流程
   - 任务依赖确保顺序

## 扩展建议

你可以尝试：

- ✏️ 修改代码触发 CI/CD
- 🔧 添加更多测试用例
- 🚀 配置真实的部署目标
- 📊 集成代码覆盖率服务
- 🔐 添加环境变量和密钥管理

## 许可证

MIT
