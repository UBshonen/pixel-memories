import Phaser from "phaser";

import { findPath, type TilePoint } from "../maps/pathfinding";
import { CAT_KEY } from "../textures/placeholderTextures";
import { TILE_SIZE } from "../tiles";

/** 고양이가 플레이어 뒤로 유지하려는 거리 (픽셀) */
const FOLLOW_GAP = 26;

/** 따라다닐 때의 속도. 플레이어보다 조금 빨라야 뒤처지지 않는다. */
const FOLLOW_SPEED = 110;

/** 안내할 때는 총총 걷는 느낌으로 조금 느리게 */
const GUIDE_SPEED = 60;

/** 플레이어가 이만큼 멈춰 있으면 안내를 시작한다 (밀리초) */
const IDLE_BEFORE_GUIDE = 2200;

/**
 * 맨 처음 한 번만은 더 빨리 앞장선다.
 *
 * 입장하자마자 고양이가 걸어가는 것을 보여줘야
 * "따라가면 되는구나"를 설명 없이 알 수 있다.
 */
const IDLE_BEFORE_FIRST_GUIDE = 700;

/** 한 번 안내할 때 앞서가는 칸 수 */
const GUIDE_STEPS = 3;

/** 안내를 마치고 다음 안내까지 쉬는 시간 (밀리초) */
const GUIDE_COOLDOWN = 1600;

/** 플레이어에게서 이보다 멀어지면 안내를 멈춘다 (픽셀) */
const MAX_LEAD_DISTANCE = 96;

/** 지나온 자리를 이 간격마다 기록한다 */
const TRAIL_SPACING = 3;

/** 기록해 둘 자취의 개수. 많을수록 멀찍이 따라온다. */
const TRAIL_LENGTH = 10;

/**
 * 플레이어를 따라다니다가, 가만히 있으면 다음 추억 쪽으로 앞서가서
 * 돌아보는 고양이.
 *
 * 화면에 안내 UI를 만들지 않고 길을 알려주기 위한 장치다.
 * 마을에 사는 생명체처럼 보여야 하므로 아이콘이나 화살표는 쓰지 않는다.
 *
 * ## 따라다니기
 *
 * 길찾기를 쓰지 않는다. 플레이어가 **이미 지나간 자리**를 기록해 두었다가
 * 그 자취를 밟아 온다. 플레이어가 갈 수 있었던 곳이므로 벽에 낄 일이 없고,
 * 계산도 거의 들지 않는다.
 *
 * ## 안내하기
 *
 * 이때만 길찾기를 쓴다. 자취를 벗어나 새로운 곳으로 가야 하기 때문이다.
 */
export class GuideCat {
  private sprite: Phaser.GameObjects.Sprite;

  /** 플레이어가 지나온 자리들. 앞쪽이 오래된 것이다. */
  private trail: Phaser.Math.Vector2[] = [];

  /** 안내 중일 때 남은 목표 지점들 */
  private guideWaypoints: Phaser.Math.Vector2[] = [];

