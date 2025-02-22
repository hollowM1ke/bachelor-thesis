import {
    addColumn,
    addRow,
    editCell,
    addCellHighlightFormatRule,
    removeRow,
    removeColumn,
    deleteCellHighlightFormatRule,
    loadSpreadSheet,
    editHeader
} from '../../model/features/spreadsheets/spreadsheetsSlice';
/* abstractions of the dispatcher for easierr maintaining the testing code */
export function loadSpreadSheetDispatcher ({ jest, localstore, docId = 'testSpreadsheet', boardId = '998', isExternal = false}) {
    localstore.dispatch(loadSpreadSheet({ id: docId, boardId: boardId, isExternal }));
    jest.runOnlyPendingTimers();
}

export function editCellDispatcher ({ jest, localstore, docId = 'testSpreadsheet', row, column, value = '', type = 'text', color = '#ffffff' }) {
    localstore.dispatch(editCell(docId, row, column, value, type, color));
    jest.runOnlyPendingTimers();
}

export function editHeaderDispatcher ({ jest, localstore, docId = 'testSpreadsheet', column, value = '' }) {
    localstore.dispatch(editHeader(docId, column, value));
    jest.runOnlyPendingTimers();
}

export function addRowDispatcher ({ jest, localstore, docId = 'testSpreadsheet', activeRowIndex = 0 }) {
    localstore.dispatch(addRow(docId, activeRowIndex));
    jest.runOnlyPendingTimers();
}

export function addColumnDispatcher ({ jest, localstore, docId = 'testSpreadsheet', activeColumnIndex = 0 }) {
    localstore.dispatch(addColumn(docId, activeColumnIndex));
    jest.runOnlyPendingTimers();
}

export function addCellHighlightFormatRuleDispatcher ({ jest, localstore, docId = 'testSpreadsheet', cellMatchType, cellRangeSelectionType, color, selectedRange = {}, matchCellValueRange = [], matchCellText = '' }) {
    localstore.dispatch(addCellHighlightFormatRule(docId, cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText));
    jest.runOnlyPendingTimers();
}

export function removeRowDispatcher ({ jest, localstore, docId = 'testSpreadsheet', row }) {
    localstore.dispatch(removeRow(docId, row));
    jest.runOnlyPendingTimers();
}

export function removeColumnDispatcher ({ jest, localstore, docId = 'testSpreadsheet', column }) {
    localstore.dispatch(removeColumn(docId, column));
    jest.runOnlyPendingTimers();
}

export function deleteCellHighlightFormatRuleDispatcher ({ jest, localstore, docId = 'testSpreadsheet', ruleId }) {
    localstore.dispatch(deleteCellHighlightFormatRule(docId, ruleId));
    jest.runOnlyPendingTimers();
}

export function se1Dispatches (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    // addColumn
    addColumnDispatcher({ jest: jest, localstore: localstore });
    // addRow
    addRowDispatcher({ jest: jest, localstore: localstore });
    // editCell
    editCellDispatcher({ jest: jest, localstore: localstore, docId: 'testSpreadsheet', row: 0, column: 0, value: 'coloring', type: 'text', color: '#0000ff' });
    // addCellHighlightFormatRule
    addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, docId: 'testSpreadsheet', cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#ff0000', selectedRange: {}, matchCellValueRange: {}, matchCellText: 'coloring' });
    // editHeader
    editHeaderDispatcher({ jest, localstore, column: 0, value: 'Column0' });
}
export function predefinedST1 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: 'Zelle00' });
};
/* predefined states for the spreadsheet */
export function predefinedST2 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    /* write the cell identifiesrs in cells c00, c01, c10, c11 */
    addRowDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: 'c00' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 1, value: 'c01' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'c10' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: 'c11' });
};
export function predefinedST3u4u10 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
};
export function predefinedST5u6 (jest, localstore) {
    /* initial prepperations of the Spreadsheet */
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: '3' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'abc' });
};

export function predefinedST7aucud (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: '!farbig' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 1, value: 'coloring' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'coloring' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: '!farbig' });
};

export function predefinedST7bue (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: '3' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 1, value: '7' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: '7' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: '3' });
};

export function predefinedST8 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 1, value: 'blue' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'red' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: 'green' });
    // c01 blue through blue rule
    addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#0000ff', selectedRange: {}, matchCellValueRange: {}, matchCellText: 'blue' });
    // c10 red through red rule
    addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#ff0000', selectedRange: {}, matchCellValueRange: {}, matchCellText: 'red' });
    // c11 green through green rule
    addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#00ff00', selectedRange: {}, matchCellValueRange: {}, matchCellText: 'green' });
};

export function predefinedST9 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: '!farbig' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'coloring' });
    addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#ff0000', selectedRange: {}, matchCellValueRange: {}, matchCellText: 'coloring' });
};

export function predefinedST11 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    // column naming
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: 'ColumnRow0' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 1, value: 'Column1' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 2, value: 'Column2' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 3, value: 'Column3' });
    // row naming
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: 'Row1' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 2, column: 0, value: 'Row2' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 3, column: 0, value: 'Row3' });
};

export function predefinedST12 (jest, localstore) {
    loadSpreadSheetDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addColumnDispatcher({ jest: jest, localstore: localstore });
    addRowDispatcher({ jest: jest, localstore: localstore });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 0, column: 0, value: '3' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 0, value: '22' });
    editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: '13' });
};
