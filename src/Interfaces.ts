import PhaserGUIAction from 'phaser3_gui_inspector';
import { Globals } from './Globals';
import config from './json/config.json';
import { Tools } from './Tools';

export interface SpriteData {
  mutations: number;
  width: number;
  height: number;
  ext: string;
  interactive: boolean;
}

export type State = { source: string }[][][];

export class Scene extends Phaser.Scene {
  create() {
    config.develop && (PhaserGUIAction as any)(this);

    Globals.Instance.state.subscribe(() => {
      const tryRender = () => {
        if (!Globals.Instance.canRerender) {
          console.log('rendering is not possible at the moment');
          setTimeout(() => tryRender(), 100);
          return;
        }
        Tools.removeAllGameObjectsFromScene(this.scene.scene);
        this.renderUpdate();
      };
      tryRender();
    });
  }

  renderUpdate() {
    throw 'This functions need to be overwritten';
  }
}
