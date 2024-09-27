let stage_manager = "show_pic";
const stage = {
  "show_pic": stage_show_pic,
  "hover_pic": stage_hover_pic,
  "dissipate": stage_dissipate,
};

let is_dissipated = false;

let width_particle = 60;
let height_particle = 30;
const wind_vector = {
  "vx": .1,
  "vy": -.1,
};
let canvas_particle;
let canvas_ui_hover;

let noise_tex;
let noise_x_offset;
const noise_affect_factor = 0.005;

const particle_max_size = 12;
const particle_min_size = 1;
let particle_size;

let base_image;
let base_image_resize_width, base_image_resize_height;
let base_image_x1, base_image_x2, base_image_y1, base_image_y2;
const base_image_resize_factor = .5;
let particle_state = [];

function initialize_pic_particle(){

  particle_state = []
  for (let y=1; y < height_particle; y+=1){
    for (let x=1; x < width_particle; x+=1){
      particle_state.push(
          {
          "x": (base_image_resize_width/width_particle)*x + (width-base_image_resize_width)/2 + map(Math.random(), 0, 1, -2, 2),
          "y": (base_image_resize_height/height_particle)*y + (height-base_image_resize_height)/2 + map(Math.random(), 0, 1, -2, 2),
          "vx": 0,
          "vy": 0,
          "color": base_image.get(base_image.width/width_particle*x, base_image.height/height_particle*y),
        }
      );
    }
  }
}

function calc_particle_density(){
  width_particle = int(base_image_resize_width/particle_max_size) * 1.5;
  height_particle = int(base_image_resize_height/particle_max_size) * 1.5;
}

function update_particle(){
  noise_x_offset += .5;
  for (var i in particle_state){
    let c1 = noise_tex.get(particle_state[i]["x"]+noise_x_offset, particle_state[i]["y"]);
    let c2 = noise_tex.get(particle_state[i]["x"]+noise_x_offset, noise_tex.height-particle_state[i]["y"]);
    particle_state[i]["x"] = particle_state[i]["x"] + particle_state[i]["vx"];
    particle_state[i]["y"] = particle_state[i]["y"] + particle_state[i]["vy"];
    particle_state[i]["vx"] = (particle_state[i]["vx"] + wind_vector["vx"]) * map(c1[0], 0, 255, 0, 255)*noise_affect_factor;
    particle_state[i]["vy"] = (particle_state[i]["vy"] + wind_vector["vy"]) * map(c2[0], 0, 255, 0, 255)*noise_affect_factor;
  }
}

function update_stroke_weight(){
  if (particle_size > particle_min_size) {
    // if (particle_size > 6) {
    //   particle_size -= 0.3;
    // }else{
      particle_size -= 0.1;
    // }
  }
}

let trans_particle_img_opacity;
let trans_blur_value;
function draw_particle(){
  canvas_particle.clear();
  strokeCap(SQUARE);

  for (var i in particle_state){
    canvas_particle.strokeWeight(particle_size);
    canvas_particle.stroke(particle_state[i]["color"]);
    canvas_particle.point(particle_state[i]["x"], particle_state[i]["y"]);
  }
  tint(255, 255);
  image(canvas_particle, width/2, height/2);
  if (trans_blur_value > 0){
    filter(BLUR, trans_blur_value, true);
    trans_blur_value -= .03;
  }
  if (trans_particle_img_opacity>0){
    draw_img(trans_particle_img_opacity, trans_blur_value);
    trans_particle_img_opacity -= .1;
  }

}

