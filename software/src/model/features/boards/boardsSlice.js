import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    decodeComponentInfo,
    encodeConnection,
    decodeConnection
} from './boardFunctions';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { generatePseudoRandomId } from '../../../services/ids';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { DEFAULT_COMPONENT_SIZE } from '../EntityProxies/BoardProxy';
import { changeFlag } from '../metaData/metaDataSlice';
const boardAdapter = createEntityAdapter();

const initialState = boardAdapter.getInitialState();

const getBoardObjId = id => `board-${id}`;
const getComponentInfoObjId = id => `${id}-components`;
const getBoardConnectionsObjId = id => `${id}-connections`;
const getComponentHeightsObjId = id => `${id}-heights`;
const getComponentWidthsObjId = id => `${id}-widths`;
const DEFAULT_VALUE = {
    components: {},
    connections: []
};

const boardsSlice = createCRDTSupportedSlice({
    name: 'boards',
    initialState,
    reducers: {
        setErrorBoard: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.setError(err);
            },
            prepare (boardId, err) {
                return {
                    payload: {
                        id: boardId,
                        err: err
                    }
                };
            }
        },
        addComponent: {
            reducer (state, action) {
                const { id, type, componentId, position, innerId, size, createdBy, createdOn, componentName, description, labelId, flag, count, loadSkip, isExternal } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.addComponent(componentId, type, position, innerId, createdBy, createdOn, componentName, description, size, labelId, flag, count, loadSkip, isExternal);
            },
            prepare ({
                id, type, innerId, position, componentInfo = {
                    componentId: generatePseudoRandomId(),
                    size: DEFAULT_COMPONENT_SIZE
                }, createdBy, createdOn, componentName, description, labelId = generatePseudoRandomId(), flag = false, count = 0, loadSkip = false, isExternal = false
            }) {
                return {
                    payload: {
                        id,
                        type,
                        componentId: componentInfo.componentId,
                        innerId,
                        position,
                        createdBy,
                        createdOn,
                        componentName,
                        description,
                        size: componentInfo.size,
                        labelId,
                        flag,
                        count,
                        loadSkip,
                        isExternal
                    }
                };
            }
        },
        removeComponent: {
            reducer (state, action) {
                const { id, componentId } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.removeComponent(componentId);
            },
            prepare (id, componentId) {
                return {
                    payload: { id, componentId }
                };
            }
        },
        addLabel: {
            reducer (state, action) {
                const { id, labelId, description, flag, count, componentId } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.addComponentLabel(componentId, labelId, description, flag, count);
            },
            prepare (id, labelId, description, flag, count, componentId) {
                return {
                    payload: {
                        id,
                        labelId,
                        description,
                        flag,
                        count,
                        componentId
                    }
                };
            }
        },
        removeLabel: {
            reducer (state, action) {
                const { id, componentId } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.removeComponentLabel(componentId);
            },
            prepare (id, labelId, componentId) {
                return {
                    payload: {
                        id,
                        labelId, // Dont need the labelId now but maybe later who nows
                        componentId
                    }
                };
            }
        },
        updateSize: {
            reducer (state, action) {
                const { id, componentId, size } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.setComponentSize(componentId, size);
            },
            prepare (id, componentId, size) {
                return {
                    payload: {
                        id,
                        componentId,
                        size
                    }
                };
            }
        },
        moveComponent: {
            reducer (state, action) {
                const { id, componentId, position } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.moveComponent(componentId, position);
            },
            prepare (id, componentId, position, sync) {
                return {
                    payload: {
                        id,
                        componentId,
                        position,
                        skipSync: !sync
                    }
                };
            }
        },
        addConnection: {
            reducer (state, action) {
                const { id, connectionId, from, to } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.addArrow(from, to, connectionId);
            },
            prepare (id, fromComponentId, toComponentId) {
                return {
                    payload: {
                        id,
                        connectionId: encodeConnection(fromComponentId, toComponentId),
                        from: fromComponentId,
                        to: toComponentId
                    }
                };
            }
        },
        removeAllConnections: {
            reducer (state, action) {
                const { id, componentId } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.removeAllComponentArrows(componentId);
            },
            prepare (id, componentId) {
                return {
                    payload: {
                        id,
                        componentId
                    }
                };
            }
        },
        removeConnection: {
            reducer (state, action) {
                const { id, connectionId } = action.payload;
                const board = state.entities[id];
                if (!board) return;
                board.boardObject.removeArrow(connectionId);
            },
            prepare (id, fromComponentId, toComponentId) {
                return {
                    payload: {
                        id,
                        connectionId: encodeConnection(fromComponentId, toComponentId)
                    }
                };
            }
        },
        loadBoard (state, action) {
            const id = action.payload;
            const board = state.entities[id];
            if (!board) {
                const collectionName = getBoardObjId(id);
                // Note: assume synchronized sync updates and non inconsistent state due to performance issues.
                const wsProivderFunc = (event) => {
                    if (event.status === 'connected') {
                        action.store.dispatch(changeFlag({ id: process.env.REACT_APP_META_DATA_ID, flag: true }));
                    } else {
                        action.store.dispatch(changeFlag({ id: process.env.REACT_APP_META_DATA_ID, flag: false }));
                    }
                };
                const componentsInfoObject = getObject(collectionName, getComponentInfoObjId('board1'), id, 'YMap', applycomponentsInfoObjectIncrementalChanges, 0, wsProivderFunc);
                const connectionsObject = getObject(collectionName, getBoardConnectionsObjId('board1'), id, 'YMap', applyconnectionsObjectIncrementalChanges); // ideally, use a set
                // only connect the websocket if we are not in test mode because in the test we don`t want any sideffects and we don`t need the websocket in the tests
                if (!process.env.test) {
                    getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect();
                }
                const newBoard = {
                    id,
                    boardObject: {
                        _type: 'Board',
                        _crdt: true,
                        data: {
                            components: {},
                            connections: {}
                        },
                        crdtObjects: { componentsInfoObject, connectionsObject }
                    }
                };

                // setTimeout(syncAll, LOAD_AFTER); // Load first
                function applycomponentsInfoObjectIncrementalChanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const addLocalLabel = createAction('boards/addLabel');
                        const removeLocalLabel = createAction('boards/removeLabel');
                        const updateLocalSize = createAction('boards/updateSize');
                        const moveLocalComponent = createAction('boards/moveComponent');
                        const addLocalComponent = createAction('boards/addComponent');
                        const removeLocalComponent = createAction('boards/removeComponent');
                        const newValue = componentsInfoObject.get(key) ? decodeComponentInfo(componentsInfoObject.get(key)) : undefined; // when component is deleted and it was the last component on the board than decodeCOmponentInfo would get undifiend as input what is not allowed.
                        switch (change.action) {
                        case 'update': {
                            const oldValue = change.oldValue ? decodeComponentInfo(change.oldValue) : {};
                            if (newValue.label && ((!oldValue.label && newValue.label) || !(JSON.stringify(oldValue.label) === JSON.stringify(newValue.label)))) { // case label was added or changed
                                action.store.dispatch(addLocalLabel({ id: id, labelId: newValue.label.labelId, description: newValue.label.description, flag: newValue.label.flag, count: newValue.label.count, componentId: key, skipSync: true }));
                            } else if (oldValue.label && !newValue.label) { // case label was removed
                                action.store.dispatch(removeLocalLabel({ id: id, componentId: key }));
                            } else if (!(JSON.stringify(oldValue.size) === JSON.stringify(newValue.size))) { // case size was changed
                                action.store.dispatch(updateLocalSize({ id: id, componentId: key, size: newValue.size, skipSync: true }));
                            } else { // case position was changed
                                action.store.dispatch(moveLocalComponent({ id: id, componentId: key, position: newValue.position, skipSync: true }));
                            }
                            break;
                        }
                        case 'add': {
                            const newLabel = newValue ? newValue.label : {};
                            action.store.dispatch(addLocalComponent({ id: id, type: newValue.type, innerId: newValue.innerId, position: newValue.position, componentId: key, size: newValue.size, createdBy: newValue.createdBy, createdOn: newValue.createdOn, componentName: newValue.componentName, description: newLabel ? newLabel.description : undefined, labelId: newLabel ? newLabel.labelId : undefined, flag: newLabel ? newLabel.flag : undefined, count: newLabel ? newLabel.count : 0, isExternal: true, skipSync: true }));
                            break;
                        }
                        case 'delete': {
                            action.store.dispatch(removeLocalComponent({ id: id, componentId: key, skipSync: true }));
                            break;
                        }
                        default:
                            break;
                        }
                    });
                }
                function applyconnectionsObjectIncrementalChanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    const addArrowLocaly = createAction('boards/addConnection');
                    const removeLocalConnection = createAction('boards/removeConnection');
                    yevent.changes.keys.forEach((change, key) => {
                        switch (change.action) {
                        case 'update': {
                            break;
                        }
                        case 'add': {
                            const { from, to } = decodeConnection(key);
                            action.store.dispatch(addArrowLocaly({ id: id, connectionId: key, from: from, to: to, skipSync: true }));
                            break;
                        }
                        case 'delete': {
                            action.store.dispatch(removeLocalConnection({ id: id, connectionId: key, skipSync: true }));
                            break;
                        }
                        default:
                            break;
                        }
                    });
                }
                boardAdapter.addOne(state, newBoard);
                // setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 10);
            }
        },
        unloadBoard (state, action) {
            const id = action.payload;
            const board = state.entities[id];
            if (!board) return;
            delete state.entities[id];

            const collectionName = getBoardObjId(id);
            board.boardObject.destroy(); // todo: this doesn't look right. destroy shouldn't exist.
            removeObject(collectionName, getComponentInfoObjId(id));
            removeObject(collectionName, getBoardConnectionsObjId(id));
            removeObject(collectionName, getComponentHeightsObjId(id));
            removeObject(collectionName, getComponentWidthsObjId(id));
        }
    }
});

