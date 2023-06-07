import DestinationModel from './model/destination-model.js';
import Presenter from './presenter/presenter.js';
import WaypointModel from './model/waypoint-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import {render} from './framework/render.js';
import NewWaypointButton from './view/new-waypoint-button-form.js';
import OfferModel from './model/offer-model.js';
import WaypointsApi from './api.js';
import { generateKey } from './utils/util.js';

const siteHeaderElement = document.querySelector('.trip-controls__filters');
const container = document.querySelector('.trip-events');
const placeForButton = document.querySelector('.trip-main');

const AUTHORIZATION = `Basic ${generateKey(10)}`;
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const waypointsApi = new WaypointsApi(END_POINT, AUTHORIZATION);

const modelWaypoints = new WaypointModel(waypointsApi);
const modelOffers = new OfferModel(waypointsApi);
const modelDestinations = new DestinationModel(waypointsApi);
const modelFilter = new FilterModel();

const presenter = new Presenter({
  boardContainer: container,
  waypointsModel: modelWaypoints,
  modelOffers,
  modelDestinations,
  modelFilter,
  onNewWaypointDestroy: handleNewTaskFormClose
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteHeaderElement,
  modelFilter,
  modelWaypoints
});

const newWaypointButtonComponent = new NewWaypointButton({
  onClick: handleNewTaskButtonClick
});

function handleNewTaskFormClose() {
  newWaypointButtonComponent.element.disabled = false;
}

function handleNewTaskButtonClick() {
  presenter.createWaypoint();
  newWaypointButtonComponent.element.disabled = true;
}

filterPresenter.init();
presenter.init();
modelWaypoints.init().finally(() => {render(newWaypointButtonComponent, placeForButton);});
