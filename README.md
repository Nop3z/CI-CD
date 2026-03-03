# CI/CD 示例项目

一个用于学习 GitHub Actions CI/CD 的 Node.js 示例项目。

![CI Status](https://github.com/YOUR_USERNAME/CI-CD/workflows/CI/badge.svg)

## 项目简介

这是一个简单的计算器应用，演示了完整的 CI/CD 流程：

- ✅ 自动化测试
- ✅ 代码质量检查
- ✅ 多版本兼容性测试
- ✅ 自动部署
- 🤖 **Kimi AI 集成** - 自动代码审查和智能分析

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

```text
CI-CD/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # 主 CI/CD 工作流
│       ├── ai-code-review.yml        # AI 代码审查工作流（Kimi）
│       ├── claude-headless-demo.yml  # Kimi headless 演示
│       └── firmware-analysis.yml     # 固件分析工作流（Kimi）
├── src/
│   ├── calculator.js       # 计算器核心逻辑
│   └── index.js           # 应用入口
├── tests/
│   └── calculator.test.js  # 单元测试
├── package.json            # 项目配置
├── jest.config.js          # Jest 测试配置
├── KIMI_API_INTEGRATION.md # Kimi AI 集成指南（新）
├── CLAUDE_CI_INTEGRATION.md  # Claude AI 集成指南（参考）
├── FIRMWARE_REVERSE_ENGINEERING_CICD.md  # 固件逆向指南
├── SELF_HOSTED_RUNNER_SETUP.md  # 自托管 Runner 配置
└── README.md              # 项目文档
```

## 🤖 Kimi AI 集成

本项目展示了如何将 Kimi AI（月之暗面）的 API 集成到 CI/CD 流程中。

### 功能特性

**1. 自动代码审查** (`ai-code-review.yml`)
- 当创建 Pull Request 时自动触发
- 使用 Kimi AI 分析代码变更
- 识别潜在问题和安全隐患
- 提供改进建议和最佳实践
- 审查结果自动发布到 PR 评论

**2. Headless Mode 演示** (`claude-headless-demo.yml`)
- 展示三种集成方式：curl、Python SDK、Node.js SDK
- 自动化代码分析任务
- 对比不同 Kimi 模型性能
- 可手动触发或推送时执行

### 快速配置

1. **获取 Kimi API Key**
   - 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn/)
   - 注册并创建 API Key

2. **配置 GitHub Secrets**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加 Secret：`KIMI_API_KEY`

3. **启用权限**
   - Settings → Actions → General
   - 选择 "Read and write permissions"

4. **推送代码触发工作流**
   - 创建 PR 查看自动代码审查
   - 推送到 main 分支查看演示

### 详细文档

完整的配置和使用说明，请查看 [KIMI_API_INTEGRATION.md](KIMI_API_INTEGRATION.md)

### 使用场景

- ✅ Pull Request 自动代码审查
- ✅ 代码质量分析和改进建议
- ✅ 自动生成和更新文档
- ✅ 测试失败时的智能诊断
- ✅ 安全漏洞检测和修复建议

### Kimi API 优势

- 🚀 **国内访问快** - 无需代理，低延迟
- 🇨🇳 **中文支持优秀** - 特别适合中文项目
- 💰 **性价比高** - 按需付费，价格透明
- 📚 **长上下文** - 支持 8K/32K/128K tokens
- 🔌 **OpenAI 兼容** - 易于集成和迁移

## 🔬 固件逆向工程自动化

**新增功能：** 本项目还展示了如何将固件逆向分析（IDA Pro + Kimi AI）集成到 CI/CD 流程中。

### 核心能力

- **自动化固件分析**：新固件版本自动触发分析
- **IDA Pro 集成**：通过 MCP (Model Context Protocol) 与 IDA Pro 交互
- **智能分析**：Kimi AI 执行深度安全分析
- **安全评估**：自动生成漏洞报告和风险评分
- **持续监控**：跟踪固件变化，检测新增漏洞

### 使用场景

```text
场景 1: 供应商固件监控
新固件发布 → 自动下载 → IDA分析 → Kimi评估 → 生成报告

场景 2: 内部开发CI/CD
代码提交 → 构建固件 → 自动分析 → 发现问题 → 立即告警

场景 3: 安全研究
固件收集 → 批量分析 → 漏洞发现 → 知识库构建
```

### 详细文档

- **[固件逆向 CI/CD 完整指南](FIRMWARE_REVERSE_ENGINEERING_CICD.md)** - 概念、架构和实施方案
- **[自托管 Runner 配置](SELF_HOSTED_RUNNER_SETUP.md)** - 安全环境搭建
- **[固件分析 Workflow](.github/workflows/firmware-analysis.yml)** - 实际可用的 GitHub Actions 配置

### 安全考虑

⚠️ **重要**：固件逆向涉及敏感数据，需要：
- 使用自托管 Runner（不要上传固件到云端）
- 配置网络隔离
- 数据脱敏处理
- 符合组织安全政策
- 遵守 IDA Pro 许可协议



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
