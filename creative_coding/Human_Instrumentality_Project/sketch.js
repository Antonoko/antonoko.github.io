let hedgehog_width = 50;
let hedgehog_height = 50;
let hedgehog_x_count = 10;
let hedgehog_y_count = 10;

let t=0;
let canvas_width = hedgehog_x_count*hedgehog_width;
let canvas_height = hedgehog_y_count*hedgehog_height;

let hedgehog_img;
let indicator_img;
let marquee_cnt = 0;
let marquee_t_interval = 5;
let marquee_speed = 1;

let floor_canvas;

let awakening_probability = 0.1;

let sprite_martix = [];
let lcl_events = [];

let start_delay = 120;


function init_sprite() {
  for (let y=0; y < hedgehog_y_count; y+=1){
    for (let x=0; x < hedgehog_x_count; x+=1){
      sprite_martix.push(
        {
          "img": hedgehog_img[0],
          "x_default": hedgehog_width*x,
          "y_default": hedgehog_height*y,
          "x": hedgehog_width*x,
          "y": hedgehog_height*y,
          "target_x": hedgehog_width*x,
          "target_y": hedgehog_height*y,
          "time_to_arrived": 120,
          "time_playing": 0,
          "lcl_blasted": false,
        }
      )
    };
  };
}

// ------------

function setup() {
  var canvas = createCanvas(canvas_width, canvas_height);
  canvas.parent('canvasContainer');
  // createCanvas(canvas_width, canvas_height);
  floor_canvas = createGraphics(canvas_width, canvas_height);
  hedgehog_img = [
    loadImage("hedgehog0.png"),
    loadImage("hedgehog1.png"),
    loadImage("hedgehog2.png"),
  ];
  indicator_img = loadImage("loop_indicator.png");
  init_sprite();
}

function draw() {
  t += 1;
  background(255);
  image(floor_canvas, 0, 0);

  update_sprite_render();
  if (t>start_delay){
    lcl_blast_canvas();
    update_marquee_refresh_loop();  
  }

}

// ------------

function update_sprite_render() {
  for (const sprite of sprite_martix){
    image(sprite["img"], sprite["x"], sprite["y"]);

    if (sprite["time_playing"]<sprite["time_to_arrived"]){
      sprite["time_playing"] += 1;
      sprite["x"] = easeInOutMap(sprite["time_playing"]/sprite["time_to_arrived"], sprite["x_default"], sprite["target_x"]);
      sprite["y"] = easeInOutMap(sprite["time_playing"]/sprite["time_to_arrived"], sprite["y_default"], sprite["target_y"]);
    }else{
      sprite["x_default"] = sprite["x"]
      sprite["y_default"] = sprite["y"]
    }
  };
}

function update_marquee_refresh_loop() {
  image(
    indicator_img, 
    marquee_cnt%hedgehog_x_count*hedgehog_width,
    floor(marquee_cnt/hedgehog_y_count)*hedgehog_height
  );

  if (marquee_cnt >= sprite_martix.length-1){
    marquee_cnt = 0;
  };

  if ((t/marquee_t_interval)%marquee_speed < 0.001) {
    marquee_cnt += 1;

    // LCL blast
    if (sprite_martix[marquee_cnt]["img"] == hedgehog_img[1]){
      sprite_martix[marquee_cnt]["img"] = hedgehog_img[2];
      add_lcl_event(sprite_martix[marquee_cnt]["x"]+(hedgehog_width/2), sprite_martix[marquee_cnt]["y"]+(hedgehog_height/2));
    };

    if (random(0, 1)<awakening_probability && sprite_martix[marquee_cnt]["img"] == hedgehog_img[0]){
      awaken_hedgehog(marquee_cnt);
    }
  };
}

function awaken_hedgehog(hedgehog_index) {
  let offset_size = 20;
  sprite_martix[hedgehog_index]["img"] = hedgehog_img[1];

  function set_sprite_offset(index, x, y){
    sprite_martix[index]["target_x"] = sprite_martix[index]["x"]+x;
    sprite_martix[index]["target_y"] = sprite_martix[index]["y"]+y;
    sprite_martix[index]["time_playing"] = 0;  
    sprite_martix[index]["time_to_arrived"] = random(60, 150); 
  }

  if (hedgehog_index-hedgehog_x_count>0){
    set_sprite_offset(hedgehog_index-hedgehog_x_count, random(0, 1), random(0, 1)*-offset_size);
  }
  if (hedgehog_index+hedgehog_x_count<sprite_martix.length){
    set_sprite_offset(hedgehog_index+hedgehog_x_count, random(0, 1), random(0, 1)*+offset_size);
  }
  if (hedgehog_index-1>0){
    set_sprite_offset(hedgehog_index-1, random(0, 1)-offset_size, random(0, 1));
  }
  if (hedgehog_index+1<sprite_martix.length){
    set_sprite_offset(hedgehog_index+1, random(0, 1)+offset_size, random(0, 1));
  }

  if (hedgehog_index-hedgehog_x_count-1>0){
    set_sprite_offset(hedgehog_index-hedgehog_x_count-1, random(0, 1)-offset_size, random(0, 1)*-offset_size);
  }
  if (hedgehog_index-hedgehog_x_count+1<sprite_martix.length && hedgehog_index-hedgehog_x_count+1 >0){
    set_sprite_offset(hedgehog_index-hedgehog_x_count+1, random(0, 1)+offset_size, random(0, 1)*-offset_size);
  }
  if (hedgehog_index+hedgehog_x_count-1>0 && hedgehog_index+hedgehog_x_count-1 <sprite_martix.length){
    set_sprite_offset(hedgehog_index+hedgehog_x_count-1, random(0, 1)-offset_size, random(0, 1)*+offset_size);
  }
  if (hedgehog_index+hedgehog_x_count+1<sprite_martix.length){
    set_sprite_offset(hedgehog_index+hedgehog_x_count+1, random(0, 1)+offset_size, random(0, 1)*-20+offset_size);
  }

}

function easeInOutMap(t, min, max) {
  // 确保t在0到1之间
  t = Math.max(0, Math.min(1, t));
  
  // 应用ease-in-out曲线
  if (t < 0.5) {
    // 前半段使用二次方缓入
    t = 2 * t * t;
  } else {
    // 后半段使用二次方缓出
    t = -1 + (4 - 2 * t) * t;
  }
  
  // 将t映射到min和max之间
  return min + t * (max - min);
}

function add_lcl_event(x,y){
  lcl_events.push({
    "x": x,
    "y": y,
    "t": 20,
    "t_reserve": 20,
  })
}

function lcl_blast_canvas(){
  for(let index in lcl_events){
    let event = lcl_events[index]
    lcl_events[index]["t"] -= 1;
    if (random(0, 1)<.3){
      floor_canvas.stroke(255+random(-20,0),133+random(-10,10),random(-10,10),random(150,255));
      floor_canvas.strokeWeight(random(event["t"]/2, event["t"])*3);
      floor_canvas.point(
        event["x"]+random(-event["t_reserve"]-event["t"], event["t_reserve"]-event["t"])*1.5, 
        event["y"]+random(-event["t_reserve"]-event["t"], event["t_reserve"]-event["t"])*1.5
      );  
    }

    if (event["t"]<=0){
      lcl_events.splice(index, 1)
    }
  }

}