# 自托管 Runner 配置指南

用于固件逆向分析的 GitHub Actions Self-Hosted Runner 设置

## 📋 目录

- [为什么需要自托管 Runner](#为什么需要自托管-runner)
- [硬件和软件要求](#硬件和软件要求)
- [安装步骤](#安装步骤)
- [安全配置](#安全配置)
- [IDA Pro 配置](#ida-pro-配置)
- [故障排除](#故障排除)

## 为什么需要自托管 Runner

### ❌ GitHub 托管 Runner 的限制

```
1. 无法安装 IDA Pro
   ├── 需要商业许可证
   └── 不能在临时 VM 中运行

2. 安全性考虑
   ├── 固件可能包含敏感信息
   └── 不适合上传到云端

3. 资源限制
   ├── 大型固件分析需要更多内存
   └── 分析时间可能超过限制

4. 网络隔离需求
   ├── 某些固件需要内网环境
   └── 合规性要求
```

### ✅ 自托管 Runner 的优势

```
✓ 完全控制环境
✓ 可安装 IDA Pro 等商业工具
✓ 固件不离开内网
✓ 无资源限制
✓ 可配置网络隔离
✓ 符合安全合规要求
```

## 硬件和软件要求

### 推荐硬件配置

```
最低配置:
├── CPU: 4 核
├── RAM: 16GB
├── 存储: 256GB SSD
└── 网络: 隔离网络环境

推荐配置:
├── CPU: 8+ 核（Intel/AMD x64）
├── RAM: 32GB+
├── 存储: 512GB+ NVMe SSD
└── 网络: VLAN 隔离

企业配置:
├── CPU: 16+ 核
├── RAM: 64GB+
├── 存储: 1TB+ NVMe SSD RAID
└── 网络: 完全隔离内网
```

### 软件要求

```yaml
操作系统:
  - Ubuntu 22.04 LTS (推荐)
  - Debian 12
  - RHEL/CentOS 8+

必需软件:
  - Python 3.11+
  - IDA Pro 8.x (需要许可证)
  - Git
  - Docker (可选)

分析工具:
  - binwalk
  - radare2
  - ghidra (可选)
  - qemu (用于模拟执行)
```

## 安装步骤

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y \
  git \
  curl \
  wget \
  build-essential \
  python3 \
  python3-pip \
  python3-venv

# 创建专用用户
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner  # 如果使用 Docker
```

### 2. 安装 GitHub Actions Runner

```bash
# 切换到 runner 用户
sudo su - github-runner

# 创建工作目录
mkdir actions-runner && cd actions-runner

# 下载 Runner（检查最新版本）
curl -o actions-runner-linux-x64-2.314.1.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.314.1/actions-runner-linux-x64-2.314.1.tar.gz

# 解压
tar xzf ./actions-runner-linux-x64-2.314.1.tar.gz

# 配置 Runner
# 在 GitHub 仓库的 Settings -> Actions -> Runners -> New self-hosted runner 获取 token
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN

# 设置标签（重要！用于识别此 Runner）
# 标签示例: self-hosted, ida-pro, firmware-analysis, linux, x64
```

### 3. 配置为系统服务

```bash
# 安装为系统服务
sudo ./svc.sh install

# 启动服务
sudo ./svc.sh start

# 查看状态
sudo ./svc.sh status

# 开机自启
sudo systemctl enable actions.runner.YOUR-ORG-YOUR-REPO.github-runner.service
```

### 4. 验证安装

```bash
# 检查 Runner 状态
./run.sh  # 测试运行（Ctrl+C 退出）

# 在 GitHub 仓库的 Settings -> Actions -> Runners 中应该看到你的 Runner
```

## 安全配置

### 1. 网络隔离

```bash
# 配置防火墙（仅允许必要的连接）
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 10.0.0.0/8 to any port 22  # SSH（内网）
sudo ufw allow out 443  # HTTPS 到 GitHub 和 Anthropic API

# 查看规则
sudo ufw status verbose
```

### 2. 文件系统隔离

```bash
# 为分析创建隔离目录
sudo mkdir -p /opt/firmware-analysis/{workspace,quarantine,results}
sudo chown -R github-runner:github-runner /opt/firmware-analysis

# 设置权限
sudo chmod 700 /opt/firmware-analysis/quarantine  # 敏感固件隔离
sudo chmod 755 /opt/firmware-analysis/results     # 分析结果
```

### 3. 访问控制

```bash
# 创建 .env 文件存储敏感配置
cat > /home/github-runner/.firmware-analysis-env << EOF
# Anthropic API Key（加密存储）
ANTHROPIC_API_KEY=your-key-here

# IDA Pro 配置
IDA_PATH=/opt/idapro/idat64
IDA_LICENSE=XXXX-XXXX-XXXX

# 分析配置
MAX_FIRMWARE_SIZE=100M
ANALYSIS_TIMEOUT=3600
NETWORK_ALLOWED=false
EOF

chmod 600 /home/github-runner/.firmware-analysis-env
```

### 4. 审计日志

```bash
# 配置审计日志
cat > /etc/rsyslog.d/50-firmware-analysis.conf << EOF
:programname, isequal, "firmware-analysis" /var/log/firmware-analysis.log
& stop
EOF

sudo systemctl restart rsyslog

# 创建日志记录脚本
cat > /opt/firmware-analysis/log.sh << 'EOF'
#!/bin/bash
logger -t firmware-analysis "$@"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] $@" >> /var/log/firmware-analysis.log
EOF

chmod +x /opt/firmware-analysis/log.sh
```

## IDA Pro 配置

### 1. 安装 IDA Pro

```bash
# 假设你已经有 IDA Pro 安装包和许可证
sudo mkdir -p /opt/idapro
cd /opt/idapro

# 解压 IDA Pro（根据你的安装包）
# tar xzf idapro_xxx.tar.gz

# 安装 IDA Pro
# ./install.sh

# 配置许可证
cat > /opt/idapro/ida.reg << EOF
IDA_LICENSE_KEY=YOUR-LICENSE-KEY
EOF

# 测试 IDA Pro
/opt/idapro/idat64 -v
```

### 2. 配置 IDA Python 环境

```bash
# IDA Pro 自带 Python，配置额外的包
/opt/idapro/python/python3 -m pip install --upgrade pip

# 安装必要的 Python 包
/opt/idapro/python/python3 -m pip install \
  anthropic \
  requests \
  pyyaml
```

### 3. 创建 IDA 自动化脚本

```bash
# 创建 IDA 启动模板
cat > /opt/firmware-analysis/ida_analyze.py << 'EOFPYTHON'
#!/opt/idapro/python/python3
"""
IDA Pro 自动化分析脚本
用于 CI/CD 环境
"""

import sys
import os
import json
import idaapi
import idc
import idautils

def wait_for_analysis():
    """等待 IDA 自动分析完成"""
    print("[IDA] 等待自动分析完成...")
    idaapi.auto_wait()
    print("[IDA] 自动分析完成")

def extract_functions():
    """提取所有函数信息"""
    functions = []
    for func_ea in idautils.Functions():
        func_name = idc.get_func_name(func_ea)
        func_size = idc.get_func_attr(func_ea, idc.FUNCATTR_END) - func_ea
        functions.append({
            "address": hex(func_ea),
            "name": func_name,
            "size": func_size
        })
    return functions

def find_dangerous_functions():
    """查找危险函数调用"""
    dangerous = ["strcpy", "sprintf", "gets", "scanf", "system", "exec"]
    findings = []

    for name in idautils.Names():
        addr, func_name = name
        if any(d in func_name.lower() for d in dangerous):
            # 找到所有对此函数的引用
            xrefs = list(idautils.XrefsTo(addr))
            if xrefs:
                findings.append({
                    "function": func_name,
                    "address": hex(addr),
                    "xrefs_count": len(xrefs),
                    "callers": [hex(xref.frm) for xref in xrefs[:5]]
                })

    return findings

def extract_strings():
    """提取有趣的字符串"""
    strings = []
    for s in idautils.Strings():
        str_val = str(s)
        # 只保留有趣的字符串（URL, IP, 关键词等）
        if any(keyword in str_val.lower() for keyword in
               ['http', 'password', 'key', 'admin', 'root']):
            strings.append({
                "address": hex(s.ea),
                "value": str_val[:100]  # 限制长度
            })
    return strings

def analyze_firmware():
    """执行固件分析"""
    print("[*] 开始分析固件...")

    # 等待自动分析
    wait_for_analysis()

    results = {
        "binary_info": {
            "entry_point": hex(idaapi.get_inf_structure().start_ea),
            "image_base": hex(idaapi.get_imagebase()),
            "file_type": idaapi.get_file_type_name()
        },
        "functions": extract_functions(),
        "dangerous_functions": find_dangerous_functions(),
        "interesting_strings": extract_strings()
    }

    # 保存结果
    output_file = os.environ.get("IDA_OUTPUT", "ida_analysis.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"[+] 分析完成，结果保存到: {output_file}")

if __name__ == "__main__":
    analyze_firmware()
    idc.qexit(0)  # 退出 IDA
EOFPYTHON

chmod +x /opt/firmware-analysis/ida_analyze.py
```

### 4. 配置 IDA Pro MCP Server

```bash
# 如果你有 IDA Pro MCP Server，配置启动脚本
cat > /opt/firmware-analysis/start_ida_mcp.sh << 'EOF'
#!/bin/bash

IDA_PATH=/opt/idapro
FIRMWARE_FILE=$1
MCP_PORT=3000

# 启动 IDA Pro with MCP Server
$IDA_PATH/idat64 \
  -A \
  -S"$IDA_PATH/plugins/mcp_server.py --port $MCP_PORT" \
  "$FIRMWARE_FILE" &

IDA_PID=$!
echo $IDA_PID > /tmp/ida_mcp.pid

echo "IDA Pro MCP Server started (PID: $IDA_PID)"
echo "Listening on port: $MCP_PORT"
EOF

chmod +x /opt/firmware-analysis/start_ida_mcp.sh
```

## 测试配置

### 创建测试 Workflow

```yaml
# .github/workflows/test-runner.yml
name: Test Self-Hosted Runner

on: workflow_dispatch

jobs:
  test:
    runs-on: [self-hosted, ida-pro]
    steps:
      - name: 环境测试
        run: |
          echo "=== 系统信息 ==="
          uname -a
          cat /etc/os-release

      - name: IDA Pro 测试
        run: |
          echo "=== IDA Pro 版本 ==="
          /opt/idapro/idat64 -v || echo "IDA Pro 未配置"

      - name: Python 测试
        run: |
          echo "=== Python 版本 ==="
          python3 --version
          pip3 list | grep anthropic || echo "Anthropic SDK 未安装"

      - name: 网络测试
        run: |
          echo "=== 网络连接测试 ==="
          curl -I https://api.anthropic.com || echo "无法连接到 Anthropic API"
```

## 维护和监控

### 1. 定期更新

```bash
# 更新 Runner
cd /home/github-runner/actions-runner
./svc.sh stop
./config.sh remove
# 下载新版本并重新配置
./svc.sh start
```

### 2. 监控脚本

```bash
cat > /opt/firmware-analysis/monitor.sh << 'EOF'
#!/bin/bash

# 检查 Runner 状态
if ! systemctl is-active --quiet actions.runner.*.service; then
    echo "⚠️ GitHub Runner 未运行！"
    # 发送告警
fi

# 检查磁盘空间
DISK_USAGE=$(df /opt/firmware-analysis | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ 磁盘使用率过高: ${DISK_USAGE}%"
fi

# 检查 IDA Pro 许可证
if ! /opt/idapro/idat64 -v &>/dev/null; then
    echo "⚠️ IDA Pro 许可证问题"
fi
EOF

chmod +x /opt/firmware-analysis/monitor.sh

# 添加到 crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/firmware-analysis/monitor.sh") | crontab -
```

### 3. 日志轮转

```bash
cat > /etc/logrotate.d/firmware-analysis << EOF
/var/log/firmware-analysis.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 syslog adm
}
EOF
```

## 故障排除

### 常见问题

**1. Runner 无法连接到 GitHub**
```bash
# 检查网络连接
curl -I https://github.com
ping github.com

# 检查防火墙
sudo ufw status
```

**2. IDA Pro 许可证问题**
```bash
# 验证许可证
/opt/idapro/idat64 -v

# 检查许可证文件
cat /opt/idapro/ida.reg
```

**3. 权限问题**
```bash
# 确保 runner 用户有权限
sudo chown -R github-runner:github-runner /opt/firmware-analysis
sudo chmod -R 755 /opt/firmware-analysis
```

**4. 内存不足**
```bash
# 增加 swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 安全检查清单

- [ ] Runner 在隔离网络中运行
- [ ] 防火墙规则已配置
- [ ] 敏感信息使用 GitHub Secrets
- [ ] 审计日志已启用
- [ ] 定期更新系统和软件
- [ ] 备份配置和许可证
- [ ] 监控脚本已运行
- [ ] 访问权限已限制
- [ ] 固件文件隔离存储
- [ ] 分析结果加密传输

## 总结

自托管 Runner 是固件逆向分析自动化的关键组件。正确配置后，你将拥有：

✅ 安全的分析环境
✅ 完全的控制权
✅ 无限的资源
✅ 符合合规要求的工作流

记住：**安全永远是第一位的！**
