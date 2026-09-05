# 생성 이미지 프롬프트

2026-09-06 · Codex 내장 image_gen 도구로 생성했습니다. 별도 CLI나 Python 이미지 편집을 사용하지 않았습니다. Unity Docs 이미지 파일을 생성 도구에 입력하거나 복제하지 않았습니다. 산채·나루·고개는 새로 생성한 bamboo.png만 스타일 참고로 사용했습니다.

## bamboo

출력: `public/art/bamboo.png`

```text
Use case: stylized-concept. Asset type: production-ready 2D pixel art game background, landscape 1536x1024. Create a beautiful original bright East Asian wuxia RPG location: a sunlit bamboo grove along a weathered pale stone mountain trail. Crisp genuine 16-bit pixel art, visible square pixel clusters, restrained rich palette, hand placed dithering and hard pixel edges, no smooth vector shapes, no painterly blur. Blue-white distant karst mountains and cream clouds, layered green bamboo framing both sides, a small old tiled-roof roadside shelter and stone lantern to the left, grasses and tiny wildflowers, calm jade stream near the right. Composition: ground is a wide horizontal walkable pale stone clearing from 42% to 88% image height; central 60% is open, empty playable space so animated character sprites can stand around 65% image height. Background distant mountains and sky occupy upper 40%. Natural 3/4 side view JRPG stage, not isometric. Warm soft morning daylight, peaceful adventurous atmosphere, beautiful depth. The visual should look like an actual high quality pixel game screenshot with its sprites and interface removed. No characters, no people, no animals, no HUD, no text, no borders, no logos. Full bleed environment only. The composition must remain readable when center cropped on a tall mobile screen.
```

## sprites

출력: `public/art/actors.png`

```text
Use case: stylized-concept. Asset type: exact-grid transparent PNG sprite atlas for a 2D wuxia pixel art game. Create one 1024x1024 image, exactly FOUR columns and FOUR rows, sixteen equally sized 256x256 cells. Completely transparent background, no floor, no scenery, no text, no frame lines. Each isolated sprite centered horizontally inside its cell with feet aligned at 85% of cell height, at least 25% empty margin to cell edges. Crisp genuine 16-bit JRPG pixel art using visible 4x4 pixel clusters, hard aliased edges, restrained moss green, cream, warm skin, dark hair palette. Small expressive 3-head-tall young adult martial artist with black topknot, sage-green travel robes, cream lapels, dark trousers and brown sash; generally facing right. Row 1: the SAME protagonist in four natural walk animation frames with a sheathed sword. Row 2: SAME protagonist in four distinct combat frames: sword ready, sword lunge, broad curved saber slash, long spear thrust. All weapon tips entirely inside cells. Row 3: SAME protagonist in four activity frames: looking at a leaf, crouching to collect herbs, sitting cross-legged meditation eyes closed, upright resting with calm breath. Row 4: enemies, each facing left: brown wild dog, larger grey wolf with amber eyes, stout brigand in rust-brown cloth with a saber, iron-armored mountain guard with spear. Consistent outline and pixel scale across all 16 cells. No glow or shadows extending beyond cells. Genuine alpha transparency not a drawn checkerboard. Actual usable sprite sheet, not a presentation mockup.
```

## map

출력: `public/art/world-map.png`

```text
Use case: stylized-concept. Asset type: full-screen pixel art overworld map background for a wuxia RPG, landscape 1536x1024. Bright clean genuine 16-bit pixel art, visible square pixel clusters, hand drawn tilemap feeling with intricate crisp detail, no antialiasing, no smooth vector or 3D. A compact East Asian mountain valley seen from a high overhead perspective. Four recognizable locations connected by a winding tan trail: a bamboo forest lower-left around x20 y68, a reddish earth bandit stockade upper-left-center x42 y39, a misty wooden river ferry lower-right-center x65 y65, and a high white-cloud mountain pass upper-right x83 y28. Jade river meanders from top-center to bottom-right with small wooden bridges and reeds. Surrounding karst mountains, pines, terraced green fields, warm ivory rock. Lovely balanced greens, subdued rust-red, pale turquoise water, cream cloud wisps. Clear tiny architecture and trees. Entire image filled by terrain. Plenty of scenic space between four locations to overlay interactive labels. NO characters, NO text, NO labels, NO icons, NO UI, NO decorative border, NO watermarks. Do not show a scroll on a table. This is the actual playable game's overhead world map.
```

## stockade

출력: `public/art/stockade.png`

```text
Use case: style-transfer. Reference image role: style, camera, pixel scale and playable ground layout only. Create a distinct location background for the same bright 16-bit wuxia pixel RPG. Keep same crisp pixel clusters, warm sunlit natural palette, 3/4 side-view camera, open central ground at 60-85% height, landscape 1536x1024. No characters, animals, interface, text, labels or borders. Full bleed actual game environment. This is not a mockup. Replace the bamboo grove with a reddish-earth mountain bandit stockade. Weathered timber palisades on left and right, old watchtower behind left side, russet dry soil and pale broken paving stones across a broad central empty courtyard. A few restrained faded red cloth pennants WITHOUT text, iron-bound crates and barrels off to the sides. Green and golden trees and distant blue-grey mountains behind. Bright afternoon daylight, inviting colorful pixel game atmosphere, not dark or sinister. Empty center must accommodate two combatant sprites.
```

## ferry

출력: `public/art/ferry.png`

```text
Use case: style-transfer. Reference image role: style, camera, pixel scale and playable ground layout only. Create a distinct location background for the same bright 16-bit wuxia pixel RPG. Keep same crisp pixel clusters, warm sunlit natural palette, 3/4 side-view camera, open central ground at 60-85% height, landscape 1536x1024. No characters, animals, interface, text, labels or borders. Full bleed actual game environment. This is not a mockup. Replace the bamboo grove with a misty jade-water river ferry. A broad pale stone landing and weathered wooden boardwalk across the lower third and central foreground as the walkable combat ground. A small tiled-roof ferry hut on left, tied wooden skiff on the right, reeds, small lantern posts, floating lotus leaves, tranquil turquoise river across midground, layered karst mountains and wisps of pale mist in distance. Bright diffused morning sun and warm cream clouds. No continuous blur; hard pixel clusters.
```

## pass

출력: `public/art/pass.png`

```text
Use case: style-transfer. Reference image role: style, camera, pixel scale and playable ground layout only. Create a distinct location background for the same bright 16-bit wuxia pixel RPG. Keep same crisp pixel clusters, warm sunlit natural palette, 3/4 side-view camera, open central ground at 60-85% height, landscape 1536x1024. No characters, animals, interface, text, labels or borders. Full bleed actual game environment. This is not a mockup. Replace the bamboo grove with a high mountain pass above the clouds. Broad sunlit ivory stone terrace and worn steps across central foreground, moss and small golden alpine grasses. A simple ancient wooden gate off to the left, windswept pines hugging rocks at both outer edges, a weathered stone lantern on the right. Majestic tall karst peaks rise from white clouds in middle distance, clear blue sky and warm ivory sunlit clouds. Tiny yellow wildflowers. Open center for sprites, peaceful epic journey end, restrained and clean.
```
