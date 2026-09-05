import { useId } from "react";
import type { WeaponId } from "./game";
export function Wanderer({
  enemy = false,
  weapon = "sword",
  active = false,
}: {
  enemy?: boolean;
  weapon?: WeaponId;
  active?: boolean;
}) {
  return (
    <svg
      className={`wanderer ${active ? "moving" : ""} ${enemy ? "enemy" : ""}`}
      viewBox="0 0 120 150"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="141" rx="35" ry="5" fill="#263b32" opacity=".13" />
      <g className="body">
        <path
          d="m50 104-12 32 14 2 15-32m-1 0 14 30 14-2-17-40"
          fill="#343c36"
        />
        <path
          d="m45 58-17 41 20 3-9 23 50-2-12-28 17-2-20-35"
          fill={enemy ? "#926849" : "#456c64"}
        />
        <path d="m48 58 14 28 13-28-11 9Z" fill="#e8e8d7" />
        <path d="m43 90 36 1-1 9-36-1" fill="#a27b55" />
        <path d="m56 98 4 26 9-24" fill="#d2b88c" />
        <path
          d="m38 78-10 17 29 7 3-7-21-8m40-9 14 13 13-9-4-7-12 4-5-8"
          fill={enemy ? "#926849" : "#456c64"}
        />
        <path d="m99 75 8-1 1 9-7 1" fill="#d6b392" />
        <ellipse cx="62" cy="42" rx="14" ry="18" fill="#d6b392" />
        <path
          d="m47 45-2-18 12-9 15 4 9 14-7 11-2-15-19 4v14Z"
          fill="#2e342d"
        />
        <circle cx="59" cy="17" r="8" fill="#2e342d" />
        <path d="M67 22q14 12 26 3-5 17-23 9" fill="#2e342d" />
        <path d="M53 46h4m10-1h4" stroke="#433b2e" strokeWidth="2" />
        {weapon === "spear" ? (
          <>
            <path d="m90 132 13-93" stroke="#80674c" strokeWidth="4" />
            <path
              d="m103 39-4-15 11-15-3 18Z"
              fill="#e4e9df"
              stroke="#7e9691"
            />
          </>
        ) : (
          <>
            <path
              d="m100 79 9-36-1-10-6 8-9 36Z"
              fill="#e8ede6"
              stroke="#7d9690"
              strokeWidth="1.5"
            />
            <path d="m89 79 14 4m-10-1-3 11" stroke="#ad8b55" strokeWidth="4" />
          </>
        )}
      </g>
    </svg>
  );
}
export function Landscape({
  region = 0,
  map = false,
}: {
  region?: number;
  map?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const palettes = [
    ["#e5eee5", "#c5d5c9", "#a3bbab", "#77978a", "#466e5d"],
    ["#f2e9d6", "#dfd3b8", "#b9b7a1", "#939781", "#647961"],
    ["#e2efea", "#c5d9d4", "#9dbeba", "#779d96", "#4d7c72"],
    ["#eef0e3", "#d1d9ca", "#b0bfae", "#81998a", "#59745f"],
  ];
  const c = palettes[region];
  return (
    <svg
      className="landscape"
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={
        map
          ? "산과 강 사이 네 지역이 이어지는 강호 지도"
          : "산수와 대나무가 펼쳐진 지역 풍경"
      }
    >
      <defs>
        <linearGradient id={`${id}sky`} x2="0" y2="1">
          <stop stopColor={c[0]} />
          <stop offset="1" stopColor="#f7f5e7" />
        </linearGradient>
        <linearGradient id={`${id}mist`} x2="0" y2="1">
          <stop stopColor="#f6f5e9" stopOpacity="0" />
          <stop offset="1" stopColor="#f6f5e9" stopOpacity=".8" />
        </linearGradient>
        <filter id={`${id}grain`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".06" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <g filter={`url(#${id}grain)`}>
        <path d="M0 0h1200v560H0Z" fill={`url(#${id}sky)`} />
        <circle cx="925" cy="92" r="36" fill="#fff9db" opacity=".85" />
        <path
          d="m0 253 44-35 40 15 65-61 45 33 67-96 47 18 57-72 39 42 55-11 41 38 65-67 54 36 40-12 56 52 31-27 45 26 47-58 64 9 83 65 73-57 52 36 40-27 63 86V420H0Z"
          fill={c[1]}
        />
        <path
          d="m0 342 65-68 55 11 73-53 43 12 63-58 21-53 30-6 35 71 47 15 61 57 66-40 34-61 44-3 38 49 56 8 83 79 40-26 60-106 14-80 31-20 19 83 50 51 20 4 71 94 61-9 36 21V520H0Z"
          fill={c[2]}
        />
        <path
          d="m299 186 21-53 30-6-19 94-12 72-19-22 11-75m581-10 14-80 31-20-7 125-29 116-14-4 24-109"
          fill="#eef0de"
          opacity=".6"
        />
        <path
          d="M0 335q103 5 190 43t259 4 270 5 231-28 250 16v122H0Z"
          fill={`url(#${id}mist)`}
        />
        <path
          d="m0 455 92-42 80 7 99-35 74 34 118-3 64 29 123-38 98 10 76 10 125-59 48 27 88-15 115 59v121H0Z"
          fill={c[3]}
        />
        <path
          d="M737 360q-157 71-42 98t-138 102h177q150-82 28-110t38-90Z"
          fill="#e1ebe0"
        />
        <path
          d="M741 387q-105 49 5 79m-35 11q-15 28-77 49"
          fill="none"
          stroke="#b3cec3"
          strokeWidth="3"
          opacity=".6"
        />
        <path
          d="M0 500q150-91 333 6t324 22 543-50v82H0Z"
          fill={c[4]}
          opacity=".44"
        />
        <path
          d="M0 550q135-40 270-12t173-7 110 29H0Z"
          fill="#47664e"
          opacity=".45"
        />
        {[70, 139, 206, 1035, 1102, 1175].map((x, i) => (
          <g
            key={x}
            transform={`translate(${x} ${map ? 160 : 80}) rotate(${i < 3 ? -8 : 8})`}
            opacity={map ? 0.27 : 0.65}
          >
            <path d="M0 450V0" stroke={c[4]} strokeWidth={i % 2 ? 7 : 10} />
            {[40, 100, 170, 235, 300].map((y, j) => (
              <g key={y}>
                <path d={`M-5 ${y}h11`} stroke="#e4e8d1" strokeWidth="2" />
                <path
                  d={`M0 ${y}q${j % 2 ? 45 : -45} -34 ${j % 2 ? 80 : -80} -18M0 ${y}q${j % 2 ? -40 : 40} -21 ${j % 2 ? -65 : 65} -48`}
                  stroke={c[4]}
                  fill="none"
                  strokeWidth="2"
                />
                <path
                  d={`M${j % 2 ? 28 : -28} ${y - 24}q-15-43-29-42 1 30 29 42m${j % 2 ? 12 : -12} -3q25-36 39-28-6 23-39 28`}
                  fill={c[4]}
                />
              </g>
            ))}
          </g>
        ))}
        <g transform="translate(497 307)" opacity=".68">
          <path d="M0 35h82v63H0Z" fill="#b7b9a0" />
          <path d="M7 40h68v53H7Z" fill="#e0dbc2" />
          <path d="M15 50h11v43H15m39-43h12v43H54" fill="#637969" />
          <path d="m-13 34 20-6L25 9h34l18 19 17 6-8 9H-8Z" fill="#60786b" />
          <path
            d="m-7 34 21-4 15-12h26l17 12 13 4"
            fill="none"
            stroke="#a4b3a1"
            strokeWidth="2"
          />
          <path d="M-4 99h90" stroke="#6d8170" strokeWidth="5" />
        </g>
        <g fill="none" stroke="#687f73" strokeWidth="2" opacity=".6">
          <path d="M688 96q9-7 16 0 8-8 16-2m-52 23q7-6 13 0 6-6 13-2m-227 27q7-6 13 0 6-6 13-2" />
        </g>
      </g>
    </svg>
  );
}
