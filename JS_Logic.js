// BG Music
window.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic) {
    bgMusic.volume = 0.02; // volume
    bgMusic.play().catch(() => {
      document.body.addEventListener('click', () => {
        bgMusic.play();
      }, { once: true });
    });
  }
});

// XP & Coins
let xp = parseInt(localStorage.getItem('xp') || '10', 10);
let coins = parseInt(localStorage.getItem('coins') || '10', 10);
const xpDisplay = document.getElementById('xpDisplay');
const coinDisplay = document.getElementById('coinDisplay');

if (xpDisplay) xpDisplay.textContent = xp;
if (coinDisplay) coinDisplay.textContent = coins;

function updateCoinDisplay() {
  localStorage.setItem('coins', coins);
  if (coinDisplay) coinDisplay.textContent = coins;
}

function updateXPDisplay() {
  localStorage.setItem('xp', xp);
  if (xpDisplay) xpDisplay.textContent = xp;
}

function addXP(amount) {
  xp += amount;
  updateXPDisplay();
  incrementQuestProgress('daily', 5, amount);
  incrementQuestProgress('weekly', 5, amount);
}

function addCoins(amount) {
  coins += amount;
  updateCoinDisplay();
}

// Confetti
function launchConfetti() {
  if (typeof confetti !== 'function') return;
  const duration = 1200;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// Sounds
const soundCorrect = document.getElementById('soundCorrect');
const soundWrong = document.getElementById('soundWrong');
const soundTimeUp = document.getElementById('soundTimeUp');

// Page navigation
const pages = ['home', 'math', 'ela', 'games', 'profile'];
function showPage(name) {
  const readingPage = document.getElementById("page-ela-reading");
  const spellingPage = document.getElementById("page-ela-spelling");

  if (readingPage) readingPage.classList.add("hidden");
  if (spellingPage) spellingPage.classList.add("hidden");

  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });
}

document.querySelectorAll('.page-link').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page) showPage(page);
  });
});
showPage('home'); // default

// ===========================================
// QUEST & TASK REWARD SYSTEM CONFIG & LOGIC
// ===========================================
function getDefaultQuests() {
  return {
    daily: [
      { id: 'd0', title: 'Math Marathon', desc: 'Complete 10 Math Quests today', target: 10, current: 0, rewardCoins: 200, rewardXP: 350, completed: false, claimed: false },
      { id: 'd1', title: 'Avid Reader', desc: 'Complete 5 ELA Reading Sessions', target: 5, current: 0, rewardCoins: 300, rewardXP: 450, completed: false, claimed: false },
      { id: 'd2', title: 'Spelling Master', desc: 'Spell 15 Words Correctly', target: 15, current: 0, rewardCoins: 250, rewardXP: 400, completed: false, claimed: false },
      { id: 'd3', title: 'High Roller', desc: 'Spend 500 Coins in the Arcade', target: 500, current: 0, rewardCoins: 400, rewardXP: 500, completed: false, claimed: false },
      { id: 'd4', title: 'Wardrobe Overhaul', desc: 'Unlock or Equip 3 Customization Items', target: 3, current: 0, rewardCoins: 350, rewardXP: 450, completed: false, claimed: false },
      { id: 'd5', title: 'XP Titan', desc: 'Earn 500 Total XP Today', target: 500, current: 0, rewardCoins: 450, rewardXP: 500, completed: false, claimed: false }
    ],
    weekly: [
      { id: 'w0', title: 'Grand Math Architect', desc: 'Complete 75 Math Quests this week', target: 75, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false },
      { id: 'w1', title: 'Literary Legend', desc: 'Complete 35 ELA Reading Quests', target: 35, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false },
      { id: 'w2', title: 'Lexicon Overlord', desc: 'Spell 100 Words Correctly', target: 100, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false },
      { id: 'w3', title: 'Arcade Addict', desc: 'Play 25 Arcade Game Sessions', target: 25, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false },
      { id: 'w4', title: 'Ultimate Collector', desc: 'Unlock 5 New Characters or Pets', target: 5, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false },
      { id: 'w5', title: 'Mythic XP Champion', desc: 'Earn 5,000 Total XP This Week', target: 5000, current: 0, rewardCoins: 500, rewardXP: 500, completed: false, claimed: false }
    ]
  };
}

let questData = JSON.parse(localStorage.getItem('questSystemData')) || getDefaultQuests();

function saveQuestData() {
  localStorage.setItem('questSystemData', JSON.stringify(questData));
}

