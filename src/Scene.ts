import * as Phaser from 'phaser';
import { Tools } from './Tools';
import config from './json/config.json';
import { Globals } from './Globals';
import { Scene } from './Interfaces';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game'
};

export class GameScene extends Scene {
  constructor() {
    super(sceneConfig);
  }

  preload() {
    Tools.loadSprites(this.scene.key);
  }

  override renderUpdate() {
    Tools.renderScene(
      this.scene.key,
      Globals.Instance.state.value,
      (sprite, info, statePosition) => {
        Tools.getSpriteDataFromSpriteName(info).interactive
          ? sprite.setInteractive({ draggable: true })
          : undefined;

        sprite
          .on('drag', (pointer) => {
            Globals.Instance.canRerender = false;
            sprite.x = pointer.x;
            sprite.y = pointer.y;
          })
          .on('dragend', (pointer) => {
            sprite.x = Phaser.Math.Snap.To(
              pointer.x,
              config.gridSize,
              config.gridSize / 2
            );
            sprite.y = Phaser.Math.Snap.To(
              pointer.y,
              config.gridSize,
              config.gridSize / 2
            );
            const updatedPosition = Tools.getGridPosition(sprite.x, sprite.y);

            Tools.moveSpriteToPosition(
              {
                level: statePosition.levelIndex,
                row: statePosition.rowIndex,
                column: statePosition.columnIndex,
                spriteInfo: info
              },
              {
                level: statePosition.levelIndex,
                row: updatedPosition.row,
                column: updatedPosition.column
              }
            )
              ? undefined
              : this.renderUpdate();
            Globals.Instance.canRerender = true;
          });
      }
    );
  }

  update() {}
}
