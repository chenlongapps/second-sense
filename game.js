'use strict';
const $ = (id) => document.getElementById(id);
const targets = [...document.querySelectorAll('.target')];
let target = 5;
let running = false;
let startedAt = 0;
let timeoutId;
let rounds = 0;
let best = 0;
let totalError = 0;
const segments = {0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg','-':'g'};
function renderDisplay(seconds, hidden = false) {
  const centiseconds = Math.floor(seconds * 100);
  const values = hidden ? ['--','--','--'] : [String(Math.floor(centiseconds / 6000)).padStart(2,'0'),String(Math.floor(centiseconds / 100) % 60).padStart(2,'0'),String(centiseconds % 100).padStart(2,'0')];
  $('dial-number').innerHTML = values.map(value => `<span class="digit-group">${[...value].map(digit => `<span class="digit">${[...'abcdefg'].map(seg => `<i class="seg ${seg}${segments[digit].includes(seg) ? ' on' : ''}"></i>`).join('')}</span>`).join('')}</span>`).join('<span class="display-colon"><i></i><i></i></span>');
  $('dial-number').setAttribute('aria-label', hidden ? '计时中，时间已隐藏' : `${seconds.toFixed(2)} 秒`);
}
function setRunningUI(active) {
  targets.forEach(button => { button.disabled = active; });
  $('dial').classList.toggle('running', active);
  $('action').classList.toggle('running', active);
  $('action-label').textContent = active ? '停止计时' : rounds ? '再挑战一次' : '开始挑战';
  $('action-glyph').textContent = active ? 'STOP' : 'GO';
  $('status').textContent = active ? '计时进行中' : '准备就绪';
  $('dial-label').textContent = active ? `目标 ${target} 秒` : '目标时间';
  renderDisplay(target, active);
  $('dial-caption').textContent = active ? '在心里读秒，到点按停止。' : '准备好了，就开始吧。';
}
function start() {
  running = true;
  startedAt = performance.now();
  $('notice').textContent = '';
  $('round-badge').textContent = `ROUND ${String(rounds + 1).padStart(2, '0')}`;
  setRunningUI(true);
  window.gameAudio?.play('start');
  timeoutId = setTimeout(() => cancel('本轮已超过 60 秒。准备好后，再挑战一次。'), 60000);
}
function stop() {
  const elapsed = (performance.now() - startedAt) / 1000;
  running = false;
  clearTimeout(timeoutId);
  const signedError = elapsed - target;
  const error = Math.abs(signedError);
  const score = Math.max(0, Math.round(100 - (error / target) * 500));
  window.gameAudio?.play(score === 100 ? 'perfect' : score >= 80 ? 'good' : 'result');
  rounds++;
  best = Math.max(best, score);
  totalError += error;
  setRunningUI(false);
  $('status').textContent = '挑战完成';
  $('dial-label').textContent = '实际用时';
  $('dial-caption').textContent = '差了多少？看看你的成绩。';
  renderDisplay(elapsed);
  const verdict = score === 100 ? '时间感满分！' : score >= 95 ? '精准得惊人' : score >= 80 ? '很有默契' : score >= 50 ? '越来越接近' : '再找找节奏';
  const timing = error < .005 ? '刚刚好' : signedError < 0 ? '停早了一点' : '停晚了一点';
  const position = Math.max(0, Math.min(100, 50 + (signedError / target) * 250));
  $('result-body').innerHTML = `<div class="score-row"><div class="score">${score}<span>分</span></div><div class="verdict"><h3>${verdict}</h3><p>${timing}</p></div></div><div class="result-details"><span>实际用时 <strong>${elapsed.toFixed(3)} s</strong></span><span>误差 <strong>${signedError >= 0 ? '+' : '−'}${error.toFixed(3)} s</strong></span></div><div class="accuracy-track" aria-hidden="true"><span class="accuracy-target"></span><span class="accuracy-point" style="left:${position}%"></span></div><div class="track-labels"><span>提前</span><span>目标 ${target} 秒</span><span>超时</span></div><p class="result-note">得分按相对误差计算，越接近目标，分数越高。</p>`;
  $('best').innerHTML = `${best}<span> 分</span>`;
  $('average').innerHTML = `${(totalError / rounds).toFixed(2)}<span> s</span>`;
  $('count').innerHTML = `${rounds}<span> 次</span>`;
}
function cancel(message) {
  if (!running) return;
  window.gameAudio?.silence();
  running = false;
  clearTimeout(timeoutId);
  setRunningUI(false);
  $('notice').textContent = message;
}
function act() { if (running) stop(); else start(); }
targets.forEach(button => button.addEventListener('click', () => {
  if (running) return;
  window.gameAudio?.play('select');
  target = Number(button.dataset.seconds);
  targets.forEach(option => {
    const selected = option === button;
    option.classList.toggle('active', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  $('notice').textContent = '';
  setRunningUI(false);
}));
$('action').addEventListener('click', act);
document.addEventListener('keydown', event => {
  if (event.target.closest?.('#sound-toggle')) return;
  if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
  event.preventDefault();
  if (!event.repeat) act();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancel('页面切换已暂停本轮，成绩不计入统计。回来后可以重新挑战。');
});
renderDisplay(target);
