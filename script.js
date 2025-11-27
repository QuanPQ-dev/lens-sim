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
// thêm thanh hiển thị d' và h'
const dPrimeSlider = document.getElementById("dPrimeSlider");
const dPrimeVal = document.getElementById("dPrimeVal");

const hPrimeSlider = document.getElementById("hPrimeSlider");
const hPrimeVal = document.getElementById("hPrimeVal");


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

function dot(x, y, color = "#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}
// place this right after drawArrow(...)
function arrowRay(x1, y1, x2, y2, color = "#ffffff", dash = false) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (dash) ctx.setLineDash([6, 6]);

    // VẼ TIA
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (dash) ctx.setLineDash([]);

    // --- VẼ MŨI TÊN Ở GIỮA TIA ---
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 12;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(
        mx - size * Math.cos(angle - Math.PI / 6),
        my - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        mx - size * Math.cos(angle + Math.PI / 6),
        my - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
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
  drawChristmasBorder(ctx, canvas.width, canvas.height);


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
ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();

  // Δ reference mark
  ctx.fillStyle = "#fff";
  ctx.font = "32px Mountains of Christmas";
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
ctx.strokeStyle = "#29b6f6";
ctx.lineWidth = 3;

// ---- THẤU KÍNH HỘI TỤ (mũi TỎA RA) ----
// ---- THẤU KÍNH HỘI TỤ (mũi TỎA RA) ----
if (type === "converging") {

  ctx.strokeStyle = "#29b6f6";
  ctx.lineWidth = 2;

  // ĐỈNH TRÊN – V mở ra, mũi hướng RA ngoài
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - lensHalfH);         // đỉnh chạm thân
  ctx.lineTo(centerX - 12, centerY - lensHalfH + 20);
  ctx.moveTo(centerX, centerY - lensHalfH);
  ctx.lineTo(centerX + 12, centerY - lensHalfH + 20);
  ctx.stroke();

  // ĐỈNH DƯỚI – V mở ra, mũi hướng RA ngoài
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + lensHalfH);         // đỉnh chạm thân
  ctx.lineTo(centerX - 12, centerY + lensHalfH - 20);
  ctx.moveTo(centerX, centerY + lensHalfH);
  ctx.lineTo(centerX + 12, centerY + lensHalfH - 20);
  ctx.stroke();
}


// ---- THẤU KÍNH PHÂN KỲ (mũi CHỤM VÀO) ----
else {

    // Trên: \/ (chụm vào)
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY - lensHalfH - 20);
    ctx.lineTo(centerX, centerY - lensHalfH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 12, centerY - lensHalfH - 20);
    ctx.lineTo(centerX, centerY - lensHalfH);
    ctx.stroke();

    // Dưới: /\ (chụm vào)
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY + lensHalfH + 20);
    ctx.lineTo(centerX, centerY + lensHalfH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 12, centerY + lensHalfH + 20);
    ctx.lineTo(centerX, centerY + lensHalfH);
    ctx.stroke();
}



  // focal points
  const f_px = Math.abs(f) * SCALE;

  dot(centerX - f_px, centerY);
  dot(centerX + f_px, centerY);
  dot(centerX, centerY);

  // object A,B
  const objX = centerX - do_cm * SCALE;
  const objTopY = centerY - h_cm * SCALE;

ctx.strokeStyle = "#ffffff";
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
  // ----------------------------------------------------
// CẬP NHẬT THANH d' VÀ h' (DO MÁY TÍNH TỰ ĐỘNG)
// ----------------------------------------------------
if (isFinite(di_cm)) {
    dPrimeSlider.value = di_cm;
    dPrimeVal.textContent = di_cm.toFixed(1) + " cm";

    hPrimeSlider.value = hi_cm;
    hPrimeVal.textContent = hi_cm.toFixed(1) + " cm";
} else {
    dPrimeSlider.value = 0;
    dPrimeVal.textContent = "∞";

    hPrimeSlider.value = 0;
    hPrimeVal.textContent = "0 cm";
}


  ctx.lineWidth = 3;
