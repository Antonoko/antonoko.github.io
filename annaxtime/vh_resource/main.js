console.log("**** COMMODORE 64 HOSTKER ****");
console.log("64K RAM SYSTEM  38911 BASIC BYTES FREE");
console.log("READY.");
console.log("▉");
console.log("load''*'',8");
console.log("Calicomp UI Loaded success.");

console.log("这样的出场方式怎么样？");
console.log("would you like my new suit?");

// 点唱机
var SongList = {
  0:"will_you_remember_me",
  1:"a_gaze_that_invited_disaster",
  2:"meet_the_staff",
  3:"neo_avatar",
  4:"strictly_business"
  };
var SongSelect = Math.round( Math.random() * 4 );
var SongName = SongList[SongSelect];
document.getElementById(SongName).play();
  
//换装系统
var ClotheList = {
  0:"normal",
  1:"anna_whiteshirt"
};
var ClotheSelect = Math.round( Math.random() * 1 );
var ClotheName = ClotheList[ClotheSelect];
if (ClotheSelect !== 0) {
  document.getElementById(ClotheName).style.display = "inline";
};



  var linkToSrc = "http://tonoko.moe";

  // ===============欢迎语================

//   var writer = new TypeWriter({
//     container: document.querySelector('#dialog_1'),
//     strs: [
//      '调试模式',
//     ],
//     delay: 50,
//     imgStatue1: 'anna_talk_normal',
//     imgStatue2: 'anna_talk_normal_done',
//    });

setTimeout(() => {
  CRASHED_REPORT();
      }, 1000);
var SEED = 20;
function CRASHED_REPORT(){
  var RUNNING_STATUE = Math.round( Math.random() * SEED );
  var ERROR_REASON_DE = {
    0:"MENTAL_DEPRESSION oxc000000f",
    1:"SO_LUCKY_TODAY 0x0000001B",
    2:"NICE_TRY 0x00000041",
    3:"LOVE_NOT_FOUND 0x00000001",
    };
    console.log(RUNNING_STATUE);
    // console.log(ERROR_REASON_DE);
  if (RUNNING_STATUE == '4'){
    document.getElementById('CRASHED_STATUE').style.display = "inline";
    var ERROR_CODE=document.getElementById("CRASHED_REASON");
    var ERROR_REASON = Math.round( Math.random() * 3 );
    ERROR_CODE.innerHTML = ERROR_REASON_DE[ERROR_REASON];
  }
}
var TIME_WAITFOR = 3;
function CHECK_REPORT(){
  if (TIME_WAITFOR == 0){
    var RUNNING_STATUE = Math.round( Math.random() * 50 );
  }else{
    TIME_WAITFOR -= 1;
    console.log(TIME_WAITFOR);
  }
}

  startTimeTalk();
  function startTimeTalk(){
    var today=new Date();
    var hh = today.getHours();
    // var hh = 20; //调试模式
    
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '.......zzz..',
    ],
    delay: 50,
    imgStatue1: 'anna_eyeclosed',
    imgStatue2: 'anna_eyeclosed2',
    lockStatue: 1,
   });

  setTimeout(() => {
    cleanChrImg()
   if (hh < 6){
   var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '诶！',
     '凌晨好呀。$$$',
     '这个时间总是很少能看见谁呢……^特别是在这里。$$$$$',
     '（我说，如果没有偷看代码知道会有这段对话触发的话。）'
    ],
    delay: 50,
    imgStatue1: 'anna_talk_happy',
    imgStatue2: 'anna_talk_happy_done',
    lockStatue: 1,
   });
   }else if(hh < 11){
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '嗨',
     '早安。^不管愿意不愿意，一天又不得不开始了。$$$',
     '过了凌晨^，早上的光景就可无聊了。^白茫茫的现实呀。$$$$',
    ],
    delay: 50,
    imgStatue1: 'anna_talk_normal',
    imgStatue2: 'anna_talk_normal_done',
    lockStatue: 1,
   });
   }else if(hh < 14){
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '啊',
     '午安。^不管是工作学习完还是^刚睡醒也好，$$$',
     '这会让人昏昏涨涨无精打采的时间...^^睡一觉存盘一下吧。$$$',
    ],
    delay: 50,
    imgStatue1: 'anna_talk_despise',
    imgStatue2: 'anna_talk_despise_done',
    lockStatue: 1,
   });
   }else if(hh < 18){
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '啊..',
     '下午好。^一天中无力感消除的时刻，不要在这里摸鱼啊！^快去干活！$$$$$',
     '..不过那种无聊的事情随便怎么样都好啦。$',
    ],
    delay: 50,
    imgStatue1: 'anna_talk_normal',
    imgStatue2: 'anna_talk_normal_done',
    lockStatue: 1,
     });
   }else if(hh<24){
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    strs: [
     '那边的你！！！',
     '晚上好！^在睡着之前，请享受这无敌的夜晚吧。$$$',
     '好好休息，^准备打打游戏^补补番剧^还是摸摸鱼呢？$$$',
    ],
    delay: 50,
    imgStatue1: 'anna_talk_happy',
    imgStatue2: 'anna_talk_happy_done',
    lockStatue: 1,
     });
   }

  }, 2000);


   setTimeout(() => {
    cleanChrImg()
    var writer = new TypeWriter({
    container: document.querySelector('#dialog_1'),
    // strs: [
    //  '...不管如何$',
    //  '现在的你，^眼见何方，情系何处，身在何方，心思何人呢？'
    // ],
    strs: [
      '...不管如何$',
      '之所以抑郁症出现的原因，是因为抑郁情绪得不到别的帮助，所以我们才必须把它变成一种可消费的医疗手段，才让所谓抑郁症患者的抑郁情绪得到帮助。所以有时（有些言论）并不是对抑郁症缺乏认识，而是（家人朋友对其）缺乏基本关心与安慰人的方式。啊我究竟在说什么总之',
      '现在的你，^眼见何方，情系何处，身在何方，心思何人呢？'
     ],
    delay: 50,
    imgStatue1: 'anna_talk_normal',
    imgStatue2: 'anna_talk_normal_done',
    lockStatue: undefined,
  });
        }, 10000);

  }

