import Phaser from "phaser";

const COLOR_GRID = 0x29366f;
const COLOR_ACCENT = 0xf4b41b;

/**
 * 첫 번째 Scene.
 *
 * 아직 맵이나 플레이어는 없다.
 * Phaser 게임 루프가 실제로 브라우저에서 돌고 있다는 것만 화면으로 보여준다.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.drawGrid(width, height);

    this.add
      .text(width / 2, height / 2 - 48, "PIXEL MEMORIES", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 24, "PHASE 1 — CANVAS OK", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#7b82a8",
      })
      .setOrigin(0.5);

    // 위아래로 움직이는 사각형 — 매 프레임 다시 그려지고 있다는 증거다.
    const marker = this.add.rectangle(width / 2, height / 2 + 16, 8, 8, COLOR_ACCENT);

    this.tweens.add({
      targets: marker,
      y: marker.y - 8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add
      .text(width / 2, height - 16, `Phaser v${Phaser.VERSION}`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#4a5080",
      })
      .setOrigin(0.5);
  }

  /** 픽셀 공간의 좌표 감각을 확인하기 위한 16px 격자. */
  private drawGrid(width: number, height: number) {
    const grid = this.add.graphics();

    grid.lineStyle(1, COLOR_GRID, 1);

    for (let x = 0; x <= width; x += 16) {
      grid.lineBetween(x, 0, x, height);
    }

    for (let y = 0; y <= height; y += 16) {
      grid.lineBetween(0, y, width, y);
    }
  }
}
