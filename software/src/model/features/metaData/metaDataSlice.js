import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
const metaDataAdapter = createEntityAdapter({});
const initialState = metaDataAdapter.getInitialState();
const DEFAULT_VALUE = {
    connected_flag: false
};
const metaDataSlice = createCRDTSupportedSlice({
    name: 'metaData',
    initialState,
    reducers: {
        changeFlag: (state, action) => {
            const { id, flag } = action.payload;
            const metaData = state.entities[id];
            if (!metaData) return;

            metaData.metaDataObject.changeFlag(flag);
        },
        loadState: (state, action) => {
            const { id, initialState } = action.payload;
            const existingState = state.entities[id];
            if (!existingState) {
                const newMetaData = {
                    id,
                    metaDataObject: {
                        _type: 'MetaData',
                        crdt: false,
                        data: {
                            value: {
                                connected_flag: true
                            }
                        },
                        crdtObjects: {}
                    }
                };
                if (initialState) {
                    for (const key in initialState) {
                        newMetaData.data.value[key] = initialState[key];
                    }
                }
                metaDataAdapter.addOne(state, newMetaData);
            }
        },
        unloadSate: (state, action) => {
            const { id } = action.payload;
            metaDataAdapter.removeOne(state, id);
        }
    }
});

export const { selectById } = metaDataAdapter.getSelectors(state => state.metaData);
export const selectMetaData = createSelector(selectById, metaData => {
    return metaData ? metaData.metaDataObject.data.value : DEFAULT_VALUE;
});
export const {
    loadState,
    unloadSate,
    changeFlag
} = metaDataSlice.actions;

export default metaDataSlice.reducer;
