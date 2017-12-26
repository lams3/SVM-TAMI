function cross(u, v) {
  let p = {};
  p.x = (u.y * v.z) - (u.z * v.y);
  p.y = (u.z * v.x) - (u.x * v.z);
  p.z = (u.x * v.y) - (u.y * v.x);
  return p;
}

function dot(p1, p2) {
  return (p1.x * p2.x) + (p1.y * p2.y) + (p1.z * p2.z);
}

function multiply(p1, t) {
  return {x: p1.x * t, y: p1.y * t, z: p1.z * t};
}

function norm(p1) {
  return Math.sqrt(dot(p1, p1));
}

function middlePoint(p1, p2) {
  p = {};
  p.x = (p1.x + p2.x) / 2;
  p.y = (p1.y + p2.y) / 2;
  p.z = (p1.z + p2.z) / 2;
  return p;
}

function estimateVanishingPoints() {
  const vPoints1 = [
    cross(
      cross(referenceGrid[1][1], referenceGrid[1][0]),
      cross(referenceGrid[0][1], referenceGrid[0][0])
    ),
    cross(
      cross(referenceGrid[1][1], referenceGrid[1][2]),
      cross(referenceGrid[0][1], referenceGrid[0][2])
    ),
    cross(
      cross(referenceGrid[1][1], referenceGrid[0][1]),
      cross(referenceGrid[1][0], referenceGrid[0][0])
    )
  ];
  const vPoints2 = [
    cross(
      cross(measureGrid[0][1], measureGrid[0][0]),
      cross(measureGrid[1][1], measureGrid[1][0])
    ),
    cross(
      cross(measureGrid[0][1], measureGrid[0][2]),
      cross(measureGrid[1][1], measureGrid[1][2])
    ),
    cross(
      cross(measureGrid[0][1], measureGrid[1][1]),
      cross(measureGrid[0][0], measureGrid[1][0])
    )
  ];
  const vPoints = [];
  for (let i = 0; i < 3; i++) {
    if (vPoints1[i].z !== 0) {
      vPoints1[i] = multiply(vPoints1[i], 1 / vPoints1[i].z);
    } else {
      vPoints1[i] = multiply(vPoints1[i], 1 / norm(vPoints1[i]));
    }
    if (vPoints2[i].z !== 0) {
      vPoints2[i] = multiply(vPoints2[i], 1 / vPoints2[i].z);
    } else {
      vPoints2[i] = multiply(vPoints2[i], 1 / norm(vPoints2[i]));
    }
    vPoints[i] = middlePoint(vPoints1[i], vPoints2[i]);
  }
  return vPoints;
}

