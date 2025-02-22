import { setupStore } from '../../../model/app/store.js'
import { getProviderCollectionInfo, cleanUpProviderCollection, initDocument } from '../../../services/collectionprovider.js'
import * as Y from 'yjs'
import { decodeCellInfo ,decodeCellKey ,encodeCellInfo, encodeCellKey } from '../../../model/features/spreadsheets/spreadSheetsFunctions.js';
import {
  loadSpreadSheetDispatcher,
  editCellDispatcher,
  addRowDispatcher,
  addColumnDispatcher,
  addCellHighlightFormatRuleDispatcher,
  removeRowDispatcher,
  removeColumnDispatcher,
  deleteCellHighlightFormatRuleDispatcher,
  editHeaderDispatcher,
} from '../../../test_services/predefineStates/SpreadSheetPredefined.js'

// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';

    const cases = [...Array(1).keys()];
    const getBoardObjId = boardId => `board-${boardId}`;
    var store1;
    var store2;
    const applyUpdates = (doc1, doc2, updateInDoc1, updateInDoc2) => {
      Y.applyUpdate(doc1, Y.mergeUpdates(updateInDoc2));
      Y.applyUpdate(doc2, Y.mergeUpdates(updateInDoc1));
      jest.runOnlyPendingTimers();
    };
    process.env.test = 'load 1';
    // todo konzepitionell noch überprüfen denn nur weil es gelich ist muss nich gewollt sein kann auch beides undefined sein und würde immer noch true zurück geben
    const valueDataTester = async (store1, store2, numberofRows = 1, numberofColumns = 1, changedCellRowPos = -1, changedCellColPos = -1, newText = '',newText2 = '') => {
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // value Data for store1
      // Checkes if the Cell Matrix has the right size and if the Cells have the correct content
      expect(JSON.stringify(value1.meta.rows)).toEqual(JSON.stringify(value2.meta.rows));
      expect(JSON.stringify(value1.meta.columns)).toEqual(JSON.stringify(value2.meta.columns));
      expect(JSON.stringify(value1.headers)).toEqual(JSON.stringify(value2.headers));
      expect(value1.data.length).toEqual(numberofRows); 
      for (let r = 0; r < numberofRows; r++) {
        expect(value1.data[r].length).toEqual(numberofColumns);
        for (let c = 0; c < numberofColumns; c++) {
          if(changedCellRowPos === r && changedCellColPos === c) {
          expect([newText,newText2]).toContainEqual(value1.data[r][c].value)
          expect(value1.data[r][c].type).toEqual('string');
          expect(value1.data[r][c].color).toEqual('#ffffff');
        } else {
          expect(value1.data[r][c].value).toEqual('');
          expect(value1.data[r][c].type).toEqual('string');
          expect(value1.data[r][c].color).toEqual('#ffffff');
        }
        }
      }
      // value Data for store2
      expect(value2.data.length).toEqual(numberofRows); 
      for (let r = 0; r < numberofRows; r++) {
        expect(value2.data[r].length).toEqual(numberofColumns);
        for (let c = 0; c < numberofColumns; c++) {
          if(changedCellRowPos === r && changedCellColPos === c) {
         /* expect(value2.data[r][c].value).toEqual(newText) ||
          expect(value2.data[r][c].value).toEqual(newText2);*/
          expect([newText,newText2]).toContainEqual(value2.data[r][c].value)
          expect(value2.data[r][c].type).toEqual('string');
          expect(value2.data[r][c].color).toEqual('#ffffff');
        } else {
          expect(value2.data[r][c].value).toEqual('');
          expect(value2.data[r][c].type).toEqual('string');
          expect(value2.data[r][c].color).toEqual('#ffffff');
        }
        }
      }
      // so value of store1 and store2 are equall
      for (let r = 0; r < numberofRows; r++) {
        for (let c = 0; c < numberofColumns; c++) {
          expect(value2.data[r][c].value).toEqual(value1.data[r][c].value);
          expect(value2.data[r][c].type).toEqual(value1.data[r][c].type);
          expect(value2.data[r][c].color).toEqual(value1.data[r][c].color);
        }
      }
    };
    //Helper function to abstract what needs to be tested if this specific operation is used in the testcase
    const addRowTester = async (store1, store2, expectedRowLength, numberofRowAds = 1, numberofColAds = 0) => {
      const rowsObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject;
      const rowsObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject;
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      // Checked if the YJS storage of Row IDs and the local storage of Row IDs contain the same IDs in the same order
      for (let i = 0; i <= numberofRowAds; i++) {
        expect(rowsObject1.get(i)).toEqual(value1.meta.rows[i]);
      }
      expect(rowsObject1.get(numberofRowAds + 1)).toBeUndefined();
      
      expect(value1.meta.rows.length).toEqual(expectedRowLength);
       // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
       for (let i = 0; i <= numberofRowAds; i++) {
        expect(rowsObject2.get(i)).toEqual(value2.meta.rows[i]);
      }
       expect(rowsObject2.get(numberofRowAds + 1)).toBeUndefined();
       expect(value2.meta.rows.length).toEqual(expectedRowLength);
       // Evaluating if the Data in the non CRDTs of both Stores is Consistent
       for (let r = 0; r <= numberofRowAds; r++) {
        expect(value1.meta.rows[r]).toEqual(value2.meta.rows[r]);
      }
    };
    //Helper function to abstract what needs to be tested if this specific operation is used in the testcase 
    const addColumnTester = async (store1, store2, expectedColumnLength, numberofColAds = 1, numberofRowAds = 0) => {
      const columnsObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.columnsObject
      const columnsObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.columnsObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      // Checked if the YJS storage of Row IDs and the local storage of Row IDs contain the same IDs in the same order
      for (let i = 0; i < expectedColumnLength; i++) {
        expect(columnsObject1.get(i)).toEqual(value1.meta.columns[i]);
      }
      expect(columnsObject1.get(expectedColumnLength)).toBeUndefined();
      expect(value1.headers.length).toEqual(expectedColumnLength);
      expect(value1.meta.columns.length).toEqual(expectedColumnLength);
       // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
       for (let i = 0; i < expectedColumnLength; i++) {
        expect(columnsObject2.get(i)).toEqual(value2.meta.columns[i]);
      }
      expect(columnsObject2.get(expectedColumnLength)).toBeUndefined();
      expect(value2.headers.length).toEqual(expectedColumnLength)
      expect(value2.meta.columns.length).toEqual(expectedColumnLength);
       // Evaluating if the Data in the non CRDTs of both Stores is Consistent
       for (let c = 0; c < expectedColumnLength; c++) {
        expect(value1.headers[c]).toEqual(value2.headers[c]);
        expect(value1.meta.columns[c]).toEqual(value2.meta.columns[c]);
      }
    };
    //Helper function to abstract what needs to be tested if this specific operation is used in the testcase
    const removeRowTester = async (store1, store2, expectedRowLength, idOfRemRow, numberofRowRemove = 1, numberofRowAds = 0, numberofColAds = 0) => {
      const rowsObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject
      const rowsObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      for (let i = 0; i < expectedRowLength; i++) {
        expect(rowsObject1.get(i)).toEqual(value1.meta.rows[i]);
        // testet ob wirklich die remId nicht mehr enthalten ist
        expect(idOfRemRow).not.toContainEqual(value1.meta.rows[i]);
      }
      expect(rowsObject1.get(expectedRowLength)).toBeUndefined();
      const dataObjectKeys1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject.keys();
      for (const keys of dataObjectKeys1) {
        for(const remRowId of idOfRemRow) {
          expect(keys).toEqual(expect.not.stringContaining(remRowId+'='));
        }
      }
      expect(value1.meta.rows.length).toEqual(expectedRowLength);
      // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
      for (let i = 0; i < expectedRowLength; i++) {
        expect(rowsObject2.get(i)).toEqual(value2.meta.rows[i]);
      }
      expect(rowsObject2.get(expectedRowLength)).toBeUndefined();
      const dataObjectKeys2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject.keys();
      for (const keys of dataObjectKeys2) {
        for(const remRowId of idOfRemRow) {
          expect(keys).toEqual(expect.not.stringContaining(remRowId+'='));
        }
      }
      expect(value2.meta.rows.length).toEqual(expectedRowLength);
      // Evaluating if the Data in the non CRDTs of both Stores is Consistent
      for (let r = 0; r < expectedRowLength; r++) {
        expect(value1.meta.rows[r]).toEqual(value2.meta.rows[r]);
      }
      
    };
    
    const removeColumnTester = async (store1, store2, expectedColumnLength, idOfRemCol, numberofColRemove = 1, numberofRowAds = 0, numberofColAds = 0) => {
      const columnsObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.columnsObject
      const columnsObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.columnsObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      for (let i = 0; i < expectedColumnLength; i++) {
        expect(columnsObject1.get(i)).toEqual(value1.meta.columns[i]);
         // testet ob wirklich die remId nicht mehr enthalten ist
         expect(idOfRemCol).not.toContainEqual(value1.meta.columns[i]);
      }
      expect(columnsObject1.get( expectedColumnLength)).toBeUndefined();
      const dataObjectKeys1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject.keys();
      for (const keys of dataObjectKeys1) {
        for(const remColId of idOfRemCol) {
          expect(keys).toEqual(expect.not.stringContaining('='+ remColId));
        }
      }
      expect(value1.meta.columns.length).toEqual(expectedColumnLength);
      for (let r = 0; r <= numberofRowAds; r++) {
        expect(value1.data[r].length).toEqual(expectedColumnLength);
      }
      // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
      for (let i = 0; i < expectedColumnLength; i++) {
        expect(columnsObject2.get(i)).toEqual(value2.meta.columns[i]);
      }
      expect(columnsObject2.get(expectedColumnLength)).toBeUndefined();
      const dataObjectKeys2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject.keys();
      for (const keys of dataObjectKeys2) {
        for(const remColId of idOfRemCol) {
          expect(keys).toEqual(expect.not.stringContaining('='+remColId));
        }
      }
      expect(value2.headers.length).toEqual(expectedColumnLength);
      expect(value2.meta.columns.length).toEqual(expectedColumnLength);
      for (let r = 0; r <= numberofRowAds; r++) {
        expect(value2.data[r].length).toEqual(expectedColumnLength);
      }
      // Evaluating if the Data in the non CRDTs of both Stores is Consistent
      for (let c = 0; c < expectedColumnLength; c++) {
        expect(value1.meta.columns[c]).toEqual(value2.meta.columns[c]);
        expect(value1.headers[c]).toEqual(value2.headers[c]);
      }
    };

    const editCellTester = async (store1, store2, idsofCells, newText, shouldntBeDeleted = true, newText2 = '') => {
      const dataObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const dataObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      if (shouldntBeDeleted) {
      for (const idofCell of idsofCells) {
      const {row , column} = decodeCellKey(idofCell);
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      expect(dataObject1.get(idofCell)).toEqual(encodeCellInfo(value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)]));
      //idee epxect umderehen in sinne von expect(Objekt mit den beinden cells mit text1/text2).toEqual(epexte.objectContaining(value1.data[meta.rows].....))
      /*expect(value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)]).toEqual(expect.objectContaining({'value': newText, 'type':'string','color':'#ffffff'})) ||
      expect(value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)]).toEqual(expect.objectContaining({'value': newText2, 'type':'string','color':'#ffffff'}));*/
      const cell1 = value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)];
      expect([{'value': newText, 'type':'string','color':'#ffffff'},{'value': newText2, 'type':'string','color':'#ffffff'}]).toContainEqual({'value': cell1.value, 'type':cell1.type,'color':cell1.color})
      // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
      expect(dataObject2.get(idofCell)).toEqual(encodeCellInfo(value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)]));
     /* expect(value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)]).toEqual(expect.objectContaining({'value': newText, 'type':'string','color':'#ffffff'})) ||
      expect(value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)]).toEqual(expect.objectContaining({'value': newText2, 'type':'string','color':'#ffffff'})); */
      const cell2 = value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)];
      expect([{'value': newText, 'type':'string','color':'#ffffff'},{'value': newText2, 'type':'string','color':'#ffffff'}]).toContainEqual({'value': cell2.value, 'type':cell2.type,'color':cell2.color})
      //TODOkönnte falsch sein wegen TimeStamp
      expect(value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)]).toEqual(value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)]);
    }
  } else {
    for (const idofCell of idsofCells) {
      const {row , column} = decodeCellKey(idofCell);
      // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
      expect(dataObject1.get(idofCell)).toBeUndefined();
      expect(value1.data[value1.meta.rows.indexOf(row)][value1.meta.columns.indexOf(column)]).toBeUndefined();

      // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
      expect(dataObject2.get(idofCell)).toBeUndefined();
      expect(value2.data[value2.meta.rows.indexOf(row)][value2.meta.columns.indexOf(column)]).toBeUndefined();
    }
  }
    };

    const editHeaderTester = async (store1, store2, idsofCols, newHeader, shouldntBeDeleted = true, newHeader2='') => {
      const dataObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const dataObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      if (shouldntBeDeleted) {
      for (const idofCol of idsofCols){
        const idofHead = encodeCellKey('header', idofCol);
        // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
        expect(dataObject1.get(idofHead)).toEqual(value1.headers[value1.meta.columns.indexOf(idofCol)]);
        //expect(value1.headers[value1.meta.columns.indexOf(idofCol)]).toEqual(newHeader);
        expect([newHeader,newHeader2]).toContainEqual(value1.headers[value1.meta.columns.indexOf(idofCol)])
        // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
        expect(dataObject2.get(idofHead)).toEqual(value2.headers[value2.meta.columns.indexOf(idofCol)]);
        //expect(value2.headers[value2.meta.columns.indexOf(idofCol)]).toEqual(newHeader);
        expect([newHeader,newHeader2]).toContainEqual(value2.headers[value2.meta.columns.indexOf(idofCol)])
        // Evaluating if the Data in the non CRDTs of both Stores is Consistent
        expect(value2.headers[value2.meta.columns.indexOf(idofCol)]).toEqual(value1.headers[value1.meta.columns.indexOf(idofCol)])
      }
    } else {
      for (const idofCol of idsofCols){
        const idofHead = encodeCellKey('header', idofCol);
        // Evaluating if the Data in the CRDTs in Store1 and the Data used for rendering the Spreadsheet is Consistent
        expect(value1.headers[value1.meta.columns.indexOf(idofCol)]).toBeUndefined;
        expect(value1.headers).not.toContainEqual(newHeader);
        expect(value2.headers).not.toContainEqual(newHeader);
        expect(dataObject1.get(idofHead)).toBeUndefined();
        // Evaluating if the Data in the CRDTs in Store2 and the Data used for rendering the Spreadsheet is Consistent
        expect(dataObject2.get(idofHead)).toBeUndefined();
        expect(value2.headers[value2.meta.columns.indexOf(idofCol)]).toBeUndefined();
        }

    }
    };

    const addCellHighlightFormatRuleTester = async (store1, store2, ruleIds) => {
      const dataObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const dataObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      for (const ruleId of ruleIds) {
        // Checkes if rules in Local and YJS Datastructure are equal for Store1
        expect(dataObject1.get('rule='+ruleId)).toEqual(encodeCellInfo(value1.cellHighlightFormatRules[ruleId]));
        // Checkes if rules in Local and YJS Datastructure are equal for Store2
        expect(dataObject2.get('rule='+ruleId)).toEqual(encodeCellInfo(value2.cellHighlightFormatRules[ruleId]));
        expect(value2.cellHighlightFormatRules[ruleId]).toEqual(value1.cellHighlightFormatRules[ruleId]);
      }
    };

    const deleteCellHighlightFormatRuleTester = async (store1, store2, ruleId) => {
      const dataObject1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const dataObject2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.dataObject
      const value1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      const value2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value;
      // Checkes if rules in Local and YJS Datastructure are equal for Store1
      expect(dataObject1.has('rule='+ruleId)).toBe(false);
      expect(value1.cellHighlightFormatRules.hasOwnProperty(ruleId)).toBe(false);
      // Checkes if rules in Local and YJS Datastructure are equal for Store2
      expect(dataObject2.has('rule='+ruleId)).toBe(false);
      expect(value2.cellHighlightFormatRules.hasOwnProperty(ruleId)).toBe(false);
    };

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the addRow in the concurent operations', () => {
      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('AddRow Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('shoudld Add two extra rows in both instances if two row adds are done concurently on the same index',async () => {
          loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
          loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
          jest.runOnlyPendingTimers();
          const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
          const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
          const initRowLength = 1;
          const numberofRowAdsinTest = 2;
          const numberofRowRemovesinTest = 0;
          let updateInDoc1 = [];
          let updateInDoc2 = [];
          const doc1State  = Y.encodeStateAsUpdate(doc1);
          // Initalise the second spreadsheet
          Y.applyUpdate(doc2, doc1State);
          jest.runOnlyPendingTimers();
          doc1.on('update', (update) => {
              updateInDoc1.push(update);
            });
          doc2.on('update', (update) => {
              updateInDoc2.push(update);
            });
          updateInDoc2=[];
          updateInDoc1=[];
          addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
          addRowDispatcher({jest, localstore: store2, docId: 't1', activeRowIndex: 0});
          applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
          await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 2);
          await valueDataTester(store1, store2, 3, 1);
      }, 30000);
      it.each(cases)('shoudld Add one row and one column extra in both instances if a row and a colum add is done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        // init the second spreadsheet
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        addColumnDispatcher({jest, localstore: store2, docId: 't1', activeColumnIndex: 0});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1, 1);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1, 1);
        await valueDataTester(store1, store2, 2, 2)
      }, 30000);
      it.each(cases)('shoudld add one extra row in both instances and delete one of the already exisiting rows if a row remove and  add are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        const idOfRemRow =  await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[1];
        removeRowDispatcher({jest, localstore: store2, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1);
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, [idOfRemRow], 1, 1);
        await valueDataTester(store1, store2, 2, 1)
      }, 30000);
      it.each(cases)('should add one extra row in both instances and delete one of the already exisiting columns if a column remove and  add row are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        const idOfRemCol =  await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[1];
        removeColumnDispatcher({jest, localstore: store2, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, [idOfRemCol], 1, 1, 0)
        await valueDataTester(store1, store2, 2, 1);
      }, 30000);
      it.each(cases)('should add one extra row in both instances and edit the Content of one Cell if a edit cell and  add row are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        const idofCell = encodeCellKey(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0]);
        editCellDispatcher({jest, localstore: store2, docId: 't1', row: 0, column: 0, value: 'LOL New Text', type: 'string', color: '#ffffff'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 2, 1, 1, 0, 'LOL New Text');
        await editCellTester(store1, store2, [idofCell], 'LOL New Text');
      }, 30000);
      it.each(cases)('should add one extra row in both instances and edit the Header of one Column if a edit Header and  add row are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        const idofCol = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 2, 1);
        await editHeaderTester(store1, store2, [idofCol], 'LOL New Header');
      }, 30000);
      it.each(cases)('should add one extra row in both instances and add a custom rule if add row and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        console.log(store1.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject.toJSON());
        console.log(store2.getState().spreadsheets.entities.t1.spreadSheetObject.crdtObjects.rowsObject.toJSON());
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 2, 1);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should add one extra row in both instances and delete one exisiting rule if add row and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 1;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store1, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 0});
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 2, 1);
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);

    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the addColumn in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Add Column Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('shoudld Add two extra column in both instances if two column adds are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 2;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        updateInDoc2=[];
        updateInDoc1=[];
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 0});
        addColumnDispatcher({jest, localstore: store2, docId: 't1', activeColumnIndex: 0});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 2);
        valueDataTester(store1, store2, 1, 3);
      }, 30000);
      it.each(cases)('should add one extra column in both instances and delete one of the already exisiting rows if a row remove and  column add are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        const idOfRemRow =  await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[1];
        removeRowDispatcher({jest, localstore: store2, docId: 't1', row: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1);
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, [idOfRemRow], 1, 0, 1);
        await valueDataTester(store1, store2, 1, 2)
      }, 30000);
      it.each(cases)('should add one extra column in both instances and delete one of the already exisiting columns if a column remove and  add column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        const idOfRemCol =  await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[1];
        removeColumnDispatcher({jest, localstore: store2, docId: 't1', column: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, numberofColAdsinTest);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, [idOfRemCol], 1, 0, 1)
        await valueDataTester(store1, store2, 1, 2);
      }, 30000);
      it.each(cases)('should add one extra column in both instances and edit the Content of one Cell if a edit cell and add column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 0});

        const idofCell = encodeCellKey(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store2, docId: 't1', row: 0, column: 0, value: 'LOL New Text', type: 'string', color: '#ffffff'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 1, 2, 0, 1, 'LOL New Text');
        await editCellTester(store1, store2, [idofCell], 'LOL New Text');
      }, 30000);
      it.each(cases)('should add one extra column in both instances and edit the Header of one Column if a edit Header and  add column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 0});
        const idofCol = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 1, 2);
        await editHeaderTester(store1, store2, [idofCol], 'LOL New Header');
      }, 30000);
      it.each(cases)('should add one extra column in both instances and add a custom rule if add column and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 0});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 1, 2);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should add one extra column in both instances and delete one exisiting rule if add column and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store1, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 0});
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await addColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, 1, 0);
        await valueDataTester(store1, store2, 1, 2);
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);

    });
    // %TODO from this point 
    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the removeRow in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Remove Row Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('shoudld remove 1 rows in both instances if two remove rows are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 3;
        const numberofRowAdsinTest = 0;
        const numberofUniqueRowRemovesinTest = 1 ;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          });
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        addRowDispatcher({jest, localstore: store2, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        const remRowId2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 0});
        removeRowDispatcher({jest, localstore: store2, docId: 't1', row: 0});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeRowTester(store1, store2, initRowLength + numberofColAdsinTest - numberofUniqueRowRemovesinTest, [remRowId1,remRowId2],1,0,0);
        await valueDataTester(store1, store2, 2, 1);
      }, 30000);
      it.each(cases)('should remove one row in both instances and delete one of the already exisiting columns if a column remove and  remove row are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        addRowDispatcher({jest, localstore: store2, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[1];
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 1});
        const idOfRemCol =  await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[1];
        removeColumnDispatcher({jest, localstore: store2, docId: 't1', column: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest, [remRowId1] , 1,0,0);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest, [idOfRemCol], 1, 0, 0)
        await valueDataTester(store1, store2, 1, 1);
      }, 30000);
      it.skip.each(cases)('should remove a row in both instances and edit the Content of one Cell if a edit cell and  remove row are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        const initColLength = 1;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 0});
        const idofCell = encodeCellKey(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store2, docId: 't1', row: 0, column: 0, value: 'LOL New Text', type: 'string', color: '#ffffff'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await valueDataTester(store1, store2, 1, 1);//Duruch diesen test wird auch getestet, dass in keiner Zelle ein Value steht
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest,[remRowId1], 1, 0, 0);
        // await valueDataTester(value1, value2, 1, 1, 0, 0, 'LOL New Text');
        await editCellTester(store1, store2, [idofCell], 'LOL New Text', false); // ich denke braucht man nicht
      }, 30000);
      it.each(cases)('should remove a row in both instances and edit the Header of one Column if a edit Header and  add column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        const initColLength = 1;
        const numberofColAdsinTest = 1;
        const numberofColRemovesinTest = 0;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 0});
        const idofCol = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest,[remRowId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await editHeaderTester(store1, store2, [idofCol], 'LOL New Header');
      }, 30000);
      it.each(cases)('should remove one row in both instances and add a custom rule if add column and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 0});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest,[remRowId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should remove one row in both instances and delete one exisiting rule if add column and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 2;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addRowDispatcher({jest, localstore: store1, docId: 't1', activeRowIndex: 1});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remRowId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0];
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        removeRowDispatcher({jest, localstore: store1, docId: 't1', row: 0});
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeRowTester(store1, store2, initRowLength + numberofRowAdsinTest - numberofRowRemovesinTest,[remRowId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);
    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the remove Column in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Remove Column Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      // TODO look why it isnt working
      it.each(cases)('should remove one column in both instances if two columns remove are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 3;
        const numberofColAdsinTest = 0;
        const numberofUniqueColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        addColumnDispatcher({jest, localstore: store2, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        console.log('store1',store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns);
        console.log('store2',store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns);
        const idOfRemCol1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[1];
        removeColumnDispatcher({jest, localstore: store1, docId: 't1', column: 1});
        const idOfRemCol2 =  await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[1];
        removeColumnDispatcher({jest, localstore: store2, docId: 't1', column: 1});
        console.log(idOfRemCol1, idOfRemCol2)
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofUniqueColRemovesinTest, [idOfRemCol1, idOfRemCol2], 1, 0, 0)
        await valueDataTester(store1, store2, 1, 2);
      }, 30000);
      it.skip.each(cases)('should remove one column in both instances and edit the Content of one Cell if a edit cell and  remove column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remColumnId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        removeColumnDispatcher({jest, localstore: store1, docId: 't1', column: 0});
        const idofCell = encodeCellKey(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store2, docId: 't1', row: 0, column: 0, value: 'LOL New Text', type: 'string', color: '#ffffff'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest,[remColumnId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await editCellTester(store1, store2, [idofCell], 'LOL New Text', false); // ich denke braucht man nicht
      }, 30000);
      it.skip.each(cases)('should remove a column in both instances and edit the Header of one Column if a edit Header and  remove column are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remColId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        removeColumnDispatcher({jest, localstore: store1, docId: 't1', column: 0});
        const idofCol = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await valueDataTester(store1, store2, 1, 1);
        await editHeaderTester(store1, store2, [idofCol], 'LOL New Header', false);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest,[remColId1], 1, 0, 0);
      }, 30000);
      it.each(cases)('should remove one column in both instances and add a custom rule if remove column and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remColId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        removeColumnDispatcher({jest, localstore: store1, docId: 't1', column: 0});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest,[remColId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should remove one column in both instances and delete one exisiting rule if remove column and delete Rule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        const initRowLength = 1;
        const numberofRowAdsinTest = 0;
        const numberofRowRemovesinTest = 0;
        const initColLength = 2;
        const numberofColAdsinTest = 0;
        const numberofColRemovesinTest = 1;
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addColumnDispatcher({jest, localstore: store1, docId: 't1', activeColumnIndex: 1});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const remColId1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        removeColumnDispatcher({jest, localstore: store1, docId: 't1', column: 0});
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await removeColumnTester(store1, store2, initColLength + numberofColAdsinTest - numberofColRemovesinTest,[remColId1], 1, 0, 0);
        await valueDataTester(store1, store2, 1, 1);
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);

    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the editCell in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Edit Cell Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('should edit the Cell in both instances in the same way if two editCells are done concurently on the same Cell',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        const idofCell = encodeCellKey(await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store1, docId: 't1', row: 0, column: 0, value: 'LOL New Text1', type: 'string', color: '#ffffff'});
        editCellDispatcher({jest, localstore: store2, docId: 't1', row: 0, column: 0, value: 'LOL New Text2', type: 'string', color: '#ffffff'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await valueDataTester(store1,store2, 1, 1,0,0,'LOL New Text2','LOL New Text1');
        await editCellTester(store1, store2, [idofCell], 'LOL New Text1', true, 'LOL New Text2');
      }, 30000);
      it.each(cases)('should edit a cell in both instances and edit the Header of one Column if a edit Header and  edit Cell are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        const idofCell = encodeCellKey(await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store1, docId: 't1', row: 0, column: 0, value: 'LOL New Text1', type: 'string', color: '#ffffff'});
        const idofCol = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await editCellTester(store1, store2, [idofCell], 'LOL New Text1', true,);
        await valueDataTester(store1, store2, 1, 1,0,0,'LOL New Text2','LOL New Text1');
        await editHeaderTester(store1, store2, [idofCol], 'LOL New Header');
      }, 30000);
      it.each(cases)('should edit a cell in both instances and add a custom rule if editCell and addCellHighlightFormatRule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          });
        updateInDoc2=[];
        updateInDoc1=[];
        const idofCell = encodeCellKey(await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store1, docId: 't1', row: 0, column: 0, value: 'LOL New Text1', type: 'string', color: '#ffffff'});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        await editCellTester(store1, store2, [idofCell], 'LOL New Text1', true,);
        await valueDataTester(store1, store2, 1, 1,0,0,'LOL New Text2','LOL New Text1');
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should edit a Cell in both instances and delete one exisiting rule if editCell and delete Rule are done concurently on the same index',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];        
        const idofCell = encodeCellKey(await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.rows[0], await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0])
        editCellDispatcher({jest, localstore: store1, docId: 't1', row: 0, column: 0, value: 'LOL New Text1', type: 'string', color: '#ffffff'});
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await editCellTester(store1, store2, [idofCell], 'LOL New Text1', true,);
        await valueDataTester(store1, store2 , 1, 1,0,0,'LOL New Text2','LOL New Text1');
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);

    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the editHeader in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Edit Header Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('should edit a Header in both instances in the same way if two editHeader are done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        const idOfCol1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store1, docId: 't1', column: 0, value: 'LOL New Header1'});
        const idOfCol2 = await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store2, docId: 't1', column: 0, value: 'LOL New Header2'});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await valueDataTester(store1, store2, 1, 1);
        await editHeaderTester(store1, store2, [idOfCol1,idOfCol2], 'LOL New Header1',true,'LOL New Header2');
      }, 30000);
      it.each(cases)('should edit a Head in both instances and add a custom rule if editHeader and addCellHighlightFormatRule are done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        const idOfCol1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store1, docId: 't1', column: 0, value: 'LOL New Header1'});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        await valueDataTester(store1, store2, 1, 1);
        await editHeaderTester(store1, store2, [idOfCol1], 'LOL New Header1');
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should edit a Header in both instances and delete one exisiting rule if editHeader and delete Rule are done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: [ '1', '2' ]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];        
        const idOfCol1 = await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.meta.columns[0];
        editHeaderDispatcher({jest, localstore: store1, docId: 't1', column: 0, value: 'LOL New Header1'});
        const ruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: ruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await valueDataTester(store1, store2, 1, 1);
        await editHeaderTester(store1, store2, [idOfCol1], 'LOL New Header1');
        await deleteCellHighlightFormatRuleTester(store1, store2, ruleId[0]);
      }, 30000);
    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the editHeader in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Add Rule Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('should add two a custom rule if two addCellHighlightFormatRule are done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        updateInDoc2=[];
        updateInDoc1=[];
        addCellHighlightFormatRuleDispatcher({jest, localstore: store1, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: ['3','4']});
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: ['1','2']});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId2 = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        const ruleId1 = Object.keys(store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        const ruleId = ruleId1.concat(ruleId2);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
      }, 30000);
      it.each(cases)('should add a rule in both instances and delete one exisiting rule if editCell and delete Rule are done concurently',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: ['1','2']});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        addCellHighlightFormatRuleDispatcher({jest, localstore: store1, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: ['3','4']});
        const delruleId = Object.keys(await store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: delruleId[0]});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        const ruleId2 = Object.keys(store2.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        const ruleId1 = Object.keys(store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules)
        const ruleId = ruleId1.concat(ruleId2);
        await addCellHighlightFormatRuleTester(store1, store2, ruleId);
        await deleteCellHighlightFormatRuleTester(store1, store2, delruleId[0]);
      }, 30000);

    });

    describe('For the Spreadsheet it should sync correctly and translate the Data from CRDTs to non CRDTs in a desirable way(same order and same Data), this test cases are all test cases that contain the editHeader in the concurent operations and that havent been covered yet', () => {

      beforeEach(async () => {
        initDocument('13a');
        process.env.test = 'load 1';
        jest.useFakeTimers();
        store1 = setupStore();
        store2 = setupStore();
        });
      afterAll(() => {
          console.log('Delete Rule Test hast finished');
        });
      afterEach(() => {
          jest.useRealTimers();
          jest.clearAllTimers();
          cleanUpProviderCollection();
        });
      it.each(cases)('should delete the already exisiting rule if two delete Rule are done concurently on the same rule',async () => {
        loadSpreadSheetDispatcher({jest, localstore: store1, docId: 't1', boardId: 'boardId1'});
        process.env.test = 'test';
        loadSpreadSheetDispatcher({jest, localstore: store2, docId: 't1', boardId: 'boardId2', isExternal: true});
        const doc1 = await getProviderCollectionInfo(getBoardObjId('boardId1')).objects['t1-ydoc'];
        const doc2 = await getProviderCollectionInfo(getBoardObjId('boardId2')).objects['t1-ydoc'];
        let updateInDoc1 = [];
        let updateInDoc2 = [];
        const doc1State  = Y.encodeStateAsUpdate(doc1);
        Y.applyUpdate(doc2, doc1State);
        jest.runOnlyPendingTimers();
        doc1.on('update', (update) => {
            updateInDoc1.push(update);
          })
          
        doc2.on('update', (update) => {
            updateInDoc2.push(update);
          })
        addCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ffffff', selectedRange: {'0':{'0':true}}, matchCellValueRange: ['1','2']});
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        updateInDoc2=[];
        updateInDoc1=[];
        const delruleId1 = Object.keys(await store1.getState().spreadsheets.entities.t1.spreadSheetObject.data.value.cellHighlightFormatRules);      
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store1, docId: 't1', ruleId: delruleId1[0]});
        deleteCellHighlightFormatRuleDispatcher({jest, localstore: store2, docId: 't1', ruleId: delruleId1[0]});  
        applyUpdates(doc1, doc2, updateInDoc1, updateInDoc2);
        await deleteCellHighlightFormatRuleTester(store1, store2, delruleId1[0]);
      }, 30000);

    });