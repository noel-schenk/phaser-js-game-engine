import { Globals } from '../Globals';
import { Events, Scene, SpriteEvent } from '../Interfaces';
import config from '../json/config.json';
import { Tools } from '../Tools';

export class SpriteEvents extends Events<Scene> {
  override init() {
    this.scene.onSpriteEvent.subscribe((params) => {
      switch (params.eventName) {
        case 'drag':
          this.onDrag(params);
          break;
        case 'dragend':
          this.onDragEnd(params);
          break;
        default:
          break;
      }
    });
  }

  onDrag(params: SpriteEvent) {
    Globals.Instance.canRerender = false;

    params.gameObject.x = params.event.x;
    params.gameObject.y = params.event.y;
  }

  onDragEnd(params: SpriteEvent) {
    const data = params.customData();

    params.gameObject.x = Phaser.Math.Snap.To(
      params.event.x,
      config.gridSize,
      config.gridSize / 2
    );
    params.gameObject.y = Phaser.Math.Snap.To(
      params.event.y,
      config.gridSize,
      config.gridSize / 2
    );
    const updatedPosition = Tools.getGridPosition(
      params.gameObject.x,
      params.gameObject.y
    );

    Tools.moveSpriteToPosition(
      {
        level: data.statePosition.levelIndex,
        row: data.statePosition.rowIndex,
        column: data.statePosition.columnIndex,
        spriteInfo: data.spriteInfo
      },
      {
        level: data.statePosition.levelIndex,
        row: updatedPosition.row,
        column: updatedPosition.column
      }
    )
      ? undefined
      : this.scene.renderUpdate();
    Globals.Instance.canRerender = true;
  }
}
