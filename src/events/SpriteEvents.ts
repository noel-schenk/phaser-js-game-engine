import { Globals } from '../Globals';
import { Events, GameObject, MainScene, Scene, SpriteEvent, SpriteInfo, XY } from '../Interfaces';
import config from '../json/config.json';
import { Tools } from '../Tools';

export class SpriteEvents extends Events<MainScene> {
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

    this.moveSpriteToMouse(params.event, params.gameObject);
  }

  moveSpriteToMouse(position: XY, gameObject: GameObject) {
    gameObject.x = position.x;
    gameObject.y = position.y;
  }

  onDragEnd(params: SpriteEvent) {
    this.dropSpriteToMouse(params);

    Globals.Instance.canRerender = true;
  }

  dropSpriteToMouse(params: SpriteEvent) {
    const data = params.customData();

    params.gameObject.x = Tools.getPixelGridNumber(params.event.x);
    params.gameObject.y = Tools.getPixelGridNumber(params.event.y);
    const updatedPosition = Tools.getGridPosition(params.gameObject.x, params.gameObject.y);

    if (
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
    ) {
      Globals.Instance.stateTransaction.sprites.next();
      return true;
    }

    this.scene.renderSpriteUpdate();
    return false;
  }
}
