# Kimi API 集成到 CI/CD 指南

本指南介绍如何将 Kimi AI（月之暗面 Moonshot AI）集成到 GitHub Actions CI/CD 流程中。

## 目录

- [为什么选择 Kimi API](#为什么选择-kimi-api)
- [前提条件](#前提条件)
- [配置步骤](#配置步骤)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

## 为什么选择 Kimi API

### 优势对比

| 特性 | Kimi API | Claude API | 其他LLM |
|------|----------|-----------|---------|
| **中文支持** | ✅ 优秀 | ✅ 良好 | ⚠️ 一般 |
| **国内访问** | ✅ 快速稳定 | ⚠️ 需要代理 | ⚠️ 不稳定 |
| **上下文长度** | 128K tokens | 200K tokens | 4K-32K |
| **API 兼容性** | ✅ OpenAI 格式 | ❌ 专有格式 | 部分兼容 |
| **价格** | 💰 适中 | 💰 较高 | 💰 便宜 |
| **代码理解** | ✅ 强 | ✅ 很强 | ⚠️ 中等 |

### 适用场景

✅ **推荐使用 Kimi API：**
- 国内部署的 CI/CD 环境
- 中文代码或文档项目
- 需要长上下文的分析任务
- 预算有限的项目

⚠️ **考虑其他方案：**
- 极度敏感的代码（使用自托管 LLM）
- 需要最高质量分析（可能选 Claude）
- 海外部署环境（网络延迟考虑）

## 前提条件

### 1. 获取 Kimi API Key

1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn/)
2. 注册账号并登录
3. 进入 **API Keys** 页面
4. 点击 **创建新的 API Key**
5. 复制并保存 API Key（格式类似：`sk-...`）

### 2. 了解定价

**Kimi API 定价（2024）：**

| 模型 | 上下文长度 | 输入价格 | 输出价格 |
|------|-----------|---------|---------|
| moonshot-v1-8k | 8K tokens | ¥0.012/千tokens | ¥0.012/千tokens |
| moonshot-v1-32k | 32K tokens | ¥0.024/千tokens | ¥0.024/千tokens |
| moonshot-v1-128k | 128K tokens | ¥0.06/千tokens | ¥0.06/千tokens |

**成本估算：**
- 小型 PR 审查（< 5 文件）：约 ¥0.01-0.05
- 中型 PR 审查（5-15 文件）：约 ¥0.05-0.15
- 大型 PR 审查（> 15 文件）：约 ¥0.15-0.50
- 固件分析（单次）：约 ¥0.10-1.00

## 配置步骤

### 步骤 1: 添加 API Key 到 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 配置：
   - Name: `KIMI_API_KEY`
   - Secret: 粘贴你的 Kimi API Key
5. 点击 **Add secret**

### 步骤 2: 启用 GitHub Actions 权限

1. **Settings** → **Actions** → **General**
2. 在 "Workflow permissions" 部分：
   - 选择 **"Read and write permissions"**
   - 勾选 **"Allow GitHub Actions to create and approve pull requests"**

### 步骤 3: 推送代码触发工作流

```bash
# 提交代码
git add .
git commit -m "Add Kimi AI integration"
git push origin main

# 创建 PR 测试自动审查
git checkout -b test-feature
# 修改一些代码
git commit -am "Test feature"
git push origin test-feature
# 在 GitHub 上创建 PR，Kimi 会自动审查
```

## 使用示例

### 示例 1: Python 中使用 Kimi API

```python
from openai import OpenAI

# 配置 Kimi API
client = OpenAI(
    api_key="your-kimi-api-key",
    base_url="https://api.moonshot.cn/v1"
)

# 代码审查示例
response = client.chat.completions.create(
    model="moonshot-v1-32k",
    messages=[
        {
            "role": "system",
            "content": "你是一位经验丰富的代码审查专家"
        },
        {
            "role": "user",
            "content": "请审查以下代码：\n\n```python\n...\n```"
        }
    ],
    temperature=0.3,
    max_tokens=2000
)

print(response.choices[0].message.content)
```

### 示例 2: Node.js 中使用 Kimi API

```javascript
import OpenAI from "openai";

// 配置 Kimi API
const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
});

// 代码分析
const response = await client.chat.completions.create({
  model: "moonshot-v1-32k",
  messages: [
    {
      role: "system",
      content: "你是一个代码质量分析助手",
    },
    {
      role: "user",
      content: "分析这段代码的质量...",
    },
  ],
  temperature: 0.3,
  max_tokens: 2000,
});

console.log(response.choices[0].message.content);
```

### 示例 3: curl 命令行调用

```bash
curl https://api.moonshot.cn/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [
      {
        "role": "user",
        "content": "什么是 CI/CD？"
      }
    ],
    "temperature": 0.3
  }'
```

## 最佳实践

### 1. 模型选择

```python
# 根据任务选择合适的模型

# 快速代码审查（< 2000 tokens）
model = "moonshot-v1-8k"  # 最经济

# 标准 PR 审查（< 8000 tokens）
model = "moonshot-v1-32k"  # 平衡性价比

# 大型文件或完整项目分析
model = "moonshot-v1-128k"  # 适合长上下文
```

### 2. 成本控制

```yaml
# 在 workflow 中限制token使用
- name: Code review with budget control
  run: |
    python << EOF
    response = client.chat.completions.create(
        model="moonshot-v1-8k",  # 使用最小模型
        max_tokens=1000,  # 限制输出长度
        temperature=0.3,  # 降低随机性
        messages=[...]
    )
    EOF
```

### 3. 错误处理

```python
from openai import OpenAI, OpenAIError
import time

def call_kimi_with_retry(client, **kwargs):
    """带重试的 Kimi API 调用"""
    max_retries = 3

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(**kwargs)
            return response
        except OpenAIError as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数退避
                print(f"请求失败，{wait_time}秒后重试: {e}")
                time.sleep(wait_time)
            else:
                raise
```

### 4. 缓存结果

```python
import hashlib
import json
import os

def get_cached_or_analyze(code, cache_dir="./cache"):
    """使用缓存避免重复分析"""
    # 计算代码哈希
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    cache_file = f"{cache_dir}/{code_hash}.json"

    # 检查缓存
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)

    # 调用 API
    response = client.chat.completions.create(...)
    result = response.choices[0].message.content

    # 保存缓存
    os.makedirs(cache_dir, exist_ok=True)
    with open(cache_file, 'w') as f:
        json.dump(result, f)

    return result
```

### 5. 并发控制

```python
import asyncio
from openai import AsyncOpenAI

async def analyze_files_concurrently(files):
    """并发分析多个文件"""
    client = AsyncOpenAI(
        api_key=os.environ.get("KIMI_API_KEY"),
        base_url="https://api.moonshot.cn/v1"
    )

    async def analyze_file(file):
        response = await client.chat.completions.create(
            model="moonshot-v1-8k",
            messages=[{"role": "user", "content": f"分析: {file}"}]
        )
        return response.choices[0].message.content

    # 并发但限制同时请求数
    tasks = [analyze_file(f) for f in files]
    results = await asyncio.gather(*tasks)
    return results
```

## 集成到 CI/CD

本项目提供了三个 workflow 示例：

### 1. AI 代码审查 (`ai-code-review.yml`)

**功能：** PR 自动审查
**触发：** Pull Request 创建或更新
**使用：**
```yaml
# 自动触发，无需手动操作
# 在 PR 页面查看 Kimi 的审查评论
```

### 2. Headless 演示 (`claude-headless-demo.yml`)

**功能：** 展示多种 Kimi API 使用方式
**触发：** 推送到 main 分支或手动触发
**使用：**
```bash
# 手动触发
gh workflow run "Kimi Headless Demo"
```

### 3. 固件分析 (`firmware-analysis.yml`)

**功能：** 自动化固件安全分析
**触发：** 固件文件上传或手动触发
**使用：**
```bash
# 上传固件到 firmware/ 目录
cp your-firmware.bin firmware/
git add firmware/
git commit -m "Add firmware for analysis"
git push
```

## 常见问题

### Q: Kimi API 和 Claude API 哪个更好？

A: 取决于场景：
- **中文项目 + 国内部署** → Kimi API
- **需要最高质量** → Claude API
- **预算有限** → Kimi API
- **极度敏感** → 自托管 LLM

### Q: API Key 安全吗？

A: 通过 GitHub Secrets 存储是安全的：
- ✅ 加密存储
- ✅ 日志自动隐藏
- ✅ 仅授权 workflow 可访问

### Q: 如何控制成本？

A: 三个方法：
1. 使用小模型（moonshot-v1-8k）
2. 限制 max_tokens
3. 仅在重要时刻触发（如 PR 而非每次 commit）

### Q: 国外服务器能用吗？

A: 可以，但可能：
- ⚠️ 延迟稍高
- ⚠️ 需要确保网络可达 api.moonshot.cn

### Q: 支持哪些编程语言？

A: Kimi API 理解所有主流编程语言：
- Python, JavaScript/TypeScript, Java, C/C++, Go, Rust
- PHP, Ruby, Swift, Kotlin, C#等

## 资源链接

- [Kimi API 官方文档](https://platform.moonshot.cn/docs)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [本项目示例代码](/)

## 技术支持

遇到问题？
1. 查看 [Actions 运行日志](../../actions)
2. 检查 [Issues](../../issues)
3. 参考 [官方文档](https://platform.moonshot.cn/docs)

## 总结

Kimi API 集成到 CI/CD 的优势：

✅ **简单易用** - OpenAI 兼容格式
✅ **国内友好** - 无需代理，速度快
✅ **成本可控** - 按需付费，价格透明
✅ **中文优秀** - 特别适合中文项目
✅ **长上下文** - 最高支持 128K tokens

立即开始使用 Kimi API 提升你的 CI/CD 流程！
