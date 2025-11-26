// 页面导航功能
document.addEventListener('DOMContentLoaded', function() {
    // 导航菜单点击事件
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 服务卡片点击事件
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetSection = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(targetSection);
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            const targetNav = document.querySelector(`[href="#${targetSection}"]`);
            if (targetNav) {
                targetNav.classList.add('active');
            }
        });
    });
    
    // 症状标签点击事件
    const symptomTags = document.querySelectorAll('.symptom-tag');
    const symptomTextarea = document.querySelector('.symptom-input textarea');
    
    symptomTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const symptom = this.getAttribute('data-symptom') || this.textContent;
            const isQuickAnalysis = this.getAttribute('data-quick') === 'true';
            
            // 如果是一键智能分析按钮
            if (isQuickAnalysis) {
                analyzeMultipleSymptoms();
                return;
            }
            
            // 切换选中状态
            this.classList.toggle('selected');
            
            // 添加点击效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // 更新输入框
            if (symptomTextarea) {
                const selectedSymptoms = [];
                document.querySelectorAll('.symptom-tag.selected').forEach(selectedTag => {
                    selectedSymptoms.push(selectedTag.getAttribute('data-symptom') || selectedTag.textContent);
                });
                
                if (selectedSymptoms.length > 0) {
                    symptomTextarea.value = selectedSymptoms.join('、');
                } else {
                    symptomTextarea.value = '';
                }
            }
        });
    });
    
    // 开始导诊按钮点击事件
    const startTriageBtn = document.querySelector('.symptom-input .btn-primary');
    const deptRecommendation = document.querySelector('.department-recommendation');
    
    if (startTriageBtn) {
        startTriageBtn.addEventListener('click', async function() {
            if (symptomTextarea.value.trim()) {
                // 检查API配置 - 现在直接从配置文件获取
                if (!HospitalApp.Config.getApiKey()) {
                    alert('AI功能暂未配置，请联系管理员配置API密钥');
                    return;
                }
                
                // 调用ChatGPT API进行智能导诊
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI正在分析...';
                this.disabled = true;
                
                // 显示加载状态
                if (deptRecommendation) {
                    deptRecommendation.style.display = 'block';
                    const recommendationCard = deptRecommendation.querySelector('.recommendation-card');
                    if (recommendationCard) {
                        recommendationCard.innerHTML = `
                            <div class="triage-loading">
                                <i class="fas fa-brain"></i>
                                <p>AI正在分析您的症状...</p>
                                <small style="color: #7f8c8d;">请稍候，这通常只需要几秒钟</small>
                            </div>
                        `;
                    }
                }
                
                try {
                    const symptoms = symptomTextarea.value.trim();
                    const aiRecommendation = await performTriageAI(symptoms);
                    
                    // 显示AI分析结果
                    displayTriageResult(aiRecommendation);
                    
                    deptRecommendation.scrollIntoView({ behavior: 'smooth' });
                    
                    HospitalApp.showNotification('🤖 AI智能导诊分析完成！', 'success');
                } catch (error) {
                    console.error('AI导诊失败:', error);
                    
                    // 根据错误类型提供不同的处理
                    let errorMessage = 'AI导诊分析失败';
                    if (error.message.includes('API')) {
                        errorMessage = 'API连接失败，请检查网络或API配置';
                    } else if (error.message.includes('未配置')) {
                        errorMessage = '未配置API密钥';
                    }
                    
                    // 回退到默认推荐
                    displayDefaultTriage(symptomTextarea.value.trim());
                    deptRecommendation.scrollIntoView({ behavior: 'smooth' });
                    HospitalApp.showNotification(errorMessage, 'error');
                } finally {
                    this.innerHTML = '<i class="fas fa-stethoscope"></i> 开始导诊';
                    this.disabled = false;
                }
            } else {
                alert('请描述您的症状');
            }
        });
    }
    
    // 立即挂号按钮点击事件 - 使用事件委托处理动态生成的按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.recommendation-card .btn-secondary')) {
            // 如果按钮有onclick属性，说明是动态生成的，让它执行自己的逻辑
            if (e.target.getAttribute('onclick')) {
                return; // 让按钮自身的onclick处理跳转
            }
            // 否则执行默认的跳转逻辑
            showSection('appointment');
            navItems.forEach(nav => nav.classList.remove('active'));
            const appointmentNav = document.querySelector('[href="#appointment"]');
            if (appointmentNav) {
                appointmentNav.classList.add('active');
            }
        }
    });
    
    // 时间段选择事件
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            timeSlots.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            this.style.background = '#2c5aa0';
            this.style.color = 'white';
            
            // 更新预约确认信息
            updateAppointmentSummary();
        });
    });
    
    // 科室选择事件
    const departmentSelect = document.getElementById('department-select');
    if (departmentSelect) {
        departmentSelect.addEventListener('change', function() {
            updateAppointmentSummary();
        });
    }
    
    // 日期选择事件
    const appointmentDate = document.getElementById('appointment-date');
    if (appointmentDate) {
        appointmentDate.addEventListener('change', function() {
            updateAppointmentSummary();
        });
    }
    
    // 医生卡片选择事件
    const doctorCards = document.querySelectorAll('.doctor-card');
    doctorCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除其他卡片的选中状态
            doctorCards.forEach(c => c.classList.remove('selected'));
            // 添加当前卡片的选中状态
            this.classList.add('selected');
            
            // 更新预约确认信息
            updateAppointmentSummary();
        });
    });
    
    // 确定预约按钮点击事件
    const confirmAppointmentBtn = document.getElementById('confirm-appointment-btn');
    if (confirmAppointmentBtn) {
        confirmAppointmentBtn.addEventListener('click', function() {
            confirmAppointment();
        });
    }
    
    // 支付按钮点击事件
    const payButtons = document.querySelectorAll('.btn-pay');
    payButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
            this.disabled = true;
            
            setTimeout(() => {
                alert('支付成功！');
                this.innerHTML = '已支付';
                this.style.background = '#28a745';
                // 可以在这里添加页面跳转或状态更新逻辑
            }, 2000);
        });
    });
    
    // 模拟AI分析API
    async function analyzeReportWithAI(reportData) {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟AI分析结果
        const aiAnalysis = {
            abnormalIndicators: [],
            possibleCauses: [],
            recommendations: [],
            riskLevel: 'low'
        };
        
        // 分析异常指标
        reportData.tests.forEach(test => {
            if (test.status === 'abnormal') {
                aiAnalysis.abnormalIndicators.push({
                    name: test.name,
                    value: test.value,
                    normalRange: test.range,
                    abnormality: test.abnormality
                });
            }
        });
        
        // 根据异常指标生成可能原因
        if (aiAnalysis.abnormalIndicators.length > 0) {
            aiAnalysis.possibleCauses = generatePossibleCauses(aiAnalysis.abnormalIndicators);
            aiAnalysis.recommendations = generateRecommendations(aiAnalysis.abnormalIndicators);
            aiAnalysis.riskLevel = determineRiskLevel(aiAnalysis.abnormalIndicators);
        }
        
        return aiAnalysis;
    }
    
    // 生成可能原因
    function generatePossibleCauses(abnormalIndicators) {
        const causes = [];
        
        abnormalIndicators.forEach(indicator => {
            switch (indicator.name) {
                case '白细胞计数':
                    causes.push('白细胞升高：可能提示体内存在感染、炎症反应或应激状态');
                    break;
                case '红细胞计数':
                case '血红蛋白':
                    causes.push('红细胞和血红蛋白降低：可能存在贫血，建议进一步检查铁代谢、维生素B12和叶酸水平');
                    break;
                case '尿蛋白':
                    causes.push('尿蛋白阳性：可能提示肾脏功能异常，如肾小球肾炎、肾病综合征等');
                    break;
                case '尿糖':
                    causes.push('尿糖阳性：血糖水平可能升高，建议检查空腹血糖和糖化血红蛋白');
                    break;
                case '尿酮体':
                    causes.push('尿酮体阳性：可能存在糖尿病酮症酸中毒，或长时间饥饿状态');
                    break;
            }
        });
        
        return causes;
    }
    
    // 生成建议
    function generateRecommendations(abnormalIndicators) {
        const recommendations = [];
        
        if (abnormalIndicators.some(i => i.name.includes('红细胞') || i.name.includes('血红蛋白'))) {
            recommendations.push('建议进一步检查贫血相关指标');
            recommendations.push('建议增加富含铁质的食物摄入');
        }
        
        if (abnormalIndicators.some(i => i.name.includes('白细胞'))) {
            recommendations.push('如存在感染症状，请及时就医治疗');
        }
        
        if (abnormalIndicators.some(i => i.name.includes('尿'))) {
            recommendations.push('建议进行肾功能检查和血糖监测');
            recommendations.push('需要排除糖尿病和肾脏疾病的可能');
        }
        
        recommendations.push('1-2周后复查相关指标');
        
        return recommendations;
    }
    
    // 确定风险等级
    function determineRiskLevel(abnormalIndicators) {
        const hasMultipleAbnormal = abnormalIndicators.length >= 3;
        const hasCriticalAbnormal = abnormalIndicators.some(i => 
            i.name.includes('尿蛋白') || i.name.includes('尿糖') || i.name.includes('尿酮体')
        );
        
        if (hasCriticalAbnormal && hasMultipleAbnormal) {
            return 'high';
        } else if (hasMultipleAbnormal || hasCriticalAbnormal) {
            return 'medium';
        }
        return 'low';
    }
    
    // 提取报告数据
    function extractReportData(reportItem) {
        const tests = [];
        const testItems = reportItem.querySelectorAll('.test-item');
        
        testItems.forEach(item => {
            const name = item.querySelector('.test-name').textContent.trim();
            const value = item.querySelector('.test-value').textContent.trim();
            const range = item.querySelector('.test-range').textContent.trim();
            const statusElement = item.querySelector('.test-status');
            const status = statusElement.textContent.trim();
            
            tests.push({
                name: name,
                value: value,
                range: range,
                status: status === '正常' ? 'normal' : 'abnormal',
                abnormality: status === '偏高' ? 'high' : status === '偏低' ? 'low' : status === '异常' ? 'abnormal' : 'normal'
            });
        });
        
        return {
            tests: tests,
            hasAbnormal: tests.some(test => test.status === 'abnormal')
        };
    }
    
    // 执行AI分析
    async function performAIAnalysis(reportDetails, reportData) {
        const aiAnalysisElement = reportDetails.querySelector('.ai-analysis');
        if (!aiAnalysisElement) return;
        
        // 显示加载状态
        const analysisContent = aiAnalysisElement.querySelector('.ai-analysis-content');
        analysisContent.innerHTML = '<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> AI正在分析中...</div>';
        
        try {
            // 调用AI分析API
            const aiResult = await analyzeReportWithAI(reportData);
            
            // 更新分析结果
            updateAIAnalysisDisplay(aiAnalysisElement, aiResult);
            
        } catch (error) {
            analysisContent.innerHTML = '<div class="ai-error"><i class="fas fa-exclamation-triangle"></i> AI分析失败，请稍后重试</div>';
            console.error('AI分析失败:', error);
        }
    }
    
    // 更新AI分析显示
    function updateAIAnalysisDisplay(aiAnalysisElement, aiResult) {
        const analysisContent = aiAnalysisElement.querySelector('.ai-analysis-content');
        
        // 生成异常指标列表
        const abnormalList = aiResult.abnormalIndicators.map(indicator => 
            `<li>${indicator.name}${indicator.abnormality === 'high' ? '偏高' : indicator.abnormality === 'low' ? '偏低' : '异常'} (${indicator.value}，正常值${indicator.normalRange})</li>`
        ).join('');
        
        // 生成可能原因列表
        const causesList = aiResult.possibleCauses.map(cause => `<li>${cause}</li>`).join('');
        
        // 生成建议列表
        const recommendationsList = aiResult.recommendations.map(rec => `<li>${rec}</li>`).join('');
        
        // 确定警告级别
        const warningClass = aiResult.riskLevel === 'high' ? 'warning' : '';
        const warningTitle = aiResult.riskLevel === 'high' ? '风险提示' : '建议';
        
        analysisContent.innerHTML = `
            <div class="analysis-item">
                <strong>异常指标：</strong>
                <ul>${abnormalList}</ul>
            </div>
            <div class="analysis-item">
                <strong>可能原因分析：</strong>
                <ul>${causesList}</ul>
            </div>
            <div class="analysis-item ${warningClass}">
                <strong>${warningTitle}：</strong>
                <ul>${recommendationsList}</ul>
            </div>
        `;
    }
    
    // 用药AI分析功能
    function analyzeMedicationWithAI(medicationData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const analysis = {
                    medicationStatus: [],
                    drugActions: [],
                    recommendations: [],
                    riskLevel: 'normal'
                };

                // 评估用药情况（去除异常检测）
                if (medicationData.name.includes('阿莫西林')) {
                    if (medicationData.takenDoses < medicationData.prescribedDoses) {
                        analysis.medicationStatus.push('阿莫西林胶囊：用量合理，按时服用');
                    } else if (medicationData.takenDoses === medicationData.prescribedDoses) {
                        analysis.medicationStatus.push('阿莫西林胶囊：今日用药完成，按时服用');
                    }
                }
                
                if (medicationData.name.includes('布洛芬')) {
                    if (medicationData.lastTakenHours >= 6) {
                        analysis.medicationStatus.push('布洛芬片：用量合理，间隔适当');
                    } else {
                        analysis.medicationStatus.push('布洛芬片：按需服用，注意间隔');
                    }
                }

                // 药物作用分析（详细版）
                if (medicationData.name.includes('阿莫西林')) {
                    analysis.drugActions.push({
                        name: '阿莫西林',
                        action: '广谱抗生素，通过抑制细菌细胞壁合成发挥杀菌作用，对革兰氏阳性菌和阴性菌均有效，需完成整个疗程',
                        usage: '应在饭前1小时或饭后2小时服用，避免与乳制品同服'
                    });
                }
                
                if (medicationData.name.includes('布洛芬')) {
                    analysis.drugActions.push({
                        name: '布洛芬',
                        action: '非甾体抗炎药，通过抑制环氧化酶减少前列腺素合成，具有解热、镇痛、抗炎作用，按需服用',
                        usage: '饭后服用可减少胃肠道刺激，每6-8小时可重复用药，24小时内不超过4次'
                    });
                }

                // 合理用药建议
                analysis.recommendations.push('继续按照医嘱剂量服用阿莫西林，完成7天疗程');
                analysis.recommendations.push('布洛芬在发热或疼痛时按需服用，注意间隔时间');
                analysis.recommendations.push('保持良好的用药习惯，按时按量服药');
                analysis.recommendations.push('设置用药提醒，避免漏服或重复用药');
                analysis.recommendations.push('定期复查，评估治疗效果');

                resolve(analysis);
            }, 1500);
        });
    }

    function extractMedicationData() {
        const medications = [];
        document.querySelectorAll('.medication-card').forEach(card => {
            const name = card.querySelector('h4').textContent;
            const isAbnormal = card.classList.contains('abnormal');
            const dosageText = card.querySelector('.dosage-tracker span').textContent;
            const usageText = card.querySelector('.drug-usage').textContent;
            
            let overdose = false;
            let frequencyTooHigh = false;
            
            if (name.includes('阿莫西林')) {
                const match = dosageText.match(/(\d+)\/(\d+)次/);
                if (match && parseInt(match[1]) > parseInt(match[2])) {
                    overdose = true;
                }
            }
            
            if (name.includes('布洛芬')) {
                const match = dosageText.match(/(\d+)小时前/);
                if (match && parseInt(match[1]) < 4) {
                    frequencyTooHigh = true;
                }
            }

            medications.push({
                name,
                isAbnormal,
                overdose,
                frequencyTooHigh,
                dosageText,
                usageText
            });
        });
        
        return medications;
    }

    async function performMedicationAIAnalysis() {
        const medicationSection = document.querySelector('#medication');
        const aiAnalysis = medicationSection.querySelector('.ai-analysis-content');
        
        // 显示加载状态
        aiAnalysis.innerHTML = '<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> AI正在分析您的用药情况...</div>';
        
        try {
            const medications = extractMedicationData();
            const analysis = await analyzeMedicationWithAI(medications[0]); // 分析第一个药物
            
            // 更新AI分析显示
            updateAIMedicationAnalysisDisplay(analysis);
            
        } catch (error) {
            aiAnalysis.innerHTML = '<div class="ai-error"><i class="fas fa-exclamation-triangle"></i> AI分析失败，请稍后重试</div>';
            console.error('AI分析失败:', error);
        }
    }

    function updateAIMedicationAnalysisDisplay(analysis) {
        const medicationSection = document.querySelector('#medication');
        const aiAnalysis = medicationSection.querySelector('.ai-analysis-content');
        
        let html = '';
        
        if (analysis.medicationStatus.length > 0) {
            html += '<div class="analysis-item"><strong>用药情况评估：</strong><ul>';
            analysis.medicationStatus.forEach(status => {
                html += `<li>${status}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (analysis.drugActions.length > 0) {
            html += '<div class="analysis-item"><strong>药物作用分析：</strong><ul>';
            analysis.drugActions.forEach(drug => {
                html += `<li><strong>${drug.name}：</strong>${drug.action}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (analysis.recommendations.length > 0) {
            html += '<div class="analysis-item"><strong>用药建议：</strong><ul>';
            analysis.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul></div>';
        }
        
        aiAnalysis.innerHTML = html;
    }

    // 查看详情按钮点击事件
    const viewButtons = document.querySelectorAll('.btn-view');
    const reportDetails = document.querySelector('.report-details');
    const backToListBtn = document.querySelector('.btn-back-to-list');
    
    // 查看详情按钮点击事件
    viewButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const reportList = document.querySelector('.report-list');
            if (reportDetails.style.display === 'none' || !reportDetails.style.display) {
                reportDetails.style.display = 'block';
                reportList.style.display = 'none';
                this.textContent = '返回列表';
                
                // 获取报告数据并调用AI分析
                const reportItem = this.closest('.report-item');
                const reportData = extractReportData(reportItem);
                if (reportData.hasAbnormal) {
                    await performAIAnalysis(reportDetails, reportData);
                }
            } else {
                reportDetails.style.display = 'none';
                reportList.style.display = 'grid';
                this.textContent = '查看详情';
            }
        });
    });
    
    // 返回列表按钮点击事件
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function() {
            const reportList = document.querySelector('.report-list');
            reportDetails.style.display = 'none';
            reportList.style.display = 'grid';
            
            // 重置所有查看详情按钮的文字
            viewButtons.forEach(btn => {
                btn.textContent = '查看详情';
            });
        });
    }
    
    // 标记已服用按钮点击事件
    const takenButtons = document.querySelectorAll('.btn-taken');
    takenButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.medication-card');
            const tracker = card.querySelector('.dosage-tracker span');
            const progress = card.querySelector('.progress');
            
            if (this.textContent === '标记已服用') {
                this.innerHTML = '<i class="fas fa-check"></i> 已服用';
                this.style.background = '#28a745';
                
                // 更新进度
                if (tracker && progress) {
                    const currentText = tracker.textContent;
                    const match = currentText.match(/(\d+)\/(\d+)/);
                    if (match) {
                        const current = parseInt(match[1]) + 1;
                        const total = parseInt(match[2]);
                        if (current <= total) {
                            tracker.textContent = `今日已服用：${current}/${total}次`;
                            progress.style.width = `${(current/total)*100}%`;
                        }
                    }
                }
            }
        });
    });
    
    // 标签页切换功能
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabContainer = this.closest('.payment-tabs, .medication-tabs');
            const tabButtonsInContainer = tabContainer.querySelectorAll('.tab-btn');
            
            tabButtonsInContainer.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 这里可以添加对应内容的显示/隐藏逻辑
            const tabText = this.textContent;
            console.log(`切换到${tabText}标签页`);
            
            // 如果是缴费界面的标签页，加载对应数据
            if (tabContainer && tabContainer.classList.contains('payment-tabs')) {
                loadPaymentData(tabText);
            }
        });
    });
    
    // 添加移动端菜单切换功能
    const headerContent = document.querySelector('.header-content');
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navMenu = document.querySelector('.nav-menu');
    
    // 只在移动端显示菜单按钮
    function checkMobileMenu() {
        if (window.innerWidth <= 768) {
            if (!mobileMenuToggle.parentNode) {
                headerContent.insertBefore(mobileMenuToggle, navMenu);
            }
        } else {
            if (mobileMenuToggle.parentNode) {
                mobileMenuToggle.remove();
            }
            navMenu.classList.remove('active');
        }
    }
    
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // 点击导航项后关闭移动端菜单
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    // 窗口大小改变时检查菜单状态
    window.addEventListener('resize', checkMobileMenu);
    checkMobileMenu();
    
    // 添加粒子效果
    createParticles();
    
    // 添加滚动效果
    addScrollEffects();
    
    // 添加波纹效果
    addRippleEffects();
    
    // 添加加载动画
    addLoadAnimations();
    
    // 初始化语音输入功能
    initVoiceInput();
    
    // 初始化API配置
    initApiConfig();
    
    // 初始化缴费数据（现在由预约成功后的跳转逻辑触发）
});

