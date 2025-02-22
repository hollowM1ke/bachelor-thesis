import * as Y from 'yjs';
// import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import packgJson from '../../package.json';
import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import getValidAccessToken from './authUtils.js';
const LOAD_AFTER = 500;
let providerCollections = {};
const rootDocMap = {};
let groupName = '';
let socket;
let socket2;
const getDocProviderId = id => `${id}-ydoc`;
export const getWebSocketProviderId = id => `${id}-ws`;
const getIndexedDBProviderId = id => `${id}-idb`;
// A function that is mainly used in Testings to clean up the providerCollections, which means all the refferences to any ydoc or provider are deleted.
export function cleanUpProviderCollection () {
    const provcollections = Object.keys(providerCollections);
    provcollections.forEach((board) => {
        const provsAdocs = Object.keys(providerCollections[board].objects);
        provsAdocs.forEach((proODoc) => {
            if (proODoc.endsWith('-ws')) {
                providerCollections[board].objects[proODoc].destroy();
            }
            delete providerCollections[board].objects[proODoc];
        });
        delete providerCollections[board];
    });
    socket.destroy();
    socket2.destroy();
    providerCollections = {};
};
export function getWebsocketProviderList () {
    return WebsocketProvider;
}
// The getObject function is a wrapper function for getting the object from the document. If the document is not found, it creates a new document and returns the object.
export function getObject (collectionName, objectName, componentId, objectType, onUpdate = () => {}, waitTime = 0, wsProivderFunc = () => {}, websocket = 1) {
    const docInfo = getProviderCollectionInfo(collectionName);
    const componentDoc = docInfo.objects[getDocProviderId(componentId)];
    // distinguish between the case where the ydoc already exists and the case where it does not exist yet
    if (componentDoc) {
        const object = getObjectFromDoc(componentDoc, objectName, objectType);
        if (objectType !== 'YDoc') {
            object.observe((event) => {
                // DONT TOUCH THIS IT IS A WEIRD FIX AND IMPORTANT FOR THE SYNCALL TO WORK
                const weirdFix = event.changes;
                // onUpdate(event);
                setTimeout(onUpdate, waitTime, event);
            });
        }
        return object;
    } else {
        // construct a new ydoc and return the object
        const ydoc = constructor(collectionName, objectName, componentId, wsProivderFunc, websocket);
        const sharedObject = getObjectFromDoc(ydoc, objectName, objectType);
        if (objectType !== 'YDoc') {
            sharedObject.observe((event) => {
                // DONT TOUCH THIS IT IS A WEIRD FIX AND IMPORTANT FOR THE SYNCALL TO WORK
                const weirdFix = event.changes;
                // onUpdate(event);
                setTimeout(onUpdate, waitTime, event);
            });
        } else {
            setTimeout(() => { onUpdate(); }, LOAD_AFTER); // Just for markdown. Probably there is a better solution because the syncall from Markdown needs to be called once so it shows the changes in the other view why idk should be looked into %%TODO%%
        }
        return sharedObject;
    }
};
export function initDocument (groupNames) {
    groupName = groupNames;
    socket = new HocuspocusProviderWebsocket({ url: process.env.REACT_APP_WS_PROVIDER_URL });
    socket2 = new HocuspocusProviderWebsocket({ url: process.env.REACT_APP_WS_PROVIDER_URL2 });
};

export const removeObject = function (collectionName, objectName, componentId) {
    const doc = getProviderCollectionInfo(collectionName).objects[getDocProviderId(componentId)];
    doc.destroy();
};

// This function creates a new ydoc and sets it to the componentId of the collectionName. It also creates a new WebsocketProvider and sets it to the componentId of the collectionName.
// It returns the ydoc that was created.
function constructor (collectionName, objectName, componentId, wsProivderFunc = () => {}, websocket = 1) {
    const providerCollectionInfo = getProviderCollectionInfo(collectionName);
    const ydoc = new Y.Doc();
    providerCollectionInfo.objects[getDocProviderId(componentId)] = ydoc;
    /*
    const indexeddbProvider = new IndexeddbPersistence(collectionName, ydoc);

    providerCollectionInfo.objects[getIndexedDBProviderId(collectionName)] = indexeddbProvider;
    */

    // if used localy use 'ws://localhost:1234/' instead of 'ws://lamport.cs.uni-kl.de:10180/ws/'
    // should be replaced with environment variable at some point (soon-ish). When done, don't forget to add to the README!
    let wsProvider;
    // let isAuthenticated = false;
    switch (websocket) {
    case 1:
        wsProvider = new HocuspocusProvider({
            websocketProvider: socket,
            name: process.env.REACT_APP_HOMEPAGE.slice(1) + componentId + groupName,
            document: ydoc,
            connect: false,
            token: getValidAccessToken,
            onDisconnect (error) {
                if (error) {
                    handleTokenError(wsProvider);
                }
            }
        });
        break;
    case 2:
        // For all the PersonalData so the admin can see the progress of the students without influencing the performance of the board for the students
        wsProvider = new HocuspocusProvider({ websocketProvider: socket2, name: process.env.REACT_APP_HOMEPAGE.slice(1) + componentId + groupName, document: ydoc, connect: false });
        break;
    default:
        console.log('Unknown websocket provider');
        break;
    }
    wsProvider.on('status', (event) => {
        setTimeout(wsProivderFunc, 0, event);
    });
    providerCollectionInfo.objects[getWebSocketProviderId(componentId)] = wsProvider;
    return ydoc;
};
async function handleTokenError (wsProvider) {
    try {
        const newToken = await getValidAccessToken();
        wsProvider.configuration.token = newToken;
        wsProvider.connect();
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
};
//  Retriev the object from the document or create a new one if it does not exist
function getObjectFromDoc (componentDoc, objectName, objectType) {
    switch (objectType) {
    case 'YMap':
        return componentDoc.getMap(objectName);
    case 'YArray':
        return componentDoc.getArray(objectName);
    case 'YText':
        return componentDoc.getText(objectName);
    case 'YDoc':
        return componentDoc;
    default:
        console.log('Unknown CRDT type: ' + objectType); // Is this an error?
        break;
    }
};

export function getProviderCollectionInfo (collectionName) {
    if (!providerCollections[collectionName]) {
        providerCollections[collectionName] = {
            objects: {}
        };
    }
    return providerCollections[collectionName];
}

export function disconectAll () {
    for (const [key, value] of Object.entries(providerCollections)) {
        for (const [key2, value2] of Object.entries(providerCollections[key].objects)) {
            if (key2.endsWith('-ws')) {
                value2.disconnect();
            }
        }
    }
}

export function conectAll () {
    for (const [key, value] of Object.entries(providerCollections)) {
        for (const [key2, value2] of Object.entries(providerCollections[key].objects)) {
            if (key2.endsWith('-ws')) {
                value2.connect();
            }
        }
    }
}