function updateQuestBadge() {
  const badge = document.getElementById('questNotificationBadge');
  if (!badge) return;
  let claimableCount = 0;
  ['daily', 'weekly'].forEach(type => {
    questData[type].forEach(q => {
      if (q.completed && !q.claimed) claimableCount++;
    });
  });
  if (claimableCount > 0) {
    badge.textContent = claimableCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderQuests() {
  const dailyContainer = document.getElementById('dailyQuestsContainer');
  const weeklyContainer = document.getElementById('weeklyQuestsContainer');
  if (!dailyContainer || !weeklyContainer) return;

  dailyContainer.innerHTML = '';
  weeklyContainer.innerHTML = '';

  questData.daily.forEach((q, idx) => {
    dailyContainer.appendChild(createQuestCard(q, 'daily', idx));
  });

  questData.weekly.forEach((q, idx) => {
    weeklyContainer.appendChild(createQuestCard(q, 'weekly', idx));
  });

  updateQuestBadge();
}

function createQuestCard(q, type, idx) {
  const card = document.createElement('div');
  const isCompleted = q.completed;
  const isClaimed = q.claimed;
  const progressPercent = Math.min(100, Math.floor((q.current / q.target) * 100));

  // Daily uses amber, Weekly uses blue theme
  const badgeBg = type === 'daily' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40';

  card.className = `bg-slate-800 border-4 border-slate-950 p-4 space-y-3 shadow-[4px_4px_0px_0px_#020617]`;

  let buttonHtml = '';
  if (isClaimed) {
    buttonHtml = `<button disabled class="w-full font-black py-2 rounded-lg bg-slate-700 text-slate-400 text-xs uppercase cursor-not-allowed border border-slate-600">Claimed</button>`;
  } else if (isCompleted) {
    buttonHtml = `<button onclick="claimQuest('${type}', ${idx})" class="w-full font-black py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs uppercase shadow-[3px_3px_0px_0px_#020617] active:translate-x-0.5 active:translate-y-0.5 transition-none">Claim Reward!</button>`;
  } else {
    buttonHtml = `<button disabled class="w-full font-black py-2 rounded-lg bg-slate-800 text-slate-500 text-xs uppercase cursor-not-allowed border border-slate-700">In Progress (${q.current}/${q.target})</button>`;
  }

  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs uppercase px-2 py-0.5 rounded border font-black ${badgeBg}">${type === 'daily' ? 'Daily' : 'Weekly'}</span>
        <h4 class="font-bold text-sm text-slate-100">${q.title}</h4>
      </div>
      <div class="flex items-center gap-2 text-xs font-bold">
        <span class="flex items-center gap-1 text-yellow-400"><img src="Image%20Assets/Coin%20Icon.webp" class="w-4 h-4" alt="Coins">+${q.rewardCoins}</span>
        <span class="flex items-center gap-1 text-cyan-400"><img src="Image%20Assets/XP%20Icon.webp" class="w-4 h-4" alt="XP">+${q.rewardXP}</span>
      </div>
    </div>
    <p class="text-xs text-slate-300">${q.desc}</p>
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] text-slate-400 font-bold">
        <span>Progress</span>
        <span>${Math.min(q.current, q.target)} / ${q.target}</span>
      </div>
      <div class="w-full bg-slate-950 h-3 border-2 border-slate-950 overflow-hidden">
        <div class="h-full ${type === 'daily' ? 'bg-amber-500' : 'bg-blue-500'} transition-all duration-300" style="width: ${progressPercent}%;"></div>
      </div>
    </div>
    ${buttonHtml}
  `;
  return card;
}

function incrementQuestProgress(type, questIndex, amount = 1) {
  if (!questData[type] || !questData[type][questIndex]) return;
  const q = questData[type][questIndex];
  if (q.completed) return;

  q.current += amount;
  if (q.current >= q.target) {
    q.current = q.target;
    q.completed = true;
    if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play().catch(()=>{}); }
    launchConfetti();
  }
  saveQuestData();
  renderQuests();
}

window.claimQuest = function(type, idx) {
  const q = questData[type][idx];
  if (!q.completed || q.claimed) return;

  q.claimed = true;
  addCoins(q.rewardCoins);
  addXP(q.rewardXP);
  if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play().catch(()=>{}); }
  launchConfetti();
  saveQuestData();
  renderQuests();
};

function switchQuestTab(tab) {
  const dailyBtn = document.getElementById('tabDailyBtn');
  const weeklyBtn = document.getElementById('tabWeeklyBtn');
  const dailyContainer = document.getElementById('dailyQuestsContainer');
  const weeklyContainer = document.getElementById('weeklyQuestsContainer');

  if (tab === 'daily') {
    dailyBtn.className = 'flex-1 py-3 font-black text-sm uppercase bg-amber-500 text-slate-950 border-r-2 border-slate-950 transition-colors';
    weeklyBtn.className = 'flex-1 py-3 font-black text-sm uppercase bg-slate-800 text-slate-300 border-l-2 border-slate-950 transition-colors';
    dailyContainer.classList.remove('hidden');
    weeklyContainer.classList.add('hidden');
  } else {
    weeklyBtn.className = 'flex-1 py-3 font-black text-sm uppercase bg-blue-600 text-slate-950 border-l-2 border-slate-950 transition-colors';
    dailyBtn.className = 'flex-1 py-3 font-black text-sm uppercase bg-slate-800 text-slate-300 border-r-2 border-slate-950 transition-colors';
    weeklyContainer.classList.remove('hidden');
    dailyContainer.classList.add('hidden');
  }
}

// Modal wiring
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openQuestsModal');
  const closeBtn = document.getElementById('closeQuestsModal');
  const modal = document.getElementById('questsModal');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      renderQuests();
    });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  renderQuests();
});

//==============//
// Math logic
//=============//
const mathGradeSelect = document.getElementById('mathGrade');
const mathQuestionText = document.getElementById('mathQuestionText');
const mathVisual = document.getElementById('mathVisual');
const mathSvgContainer = document.getElementById('mathSvgContainer');
const mathChoices = document.getElementById('mathChoices');
const mathFeedback = document.getElementById('mathFeedback');
let currentMathAnswer = null;
let currentGrade = 1;
let currentShapeType = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathQuestion(grade) {
  if (!mathQuestionText || !mathChoices) return;
  currentGrade = grade;
  let question = '';
  let answer = 0;
  let visual = '';
  currentShapeType = null;
  if (mathSvgContainer) mathSvgContainer.innerHTML = '';

  if (grade === 1) {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    answer = a + b;
    question = `Count the apples and add them together. How many apples are there in total?`;
    visual = '🍎 '.repeat(a) + '   +   ' + '🍎 '.repeat(b);
  } else if (grade === 2) {
    if (Math.random() < 0.5) {
      const start = randomInt(1, 5);
      const step = randomInt(1, 3);
      const seq = [start, start + step, start + 2 * step, start + 3 * step];
      answer = start + 4 * step;
      question = `Identify the pattern and extend it. What number comes next?`;
      visual = seq.join('  ') + '  ...';
    } else {
      const total = randomInt(5, 12);
      const known = randomInt(1, total - 1);
      const missing = total - known;
      answer = missing;
      question = `Find the missing number: ${known} + ? = ${total}`;
      visual = '🍎 '.repeat(known) + '   +   ' + '?   =   ' + '🍎 '.repeat(total);
    }
  } else if (grade === 3) {
    if (Math.random() < 0.5) {
      const a = randomInt(2, 10);
      const b = randomInt(2, 10);
      answer = a * b;
      question = `What is ${a} × ${b}?`;
    } else {
      const divisor = randomInt(2, 10);
      const quotient = randomInt(2, 10);
      const dividend = divisor * quotient;
      answer = quotient;
      question = `What is ${dividend} ÷ ${divisor}?`;
    }
  } else if (grade === 4) {
    if (Math.random() < 0.5) {
      const x = randomInt(1, 10);
      const a = randomInt(1, 5);
      const b = randomInt(1, 10);
      const c = a * x + b;
      answer = x;
      question = `Solve for x: ${a}x + ${b} = ${c}`;
    } else {
      const a = randomInt(2, 10);
      const b = randomInt(2, 10);
      const c = randomInt(2, 10);
      answer = a * (b + c);
      question = `Use the distributive property: ${a}(${b} + ${c}) = ?`;
    }
  } else if (grade === 5) {
    if (Math.random() < 0.5) {
      const a = randomInt(1, 5);
      const b = randomInt(1, 5);
      const c = randomInt(1, 5);
      answer = a + Math.pow(b, 2) * c;
      question = `Evaluate: ${a} + ${b}<sup>2</sup> × ${c}`;
    } else {
      const x = randomInt(1, 10);
      const a = randomInt(1, 5);
      const b = randomInt(1, 10);
      const c = a * x + b;
      answer = x;
      question = `Solve the equation: ${a}x + ${b} = ${c}`;
    }
  } else if (grade === 6) {
    const shapeTypes = ['circle', 'square', 'rectangle', 'rhombus', 'triangle'];
    const shape = shapeTypes[randomInt(0, shapeTypes.length - 1)];
    currentShapeType = shape;

    let displayText = '';
    let correctArea = 0;

    if (shape === 'circle') {
      const r = randomInt(2, 10);
      correctArea = 3.14 * r * r;
      displayText = `Find the area of the circle with radius ${r}. Round to the nearest tenth.`;
      drawCircleSvg();
    } else if (shape === 'square') {
      const s = randomInt(2, 15);
      correctArea = s * s;
      displayText = `Find the area of the square with side length ${s}. Round to the nearest tenth.`;
      drawSquareSvg();
    } else if (shape === 'rectangle') {
      const l = randomInt(3, 20);
      const w = randomInt(2, 15);
      correctArea = l * w;
      displayText = `Find the area of the rectangle with length ${l} and width ${w}. Round to the nearest tenth.`;
      drawRectangleSvg();
    } else if (shape === 'rhombus') {
      const d1 = randomInt(4, 15);
      const d2 = randomInt(4, 15);
      correctArea = (d1 * d2) / 2;
      displayText = `Find the area of the rhombus with diagonals ${d1} and ${d2}. Round to the nearest tenth.`;
      drawRhombusSvg();
    } else if (shape === 'triangle') {
      const b = randomInt(4, 15);
      const h = randomInt(4, 15);
      correctArea = 0.5 * b * h;
      displayText = `Find the area of the triangle with base ${b} and height ${h}. Round to the nearest tenth.`;
      drawTriangleSvg();
    }

    answer = parseFloat(correctArea.toFixed(1));
    question = displayText;
  }

  currentMathAnswer = answer;
  mathQuestionText.innerHTML = question;
  if (mathVisual) mathVisual.textContent = visual;
  if (mathFeedback) mathFeedback.textContent = '';
  mathChoices.innerHTML = '';

  const choices = [answer];
  while (choices.length < 4) {
    let delta = (currentGrade === 6) ? (Math.random() * 4 - 2) : randomInt(-3, 3);
    if (delta === 0) continue;
    let candidate = (currentGrade === 6)
      ? parseFloat((answer + delta).toFixed(1))
      : answer + delta;
    if (!choices.includes(candidate)) choices.push(candidate);
  }
  choices.sort(() => Math.random() - 0.5);

  choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.className = 'px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold';
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mathChoices button').forEach(b => {
        b.disabled = true;
        b.classList.add('opacity-50', 'cursor-not-allowed');
      });

      if (c === currentMathAnswer) {
        if (mathFeedback) {
          mathFeedback.textContent = 'Correct! +10 XP and +10 coins.';
          mathFeedback.className = 'text-sm text-emerald-400';
        }
        if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play(); }
        addCoins(10);
        addXP(10);
        launchConfetti();

        // Increment Math Quests
        incrementQuestProgress('daily', 0, 1);
        incrementQuestProgress('weekly', 0, 1);

        setTimeout(() => {
          generateMathQuestion(currentGrade);
        }, 1000);
      } else {
        let feedbackText = 'Oops, try again!';
        if (currentGrade === 6 && currentShapeType) {
          if (currentShapeType === 'circle') feedbackText += ' Area of a circle: A = πr².';
          if (currentShapeType === 'square') feedbackText += ' Area of a square: A = s².';
          if (currentShapeType === 'rectangle') feedbackText += ' Area of a rectangle: A = l × w.';
          if (currentShapeType === 'rhombus') feedbackText += ' Area of a rhombus: A = (d₁ × d₂) / 2.';
          if (currentShapeType === 'triangle') feedbackText += ' Area of a triangle: A = ½ × b × h.';
        }

        if (mathFeedback) {
          mathFeedback.textContent = feedbackText;
          mathFeedback.className = 'text-sm text-pink-400';
        }
        if (soundWrong) { soundWrong.currentTime = 0; soundWrong.play(); }

        setTimeout(() => {
          generateMathQuestion(currentGrade);
        }, 1500);
      }
    });

    mathChoices.appendChild(btn);
  });
}

function drawCircleSvg() {
  if (mathSvgContainer) mathSvgContainer.innerHTML = `<svg width="160" height="160"><circle cx="80" cy="80" r="60" fill="none" stroke="white" stroke-width="8" /></svg>`;
}
function drawSquareSvg() {
  if (mathSvgContainer) mathSvgContainer.innerHTML = `<svg width="160" height="160"><rect x="30" y="30" width="100" height="100" fill="none" stroke="white" stroke-width="8" /></svg>`;
}
function drawRectangleSvg() {
  if (mathSvgContainer) mathSvgContainer.innerHTML = `<svg width="200" height="140"><rect x="20" y="30" width="160" height="80" fill="none" stroke="white" stroke-width="8" /></svg>`;
}
function drawRhombusSvg() {
  if (mathSvgContainer) mathSvgContainer.innerHTML = `<svg width="200" height="160"><polygon points="100,20 170,80 100,140 30,80" fill="none" stroke="white" stroke-width="8" /></svg>`;
}
function drawTriangleSvg() {
  if (mathSvgContainer) mathSvgContainer.innerHTML = `<svg width="200" height="160"><polygon points="40,140 160,140 100,40" fill="none" stroke="white" stroke-width="8" /></svg>`;
}

const newMathBtn = document.getElementById('newMathQuestion');
if (newMathBtn) {
  newMathBtn.addEventListener('click', () => {
    const grade = parseInt(mathGradeSelect.value, 10);
    generateMathQuestion(grade);
  });
}
if (mathGradeSelect) generateMathQuestion(parseInt(mathGradeSelect.value, 10));

//=====================//
// ELA LOGIC (READING)
//=====================//
const elaLevelSelect = document.getElementById('elaLevel');
const elaCitation = document.getElementById('elaCitation');
const elaText = document.getElementById('elaText');
const elaQuestionsDiv = document.getElementById('elaQuestions');
const elaFeedback = document.getElementById('elaFeedback');
let elaData = null;

function loadElaData() {
  if (!elaData) {
    try {
      if (!window.ELA_DATA) {
        throw new Error("ELA_DATA is not defined. Make sure ela_data.js is loaded.");
      }
      elaData = window.ELA_DATA;
    } catch (e) {
      console.error("ELA_DATA.JS Load Error:", e);
      if (elaCitation) elaCitation.textContent = "Error loading ELA data.";
      if (soundTimeUp) { soundTimeUp.currentTime = 0; soundTimeUp.play(); }
      return;
    }
  }

  const level = elaLevelSelect.value;
  const levelArray = elaData[level];
  if (!levelArray || levelArray.length === 0) {
    if (elaCitation) elaCitation.textContent = "No data found for this level.";
    return;
  }
  const entry = levelArray[Math.floor(Math.random() * levelArray.length)];

  if (elaCitation) elaCitation.textContent = entry.citation;
  if (elaText) elaText.textContent = entry.text;
  if (elaQuestionsDiv) elaQuestionsDiv.innerHTML = "";
  if (elaFeedback) elaFeedback.textContent = "";

  entry.questions.forEach((q, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-slate-900/70 border border-slate-700 rounded-xl p-3 space-y-2";

    const qText = document.createElement("p");
    qText.className = "text-sm font-semibold";
    qText.textContent = `Q${idx + 1}. ${q.question}`;
    wrapper.appendChild(qText);

    const choicesDiv = document.createElement("div");
    choicesDiv.className = "space-y-1";

    q.choices.forEach((choice, cIdx) => {
      const label = document.createElement("label");
      label.className = "flex items-center gap-2 text-sm";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `ela-q-${idx}`;
      input.value = cIdx;
      input.className = "accent-cyan-400";

      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      choicesDiv.appendChild(label);
    });

    wrapper.appendChild(choicesDiv);
    if (elaQuestionsDiv) elaQuestionsDiv.appendChild(wrapper);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Answers";
  submitBtn.className = "mt-2 px-3 py-2 font-black py-3 rounded-none border-4 border-slate-950 bg-violet-800 text-white uppercase shadow-[6px_6px_0px_0px_#020617] hover:bg-violet-600 hover:shadow-[4px_4px_0px_0px_#020617] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-none";
  submitBtn.addEventListener('click', () => {
    document.querySelectorAll('#elaQuestions input[type="radio"]').forEach(r => {
      r.disabled = true;
    });
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

    let correctCount = 0;
    entry.questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="ela-q-${idx}"]:checked`);
      if (selected && parseInt(selected.value, 10) === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount === entry.questions.length) {
      if (elaFeedback) {
        elaFeedback.textContent = `Perfect! You got all ${correctCount} correct. +30 XP and +30 coins.`;
        elaFeedback.className = 'text-sm text-emerald-400';
      }
      if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play(); }
      addCoins(30);
      addXP(30);
      launchConfetti();

      // Increment ELA Reading Quests
      incrementQuestProgress('daily', 1, 1);
      incrementQuestProgress('weekly', 1, 1);

      setTimeout(() => {
        loadElaData();
      }, 1500);
    } else {
      if (elaFeedback) {
        elaFeedback.textContent = `You got ${correctCount} out of ${entry.questions.length} correct. Try again!`;
        elaFeedback.className = 'text-sm text-pink-400';
      }
      if (soundWrong) { soundWrong.currentTime = 0; soundWrong.play(); }

      setTimeout(() => {
        loadElaData();
      }, 2000);
    }
  });

  if (elaQuestionsDiv) elaQuestionsDiv.appendChild(submitBtn);
}

