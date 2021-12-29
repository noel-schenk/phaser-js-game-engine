import * as Phaser from 'phaser';
import { Tools } from '../Tools';
import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { InventoryScene } from './InventoryScene';
import { EntityManager } from '../managers/EntityManager';
import { PlayerScene } from './PlayerScene';
import { DataManager } from '../managers/DataManager';
export class LoadingScene extends Scene {
  static sceneConfig = {
    active: false,
    visible: false,
    key: 'LoadingScene'
  };

  override settings = {
    zIndex: 900
  };

  constructor() {
    super(LoadingScene.sceneConfig);
  }

  preload() {
    Tools.loadSprites(this.scene.scene);
  }

  create() {
    super.create();
    new DataManager(() => {
      Globals.Instance.game.scene.add(
        Tools.getUniqueKey(),
        InventoryScene,
        true
      );
      new EntityManager();
      Globals.Instance.game.scene.add(Tools.getUniqueKey(), PlayerScene, true);
    });
  }
}
