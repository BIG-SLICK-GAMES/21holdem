/*
 * 21 Hold'em game screen locked-template generator for Figma use_figma.
 *
 * Target file created during setup:
 *   https://www.figma.com/design/aFLZ02uEF8yOtW44RZ3wnQ
 *
 * Paste this whole file into the Figma use_figma tool after the MCP Starter
 * rate limit is lifted. Optional: replace ASSET_HASHES values with uploaded
 * Figma image hashes for exact PNG fills.
 */

const FRAME = { width: 1080, height: 1920 };
const PLAYFIELD_OFFSET_Y = -180;
const DEFAULT_LAYOUT = {
  uiScale: 1.5,
  tableOffsetY: -200,
  tableScale: 1,
  headerOffsetY: 0,
  potOffsetY: 0,
  footerOffsetY: 0,
  playerProfilesOffsetY: 0,
  playerProfilesScale: 1,
};

const ASSET_HASHES = {
  gameBg: "",
  portraitTable: "",
  cardFront: "",
  cardBack: "",
  chipIcon: "",
  sideBet21: "",
  sideBetFlush: "",
  sideBetStraight: "",
};

const SEATS = {
  1: { xPercent: 15, yPercent: 60 },
  2: { xPercent: 15, yPercent: 45 },
  3: { xPercent: 15, yPercent: 28 },
  4: { xPercent: 28, yPercent: 12 },
  5: { xPercent: 72, yPercent: 12 },
  6: { xPercent: 85, yPercent: 28 },
  7: { xPercent: 85, yPercent: 45 },
  8: { xPercent: 85, yPercent: 60 },
};

const fonts = await figma.listAvailableFontsAsync();
const hasFont = (family, style = "Regular") => fonts.some(f => f.fontName.family === family && f.fontName.style === style);
const FONT = {
  body: hasFont("TT Commons") ? { family: "TT Commons", style: "Regular" } : { family: "Inter", style: "Regular" },
  bold: hasFont("TT Commons", "Bold") ? { family: "TT Commons", style: "Bold" } : { family: "Inter", style: "Bold" },
  condensed: hasFont("Neue Plak Condensed") ? { family: "Neue Plak Condensed", style: "Regular" } : { family: "Inter", style: "Bold" },
};
await Promise.all([figma.loadFontAsync(FONT.body), figma.loadFontAsync(FONT.bold), figma.loadFontAsync(FONT.condensed)]);

const rgb = (hex, opacity = 1) => {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return { type: "SOLID", color: { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }, opacity };
};

const imageFill = (hash, fallbackHex, opacity = 1, scaleMode = "FILL") =>
  hash ? [{ type: "IMAGE", imageHash: hash, scaleMode, opacity }] : [rgb(fallbackHex, opacity)];

function rect(parent, name, x, y, w, h, fill, radius = 0, locked = false) {
  const node = figma.createRectangle();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(w, h);
  node.fills = Array.isArray(fill) ? fill : [fill];
  node.cornerRadius = radius;
  node.locked = locked;
  parent.appendChild(node);
  return node;
}

function ellipse(parent, name, cx, cy, w, h, fill, stroke = null, locked = false) {
  const node = figma.createEllipse();
  node.name = name;
  node.x = cx - w / 2;
  node.y = cy - h / 2;
  node.resize(w, h);
  node.fills = Array.isArray(fill) ? fill : [fill];
  if (stroke) {
    node.strokes = [stroke.paint];
    node.strokeWeight = stroke.weight || 1;
  }
  node.locked = locked;
  parent.appendChild(node);
  return node;
}

function frame(parent, name, x, y, w, h, fill = [], locked = false) {
  const node = figma.createFrame();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(w, h);
  node.fills = fill;
  node.clipsContent = false;
  node.locked = locked;
  parent.appendChild(node);
  return node;
}

function text(parent, name, value, x, y, w, h, size, fillHex = "#ffffff", font = FONT.body, align = "CENTER", locked = false) {
  const node = figma.createText();
  node.name = name;
  node.fontName = font;
  node.fontSize = size;
  node.lineHeight = { unit: "AUTO" };
  node.textAlignHorizontal = align;
  node.textAlignVertical = "CENTER";
  node.characters = value;
  node.x = x;
  node.y = y;
  node.resize(w, h);
  node.fills = [rgb(fillHex)];
  node.locked = locked;
  parent.appendChild(node);
  return node;
}

function card(parent, name, x, y, rank, suit, red = false, locked = false) {
  const group = frame(parent, name, x, y, 70, 96, [], locked);
  rect(group, "asset/card_front.png", 0, 0, 70, 96, imageFill(ASSET_HASHES.cardFront, "#fff8e7"), 7, locked);
  text(group, "rank", rank, 6, 7, 22, 22, 18, red ? "#b22a0b" : "#111111", FONT.bold, "LEFT", locked);
  text(group, "suit", suit, 6, 29, 22, 22, 18, red ? "#b22a0b" : "#111111", FONT.bold, "LEFT", locked);
  text(group, "rank_center", rank, 17, 30, 36, 38, 32, red ? "#b22a0b" : "#111111", FONT.bold, "CENTER", locked);
  return group;
}

