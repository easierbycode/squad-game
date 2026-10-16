// tools/shmupx/port.ts — SQUAD Game as a shmupX level.
//
// Reads this repo's art (assets/images, assets/spritesheets) and the roster,
// stats and wave order of scenes/StarScene.js, and writes what the shmupX
// level editor's IMPORT › WEB › LOAD DIRECTORY reads and what its game page
// (codemonkey.games/games/2028-ai?level=<name>) plays out of the cloud:
//
//   shmupx/assets/game.json            the level record (validated against
//                                      @shmupx/shmup-engine's game schema)
//   shmupx/assets/game_asset.json      the atlas frame map (TexturePacker hash)
//   shmupx/assets/img/game_asset.png   the atlas: only the frames the record
//                                      names, nothing else from this repo
//   shmupx/<name>.record.json          the RTDB record for levels/<name>:
//                                      the same data plus the atlas inlined
//                                      as atlasFrames + atlasImageDataURL
//
//   deno run -A tools/shmupx/port.ts              # write shmupx/
//   deno run -A tools/shmupx/port.ts --push       # ...and PUT levels/<name>
//   deno run -A tools/shmupx/port.ts --name gs    # the level name (default gs)
//   deno run -A tools/shmupx/port.ts --db <url>   # another Realtime Database
//
// The runtime draws a 256x480 playfield in native pixels (no per-sprite scale),
// so a few frames are resampled here to sit in it the way the originals sat in
// squad-game's 360x800: the invader and the car at half size, the controller at
// double (it was setScale(3) in the original). Everything else ships 1:1.
//
// What does not travel: the particle textures (blue/red/star, the letter
// confetti the geek-star bursts into), the explosion sheet, the sounds and the
// meteor-smash takeover — the shmupX runtime has its own explosions, items,
// starfield and SFX, and a level record carries only the fields below.

import { Buffer } from "node:buffer";
import { PNG } from "npm:pngjs@7.0.0";
import { packShelf } from "jsr:@shmupx/shmup-engine@^0.3.0/atlas-pack";
import { validateGameJson } from "jsr:@shmupx/shmup-engine@^0.3.0/game-schema";
import { parseArgs } from "jsr:@std/cli@^1.0.0/parse-args";
import { encodeBase64 } from "jsr:@std/encoding@^1.0.0/base64";
import { ensureDir } from "jsr:@std/fs@^1.0.0";
import { dirname, fromFileUrl, join, resolve } from "jsr:@std/path@^1.0.0";

const ROOT = resolve(dirname(fromFileUrl(import.meta.url)), "..", "..");
const DEFAULT_DB = "https://evil-invaders-default-rtdb.firebaseio.com";
const LEVELS_PATH = "levels";
const GRID_COLS = 8;

// ---------------------------------------------------------------------------
// Rasters
// ---------------------------------------------------------------------------

interface Raster {
  width: number;
  height: number;
  data: Uint8Array; // RGBA, row-major
}

function newRaster(width: number, height: number): Raster {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

async function readPng(path: string): Promise<Raster> {
  const png = PNG.sync.read(Buffer.from(await Deno.readFile(path)));
  return { width: png.width, height: png.height, data: new Uint8Array(png.data) };
}

function encodePng(raster: Raster): Uint8Array {
  const png = new PNG({ width: raster.width, height: raster.height });
  png.data = Buffer.from(raster.data);
  return new Uint8Array(PNG.sync.write(png));
}

function cut(src: Raster, x0: number, y0: number, w: number, h: number): Raster {
  const out = newRaster(w, h);
  for (let y = 0; y < h; y++) {
    const s = ((y0 + y) * src.width + x0) * 4;
    out.data.set(src.data.subarray(s, s + w * 4), y * w * 4);
  }
  return out;
}

function blit(dst: Raster, src: Raster, x0: number, y0: number): void {
  for (let y = 0; y < src.height; y++) {
    dst.data.set(
      src.data.subarray(y * src.width * 4, (y + 1) * src.width * 4),
      ((y0 + y) * dst.width + x0) * 4,
    );
  }
}

// Box filter, alpha-weighted, by an integer factor: smooth art (the Geek Squad
// logo, the car photo) averages cleanly and chunky pixel art keeps its edges
// where its blocks are wider than the factor.
function downscale(src: Raster, k: number): Raster {
  const w = Math.floor(src.width / k);
  const h = Math.floor(src.height / k);
  const out = newRaster(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < k; dy++) {
        for (let dx = 0; dx < k; dx++) {
          const s = ((y * k + dy) * src.width + (x * k + dx)) * 4;
          const sa = src.data[s + 3];
          r += src.data[s] * sa;
          g += src.data[s + 1] * sa;
          b += src.data[s + 2] * sa;
          a += sa;
        }
      }
      const d = (y * w + x) * 4;
      if (a > 0) {
        out.data[d] = Math.round(r / a);
        out.data[d + 1] = Math.round(g / a);
        out.data[d + 2] = Math.round(b / a);
        out.data[d + 3] = Math.round(a / (k * k));
      }
    }
  }
  return out;
}

