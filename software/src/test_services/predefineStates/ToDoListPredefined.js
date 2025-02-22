import { loadTodoList, addItem, setChecked, removeItem, editText } from '../../model/features/todolists/todolistsSlice';

export function loadTodoListDispatcher ({ jest, localstore, docId = 'testTodo', boardId = '998' }) {
    localstore.dispatch(loadTodoList({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}
// text is optional in the current implementation
export function addItemDispatcher ({ jest, localstore, docId = 'testTodo', afterIdx, text }) {
    localstore.dispatch(addItem(docId, afterIdx, text));
    jest.runOnlyPendingTimers();
}

export function setCheckedDispatcher ({ jest, localstore, docId = 'testTodo', atIndex, checked = true }) {
    localstore.dispatch(setChecked(docId, atIndex, checked));
    jest.runOnlyPendingTimers();
}

export function removeItemDispatcher ({ jest, localstore, docId = 'testTodo', remItemId, atIndex }) {
    localstore.dispatch(removeItem(docId, remItemId, atIndex));
    jest.runOnlyPendingTimers();
}

export function editTextDispatcher ({ jest, localstore, docId = 'testTodo', atIndex, text }) {
    localstore.dispatch(editText(docId, atIndex, text));
    jest.runOnlyPendingTimers();
}

export function predefinedE1uTT2u3u4 (jest, localstore) {
    loadTodoListDispatcher({ jest: jest, localstore: localstore });
    addItemDispatcher({ jest: jest, localstore: localstore, afterIdx: -1, text: 'ToDo' });
    addItemDispatcher({ jest: jest, localstore: localstore, afterIdx: 0 });
}

export function predefinedTT1 (jest, localstore) {
    loadTodoListDispatcher({ jest: jest, localstore: localstore });
}
