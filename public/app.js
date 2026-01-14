/**********************
 * 경청프린세스 메이커 (GAME OVER 룰 반영)
 * - 5개 스탯 각 5점 시작
 * - 행동 "한다" 선택 시에만 경험치 반영
 * - 반영 후 어느 하나라도 0 이하가 되면 즉시 GAME OVER
 * - 20턴 완료 또는 게임오버 시 결과 저장 + 대시보드 표시
 **********************/


const RAW_SITUATIONS = [
  { text: "친구들을 만나서 신나게 논다.", delta: { social:+1, money:-2, hp:-1 } },
  { text: "주말에 과외 알바를 하러 간다.", delta: { money:+1, intel:+1, social:-1 } },
  { text: "월급을 받아 즐거운 마음으로 쇼핑을 한다.", delta: { money:-2, charm:+1 } },
  { text: "저녁으로 간단한 요리를 해서 가족들과 먹는다.", delta: { hp:-1, charm:+1 } },
  { text: "오랜만에 친구들과 헬스장을 간다.", delta: { hp:+2, social:+1, money:-1 } },

  { text: "아침 일찍 일어나 산책을 한다.", delta: { hp:+2, charm:+1 } },
  { text: "도서관에서 집중해서 공부한다.", delta: { intel:+2, hp:-1, social:-1 } },
  { text: "카페에서 자기계발 강의를 듣는다.", delta: { intel:+1, charm:+1, money:-1 } },
  { text: "새 옷을 입고 셀카를 찍는다.", delta: { charm:+2, social:+1 } },
  { text: "혼자 여행을 다녀온다.", delta: { money:-1, hp:-1, charm:+1 } },

  { text: "밤늦게까지 드라마 정주행을 한다.", delta: { hp:-1, intel:-1, charm:-1 } },
  { text: "영양제를 챙겨 먹고 일찍 잔다.", delta: { hp:+1, social:-1 } },
  { text: "면접 스터디에 참여한다.", delta: { intel:+1, social:+1, hp:-1 } },
  { text: "부모님과 깊은 대화를 나눈다.", delta: { social:+1, intel:+1 } },
  { text: "새로운 취미를 시작한다.", delta: { intel:+1, charm:+2, money:-2 } },

  { text: "대청소를 하며 집을 정리한다.", delta: { hp:-2, charm:+1, social:-1 } },
  { text: "동네 봉사활동에 참여한다.", delta: { social:+2, charm:+1, hp:-1 } },
  { text: "친구들과 클럽에 다녀온다.", delta: { social:+1, money:-2, charm:-1 } },
  { text: "즉흥적으로 택시를 타고 이동한다.", delta: { money:-2, hp:+2 } },
  { text: "저녁을 굶고 야근한다.", delta: { intel:+1, money:+1, hp:-1 } },

  { text: "스터디 모임에서 발표를 맡는다.", delta: { intel:+1, social:+1, charm:+1 } },
  { text: "프리미엄 헬스 PT를 결제한다.", delta: { hp:+2, charm:+1, money:-2 } },
  { text: "친구 부탁으로 짐을 옮겨준다.", delta: { hp:-2, social:+1 } },
  { text: "동아리 사람들과 모임을 한다.", delta: { social:+1, charm:+1, money:-1 } },
  { text: "중고 거래로 필요 없는 물건을 판다.", delta: { money:+2, hp:-1 } },

  { text: "새로운 레시피를 배워 요리한다.", delta: { charm:+1, intel:+1, hp:-1 } },
  { text: "공모전에 지원서를 제출한다.", delta: { intel:+1, charm:+1, hp:-1 } },
  { text: "독서 모임에서 책을 발표한다.", delta: { intel:+2, social:+1 } },
  { text: "유튜브를 보며 악세사리를 만든다", delta: { money:-1, charm:+1 } },
  { text: "친구들과 사진 촬영을 하러 간다.", delta: { charm:+1, social:+1, money:-1 } },

  { text: "야식을 시켜 먹는다.", delta: { hp:-1, money:-1, charm:-1 } },
  { text: "쉬는 날이지만 눈 뜨자마자 스터디카페에 간다", delta: { intel:+2, money:-1, charm:-1 } },
  { text: "주식/경제 뉴스를 공부한다.", delta: { intel:+1, money:+1, social:-1 } },
  { text: "한껏 꾸미고 소개팅에 참석한다.", delta: { social:+1, charm:+2, money:-1 } },
  { text: "좋아하는 아이돌 콘서트에 간다.", delta: { money:-2, hp:-1, social:+1 } },

  { text: "피부과에 가서 관리받는다.", delta: { charm:+1, hp:+1, money:-2 } },
  { text: "SNS에 근황을 올린다.", delta: { social:+1, charm:+1 } },
  { text: "친구의 부탁으로 아르바이트 대타를 나간다", delta: { money:+1, hp:-1 } },
  { text: "친구들과 보드게임을 한다.", delta: { social:+1, intel:+1, money:-1 } },
  { text: "친구들과 영화관에서 영화를 본다.", delta: { social:+1, money:-1 } },

  { text: "주말에 가족 모임에 참석한다.", delta: { social:+1, charm:+1, hp:-1 } },
  { text: "새로운 헤어스타일로 변신한다.", delta: { charm:-1, money:-1 } },
  { text: "지인에게 커피를 사준다.", delta: { money:-1, social:+1 } },
  { text: "정리된 루틴을 만들고 실천한다.", delta: { hp:+1, intel:+1 } },
  { text: "대중교통 대신 걸어서 이동한다.", delta: { hp:+1, money:+1 } },

  { text: "친구의 고민 상담을 해준다.", delta: { social:+1, hp:-2 } },
  { text: "프로젝트를 밤새 마감한다.", delta: { intel:+2, hp:-2 } },
  { text: "고급 레스토랑에서 외식한다.", delta: { charm:+1, social:+1, money:-2 } },
  { text: "무료 강연을 찾아가 듣는다.", delta: { intel:+1, social:+1 } },
  { text: "헬스 대신 홈트로 버틴다.", delta: { hp:+1, money:+1 } },

  { text: "세일 정보를 모아 합리적 소비를 한다.", delta: { money:+1, intel:+1 } },
  { text: "감정 기복으로 충동구매를 한다.", delta: { charm:-2, money:-1 } },
  { text: "잠을 줄이고 새벽 공부를 한다.", delta: { intel:+1, hp:-1, charm:-1 } },
  { text: "최애 아이돌 덕질을 한다", delta: { social:+1, charm:-1, money:-1 } },
  { text: "혼자 조용히 전시회를 본다.", delta: { intel:+1, money:-1 } },

  { text: "유기동물 보호센터에 봉사를 간다.", delta: { social:+1, hp:-1, charm:+1 } },
  { text: "유산소 운동을 꾸준히 한다.", delta: { hp:+1, charm:+1, social:-1 } },
  { text: "늦잠을 자며 침대 위에서 여유로운 하루를 보낸다.", delta: { hp:+1, charm:-2 } },
  { text: "원데이 클래스에서 사람들을 만난다.", delta: { social:+1, charm:+1, money:-1 } },
  { text: "듀오링고로 새로운 언어를 공부한다.", delta: { intel:+2, social:+1, hp:-1 } },
];