const loadElaBtn = document.getElementById("loadEla");
if (loadElaBtn) loadElaBtn.addEventListener("click", loadElaData);

// ELA SUB PAGE NAVIGATION
function openElaHome() {
  document.getElementById("page-ela").classList.remove("hidden");
  document.getElementById("page-ela-reading").classList.add("hidden");
  document.getElementById("page-ela-spelling").classList.add("hidden");
}
function openElaReading() {
  document.getElementById("page-ela").classList.add("hidden");
  document.getElementById("page-ela-reading").classList.remove("hidden");
  document.getElementById("page-ela-spelling").classList.add("hidden");
}
function openElaSpelling() {
  document.getElementById("page-ela").classList.add("hidden");
  document.getElementById("page-ela-reading").classList.add("hidden");
  document.getElementById("page-ela-spelling").classList.remove("hidden");
}

// ====================================
// SPELLING (Loaded from ELA Data)
// ====================================
let spellingWords = [];
let remainingWords = [];
let currentWord = "";

function initSpelling() {
  if (window.ELA_DATA && window.ELA_DATA.spellingWords) {
    spellingWords = window.ELA_DATA.spellingWords;
    remainingWords = [...spellingWords];
  } else {
    console.error("ELA_DATA or spellingWords is not defined.");
  }
}