// Nearest neighbour, by an integer factor — pixel art stays pixel art.
function upscale(src: Raster, k: number): Raster {
  const out = newRaster(src.width * k, src.height * k);
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const s = (Math.floor(y / k) * src.width + Math.floor(x / k)) * 4;
      out.data.set(src.data.subarray(s, s + 4), (y * out.width + x) * 4);
    }
  }
  return out;
}

function scaled(src: Raster, scale: number): Raster {
  if (scale === 1) return src;
  if (scale > 1) return upscale(src, scale);
  return downscale(src, Math.round(1 / scale));
}

// A quarter turn clockwise: art drawn pointing up comes out pointing right.
function rotateCw(src: Raster): Raster {
  const out = newRaster(src.height, src.width);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const s = (y * src.width + x) * 4;
      const d = (x * out.width + (src.height - 1 - y)) * 4;
      out.data.set(src.data.subarray(s, s + 4), d);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The frames: every atlas entry the record below names, and nothing else.
// Names carry no "." so they are Firebase keys as they are (level-loader.js
// encodes a dot as U+2024; an extensionless name needs no encoding).
// ---------------------------------------------------------------------------

interface FrameSpec {
  name: string;
  file: string; // relative to the repo
  index?: number; // frame index on a single-row spritesheet
  fw?: number; // spritesheet frame width
  fh?: number; // spritesheet frame height
  scale?: number; // 1 (default), 2, or 1/2
  rotate?: "cw"; // a quarter turn clockwise, after scaling
}

const IMG = "assets/images";
const SHEET = "assets/spritesheets";

function sheet(
  file: string,
  fw: number,
  fh: number,
  base: string,
  indices: number[],
  scale = 1,
): FrameSpec[] {
  return indices.map((index) => ({ name: `${base}${index}`, file, index, fw, fh, scale }));
}

const FRAMES: FrameSpec[] = [
  // the player: Player.js flies 'bby-ship', loaded off tag.png
  { name: "bby-ship", file: `${IMG}/tag.png` },
  // Beam.js: the 6x22 'beam' animation off sperm.png, drawn pointing up. The
  // runtime's own shot art points RIGHT and it turns every player bullet
  // -90° at spawn (shootBullets: setRotation(-PI/2)), so an up-pointing
  // frame would fly facing left; a quarter turn here has it come out facing up.
  ...sheet(`${SHEET}/sperm.png`, 6, 22, "beam", [0, 1]).map((f) => ({ ...f, rotate: "cw" as const })),
  // the ship's blue thruster glow, doubling as its shield
  { name: "barrier0", file: `${IMG}/blue.png`, scale: 1 / 2 },
  // CyberOctopus: frames 0..2 idle (3..5 are the hit flash)
  ...sheet(`${SHEET}/cyber-octopus.png`, 29, 29, "cyber-octopus", [0, 1, 2]),
  // GeekCar: the 131x51 car, half size for the 256px playfield
  { name: "geek-car", file: `${IMG}/geek-car.png`, scale: 1 / 2 },
  // Laptop: frames 0..1 idle (2..3 are the hit flash)
  ...sheet(`${SHEET}/laptop.png`, 74, 58, "laptop", [0, 1]),
  // WrongPassword: frames 2..11 are the typing loop (0..1 the hit flash)
  ...sheet(`${SHEET}/wrong-password.png`, 30, 22, "wrong-password", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  // PS5Controller: frame 0 idle (1 is the hit flash); the original drew it at setScale(3)
  ...sheet(`${SHEET}/ps5-controller.png`, 22, 13, "ps5-controller", [0], 2),
  // PS5Bullet: one of its four two-frame colour cycles
  ...sheet(`${SHEET}/ps5-bullet.png`, 32, 32, "ps5-bullet", [0, 1]),
  // HeadphoneInvader: frames 0..1 idle (2..5 the hit flash), 191x142 at half size
  ...sheet(`${SHEET}/headphone-invader.png`, 191, 142, "headphone-invader", [0, 1], 1 / 2),
  // GeekStar: 0..1 idle, and 5,4,3 are the shoot wind-up (gs-logo.png)
  ...sheet(`${SHEET}/gs-logo.png`, 170, 105, "geekstar", [0, 1, 3, 4, 5]),
  // GeekBullet
  { name: "geek-bullet", file: `${IMG}/geek-bullet.png` },
];

// ---------------------------------------------------------------------------
// The record. Stats are StarScene.js's and the sprite classes', in the
// runtime's units: `speed` is px per frame down the 480px playfield (the
// originals' px/s over an 800px one, so ~0.6 of the original per frame),
// `interval` frames between shots (-1 / null bulletData: never shoots), and
// `hp` one point per shot — the beam fires every 100ms here as it did there.
// ---------------------------------------------------------------------------

const BEAM = ["beam0", "beam1"];

const playerData = {
  name: "squad",
  maxHp: 3,
  spDamage: 50,
  speed: 150,
  defaultShootName: "normal",
  defaultShootSpeed: "speed_normal",
  texture: ["bby-ship"],
  // Player.shoot(): nextShotAt = now + 100ms → 6 frames
  shootNormal: { name: "normal", damage: 1, hp: 1, interval: 6, texture: BEAM },
  shootBig: { name: "big", damage: 2, hp: 100, interval: 10, texture: BEAM },
  shoot3way: { name: "3way", damage: 1, hp: 1, interval: 8, texture: BEAM },
  barrier: { time: 4, texture: ["barrier0"] },
};

// Letters are chosen for the runtime's built-in habits: enemyA drifts toward
// the player low on the screen (the octopus grid closing in), and enemyB
// enters from a side edge and slides across (the geek car's crossing).
const enemyData = {
  enemyA: {
    name: "cyber-octopus",
    score: 100,
    spgage: 4,
    hp: 3, // cyber-octopus.js
    speed: 1.0, // setVelocity(0, 100)
    interval: -1,
    texture: ["cyber-octopus0", "cyber-octopus1", "cyber-octopus2"],
    shadowReverse: true,
    shadowOffsetY: 10,
    bulletData: null,
  },
  enemyB: {
    name: "geek-car",
    score: 500,
    spgage: 10,
    hp: 10, // geek-car.js
    speed: 0.6,
    interval: -1,
    texture: ["geek-car"],
    shadowReverse: true,
    shadowOffsetY: 8,
    bulletData: null,
  },
  enemyC: {
    name: "laptop",
    score: 200,
    spgage: 6,
    hp: 4, // laptop.js
    speed: 1.0, // setVelocity(150, 100)
    interval: -1,
    texture: ["laptop0", "laptop1"],
    shadowReverse: true,
    shadowOffsetY: 10,
    bulletData: null,
  },
  enemyD: {
    name: "wrong-password",
    score: 200,
    spgage: 6,
    hp: 4, // wrong-password.js
    speed: 0.5, // setVelocity(100, 50)
    interval: -1,
    texture: [
      "wrong-password2",
      "wrong-password3",
      "wrong-password4",
      "wrong-password5",
      "wrong-password6",
      "wrong-password7",
      "wrong-password8",
      "wrong-password9",
      "wrong-password10",
      "wrong-password11",
    ],
    shadowReverse: true,
    shadowOffsetY: 10,
    bulletData: null,
  },
  enemyE: {
    name: "ps5-controller",
    score: 800,
    spgage: 10,
    hp: 20, // ps5-controller.js
    speed: 0.5,
    interval: 120, // enemyTimer delay 2000ms
    texture: ["ps5-controller0"],
    shadowReverse: true,
    shadowOffsetY: 10,
    bulletData: {
      name: "ps5-bullet",
      score: 100,
      spgage: 2,
      hp: 1,
      speed: 4, // velocityFromAngle(…, 850) — fast; capped for a 480px field
      damage: 1,
      texture: ["ps5-bullet0", "ps5-bullet1"],
    },
  },
  enemyF: {
    name: "headphone-invader",
    score: 1500,
    spgage: 20,
    hp: 20, // headphone-invader.js
    speed: 0.4,
    interval: -1,
    texture: ["headphone-invader0", "headphone-invader1"],
    shadowReverse: true,
    shadowOffsetY: 14,
    bulletData: null,
  },
};

const bossData = {
  boss0: {
    name: "geekstar",
    score: 5000,
    spgage: 30,
    // geek-star.js gives it 15 but ignores every hit that lands during its
    // half-second hit and shoot animations, so it took 8+ seconds of fire;
    // the runtime takes every hit (ten a second from the beam) and its boss
    // routine parks on the player's column, so the fight is spelled out in
    // hp: 240 is about 25 seconds of sustained fire, in line with 2028.Ai's
    // own first boss at its slower shot rate.
    hp: 240,
    interval: 100,
    shadowReverse: true,
    shadowOffsetY: 20,
    anim: {
      idle: ["geekstar0", "geekstar1"], // 'geekstar'
      shoot: ["geekstar0", "geekstar5", "geekstar4", "geekstar3"], // 'geekstar-shoot'
      attack: ["geekstar5", "geekstar4"], // 'geekstar-hit'
      warp: ["geekstar3"],
    },
    bulletData: {
      name: "geek-bullet",
      score: 100,
      spgage: 2,
      hp: 1,
      speed: 2.5, // GeekBullet: velocity.y = 250
      damage: 1,
      texture: ["geek-bullet"],
    },
  },
};

// StarScene.create() in spawn order, one row per ~1.3s (the runtime's default
// 80-frame wave interval); the JSON lists them last-first because the runtime
// reverses the rows at load. The cell's digit is its item drop: the geek car
// frees Rudy on death in the original, here a barrier (9).
const EMPTY = Array(GRID_COLS).fill("00");
const SPAWN_ORDER: string[][] = [
  // five CyberOctopus at x = 60 + i*50, staggered -50 / -98
  ["00", "00", "A0", "00", "A0", "00", "00", "00"],
  ["00", "A0", "00", "A0", "00", "A0", "00", "00"],
  EMPTY,
  // three Laptops at x = 26, 100, 174
  ["C0", "00", "00", "00", "C0", "00", "00", "00"],
  ["00", "00", "C0", "00", "00", "00", "00", "00"],
  EMPTY,
  // three WrongPasswords at x = 26, 100, 174
  ["D0", "00", "00", "00", "D0", "00", "00", "00"],
  ["00", "00", "D0", "00", "00", "00", "00", "00"],
  EMPTY,
  // the GeekCar, in from the left
  ["B9", "00", "00", "00", "00", "00", "00", "00"],
  EMPTY,
  EMPTY,
  // the wave the original launches after the geek-star falls: the
  // HeadphoneInvader at centre and two PS5Controllers at x = 43 and 317. A
  // level ends on its boss, so here they come before it.
  ["00", "00", "00", "F0", "00", "00", "00", "00"],
  ["00", "E0", "00", "00", "00", "00", "00", "E0"],
  EMPTY,
  EMPTY,
  // ...then boss0, the GeekStar
];
const enemylist = SPAWN_ORDER.slice().reverse();

const meta = {
  version: "1.0",
  source: "squad-game",
  origin: "https://github.com/easierbycode/squad-game",
};

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

interface AtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

async function loadFrames(): Promise<Map<string, Raster>> {
  const files = new Map<string, Raster>();
  const out = new Map<string, Raster>();
  for (const spec of FRAMES) {
    if (out.has(spec.name)) throw new Error(`frame "${spec.name}" is listed twice`);
    let src = files.get(spec.file);
    if (!src) {
      src = await readPng(join(ROOT, spec.file));
      files.set(spec.file, src);
    }
    let raster = src;
    if (spec.index !== undefined) {
      const fw = spec.fw!, fh = spec.fh!;
      const perRow = Math.floor(src.width / fw);
      const col = spec.index % perRow;
      const row = Math.floor(spec.index / perRow);
      if ((row + 1) * fh > src.height) {
        throw new Error(`${spec.file}: frame ${spec.index} is past the sheet's ${src.width}x${src.height}`);
      }
      raster = cut(src, col * fw, row * fh, fw, fh);
    }
    raster = scaled(raster, spec.scale ?? 1);
    if (spec.rotate === "cw") raster = rotateCw(raster);
    out.set(spec.name, raster);
  }
  return out;
}

function packAtlas(frames: Map<string, Raster>): { png: Raster; frames: Record<string, AtlasFrame> } {
  const PAD = 4;
  const items = [...frames].map(([key, r]) => ({ key, w: r.width, h: r.height }));
  const packed = packShelf(items, { maxWidth: 2048, pad: PAD });
  // packShelf answers the full 2048 width; the sheet only needs what it used.
  let usedW = 0;
  for (const key of Object.keys(packed.frames)) {
    const f = packed.frames[key].frame;
    usedW = Math.max(usedW, f.x + f.w + PAD);
  }
  const png = newRaster(usedW, packed.height);
  for (const [key, r] of frames) {
    const p = packed.placements[key];
    blit(png, r, p.x, p.y);
  }
  return { png, frames: packed.frames as Record<string, AtlasFrame> };
}

function texturesNamed(game: Record<string, unknown>): string[] {
  const names: string[] = [];
  const walk = (v: unknown, key: string) => {
    if (Array.isArray(v)) {
      if (key === "texture" || key === "idle" || key === "shoot" || key === "attack" || key === "warp") {
        for (const t of v) if (typeof t === "string") names.push(t);
      } else {
        v.forEach((x) => walk(x, key));
      }
    } else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) walk(x, k);
    }
  };
  walk(game, "");
  return names;
}

