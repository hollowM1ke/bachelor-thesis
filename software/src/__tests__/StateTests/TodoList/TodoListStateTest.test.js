
  import {
    loadTodoListDispatcher,
    addItemDispatcher,
    setCheckedDispatcher,
    removeItemDispatcher,
    editTextDispatcher
  } from '../../../test_services/predefineStates/ToDoListPredefined'

// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';

  import { setupStore} from '../../../model/app/store.js'
  import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider'
  import * as Y from 'yjs'
  const cases = [...Array(1).keys()];
  const getBoardObjId = boardId => `board-${boardId}`;
  var store1;
  var store2;
  process.env.test = true;
  const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
    Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
    Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
    jest.runOnlyPendingTimers();
  };
  const addItemTester = async (store1, store2, numberOfExpectedItems) => {
    const todoListCRDT1 = await store1.getState().todolists.entities.t1.todoListObject.crdtObjects
    const todoListCRDT2 = await store2.getState().todolists.entities.t1.todoListObject.crdtObjects
    const value1 = await store1.getState().todolists.entities.t1.todoListObject.data.value;
    const value2 = await store2.getState().todolists.entities.t1.todoListObject.data.value;
    for (let i = 0; i < numberOfExpectedItems; i++) {
      expect(todoListCRDT1.todoListArray.get(i)).toEqual(value1[i].id);
      expect(todoListCRDT1.todoListCheckedMap.get(value1[i].id)).toEqual(value1[i].checked);
      expect(todoListCRDT1.todoListTextMap.get(value1[i].id)).toEqual(value1[i].text);
    }
    expect(value1.length).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListArray.length).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListCheckedMap.size).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListTextMap.size).toEqual(numberOfExpectedItems);
     // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the TodoList is Consistent
     for (let i = 0; i < numberOfExpectedItems; i++) {
      expect(todoListCRDT2.todoListArray.get(i)).toEqual(value2[i].id);
      expect(todoListCRDT2.todoListCheckedMap.get(value2[i].id)).toEqual(value2[i].checked);
      expect(todoListCRDT2.todoListTextMap.get(value2[i].id)).toEqual(value2[i].text);
    }
     expect(value2.length).toEqual(numberOfExpectedItems);
     expect(todoListCRDT2.todoListArray.length).toEqual(numberOfExpectedItems);
     expect(todoListCRDT2.todoListCheckedMap.size).toEqual(numberOfExpectedItems);
     expect(todoListCRDT2.todoListTextMap.size).toEqual(numberOfExpectedItems);
     // Evaluating if the Data in the non CRDTs of both Stores is Consistent
     for (let i = 0; i < numberOfExpectedItems; i++) {
      expect(value2[i]).toEqual(value1[i]);
     }
     expect(value2.length).toEqual(value1.length);
  };

  const removeItemTester = async (store1, store2, numberOfExpectedItems, remItemId) => {
    const todoListCRDT1 = await store1.getState().todolists.entities.t1.todoListObject.crdtObjects
    const todoListCRDT2 = await store2.getState().todolists.entities.t1.todoListObject.crdtObjects
    const value1 = await store1.getState().todolists.entities.t1.todoListObject.data.value;
    const value2 = await store2.getState().todolists.entities.t1.todoListObject.data.value;
    // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the TodoList is Consistent
    todoListCRDT1.todoListArray.forEach((value) => {
      expect(value).not.toEqual(remItemId);
    });
    for (let i = 0; i < numberOfExpectedItems; i++) {
      expect(todoListCRDT1.todoListArray.get(i)).toEqual(value1[i].id);
      expect(todoListCRDT1.todoListCheckedMap.get(value1[i].id)).toEqual(value1[i].checked);
      expect(todoListCRDT1.todoListTextMap.get(value1[i].id)).toEqual(value1[i].text);
    }
    expect(todoListCRDT1.todoListArray.length).toEqual(numberOfExpectedItems);
    expect(value1.length).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListCheckedMap.size).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListTextMap.size).toEqual(numberOfExpectedItems);
    expect(todoListCRDT1.todoListTextMap.has(remItemId)).toBe(false);
    expect(todoListCRDT1.todoListCheckedMap.has(remItemId)).toBe(false);
      // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the TodoList is Consistent
    todoListCRDT2.todoListArray.forEach((value) => {
      expect(value).not.toEqual(remItemId);
    });

    for (let i = 0; i < numberOfExpectedItems; i++) {
      expect(todoListCRDT2.todoListArray.get(i)).toEqual(value2[i].id);
      expect(todoListCRDT2.todoListCheckedMap.get(value2[i].id)).toEqual(value2[i].checked);
      expect(todoListCRDT2.todoListTextMap.get(value2[i].id)).toEqual(value2[i].text);
    }
      expect(todoListCRDT2.todoListCheckedMap.size).toEqual(numberOfExpectedItems);
      expect(todoListCRDT2.todoListTextMap.size).toEqual(numberOfExpectedItems);
      expect(value2.length).toEqual(numberOfExpectedItems);
      expect(todoListCRDT2.todoListTextMap.has(remItemId)).toBe(false);
      expect(todoListCRDT2.todoListCheckedMap.has(remItemId)).toBe(false);
      // Evaluating if the Data in the non CRDTs of both Stores is Consistent
      expect(value2.length).toEqual(value1.length);
      for (let i = 0; i < numberOfExpectedItems; i++) {
        expect(value2[i]).toEqual(value1[i]);
      }
  };

  const updateTextTester = async (store1, store2, idOfChangedItem = '', newText = '', deleted = false, newText2 = '') => {
    const todoListCRDT1 = await store1.getState().todolists.entities.t1.todoListObject.crdtObjects
    const todoListCRDT2 = await store2.getState().todolists.entities.t1.todoListObject.crdtObjects
    const value1 = await store1.getState().todolists.entities.t1.todoListObject.data.value;
    const value2 = await store2.getState().todolists.entities.t1.todoListObject.data.value;
    if (!deleted) {
    for (const key of todoListCRDT1.todoListTextMap.keys()) {
      let indexOfKey = undefined;
      for (let ind = 0; ind < value1.length; ind ++) {
        if (value1[ind].id === key) {
          indexOfKey = ind;
        }
      }
      expect(indexOfKey).toBeDefined();
      expect(todoListCRDT1.todoListTextMap.get(key)).toEqual(value1[indexOfKey].text)
    }
    expect([newText, newText2]).toContainEqual(todoListCRDT1.todoListTextMap.get(idOfChangedItem));
    for (const key of todoListCRDT2.todoListTextMap.keys()) {
      let indexOfKey = undefined;
      for (let ind = 0; ind < value2.length; ind ++) {
        if (value2[ind].id === key) {
          indexOfKey = ind;
        }
      }
      expect(indexOfKey).toBeDefined();
      expect(todoListCRDT2.todoListTextMap.get(key)).toEqual(value2[indexOfKey].text)
    }
    expect([newText, newText2]).toContainEqual(todoListCRDT2.todoListTextMap.get(idOfChangedItem));
    for (let i = 0; i < value1.length; i++) {
      expect(value1[i].id).toEqual(value2[i].id);
      expect(value1[i].text).toEqual(value2[i].text);
    }
  }
  };

  const checkItemTester = async (store1, store2,  idOfChangedItem, deleted = false, shouldbeTrue = true) => {
    const todoListCRDT1 = await store1.getState().todolists.entities.t1.todoListObject.crdtObjects
    const todoListCRDT2 = await store2.getState().todolists.entities.t1.todoListObject.crdtObjects
    const value1 = await store1.getState().todolists.entities.t1.todoListObject.data.value;
    const value2 = await store2.getState().todolists.entities.t1.todoListObject.data.value;
    if (!deleted) {
    for (const key of todoListCRDT1.todoListCheckedMap.keys()) {
      let indexOfKey = undefined;
      for (let ind = 0; ind < value1.length; ind ++) {
        if (value1[ind].id === key) {
          indexOfKey = ind;
        }
      }
      expect(indexOfKey).toBeDefined();
      expect(todoListCRDT1.todoListCheckedMap.get(key)).toEqual(value1[indexOfKey].checked)
    }
    if (shouldbeTrue) {
      expect(todoListCRDT1.todoListCheckedMap.get(idOfChangedItem)).toEqual(true);
    }
    for (const key of todoListCRDT2.todoListCheckedMap.keys()) {
      let indexOfKey = undefined;
      for (let ind = 0; ind < value2.length; ind ++) {
        if (value2[ind].id === key) {
          indexOfKey = ind;
        }
      }
      expect(indexOfKey).toBeDefined();
      expect(todoListCRDT2.todoListCheckedMap.get(key)).toEqual(value2[indexOfKey].checked)
    }
    for (let i = 0; i < value1.length; i++) {
      expect(value1[i].id).toEqual(value2[i].id);
      expect(value1[i].checked).toEqual(value2[i].checked);
    }
  }
  };
  // %TODO Change the description so it is more readable and not so long maybe use identifiers for the cases instead of the whole description
  describe('For the Todolist it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data) for all the cases that involve add Item', () => {

    beforeEach(async () => {
      initDocument('13a');
      jest.useFakeTimers();
      store1 = setupStore();
      store2 = setupStore();
      });
    afterAll(() => {
        console.log('Test hast finished');
      });
    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
        cleanUpProviderCollection();
      });
    it.each(cases)('should add two Todolist Items in both Stores if two adds are done concurently on different "Clients"',async () => {
      // Loads two instances of a Todolist in two different Stores but same docName so they are can sync easily
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });

      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        })
        
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
        
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      addItemDispatcher({ jest, localstore: store2, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the TodoList is Consistent
      await addItemTester(store1, store2, 2)
    }, 30000);
    it.each(cases)('should add a new Item in both at the end of the list and check the already existing Item in both if a check of a Item and an add at the end of the list are done concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        })
        
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: 0, text: '' });
      setCheckedDispatcher({ jest, localstore: store2, docId: 't1', atIndex: 0, checked: true });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await addItemTester(store1, store2, 2);
      await checkItemTester(store1, store2, itemId);
    }, 30000);
    it.each(cases)('should remove the already existing Item in both Stores and add a new one in both at the end of the list if remove of a item and an add at the end of the list are done concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];

      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
            updateInDoc1.push(update);
        })
        
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: 0, text: '' });
      removeItemDispatcher({ jest, localstore: store2, docId: 't1', remItemId: itemId, atIndex: 0 });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      await addItemTester(store1, store2, 1);
      await removeItemTester(store1, store2, 1, itemId);
    }, 30000);
    it.each(cases)('shoudl edit the text of the already existing Item in both Stores and add a new Item in both at the end of the list if text of a item is edited and an add at the end of the list are done concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
            updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);

        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];

      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;

      const newText = 'LOL new Text';
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: 0, text: newText });
      editTextDispatcher({ jest, localstore: store2, docId: 't1', atIndex: 0, text: newText });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await addItemTester(store1, store2, 2);
      await updateTextTester(store1,store2, itemId, newText);
    }, 30000);
  });
  describe('For the Todolist it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data) for all the remaining cases that involve remove Item', () => {

    beforeEach(async () => {
      initDocument('13a');
      jest.useFakeTimers();
      store1 = setupStore();
      store2 = setupStore();
    });
    afterAll(() => {
      console.log('Test hast finished');
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
      cleanUpProviderCollection();
    });
    it.each(cases)('should remove the exsisting item so in both Stores the Todolist doesnt hold any Item if two removes on the same item are done concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
            updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      removeItemDispatcher({ jest, localstore: store1, docId: 't1', remItemId: itemId, atIndex: 0 });
      removeItemDispatcher({ jest, localstore: store2, docId: 't1', remItemId: itemId, atIndex: 0 });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      await removeItemTester(store1, store2, 0, itemId)
      }, 30000);
    it.skip.each(cases)('(!!!SHOULD FAIL!!!!!)should remove the existing item and all references it has in both Stores if a remove and a text edit are done on the same item concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });;
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
            updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      const newText = 'LOL new Text';
      editTextDispatcher({ jest, localstore: store1, docId: 't1', atIndex: 0, text: newText });
      removeItemDispatcher({ jest, localstore: store2, docId: 't1', remItemId: itemId, atIndex: 0 });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeItemTester(store1, store2, 0, itemId);
      await updateTextTester(store1, store2, itemId, newText, true);
      }, 30000);
    it.skip.each(cases)('(!!!SHOULD FAIL!!!!!)should remove the existing item and all references it has in both Stores if a remove and a set checked are done on the same item concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
    
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      setCheckedDispatcher({ jest, localstore: store1, docId: 't1', atIndex: 0, checked: true });
      removeItemDispatcher({ jest, localstore: store2, docId: 't1', remItemId: itemId, atIndex: 0 });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await removeItemTester(store1, store2, 0, itemId);
      await checkItemTester(store1, store2, itemId, true)
      }, 30000);
  });
  describe('For the Todolist it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data) for all the remaining cases that involve setText', () => {

    beforeEach(async () => {
      initDocument('13a');
      jest.useFakeTimers();
      store1 = setupStore();
      store2 = setupStore();
    });
    afterAll(() => {
      console.log('Test hast finished');
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
      cleanUpProviderCollection();
    });
    it.each(cases)('shoudl behave like a LWW if two text edit are done on the same item concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });
      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
            updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;

      const newText1 = 'LOL new Text';
      const newText2 = 'No new Text :)';
      editTextDispatcher({ jest, localstore: store1, docId: 't1', atIndex: 0, text: newText1 });
      editTextDispatcher({ jest, localstore: store2, docId: 't1', atIndex: 0, text: newText2 });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);

      await updateTextTester(store1, store2, itemId, newText1, false, newText2)
    }, 30000);
    it.each(cases)('should change text and set the Item checked in both instances if a text edit and a set checked are done on the same item concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });

      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
          updateInDoc2.push(update);
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      const newText = 'LOL new Text';
      editTextDispatcher({ jest, localstore: store1, docId: 't1', atIndex: 0, text: newText });
      setCheckedDispatcher({ jest, localstore: store2, docId: 't1', atIndex: 0, checked: true });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      await updateTextTester(store1, store2, itemId, newText, false);
      await checkItemTester(store1, store2, itemId, false);
    }, 30000);
  });
  describe('For the Todolist it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data) for all the remaining cases that involve setChecked', () => {

    beforeEach(async () => {
      initDocument('13a');
      jest.useFakeTimers();
      store1 = setupStore();
      store2 = setupStore();
    });
    afterAll(() => {
      console.log('Test hast finished');
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
      cleanUpProviderCollection();
    });
    it.each(cases)('should change setChecked to the checked falue in both instances if two set checked are done on the same item concurently on different "Clients"',async (num) => {
      loadTodoListDispatcher({ jest, localstore: store1, docId: 't1', boardId: 'boardId1' });
      loadTodoListDispatcher({ jest, localstore: store2, docId: 't1', boardId: 'boardId2' });

      const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
      const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
      let updateInDoc1 = [];
      let updateInDoc2 = [];
      doc1.on('update', (update) => {
          updateInDoc1.push(update);
        }) 
      doc2.on('update', (update) => {
        updateInDoc2.push(update);
    
        })
      addItemDispatcher({ jest, localstore: store1, docId: 't1', afterIdx: -1, text: '' });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      updateInDoc1 = [];
      updateInDoc2 = [];
      const itemId = await store2.getState().todolists.entities.t1.todoListObject.data.value[0].id;
      setCheckedDispatcher({ jest, localstore: store1, docId: 't1', atIndex: 0, checked: true });
      setCheckedDispatcher({ jest, localstore: store2, docId: 't1', atIndex: 0, checked: false });
      applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
      // why should the checked be false? %TODO LOOK INTO IT
      await checkItemTester(store1, store2, itemId, false, false)
    }, 30000);
  });