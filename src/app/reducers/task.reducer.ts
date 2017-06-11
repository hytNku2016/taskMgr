import {Task, TaskList, Project} from '../domain';
import {createSelector} from 'reselect';
import {covertArrToObj, buildObjFromArr} from '../utils/reduer.util';
import * as actions from '../actions/task.action';
import * as prjActions from '../actions/project.action';
import * as _ from 'lodash';

export interface State {
  ids: string[];
  entities: { [id: string]: Task };
  loading: boolean;
}

export const initialState: State = {
  ids: [],
  entities: {},
  loading: false,
};

export function reducer(state = initialState, action: actions.Actions): State {
  switch (action.type) {
    case actions.ActionTypes.LOAD:
    case actions.ActionTypes.DELETE:
    case actions.ActionTypes.UPDATE:
    case actions.ActionTypes.ADD:
      return {...state, loading: true};
    case actions.ActionTypes.ADD_SUCCESS: {
      const task = <Task>action.payload;
      if (state.entities[task.id]) {
        return state;
      }
      const newIds = [...state.ids, task.id];
      const newEntities = {...state.entities, [task.id]: task};
      return {ids: newIds, entities: newEntities, loading: false};
    }
    case actions.ActionTypes.DELETE_SUCCESS: {
      const task = <Task>action.payload;
      const newIds = state.ids.filter(id => id !== task.id);
      const newEntities = buildObjFromArr(newIds, state.entities);
      return {ids: newIds, entities: newEntities, loading: false}
    }
    case prjActions.ActionTypes.DELETE_SUCCESS: {
      const project = <Project>action.payload;
      const listIds = project.taskLists;
      const remainingIds = state.ids.filter(id => _.indexOf(listIds, state.entities[id].taskListId) === -1);
      const remainingEntities = buildObjFromArr(remainingIds, state.entities);
      return {ids: remainingIds, entities: remainingEntities, loading: false}
    }
    case actions.ActionTypes.MOVE_SUCCESS:
    case actions.ActionTypes.COMPLETE_SUCCESS:
    case actions.ActionTypes.UPDATE_SUCCESS: {
      const task = <Task>action.payload;
      const entities = {...state.entities, [task.id]: task};
      return {...state, entities: entities, loading: false};
    }
    case actions.ActionTypes.LOAD_SUCCESS: {
      const tasks = <Task[]>action.payload;
      if (tasks.length === 0) {
        return state;
      }
      const newTasks = tasks.filter(task => !state.entities[task.id]);
      const newIds = newTasks.map(task => task.id);
      const newEntities = covertArrToObj(newTasks);
      return {
        ids: [...state.ids, ...newIds],
        entities: {...state.entities, ...newEntities},
        loading: false
      };
    }
    case actions.ActionTypes.MOVE_ALL_SUCCESS: {
      const tasks = <Task[]>action.payload;
      // if task is null then return the orginal state
      if (tasks === null) {
        return state;
      }
      const updatedTasks = tasks.filter(task => state.entities[task.id]);
      const updatedEntities = covertArrToObj(updatedTasks);
      return {...state, entities: {...state.entities, ...updatedEntities}};
    }
    case actions.ActionTypes.COMPLETE_FAIL:
    case actions.ActionTypes.MOVE_FAIL:
    case actions.ActionTypes.LOAD_FAIL:
    case actions.ActionTypes.ADD_FAIL:
    case actions.ActionTypes.UPDATE_FAIL:
    case actions.ActionTypes.DELETE_FAIL:
      return {...state, loading: false};
    default:
      return state;
  }
}

export const getEntities = (state) => state.entities;
export const getIds = (state) => state.ids;
export const getLoading = (state) => state.loading;
export const getTasks = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});
