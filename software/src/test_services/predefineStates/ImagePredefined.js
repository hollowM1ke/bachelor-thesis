import { loadImage, setImageURL, setImageDescription, setImageRotation } from '../../model/features/images/imagesSlice';
import { addComponentDispatcher } from './BoardPredefined';

export function loadImageDispatcher ({ jest, localstore, docId = 'testImage', boardId = '998' }) {
    localstore.dispatch(loadImage({ id: docId, boardId: boardId }));
    jest.runOnlyPendingTimers();
}

export function setImageURLDispatcher ({ jest, localstore, docId = 'testImage', URL }) {
    localstore.dispatch(setImageURL(docId, URL));
    jest.runOnlyPendingTimers();
}

export function setImageDescriptionDispatcher ({ jest, localstore, docId = 'testImage', description }) {
    localstore.dispatch(setImageDescription(docId, description));
    jest.runOnlyPendingTimers();
}

export function setImageRotationDispatcher ({ jest, localstore, docId = 'testImage', rotation }) {
    localstore.dispatch(setImageRotation(docId, rotation));
    jest.runOnlyPendingTimers();
}

export function setImageDispatcher ({ jest, localstore, docId = 'testImage', URL, discription, rotation = 0 }) {
    localstore.dispatch(setImageURL(docId, URL));
    localstore.dispatch(setImageDescription(docId, discription));
    localstore.dispatch(setImageRotation(docId, rotation));
    jest.runOnlyPendingTimers();
}
function addImageConponentDispatcher ({ jest, localstore, boardId = 'skript-b1' }) {
    addComponentDispatcher({ jest, localstore, id: boardId, componentType: 'image', innerId: 'testImage', position: { x: 0, y: 0 }, createdBy: 'createdBy', createdOn: 'createdOn', labelId: 'Image', loadTestSkip: true });
    jest.runOnlyPendingTimers();
}
export function predefinedRTIuIT5 (jest, localstore) {
    addImageConponentDispatcher({ jest: jest, localstore: localstore });
    setImageDispatcher({ jest: jest, localstore: localstore, docId: 'testImage', URL: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg', discription: 'TestDiscription', rotation: 0 });
}
export function predefinedIT1u2u3u4 (jest, localstore) {
    addImageConponentDispatcher({ jest: jest, localstore: localstore });
}
