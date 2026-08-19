import Phaser from "phaser";

import type { WorldObject } from "@/types";

import { GAME_EVENT } from "../events";
import { parseMapArt, SPAWN_TILE } from "../maps/villageMap";
import { VILLAGE_OBJECTS } from "../maps/villageObjects";
import {
  FRAME_KEY,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  PLAYER_KEY,
  TILESET_KEY,
  VILLAGER_KEY,
} from "../textures/placeholderTextures";
import { SOLID_TILES, TILE_SIZE } from "../tiles";

/** 걷는 속도 (초당 픽셀). 타일 한 칸이 16px이므로 초당 약 4.4칸. */
const WALK_SPEED = 70;

/** 손가락을 이 거리 안까지 따라가면 멈춘다. 목적지에서 떠는 것을 막는다. */
const TOUCH_STOP_DISTANCE = 4;

/** 이 거리 안에 들어오면 상호작용할 수 있다. 타일 약 1.5칸. */
const INTERACT_RANGE = 24;

/** 오브젝트와 그 오브젝트를 나타내는 스프라이트를 함께 들고 다닌다. */
type Interactable = {
  data: WorldObject;
  sprite: Phaser.Physics.Arcade.Sprite;
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

  /** 오브젝트를 눌러서 상호작용한 프레임에는 이동 명령을 무시한다. */
  private pointerConsumed = false;

  constructor() {
    super("WorldScene");
  }

  create() {
    const { map, layer } = this.createMap();

    this.createPlayer();
    this.physics.add.collider(this.player, layer);

    this.createInteractables();
    this.createPrompt();
    this.createControls();
    this.createCamera(map);
  }

  update(time: number) {
    this.updateNearest(time);
    this.handleInteractKey();
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

      const textureKey = data.kind === "frame" ? FRAME_KEY : VILLAGER_KEY;
      const frame = data.kind === "frame" ? undefined : (data.variant ?? 0);

      const sprite = group.create(x, y, textureKey, frame) as Phaser.Physics.Arcade.Sprite;

      // 발밑만 막는다. 그래야 위쪽으로 지나갈 때 자연스럽다.
      sprite.body?.setSize(10, 6);
      sprite.setDepth(sprite.y);

      // 오브젝트를 직접 눌러도 상호작용되게 한다. (모바일)
      sprite.setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", () => {
        this.pointerConsumed = true;

        if (this.isInRange(sprite)) {
          this.interactWith(data);
        }
      });

      return { data, sprite };
    });

    this.physics.add.collider(this.player, group);

    // 오브젝트가 아닌 곳을 눌렀다가 떼면 다시 이동할 수 있게 한다.
    this.input.on("pointerup", () => {
      this.pointerConsumed = false;
    });
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

  private isInRange(sprite: Phaser.GameObjects.Sprite) {
    return (
      Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) <=
      INTERACT_RANGE
    );
  }

  /** 매 프레임 가장 가까운 오브젝트를 찾아 안내 표시를 옮긴다. */
  private updateNearest(time: number) {
    let closest: Interactable | null = null;
    let closestDistance = INTERACT_RANGE;

    for (const item of this.interactables) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        item.sprite.x,
        item.sprite.y,
      );

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
      this.interactWith(this.nearest.data);
    }
  }

  /**
   * 여기가 Phaser에서 React로 넘어가는 지점이다.
   *
   * Scene은 무엇을 보여줄지 모른다. "이 id의 추억을 열어달라"고 알릴 뿐이다.
   * 모달을 어떻게 그릴지는 React가 정한다.
   */
  private interactWith(object: WorldObject) {
    const event =
      object.kind === "frame" ? GAME_EVENT.OPEN_MEMORY : GAME_EVENT.OPEN_DIALOGUE;

    // 창이 열려 있는 동안 캐릭터가 계속 걷지 않도록 멈춘다.
    this.player.setVelocity(0, 0);
    this.player.play("player-idle");

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
   * 키보드가 우선이고, 키를 누르지 않은 상태에서 화면을 누르고 있으면
   * 그 지점을 향해 걸어간다. (모바일 조작)
   */
  private movePlayer() {
    const velocity = this.readKeyboardDirection() ?? this.readPointerDirection();

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

  private readPointerDirection(): Phaser.Math.Vector2 {
    const pointer = this.input.activePointer;

    if (!pointer.isDown || this.pointerConsumed) {
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

/** 타일 좌표를 그 타일 한가운데의 픽셀 좌표로 바꾼다. */
function tileToPixelCenter(tileX: number, tileY: number) {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  };
}
