import * as Phaser from 'phaser';
import { Tools } from '../Tools';
import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { InventoryScene } from './InventoryScene';
import { HomeOutsideScene } from './HomeOutsideScene';
import { PlayerScene } from './PlayerScene';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'LoadingScene'
};

export class LoadingScene extends Scene {
  static sceneConfig = sceneConfig;

  override settings = {
    zIndex: 900
  };

  constructor() {
    super(sceneConfig);
  }

  preload() {
    Tools.loadSprites(this.scene.key);
  }

  create() {
    super.create();
    Globals.Instance.game.scene.add(
      Tools.getUniqueKey(),
      HomeOutsideScene,
      true
    );
    Globals.Instance.game.scene.add(Tools.getUniqueKey(), InventoryScene, true);
    Globals.Instance.game.scene.add(Tools.getUniqueKey(), PlayerScene, true);
  }
}
