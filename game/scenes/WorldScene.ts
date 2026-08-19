import Phaser from "phaser";

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
import {
  FRAME_KEY,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  PLAYER_KEY,
  TILESET_KEY,
  VENUE_KEY,
  VILLAGER_KEY,
} from "../textures/placeholderTextures";
import { SOLID_TILES, TILE_SIZE } from "../tiles";

/**
 * 카메라 확대 배율.
 *
 * 1이면 화면에 가로 22칸이 들어와 캐릭터가 아주 작아 보인다.
 * 2로 두면 가로 11칸 · 세로 20칸이 보인다. 걸어다니기 좋은 거리다.
 * 정수 배율이라 픽셀이 뭉개지지 않는다.
 */
const CAMERA_ZOOM = 2;

/** 걷는 속도 (초당 픽셀). 타일 한 칸이 16px이므로 초당 약 5.3칸. */
const WALK_SPEED = 85;

/** 이 거리 안에 들어오면 상호작용할 수 있다. 타일 약 1.5칸. */
const INTERACT_RANGE = 24;

/** 길찾기로 이동할 때, 다음 지점에 이만큼 가까워지면 도착으로 친다. */
const WAYPOINT_REACHED = 3;

/** 이 시간 동안 앞으로 나아가지 못하면 자동 이동을 포기한다. (밀리초) */
const STUCK_TIMEOUT = 1500;

/** 오브젝트와 그 오브젝트를 나타내는 스프라이트를 함께 들고 다닌다. */
type Interactable = {
  data: WorldObject;
  sprite: Phaser.Physics.Arcade.Sprite;
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

  /** 걸을 수 있는 칸 표. 길찾기에 쓴다. */
  private walkable: boolean[][] = [];
  private autoWalk: AutoWalk | null = null;

  /** 화면의 방향 버튼이 누르고 있는 방향. React에서 이벤트로 전달받는다. */
  private padDirection = new Phaser.Math.Vector2(0, 0);

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

  update(time: number) {
    this.updateNearest(time);
    this.handleInteractKey();
    this.movePlayer(time);
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

    this.anims.create({
      key: "player-idle",
      frames: [{ key: PLAYER_KEY, frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: "player-walk",
      frames: [
        { key: PLAYER_KEY, frame: 1 },
        { key: PLAYER_KEY, frame: 0 },
        { key: PLAYER_KEY, frame: 2 },
        { key: PLAYER_KEY, frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.player.play("player-idle");
  }

  // ────────────────────────────────────────────────────────────
  // 상호작용 오브젝트
  // ────────────────────────────────────────────────────────────

  private createInteractables() {
    const group = this.physics.add.staticGroup();

    this.interactables = VILLAGE_OBJECTS.map((data) => {
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
        this.approach({ data, sprite });
      });

      return { data, sprite };
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

  /** 가장 가까운 오브젝트 위에 떠 있는 안내 표시 */
  private createPrompt() {
    this.prompt = this.add
      .text(0, 0, "▼", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#f4b41b",
      })
      .setOrigin(0.5, 1)
      .setDepth(10_000)
      .setVisible(false);

    // 위아래로 흔드는 것은 tween이 아니라 update()에서 직접 계산한다.
    // tween은 y값을 자기가 붙잡고 있어서, 매 프레임 위치를 옮기는 것과 충돌한다.
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

    if (!closest) {
      this.prompt.setVisible(false);
      return;
    }

    // 오브젝트 머리 위에 두고, 사인 곡선으로 위아래로 흔든다.
    const bob = Math.sin(time / 200) * 2;
    const baseY = closest.sprite.y - closest.sprite.displayHeight / 2 - 2;

    this.prompt.setPosition(closest.sprite.x, baseY + bob);
    this.prompt.setVisible(true);
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
    this.player.play("player-idle");

    if (object.kind === "venue") {
      this.game.events.emit(GAME_EVENT.OPEN_WEDDING);
      return;
    }

    const event =
      object.kind === "frame" ? GAME_EVENT.OPEN_MEMORY : GAME_EVENT.OPEN_DIALOGUE;

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

    // React의 방향 버튼에서 오는 신호. 지금까지와 반대 방향으로 흐르는 유일한 통로다.
    const onSetDirection = (direction: { x: number; y: number }) => {
      this.padDirection.set(direction.x, direction.y);
    };

    this.game.events.on(GAME_EVENT.SET_DIRECTION, onSetDirection);

    // Scene이 정리될 때 구독을 해제하지 않으면 게임을 다시 만들 때마다 쌓인다.
    this.events.once("shutdown", () => {
      this.game.events.off(GAME_EVENT.SET_DIRECTION, onSetDirection);
    });
  }

  /**
   * 매 프레임 플레이어의 속도를 정한다.
   *
   * 우선순위: 키보드 · 방향 버튼 > 자동 이동
   * 직접 조작하면 자동 이동은 즉시 취소된다.
   */
  private movePlayer(time: number) {
    const manual = this.readKeyboardDirection() ?? this.readPadDirection();

    if (manual) {
      this.autoWalk = null;
    }

    const velocity =
      manual ?? this.readAutoWalkDirection(time) ?? new Phaser.Math.Vector2(0, 0);

    this.player.setVelocity(velocity.x * WALK_SPEED, velocity.y * WALK_SPEED);
    this.player.setDepth(this.player.y);

    const isMoving = velocity.x !== 0 || velocity.y !== 0;

    if (isMoving) {
      this.player.setFlipX(velocity.x < 0);

      if (this.player.anims.currentAnim?.key !== "player-walk") {
        this.player.play("player-walk");
      }
    } else if (this.player.anims.currentAnim?.key !== "player-idle") {
      this.player.play("player-idle");
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

  /** 화면의 방향 버튼. 누르고 있지 않으면 null. */
  private readPadDirection(): Phaser.Math.Vector2 | null {
    if (this.padDirection.x === 0 && this.padDirection.y === 0) {
      return null;
    }

    return this.padDirection.clone().normalize();
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

function textureKeyFor(object: WorldObject) {
  switch (object.kind) {
    case "frame":
      return FRAME_KEY;
    case "venue":
      return VENUE_KEY;
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
