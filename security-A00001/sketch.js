let snowflakes = []; // 存放雪花的陣列
let numFlakes = 100; // 固定雪花的數量
let windX = 0; // x軸上的風力
let windY = 0; // y軸上的風力
let windDecay = 0.995; // 風力的衰減速度，讓風持續時間更長
let windVariation = 0.02; // 風速的變化幅度

function setup() {https://editor.p5js.org/linyipin0515/sketches
  createCanvas(windowWidth, windowHeight);
  // 初始化雪花
  for (let i = 0; i < numFlakes; i++) {
    snowflakes.push(new snowflake());
  }
}

function draw() {
  background(0); // 背景設為黑色
  
  // 風力衰減並添加隨機變化
  windX *= windDecay;
  windY *= windDecay;
  
  windX += random(-windVariation, windVariation);
  windY += random(-windVariation, windVariation);

  // 顯示和更新每一個雪花
  for (let flake of snowflakes) {
    flake.update(windX, windY); // 更新雪花位置，並傳入風力
    flake.display(); // 顯示雪花
  }
}

// 偵測滑鼠拖曳事件
function mouseDragged() {
  // 根據滑鼠拖曳的方向和距離計算風力
  windX = (mouseX - pmouseX) * 0.1; // x軸方向的風力
  windY = (mouseY - pmouseY) * 0.1; // y軸方向的風力
}

// 定義雪花類別
function snowflake() {
  // 初始位置和速度
  this.posX = random(0, width);
  this.posY = random(-50, height);
  this.size = random(2, 5);
  this.speed = random(0.2, 0.8); // 下落速度
  this.windEffect = random(0.1, 0.5); // 常規風向影響的程度
  this.xOffset = random(-0.2, 0.2); // x 軸上的隨機擺動

  this.update = function(windX, windY) {
    // 雪花的下落速度
    this.posY += this.speed + windY;

    // 雪花在x軸上受到風和隨機擺動的影響
    this.posX += this.windEffect + this.xOffset + windX;

    // 當雪花落出畫面時，將其重置到頂端
    if (this.posY > height) {
      this.posY = random(-50, 0);
      this.posX = random(0, width);
    }
    
    // 當雪花飄出畫面邊緣時，讓它從另一邊進入
    if (this.posX > width) {
      this.posX = 0;
    } else if (this.posX < 0) {
      this.posX = width;
    }
  };

  this.display = function() {
    // 設置漸層光暈效果
    noStroke();
    let glowSize = this.size * 6; // 調整光暈的大小
    let glowLayers = 10; // 設定光暈層數
    let maxAlpha = 15; // 最大透明度，進一步降低以使光暈更淡
    
    for (let i = glowLayers; i > 0; i--) {
      let alpha = map(i, 0, glowLayers, 0, maxAlpha); // 調整透明度範圍
      fill(255, 255, 255, alpha);
      ellipse(this.posX, this.posY, glowSize * (i / glowLayers));
    }
    
    // 畫雪花本身
    fill(255);
    ellipse(this.posX, this.posY, this.size);
  };
}