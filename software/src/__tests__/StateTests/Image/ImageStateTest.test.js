import { setupStore } from '../../../model/app/store.js'
import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider'
import * as Y from 'yjs'
import { 
loadImageDispatcher,
setImageURLDispatcher,
setImageRotationDispatcher,
setImageDescriptionDispatcher 
} from '../../../test_services/predefineStates/ImagePredefined.js';

// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';


    const cases = [...Array(1).keys()];
    const getBoardObjId = boardId => `board-${boardId}`;
    process.env.test = true;
    var store1;
    var store2;
    var imageCompId = 't1'
    const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
      Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
      Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
      jest.runOnlyPendingTimers();
    };
    const setUrlTester = async (store1, store2, newURL1, compId, newURL2 = '') => {
        const urlObject1 = await store1.getState().images.entities.t1.imageObject.crdtObjects.urlObject;
        const urlObject2 = await store2.getState().images.entities.t1.imageObject.crdtObjects.urlObject;
        const data1 = await store1.getState().images.entities.t1.imageObject.data;
        const data2 = await store2.getState().images.entities.t1.imageObject.data;
        expect([newURL1,newURL2]).toContainEqual(data1.url);
        expect(urlObject1.get(compId)).toEqual(data1.url);
        expect(urlObject2.get(compId)).toEqual(data2.url);
        expect(data2.url).toEqual(data1.url);
    };
    const setDescriptionTester = async (store1, store2, newDescription1,compId, newDescription2= '') => {
        const descriptionObject1 = await store1.getState().images.entities.t1.imageObject.crdtObjects.descriptionObject;
        const descriptionObject2 = await store2.getState().images.entities.t1.imageObject.crdtObjects.descriptionObject;
        const data1 = await store1.getState().images.entities.t1.imageObject.data;
        const data2 = await store2.getState().images.entities.t1.imageObject.data;
        expect([newDescription1,newDescription2]).toContainEqual(data1.description);
        expect(descriptionObject1.get(compId)).toEqual(data1.description);
        expect(descriptionObject2.get(compId)).toEqual(data2.description);
        expect(data2.description).toEqual(data1.description);
    };
    const setRotationTester = async (store1, store2, newRotation1, compId, newRotation2 = '') => {
        const rotationObject1 = await store1.getState().images.entities.t1.imageObject.crdtObjects.rotationObject;
        const rotationObject2 = await store2.getState().images.entities.t1.imageObject.crdtObjects.rotationObject;
        const data1 = await store1.getState().images.entities.t1.imageObject.data;
        const data2 = await store2.getState().images.entities.t1.imageObject.data;
        expect([newRotation1,newRotation2]).toContainEqual(data1.rotation);
        expect(rotationObject1.get(compId)).toEqual(data1.rotation);
        expect(rotationObject2.get(compId)).toEqual(data2.rotation);
        expect(data2.rotation).toEqual(data1.rotation);
    };

    describe('For the Image it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setUrl in the concurent operations', () => {
        beforeEach(async () => {
          initDocument('13a');
          jest.useFakeTimers();
          store1 = setupStore();
          store2 = setupStore();
          });
        afterAll(() => {
          console.log('SetImageUrl Test have finished');
        });
        afterEach(() => {
            jest.useRealTimers();
            jest.clearAllTimers();
            cleanUpProviderCollection();
          });
        it.each(cases)('shoudld change the URL in both instances if two setImageUrl are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newURL1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png';
            const newURL2 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png';
            setImageURLDispatcher({ jest: jest, localstore: store1, docId: imageCompId, URL: newURL1 });
            setImageURLDispatcher({ jest: jest, localstore: store2, docId: imageCompId, URL: newURL2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setUrlTester(store1, store2, newURL1, imageCompId, newURL2);
        }, 30000);
        it.each(cases)('shoudld change the URL in both and the description instances if a setImageUrl and setImageDescription are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newURL1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png';
            const newDescription1 ='Logo of the Google from 2015'
            setImageDescriptionDispatcher({ jest: jest, localstore: store1, docId: imageCompId, description: newDescription1 });
            setImageURLDispatcher({ jest: jest, localstore: store2, docId: imageCompId, URL: newURL1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setUrlTester(store1, store2, newURL1, imageCompId);
            await setDescriptionTester(store1, store2, newDescription1, imageCompId);
        }, 30000);
        it.each(cases)('shoudld change the URL and rotation in both instances if a setImageUrl and a setImageRotation are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newURL1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png';
            const newRotation1 = 90
            setImageRotationDispatcher({ jest: jest, localstore: store1, docId: imageCompId, rotation: newRotation1 });
            setImageURLDispatcher({ jest: jest, localstore: store2, docId: imageCompId, URL: newURL1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setUrlTester(store1, store2, newURL1, imageCompId);
            await setRotationTester(store1, store2, newRotation1, imageCompId);
        }, 30000);
    });

    describe('For the Image it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setImageDescription in the concurent operations', () => {
        beforeEach(async () => {
          initDocument('13a');
          jest.useFakeTimers();
          store1 = setupStore();
          store2 = setupStore();
          });
        afterEach(() => {
            jest.useRealTimers();
            jest.clearAllTimers();
            cleanUpProviderCollection();
          });
        afterAll(() => {
          console.log('Set Image Description Test have finished');
        });
        it.each(cases)('shoudld the description in both instances to the same if tow setImageDescription are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newDescription1 ='Logo of the Google from 2015';
            const newDescription2 = 'Logo of the search engine that the company Alphabet develobed';
            setImageDescriptionDispatcher({ jest: jest, localstore: store1, docId: imageCompId, description: newDescription1 });
            setImageDescriptionDispatcher({ jest: jest, localstore: store2, docId: imageCompId, description: newDescription2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDescriptionTester(store1, store2, newDescription1, imageCompId, newDescription2);
        }, 30000);
        it.each(cases)('shoudld the description and rotation in both instances if a setImageDescription and a setImageRotation are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newRotation1 = 90
            setImageRotationDispatcher({ jest: jest, localstore: store1, docId: imageCompId, rotation: newRotation1 });
            const newDescription1 ='Logo of the Google from 2015';
            setImageDescriptionDispatcher({ jest: jest, localstore: store2, docId: imageCompId, description: newDescription1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDescriptionTester(store1, store2, newDescription1, imageCompId);
            await setRotationTester(store1, store2, newRotation1, imageCompId);
        }, 30000);
    });

    describe('For the Image it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setImageDescription in the concurent operations', () => {
        beforeEach(async () => {
          initDocument('13a');
          jest.useFakeTimers();
          store1 = setupStore();
          store2 = setupStore();
          });
        afterEach(() => {
            jest.useRealTimers();
            jest.clearAllTimers();
            cleanUpProviderCollection();
          });
        afterAll(() => {
          console.log('Set Image Rotation Test have finished');
        });
        it.each(cases)('shoudld change the rotation in both instances to the same if two setImageRotation are done concurently on the same Image',async () => {
            loadImageDispatcher({ jest: jest, localstore: store1, docId: imageCompId, boardId: 'boardId1' });
            loadImageDispatcher({ jest: jest, localstore: store2, docId: imageCompId, boardId: 'boardId2' });
            const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
            const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
            let updateInDoc1 = [];
            let updateInDoc2 = [];
            doc1.on('update', (update) => {
                updateInDoc1.push(update);
              });
            doc2.on('update', (update) => {
                updateInDoc2.push(update);
              });
            const newRotation1 = 90;
            const newRotation2 = -90;
            setImageRotationDispatcher({ jest: jest, localstore: store1, docId: imageCompId, rotation: newRotation1 });
            setImageRotationDispatcher({ jest: jest, localstore: store2, docId: imageCompId, rotation: newRotation2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setRotationTester(store1, store2, newRotation1, imageCompId, newRotation2);
        }, 30000);
    });