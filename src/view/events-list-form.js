import AbstractView from '../framework/view/abstract-view';

function createWaypointListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}

export default class EventsListView extends AbstractView {
  get template() {
    return createWaypointListTemplate();
  }
}