// 创建粒子效果
function createParticles() {
    const particleContainer = document.getElementById('particleContainer');
    if (!particleContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particleContainer.appendChild(particle);
    }
}

// 添加滚动效果
function addScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 智能导诊AI功能
async function performTriageAI(symptoms) {
    // 获取Kimi API密钥（优先使用）
    let apiKey = HospitalApp.Config.getKimiApiKey();
    
    // 如果没有Kimi API密钥，尝试使用ChatGPT密钥
    if (!apiKey) {
        apiKey = HospitalApp.Config.getApiKey();
    }
    
    if (!apiKey) {
        throw new Error('未配置API密钥');
    }
    
    // 尝试不同的API端点以解决CORS问题 (优先使用Kimi模型，失败时使用ChatGPT)
    const apiEndpoints = [
        HospitalApp.Config.chatgpt.baseUrl + '/chat/completions',  // ChatGPT优先（更稳定）
        'http://localhost:8080/proxy/openkey.cloud/v1/chat/completions',
        HospitalApp.Config.kimi.baseUrl + '/chat/completions',     // Kimi作为备选
        'http://localhost:8080/proxy/api.moonshot.cn/v1/chat/completions'
    ];
    
    let lastError = null;
    
    for (const apiUrl of apiEndpoints) {
        try {
            console.log(`尝试API端点: ${apiUrl}`);
            return await performTriageAIWithEndpoint(symptoms, apiKey, apiUrl);
        } catch (error) {
            console.error(`API端点 ${apiUrl} 失败:`, error);
            lastError = error;
            
            // 如果是网络错误或CORS错误，尝试下一个端点
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                continue; // 尝试下一个端点
            } else {
                throw error; // 其他类型的错误直接抛出
            }
        }
    }
    
    // 所有端点都失败了，抛出最后一个错误
    throw lastError;
}

