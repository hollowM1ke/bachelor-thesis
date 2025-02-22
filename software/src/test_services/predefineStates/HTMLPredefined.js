import { loadHTML, setHTML } from '../../model/features/htmls/htmlsSlice';

export function loadHTMLDispatcher ({ jest, localstore, docId = 'testHtml', boardId = '998' }) {
    localstore.dispatch(loadHTML({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}

export function setHTMLDispatcher ({ jest, localstore, docId = 'testHtml', htmlVal }) {
    localstore.dispatch(setHTML(docId, htmlVal));
    jest.runOnlyPendingTimers();
}

export function predefinedRTH (jest, localstore) {
    loadHTMLDispatcher({ jest: jest, localstore: localstore });
    setHTMLDispatcher({ jest: jest, localstore: localstore, htmlVal: '<div>test</div>' });
}
