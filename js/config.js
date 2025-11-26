// API配置文件模板
// 使用前请替换以下占位符为您的实际API密钥
const API_CONFIG = {
    // Whisper API配置
    whisper: {
        apiKey: 'YOUR_WHISPER_API_KEY_HERE', // 请替换为您的OpenKey令牌
        baseUrl: 'https://openkey.cloud/v1',
        model: 'whisper-1',
        language: 'zh',
        responseFormat: 'json'
    },
    
    // Kimi API配置 (新的导诊模型)
    kimi: {
        apiKey: 'YOUR_KIMI_API_KEY_HERE', // Kimi模型API密钥
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'kimi-chat',
        temperature: 0.7,
        maxTokens: 1000,
        // 如果遇到CORS问题，可以启用代理服务器
        // proxyUrl: 'http://localhost:8080/proxy/api.moonshot.cn/v1'
    },
    
    // ChatGPT API配置 (保留作为备选)
    chatgpt: {
        apiKey: 'YOUR_CHATGPT_API_KEY_HERE', // 请替换为您的OpenKey令牌
        baseUrl: 'https://openkey.cloud/v1',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        // 如果遇到CORS问题，可以启用代理服务器
        // proxyUrl: 'http://localhost:8080/proxy/openkey.cloud/v1'
    },
    
    // 获取API密钥
    getApiKey: function() {
        return this.whisper.apiKey;
    },
    
    // 获取Kimi API密钥
    getKimiApiKey: function() {
        return this.kimi.apiKey;
    },
    
    // 设置API密钥（仅用于配置文件中修改）
    setApiKey: function(key) {
        this.whisper.apiKey = key;
        this.chatgpt.apiKey = key; // 同时更新两个配置的密钥
    },
    
    // 设置Kimi API密钥
    setKimiApiKey: function(key) {
        this.kimi.apiKey = key;
    },
    
    // 从本地存储加载API密钥（推荐方式）
    loadApiKey: function() {
        const savedKey = localStorage.getItem('whisper_api_key');
        if (savedKey) {
            this.whisper.apiKey = savedKey;
            this.chatgpt.apiKey = savedKey;
        }
        return this.whisper.apiKey;
    }
};

// 推荐：使用本地存储的API密钥（更安全）
document.addEventListener('DOMContentLoaded', function() {
    API_CONFIG.loadApiKey();
});

// 将API_CONFIG添加到全局HospitalApp对象
window.HospitalApp = window.HospitalApp || {};
window.HospitalApp.Config = API_CONFIG;