async function performTriageAIWithEndpoint(symptoms, apiKey, apiUrl) {
    // 根据API端点选择正确的密钥
    let endpointApiKey = apiKey;
    if (apiUrl.includes('moonshot')) {
        // 使用Kimi API密钥
        endpointApiKey = HospitalApp.Config.kimi.apiKey;
    } else if (apiUrl.includes('openkey')) {
        // 使用ChatGPT API密钥
        endpointApiKey = HospitalApp.Config.chatgpt.apiKey;
    }
    
    // 首先尝试使用模拟API
    try {
        const simulationResult = simulateTriageAPI(symptoms);
        if (simulationResult.success && simulationResult.data.confidence >= 0.6) {
            console.log('使用模拟API结果，置信度:', simulationResult.data.confidence);
            return simulationResult.data;
        }
    } catch (simulationError) {
        console.log('模拟API失败，使用真实API:', simulationError);
    }
    
    // 构建专业的医疗导诊提示词
    const systemPrompt = `你是一位经验丰富的医疗导诊专家。请根据患者描述的症状，提供以下信息：

1. 推荐科室：根据症状分析，推荐最适合的就诊科室
2. 可能病因：分析可能导致这些症状的常见原因（仅供参考，不能替代专业医疗诊断）
3. 就诊建议：提供初步的就诊建议和注意事项
4. 紧急程度：评估症状的紧急程度（轻微/一般/紧急）

请以JSON格式回复，结构如下：
{
  "recommendedDepartment": "推荐的科室名称",
  "possibleCauses": ["可能的病因1", "可能的病因2", "可能的病因3"],
  "urgencyLevel": "轻微|一般|紧急",
  "medicalAdvice": "就诊建议和注意事项",
  "confidence": 0.8
}

注意：
- 这只是导诊建议，不能替代专业医疗诊断
- 如症状严重或持续恶化，请立即就医
- 紧急症状请直接前往急诊科`;

    const userPrompt = `患者症状描述：${symptoms}

请提供专业的导诊建议。`;
    
    try {
        // 添加更详细的错误处理和超时设置
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${endpointApiKey}`
            },
            body: JSON.stringify({
                model: apiUrl.includes('moonshot') ? HospitalApp.Config.kimi.model : (HospitalApp.Config.chatgpt.model || 'gpt-3.5-turbo'),
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: apiUrl.includes('moonshot') ? HospitalApp.Config.kimi.temperature : HospitalApp.Config.chatgpt.temperature,
                max_tokens: apiUrl.includes('moonshot') ? HospitalApp.Config.kimi.maxTokens : HospitalApp.Config.chatgpt.maxTokens
            }),
            signal: controller.signal,
            mode: 'cors', // 明确指定CORS模式
            credentials: 'omit' // 不发送cookies
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            const modelName = apiUrl.includes('moonshot') ? 'Kimi' : 'ChatGPT';
            throw new Error(`${modelName} API错误: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        const aiResponse = result.choices[0].message.content;
        
        // 解析JSON响应
        try {
            const parsedResponse = JSON.parse(aiResponse);
            return parsedResponse;
        } catch (parseError) {
            // 如果AI返回的不是有效JSON，尝试提取关键信息
            return extractTriageInfo(aiResponse);
        }
        
    } catch (error) {
        const modelName = apiUrl.includes('moonshot') ? 'Kimi' : 'ChatGPT';
        console.error(`${modelName} API调用失败:`, error);
        throw error;
    }
}

