import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { generatePseudoRandomId } from '../../../services/ids';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { ImageProxy } from '../EntityProxies/ImageProxy';
import CRDTExecutor from '../../app/plugins/CRDT/CRDTExecutor';

const LOAD_AFTER = 500; // delay before loading initial state
const imagesAdapter = createEntityAdapter();
const initialState = imagesAdapter.getInitialState();
const DEFAULT_VAL = { url: '', description: '', rotation: 0 };
const getBoardObjId = boardId => `board-${boardId}`;
const getUrlObjId = id => `${id}-url`;
const getDescriptionObjId = id => `${id}-description`;
const getRotationObjId = id => `${id}-rotation`;
const imagesSlice = createCRDTSupportedSlice({
    name: 'images',
    initialState,
    reducers: {
        setErrorImage: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const image = state.entities[id];
                if (!image) return;
                image.imageObject.setError(err);
            },
            prepare (imageId, err) {
                return {
                    payload: {
                        id: imageId,
                        err: err
                    }
                };
            }
        },

        setImageURL: {
            reducer (state, action) {
                const { imageId, url } = action.payload;
                const image = state.entities[imageId];
                if (!image) return;
                image.imageObject.setUrl(imageId, url);
            },
            prepare (imageId, url) {
                return {
                    payload: {
                        imageId,
                        url
                    }
                };
            }
        },
        setImageDescription: {
            reducer (state, action) {
                const { imageId, description } = action.payload;
                const image = state.entities[imageId];
                if (!image) return;
                image.imageObject.setDescription(imageId, description);
            },
            prepare (imageId, description) {
                return {
                    payload: {
                        imageId,
                        description
                    }
                };
            }
        },
        setImageRotation: {
            reducer (state, action) {
                const { imageId, rotation } = action.payload;
                const image = state.entities[imageId];
                if (!image) return;
                image.imageObject.setRotation(imageId, rotation);
            },
            prepare (imageId, rotation) {
                return {
                    payload: {
                        imageId,
                        rotation
                    }
                };
            }
        },
        updateImage: {
            reducer (state, action) {
                const { imageId, url, description, rotation } = action.payload;
                const image = state.entities[imageId];
                if (!image) return;
                // TODO: disable sync here
                image.imageObject.setUrl(imageId, url);
                image.imageObject.setDescription(imageId, description);
                image.imageObject.setRotation(imageId, rotation);
            },
            prepare (url, description, rotation) {
                return {
                    payload: {
                        imageId: generatePseudoRandomId(),
                        url,
                        description,
                        rotation
                    }
                };
            }
        },
        loadImage (state, action) {
            const { id, boardId, initialState } = action.payload;
            const image = state.entities[id];
            if (!image) {
                const collectionName = getBoardObjId(boardId);
                const urlObject = getObject(collectionName, getUrlObjId(id), id, 'YMap', applyurlObjectchanges);
                const descriptionObject = getObject(collectionName, getDescriptionObjId(id), id, 'YMap', applydescriptionObjectchanges);
                const rotationObject = getObject(collectionName, getRotationObjId(id), id, 'YMap', applyrotationObjectchanges);
                if (!process.env.test) { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }
                const crdtObjects = { urlObject, descriptionObject, rotationObject };
                const newImage = {
                    id,
                    imageObject: {
                        _type: 'Image',
                        _crdt: true,
                        data: {
                            url: '',
                            description: '',
                            rotation: 0
                        },
                        crdtObjects
                    }
                };
                function applyurlObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalUrl = createAction('images/setImageURL');
                        const url = urlObject.get(key);
                        switch (change.action) {
                        case 'update': {
                            action.store.dispatch(setLocalUrl({ imageId: id, url: url, skipSync: true }));
                            break;
                        }
                        case 'add': {
                            action.store.dispatch(setLocalUrl({ imageId: id, url: url, skipSync: true }));
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
                function applydescriptionObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalUrl = createAction('images/setImageDescription');
                        const value = descriptionObject.get(key);
                        switch (change.action) {
                        case 'update': {
                            action.store.dispatch(setLocalUrl({ imageId: id, description: value, skipSync: true }));
                            break;
                        }
                        case 'add': {
                            action.store.dispatch(setLocalUrl({ imageId: id, description: value, skipSync: true }));
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
                function applyrotationObjectchanges (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    yevent.changes.keys.forEach((change, key) => {
                        const setLocalUrl = createAction('images/setImageRotation');
                        const rot = rotationObject.get(key);
                        switch (change.action) {
                        case 'update': {
                            action.store.dispatch(setLocalUrl({ imageId: key, rotation: rot, skipSync: true }));
                            break;
                        }
                        case 'add': {
                            action.store.dispatch(setLocalUrl({ imageId: key, rotation: rot, skipSync: true }));
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
                function syncAll () {
                    const updatedDescription = descriptionObject.get(id);
                    const updatedURL = urlObject.get(id);
                    const updatedRotation = Number(rotationObject.get(id));
                    const updateImage = createAction('images/updateImage');
                    action.store.dispatch(updateImage({ imageId: id, url: updatedURL, description: updatedDescription, rotation: updatedRotation, skipSync: true }));
                }

                if (initialState !== undefined && !process.env.test) {
                    const executor = CRDTExecutor();
                    const imageHandler = new ImageProxy(newImage.imageObject.data, crdtObjects, executor);
                    imageHandler.setUrl(id, initialState.value.url);
                    imageHandler.setDescription(id, initialState.value.description);
                    imageHandler.setRotation(id, initialState.value.rotation);
                    executor.flush();
                } else {
                    setTimeout(syncAll, LOAD_AFTER);
                }
                setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 50);
                imagesAdapter.addOne(state, newImage);
            }
        },
        unloadImage (state, action) {
            const { id, boardId } = action.payload;
            const image = state.entities[id];
            if (!image) { return; }
            const collectionName = getBoardObjId(boardId);
            image.destroy();
            removeObject(collectionName, getUrlObjId(id));
            removeObject(collectionName, getDescriptionObjId(id));
            removeObject(collectionName, getRotationObjId(id));

            // image.data.imageObject.unloadImage(collectionName);
            delete state.entities[id];
        }
    }
});

export default imagesSlice.reducer;
export const {
    loadImage,
    unloadImage,
    updateImage,
    setImageDescription,
    setImageURL,
    setImageRotation,
    setErrorImage
} = imagesSlice.actions;

const { selectById } = imagesAdapter.getSelectors(state => state.images);
export const selectImage = createSelector(selectById, image => {
    if (!image) {
        return DEFAULT_VAL;
    }

    return image.imageObject.data;
});

export const selectError = createSelector(selectById, image => {
    return image ? image.imageObject.data.err : null;
});

export const selectFullContext = (state, id) => {
    const image = state.images.entities[id];

    const value = image ? image.imageObject.data : DEFAULT_VAL;

    return {
        type: 'image',
        value
    };
};
