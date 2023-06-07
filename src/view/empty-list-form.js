import AbstractView from '../framework/view/abstract-view';
import {FILTER_TYPE} from '../const-data';

const NoTasksTextType = {
  [FILTER_TYPE.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPE.FUTURE]: 'There are no future events now',
  [FILTER_TYPE.PAST]: 'There are no past events now',
};

function createNoWaypoitsMessageTemplate(filterType) {
  return `<p class="trip-events__msg">${NoTasksTextType[filterType]}</p>`;
}

export default class EmptyListView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoWaypoitsMessageTemplate(this.#filterType);
  }
}
