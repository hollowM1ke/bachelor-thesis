import { setupStore } from '../../../model/app/store.js'
import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider'
import { decodeComponentInfo, encodeComponentInfo, encodeConnection } from '../../../model/features/boards/boardFunctions';
import * as Y from 'yjs'
import {
    addComponentDispatcher,
    loadBoardDispatcher,
    removeComponentDispatcher,
    addLabelDispatcher,
    removeLabelDispatcher,
    updateSizeDispatcher,
    moveComponentDispatcher,
    addConnectionDispatcher,
    removeConnectionDispatcher,
    removeAllConnectionsDispatcher
  } from '../../../test_services/predefineStates/BoardPredefined.js';
import { isExternal } from 'util/types';
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';

    const cases = [...Array(1).keys()];
    const getBoardObjId = boardId => `board-${boardId}`;
    var createdBy1 = 'Tester1';
    var createdBy2 = 'Tester2';
    var createdOn1 = (new Date()).toLocaleDateString('en-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    var createdOn2 = (new Date()).toLocaleDateString('en-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    var store1;
    var store2;
    var boardId1 = 'boardId1';
    var boardId2 = 'boardId2';
    process.env.test = true;
    const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
      Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
      Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
      jest.runOnlyPendingTimers();
    };
    const addComponentTester = async (store1, store2, expectedNumOfComps) => {
        const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
        const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
        const componentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject;
        const componentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject;
        for (const keys of componentInfoObject1.keys()) {
            expect(data1.components.hasOwnProperty(keys)).toBe(true);
            const compInfo1 = { ...data1.components[keys]};
            compInfo1.isExternal = JSON.parse(componentInfoObject1.get(keys)).isExternal;
            expect(componentInfoObject1.get(keys)).toEqual(encodeComponentInfo(compInfo1));
        }  
        for (const keys of componentInfoObject2.keys()) {
            expect(data2.components.hasOwnProperty(keys)).toBe(true);
            const compInfo2 = { ...data2.components[keys]};
            compInfo2.isExternal = JSON.parse(componentInfoObject2.get(keys)).isExternal;
            expect(componentInfoObject2.get(keys)).toEqual(encodeComponentInfo(compInfo2));
        }
        const localKeys1 = Object.keys(data1.components);
        const localKeys2 = Object.keys(data2.components);
        expect(localKeys1.length).toEqual(expectedNumOfComps);
        expect(localKeys2.length).toEqual(expectedNumOfComps);
        expect(componentInfoObject1.size).toEqual(expectedNumOfComps);
        expect(componentInfoObject2.size).toEqual(expectedNumOfComps);
        for (const key of localKeys1) {
          const compInfo1 = { ...data1.components[key]};
          compInfo1.isExternal = data2.components[key].isExternal;
            expect(encodeComponentInfo(compInfo1)).toEqual(encodeComponentInfo(data2.components[key]));
        }
    };
    const removeComponentTester = async (store1, store2, expectedNumOfComps, numberofCompRemoves = 1, remCompId = '') => {
        const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
        const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
        const componentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject;
        const componentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject;
        for (const keys of componentInfoObject1.keys()) {
          expect(data1.components.hasOwnProperty(keys)).toBe(true);
          expect(keys).not.toEqual(remCompId);
          const compInfo1 = { ...data1.components[keys]};
          compInfo1.isExternal = JSON.parse(componentInfoObject1.get(keys)).isExternal;
          expect(componentInfoObject1.get(keys)).toEqual(encodeComponentInfo(compInfo1));
        }
        for (const keys of componentInfoObject2.keys()) {
          expect(data2.components.hasOwnProperty(keys)).toBe(true);
          expect(keys).not.toEqual(remCompId);
          const compInfo2 = { ...data2.components[keys]};
          compInfo2.isExternal = JSON.parse(componentInfoObject2.get(keys)).isExternal;
          expect(componentInfoObject2.get(keys)).toEqual(encodeComponentInfo(compInfo2));
        }
        const localKeys1 = Object.keys(data1.components);
        const localKeys2 = Object.keys(data2.components);
        expect(localKeys1.length).toEqual(expectedNumOfComps);
        expect(localKeys2.length).toEqual(expectedNumOfComps);
        expect(componentInfoObject1.size).toEqual(expectedNumOfComps);
        expect(componentInfoObject2.size).toEqual(expectedNumOfComps);
        for (const key of localKeys1) {
          const compInfo1 = { ...data1.components[key]};
          compInfo1.isExternal = data2.components[key].isExternal;
          expect(encodeComponentInfo(compInfo1)).toEqual(encodeComponentInfo(data2.components[key]));
      } 
    };
    const synchronTester = async (store1, store2) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const crdts1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects;
      const crdts2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects;
      // Components tests
      const compKeys1 = Object.keys(data1.components);
      const compKeys2 = Object.keys(data2.components);
      expect(compKeys1.length).toEqual(crdts1.componentsInfoObject.size);
      expect(compKeys2.length).toEqual(crdts2.componentsInfoObject.size);
      expect(compKeys2.length).toEqual(compKeys1.length);
      for (const compId of compKeys1) {
        const compInfo1 = { ...data1.components[compId]};
        compInfo1.isExternal = JSON.parse(crdts1.componentsInfoObject.get(compId)).isExternal;
        expect(crdts1.componentsInfoObject.get(compId)).toEqual(JSON.stringify(compInfo1));
      }
      for (const compId of compKeys1) {
        const compInfo1 = { ...data1.components[compId]};
        compInfo1.isExternal = data2.components[compId].isExternal;
        expect(data2.components[compId]).toEqual(compInfo1);
      }
      for (const compId of compKeys2) {
        const compInfo2 = { ...data2.components[compId]};
        compInfo2.isExternal = JSON.parse(crdts2.componentsInfoObject.get(compId)).isExternal;
        expect(crdts2.componentsInfoObject.get(compId)).toEqual(JSON.stringify(compInfo2));
      }
      //connections Tests
      const conecKeys1 = Object.keys(data1.connections);
      const conecKeys2 = Object.keys(data2.connections);
      expect(conecKeys2.length).toEqual(crdts2.connectionsObject.size);
      expect(conecKeys1.length).toEqual(crdts1.connectionsObject.size);
      expect(conecKeys2.length).toEqual(conecKeys1.length)
      for (const conecId of conecKeys1) {
        expect(crdts1.connectionsObject.get(conecId)).toEqual(JSON.stringify(data1.connections[conecId]));
      }
      for (const conecId of conecKeys2) {
        expect(data2.connections[conecId]).toEqual(data1.connections[conecId]);
      }
      for (const conecId of compKeys2) {
        expect(crdts2.connectionsObject.get(conecId)).toEqual(JSON.stringify(data2.connections[conecId]));
      }
    }
        //Im MOment nur 1 label pro Componente möglich
    const addLabelTester = async (store1, store2, newLabel, changedComponentId, newLabel2 = {}) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const changedComponentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      const changedComponentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      expect([newLabel,newLabel2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject1).label);
      expect([newLabel,newLabel2]).toContainEqual(data1.components[changedComponentId].label);
      expect([newLabel,newLabel2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject2).label);
      expect([newLabel,newLabel2]).toContainEqual(data2.components[changedComponentId].label);
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject1).label)).toEqual(JSON.stringify(data1.components[changedComponentId].label));
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject2).label)).toEqual(JSON.stringify(data2.components[changedComponentId].label));
      expect(JSON.stringify(data2.components[changedComponentId].label)).toEqual(JSON.stringify(data1.components[changedComponentId].label));
    };
    const removeLabelTester = async (store1, store2, changedComponentId, labelId) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const changedComponentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      const changedComponentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      if(data1.components[changedComponentId].label) {
        expect((decodeComponentInfo(changedComponentInfoObject1).label)).toEqual(data1.components[changedComponentId].label);
        expect(decodeComponentInfo(changedComponentInfoObject2).label).toEqual(data2.components[changedComponentId].label);
        expect(data2.components[changedComponentId].label).toEqual(data1.components[changedComponentId].label);
        expect(data1.components[changedComponentId].label.labelId).not.toEqual(labelId);
      } else {
        expect((decodeComponentInfo(changedComponentInfoObject1).label)).toEqual(data1.components[changedComponentId].label);
        expect(decodeComponentInfo(changedComponentInfoObject2).label).toEqual(data2.components[changedComponentId].label);
        expect(data2.components[changedComponentId].label).toEqual(data1.components[changedComponentId].label);
        expect(data1.components[changedComponentId].label).toBeUndefined();
      }
    };
    const updateSizeTester = async (store1, store2, newSize, changedComponentId, newSize2 = {}) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const changedComponentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      const changedComponentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      expect(JSON.stringify(data2.components[changedComponentId].size)).toEqual(JSON.stringify(data1.components[changedComponentId].size));
      expect([newSize,newSize2]).toContainEqual(data2.components[changedComponentId].size);
      expect([newSize,newSize2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject2).size);
      expect([newSize,newSize2]).toContainEqual(data1.components[changedComponentId].size);
      expect([newSize,newSize2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject1).size);
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject1).size)).toEqual(JSON.stringify(data1.components[changedComponentId].size));
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject2).size)).toEqual(JSON.stringify(data2.components[changedComponentId].size));
    };
    const moveComponentTester = async (store1, store2, newPosition, changedComponentId, newPosition2) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const changedComponentInfoObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      const changedComponentInfoObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.componentsInfoObject.get(changedComponentId);
      expect([newPosition,newPosition2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject1).position);
      expect([newPosition,newPosition2]).toContainEqual(data1.components[changedComponentId].position);
      expect([newPosition,newPosition2]).toContainEqual(decodeComponentInfo(changedComponentInfoObject2).position);
      expect([newPosition,newPosition2]).toContainEqual(data2.components[changedComponentId].position);
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject1).position)).toEqual(JSON.stringify(data1.components[changedComponentId].position));
      expect(JSON.stringify(decodeComponentInfo(changedComponentInfoObject2).position)).toEqual(JSON.stringify(data2.components[changedComponentId].position));
      expect(JSON.stringify(data2.components[changedComponentId].position)).toEqual(JSON.stringify(data1.components[changedComponentId].position));
    };
    const addConnectionTester = async (store1, store2, numberOfConnections,fromId,toId) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const componentconnectionsObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.connectionsObject
      const componentconnectionsObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.connectionsObject
      const connectionId = encodeConnection(fromId,toId);
    for (const keys of componentconnectionsObject1.keys()) {
        expect(data1.connections.hasOwnProperty(keys)).toBe(true);
        expect(componentconnectionsObject1.get(keys)).toEqual(encodeComponentInfo(data1.connections[keys]));
    }  
    for (const keys of componentconnectionsObject2.keys()) {
        expect(data2.connections.hasOwnProperty(keys)).toBe(true);
        expect(componentconnectionsObject2.get(keys)).toEqual(encodeComponentInfo(data2.connections[keys]));
    }
    const localKeys1 = Object.keys(data1.connections);
    const localKeys2 = Object.keys(data2.connections);
    expect(localKeys1.length).toEqual(numberOfConnections);
    expect(localKeys2.length).toEqual(numberOfConnections);
    //wenn das stimmt dann muss es in jedem drin sein wegen "gleichheits kette"
    expect(data1.connections.hasOwnProperty(connectionId)).toBe(true);
    expect(componentconnectionsObject1.size).toEqual(numberOfConnections);
    expect(componentconnectionsObject2.size).toEqual(numberOfConnections);
    for (const key of localKeys1) {
        expect(encodeComponentInfo(data1.components[key])).toEqual(encodeComponentInfo(data2.components[key]));
    }
    };
    const removeConnectionTester = async (store1, store2, numberOfConnections,fromId,toId) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const componentconnectionsObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.connectionsObject
      const componentconnectionsObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.connectionsObject
      const connectionId = encodeConnection(fromId,toId);
      expect(componentconnectionsObject1.has(connectionId)).toBe(false);
      expect(data1.connections.hasOwnProperty(connectionId)).toBe(false);
      expect(componentconnectionsObject2.has(connectionId)).toBe(false);
      expect(data2.connections.hasOwnProperty(connectionId)).toBe(false);
      const localKeys1 = Object.keys(data1.connections);
      const localKeys2 = Object.keys(data2.connections);
      expect(localKeys1.length).toEqual(numberOfConnections);
      expect(localKeys2.length).toEqual(numberOfConnections);
      expect(componentconnectionsObject1.size).toEqual(numberOfConnections);
      expect(componentconnectionsObject2.size).toEqual(numberOfConnections);
    };
    const removeAllConnectionsTester = async (store1, store2, numberOfConnections, componentId) => {
      const data1 = await store1.getState().boards.entities.boardId1.boardObject.data;
      const data2 = await store2.getState().boards.entities.boardId2.boardObject.data;
      const componentconnectionsObject1 = await store1.getState().boards.entities.boardId1.boardObject.crdtObjects.connectionsObject
      const componentconnectionsObject2 = await store2.getState().boards.entities.boardId2.boardObject.crdtObjects.connectionsObject
      for (const connection of componentconnectionsObject1.keys()) {
        expect(data1.connections.hasOwnProperty(connection)).toBe(true);
        expect(connection).toEqual(expect.not.stringContaining(componentId));
      }
      for (const connection of componentconnectionsObject2.keys()) {
        expect(data2.connections.hasOwnProperty(connection)).toBe(true);
        expect(connection).toEqual(expect.not.stringContaining(componentId));
      }
      const localKeys1 = Object.keys(data1.connections);
      const localKeys2 = Object.keys(data2.connections);
      expect(localKeys1.length).toEqual(numberOfConnections);
      expect(localKeys2.length).toEqual(numberOfConnections);
      expect(componentconnectionsObject1.size).toEqual(numberOfConnections);
      expect(componentconnectionsObject2.size).toEqual(numberOfConnections);
    };

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the addComponent in the concurent operations', () => {
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
        console.log('AddComponent Test have finished');
      });
      it.each(cases)('shoudld Add two extra Components in both instances if two component adds are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 0;
        const numberofCompsAdsinTest = 2;
        const numberofCompRemovesinTest = 0; 
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        addComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentType: 'todoList', innerId: 'innerId2', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
      }, 30000);
      it.each(cases)('shoudld Add one Compoenent and remove the same Component in both instances if a component add and a component remove is done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });

        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        removeComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentId: 'comp1'});

      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1, 'comp1')
      }, 30000);
      it.each(cases)('shoudld add one component in both instances and change the label of one of the already exisiting components if a component add and  label add are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        const labelId = 'LabelId';
        const description = 'New Label';
        const flag = false;
        const count = 0;
        const changedComponentId = 'comp1';
        addLabelDispatcher({jest, localstore: store2, boardId: boardId2, labelId: labelId, description: description, componentId: changedComponentId});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await addLabelTester(store1, store2, {labelId, description, flag, count}, changedComponentId)
      }, 30000);
      it.each(cases)('should add one extra Component in both instances and delete the label of the already exisiting Component if a add Component and  a remove Label are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const labelId = 'LabelId';
        const description = 'New Label';
        const changedComponentId = 'comp1';
        addLabelDispatcher({jest, localstore: store2, boardId: boardId2, labelId: labelId, description: description, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        removeLabelDispatcher({jest, localstore: store2, boardId: boardId2, labelId: labelId, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await removeLabelTester(store1, store2, changedComponentId, labelId);
      }, 30000);
      it.each(cases)('should add one extra Component in both instances and update the size of a already existing Component if a add Component and a update Size are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        const changedComponentId = 'comp1';
        const newSize = {height:400,width:100};
        updateSizeDispatcher({jest, localstore: store2, boardId: boardId2, componentId: changedComponentId, newSize: newSize});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await updateSizeTester(store1, store2, newSize,changedComponentId);
      }, 30000);
      it.each(cases)('should add one extra Component in both instances and update the position of a already existing Component if an add Component and a move Component are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        const changedComponentId = 'comp1';
        const newPosition = {x:20,y:100};
        moveComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentId: changedComponentId, newPosition});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await moveComponentTester(store1, store2, newPosition,changedComponentId);
      }, 30000);
      it.each(cases)('should add one extra Component in both instances and add a connection between to already exisiting Components if add component and add connection are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 2;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        const numberOfNewConnections = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId3', componentInfo: { componentId:'comp3' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        addConnectionDispatcher({jest, localstore: store2, boardId: boardId2, fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      }, 30000);
      it.each(cases)('should add one Component in both instances and delete one exisiting Connection if add component and remove Connection are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 2;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        const numberOfConnections = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        addConnectionDispatcher({jest, localstore: store1, boardId: boardId1, fromId: fromId, toId: toId});
        // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
        addConnectionDispatcher({jest, localstore: store1, boardId: boardId1, fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId3', componentInfo: { componentId:'comp3' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        removeConnectionDispatcher({jest, localstore: store2, boardId: boardId2, fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      }, 30000);
      it.each(cases)('should add one Component in both instances and delete all exisiting Connections of a specific component if add component and remove all Connections are done concurently',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 3;
        const numberofCompsAdsinTest = 1;
        const numberofCompRemovesinTest = 0;
        const numberOfConnections = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        addConnectionDispatcher({jest, localstore: store2, boardId: boardId2, fromId: fromId, toId: toId});
        // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
        addConnectionDispatcher({jest, localstore: store1, boardId: boardId1, fromId: toId, toId: fromId});
        addConnectionDispatcher({jest, localstore: store1, boardId: boardId1, fromId: 'comp2', toId: 'comp0'});
        // %TODO Abstract
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const CompIdToDelAllConnect = fromId
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'spreadsheet', innerId: 'innerId3', componentInfo: { componentId:'comp3' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "Spreadsheet"});
        removeAllConnectionsDispatcher({jest, localstore: store2, boardId: boardId2, componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await addComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest);
        await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      }, 30000);

  });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the removeComponent in the concurent operations', () => {
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
        console.log('Remove Component Tests have finished');
      });
      it.each(cases)('shoudld remove one Component in both instances if two component removes are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 1;
        const numberofCompsAdsinTest = 0;
        const numberofCompRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });

        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const remCompId = 'comp1'
        removeComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentId: remCompId});
        removeComponentDispatcher({jest, localstore: store2, boardId: boardId2, componentId: remCompId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1, remCompId)
      }, 30000);
      it.each(cases)('shoudld not remove one Component in both instances and add a label if a component remove and  label add are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        addComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const remCompId = 'comp1'
        removeComponentDispatcher({jest, localstore: store1, boardId: boardId1, componentId: remCompId});
        const labelId = 'LabelId';
        const description = 'New Label';
        addLabelDispatcher({jest, localstore: store2, boardId: boardId2, labelId: labelId, description: description, componentId: remCompId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const flag = false;
        const count = 0;
        await synchronTester(store1, store2);
        // Wird eh nicht gelöscht
        // await removeComponentTester(store1, store2,expectedNumOfComps, 1);
        // Dont need because comps should be deleted
        await addLabelTester(store1, store2, {labelId, description, flag, count}, remCompId);
      }, 30000);
      it.each(cases)('should not remove one Component in both instances and delete the label of the already exisiting Component if a remove Component and  a remove Label are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test/Setup
        let description = 'testAddLabel';
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: description});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const labelId = 'LabelId';
        description = 'New Label';
        const changedComponentId = 'comp1';
        addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId, description: description, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        // The acutal Test
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: changedComponentId});
        removeLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await synchronTester(store1, store2);
        // Im Moment gewinnt immer die eignenschaft change
        // Wird eh nicht gelöscht
        //await removeComponentTester(store1, store2, expectedNumOfComps, 1);
        await removeLabelTester(store1, store2, changedComponentId, labelId);
      }, 30000);
      it.each(cases)('should not remove one Component in both instances and update the size of a already existing Component if a remove Component and a update Size are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const concurentCompId = 'comp1';
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: concurentCompId});
        const newSize = {height:400,width:100};
        updateSizeDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newSize: newSize});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        // Wird eh nicht gelöscht
        // await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1);
        await updateSizeTester(store1, store2, newSize,concurentCompId);
        await synchronTester(store1, store2);
      }, 30000);
      it.each(cases)('should not remove one Component in both instances and update the position of a already existing Component if an remove Component and a move Component are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const concurentCompId = 'comp1';
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: concurentCompId});
        const newPosition = {x:20,y:100};
        moveComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newPosition});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        // doesnt do anything
        // await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1);
        await moveComponentTester(store1, store2, newPosition,concurentCompId);
        await synchronTester(store1, store2);
      }, 30000);
      it.skip.each(cases)('should  remove one Component in both instances and not add a connection between two already exisiting Components if remove Component is done on one of the components the add connection is done',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 2;
        const numberofCompsAdsinTest = 0;
        const numberofCompRemovesinTest = 1;
        const numberOfNewConnections = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId});
        addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1, fromId);
        await synchronTester(store1, store2);
        await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      }, 30000);
      it.each(cases)('should remove one Component in both instances and delete one exisiting Connection if add component and remove Connection are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 2;
        const numberofCompsAdsinTest = 0;
        const numberofCompRemovesinTest = 1;
        const numberOfConnections = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
        // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
        addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId});
        removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1, fromId);
        await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
        await synchronTester(store1, store2);
      }, 30000);
      it.each(cases)('should remove one Component in both instances and delete all exisiting Connections of a specific component if remove component and remove all Connections are done concurently on the same componentId',async () => {
        loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
        loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
        const initNumbOfComps = 3;
        const numberofCompsAdsinTest = 0;
        const numberofCompRemovesinTest = 1;
        const numberOfConnections = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        // Inits the store for the Test
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
        addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const fromId = 'comp1';
        const toId= 'comp2';
        addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
        // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
        addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
        addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        
        updateInDoc1 = [];
        updateInDoc2 = [];
        const CompIdToDelAllConnect = fromId
        removeComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: CompIdToDelAllConnect});
        removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

        await removeComponentTester(store1, store2, initNumbOfComps + numberofCompsAdsinTest - numberofCompRemovesinTest, 1, CompIdToDelAllConnect);
        await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
        await synchronTester(store1, store2);
      }, 30000);
  
    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the addLabel in the concurent operations', () => {
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
      console.log('Add Label Tests have finished');
    });
    it.each(cases)('shoudld add one label if two label add are done concurently on the same componentId should work like a LWW',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const changeingCompId = 'comp1'
      const labelId1 = 'LabelId1';
      const description1 = 'New Label1';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: changeingCompId});
      const labelId2 = 'LabelId2';
      const description2 = 'New Label2';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId2, description: description2, componentId: changeingCompId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await synchronTester(store1, store2);
      // Wird eh nicht gelöscht
      // await removeComponentTester(store1, store2,expectedNumOfComps, 1);
      // Dont need because comps should be deleted
      await addLabelTester(store1, store2, {labelId: labelId2, description: description2, flag, count}, changeingCompId, {labelId: labelId1, description: description1, flag, count});
    }, 30000);
      //Important
      //Interessting because this test is a perfect example that the conflict resoltion depends on many things and it might differ from execution to exection if a bug occurs
    it.skip.each(cases)('should add one label in both instances and delete the label of the already exisiting Component if a add Label and  a remove Label are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const changedComponentId = 'comp1';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      // The acutal Test
      const labelId2 = 'LabelId2';
      const description2 = 'New Label2';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId2, description: description2, componentId: changedComponentId});
      removeLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await synchronTester(store1, store2);
      // Im Moment gewinnt immer die eignenschaft change
      //Important
      //Interessting because this thest is a perfect example that the conflict resoltion depends on many things and it might differ from execution to exection if a bug occurs
      await removeLabelTester(store1, store2, changedComponentId, labelId1);
      await addLabelTester(store1, store2, {labelId: labelId2, description: description2, flag, count}, changedComponentId)
    }, 30000);
    it.skip.each(cases)('should add one label in both instances and update the size of a already existing Component if a add Label and a update Size are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const concurentCompId = 'comp1';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: concurentCompId});
      const newSize = {height:400,width:100};
      updateSizeDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newSize: newSize});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await addLabelTester(store1, store2, {labelId: labelId1, description: description1, flag, count}, concurentCompId)
      await updateSizeTester(store1, store2, newSize,concurentCompId);
      await synchronTester(store1, store2);
    }, 30000);
    it.skip.each(cases)('should add one label in both instances and update the position of a already existing Component if an add label and a move Component are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const concurentCompId = 'comp1';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: concurentCompId});
      const newPosition = {x:20,y:100};
      moveComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newPosition});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await synchronTester(store1, store2);
      await addLabelTester(store1, store2, {labelId: labelId1, description: description1, flag, count}, concurentCompId)
      await moveComponentTester(store1, store2, newPosition,concurentCompId);
    }, 30000);
    it.each(cases)('should  add one label in both instances and not add a connection between two already exisiting Components if add label  and add connection is done concurently',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfNewConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: fromId});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await synchronTester(store1, store2);
      await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      await addLabelTester(store1, store2, {labelId: labelId1, description: description1, flag, count}, fromId);
    }, 30000);
    it.each(cases)('should add one label in both instances and delete one exisiting Connection if add label and remove Connection are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: fromId});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await addLabelTester(store1, store2, {labelId: labelId1, description: description1, flag, count}, fromId);
      await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('should add one label in both instances and delete all exisiting Connections of a specific component if add Label and remove all Connections are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      addLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, description: description1, componentId: CompIdToDelAllConnect});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      const flag = false;
      const count = 0;
      await addLabelTester(store1, store2, {labelId: labelId1, description: description1, flag, count}, CompIdToDelAllConnect);;
      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the removeLabel in the concurent operations', () => {
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
      console.log('Remove Label Tests have finished');
    });
    it.each(cases)('should remove the Label in both instances if two remove Label are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const changedComponentId = 'comp1';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      // The acutal Test
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: changedComponentId});
      removeLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      // Im Moment gewinnt immer die eignenschaft change
      await removeLabelTester(store1, store2, changedComponentId, labelId1);
    }, 30000);
    it.skip.each(cases)('should ?? LWW remove the Label in both instances and update the size of a already existing Component if a remove Label and a update Size are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const changedComponentId = 'comp1';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const concurentCompId = 'comp1';
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: concurentCompId});
      const newSize = {height:400,width:100};
      updateSizeDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newSize: newSize});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeLabelTester(store1, store2, changedComponentId, labelId1);
      await updateSizeTester(store1, store2, newSize,concurentCompId);
      await synchronTester(store1, store2);
    }, 30000);
    it.skip.each(cases)('should ?? LWW remove the Label in both instances and update the position of a already existing Component if an remove label and a move Component are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const changedComponentId = 'comp1';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const concurentCompId = 'comp1';
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: concurentCompId});
      const newPosition = {x:20,y:100};
      moveComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newPosition});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await removeLabelTester(store1, store2, changedComponentId, labelId1);
      await moveComponentTester(store1, store2, newPosition,concurentCompId);
    }, 30000);
    it.each(cases)('should  remove one label in both instances and not add a connection between two already exisiting Components if remove label  and add connection is done concurently',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfNewConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      const changedComponentId = 'comp1';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: changedComponentId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = changedComponentId;
      const toId= 'comp2';
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: fromId});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      await removeLabelTester(store1, store2, fromId, labelId1);
    }, 30000);
    it.each(cases)('should remove one label in both instances and delete one exisiting Connection if remove label and remove Connection are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: fromId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});

      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: fromId});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeLabelTester(store1, store2, fromId, labelId1);
      await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('should remove one label in both instances and delete all exisiting Connections of a specific component if remove Label and remove all Connections are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1' }, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2' }, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      const labelId1 = 'LabelId';
      const description1 = 'New Label';
      addLabelDispatcher({jest, localstore: store2, boardId: 'boardId2', labelId: labelId1, description: description1, componentId: fromId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      removeLabelDispatcher({jest, localstore: store1, boardId: 'boardId1', labelId: labelId1, componentId: CompIdToDelAllConnect});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeLabelTester(store1, store2, CompIdToDelAllConnect, labelId1);
      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });
  
  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the updateSize in the concurent operations', () => {
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
      console.log('updateSize Tests have finished');
    });
    it.each(cases)('should update the size of a already existing Component if two update Size are done concurently on the same componentId and behave like a LWW',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const concurentCompId = 'comp1';
      const newSize1 = {height:333,width:666};
      updateSizeDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: concurentCompId, newSize: newSize1});
      const newSize2 = {height:400,width:100};
      updateSizeDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newSize: newSize2});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await updateSizeTester(store1, store2, newSize1,concurentCompId, newSize2);
      await synchronTester(store1, store2);
    }, 30000);
    it.skip.each(cases)('should maybe ?? LWW update Size in both instances and update the position of a already existing Component if an update Size and a move Component are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const concurentCompId = 'comp1';
      const newSize1 = {height:333,width:666};
      updateSizeDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: concurentCompId, newSize: newSize1});
      const newPosition = {x:20,y:100};
      moveComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newPosition});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await updateSizeTester(store1, store2, newSize1,concurentCompId);
      await moveComponentTester(store1, store2, newPosition,concurentCompId);
    }, 30000);
    it.each(cases)('should  update Size in both instances and add a connection between two already exisiting Components if update Size  and add connection is done concurently on same Comp',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfNewConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      const newSize1 = {height:333,width:666};
      updateSizeDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId, newSize: newSize1});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      await updateSizeTester(store1, store2, newSize1,fromId);
    }, 30000);
    it.each(cases)('should update Size in both instances and delete one exisiting Connection if update Size and remove Connection are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const newSize1 = {height:333,width:666};
      updateSizeDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId, newSize: newSize1});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await updateSizeTester(store1, store2, newSize1, fromId);
      await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('should update Size in both instances and delete all exisiting Connections of a specific component if update Size and remove all Connections are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      const newSize1 = {height:333,width:666};
      updateSizeDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: CompIdToDelAllConnect, newSize: newSize1});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await updateSizeTester(store1, store2, newSize1,CompIdToDelAllConnect);
      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the moveComponent in the concurent operations', () => {
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
      console.log('Move Component Tests have finished');
    });
    it.each(cases)('should  update the position of a already existing Component if two move Component are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const concurentCompId = 'comp1';
      const newPosition1 = {x:33,y:55};
      moveComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: concurentCompId, newPosition: newPosition1});
      const newPosition2 = {x:20,y:100};
      moveComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: concurentCompId, newPosition: newPosition2});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await moveComponentTester(store1, store2, newPosition1,concurentCompId, newPosition2);
    }, 30000);
    it.each(cases)('should  update Position in both instances and add a connection between two already exisiting Components if update Position  and add connection is done concurently on same Comp',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfNewConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      const newPosition1 = {x:33,y:55};
      moveComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId, newPosition: newPosition1});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await synchronTester(store1, store2);
      await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
      await moveComponentTester(store1, store2, newPosition1,fromId);
    }, 30000);
    it.each(cases)('should update Size in both instances and delete one exisiting Connection if update Size and remove Connection are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const newPosition1 = {x:33,y:55};
      moveComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: fromId, newPosition: newPosition1});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await moveComponentTester(store1, store2, newPosition1,fromId);
      await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('should update Size in both instances and delete all exisiting Connections of a specific component if update Size and remove all Connections are done concurently on the same componentId',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      const newPosition1 = {x:33,y:55};
      moveComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: CompIdToDelAllConnect, newPosition: newPosition1});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await moveComponentTester(store1, store2, newPosition1,CompIdToDelAllConnect);
      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the addConnection in the concurent operations', () => {
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
      console.log('Add Connection Tests have finished');
    });
    it.each(cases)('should  add a connection between two already exisiting Components if two add connection are done concurently on same Comp from',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfNewConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: fromId, toId: toId});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      
      await synchronTester(store1, store2);
      await addConnectionTester(store1, store2, numberOfNewConnections,fromId,toId);
    }, 30000);
    it.each(cases)('shouldnt diverge if addConnection and remove Connection are done concurently on the same Connection',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: fromId, toId: toId});
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: toId, toId: fromId});

      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: fromId, toId: toId});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      //await addConnectionTester(store1, store2, numberOfConnections + 1 ,fromId,toId);
      //await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      // Only important that they are equal
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('shouldnt diverge if addConnection and remove all Connections are done concurently on the same componentId/Connection',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: CompIdToDelAllConnect, toId: toId});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      // Only matters that they are equal semantic idc
      //await addConnectionTester(store1, store2, numberOfConnections + 1 ,fromId,toId);
      //await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the removeConnection in the concurent operations', () => {
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
      console.log('Remove one Connections Tests have finished');
    });
    it.each(cases)('shouldnt delete the Connection if two remove Connection are done concurently on the same Connection',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      removeConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: fromId, toId: toId});
      removeConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      //await addConnectionTester(store1, store2, numberOfConnections + 1 ,fromId,toId);
      await removeConnectionTester(store1, store2, numberOfConnections,fromId,toId);
      // Only important that they are equal
      await synchronTester(store1, store2);
    }, 30000);
    it.each(cases)('should delet every connection the specific component is part of if remove Connection and remove all Connections are done concurently on the same componentId/Connection',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      removeConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: CompIdToDelAllConnect, toId: toId});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });

  describe('For the Board it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the removeAllConnections in the concurent operations', () => {
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
      console.log('Remove all Connections Tests have finished');
    });
    it.each(cases)('should delet every connection the specific component is part of if remove Connection and remove all Connections are done concurently on the same componentId/Connection',async () => {
      loadBoardDispatcher({ jest, localstore: store1, boardId: 'boardId1'});
      loadBoardDispatcher({ jest, localstore: store2, boardId: 'boardId2'});
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['boardId1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['boardId2-ydoc'];
      const numberOfConnections = 1;
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        });
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        });
      // Inits the store for the Test
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId0', componentInfo: { componentId:'comp0'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store1, boardId: 'boardId1', componentType: 'todolist', innerId: 'innerId2', componentInfo: { componentId:'comp1'}, createdBy: createdBy1, createdOn: createdOn1, labelId: "TodoList"});
      addComponentDispatcher({jest, localstore: store2, boardId: 'boardId2', componentType: 'spreadsheet', innerId: 'innerId1', componentInfo: { componentId:'comp2'}, createdBy: createdBy2, createdOn: createdOn2, labelId: "Spreadsheet"});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const fromId = 'comp1';
      const toId= 'comp2';
      addConnectionDispatcher({jest, localstore: store2, boardId: 'boardId2', fromId: fromId, toId: toId});
      // Genau getauschte richtung. Damit überprüft wird dass genua nur eine Connection gelöscht wird
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: toId, toId: fromId});
      addConnectionDispatcher({jest, localstore: store1, boardId: 'boardId1', fromId: 'comp2', toId: 'comp0'});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const CompIdToDelAllConnect = fromId
      removeAllConnectionsDispatcher({jest, localstore: store1, boardId: 'boardId1', componentId: CompIdToDelAllConnect});
      removeAllConnectionsDispatcher({jest, localstore: store2, boardId: 'boardId2', componentId: CompIdToDelAllConnect});
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeAllConnectionsTester(store1, store2, numberOfConnections,CompIdToDelAllConnect);
      await synchronTester(store1, store2);
    }, 30000);

    });