// 模拟API调用函数
function simulateTriageAPI(symptoms) {
    console.log(`正在分析症状: ${symptoms}`);
    
    // 医疗导诊模拟数据
    const triageData = {
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
    const symptomKeywords = {
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
    
    // 标准化症状描述
    let normalizedSymptoms = symptoms;
    for (const [keyword, standardSymptom] of Object.entries(symptomKeywords)) {
        if (symptoms.includes(keyword)) {
            normalizedSymptoms = standardSymptom;
            break;
        }
    }
    
    // 查找匹配的症状
    for (const [symptom, data] of Object.entries(triageData)) {
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

// 从关键词提取症状信息
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

// 提取导诊信息（当AI返回非JSON格式时）
function extractTriageInfo(text) {
    const lines = text.split('\n');
    let department = '内科'; // 默认科室
    let causes = [];
    let urgency = '一般';
    let advice = '建议及时就医检查';
    
    // 简单的关键词匹配
    if (text.includes('外科') || text.includes('手术')) department = '外科';
    if (text.includes('儿科')) department = '儿科';
    if (text.includes('妇产科') || text.includes('妇科')) department = '妇产科';
    if (text.includes('眼科')) department = '眼科';
    if (text.includes('耳鼻喉科')) department = '耳鼻喉科';
    if (text.includes('皮肤科')) department = '皮肤科';
    if (text.includes('神经科') || text.includes('神经')) department = '神经内科';
    if (text.includes('心脏') || text.includes('心血管')) department = '心内科';
    
    // 提取可能的病因
    if (text.includes('感冒') || text.includes('感染')) causes.push('感冒或病毒感染');
    if (text.includes('炎症')) causes.push('炎症反应');
    if (text.includes('过敏')) causes.push('过敏反应');
    
    if (causes.length === 0) {
        causes = ['需要进一步检查确定'];
    }
    
    return {
        recommendedDepartment: department,
        possibleCauses: causes,
        urgencyLevel: urgency,
        medicalAdvice: advice,
        confidence: 0.5
    };
}

// 显示AI导诊结果
function displayTriageResult(aiRecommendation) {
    const deptRecommendation = document.querySelector('.department-recommendation');
    const recommendationCard = deptRecommendation.querySelector('.recommendation-card');
    
    // 显示推荐科室区域
    deptRecommendation.style.display = 'block';
    
    // 获取当前日期和时间
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    let timeSlot = '';
    
    // 根据当前时间推荐时间段
    if (currentHour < 9) {
        timeSlot = '09:00';
    } else if (currentHour < 12) {
        timeSlot = '10:00';
    } else if (currentHour < 15) {
        timeSlot = '14:00';
    } else if (currentHour < 17) {
        timeSlot = '15:00';
    } else {
        timeSlot = '16:00';
    }
    
    // 更新科室推荐卡片，添加智能跳转功能
    recommendationCard.innerHTML = `
        <div class="dept-info">
            <h4>${aiRecommendation.recommendedDepartment}</h4>
            <p><strong>可能病因：</strong>${aiRecommendation.possibleCauses.join('、')}</p>
            <p><strong>紧急程度：</strong><span class="urgency-${aiRecommendation.urgencyLevel}">${aiRecommendation.urgencyLevel}</span></p>
            <p><strong>就诊建议：</strong>${aiRecommendation.medicalAdvice}</p>
            <div class="dept-stats">
                <span><i class="fas fa-user-md"></i> 医生：12人</span>
                <span><i class="fas fa-clock"></i> 等待：15分钟</span>
            </div>
            <div class="ai-confidence">
                <span><i class="fas fa-robot"></i> AI置信度：${Math.round((aiRecommendation.confidence || 0.5) * 100)}%</span>
            </div>
            <div class="smart-recommendation" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0; font-size: 0.9rem; color: #495057;">
                    <i class="fas fa-magic"></i> <strong>智能推荐：</strong>
                    建议预约 ${today} ${timeSlot} 时段，${aiRecommendation.recommendedDepartment}专家坐诊
                </p>
            </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="btn-secondary" onclick="jumpToAppointment('${aiRecommendation.recommendedDepartment}', '${today}', '${timeSlot}')">
                <i class="fas fa-arrow-right"></i> 立即挂号
            </button>
            <button class="btn-primary" onclick="jumpToAppointmentWithTimeSlot('${aiRecommendation.recommendedDepartment}', '${today}', '${timeSlot}')">
                <i class="fas fa-calendar-check"></i> 前往推荐时段预约
            </button>
        </div>
    `;
    
    // 添加紧急程度样式
    const urgencySpan = recommendationCard.querySelector('.urgency-' + aiRecommendation.urgencyLevel);
    if (urgencySpan) {
        urgencySpan.style.padding = '2px 8px';
        urgencySpan.style.borderRadius = '12px';
        urgencySpan.style.fontSize = '0.85rem';
        urgencySpan.style.fontWeight = 'bold';
        
        if (aiRecommendation.urgencyLevel === '紧急') {
            urgencySpan.style.background = '#e74c3c';
            urgencySpan.style.color = 'white';
        } else if (aiRecommendation.urgencyLevel === '一般') {
            urgencySpan.style.background = '#f39c12';
            urgencySpan.style.color = 'white';
        } else {
            urgencySpan.style.background = '#27ae60';
            urgencySpan.style.color = 'white';
        }
    }
}

// 显示默认导诊结果（当AI调用失败时）
function displayDefaultTriage(symptoms) {
    const deptRecommendation = document.querySelector('.department-recommendation');
    const recommendationCard = deptRecommendation.querySelector('.recommendation-card');
    
    // 显示推荐科室区域
    deptRecommendation.style.display = 'block';
    
    // 获取当前日期和时间
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    let timeSlot = '';
    
    // 根据当前时间推荐时间段
    if (currentHour < 9) {
        timeSlot = '09:00';
    } else if (currentHour < 12) {
        timeSlot = '10:00';
    } else if (currentHour < 15) {
        timeSlot = '14:00';
    } else if (currentHour < 17) {
        timeSlot = '15:00';
    } else {
        timeSlot = '16:00';
    }
    
    // 简单的关键词匹配
    let department = '内科';
    if (symptoms.includes('外科') || symptoms.includes('手术')) department = '外科';
    if (symptoms.includes('儿科')) department = '儿科';
    if (symptoms.includes('妇产科') || symptoms.includes('妇科')) department = '妇产科';
    if (symptoms.includes('眼科')) department = '眼科';
    if (symptoms.includes('耳鼻喉科')) department = '耳鼻喉科';
    
    recommendationCard.innerHTML = `
        <div class="dept-info">
            <h4>${department}</h4>
            <p><strong>症状分析：</strong>基于关键词匹配</p>
            <p><strong>就诊建议：</strong>建议及时就医检查，明确诊断</p>
            <div class="dept-stats">
                <span><i class="fas fa-user-md"></i> 医生：12人</span>
                <span><i class="fas fa-clock"></i> 等待：15分钟</span>
            </div>
            <div class="ai-confidence">
                <span><i class="fas fa-info-circle"></i> 默认推荐模式</span>
            </div>
            <div class="smart-recommendation" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0; font-size: 0.9rem; color: #495057;">
                    <i class="fas fa-magic"></i> <strong>智能推荐：</strong>
                    建议预约 ${today} ${timeSlot} 时段，${department}专家坐诊
                </p>
            </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="btn-secondary" onclick="jumpToAppointment('${department}', '${today}', '${timeSlot}')">
                <i class="fas fa-arrow-right"></i> 立即挂号
            </button>
            <button class="btn-primary" onclick="jumpToAppointmentWithTimeSlot('${department}', '${today}', '${timeSlot}')">
                <i class="fas fa-calendar-check"></i> 前往推荐时段预约
            </button>
        </div>
    `;
}

// 添加波纹效果
function addRippleEffects() {
    const buttons = document.querySelectorAll('.btn, .service-card, .time-slot, .symptom-tag');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 添加加载动画
function addLoadAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有卡片元素
    const cards = document.querySelectorAll('.service-card, .doctor-card, .report-card, .payment-item, .medication-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 智能跳转到挂号预约页面
function jumpToAppointment(department, date, timeSlot) {
    // 跳转到预约页面
    showSection('appointment');
    
    // 延迟执行，确保页面切换完成
    setTimeout(() => {
        // 自动选择科室
        const departmentSelect = document.getElementById('department-select');
        if (departmentSelect) {
            // 科室名称映射
            const deptMapping = {
                '呼吸内科': 'respiratory',
                '消化内科': 'digestive', 
                '神经内科': 'neurology',
                '心内科': 'cardiology',
                '外科': 'surgery',
                '儿科': 'pediatrics',
                '泌尿外科': 'urology',
                '妇产科': 'obstetrics',
                '骨科': 'orthopedics',
                '皮肤科': 'dermatology',
                '眼科': 'ophthalmology',
                '耳鼻喉科': 'ent',
                '急诊科': 'emergency',
                '发热门诊': 'fever',
                '内科': 'general'
            };
            
            const deptValue = deptMapping[department] || 'general';
            departmentSelect.value = deptValue;
            
            // 触发科室变更事件，更新医生列表
            const event = new Event('change');
            departmentSelect.dispatchEvent(event);
        }
        
        // 自动选择日期
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            dateInput.value = date;
        }
        
        // 等待医生列表加载完成，然后选择医生和时间
        setTimeout(() => {
            // 首先自动选择第一个医生（如果还没有选择医生）
            const doctorCards = document.querySelectorAll('.doctor-card');
            const selectedDoctorCard = document.querySelector('.doctor-card.selected');
            if (doctorCards.length > 0 && !selectedDoctorCard) {
                // 自动选择第一个医生
                doctorCards[0].classList.add('selected');
                console.log('自动选择第一个医生:', doctorCards[0].querySelector('h4').textContent);
            }
            
            // 然后自动选择时间段
            const timeSlotElements = document.querySelectorAll('.time-slot');
            timeSlotElements.forEach(slot => {
                slot.classList.remove('selected');
                // 重置样式
                slot.style.background = '';
                slot.style.color = '';
                
                if (slot.textContent.includes(timeSlot)) {
                    slot.classList.add('selected');
                    slot.style.background = '#2c5aa0';
                    slot.style.color = 'white';
                    
                    console.log('自动选择时间段:', timeSlot);
                }
            });
            
            // 重要：直接调用更新函数，确保预约状态正确更新
            updateAppointmentSummary();
            
            // 再次确保预约摘要更新
            setTimeout(() => {
                updateAppointmentSummary();
            }, 200);
        }, 800); // 等待800ms让医生列表加载完成
        
        // 显示成功提示
        if (window.HospitalApp && window.HospitalApp.showNotification) {
            window.HospitalApp.showNotification(`已为您预约${department} ${date} ${timeSlot}`, 'success');
        }
        
        // 滚动到预约区域
        const appointmentSection = document.getElementById('appointment');
        if (appointmentSection) {
            const doctorList = appointmentSection.querySelector('.doctor-list');
            if (doctorList) {
                doctorList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 500);
}

// 直接跳转到推荐时段预约界面
function jumpToAppointmentWithTimeSlot(department, date, timeSlot) {
    // 跳转到预约页面
    showSection('appointment');
    
    // 延迟执行，确保页面切换完成
    setTimeout(() => {
        // 自动选择科室
        const departmentSelect = document.getElementById('department-select');
        if (departmentSelect) {
            // 科室名称映射
            const deptMapping = {
                '呼吸内科': 'respiratory',
                '消化内科': 'digestive', 
                '神经内科': 'neurology',
                '心内科': 'cardiology',
                '外科': 'surgery',
                '儿科': 'pediatrics',
                '泌尿外科': 'urology',
                '妇产科': 'obstetrics',
                '骨科': 'orthopedics',
                '皮肤科': 'dermatology',
                '眼科': 'ophthalmology',
                '耳鼻喉科': 'ent',
                '急诊科': 'emergency',
                '发热门诊': 'fever',
                '内科': 'general'
            };
            
            const deptValue = deptMapping[department] || 'general';
            departmentSelect.value = deptValue;
            
            // 触发科室变更事件，更新医生列表
            const event = new Event('change');
            departmentSelect.dispatchEvent(event);
        }
        
        // 自动选择日期
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            dateInput.value = date;
            // 触发日期变更事件
            const dateEvent = new Event('change');
            dateInput.dispatchEvent(dateEvent);
        }
        
        // 等待医生列表加载完成，然后选择医生和时间
        // 医生列表是通过科室变更事件异步加载的
        setTimeout(() => {
            // 首先自动选择第一个医生（如果还没有选择医生）
            const doctorCards = document.querySelectorAll('.doctor-card');
            const selectedDoctorCard = document.querySelector('.doctor-card.selected');
            if (doctorCards.length > 0 && !selectedDoctorCard) {
                // 自动选择第一个医生
                doctorCards[0].classList.add('selected');
                console.log('自动选择第一个医生:', doctorCards[0].querySelector('h4').textContent);
            }
            
            // 然后自动选择时间段
            const timeSlotElements = document.querySelectorAll('.time-slot');
            timeSlotElements.forEach(slot => {
                slot.classList.remove('selected');
                // 重置样式
                slot.style.background = '';
                slot.style.color = '';
                
                if (slot.textContent.includes(timeSlot)) {
                    slot.classList.add('selected');
                    slot.style.background = '#2c5aa0';
                    slot.style.color = 'white';
                    
                    console.log('自动选择时间段:', timeSlot);
                }
            });
            
            // 重要：直接调用更新函数，确保预约状态正确更新
            updateAppointmentSummary();
            
            // 再次确保预约摘要更新
            setTimeout(() => {
                updateAppointmentSummary();
            }, 200);
        }, 800); // 等待800ms让医生列表加载完成
        
        // 显示成功提示
        if (window.HospitalApp && window.HospitalApp.showNotification) {
            window.HospitalApp.showNotification(`已为您智能推荐${department} ${date} ${timeSlot}时段`, 'success');
        }
        
        // 滚动到预约确认区域，突出显示推荐时段
        const appointmentSection = document.getElementById('appointment');
        if (appointmentSection) {
            const appointmentConfirm = appointmentSection.querySelector('.appointment-confirm');
            if (appointmentConfirm) {
                appointmentConfirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 高亮显示推荐的时间段
                setTimeout(() => {
                    const selectedSlot = document.querySelector('.time-slot.selected');
                    if (selectedSlot) {
                        selectedSlot.style.animation = 'pulse 1s ease-in-out 3';
                        setTimeout(() => {
                            selectedSlot.style.animation = '';
                        }, 3000);
                    }
                }, 1000);
            }
        }
    }, 500);
}

// 显示指定部分的函数
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// 工具函数：格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 工具函数：计算倒计时
function getTimeRemaining(endTime) {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
}

// 一键智能分析多个症状
function analyzeMultipleSymptoms() {
    const selectedSymptoms = [];
    const symptomTags = document.querySelectorAll('.symptom-tag.selected');
    
    symptomTags.forEach(tag => {
        const symptom = tag.getAttribute('data-symptom');
        if (symptom) {
            selectedSymptoms.push(symptom);
        }
    });
    
    if (selectedSymptoms.length === 0) {
        if (window.HospitalApp && window.HospitalApp.showNotification) {
            window.HospitalApp.showNotification('请先选择症状', 'error');
        }
        return;
    }
    
    // 将症状合并为字符串
    const symptomsText = selectedSymptoms.join('，');
    
    // 填充到症状输入框
    const symptomInput = document.getElementById('symptom-input');
    if (symptomInput) {
        symptomInput.value = symptomsText;
    }
    
    // 自动开始导诊
    if (window.HospitalApp && window.HospitalApp.showNotification) {
        window.HospitalApp.showNotification(`正在分析症状：${symptomsText}`, 'info');
    }
    
    // 延迟执行导诊，让用户看到提示
    setTimeout(() => {
        performTriage();
    }, 1000);
}

// 添加一些实用的全局函数
window.HospitalApp = window.HospitalApp || {};
Object.assign(window.HospitalApp, {
    // 显示通知
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },
    
    // 确认对话框
    showConfirm: function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },
    
    // 格式化货币
    formatCurrency: function(amount) {
        return '¥' + parseFloat(amount).toFixed(2);
    },
    
    // 生成随机ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    }
});

// 语音输入功能
function initVoiceInput() {
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceRecording = document.getElementById('voiceRecording');
    const recordingTimer = document.getElementById('recordingTimer');
    const voiceResult = document.getElementById('voiceResult');
    const recognizedText = document.getElementById('recognizedText');
    const saveVoiceBtn = document.getElementById('saveVoiceBtn');
    const retryVoiceBtn = document.getElementById('retryVoiceBtn');
    
    let mediaRecorder;
    let audioChunks = [];
    let recordingStartTime;
    let timerInterval;
    let isRecording = false;
    
    // 检查浏览器是否支持录音
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        voiceStatus.textContent = '您的浏览器不支持录音功能';
        voiceInputBtn.disabled = true;
        voiceInputBtn.style.opacity = '0.5';
        return;
    }
    
    // 录音按钮点击事件
    voiceInputBtn.addEventListener('click', async function() {
        if (!isRecording) {
            await startRecording();
        } else {
            stopRecording();
        }
    });
    
    // 开始录音
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 创建MediaRecorder实例
            const options = {
                mimeType: 'audio/webm;codecs=opus'
            };
            
            // 如果webm不支持，尝试其他格式
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/ogg;codecs=opus';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'audio/wav';
                }
            }
            
            mediaRecorder = new MediaRecorder(stream, options);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = function() {
                processRecording();
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            
            // 更新UI状态
            voiceInputBtn.classList.add('recording');
            voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i> <span>停止录音</span>';
            voiceStatus.textContent = '正在录音，请说出您的需求...';
            voiceRecording.classList.add('active');
            
            // 开始计时器
            startTimer();
            
        } catch (error) {
            console.error('录音启动失败:', error);
            voiceStatus.textContent = '无法访问麦克风，请检查权限设置';
            HospitalApp.showNotification('录音启动失败，请检查麦克风权限', 'error');
        }
    }
    
    // 停止录音
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            
            // 停止计时器
            stopTimer();
            
            // 更新UI状态
            voiceInputBtn.classList.remove('recording');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i> <span>语音输入需求</span>';
            voiceStatus.textContent = '正在处理录音...';
            voiceRecording.classList.remove('active');
        }
    }
    
    // 处理录音数据
    function processRecording() {
        if (audioChunks.length === 0) {
            voiceStatus.textContent = '录音时间太短，请重新录制';
            return;
        }
        
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // 显示识别结果区域
        voiceResult.style.display = 'block';
        recognizedText.textContent = '正在识别语音内容...';
        
        // 模拟语音识别（实际项目中应该调用真实的语音识别API）
        simulateVoiceRecognition(audioBlob, audioUrl);
    }
    
    // 使用Whisper API进行真实语音识别
    async function performWhisperRecognition(audioBlob, audioUrl) {
        // 显示识别结果区域
        voiceResult.style.display = 'block';
        recognizedText.textContent = '正在连接Whisper API进行语音识别...';
        
        try {
            // 检查API密钥
            const apiKey = HospitalApp.Config.getApiKey();
            if (!apiKey) {
                recognizedText.textContent = 'Whisper API密钥未配置，使用模拟识别';
                HospitalApp.showNotification('请在config.js中配置Whisper API密钥', 'warning');
                // 回退到模拟识别
                performSimulatedRecognition(audioBlob, audioUrl);
                return;
            }
            
            // 尝试不同的API端点以解决CORS问题
            const whisperEndpoints = [
                `${HospitalApp.Config.whisper.baseUrl}/audio/transcriptions`,
                `http://localhost:8080/proxy/openkey.cloud/v1/audio/transcriptions`
            ];
            
            let lastError = null;
            
            for (const whisperUrl of whisperEndpoints) {
                try {
                    console.log(`尝试Whisper端点: ${whisperUrl}`);
                    return await performWhisperWithEndpoint(audioBlob, audioUrl, apiKey, whisperUrl);
                } catch (error) {
                    console.error(`Whisper端点 ${whisperUrl} 失败:`, error);
                    lastError = error;
                    
                    // 如果是网络错误或CORS错误，尝试下一个端点
                    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                        continue; // 尝试下一个端点
                    } else {
                        throw error; // 其他类型的错误直接抛出
                    }
                }
            }
            
            // 所有端点都失败了，回退到模拟识别
            console.log('所有Whisper端点都失败，使用模拟识别');
            performSimulatedRecognition(audioBlob, audioUrl);
            
        } catch (error) {
            console.error('Whisper API调用失败:', error);
            recognizedText.textContent = 'Whisper API调用失败，使用模拟识别';
            voiceStatus.textContent = '语音识别失败，请重试';
            HospitalApp.showNotification(`语音识别失败: ${error.message}`, 'error');
            
            // 回退到模拟识别
            performSimulatedRecognition(audioBlob, audioUrl);
        }
    }
    
    // 使用指定端点进行Whisper识别
    async function performWhisperWithEndpoint(audioBlob, audioUrl, apiKey, whisperUrl) {
        // 准备音频文件
        const audioFile = new File([audioBlob], `voice_recording_${Date.now()}.webm`, {
            type: audioBlob.type || 'audio/webm'
        });
        
        // 创建FormData
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', HospitalApp.Config.whisper.model);
        formData.append('language', HospitalApp.Config.whisper.language);
        formData.append('response_format', HospitalApp.Config.whisper.responseFormat);
        
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        // 调用Whisper API
        const response = await fetch(whisperUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Whisper API错误: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        const transcribedText = result.text || result.transcription || '';
        
        if (!transcribedText) {
            throw new Error('未能从Whisper API获取识别结果');
        }
        
        // 显示识别结果
        recognizedText.textContent = transcribedText;
        voiceStatus.textContent = '语音识别完成 (Whisper API)';
        
        // 保存识别结果
        window.lastVoiceResult = {
            text: transcribedText,
            audioBlob: audioBlob,
            audioUrl: audioUrl,
            timestamp: new Date().toISOString(),
            apiSource: 'whisper'
        };
        
        // 根据识别结果自动导航
        handleVoiceCommand(transcribedText);
        
        HospitalApp.showNotification('语音识别成功！', 'success');
        
        return transcribedText; // 返回识别结果
    }
    
    // 模拟语音识别功能（作为备用）
    function performSimulatedRecognition(audioBlob, audioUrl) {
        // 这里模拟语音识别结果
        const simulatedResults = [
            "我想预约内科医生",
            "我需要查看我的检查报告",
            "我要缴纳医疗费用",
            "我需要用药指导",
            "我头痛和发热，应该看什么科"
        ];
        
        // 随机选择一个模拟结果
        const randomResult = simulatedResults[Math.floor(Math.random() * simulatedResults.length)];
        
        // 显示识别结果
        recognizedText.textContent = randomResult;
        voiceStatus.textContent = '语音识别完成 (模拟)';
        
        // 将识别结果保存到全局变量，供后续使用
        window.lastVoiceResult = {
            text: randomResult,
            audioBlob: audioBlob,
            audioUrl: audioUrl,
            timestamp: new Date().toISOString(),
            apiSource: 'simulated'
        };
        
        // 根据识别结果自动导航到相关功能
        handleVoiceCommand(randomResult);
    }
    
    // 原有的模拟函数，现在作为备用方案
    function simulateVoiceRecognition(audioBlob, audioUrl) {
        performWhisperRecognition(audioBlob, audioUrl);
    }
    
    // 处理语音命令
    function handleVoiceCommand(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('预约') || lowerText.includes('挂号')) {
            setTimeout(() => {
                HospitalApp.showNotification('正在跳转到挂号预约...', 'info');
                showSection('appointment');
            }, 1000);
        } else if (lowerText.includes('报告') || lowerText.includes('检查')) {
            setTimeout(() => {
                HospitalApp.showNotification('正在跳转到检查报告...', 'info');
                showSection('reports');
            }, 1000);
        } else if (lowerText.includes('缴费') || lowerText.includes('费用')) {
            setTimeout(() => {
                HospitalApp.showNotification('正在跳转到缴费查询...', 'info');
                showSection('payment');
            }, 1000);
        } else if (lowerText.includes('用药') || lowerText.includes('药品')) {
            setTimeout(() => {
                HospitalApp.showNotification('正在跳转到用药指导...', 'info');
                showSection('medication');
            }, 1000);
        } else if (lowerText.includes('导诊') || lowerText.includes('症状')) {
            setTimeout(() => {
                HospitalApp.showNotification('正在跳转到智能导诊...', 'info');
                showSection('triage');
            }, 1000);
        }
    }
    
    // 计时器功能
    function startTimer() {
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            recordingTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 100);
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        recordingTimer.textContent = '00:00';
    }
    
    // 保存录音按钮事件
    saveVoiceBtn.addEventListener('click', function() {
        if (window.lastVoiceResult) {
            saveVoiceRecording(window.lastVoiceResult);
        }
    });
    
    // 重新录制按钮事件
    retryVoiceBtn.addEventListener('click', function() {
        voiceResult.style.display = 'none';
        voiceStatus.textContent = '点击按钮开始语音输入';
        if (window.lastVoiceResult && window.lastVoiceResult.audioUrl) {
            URL.revokeObjectURL(window.lastVoiceResult.audioUrl);
        }
        window.lastVoiceResult = null;
    });
    
    // 保存录音到本地存储
    function saveVoiceRecording(voiceData) {
        try {
            // 创建录音记录
            const recording = {
                id: HospitalApp.generateId(),
                text: voiceData.text,
                timestamp: voiceData.timestamp,
                fileName: `voice_recording_${new Date().getTime()}.webm`
            };
            
            // 获取现有的录音记录
            let recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
            recordings.unshift(recording);
            
            // 保存到本地存储
            localStorage.setItem('voiceRecordings', JSON.stringify(recordings));
            
            // 创建并下载音频文件
            const audioBlob = voiceData.audioBlob;
            const audioUrl = voiceData.audioUrl;
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = audioUrl;
            downloadLink.download = recording.fileName;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            HospitalApp.showNotification('录音已保存到本地存储并下载', 'success');
            
            // 保存音频数据到localStorage（可选，但可能会占用较多空间）
            if (audioBlob.size < 5 * 1024 * 1024) { // 小于5MB才保存
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64Audio = e.target.result;
                    const audioStorage = JSON.parse(localStorage.getItem('voiceAudioData') || '{}');
                    audioStorage[recording.id] = base64Audio;
                    localStorage.setItem('voiceAudioData', JSON.stringify(audioStorage));
                };
                reader.readAsDataURL(audioBlob);
            }
            
        } catch (error) {
            console.error('保存录音失败:', error);
            HospitalApp.showNotification('保存录音失败', 'error');
        }
    }
    
    // 获取所有录音记录（全局函数）
    window.getVoiceRecordings = function() {
        return JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
    };
    
    // 获取特定录音的音频数据
    window.getVoiceAudioData = function(recordingId) {
        const audioStorage = JSON.parse(localStorage.getItem('voiceAudioData') || '{}');
        return audioStorage[recordingId];
    };
    
    // 删除录音记录
    window.deleteVoiceRecording = function(recordingId) {
        try {
            let recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
            recordings = recordings.filter(r => r.id !== recordingId);
            localStorage.setItem('voiceRecordings', JSON.stringify(recordings));
            
            // 同时删除音频数据
            const audioStorage = JSON.parse(localStorage.getItem('voiceAudioData') || '{}');
            delete audioStorage[recordingId];
            localStorage.setItem('voiceAudioData', JSON.stringify(audioStorage));
            
            HospitalApp.showNotification('录音已删除', 'success');
        } catch (error) {
            console.error('删除录音失败:', error);
            HospitalApp.showNotification('删除录音失败', 'error');
        }
    };
}

