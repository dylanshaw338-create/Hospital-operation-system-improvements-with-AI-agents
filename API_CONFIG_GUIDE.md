# API配置说明

## 🔑 如何配置API密钥

本项目需要配置以下API密钥才能正常使用AI功能：

### 1. Whisper API (语音识别)
- 用途：将用户的语音输入转换为文字
- 获取方式：OpenAI平台或其他支持Whisper的服务商
- 配置位置：`js/config.js` 中的 `whisper.apiKey`

### 2. Kimi API (智能导诊)
- 用途：智能症状分析和科室推荐
- 获取方式：Moonshot AI平台
- 配置位置：`js/config.js` 中的 `kimi.apiKey`

### 3. ChatGPT API (备选AI服务)
- 用途：作为备选AI服务，处理各种智能分析任务
- 获取方式：OpenAI平台
- 配置位置：`js/config.js` 中的 `chatgpt.apiKey`

## 🔒 安全建议

### 推荐做法
1. **使用本地存储**：项目已配置自动从localStorage加载API密钥
2. **环境变量**：在生产环境中使用环境变量存储敏感信息
3. **配置文件分离**：将敏感配置放在单独的文件中，不提交到版本控制

### 不推荐做法
- ❌ 直接在代码中硬编码真实的API密钥
- ❌ 将包含真实密钥的配置文件提交到Git仓库
- ❌ 在公共仓库中暴露API密钥

## 🚀 快速配置

1. 获取API密钥后，编辑 `js/config.js` 文件
2. 将 `YOUR_*_API_KEY_HERE` 替换为您的实际密钥
3. 或者使用浏览器控制台设置本地存储：
```javascript
localStorage.setItem('whisper_api_key', '您的实际密钥');
```

## 📋 API服务商推荐

### Whisper API
- OpenAI官方：https://platform.openai.com
- 其他支持Whisper的服务商

### Kimi API
- Moonshot AI：https://www.moonshot.cn

### ChatGPT API
- OpenAI官方：https://platform.openai.com
- Azure OpenAI服务

## ⚠️ 注意事项

1. **API配额**：注意各服务商的API调用配额限制
2. **费用控制**：监控API使用费用，设置预算提醒
3. **服务条款**：遵守各API服务商的使用条款
4. **隐私保护**：不要在API请求中包含敏感个人信息

## 🆘 故障排除

### API连接失败
- 检查网络连接
- 确认API密钥有效
- 查看浏览器控制台错误信息
- 检查CORS代理服务器是否运行

### 功能无法使用
- 确认所有API密钥已正确配置
- 检查浏览器本地存储设置
- 查看项目文档和GitHub Issues

## 📞 支持

如有配置问题，请：
1. 查看项目文档
2. 搜索GitHub Issues
3. 创建新的Issue寻求帮助