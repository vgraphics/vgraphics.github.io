// The fades of every song and recording on the product pages, one piece for all (George, 28 Oct 2026: "Music must
// always start and end with fading"): assets/soundtrack.js's songs and assets/product.js's voices (the quotes' buttons
// and the role cards') each get a fader. It sets their <audio>'s level as the product of the visitor's own volume, a
// fade (in when it starts, out when it stops or skips, and out over its last seconds, its tail) and a duck: while a
// voice speaks the songs sink to a quarter, and they rise again after it.
// Where the browser honours an element's volume the fader sets that, so background play, media keys and the lock
// screen work as before. iOS ignores a page's volume, so there the element plays through a Web Audio gain, with the
// page's audio session set to playback so that the silent switch doesn't mute it; an iPhone without that setting
// (before Safari 17) plays as before, without fades. Both players import this module, so they share the one instance,
// as assets/menu.js loads its helpers; until it has loaded they play as they are.

const probe = document.createElement("audio");
probe.volume = 0.5;
const own = probe.volume === 0.5; // the element's volume is the page's to set
const Context = window.AudioContext || window.webkitAudioContext;
const gainable = !own && Boolean(Context) && "audioSession" in navigator;
const DUCK = 0.25;
const faders = new Set();
let ctx = null;
let timer = 0;

// A level on its way from one value to another over some seconds
const clock = () => performance.now() / 1000;
const glide = (from, to, s = 0) => ({ from, to, t0: clock(), s });
const over = (g) => clock() - g.t0 >= g.s;
const value = (g) => (over(g) ? g.to : g.from + (g.to - g.from) * ((clock() - g.t0) / g.s));

// Sets every fader's level every 15 ms while one is moving or near its recording's end, then rests
function tick() {
  let busy = false;
  for (const f of faders) busy = f.step() || busy;
  if (!busy) {
    clearInterval(timer);
    timer = 0;
  }
}
function wake() {
  if (!timer) timer = setInterval(tick, 15);
  tick();
}

// After a press: wakes the sound where the browser had put it to sleep (iOS does, between plays)
export function resume() {
  if (ctx && ctx.state !== "running") ctx.resume().catch(() => {});
}

// Sinks every song under a voice (true), or brings them back after it (false)
export function duck(on) {
  for (const f of faders) if (f.music) f.duck(on);
}

// A fader for one <audio>: tail, the seconds it fades out over before its end; music, a song that ducks under the
// voices. Make it from a press, before the element first plays: on iOS that routes the element through Web Audio, for
// good. Its level starts full.
export function fader(audio, { tail = 0, music = false } = {}) {
  let gain = null;
  if (gainable) {
    try {
      ctx ??= new Context();
      navigator.audioSession.type = "playback";
      gain = ctx.createGain();
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    } catch {
      gain = null;
    }
  }
  resume();
  let base = 1, fade = glide(1, 1), sink = glide(1, 1), done = null, last = -1;
  const f = {
    music,
    // The visitor's own volume, 0 to 1 (the soundtrack's slider)
    set volume(v) {
      base = v;
      wake();
    },
    // Fades to a level, 0 to 1, over s seconds; resolves true once there, or false when another fade takes over first
    to(level, s = 0) {
      done?.(false);
      fade = glide(value(fade), level, s);
      const p = new Promise((resolve) => (done = resolve));
      wake();
      return p;
    },
    duck(on) {
      sink = glide(value(sink), on ? DUCK : 1, on ? 0.3 : 0.8);
      wake();
    },
    step() {
      if (done && over(fade)) {
        done(true);
        done = null;
      }
      const left = audio.duration - audio.currentTime;
      const near = tail > 0 && !audio.paused && left < tail + 0.5;
      const end = near && left < tail ? Math.max(0, left / tail) : 1;
      const level = Math.min(1, Math.max(0, base * value(fade) * value(sink) * end));
      if (level !== last) {
        last = level;
        if (gain) gain.gain.setTargetAtTime(level, ctx.currentTime, 0.01);
        else if (own) audio.volume = level;
      }
      return !over(fade) || !over(sink) || near;
    },
  };
  faders.add(f);
  // The tail's last stretch: the clock wakes as the end comes near
  audio.addEventListener("playing", wake);
  audio.addEventListener("timeupdate", wake);
  return f;
}