function makeBoxes(wordLength) {
  const container = document.getElementById("spellingBoxes");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < wordLength; i++) {
    const input = document.createElement("input");
    input.maxLength = 1;
    input.className = "w-10 h-12 text-center bg-slate-900 border border-slate-700 rounded text-lg";

    input.addEventListener("input", () => {
      const next = input.nextElementSibling;
      if (next) next.focus();
    });

    container.appendChild(input);
  }
}

function generateSpellingWord() {
  if (remainingWords.length === 0) {
    if (spellingWords.length === 0) initSpelling();
    
    if (remainingWords.length === 0) {
      const feedback = document.getElementById("spellingFeedback");
      if (feedback) {
        feedback.textContent = "🎉 You completed every spelling word!";
      }
      launchConfetti();
      return;
    }
  }

  const randomIndex = Math.floor(Math.random() * remainingWords.length);
  currentWord = remainingWords[randomIndex];
  remainingWords.splice(randomIndex, 1);

  makeBoxes(currentWord.length);
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(currentWord);
  utter.rate = 0.8;
  speechSynthesis.speak(utter);
}

const playWordBtn = document.getElementById("playWord");
if (playWordBtn) {
  playWordBtn.addEventListener("click", () => {
    if (remainingWords.length === 0) initSpelling();
    generateSpellingWord();
  });
}

