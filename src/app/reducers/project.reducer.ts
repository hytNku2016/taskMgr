import {Project} from '../domain';
import {createSelector} from 'reselect';
import {covertArrToObj, buildObjFromArr} from '../utils/reduer.util';
import * as actions from '../actions/project.action';

export interface State {
  ids: string[];
  entities: { [id: string]: Project };
  selectedId: string | null;
}

export const initialState: State = {
  ids: [],
  entities: {},
  selectedId: null,
};

const updateObject = (oldObject, newValues) => {
  return {...oldObject, ...newValues};
}


export function reducer(state = initialState, action: actions.Actions): State {
  switch (action.type) {
    case actions.ActionTypes.ADD_SUCCESS: {
      const project = action.payload;
      if (state.entities[project.id]) {
        return state;
      }
      const ids = [...state.ids, project.id];
      const entities = {...state.entities, [project.id]: project};
      return {...state, ids: ids, entities: entities};
    }
    case actions.ActionTypes.DELETE_SUCCESS: {
      const project = action.payload;
      const ids = state.ids.filter(id => id !== project.id);
      if (ids.length === 0) {
        return state;
      }
      const newEntities = buildObjFromArr(ids, state.entities);
      return {
        ids: ids,
        entities: newEntities,
        selectedId: project.id === state.selectedId ? null : state.selectedId
      };
    }
    case actions.ActionTypes.INVITE_SUCCESS:
    case actions.ActionTypes.UPDATE_LISTS_SUCCESS:
    case actions.ActionTypes.UPDATE_SUCCESS: {
      const project = action.payload;
      const entities = {...state.entities, [project.id]: project};
      return {...state, entities: entities};
    }
    case actions.ActionTypes.LOADS_SUCCESS: {
      const projects = action.payload;
      // if projects is null then return the orginal state
      if (projects === null) {
        return state;
      }
      const newProjects = projects.filter(project => !state.entities[project.id]);
      const newIds = newProjects.map(project => project.id);
      if (newProjects.length === 0) {
        return state;
      }
      const newEntities = covertArrToObj(newProjects);
      return {
        ids: [...state.ids, ...newIds],
        entities: {...state.entities, ...newEntities},
        selectedId: null
      };
    }
    case actions.ActionTypes.SELECT: {
      return {...state, selectedId: action.payload.id};
    }
    case actions.ActionTypes.LOADS_FAIL:
    case actions.ActionTypes.ADD_FAIL:
    case actions.ActionTypes.UPDATE_LISTS_FAIL:
    case actions.ActionTypes.UPDATE_FAIL:
    case actions.ActionTypes.DELETE_FAIL:
    default:
      return state;
  }
}

export const getEntities = (state) => state.entities;
export const getSelectedId = (state) => state.selectedId;
export const getIds = (state) => state.ids;
export const getSelected = createSelector(getEntities, getSelectedId, (entities, selectedId) => {
  return entities[selectedId];
});
export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});
