import { Scene } from '../Interfaces';
import { HomeOutsideScene } from './HomeOutsideScene';
import { InventoryScene } from './InventoryScene';
import { LoadingScene } from './LoadingScene';
import { PlayerScene } from './PlayerScene';

export class Scenes {
  static scenes = [
    HomeOutsideScene,
    InventoryScene,
    LoadingScene,
    PlayerScene
  ] as Array<typeof Scene>;

  static getSceneByKey(key: string) {
    return this.scenes.find((scene) => scene.sceneConfig.key === key);
  }
}