// ===============时间显示模块================
  var flickerI=":"
  var checkFlicker=0;
  startTime()
  function startTime(){   
    var today=new Date();//定义日期对象   
    var yyyy = today.getFullYear();//通过日期对象的getFullYear()方法返回年    
    var MM = today.getMonth()+1;//通过日期对象的getMonth()方法返回年    
    var dd = today.getDate();//通过日期对象的getDate()方法返回年     
    var hh=today.getHours();//通过日期对象的getHours方法返回小时   
    var mm=today.getMinutes();//通过日期对象的getMinutes方法返回分钟   
    var ss=today.getSeconds();//通过日期对象的getSeconds方法返回秒   
    // 如果分钟或小时的值小于10，则在其值前加0，比如如果时间是下午3点20分9秒的话，则显示15：20：09   
    MM=checkTime(MM);
    dd=checkTime(dd);
    mm=checkTime(mm);   
    ss=checkTime(ss);    

    if (checkFlicker == 0){
      checkFlicker = 1;
      flickerI=":";
    }else{
      checkFlicker = 0;
      flickerI=" ";
    }
    document.getElementById('nowDateTimeSpan').innerHTML="H△g"+"&nbsp&nbsp&nbsp&nbsp&nbsp"+hh+flickerI+mm;   

    setTimeout('startTime()',1000);//每一秒中重新加载startTime()方法 
  }   
         
  function checkTime(i){   
    if (i<10){
      i="0" + i;
    }   
    return i;
  }  

