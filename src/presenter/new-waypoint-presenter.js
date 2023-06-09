import {UPDATE_TYPE, USER_ACTION} from '../const-data';
import EditFormView from '../view/edit-form';
import {remove, render, RenderPosition} from '../framework/render';
import {isEsc} from '../utils/util';

export default class NewWaypointPresenter {
  #handleDataChange = null;
  #handleDestroy = null;
  #waypointListContainer = null;
  #waypointEditComponent = null;

  constructor({waypointListContainer, onDataChange, onDestroy}) {
    this.#waypointListContainer = waypointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(destinations, offers) {
    if (this.#waypointEditComponent !== null) {
      return;
    }

    this.#waypointEditComponent = new EditFormView({
      destinations: destinations,
      offers: offers,
      onSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      isEditForm: false
    });

    render(this.#waypointEditComponent, this.#waypointListContainer,
      RenderPosition.AFTERBEGIN);

    document.body.addEventListener('keydown', this.#handleEcsKeyDown);
  }

  setSaving() {
    this.#waypointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#waypointEditComponent.updateElement({
        isDisabled: false,
        isSavinf: false,
        isDeleting: false,
      });
    };

    this.#waypointEditComponent.shake(resetFormState);
  }

  destroy() {
    if (this.#waypointEditComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#waypointEditComponent);
    this.#waypointEditComponent = null;

    document.body.removeEventListener('keydown', this.#handleEcsKeyDown);
  }


  #handleEcsKeyDown = (evt) => {
    if (isEsc(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };

  #handleFormSubmit = (waypoint) => {
    this.#handleDataChange(
      USER_ACTION.ADD_WAYPOINT,
      UPDATE_TYPE.MINOR,

      this.#deleteId(waypoint)
    );

    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #deleteId = (waypoint) => {
    delete waypoint.id;
    return waypoint;
  };
}
