# 🏥 智慧医疗系统 (Smart Healthcare System)

一个现代化的智慧医疗Web应用，集成了AI语音分析、智能导诊、检查报告解读等功能。

## ✨ 功能特性

### 🩺 核心功能
- **检查报告解读**: AI智能分析医疗检查报告，识别异常指标
- **智能导诊**: 基于症状描述推荐合适的就诊科室
- **用药指导**: 药品信息查询和用药提醒功能
- **语音交互**: 支持语音输入和AI语音回复
- **挂号预约**: 在线预约挂号服务
- **门诊缴费**: 医疗费用在线支付

### 🎨 界面特色
- **现代化设计**: 渐变背景、卡片布局、流畅动画效果
- **响应式布局**: 完美适配手机、平板、桌面设备
- **用户友好**: 直观的操作界面，清晰的视觉层次
- **无障碍支持**: 高对比度模式，适配不同用户需求

### 🤖 AI智能特性
- **异常指标识别**: 自动高亮显示异常的检查指标
- **智能分析**: AI解读检查报告，提供专业建议
- **症状分析**: 智能分析症状并推荐就诊科室
- **语音交互**: 支持语音输入和AI语音回复

## 🚀 快速开始

### 环境要求
- Python 3.6+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/hospital-agent.git
cd hospital-agent
```

2. **配置API密钥**
编辑 `js/config.js` 文件，替换以下占位符为您的实际API密钥：
```javascript
whisper: {
    apiKey: 'YOUR_WHISPER_API_KEY_HERE',
    // ...
},
kimi: {
    apiKey: 'YOUR_KIMI_API_KEY_HERE',
    // ...
},
chatgpt: {
    apiKey: 'YOUR_CHATGPT_API_KEY_HERE',
    // ...
}
```

3. **启动服务**
```bash
# 启动CORS代理服务器（用于AI功能）
python cors_proxy.py

# 启动Web服务器（在新终端中）
python -m http.server 8000
```

4. **访问应用**
打开浏览器访问 `http://localhost:8000`

## 📁 项目结构

```
hospital-agent/
├── cors_proxy.py          # CORS代理服务器
├── index.html             # 主页面
├── css/
│   ├── styles.css         # 主要样式
│   └── responsive.css     # 响应式样式
├── js/
│   ├── config.js          # API配置（需要用户配置）
│   ├── script.js          # 主要功能脚本
│   └── triage_simulation.js # 导诊模拟
└── README.md
```

## 🔧 配置说明

### API配置
项目需要配置以下API密钥才能正常使用AI功能：

1. **Whisper API**: 用于语音识别
2. **Kimi API**: 用于智能导诊和对话
3. **ChatGPT API**: 作为备选AI服务

### 安全建议
- 不要在代码中硬编码真实的API密钥
- 推荐使用环境变量或本地存储管理敏感信息
- 生产环境请使用专业的代理服务

## 🌐 浏览器兼容性

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ 移动端浏览器

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发规范
- 保持代码整洁和注释清晰
- 遵循现有的代码风格
- 测试所有功能后再提交
- 更新相关文档

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

本项目仅供学习和研究使用，不构成医疗建议。实际医疗决策请咨询专业医生。

## 🙏 致谢

- 感谢所有开源贡献者
- 感谢提供AI服务的平台
- 感谢医疗专业人士的指导建议

---

**注意**: 使用本项目前请确保已配置正确的API密钥，并遵守相关服务条款。