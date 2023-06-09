import {FILTER_TYPE, FILTER_TYPE_DESCRIPTION, UPDATE_TYPE} from '../const-data';
import FilterView from '../view/filters-form';
import {render, remove, replace} from '../framework/render';


export default class FilterPresenter {
  #filterContainer = null;
  #modelFilter = null;
  #modelWaypoints = null;

  #filterComponent = null;

  constructor({filterContainer, modelFilter, modelWaypoints}) {
    this.#filterContainer = filterContainer;
    this.#modelFilter = modelFilter;
    this.#modelWaypoints = modelWaypoints;

    this.#modelWaypoints.addObserver(this.#handleModelEvent);
    this.#modelFilter.addObserver(this.#handleModelEvent);
  }

  get filters() {
    return [FILTER_TYPE.EVERYTHING, FILTER_TYPE.FUTURE, FILTER_TYPE.PAST].map((type) => ({
      type,
      name: FILTER_TYPE_DESCRIPTION[type]
    }));
  }

  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#modelFilter.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#modelFilter.filter === filterType) {
      return;
    }

    this.#modelFilter.setFilter(UPDATE_TYPE.MAJOR, filterType);
  };
}