function getMetricFactorX() {
  const v = vPoints[0];
  const b = referenceGrid[1][1];
  const t = referenceGrid[1][0];
  let l = cross(vPoints[1], vPoints[2]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * referenceSize;
  return up / low;
}

function getMetricFactorY() {
  const v = vPoints[1];
  const b = referenceGrid[1][1];
  const t = referenceGrid[1][2];
  let l = cross(vPoints[2], vPoints[0]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * referenceSize;
  return up / low;
}

function getMetricFactorZ() {
  const v = vPoints[2];
  const b = referenceGrid[1][1];
  const t = referenceGrid[0][1];
  let l = cross(vPoints[0], vPoints[1]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * referenceSize;
  return up / low;
}

function getSizeX() {
  const v = vPoints[0];
  const b = measureGrid[0][1];
  const t = measureGrid[0][0];
  let l = cross(vPoints[1], vPoints[2]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * metricFactors[0];
  return up / low;
}

function getSizeY() {
  const v = vPoints[1];
  const b = measureGrid[0][1];
  const t = measureGrid[0][2];
  let l = cross(vPoints[2], vPoints[0]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * metricFactors[1];
  return up / low;
}

function getSizeZ() {
  const v = vPoints[2];
  const b = measureGrid[0][1];
  const t = measureGrid[1][1];
  let l = cross(vPoints[0], vPoints[1]);
  l = multiply(l, 1 / norm(l));
  const up = -norm(cross(b, t));
  const low = dot(l, b) * norm(cross(v, t)) * metricFactors[2];
  return up / low;
}

function distance(p1, p2) {
  let p = {x: p1.x - p2.x, y: p1.y - p2.y};
  return Math.sqrt((p.x * p.x) + (p.y * p.y));
}

function getClick(click) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (distance(click, referenceGrid[i][j]) <= 5) {
        return {grid: 'reference', i: i, j: j}
      } else if (distance(click, measureGrid[i][j]) <= 5) {
        return {grid: 'measure', i: i, j: j}
      }
    }
  }
  return null;
}

function createGrids() {
  referenceGrid = [
    [
      {x: 20, y: 20, z: 1},
      {x: 40, y: 20, z: 1},
      {x: 60, y: 20, z: 1}
    ],
    [
      {x: 20, y: 40, z: 1},
      {x: 40, y: 40, z: 1},
      {x: 60, y: 40, z: 1}
    ]
  ];

  measureGrid = [
    [
      {x: 20, y: canvas.height - 40, z: 1},
      {x: 40, y: canvas.height - 40, z: 1},
      {x: 60, y: canvas.height - 40, z: 1}
    ],
    [
      {x: 20, y: canvas.height - 20, z: 1},
      {x: 40, y: canvas.height - 20, z: 1},
      {x: 60, y: canvas.height - 20, z: 1}
    ]
  ];
}

function calculate() {
  vPoints = estimateVanishingPoints();
  console.log(vPoints);
  metricFactors = [
    getMetricFactorX(),
    getMetricFactorY(),
    getMetricFactorZ()
  ];
  console.log(metricFactors);
  sizes = [
    getSizeX(),
    getSizeY(),
    getSizeZ()
  ];
  console.log(sizes);
}

function drawGrid(grid, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.moveTo(grid[0][0].x, grid[0][0].y);
  ctx.lineTo(grid[0][1].x, grid[0][1].y);
  ctx.lineTo(grid[0][2].x, grid[0][2].y);
  ctx.lineTo(grid[1][2].x, grid[1][2].y);
  ctx.lineTo(grid[1][1].x, grid[1][1].y);
  ctx.lineTo(grid[1][0].x, grid[1][0].y);
  ctx.lineTo(grid[0][0].x, grid[0][0].y);
  ctx.moveTo(grid[0][1].x, grid[0][1].y);
  ctx.lineTo(grid[1][1].x, grid[1][1].y);
  ctx.stroke();
  ctx.fillStyle = 'red';
  for (let points of grid) {
    for (let point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

function draw() {
  calculate()
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(dummy, 0, 0);
  drawGrid(referenceGrid, 'blue');
  drawGrid(measureGrid, 'green');
  const textLocations = [
    middlePoint(measureGrid[0][1], measureGrid[0][0]),
    middlePoint(measureGrid[0][1], measureGrid[0][2]),
    middlePoint(measureGrid[0][1], measureGrid[1][1])
  ];
  for (let i = 0; i < textLocations.length; i++) {
    const rectSize = ctx.measureText(sizes[i].toFixed(2));
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(textLocations[i].x, textLocations[i].y, rectSize.width, -10)
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillText(sizes[i].toFixed(2), textLocations[i].x, textLocations[i].y);
  }
  ctx.beginPath();
  ctx.fillStyle = 'white';
  let textSize = ctx.measureText(sizes[0] * sizes[1] * sizes[2]).width;
  ctx.fillRect(canvas.width, 0, -(textSize + 20), 30);
  ctx.fillStyle = 'red';
  ctx.fillText('v = ' + (sizes[0] * sizes[1] * sizes[2]).toFixed(2), canvas.width - textSize - 10, 10);
}

const input = document.getElementById('input');
const sizeInput = document.getElementById('sizeInput');
const back = document.getElementById('back');
const next = document.getElementById('next');
const canvas = document.getElementById('canvas');
const dummy = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let referenceSize = 5;

let referenceGrid;
let measureGrid;
let vPoints = [];
let metricFactors = [];
let sizes = [];

let clicked = null;

sizeInput.addEventListener('change', e => {
  referenceSize = Number(sizeInput.value);
  draw()
});

input.addEventListener('change', e => {
  const reader = new FileReader();
  reader.addEventListener("loadend", e => {
    var src_image = new Image();
    src_image.onload = e => {
      canvas.style.display = 'block';
      canvas.height = src_image.height;
      canvas.width = src_image.width;
      ctx.drawImage(src_image, 0, 0);
      dummy.height = src_image.height;
      dummy.width = src_image.width;
      dummy.getContext('2d').drawImage(canvas, 0, 0);
      createGrids();
      draw();
    }
    src_image.src = e.target.result;
  });
  reader.readAsDataURL(e.target.files[0]);
});

canvas.addEventListener('mousedown', e => {
  clicked = getClick({x: e.offsetX, y: e.offsetY});
});

canvas.addEventListener('mousemove', e => {
  if (clicked) {
    if (clicked.grid === 'reference') {
      referenceGrid[clicked.i][clicked.j] = {x: e.offsetX, y: e.offsetY, z: 1};
    } else if (clicked.grid === 'measure') {
      measureGrid[clicked.i][clicked.j] = {x: e.offsetX, y: e.offsetY, z: 1};
    }
    draw();
  }
});

canvas.addEventListener('mouseup', e => {
  clicked = null;
  draw();
});