// ===============时间主题模块================
setTheme();
function setTheme(themeStatue){
    var themeColor_border = "#2241fd";
    var themeColor_buttonText2 = "#ffb171";


    switch(themeStatue){
        case 0:
            //默认蓝色
            themeColor_border = "#2241fd";
            themeColor_buttonText2 = "#ffb171";
            break;
        case 1:
            //白日
            themeColor_border = "#eacc00";
            themeColor_buttonText2 = "#00c8ec";
            break;
        case 2:
            //傍晚
            themeColor_border = "#df6e00";
            themeColor_buttonText2 = "#f39d49";
            break;
        // case 3:
        //     //夜间
        //     themeColor_border = "#2241fd";
        //     themeColor_buttonText2 = "#ffb171";
        //     break;
        case 3:
           //冬季圣诞
           themeColor_border = "#e93c79";
          themeColor_buttonText2 = "#fff82e";
           break;
        default:
            break;
    }
    // document.getElementsByClassName('nowDateTimeSpan').style

    document.getElementById('buttonMin').style.borderRight = "solid 3px " + themeColor_border;
    document.getElementById('buttonMin').style.borderBottom = "solid 3px " + themeColor_border;
    document.getElementById('buttonMin').style.color = themeColor_border;
    document.getElementById('calicompFrameOutside_ID').style.backgroundColor = themeColor_border;
    document.getElementById('calicompFrameInside_ID').style.borderColor = themeColor_border;
    var tempClass_calicompButtonFrameText2 = document.getElementsByClassName("calicompButtonFrameText2");
    for (i=0; i<8;i++){
        tempClass_calicompButtonFrameText2[i].style.color = themeColor_buttonText2;
    }

}

// ===============时间背景模块================
  refreshBG();
  function refreshBG(){
  console.log("=====刷新时间！=====");
    //等待夜来前，你会有想念谁吗
  var today=new Date();
  var hh = today.getHours();
//   var hh = 12;//调试模式
  var BGarray = {
    3:"0003.jpg",
    6:"0306.jpg",
    9:"0609.jpg",
    10:"0910_1517.jpg",
    15:"0915.jpg",
    17:"0910_1517.jpg",
    19:"1719.jpg",
    20:"1920_0607.jpg",
    22:"2022.jpg",
    24:"2200.jpg",
    };
  var ThemeArray = {
        4:3,
        8:2,
        16:1,
        19:2,
        24:3,
        };
  var BGname = "0306.jpg";

  for (var timeDecide in BGarray){
    if (hh < timeDecide){
      BGname = "vh_resource/bg/" + BGarray[timeDecide];
      console.log("当前时间：" + hh);
      console.log("决定的时间区域：" + timeDecide);
      console.log("背景更替为：" + BGname);
      break;
    }
  }
  for (var timeDecide in ThemeArray){
    if (hh < timeDecide){
      ThemeNum = ThemeArray[timeDecide];
      setTheme(ThemeNum);
      console.log("主题决定的时间区域：" + timeDecide);
      console.log("主题更替为：" + ThemeNum);
      break;
    }
  }
  // document.write('<style>body{background:url(' + BGname + ');background-repeat:repeat-x;background-attachment:fixed;background-position:center;background-size: cover;background-color: #000;}</style>');
  var tempIn = "url(" + BGname + ")";
  // var tempIn = BGname;
  document.getElementById('backgroundDiv').style.backgroundImage = tempIn;
  console.log(tempIn);
  console.log("ready.");
  setTimeout('refreshBG()',60000);
}

// ===============窗口最小化按钮事件================
  var caliWinOpenStatue = 1;
  function caliWinClose(){
    if (caliWinOpenStatue == 1){
      caliWinOpenStatue = 0;
      document.getElementById('calicompFrameInside_ID').style.display = "none";
      var caliWinOpenStatue_buttonStatue=document.getElementById("buttonMin");
      caliWinOpenStatue_buttonStatue.innerHTML = "+";
      document.getElementById("sys_sound_2").play();
    //   document.getElementById('calicompFrameInside_ID').style.animation = "calicompFrameScaleMin 0.5s ease-in none";
    }else{
      caliWinOpenStatue = 1;
      document.getElementById('calicompFrameInside_ID').style.display = "inline";
      var caliWinOpenStatue_buttonStatue=document.getElementById("buttonMin");
      caliWinOpenStatue_buttonStatue.innerHTML = "-";
      document.getElementById("sys_sound_3").play();
    }

  }