const checkSpellingBtn = document.getElementById("checkSpelling");
if (checkSpellingBtn) {
  checkSpellingBtn.addEventListener("click", () => {
    const boxes = document.querySelectorAll("#spellingBoxes input");
    let answer = "";

    boxes.forEach(box => {
      answer += box.value;
    });

    answer = answer.toLowerCase();
    const feedback = document.getElementById("spellingFeedback");

    if (answer === currentWord.toLowerCase()) {
      if (feedback) {
        feedback.textContent = "Correct! +20 Coins +20 XP";
        feedback.className = "mt-4 text-center text-emerald-400";
      }
      addCoins(20);
      addXP(20);

      // Increment Spelling Quests
      incrementQuestProgress('daily', 2, 1);
      incrementQuestProgress('weekly', 2, 1);

      launchConfetti();
      if (soundCorrect) {
        soundCorrect.currentTime = 0;
        soundCorrect.play();
      }
      setTimeout(() => {
        generateSpellingWord();
      }, 800);

    } else {
      if (feedback) {
        feedback.textContent = "Incorrect. Try Again.";
        feedback.className = "mt-4 text-center text-pink-400";
      }
      if (soundWrong) {
        soundWrong.currentTime = 0;
        soundWrong.play();
      }
    }
  });
}

initSpelling();

