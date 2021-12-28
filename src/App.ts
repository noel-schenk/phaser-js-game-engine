import * as Phaser from 'phaser';
import { Globals } from './Globals';
import { GameScene } from './Scene';
import Demo from './json/demo.json';

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
  backgroundColor: '#000000',
  scene: GameScene
};

Globals.Instance.game = new Phaser.Game(gameConfig);
Globals.Instance.state.next(JSON.parse(JSON.stringify(Demo)));
