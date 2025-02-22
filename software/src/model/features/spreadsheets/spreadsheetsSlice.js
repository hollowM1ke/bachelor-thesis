import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { createEmptyMatrix } from '../../../components/Tools/Full/SpreadSheet/util'; // TODO: this is state specific and should be moved within the model
import { encodeCellInfo, decodeCellInfo, decodeCellKey, encodeCellKey, headerDefaultKeys, DEFAULT_COLUMN, DEFAULT_ROW, DEFAULT_COLUMN_WIDTH } from './spreadSheetsFunctions';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import { generatePseudoRandomId } from '../../../services/ids';
import CRDTExecutor from '../../app/plugins/CRDT/CRDTExecutor';

const spreadSheetAdapter = createEntityAdapter();

const initialState = spreadSheetAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
const getSSDataObjId = id => `${id}-data`;
const getSSRowObjId = id => `${id}-rows`;
const getSSColumnObjId = id => `${id}-columns`;

const DEFAULT_VALUE = {
    data: createEmptyMatrix(DEFAULT_ROW.length, DEFAULT_COLUMN.length),
    headers: headerDefaultKeys(DEFAULT_COLUMN.length),
    meta: { rows: DEFAULT_ROW, columns: DEFAULT_COLUMN },
    cellHighlightFormatRules: {}
};

