// 医疗导诊模拟API数据
const TRIAGE_SIMULATION_DATA = {
    // 呼吸系统症状
    "咳嗽": {
        "recommendedDepartment": "呼吸内科",
        "possibleCauses": ["感冒", "支气管炎", "肺炎", "过敏性咳嗽"],
        "urgencyLevel": "一般",
        "medicalAdvice": "建议多休息，多饮水，如伴有发热或持续超过一周请及时就医",
        "confidence": 0.85
    },
    "发热": {
        "recommendedDepartment": "发热门诊",
        "possibleCauses": ["感冒", "流感", "细菌感染", "病毒感染"],
        "urgencyLevel": "一般",
        "medicalAdvice": "体温超过38.5°C建议及时就医，注意多休息，多饮水",
        "confidence": 0.9
    },
    "胸痛": {
        "recommendedDepartment": "心内科",
        "possibleCauses": ["心绞痛", "心肌梗死", "胸膜炎", "肋间神经痛"],
        "urgencyLevel": "紧急",
        "medicalAdvice": "胸痛症状严重，建议立即就医，特别是伴有出汗、恶心等症状",
        "confidence": 0.95
    },
    
    // 消化系统症状
    "腹痛": {
        "recommendedDepartment": "消化内科",
        "possibleCauses": ["胃炎", "胃溃疡", "肠炎", "阑尾炎"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意饮食清淡，避免辛辣刺激食物，如疼痛剧烈或持续请及时就医",
        "confidence": 0.8
    },
    "腹泻": {
        "recommendedDepartment": "消化内科",
        "possibleCauses": ["急性胃肠炎", "食物中毒", "肠道感染", "消化不良"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "注意补充水分，饮食清淡，如伴有发热或血便请及时就医",
        "confidence": 0.85
    },
    "恶心": {
        "recommendedDepartment": "消化内科",
        "possibleCauses": ["胃炎", "消化不良", "食物中毒", "眩晕症"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "饮食清淡，少量多餐，如症状持续或加重请及时就医",
        "confidence": 0.75
    },
    
    // 神经系统症状
    "头痛": {
        "recommendedDepartment": "神经内科",
        "possibleCauses": ["偏头痛", "紧张性头痛", "高血压", "颈椎病"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意休息，避免过度劳累，如头痛剧烈或伴有其他症状请及时就医",
        "confidence": 0.8
    },
    "头晕": {
        "recommendedDepartment": "神经内科",
        "possibleCauses": ["低血压", "贫血", "内耳疾病", "颈椎病"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免突然起立，注意休息，如频繁发作或伴有恶心请及时就医",
        "confidence": 0.8
    },
    "失眠": {
        "recommendedDepartment": "神经内科",
        "possibleCauses": ["神经衰弱", "焦虑症", "抑郁症", "生物钟紊乱"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "保持规律作息，避免睡前使用电子设备，如长期失眠建议就医",
        "confidence": 0.75
    },
    
    // 心血管系统症状
    "心悸": {
        "recommendedDepartment": "心内科",
        "possibleCauses": ["心律失常", "贫血", "甲亢", "焦虑症"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免剧烈运动和情绪激动，如症状频繁或伴有胸痛请及时就医",
        "confidence": 0.85
    },
    "高血压": {
        "recommendedDepartment": "心内科",
        "possibleCauses": ["原发性高血压", "肾性高血压", "内分泌性高血压"],
        "urgencyLevel": "一般",
        "medicalAdvice": "建议定期监测血压，低盐饮食，如血压持续升高请及时就医",
        "confidence": 0.9
    },
    
    // 泌尿系统症状
    "尿频": {
        "recommendedDepartment": "泌尿外科",
        "possibleCauses": ["尿路感染", "前列腺炎", "糖尿病", "膀胱过度活动症"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意个人卫生，多饮水，如伴有尿痛或血尿请及时就医",
        "confidence": 0.8
    },
    "尿痛": {
        "recommendedDepartment": "泌尿外科",
        "possibleCauses": ["尿路感染", "膀胱炎", "尿道炎", "结石"],
        "urgencyLevel": "一般",
        "medicalAdvice": "多饮水，注意个人卫生，建议及时就医检查尿常规",
        "confidence": 0.85
    },
    
    // 妇科症状
    "月经不规律": {
        "recommendedDepartment": "妇产科",
        "possibleCauses": ["内分泌失调", "多囊卵巢综合征", "甲状腺功能异常", "压力过大"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "保持规律作息，减少压力，如长期不规律建议妇科检查",
        "confidence": 0.8
    },
    "下腹痛": {
        "recommendedDepartment": "妇产科",
        "possibleCauses": ["盆腔炎", "子宫内膜异位症", "卵巢囊肿", "月经痛"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意保暖，避免剧烈运动，如疼痛剧烈或持续请及时就医",
        "confidence": 0.85
    },
    
    // 骨科症状
    "关节疼痛": {
        "recommendedDepartment": "骨科",
        "possibleCauses": ["关节炎", "风湿病", "痛风", "骨质疏松"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免过度使用关节，注意保暖，如关节肿胀或活动受限请及时就医",
        "confidence": 0.85
    },
    "腰痛": {
        "recommendedDepartment": "骨科",
        "possibleCauses": ["腰椎间盘突出", "腰肌劳损", "腰椎骨质增生", "肾结石"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免久坐和重体力劳动，注意腰部保暖，如疼痛放射至下肢请及时就医",
        "confidence": 0.8
    },
    
    // 皮肤科症状
    "皮疹": {
        "recommendedDepartment": "皮肤科",
        "possibleCauses": ["过敏性皮炎", "湿疹", "荨麻疹", "药物性皮炎"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "避免搔抓，注意皮肤清洁，如皮疹扩散或伴有发热请及时就医",
        "confidence": 0.8
    },
    "瘙痒": {
        "recommendedDepartment": "皮肤科",
        "possibleCauses": ["皮肤干燥", "过敏性皮炎", "湿疹", "真菌感染"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "避免搔抓，保持皮肤湿润，如瘙痒严重或持续请及时就医",
        "confidence": 0.75
    },
    
    // 眼科症状
    "视力模糊": {
        "recommendedDepartment": "眼科",
        "possibleCauses": ["近视", "远视", "散光", "白内障"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免长时间用眼，定期检查视力，如视力突然下降请及时就医",
        "confidence": 0.8
    },
    "眼红": {
        "recommendedDepartment": "眼科",
        "possibleCauses": ["结膜炎", "角膜炎", "青光眼", "眼部疲劳"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免揉眼，注意眼部卫生，如伴有疼痛或视力下降请及时就医",
        "confidence": 0.85
    },
    
    // 耳鼻喉科症状
    "鼻塞": {
        "recommendedDepartment": "耳鼻喉科",
        "possibleCauses": ["感冒", "过敏性鼻炎", "鼻窦炎", "鼻息肉"],
        "urgencyLevel": "轻微",
        "medicalAdvice": "保持室内空气流通，避免过敏原，如长期鼻塞或伴有头痛请及时就医",
        "confidence": 0.8
    },
    "耳鸣": {
        "recommendedDepartment": "耳鼻喉科",
        "possibleCauses": ["中耳炎", "内耳疾病", "噪音性听力损伤", "高血压"],
        "urgencyLevel": "一般",
        "medicalAdvice": "避免噪音环境，注意休息，如耳鸣持续或伴有听力下降请及时就医",
        "confidence": 0.8
    },
    
    // 儿科症状
    "发热": {
        "recommendedDepartment": "儿科",
        "possibleCauses": ["上呼吸道感染", "幼儿急疹", "肺炎", "中耳炎"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意体温监测，多饮水，如体温超过38.5°C或伴有其他症状请及时就医",
        "confidence": 0.85
    },
    "腹泻": {
        "recommendedDepartment": "儿科",
        "possibleCauses": ["消化不良", "肠道感染", "食物过敏", "轮状病毒感染"],
        "urgencyLevel": "一般",
        "medicalAdvice": "注意补充水分，饮食清淡，如伴有发热或血便请及时就医",
        "confidence": 0.8
    },
    
    // 急诊科症状
    "昏迷": {
        "recommendedDepartment": "急诊科",
        "possibleCauses": ["脑出血", "脑梗死", "低血糖", "中毒"],
        "urgencyLevel": "紧急",
        "medicalAdvice": "立即拨打120急救电话，昏迷是危及生命的紧急情况",
        "confidence": 0.95
    },
    "呼吸困难": {
        "recommendedDepartment": "急诊科",
        "possibleCauses": ["哮喘急性发作", "肺水肿", "气胸", "心力衰竭"],
        "urgencyLevel": "紧急",
        "medicalAdvice": "立即就医，呼吸困难是严重的症状，需要紧急处理",
        "confidence": 0.95
    },
    "剧烈头痛": {
        "recommendedDepartment": "急诊科",
        "possibleCauses": ["脑出血", "蛛网膜下腔出血", "脑膜炎", "高血压危象"],
        "urgencyLevel": "紧急",
        "medicalAdvice": "立即就医，剧烈头痛可能是严重疾病的表现",
        "confidence": 0.95
    }
};

// 症状关键词映射
const SYMPTOM_KEYWORDS = {
    "发烧": "发热",
    "热度": "发热", 
    "高烧": "发热",
    "低烧": "发热",
    "胸闷": "胸痛",
    "胸口疼": "胸痛",
    "肚子疼": "腹痛",
    "胃疼": "腹痛",
    "拉肚子": "腹泻",
    "拉稀": "腹泻",
    "想吐": "恶心",
    "反胃": "恶心",
    "脑袋疼": "头痛",
    "头胀": "头痛",
    "头重": "头晕",
    "眩晕": "头晕",
    "睡不着": "失眠",
    "睡不好": "失眠",
    "心慌": "心悸",
    "心跳快": "心悸",
    "血压高": "高血压",
    "小便多": "尿频",
    "老想尿": "尿频",
    "尿痛": "尿痛",
    "小便疼": "尿痛",
    "月经乱": "月经不规律",
    "例假不准": "月经不规律",
    "关节疼": "关节疼痛",
    "骨头疼": "关节疼痛",
    "腰疼": "腰痛",
    "腰酸": "腰痛",
    "皮肤痒": "瘙痒",
    "起疹子": "皮疹",
    "疙瘩": "皮疹",
    "看不清": "视力模糊",
    "眼睛红": "眼红",
    "鼻子不通": "鼻塞",
    "耳朵响": "耳鸣"
};

// 模拟API调用函数
function simulateTriageAPI(symptoms) {
    console.log(`正在分析症状: ${symptoms}`);
    
    // 标准化症状描述
    let normalizedSymptoms = symptoms;
    for (const [keyword, standardSymptom] of Object.entries(SYMPTOM_KEYWORDS)) {
        if (symptoms.includes(keyword)) {
            normalizedSymptoms = standardSymptom;
            break;
        }
    }
    
    // 查找匹配的症状
    for (const [symptom, data] of Object.entries(TRIAGE_SIMULATION_DATA)) {
        if (normalizedSymptoms.includes(symptom) || symptoms.includes(symptom)) {
            console.log(`匹配到症状: ${symptom}`);
            return {
                success: true,
                data: data,
                message: `成功分析症状: ${symptoms}`
            };
        }
    }
    
    // 如果没有精确匹配，使用关键词提取
    return extractSymptomFromKeywords(symptoms);
}

// 关键词提取症状
function extractSymptomFromKeywords(symptoms) {
    const keywords = {
        "呼吸": {
            department: "呼吸内科",
            causes: ["呼吸系统疾病", "肺部感染", "气道炎症"],
            advice: "建议呼吸科就诊，进行相关检查"
        },
        "消化": {
            department: "消化内科", 
            causes: ["消化系统疾病", "胃肠功能紊乱", "消化不良"],
            advice: "建议消化科就诊，注意饮食调理"
        },
        "神经": {
            department: "神经内科",
            causes: ["神经系统疾病", "神经功能紊乱", "神经性疼痛"],
            advice: "建议神经科就诊，注意休息"
        },
        "心脏": {
            department: "心内科",
            causes: ["心血管疾病", "心律不齐", "心功能异常"],
            advice: "建议心内科就诊，注意休息避免劳累"
        },
        "泌尿": {
            department: "泌尿外科",
            causes: ["泌尿系统疾病", "尿路感染", "肾功能异常"],
            advice: "建议泌尿科就诊，注意个人卫生"
        },
        "妇科": {
            department: "妇产科",
            causes: ["妇科疾病", "内分泌失调", "生殖系统疾病"],
            advice: "建议妇科就诊，注意个人卫生"
        },
        "骨骼": {
            department: "骨科",
            causes: ["骨骼肌肉疾病", "关节炎", "骨质疏松"],
            advice: "建议骨科就诊，避免剧烈运动"
        },
        "皮肤": {
            department: "皮肤科",
            causes: ["皮肤疾病", "过敏反应", "皮肤感染"],
            advice: "建议皮肤科就诊，注意皮肤清洁"
        },
        "眼睛": {
            department: "眼科",
            causes: ["眼部疾病", "视力问题", "眼部炎症"],
            advice: "建议眼科就诊，注意用眼卫生"
        },
        "耳朵": {
            department: "耳鼻喉科",
            causes: ["耳部疾病", "听力问题", "耳道感染"],
            advice: "建议耳鼻喉科就诊，避免噪音环境"
        }
    };
    
    for (const [keyword, info] of Object.entries(keywords)) {
        if (symptoms.includes(keyword)) {
            return {
                success: true,
                data: {
                    recommendedDepartment: info.department,
                    possibleCauses: info.causes,
                    urgencyLevel: "一般",
                    medicalAdvice: info.advice,
                    confidence: 0.6
                },
                message: `通过关键词分析症状: ${symptoms}`
            };
        }
    }
    
    // 默认返回内科建议
    return {
        success: true,
        data: {
            recommendedDepartment: "内科",
            possibleCauses: ["需要进一步检查确定"],
            urgencyLevel: "一般", 
            medicalAdvice: "症状不典型，建议内科就诊进行详细检查",
            confidence: 0.4
        },
        message: `默认内科建议: ${symptoms}`
    };
}

// 测试模拟API
console.log("=== 医疗导诊模拟API测试 ===");

const testSymptoms = [
    "我最近总是咳嗽，特别是晚上",
    "头痛得厉害，还伴有恶心",
    "肚子疼，拉肚子",
    "胸口闷，感觉呼吸困难",
    "关节疼，特别是膝盖",
    "皮肤起了红疹，很痒",
    "眼睛发红，视力有点模糊",
    "老是想小便，还有点疼",
    "月经不规律，推迟了好几天",
    "心慌，心跳很快"
];

console.log("\n--- 批量症状测试 ---");
testSymptoms.forEach(symptom => {
    const result = simulateTriageAPI(symptom);
    console.log(`\n症状: ${symptom}`);
    console.log(`推荐科室: ${result.data.recommendedDepartment}`);
    console.log(`可能病因: ${result.data.possibleCauses.join(", ")}`);
    console.log(`紧急程度: ${result.data.urgencyLevel}`);
    console.log(`就诊建议: ${result.data.medicalAdvice}`);
    console.log(`置信度: ${result.data.confidence}`);
});

console.log("\n--- 单个症状测试 ---");
const singleTest = simulateTriageAPI("发烧38度，全身无力");
console.log(`症状: 发烧38度，全身无力`);
console.log(`结果:`, singleTest);

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        simulateTriageAPI,
        TRIAGE_SIMULATION_DATA,
        SYMPTOM_KEYWORDS
    };
}