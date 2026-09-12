import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  arts,
  duration,
  goalNames,
  maxHp,
  power,
  practice,
  recommendation,
  recommended,
  regions,
  weapons,
} from "./game";
import type { ArtId, Goal, Report, WeaponId } from "./game";
import {
  Meter,
  PixelBackdrop,
  PixelIcon,
  sceneArt,
  Sprite,
  Stage,
} from "./Art";
import type { IconName } from "./Art";
import { useGame } from "./useGame";
import { CombatScene } from "./CombatScene";
const money = (n: number) => Math.floor(n).toLocaleString("ko-KR");
type Panel = "arts" | "weapons" | "report" | "help" | null;
const panelNames = {
  arts: "무인의 길 · 무공",
  weapons: "행낭 · 병기",
  report: "행로 기록",
  help: "여정 안내",
};
function GameDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="game-dialog pixel-frame"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.target === e.currentTarget &&
          (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
        )
          onClose();
      }}
      aria-label={title}
    >
      <header className="dialog-header">
        <span className="pixel-diamond" />
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          <PixelIcon name="close" />
        </button>
      </header>
      <div className="dialog-content">{children}</div>
      <footer className="dialog-footer">
        <span>여정은 화면 밖에서도 이어집니다</span>
        <button className="pixel-button small" onClick={onClose}>
          현장으로
          <PixelIcon name="arrow" />
        </button>
      </footer>
    </dialog>
  );
}
export default function App() {
  const { state, dispatch, warning, setWarning, toast, setToast, reset } =
    useGame();
  const [screen, setScreen] = useState<"play" | "map">("play");
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState(state.region);
  const [savedReport, setSavedReport] = useState<Report | null>(null);
  const current = regions[state.region],
    r = regions[selected],
    rec = recommended(state),
    fit = recommendation(state, r),
    boss = !!state.battle?.boss,
    locked = selected > state.unlocked,
    report = savedReport ?? state.report;
  const open = (next: Panel) => {
    setSavedReport(null);
    setPanel(next);
  };
  const map = () => {
    setSelected(state.region);
    setScreen("map");
    setPanel(null);
  };
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !panel) setScreen("play");
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [panel]);
  useEffect(() => {
    for (const src of [...sceneArt, "/art/world-map.png"]) {
      const image = new Image();
      image.src = src;
    }
  }, []);
  const status = state.paused
    ? "활동 멈춤"
    : boss
      ? "강적 대결"
      : state.mode === "battle"
        ? "자동 전투"
        : state.mode === "rest"
          ? "운기 조식"
          : state.phase >= 3
            ? "주변 탐색"
            : "길을 걷는 중";
  const rewardIcon: Record<Goal, IconName> = {
    silver: "coin",
    herbs: "leaf",
    insight: "spark",
  };
  const enemyHp = state.battle?.health.reduce((a, b) => a + b, 0) ?? 0;
  return (
    <main
      className={`game-shell ${screen === "map" ? "map-screen" : ""} ${state.paused ? "is-paused" : ""}`}
    >
      {screen === "play" ? (
        <>
          <PixelBackdrop
            src={sceneArt[state.region]}
            label={`${current.name}의 픽셀 아트 풍경`}
          />
          <div className="edge-shade" aria-hidden="true" />
          <Stage state={state} />
          <CombatScene state={state} />
        </>
      ) : (
        <div className="map-page-texture" />
      )}
      <div className="hud-top">
        {screen === "play" ? (
          <button
            className="hero-hud pixel-frame"
            onClick={() => open("arts")}
            aria-label="무인 상태"
          >
            <span className="hud-portrait">
              <Sprite frame={4} />
            </span>
            <span className="hero-bars">
              <span className="hero-hud-name">
                무명의 무인 <small>단련 {practice(state)}</small>
              </span>
              <span className="hud-health">
                <PixelIcon name="heart" />
                {Math.ceil(state.hp)} / {maxHp(state)}
              </span>
              <Meter value={state.hp} max={maxHp(state)} label="무인 체력" />
              <Meter
                value={state.xp % 80}
                max={80}
                label="기초 단련 경험"
                tone="gold"
              />
            </span>
          </button>
        ) : (
          <button
            className="pixel-button back-to-field"
            onClick={() => setScreen("play")}
          >
            <PixelIcon name="arrow" />
            현장으로
          </button>
        )}
        <div className="location-plaque">
          <span className="location-kicker">FIRSTFORM · 강호를 걷다</span>
          <h1>{screen === "map" ? "강호 행로도" : current.name}</h1>
          <span className="location-sub">
            {screen === "map"
              ? `${state.unlocked + 1} / 4 지역 개방`
              : current.sub}
          </span>
        </div>
        <div className="resource-hud" aria-label="현재 보유 자원">
          {(["silver", "herbs", "insight"] as Goal[]).map((key) => (
            <span
              key={key}
              className={`resource-token ${key}`}
              aria-label={`${goalNames[key]} ${money(state.loot[key])}`}
              title={goalNames[key]}
            >
              <PixelIcon name={rewardIcon[key]} />
              {money(state.loot[key])}
            </span>
          ))}
        </div>
      </div>
      {screen === "play" && state.battle && (
        <section className="enemy-hud pixel-frame" aria-label="현재 적">
          <span>
            <PixelIcon name={boss ? "flag" : "sword"} />
            {state.battle.template.name}
            {state.battle.health.length > 1
              ? ` · ${state.battle.health.filter((h) => h > 0).length}체`
              : ""}
          </span>
          <Meter
            value={enemyHp}
            max={state.battle.template.hp * state.battle.template.count}
            label="적 전체 체력"
            tone="rust"
          />
          <small>
            {Math.ceil(enemyHp)} /{" "}
            {state.battle.template.hp * state.battle.template.count}
            {boss ? " · 강적" : ""}
          </small>
        </section>
      )}
      {screen === "map" && (
        <section className="map-layout" aria-label="강호 지역 선택">
          <div className="map-sheet pixel-frame">
            <div className="map-illustration">
              <PixelBackdrop
                src="/art/world-map.png"
                label="청죽림, 적운산채, 운무나루와 백운고개를 잇는 픽셀 강호 지도"
              />
              {regions.map((region, i) => {
                const coords = [
                  [19, 71],
                  [32, 31],
                  [67, 74],
                  [81, 22],
                ][i];
                return (
                  <button
                    key={i}
                    className={`region-pin ${selected === i ? "selected" : ""} ${i > state.unlocked ? "locked" : ""}`}
                    style={{ left: `${coords[0]}%`, top: `${coords[1]}%` }}
                    onClick={() => setSelected(i)}
                    aria-label={`${region.name}${i > state.unlocked ? " · 미개방" : ""}`}
                    aria-pressed={selected === i}
                  >
                    <span className="pin-marker">
                      <PixelIcon
                        name={
                          i > state.unlocked
                            ? "lock"
                            : state.beaten.includes(i)
                              ? "check"
                              : "flag"
                        }
                      />
                    </span>
                    <strong>{region.name}</strong>
                    <small>
                      {i === state.region
                        ? "머무는 곳"
                        : i > state.unlocked
                          ? "미개방"
                          : i === rec.id
                            ? "추천 행로"
                            : "열린 길"}
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="map-caption">
              <PixelIcon name="boot" />
              발길이 닿은 곳에서, 새로운 길이 열립니다.
            </div>
          </div>
          <div className="region-scroll pixel-frame">
            <div
              className="region-preview"
              style={{ backgroundImage: `url(${sceneArt[selected]})` }}
            >
              <span>제 {selected + 1} 행로</span>
              <h2>{r.name}</h2>
            </div>
            <div className="region-content">
              <p>{r.story}</p>
              <dl className="region-facts">
                <div>
                  <dt>
                    <PixelIcon name="sword" />
                    마주칠 적
                  </dt>
                  <dd>{r.enemyText}</dd>
                </div>
                <div>
                  <dt>
                    <PixelIcon name="bag" />
                    발견할 것
                  </dt>
                  <dd>{r.rewardText}</dd>
                </div>
              </dl>
              <div className="guide-note">
                <h3>
                  <PixelIcon name="leaf" />
                  길잡이의 조언 <span>{locked ? "미개방" : fit.risk}</span>
                </h3>
                <label>
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
                  현재 병기·무공·숙련·단련과 {goalNames[state.goal]} 보상을
                  고려합니다. 추천과 다른 열린 길도 자유롭게 선택할 수 있습니다.
                </small>
              </div>
              <p className="unlock-condition">
                {locked
                  ? `${regions[Math.max(0, selected - 1)].boss.name} 격파 시 개방`
                  : state.beaten.includes(selected)
                    ? `${r.boss.name} 격파 완료`
                    : `${r.boss.name} · 조우 ${Math.min(4, state.clears[selected])}/4회 격파`}
              </p>
              <button
                className="pixel-button primary depart-button"
                disabled={locked || boss}
                onClick={() => {
                  if (selected !== state.region)
                    dispatch({ type: "region", id: selected });
                  setScreen("play");
                  setToast(`${r.name}의 여정을 이어갑니다.`);
                }}
              >
                {locked ? (
                  <>
                    <PixelIcon name="lock" />
                    아직 닿지 않은 길
                  </>
                ) : boss ? (
                  "강적 대결 후 이동"
                ) : selected === state.region ? (
                  "이곳의 여정으로 돌아가기"
                ) : (
                  <>
                    이곳으로 향하기
                    <PixelIcon name="arrow" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}
      {screen === "play" && (
        <>
          <aside className="field-journal">
            <span className="activity-line">
              <i className="pixel-led" />
              {status}
              <em>자동 활동</em>
            </span>
            {state.log.slice(0, 2).map((entry, i) => (
              <p key={`${entry.time}-${i}`}>
                <span>{duration(entry.time)}</span>
                {entry.text}
              </p>
            ))}
          </aside>
          <aside className="boss-prompt">
            <span>
              <PixelIcon name="flag" />
              {current.boss.name}
            </span>
            <small>
              {state.beaten.includes(state.region)
                ? state.region === 3
                  ? "모든 행로를 답파했습니다."
                  : `${regions[state.region + 1].name} 개방`
                : boss
                  ? "대결은 자동으로 진행됩니다."
                  : `조우 ${Math.min(4, state.clears[state.region])}/4회 격파 · 패배 시 안전 후퇴`}
            </small>
            <button
              className="pixel-button"
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
                  <PixelIcon name="check" />
                  격파 완료
                </>
              ) : boss ? (
                "대결 중"
              ) : (
                <>
                  강적 도전
                  <PixelIcon name="sword" />
                </>
              )}
            </button>
          </aside>
        </>
      )}
      <div className="bottom-hud">
        <div className="equipped-hud">
          <span>
            <PixelIcon name="sword" />
            {weapons[state.weapon].name}
          </span>
          <span>
            <PixelIcon name="spark" />
            {arts[state.art].name}
          </span>
        </div>
        <nav className="game-dock" aria-label="게임 메뉴">
          {(
            [
              {
                label: screen === "map" ? "현장" : "강호",
                icon: screen === "map" ? "boot" : "map",
                action: () => (screen === "map" ? setScreen("play") : map()),
                active: screen === "map",
              },
              { label: "무공", icon: "spark", action: () => open("arts") },
              { label: "병기", icon: "sword", action: () => open("weapons") },
              {
                label: "행로",
                icon: "scroll",
                action: () => open("report"),
                badge: state.report.victories > 0,
              },
              { label: "안내", icon: "help", action: () => open("help") },
            ] as {
              label: string;
              icon: IconName;
              action: () => void;
              active?: boolean;
              badge?: boolean;
            }[]
          ).map((item) => (
            <button
              className={`dock-button ${item.active ? "selected" : ""}`}
              key={item.label}
              onClick={item.action}
              aria-label={item.label === "행로" ? "행로 기록" : item.label}
            >
              <PixelIcon name={item.icon} />
              <span>{item.label}</span>
              {item.badge && <i className="dock-badge" />}
            </button>
          ))}
        </nav>
        <div className="time-controls">
          <button
            className="pixel-button small"
            aria-label={state.paused ? "자동 활동 재개" : "자동 활동 일시정지"}
            onClick={() => dispatch({ type: "pause" })}
          >
            <PixelIcon name={state.paused ? "play" : "pause"} />
          </button>
          <button
            className="pixel-button small skip-button"
            disabled={state.paused}
            onClick={() => {
              dispatch({ type: "skip" });
              setToast("활동 1분을 보냈습니다. 행로 기록에 결과가 쌓였습니다.");
            }}
            aria-label="체험 · 1분 보내기"
          >
            <PixelIcon name="speed" />
            <span>1분 보내기</span>
          </button>
        </div>
      </div>
      {warning && (
        <div className="warning-toast pixel-frame" role="status">
          <span>{warning}</span>
          <button
            onClick={() => {
              setWarning("");
              open("report");
            }}
          >
            기록 보기
          </button>
          <button onClick={() => setWarning("")} aria-label="알림 닫기">
            <PixelIcon name="close" />
          </button>
        </div>
      )}
      {toast && (
        <div className="game-toast pixel-frame" role="status">
          <PixelIcon name="check" />
          {toast}
        </div>
      )}
      {panel && (
        <GameDialog
          key={panel}
          title={panelNames[panel]}
          onClose={() => setPanel(null)}
        >
          {panel === "arts" ? (
            <>
              <div className="character-summary">
                <Sprite frame={10} />
                <div>
                  <h3>
                    무명의 무인 <small>단련 {practice(state)}</small>
                  </h3>
                  <p>
                    기초 단련 경험 {state.xp % 80} / 80 · 성장 공격 +
                    {power(state).toFixed(1)}
                  </p>
                  <Meter
                    value={state.xp % 80}
                    max={80}
                    label="무공 화면 기초 단련 경험"
                    tone="gold"
                  />
                  <p>초식을 바꾸어도 이전 무공의 숙련은 남습니다.</p>
                </div>
              </div>
              {boss && (
                <p className="inline-note">
                  강적 대결 중에는 무공·병기·단련을 바꿀 수 없습니다.
                </p>
              )}
              <div className="technique-list">
                {(Object.keys(arts) as ArtId[]).map((id, i) => (
                  <button
                    key={id}
                    className={`technique-row ${state.art === id ? "chosen" : ""}`}
                    disabled={boss}
                    aria-label={`${arts[id].name} 선택`}
                    aria-pressed={state.art === id}
                    onClick={() => dispatch({ type: "art", id })}
                  >
                    <span className={`technique-icon icon-${i}`}>
                      <PixelIcon
                        name={i === 0 ? "sword" : i === 1 ? "spark" : "boot"}
                      />
                    </span>
                    <span className="technique-description">
                      <span className="item-heading">
                        {arts[id].name}
                        <small>{arts[id].label}</small>
                      </span>
                      <span className="item-description">{arts[id].text}</span>
                      <span className="mastery-label">
                        숙련 {Math.floor(state.mastery[id] / 60)}
                        <span>{state.art === id ? "운용 중" : "운용하기"}</span>
                      </span>
                      <Meter
                        value={state.mastery[id] % 60}
                        max={60}
                        label={`${arts[id].name} 숙련`}
                      />
                    </span>
                    {state.art === id && <PixelIcon name="check" />}
                  </button>
                ))}
              </div>
              <section className="breath-training">
                <h3>
                  호흡 단련 <span>{state.training}회</span>
                </h3>
                <p>
                  약초 6 · 깨달음 {12 + state.training * 6} → 공격 +2, 최대 체력
                  +9
                </p>
                <div className="training-inventory">
                  <span>
                    <PixelIcon name="leaf" />
                    보유 {money(state.loot.herbs)}
                  </span>
                  <span>
                    <PixelIcon name="spark" />
                    보유 {money(state.loot.insight)}
                  </span>
                </div>
                <button
                  className="pixel-button primary"
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
                  <PixelIcon name="arrow" />
                </button>
              </section>
            </>
          ) : panel === "weapons" ? (
            <>
              <div className="inventory-heading">
                <span>
                  <PixelIcon name="coin" />
                  보유 은전 {money(state.loot.silver)}
                </span>
                <small>강한 병기보다, 지금 필요한 병기</small>
              </div>
              {boss && (
                <p className="inline-note">
                  강적 대결 중에는 병기를 바꿀 수 없습니다.
                </p>
              )}
              <div className="weapon-list">
                {(Object.keys(weapons) as WeaponId[]).map((id, i) => (
                  <article
                    key={id}
                    className={`weapon-row ${state.weapon === id ? "chosen" : ""}`}
                  >
                    <div className="weapon-art">
                      <Sprite frame={i === 0 ? 5 : i === 1 ? 6 : 7} />
                    </div>
                    <div>
                      <h3>
                        {weapons[id].name}
                        <span>{weapons[id].kind}</span>
                      </h3>
                      <p>{weapons[id].text}</p>
                      <small>
                        {weapons[id].interval}초 간격 · 정확도{" "}
                        {Math.round(weapons[id].accuracy * 100)}%
                      </small>
                      <button
                        className="pixel-button small"
                        disabled={
                          boss ||
                          state.weapon === id ||
                          (!state.owned.includes(id) &&
                            state.loot.silver < weapons[id].cost)
                        }
                        onClick={() => {
                          dispatch({ type: "weapon", id });
                          setToast(`${weapons[id].name} 장착`);
                        }}
                      >
                        {state.weapon === id ? (
                          <>
                            <PixelIcon name="check" />
                            장착 중
                          </>
                        ) : state.owned.includes(id) ? (
                          `${weapons[id].name} 장착`
                        ) : (
                          <>
                            <PixelIcon name="coin" />
                            {weapons[id].cost} 은전 · 구입 후 장착
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="inline-note">
                병기의 타격 범위·정확도·관통이 실제 적 구성과 맞물립니다. 지역별
                병기 강제 보너스는 없습니다.
              </p>
            </>
          ) : panel === "report" ? (
            <>
              <div className="report-heading">
                <PixelIcon name="scroll" />
                <h3>{duration(report.seconds)} 동안의 발자국</h3>
                <p>
                  {savedReport
                    ? "확인한 기록입니다. 다음 결과는 계속 쌓입니다."
                    : "보상은 이미 행낭에 담겼습니다."}
                </p>
              </div>
              <div className="report-counts">
                <span>
                  조우 격파<strong>{report.victories}</strong>
                </span>
                <span>
                  단련 경험<strong>+{report.xp}</strong>
                </span>
                <span>
                  안전 후퇴<strong>{report.retreats}</strong>
                </span>
              </div>
              <div className="report-loot">
                {(["silver", "herbs", "insight"] as Goal[]).map((key) => (
                  <div key={key}>
                    <PixelIcon name={rewardIcon[key]} />
                    <span>{goalNames[key]}</span>
                    <strong>+{money(report.loot[key])}</strong>
                  </div>
                ))}
              </div>
              {report.bosses.map((name) => (
                <p className="achievement" key={name}>
                  <PixelIcon name="flag" />
                  {name} 격파
                </p>
              ))}
              {report.unlocks.map((id) => (
                <p className="achievement" key={id}>
                  <PixelIcon name="map" />
                  {regions[id].name} 개방
                </p>
              ))}
              <button
                className="pixel-button primary report-ack"
                disabled={!!savedReport || report.seconds === 0}
                onClick={() => {
                  setSavedReport(structuredClone(state.report));
                  dispatch({ type: "report" });
                }}
              >
                {savedReport
                  ? "기록 확인 완료"
                  : "기록 확인하고 다음 발자국 남기기"}
              </button>
              <p className="inline-note">
                획득량은 사용 전 합계입니다. 부재 중 최대 8시간 정산 · 강적은
                돌아온 뒤 대결 계속 · 전리품 손실 없음
              </p>
              <details className="journal-details">
                <summary>길 위의 소식 · 최근 {state.log.length}건</summary>
                {state.log.map((entry, i) => (
                  <p key={`${entry.time}-${i}`}>
                    <time>{duration(entry.time)}</time>
                    {entry.text}
                  </p>
                ))}
              </details>
            </>
          ) : (
            <div className="help-content">
              <h3>발걸음을 맡기고, 강호를 바라보세요.</h3>
              <p>
                무인은 스스로 길을 걷고 주변을 탐색합니다. 적을 만나면 전투하고,
                지치면 앉아 호흡을 고릅니다.
              </p>
              <p>
                <strong>강호</strong>에서 목적지와 원하는 보상을 고릅니다.
                조우를 4회 이기면 현장의 <strong>강적 도전</strong>이 열립니다.
                승리하면 다음 지역이 개방됩니다.
              </p>
              <p>
                <strong>무공</strong>에서 초식과 단련을, <strong>병기</strong>
                에서 장착할 무기를 고릅니다. <strong>행로</strong>에는 자리를
                비운 동안의 결과가 쌓입니다.
              </p>
              <p>
                1분 보내기는 기다림을 줄이는 체험 기능입니다. 정지 버튼을 누르면
                자동 활동과 부재 정산이 함께 멈춥니다. 한 탭에서 플레이하세요.
              </p>
              <p>
                지도에서 현장으로 돌아오거나 창을 닫으려면 Esc 키도 사용할 수
                있습니다.
              </p>
              <button
                className="pixel-button small"
                onClick={() => {
                  if (reset()) {
                    setScreen("play");
                    setSelected(0);
                    setSavedReport(null);
                    setPanel(null);
                  }
                }}
              >
                새 여정 시작
              </button>
            </div>
          )}
        </GameDialog>
      )}
    </main>
  );
}
