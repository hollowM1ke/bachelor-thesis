import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from '../features/boards/boardsSlice';
import spreadSheetReducer from '../features/spreadsheets/spreadsheetsSlice';
import imagesReducer from '../features/images/imagesSlice';
import checkboxesReducer from '../features/checkboxes/checkboxesSlice';
import todoListsReducer from '../features/todolists/todolistsSlice';
import markdownsReducer from '../features/markdowns/markdownsSlice';
import htmlsReducer from '../features/htmls/htmlsSlice';
import diagramsReducer from '../features/diagrams/diagramsSlice';
import metaDataReducer from '../features/metaData/metaDataSlice';
import { CRDTToolsMiddleware } from './plugins/CRDT/CRDTPlugins';
import { ErrorHandlingMiddleware } from './plugins/ErrorHandlingPlugin';
import CRDTStorage from './plugins/CRDT/CRDTStorage';
import { StoreMiddleware, addInjectReducer } from './plugins/StorePlugin';
import commentsReducer from '../features/comments/commentsSlice';
import personalDataReducer from '../features/personaldata/personaldataSlice';

const StaticReducers = {
    boards: boardsReducer,
    spreadsheets: spreadSheetReducer,
    images: imagesReducer,
    checkboxes: checkboxesReducer,
    todolists: todoListsReducer,
    markdowns: markdownsReducer,
    htmls: htmlsReducer,
    diagrams: diagramsReducer,
    comments: commentsReducer,
    personalData: personalDataReducer,
    metaData: metaDataReducer
};

export const store = addInjectReducer(configureStore({
    reducer: StaticReducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(
        CRDTToolsMiddleware(CRDTStorage()),
        ErrorHandlingMiddleware,
        StoreMiddleware
    )
}), StaticReducers);

// only used for tests
export function setupStore (preloadedState = {}) {
    return addInjectReducer(configureStore({
        reducer: StaticReducers,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: false
        }).concat(
            CRDTToolsMiddleware(CRDTStorage()),
            ErrorHandlingMiddleware,
            StoreMiddleware
        ),
        preloadedState
    }), StaticReducers);
};
