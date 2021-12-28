import * as Phaser from 'phaser';
import { Tools } from './Tools';
import { Globals } from './Globals';
import { Scene } from './Interfaces';
import { InventoryScene } from './Inventory';
import { HomeOutsideScene } from './HomeOutside';
import { PlayerScene } from './PlayerScene';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'LoadingScene'
};

export class LoadingScene extends Scene {
  static sceneConfig = sceneConfig;
  constructor() {
    super(sceneConfig);
  }

  preload() {
    Tools.loadSprites(this.scene.key);
  }

  override renderUpdate() {}

  create() {
    Globals.Instance.game.scene.add(
      Tools.getUniqueKey(),
      HomeOutsideScene,
      true
    );
    Globals.Instance.game.scene.add(Tools.getUniqueKey(), InventoryScene, true);
    Globals.Instance.game.scene.add(Tools.getUniqueKey(), PlayerScene, true);
  }
}