//================//
// Games logic
//================//
const gameContainer = document.getElementById('gameContainer');
const gameFrame = document.getElementById('gameFrame');
const gameTimerDisplay = document.getElementById('gameTimer');
let gameInterval = null;
let gameTimeLeft = 0;

function startGameSession(url) {
  if (!gameFrame || !gameContainer) return;
  gameFrame.src = url;
  gameContainer.classList.remove('hidden');
  gameTimeLeft = 180;
  updateGameTimerDisplay();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    gameTimeLeft--;
    updateGameTimerDisplay();
    if (gameTimeLeft <= 0) {
      clearInterval(gameInterval);
      gameInterval = null;
      endGameSession();
    }
  }, 1000);
}

function updateGameTimerDisplay() {
  if (!gameTimerDisplay) return;
  const minutes = String(Math.floor(gameTimeLeft / 60)).padStart(2, '0');
  const seconds = String(gameTimeLeft % 60).padStart(2, '0');
  gameTimerDisplay.textContent = `${minutes}:${seconds}`;
}

function endGameSession() {
  if (!gameFrame || !gameContainer) return;
  gameFrame.src = '';
  gameContainer.classList.add('hidden');
  if (soundTimeUp) { soundTimeUp.currentTime = 0; soundTimeUp.play(); }
  alert('Time is up! Your 3‑minute game session has ended.');
}

