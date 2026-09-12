import type { GameState, WeaponId } from "./game";
import { maxHp, weapons } from "./game";

export const FIELD = {
  width: 720,
  height: 360,
  left: 68,
  right: 652,
  top: 100,
  bottom: 306,
};
export interface Point {
  x: number;
  y: number;
}
export type Pose =
  "approach" | "guard" | "strike" | "hit" | "fall" | "down" | "withdraw";
export interface Fighter extends Point {
  id: number;
  hp: number;
  maxHp: number;
  frame: number;
  facing: number;
  pose: Pose;
  until: number;
  fallenAt: number;
  target: number;
  number: string;
  numberUntil: number;
  moving: boolean;
}
// Presentation distances only. These never enter game.ts damage, timing, or RNG.
export const weaponMotion: Record<
  WeaponId,
  { reach: number; speed: number; recoil: number; frame: number }
> = {
  sword: { reach: 86, speed: 192, recoil: 15, frame: 5 },
  saber: { reach: 99, speed: 168, recoil: 21, frame: 6 },
  spear: { reach: 124, speed: 184, recoil: 30, frame: 7 },
};
interface Beat {
  due: number;
  target: number;
  heroStrikes: boolean;
  enemyIds: number[];
  health: number[];
  heroHp: number;
  miss: boolean;
  counter: boolean;
  ending: "" | "win" | "retreat";
  started: number | null;
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (a: Fighter) => {
  a.x = Math.max(FIELD.left, Math.min(FIELD.right, a.x));
  a.y = Math.max(FIELD.top, Math.min(FIELD.bottom, a.y));
};
const battleKey = (s: GameState) =>
  s.battle
    ? `${s.region}:${s.totalSeconds - s.battle.turn}:${s.battle.template.name}:${s.battle.boss}`
    : "";
function fighter(
  id: number,
  x: number,
  y: number,
  hp: number,
  maximum: number,
  frame: number,
): Fighter {
  return {
    id,
    x,
    y,
    hp,
    maxHp: maximum,
    frame,
    facing: id === -1 ? 1 : -1,
    pose: "approach",
    until: 0,
    fallenAt: 0,
    target: id === -1 ? 0 : -1,
    number: "",
    numberUntil: 0,
    moving: false,
  };
}

/** Ephemeral choreography. The only input is a read-only simulation snapshot. */
export class CombatMotion {
  actors: Fighter[] = [];
  clock = 0;
  phase: "enter" | "fight" | "win" | "retreat" = "enter";
  title = "";
  region = 0;
  weapon: WeaponId = "sword";
  paused = false;
  active = false;
  beats: Beat[] = [];
  target = -1;
  key = "";
  endsAt = Infinity;
  private previous: GameState | null = null;
  constructor(state?: GameState) {
    if (state) this.sync(state);
  }
  private begin(s: GameState) {
    const b = s.battle!;
    this.key = battleKey(s);
    this.active = true;
    this.clock = 0;
    this.endsAt = Infinity;
    this.beats = [];
    this.phase = "enter";
    this.title = b.template.name;
    this.region = s.region;
    this.weapon = s.weapon;
    const frame = /들개|늑대/.test(b.template.name)
      ? b.boss
        ? 13
        : 12
      : /철갑|호위|수문장/.test(b.template.name)
        ? 15
        : 14;
    const spawns = [
      { x: 510, y: 125 },
      { x: 595, y: 270 },
      { x: 390, y: 102 },
      { x: 635, y: 185 },
    ];
    this.actors = [
      fighter(-1, 158, 265, s.hp, maxHp(s), 4),
      ...b.health.map((hp, i) =>
        fighter(i, spawns[i % 4].x, spawns[i % 4].y, hp, b.template.hp, frame),
      ),
    ];
    for (const a of this.actors)
      if (a.hp <= 0) {
        a.pose = "down";
        a.fallenAt = -2;
      }
    this.target = b.health.findIndex((h) => h > 0);
  }
  sync(s: GameState, continuousPlayback = true) {
    const prev = this.previous;
    this.paused = s.paused;
    // Skips, reloads, travel, and offline catch-up show the latest encounter directly.
    const continuous =
      continuousPlayback &&
      !!prev &&
      s.region === prev.region &&
      s.totalSeconds - prev.totalSeconds >= 0 &&
      s.totalSeconds - prev.totalSeconds <= 1;
    if (s.battle && (!this.active || this.key !== battleKey(s) || !continuous))
      this.begin(s);
    else if (!continuous && !s.battle) {
      this.active = false;
      this.actors = [];
      this.beats = [];
    } else if (
      this.active &&
      prev?.battle &&
      s.totalSeconds === prev.totalSeconds + 1
    ) {
      const before = prev.battle;
      const turn = before.turn + 1;
      const logs = s.log
        .filter((l) => l.time === s.totalSeconds)
        .map((l) => l.text);
      const counter = logs.some((t) => t.includes("회류보 반격"));
      const won =
        !s.battle &&
        (s.clears[s.region] > prev.clears[prev.region] ||
          s.beaten.length > prev.beaten.length);
      const retreated = !s.battle && s.report.retreats > prev.report.retreats;
      // A region change or unrelated state replacement is not a combat death.
      if (!s.battle && !won && !retreated) {
        this.active = false;
        this.beats = [];
      } else {
        const heroStrikes = turn % weapons[s.weapon].interval === 0 || counter;
        const enemyTurn =
          turn % before.template.interval === 0 && (!won || counter);
        const target = before.health.findIndex((h) => h > 0);
        this.weapon = s.weapon;
        this.beats.push({
          due: this.clock + 0.14,
          target,
          heroStrikes,
          enemyIds: enemyTurn
            ? before.health
                .map((h, i) =>
                  h > 0 && (s.battle ? s.battle.health[i] > 0 : true) ? i : -1,
                )
                .filter((i) => i >= 0)
            : [],
          health: s.battle
            ? [...s.battle.health]
            : won
              ? before.health.map(() => 0)
              : [...before.health],
          heroHp: s.hp,
          miss: logs.some((t) => t.includes("공격을 피했습니다")),
          counter,
          ending: won ? "win" : retreated ? "retreat" : "",
          started: null,
        });
      }
    }
    this.previous = s;
  }
  private walk(a: Fighter, destination: Point, speed: number, dt: number) {
    const d = distance(a, destination);
    if (d < 2) return;
    const stride = Math.min(d, speed * dt);
    const dx = (destination.x - a.x) / d,
      dy = (destination.y - a.y) / d;
    a.x += dx * stride;
    a.y += dy * stride;
    a.moving = true;
    if (Math.abs(dx) > 0.12) a.facing = Math.sign(dx);
    if (a.pose !== "withdraw") a.pose = "approach";
    clamp(a);
  }
  private hit(a: Fighter, from: Fighter, loss: number) {
    if (loss <= 0) return;
    const d = Math.max(1, distance(a, from));
    a.x += ((a.x - from.x) / d) * 12;
    a.y += ((a.y - from.y) / d) * 9;
    clamp(a);
    a.pose = "hit";
    a.until = this.clock + 0.23;
    a.number = `−${Math.round(loss)}`;
    a.numberUntil = this.clock + 0.8;
  }
  private resolve(beat: Beat) {
    const hero = this.actors[0],
      target = this.actors.find((a) => a.id === beat.target);
    this.hit(hero, target ?? this.actors[1], hero.hp - beat.heroHp);
    hero.hp = beat.heroHp;
    for (const a of this.actors.slice(1)) {
      this.hit(a, hero, a.hp - beat.health[a.id]);
      a.hp = beat.health[a.id];
      if (a.hp <= 0 && a.pose !== "fall" && a.pose !== "down") {
        a.pose = "fall";
        a.fallenAt = this.clock;
        a.until = this.clock + 0.65;
      }
    }
    if (beat.miss && target) {
      target.number = "회피";
      target.numberUntil = this.clock + 0.65;
    }
    if (beat.enemyIds.length && hero.pose !== "hit") {
      hero.number = beat.counter ? "반격" : "흘리기";
      hero.numberUntil = this.clock + 0.65;
    }
    if (beat.heroStrikes && hero.pose !== "hit") {
      hero.pose = "guard";
      hero.until = this.clock + 0.12;
      const p = weaponMotion[this.weapon];
      if (target) {
        const d = Math.max(1, distance(hero, target));
        hero.x += ((hero.x - target.x) / d) * p.recoil;
        hero.y += ((hero.y - target.y) / d) * p.recoil * 0.5;
        clamp(hero);
      }
    }
    if (beat.ending) {
      this.phase = beat.ending;
      this.endsAt = this.clock + 1.05;
    }
  }
  step(dt: number) {
    if (!this.active || this.paused) return;
    dt = Math.max(0, Math.min(dt, 0.05));
    this.clock += dt;
    if (this.clock >= this.endsAt) {
      this.active = false;
      this.beats = [];
      return;
    }
    if (this.phase === "enter" && this.clock > 0.65) this.phase = "fight";
    const hero = this.actors[0];
    const profile = weaponMotion[this.weapon];
    const beat = this.beats[0];
    this.target = this.actors.slice(1).find((a) => a.hp > 0)?.id ?? -1;
    hero.target = this.target;
    const target = this.actors.find((a) => a.id === this.target);
    for (const a of this.actors) {
      a.moving = false;
      if (a.pose === "fall" && this.clock >= a.until) a.pose = "down";
      if (a.hp <= 0) continue;
      if (this.clock < a.until) continue;
      a.pose = "guard";
      if (this.phase === "win") continue;
      if (this.phase === "retreat") {
        if (a.id === -1) {
          a.pose = "withdraw";
          this.walk(a, { x: FIELD.left, y: 290 }, profile.speed, dt);
        }
        continue;
      }
      if (a.id === -1 && target) {
        const d = distance(a, target);
        a.facing = target.x >= a.x ? 1 : -1;
        if (Math.abs(a.y - target.y) > 30) {
          const side = a.x < target.x ? -1 : 1;
          this.walk(
            a,
            {
              x: Math.max(
                FIELD.left,
                Math.min(FIELD.right, target.x + side * (profile.reach - 10)),
              ),
              y: target.y,
            },
            profile.speed,
            dt,
          );
        } else if (d > profile.reach - 3) {
          const dx = (a.x - target.x) / Math.max(1, d),
            dy = (a.y - target.y) / Math.max(1, d);
          this.walk(
            a,
            {
              x: target.x + dx * (profile.reach - 5),
              y: target.y + dy * (profile.reach - 5),
            },
            profile.speed,
            dt,
          );
        }
      } else if (a.id !== -1) {
        a.facing = hero.x >= a.x ? 1 : -1;
        const striking = beat?.enemyIds.includes(a.id);
        const receiving = !!beat && beat.health[a.id] < a.hp;
        const d = distance(a, hero);
        if (a.id === this.target || striking || receiving) {
          if (d > 78) {
            this.walk(
              a,
              {
                x: hero.x + ((a.x - hero.x) / d) * 75,
                y: hero.y + ((a.y - hero.y) / d) * 75,
              },
              158,
              dt,
            );
          }
        } else {
          const angle = [-0.3, 1.5, -1.85, 2.8][a.id % 4];
          const slot = {
            x: Math.max(90, Math.min(630, hero.x + Math.cos(angle) * 126)),
            y: Math.max(105, Math.min(300, hero.y + Math.sin(angle) * 126)),
          };
          this.walk(a, slot, 136, dt);
        }
      }
    }
    // Small local separation is sufficient for this unobstructed arena; no nav mesh.
    for (let pass = 0; pass < 3; pass++)
      for (let i = 0; i < this.actors.length; i++)
        for (let j = i + 1; j < this.actors.length; j++) {
          const a = this.actors[i],
            b = this.actors[j];
          if (a.hp <= 0 || b.hp <= 0) continue;
          const d = distance(a, b),
            min = 62;
          if (d >= min) continue;
          const dx = d > 0.001 ? (b.x - a.x) / d : 1,
            dy = d > 0.001 ? (b.y - a.y) / d : 0;
          const push = (min - d) / 2;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
          clamp(a);
          clamp(b);
        }
    if (beat && this.clock >= beat.due) {
      const victim = this.actors.find((a) => a.id === beat.target);
      const ready =
        (!beat.heroStrikes ||
          !victim ||
          victim.hp <= 0 ||
          (distance(hero, victim) <= profile.reach + 8 &&
            Math.abs(hero.y - victim.y) <= 42)) &&
        this.actors
          .slice(1)
          .every(
            (a) =>
              a.hp <= beat.health[a.id] ||
              distance(a, hero) <= profile.reach + 8,
          ) &&
        beat.enemyIds.every((id) => {
          const a = this.actors.find((a) => a.id === id);
          return !a || a.hp <= 0 || distance(a, hero) <= 88;
        });
      if (beat.started === null && ready) {
        beat.started = this.clock;
        if (beat.heroStrikes) {
          hero.pose = "strike";
          hero.until = this.clock + 0.3;
        }
        for (const id of beat.enemyIds) {
          const a = this.actors.find((a) => a.id === id);
          if (a && a.hp > 0) {
            a.pose = "strike";
            a.until = this.clock + 0.3;
          }
        }
      }
      if (beat.started !== null && this.clock >= beat.started + 0.18) {
        this.resolve(beat);
        this.beats.shift();
      }
    }
  }
}