// API配置功能 - 已移除界面配置，改为配置文件管理
function initApiConfig() {
    // API配置现在完全通过配置文件管理，不再提供界面配置
    console.log('API配置已通过config.js文件管理');
}

// 预约确认功能相关函数
function updateAppointmentSummary() {
    const departmentSelect = document.getElementById('department-select');
    const appointmentDate = document.getElementById('appointment-date');
    const selectedDoctorCard = document.querySelector('.doctor-card.selected');
    const selectedTimeSlot = document.querySelector('.time-slot.selected');
    const confirmBtn = document.getElementById('confirm-appointment-btn');
    
    // 更新摘要信息
    const summaryDepartment = document.getElementById('summary-department');
    const summaryDoctor = document.getElementById('summary-doctor');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryFee = document.getElementById('summary-fee');
    
    let hasDepartment = false;
    let hasDoctor = false;
    let hasDate = false;
    let hasTime = false;
    
    // 科室信息
    if (departmentSelect && departmentSelect.value) {
        const departmentText = departmentSelect.options[departmentSelect.selectedIndex].text;
        summaryDepartment.textContent = departmentText;
        hasDepartment = true;
    } else {
        summaryDepartment.textContent = '未选择';
    }
    
    // 医生信息
    if (selectedDoctorCard) {
        const doctorName = selectedDoctorCard.querySelector('h4').textContent;
        const doctorTitle = selectedDoctorCard.querySelector('.doctor-title').textContent;
        summaryDoctor.textContent = `${doctorName} (${doctorTitle})`;
        hasDoctor = true;
        
        // 获取费用信息
        const feeInfo = selectedDoctorCard.querySelector('.fee');
        if (feeInfo) {
            summaryFee.textContent = feeInfo.textContent;
        }
    } else {
        summaryDoctor.textContent = '未选择';
        summaryFee.textContent = '¥0';
    }
    
    // 日期信息
    if (appointmentDate && appointmentDate.value) {
        const date = new Date(appointmentDate.value);
        const formattedDate = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[date.getDay()];
        summaryDate.textContent = `${formattedDate} ${weekday}`;
        hasDate = true;
    } else {
        summaryDate.textContent = '未选择';
    }
    
    // 时间信息
    if (selectedTimeSlot) {
        summaryTime.textContent = selectedTimeSlot.textContent;
        hasTime = true;
    } else {
        summaryTime.textContent = '未选择';
    }
    
    // 启用/禁用确认按钮
    if (confirmBtn) {
        if (hasDepartment && hasDoctor && hasDate && hasTime) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('disabled');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('disabled');
        }
    }
}

