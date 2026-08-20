import Phaser from "phaser";

import { findDialogue } from "@/data/dialogues";
import type { WorldObject } from "@/types";

import { GAME_EVENT } from "../events";
import {
  buildWalkableGrid,
  findPath,
  nearestWalkable,
  type TilePoint,
} from "../maps/pathfinding";
import { parseMapArt, SPAWN_TILE } from "../maps/villageMap";
import { VILLAGE_OBJECTS } from "../maps/villageObjects";
import { Butterflies } from "../objects/Butterflies";
import { GuideCat } from "../objects/GuideCat";
import {
  FINGER_KEY,
  FRAME_KEY,
  PERSON_HEIGHT,
  PERSON_POSES,
  PERSON_WIDTH,
  personFrame,
  type PersonPose,
  PLAYER_KEY,
  SIGNPOST_KEY,
  TILESET_KEY,
  VENUE_KEY,
  VILLAGER_KEY,
} from "../textures/placeholderTextures";
import { SOLID_TILES, TILE, TILE_SIZE } from "../tiles";

/**
 * 카메라 확대 배율.
 *
 * 3이면 화면에 가로 7.5칸 · 세로 13.3칸이 들어온다.
 * 캐릭터가 크게 보이는 대신 시야가 좁아진다.
 *
 * 정수 배율이어야 픽셀이 뭉개지지 않는다. 2.5 같은 값은 쓰지 않는다.
 *
 * 이 값은 그림 작업 전에 확정해야 한다. 배율이 바뀌면 타일 크기 판단이
 * 달라지고, 그러면 이미 그린 그림을 버려야 한다.
 */
const CAMERA_ZOOM = 3;

/** 걷는 속도 (초당 픽셀). 타일 한 칸이 16px이므로 초당 약 5.3칸. */
const WALK_SPEED = 85;

/** 이 거리 안에 들어오면 상호작용할 수 있다. 타일 약 1.5칸. */
const INTERACT_RANGE = 24;

/** 길찾기로 이동할 때, 다음 지점에 이만큼 가까워지면 도착으로 친다. */
const WAYPOINT_REACHED = 3;

/** 이 시간 동안 앞으로 나아가지 못하면 자동 이동을 포기한다. (밀리초) */
const STUCK_TIMEOUT = 1500;

/** 마을에 풀어놓을 나비 수 */
const BUTTERFLY_COUNT = 7;

/**
 * 상호작용할 수 있는 것들은 가만히 있지 않는다.
 *
 * "움직이는 것은 만질 수 있다"는 설명이 필요 없는 신호다.
 * 가만히 서 있는 나무·울타리와 저절로 구분되므로,
 * 어르신도 무엇을 눌러야 할지 배우지 않고 알 수 있다.
 */
const IDLE_BOB_PIXELS = 1;
const IDLE_BOB_PERIOD = 1400;

/** 주민이 폴짝 뛰는 주기와 높이 */
const HOP_PERIOD = 2600;
const HOP_PIXELS = 2;

/** 인사말이 저절로 뜨는 거리. 상호작용 거리보다 조금 넓게 잡아 먼저 반응한다. */
const GREETING_RANGE = 40;

/** 처음 입장했을 때 손가락 안내가 나오기까지 (밀리초) */
const HINT_DELAY = 900;

/** 손가락 안내로 걸어갈 거리 (타일) */
const HINT_TILES_AHEAD = 3;

/** 오브젝트와 그 오브젝트를 나타내는 스프라이트를 함께 들고 다닌다. */
type Interactable = {
  data: WorldObject;
  sprite: Phaser.Physics.Arcade.Sprite;
  /** 살아 움직이게 하기 위한 기준 y값. 여기서 위아래로 흔든다. */
  baseY: number;
  /** 오브젝트마다 흔들리는 박자를 어긋나게 한다 */
  phase: number;
};

/** 어딘가로 자동으로 걸어가는 중인 상태 */
type AutoWalk = {
  /** 오브젝트를 향해 가는 중이면 그 오브젝트. 빈 땅으로 가는 중이면 null. */
  target: Interactable | null;
  /** 아직 지나가야 할 지점들 (픽셀 좌표) */
  waypoints: Phaser.Math.Vector2[];
  /** 마지막으로 눈에 띄게 움직인 시각과 그때의 위치 */
  lastProgressAt: number;
  lastX: number;
  lastY: number;
};