// Mirrors the editor's mintGameId (slug + 8 hex), but derived from the name so
// the file on disk is the same on every run. A record already in the cloud
// keeps the id it has — a leaderboard must survive every re-publish.
async function mintGameId(name: string): Promise<string> {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "level";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`squad-game:${name}`));
  const hex = [...new Uint8Array(digest).slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${slug}-${hex}`;
}

// level-loader.js's encodeFirebaseKey: RTDB keys cannot hold a ".".
function encodeFirebaseKey(key: string): string {
  return key.replace(/\./g, "․");
}

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["push", "help"],
    string: ["name", "out", "db"],
    default: { name: "gs", out: "shmupx", db: Deno.env.get("SHMUPX_DB") ?? DEFAULT_DB },
  });
  if (args.help) {
    console.log("deno run -A tools/shmupx/port.ts [--name gs] [--out shmupx] [--db <rtdb url>] [--push]");
    return;
  }
  const name = String(args.name);
  if (!/^[\w-]+$/.test(name)) throw new Error(`--name must be letters, digits, _ or - (got ${JSON.stringify(name)})`);
  const outDir = resolve(ROOT, String(args.out));
  const db = String(args.db).replace(/\/$/, "");

  // 1. the atlas
  const rasters = await loadFrames();
  const atlas = packAtlas(rasters);
  const pngBytes = encodePng(atlas.png);

  // 2. the record
  const game = {
    stage0: { enemylist },
    playerData,
    enemyData,
    bossData,
    meta,
  };
  const verdict = validateGameJson(game);
  for (const w of verdict.warnings) console.warn(`schema: ${w}`);
  if (!verdict.ok) throw new Error(`game.json is not valid:\n  ${verdict.errors.join("\n  ")}`);
  const missing = texturesNamed(game).filter((t) => !atlas.frames[t]);
  if (missing.length) throw new Error(`textures named but not in the atlas: ${[...new Set(missing)].join(", ")}`);

  // 3. the files the editor's LOAD DIRECTORY reads (assets/game.json beside
  //    assets/game_asset.json and assets/img/game_asset.png, as 2028-ai lays
  //    them out)
  const assetsDir = join(outDir, "assets");
  await ensureDir(join(assetsDir, "img"));
  await Deno.writeTextFile(join(assetsDir, "game.json"), JSON.stringify(game, null, 2) + "\n");
  await Deno.writeTextFile(
    join(assetsDir, "game_asset.json"),
    JSON.stringify({
      frames: atlas.frames,
      meta: {
        app: "squad-game tools/shmupx/port.ts",
        format: "RGBA8888",
        image: "img/game_asset.png",
        scale: "1",
        size: { w: atlas.png.width, h: atlas.png.height },
        version: "1.0",
      },
    }, null, 2) + "\n",
  );
  await Deno.writeFile(join(assetsDir, "img", "game_asset.png"), pngBytes);

  // 4. the cloud record: what the editor's SAVE writes to levels/<name>, so
  //    the game page, the editor's LOAD GAME (CLOUD) and <name>.codemonkey.games
  //    all read it as one of their own
  const atlasFrames: Record<string, AtlasFrame> = {};
  for (const [k, v] of Object.entries(atlas.frames)) atlasFrames[encodeFirebaseKey(k)] = v;

  // The title's portrait. 2028.Ai's title slides in game_ui's titleG.gif — G,
  // its pilot, a 256x364 plate that rests at (5, 20) — and a game's own
  // `uiAtlases.game_ui` frame of that name takes its place. Ours is the
  // geek-star (the Geek Squad logo, frame 0) on a plate the same size, set
  // where G's face sits: under the name logo (y 75) and subtitle (y 130) the
  // runtime draws for a game with no title art of its own, above TAP OR
  // CLICK START (y 330). The logo and subtitle stay the runtime's: a custom
  // one here would switch those defaults off.
  const TITLE_G = { w: 256, h: 364, cx: 123, cy: 230 };
  const star = rasters.get("geekstar0")!;
  const plate = newRaster(TITLE_G.w, TITLE_G.h);
  blit(plate, star, Math.round(TITLE_G.cx - star.width / 2), Math.round(TITLE_G.cy - star.height / 2));
  const platePng = encodePng(plate);
  await ensureDir(join(outDir, "title"));
  await Deno.writeFile(join(outDir, "title", "titleG.png"), platePng);
  const uiAtlases = {
    game_ui: {
      imageDataURL: `data:image/png;base64,${encodeBase64(platePng)}`,
      frames: {
        [encodeFirebaseKey("titleG.gif")]: {
          frame: { x: 0, y: 0, w: TITLE_G.w, h: TITLE_G.h },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: TITLE_G.w, h: TITLE_G.h },
          sourceSize: { w: TITLE_G.w, h: TITLE_G.h },
        } satisfies AtlasFrame,
      },
    },
  };
  let gameId = await mintGameId(name);
  if (args.push) {
    try {
      const res = await fetch(`${db}/${LEVELS_PATH}/${name}/gameId.json`, { signal: AbortSignal.timeout(15_000) });
      const existing = res.ok ? await res.json() : null;
      if (typeof existing === "string" && existing.trim()) gameId = existing;
    } catch (err) {
      console.warn(`could not read an existing gameId (${(err as Error).message}); using ${gameId}`);
    }
  }
  const record = {
    name,
    gameId,
    stageKey: "stage0",
    width: GRID_COLS,
    enemylist,
    stages: { stage0: { enemylist } },
    playerData,
    enemyData,
    bossData,
    meta,
    noStory: true,
    godMode: false,
    atlasFrames,
    atlasImageDataURL: `data:image/png;base64,${encodeBase64(pngBytes)}`,
    uiAtlases,
    savedAt: { ".sv": "timestamp" },
  };
  const recordPath = join(outDir, `${name}.record.json`);
  await Deno.writeTextFile(recordPath, JSON.stringify(record) + "\n");

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`atlas: ${Object.keys(atlas.frames).length} frames, ${atlas.png.width}x${atlas.png.height}, ${kb(pngBytes.length)}`);
  console.log(`wrote ${join(args.out as string, "assets")}/{game.json, game_asset.json, img/game_asset.png}`);
  console.log(`wrote ${recordPath} (${kb((await Deno.stat(recordPath)).size)})`);

  // 5. publish
  if (args.push) {
    const url = `${db}/${LEVELS_PATH}/${name}.json`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: HTTP ${res.status} ${await res.text()}`);
    const back = await fetch(`${url}?shallow=true`, { signal: AbortSignal.timeout(15_000) });
    const keys = Object.keys(await back.json() ?? {}).sort();
    console.log(`published ${LEVELS_PATH}/${name} (${keys.length} keys: ${keys.join(", ")})`);
    console.log(`play: https://codemonkey.games/games/2028-ai?level=${encodeURIComponent(name)}`);
    console.log(`      https://${name}.codemonkey.games/  (once the wildcard domain is on the Deploy app)`);
  }
}

if (import.meta.main) {
  await main();
}
