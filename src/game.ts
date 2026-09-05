export type WeaponId = "sword" | "saber" | "spear";
export type ArtId = "wind" | "break" | "flow";
export type Goal = "silver" | "herbs" | "insight";
export type Loot = Record<Goal, number>;
export const goalNames: Record<Goal, string> = {
  silver: "은전",
  herbs: "약초",
  insight: "무공 깨달음",
};
export const weapons = {
  sword: {
    name: "청죽검",
    kind: "검",
    text: "가볍고 정확한 검. 빠른 적을 꾸준히 따라잡습니다.",
    attack: 12,
    interval: 2,
    accuracy: 0.98,
    pierce: 0,
    splash: 0,
    cost: 0,
  },
  saber: {
    name: "환두도",
    kind: "도",
    text: "느리고 묵직한 도. 날을 넓게 휘둘러 주변 적도 벱니다.",
    attack: 20,
    interval: 3,
    accuracy: 0.84,
    pierce: 2,
    splash: 0.55,
    cost: 32,
  },
  spear: {
    name: "백목창",
    kind: "창",
    text: "긴 간격의 찌르기. 갑옷의 틈을 관통합니다.",
    attack: 17,
    interval: 3,
    accuracy: 0.92,
    pierce: 8,
    splash: 0,
    cost: 40,
  },
};
export const arts = {
  wind: {
    name: "청풍연식",
    label: "연속 공격",
    text: "매 공격에 약한 타격을 한 번 더 잇습니다. 두 타격은 각각 갑옷의 영향을 받습니다.",
    mark: "風",
  },
  break: {
    name: "파암일격",
    label: "방어 관통",
    text: "한 번의 타격에 힘을 모읍니다. 위력 35% 증가, 방어 5 관통.",
    mark: "破",
  },
  flow: {
    name: "회류보",
    label: "회피 · 반격",
    text: "받는 공격을 35% 확률로 피하고 즉시 반격합니다. 지구전에 유리합니다.",
    mark: "流",
  },
};
export interface Enemy {
  name: string;
  hp: number;
  attack: number;
  armor: number;
  evade: number;
  count: number;
  interval: number;
}
export interface Region {
  id: number;
  name: string;
  sub: string;
  story: string;
  enemyText: string;
  rewardText: string;
  color: string;
  enemies: Enemy[];
  boss: Enemy;
  loot: Loot;
  activity: string;
  x: number;
  y: number;
}
export const regions: Region[] = [
  {
    id: 0,
    name: "청죽림",
    sub: "바람이 머무는 숲",
    story:
      "대숲 사이로 오래된 행로가 이어집니다. 작은 소란을 잠재우며 강호의 첫걸음을 익힙니다.",
    enemyText: "갑옷 없는 들개 무리 · 여럿이 함께 공격",
    rewardText: "약초가 풍부하고 기초 단련에 좋은 길",
    color: "#668675",
    activity: "대숲에서 약초를 살피는 중",
    x: 18,
    y: 65,
    enemies: [
      {
        name: "들개 무리",
        hp: 21,
        attack: 3,
        armor: 0,
        evade: 0.03,
        count: 3,
        interval: 3,
      },
      {
        name: "길 잃은 산적",
        hp: 42,
        attack: 6,
        armor: 1,
        evade: 0.07,
        count: 1,
        interval: 3,
      },
    ],
    boss: {
      name: "대숲의 늑대왕",
      hp: 155,
      attack: 12,
      armor: 2,
      evade: 0.1,
      count: 1,
      interval: 3,
    },
    loot: { silver: 5, herbs: 4, insight: 1 },
  },
  {
    id: 1,
    name: "적운산채",
    sub: "붉은 흙과 낡은 철갑",
    story:
      "버려진 망루에 산적들이 모여들었습니다. 철갑의 빈틈을 찾으면 빼앗긴 노잣돈을 되찾을 수 있습니다.",
    enemyText: "철갑 산적 · 적은 수, 높은 방어",
    rewardText: "은전 주머니가 자주 발견되는 산길",
    color: "#aa8061",
    activity: "산채 주변의 흔적을 쫓는 중",
    x: 43,
    y: 44,
    enemies: [
      {
        name: "철갑 산적",
        hp: 65,
        attack: 8,
        armor: 9,
        evade: 0.02,
        count: 1,
        interval: 3,
      },
      {
        name: "산채 보초",
        hp: 32,
        attack: 4,
        armor: 5,
        evade: 0.04,
        count: 2,
        interval: 3,
      },
    ],
    boss: {
      name: "철갑 두목",
      hp: 230,
      attack: 18,
      armor: 12,
      evade: 0.03,
      count: 1,
      interval: 3,
    },
    loot: { silver: 15, herbs: 1, insight: 2 },
  },
  {
    id: 2,
    name: "운무나루",
    sub: "안개 너머의 발자국",
    story:
      "물안개 속에서 칼끝이 번뜩입니다. 재빠른 나루의 무인들을 상대하며 새로운 움직임을 깨닫습니다.",
    enemyText: "날쌘 유랑객 · 높은 회피, 빠른 공격",
    rewardText: "무공의 깨달음이 남는 물가",
    color: "#709393",
    activity: "나루의 무인들과 초식을 나누는 중",
    x: 64,
    y: 69,
    enemies: [
      {
        name: "나루의 쾌검객",
        hp: 65,
        attack: 6,
        armor: 1,
        evade: 0.33,
        count: 1,
        interval: 2,
      },
      {
        name: "물안개 척후",
        hp: 34,
        attack: 4,
        armor: 0,
        evade: 0.25,
        count: 2,
        interval: 2,
      },
    ],
    boss: {
      name: "안개 속 도객",
      hp: 255,
      attack: 12,
      armor: 3,
      evade: 0.3,
      count: 1,
      interval: 2,
    },
    loot: { silver: 6, herbs: 2, insight: 6 },
  },
  {
    id: 3,
    name: "백운고개",
    sub: "아직 끝나지 않은 길",
    story:
      "산길 끝에서 서로 다른 전법의 무인들이 길을 지킵니다. 지금까지의 배움을 시험할 시간입니다.",
    enemyText: "갑옷 호위 · 빠른 척후 · 혼합 조우",
    rewardText: "은전과 깨달음을 함께 얻는 높은 고개",
    color: "#8b9278",
    activity: "고갯길을 오르며 호흡을 고르는 중",
    x: 83,
    y: 34,
    enemies: [
      {
        name: "고개의 철갑 호위",
        hp: 105,
        attack: 11,
        armor: 10,
        evade: 0.04,
        count: 1,
        interval: 3,
      },
      {
        name: "고개의 척후대",
        hp: 44,
        attack: 5,
        armor: 2,
        evade: 0.22,
        count: 3,
        interval: 2,
      },
    ],
    boss: {
      name: "백운의 수문장",
      hp: 360,
      attack: 19,
      armor: 8,
      evade: 0.16,
      count: 1,
      interval: 3,
    },
    loot: { silver: 11, herbs: 3, insight: 5 },
  },
];
export interface Encounter {
  template: Enemy;
  health: number[];
  turn: number;
  boss: boolean;
}
export interface Report {
  seconds: number;
  victories: number;
  retreats: number;
  loot: Loot;
  xp: number;
  unlocks: number[];
  bosses: string[];
}
export interface GameState {
  version: 1;
  at: number;
  seed: number;
  region: number;
  unlocked: number;
  beaten: number[];
  clears: number[];
  weapon: WeaponId;
  owned: WeaponId[];
  art: ArtId;
  mastery: Record<ArtId, number>;
  goal: Goal;
  hp: number;
  xp: number;
  training: number;
  loot: Loot;
  mode: "explore" | "battle" | "rest";
  phase: number;
  battle: Encounter | null;
  report: Report;
  log: { time: number; text: string }[];
  totalSeconds: number;
  paused: boolean;
}
export const SAVE_KEY = "firstform-prototype-v1";
export const OFFLINE_CAP = 8 * 60 * 60;
export const emptyReport = (): Report => ({
  seconds: 0,
  victories: 0,
  retreats: 0,
  loot: { silver: 0, herbs: 0, insight: 0 },
  xp: 0,
  unlocks: [],
  bosses: [],
});
export function newGame(now = Date.now()): GameState {
  return {
    version: 1,
    at: now,
    seed: 41523,
    region: 0,
    unlocked: 0,
    beaten: [],
    clears: [0, 0, 0, 0],
    weapon: "sword",
    owned: ["sword"],
    art: "wind",
    mastery: { wind: 0, break: 0, flow: 0 },
    goal: "herbs",
    hp: 110,
    xp: 0,
    training: 0,
    loot: { silver: 15, herbs: 0, insight: 0 },
    mode: "explore",
    phase: 0,
    battle: null,
    report: emptyReport(),
    log: [
      {
        time: 0,
        text: "청죽림에 도착했습니다. 걸음을 맡기고 여정을 지켜보세요.",
      },
    ],
    totalSeconds: 0,
    paused: false,
  };
}
export const practice = (s: GameState) => Math.floor(s.xp / 80);
export const maxHp = (s: GameState) => 110 + practice(s) * 7 + s.training * 9;
export const power = (s: GameState) => practice(s) * 1.2 + s.training * 2;
export const masteryBonus = (s: GameState) =>
  1 + Math.min(10, Math.floor(s.mastery[s.art] / 60)) * 0.04;
