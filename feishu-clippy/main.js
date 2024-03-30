var gif_files = {"main.gif": 0.3, "blink.gif": 0.2, "jump.gif": 0.2, "meshy.gif": 0.1, "till.gif": 0.2};
var keys = Object.keys(gif_files);

function changeBackground() {
    var random = Math.random();
    var probability_start = 0;
    for(var i = 0; i < keys.length; i++) {
        probability_start += gif_files[keys[i]];
        if(random < probability_start) {
            document.getElementById('clippy_gif').style.backgroundImage = 'url(' + keys[i] + ')';
            console.log(keys[i])
            break;
        }
    }  
}

function intervalRandomBackground(min_sec, max_sec){
    changeBackground();
    let interval = Math.floor(Math.random() * (max_sec - min_sec + 1) + min_sec) * 1000;
    console.log(interval);
    setTimeout(() => {
        intervalRandomBackground(min_sec, max_sec);
    }, interval);
}

intervalRandomBackground(7, 10);

// --------------------------------------------------

var writing_topics = ["遗书", "交接文档", "什么我看不懂的", "SaaS黄页大全", "挖坑合同", "离婚协议", "创业骗钱策划案", "拍脑袋需求文档", "没人会用的设计需求", "甩锅复盘", "简历", "个猫说明书", "路边床单", "OK啊", "工作粥报", "短期方案与执行", "营笑策划案", "回忆记录", "部门世纪报", "五年计划", "什么什么督办", "流程屠", "幻想时间线", "小猫辅食", "黄了的项目", "里程悲", "架狗图", "发面流程图", "活动创人", "卡车共创", "短视频脚", "新功能画饼", "画大饼", "OK拆解", "粘中工作汇报", "项目复判", "个人工作我日", "每周摸鱼计划", "会议几路", "塔罗牌星象", "电影剧本", "问题人收集表", "头脑疯爆", "2077回顾", "十个彻底破坏生活的神技巧", "小黄文大全", "如何一次性来20个假期假", "加班?少来了,用这10招在谷歌文档玩一整天", "我的邪恶计划", "发送骚扰邮件的100种新姿势", "10个给同事下套的新点子", "脱口秀节目", "誓言宣读", "用谷歌邮箱与不相关人员进行长达一年的乱聊", "如何成为最无聊的无聊绝顶无聊专家", "十个理由证明中国人永远不会灭亡","老鼠为什么永远比仓鼠要聪明","如何十分钟内让自己变成土豆","如何用一块抹布打翻一个工地","寻找丢失的激情:破三张光盘的十个理由","静置十天的脑袋会长蛀虫么","三体问题:如何跟一个外星人打得难解难分","用拖把和海绵制作一个理想的国度","人类为什么不能像别的动物一样四脚行走","如何在十秒钟内和包括你妻子在内的所有人同归于尽","为什么我们应该把碗放在头上","数独与我的不可思议故事","理发时被拖进了时光机:一个绝望的24小时","我的梦里全是兔子:一个可能的心理疾病","狗能说人话么:一个科学探索的报告","月球真的存在么:一个值得深思的问题","如何在五分钟内逼疯自已","如何实现可持续发展:从工具包到生态园","如何用面条钓鱼","街角卖汤圆大妈的不得了人生线索","太阳为什么还不退休","浅谈臭虫与人生的十点关联","如何识别危险的无聊法则","搞定一切问题的秘密武器——阳光锅巴","告密的公交车与我的99个重要经历","月亮女神的血泪:一个爱情物语","十个理由证明你活得并不精彩","如何用三文鱼驯服一座火山","我在大马路上变成了超人:一个荒唐的一夜","揭秘面包机背后的阴谋","我与河马的500个日夜","一个多啦A梦粉丝的心路历程","抽屉里变成猪的故事","十八层樓的秘密:一个精彩的住房故事","地球人为什么永远不会长角","月亮其实是个大粪球么","摩天轮上打完架以后",'如何用三言两语讨老师欢心', '物理课上猫逗鼠,生物课猫逗老鼠', '高考作文三角函数应用于职业规划', '寒假作业:过年去乡下捉鸡', '数学公式应用于情感生活', '古诗词鉴赏:寻小白觅梅花窝', '中考作文选题:我喜欢吃馒头', '成语接龙与电子工程相融', '语文阅读练习:麦田守望者', '英语口语辩论赛:蓝胡子与睡美人', '物理实验报告:手机掉水里后进入深度睡眠', '生物概论:青蛙做运动与营养', '历史阅读:刘邦吃包子记', '地理消遣:划船江南遨游', '政治视点:共产主义蛋糕理论', '社会变迁:冰淇淋车与当今社会','中国画鉴赏:牛和河马戏水', '音乐欣赏:摇滚与中国传统乐器', '美术作品赏析:马桶现代主义']

