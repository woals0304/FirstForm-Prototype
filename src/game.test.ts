import { describe, expect, it } from "vitest";
import {
  act,
  advance,
  hitDamage,
  maxHp,
  newGame,
  OFFLINE_CAP,
  parseSave,
  recommendation,
  recommended,
  regions,
  simulate,
  weapons,
} from "./game";
import type { ArtId, WeaponId } from "./game";
describe("자동 여정", () => {
  it("탐색에서 전투, 보상과 숙련으로 이어진다", () => {
    const s = simulate(newGame(0), 120);
    expect(s.report.victories).toBeGreaterThan(0);
    expect(s.loot.silver).toBeGreaterThan(15);
    expect(s.xp).toBeGreaterThan(0);
    expect(s.mastery.wind).toBe(120);
    expect(s.hp).toBeGreaterThan(0);
  });
  it("쪼개서 실행해도 같은 시드의 전체 결과가 같다", () => {
    const s = newGame(0);
    expect(simulate(simulate(s, 63), 57)).toEqual(simulate(s, 120));
  });
  it("온라인과 일반 오프라인 결과가 같다", () => {
    expect(simulate(newGame(0), 600, true)).toEqual(simulate(newGame(0), 600));
  });
  it("오프라인 8시간 상한 이후 같은 시각에 재정산하지 않는다", () => {
    const s = advance(newGame(0), 48 * 3600 * 1000, true);
    expect(s.report.seconds).toBe(OFFLINE_CAP);
    expect(advance(s, s.at, true)).toEqual(s);
    expect(advance(s, s.at + 1000, true).report.seconds).toBe(OFFLINE_CAP + 1);
  });
  it("시계 역행은 보상이나 체크포인트를 되돌리지 않는다", () => {
    const s = newGame(1000);
    expect(advance(s, 0)).toEqual(s);
  });
  it("1초보다 작은 나머지 시간을 보존한다", () => {
    const s = advance(newGame(0), 1500);
    expect(s.at).toBe(1000);
    expect(advance(s, 2100).report.seconds).toBe(2);
  });
  it("일시정지 중 온라인/부재 보상을 지급하지 않는다", () => {
    const s = act(newGame(0), { type: "pause" });
    const paused = advance(s, 60000, true);
    expect(paused.report.seconds).toBe(0);
    expect(simulate(act(paused, { type: "pause" }), 1).report.seconds).toBe(1);
  });
  it("지역 진입과 강적 도전의 선행 조건을 강제한다", () => {
    const s = newGame(0);
    expect(act(s, { type: "region", id: 3 })).toEqual(s);
    expect(act(s, { type: "boss" })).toEqual(s);
  });
  it("네 지역의 강적을 이기고 다음 길을 개방한다", () => {
    let s = newGame(0);
    s.xp = 2400;
    s.training = 15;
    for (let id = 0; id < 4; id++) {
      s = act(s, { type: "region", id });
      s.clears[id] = 4;
      s = act(s, { type: "boss" });
      s = simulate(s, 120);
      expect(s.beaten).toContain(id);
      expect(s.unlocked).toBe(Math.min(3, id + 1));
    }
    expect(s.report.bosses).toHaveLength(4);
    expect(new Set(s.beaten).size).toBe(4);
  });
  it("부재 중 강적은 동일 체력과 턴에서 정지하고 변경도 잠근다", () => {
    let s = newGame(0);
    s.clears[0] = 4;
    s = act(s, { type: "boss" });
    s = simulate(s, 3);
    const away = advance(s, 3600000, true);
    expect(away.battle).toEqual(s.battle);
    expect(away.loot).toEqual(s.loot);
    expect(away.report).toEqual(s.report);
    expect(act(s, { type: "weapon", id: "saber" })).toEqual(s);
    expect(act(s, { type: "art", id: "flow" })).toEqual(s);
    expect(act(s, { type: "train" })).toEqual(s);
  });
  it("강적에게 져도 죽거나 보유 자원을 잃지 않는다", () => {
    let s = newGame(0);
    s.region = 3;
    s.unlocked = 3;
    s.clears[3] = 4;
    s = act(s, { type: "boss" });
    s = simulate(s, 45);
    expect(s.hp).toBeGreaterThan(0);
    expect(s.report.retreats).toBeGreaterThan(0);
    expect(s.loot.silver).toBeGreaterThanOrEqual(15);
    expect(s.beaten).not.toContain(3);
  });
  it("병기는 구입 때만 한 번 차감하고 가진 병기는 무료로 장착한다", () => {
    let s = newGame();
    expect(act(s, { type: "weapon", id: "spear" })).toEqual(s);
    s.loot.silver = 100;
    s = act(s, { type: "weapon", id: "spear" });
    expect(s.loot.silver).toBe(60);
    s = act(s, { type: "weapon", id: "sword" });
    s = act(s, { type: "weapon", id: "spear" });
    expect(s.loot.silver).toBe(60);
    expect(s.owned).toEqual(["sword", "spear"]);
  });
  it("호흡 단련의 비용과 능력치를 한 번 적용한다", () => {
    let s = newGame();
    s.loot.herbs = 6;
    s.loot.insight = 12;
    const oldMax = maxHp(s);
    s = act(s, { type: "train" });
    expect(s.training).toBe(1);
    expect(maxHp(s)).toBe(oldMax + 9);
    expect(s.loot.herbs).toBe(0);
    expect(s.loot.insight).toBe(0);
    expect(act(s, { type: "train" })).toEqual(s);
  });
  it("기록 확인은 보상을 재지급하지 않는다", () => {
    const s = simulate(newGame(), 120);
    const cleared = act(s, { type: "report" });
    expect(cleared.loot).toEqual(s.loot);
    expect(cleared.report.seconds).toBe(0);
    expect(act(cleared, { type: "report" }).loot).toEqual(s.loot);
  });
});
describe("전투 조합과 추천", () => {
  it("동일 장착 상태에서 갑옷은 연타를 더 많이 막는다", () => {
    const s = newGame();
    const armor = { ...regions[0].enemies[0], armor: 10 };
    s.art = "wind";
    const wind = hitDamage(s, armor);
    s.art = "break";
    expect(hitDamage(s, armor)).toBeGreaterThan(wind);
  });
  it("넓은 도의 공격은 약한 무리에, 관통창은 철갑에 효과적이다", () => {
    const s = newGame();
    s.art = "break";
    s.weapon = "saber";
    const saber = recommendation(s, regions[0]).score;
    s.weapon = "spear";
    expect(saber).toBeGreaterThan(recommendation(s, regions[0]).score);
    const spear = hitDamage(s, regions[1].enemies[0]);
    s.weapon = "sword";
    expect(spear).toBeGreaterThan(hitDamage(s, regions[1].enemies[0]));
  });
  it("추천에 보상 목표와 성장 상태가 반영되고 지역을 강제 변경하지 않는다", () => {
    const s = newGame();
    s.unlocked = 3;
    s.xp = 1600;
    s.goal = "herbs";
    expect(recommended(s).id).toBe(0);
    s.goal = "silver";
    expect(recommended(s).id).toBe(1);
    s.goal = "insight";
    expect(recommended(s).id).toBe(2);
    expect(s.region).toBe(0);
    const pressure = recommendation(s, regions[3]).pressure;
    s.xp = 0;
    expect(recommendation(s, regions[3]).pressure).toBeGreaterThan(pressure);
  });
  it("모든 병기/무공/지역 조합에서 누적 결과가 유효하고 사망하지 않는다", () => {
    for (const weapon of Object.keys(weapons) as WeaponId[])
      for (const art of ["wind", "break", "flow"] as ArtId[])
        for (const region of regions) {
          const s = newGame();
          s.weapon = weapon;
          s.art = art;
          s.region = region.id;
          s.unlocked = 3;
          const result = simulate(s, 600);
          expect(result.hp).toBeGreaterThan(0);
          expect(result.hp).toBeLessThanOrEqual(maxHp(result));
          expect(Number.isFinite(result.xp)).toBe(true);
          expect(
            result.report.victories + result.report.retreats,
          ).toBeGreaterThan(0);
        }
  });
});
describe("작은 독립 저장", () => {
  it("전투 도중 저장을 복원해 같은 결과를 얻는다", () => {
    const s = simulate(newGame(), 7);
    expect(s.battle).not.toBeNull();
    const loaded = parseSave(JSON.stringify(s));
    expect(loaded).toEqual(s);
    expect(simulate(loaded!, 60)).toEqual(simulate(s, 60));
  });
  it("잘못된 JSON, 스키마와 알 수 없는 ID를 거절한다", () => {
    expect(parseSave("{")).toBeNull();
    expect(parseSave("{}")).toBeNull();
    for (const patch of [
      { region: 5 },
      { weapon: "unknown" },
      { mastery: null },
      { report: { seconds: 0 } },
      { mode: "battle", battle: null },
      { hp: -1 },
      { at: null },
      { beaten: [9] },
    ])
      expect(parseSave(JSON.stringify({ ...newGame(), ...patch }))).toBeNull();
  });
  it("유효하게 저장된 결과는 재로드만으로 이중 지급되지 않는다", () => {
    const s = advance(newGame(0), 120000, true);
    expect(advance(parseSave(JSON.stringify(s))!, 120000, true)).toEqual(s);
  });
});
