// 存储所有从JSON文件加载的数据
let allData = {};

// 初始化函数
function init() {
    console.log('init函数被调用');
    // 加载所有JSON数据
    Promise.all([
        loadJSON('clothingStyles.json'),
        loadJSON('coreAtmosphereWords.json'),
        loadJSON('facialExpressions.json'),
        loadJSON('finalVisualEffects.json'),
        loadJSON('hairStyle.json'),
        loadJSON('handDetails.json'),
        loadJSON('handGestures.json'),
        loadJSON('itemStatesAndDetails.json'),
        loadJSON('lightAndShadowEffects.json'),
        loadJSON('specificAccessoryCombinations.json'),
        loadJSON('blessing.json')
    ]).then(() => {
        console.log('所有JSON数据加载成功');
        console.log('allData对象内容:', allData);
        // 为生成按钮添加点击事件
        document.getElementById('generateBtn').addEventListener('click', generatePrompts);
        
        // 为所有复制按钮添加点击事件
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', handleCopy);
        });
    }).catch(error => {
        console.error('加载JSON数据失败:', error);
        alert('数据加载失败，请刷新页面重试。');
    });
}

// 加载单个JSON文件的函数
function loadJSON(filename) {
    console.log('尝试加载文件:', filename);
    return fetch(filename)
        .then(response => {
            console.log('文件加载状态:', filename, response.status);
            if (!response.ok) {
                throw new Error(`无法加载 ${filename}`);
            }
            return response.json();
        })
        .then(data => {
            // 特殊处理blessing.json文件，它有多个顶级键
            if (filename === 'blessing.json') {
                // 将所有祝福类别的数据直接存储到allData中
                Object.keys(data).forEach(key => {
                    allData[key] = data[key];
                });
            } else {
                // 对于其他文件，使用原来的处理方式
                const dataType = Object.keys(data)[0];
                allData[dataType] = data[dataType];
            }
        });
}

// 从数组中随机选择一个元素
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 根据性别选择对应的数据
function getGenderSpecificData(dataType, gender) {
    const data = allData[dataType];
    // 检查数据是否按性别区分
    if (typeof data === 'object' && data !== null && data.hasOwnProperty(gender)) {
        return getRandomItem(data[gender]);
    } else if (Array.isArray(data)) {
        // 如果数据是数组，直接随机选择
        return getRandomItem(data);
    } else {
        console.error(`数据类型 ${dataType} 格式不正确`);
        return '';
    }
}

// 生成单个提示词
function generateSinglePrompt(gender, constellationName) {
    // 使用硬编码的祝福数据作为备用方案
    const career = ['事业有成步步高', '工作顺利升职快', '事业腾飞如日中天', '职场得意春风满面'];
    const wealth = ['财运亨通富贵来', '财源滚滚进家门', '财富积累如滚雪球', '财运大涨钱包鼓'];
    const love = ['爱情甜蜜如胶似漆', '感情顺遂恩爱长久', '桃花朵朵开良缘来', '爱情美满幸福永久'];
    const life = ['生活幸福美满', '身体健康精神好', '家庭和睦万事兴', '日子红火步步高'];
    
    // 随机选择祝福词，如果allData中有数据就使用，否则使用硬编码数据
    const careerBlessing = allData['career'] ? getRandomItem(allData['career']) : getRandomItem(career);
    const wealthBlessing = allData['wealth'] ? getRandomItem(allData['wealth']) : getRandomItem(wealth);
    const loveBlessing = allData['love'] ? getRandomItem(allData['love']) : getRandomItem(love);
    const lifeBlessing = allData['life'] ? getRandomItem(allData['life']) : getRandomItem(life);
    
    // 模板字符串
    const template = `基础风格与画质：动漫风格插画,比例9：16，极致细节，平滑 shading，色彩鲜艳且带有写实质感。
核心角色设定：${constellationName}主题${gender}角色，${getGenderSpecificData('hairStyle', gender)}，${getRandomItem(allData['facialExpressions'])}，${getRandomItem(allData['handGestures'])}，${getRandomItem(allData['handDetails'])}；佩戴${getRandomItem(allData['specificAccessoryCombinations'])}。
角色服饰：身着${getGenderSpecificData('clothingStyles', gender)}。
环境元素：周围${getRandomItem(allData['itemStatesAndDetails'])}。
整体氛围与光影：整体氛围${getRandomItem(allData['coreAtmosphereWords'])}，柔和暖光${getRandomItem(allData['lightAndShadowEffects'])}，画面${getRandomItem(allData['finalVisualEffects'])}。

添加文字1：顶部居中白底白色边框内的黑色粗体文字"${constellationName}"；
添加文字2：从人物中间开始分布四行白色粗体祝福文字（内容为"${careerBlessing}","${wealthBlessing}","${loveBlessing}","${lifeBlessing}"），横向排列，每行一句，依次相对于人物偏右、偏左、偏右、偏左交错，与视觉符号错落排列（符号数量精简，每类祝福仅配1个）。`;
    
    return template;
}

// 生成3个提示词
function generatePrompts() {
    // 定义性别选项
    const genders = ['男性', '女性', '中性'];
    // 定义星座选项
    const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
    
    // 生成3个不同的提示词
    const prompts = [];
    const usedPrompts = new Set();
    
    while (prompts.length < 3) {
        // 随机选择性别
        const gender = getRandomItem(genders);
        // 随机选择星座
        const constellationName = getRandomItem(constellations);
        // 生成提示词
        const prompt = generateSinglePrompt(gender, constellationName);
        
        // 确保提示词不重复
        if (!usedPrompts.has(prompt)) {
            usedPrompts.add(prompt);
            prompts.push(prompt);
        }
    }
    
    // 显示生成的提示词
    document.getElementById('prompt1').value = prompts[0];
    document.getElementById('prompt2').value = prompts[1];
    document.getElementById('prompt3').value = prompts[2];
}

// 处理复制功能
function handleCopy(event) {
    const targetId = event.currentTarget.getAttribute('data-target');
    const textarea = document.getElementById(targetId);
    
    // 选中并复制文本
    textarea.select();
    document.execCommand('copy');
    
    // 保存对按钮的引用
    const button = event.currentTarget;
    // 更改按钮文本为"已复制"
    const originalText = button.textContent;
    button.textContent = '已复制';
    button.classList.add('copied');
    
    // 2秒后恢复按钮文本
    setTimeout(() => {
        if (button) {
            button.textContent = originalText;
            button.classList.remove('copied');
        }
    }, 2000);
}

// 一键复制所有提示词
function copyAllPrompts() {
    const prompt1 = document.getElementById('prompt1').value;
    const prompt2 = document.getElementById('prompt2').value;
    const prompt3 = document.getElementById('prompt3').value;
    
    // 组合所有提示词，用分隔符分开
    const allPrompts = `提示词1：\n${prompt1}\n\n\n提示词2：\n${prompt2}\n\n\n提示词3：\n${prompt3}`;
    
    // 创建一个临时文本区域来复制文本
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = allPrompts;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    // 获取一键复制按钮并更改文本为"已复制所有"
    const copyAllBtn = document.getElementById('copyAllBtn');
    const originalText = copyAllBtn.textContent;
    copyAllBtn.textContent = '已复制所有';
    copyAllBtn.classList.add('copied');
    
    // 2秒后恢复按钮文本
    setTimeout(() => {
        if (copyAllBtn) {
            copyAllBtn.textContent = originalText;
            copyAllBtn.classList.remove('copied');
        }
    }, 2000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    // 为一键复制所有按钮添加点击事件
    document.getElementById('copyAllBtn').addEventListener('click', copyAllPrompts);
});