document.querySelectorAll('.open-game').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cost = parseInt(btn.dataset.cost, 10);
    const url = btn.dataset.url;
    if (coins >= cost) {
      coins -= cost;
      updateCoinDisplay();

      // Increment Arcade Quests (coins spent & sessions played)
      incrementQuestProgress('daily', 3, cost);
      incrementQuestProgress('weekly', 3, 1);

      startGameSession(url);
    } else {
      alert(`You need ${cost} coins to play this game. Keep learning!`);
      if (soundTimeUp) { soundTimeUp.currentTime = 0; soundTimeUp.play(); }
    }
  });
});

//================//
// Profile Logic
//================//
let profileData = JSON.parse(localStorage.getItem("profileData")) || {
  ownedCharacters: [],
  ownedPets: [],
  equippedCharacter: '',
  equippedPet: '',
};

let charIndex = profileData.equippedCharacter || 0;
let petIndex = profileData.equippedPet || 0;

function coinText(amount) {
  return `<img src="Image Assets/Coin Icon.webp" class="inline w-5 h-5 mr-2" alt="Coins"> ${amount}`;
}

const characters = [
  { img: "https://s.namemc.com/3d/skin/body.png?id=ff13a66098965233&model=classic&width=384&height=384", costCoins: 20 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=726f83fa5377d811&model=slim&width=384&height=384", costCoins: 20 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=c28178aaaa2d79d5&model=slim&width=384&height=384", costCoins: 150 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=a5a3aa14a8018dae&model=slim&width=384&height=384", costCoins: 150 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=7dbf7205f0c3c386&model=slim&width=384&height=384", costCoins: 200 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=69aada765cf09671&model=classic&width=384&height=384", costCoins: 300 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=5173c405cba4b429&model=classic&width=384&height=384", costCoins: 350 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=624142dff6423d90&model=slim&width=384&height=384", costCoins: 400 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=bc7db647674d1f01&model=slim&width=384&height=384", costCoins: 500 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=d67bfc49e01dee34&model=classic&width=384&height=384", costCoins: 600 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=ea1a7775df5bf232&model=classic&width=384&height=384", costCoins: 700 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=9444a61abb22276f&model=classic&width=384&height=384", costCoins: 800 },
  { img: "https://s.namemc.com/3d/skin/body.png?id=8b92dc4ea510206a&model=classic&width=384&height=384", costCoins: 900 },
];

const pets = [
  { img: "Image Assets/Pets/Calico_Cat.webp", costCoins: 50 },
  { img: "Image Assets/Pets/Jellie_Cat.webp", costCoins: 100 },
  { img: "Image Assets/Pets/Persian_Cat.webp", costCoins: 150 },
  { img: "Image Assets/Pets/Red_Cat.webp", costCoins: 200 },
  { img: "Image Assets/Pets/Siamese_Cat.webp", costCoins: 250 },
  { img: "Image Assets/Pets/Tabby_Cat.webp", costCoins: 300 },
  { img: "Image Assets/Pets/Red_Parrot.webp", costCoins: 300 },
  { img: "Image Assets/Pets/Blue_Parrot.webp", costCoins: 350 },
  { img: "Image Assets/Pets/Green_Parrot.webp", costCoins: 400 },
  { img: "Image Assets/Pets/Cyan_Parrot.webp", costCoins: 450 },
  { img: "Image Assets/Pets/Gray_Parrot.webp", costCoins: 500 },
];

function saveProfile() {
  localStorage.setItem("profileData", JSON.stringify(profileData));
}

function updateUI() {
  const characterPreview = document.getElementById("characterPreview");
  const characterCost = document.getElementById("characterCost");
  const characterButton = document.getElementById("characterButton");

  const petPreview = document.getElementById("petPreview");
  const petCost = document.getElementById("petCost");
  const petButton = document.getElementById("petButton");

  if (!characterPreview || !petPreview) return;

  // --- Character Block Logic ---
  characterPreview.src = characters[charIndex].img;
  if (profileData.equippedCharacter === charIndex) {
    characterCost.innerHTML = `<span class="text-xs uppercase px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md font-black tracking-widest">Active</span>`;
    characterButton.textContent = "Equipped";
    characterButton.disabled = true;
    characterButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-slate-700 text-slate-400 cursor-not-allowed uppercase border border-slate-600/50";
  } else if (profileData.ownedCharacters.includes(charIndex)) {
    characterCost.innerHTML = `<span class="text-xs text-slate-400 uppercase font-semibold">Unlocked</span>`;
    characterButton.textContent = "Equip";
    characterButton.disabled = false;
    characterButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white uppercase hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-150";
  } else {
    characterCost.innerHTML = coinText(characters[charIndex].costCoins);
    characterButton.textContent = "Buy Character";
    characterButton.disabled = false;
    characterButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 uppercase hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all duration-150";
  }

  // --- Pet Block Logic ---
  petPreview.src = pets[petIndex].img;
  if (profileData.equippedPet === petIndex) {
    petCost.innerHTML = `<span class="text-xs uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-black tracking-widest">Active</span>`;
    petButton.textContent = "Equipped";
    petButton.disabled = true;
    petButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-slate-700 text-slate-400 cursor-not-allowed uppercase border border-slate-600/50";
  } else if (profileData.ownedPets.includes(petIndex)) {
    petCost.innerHTML = `<span class="text-xs text-slate-400 uppercase font-semibold">Unlocked</span>`;
    petButton.textContent = "Equip";
    petButton.disabled = false;
    petButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white uppercase hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-150";
  } else {
    petCost.innerHTML = coinText(pets[petIndex].costCoins);
    petButton.textContent = "Buy Pet";
    petButton.disabled = false;
    petButton.className = "w-full max-w-[180px] font-black py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 uppercase hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-150";
  }
}

window.switchCharacter = function(dir) {
  charIndex = (charIndex + dir + characters.length) % characters.length;
  updateUI();
};

window.switchPet = function(dir) {
  petIndex = (petIndex + dir + pets.length) % pets.length;
  updateUI();
};

document.addEventListener("DOMContentLoaded", () => {
  const characterButton = document.getElementById("characterButton");
  const petButton = document.getElementById("petButton");

  if (characterButton) {
    characterButton.onclick = () => {
      if (!profileData.ownedCharacters.includes(charIndex)) {
        const item = characters[charIndex];
        if (coins < item.costCoins) return alert("Not enough coins!");

        coins -= item.costCoins;
        updateCoinDisplay();
        profileData.ownedCharacters.push(charIndex);
        launchConfetti();

        // Increment Customization Quests
        incrementQuestProgress('daily', 4, 1);
        incrementQuestProgress('weekly', 4, 1);
      }

      profileData.equippedCharacter = charIndex;
      saveProfile();
      updateUI();
    };
  }

  if (petButton) {
    petButton.onclick = () => {
      if (!profileData.ownedPets.includes(petIndex)) {
        const item = pets[petIndex];
        if (coins < item.costCoins) return alert("Not enough coins!");

        coins -= item.costCoins;
        updateCoinDisplay();
        profileData.ownedPets.push(petIndex);
        launchConfetti();

        // Increment Customization Quests
        incrementQuestProgress('daily', 4, 1);
        incrementQuestProgress('weekly', 4, 1);
      }

      profileData.equippedPet = petIndex;
      saveProfile();
      updateUI();
    };
  }

  updateUI();
});

// Sound effect on click
const clickSound = document.getElementById('btnClickSound');
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn) {
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.play().catch(() => {});
    }
  }
});