// ===============初始化角色================
  function cleanChrImg(){
    document.getElementById('anna_talk_normal').style.display = "none";
    document.getElementById('anna_talk_normal_done').style.display = "none";
    document.getElementById('anna_talk_despise').style.display = "none";
    document.getElementById('anna_talk_despise_done').style.display = "none";
    document.getElementById('anna_talk_happy').style.display = "none";
    document.getElementById('anna_talk_happy_done').style.display = "none";
    document.getElementById('anna_eyeclosed').style.display = "none";
    document.getElementById('anna_eyeclosed2').style.display = "none";

    document.getElementById('textPointer').style.display = "none";
    document.getElementById('calicompFrame_disable').style.display = "inline";
    document.getElementById('calicompFrame_disable2').style.display = "inline";
  }

// ===============关于页面 返回按钮================
  function aboutBack(){
    document.getElementById("sys_sound_3").play();
    document.getElementById('calicompFrame_aboutBox').style.display = "none";
  }

// ===============打开链接================
  function jumptoLink(){
    document.getElementById("sys_sound_1").play();
     window.open(linkToSrc);
}

// ===============窗体按钮 对话模块================
  function caliButton(TakiIn){
    // document.getElementById("sys_sound_1").play();
   switch(TakiIn) {
   case 'blog':
    cleanChrImg();
    var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
      '喔',
      '虽然说是发表文章的部落格，^但并没有什么值得一提的内容。$$$',
      '（毕竟那个人也不是什么值得一提的、^有能力的人嘛……）',
      ],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: "前往 tonoko.moe",
      lockStatue: 1,
       });
       linkToSrc = "http://tonoko.moe/";

       setTimeout(() => {
        cleanChrImg()
      var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
      '咦！？',
      '我刚刚有说了些什么吗？$$$',
      '你听错了喔！^听~^错~^了~！$$$'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_happy',
      imgStatue2: 'anna_talk_happy_done',
      linkToName: "前往 blog.tonoko.moe",
      lockStatue: undefined,
       });
        }, 6500);

    break;
  case 'bilibili':
    cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '呀，',
        '无内鬼，^来点批哩批哩笑话。^哈 $$$',
      ],
      delay: 50,
     imgStatue1: 'anna_talk_happy',
      imgStatue2: 'anna_talk_happy_done',
      linkToName: "看看 Space.bilibili /2735317",
      lockStatue: 1,
       });
       linkToSrc = "https://space.bilibili.com/2735317";

       setTimeout(() => {
        cleanChrImg()
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '哈 哈……',
        '为什么不笑，不好笑吗.jpg$$$',
        '那么，来看看失败的创作者是怎么样的吧。'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_despise',
      imgStatue2: 'anna_talk_despise_done',
      linkToName: "取笑 Space.bilibili /2735317",
      lockStatue: undefined,
       });
        }, 3200);

    break;
  case 'pixiv':
    cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        'P站么，',
        '上面会放一些涂鸦……^然后还有涂鸦涂鸦和涂鸦。$$$',
        '不会画画就只能放涂鸦了不是么。^没天赋就不要学人画画.jpg',
      ],
      delay: 50,
      imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: "翻往 Pixiv.net id=13457142",
       });  
       linkToSrc = "https://www.pixiv.net/member.php?id=13457142";
    break;
  case 'weibo':
   cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '不过，',
        '微博是会偶尔发些难以言喻和归类东西的平台，^但一般不会记录什么日常。$$$$$$',
        '如果没有关心的人和愿意面对生活的内心，^贫瘠的生活也没有什么值得记录的。$$$$$$',
        '毕竟自内心发出去的文字，自然就会期待有所回应。^^多数时候这种等待是很糟糕的感觉。$$$$$$',
        '不想在有很多人的地方说话，^感觉会又渺小又自大呢。'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_despise',
      imgStatue2: 'anna_talk_despise_done',
      linkToName: "视奸 weibo.com/antonoko",
       });  
       linkToSrc = "https://weibo.com/antonoko";
    break;
  case 'twitter':
   cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '唔，',
        '中文推特圈，^可是非常热闹的地方哦，',
      ],
      delay: 50,
     imgStatue1: 'anna_talk_despise',
      imgStatue2: 'anna_talk_despise_done',
      linkToName: "翻往 twitter.com @yasutonoko",
      lockStatue: 1,
       });  
       linkToSrc = "https://twitter.com/yasutonoko";


       setTimeout(() => {
        cleanChrImg()
      var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
      '有时甚至还能看到正常人！$$$',
      '有一定的准入条件，并愿意在上面活跃的人，^都过着什么样的生活呢？$$$',
        '总之因为很好奇，^所以有时会偷偷观察。$$$',
        '不过，本质也许是各取所需罢了。'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: "翻往 twitter.com @yasutonoko",
      lockStatue: undefined,
       });
        }, 3500);
    break;
  case 'music':
    cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '唔，',
        '当我听朋友的歌单时.jpg^（alt="垃圾桶、耳机、便秘脸"）$$$',
        '有些时候，^听别人的喜爱歌曲就像在听对方的内心。$$$',
        '如果有"灵魂契合度"这个概念的话，^也许就是在他人歌单中、^自己标注红心了的数量。$$$',
      ],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: "前往 music.163.com @tonoko_",
      lockStatue: 1,
       });  
       linkToSrc = "https://music.163.com/#/user/home?id=53346867";


       setTimeout(() => {
        cleanChrImg()
      var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
       '啊……$',
        '不管怎么说，^有兴趣的话就来确认下吧。^^确认下到底有多不合（小声）'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_happy',
      imgStatue2: 'anna_talk_happy_done',
      linkToName: "听听 music.163.com @tonoko_",
      lockStatue: undefined,
       });
        }, 12000);
    break;
  case 'steam':
   cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '啾',
        '并没有想到什么特别好玩的游戏呢...^^那里几乎成为过去的纪念页了。$$$',
        '但可以买一份Va11halla，^那个酒吧和世界并不会让人特别讨厌噢。'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: "看看 SteamCommunity id/antonoko",
       });
       linkToSrc = "http://steamcommunity.com/id/antonoko/";
    break;
  case 'switch':
  cleanChrImg();
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '啊！',
        '米津玄师说他任天堂全明星大乱斗特比擅长卡比呢！$$$',
        '大乱斗真的是个特别难的游戏...^怎么也玩不好。^^但又非常喜欢。$$$',
      ],
      delay: 50,
     imgStatue1: 'anna_talk_happy',
      imgStatue2: 'anna_talk_happy_done',
      linkToName: "开机 Nintendo Switch",
      lockStatue: 1,
       });
       linkToSrc = "https://tonoko.moe/index_nintendoswitch/";

       setTimeout(() => {
        cleanChrImg()
      var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
      '不过...^',
      '互相添加好友什么的，$',
      '在国行网络架设完毕之前，^最大的作用还是确认互相的状态吧。'
      ],
      delay: 50,
     imgStatue1: 'anna_talk_despise',
      imgStatue2: 'anna_talk_despise_done',
      linkToName: "开机 Nintendo Switch",
      lockStatue: undefined,
       });
        }, 8000);

    break;
  case 'about':
  document.getElementById("sys_sound_2").play();
  cleanChrImg();
  document.getElementById('calicompFrame_aboutBox').style.display = "inline";
  // document.getElementById('calicompFrame_disable').style.display = "none";
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: [
        '嗨',
        '这样的出场方式怎么样？^没想到为了来到这里，^工作量还异常地..^大♂呢$$',
        '自我介绍？^只是无处不在的“幽灵”而已哟。^没有什么超能力和特别了不起的地方。$$$$$$$',
        '在这里，一天不同时刻能看到不同的风景。^^而白天的通常格外无趣。^你知道的。$$$',
        '不过不要在意，^毕竟，^心智健全只不过是相信脑子里的声音是自己的。'],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
      linkToName: undefined,
       });
  break;
   default:
     var writer = new TypeWriter({
      container: document.querySelector('#dialog_1'),
      strs: ['什么也没有发生。'],
      delay: 50,
     imgStatue1: 'anna_talk_normal',
      imgStatue2: 'anna_talk_normal_done',
       });
    } 
  }
