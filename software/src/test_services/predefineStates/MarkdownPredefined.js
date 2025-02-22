import { loadMarkdown, setMarkdown } from '../../model/features/markdowns/markdownsSlice';
import { addComponentDispatcher } from './BoardPredefined';
import { DEFAULT_COMPONENT_SIZE } from '../../model/features/EntityProxies/BoardProxy';

export function loadMarkdownDispatcher ({ jest, localstore, docId = 'testMarkdown', boardId = '998' }) {
    localstore.dispatch(loadMarkdown({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}

export function setMarkdownDispatcher ({ jest, localstore, docId = 'testMarkdown', text = { quill: 'Hey' } }) {
    localstore.dispatch(setMarkdown(docId, text));
    jest.runOnlyPendingTimers();
}

export function predefinedRTM (jest, localstore) {
    loadMarkdownDispatcher({ jest, localstore });
    setMarkdownDispatcher({ jest, localstore });
}

export function predefinedMT1 (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, componentType: 'markdown', innerId: 'testMarkdown', size: { componentId: 'markdown1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    // setMarkdownDispatcher({ jest, localstore });
}
