import {
    loadCheckbox,
    setCheckbox
} from '../../model/features/checkboxes/checkboxesSlice';

export function loadCheckboxDispatcher ({ jest, localstore, docId = 'testCheckbox', boardId = '998' }) {
    localstore.dispatch(loadCheckbox({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}

export function setCheckboxDispatcher ({ jest, localstore, docId, checked }) {
    localstore.dispatch(setCheckbox(docId, checked));
    jest.runOnlyPendingTimers();
}
