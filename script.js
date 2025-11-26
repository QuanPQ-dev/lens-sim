// script.js - Mô phỏng thấu kính (giữ nguyên logic)
// + Thêm hiệu ứng GIÁNG SINH

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const lensTypeEl = document.getElementById("lensType");
const fEl = document.getElementById("f");
const doEl = document.getElementById("do");
const hEl = document.getElementById("h");
const fVal = document.getElementById("fVal");
const doVal = document.getElementById("doVal");
const hVal = document.getElementById("hVal");
const resetBtn = document.getElementById("resetBtn");
const scaleVal = document.getElementById("scaleVal");

// scale: 1 cm => px
let SCALE = 5;
scaleVal.textContent = SCALE;

// resize canvas
function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  draw();
}
window.addEventListener("resize", resize);

// helpers
function lensSignedF(type, f) {
  return type === "converging" ? Math.abs(f) : -Math.abs(f);
}

function computeDi(f, do_cm) {
  const eps = 1e-9;
  const denom = (1 / f) - (1 / do_cm);
  if (Math.abs(denom) < eps) return Infinity;
  return 1 / denom;
}

function dot(x, y, color = "#000") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}
function drawArrow(x1, y1, x2, y2, color = "#ffffff") {
    const headlen = 12;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headlen * Math.cos(angle - Math.PI / 6),
        y2 - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x2 - headlen * Math.cos(angle + Math.PI / 6),
        y2 - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(x2, y2);
    ctx.fill();
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const type = lensTypeEl.value;
  const fInput = Number(fEl.value);
  const f = lensSignedF(type, fInput);
  const do_cm = Number(doEl.value);
  const h_cm = Number(hEl.value);

  fVal.textContent = fInput;
  doVal.textContent = do_cm;
  hVal.textContent = h_cm;

  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.5;

  // axis
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();

  // Δ reference mark
  ctx.fillStyle = "#000";
  ctx.font = "20px Mountains of Christmas";
  ctx.fillText("Δ", centerX - 500, centerY - 10);

  // lens
  // ======== LENS WITH CORRECT ARROW DIRECTIONS ========
const lensHalfH = Math.min(canvas.height * 0.45, 260);
ctx.strokeStyle = "#29b6f6";
ctx.lineWidth = 4;

// thân thấu kính
ctx.beginPath();
ctx.moveTo(centerX, centerY - lensHalfH);
ctx.lineTo(centerX, centerY + lensHalfH);
ctx.stroke();

// mũi tên theo loại thấu kính
ctx.fillStyle = "#29b6f6";

// HỘI TỤ → mũi tên CHỈA RA
if (type === "converging") {
    // trên
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - lensHalfH);
    ctx.lineTo(centerX - 12, centerY - lensHalfH + 20);
    ctx.lineTo(centerX + 12, centerY - lensHalfH + 20);
    ctx.fill();

    // dưới
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + lensHalfH);
    ctx.lineTo(centerX - 12, centerY + lensHalfH - 20);
    ctx.lineTo(centerX + 12, centerY + lensHalfH - 20);
    ctx.fill();
}
// PHÂN KỲ → mũi tên CHỈA VÀO
// PHÂN KỲ – MŨI TÊN CHĨA VÀO
else {
    // trên (chĩa xuống)
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY - lensHalfH - 20);
    ctx.lineTo(centerX, centerY - lensHalfH);
    ctx.lineTo(centerX + 12, centerY - lensHalfH - 20);
    ctx.fill();

    // dưới (chĩa lên)
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY + lensHalfH + 20);
    ctx.lineTo(centerX, centerY + lensHalfH);
    ctx.lineTo(centerX + 12, centerY + lensHalfH + 20);
    ctx.fill();
}



  // focal points
  const f_px = Math.abs(f) * SCALE;

  dot(centerX - f_px, centerY);
  dot(centerX + f_px, centerY);
  dot(centerX, centerY);

  // object A,B
  const objX = centerX - do_cm * SCALE;
  const objTopY = centerY - h_cm * SCALE;

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(objX, centerY);
  ctx.lineTo(objX, objTopY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(objX - 6, objTopY + 10);
  ctx.lineTo(objX, objTopY);
  ctx.lineTo(objX + 6, objTopY + 10);
  ctx.fill();

  // image
  const di_cm = computeDi(f, do_cm);
  const imageX = centerX + (isFinite(di_cm) ? di_cm * SCALE : canvas.width);
  const hi_cm = isFinite(di_cm) ? (-di_cm / do_cm) * h_cm : 0;
  const imageTopY = centerY - hi_cm * SCALE;
  const isReal = isFinite(di_cm) && di_cm > 0;

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#d32f2f";
  ctx.setLineDash(isReal ? [] : [6, 6]);
  ctx.beginPath();
  ctx.moveTo(imageX, centerY);
  ctx.lineTo(imageX, imageTopY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  if (imageTopY < centerY) {
    ctx.moveTo(imageX - 6, imageTopY + 10);
    ctx.lineTo(imageX, imageTopY);
    ctx.lineTo(imageX + 6, imageTopY + 10);
  } else {
    ctx.moveTo(imageX - 6, imageTopY - 10);
    ctx.lineTo(imageX, imageTopY);
    ctx.lineTo(imageX + 6, imageTopY - 10);
  }
  ctx.fill();

  // RAYS
  const objTop = { x: objX, y: objTopY };
  const lensX = centerX;
  const hitPoint = { x: lensX, y: objTopY };
  const focalLeft = { x: centerX - f_px, y: centerY };
  const focalRight = { x: centerX + f_px, y: centerY };
  const lensCenter = { x: lensX, y: centerY };

  // ray 1
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(objTop.x, objTop.y);
  ctx.lineTo(hitPoint.x, hitPoint.y);
  ctx.stroke();

  if (type === "converging") {
    if (isReal && isFinite(di_cm)) {
      const extXR = canvas.width - 10;
      let slopeR = (imageTopY - hitPoint.y) / (imageX - hitPoint.x || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      ctx.beginPath();
      ctx.moveTo(hitPoint.x, hitPoint.y);
      ctx.lineTo(extXR, extYR);
      ctx.stroke();
    } else {
      const dx = focalRight.x - hitPoint.x;
      const dy = focalRight.y - hitPoint.y;
      const extXR = canvas.width - 10;
      const slopeR = dy / (dx || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      ctx.beginPath();
      ctx.moveTo(hitPoint.x, hitPoint.y);
      ctx.lineTo(extXR, extYR);
      ctx.stroke();

      if (isFinite(di_cm)) {
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y);
        ctx.lineTo(imageX, imageTopY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  } else {
    const vx = hitPoint.x - focalLeft.x;
    const vy = hitPoint.y - focalLeft.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len;
    const uy = vy / len;

    const clampX = canvas.width - 10;
    const s = (clampX - hitPoint.x) / (ux || 1e-6);
    const clampY = hitPoint.y + s * uy;

    ctx.beginPath();
    ctx.moveTo(hitPoint.x, hitPoint.y);
    ctx.lineTo(clampX, clampY);
    ctx.stroke();

    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(hitPoint.x, hitPoint.y);
    ctx.lineTo(focalLeft.x, focalLeft.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ray 2
  ctx.beginPath();
  ctx.moveTo(objTop.x, objTop.y);
  const dirX = lensCenter.x - objTop.x;
  const dirY = lensCenter.y - objTop.y;
  const param = (canvas.width - 10 - objTop.x) / (dirX || 1e-6);
  const extY = objTop.y + param * dirY;
  ctx.lineTo(canvas.width - 10, extY);
  ctx.stroke();

  if (!isReal && isFinite(di_cm)) {
    const back_dx = -dirX;
    const back_dy = -dirY;
    const sBack = (imageX - lensX) / (back_dx || 1e-6);
    const backY = lensCenter.y + sBack * back_dy;

    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(lensCenter.x, lensCenter.y);
    ctx.lineTo(imageX, backY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* =====================================================
     LABELS — VẼ SAU CÙNG ĐỂ ĐÈ LÊN TIA SÁNG
  ===================================================== */

  ctx.fillStyle = "#000";
  ctx.font = "20px Mountains of Christmas";

  ctx.fillText("A", objX - 14, centerY + 16);
  ctx.fillText("B", objX - 14, objTopY - 6);
  ctx.fillText("A'", imageX + 6, centerY + 16);
  ctx.fillText("B'", imageX + 6, imageTopY - 6);

  ctx.fillText("F", centerX - f_px - 8, centerY - 10);
  ctx.fillText("F'", centerX + f_px - 6, centerY - 10);
  ctx.fillText("O", centerX + 8, centerY + 18);
}

// smoothed draw
function scheduleDraw() {
  if (window._drawID) cancelAnimationFrame(window._drawID);
  window._drawID = requestAnimationFrame(draw);
}

[fEl, doEl, hEl, lensTypeEl].forEach(el => el.addEventListener("input", scheduleDraw));

resetBtn.addEventListener("click", () => {
  fEl.value = 10;
  doEl.value = 30;
  hEl.value = 8;
  lensTypeEl.value = "converging";
  scheduleDraw();
});

setTimeout(() => {
  resize();
  scheduleDraw();
}, 50);

/* ======================================================
   ❄ TUYẾT RƠI
====================================================== */

let snowContainer = document.createElement("div");
snowContainer.style.position = "fixed";
snowContainer.style.top = 0;
snowContainer.style.left = 0;
snowContainer.style.width = "100%";
snowContainer.style.height = "100%";
snowContainer.style.pointerEvents = "none";
snowContainer.style.overflow = "hidden";
snowContainer.style.zIndex = 9999;
document.body.appendChild(snowContainer);

function createSnow() {
  let snow = document.createElement("div");
  snow.innerHTML = "❄";
  snow.style.position = "absolute";
  snow.style.color = "white";
  snow.style.fontSize = (Math.random() * 18 + 12) + "px";
  snow.style.left = Math.random() * window.innerWidth + "px";
  snow.style.top = "-20px";
  snow.style.opacity = Math.random() * 0.8 + 0.2;
  snow.style.transition = "linear 8s";

  snowContainer.appendChild(snow);

  setTimeout(() => {
    snow.style.top = window.innerHeight + "px";
    snow.style.left = (Math.random() * 200 - 100) + "px";
  }, 10);

  setTimeout(() => {
    snow.remove();
  }, 8000);
}

setInterval(createSnow, 200);
