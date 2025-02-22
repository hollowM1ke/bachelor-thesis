import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';

const personalDataAdapter = createEntityAdapter();
const initialState = personalDataAdapter.getInitialState();
const getPersonalDataObjId = id => `personalData-${id}`;
const getFlagInfoObjId = id => `${id}-flags`;
const getProgressInfoObjId = id => `${id}-progress`;

const DEFAULT_VALUE = {
    flags: {},
    progressTracker: {}
};

const personalDataSlice = createCRDTSupportedSlice({
    name: 'personalData',
    initialState,
    reducers: {
        setErrorPersonalData: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const personalData = state.entities[id];
                if (!personalData) return;
                personalData.personalDataObject.setError(err);
            },
            prepare (personalDataId, err) {
                return {
                    payload: {
                        id: personalDataId,
                        err: err
                    }
                };
            }
        },
        addFlag: {
            reducer (state, action) {
                const { id, componentId, flag, count } = action.payload;
                const personalData = state.entities[id];
                if (!personalData) return;
                personalData.personalDataObject.addFlag(componentId, flag, count);
            },
            prepare (id, componentId, flag, count = 0, skipSync = false) {
                return {
                    payload: {
                        id,
                        componentId,
                        flag,
                        count,
                        skipSync
                    }
                };
            }
        },
        removeFlag: {
            reducer (state, action) {
                const { id, componentId } = action.payload;
                const personalData = state.entities[id];
                if (!personalData) return;
                personalData.personalDataObject.removeFlag(componentId);
            },
            prepare (id, componentId, skipSync = false) {
                return {
                    payload: {
                        id,
                        componentId,
                        skipSync
                    }
                };
            }
        },
        addProgressTrackerItem: {
            reducer (state, action) {
                const { id, componentId, progressValue, label } = action.payload;
                const personalData = state.entities[id];
                if (!personalData) return;
                personalData.personalDataObject.addProgressTrackerItem(componentId, progressValue, label);
            },
            prepare (id, componentId, progressValue = 0, label = '', skipSync = false) {
                return {
                    payload: {
                        id,
                        componentId,
                        progressValue,
                        label,
                        skipSync
                    }
                };
            }
        },

        removeProgressTrackerItem: {
            reducer (state, action) {
                const { id, componentId } = action.payload;
                const personalData = state.entities[id];
                if (!personalData) return;
                personalData.personalDataObject.removeProgressTrackerItem(componentId);
            },
            prepare (id, componentId, skipSync = false) {
                return {
                    payload: {
                        id,
                        componentId,
                        skipSync
                    }
                };
            }
        },

        loadData (state, action) {
            const id = action.payload;
            const data = state.entities[id];
            if (!data) {
                const collectionName = getPersonalDataObjId(id);
                // Note: assume synchronized sync updates and non inconsistent state due to performance issues.
                const flagsInfoObject = getObject(collectionName, getFlagInfoObjId('board1'), id, 'YMap', applyflagsInfoObjectIncrementalChanges, 0, () => {}, 2);
                const progressInfoObject = getObject(collectionName, getProgressInfoObjId('board1'), id, 'YMap', applyprogressInfoObjectIncrementalChanges, 0, () => {}, 2);
                if (!process.env.test) {
                    getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect();
                }
                const newPersonalData = {
                    id,
                    personalDataObject: {
                        _type: 'PersonalData',
                        _crdt: true,
                        data: {
                            flags: {},
                            progressTracker: {}
                        },
                        crdtObjects: { flagsInfoObject, progressInfoObject }
                    }
                };
                personalDataAdapter.addOne(state, newPersonalData);
                setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 10);

                function applyflagsInfoObjectIncrementalChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const addFlag = createAction('personalData/addFlag');
                    const removeFlag = createAction('personalData/removeFlag');
                    yEvent.changes.keys.forEach((change, key) => {
                        const flagDetails = flagsInfoObject.get(key);
                        switch (change.action) {
                        case 'add':
                            action.store.dispatch(addFlag({ id: id, componentId: key, flag: flagDetails.flag || false, count: flagDetails.count || 0, skipSync: true }));
                            break;
                        case 'update':
                            action.store.dispatch(addFlag({ id: id, componentId: key, flag: flagDetails.flag || false, count: flagDetails.count || 0, skipSync: true }));
                            // action.store.dispatch(editComment({ commentIndex: textIndex, commentDescription: text, componentId: id, skipSync: false }));
                            break;
                        case 'delete':
                            action.store.dispatch(removeFlag({ id: id, componentId: key, skipSync: true }));
                            break;
                        default:
                            break;
                        }
                    });
                }
                function applyprogressInfoObjectIncrementalChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const addProgressTrackerLocalItem = createAction('personalData/addProgressTrackerItem');
                    const removeProgressTrackerItem = createAction('personalData/removeProgressTrackerItem');
                    yEvent.changes.keys.forEach((change, key) => {
                        let progressInfo = progressInfoObject.get(key);
                        // console.log('entered switch in progress tracker', change, progressInfo.progressValue, progressInfo.label, id, key);
                        switch (change.action) {
                        case 'add':
                            progressInfo = JSON.parse(progressInfo);
                            action.store.dispatch(addProgressTrackerLocalItem({ id: id, componentId: key, progressValue: progressInfo.progressValue, label: progressInfo.label, skipSync: true }));
                            break;
                        case 'update':
                            progressInfo = JSON.parse(progressInfo);
                            action.store.dispatch(addProgressTrackerLocalItem({ id: id, componentId: key, progressValue: progressInfo.progressValue, label: progressInfo.label, skipSync: true }));
                            // action.store.dispatch(editComment({ commentIndex: textIndex, commentDescription: text, componentId: id, skipSync: false }));
                            break;
                        case 'delete':
                            action.store.dispatch(removeProgressTrackerItem({ id: id, componentId: key, skipSync: true }));
                            break;
                        default:
                            break;
                        }
                    });
                }
            }
        }
    }
});

export default personalDataSlice.reducer;
export const crdtActions = personalDataSlice.crdtActions;
export const {
    setErrorPersonalData,
    addFlag,
    removeFlag,
    addProgressTrackerItem,
    removeProgressTrackerItem,
    loadData
} = personalDataSlice.actions;

const { selectById } = personalDataAdapter.getSelectors(state => state.personalData);
export const selectPersonalDataError = createSelector(selectById, personalData => {
    return personalData ? personalData.personalDataObject.data.err : null;
});
export const selectPersonalData = createSelector(selectById, personalData => {
    return personalData ? personalData.personalDataObject.data : DEFAULT_VALUE;
});
