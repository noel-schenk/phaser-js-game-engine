import { Globals } from '../Globals';
import { EntityState } from '../Interfaces';
import { Scenes } from '../scenes/Scenes';
import { Tools } from '../Tools';

export class EntityManager {
  constructor() {
    this.init();
  }

  init() {
    this.loginPlayer();
  }

  loginPlayer(promtText?: string) {
    const activePlayerName = prompt(
      promtText ? promtText : 'Bitte gib deinen Namen ein:',
      'Dein Spieler name'
    );
    const activePlayer = Globals.Instance.state.entities.value.find(
      (entity: EntityState) => entity.name === activePlayerName
    ) as EntityState;

    if (activePlayer) {
      Globals.Instance.activePlayer = activePlayer;
      this.loadPlayerState(activePlayer);

      return activePlayer;
    }

    this.loginPlayer(
      'Leider wurde dieser Spielername nicht gefunden. Bitte versuche es erneut.'
    );
  }

  loadPlayerState(activePlayer: EntityState) {
    Globals.Instance.game.scene.add(
      Tools.getUniqueKey(),
      Scenes.getSceneByKey(activePlayer.sceneName),
      true
    );
  }
}
