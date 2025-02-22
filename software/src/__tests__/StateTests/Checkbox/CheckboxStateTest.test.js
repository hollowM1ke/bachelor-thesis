import { setupStore } from '../../../model/app/store.js'
import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider'
import * as Y from 'yjs'

import {
  loadCheckboxDispatcher,
  setCheckboxDispatcher
} from '../../../test_services/predefineStates/CheckBoxPredefined.js'
import {
    encodeBoolean
} from '../../../model/features/functions/booleanFunctions';

// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';

    const cases = [...Array(1).keys()];
    const getBoardObjId = boardId => `board-${boardId}`;
    const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
      Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
      Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
      jest.runOnlyPendingTimers();
    };
    const setCheckboxTester = async (store1, store2, compId) => {
        const checkboxObject1 = await store1.getState().checkboxes.entities.t1.checkBoxObject.crdtObjects.checkboxObjectMap;
        const checkboxObject2 = await store2.getState().checkboxes.entities.t1.checkBoxObject.crdtObjects.checkboxObjectMap;
        const data1 = await store1.getState().checkboxes.entities.t1.checkBoxObject.data;
        const data2 = await store2.getState().checkboxes.entities.t1.checkBoxObject.data;
        expect(checkboxObject1.get(compId)).toEqual(encodeBoolean(data1.checked));
        expect(checkboxObject2.get(compId)).toEqual(encodeBoolean(data2.checked));
        expect(data2.checked).toEqual(data1.checked);
    };

    describe('For the Checkbox it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the setCheckbox in the concurent operations', () => {
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
          console.log('Set Checkbox Test have finished');
        });
        it.each(cases)('shoudld set the boolean value in both instances the same if two setCheckbox are done concurently on the same Checkbox',async () => {
            const checkboxCompID = 't1'
            loadCheckboxDispatcher({ jest, localstore: store1, docId: checkboxCompID, boardId: 'boardId1' });
            loadCheckboxDispatcher({ jest, localstore: store2, docId: checkboxCompID, boardId: 'boardId2' });
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
            setCheckboxDispatcher({ jest, localstore: store1, docId: checkboxCompID, checked: true });
            setCheckboxDispatcher({ jest, localstore: store2, docId: checkboxCompID, checked: false });
            applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
            await setCheckboxTester(store1, store2, checkboxCompID);
        }, 30000);
    });