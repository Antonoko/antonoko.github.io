;(win => {
  class TypeWriter {
    constructor (config) {
      var container = config.container; // 容器 需要改变容器的innerHTML值来实现打字效果 DOM
      var strs = config.strs; // 那些句子 Array
      var delay = config.delay || 500; // 打两个字之间的间隔 ms
      var imgStatue1 = config.imgStatue1;
      var imgStatue2 = config.imgStatue2;
      var len = strs.length;  // 一共有多少句
      var stoperStatus = 0; //0=false 1=true
      var talkSoundStatus = 1;
      var talkSoundDouble = 1;
      var linkToName = config.linkToName;
      var lockStatue = config.lockStatue;




// ===============弹出链接的按钮内容================
    function showJumpBox(linkToNameIn){
      if (linkToNameIn !== undefined){
        document.getElementById('linkBoxId').style.display = "inline";
        var linkContainer=document.getElementById("linkTo");
        linkContainer.innerHTML = linkToNameIn;
      }else{
        document.getElementById('linkBoxId').style.display = "none";
      }


    }

// ===============停一下，================
    function sleep(delay) {
        var start = (new Date()).getTime();
        while((new Date()).getTime() - start < delay) {
            continue;
        }
    }

// ===============角色对话SFX================
    function playChrVoice(){
      // var tempA = "talkSound" + talkSoundStatus;
      
      if (talkSoundDouble == '1'){
        document.getElementById("talkSound" + talkSoundStatus).play();
        talkSoundStatus += 1;
        if (talkSoundStatus == '6'){
          talkSoundStatus = 1;
        }
        // return console.log(tempA);
        talkSoundDouble = 0;
      }else{
        talkSoundDouble = 1;
      }
   }

// ===============更换立绘状态================
    function changCharIMG(imgIn){
      if (imgIn == '1') {
        document.getElementById(imgStatue1).style.display = "inline";
        document.getElementById(imgStatue2).style.display = "none";
        document.getElementById('textPointer').style.display = "none";
      } else if (imgIn == '2') {
        document.getElementById(imgStatue1).style.display = "none";
        document.getElementById(imgStatue2).style.display = "inline";
        document.getElementById('textPointer').style.display = "inline";
      }
    }

// ===============敲字符模块================
      // 用来生成打字的字符串数组 对于除了最后一句的所有句子以外，加上退格的处理效果
      // @params:
      //  str: 一个短语
      //  index: 当前短语在所有短语中的位置 从1开始
      function buildWord (str, index) {
        return index === len ? str.split('') : str.split('').concat('@!del'.repeat(str.length).split('@').slice(1));
      }

      // 打字，对退格进行特殊处理，其余则是直接拼接
      // @params:
      //  word 一个字符
      function writeWord (word) {

        var innerHTML = container.innerHTML;
        if ('!del' === word) {
          // changCharIMG(2);
          if (stoperStatus == '0'){
            sleep('700');
            stoperStatus = '1';
          }
          container.innerHTML = innerHTML.slice(0, innerHTML.length - innerHTML.length);//edit
        } else {
          stoperStatus = '0';
          if (word == '$'){
            changCharIMG(2);
            sleep('100');
          }else if (word == '^'){
            changCharIMG(1);
            sleep('500');
          }
          else{
            container.innerHTML = innerHTML + '' + word;
            playChrVoice();
          }

          
        }
      }



      // 每次取出一段话 并调用打字方法
      // @params:
      //  words: 所有短语的集合
      //  index: 短语的位置
      function write (words, index) {
        var word = words.shift();
        if (!word){
          changCharIMG(2);
          if (lockStatue !== 1){
            document.getElementById('calicompFrame_disable').style.display = "none";
            document.getElementById('calicompFrame_disable2').style.display = "none";
            document.getElementById("sys_sound_4").play();
          }
          return console.log('我讲完啦');
          
        }else{
          changCharIMG(1);
          word = buildWord(word, ++index);
          typing(word, true, write.bind(this, words, index));
          
        }
      }

      // 每次取出一个字符，并做延迟调用
      // @params:
      //  words: 一个短语
      //  type: 是否为退格
      //  callback: 当一段话打完以后的回调
      function typing (words, type, callback) { // 打字
        setTimeout(() => {
          var word = words.shift();
          word ? typing(words, '!del' !== word, callback) : callback();
          writeWord(word || '');
        }, type ? delay : delay * 0.4);
      }

      // 开始打字咯！
      write(strs, 0);
      showJumpBox(linkToName);
    }
  }
  win.TypeWriter = TypeWriter;
})(window);
