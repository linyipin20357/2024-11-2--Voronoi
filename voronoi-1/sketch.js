let pts = [];
let groupCount = 1; // 預設組數
let colors;

function setup() {
  createCanvas(400, 550);
  noLoop(); // 等待使用者輸入

  createP('請輸入要產生的組數：');
  let countInput = createInput('1'); // 使用者輸入組數
  countInput.input(() => {
    groupCount = max(1, int(countInput.value())); // 保證最小為 1
  });

  let button = createButton('產生 Voronoi 並存檔');
  button.mousePressed(generateAndSave); // 點擊執行生成並存檔
}

// 隨機生成 num 個點於畫布範圍內
function generateRandomPoints(num) {
  let points = [];
  for (let i = 0; i < num; i++) {
    points.push(createVector(random(width), random(height)));
  }
  return points;
}

// 依次產生每組 Voronoi 並存檔，且將座標點記錄進 TXT 檔
async function generateAndSave() {
  let allPoints = ''; // 存儲所有組的座標資料

  for (let i = 1; i <= groupCount; i++) {
    pts = generateRandomPoints(16); // 每組生成6個隨機點
    allPoints += `Group ${i}:\n`; // 記錄組號
    allPoints += pts.map(p => `${p.x.toFixed(2)}, ${p.y.toFixed(2)}`).join('\n') + '\n\n';

    drawVoronoi(); // 繪製 Voronoi
    await saveCanvas(`voronoi_group_${i}`, 'png'); // 等待存檔完成
  }

  // 將所有組的座標點存入 TXT 檔案
  saveStrings(allPoints.trim().split('\n'), 'points_log.txt');
  console.log('所有圖像和座標記錄已完成！');
}

// 繪製 Voronoi 圖
function drawVoronoi() {
  background(255);
  colors = pts.map(() => [random(255), random(255), random(200), random(100)]);
  let cells = voronoi(pts);

  for (let i = 0; i < cells.length; i++) {
    fill(colors[i]);
    let orderedCell = convexCtClk(cells[i]);
    beginShape();
    for (let v of orderedCell) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }

  stroke(50, 60, 140);
  strokeWeight(8);
  for (let p of pts) {
    point(p.x, p.y);
  }
}

// Voronoi 演算法相關函數（與之前相同）
function voronoi(points) {
  const w = max(width, height) * 2;
  const cells = [];
  for (let i = 0; i < points.length; i++) {
    const me = points[i];
    const other = points.slice(0, i).concat(points.slice(i + 1));
    const domains = other.map(p => domain(me, p, w));
    cells.push(cell(domains));
  }
  return cells;
}

function domain(me, p, w) {
  const sq = squareVertices(w);
  const halfW = w / 2;
  const v = p5.Vector.sub(p, me);
  const a = v.heading();
  const middlePt = p5.Vector.lerp(p, me, 0.5);
  const offset = p5.Vector.sub(middlePt, v.normalize().mult(halfW));
  return polygonTranslate(polygonRotate(sq, a), offset.x, offset.y);
}

function cell(domains) {
  let c = domains[0];
  for (let i = 1; i < domains.length; i++) {
    c = convexIntersection(c, domains[i]);
  }
  return c;
}

function squareVertices(w) {
  const halfW = w / 2;
  return [
    createVector(halfW, -halfW),
    createVector(halfW, halfW),
    createVector(-halfW, halfW),
    createVector(-halfW, -halfW),
  ];
}

function polygonRotate(vertices, angle) {
  return vertices.map(p => p5.Vector.rotate(p, angle));
}

function polygonTranslate(vertices, x, y) {
  return vertices.map(p => createVector(p.x + x, p.y + y));
}

function convexIntersection(convexVertices1, convexVertices2) {
  let points = [];
  for (let i = convexVertices1.length - 1, j = 0; j < convexVertices1.length; i = j++) {
    const pts = intersectionConvexLine(convexVertices2, { p1: convexVertices1[i], p2: convexVertices1[j] });
    points = points.concat(pts);
  }
  points = points
    .concat(convexVertices1.filter(p => inConvex(convexVertices2, p)))
    .concat(convexVertices2.filter(p => inConvex(convexVertices1, p)));
  return convexCtClk(points);
}

function intersectionConvexLine(convexVertices, line) {
  const pts = [];
  for (let i = convexVertices.length - 1, j = 0; j < convexVertices.length; i = j++) {
    const p = intersectionOf(line, { p1: convexVertices[i], p2: convexVertices[j] });
    if (p !== null) {
      pts.push(p);
    }
  }
  return pts;
}

function inConvex(convexVertices, p) {
  const firstZ = p5.Vector.cross(
    p5.Vector.sub(convexVertices[convexVertices.length - 1], p),
    p5.Vector.sub(convexVertices[0], p)
  ).z;
  for (let i = 0; i < convexVertices.length - 1; i++) {
    const z = p5.Vector.cross(
      p5.Vector.sub(convexVertices[i], p),
      p5.Vector.sub(convexVertices[i + 1], p)
    ).z;
    if (firstZ * z <= 0) {
      return false;
    }
  }
  return true;
}

function convexCtClk(convexVertices) {
  const p = convexCenterPoint(convexVertices);
  return convexVertices.sort((p1, p2) =>
    p5.Vector.sub(p1, p).heading() - p5.Vector.sub(p2, p).heading()
  );
}

function convexCenterPoint(convexVertices) {
  let x = 0;
  let y = 0;
  for (let v of convexVertices) {
    x += v.x;
    y += v.y;
  }
  return createVector(x / convexVertices.length, y / convexVertices.length);
}

function intersectionOf(line1, line2) {
  const v1 = p5.Vector.sub(line1.p2, line1.p1);
  const v2 = p5.Vector.sub(line2.p2, line2.p1);
  const cross = v1.cross(v2);

  if (abs(cross.z) < 1e-10) return null;

  const t = p5.Vector.cross(p5.Vector.sub(line2.p1, line1.p1), v2).z / cross.z;
  const u = p5.Vector.cross(p5.Vector.sub(line2.p1, line1.p1), v1).z / cross.z;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return p5.Vector.add(line1.p1, v1.mult(t));
  }
  return null;
}