function update_hint_ui(){
  canvas_ui_hover.clear();
  canvas_ui_hover.noFill();
  canvas_ui_hover.stroke(15, 112, 246);
  canvas_ui_hover.strokeWeight(4);
  canvas_ui_hover.rect(
    base_image_x1, 
    base_image_y1, 
    base_image_resize_width, 
    base_image_resize_height, 
    12
  );
  canvas_ui_hover.fill(15, 112, 246);
  
  let btn_width = 70;
  let btn_height = 30;
  canvas_ui_hover.rect(
    base_image_x1 + (base_image_resize_width-btn_width)/2, 
    base_image_y1 + (base_image_resize_height-btn_height)/2, 
    btn_width, 
    btn_height, 
    btn_height,
  );

  canvas_ui_hover.fill("white");
  canvas_ui_hover.textAlign(CENTER);
  canvas_ui_hover.textSize(20);
  canvas_ui_hover.text(
    "Hide",
    base_image_resize_width/2 + base_image_x1,
    base_image_resize_height/2 + base_image_y1 + 6, 
  );
}

function draw_hint_ui(){
  tint(255, 255);
  image(canvas_ui_hover, width/2, height/2);
}

function draw_img(opcaity=1, blur_value=0){
  tint(255, map(opcaity, 0, 1, 0, 255));
  image(base_image, width/2, height/2, base_image_resize_width, base_image_resize_height);
  if (blur_value > 0){
    filter(BLUR, blur_value, true);
  }
}

function gotFile(file) {
  // If the file dropped into the canvas is an image,
  // create a variable called img to contain the image.
  // Remove this image file from the DOM and only
  // draw the image within the canvas.
  if (file.type === 'image') {
    // Pass in an empty string for the alt text. This should only be done with
    // decorative photos.
    loadImage(file.data, img => {
      base_image = img;
      load_img();
    });
  }
}

function load_img(){
  base_image_resize_width = width*base_image_resize_factor;
  base_image_resize_height = (base_image.height/base_image.width)*base_image_resize_width;
  base_image_x1 = (width-base_image_resize_width)/2;
  base_image_y1 = (height-base_image_resize_height)/2;
  base_image_x2 = base_image_x1+base_image_resize_width;
  base_image_y2 = base_image_y1+base_image_resize_height;

  console.log(base_image_resize_width, base_image_resize_height, base_image.width, base_image.height);

  // initialization
  noise_x_offset=0;
  is_dissipated = false;
  particle_size = particle_max_size;
  trans_particle_img_opacity = 1;
  trans_blur_value = 2;

  calc_particle_density();

  initialize_pic_particle();
  console.log("particle counts: "+particle_state.length);
  console.log(particle_state[0]);

  update_hint_ui();
}

// -----------------------

function stage_show_pic(){
  draw_img();
}

function stage_hover_pic(){
  draw_img(opcaity=.8,blur_value=1);
  draw_hint_ui();
}

function stage_dissipate(){
  update_particle();
  update_stroke_weight();
  draw_particle();
}

// -----------------------

function preload(){
  base_image = loadImage("img/wqdy.png");
  noise_tex = loadImage("img/noise.jpg")
}

function setup() {
  frameRate(60);
  
  createCanvas(600, 600);
  imageMode(CENTER);

  canvas_particle = createGraphics(width, height);
  canvas_ui_hover = createGraphics(width, height);

  let dropArea = createCanvas(width, height);
  dropArea.drop(gotFile);

  load_img()
}

function releaseCheck(){
  if (mouseX > base_image_x1 && mouseX < base_image_x2 && mouseY > base_image_y1 && mouseY < base_image_y2){
    is_dissipated = true;
  }
}

function mouseReleased() {
  releaseCheck()
}

function touchEnded() {
  releaseCheck()
}

function draw() {

  background(240);

  if ((mouseX > base_image_x1 && mouseX < base_image_x2 && mouseY > base_image_y1 && mouseY < base_image_y2) && !is_dissipated){
    stage_manager = "hover_pic"
  }else if (is_dissipated){
    stage_manager = "dissipate"
  }else{
    stage_manager = "show_pic"
  }

  stage[stage_manager]();

// ------------------

  textAlign(CENTER);
  text("drag img to here to replace", width/2, height-60);

  let fps = int(frameRate());
  text(fps, 50, 50);

}



