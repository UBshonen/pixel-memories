import Phaser from "phaser";

import { createPlaceholderTextures } from "../textures/placeholderTextures";

/**
 * 게임이 시작될 때 딱 한 번 실행되는 준비용 Scene.
 *
 * 지금은 임시 그래픽을 코드로 구워내는 일만 한다.
 * 나중에 진짜 이미지 파일을 쓰게 되면 preload()에서 로딩하고
 * 로딩 진행률 표시도 여기에 붙인다.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    createPlaceholderTextures(this);

    this.scene.start("WorldScene");
  }
}
