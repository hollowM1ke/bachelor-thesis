import { setupStore } from '../../../model/app/store.js'
import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider'
import * as Y from 'yjs'
import {
  loadDiagramDispatcher,
  setDiagramSettingsDispatcher,
  setDiagramSSIDDispatcher,
  setDiagramTypeDispatcher
} from '../../../test_services/predefineStates/DiagramPredefined'

// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';

    const cases = [...Array(1).keys()];
    const getBoardObjId = boardId => `board-${boardId}`;
    process.env.test = true;
    const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
      Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
      Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
      jest.runOnlyPendingTimers();
    };
    const setDiagramTypeTester = async (store1, store2, type1, compId, type2 = '') => {
        const diagramTypeObject1 = await store1.getState().diagrams.entities.t1.diagramObject.crdtObjects.diagramTypeObject;
        const diagramTypeObject2 = await store2.getState().diagrams.entities.t1.diagramObject.crdtObjects.diagramTypeObject;
        const data1 = await store1.getState().diagrams.entities.t1.diagramObject.data.value;
        const data2 = await store2.getState().diagrams.entities.t1.diagramObject.data.value;
        expect([type1,type2]).toContainEqual(data1.type);
        expect(diagramTypeObject1.get(compId)).toEqual(data1.type);
        expect(diagramTypeObject2.get(compId)).toEqual(data2.type);
        expect(data2.type).toEqual(data1.type);
    };
    const setDiagramSSIDTester =  async(store1, store2, ssid1, compId, ssid2 = '') => {
        const SSIdObject1 = await store1.getState().diagrams.entities.t1.diagramObject.crdtObjects.SSIdObject;
        const SSIdObject2 = await store2.getState().diagrams.entities.t1.diagramObject.crdtObjects.SSIdObject;
        const data1 = await store1.getState().diagrams.entities.t1.diagramObject.data.value;
        const data2 = await store2.getState().diagrams.entities.t1.diagramObject.data.value;
        expect([ssid1,ssid2]).toContainEqual(data1.ssid);
        expect(SSIdObject1.get(compId)).toEqual(data1.ssid);
        expect(SSIdObject2.get(compId)).toEqual(data2.ssid);
        expect(data2.ssid).toEqual(data1.ssid);
    };
    const setDiagramSettingsTester =  async(store1, store2, setting1, compId, setting2 = '') => {
        const settingsObject1 = await store1.getState().diagrams.entities.t1.diagramObject.crdtObjects.settingsObject;
        const settingsObject2 = await store2.getState().diagrams.entities.t1.diagramObject.crdtObjects.settingsObject;
        const data1 = await store1.getState().diagrams.entities.t1.diagramObject.data.value;
        const data2 = await store2.getState().diagrams.entities.t1.diagramObject.data.value;
        expect([JSON.stringify(setting1),JSON.stringify(setting2)]).toContainEqual(JSON.stringify(data1.settings));
        expect(JSON.stringify(settingsObject1.get(compId))).toEqual(JSON.stringify(data1.settings));
        expect(JSON.stringify(settingsObject2.get(compId))).toEqual(JSON.stringify(data2.settings));
        expect(JSON.stringify(data2.settings)).toEqual(JSON.stringify(data1.settings));
    };
    describe('For the Diagram it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setDiagramType in the concurent operations', () => {
        let store1;
        let store2;
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
          console.log('setDiagramType Test have finished');
        });
        it.each(cases)('shoudld change the Type in both instances if two setDiagramType are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const type1 = 'groupedbarchart';
            const type2 = 'linechart';
            setDiagramTypeDispatcher({ jest, localstore: store1, docId: diagramCompId, type: type1 });
            setDiagramTypeDispatcher({ jest, localstore: store2, docId: diagramCompId, type: type2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            console.log('store1',store1.getState().diagrams.entities.t1.diagramObject.data.value)
            await setDiagramTypeTester(store1, store2, type1, diagramCompId, type2);
        }, 30000);
        it.each(cases)('shoudld change the Type and the SSID in both instances if a setDiagramType and setDiagramSSID are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const type1 = 'groupedbarchart';
            const ssid = 'SPreadSheetIDDummy';
            setDiagramSSIDDispatcher({ jest, localstore: store1, docId: diagramCompId, ssid: ssid });
            setDiagramTypeDispatcher({ jest, localstore: store2, docId: diagramCompId, type: type1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDiagramTypeTester(store1, store2, type1, diagramCompId);
            await setDiagramSSIDTester(store1, store2, ssid, diagramCompId)
        }, 30000);
        it.each(cases)('shoudld change the Type and the Settings in both instances if a setDiagramType and setDiagramSettings are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const type1 = 'groupedbarchart';
            const setDiagramSettings1 = {"rows":[0],"cols":[0],"xLabel":"header A","yLabel":"","yMin":0,"yMax":10}
            setDiagramSettingsDispatcher({ jest, localstore: store1, docId: diagramCompId, settings: setDiagramSettings1 });
            setDiagramTypeDispatcher({ jest, localstore: store2, docId: diagramCompId, type: type1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDiagramTypeTester(store1, store2, type1, diagramCompId);
            await setDiagramSettingsTester(store1, store2, setDiagramSettings1, diagramCompId)
        }, 30000);
    });

    describe('For the Diagram it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setDiagramSSID in the concurent operations', () => {
        let store1;
        let store2;
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
          console.log('setDiagramType Test have finished');
        });
        it.each(cases)('shoudld the SSID in both instances to the same if two setDiagramSSID are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const ssid1 = 'SPreadSheetIDDummy111';
            const ssid2 = 'SPreadSheetIDDummy222';
            setDiagramSSIDDispatcher({ jest, localstore: store1, docId: diagramCompId, ssid: ssid1 });
            setDiagramSSIDDispatcher({ jest, localstore: store2, docId: diagramCompId, ssid: ssid2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDiagramSSIDTester(store1, store2, ssid1, diagramCompId,ssid2);
        }, 30000);
        it.each(cases)('shoudld change th SSID and the Settings in both instances if a setDiagramSSID and setDiagramSettings are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const setDiagramSettings1 = {"rows":[0],"cols":[0],"xLabel":"header A","yLabel":"","yMin":0,"yMax":10}
            setDiagramSettingsDispatcher({ jest, localstore: store1, docId: diagramCompId, settings: setDiagramSettings1 });
            const ssid1 = 'SPreadSheetIDDummy111';
            setDiagramSSIDDispatcher({ jest, localstore: store2, docId: diagramCompId, ssid: ssid1 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDiagramSSIDTester(store1, store2, ssid1, diagramCompId);
            await setDiagramSettingsTester(store1, store2, setDiagramSettings1, diagramCompId)
        }, 30000);
    });

    describe('For the Diagram it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setDiagramSettingsin the concurent operations', () => {
        let store1;
        let store2;
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
          console.log('setDiagramSettings Test have finished');
        });
        it.each(cases)('shoudld change the Settings both instances to the same iftwo setDiagramSettings are done concurently on the same Diagram',async () => {
            const diagramCompId = 't1'
            loadDiagramDispatcher({ jest, localstore: store1, docId: diagramCompId, boardId: 'boardId1' });
            loadDiagramDispatcher({ jest, localstore: store2, docId: diagramCompId, boardId: 'boardId2' });
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
            const setDiagramSettings1 = {"rows":[0],"cols":[0],"xLabel":"header A","yLabel":"","yMin":0,"yMax":10}
            const setDiagramSettings2 = {"rows":[0],"cols":[0],"xLabel":"header B","yLabel":"","yMin":10,"yMax":0}
            setDiagramSettingsDispatcher({ jest, localstore: store1, docId: diagramCompId, settings: setDiagramSettings1 });
            setDiagramSettingsDispatcher({ jest, localstore: store2, docId: diagramCompId, settings: setDiagramSettings2 });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setDiagramSettingsTester(store1, store2, setDiagramSettings1, diagramCompId, setDiagramSettings2)
        }, 30000);
    });