export default boardsSlice.reducer;
export const crdtActions = boardsSlice.crdtActions;
export const {
    setErrorBoard,
    loadBoard,
    unloadBoard,
    removeConnection,
    addConnection,
    removeAllConnections,
    addComponent,
    moveComponent,
    updateSize,
    addLabel,
    removeLabel
} = boardsSlice.actions;
export const removeComponent = function (id, componentId) {
    return dispatch => {
        dispatch(boardsSlice.actions.removeAllConnections(id, componentId));
        dispatch(boardsSlice.actions.removeComponent(id, componentId));
    };
};

const { selectById } = boardAdapter.getSelectors(state => state.boards);
export const selectBoard = createSelector(selectById, board => {
    if (board) {
        // probably needs a custom memo
        return {
            components: board.boardObject.data.components,
            connections: Object.entries(board.boardObject.data.connections).map(([key, val]) => decodeConnection(key))
        };
    } else {
        return DEFAULT_VALUE;
    }
});

export const selectLabels = createSelector(selectById, board => {
    let labels = [];
    if (board) {
        const boardComponents = board.boardObject.data.components;
        labels = Object.keys(boardComponents).reduce((acc, componentId) => {
            const labelInfo = boardComponents[componentId].label;
            if (labelInfo) {
                acc.push({ id: labelInfo.labelId, componentId, description: labelInfo.description });
            }
            return acc;
        }, []);
    }
    return labels;
});
export const selectBoardError = createSelector(selectById, board => {
    return board ? board.boardObject.data.err : null;
});

export const selectComponentSize = createSelector(selectById, (state, boardId, componentId) => componentId, (board, componentId) => {
    if (board) {
        return board.boardObject.data.components[componentId].size || DEFAULT_COMPONENT_SIZE;
    }
    return DEFAULT_COMPONENT_SIZE;
});
