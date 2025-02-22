import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { HTMLProxy } from '../EntityProxies/HTMLProxy';
import CRDTExecutor from '../../app/plugins/CRDT/CRDTExecutor';

const DEFAULT_VAL = '';
const LOAD_AFTER = 1000;
const htmlsAdapter = createEntityAdapter();
const initialState = htmlsAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
const getHtmlTextObjectId = id => `${id}-html`;

const htmlsSlice = createCRDTSupportedSlice({
    name: 'htmls',
    initialState,
    reducers: {
        setHTML: {
            reducer (state, action) {
                const { htmlId, htmlVal } = action.payload;

                if (!htmlVal) return;
                const html = state.entities[htmlId];
                if (!html) return;
                html.htmlObject.setHTMLValue(htmlId, htmlVal);
            },
            prepare (htmlId, htmlVal) {
                return {
                    payload: {
                        htmlId,
                        htmlVal
                    }
                };
            }
        },
        loadHTML (state, action) {
            const { id, boardId, initialState } = action.payload;
            const html = state.entities[id];
            if (!html) {
                const collectionName = getBoardObjId(boardId);
                const htmlTextObject = getObject(collectionName, getHtmlTextObjectId(id), id, 'YMap', applyhtmlTextObjectchanges);
                getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect();
                const crdtObjects = { htmlTextObject };
                const newHTML = {
                    id,
                    htmlObject: {
                        _type: 'HTML',
                        _crdt: true,
                        data: {
                            value: ''
                        },
                        crdtObjects
                    }
                };
                function applyhtmlTextObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalHtml = createAction('htmls/setHTML');
                        const value = htmlTextObject.get(key);
                        switch (change.action) {
                        case 'update':
                        case 'add': {
                            action.store.dispatch(setLocalHtml({ htmlId: id, htmlVal: value, skipSync: true }));
                            break;
                        }
                        case 'delete': {
                            break;
                        }
                        default:
                            break;
                        }
                    });
                }
                function syncAll () {
                    let htmlTextData = '';
                    htmlTextData = htmlTextObject.get(getHtmlTextObjectId(id));
                    const updateHTML = createAction('htmls/setHTML');
                    action.store.dispatch(updateHTML({ htmlId: id, htmlVal: htmlTextData }));
                }

                if (initialState) {
                    const executor = CRDTExecutor();
                    const htmlHandler = new HTMLProxy(newHTML.htmlObject.data, crdtObjects, executor);
                    htmlHandler.setHTMLValue(id, initialState.value);
                    executor.flush();
                } else {
                    setTimeout(syncAll, LOAD_AFTER);
                }
                setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 50);
                htmlsAdapter.addOne(state, newHTML);
            }
        },
        unloadHTML (state, action) {
            const { id, boardId } = action.payload;
            const html = state.entities[id];
            if (!html) { return; }
            const collectionName = getBoardObjId(boardId);
            removeObject(collectionName, getHtmlTextObjectId(id));
            delete state.entities[id];
        }
    }
});

export default htmlsSlice.reducer;
export const {
    loadHTML,
    unloadHTML,
    setHTML
} = htmlsSlice.actions;

const { selectById } = htmlsAdapter.getSelectors(state => state.htmls);
export const selectHTML = createSelector(selectById, html => {
    return html ? html.htmlObject.data.value : DEFAULT_VAL;
});

export const selectFullContext = (state, id) => {
    const html = state.htmls.entities[id];
    const value = html ? html.htmlObject.data.value : DEFAULT_VAL;

    return {
        type: 'htmlcomp',
        value
    };
};