const spreadSheetsSlice = createCRDTSupportedSlice({
    name: 'spreadsheets',
    initialState,
    reducers: {
        setErrorSpreadSheet: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;
                spreadSheet.spreadSheetObject.setError(err);
            },
            prepare (spreadSheetId, err) {
                return {
                    payload: {
                        id: spreadSheetId,
                        err: err
                    }
                };
            }
        },
        addColumn: {
            reducer (state, action) {
                const { id, activeColumnIndex, columId } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;
                spreadSheet.spreadSheetObject.addColumn(activeColumnIndex, columId);
            },
            prepare (id, activeColumnIndex, columId = generatePseudoRandomId(), skipSync = false) {
                return {
                    payload: {
                        id,
                        activeColumnIndex,
                        columId,
                        skipSync
                    }
                };
            }
        },
        addRow: {
            reducer (state, action) {
                const { id, activeRowIndex, rowId } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.addRow(activeRowIndex, rowId);
            },
            prepare (id, activeRowIndex, rowId = generatePseudoRandomId(), skipSync = false) {
                return {
                    payload: {
                        id,
                        activeRowIndex,
                        rowId,
                        skipSync
                    }
                };
            }
        },
        removeRow: {
            reducer (state, action) {
                const { id, activeRowIndex } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.removeRow(id, activeRowIndex);
            },
            prepare (id, activeRowIndex, skipSync = false) {
                return {
                    payload: {
                        id,
                        activeRowIndex,
                        skipSync
                    }
                };
            }
        },

        removeColumn: {
            reducer (state, action) {
                const { id, activeColumnIndex } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.removeColumn(id, activeColumnIndex);
            },
            prepare (id, activeColumnIndex, skipSync = false) {
                return {
                    payload: {
                        id,
                        activeColumnIndex,
                        skipSync
                    }
                };
            }
        },

        editCell: {
            reducer (state, action) {
                const { id, editInfo } = action.payload;
                const { row, column, data } = editInfo;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.editCell(id, row, column, data);
            },
            prepare (id, row, column, value, type, color, timestamp = new Date().valueOf(), skipSync = false) {
                return {
                    payload: {
                        id,
                        editInfo: {
                            row,
                            column,
                            data: {
                                value,
                                type,
                                timestamp,
                                color
                            }
                        },
                        skipSync
                    }
                };
            }
        },
        bulkEditCell: {
            reducer (state, action) {
                const { id, editInfos } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.bulkEditCell(id, editInfos);
            },
            prepare (id, editInfos, skipSync = true) {
                return {
                    payload: {
                        id,
                        editInfos,
                        skipSync
                    }
                };
            }
        },
        editHeader: {
            reducer (state, action) {
                const { id, column, value } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;
                spreadSheet.spreadSheetObject.editHeader(column, value);
            },
            prepare (id, column, value, skipSync = false) {
                return {
                    payload: {
                        id,
                        column,
                        value,
                        skipSync
                    }
                };
            }
        },
        addCellHighlightFormatRule: {
            reducer (state, action) {
                const { id, value, key } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.addRule(value, key);
            },
            prepare (id, cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText, key = generatePseudoRandomId(), skipSync = false) {
                return {
                    payload: {
                        id,
                        value: {
                            cellMatchType, // Defines the type of matching to highlight a cell. (E.g.: Numeric Value range or Contain Text)
                            cellRangeSelectionType, // Defines type of range selection (Entire Spreadsheet or Defined range in spreadsheet) to perform the hihglight formatting
                            color, // Defines color to be applied if format rule is correctly matched
                            selectedRange, // Defines the range of cells upon which the formatting rules are only to be applied. (E.g: A1-C2)
                            matchCellValueRange, // If match type selected is Numeric range: This key stores the value range to match the cells against
                            matchCellText // If match type selcted is Text: This key stores the text value to check if exists in the cells
                        },
                        key,
                        skipSync
                    }
                };
            }
        },
        deleteCellHighlightFormatRule: {
            reducer (state, action) {
                const { id, key } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;

                spreadSheet.spreadSheetObject.deleteRule(key);
            },
            prepare (id, key, skipSync = false) {
                return {
                    payload: {
                        id,
                        key,
                        skipSync
                    }
                };
            }
        },
        setColumnWidth: {
            reducer (state, action) {
                const { id, column, width } = action.payload;
                const spreadSheet = state.entities[id];
                if (!spreadSheet) return;
                spreadSheet.spreadSheetObject.setColumnWidth(column, width);
            },
            prepare (id, column, width, skipSync = false) {
                return {
                    payload: {
                        id,
                        column,
                        width,
                        skipSync
                    }
                };
            }
        },
        loadSpreadSheet (state, action) {
            const { id, boardId, externalData, initialState, isExternal } = action.payload;
            const spreadsheet = state.entities[id];
            const externalDateToken = externalData || false;
            if (!spreadsheet) {
                const collectionName = getBoardObjId(boardId);
                // TODO Rename to CRDT names
                const dataObject = getObject(collectionName, getSSDataObjId(id), id, 'YMap', applyIncrementalChangesdataObject, 50);
                const rowsObject = getObject(collectionName, getSSRowObjId(id), id, 'YArray', applyIncrementalChangesrowsObject);
                const columnsObject = getObject(collectionName, getSSColumnObjId(id), id, 'YArray', applyIncrementalChangescolumnsObject);
                if (!process.env.test) { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }
                const crdtObjects = { dataObject, rowsObject, columnsObject };
                const newSpreadSheet = {
                    id,
                    spreadSheetObject: {
                        _type: 'Spreadsheet',
                        _crdt: true,
                        data: {
                            value: { // TODO Change to DEFAULT_VALUE?
                                headers: headerDefaultKeys(isExternal ? 0 : DEFAULT_COLUMN.length),
                                data: createEmptyMatrix(isExternal ? 0 : DEFAULT_ROW.length, isExternal ? 0 : DEFAULT_COLUMN.length),
                                meta: {
                                    rows: isExternal ? [] : DEFAULT_ROW,
                                    columns: isExternal ? [] : DEFAULT_COLUMN
                                },
                                cellHighlightFormatRules: {},
                                columnWidths: isExternal ? {} : DEFAULT_COLUMN_WIDTH,
                                externalData: externalDateToken,
                                isExternal
                            }
                        },
                        crdtObjects
                    }
                };
                function applyIncrementalChangesrowsObject (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    const delta = yevent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalRow = spreadSheetsSlice.actions.addRow;
                    const removeLocalRow = spreadSheetsSlice.actions.removeRow;
                    for (let i = 0; i < delta.length; i++) {
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalRow(id, newIndex0, itemId, true));
                                newIndex0++;
                            });
                        } else if (delta[i].delete) {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                action.store.dispatch(removeLocalRow(id, newIndex0, true));
                            }
                        }
                    }
                }

                function applyIncrementalChangescolumnsObject (yevent = null) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    const delta = yevent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalColumn = spreadSheetsSlice.actions.addColumn;
                    const removeLocalColumn = spreadSheetsSlice.actions.removeColumn;
                    for (let i = 0; i < delta.length; i++) {
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalColumn(id, newIndex0, itemId, true));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                action.store.dispatch(removeLocalColumn(id, newIndex0, true));
                            }
                        }
                    }
                }

                function applyIncrementalChangesdataObject (yevent) {
                    if (yevent !== null && yevent.transaction.local) {
                        return;
                    }
                    const editInfos = [];
                    const bulkEditCell = spreadSheetsSlice.actions.bulkEditCell;
                    try {
                        yevent.changes.keys.forEach((change, key) => {
                            const editLocalCell = spreadSheetsSlice.actions.editCell;
                            const addRuleLocaly = spreadSheetsSlice.actions.addCellHighlightFormatRule;
                            const deleteRuleLocaly = spreadSheetsSlice.actions.deleteCellHighlightFormatRule;
                            const editLocalHeader = spreadSheetsSlice.actions.editHeader;
                            const editLocalColumnWidth = spreadSheetsSlice.actions.setColumnWidth;
                            switch (change.action) {
                            case 'update':
                            case 'add':
                                if (key.startsWith('rule=')) {
                                    const rId = key.slice(5);
                                    const value = decodeCellInfo(dataObject.get(key));
                                    action.store.dispatch(addRuleLocaly(id, value.cellMatchType, value.cellRangeSelectionType, value.color, value.selectedRange, value.matchCellValueRange, value.matchCellText, rId, true));
                                } else if (key.startsWith('header=')) {
                                    const cId = key.split('=');
                                    const value = dataObject.get(key);
                                    const columIndex = columnsObject.toArray().indexOf(cId[1]);
                                    action.store.dispatch(editLocalHeader(id, columIndex, value, true));
                                } else if (key.startsWith('width=')) {
                                    const cId = key.slice(6);
                                    let value;
                                    try {
                                        value = decodeCellInfo(dataObject.get(key));
                                    } catch (e) {
                                        break;
                                    };
                                    const columIndex = columnsObject.toArray().indexOf(cId);
                                    action.store.dispatch(editLocalColumnWidth(id, columIndex, value, true));
                                } else {
                                    const { row, column } = decodeCellKey(key);
                                    const data = decodeCellInfo(dataObject.get(key));
                                    const rowId = rowsObject.toArray().indexOf(row);
                                    const columnId = columnsObject.toArray().indexOf(column);
                                    editInfos.push({ row: rowId, column: columnId, data });
                                    // action.store.dispatch(editLocalCell(id, rowId, columnId, data.value, data.type, data.color, data.timestamp, true));
                                }
                                break;
                            case 'delete':
                                if (key.startsWith('rule=')) {
                                    const rId = key.slice(5);
                                    action.store.dispatch(deleteRuleLocaly(id, rId, true));
                                }
                                break;
                            default:
                                break;
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    } finally {
                        if (editInfos.length > 0) {
                            action.store.dispatch(bulkEditCell(id, editInfos, true));
                        }
                    }
                }
                if (initialState === undefined && process.env.test !== 'test' && !isExternal) {
                    // setTimeout(init, 0);
                    rowsObject.insert(0, DEFAULT_ROW);
                    columnsObject.insert(0, DEFAULT_COLUMN);
                }
                function init () {
                    if (rowsObject.length === 0) {
                        rowsObject.insert(0, DEFAULT_ROW);
                    }
                    if (columnsObject.length === 0) {
                        columnsObject.insert(0, DEFAULT_COLUMN);
                    }
                }

                if (initialState && !process.env.test) {
                    newSpreadSheet.spreadSheetObject.data.value.data = initialState.value.data;
                    newSpreadSheet.spreadSheetObject.data.value.meta = initialState.value.meta;
                    newSpreadSheet.spreadSheetObject.data.value.headers = initialState.value.headers;
                    newSpreadSheet.spreadSheetObject.data.value.cellHighlightFormatRules = initialState.value.cellHighlightFormatRules;

                    const executor = CRDTExecutor();
                    // TODO Fix!!! -> Move into spreadsheetHandler?

                    rowsObject.insert(0, newSpreadSheet.spreadSheetObject.data.value.meta.rows);
                    columnsObject.insert(0, newSpreadSheet.spreadSheetObject.data.value.meta.columns);

                    initialState.value.data.forEach((row, rowIdx) => {
                        row.forEach((data, columnIdx) => {
                            const key = encodeCellKey(
                                newSpreadSheet.spreadSheetObject.data.value.meta.rows[rowIdx],
                                newSpreadSheet.spreadSheetObject.data.value.meta.columns[columnIdx]);
                            const value = encodeCellInfo(data);
                            dataObject.set(key, value);
                        });
                    });

                    initialState.value.headers.forEach((val, idx) => {
                        const columId = newSpreadSheet.spreadSheetObject.data.value.meta.columns[idx];
                        const key = `header=${columId}`;
                        const value = val;
                        dataObject.set(key, value);
                    });
                    executor.flush();
                }

                /* if (!process.env.test) {
                    setTimeout(() => { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }, 50);
                } */
                spreadSheetAdapter.addOne(state, newSpreadSheet);
                // syncAll(null,'init');
            }
        },
        unloadSpreadsheet (state, action) {
            const { id, boardId } = action.payload;
            const spreadsheet = state.entities[id];
            if (!spreadsheet) { return; }

            const collectionName = getBoardObjId(boardId);
            spreadsheet.destroy();
            // action.crdtStore.removeObject(getSSDataObjId(id));
            // action.crdtStore.removeObject(getSSRowObjId(id));
            // action.crdtStore.removeObject(getSSColumnObjId(id));
            removeObject(collectionName, getSSDataObjId(id));
            removeObject(collectionName, getSSRowObjId(id));
            removeObject(collectionName, getSSColumnObjId(id));
            delete state.entities[id];
        }
    }
});