// Global Reset Progress Function
window.resetProgress = function() {
  if (!confirm("Are you sure you want to reset all profile progress?")) return;

  if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play(); }

  profileData = {
    ownedCharacters: [0],
    ownedPets: [0],
    equippedCharacter: 0,
    equippedPet: 0,
  };

  charIndex = 0;
  petIndex = 0;
  saveProfile();

  xp = 0;
  coins = 0;
  updateXPDisplay();
  updateCoinDisplay();

  // Reset Quest Progress
  questData = getDefaultQuests();
  saveQuestData();
  renderQuests();
  saveQuestData();
  renderQuests();
  updateUI();
  launchConfetti();
};

// Splash Screen Logic
(function () {
  const splash = document.getElementById('splash');
  if (!splash) return;

  window.hideSplash = function (delay = 300) {
    if (!splash) return;
    setTimeout(() => {
      splash.classList.add('hidden');
      setTimeout(() => {
        if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      }, 500);
    }, delay);
  };

  window.addEventListener('load', function () {
    setTimeout(() => {
      window.hideSplash(200);
    }, 1500);
  });
})();

// Footer Logic
function showPage(name) {
  const readingPage = document.getElementById("page-ela-reading");
  const spellingPage = document.getElementById("page-ela-spelling");

  if (readingPage) readingPage.classList.add("hidden");
  if (spellingPage) spellingPage.classList.add("hidden");

  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });

  // SHOW FOOTER ONLY AT HOME PAGE
  const mainFooter = document.getElementById('mainFooter');
  if (mainFooter) {
    mainFooter.classList.toggle('hidden', name !== 'home');
  }
}
