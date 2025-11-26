// script.js - Mô phỏng thấu kính: hội tụ & phân kì (fixed: arrow direction, lens height, smooth input)
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

// resize canvas to container
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

// compute image distance di (cm) using thin lens formula 1/f = 1/do + 1/di
// f and do in cm, f can be signed (negative for diverging)
function computeDi(f, do_cm) {
  const eps = 1e-9;
  const denom = (1 / f) - (1 / do_cm);
  if (Math.abs(denom) < eps) return Infinity; // image at infinity
  return 1 / denom;
}

// small helper: draw dot
function dot(x, y, color = "#000") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, 2 * Math.PI);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // read parameters
  const type = lensTypeEl.value;
  const fInput = Number(fEl.value); // positive slider
  const f = lensSignedF(type, fInput); // signed focal length (cm)
  const do_cm = Number(doEl.value); // object distance OA (cm)
  const h_cm = Number(hEl.value); // object height AB (cm)

  fVal.textContent = fInput;
  doVal.textContent = do_cm;
  hVal.textContent = h_cm;

  const centerX = canvas.width * 0.5;   // lens vertical line at center
  const centerY = canvas.height * 0.5;  // principal axis y

  // draw principal axis
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();
  // Δ symbol on axis
  ctx.fillStyle = "#000";
  ctx.font = "18px sans-serif";
  ctx.fillText("Δ", canvas.width * 0.5 - 500, centerY - 10);


  // draw lens as single line with double arrows (height responsive)
  const lensHalfH = Math.min(canvas.height * 0.45, 260); // adaptive height
  ctx.strokeStyle = "#29b6f6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - lensHalfH);
  ctx.lineTo(centerX, centerY + lensHalfH);
  ctx.stroke();

  // arrow top (pointing outward from center)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - lensHalfH);
  ctx.lineTo(centerX - 10, centerY - lensHalfH + 20);
  ctx.lineTo(centerX + 10, centerY - lensHalfH + 20);
  ctx.fillStyle = "#29b6f6";
  ctx.fill();

  // arrow bottom
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + lensHalfH);
  ctx.lineTo(centerX - 10, centerY + lensHalfH - 20);
  ctx.lineTo(centerX + 10, centerY + lensHalfH - 20);
  ctx.fill();

  // focal points
  const f_px = Math.abs(f) * SCALE;
  ctx.fillStyle = "#000";
  ctx.font = "14px sans-serif";
  ctx.fillText("F", centerX - f_px - 8, centerY - 10);
  ctx.fillText("F'", centerX + f_px - 6, centerY - 10);
  ctx.fillText("O", centerX + 6, centerY + 16);

  // draw dots at F, F', O
  dot(centerX - f_px, centerY);
  dot(centerX + f_px, centerY);
  dot(centerX, centerY);

  // object A,B: OA = do_cm
  const objX = centerX - do_cm * SCALE;
  const objTopY = centerY - h_cm * SCALE;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(objX, centerY);
  ctx.lineTo(objX, objTopY);
  ctx.stroke();
  // arrow head on object (pointing away from axis)
  ctx.beginPath();
  // arrow should point up if object top is above centerY (usually yes)
  ctx.moveTo(objX - 6, objTopY + 10);
  ctx.lineTo(objX, objTopY);
  ctx.lineTo(objX + 6, objTopY + 10);
  ctx.fill();

  // compute image distance di
  const di_cm = computeDi(f, do_cm); // signed or Infinity
  const imageX = centerX + (isFinite(di_cm) ? di_cm * SCALE : (Math.sign(di_cm || 1) * canvas.width));
  // image height hi = m*h where m = -di/do
  const hi_cm = isFinite(di_cm) ? (-di_cm / do_cm) * h_cm : 0;
  const imageTopY = centerY - hi_cm * SCALE;

  // determine real/virtual image for display
  const isReal = isFinite(di_cm) && di_cm > 0;

  // draw image A'B' (solid if real, dashed if virtual)
  ctx.lineWidth = 3;
  if (isReal) ctx.setLineDash([]);
  else ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "#d32f2f";
  ctx.beginPath();
  ctx.moveTo(imageX, centerY);
  ctx.lineTo(imageX, imageTopY);
  ctx.stroke();

  // arrow head for image: direction depends on where imageTopY is relative to axis
  ctx.beginPath();
  if (imageTopY < centerY) {
    // image above axis -> arrow should point upward (tip at imageTopY)
    ctx.moveTo(imageX - 6, imageTopY + 10);
    ctx.lineTo(imageX, imageTopY);
    ctx.lineTo(imageX + 6, imageTopY + 10);
  } else {
    // image below axis -> arrow should point downward (tip at imageTopY)
    ctx.moveTo(imageX - 6, imageTopY - 10);
    ctx.lineTo(imageX, imageTopY);
    ctx.lineTo(imageX + 6, imageTopY - 10);
  }
  ctx.fillStyle = "#d32f2f";
  ctx.fill();


  ctx.setLineDash([]);

  // --- RAYS ---
  const objTop = { x: objX, y: objTopY };
  const lensX = centerX;
  const hitPoint = { x: lensX, y: objTopY }; // ray parallel meets lens at same y
  const focalLeft = { x: centerX - f_px, y: centerY };
  const focalRight = { x: centerX + f_px, y: centerY };
  const lensCenter = { x: lensX, y: centerY };

  // RAY 1: object top -> parallel to axis -> hits lens -> refracted
  // draw incident (solid)
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(objTop.x, objTop.y);
  ctx.lineTo(hitPoint.x, hitPoint.y);
  ctx.stroke();

  // refracted part
  if (type === "converging") {
    // For converging lens:
    // refracted ray should pass through image point (if real) or appear to come from focalRight (if virtual).
    if (isReal && isFinite(di_cm)) {
      // draw refracted ray extended all the way to right edge along line from hitPoint through image point
      const extXR = canvas.width - 10;
      // slope through hitPoint -> image
      let slopeR = (imageTopY - hitPoint.y) / ((imageX - hitPoint.x) || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(hitPoint.x, hitPoint.y);
      ctx.lineTo(extXR, extYR);
      ctx.stroke();

      // (optionally) draw dashed backward to focalRight if you want the construction line
    } else {
      // virtual image (object inside focal length) or image at infinity
      // draw refracted ray that goes to right edge (solid), and dashed back to virtual image X
      // compute ray direction through focalRight
      const dx = focalRight.x - hitPoint.x;
      const dy = focalRight.y - hitPoint.y;
      // extend forward to right edge
      const extXR = canvas.width - 10;
      const slopeR = dy / (dx || 1e-6);
      const extYR = hitPoint.y + slopeR * (extXR - hitPoint.x);

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(hitPoint.x, hitPoint.y);
      ctx.lineTo(extXR, extYR);
      ctx.stroke();

      // dashed extension back toward virtual image location (to imageX,imageTopY)
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
    // diverging lens: refracted ray diverges; appears to come from focalLeft
    // vector from focalLeft to hitPoint
    const vx = hitPoint.x - focalLeft.x;
    const vy = hitPoint.y - focalLeft.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len;
    const uy = vy / len;
    // draw refracted solid to right boundary along (ux,uy)
    const clampX = canvas.width - 10;
    const s = (clampX - hitPoint.x) / (ux || 1e-6);
    const clampY = hitPoint.y + s * uy;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(hitPoint.x, hitPoint.y);
    ctx.lineTo(clampX, clampY);
    ctx.stroke();

    // dashed extension backward from hitPoint toward focalLeft (virtual origin)
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(hitPoint.x, hitPoint.y);
    ctx.lineTo(focalLeft.x, focalLeft.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // RAY 2: object top -> through optical center O -> straight line (no deviation)
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(objTop.x, objTop.y);
  // line direction from object top to lens center
  const dirX = lensCenter.x - objTop.x;
  const dirY = lensCenter.y - objTop.y;
  // extend forward to right boundary
  const param = (canvas.width - 10 - objTop.x) / (dirX || 1e-6);
  const extY = objTop.y + param * dirY;
  ctx.lineTo(canvas.width - 10, extY);
  ctx.stroke();

  // if image is virtual (di < 0) we need to draw dashed backward extension of this ray to meet virtual image
  if (!isReal && isFinite(di_cm)) {
    // direction vector from lens back along same line (opposite of dirX,dirY)
    const back_dx = -dirX;
    const back_dy = -dirY;
    // find s s.t. lensX + s*back_dx = imageX => s = (imageX - lensX)/back_dx
    const sBack = (imageX - lensX) / (back_dx || 1e-6);
    const backY = lensCenter.y + sBack * back_dy;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(lensCenter.x, lensCenter.y);
    ctx.lineTo(imageX, backY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // labels A,B,A',B'
  ctx.fillStyle = "#000";
  ctx.font = "14px sans-serif";
  ctx.fillText("A", objX - 14, centerY + 16);
  ctx.fillText("B", objX - 14, objTopY - 6);
  ctx.fillText("A'", imageX + 6, centerY + 16);
  ctx.fillText("B'", imageX + 6, imageTopY - 6);
}

// schedule drawing to be smooth on input
function scheduleDraw() {
  if (window._drawID) cancelAnimationFrame(window._drawID);
  window._drawID = requestAnimationFrame(draw);
}

// attach inputs to scheduled draw to avoid stutter
[fEl, doEl, hEl, lensTypeEl].forEach(el => el.addEventListener("input", scheduleDraw));
resetBtn.addEventListener("click", () => {
  fEl.value = 10; doEl.value = 30; hEl.value = 8; lensTypeEl.value = "converging";
  scheduleDraw();
});

// initial resize + draw
setTimeout(() => {
  resize();
  scheduleDraw();
}, 50);
