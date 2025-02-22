import { combineReducers } from '@reduxjs/toolkit';

export const StoreMiddleware = store => next => action => {
    action.store = store;
    next(action);
};

/**
 * Reference {@link https://redux.js.org/usage/code-splitting}
 * @param store The redux store
 * @param staticReducers The initial static reducers
 * @returns A store with reducer injection functions
 */
export const addInjectReducer = (store, staticReducers) => {
    store.asyncReducers = {};

    store.injectReducer = (key, asyncReducer) => {
        store.asyncReducers[key] = asyncReducer;
        updateReducers();
    };

    store.removeReducer = (key) => {
        delete store.asyncReducers[key];
        updateReducers();
    };

    const updateReducers = () => {
        const newReducers = combineReducers({
            ...staticReducers,
            ...store.asyncReducers
        });
        store.replaceReducer(newReducers);
    };

    return store;
};
