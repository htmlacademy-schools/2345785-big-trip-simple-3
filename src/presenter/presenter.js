import EventSortingView from '../view/event-sorting-form';
import EventsListView from '../view/events-list-form';
import EmptyListView from '../view/empty-list-form';
import {remove, render, RenderPosition} from '../framework/render';
import WaypointPresenter from './waypoint-presenter';
import {FILTER_TYPE, SORT_TYPE, UPDATE_TYPE, USER_ACTION} from '../const-data';
import {filter} from '../utils/filter';
import {sorts} from '../utils/sort';
import NewWaypointPresenter from './new-waypoint-presenter';
import LoadingView from '../view/loading-form';
import UiBlocker from '../framework/ui-blocker/ui-blocker';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class Presenter {
  #waypointListComponent = new EventsListView();
  #waypointPresenter = new Map();
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTER_TYPE.EVERYTHING;
  #loadingComponent = new LoadingView();
  #isLoading = true;
  #boardContainer = null;
  #waypointsModel = null;
  #modelOffers = null;
  #modelDestinations = null;
  #modelFilter = null;
  #noWaypointMessage = null;
  #sortComponent = null;
  #newWaypointPresenter = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({boardContainer, waypointsModel, modelOffers, modelDestinations, modelFilter, onNewWaypointDestroy}) {
    this.#boardContainer = boardContainer;
    this.#waypointsModel = waypointsModel;
    this.#modelOffers = modelOffers;
    this.#modelDestinations = modelDestinations;
    this.#modelFilter = modelFilter;

    this.#newWaypointPresenter = new NewWaypointPresenter({
      waypointListContainer: this.#waypointListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewWaypointDestroy
    });

    this.#waypointsModel.addObserver(this.#handleModelEvent);
    this.#modelFilter.addObserver(this.#handleModelEvent);
  }

  get waypoints() {
    this.#filterType = this.#modelFilter.filter;
    const waypoints = this.#waypointsModel.waypoints.sort(sorts[SORT_TYPE.TIME]);
    const filteredWaypoints = filter[this.#filterType](waypoints);
    return (sorts[this.#currentSortType]) ? filteredWaypoints.sort(sorts[this.#currentSortType]) : filteredWaypoints;
  }

  get destinations() {
    return this.#modelDestinations.destinations;
  }

  get offers() {
    return this.#modelOffers.offers;
  }

  init() {
    this.#renderBoard();
  }

  createWaypoint() {
    this.#currentSortType = SORT_TYPE.DAY;
    this.#modelFilter.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
    this.#newWaypointPresenter.init(this.destinations, this.offers);
  }

  #renderSort() {
    this.#sortComponent = new EventSortingView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #renderNoWaypoint() {
    this.#noWaypointMessage = new EmptyListView({
      filterType: this.#filterType
    });
    render(this.#noWaypointMessage, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #handleModeChange = () => {
    this.#newWaypointPresenter.destroy();
    this.#waypointPresenter.forEach((presenter) => presenter.resetView());
  };

  #renderWaypoint(waypoint) {
    const waypointPresenter = new WaypointPresenter({
      waypointList: this.#waypointListComponent.element,
      offers: this.offers,
      destinations: this.destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    waypointPresenter.init(waypoint, this.destinations, this.offers);
    this.#waypointPresenter.set(waypoint.id, waypointPresenter);
  }

  #renderWaypointsList(waypoints) {
    waypoints.forEach((waypoint) => this.#renderWaypoint(waypoint));
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    const waypoints = this.waypoints;
    if (waypoints.length === 0) {
      this.#renderNoWaypoint();
      return;
    }
    this.#renderSort();
    render(this.#waypointListComponent, this.#boardContainer);
    this.#renderWaypointsList(waypoints);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case USER_ACTION.ADD_WAYPOINT:
        this.#newWaypointPresenter.setSaving();
        try {
          await this.#waypointsModel.addWaypoint(updateType, update);
        } catch (err) {
          this.#waypointPresenter.get(update.id).setAborting();
        }
        break;
      case USER_ACTION.UPDATE_WAYPOINT:
        this.#waypointPresenter.get(update.id).setSaving();
        try {
          await this.#waypointsModel.updateWaypoint(updateType, update);
        } catch (err) {
          this.#waypointPresenter.get(update.id).setAborting();
        }
        break;
      case USER_ACTION.DELETE_WAYPOINT:
        this.#waypointPresenter.get(update.id).setDeleting();
        try {
          await this.#waypointsModel.deleteWaypoint(updateType, update);
        } catch (err) {
          this.#waypointPresenter.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UPDATE_TYPE.PATCH:
        this.#waypointPresenter.get(data.id).init(data, this.destinations, this.offers);
        break;
      case UPDATE_TYPE.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UPDATE_TYPE.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UPDATE_TYPE.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #clearBoard(resetSortType = false) {
    this.#newWaypointPresenter.destroy();
    this.#waypointPresenter.forEach((presenter) => presenter.destroy());
    this.#waypointPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);

    if (this.#noWaypointMessage) {
      remove(this.#noWaypointMessage);
    }

    if (resetSortType) {
      this.#currentSortType = SORT_TYPE.DAY;
    }
  }
}
