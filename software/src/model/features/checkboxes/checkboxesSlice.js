import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import {
    decodeBoolean
} from '../functions/booleanFunctions';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { CheckboxProxy } from '../EntityProxies/CheckboxProxy';
import CRDTExecutor from '../../app/plugins/CRDT/CRDTExecutor';

const checkboxesAdapter = createEntityAdapter();
const initialState = checkboxesAdapter.getInitialState();

const getBoardObjId = id => `board-${id}`;
const getCheckboxObjectNameId = id => `${id}-box`;
const checkboxesSlice = createCRDTSupportedSlice({
    name: 'checkboxes',
    initialState,
    reducers: {
        setErrorCheckbox: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const checkbox = state.entities[id];
                if (!checkbox) return;
                checkbox.checkboxObject.setError(err);
            },
            prepare (checkboxId, err) {
                return {
                    payload: {
                        id: checkboxId,
                        err: err
                    }
                };
            }
        },
        setCheckbox: {
            reducer (state, action, boardId) {
                const { checkboxId, checked } = action.payload;
                const checkbox = state.entities[checkboxId];
                if (!checkbox) return;
                checkbox.checkBoxObject.setCheckbox(checkboxId, checked);
            },
            prepare (checkboxId, checked) {
                return {
                    payload: {
                        checkboxId,
                        checked
                    }
                };
            }
        },
        loadCheckbox (state, action) {
            const { id, boardId, initialState } = action.payload;
            const checkbox = state.entities[id];
            if (!checkbox) {
                const collectionName = getBoardObjId(boardId);
                const checkboxObjectMap = getObject(collectionName, getCheckboxObjectNameId(id), id, 'YMap', applycheckboxObjectMapchanges);
                if (!process.env.test) { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }
                const crdtObjects = { checkboxObjectMap };
                const newCheckbox = {
                    id,
                    checkBoxObject: {
                        _type: 'Checkbox',
                        _crdt: true,
                        data: {
                            checked: false
                        },
                        crdtObjects
                    }
                };
                function applycheckboxObjectMapchanges (yevent = null) {
                    const updatedChecked = decodeBoolean(checkboxObjectMap.get(id));
                    const updateCheckboxLocaly = createAction('checkboxes/setCheckbox');
                    action.store.dispatch(updateCheckboxLocaly({ checkboxId: id, checked: updatedChecked, skipSync: true }));
                }

                if (initialState && !process.env.test) {
                    const executor = CRDTExecutor();
                    const checkboxHandler = new CheckboxProxy(newCheckbox.checkBoxObject.data, crdtObjects, executor);
                    checkboxHandler.setCheckbox(id, initialState.value);
                    executor.flush();
                } else {
                    // setTimeout(syncAll, LOAD_AFTER);
                }

                checkboxesAdapter.addOne(state, newCheckbox);
            }
        },
        unloadCheckbox (state, action) {
            const { id, boardId } = action.payload;
            const checkbox = state.entities[id];
            if (!checkbox) { return; }
            const collectionName = getBoardObjId(boardId);
            removeObject(collectionName, getCheckboxObjectNameId(id));
            delete state.entities[id];
        }
    }
});

export default checkboxesSlice.reducer;
export const {
    loadCheckbox,
    unloadCheckbox,
    setCheckbox,
    setErrorCheckbox
} = checkboxesSlice.actions;

const { selectById } = checkboxesAdapter.getSelectors(state => state.checkboxes);
export const selectCheckbox = createSelector(selectById, checkbox => {
    return checkbox ? checkbox.checkBoxObject.data.checked : false;
});

export const selectCheckboxError = createSelector(selectById, checkbox => {
    return checkbox ? checkbox.checkBoxObject.data.err : null;
});

export const selectFullContext = (state, id) => {
    const checkbox = state.checkboxes.entities[id];
    const value = checkbox ? checkbox.checkBoxObject.data.checked : false;

    return {
        type: 'checkbox',
        value
    };
};
