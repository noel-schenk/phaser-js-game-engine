import * as Phaser from 'phaser';
import { GlobalKeyEvents } from './GlobalKeyEvents';
import { Globals } from './Globals';
import Demo from './json/demo.json';
import { LoadingScene } from './LoadingScene';
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
Globals.Instance.state.sprites.next(JSON.parse(JSON.stringify(Demo.sprites)));
Globals.Instance.state.entities.next(JSON.parse(JSON.stringify(Demo.entities)));

new GlobalKeyEvents();
Globals.Instance.game.scene.add(Tools.getUniqueKey(), LoadingScene, true);
