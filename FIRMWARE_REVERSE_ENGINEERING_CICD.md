# 固件逆向分析 CI/CD 集成方案

## 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [安全考虑](#安全考虑)
- [实施方案](#实施方案)
- [示例代码](#示例代码)

## 概述

### 什么是固件逆向自动化？

将 Claude + IDA Pro MCP 集成到 CI/CD，实现：

1. **自动化触发**：新固件版本发布时自动开始分析
2. **自动化分析**：使用 IDA Pro 自动加载和分析固件
3. **智能分析**：Claude 通过 MCP 与 IDA Pro 交互，进行深度分析
4. **自动报告**：生成详细的分析报告和安全评估
5. **持续监控**：跟踪固件变化，检测新增漏洞

### 为什么要自动化？

**场景示例：**

```
场景 1: 供应商固件更新监控
├── 每周供应商发布新固件版本
├── 需要快速评估安全性
├── 手动分析耗时 2-3 天
└── 自动化后：30 分钟内获得初步报告

场景 2: 内部固件开发
├── 开发团队每天提交新版本
├── 需要持续安全检查
├── CI/CD 自动分析每个版本
└── 发现问题立即告警

场景 3: 漏洞研究
├── 跟踪特定固件家族
├── 自动对比不同版本
├── 识别安全补丁和新漏洞
└── 建立知识库
```

## 架构设计

### 方案 A: 自托管 Runner（推荐用于敏感固件）

```
┌─────────────────────────────────────────────────────┐
│  GitHub/GitLab                                      │
│  ├── 触发器: 新固件上传                            │
│  └── 调度: 定期检查供应商网站                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Self-Hosted Runner（内网服务器）                  │
│  ├── IDA Pro（已授权）                             │
│  ├── Claude Code CLI                               │
│  ├── IDA Pro MCP Server                            │
│  └── 固件存储（隔离环境）                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  分析流程                                           │
│  1. 下载/接收固件文件                              │
│  2. IDA Pro 自动加载固件                           │
│  3. Claude 通过 MCP 与 IDA 交互                    │
│  4. 执行预定义分析任务                             │
│  5. 生成结构化报告                                 │
│  6. 上传结果（可选：发送告警）                     │
└─────────────────────────────────────────────────────┘
```

**优点：**
- ✅ 固件不离开内网
- ✅ 完全控制 IDA Pro 环境
- ✅ 可处理大型固件文件
- ✅ 符合安全合规要求

**缺点：**
- ⚠️ 需要维护自己的服务器
- ⚠️ IDA Pro 许可证成本

### 方案 B: 混合架构（部分敏感 + 部分云端）

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions（云端）                            │
│  ├── 基础检查：文件格式、签名验证                  │
│  ├── 元数据提取                                    │
│  └── 触发自托管分析                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Self-Hosted Runner（敏感分析）                    │
│  ├── IDA Pro 深度分析                              │
│  ├── Claude MCP 交互                               │
│  └── 生成加密报告                                  │
└─────────────────────────────────────────────────────┘
```

## 安全考虑

### ⚠️ 关键安全问题

#### 1. 固件敏感性评估

**问题：** 固件可能包含：
- 专有代码和算法
- 加密密钥
- 商业机密
- 未公开的漏洞

**解决方案：**

```yaml
# 分级处理
敏感固件（Level 3）:
  ├── 仅在隔离内网环境分析
  ├── 不发送任何数据到外部 API
  └── 使用本地 LLM（如有）

中等敏感（Level 2）:
  ├── 在自托管 Runner 分析
  ├── 可使用 Claude API，但需数据脱敏
  └── 分析结果加密存储

公开固件（Level 1）:
  ├── 可使用云端 Runner
  └── 可使用 Claude API
```

#### 2. API Key 和凭证管理

```yaml
# 使用 GitHub Secrets 管理敏感信息
secrets:
  ANTHROPIC_API_KEY: "sk-ant-..."      # Claude API Key
  IDA_LICENSE: "XXXX-XXXX-XXXX"         # IDA Pro 许可证
  FIRMWARE_STORAGE_KEY: "..."           # 固件存储访问密钥
  SLACK_WEBHOOK: "https://..."          # 告警通知
```

#### 3. 数据隐私

**Claude API 数据使用政策：**
- Anthropic 声明不会使用 API 数据训练模型
- 但数据仍会发送到外部服务器
- 需要评估组织的数据政策

**建议：**

```python
# 数据脱敏示例
def sanitize_for_claude(binary_data):
    """脱敏敏感信息后再发送给 Claude"""
    # 移除硬编码的密钥、URL、IP 地址等
    # 只发送结构化信息，不发送原始二进制
    return {
        "functions": extract_function_list(),
        "imports": extract_imports(),
        "strings": filter_sensitive_strings(),
        "control_flow": extract_cfg_summary()
    }
```

#### 4. 网络隔离

```
内网环境（推荐）:
┌────────────────────────────────────┐
│  分析服务器（无外网访问）          │
│  ├── IDA Pro                       │
│  ├── 本地 Claude API（如可用）    │
│  └── 结果输出到安全存储            │
└────────────────────────────────────┘

外网环境（需审批）:
┌────────────────────────────────────┐
│  分析服务器                        │
│  ├── 出站连接仅限 Anthropic API   │
│  ├── 日志记录所有外发数据          │
│  └── DLP（数据泄露防护）           │
└────────────────────────────────────┘
```

## 实施方案

### 方案 1: 完全自动化（适合内部开发）

**触发条件：**
- 新固件推送到仓库
- 每日定时检查供应商网站
- 手动触发分析

**工作流程：**

```
1. 触发
   ├── Git push（新固件文件）
   ├── Webhook（外部固件更新）
   └── Schedule（定时扫描）

2. 预处理
   ├── 验证固件签名
   ├── 提取元数据（版本、型号等）
   └── 检查是否已分析过

3. IDA Pro 分析
   ├── 自动识别架构（ARM/x86/MIPS等）
   ├── 加载固件到 IDA
   ├── 等待自动分析完成
   └── 启动 MCP Server

4. Claude 智能分析
   ├── 连接 IDA Pro MCP
   ├── 执行分析任务清单
   │   ├── 查找危险函数
   │   ├── 分析加密实现
   │   ├── 检测缓冲区溢出
   │   ├── 识别后门代码
   │   └── 对比上一版本
   └── 生成发现列表

5. 报告生成
   ├── Markdown 报告
   ├── JSON 结构化数据
   ├── PDF（可选）
   └── 安全评分

6. 后续动作
   ├── 上传报告到存储
   ├── 发送告警（如发现高危漏洞）
   ├── 创建 Issue（如果需要人工审查）
   └── 更新知识库
```

### 方案 2: 半自动化（适合敏感固件）

**人工参与点：**

```
1. 固件上传 → 需要审批
2. 开始分析 → 手动触发
3. Claude 分析 → 人工确认每个步骤
4. 报告分发 → 需要审批
```

### 方案 3: 交互式分析（研究场景）

**特点：**
- 分析师可以实时介入
- Claude 提供建议，人工决策
- 适合深度漏洞研究

## 示例代码

### 分析任务清单模板

```yaml
# firmware_analysis_tasks.yml
analysis_tasks:
  - name: "架构识别"
    priority: critical
    prompt: |
      识别此固件的目标架构（ARM/MIPS/x86等）和字节序。
      提供依据和置信度。

  - name: "入口点分析"
    priority: high
    prompt: |
      找到固件的入口点（entry point）。
      分析启动流程，识别初始化代码。

  - name: "危险函数检测"
    priority: critical
    prompt: |
      搜索以下危险函数的使用：
      - strcpy, sprintf, gets（缓冲区溢出风险）
      - system, exec（命令注入风险）
      - memcpy 的不安全使用

      对于每个发现，提供：
      1. 函数地址
      2. 调用上下文
      3. 风险评估
      4. 建议的修复方案

  - name: "加密分析"
    priority: high
    prompt: |
      识别固件中的加密实现：
      1. 查找加密常量（AES S-box, RSA 指数等）
      2. 识别加密算法
      3. 检查是否使用弱加密
      4. 查找硬编码的密钥

  - name: "字符串分析"
    priority: medium
    prompt: |
      提取并分析有趣的字符串：
      - URL 和 IP 地址
      - 文件路径
      - 调试信息
      - 错误消息
      - 可能的命令和配置

  - name: "网络通信"
    priority: high
    prompt: |
      识别网络相关功能：
      1. Socket 创建和连接
      2. HTTP/HTTPS 通信
      3. 远程命令执行
      4. 数据传输和协议

  - name: "后门检测"
    priority: critical
    prompt: |
      查找潜在的后门：
      1. 隐藏的网络监听
      2. 未文档化的管理接口
      3. 硬编码的凭证
      4. 可疑的代码分支

  - name: "版本对比"
    priority: medium
    condition: "has_previous_version"
    prompt: |
      对比当前版本与上一版本：
      1. 新增函数
      2. 移除函数
      3. 修改的函数
      4. 可能的安全补丁
      5. 新引入的问题

  - name: "漏洞评估"
    priority: critical
    prompt: |
      基于以上所有分析，提供：
      1. 发现的漏洞列表（CVE 级别评估）
      2. 利用难度评估
      3. 影响范围
      4. 修复优先级
      5. 详细的技术报告

reporting:
  format: ["markdown", "json", "html"]
  include_screenshots: true
  include_code_snippets: true
  severity_levels: ["critical", "high", "medium", "low", "info"]
```

### Python 自动化脚本框架

```python
#!/usr/bin/env python3
"""
固件自动化分析脚本
用于 CI/CD 环境
"""

import os
import json
import subprocess
from pathlib import Path
from anthropic import Anthropic

class FirmwareAnalyzer:
    def __init__(self, firmware_path, output_dir):
        self.firmware_path = Path(firmware_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # 初始化 Claude
        self.claude = Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

    def start_ida_with_mcp(self):
        """启动 IDA Pro 并启用 MCP Server"""
        print(f"[*] 启动 IDA Pro 分析: {self.firmware_path}")

        # IDA Pro headless 模式
        # 注意：实际命令可能需要根据你的 IDA 安装调整
        ida_script = self.output_dir / "ida_startup.py"

        # 生成 IDA 启动脚本
        with open(ida_script, 'w') as f:
            f.write("""
import idaapi
import idc

# 等待自动分析完成
idaapi.auto_wait()

print("[IDA] 自动分析完成")

# 启动 MCP Server
# （这里需要你的 IDA MCP Server 启动代码）

# 保持 IDA 运行，等待 MCP 连接
import time
while True:
    time.sleep(1)
""")

        # 启动 IDA（headless）
        cmd = [
            "idat64",  # 或 idat（32位）
            "-A",  # 自动分析
            "-S" + str(ida_script),  # 运行脚本
            str(self.firmware_path)
        ]

        self.ida_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # 等待 IDA 就绪
        import time
        time.sleep(10)  # 根据固件大小调整

        print("[*] IDA Pro 已就绪")
        return True

    def run_claude_analysis(self, tasks):
        """使用 Claude + MCP 执行分析任务"""
        results = []

        for task in tasks:
            print(f"[*] 执行任务: {task['name']}")

            # 通过 MCP 与 IDA 交互
            # 注意：这里简化了 MCP 调用，实际需要使用 MCP 协议
            response = self.claude.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": f"""
你正在分析固件: {self.firmware_path.name}

通过 IDA Pro MCP，你可以：
- 列出所有函数
- 反汇编特定地址
- 搜索字符串和模式
- 分析控制流图

任务: {task['prompt']}

请提供详细的分析结果。
"""
                }]
            )

            result = {
                "task": task['name'],
                "priority": task['priority'],
                "findings": response.content[0].text
            }
            results.append(result)

            # 保存中间结果
            with open(self.output_dir / f"{task['name']}.json", 'w') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)

        return results

    def generate_report(self, results):
        """生成分析报告"""
        report_md = self.output_dir / "analysis_report.md"

        with open(report_md, 'w') as f:
            f.write(f"# 固件分析报告\n\n")
            f.write(f"**固件文件:** {self.firmware_path.name}\n")
            f.write(f"**分析时间:** {datetime.now().isoformat()}\n\n")

            f.write("## 执行摘要\n\n")

            # 统计关键发现
            critical_count = sum(1 for r in results if 'critical' in r['findings'].lower())
            f.write(f"- 🔴 严重问题: {critical_count}\n")

            f.write("\n## 详细分析\n\n")

            for result in results:
                f.write(f"### {result['task']}\n\n")
                f.write(f"**优先级:** {result['priority']}\n\n")
                f.write(f"{result['findings']}\n\n")
                f.write("---\n\n")

        print(f"[+] 报告已生成: {report_md}")
        return report_md

    def cleanup(self):
        """清理资源"""
        if hasattr(self, 'ida_process'):
            self.ida_process.terminate()
            self.ida_process.wait()

def main():
    import sys

    if len(sys.argv) < 2:
        print("用法: python analyze_firmware.py <firmware_file>")
        sys.exit(1)

    firmware_file = sys.argv[1]
    output_dir = "analysis_output"

    analyzer = FirmwareAnalyzer(firmware_file, output_dir)

    try:
        # 1. 启动 IDA + MCP
        analyzer.start_ida_with_mcp()

        # 2. 加载分析任务
        with open("firmware_analysis_tasks.yml") as f:
            import yaml
            tasks = yaml.safe_load(f)['analysis_tasks']

        # 3. 执行分析
        results = analyzer.run_claude_analysis(tasks)

        # 4. 生成报告
        report = analyzer.generate_report(results)

        print(f"[+] 分析完成！报告: {report}")

    finally:
        analyzer.cleanup()

if __name__ == "__main__":
    main()
```

## 最佳实践

### 1. 分阶段实施

```
阶段 1: 手动触发（1-2周）
├── 建立基础设施
├── 验证分析流程
└── 积累经验

阶段 2: 半自动化（1个月）
├── 自动触发，人工审核
├── 优化分析任务
└── 建立基线

阶段 3: 全自动化（持续）
├── 完全自动化流程
├── 异常情况人工介入
└── 持续优化
```

### 2. 成本控制

```python
# 估算 Claude API 成本
def estimate_cost(firmware_size_mb):
    # Claude 3.5 Sonnet 定价（示例）
    # Input: $3/M tokens, Output: $15/M tokens

    # 估算：每个分析任务约 2000 input tokens, 1000 output tokens
    tasks_count = 10  # 分析任务数量

    input_cost = (tasks_count * 2000 / 1_000_000) * 3
    output_cost = (tasks_count * 1000 / 1_000_000) * 15

    total = input_cost + output_cost
    print(f"预估成本: ${total:.4f} per firmware")
    return total

# 对于小型固件（< 10MB）：约 $0.05-0.10
# 对于大型固件（> 100MB）：需要分块分析，约 $0.50-1.00
```

### 3. 性能优化

- **并行分析**：多个任务可以并行执行
- **增量分析**：只分析变更部分
- **缓存结果**：相同固件不重复分析
- **优先级队列**：关键任务优先

### 4. 质量保证

```yaml
validation:
  - 每个发现需要置信度评分
  - 高危发现需要人工确认
  - 定期审计假阳性率
  - 持续更新分析规则
```

## 总结

将 IDA Pro MCP + Claude 集成到 CI/CD 实现了：

✅ **自动化**：从固件接收到报告生成全程自动
✅ **规模化**：可以分析大量固件版本
✅ **一致性**：每次分析使用相同的标准
✅ **可追溯**：所有分析结果有版本记录
✅ **快速响应**：发现问题立即告警

⚠️ **但需要注意**：
- 安全性是首要考虑
- 不是所有固件都适合自动化
- 需要持续优化和调整
- 人工审查仍然重要
