# 지역별 전투장 표현 정제

2026-09-14 · 기준 703d222 · codex/combat-arena-polish

## 최종 표현

기존 탐험 풍경을 확대하는 방식과 직접 그린 지면을 비교한 뒤, 캐릭터 아트에 어울리는 전용 픽셀 배경을 선택했습니다. 청죽림은 대숲 공터, 적운산채는 목책 안마당, 운무나루는 넓은 잔교, 백운고개는 돌난간으로 둘러싸인 길목입니다. 중앙을 비우고 주변에 지역 오브젝트를 배치했습니다. 전투 배경 하나를 화면 전체에 맞추고, 중앙의 빈 지면 안에 기존 전투 공간을 배치합니다. 세로 화면은 배경 양옆을 잘라 보여 주지만 전투 공간 전체는 유지합니다.

CombatArena는 기존 PixelBackdrop을 재사용해 이미지 로드와 화면 크기 변경에 맞춰 픽셀 캔버스를 그립니다. CombatScene에서 발 위치를 기준으로 Y에 따라 0.93~1.05배 스케일을 적용하고 기존 Y 정렬을 유지합니다. 적 번호, 상시 행동명과 추적선은 제거했습니다. 타깃은 발밑 작은 표식으로 표시하며 체력과 피격 숫자는 남깁니다. 상단 전투 HUD를 줄이고 전투 중 좌하단 로그와 강적 안내를 숨겼습니다. 상세 로그는 기존 행로 기록의 '길 위의 소식'에서 확인합니다.

## 보존 범위

src/game.ts, src/game.test.ts, src/useGame.ts, src/combatMotion.ts, src/combatMotion.test.ts는 기준 커밋과 동일합니다. 판정, 저장, 보상, 자동 활동, 타게팅, 좌표와 이동 속도는 변경하지 않습니다. Unity 프로젝트는 수정하지 않습니다.

## 이미지 출처와 프롬프트

내장 imagegen으로 생성했으며 기존 탐험 이미지와 배우 아틀라스는 교체하지 않았습니다. 최종 파일: public/art/arena-bamboo.png, arena-stockade.png, arena-ferry.png, arena-pass.png.

공통 프롬프트:

> Use case: stylized-concept. Create a production pixel art background for a bright clean wuxia RPG small 2.5D belt-scroll combat arena. Landscape 2:1 aspect ratio. View down at ground at a shallow angle, no vanishing point in the playable ground. The large central 82% width and from 25% to 88% height must be flat empty walkable floor, low contrast subtle pixel texture, NO rocks/trees/props blocking it. Perimeter props only at extreme left/right and top 18%, foreground bottom 8%. Crisp handcrafted 16-bit pixel clusters, restrained jade and warm sand palette, peaceful daylight. Not a vector graphic, not photorealistic. No people, animals, text, labels, HUD, icons, borders, grid, circles. Fill the entire image with this small location, no large sky or distant mountain panorama.

지역별 추가 프롬프트:

- Bamboo grove clearing: packed pale sandy earth, patches of leaf litter along margins, tall bamboo clustered at top and outer sides, small worn stone lantern at top-left, mossy stones outside the open ground.
- Abandoned bandit stockade courtyard: warm red-brown packed earth empty sparring ground, aged wooden palisade along far top edge, small timber gate at top center, coiled rope and crates only at outer corners. Rural restrained, no flags with text.
- Misty riverside ferry landing: broad old timber pier is the whole flat walkable center, horizontal planks with subtle wear, calm jade water around extreme side margins, rope bollards at outer corners, a moored small wooden boat beyond top edge. The center is broad open dry wooden decking.
- High mountain pass stone terrace: broad flat worn grey limestone paving, low rough stone parapets at top and side perimeter, pines beyond far corners, mist beyond top edge. Full open paved center, no cliffs cutting across playable floor.

## 임시 요소

생성 배경은 시제품 미술이며 장식의 설정을 확정하지 않습니다. 가장자리 오브젝트는 충돌체가 아닙니다. 기존 배우 아틀라스에는 적 전용 보행·피격·사망 프레임이 없어 기존 흔들림·회전·축소 연출을 유지합니다. 실제 판정과 짧은 시각 연출 사이의 시간차도 기존과 같습니다.
