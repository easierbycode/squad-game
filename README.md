# squad-game
-=:{ 👨🏽‍💻 👾💾🖳     🔑🐱‍💻     🖥️🖱️👾 👩🏽‍💻 }:=-

## shmupX port

`tools/shmupx/port.ts` turns this game into a [shmupX](https://codemonkey.games)
level: the roster, stats and wave order of `scenes/StarScene.js` as the level
editor's `game.json`, with an atlas holding only the frames that record names.

```
deno task shmupx:port    # writes shmupx/
deno task shmupx:push    # ...and publishes it to the cloud as levels/gs
```

- `shmupx/assets/` — `game.json`, `game_asset.json`, `img/game_asset.png`: what
  the editor's IMPORT › WEB › LOAD DIRECTORY reads (pick the `shmupx/` folder).
- `shmupx/gs.record.json` — the Realtime Database record for `levels/gs`, the
  same data with the atlas inlined. Published, it plays at
  <https://codemonkey.games/games/2028-ai?level=gs> and at
  <https://gs.codemonkey.games/> (the level subdomain goes straight to the game,
  never the editor, once `*.codemonkey.games` is a domain on the Deploy app).

The port is one stage ending on the geek-star. The PS5 controllers and the
headphone invader, which the original launches after the geek-star falls, come
in as its last wave instead; the geek-star's hp is 240 rather than 15 because
the runtime takes every hit where the original ignored hits during its
animations. Particles, explosions, sounds and the meteor-smash takeover do not
travel — the runtime has its own.
