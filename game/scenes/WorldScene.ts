import Phaser from "phaser";

import { parseMapArt, SPAWN_TILE } from "../maps/villageMap";
import {
  PLAYER_HEIGHT,
  PLAYER_KEY,
  PLAYER_WIDTH,
  TILESET_KEY,
} from "../textures/placeholderTextures";
import { SOLID_TILES, TILE_SIZE } from "../tiles";

/** 걷는 속도 (초당 픽셀). 타일 한 칸이 16px이므로 초당 약 4.4칸. */
const WALK_SPEED = 70;

/** 손가락을 이 거리 안까지 따라가면 멈춘다. 목적지에서 떠는 것을 막는다. */
const TOUCH_STOP_DISTANCE = 4;

/**
 * 실제로 돌아다니는 공간.
 *
 * 맵 → 플레이어 → 조작 → 카메라 순서로 만든다.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;

  constructor() {
    super("WorldScene");
  }

  create() {
    const { map, layer } = this.createMap();

    this.createPlayer();
    this.physics.add.collider(this.player, layer);

    this.createControls();
    this.createCamera(map);
  }

  update() {
    this.movePlayer();
  }

  // ────────────────────────────────────────────────────────────
  // 맵
  // ────────────────────────────────────────────────────────────

  private createMap(): {
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayerBase;
  } {
    // 1. 숫자 배열로부터 타일맵 데이터를 만든다. 아직 화면에는 아무것도 없다.
    const map = this.make.tilemap({
      data: parseMapArt(),
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

    return { map, layer };
  }

  // ────────────────────────────────────────────────────────────
  // 플레이어
  // ────────────────────────────────────────────────────────────

  private createPlayer() {
    const x = SPAWN_TILE.x * TILE_SIZE + TILE_SIZE / 2;
    const y = SPAWN_TILE.y * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.physics.add.sprite(x, y, PLAYER_KEY, 0);
    this.player.setCollideWorldBounds(true);

    // 충돌 판정은 몸 전체가 아니라 발 근처만 쓴다.
    // 위에서 내려다보는 시점에서는 이래야 벽에 자연스럽게 붙는다.
    this.player.body?.setSize(8, 6);
    this.player.body?.setOffset((PLAYER_WIDTH - 8) / 2, PLAYER_HEIGHT - 6);

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
  }

  /**
   * 매 프레임 플레이어의 속도를 정한다.
   *
   * 키보드가 우선이고, 키를 누르지 않은 상태에서 화면을 누르고 있으면
   * 그 지점을 향해 걸어간다. (모바일 조작)
   */
  private movePlayer() {
    const velocity = this.readKeyboardDirection() ?? this.readPointerDirection();

    this.player.setVelocity(velocity.x * WALK_SPEED, velocity.y * WALK_SPEED);

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

  private readPointerDirection(): Phaser.Math.Vector2 {
    const pointer = this.input.activePointer;

    if (!pointer.isDown) {
      return new Phaser.Math.Vector2(0, 0);
    }

    // 화면 좌표를 맵 좌표로 바꾼다. 카메라가 움직이므로 둘은 다르다.
    const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const direction = new Phaser.Math.Vector2(
      target.x - this.player.x,
      target.y - this.player.y,
    );

    if (direction.length() < TOUCH_STOP_DISTANCE) {
      return new Phaser.Math.Vector2(0, 0);
    }

    return direction.normalize();
  }

  // ────────────────────────────────────────────────────────────
  // 카메라
  // ────────────────────────────────────────────────────────────

  private createCamera(map: Phaser.Tilemaps.Tilemap) {
    const camera = this.cameras.main;

    // 맵 밖의 빈 공간이 보이지 않게 카메라가 갈 수 있는 범위를 제한한다.
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // lerp 0.1 — 즉시 따라붙지 않고 살짝 부드럽게 쫓아온다.
    camera.startFollow(this.player, true, 0.1, 0.1);
  }
}
