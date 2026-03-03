# Claude Code 集成到 CI/CD 指南

本指南介绍如何将 Claude AI 的 headless mode 集成到 GitHub Actions CI/CD 流程中。

## 目录

- [前提条件](#前提条件)
- [配置步骤](#配置步骤)
- [集成方案](#集成方案)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

## 前提条件

1. **Anthropic API Key**
   - 访问 [Anthropic Console](https://console.anthropic.com/)
   - 创建 API Key
   - 记录 API Key（后续配置需要）

2. **GitHub 仓库**
   - 需要有 Actions 权限
   - 需要有设置 Secrets 的权限

## 配置步骤

### 1. 添加 API Key 到 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 配置：
   - Name: `ANTHROPIC_API_KEY`
   - Secret: 粘贴你的 Anthropic API Key
5. 点击 **Add secret**

### 2. 启用必要的权限

在仓库设置中：
1. **Settings** → **Actions** → **General**
2. 在 "Workflow permissions" 部分：
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

## 集成方案

本项目提供了两个 workflow 示例：

### 1. AI 代码审查（`ai-code-review.yml`）

**功能：** 当创建 PR 时，自动使用 Claude 进行代码审查

**触发条件：**
- Pull Request 被创建、更新或重新打开
- 目标分支是 `main` 或 `develop`

**工作流程：**
```
PR 创建 → 获取变更文件 → Claude 分析 → 发布审查评论
```

**特点：**
- 自动分析代码变更
- 识别潜在问题
- 提供改进建议
- 结果直接发布到 PR 评论

### 2. Headless Mode 演示（`claude-headless-demo.yml`）

**功能：** 展示多种方式在 CI 中使用 Claude

**包含示例：**
1. 使用 curl 直接调用 Claude API
2. 使用 Python SDK 与 Claude 交互
3. 自动化代码分析任务

**触发方式：**
- 推送到 `main` 分支
- 手动触发（workflow_dispatch）

## 使用示例

### 示例 1: 基本的 API 调用

```yaml
- name: Call Claude API
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    curl https://api.anthropic.com/v1/messages \
      --header "x-api-key: $ANTHROPIC_API_KEY" \
      --header "anthropic-version: 2023-06-01" \
      --header "content-type: application/json" \
      --data '{
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "messages": [{
          "role": "user",
          "content": "分析代码质量"
        }]
      }'
```

### 示例 2: 使用 Python SDK

```yaml
- name: Use Python SDK
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    pip install anthropic
    python << EOF
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ.get("ANTHROPIC_API_KEY")
    )

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": "分析这段代码"
        }]
    )

    print(message.content[0].text)
    EOF
```

### 示例 3: 使用 Node.js SDK

```yaml
- name: Use Node.js SDK
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    npm install @anthropic-ai/sdk
    node << EOF
    import Anthropic from "@anthropic-ai/sdk";

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: "分析代码质量"
      }],
    });

    console.log(message.content[0].text);
    EOF
```

## 最佳实践

### 1. 安全性

- ✅ **永远不要** 在代码中硬编码 API Key
- ✅ 使用 GitHub Secrets 存储敏感信息
- ✅ 定期轮换 API Key
- ✅ 使用最小权限原则

### 2. 成本控制

```yaml
# 设置 token 限制
- name: Call Claude with limits
  run: |
    # 限制 max_tokens 避免不必要的成本
    --data '{"max_tokens": 500}'

# 仅在特定条件下运行
- name: Conditional Claude review
  if: github.event.pull_request.changed_files < 10
```

### 3. 缓存和优化

```yaml
# 避免重复审查相同的代码
- name: Check if already reviewed
  run: |
    # 检查是否已经审查过此 commit
    # 使用缓存避免重复调用
```

### 4. 错误处理

```yaml
- name: Claude review with error handling
  continue-on-error: true  # 失败不阻塞整个 workflow
  run: |
    # 添加重试逻辑
    for i in {1..3}; do
      if claude_command; then
        break
      fi
      sleep 5
    done
```

### 5. 合理使用场景

**适合的场景：**
- ✅ PR 代码审查
- ✅ 自动生成文档
- ✅ 代码质量分析
- ✅ 测试用例生成
- ✅ 错误诊断和修复建议

**不适合的场景：**
- ❌ 每次 commit 都运行（成本高）
- ❌ 处理大量文件（超过 token 限制）
- ❌ 需要实时响应的场景
- ❌ 敏感代码分析（数据隐私考虑）

## 模型选择

根据不同需求选择合适的模型：

| 模型 | 适用场景 | Token 限制 | 成本 |
|------|---------|-----------|------|
| claude-3-5-sonnet | 复杂代码审查、深度分析 | 200K | 较高 |
| claude-3-haiku | 快速检查、简单任务 | 200K | 较低 |
| claude-3-opus | 最高质量的审查和分析 | 200K | 最高 |

## 常见问题

### Q: API Key 安全吗？

A: 只要正确使用 GitHub Secrets，API Key 是安全的。GitHub 会加密存储并在日志中自动隐藏。

### Q: 会产生多少费用？

A: 费用取决于使用频率和 token 数量。建议：
- 设置 max_tokens 限制
- 仅在需要时触发
- 使用合适的模型
- 监控 Anthropic Console 的使用量

### Q: 可以审查私有代码吗？

A: 技术上可以，但需要考虑：
- 你的组织是否允许将代码发送给第三方 API
- 是否符合数据隐私政策
- 建议查阅 Anthropic 的数据使用政策

### Q: Claude 会自动修改代码吗？

A: 不会。默认情况下，Claude 只提供建议。如果需要自动修改，需要额外实现代码应用逻辑。

## 高级用法

### 自动修复测试

```yaml
- name: Auto-fix failing tests
  if: failure()
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    # 获取测试错误
    # 使用 Claude 分析并生成修复建议
    # 可选：自动应用修复并重新运行测试
```

### 生成发布说明

```yaml
- name: Generate release notes
  run: |
    # 获取 commits 列表
    # 使用 Claude 生成友好的发布说明
    # 自动创建 GitHub Release
```

### 文档同步

```yaml
- name: Update documentation
  run: |
    # 检测代码变更
    # 使用 Claude 更新相关文档
    # 自动创建 PR 更新文档
```

## 资源链接

- [Anthropic API 文档](https://docs.anthropic.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Anthropic Console](https://console.anthropic.com/)
- [Python SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Node.js SDK](https://github.com/anthropics/anthropic-sdk-typescript)

## 贡献

欢迎提交 Issue 和 PR 来改进这些集成示例！