function seat(parent, seatNo, x, y) {
  const group = frame(parent, `ADJUST/seat-${seatNo} runtime: PlayerRailSlot`, x - 48, y - 48, 96, 126, [], false);
  ellipse(group, "avatar frame / --seat-avatar-size 60px", 48, 34, 60, 60, rgb("#07192a", 0.94), { paint: rgb("#89d5ff", 0.56), weight: 2 });
  text(group, "initials", `P${seatNo}`, 18, 4, 60, 60, 22, "#dff5ff", FONT.bold);
  rect(group, "seat action label", 4, 18, 88, 24, rgb("#07192a", 0.9), 12);
  text(group, "action text", seatNo === 4 ? "RAISED" : "", 4, 18, 88, 24, 11, "#ffffff", FONT.bold);
  rect(group, "chip/name text box", 0, 66, 96, 42, [], 0);
  text(group, "player name", `Player ${seatNo}`, 0, 66, 96, 18, 10, "#ffffff", FONT.bold);
  text(group, "chips", seatNo === 4 ? "12.5K" : "2,500", 0, 84, 96, 18, 10, "#f7d879", FONT.bold);
  rect(group, "asset/card_back.png", 60, 26, 26, 37, imageFill(ASSET_HASHES.cardBack, "#123047"), 2);
  if (seatNo === 2) {
    ellipse(group, "blind badge", 6, 16, 24, 24, rgb("#f5c85a"), { paint: rgb("#ffe38e"), weight: 1 });
    text(group, "blind text", "BB", -6, 4, 24, 24, 9, "#1b1205", FONT.bold);
  }
  return group;
}

const page = figma.currentPage;
page.name = "21 Holdem Game Template";
page.children.forEach(child => child.remove());

const root = frame(page, "21 Holdem / Game Screen / Locked Template", 0, 0, FRAME.width, FRAME.height, [rgb("#02070c")], false);
root.setSharedPluginData("bsg.21holdem", "source", "frontend/src/views/game/index.jsx; frontend/src/scenes/Level.js; frontend/src/views/game/GameActionOverlay.jsx");
root.setSharedPluginData("bsg.21holdem", "layout", JSON.stringify(DEFAULT_LAYOUT));

const lockedBg = frame(root, "LOCKED/background and table assets", 0, 0, FRAME.width, FRAME.height, [], true);
rect(lockedBg, "asset/bg/game_bg.png", 0, 0, FRAME.width, FRAME.height, imageFill(ASSET_HASHES.gameBg, "#02070c"), 0, true);
rect(lockedBg, "top black row .game-table-page__row--top", 0, 0, FRAME.width, 190, rgb("#000000"), 0, true);
rect(lockedBg, "bottom black row .game-table-page__row--bottom", 0, 1816, FRAME.width, 104, rgb("#000000"), 0, true);

const tableGroup = frame(root, "LOCKED/phaser container_body + table", 0, PLAYFIELD_OFFSET_Y + DEFAULT_LAYOUT.tableOffsetY, FRAME.width, FRAME.height, [], true);
rect(tableGroup, "asset/gameplay/portrate_table.png", 86, 96, 908, 1363, imageFill(ASSET_HASHES.portraitTable, "#0f5a49", 1, "FIT"), 0, true);
text(tableGroup, "table watermark drawTableWatermark()", 320, 1010, 440, 78, 58, "#f7fbff", FONT.condensed, "CENTER", true).opacity = 0.26;

const phaserHud = frame(root, "LOCKED/phaser HUD layers", 0, PLAYFIELD_OFFSET_Y, FRAME.width, FRAME.height, [], true);
const pot = frame(phaserHud, "container_pot_amount / PotDisplay", 430, 350, 220, 88, [], true);
rect(pot, "pot glass base", 0, 0, 220, 88, rgb("#071a2c", 0.88), 18, true);
rect(pot, "pot top reflection", 4, 4, 212, 34, rgb("#1b5e8d", 0.28), 14, true);
text(pot, "label", "POT", 0, 8, 220, 26, 22, "#bfe8ff", FONT.condensed, "CENTER", true);
text(pot, "value", "$2,500", 0, 40, 220, 38, 34, "#ffffff", FONT.condensed, "CENTER", true);

const cardLayer = frame(phaserHud, "container_community_cards", 0, 0, FRAME.width, FRAME.height, [], true);
[
  { x: 398, y: 450, r: "A", s: "♠" },
  { x: 508, y: 450, r: "10", s: "♥", red: true },
  { x: 618, y: 450, r: "7", s: "♣" },
].forEach((c, i) => card(cardLayer, `community card ${i + 1}`, c.x, c.y, c.r, c.s, c.red, true));
rect(cardLayer, "deck placeholder getDeckCardPosition()", 180, 450, 70, 96, imageFill(ASSET_HASHES.cardBack, "#123047"), 7, true);

