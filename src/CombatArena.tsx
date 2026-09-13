import { memo } from "react";
import { PixelBackdrop } from "./Art";

const arenaArt = ["/art/arena-bamboo.png", "/art/arena-stockade.png", "/art/arena-ferry.png", "/art/arena-pass.png"];
const arenaNames = ["대숲 공터", "목책 안마당", "나루 잔교", "고개 돌마당"];

// A single full-screen view avoids nested scenery frames on narrow screens.
export const CombatArena = memo(function CombatArena({ region }: { region: number }) {
  return <div className="arena-surround" data-arena-art={region}>
    <PixelBackdrop src={arenaArt[region]} label={arenaNames[region]} />
  </div>;
});
