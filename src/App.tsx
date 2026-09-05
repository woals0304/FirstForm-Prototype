import { useEffect, useRef, useState } from "react";
import {
  Mountain,
  Map,
  Swords,
  ScrollText,
  Sprout,
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  LockKeyhole,
  Check,
  Pause,
  Play,
  Footprints,
  Feather,
  ChevronRight,
  Heart,
  CircleHelp,
  Flag,
  Wind,
  RotateCcw,
  Clock3,
} from "lucide-react";
import {
  act,
  advance,
  arts,
  duration,
  emptyReport,
  goalNames,
  maxHp,
  newGame,
  parseSave,
  power,
  practice,
  recommendation,
  recommended,
  regions,
  SAVE_KEY,
  weapons,
} from "./game";
import type { Action, ArtId, Goal, WeaponId } from "./game";
import { Landscape, Wanderer } from "./Art";
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: newGame(), warning: "", blocked: false, away: 0 };
    const s = parseSave(raw);
    if (!s)
      return {
        state: newGame(),
        warning:
          "저장 기록을 읽지 못했습니다. 원본을 보존한 채 임시로 체험합니다. 새 여정을 시작하면 이 브라우저의 기록을 교체합니다.",
        blocked: true,
        away: 0,
      };
    const away = Math.max(0, Math.floor((Date.now() - s.at) / 1000));
    return {
      state: advance(s, Date.now(), true),
      warning:
        away > 30
          ? s.battle?.boss
            ? "자리를 비운 동안 강적 전투는 멈춰 있었습니다. 같은 전투를 이어갑니다."
            : s.paused
              ? "활동을 멈춰 둔 동안에는 시간이 쌓이지 않았습니다."
              : `${duration(away)} 만에 돌아왔습니다. ${away > 28800 ? "최대 8시간까지 " : ""}누적 결과를 행로 기록에서 확인하세요.`
          : "",
      blocked: false,
      away,
    };
  } catch {
    return {
      state: newGame(),
      warning:
        "브라우저 저장을 사용할 수 없습니다. 현재 창에서는 계속 플레이할 수 있습니다.",
      blocked: true,
      away: 0,
    };
  }
}
const money = (n: number) => Math.floor(n).toLocaleString("ko-KR");
function Meter({
  value,
  max,
  label,
  tone = "green",
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
        style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
      />
    </div>
  );
}
export default function App() {
  const [initial] = useState(load);
  const [state, setState] = useState(initial.state);
  const [tab, setTab] = useState<"journey" | "build" | "report">("journey");
  const [selected, setSelected] = useState(initial.state.region);
  const [warning, setWarning] = useState(initial.warning);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [help, setHelp] = useState(false);
  const [savedReport, setSavedReport] = useState<ReturnType<
    typeof emptyReport
  > | null>(null);
  const [toast, setToast] = useState("");
  const live = useRef(state);
  live.current = state;
  useEffect(() => {
    const interval = window.setInterval(
      () =>
        setState((s) =>
          advance(s, Date.now(), document.hidden || Date.now() - s.at > 5000),
        ),
      1000,
    );
    const visibility = () => {
      if (!document.hidden) setState((s) => advance(s, Date.now(), true));
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (blocked) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      setWarning(
        "저장 공간을 사용할 수 없습니다. 현재 진행은 이 창에만 남아 있습니다.",
      );
    }
  }, [state, blocked]);
  useEffect(() => {
    const save = () => {
      if (blocked) return;
      try {
        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify(advance(live.current, Date.now(), document.hidden)),
        );
      } catch {
        /* The in-page save status already reports persistence failures. */
      }
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, [blocked]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(t);
  }, [toast]);
  const dispatch = (action: Action) =>
    setState((s) => act(advance(s, Date.now(), document.hidden), action));
  const r = regions[selected],
    current = regions[state.region],
    rec = recommended(state),
    fit = recommendation(state, r),
    boss = !!state.battle?.boss,
    locked = selected > state.unlocked;
  const status = state.paused
    ? "활동 멈춤"
    : state.mode === "battle"
      ? boss
        ? "강적과 대결 중"
        : "자동 전투 중"
      : state.mode === "rest"
        ? "운기 조식 중"
        : "자동 탐색 중";
  const go = (next: typeof tab) => {
    setTab(next);
    setSavedReport(null);
  };
  const reset = () => {
    if (
      !window.confirm(
        "이 브라우저의 시제품 기록을 지우고 새 여정을 시작할까요?",
      )
    )
      return;
    setState(newGame());
    setBlocked(false);
    setWarning("");
    setSelected(0);
    setSavedReport(null);
    setTab("journey");
  };
  const report = savedReport ?? state.report;
  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("journey");
          }}
        >
          <span className="brand-mark">
            <Mountain size={26} />
          </span>
          <span>
            FirstForm<small>강호를 걷다</small>
          </span>
        </a>
        <nav aria-label="주 메뉴">
          <button
            className={tab === "journey" ? "active" : ""}
            onClick={() => go("journey")}
          >
            <Map size={17} />
            강호
          </button>
          <button
            className={tab === "build" ? "active" : ""}
            onClick={() => go("build")}
          >
            <Swords size={17} />
            무인의 길
          </button>
          <button
            className={tab === "report" ? "active" : ""}
            onClick={() => go("report")}
          >
            <ScrollText size={17} />
            행로 기록
            {state.report.victories > 0 && <span className="nav-dot" />}
          </button>
        </nav>
        <div className="prototype-label">
          <span />첫 번째 여정 <b>시제품</b>
        </div>
      </header>
      {warning && (
        <div className="notice">
          <Feather size={17} />
          <span>{warning}</span>
          <button
            onClick={() => {
              go("report");
              setWarning("");
            }}
          >
            기록 보기 <ArrowRight size={15} />
          </button>
        </div>
      )}
      <main className="layout">
        <aside className="traveler-panel">
          <div className="section-eyebrow">
            THE WANDERER <span>01</span>
          </div>
          <div className="portrait">
            <Landscape region={state.region} />
            <Wanderer weapon={state.weapon} />
            <span className="portrait-stamp">行</span>
          </div>
          <div className="traveler-name">
            <div>
              <h1>무명의 무인</h1>
              <p>이름보다 먼저, 발자국을 남기다.</p>
            </div>
            <span className="small-seal">초행</span>
          </div>
          <div className="health-label">
            <span>
              <Heart size={13} />
              체력
            </span>
            <strong>
              {Math.ceil(state.hp)} <em>/ {maxHp(state)}</em>
            </strong>
          </div>
          <Meter value={state.hp} max={maxHp(state)} label="무인 체력" />
          <div className="growth-label">
            <span>
              단련 {practice(state)}
              <small>경험으로 쌓은 기초</small>
            </span>
            <strong>
              {state.xp % 80}
              <em> / 80</em>
            </strong>
          </div>
          <Meter
            value={state.xp % 80}
            max={80}
            label="기초 단련 경험"
            tone="sand"
          />
          <div className="loadout-summary">
            <button onClick={() => go("build")}>
              <Swords size={18} />
              <span>
                <small>손에 쥔 병기</small>
                {weapons[state.weapon].name}
              </span>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => go("build")}>
              <Wind size={18} />
              <span>
                <small>펼치는 무공</small>
                {arts[state.art].name}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="pouch">
            <span className="section-eyebrow">여행자의 행낭</span>
            <div>
              <span>
                <Coins size={16} />
                은전
              </span>
              <strong>{money(state.loot.silver)}</strong>
            </div>
            <div>
              <span>
                <Sprout size={16} />
                약초
              </span>
              <strong>{money(state.loot.herbs)}</strong>
            </div>
            <div>
              <span>
                <Sparkles size={16} />
                깨달음
              </span>
              <strong>{money(state.loot.insight)}</strong>
            </div>
          </div>
          <div className="traveler-footer">
            <span className={`live-dot ${state.paused ? "muted" : ""}`} />
            {status}
            <button
              aria-label={
                state.paused ? "자동 활동 재개" : "자동 활동 일시정지"
              }
              onClick={() => dispatch({ type: "pause" })}
            >
              {state.paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
        </aside>
        <div className="main-column">
          <div className="mobile-resources" aria-label="현재 보유 자원">
            <span>
              <Coins size={14} />
              {money(state.loot.silver)}
            </span>
            <span>
              <Sprout size={14} />
              {money(state.loot.herbs)}
            </span>
            <span>
              <Sparkles size={14} />
              {money(state.loot.insight)}
            </span>
            <span>
              <Heart size={13} />
              {Math.ceil(state.hp)}/{maxHp(state)}
            </span>
          </div>
          {tab === "journey" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">한 걸음씩, 나만의 강호</p>
                  <h2>오늘은 어디로 향할까요?</h2>
                </div>
                <span className="subtle">
                  <Flag size={14} />
                  {state.unlocked + 1} / 4 지역 개방
                </span>
              </div>
              <section className="world-map" aria-label="강호 지역 선택">
                <Landscape region={0} map />
                <div className="map-caption">
                  <span>강호 행로도</span>
                  <small>산을 넘고, 물길을 따라</small>
                </div>
                <svg
                  className="map-route"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M18 65Q28 41 43 44T64 69Q75 70 83 34" />
                </svg>
                {regions.map((region) => (
                  <button
                    key={region.id}
                    className={`map-pin ${selected === region.id ? "selected" : ""} ${state.region === region.id ? "current" : ""} ${region.id > state.unlocked ? "locked" : ""}`}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                    onClick={() => setSelected(region.id)}
                    aria-label={`${region.name}${region.id > state.unlocked ? " · 미개방" : ""}`}
                    aria-pressed={selected === region.id}
                  >
                    <span className="pin-symbol">
                      {region.id > state.unlocked ? (
                        <LockKeyhole size={16} />
                      ) : state.beaten.includes(region.id) ? (
                        <Check size={17} />
                      ) : (
                        <Mountain size={18} />
                      )}
                    </span>
                    <strong>{region.name}</strong>
                    <small>
                      {state.region === region.id
                        ? "머무는 곳"
                        : region.id > state.unlocked
                          ? "미개방"
                          : rec.id === region.id
                            ? "추천 행로"
                            : "열린 길"}
                    </small>
                  </button>
                ))}
                <div className="map-legend">
                  <span />
                  <span>열린 길</span>
                  <i />
                  <span>이어질 길</span>
                </div>
              </section>
              <section className="destination">
                <div className="destination-description">
                  <div className="eyebrow">
                    <span className="region-number">0{r.id + 1}</span>
                    {r.sub}
                  </div>
                  <h3>
                    {r.name}
                    {locked ? (
                      <span className="tag muted-tag">미개방</span>
                    ) : rec.id === r.id ? (
                      <span className="tag">추천 행로</span>
                    ) : null}
                  </h3>
                  <p>{r.story}</p>
                  <div className="region-facts">
                    <span>
                      <Swords size={15} />
                      {r.enemyText}
                    </span>
                    <span>
                      <Sprout size={15} />
                      {r.rewardText}
                    </span>
                  </div>
                </div>
                <div className="recommendation">
                  <div className="recommendation-title">
                    <Feather size={17} />
                    <strong>길잡이의 조언</strong>
                    <span className="tag pale">
                      {locked ? "앞으로의 길" : fit.risk}
                    </span>
                  </div>
                  <label className="goal-label">
                    찾고 싶은 것
                    <select
                      aria-label="원하는 보상"
                      value={state.goal}
                      onChange={(e) =>
                        dispatch({ type: "goal", id: e.target.value as Goal })
                      }
                    >
                      {Object.entries(goalNames).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>{fit.reason}</p>
                  <small>
                    {locked
                      ? `${regions[Math.max(0, r.id - 1)].boss.name} 격파 시 개방`
                      : `${goalNames[state.goal]} 목적 · 현재 병기, 무공, 단련을 함께 고려한 조언입니다.`}
                  </small>
                  <button
                    className="primary"
                    disabled={locked || state.region === r.id || boss}
                    onClick={() => {
                      dispatch({ type: "region", id: r.id });
                      setToast(`${r.name}에서 자동 활동을 시작합니다.`);
                    }}
                  >
                    {locked ? (
                      <>
                        <LockKeyhole size={15} />
                        아직 닿지 않은 길
                      </>
                    ) : state.region === r.id ? (
                      <>
                        <Footprints size={16} />
                        이곳에서 활동 중
                      </>
                    ) : boss ? (
                      "강적 대결을 마친 뒤 이동"
                    ) : (
                      <>
                        이곳으로 향하기
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <div className="advice-foot">
                    추천과 다른 열린 길도 자유롭게 선택할 수 있습니다.
                  </div>
                </div>
              </section>
              <section className="activity">
                <div className="activity-header">
                  <div>
                    <span className="live-dot" />
                    <strong>{current.name}의 여정</strong>
                    <span className="subtle">{status}</span>
                  </div>
                  <button className="text-button" onClick={() => go("report")}>
                    누적 결과
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className={`activity-body ${state.mode}`}>
                  <div className="encounter-scene">
                    <Landscape region={state.region} />
                    <div className="player-figure">
                      <Wanderer
                        weapon={state.weapon}
                        active={state.mode === "battle" && !state.paused}
                      />
                    </div>
                    {state.battle && (
                      <>
                        <span className="clash">
                          {state.paused ? "·" : "✧"}
                        </span>
                        <div className="enemy-figure">
                          <Wanderer enemy active={!state.paused} />
                        </div>
                      </>
                    )}
                    <div className="scene-label">
                      {state.mode === "battle"
                        ? state.battle?.template.name
                        : state.mode === "rest"
                          ? "잠시 숨을 고르는 시간"
                          : current.activity}
                    </div>
                  </div>
                  <div className="activity-detail">
                    {state.battle ? (
                      <>
                        <div className="health-label">
                          <strong>
                            {state.battle.template.name}
                            {state.battle.health.length > 1
                              ? ` · ${state.battle.health.filter((h) => h > 0).length}체`
                              : ""}
                          </strong>
                          <span>
                            {Math.ceil(
                              state.battle.health.reduce((a, b) => a + b, 0),
                            )}{" "}
                            /{" "}
                            {state.battle.template.hp *
                              state.battle.template.count}
                          </span>
                        </div>
                        <Meter
                          value={state.battle.health.reduce((a, b) => a + b, 0)}
                          max={
                            state.battle.template.hp *
                            state.battle.template.count
                          }
                          label="적 체력"
                          tone="red"
                        />
                      </>
                    ) : (
                      <>
                        <strong>
                          {state.mode === "rest"
                            ? "운기 조식"
                            : "흔적을 따라 걷습니다"}
                        </strong>
                        <p>
                          {state.mode === "rest"
                            ? "체력을 회복하면 스스로 다시 출발합니다."
                            : "탐색, 전투, 채집과 휴식을 무인이 알아서 이어갑니다."}
                        </p>
                      </>
                    )}
                    <div className="recent-log">
                      {state.log.slice(0, 2).map((entry, i) => (
                        <p key={`${entry.time}-${i}`}>
                          <span>{duration(entry.time)}</span>
                          {entry.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="boss-row">
                  <span className="boss-icon">
                    <Flag size={19} />
                  </span>
                  <div>
                    <strong>
                      {state.beaten.includes(state.region)
                        ? `${current.boss.name} 격파 완료`
                        : current.boss.name}
                    </strong>
                    <small>
                      {state.beaten.includes(state.region)
                        ? state.region === 3
                          ? "모든 길을 열었습니다. 다른 조합으로 여정을 이어가세요."
                          : `${regions[state.region + 1].name}(으)로 가는 길이 열렸습니다.`
                        : `조우 ${Math.min(4, state.clears[state.region])}/4회 격파 · 패배하면 안전 후퇴, 자원 손실 없음`}
                    </small>
                  </div>
                  <button
                    className="secondary"
                    disabled={
                      state.beaten.includes(state.region) ||
                      state.clears[state.region] < 4 ||
                      boss ||
                      state.paused
                    }
                    onClick={() => dispatch({ type: "boss" })}
                  >
                    {state.beaten.includes(state.region) ? (
                      <>
                        <Check size={14} />
                        답파
                      </>
                    ) : boss ? (
                      "대결 중"
                    ) : (
                      <>
                        강적 도전
                        <Swords size={15} />
                      </>
                    )}
                  </button>
                </div>
              </section>
            </>
          ) : tab === "build" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">움직임이 달라지면, 길도 달라집니다</p>
                  <h2>무인의 길</h2>
                </div>
                <span className="subtle">한 사람, 여러 가지 가능성</span>
              </div>
              <section className="build-intro">
                <Landscape region={state.region} />
                <Wanderer weapon={state.weapon} />
                <div>
                  <span className="eyebrow">지금의 초식</span>
                  <h3>
                    {arts[state.art].name} <span>×</span>{" "}
                    {weapons[state.weapon].name}
                  </h3>
                  <p>
                    무공과 병기를 바꿔 같은 지역의 여정을 비교해 보세요.
                    <br />
                    선택하지 않은 무공의 숙련도도 그대로 남습니다.
                  </p>
                </div>
              </section>
              {boss && (
                <p className="notice">
                  강적 대결 중에는 병기·무공·단련 변경이 잠시 멈춥니다.
                </p>
              )}
              <section className="build-section">
                <div className="section-title">
                  <h3>펼치는 무공</h3>
                  <span>세 초식 중 하나를 선택합니다</span>
                </div>
                <div className="choice-grid">
                  {(Object.keys(arts) as ArtId[]).map((id) => (
                    <button
                      key={id}
                      className={`art-card ${state.art === id ? "chosen" : ""}`}
                      aria-pressed={state.art === id}
                      disabled={boss}
                      onClick={() => dispatch({ type: "art", id })}
                    >
                      <div className="art-mark">{arts[id].mark}</div>
                      <span className="eyebrow">{arts[id].label}</span>
                      <h4>{arts[id].name}</h4>
                      <p>{arts[id].text}</p>
                      <div className="mastery">
                        <span>숙련 {Math.floor(state.mastery[id] / 60)}</span>
                        <span>
                          {state.art === id ? (
                            <>
                              <Check size={13} />
                              운용 중
                            </>
                          ) : (
                            "운용하기"
                          )}
                        </span>
                      </div>
                      <Meter
                        value={state.mastery[id] % 60}
                        max={60}
                        label={`${arts[id].name} 숙련`}
                      />
                    </button>
                  ))}
                </div>
              </section>
              <section className="build-section">
                <div className="section-title">
                  <h3>손에 쥘 병기</h3>
                  <span>등급보다 쓰임새를 살펴보세요</span>
                </div>
                <div className="choice-grid">
                  {(Object.keys(weapons) as WeaponId[]).map((id) => (
                    <article
                      className={`weapon-card ${state.weapon === id ? "chosen" : ""}`}
                      key={id}
                    >
                      <span className="weapon-drawing" aria-hidden="true">
                        <Swords size={36} strokeWidth={1} />
                        <small>{weapons[id].kind}</small>
                      </span>
                      <h4>{weapons[id].name}</h4>
                      <p>{weapons[id].text}</p>
                      <div className="weapon-traits">
                        <span>{weapons[id].interval}초 간격</span>
                        <span>
                          정확도 {Math.round(weapons[id].accuracy * 100)}%
                        </span>
                      </div>
                      <button
                        className={
                          state.weapon === id ? "equipped" : "secondary"
                        }
                        disabled={
                          boss ||
                          state.weapon === id ||
                          (!state.owned.includes(id) &&
                            state.loot.silver < weapons[id].cost)
                        }
                        onClick={() => {
                          dispatch({ type: "weapon", id });
                          setToast(`${weapons[id].name}을 손에 쥐었습니다.`);
                        }}
                      >
                        {state.weapon === id ? (
                          <>
                            <Check size={14} />
                            장착 중
                          </>
                        ) : state.owned.includes(id) ? (
                          "장착하기"
                        ) : (
                          <>
                            <Coins size={14} />
                            {weapons[id].cost} 은전 · 구입 후 장착
                          </>
                        )}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
              <section className="training">
                <span className="training-icon">
                  <Sparkles size={27} />
                </span>
                <div>
                  <h3>호흡을 깊게, 걸음을 단단하게</h3>
                  <p>
                    약초 6 · 깨달음 {12 + state.training * 6} → 공격 +2, 최대
                    체력 +9
                  </p>
                  <small>
                    호흡 단련 {state.training}회 · 현재 성장 공격 +
                    {power(state).toFixed(1)} · 경지 명칭 없이 기초를 쌓습니다.
                  </small>
                </div>
                <button
                  className="primary"
                  disabled={
                    boss ||
                    state.loot.herbs < 6 ||
                    state.loot.insight < 12 + state.training * 6
                  }
                  onClick={() => {
                    dispatch({ type: "train" });
                    setToast("호흡 단련을 마쳤습니다.");
                  }}
                >
                  호흡 단련
                  <ArrowRight size={15} />
                </button>
              </section>
              <div className="build-advice">
                <Feather size={20} />
                <div>
                  <strong>지금의 조합으로는 {rec.name}을 권합니다.</strong>
                  <p>{recommendation(state, rec).reason}</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setSelected(rec.id);
                    go("journey");
                  }}
                >
                  지도에서 보기
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    자리를 비운 동안에도, 여정은 이어집니다
                  </p>
                  <h2>발자국이 남긴 것들</h2>
                </div>
                <span className="subtle">
                  <Clock3 size={15} />
                  {duration(report.seconds)}의 기록
                </span>
              </div>
              <section className="report-hero">
                <span className="report-emblem">
                  <ScrollText size={35} strokeWidth={1} />
                </span>
                <h3>
                  {report.seconds === 0
                    ? "첫 발자국을 기다리는 중입니다."
                    : "걷고, 부딪히고, 조금 더 단단해졌습니다."}
                </h3>
                <p>
                  {savedReport
                    ? "방금 확인한 기록입니다. 새 활동은 다음 기록에 계속 쌓입니다."
                    : "마지막 확인 이후 쌓인 결과입니다. 보상은 이미 행낭에 담겼습니다."}
                </p>
                <div className="report-totals">
                  <div>
                    <strong>{report.victories}</strong>
                    <span>조우 격파</span>
                  </div>
                  <div>
                    <strong>+{report.xp}</strong>
                    <span>단련 경험</span>
                  </div>
                  <div>
                    <strong>{report.retreats}</strong>
                    <span>안전 후퇴</span>
                  </div>
                </div>
                <div className="reward-grid">
                  <div>
                    <Coins size={22} />
                    <span>은전</span>
                    <strong>+{money(report.loot.silver)}</strong>
                  </div>
                  <div>
                    <Sprout size={22} />
                    <span>약초</span>
                    <strong>+{money(report.loot.herbs)}</strong>
                  </div>
                  <div>
                    <Sparkles size={22} />
                    <span>깨달음</span>
                    <strong>+{money(report.loot.insight)}</strong>
                  </div>
                </div>
                {report.bosses.map((name) => (
                  <div className="unlock-note" key={name}>
                    <Flag size={17} />
                    {name} 격파
                  </div>
                ))}
                {report.unlocks.map((id) => (
                  <div className="unlock-note" key={id}>
                    <Map size={17} />
                    {regions[id].name}으로 향하는 길이 열렸습니다.
                  </div>
                ))}
                <button
                  className="primary"
                  disabled={!!savedReport || report.seconds === 0}
                  onClick={() => {
                    setSavedReport(structuredClone(state.report));
                    dispatch({ type: "report" });
                  }}
                >
                  {savedReport ? (
                    <>
                      <Check size={16} />
                      기록 확인 완료
                    </>
                  ) : (
                    <>
                      기록 확인하고 다음 발자국 남기기
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <small className="report-footnote">
                  획득량은 사용 전 합계입니다. 병기 구입·호흡 단련 후 행낭
                  잔액과 다를 수 있습니다.
                  <br />
                  부재 중 최대 8시간 정산 · 강적 대결은 돌아온 뒤 계속 · 사망 및
                  전리품 손실 없음
                </small>
              </section>
              <section className="journal">
                <div className="section-title">
                  <h3>길 위의 소식</h3>
                  <span>최근 활동 36건</span>
                </div>
                {state.log.map((entry, i) => (
                  <div className="journal-entry" key={`${entry.time}-${i}`}>
                    <span>{duration(entry.time)}</span>
                    <p>{entry.text}</p>
                  </div>
                ))}
              </section>
            </>
          )}
          <footer className="page-footer">
            <span>
              <span className="live-dot" />
              나만의 속도로 이어지는 여정
            </span>
            <div>
              <button
                onClick={() => {
                  dispatch({ type: "skip" });
                  setToast(
                    "활동 1분을 보냈습니다. 행로 기록에서 결과를 확인하세요.",
                  );
                }}
                disabled={state.paused}
              >
                <Clock3 size={13} />
                체험 · 1분 보내기
              </button>
              <button onClick={() => setHelp(!help)} aria-expanded={help}>
                <CircleHelp size={14} />
                안내
              </button>
            </div>
          </footer>
          {help && (
            <section className="help">
              <h3>첫 여정 안내</h3>
              <p>
                지도에서 목적지를 고르면 탐색·전투·회복이 자동으로 이어집니다.
                조우를 4회 이긴 뒤 강적에게 직접 도전하세요. 승리하면 다음 길이
                열립니다. 체력이 부족하면 안전하게 물러납니다.
              </p>
              <p>
                무인의 길에서 세 무공과 세 병기를 조합하고, 약초와 깨달음으로
                호흡을 단련할 수 있습니다. ‘1분 보내기’로 기다림을 압축해
                보세요. 활동은 브라우저에 자동 저장됩니다. 한 탭에서 플레이해
                주세요.
              </p>
              <p>
                시제품의 수치, 지명, 자유로운 병기·초식 조합과 SVG 미술은
                임시입니다. 최종 경지·미술·세계관을 확정하지 않습니다.
              </p>
              <button className="text-button" onClick={reset}>
                <RotateCcw size={14} />새 여정 시작
              </button>
            </section>
          )}
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      <div className="bottom-flourish">
        FIRSTFORM <span>·</span> A JOURNEY THROUGH THE MARTIAL WORLD
      </div>
    </div>
  );
}
