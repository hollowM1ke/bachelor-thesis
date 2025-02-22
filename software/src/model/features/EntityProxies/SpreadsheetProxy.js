import { encodeCellInfo, encodeCellKey } from '../spreadsheets/spreadSheetsFunctions';
import { createEmptyCell } from '../../../components/Tools/Full/SpreadSheet/util';
export class SpreadsheetProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        console.log('SpreadsheetProxy: Setting error to', err);
        this.data.err = err;
    }

    addColumn (activeColumnIndex, columId) {
        const insertionColumnIndex = (activeColumnIndex === undefined) ? this.data.value.meta.columns.length : activeColumnIndex;
        // TODO Fix headers, for now just default string
        // headers that are in front of insertionColumnIndex remain the same
        const headersBeforeInsertionIndex = this.data.value.headers.slice(0, insertionColumnIndex);
        // the goal here is to let the 'custom headers' (headers the user has modified) remain the same
        // but all the other headers ('A', 'B', ...) should be shifted to ('B', 'C', ...) to match the very first spreadsheet line
        const headersAfterInsertionIndex = this.data.value.headers.slice(insertionColumnIndex, this.data.value.headers.length);
        // TODO abstract insertion into array into its own function
        const newDefaultHeader = 'XYZ'; // TODO Fix to proper name
        const newHeaders = headersBeforeInsertionIndex.concat(newDefaultHeader, headersAfterInsertionIndex);
        const columnsBeforeInsertionIndex = this.data.value.meta.columns.slice(0, insertionColumnIndex);
        const columnsAfterInsertionIndex = this.data.value.meta.columns.slice(insertionColumnIndex, this.data.value.meta.columns.length);
        const newColumns = columnsBeforeInsertionIndex.concat(columId, columnsAfterInsertionIndex);
        this.data.value.headers = newHeaders;
        this.data.value.meta.columns = newColumns;
        this.data.value.data.forEach((row) => { row.splice(insertionColumnIndex, 0, createEmptyCell()); });
        this.data.value.columnWidths[insertionColumnIndex] = 75;
        // insertionColumnIndex specifies the column index, where the new column will be inserted
        // if no cell is selected (activeColumnIndex is undefined), the new column will be appended
        this.executor.scheduleJob(() => {
            this.crdtObj.columnsObject.doc.transact(() => {
                this.crdtObj.columnsObject.insert(insertionColumnIndex, [columId]);
            });
        });
    }

    addRow (activeRowIndex, rowId) {
        // insertionRowIndex specifies the row index, where the new row will be inserted
        // if no cell is selected (activeRowIndex is undefined), the new row will be appended
        const insertionRowIndex = (activeRowIndex === undefined) ? this.data.value.meta.rows.length : activeRowIndex;
        const rowsBeforeInsertionIndex = this.data.value.meta.rows.slice(0, insertionRowIndex);
        const rowsAfterInsertionIndex = this.data.value.meta.rows.slice(insertionRowIndex, this.data.value.meta.rows.length);
        const newRows = rowsBeforeInsertionIndex.concat(rowId, rowsAfterInsertionIndex);
        this.data.value.meta.rows = newRows;
        this.data.value.data.splice(insertionRowIndex, 0, Array(this.data.value.meta.columns.length).fill(createEmptyCell()));
        this.executor.scheduleJob(() => {
            this.crdtObj.rowsObject.doc.transact(() => {
                this.crdtObj.rowsObject.insert(insertionRowIndex, [rowId]);
            });
        });
    }

    removeRow (id, activeRowIndex) {
        // Don't delete the last row to keep invariant that always at least one row is left
        if (this.data.value.meta.rows.length === 1) return;
        const removalRowIndex = (activeRowIndex === undefined) ? this.data.value.meta.rows.length - 1 : activeRowIndex;
        const rId = this.data.value.meta.rows.splice(removalRowIndex, 1)[0];
        this.data.value.data.splice(removalRowIndex, 1);
        this.executor.scheduleJob(() => {
            // TODO Shouldn't we in the rowsObject remove the removalRowId, instead of deleting at position?
            this.crdtObj.rowsObject.doc.transact(() => {
                this.crdtObj.rowsObject.delete(removalRowIndex);
                // TODO Delete the now removed Cells!!
                this.crdtObj.columnsObject.forEach((column) => {
                    this.crdtObj.dataObject.delete(rId + '=' + column);
                });
            });
        });
    }

    removeColumn (id, activeColumnIndex) {
        // Don't delete the last column to keep invariant that always at least one column is left
        if (this.data.value.meta.columns.length === 1) return;
        const removalColumnIndex = (activeColumnIndex === undefined) ? this.data.value.meta.columns.length - 1 : activeColumnIndex;
        this.data.value.data.forEach(row => row.splice(removalColumnIndex, 1));
        const removalColumnId = this.data.value.meta.columns.splice(removalColumnIndex, 1)[0];
        this.data.value.headers.splice(removalColumnIndex, 1);
        this.executor.scheduleJob(() => {
            // TODO Shouldn't we in the columnsObject remove this specific columnId, instead of deleting at position?
            this.crdtObj.dataObject.doc.transact(() => {
                this.crdtObj.columnsObject.delete(removalColumnIndex);
                // TODO Delete the now removed Cells!!
                this.crdtObj.rowsObject.forEach((row) => {
                    this.crdtObj.dataObject.delete(row + '=' + removalColumnId);
                });
            });
        });
    }

    editCell (id, row, column, data) {
        const spreadSheetData = this.data.value.data;
        if (spreadSheetData[row]) {
            spreadSheetData[row][column] = data;
            const key = encodeCellKey(this.data.value.meta.rows[row], this.data.value.meta.columns[column]);
            const value = encodeCellInfo(data);
            this.executor.scheduleJob(() => {
                this.crdtObj.dataObject.doc.transact(() => {
                    this.crdtObj.dataObject.set(key, value);
                });
            });
        }
    }

    bulkEditCell (id, editInfos) {
        const spreadSheetData = this.data.value.data;
        for (const editInfo of editInfos) {
            const { row, column, data } = editInfo;
            if (spreadSheetData[row]) {
                spreadSheetData[row][column] = data;
            }
        }
    }

    editHeader (columnIndex, value) {
        const spreadSheetHeaders = this.data.value.headers;
        spreadSheetHeaders[columnIndex] = value;
        const columnId = this.data.value.meta.columns[columnIndex];
        const key = encodeCellKey('header', columnId);
        this.executor.scheduleJob(() => {
            this.crdtObj.dataObject.doc.transact(() => {
                this.crdtObj.dataObject.set(key, value);
            });
        });
    }

    addRule (value, key) {
        const spreadSheetRules = this.data.value.cellHighlightFormatRules;
        spreadSheetRules[key] = value;
        this.executor.scheduleJob(() => {
            const ruleKey = `rule=${key}`;
            const ruleValue = encodeCellInfo(value);
            this.crdtObj.dataObject.doc.transact(() => {
                this.crdtObj.dataObject.set(ruleKey, ruleValue);
            });
        });
    }

    deleteRule (key) {
        const spreadSheetRules = this.data.value.cellHighlightFormatRules;
        delete spreadSheetRules[key];
        this.executor.scheduleJob(() => {
            const ruleKey = `rule=${key}`;
            this.crdtObj.dataObject.doc.transact(() => {
                this.crdtObj.dataObject.delete(ruleKey);
            });
        });
    }

    setColumnWidth (columnIndex, width) {
        this.data.value.columnWidths[columnIndex] = width;
        const columnId = this.data.value.meta.columns[columnIndex];
        const key = encodeCellKey('width', columnId);
        this.executor.scheduleJob(() => {
            this.crdtObj.dataObject.doc.transact(() => {
                this.crdtObj.dataObject.set(key, width);
            });
        }
        );
    }
}
