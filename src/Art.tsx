import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { GameState } from "./game";
import { maxHp, regions } from "./game";
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
    // Entry/exit changes the ground camera without resizing the viewport.
    const sceneObserver = new MutationObserver(draw);
    if (canvas.parentElement)
      sceneObserver.observe(canvas.parentElement, { childList: true });
    return () => {
      disposed = true;
      observer.disconnect();
      sceneObserver.disconnect();
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
  if (state.battle) return null;
  const collect = state.mode === "explore" && state.phase >= 3;
  const label = state.paused
    ? "잠시 멈춰 있습니다"
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
      <div className="hero-actor actor">
        <div className="actor-caption">
          무명의 무인<span>단련 {Math.floor(state.xp / 80)}</span>
        </div>
        <div className="sprite-shadow" />
        <Sprite
          frame={
            state.mode === "rest"
              ? 10
              : collect
                ? state.phase === 3
                  ? 8
                  : 9
                : 0
          }
          className={!collect && state.mode === "explore" ? "walking" : ""}
        />
        {state.mode === "rest" && (
          <div className="recovery-effect">
            <i />
            <i />
            <i />
          </div>
        )}
        {collect && <span className="gather-spark">✦</span>}
        <Meter value={state.hp} max={maxHp(state)} label="장면 무인 체력" />
      </div>
      <div className="scene-state-caption">{label}</div>
    </div>
  );
}