const SITUATIONS = RAW_SITUATIONS.map((s, idx) => ({
  ...s,
  image: `/images/${idx + 1}.jpg`,
}));

function sanitizeDelta(delta) {
  const allowed = ["hp","money","charm","intel","social"];
  const out = {};
  for (const [k, v] of Object.entries(delta || {})) {
    if (allowed.includes(k) && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

const screenStart = document.getElementById("screenStart");
const screenGame = document.getElementById("screenGame");
const screenResult = document.getElementById("screenResult");
const screenBoard = document.getElementById("screenBoard");

const navGameBtn = document.getElementById("navGameBtn");
const navBoardBtn = document.getElementById("navBoardBtn");

const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");

const princessLabel = document.getElementById("princessLabel");
const turnLabel = document.getElementById("turnLabel");
const deckLabel = document.getElementById("deckLabel");

const situationText = document.getElementById("situationText");

const photoCard = document.getElementById("photoCard");
const cardImg = document.getElementById("cardImg");
const photoOverlay = document.getElementById("photoOverlay");

const promptText = document.getElementById("promptText");
const doBtn = document.getElementById("doBtn");
const skipBtn = document.getElementById("skipBtn");
const autoHint = document.getElementById("autoHint");

const statsBox = document.getElementById("statsBox");

const finalTotalEl = document.getElementById("finalTotal");
const finalStatsEl = document.getElementById("finalStats");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");
const playAgainBtn = document.getElementById("playAgainBtn");
const goBoardBtn = document.getElementById("goBoardBtn");

const refreshBoardBtn = document.getElementById("refreshBoardBtn");
const boardBody = document.getElementById("boardBody");
const myRankBox = document.getElementById("myRankBox");
const boardToGameBtn = document.getElementById("boardToGameBtn");

let princessName = "";
let deck = [];
let turn = 0;            // 0-based
let currentCard = null;
let stats = null;

let gameEnded = false;   // 종료(완주/게임오버) 플래그
let endStatus = "COMPLETED"; // "COMPLETED" | "GAME_OVER"
let endedAtTurn = 0;     // 1..20

const INITIAL_STATS = { hp:5, money:5, charm:5, intel:5, social:5 };

function showScreen(which) {
  [screenStart, screenGame, screenResult, screenBoard].forEach(s => s.classList.add("hidden"));
  which.classList.remove("hidden");
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function totalScore(s) {
  return s.hp + s.money + s.charm + s.intel + s.social;
}

function isGameOver(s) {
  return s.hp <= 0 || s.money <= 0 || s.charm <= 0 || s.intel <= 0 || s.social <= 0;
}

function renderStats(where, s) {
  const items = [
    ["체력", "hp"], ["재력", "money"], ["매력", "charm"], ["지성", "intel"], ["사회성", "social"]
  ];
  where.innerHTML = items.map(([label, key]) => {
    const val = s[key];
    const pct = Math.max(0, Math.min(100, (val / 20) * 100));
    return `
      <div class="stat">
        <div class="statTop">
          <div class="statName">${label}</div>
          <div class="statVal">${val}</div>
        </div>
        <div class="bar"><div style="width:${pct}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderHUD() {
  princessLabel.textContent = `${princessName}`;
  turnLabel.textContent = `턴 ${Math.min(turn + 1, 20)} / 20`;
  deckLabel.textContent = `덱: ${deck.length}장`;
  renderStats(statsBox, stats);
}

function formatDelta(delta) {
  const map = { hp:"체력", money:"재력", charm:"매력", intel:"지성", social:"사회성" };
  const entries = Object.entries(delta);
  if (entries.length === 0) return "변화 없음";
  return entries.map(([k, v]) => {
    const cls = v >= 0 ? "deltaGood" : "deltaBad";
    const sign = v >= 0 ? `+${v}` : `${v}`;
    return `<span class="${cls}">${map[k]} ${sign}</span>`;
  }).join(" / ");
}

function applyDelta(s, delta) {
  for (const [k, v] of Object.entries(delta)) s[k] += v;
}

function setCard(card) {
  situationText.textContent = card.text;

  cardImg.src = card.image;
  cardImg.onerror = () => { cardImg.src = "/images/1.jpg"; };

  promptText.textContent = "이 행동을 할까, 말까?";
  photoOverlay.classList.add("hidden");
  photoOverlay.innerHTML = "";

  doBtn.disabled = false;
  skipBtn.disabled = false;
  autoHint.style.display = "none";

  renderHUD();

  if (!gameEnded && isGameOver(stats)) {
    endGame("GAME_OVER", Math.max(1, Math.min(20, turn + 1)));
    return;
  }
}

function drawFirstCard() {
  currentCard = deck.shift();
  currentCard._delta = sanitizeDelta(currentCard.delta);
  setCard(currentCard);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function flipToNextCard() {
  // 20턴을 모두 끝냈으면 종료
  if (turn >= 19) {
    await endGame("COMPLETED", 20);
    return;
  }

  const next = deck.shift();
  next._delta = sanitizeDelta(next.delta);

  photoCard.classList.add("flipping");
  await sleep(260);

  currentCard = next;
  setCard(currentCard);

  await sleep(280);
  photoCard.classList.remove("flipping");
}

async function choose(doIt) {
  if (gameEnded) return;

  doBtn.disabled = true;
  skipBtn.disabled = true;

  const delta = currentCard._delta;

  // 1) 선택 결과 표시 + (한다면) 스탯 반영
  if (doIt) {
    photoOverlay.innerHTML = `
      <div>
        <div style="font-size:14px;opacity:.95;">선택: 행동을 한다</div>
        <div style="margin-top:10px;font-size:16px;">${formatDelta(delta)}</div>
      </div>
    `;
    photoOverlay.classList.remove("hidden");

    applyDelta(stats, delta);
  } else {
    photoOverlay.innerHTML = `
      <div>
        <div style="font-size:14px;opacity:.95;">선택: 행동을 안한다</div>
        <div style="margin-top:10px;font-size:16px;">경험치 변화 없음</div>
      </div>
    `;
    photoOverlay.classList.remove("hidden");
  }

  // 2) HUD는 항상 갱신
  renderHUD();

  // ✅ 3) 규칙: “하나라도 0점이 되면 즉시 게임오버”
  // (한다/안한다 상관 없이 무조건 체크)
  if (isGameOver(stats)) {
    const endedTurnHuman = turn + 1; // 현재 턴에서 종료
    promptText.textContent = "게임오버…";
    autoHint.style.display = "block";
    await sleep(650);
    await endGame("GAME_OVER", endedTurnHuman);
    return;
  }

  // 4) 정상 진행
  promptText.textContent = "다음 카드로 넘어간다…";
  autoHint.style.display = "block";

  await sleep(650);

  turn += 1;
  await flipToNextCard();
}

async function endGame(status, endedTurnHuman) {
  if (gameEnded) return;

  gameEnded = true;
  endStatus = status;
  endedAtTurn = endedTurnHuman;

  const total = totalScore(stats);

  showScreen(screenResult);

  finalTotalEl.textContent = String(total);
  renderStats(finalStatsEl, stats);

  if (status === "GAME_OVER") {
    resultTitle.textContent = `${princessName}, 게임오버 (턴 ${endedTurnHuman})`;
    resultSub.textContent = "경험치가 0이 되어 게임이 종료됐다. 기록 저장 중…";
  } else {
    resultTitle.textContent = `${princessName}, 20턴 완주 성공`;
    resultSub.textContent = "최종 경험치를 대시보드에 저장 중…";
  }

  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        princessName,
        stats,
        total,
        status,
        endedAtTurn: endedTurnHuman
      }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error();

    localStorage.setItem("gpm:lastEntryId", data.entry.id);
    localStorage.setItem("gpm:lastPrincessName", princessName);

    resultSub.textContent =
      status === "GAME_OVER"
        ? "게임오버 기록을 대시보드에 저장했다."
        : "완주 기록을 대시보드에 저장했다.";
  } catch {
    resultSub.textContent = "서버 저장에 실패했다. (서버 실행 여부를 확인해줘)";
  }
}

function resetGame() {
  turn = 0;
  stats = { ...INITIAL_STATS };
  deck = shuffle(SITUATIONS).map(s => ({ ...s }));
  currentCard = null;

  gameEnded = false;
  endStatus = "COMPLETED";
  endedAtTurn = 0;

  renderHUD();
}

async function loadDashboard() {
  showScreen(screenBoard);
  boardBody.innerHTML = `<tr><td colspan="11" class="muted">불러오는 중…</td></tr>`;

  const myId = localStorage.getItem("gpm:lastEntryId");

  try {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    if (!data.ok) throw new Error();

    const entries = data.entries || [];
    const meIndex = myId ? entries.findIndex(e => e.id === myId) : -1;

    myRankBox.innerHTML =
      meIndex >= 0
        ? `<div><strong>현재 내 순위: ${meIndex + 1}위</strong></div><div class="muted">총점 기준 정렬</div>`
        : `<div><strong>현재 내 순위:</strong> 아직 플레이한 기록이 없다.</div><div class="muted">게임 종료 시 자동 기록</div>`;

    if (entries.length === 0) {
      boardBody.innerHTML = `<tr><td colspan="11" class="muted">아직 기록이 없다. 첫 번째 공주가 되어줘.</td></tr>`;
      return;
    }

    boardBody.innerHTML = entries.map((e, idx) => {
      const isMe = myId && e.id === myId;
      const dt = new Date(e.createdAt || Date.now());
      const stamp = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;

      const statusText = e.status === "GAME_OVER" ? "게임오버" : "완주";
      const endedTurnText =
        typeof e.endedAtTurn === "number" && Number.isFinite(e.endedAtTurn)
          ? e.endedAtTurn
          : 20;
      
      return `
        <tr class="${isMe ? "trMe" : ""}">
          <td>${idx + 1}</td>
          <td>${escapeHtml(e.princessName)}</td>
          <td>${statusText}</td>
          <td>${endedTurnText}</td>
          <td><strong>${e.total}</strong></td>
          <td>${e.stats.hp}</td>
          <td>${e.stats.money}</td>
          <td>${e.stats.charm}</td>
          <td>${e.stats.intel}</td>
          <td>${e.stats.social}</td>
          <td class="muted">${stamp}</td>
        </tr>
      `;
    }).join("");

  } catch {
    boardBody.innerHTML = `<tr><td colspan="11" class="muted">대시보드를 불러오지 못했다. 서버 실행 여부를 확인해줘.</td></tr>`;
    myRankBox.innerHTML = `<div class="muted">대시보드 로드 실패</div>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Events
startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return alert("공주 이름을 입력해줘.");
  princessName = name.slice(0, 20);

  resetGame();
  showScreen(screenGame);
  drawFirstCard();
});

doBtn.addEventListener("click", () => choose(true));
skipBtn.addEventListener("click", () => choose(false));

playAgainBtn.addEventListener("click", () => showScreen(screenStart));
goBoardBtn.addEventListener("click", async () => loadDashboard());
refreshBoardBtn.addEventListener("click", async () => loadDashboard());
boardToGameBtn.addEventListener("click", () => showScreen(screenStart));
navGameBtn.addEventListener("click", () => showScreen(screenStart));
navBoardBtn.addEventListener("click", async () => loadDashboard());

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") startBtn.click();
});

showScreen(screenStart);