function random(s: GameState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function note(s: GameState, text: string) {
  s.log.unshift({ time: s.totalSeconds, text });
  s.log = s.log.slice(0, 36);
}
function gain(s: GameState, loot: Loot, xp: number) {
  for (const key of Object.keys(loot) as Goal[]) {
    s.loot[key] += loot[key];
    s.report.loot[key] += loot[key];
  }
  s.xp += xp;
  s.report.xp += xp;
}
export function hitDamage(s: GameState, enemy: Enemy) {
  const w = weapons[s.weapon];
  const raw = (w.attack + power(s)) * masteryBonus(s);
  const armor = Math.max(
    0,
    enemy.armor - w.pierce - (s.art === "break" ? 5 : 0),
  );
  return s.art === "wind"
    ? Math.max(1, raw * 0.8 - armor) + Math.max(1, raw * 0.6 - armor)
    : Math.max(1, raw * (s.art === "break" ? 1.35 : 1) - armor);
}
function strike(s: GameState, counter = false) {
  const b = s.battle!;
  const target = b.health.findIndex((h) => h > 0);
  if (target < 0) return;
  const chance = Math.min(
    0.99,
    Math.max(0.15, weapons[s.weapon].accuracy - b.template.evade),
  );
  if (random(s) > chance) {
    if (!counter) note(s, `${b.template.name}이(가) 공격을 피했습니다.`);
    return;
  }
  const damage = Math.round(hitDamage(s, b.template) * (counter ? 0.65 : 1));
  b.health[target] = Math.max(0, b.health[target] - damage);
  if (weapons[s.weapon].splash > 0) {
    for (let i = target + 1; i < b.health.length; i++)
      b.health[i] = Math.max(
        0,
        b.health[i] - Math.round(damage * weapons[s.weapon].splash),
      );
  }
  note(
    s,
    `${counter ? "회류보 반격" : arts[s.art].name} · ${damage} 피해${weapons[s.weapon].splash && b.health.length > 1 ? " · 주변 적 함께 타격" : ""}`,
  );
}
function tick(s: GameState) {
  s.totalSeconds++;
  s.report.seconds++;
  s.phase++;
  s.mastery[s.art]++;
  if (s.totalSeconds % 8 === 0) {
    s.xp++;
    s.report.xp++;
  }
  if (s.mode === "rest") {
    s.hp = Math.min(maxHp(s), s.hp + maxHp(s) / 9);
    if (s.hp >= maxHp(s)) {
      s.mode = "explore";
      s.phase = 0;
      note(s, "호흡을 고르고 다시 길을 나섭니다.");
    }
    return;
  }
  if (s.mode === "explore") {
    s.hp = Math.min(maxHp(s), s.hp + 2);
    if (s.phase < 5) return;
    const r = regions[s.region];
    gain(
      s,
      {
        silver: 0,
        herbs: s.region === 0 ? 1 : 0,
        insight: s.region === 2 ? 1 : 0,
      },
      2,
    );
    const e = r.enemies[Math.floor(random(s) * r.enemies.length)];
    s.battle = {
      template: { ...e },
      health: Array(e.count).fill(e.hp),
      turn: 0,
      boss: false,
    };
    s.mode = "battle";
    s.phase = 0;
    note(
      s,
      `${e.name}${e.count > 1 ? ` ${e.count}마리` : ""} 조우 · 자동 전투`,
    );
    return;
  }
  const b = s.battle!;
  b.turn++;
  if (b.turn % weapons[s.weapon].interval === 0) strike(s);
  if (b.health.every((h) => h <= 0)) {
    const r = regions[s.region];
    const reward = { ...r.loot };
    if (b.boss) {
      for (const k of Object.keys(reward) as Goal[]) reward[k] *= 4;
      s.beaten.push(s.region);
      s.report.bosses.push(r.boss.name);
      if (s.region < 3) {
        s.unlocked = Math.max(s.unlocked, s.region + 1);
        s.report.unlocks.push(s.region + 1);
        note(
          s,
          `${r.boss.name} 격파! ${regions[s.region + 1].name} 길이 열렸습니다.`,
        );
      } else
        note(
          s,
          "백운의 수문장 격파! 네 지역을 모두 답파했습니다. 다른 조합으로 여정을 이어갈 수 있습니다.",
        );
    } else {
      s.clears[s.region]++;
      note(s, `${b.template.name} 격파 · ${r.rewardText}`);
    }
    gain(s, reward, b.boss ? 35 : 10);
    s.report.victories++;
    s.battle = null;
    s.mode = s.hp < maxHp(s) * 0.5 ? "rest" : "explore";
    s.phase = 0;
    return;
  }
  if (b.turn % b.template.interval === 0) {
    let damage = b.template.attack * b.health.filter((h) => h > 0).length;
    if (s.art === "flow" && random(s) < 0.35) {
      damage = 0;
      strike(s, true);
    }
    s.hp = Math.max(1, s.hp - damage);
    if (damage) note(s, `${b.template.name}의 공격 · 체력 ${damage} 감소`);
  }
  if (s.hp <= maxHp(s) * 0.2 || b.turn >= 150) {
    s.hp = Math.max(1, s.hp);
    s.report.retreats++;
    note(
      s,
      `${b.boss ? "강적 도전 실패" : "안전 후퇴"} · 전리품은 지키고 휴식합니다.`,
    );
    s.mode = "rest";
    s.phase = 0;
    s.battle = null;
  }
}
export function simulate(
  source: GameState,
  seconds: number,
  offline = false,
): GameState {
  const s = structuredClone(source);
  if (s.paused || (offline && s.battle?.boss)) return s;
  for (
    let i = 0;
    i < Math.min(OFFLINE_CAP, Math.max(0, Math.floor(seconds)));
    i++
  )
    tick(s);
  return s;
}
export function advance(
  source: GameState,
  now: number,
  offline = false,
): GameState {
  if (now <= source.at) return source;
  const elapsed = Math.floor((now - source.at) / 1000);
  if (!elapsed) return source;
  const s = simulate(source, elapsed, offline);
  s.at = elapsed > OFFLINE_CAP ? now : source.at + elapsed * 1000;
  return s;
}
export type Action =
  | { type: "region"; id: number }
  | { type: "art"; id: ArtId }
  | { type: "weapon"; id: WeaponId }
  | { type: "goal"; id: Goal }
  | { type: "boss" }
  | { type: "train" }
  | { type: "report" }
  | { type: "pause" }
  | { type: "skip" };
export function act(source: GameState, action: Action): GameState {
  let s = structuredClone(source);
  switch (action.type) {
    case "region":
      if (
        action.id < 0 ||
        action.id > s.unlocked ||
        action.id === s.region ||
        s.battle?.boss
      )
        return source;
      s.region = action.id;
      s.battle = null;
      s.mode = "explore";
      s.phase = 0;
      note(s, `${regions[s.region].name}(으)로 행로를 바꿨습니다.`);
      break;
    case "art":
      if (s.battle?.boss) return source;
      s.art = action.id;
      note(s, `${arts[s.art].name}을(를) 펼칩니다.`);
      break;
    case "weapon":
      if (s.battle?.boss) return source;
      if (!s.owned.includes(action.id)) {
        if (s.loot.silver < weapons[action.id].cost) return source;
        s.loot.silver -= weapons[action.id].cost;
        s.owned.push(action.id);
      }
      s.weapon = action.id;
      note(s, `${weapons[s.weapon].name} 장착`);
      break;
    case "goal":
      s.goal = action.id;
      break;
    case "boss":
      if (
        s.paused ||
        s.clears[s.region] < 4 ||
        s.beaten.includes(s.region) ||
        s.battle?.boss
      )
        return source;
      {
        const e = regions[s.region].boss;
        s.hp = maxHp(s);
        s.battle = { template: { ...e }, health: [e.hp], turn: 0, boss: true };
        s.mode = "battle";
        s.phase = 0;
        note(s, `${e.name}에게 도전합니다. 패배해도 획득 자원은 보존됩니다.`);
      }
      break;
    case "train":
      if (
        s.battle?.boss ||
        s.loot.insight < 12 + s.training * 6 ||
        s.loot.herbs < 6
      )
        return source;
      s.loot.insight -= 12 + s.training * 6;
      s.loot.herbs -= 6;
      s.training++;
      s.hp = Math.min(maxHp(s), s.hp + 9);
      note(s, "호흡 단련 · 공격 +2, 최대 체력 +9");
      break;
    case "report":
      s.report = emptyReport();
      break;
    case "pause":
      s.paused = !s.paused;
      break;
    case "skip":
      s = simulate(s, 60);
      note(s, "빠른 체험으로 활동 시간 1분을 보냈습니다.");
      break;
  }
  return s;
}
export function recommendation(s: GameState, r: Region) {
  const w = weapons[s.weapon];
  const estimates = r.enemies.map((e) => {
    const dps =
      (hitDamage(s, e) * Math.min(0.99, w.accuracy - e.evade)) / w.interval;
    const effectiveCount = 1 + (e.count - 1) * (1 - w.splash * 0.7);
    const seconds = (e.hp * effectiveCount) / Math.max(1, dps);
    const incoming =
      ((e.attack * e.count * 0.72) / e.interval) *
      (s.art === "flow" ? 0.65 : 1);
    return { seconds, pressure: (seconds * incoming) / maxHp(s) };
  });
  const seconds =
    estimates.reduce((a, v) => a + v.seconds, 0) / estimates.length;
  const pressure =
    estimates.reduce((a, v) => a + v.pressure, 0) / estimates.length;
  const score =
    ((r.loot[s.goal] + (s.goal === "herbs" && r.id === 0 ? 1 : 0)) /
      (seconds + 5 + Math.min(2, pressure) * 9)) *
    (pressure > 1 ? 0.5 : 1);
  const risk =
    pressure < 0.5
      ? "여유로움"
      : pressure < 0.95
        ? "무난함"
        : "회복이 잦을 수 있음";
  const e = r.enemies[0];
  let reason =
    e.count > 1
      ? w.splash
        ? "넓은 베기가 무리의 수를 빠르게 줄입니다."
        : "여러 적에게 공격받습니다. 넓은 베기와도 비교해 보세요."
      : e.armor >= 5
        ? w.pierce || s.art === "break"
          ? "관통 공격이 철갑의 방어를 줄입니다."
          : "갑옷에 연타가 막힐 수 있습니다. 관통 초식도 살펴보세요."
        : w.accuracy >= 0.95
          ? "정확한 검끝이 빠른 적의 회피를 보완합니다."
          : "빠른 적에게 빗나갈 수 있습니다. 정확도와 생존을 살펴보세요.";
  if (s.art === "flow")
    reason += " 회류보로 공격을 피하면 회복 시간을 줄일 수 있습니다.";
  return { score, risk, reason, pressure };
}
export function recommended(s: GameState) {
  return regions
    .filter((r) => r.id <= s.unlocked)
    .sort((a, b) => recommendation(s, b).score - recommendation(s, a).score)[0];
}
// A small local prototype schema: reject invalid saves instead of inventing a migration.
export function parseSave(raw: string): GameState | null {
  try {
    const s = JSON.parse(raw) as GameState;
    const finite = (n: unknown) =>
      typeof n === "number" && Number.isFinite(n) && n >= 0;
    const validLoot = (v: Loot) =>
      v && (["silver", "herbs", "insight"] as const).every((k) => finite(v[k]));
    if (
      s.version !== 1 ||
      !finite(s.at) ||
      !finite(s.seed) ||
      !Number.isInteger(s.region) ||
      s.region < 0 ||
      s.region > 3 ||
      !Number.isInteger(s.unlocked) ||
      s.unlocked < s.region ||
      s.unlocked > 3 ||
      !Object.hasOwn(weapons, s.weapon) ||
      !Object.hasOwn(arts, s.art) ||
      !Object.hasOwn(goalNames, s.goal) ||
      !Array.isArray(s.owned) ||
      !s.owned.includes(s.weapon) ||
      s.owned.some((w) => !Object.hasOwn(weapons, w)) ||
      !validLoot(s.loot) ||
      !finite(s.xp) ||
      !finite(s.training) ||
      !finite(s.hp) ||
      s.hp < 1 ||
      !finite(s.totalSeconds) ||
      !finite(s.phase) ||
      !finite(s.mastery?.wind) ||
      !finite(s.mastery?.break) ||
      !finite(s.mastery?.flow) ||
      !["explore", "battle", "rest"].includes(s.mode) ||
      typeof s.paused !== "boolean" ||
      !Array.isArray(s.clears) ||
      s.clears.length !== 4 ||
      s.clears.some((n) => !finite(n)) ||
      !Array.isArray(s.beaten) ||
      s.beaten.some((n) => !Number.isInteger(n) || n < 0 || n > 3) ||
      !Array.isArray(s.log) ||
      s.log.some((l) => !finite(l.time) || typeof l.text !== "string") ||
      !s.report ||
      !validLoot(s.report.loot) ||
      !finite(s.report.seconds) ||
      !finite(s.report.victories) ||
      !finite(s.report.retreats) ||
      !finite(s.report.xp) ||
      !Array.isArray(s.report.unlocks) ||
      s.report.unlocks.some((n) => !Number.isInteger(n) || n < 0 || n > 3) ||
      !Array.isArray(s.report.bosses) ||
      s.report.bosses.some((n) => typeof n !== "string")
    )
      return null;
    if (s.mode === "battle") {
      const b = s.battle;
      if (
        !b ||
        !Array.isArray(b.health) ||
        b.health.length < 1 ||
        b.health.length > 3 ||
        b.health.some((h) => !finite(h)) ||
        !finite(b.turn) ||
        typeof b.boss !== "boolean"
      )
        return null;
      const e = b.template;
      if (
        !e ||
        typeof e.name !== "string" ||
        !finite(e.hp) ||
        e.hp < 1 ||
        !finite(e.attack) ||
        !finite(e.armor) ||
        !finite(e.evade) ||
        e.evade > 1 ||
        !finite(e.interval) ||
        e.interval < 1 ||
        !Number.isInteger(e.count) ||
        e.count !== b.health.length
      )
        return null;
    } else if (s.battle !== null) return null;
    return s;
  } catch {
    return null;
  }
}
export function duration(n: number) {
  return n < 60
    ? `${Math.floor(n)}초`
    : n < 3600
      ? `${Math.floor(n / 60)}분 ${Math.floor(n % 60)}초`
      : `${Math.floor(n / 3600)}시간 ${Math.floor((n % 3600) / 60)}분`;
}