/**
 * 실제로 돌아다니는 공간.
 *
 * 맵 → 플레이어 → 오브젝트 → 조작 → 카메라 순서로 만든다.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private interactKeys!: Phaser.Input.Keyboard.Key[];

  private interactables: Interactable[] = [];
  private nearest: Interactable | null = null;
  private prompt!: Phaser.GameObjects.Text;

  /** 주민 곁에 다가가면 저절로 뜨는 인사말 */
  private greeting!: Phaser.GameObjects.Text;

  /** 예식장 창문에 깜빡이는 불빛 */
  private venueLight: Phaser.GameObjects.Rectangle | null = null;

  /** 조작 안내를 이미 보여줬는지. 처음 한 번만 나온다. */
  private hintShown = false;

  /** 지금 바라보는 방향. 멈춰도 마지막 방향을 유지한다. */
  private facing: PersonPose = "down";

  /** 걸을 수 있는 칸 표. 길찾기에 쓴다. */
  private walkable: boolean[][] = [];
  private autoWalk: AutoWalk | null = null;

  private guideCat!: GuideCat;
  private butterflies!: Butterflies;

  /** 이미 열어본 오브젝트의 id. 고양이는 아직 안 본 곳으로 안내한다. */
  private visited = new Set<string>();


  constructor() {
    super("WorldScene");
  }

  create() {
    const { map, layer, tiles } = this.createMap();

    this.walkable = buildWalkableGrid(tiles);

    this.createPlayer();
    this.physics.add.collider(this.player, layer);

    this.createInteractables();
    this.createPrompt();
    this.createControls();
    this.createCamera(map);
    this.createCompanions(tiles);
  }

  // ────────────────────────────────────────────────────────────
  // 고양이와 나비
  // ────────────────────────────────────────────────────────────

  private createCompanions(tiles: number[][]) {
    this.guideCat = new GuideCat(this, this.player.x - TILE_SIZE, this.player.y + 8);

    // 나비는 꽃밭 위를 오간다.
    const flowerSpots: Phaser.Math.Vector2[] = [];

    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile !== TILE.FLOWER) return;

        const center = tileToPixelCenter(x, y);
        flowerSpots.push(new Phaser.Math.Vector2(center.x, center.y));
      });
    });

    this.butterflies = new Butterflies(this, flowerSpots, BUTTERFLY_COUNT);
  }

  private updateCompanions(time: number, delta: number) {
    const body = this.player.body;
    const isMoving = body ? body.velocity.x !== 0 || body.velocity.y !== 0 : false;

    this.guideCat.update(
      time,
      delta,
      this.player,
      isMoving,
      this.nextUnvisitedTile(),
      this.walkable,
    );

    this.butterflies.update(time, delta);
  }

  /**
   * 아직 열어보지 않은 것 중 가장 가까운 곳의 타일 좌표.
   *
   * 전부 봤으면 null. 그러면 고양이는 안내하지 않고 따라만 다닌다.
   */
  private nextUnvisitedTile(): TilePoint | null {
    let closest: WorldObject | null = null;
    let closestDistance = Infinity;

    for (const { data, sprite } of this.interactables) {
      if (this.visited.has(data.id)) continue;

      const distance = this.distanceTo(sprite);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = data;
      }
    }

    return closest ? { x: closest.tileX, y: closest.tileY } : null;
  }

  /**
   * 빈 땅을 눌렀을 때 그 지점으로 걸어간다.
   *
   * 오브젝트를 눌렀을 때는 각 스프라이트의 핸들러가 먼저 처리하므로
   * 여기서는 아무것도 눌리지 않은 경우만 다룬다.
   */
  private handleGroundTap(pointer: Phaser.Input.Pointer) {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tapped = pixelToTile(world.x, world.y);

    // 나무 가장자리를 살짝 빗나가게 눌러도 근처 갈 수 있는 칸으로 보정한다.
    const goal = nearestWalkable(this.walkable, tapped);

    if (!goal) return;

    this.walkTo(goal, null);
  }

  /** 누른 자리에 잠깐 나타났다 사라지는 표시 */
  private showTapMarker(x: number, y: number) {
    const marker = this.add.circle(x, y, 4, 0xf4b41b, 0.5).setDepth(9_999);

    this.tweens.add({
      targets: marker,
      scale: 2.5,
      alpha: 0,
      duration: 300,
      ease: "Quad.Out",
      onComplete: () => marker.destroy(),
    });
  }

  /** 목적지 칸까지 길을 찾아 자동 이동을 시작한다. */
  private walkTo(goal: TilePoint, target: Interactable | null) {
    const start = pixelToTile(this.player.x, this.player.y);
    const path = findPath(this.walkable, start, goal);

    if (!path || path.length === 0) return;

    const waypoints = path.map(({ x, y }) => {
      const center = tileToPixelCenter(x, y);
      return new Phaser.Math.Vector2(center.x, center.y);
    });

    const destination = waypoints[waypoints.length - 1];
    this.showTapMarker(destination.x, destination.y);

    this.autoWalk = {
      target,
      waypoints,
      lastProgressAt: this.time.now,
      lastX: this.player.x,
      lastY: this.player.y,
    };
  }

  update(time: number, delta: number) {
    if (!this.hintShown && time > HINT_DELAY) {
      this.showTapHint();
    }

    this.updateIdleMotion(time);
    this.updateNearest(time);
    this.handleInteractKey();
    this.movePlayer(time);
    this.updateCompanions(time, delta);
  }

  // ────────────────────────────────────────────────────────────
  // 맵
  // ────────────────────────────────────────────────────────────

  private createMap(): {
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayerBase;
    tiles: number[][];
  } {
    const tiles = parseMapArt();

    // 1. 숫자 배열로부터 타일맵 데이터를 만든다. 아직 화면에는 아무것도 없다.
    const map = this.make.tilemap({
      data: tiles,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    // 2. "타일 번호 → 그림의 어느 부분" 을 연결한다.
    const tileset = map.addTilesetImage("tiles", TILESET_KEY, TILE_SIZE, TILE_SIZE);

    if (!tileset) {
      throw new Error("타일셋을 만들지 못했습니다. 텍스처가 준비되지 않았습니다.");
    }

    // 3. 실제로 화면에 그려지는 레이어를 만든다.
    const layer = map.createLayer(0, tileset, 0, 0);

    if (!layer) {
      throw new Error("타일맵 레이어를 만들지 못했습니다.");
    }

    // 물 / 나무 / 울타리는 통과할 수 없게 한다.
    layer.setCollision(SOLID_TILES);

    // 물리 세계의 경계를 맵 크기와 맞춘다.
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { map, layer, tiles };
  }

  // ────────────────────────────────────────────────────────────
  // 플레이어
  // ────────────────────────────────────────────────────────────

  private createPlayer() {
    const { x, y } = tileToPixelCenter(SPAWN_TILE.x, SPAWN_TILE.y);

    this.player = this.physics.add.sprite(x, y, PLAYER_KEY, 0);
    this.player.setCollideWorldBounds(true);

    // 충돌 판정은 몸 전체가 아니라 발 근처만 쓴다.
    // 위에서 내려다보는 시점에서는 이래야 벽에 자연스럽게 붙는다.
    this.player.body?.setSize(8, 6);
    this.player.body?.setOffset((PERSON_WIDTH - 8) / 2, PERSON_HEIGHT - 6);

    // 아래쪽에 있는 것이 앞에 그려지도록 y값을 깊이로 쓴다.
    this.player.setDepth(this.player.y);

    // 방향마다 서 있기 / 걷기 두 벌씩 만든다.
    PERSON_POSES.forEach((pose) => {
      this.anims.create({
        key: idleKey(pose),
        frames: [{ key: PLAYER_KEY, frame: personFrame(pose, 0) }],
        frameRate: 1,
      });

      this.anims.create({
        key: walkKey(pose),
        frames: [
          { key: PLAYER_KEY, frame: personFrame(pose, 1) },
          { key: PLAYER_KEY, frame: personFrame(pose, 0) },
          { key: PLAYER_KEY, frame: personFrame(pose, 2) },
          { key: PLAYER_KEY, frame: personFrame(pose, 0) },
        ],
        frameRate: 8,
        repeat: -1,
      });
    });

    this.player.play(idleKey(this.facing));
  }

  // ────────────────────────────────────────────────────────────
  // 상호작용 오브젝트
  // ────────────────────────────────────────────────────────────

  private createInteractables() {
    const group = this.physics.add.staticGroup();

    this.interactables = VILLAGE_OBJECTS.map((data, index) => {
      const { x, y } = tileToPixelCenter(data.tileX, data.tileY);

      const sprite = group.create(
        x,
        y,
        textureKeyFor(data),
        frameFor(data),
      ) as Phaser.Physics.Arcade.Sprite;

      // 발밑만 막는다. 그래야 위쪽으로 지나갈 때 자연스럽다.
      const bodyWidth = data.kind === "venue" ? 24 : 10;
      sprite.body?.setSize(bodyWidth, 8);
      sprite.setDepth(sprite.y);

      // 오브젝트를 누르면 그쪽으로 걸어간다. (가까우면 바로 상호작용)
      sprite.setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", () => {
        this.approach({ data, sprite, baseY: y, phase: index });
      });

      if (data.kind === "venue") {
        this.createVenueLight(sprite);
      }

      return { data, sprite, baseY: y, phase: index };
    });

    this.physics.add.collider(this.player, group);

    // 아무 오브젝트도 눌리지 않았을 때만 땅을 누른 것으로 본다.
    // currentlyOver는 이번 터치가 닿은 오브젝트 목록이다.
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (currentlyOver.length > 0) return;

        this.handleGroundTap(pointer);
      },
    );
  }

  /**
   * 예식장 창문에 깜빡이는 불빛.
   *
   * 건물은 흔들면 어색해서, 대신 불이 들어왔다 나갔다 한다.
   */
  private createVenueLight(venue: Phaser.GameObjects.Sprite) {
    this.venueLight = this.add
      .rectangle(venue.x, venue.y - 3, 4, 6, 0xf7e08a, 0.9)
      .setDepth(venue.y + 1);
  }

  /**
   * 상호작용할 수 있는 것들을 살짝 움직인다.
   *
   * 액자는 천천히 까딱거리고, 주민은 가끔 폴짝 뛴다.
   * 표지판처럼 "읽고 해석해야 하는" 안내 없이도
   * 무엇을 만질 수 있는지 알 수 있게 하는 장치다.
   */
  private updateIdleMotion(time: number) {
    for (const item of this.interactables) {
      if (item.data.kind === "venue") continue;

      const offset =
        item.data.kind === "villager"
          ? hopOffset(time, item.phase)
          : Math.sin(time / IDLE_BOB_PERIOD + item.phase) * IDLE_BOB_PIXELS;

      item.sprite.y = item.baseY + offset;
    }

    if (this.venueLight) {
      // 1.8초 주기로 켜졌다 꺼진다.
      this.venueLight.setAlpha(time % 1800 < 1100 ? 0.9 : 0.15);
    }
  }

  /** 가장 가까운 오브젝트 위에 떠 있는 안내 표시 */
  private createPrompt() {
    this.prompt = this.add
      .text(0, 0, "▼", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#f4b41b",
        // 카메라가 3배로 늘리므로 글자 그림도 3배로 구워야 또렷하다.
        resolution: CAMERA_ZOOM,
      })
      .setOrigin(0.5, 1)
      .setDepth(10_000)
      .setVisible(false);

    // 위아래로 흔드는 것은 tween이 아니라 update()에서 직접 계산한다.
    // tween은 y값을 자기가 붙잡고 있어서, 매 프레임 위치를 옮기는 것과 충돌한다.

    // 주민 곁에서는 ▼ 대신 인사말이 저절로 뜬다.
    // 누르지 않았는데 반응이 온다는 경험이 "여기 뭔가 있다"를 알려준다.
    this.greeting = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#3d2f1e",
        backgroundColor: "#f2e6d0",
        padding: { x: 4, y: 3 },
        /*
          Phaser는 글자를 그림으로 한 번 구운 뒤 화면에 붙인다.
          9px로 구운 그림을 카메라가 3배로 늘리면, pixelArt 모드라
          픽셀을 그대로 키워서 한글이 뭉개진다.
          처음부터 3배 크기로 구우면 늘려도 1:1이라 또렷하다.
        */
        resolution: CAMERA_ZOOM,
      })
      .setOrigin(0.5, 1)
      .setDepth(10_000)
      .setVisible(false);
  }

  /**
   * 처음 입장했을 때 딱 한 번, 조작법을 글 대신 보여준다.
   *
   * 손가락이 앞쪽 길 위에 나타나 한 번 톡 누르고 사라지면
   * 캐릭터가 그리로 걸어간다. "화면을 눌러 이동하세요"를 읽는 것보다 빠르다.
   */
  private showTapHint() {
    if (this.hintShown) return;
    this.hintShown = true;

    const start = pixelToTile(this.player.x, this.player.y);
    const goal =
      nearestWalkable(this.walkable, { x: start.x, y: start.y - HINT_TILES_AHEAD }, 3) ??
      nearestWalkable(this.walkable, { x: start.x, y: start.y + HINT_TILES_AHEAD }, 3);

    if (!goal) return;

    const spot = tileToPixelCenter(goal.x, goal.y);

    const finger = this.add
      .sprite(spot.x + 5, spot.y + 8, FINGER_KEY)
      .setDepth(10_001)
      .setAlpha(0);

    this.tweens.chain({
      targets: finger,
      tweens: [
        { alpha: 1, duration: 220 },
        { y: finger.y + 3, duration: 130, yoyo: true },
        { alpha: 0, duration: 260, delay: 200 },
      ],
      onComplete: () => {
        finger.destroy();

        // 사용자가 그 사이에 직접 움직였다면 끼어들지 않는다.
        if (this.autoWalk) return;

        this.walkTo(goal, null);
      },
    });
  }

  private distanceTo(sprite: Phaser.GameObjects.Sprite) {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
  }

  /** 매 프레임 가장 가까운 오브젝트를 찾아 안내 표시를 옮긴다. */
  private updateNearest(time: number) {
    let closest: Interactable | null = null;
    let closestDistance = INTERACT_RANGE;

    for (const item of this.interactables) {
      const distance = this.distanceTo(item.sprite);

      if (distance <= closestDistance) {
        closest = item;
        closestDistance = distance;
      }
    }

    this.nearest = closest;

    this.updateGreeting();

    // 인사말이 떠 있으면 ▼는 감춘다. 둘이 겹치면 어지럽다.
    if (!closest || this.greeting.visible) {
      this.prompt.setVisible(false);
      return;
    }

    // 오브젝트 머리 위에 두고, 사인 곡선으로 위아래로 흔든다.
    const bob = Math.sin(time / 200) * 2;
    const baseY = closest.sprite.y - closest.sprite.displayHeight / 2 - 2;

    this.prompt.setPosition(closest.sprite.x, baseY + bob);
    this.prompt.setVisible(true);
  }

  /**
   * 가까이 있는 주민의 인사말을 띄운다.
   *
   * ▼보다 넓은 거리에서 먼저 반응한다. 누르지 않아도 말을 걸어오므로
   * "여기서 무언가 할 수 있다"를 알아내지 않아도 알게 된다.
   */
  private updateGreeting() {
    const villager = this.interactables.find(
      (item) =>
        item.data.kind === "villager" && this.distanceTo(item.sprite) <= GREETING_RANGE,
    );

    if (!villager) {
      this.greeting.setVisible(false);
      return;
    }

    const dialogue = findDialogue(villager.data.targetId);

    if (!dialogue) {
      this.greeting.setVisible(false);
      return;
    }

    this.greeting.setText(dialogue.greeting);
    this.greeting.setPosition(
      villager.sprite.x,
      villager.sprite.y - villager.sprite.displayHeight / 2 - 2,
    );
    this.greeting.setVisible(true);
  }

  private handleInteractKey() {
    const pressed = this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));

    if (pressed && this.nearest) {
      this.autoWalk = null;
      this.interactWith(this.nearest.data);
    }
  }

  /**
   * 오브젝트를 눌렀을 때.
   *
   * 이미 가까우면 바로 열고, 멀면 길을 찾아 걸어간다.
   */
  private approach(item: Interactable) {
    if (this.distanceTo(item.sprite) <= INTERACT_RANGE) {
      this.autoWalk = null;
      this.interactWith(item.data);
      return;
    }

    this.walkTo({ x: item.data.tileX, y: item.data.tileY }, item);
  }

  /**
   * 여기가 Phaser에서 React로 넘어가는 지점이다.
   *
   * Scene은 무엇을 보여줄지 모른다. "이것을 열어달라"고 알릴 뿐이다.
   * 화면을 어떻게 그릴지는 React가 정한다.
   */
  private interactWith(object: WorldObject) {
    // 창이 열려 있는 동안 캐릭터가 계속 걷지 않도록 멈춘다.
    this.player.setVelocity(0, 0);
    this.player.play(idleKey(this.facing));

    // 고양이가 같은 곳으로 계속 안내하지 않도록 본 것으로 표시한다.
    this.visited.add(object.id);

    if (object.kind === "venue") {
      this.game.events.emit(GAME_EVENT.OPEN_WEDDING);
      return;
    }

    const event = EVENT_BY_KIND[object.kind];

    this.game.events.emit(event, object.targetId);
  }

  // ────────────────────────────────────────────────────────────
  // 조작
  // ────────────────────────────────────────────────────────────

  private createControls() {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("키보드 입력을 사용할 수 없습니다.");
    }

    this.cursors = keyboard.createCursorKeys();

    // addKeys는 'W','A','S','D' 라는 이름으로 돌려주므로 방향 이름으로 바꿔 담는다.
    const keys = keyboard.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;

    this.wasd = {
      up: keys.W,
      left: keys.A,
      down: keys.S,
      right: keys.D,
    };

    this.interactKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    ];
  }

  /**
   * 매 프레임 플레이어의 속도를 정한다.
   *
   * 우선순위: 키보드 > 자동 이동
   * 키를 누르면 자동 이동은 즉시 취소된다. 직접 조작이 항상 이긴다.
   */
  private movePlayer(time: number) {
    const manual = this.readKeyboardDirection();

    if (manual) {
      this.autoWalk = null;
    }

    const velocity =
      manual ?? this.readAutoWalkDirection(time) ?? new Phaser.Math.Vector2(0, 0);

    this.player.setVelocity(velocity.x * WALK_SPEED, velocity.y * WALK_SPEED);
    this.player.setDepth(this.player.y);

    const isMoving = velocity.x !== 0 || velocity.y !== 0;

    if (isMoving) {
      this.facing = poseFor(velocity);

      // 왼쪽은 따로 그리지 않고 옆모습을 뒤집어 쓴다.
      this.player.setFlipX(this.facing === "side" && velocity.x < 0);
    }

    const wanted = isMoving ? walkKey(this.facing) : idleKey(this.facing);

    if (this.player.anims.currentAnim?.key !== wanted) {
      this.player.play(wanted);
    }
  }

  /** 키를 누르고 있지 않으면 null을 돌려준다. */
  private readKeyboardDirection(): Phaser.Math.Vector2 | null {
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) direction.x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) direction.x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) direction.y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) direction.y += 1;

    if (direction.x === 0 && direction.y === 0) {
      return null;
    }

    // 대각선으로 갈 때 √2배 빨라지는 것을 막는다.
    return direction.normalize();
  }

  /**
   * 찾아둔 길을 따라 다음 지점 쪽으로 향하는 방향을 돌려준다.
   *
   * 자동 이동 중이 아니면 null. 목적지에 닿으면 상호작용을 일으킨다.
   */
  private readAutoWalkDirection(time: number): Phaser.Math.Vector2 | null {
    const walk = this.autoWalk;

    if (!walk) return null;

    // 오브젝트를 향해 가는 중이고 충분히 가까워졌으면 멈추고 연다.
    if (walk.target && this.distanceTo(walk.target.sprite) <= INTERACT_RANGE) {
      const { data } = walk.target;
      this.autoWalk = null;
      this.interactWith(data);
      return new Phaser.Math.Vector2(0, 0);
    }

    // 벽 모서리에 끼어 제자리걸음을 하고 있으면 포기한다.
    const moved = Phaser.Math.Distance.Between(
      walk.lastX,
      walk.lastY,
      this.player.x,
      this.player.y,
    );

    if (moved > 1) {
      walk.lastProgressAt = time;
      walk.lastX = this.player.x;
      walk.lastY = this.player.y;
    } else if (time - walk.lastProgressAt > STUCK_TIMEOUT) {
      this.autoWalk = null;
      return new Phaser.Math.Vector2(0, 0);
    }

    // 이미 지나친 지점들은 버린다.
    while (
      walk.waypoints.length > 0 &&
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        walk.waypoints[0].x,
        walk.waypoints[0].y,
      ) <= WAYPOINT_REACHED
    ) {
      walk.waypoints.shift();
    }

    const next = walk.waypoints[0];

    if (!next) {
      this.autoWalk = null;
      return new Phaser.Math.Vector2(0, 0);
    }

    return new Phaser.Math.Vector2(next.x - this.player.x, next.y - this.player.y).normalize();
  }

  // ────────────────────────────────────────────────────────────
  // 카메라
  // ────────────────────────────────────────────────────────────

  private createCamera(map: Phaser.Tilemaps.Tilemap) {
    const camera = this.cameras.main;

    camera.setZoom(CAMERA_ZOOM);

    // 맵 밖의 빈 공간이 보이지 않게 카메라가 갈 수 있는 범위를 제한한다.
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // lerp 0.1 — 즉시 따라붙지 않고 살짝 부드럽게 쫓아온다.
    camera.startFollow(this.player, true, 0.1, 0.1);
  }
}

