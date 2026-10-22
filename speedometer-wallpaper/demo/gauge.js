// Speedometer's live demo on the intro's stage (demo/gauge.html): one speed drives both dials, the phone's big dial
// (the app's Classic design: 0-240 km/h from -95 to 117 degrees off 12 o'clock, its digits right-aligned on a
// three-digit LCD) and the floating gauge beside it (ticks 0-240 km/h over a 270-degree sweep).
(() => {
  const ticks = document.getElementById("ticks");
  const needle = document.getElementById("needle");
  const readout = document.getElementById("readout");
  const dialNeedle = document.getElementById("dial-needle");
  const dialRead = document.getElementById("dial-read");
  const NS = "http://www.w3.org/2000/svg";
  const angle = (v) => -135 + (v / 240) * 270;
  const dialAngle = (v) => -95 + (v / 240) * 212;
  const at = (a, r) => [100 + r * Math.sin(a * Math.PI / 180), 100 - r * Math.cos(a * Math.PI / 180)];
  for (let v = 0; v <= 240; v += 10) {
    const major = v % 20 === 0;
    const [x1, y1] = at(angle(v), major ? 74 : 79);
    const [x2, y2] = at(angle(v), 86);
    const line = document.createElementNS(NS, "line");
    Object.entries({ x1, y1, x2, y2, "stroke-width": major ? 3.4 : 1.6 }).forEach(([k, val]) => line.setAttribute(k, val));
    line.setAttribute("class", v >= 200 ? "tick red" : "tick");
    ticks.appendChild(line);
    if (major && v % 40 === 0) {
      const [tx, ty] = at(angle(v), 61);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", tx); t.setAttribute("y", ty); t.setAttribute("class", "num");
      t.textContent = v;
      ticks.appendChild(t);
    }
  }
  let v = 87, target = 87;
  const show = () => {
    needle.style.transform = `rotate(${angle(v)}deg)`;
    readout.textContent = String(v).padStart(3, "0");
    // DSEG7's "!" is an unlit digit's width: the app's digits sit right-aligned over the unlit "888".
    dialNeedle.style.transform = `rotate(${dialAngle(v)}deg)`;
    dialRead.textContent = String(v).padStart(3, "!");
  };
  show();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      if (Math.abs(target - v) < 1) target = 30 + Math.round(Math.random() * 170);
      v += Math.sign(target - v);
      show();
    }, 90);
  }
})();