function getRandomTopic(arr) {
    var randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function appendRandomTopic() {
    var topic = getRandomTopic(writing_topics);
    var element = document.getElementById('writing_topic');
    element.textContent = "看起来你正在写" + topic + "。";
}

appendRandomTopic();

// --------------------------------------------------

var advice_topics = ["让它更像清华博士的文笔", "加点烂笑话", "让每句话都押韵", "让它更加simple和naive", "搞个大新闻", "加点适合SEO的垃圾", "删掉所有符号", "变成小红书文风", "每段加上家人们谁懂啊", "翻译成失传的语言", "随机屏蔽一些词语", "把敏感词语替换成拼音缩写", "冒犯更多的人", "变成一首rap", "把晦涩字换成同音字，方便领导读", "让八十岁的小朋友也能懂", "给每句最后加个喵", "打乱所有人称代词", "用古埃及象形文字书写", "降低文化程度", "语气更加自命不凡",'加点没人听过的名人名言','所有图片换成小猫','每段起头使用共产中文','只用平仄格律表达','引用不合时宜的名人名言','把所有引用人换成鲁迅','给所有字加上随机杀马特颜色','所有段落按拼音排序','给每段对话加日式冷吐槽','加入落伍了的春晚流行语','让文章更加晦涩赋魅','添加更多互粘网黑话','加入大量动物 emoji','让小猫也能读懂文章','把文章变成文言文','让文章符合清真认证','将文章变成正确的废话','让文章冒犯到所有人']

function appendRandomText(element_id, topics) {
    var topic = getRandomTopic(topics);
    var element = document.getElementById(element_id);
    element.textContent = topic;
}

appendRandomText("option1", advice_topics);
appendRandomText("option2", advice_topics);

// ---------------------------------------------------

var ai_respond = ['我无法为你提供帮助，如果你有任何其他问题或需求，请告诉我，我会尽力为你解答。','很抱歉，我遇到了一点问题，可以重新问我一遍吗？','抱歉，我刚刚走神了，可以重新问我一遍吗？','暂不支持该消息类型','很抱歉，我作为您的「工作伙伴」目前还不具备按照您个人文风写作工作总结的能力。']

function makeAIRespond() {
    document.getElementById('frame_recommend').classList.add('hide');
    document.getElementById('frame_result').classList.remove('hide');
    document.getElementById('ai_respond').textContent = "AI 思考中…";

    setTimeout(() => {
        appendRandomText("ai_respond", ai_respond);
    }, 1500);   
}

document.getElementById('option1').addEventListener('click', makeAIRespond);
document.getElementById('option2').addEventListener('click', makeAIRespond);

// ---------------------------------------------------

function backToMainPage() {
    document.getElementById('frame_result').classList.add('hide');
    document.getElementById('frame_recommend').classList.remove('hide');

    appendRandomTopic();
    appendRandomText("option1", advice_topics);
    appendRandomText("option2", advice_topics);
}

document.getElementById('option_back').addEventListener('click', backToMainPage);

// ---------------------------------------------------

var imagesArray = ["blink.gif", "jump.gif", "main.gif","meshy.gif","till.gif"];

function preloadImages() {
    for (var i = 0; i < imagesArray.length; i++) {
        var img = new Image();
        img.src = imagesArray[i];
    }
}

window.onload = preloadImages;