import { useEffect, useRef, useState } from "react";
import { act, advance, duration, newGame, parseSave, SAVE_KEY } from "./game";
import type { Action } from "./game";
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

export function useGame() {
  const [initial] = useState(load);
  const [state, setState] = useState(initial.state);

  const [warning, setWarning] = useState(initial.warning);
  const [blocked, setBlocked] = useState(initial.blocked);

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
  const reset = () => {
    if (
      !window.confirm(
        "이 브라우저의 시제품 기록을 지우고 새 여정을 시작할까요?",
      )
    )
      return false;
    setState(newGame());
    setBlocked(false);
    setWarning("");
    return true;
  };
  return { state, dispatch, warning, setWarning, toast, setToast, reset };
}
