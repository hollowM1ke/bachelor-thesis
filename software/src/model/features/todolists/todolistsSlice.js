import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { generatePseudoRandomId } from '../../../services/ids';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { TodoListProxy } from '../EntityProxies/TodoListProxy';
import CRDTExecutor from '../../../model/app/plugins/CRDT/CRDTExecutor';

const todoListsAdapter = createEntityAdapter();
const initialState = todoListsAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
const getTodoListArrayObjId = id => `${id}-array`;
const getTodoListTextMapObjId = id => `${id}-text`;
const getTodoListCheckedMapObjId = id => `${id}-checked`;
const getTodoListChildArrayObjId = id => `${id}-childArray`;
const getTodoListDummyChildArrayObjId = id => `${id}-DummyChildArray`;
const getTodoListChildItemCheckedMapObjId = id => `${id}-childChecked`;
const getTodoListChildTextMapObjId = id => `${id}-childText`;

const todolistsSlice = createCRDTSupportedSlice({
    name: 'todolists',
    initialState,
    reducers: {
        setErrorTodoList: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.setError(err);
            },
            prepare (todoListId, err) {
                return {
                    payload: {
                        id: todoListId,
                        err: err
                    }
                };
            }
        },

        addItem: {
            reducer (state, action) {
                const { id, text, atIdx, itemId } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                const newItem = {
                    id: itemId,
                    checked: false,
                    text,
                    nestedItems: []
                };
                todoList.todoListObject.addItem(atIdx, newItem);
            },
            prepare (todoListId, afterIdx, text = '', itemId = generatePseudoRandomId(), skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        atIdx: afterIdx + 1,
                        text: text,
                        itemId: itemId,
                        skipSync
                    }
                };
            }
        },
        removeItem: {
            reducer (state, action) {
                const { id, atIdx, itemId } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.removeItem(atIdx, itemId);
            },
            prepare (todoListId, itemId, atIdx, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        itemId: itemId,
                        atIdx,
                        skipSync
                    }
                };
            }
        },
        setChecked: {
            reducer (state, action) {
                const { id, atIdx, checked } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.setChecked(atIdx, checked);
            },
            prepare (todoListId, atIdx, checked, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        atIdx,
                        checked,
                        skipSync
                    }
                };
            }
        },
        editText: {
            reducer (state, action) {
                const { id, atIdx, text } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.editText(atIdx, text);
            },
            prepare (todoListId, atIdx, text, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        atIdx,
                        text,
                        skipSync
                    }
                };
            }
        },
        addChildItem: {
            reducer (state, action) {
                const { id, parentId, text, itemId } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                const newItem = {
                    id: itemId,
                    checked: false,
                    text,
                    parentId: parentId,
                    nestedItems: []
                };
                todoList.todoListObject.addChildItem(parentId, newItem);
            },
            prepare (todoListId, parentId, text = '', itemId = generatePseudoRandomId(), skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        parentId: parentId,
                        text: text,
                        itemId: itemId,
                        skipSync: skipSync
                    }
                };
            }
        },
        removeChildItem: {
            reducer (state, action) {
                const { id, itemId, parentId } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.removeChildItem(itemId, parentId);
            },
            prepare (todoListId, itemId, parentId, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        itemId: itemId,
                        parentId: parentId,
                        skipSync: skipSync
                    }
                };
            }
        },
        removeDummyChildItem: {
            reducer (state, action) {
                const { id, index } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;
                todoList.todoListObject.removeDummyChildItem(index);
            },
            prepare (todoListId, index, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        index: index,
                        skipSync: skipSync
                    }
                };
            }
        },
        setChildItemChecked: {
            reducer (state, action) {
                const { id, itemId, checked } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;

                todoList.todoListObject.setChildItemChecked(itemId, checked);
            },
            prepare (todoListId, itemId, checked, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        itemId: itemId,
                        checked: checked,
                        skipSync: skipSync
                    }
                };
            }
        },

        editChildItemText: {
            reducer (state, action) {
                const { id, itemId, text } = action.payload;
                const todoList = state.entities[id];
                if (!todoList) return;

                todoList.todoListObject.editChildItemText(itemId, text);
            },
            prepare (todoListId, itemId, text, skipSync = false) {
                return {
                    payload: {
                        id: todoListId,
                        itemId: itemId,
                        text: text,
                        skipSync: skipSync
                    }
                };
            }
        },

        loadTodoList (state, action) {
            const { id, boardId, initialState } = action.payload;
            const todoList = state.entities[id];
            if (!todoList) {
                const collectionName = getBoardObjId(boardId);
                const todoListArray = getObject(collectionName, getTodoListArrayObjId(id), id, 'YArray', applyTodoListArrayChanges); // also defines the observers for the datastructures
                const todoListTextMap = getObject(collectionName, getTodoListTextMapObjId(id), id, 'YMap', applyTodoListTextMapChanges);
                const todoListCheckedMap = getObject(collectionName, getTodoListCheckedMapObjId(id), id, 'YMap', applyTodoListCheckedMapChanges);
                const todoListChildArray = getObject(collectionName, getTodoListChildArrayObjId(id), id, 'YArray', applyTodoListChildArrayChanges); // also defines the observers for the datastructures
                const todoListDummyChildArray = getObject(collectionName, getTodoListDummyChildArrayObjId(id), id, 'YArray', applyTodoListDummyChildArrayChanges);
                const todoListChildItemCheckedMap = getObject(collectionName, getTodoListChildItemCheckedMapObjId(id), id, 'YMap', applyTodoListChildItemCheckedMapChanges);
                const todoListChildTextMap = getObject(collectionName, getTodoListChildTextMapObjId(id), id, 'YMap', applyTodoListChildTextMapChanges);
                // only connect the websocket if we are not in test mode because in the test we don`t want any sideffects(integrated "sidechannel" from the websocket) and we don`t need the websocket in the tests
                if (!process.env.test) {
                    getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); // connect the websocket to the collection and now we know the observers are defined on the datastructures
                }
                const crdtObjects = { todoListArray, todoListTextMap, todoListCheckedMap, todoListChildArray, todoListDummyChildArray, todoListChildItemCheckedMap, todoListChildTextMap };
                const newTodoList = {
                    id,
                    todoListObject: {
                        _type: 'TodoList',
                        _crdt: true,
                        data: {
                            value: []
                        },
                        crdtObjects
                    }
                };
                // Function to apply incoming changes to the Non-CRDTs if a TodoItem is added or removed
                function applyTodoListArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalItem = todolistsSlice.actions.addItem;
                    const removeLocalItem = todolistsSlice.actions.removeItem;
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalItem(id, newIndex0 - 1, '', itemId, true));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const itemId = 'Because we don`t remove the item from the CRDTs we dont need to have the ItemId here but we need a dummy which is this :)';
                                action.store.dispatch(removeLocalItem(id, itemId, newIndex0, true));
                            }
                        }
                    }
                }
                // Function to apply incremental changes from TodoListTextMapChanges on that come from other Clients to the non-CRDTs
                function applyTodoListTextMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const updateLocalText = todolistsSlice.actions.editText;
                    yEvent.changes.keys.forEach((change, key) => {
                        const text = todoListTextMap.get(key);
                        const textIndex = todoListArray.toArray().indexOf(key);
                        switch (change.action) {
                        case 'add':
                        case 'update':
                            action.store.dispatch(updateLocalText(id, textIndex, text, true));
                            break;
                        default:
                            break;
                        }
                    });
                }
                // Function to apply incremental changes from TodoListCheckedMapChanges on that come from other Clients to the non CRDTs
                function applyTodoListCheckedMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const updateLocalChecked = todolistsSlice.actions.setChecked;
                    yEvent.changes.keys.forEach((change, key) => {
                        const checked = todoListCheckedMap.get(key);
                        const checkedIndex = todoListArray.toArray().indexOf(key);
                        switch (change.action) {
                        case 'add':
                        case 'update':
                            action.store.dispatch(updateLocalChecked(id, checkedIndex, checked, true));
                            break;
                        default:
                            break;
                        }
                    });
                }
                function applyTodoListChildArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalChildItem = todolistsSlice.actions.addChildItem;
                    const removeLocalChildItem = todolistsSlice.actions.removeChildItem;
                    const removeLocalDummyChildItem = todolistsSlice.actions.removeDummyChildItem;
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalChildItem(id, itemId.parentId, '', itemId.id, true));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const itemId = 'Because we don`t remove the item from the CRDTs we dont need to have the ItemId here but we need a dummy which is this :)';
                                const childItems = [...todoListDummyChildArray.toArray()];
                                const toBeDeletedChildItem = childItems[newIndex0];
                                action.store.dispatch(removeLocalChildItem(id, toBeDeletedChildItem.id, toBeDeletedChildItem.parentId, true));
                                action.store.dispatch(removeLocalDummyChildItem(id, newIndex0, false));
                            }
                        }
                    }
                }
                function applyTodoListDummyChildArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    console.log('progress tracker child array dummy changes delta', delta);
                    // const addLocalDummyReply = createAction('comments/addDummyReply');
                    const removeLocalDummyChildItem = todolistsSlice.actions.removeDummyChildItem;
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                // action.store.dispatch(addLocalReply({ replyDescription: itemId.replyDescription, replyId: itemId.replyId, userId: itemId.userId, commentId: itemId.commentId, componentId: id, skipSync: true }));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const itemId = 'Because we don`t remove the item from the CRDTs we dont need to have the ItemId here but we need a dummy which is this :)';
                                action.store.dispatch(removeLocalDummyChildItem(id, newIndex0, true));
                            }
                        }
                    }
                }
                function applyTodoListChildItemCheckedMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const updateLocalChildItemChecked = todolistsSlice.actions.setChildItemChecked;
                    yEvent.changes.keys.forEach((change, key) => {
                        const checked = todoListChildItemCheckedMap.get(key);
                        // const checkedIndex = todoListChildArray.toArray().indexOf(key);
                        switch (change.action) {
                        case 'add':
                        case 'update':
                            action.store.dispatch(updateLocalChildItemChecked(id, key, checked, true));
                            break;
                        default:
                            break;
                        }
                    });
                }
                function applyTodoListChildTextMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const updateLocalChildText = todolistsSlice.actions.editChildItemText;
                    yEvent.changes.keys.forEach((change, key) => {
                        const text = todoListChildTextMap.get(key);
                        // const checkedIndex = todoListChildArray.toArray().indexOf(key);
                        switch (change.action) {
                        case 'add':
                        case 'update':
                            action.store.dispatch(updateLocalChildText(id, key, text, true));
                            break;
                        default:
                            break;
                        }
                    });
                }
                if (initialState && !process.env.test) {
                    const executor = CRDTExecutor();
                    const todoHandler = new TodoListProxy(newTodoList.todoListObject.data, crdtObjects, executor);
                    for (let i = initialState.value.length - 1; i >= 0; i--) {
                        const item = initialState.value[i];
                        todoHandler.addItem(0, item);
                    }
                    executor.flush();
                }
                todoListsAdapter.addOne(state, newTodoList);
            }
        },
        unloadTodoList (state, action) {
            const { id, boardId } = action.payload;
            const todoList = state.entities[id];
            if (!todoList) { return; }

            const collectionName = getBoardObjId(boardId);
            removeObject(collectionName, getTodoListCheckedMapObjId(id), id);
            // removeObject(collectionName, getTodoListArrayObjId(id), id);
            // removeObject(collectionName, getTodoListTextMapObjId(id), id);
            removeObject(collectionName, getTodoListChildArrayObjId(id), id);
            removeObject(collectionName, getTodoListDummyChildArrayObjId(id), id);
            removeObject(collectionName, getTodoListChildItemCheckedMapObjId(id), id);

            delete state.entities[id];
        }
    }
});
export default todolistsSlice.reducer;
export const {
    setErrorTodoList,
    addItem,
    removeItem,
    setChecked,
    editText,
    unloadTodoList,
    loadTodoList,
    addChildItem,
    removeChildItem,
    removeDummyChildItem,
    setChildItemChecked,
    editChildItemText
} = todolistsSlice.actions;

const { selectById } = todoListsAdapter.getSelectors(state => state.todolists);
export const selectTodoList = createSelector(selectById, todoList => {
    return todoList ? todoList.todoListObject.data.value : [];
});

export const selectTodoListError = createSelector(selectById, todoList => {
    return todoList ? todoList.todoListObject.data.err : null;
});

// one time selector, no need to memoize
export const selectFullContext = (state, id) => {
    const todoList = state.todolists.entities[id];
    const value = todoList ? todoList.todoListObject.data.value : [];
    return {
        type: 'todolist',
        value
    };
};
