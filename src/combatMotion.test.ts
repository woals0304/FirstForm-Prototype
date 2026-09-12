import { describe, expect, it } from "vitest";
import { act, newGame, simulate } from "./game";
import { CombatMotion, FIELD, distance, weaponMotion } from "./combatMotion";
const animate = (m: CombatMotion, seconds = 1) => {
  for (let i = 0; i < seconds * 60; i++) m.step(1 / 60);
};
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const v of Object.values(value)) freeze(v);
  }
  return value;
}
describe("공간 전투 표현", () => {
  it("판정·저장 입력을 변경하지 않고 3체 전투를 근접 교전과 다음 타깃으로 재생한다", () => {
    let state = newGame(0);
    const m = new CombatMotion(state);
    const targets = new Set<number>(),
      positions = new Map<number, { x: number; y: number }[]>();
    let strikes = 0,
      fallen = new Set<number>(),
      maxQueue = 0,
      minGap = Infinity;
    for (let second = 0; second < 24; second++) {
      state = simulate(state, 1);
      const before = JSON.stringify(state);
      m.sync(freeze(state));
      for (let f = 0; f < 60; f++) {
        m.step(1 / 60);
        maxQueue = Math.max(maxQueue, m.beats.length);
        if (!m.active) continue;
        targets.add(m.target);
        for (const a of m.actors) {
          if (!positions.has(a.id)) positions.set(a.id, []);
          positions.get(a.id)!.push({ x: a.x, y: a.y });
          expect(a.x).toBeGreaterThanOrEqual(FIELD.left);
          expect(a.x).toBeLessThanOrEqual(FIELD.right);
          expect(a.y).toBeGreaterThanOrEqual(FIELD.top);
          expect(a.y).toBeLessThanOrEqual(FIELD.bottom);
          if (a.pose === "fall") fallen.add(a.id);
          if (a.pose === "strike" && a.hp > 0) {
            const t = m.actors.find((t) => t.id === a.target);
            if (t && t.hp > 0) {
              expect(distance(a, t)).toBeLessThanOrEqual(
                a.id === -1 ? weaponMotion[m.weapon].reach + 25 : 108,
              );
              strikes++;
            }
          }
        }
        const live = m.actors.filter((a) => a.hp > 0);
        for (let i = 0; i < live.length; i++)
          for (let j = i + 1; j < live.length; j++)
            minGap = Math.min(minGap, distance(live[i], live[j]));
      }
      expect(JSON.stringify(state)).toBe(before);
    }
    expect([...targets]).toEqual(expect.arrayContaining([0, 1, 2]));
    expect(fallen.size).toBe(3);
    expect(strikes).toBeGreaterThan(0);
    expect(maxQueue).toBeLessThan(4);
    expect(minGap).toBeGreaterThan(42);
    for (const id of [-1, 0, 1, 2]) {
      const path = positions.get(id)!;
      expect(
        Math.max(...path.map((p) => distance(p, path[0]))),
      ).toBeGreaterThan(70);
    }
  });
  it("승리 이후 잠시 쓰러짐을 보여 주고 기존 탐험으로 복귀한다", () => {
    let s = newGame(0);
    const m = new CombatMotion(s);
    while (!s.report.victories) {
      s = simulate(s, 1);
      m.sync(s);
      animate(m);
    }
    animate(m, 3);
    expect(m.active).toBe(false);
    expect(s.mode).toBe("explore");
    expect(s.report.victories).toBe(1);
  });
  it("일시정지 시 좌표와 동작 시간을 동결하고 재개한다", () => {
    let s = simulate(newGame(0), 5);
    const m = new CombatMotion(s);
    animate(m, 0.5);
    s = act(s, { type: "pause" });
    m.sync(s);
    const before = JSON.stringify(m.actors),
      clock = m.clock;
    animate(m, 2);
    expect(JSON.stringify(m.actors)).toBe(before);
    expect(m.clock).toBe(clock);
    s = act(s, { type: "pause" });
    m.sync(s);
    animate(m, 0.5);
    expect(m.clock).toBeGreaterThan(clock);
  });
  it("시간 건너뛰기와 지역 변경에 오래된 공격·시체를 남기지 않는다", () => {
    const start = simulate(newGame(0), 5),
      m = new CombatMotion(start);
    animate(m);
    const skipped = simulate(start, 60);
    m.sync(skipped);
    expect(m.beats).toHaveLength(0);
    const moved = {
      ...skipped,
      region: 1,
      battle: null,
      mode: "explore" as const,
    };
    m.sync(moved);
    expect(m.active).toBe(false);
    expect(m.beats).toHaveLength(0);
  });
  it("전투 중 불러온 사망한 적은 되살리지 않는다", () => {
    let s = simulate(newGame(0), 5);
    for (let i = 0; i < 30 && s.battle?.health[0] !== 0; i++)
      s = simulate(s, 1);
    expect(s.battle?.health[0]).toBe(0);
    const m = new CombatMotion(s);
    expect(m.actors[1].pose).toBe("down");
    expect(m.target).toBe(1);
  });
  it.each(["sword", "saber", "spear"] as const)(
    "%s 표현을 구동해도 자동 활동 결과는 동일하다",
    (weapon) => {
      let s = { ...newGame(0), weapon, owned: [weapon] };
      const m = new CombatMotion(s);
      const direct = simulate(s, 90);
      for (let i = 0; i < 90; i++) {
        s = simulate(s, 1);
        m.sync(s);
        animate(m);
      }
      expect(s).toEqual(direct);
    },
  );
});

describe("전법·지역 조합의 시각 동기화", () => {
  it.each(["sword", "saber", "spear"] as const)(
    "%s 사용 시 지역·무공이 달라도 공격 대기가 쌓이지 않는다",
    (weapon) => {
      for (const art of ["wind", "break", "flow"] as const)
        for (let region = 0; region < 4; region++) {
          let s = {
            ...newGame(0),
            weapon,
            owned: [weapon],
            art,
            region,
            unlocked: region,
          };
          const m = new CombatMotion(s);
          let backlog = 0;
          for (let i = 0; i < 120; i++) {
            s = simulate(s, 1);
            m.sync(s);
            animate(m);
            backlog = Math.max(backlog, m.beats.length);
          }
          expect(backlog, `${weapon}/${art}/${region}`).toBeLessThan(4);
        }
    },
  );
  it("패배 시 사망 대신 후퇴를 보여 주고 기존 회복 상태로 돌아간다", () => {
    let s = { ...simulate(newGame(0), 5), hp: 1 };
    const m = new CombatMotion(s);
    s = simulate(s, 1);
    m.sync(s);
    animate(m);
    expect(s.mode).toBe("rest");
    expect(m.phase).toBe("retreat");
    animate(m, 3);
    expect(m.active).toBe(false);
    expect(s.report.retreats).toBe(1);
  });
});

it("숨겨진 탭에서는 지난 타격을 쌓지 않고 현재 조우만 재구성한다", () => {
  let s = simulate(newGame(0), 5);
  const m = new CombatMotion(s);
  for (let i = 0; i < 6; i++) {
    s = simulate(s, 1);
    m.sync(s, false);
  }
  expect(m.beats).toHaveLength(0);
  expect(m.actors.slice(1).map((a) => a.hp)).toEqual(s.battle!.health);
});
