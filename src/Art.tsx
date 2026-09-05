import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { GameState } from "./game";
import { arts, maxHp, regions, weapons } from "./game";
export const sceneArt = [
  "/art/bamboo.png",
  "/art/stockade.png",
  "/art/ferry.png",
  "/art/pass.png",
];
export type IconName =
  | "map"
  | "sword"
  | "bag"
  | "scroll"
  | "leaf"
  | "coin"
  | "spark"
  | "heart"
  | "pause"
  | "play"
  | "close"
  | "arrow"
  | "flag"
  | "check"
  | "lock"
  | "boot"
  | "help"
  | "speed"
  | "mountain";
const patterns: Record<IconName, string[]> = {
  map: [
    "..........",
    "..##...##.",
    ".#..###..#",
    ".#..#.#..#",
    ".#..#.#..#",
    ".#..#.#..#",
    ".#..#.#..#",
    ".###...##.",
    "..........",
  ],
  sword: [
    ".......##.",
    "......##..",
    ".....##...",
    "....##....",
    ".#.##.....",
    "..###.....",
    "...###....",
    "..#..#....",
    ".##.......",
  ],
  bag: [
    "...####...",
    "...#..#...",
    "..######..",
    ".#......#.",
    ".#.####.#.",
    ".#.#..#.#.",
    ".#.####.#.",
    ".#......#.",
    "..######..",
  ],
  scroll: [
    ".#######..",
    ".#.....##.",
    ".#.###..#.",
    ".#......#.",
    ".#.####.#.",
    ".#......#.",
    ".#.###..#.",
    "##......#.",
    ".########.",
  ],
  leaf: [
    "......###.",
    "....#####.",
    "...######.",
    "..###.##..",
    "..##.##...",
    "...###....",
    "..##......",
    "..#.......",
    "..........",
  ],
  coin: [
    "...####...",
    "..######..",
    ".##.##.##.",
    ".##.#..##.",
    ".##.#..##.",
    ".##.##.##.",
    "..######..",
    "...####...",
    "..........",
  ],
  spark: [
    "....##....",
    "....##....",
    "...####...",
    ".########.",
    "..######..",
    "...####...",
    "....##....",
    "....##....",
    "..........",
  ],
  heart: [
    ".##...##..",
    "####.####.",
    "#########.",
    "#########.",
    ".#######..",
    "..#####...",
    "...###....",
    "....#.....",
    "..........",
  ],
  pause: [
    "..##.##...",
    "..##.##...",
    "..##.##...",
    "..##.##...",
    "..##.##...",
    "..##.##...",
    "..##.##...",
    "..........",
    "..........",
  ],
  play: [
    "..##......",
    "..###.....",
    "..####....",
    "..#####...",
    "..####....",
    "..###.....",
    "..##......",
    "..........",
    "..........",
  ],
  close: [
    ".##....##.",
    "..##..##..",
    "...####...",
    "....##....",
    "...####...",
    "..##..##..",
    ".##....##.",
    "..........",
    "..........",
  ],
  arrow: [
    ".....#....",
    ".....##...",
    "..######..",
    "..#######.",
    "..######..",
    ".....##...",
    ".....#....",
    "..........",
    "..........",
  ],
  flag: [
    "..######..",
    "..#######.",
    "..#######.",
    "..######..",
    "..#.......",
    "..#.......",
    "..#.......",
    "..#.......",
    "..........",
  ],
  check: [
    "........#.",
    ".......##.",
    "......##..",
    ".#...##...",
    ".##.##....",
    "..###.....",
    "...#......",
    "..........",
    "..........",
  ],
  lock: [
    "...####...",
    "..##..##..",
    "..##..##..",
    ".########.",
    ".###..###.",
    ".###..###.",
    ".########.",
    "..........",
    "..........",
  ],
  boot: [
    "...###....",
    "...###....",
    "...###....",
    "...###....",
    "...###....",
    "...#####..",
    "..#######.",
    "..#######.",
    "..........",
  ],
  help: [
    "..#####...",
    ".##...##..",
    ".....##...",
    "....##....",
    "....#.....",
    "..........",
    "....##....",
    "....##....",
    "..........",
  ],
  speed: [
    ".##..##...",
    ".###.###..",
    ".########.",
    ".###.###..",
    ".##..##...",
    "..........",
    "..........",
    "..........",
    "..........",
  ],
  mountain: [
    "....##....",
    "...####...",
    "..##..##..",
    ".##....##.",
    "###....###",
    "##......##",
    "##########",
    "..........",
    "..........",
  ],
};
export function PixelIcon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`pixel-icon ${className}`}
      viewBox="0 0 10 9"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {patterns[name].flatMap((line, y) =>
        [...line].flatMap((v, x) =>
          v === "#"
            ? [
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill="currentColor"
                />,
              ]
            : [],
        ),
      )}
    </svg>
  );
}
export function Sprite({
  frame = 0,
  className = "",
  style,
}: {
  frame?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`sprite ${className}`}
      style={{
        backgroundPosition: `${((frame % 4) / 3) * 100}% ${(Math.floor(frame / 4) / 3) * 100}%`,
        ...style,
      }}
    />
  );
}
export function PixelBackdrop({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const image = new Image();
    let disposed = false;
    const draw = () => {
      if (disposed || !image.complete || !image.naturalWidth) return;
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(bounds.width / 2));
      canvas.height = Math.max(1, Math.round(bounds.height / 2));
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      const styles = getComputedStyle(canvas);
      const zoom = Number(styles.getPropertyValue("--scene-zoom")) || 1;
      const anchor = Number(styles.getPropertyValue("--scene-anchor") || 0.5);
      const scale =
        zoom *
        Math.max(canvas.width / image.width, canvas.height / image.height);
      canvas.dataset.ready = src;
      ctx.drawImage(
        image,
        (canvas.width - image.width * scale) / 2,
        (canvas.height - image.height * scale) * anchor,
        image.width * scale,
        image.height * scale,
      );
    };
    image.onload = draw;
    image.src = src;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [src]);
  return (
    <canvas
      className="pixel-backdrop"
      ref={ref}
      role="img"
      aria-label={label}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
export function Meter({
  value,
  max,
  label,
  tone = "jade",
}: {
  value: number;
  max: number;
  label: string;
  tone?: string;
}) {
  return (
    <div
      className={`meter ${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
    >
      <span
        style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
      />
    </div>
  );
}
export function Stage({ state }: { state: GameState }) {
  const b = state.battle;
  const attack =
    !!b && b.turn > 0 && b.turn % weapons[state.weapon].interval === 0;
  const collect = state.mode === "explore" && state.phase >= 3;
  const frame =
    state.mode === "rest"
      ? 10
      : b
        ? attack
          ? state.weapon === "saber"
            ? 6
            : state.weapon === "spear"
              ? 7
              : 5
          : state.weapon === "saber"
            ? 6
            : state.weapon === "spear"
              ? 7
              : 4
        : collect
          ? state.phase === 3
            ? 8
            : 9
          : 0;
  const last = state.log.filter((e) => e.time === state.totalSeconds);
  const dealt = last.find((e) => e.text.includes("피해"));
  const hurt = last.find(
    (e) => e.text.includes("체력") && e.text.includes("감소"),
  );
  const dodge = last.find((e) => e.text.includes("피했"));
  const label = state.paused
    ? "잠시 멈춰 있습니다"
    : b
      ? `${b.template.name}과 자동 전투`
      : state.mode === "rest"
        ? "운기 조식으로 체력 회복"
        : collect
          ? regions[state.region].activity
          : "산길을 따라 이동 중";
  return (
    <div
      className={`stage mode-${state.mode} ${collect ? "collecting" : ""} ${state.paused ? "paused" : ""}`}
      role="img"
      aria-label={label}
      data-activity={
        state.paused
          ? "paused"
          : b
            ? "battle"
            : state.mode === "rest"
              ? "rest"
              : collect
                ? "collect"
                : "walk"
      }
    >
      <div className="ambient-leaves" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
      <div
        className={`hero-actor actor ${attack ? "attacking" : ""} ${hurt ? "hurt" : ""}`}
      >
        <div className="actor-caption">
          무명의 무인<span>단련 {Math.floor(state.xp / 80)}</span>
        </div>
        <div className="sprite-shadow" />
        <Sprite
          frame={frame}
          className={
            !b && !collect && state.mode === "explore" ? "walking" : ""
          }
        />
        {state.mode === "rest" && (
          <div className="recovery-effect">
            <i />
            <i />
            <i />
          </div>
        )}
        {collect && <span className="gather-spark">✦</span>}
        {hurt && (
          <span
            key={`hurt-${state.totalSeconds}`}
            className="float-number hurt-number"
          >
            −{hurt.text.match(/체력 (\d+)/)?.[1]}
          </span>
        )}
        <Meter value={state.hp} max={maxHp(state)} label="장면 무인 체력" />
      </div>
      {b &&
        b.health.map((hp, i) => {
          const animal = /들개|늑대/.test(b.template.name);
          const f = animal
            ? b.boss
              ? 13
              : 12
            : /철갑|호위|수문장/.test(b.template.name)
              ? 15
              : 14;
          return hp > 0 ? (
            <div
              key={`${b.template.name}-${i}`}
              className={`enemy-actor actor enemy-${i} ${b.boss ? "boss-actor" : ""} ${animal ? "animal" : ""} ${b.turn > 0 && b.turn % b.template.interval === 0 ? "enemy-attack" : ""}`}
              style={{ "--enemy-index": i } as CSSProperties}
            >
              <div className="sprite-shadow" />
              <Sprite frame={f} />
              <Meter
                value={hp}
                max={b.template.hp}
                label={`${b.template.name} ${i + 1} 체력`}
                tone="rust"
              />
              {i === b.health.findIndex((h) => h > 0) && dealt && (
                <span
                  key={`dealt-${state.totalSeconds}`}
                  className="float-number"
                >
                  {dealt.text.match(/(\d+) 피해/)?.[1]}
                </span>
              )}
              {i === 0 && dodge && (
                <span
                  key={`dodge-${state.totalSeconds}`}
                  className="float-number dodge-number"
                >
                  회피
                </span>
              )}
            </div>
          ) : null;
        })}
      {b && attack && !dodge && (
        <div
          key={`slash-${state.totalSeconds}`}
          className={`slash-effect ${state.art}`}
          aria-hidden="true"
        />
      )}
      {b && attack && (
        <div className="technique-callout" key={`art-${state.totalSeconds}`}>
          {arts[state.art].name}
        </div>
      )}
      <div className="scene-state-caption">{label}</div>
    </div>
  );
}
