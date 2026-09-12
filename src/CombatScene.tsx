import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { GameState } from "./game";
import { Meter, Sprite } from "./Art";
import { CombatMotion, FIELD, weaponMotion } from "./combatMotion";
import "./combat.css";

export function CombatScene({ state }: { state: GameState }) {
  const [motion] = useState(() => new CombatMotion(state));
  const [, render] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    motion.sync(state, !document.hidden);
    render((v) => v + 1);
  }, [motion, state]);
  useEffect(() => {
    let raf = 0,
      previous = 0,
      lastPaint = 0;
    const frame = (now: number) => {
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      const wasActive = motion.active;
      motion.step(dt);
      if (
        (motion.active && !motion.paused && now - lastPaint > 30) ||
        wasActive !== motion.active
      ) {
        render((v) => v + 1);
        lastPaint = now;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [motion]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const resize = () =>
      setScale(
        Math.min(el.clientWidth / FIELD.width, el.clientHeight / FIELD.height),
      );
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [motion.active]);
  if (!motion.active) return null;
  const hero = motion.actors[0],
    target = motion.actors.find((a) => a.id === motion.target);
  const enemies = motion.actors.slice(1),
    alive = enemies.filter((a) => a.hp > 0);
  const phase =
    motion.phase === "enter"
      ? "조우"
      : motion.phase === "win"
        ? "조우 격파"
        : motion.phase === "retreat"
          ? "안전 후퇴"
          : "자동 교전";
  const feet = [4, 4, 4, 4, 11, 12, 11, 11, 14, 14, 15, 14, 27, 28, 26, 25];
  const heads = [14, 16, 14, 16, 19, 31, 22, 31, 7, 42, 39, 9, 54, 27, 15, 4];
  const poseText = {
    approach: "접근",
    guard: "간격 유지",
    strike: "공격",
    hit: "경직",
    fall: "쓰러짐",
    down: "",
    withdraw: "후퇴",
  };
  return (
    <>
      <section
        className="spatial-enemy-hud enemy-hud pixel-frame"
        aria-label="공간 전투 상태"
      >
        <span>
          {state.paused ? "활동 멈춤" : phase} · {motion.title}
        </span>
        <Meter
          value={enemies.reduce((sum, a) => sum + a.hp, 0)}
          max={enemies.reduce((sum, a) => sum + a.maxHp, 0)}
          label="교전 중 적 체력"
          tone="rust"
        />
        <small>
          {motion.phase === "win"
            ? "호흡을 고르고 길을 이어갑니다"
            : motion.phase === "retreat"
              ? "전리품을 지키고 물러납니다"
              : `${alive.length}체 · ${target ? `${target.id + 1}번 적과 교전` : "교전 마무리"}`}
        </small>
      </section>
      <div
        ref={box}
        className={`combat-space ${state.paused ? "motion-paused" : ""}`}
        data-phase={motion.phase}
        role="region"
        aria-label="자동 공간 전투"
      >
        <div
          className="combat-world"
          style={{
            width: FIELD.width,
            height: FIELD.height,
            transform: `translate(-50%,-50%) scale(${scale})`,
          }}
        >
          <svg
            className="combat-ground"
            viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
            aria-hidden="true"
          >
            <ellipse
              cx="360"
              cy="207"
              rx="318"
              ry="124"
              fill="#d8ca9720"
              stroke="#f1dfaf66"
              strokeWidth="2"
              strokeDasharray="4 12"
            />
            {target && hero.moving && (
              <path
                className="pursuit-trail"
                d={`M${hero.x} ${hero.y} L${target.x} ${target.y}`}
                stroke="#f7e5ab"
                strokeWidth="2"
                strokeDasharray="4 10"
                fill="none"
              />
            )}
          </svg>
          {motion.actors.map((a) => {
            const isHero = a.id === -1,
              dead = a.hp <= 0;
            const age = dead ? motion.clock - a.fallenAt : 0;
            if (dead && age > 1.3) return null;
            const walking = a.moving && a.pose !== "strike" && a.pose !== "hit";
            const frame = isHero
              ? a.pose === "strike"
                ? weaponMotion[motion.weapon].frame
                : walking
                  ? Math.floor(motion.clock * 7) % 4
                  : motion.weapon === "sword"
                    ? 4
                    : weaponMotion[motion.weapon].frame
              : a.frame;
            const face = isHero ? a.facing : -a.facing;
            return (
              <div
                key={a.id}
                className={`combatant ${isHero ? "player" : a.frame <= 13 ? "foe animal" : "foe"} pose-${a.pose} ${walking ? "travelling" : ""} ${a.id === motion.target ? "current-target" : ""}`}
                data-fighter={a.id}
                data-x={a.x.toFixed(2)}
                data-y={a.y.toFixed(2)}
                data-pose={a.pose}
                data-target={a.target}
                data-hp={a.hp}
                style={
                  {
                    left: a.x,
                    top: a.y,
                    zIndex: Math.round(a.y),
                    opacity: dead
                      ? Math.max(0, 1 - Math.max(0, age - 0.55) / 0.75)
                      : 1,
                    "--face": face,
                    "--direction": a.facing,
                    "--feet-offset": `${feet[frame]}px`,
                    "--head-offset": `${heads[frame]}px`,
                  } as CSSProperties
                }
              >
                <div className="combat-footprint" />
                {walking && <i className="step-dust" />}
                <div className="combat-figure">
                  <Sprite frame={frame} />
                </div>
                {!dead && (
                  <>
                    <span className="combat-name">
                      {isHero ? "무인" : `${a.id + 1}`}
                    </span>
                    <Meter
                      value={a.hp}
                      max={a.maxHp}
                      label={
                        isHero ? "교전 중 무인 체력" : `${a.id + 1}번 적 체력`
                      }
                      tone={isHero ? "jade" : "rust"}
                    />
                  </>
                )}
                <span className="combat-intent">
                  {isHero && a.pose === "approach" ? "추격" : poseText[a.pose]}
                </span>
                {a.numberUntil > motion.clock && (
                  <span className={`combat-number ${isHero ? "received" : ""}`}>
                    {a.number}
                  </span>
                )}
                {a.pose === "strike" && <i className="contact-flash" />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