  private idleSince: number | null = null;
  private guideReadyAt = 0;
  private hasGuidedOnce = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, CAT_KEY, 0);

    scene.anims.create({
      key: "cat-idle",
      frames: [{ key: CAT_KEY, frame: 0 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: "cat-walk",
      frames: [
        { key: CAT_KEY, frame: 1 },
        { key: CAT_KEY, frame: 0 },
        { key: CAT_KEY, frame: 2 },
        { key: CAT_KEY, frame: 0 },
      ],
      frameRate: 9,
      repeat: -1,
    });

    this.sprite.play("cat-idle");
  }

  /**
   * 매 프레임 호출한다.
   *
   * @param guideTarget 다음에 보여주고 싶은 곳. 없으면(다 봤으면) 안내하지 않는다.
   */
  update(
    time: number,
    delta: number,
    player: Phaser.GameObjects.Sprite,
    playerIsMoving: boolean,
    guideTarget: TilePoint | null,
    walkable: boolean[][],
  ) {
    this.recordTrail(player);

    if (playerIsMoving) {
      // 플레이어가 움직이면 안내를 접고 따라다니기로 돌아간다.
      this.idleSince = null;
      this.guideWaypoints = [];
    } else if (this.idleSince === null) {
      this.idleSince = time;
    }

    const waitNeeded = this.hasGuidedOnce
      ? IDLE_BEFORE_GUIDE
      : IDLE_BEFORE_FIRST_GUIDE;

    const shouldGuide =
      this.idleSince !== null &&
      time - this.idleSince > waitNeeded &&
      time > this.guideReadyAt &&
      guideTarget !== null;

    if (this.guideWaypoints.length === 0 && shouldGuide) {
      this.planGuide(player, guideTarget, walkable);

      if (this.guideWaypoints.length > 0) {
        this.hasGuidedOnce = true;
      }
    }

    if (this.guideWaypoints.length > 0) {
      this.stepAlongGuide(time, delta, player);
    } else {
      this.stepAlongTrail(delta, player);
    }

    // 아래쪽에 있는 것이 앞에 그려지도록 y값을 깊이로 쓴다.
    this.sprite.setDepth(this.sprite.y);
  }

  destroy() {
    this.sprite.destroy();
  }

  // ────────────────────────────────────────────────────────────

  /** 플레이어가 지나온 자리를 일정 간격으로 기록한다. */
  private recordTrail(player: Phaser.GameObjects.Sprite) {
    const last = this.trail[this.trail.length - 1];

    if (
      last &&
      Phaser.Math.Distance.Between(last.x, last.y, player.x, player.y) < TRAIL_SPACING
    ) {
      return;
    }

    this.trail.push(new Phaser.Math.Vector2(player.x, player.y));

    while (this.trail.length > TRAIL_LENGTH) {
      this.trail.shift();
    }
  }

  /** 자취의 가장 오래된 지점을 향해 걷는다. */
  private stepAlongTrail(delta: number, player: Phaser.GameObjects.Sprite) {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      player.x,
      player.y,
    );

    // 충분히 가까우면 멈춰서 쉰다.
    if (distanceToPlayer <= FOLLOW_GAP || this.trail.length === 0) {
      this.stand();
      return;
    }

    const target = this.trail[0];

    if (this.moveToward(target, FOLLOW_SPEED, delta)) {
      this.trail.shift();
    }
  }

  /** 안내 경로를 계산한다. 플레이어에게서 너무 멀어지지 않도록 몇 걸음만 잡는다. */
  private planGuide(
    player: Phaser.GameObjects.Sprite,
    target: TilePoint | null,
    walkable: boolean[][],
  ) {
    if (!target) return;

    const start = {
      x: Math.floor(this.sprite.x / TILE_SIZE),
      y: Math.floor(this.sprite.y / TILE_SIZE),
    };

    const path = findPath(walkable, start, target);

    if (!path || path.length === 0) return;

    this.guideWaypoints = path.slice(0, GUIDE_STEPS).map(({ x, y }) => {
      return new Phaser.Math.Vector2(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
      );
    });
  }

  /** 안내 경로를 따라 걷고, 끝나면 플레이어를 돌아본다. */
  private stepAlongGuide(
    time: number,
    delta: number,
    player: Phaser.GameObjects.Sprite,
  ) {
    const tooFar =
      Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y) >
      MAX_LEAD_DISTANCE;

    if (tooFar) {
      this.finishGuide(time, player);
      return;
    }

    const next = this.guideWaypoints[0];

    if (this.moveToward(next, GUIDE_SPEED, delta)) {
      this.guideWaypoints.shift();

      if (this.guideWaypoints.length === 0) {
        this.finishGuide(time, player);
      }
    }
  }

  /** 안내를 마치고 플레이어 쪽을 돌아본다. */
  private finishGuide(time: number, player: Phaser.GameObjects.Sprite) {
    this.guideWaypoints = [];
    this.guideReadyAt = time + GUIDE_COOLDOWN;

    this.stand();
    this.sprite.setFlipX(player.x < this.sprite.x);
  }

  /**
   * 목표 지점 쪽으로 한 프레임만큼 움직인다.
   *
   * @returns 목표에 닿았으면 true
   */
  private moveToward(
    target: Phaser.Math.Vector2,
    speed: number,
    delta: number,
  ): boolean {
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;
    const distance = Math.hypot(dx, dy);
    const step = (speed * delta) / 1000;

    if (distance <= step) {
      this.sprite.setPosition(target.x, target.y);
      return true;
    }

    this.sprite.x += (dx / distance) * step;
    this.sprite.y += (dy / distance) * step;

    this.sprite.setFlipX(dx < 0);

    if (this.sprite.anims.currentAnim?.key !== "cat-walk") {
      this.sprite.play("cat-walk");
    }

    return false;
  }

  private stand() {
    if (this.sprite.anims.currentAnim?.key !== "cat-idle") {
      this.sprite.play("cat-idle");
    }
  }
}