const seats = frame(root, "ADJUST/react seat overlay from profileLayoutControls.json", 0, 190, FRAME.width, 1626, [], false);
Object.entries(SEATS).forEach(([seatNo, pos]) => {
  seat(seats, seatNo, FRAME.width * pos.xPercent / 100, 1626 * pos.yPercent / 100);
});

const overlay = frame(root, "ADJUST/react GameActionOverlay", 0, 0, FRAME.width, FRAME.height, [], false);
const utility = frame(overlay, "game-stage-utility top menu", 0, 0, FRAME.width, 54, [rgb("#000000")], false);
rect(utility, "blind pill", 8, 13, 110, 28, rgb("#071d32", 0.96), 14);
text(utility, "blind label", "BLINDS", 14, 14, 45, 10, 7, "#dff5ff", FONT.bold);
text(utility, "blind amount", "50/100", 14, 24, 78, 18, 15, "#ffffff", FONT.bold, "LEFT");
text(utility, "side bet strip", "Audio  21  Flush  Straight", 142, 7, 560, 40, 18, "#edf8ff", FONT.bold);
["Rewards", "Shop", "Sound", "Exit"].forEach((label, i) => {
  rect(utility, `utility ${label}`, 710 + i * 88, 13, label === "Exit" ? 70 : 42, 28, rgb("#071d32", 0.96), label === "Exit" ? 8 : 14);
  text(utility, `${label} label`, label === "Exit" ? "Exit" : label[0], 710 + i * 88, 13, label === "Exit" ? 70 : 42, 28, 12, "#ffffff", FONT.bold);
});

const actionRows = frame(overlay, "action buttons rows", 120, 1518, 840, 132, [], false);
["Fold", "Call 100", "Raise", "Stand"].forEach((label, i) => {
  rect(actionRows, `button ${label}`, i * 210, 0, 190, 48, rgb(i === 1 || i === 2 ? "#3ecf7a" : "#0a2338", 0.98), 24);
  text(actionRows, `button text ${label}`, label, i * 210, 0, 190, 48, 22, i === 1 || i === 2 ? "#062033" : "#f3fbff", FONT.bold);
});

const console = frame(overlay, "bottom console .game-action-overlay__console-shell", 0, 1670, FRAME.width, 90, [rgb("#061829", 0.97)], false);
ellipse(console, "local avatar", 48, 45, 60, 60, rgb("#08253b", 1), { paint: rgb("#89d5ff", 0.5), weight: 2 });
text(console, "local initials", "ME", 18, 15, 60, 60, 25, "#dff5ff", FONT.bold);
text(console, "console name", "Player", 88, 18, 190, 22, 14, "#ffffff", FONT.bold, "LEFT");
text(console, "console bankroll", "12,500", 88, 42, 190, 28, 22, "#f7d879", FONT.bold, "LEFT");
card(console, "hole card 1", 430, 8, "J", "♦", true);
card(console, "hole card 2", 506, 8, "9", "♣", false);
ellipse(console, "hole total", 606, 45, 34, 34, rgb("#07192a", 0.95), { paint: rgb("#ffffff", 0.75), weight: 2 });
text(console, "hole total text", "19", 589, 28, 34, 34, 18, "#ffffff", FONT.bold);
text(console, "table bankroll label", "Table", 760, 18, 170, 20, 13, "#d6e9f5", FONT.bold, "LEFT");
text(console, "table bankroll value", "2,500", 760, 40, 170, 28, 22, "#f7d879", FONT.bold, "LEFT");
ellipse(console, "table bankroll top up", 1008, 45, 36, 36, rgb("#8dfcb3"), null);
text(console, "top up plus", "+", 990, 27, 36, 36, 24, "#072133", FONT.bold);

const guide = frame(root, "GUIDE/source controls and layer map", 22, 1780, 1036, 118, [rgb("#07111d", 0.82)], false);
text(guide, "source notes", "Runtime sources: game/index.jsx seat overlay, Level.js Phaser HUD/table/pot/cards, GameActionOverlay.jsx utility/console. Locked layers mirror production; ADJUST layers are the intended edit surface.", 22, 16, 992, 46, 18, "#d6e9f5", FONT.body, "LEFT");
text(guide, "layout controls", "Dev defaults: uiScale 1.5, tableOffsetY -200, tableScale 1, playfieldOffsetY -180. Seat x/y percentages come from profileLayoutControls.json.", 22, 68, 992, 28, 16, "#89d5ff", FONT.body, "LEFT");

figma.viewport.scrollAndZoomIntoView([root]);
return {
  success: true,
  file: figma.fileKey,
  createdNodeIds: [root.id],
  notes: [
    "Template created from repo-derived positions.",
    "Populate ASSET_HASHES after uploading PNGs to replace fallback fills with exact image assets.",
    "LOCKED groups are locked; ADJUST groups are editable positioning layers."
  ],
};