ctx.strokeStyle = "#ffffff";
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
ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  arrowRay(objTop.x, objTop.y, hitPoint.x, hitPoint.y);


  if (type === "converging") {
    if (isReal && isFinite(di_cm)) {
      const extXR = canvas.width - 10;
      let slopeR = (imageTopY - hitPoint.y) / (imageX - hitPoint.x || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      arrowRay(hitPoint.x, hitPoint.y, extXR, extYR);

    } else {
      const dx = focalRight.x - hitPoint.x;
      const dy = focalRight.y - hitPoint.y;
      const extXR = canvas.width - 10;
      const slopeR = dy / (dx || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      arrowRay(hitPoint.x, hitPoint.y, extXR, extYR);


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
    arrowRay(hitPoint.x, hitPoint.y, clampX, clampY);


    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(hitPoint.x, hitPoint.y);
    ctx.lineTo(focalLeft.x, focalLeft.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ray 2
// ray 2 (thay nguyên block cũ bằng block này)
const dirX = lensCenter.x - objTop.x;
const dirY = lensCenter.y - objTop.y;
const param = (canvas.width - 10 - objTop.x) / (dirX || 1e-6);
const extY = objTop.y + param * dirY;

// vẽ tia thứ hai (có mũi tên ở cuối)
arrowRay(objTop.x, objTop.y, canvas.width - 10, extY, "#ffffff", false);


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

  ctx.fillStyle = "#ffe680";
  ctx.font = "20px Mountains of Christmas";

  ctx.fillText("A", objX - 14, centerY + 16);
  ctx.fillText("B", objX - 14, objTopY - 6);
  ctx.fillText("A'", imageX + 6, centerY + 16);
  ctx.fillText("B'", imageX + 6, imageTopY - 6);

  ctx.fillText("F", centerX - f_px - 8, centerY - 10);
  ctx.fillText("F'", centerX + f_px - 6, centerY - 10);
  ctx.fillText("O", centerX + 8, centerY + 18);
  // ⭐ VẼ TIÊU ĐỀ GIÁNG SINH
  drawChristmasText(ctx, canvas.width);
}
function drawChristmasText(ctx, width) {
    ctx.save();
    ctx.font = "60px Mountains of Christmas";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Neon glow cực mạnh
    ctx.shadowColor = "rgba(255,255,180,1)";
    ctx.shadowBlur = 40;

    // Gradient vàng neon siêu sáng
    const grad = ctx.createLinearGradient(0, 0, 0, 80);
    grad.addColorStop(0, "#FFFFFF");   // đỉnh sáng trắng
    grad.addColorStop(0.2, "#FFF89C"); // vàng sáng
    grad.addColorStop(0.3, "#FFFF66"); // vàng neon sáng gắt
    grad.addColorStop(0.6, "#FFFF33"); // vàng siêu sáng
    grad.addColorStop(1, "#FFE600");   // vàng chanh rực


    ctx.fillStyle = grad;

    ctx.fillText("Merry Christmas", width / 2, 630);

    ctx.restore();
}


function drawChristmasBorder(ctx, W, H) {
    ctx.save();

    // ---- CÀNH THÔNG MÀU XANH (BRUSH) ----
    function drawBranch(x, y, scale = 1, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.rotate(rotation);

        // Vẽ 1 nhánh lá thông (hình răng cưa)
        ctx.strokeStyle = "#0f8c28";
        ctx.lineWidth = 4;

        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(40, (i - 4) * 6);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ---- QUẢ CẦU ĐỎ ----
    function drawBall(x, y, r = 14) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#ff2b2b";
        ctx.shadowColor = "rgba(255,0,0,0.6)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }

    // ====== TRÊN ======
    for (let x = 0; x < W; x += 60) {
        drawBranch(x, 0, 1.2, Math.random() * 0.4 - 0.2);
    }

    // Châu đỏ
    for (let x = 40; x < W; x += 120) {
        drawBall(x, 45, 16);
    }

    // ====== DƯỚI ======
    for (let x = 0; x < W; x += 60) {
        drawBranch(x, H, 1.1, Math.PI + (Math.random() * 0.4 - 0.2));
    }

    // ====== TRÁI ======
    for (let y = 0; y < H; y += 60) {
        drawBranch(0, y, 1.1, Math.PI / 2 + (Math.random() * 0.4 - 0.2));
    }

    // ====== PHẢI ======
    for (let y = 0; y < H; y += 60) {
        drawBranch(W, y, 1.1, -Math.PI / 2 + (Math.random() * 0.4 - 0.2));
    }

    ctx.restore();
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
