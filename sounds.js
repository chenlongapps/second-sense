'use strict';
(() => {
  const toggle = document.getElementById('sound-toggle');
  const label = document.getElementById('sound-label');
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let enabled = true;
  try { enabled = localStorage.getItem('second-sense-sound') !== 'off'; } catch (_) {}
  let context;
  let master;
  let generation = 0;
  const voices = new Set();
  // Short, quiet square-wave cues. No ticks or countdown sounds during a round.
  const cues = {
    select: [[720, 0, .045, .035]],
    start: [[392, 0, .055, .045], [784, .06, .075, .045]],
    stop: [[220, 0, .045, .04]],
    perfect: [[523.25, .09, .09, .04], [659.25, .19, .09, .04], [783.99, .29, .09, .04], [1046.5, .40, .19, .04]],
    good: [[523.25, .09, .08, .04], [659.25, .18, .08, .04], [783.99, .28, .15, .04]],
    result: [[440, .09, .075, .035], [349.23, .18, .12, .035]]
  };
  function updateToggle() {
    const on = enabled && !!AudioContextClass;
    toggle.setAttribute('aria-pressed', String(on));
    toggle.setAttribute('aria-label', AudioContextClass ? (on ? '音效已开启，点击静音' : '音效已关闭，点击开启') : '当前浏览器不支持音效');
    label.textContent = AudioContextClass ? (on ? '音效 开' : '音效 关') : '音效不可用';
    toggle.classList.toggle('muted', !on);
    toggle.disabled = !AudioContextClass;
  }
  function silence() {
    generation++;
    for (const oscillator of voices) {
      try { oscillator.stop(); } catch (_) {}
    }
    voices.clear();
  }
  function play(name) {
    silence();
    if (!enabled || !AudioContextClass) return;
    try {
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = .65;
        master.connect(context.destination);
      }
      const currentGeneration = generation;
      const schedule = () => {
        if (!enabled || currentGeneration !== generation || context.state !== 'running') return;
        const notes = name === 'perfect' || name === 'good' || name === 'result' ? [...cues.stop, ...cues[name]] : cues[name];
        if (!notes) return;
        const now = context.currentTime;
        for (const [frequency, offset, duration, volume] of notes) {
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          const start = now + offset;
          oscillator.type = 'square';
          oscillator.frequency.value = frequency;
          envelope.gain.setValueAtTime(0, start);
          envelope.gain.linearRampToValueAtTime(volume, start + .004);
          envelope.gain.setValueAtTime(volume, start + duration * .65);
          envelope.gain.linearRampToValueAtTime(0, start + duration);
          oscillator.connect(envelope);
          envelope.connect(master);
          voices.add(oscillator);
          oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
          oscillator.start(start);
          oscillator.stop(start + duration + .01);
        }
      };
      if (context.state === 'running') schedule();
      else context.resume().then(schedule).catch(() => {});
    } catch (_) { /* Audio availability must never interrupt the game. */ }
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('second-sense-sound', enabled ? 'on' : 'off'); } catch (_) {}
    updateToggle();
    if (enabled) play('select'); else silence();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); });
  window.gameAudio = { play, silence };
  updateToggle();
})();