/** 오브젝트 종류마다 React에 보낼 신호가 다르다. venue는 payload가 없어 따로 처리한다. */
const EVENT_BY_KIND: Record<Exclude<WorldObject["kind"], "venue">, string> = {
  frame: GAME_EVENT.OPEN_MEMORY,
  villager: GAME_EVENT.OPEN_DIALOGUE,
  signpost: GAME_EVENT.OPEN_SIGNPOST,
};

function textureKeyFor(object: WorldObject) {
  switch (object.kind) {
    case "frame":
      return FRAME_KEY;
    case "venue":
      return VENUE_KEY;
    case "signpost":
      return SIGNPOST_KEY;
    default:
      return VILLAGER_KEY;
  }
}

function frameFor(object: WorldObject) {
  return object.kind === "villager" ? (object.variant ?? 0) : undefined;
}

/** 타일 좌표를 그 타일 한가운데의 픽셀 좌표로 바꾼다. */
function tileToPixelCenter(tileX: number, tileY: number) {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  };
}

/** 픽셀 좌표가 어느 타일 칸에 있는지 돌려준다. */
function pixelToTile(x: number, y: number): TilePoint {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
  };
}

/**
 * 주민이 가끔 폴짝 뛰는 높이.
 *
 * 대부분의 시간은 0이고, 주기의 앞부분에서만 짧게 튀어오른다.
 * 계속 흔들리는 것보다 이쪽이 "살아 있다"는 느낌이 강하다.
 */
function hopOffset(time: number, phase: number): number {
  const progress = ((time + phase * 700) % HOP_PERIOD) / HOP_PERIOD;

  if (progress > 0.12) return 0;

  return -Math.sin((progress / 0.12) * Math.PI) * HOP_PIXELS;
}

/**
 * 속도로부터 바라볼 방향을 정한다.
 *
 * 가로 성분이 더 크면 옆모습, 아니면 위아래.
 * 대각선으로 걸을 때 방향이 떨리지 않도록 한쪽을 확실히 고른다.
 */
function poseFor(velocity: Phaser.Math.Vector2): PersonPose {
  if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
    return "side";
  }

  return velocity.y < 0 ? "up" : "down";
}

function idleKey(pose: PersonPose) {
  return `player-${pose}-idle`;
}

function walkKey(pose: PersonPose) {
  return `player-${pose}-walk`;
}
