(() => {
  const WORDS = [
    ['🐱','KOT'],['🐶','PIES'],['🐟','RYBA'],['🐸','ŻABA'],['🍎','JABŁKO'],['☀️','SŁOŃCE'],
    ['🚗','AUTO'],['🐻','MIŚ'],['🐷','ŚWINIA'],['🐮','KROWA'],['🐰','KRÓLIK'],['🌙','KSIĘŻYC'],
    ['⭐','GWIAZDA'],['🌳','DRZEWO'],['🦆','KACZKA'],['🍄','GRZYB']
  ];
  const MAX_BALLOONS = 6;
  const COLORS = ['#FF5A4E','#FFC83D','#22B573','#FF8FC7','#FFFDF7','#FF9A3D'];
  const ABC = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ';
  const SHAPES = ['sq', 'ci', 'tri'];

  const $ = id => document.getElementById(id);
  let word, emoji, last = -1, balloons, guessed, done;

  // ---- audio ----
  let ac;
  function tone(freq, dur, type = 'sine', delay = 0) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + delay;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  const happy = () => { tone(523, .15); tone(659, .15, 'sine', .12); tone(784, .25, 'sine', .24); };
  const boop = () => { tone(220, .25, 'triangle'); tone(165, .3, 'triangle', .12); };
  const fanfare = () => [523,659,784,1047].forEach((f, i) => tone(f, .25, 'square', i * .15));
  function say(text) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pl-PL'; u.rate = 0.8; u.pitch = 1.3;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---- game ----
  function renderBalloons() {
    const box = $('balloons'); box.innerHTML = '';
    for (let i = 0; i < MAX_BALLOONS; i++) {
      const b = document.createElement('span');
      b.className = 'balloon c' + i + (i >= balloons ? ' gone' : '');
      box.appendChild(b);
    }
  }
  function renderWord(popLetter) {
    const w = $('word'); w.innerHTML = '';
    for (const ch of word) {
      const s = document.createElement('div');
      s.className = 'slot';
      if (guessed.has(ch)) {
        s.textContent = ch;
        if (ch === popLetter) s.classList.add('pop');
      }
      w.appendChild(s);
    }
  }
  function makeKeys() {
    const letters = new Set(word);
    const pool = [...ABC].filter(c => !letters.has(c));
    while (letters.size < 8) {
      letters.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    const arr = [...letters].sort(() => Math.random() - .5);
    const kb = $('keyboard'); kb.innerHTML = '';
    arr.forEach((c, i) => {
      const k = document.createElement('button');
      k.className = 'key'; k.textContent = c; k.dataset.l = c;
      k.style.background = COLORS[i % COLORS.length];
      k.onclick = () => guess(c);
      kb.appendChild(k);
    });
  }
  function disableKey(c) {
    const k = document.querySelector(`.key[data-l="${c}"]`);
    if (k) k.disabled = true;
  }
  function checkWin() {
    if ([...word].every(c => guessed.has(c))) {
      done = true;
      fanfare(); confetti();
      $('message').textContent = 'Taaak! 🎉';
      setTimeout(() => say('Taaak! ' + word.toLowerCase()), 400);
      $('next').classList.remove('hidden');
      return true;
    }
    return false;
  }
  function guess(c) {
    if (done || guessed.has(c)) return;
    disableKey(c);
    if (word.includes(c)) {
      guessed.add(c);
      renderWord(c); happy(); say(c.toLowerCase());
      checkWin();
    } else {
      balloons--;
      renderBalloons(); boop(); say(c.toLowerCase());
      const bear = $('bear'); bear.classList.remove('sad'); void bear.offsetWidth; bear.classList.add('sad');
      if (balloons <= 0) setTimeout(help, 900);
    }
  }
  function help() {
    if (done) return;
    const missing = [...word].find(c => !guessed.has(c));
    if (!missing) return;
    $('message').textContent = 'Spróbujmy razem!';
    say('Spróbujmy razem!');
    guessed.add(missing); disableKey(missing);
    balloons = MAX_BALLOONS;
    renderWord(missing); renderBalloons(); happy();
    if (!checkWin()) setTimeout(() => { if (!done) $('message').textContent = ''; }, 2000);
  }
  function confetti() {
    const c = $('confetti');
    for (let i = 0; i < 80; i++) {
      const d = document.createElement('div');
      d.className = 'confetto ' + SHAPES[i % SHAPES.length];
      d.style.left = Math.random() * 100 + 'vw';
      d.style.background = COLORS[i % COLORS.length];
      d.style.animationDuration = 2 + Math.random() * 2 + 's';
      d.style.animationDelay = Math.random() * .5 + 's';
      c.appendChild(d);
      setTimeout(() => d.remove(), 5000);
    }
  }
  function newWord() {
    let i;
    do { i = Math.floor(Math.random() * WORDS.length); } while (i === last && WORDS.length > 1);
    last = i;
    [emoji, word] = WORDS[i];
    balloons = MAX_BALLOONS; guessed = new Set(); done = false;
    $('picture').textContent = emoji;
    $('message').textContent = '';
    $('next').classList.add('hidden');
    renderBalloons(); renderWord(); makeKeys();
    setTimeout(() => say(word.toLowerCase()), 300);
  }

  $('picture').onclick = () => say(word.toLowerCase());
  $('next').onclick = newWord;
  document.addEventListener('dblclick', e => e.preventDefault());
  newWord();
})();
