import Phaser from "phaser";

import { BUTTERFLY_KEY } from "../textures/placeholderTextures";

/** 나비가 한 지점에서 다음 지점까지 가는 속도 (초당 픽셀) */
const SPEED = 18;

/** 목적지에 이만큼 가까워지면 다음 꽃을 고른다 */
const ARRIVE_DISTANCE = 2;

/** 다음 꽃은 이 거리 안에서 고른다. 나비가 마을을 가로지르지 않게. */
const WANDER_RANGE = 80;

/**
 * 꽃밭 주위를 맴도는 나비들.
 *
 * 아무 기능도 없다. 오직 빈 공간이 심심해 보이지 않게 하는 것이 목적이다.
 * 충돌도 상호작용도 없어서 물리 엔진을 쓰지 않는다.
 */
export class Butterflies {
  private sprites: Phaser.GameObjects.Sprite[] = [];
  private targets: Phaser.Math.Vector2[] = [];

  /** 나비가 오갈 수 있는 자리들 (꽃밭 타일의 중심) */
  private spots: Phaser.Math.Vector2[];

  constructor(scene: Phaser.Scene, spots: Phaser.Math.Vector2[], count: number) {
    this.spots = spots;

    if (spots.length === 0) return;

    scene.anims.create({
      key: "butterfly-flutter",
      frames: [
        { key: BUTTERFLY_KEY, frame: 0 },
        { key: BUTTERFLY_KEY, frame: 1 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    for (let i = 0; i < count; i++) {
      // 꽃밭을 고르게 나눠 쓴다. 무작위를 쓰지 않아 실행할 때마다 같은 결과가 나온다.
      const home = spots[Math.floor((i * spots.length) / count)];

      const sprite = scene.add
        .sprite(home.x, home.y, BUTTERFLY_KEY, 0)
        .setDepth(home.y + 8);

      sprite.play("butterfly-flutter");
      // 날갯짓 박자를 조금씩 어긋나게 해서 한꺼번에 펄럭이지 않게 한다.
      sprite.anims.setProgress((i % 4) / 4);

      this.sprites.push(sprite);
      this.targets.push(this.pickSpot(home, i));
    }
  }

  update(time: number, delta: number) {
    const step = (SPEED * delta) / 1000;

    this.sprites.forEach((sprite, index) => {
      const target = this.targets[index];

      const dx = target.x - sprite.x;
      const dy = target.y - sprite.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= ARRIVE_DISTANCE) {
        this.targets[index] = this.pickSpot(
          new Phaser.Math.Vector2(sprite.x, sprite.y),
          index + Math.floor(time / 1000),
        );
        return;
      }

      sprite.x += (dx / distance) * step;
      sprite.y += (dy / distance) * step;

      // 위아래로 살짝 흔들어 나풀거리는 느낌을 준다.
      sprite.y += Math.sin(time / 120 + index) * 0.15;

      sprite.setFlipX(dx < 0);
      sprite.setDepth(sprite.y + 8);
    });
  }

  destroy() {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites = [];
  }

  /** 지금 자리에서 가까운 꽃밭 중 하나를 고른다. */
  private pickSpot(from: Phaser.Math.Vector2, seed: number): Phaser.Math.Vector2 {
    const nearby = this.spots.filter(
      (spot) =>
        Phaser.Math.Distance.Between(from.x, from.y, spot.x, spot.y) < WANDER_RANGE,
    );

    const pool = nearby.length > 0 ? nearby : this.spots;

    return pool[Math.abs(seed) % pool.length];
  }
}
