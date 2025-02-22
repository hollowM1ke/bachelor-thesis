import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import * as Y from 'yjs';
import {
    getObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';

import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';

const DEFAULT_INIT = () => new Y.Doc();

const markdownsAdapter = createEntityAdapter();
const initialState = markdownsAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
const getMarkdownTextObjId = id => `${id}-text`;

const markdownsSlice = createCRDTSupportedSlice({
    name: 'markdowns',
    initialState,
    reducers: {
        setErrorMarkdown: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const markdown = state.entities[id];
                if (!markdown) return;
                markdown.textObject.setError(err);
            },
            prepare (markdownId, err) {
                return {
                    payload: {
                        id: markdownId,
                        err: err
                    }
                };
            }
        },
        setMarkdown: {
            reducer (state, action) {
                const { id, textObject } = action.payload;
                const markdown = state.entities[id];
                if (!markdown) return;
                markdown.textObject.setVal(textObject);
            },
            prepare (markdownId, textObject) {
                return {
                    payload: {
                        id: markdownId,
                        textObject
                    }
                };
            }
        },
        loadMarkdown (state, action) {
            const { id, boardId, initialState } = action.payload;
            const markdown = state.entities[id];
            if (!markdown) {
                const collectionName = getBoardObjId(boardId);
                const markdownTextObject = getObject(collectionName, getMarkdownTextObjId(id), id, 'YDoc', syncAll);
                if (initialState) {
                    if (initialState.value instanceof Y.Doc) {
                        const initState = Y.encodeStateAsUpdate(initialState.value);
                        Y.applyUpdate(markdownTextObject, initState);
                    } else {
                        const quill = markdownTextObject.getText('quill');
                        quill.applyDelta(initialState.value);
                    }
                }
                getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect();
                const newMarkdown = {
                    id,
                    textObject: {
                        _type: 'Markdown',
                        _crdt: true,
                        data: {
                            value: DEFAULT_INIT()
                        },
                        crdtObjects: { markdownTextObject }
                    }
                };
                function syncAll () {
                    setTimeout(() => {
                        if (markdownTextObject) { // avoid null updates
                            const updateMarkdown = createAction('markdowns/setMarkdown');
                            action.store.dispatch(updateMarkdown({ id, textObject: markdownTextObject, skipSync: true }));
                        }
                    }, 500);
                }
                markdownsAdapter.addOne(state, newMarkdown);
            }
        },
        unloadMarkdown (state, action) {
            const { id } = action.payload;
            const markdown = state.entities[id];
            if (!markdown) { return; }
            markdown.data.textObject.destroy();
            delete state.entities[id];
        }
    }
});

export default markdownsSlice.reducer;
export const {
    setErrorMarkdown,
    loadMarkdown,
    unloadMarkdown,
    setMarkdown
} = markdownsSlice.actions;

const { selectById } = markdownsAdapter.getSelectors(state => state.markdowns);
export const selectMarkdown = createSelector(selectById, markdown => {
    return markdown ? markdown.textObject.data.value : DEFAULT_INIT();
});
export const selectMarkdownError = createSelector(selectById, markdown => {
    return markdown ? markdown.textObject.data.err : null;
});
export const selectFullContext = (state, id) => {
    const markdown = state.markdowns.entities[id];
    const value = markdown ? markdown.textObject.data.value : DEFAULT_INIT();

    return {
        type: 'markdown',
        value
    };
};
