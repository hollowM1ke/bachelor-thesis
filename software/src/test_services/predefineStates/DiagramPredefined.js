import {
    loadDiagram,
    setDiagramSettings,
    setDiagramSSID,
    setDiagramType
} from '../../model/features/diagrams/diagramsSlice';

export function loadDiagramDispatcher ({ jest, localstore, docId = 'testDiagram', boardId = '998' }) {
    localstore.dispatch(loadDiagram({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}

export function setDiagramSettingsDispatcher ({ jest, docId, localstore, settings }) {
    localstore.dispatch(setDiagramSettings(docId, settings));
    jest.runOnlyPendingTimers();
}

export function setDiagramSSIDDispatcher ({ jest, docId, localstore, ssid, diagramId }) {
    localstore.dispatch(setDiagramSSID(docId, ssid));
    jest.runOnlyPendingTimers();
}

export function setDiagramTypeDispatcher ({ jest, docId, localstore, type }) {
    localstore.dispatch(setDiagramType(docId, type));
    jest.runOnlyPendingTimers();
}

export function predefinedDE1 (jest, localstore) {
    loadDiagramDispatcher({ jest: jest, localstore: localstore });
}
