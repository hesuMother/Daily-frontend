import { useEffect, type KeyboardEvent } from "react";

// 카드처럼 div로 만든 클릭 영역을 키보드(Tab → Enter/Space)로도 누를 수 있게 한다.
export function clickable(onActivate: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.target !== event.currentTarget) return; // 카드 안쪽 버튼에서 누른 키는 그 버튼의 것이다
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    },
  };
}

// 모달이 열려 있는 동안 Esc로 닫는다.
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent | globalThis.KeyboardEvent) => { if (event.key === "Escape") onEscape(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape]);
}
