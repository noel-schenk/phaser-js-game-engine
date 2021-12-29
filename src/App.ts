import * as Phaser from 'phaser';
import { GlobalKeyEvents } from './GlobalKeyEvents';
import { Globals } from './Globals';
import { LoadingScene } from './scenes/LoadingScene';
import { Tools } from './Tools';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Planeten Flohs Farm',

  type: Phaser.AUTO,

  width: window.innerWidth,
  height: window.innerHeight,

  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },

  parent: 'game',
  backgroundColor: '#547e64',
  scene: []
};

Globals.Instance.game = new Phaser.Game(gameConfig);

new GlobalKeyEvents();
Globals.Instance.game.scene.add(Tools.getUniqueKey(), LoadingScene, true);
