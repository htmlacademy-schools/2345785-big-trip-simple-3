import Observable from '../framework/observable';
import {UPDATE_TYPE} from '../const-data';

export default class WaypointModel extends Observable{
  #waypoints = [];
  #waypointsApi = null;

  constructor(waypointsApi) {
    super();
    this.#waypointsApi = waypointsApi;
  }

  get waypoints() {
    return this.#waypoints;
  }

  async init() {
    try {
      const waypoints = await this.#waypointsApi.waypoints;
      this.#waypoints = waypoints.map(this.#adaptToClient);
    } catch(err) {
      this.#waypoints = [];
    }
    this._notify(UPDATE_TYPE.INIT);
  }

  async updateWaypoint(updateType, update) {
    const index = this.#waypoints.findIndex((waypoint) => waypoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting waypoint');
    }

    try {
      const response = await this.#waypointsApi.updateWaypoint(update);
      const updatedWaypoint = this.#adaptToClient(response);
      this.#waypoints = [
        ...this.#waypoints.slice(0, index),
        updatedWaypoint,
        ...this.#waypoints.slice(index + 1),
      ];
      this._notify(updateType, updatedWaypoint);
    } catch(err) {
      throw new Error('Can\'t update waypoint');
    }
  }

  async addWaypoint(updateType, update) {
    try {
      const response = await this.#waypointsApi.addWaypoint(update);
      const newWaypoint = this.#adaptToClient(response);
      this.#waypoints = [newWaypoint, ...this.#waypoints];
      this._notify(updateType, newWaypoint);
    } catch (err) {
      throw new Error('Can\'t add waypoint');
    }
  }

  async deleteWaypoint(updateType, update) {
    const index = this.#waypoints.findIndex((waypont) => waypont.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting waypoint');
    }
    try {
      await this.#waypointsApi.deleteWaypoint(update);
      this.#waypoints = [
        ...this.#waypoints.slice(0, index),
        ...this.#waypoints.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete waypoint');
    }
  }

  #adaptToClient(waypoint) {
    const adaptedWaypoint = {...waypoint,
      dateFrom: waypoint['date_from'],
      dateTo: waypoint['date_to'],
      offersIDs: waypoint['offers'],
      basePrice: waypoint['base_price'],
    };

    delete adaptedWaypoint['date_from'];
    delete adaptedWaypoint['date_to'];
    delete adaptedWaypoint['base_price'];
    delete adaptedWaypoint['offers'];

    return adaptedWaypoint;
  }
}
