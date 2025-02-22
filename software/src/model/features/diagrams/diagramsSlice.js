import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { DiagramProxy } from '../EntityProxies/DiagramProxy';
import CRDTExecutor from '../../app/plugins/CRDT/CRDTExecutor';

const diagramsAdapter = createEntityAdapter();
const initialState = diagramsAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
// TODO Why not a single map ???
const getDiagramType = id => `${id}-diagramType`;
const getDiagramSSId = id => `${id}-spreadsheetid`;
const getDiagramSettings = id => `${id}-diagramSettings`;

// label, diagType, diagSettings(Store all diag/chart setting in one obj. Opposed to individual keys to allow ease for expanding to more diagTypes)
const DEFAULT_VALUE = {
    type: '',
    ssid: '',
    settings: '{}'
};

const diagramsSlice = createCRDTSupportedSlice({
    name: 'diagrams',
    initialState,
    reducers: {
        setErrorDiagram: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const diagram = state.entities[id];
                if (!diagram) return;
                diagram.diagramObject.setError(err);
            },
            prepare (diagramId, err) {
                return {
                    payload: {
                        id: diagramId,
                        err: err
                    }
                };
            }
        },
        setDiagramType: {
            reducer (state, action) {
                const { id, type } = action.payload;
                const diagram = state.entities[id];
                if (!diagram) return; // TODO Shouldn't this be logged?
                diagram.diagramObject.setDiagramType(id, type);
            },
            prepare (diagramId, type) {
                return {
                    payload: {
                        id: diagramId,
                        type
                    }
                };
            }
        },
        setDiagramSSID: {
            reducer (state, action) {
                const { id, ssid } = action.payload;
                const diagram = state.entities[id];
                if (!diagram) return;
                diagram.diagramObject.setDiagramSSID(id, ssid);
            },
            prepare (diagramId, ssid) {
                return {
                    payload: {
                        id: diagramId,
                        ssid
                    }
                };
            }
        },
        setDiagramSettings: {
            reducer (state, action) {
                const { id, settings } = action.payload;
                const diagram = state.entities[id];
                if (!diagram) return;
                diagram.diagramObject.setDiagramSettings(id, settings);
            },
            prepare (diagramId, settings) {
                return {
                    payload: {
                        id: diagramId,
                        settings
                    }
                };
            }
        },
        loadDiagram (state, action) {
            const { id, boardId, initialState } = action.payload;
            const diagram = state.entities[id];
            if (!diagram) {
                const collectionName = getBoardObjId(boardId);
                const diagramTypeObject = getObject(collectionName, getDiagramType(id), id, 'YMap', applydiagramTypeObjectchanges);
                const SSIdObject = getObject(collectionName, getDiagramSSId(id), id, 'YMap', applySSIdObjectchanges);
                const settingsObject = getObject(collectionName, getDiagramSettings(id), id, 'YMap', applySettingsObjectchanges);
                if (!process.env.test) { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }
                const crdtObjects = { diagramTypeObject, SSIdObject, settingsObject };
                const newDiagram = {
                    id,
                    diagramObject: {
                        _type: 'Diagram',
                        _crdt: true,
                        data: {
                            value: {
                                type: '',
                                ssid: '',
                                settings: '{}'
                            }
                        },
                        crdtObjects
                    }
                };
                function applydiagramTypeObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalyDiagramType = createAction('diagrams/setDiagramType');
                        switch (change.action) {
                        case 'add':
                        case 'update': {
                            const newType = diagramTypeObject.get(key);
                            action.store.dispatch(setLocalyDiagramType({ id, type: newType, skipSync: true }));
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
                function applySSIdObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalDiagramSSID = createAction('diagrams/setDiagramSSID');
                        switch (change.action) {
                        case 'add':
                        case 'update': {
                            const newSSID = SSIdObject.get(key);
                            action.store.dispatch(setLocalDiagramSSID({ id, ssid: newSSID, skipSync: true }));
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
                function applySettingsObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalDiagramSettings = createAction('diagrams/setDiagramSettings');
                        switch (change.action) {
                        case 'add':
                        case 'update': {
                            const newSettings = settingsObject.get(key);
                            action.store.dispatch(setLocalDiagramSettings({ id, settings: newSettings, skipSync: true }));
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

                if (!process.env.test && initialState !== undefined) {
                    const executor = CRDTExecutor();
                    const diagramHandler = new DiagramProxy(newDiagram.diagramObject.data, crdtObjects, executor);
                    diagramHandler.setDiagramType(id, initialState.value.type);
                    diagramHandler.setDiagramSSID(id, initialState.value.ssid);
                    diagramHandler.setDiagramSettings(id, initialState.value.settings);
                    executor.flush();
                } else {
                    // setTimeout(syncAll, LOAD_AFTER);
                }
                setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 50);
                diagramsAdapter.addOne(state, newDiagram);
            }
        },
        unloadDiagram (state, action) {
            const { id, boardId } = action.payload;
            const diagram = state.entities[id];
            if (!diagram) { return; }

            const collectionName = getBoardObjId(boardId);
            diagram.destroy();
            removeObject(collectionName, getDiagramType(id));
            removeObject(collectionName, getDiagramSSId(id));
            removeObject(collectionName, getDiagramSettings(id));
            delete state.entities[id];
        }
    }
});

export default diagramsSlice.reducer;
export const {
    setErrorDiagram,
    loadDiagram,
    unloadDiagram,
    setDiagramType,
    setDiagramSSID,
    setDiagramSettings
} = diagramsSlice.actions;

const { selectById } = diagramsAdapter.getSelectors(state => state.diagrams);
export const selectDiagram = createSelector(selectById, diagram => {
    return diagram ? diagram.diagramObject.data.value : DEFAULT_VALUE;
});
export const selectDiagramError = createSelector(selectById, diagram => {
    return diagram ? diagram.diagramObject.data.err : null;
});
export const selectFullContext = (state, id) => {
    const diagram = state.diagrams.entities[id];
    const value = diagram ? diagram.diagramObject.data.value : DEFAULT_VALUE;
    return {
        type: 'diagram',
        value
    };
};