function confirmAppointment() {
    const departmentSelect = document.getElementById('department-select');
    const appointmentDate = document.getElementById('appointment-date');
    const selectedDoctorCard = document.querySelector('.doctor-card.selected');
    const selectedTimeSlot = document.querySelector('.time-slot.selected');
    
    if (!departmentSelect.value || !appointmentDate.value || !selectedDoctorCard || !selectedTimeSlot) {
        HospitalApp.showNotification('请完整填写预约信息', 'warning');
        return;
    }
    
    const confirmBtn = document.getElementById('confirm-appointment-btn');
    const originalText = confirmBtn.innerHTML;
    
    // 显示处理状态
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 预约中...';
    confirmBtn.disabled = true;
    
    // 模拟预约处理
    setTimeout(() => {
        // 生成预约号
        const appointmentNumber = 'A' + Date.now().toString().slice(-6);
        const appointmentTime = new Date().toLocaleString('zh-CN');
        
        // 获取预约信息
        const departmentText = departmentSelect.options[departmentSelect.selectedIndex].text;
        const doctorName = selectedDoctorCard.querySelector('h4').textContent;
        const doctorTitle = selectedDoctorCard.querySelector('.doctor-title').textContent;
        const fee = selectedDoctorCard.querySelector('.fee').textContent;
        
        // 保存预约信息到本地存储
        const appointmentData = {
            appointmentNumber: appointmentNumber,
            department: departmentText,
            doctor: `${doctorName} (${doctorTitle})`,
            date: appointmentDate.value,
            time: selectedTimeSlot.textContent,
            fee: fee,
            status: '已预约',
            createTime: appointmentTime,
            patientName: '患者' + Math.floor(Math.random() * 1000)
        };
        
        // 保存到本地存储
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.unshift(appointmentData);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // 恢复按钮状态
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
        
        // 显示成功消息
        HospitalApp.showNotification(`预约成功！预约号：${appointmentNumber}`, 'success');
        
        // 显示预约详情弹窗
        showAppointmentSuccess(appointmentData);
        
        // 添加缴费数据到本地存储
        const paymentData = {
            orderNumber: 'P' + Date.now().toString().slice(-8),
            appointmentNumber: appointmentNumber,
            items: [
                {
                    name: '挂号费',
                    amount: parseFloat(fee.replace('¥', '').replace('元', '')) || 15,
                    type: 'registration'
                }
            ],
            totalAmount: parseFloat(fee.replace('¥', '').replace('元', '')) || 15,
            status: '待支付',
            createTime: appointmentTime,
            department: departmentText,
            doctor: `${doctorName} (${doctorTitle})`,
            appointmentDate: appointmentDate.value,
            appointmentTime: selectedTimeSlot.textContent
        };
        
        // 保存缴费数据
        let payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.unshift(paymentData);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // 延迟跳转到缴费界面（用户点击确认后）
        setTimeout(() => {
            // 不再自动跳转，等待用户点击确认按钮
        }, 2000);
        
        // 重置表单
        resetAppointmentForm();
        
    }, 2000);
}