export default spreadSheetsSlice.reducer;
export const {
    // loadSpreadSheet,
    setErrorSpreadSheet,
    editCell,
    addRow,
    addColumn,
    removeRow,
    removeColumn,
    editHeader,
    addCellHighlightFormatRule,
    deleteCellHighlightFormatRule,
    setColumnWidth,
    unloadSpreadsheet
} = spreadSheetsSlice.actions;
export function loadSpreadSheet (id, boardId, initialState) {
    return dispatch => {
        dispatch(spreadSheetsSlice.actions.loadSpreadSheet(id, boardId, initialState));
    };
};
export const { selectById } = spreadSheetAdapter.getSelectors(state => state.spreadsheets);
export const selectSpreadsheet = createSelector(selectById, spreadsheet => {
    return spreadsheet ? spreadsheet.spreadSheetObject.data.value : DEFAULT_VALUE;
});

export const selectFullContext = (state, id) => {
    const spreadsheet = state.spreadsheets.entities[id];
    const value = spreadsheet ? spreadsheet.spreadSheetObject.data.value : DEFAULT_VALUE;

    return {
        type: 'spreadsheet',
        value
    };
};

export const selectSpreadSheetError = createSelector(selectById, spreadSheet => {
    return spreadSheet ? spreadSheet.spreadSheetObject.data.err : null;
});

export const getDefaultState = (id) => {
    const newSpreadSheet = {
        id,
        headers: headerDefaultKeys(DEFAULT_COLUMN.length),
        data: createEmptyMatrix(DEFAULT_ROW.length, DEFAULT_COLUMN.length),
        meta: {
            rows: DEFAULT_ROW,
            columns: DEFAULT_COLUMN
        },
        cellhighlightformatrules: {}
    };
    return newSpreadSheet;
};