function showAppointmentSuccess(appointmentData) {
    // 创建成功弹窗
    const modal = document.createElement('div');
    modal.className = 'appointment-success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-check-circle"></i> 预约成功</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="success-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <h4>您的预约信息</h4>
                <div class="appointment-details">
                    <div class="detail-item">
                        <span>预约号：</span>
                        <strong>${appointmentData.appointmentNumber}</strong>
                    </div>
                    <div class="detail-item">
                        <span>科室：</span>
                        <strong>${appointmentData.department}</strong>
                    </div>
                    <div class="detail-item">
                        <span>医生：</span>
                        <strong>${appointmentData.doctor}</strong>
                    </div>
                    <div class="detail-item">
                        <span>就诊日期：</span>
                        <strong>${appointmentData.date} ${appointmentData.time}</strong>
                    </div>
                    <div class="detail-item">
                        <span>费用：</span>
                        <strong>${appointmentData.fee}</strong>
                    </div>
                </div>
                <p class="reminder">请按时就诊，如有变动请提前取消预约。</p>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.appointment-success-modal').remove(); showSection('payment'); sessionStorage.setItem('fromAppointment', 'true'); setTimeout(() => { const latestPayment = getLatestPendingPayment(); if (latestPayment) { processPayment(latestPayment.orderNumber); } }, 500); HospitalApp.showNotification('请完成缴费以确认预约', 'info');">
                    <i class="fas fa-check"></i> 去缴费
                </button>
            </div>
        </div>
    `;
    
    // 添加样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // 关闭弹窗事件
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function resetAppointmentForm() {
    // 重置科室选择
    const departmentSelect = document.getElementById('department-select');
    if (departmentSelect) {
        departmentSelect.value = '';
    }
    
    // 重置日期选择
    const appointmentDate = document.getElementById('appointment-date');
    if (appointmentDate) {
        appointmentDate.value = '';
    }
    
    // 重置医生卡片选择
    const doctorCards = document.querySelectorAll('.doctor-card');
    doctorCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // 重置时间段选择
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.classList.remove('selected');
        slot.style.background = '';
        slot.style.color = '';
    });
    
    // 重置摘要信息
    updateAppointmentSummary();
}

// 获取所有预约记录（全局函数）
window.getAppointments = function() {
    return JSON.parse(localStorage.getItem('appointments') || '[]');
};

// 获取最新的待支付订单（全局函数）
window.getLatestPendingPayment = function() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    return payments.find(payment => payment.status === '待支付') || null;
};

// 处理支付
window.processPayment = function(orderNumber) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const payment = payments.find(p => p.orderNumber === orderNumber);
    
    if (!payment) {
        HospitalApp.showNotification('未找到缴费记录', 'error');
        return;
    }
    
    // 显示支付确认弹窗
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> 确认支付</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-summary">
                    <h4>订单信息</h4>
                    <div class="payment-details">
                        <div class="detail-item">
                            <span>订单号：</span>
                            <strong>${payment.orderNumber}</strong>
                        </div>
                        <div class="detail-item">
                            <span>科室：</span>
                            <strong>${payment.department}</strong>
                        </div>
                        <div class="detail-item">
                            <span>医生：</span>
                            <strong>${payment.doctor}</strong>
                        </div>
                        <div class="detail-item">
                            <span>就诊时间：</span>
                            <strong>${payment.appointmentDate} ${payment.appointmentTime}</strong>
                        </div>
                    </div>
                    
                    <h4>费用明细</h4>
                    <div class="fee-breakdown">
                        ${payment.items.map(item => `
                            <div class="fee-item">
                                <span>${item.name}：</span>
                                <span>¥${item.amount.toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="fee-total">
                            <span>总计：</span>
                            <strong>¥${payment.totalAmount.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.payment-modal').remove()">
                    <i class="fas fa-times"></i> 取消
                </button>
                <button class="btn-primary" onclick="completePayment('${orderNumber}')">
                    <i class="fas fa-check"></i> 确认支付
                </button>
            </div>
        </div>
    `;
    
    // 添加样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // 关闭弹窗事件
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// 完成支付
window.completePayment = function(orderNumber) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const payment = payments.find(p => p.orderNumber === orderNumber);
    
    if (!payment) {
        HospitalApp.showNotification('未找到缴费记录', 'error');
        return;
    }
    
    // 模拟支付处理
    setTimeout(() => {
        // 更新支付状态
        payment.status = '已支付';
        payment.payTime = new Date().toLocaleString('zh-CN');
        payment.payMethod = '微信支付';
        
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // 关闭弹窗
        const modal = document.querySelector('.payment-modal');
        if (modal) modal.remove();
        
        // 显示成功消息
        HospitalApp.showNotification(`支付成功！金额：¥${payment.totalAmount.toFixed(2)}`, 'success');
        
        // 刷新缴费列表
        loadPaymentData('待缴费');
        
        // 更新预约状态为已确认
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const appointment = appointments.find(a => a.appointmentNumber === payment.appointmentNumber);
        if (appointment) {
            appointment.status = '已确认';
            appointment.payTime = payment.payTime;
            localStorage.setItem('appointments', JSON.stringify(appointments));
        }
        
    }, 1500);
};

// 加载缴费数据
function loadPaymentData(tabName) {
    const paymentList = document.querySelector('.payment-list');
    if (!paymentList) return;
    
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    let filteredPayments = [];
    
    // 根据标签页筛选数据
    switch(tabName) {
        case '待缴费':
            filteredPayments = payments.filter(p => p.status === '待支付');
            break;
        case '已缴费':
            filteredPayments = payments.filter(p => p.status === '已支付');
            break;
        case '缴费记录':
            filteredPayments = payments;
            break;
        default:
            filteredPayments = payments.filter(p => p.status === '待支付');
    }
    
    // 清空现有列表
    paymentList.innerHTML = '';
    
    if (filteredPayments.length === 0) {
        paymentList.innerHTML = '<div class="no-data">暂无缴费记录</div>';
        return;
    }
    
    // 生成缴费项目HTML
    filteredPayments.forEach(payment => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        
        const hasRegistrationFee = payment.items && payment.items.some(item => item.type === 'registration');
        const registrationFeeItem = hasRegistrationFee ? payment.items.find(item => item.type === 'registration') : null;
        
        paymentItem.innerHTML = `
            <div class="payment-info">
                <h4>${payment.department} - ${payment.doctor}</h4>
                <p>预约号：${payment.appointmentNumber}</p>
                <p>就诊时间：${payment.appointmentDate} ${payment.appointmentTime}</p>
                ${hasRegistrationFee ? `<p class="registration-fee">挂号费：¥${registrationFeeItem.amount.toFixed(2)}</p>` : ''}
            </div>
            <div class="payment-amount">
                <span class="amount">¥${payment.totalAmount.toFixed(2)}</span>
                ${payment.status === '待支付' ? 
                    `<button class="btn-pay" onclick="processPayment('${payment.orderNumber}')"><i class="fas fa-credit-card"></i> 立即支付</button>` :
                    `<span class="paid-badge">已支付</span>`
                }
            </div>
        `;
        
        paymentList.appendChild(paymentItem);
    });
    
    // 如果是待缴费标签页且有待支付订单，检查是否需要自动打开支付窗口
    if (tabName === '待缴费' && filteredPayments.length > 0) {
        // 检查是否是从挂号跳转过来的（通过URL hash或其他标记）
        const urlParams = new URLSearchParams(window.location.search);
        const fromAppointment = urlParams.get('from') === 'appointment' || sessionStorage.getItem('fromAppointment') === 'true';
        
        if (fromAppointment) {
            // 获取最新的待支付订单
            const latestPayment = filteredPayments[0]; // 假设第一个是最新的
            if (latestPayment) {
                setTimeout(() => {
                    processPayment(latestPayment.orderNumber);
                }, 800); // 延迟800ms，让用户看到界面加载完成
                
                // 清除标记，避免重复触发
                sessionStorage.removeItem('fromAppointment');
                urlParams.delete('from');
            }
        }
    }
}

// 取消预约
window.cancelAppointment = function(appointmentNumber) {
    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointment = appointments.find(a => a.appointmentNumber === appointmentNumber);
    
    if (appointment) {
        if (confirm(`确定要取消预约 ${appointmentNumber} 吗？`)) {
            appointment.status = '已取消';
            appointment.cancelTime = new Date().toLocaleString('zh-CN');
            localStorage.setItem('appointments', JSON.stringify(appointments));
            HospitalApp.showNotification('预约已取消', 'success');
            return true;
        }
    }
    return false;
};