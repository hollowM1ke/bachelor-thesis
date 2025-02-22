import React, { useEffect, useState } from 'react';
import SpreadSheetStateProvider from './SpreadsheetStateProvider';
import { useSelector, useDispatch } from 'react-redux';
import {
    addRow,
    addColumn,
    removeRow,
    removeColumn,
    editCell,
    editHeader,
    addCellHighlightFormatRule,
    deleteCellHighlightFormatRule,
    selectSpreadsheet,
    selectSpreadSheetError,
    setColumnWidth
} from '../../../../model/features/spreadsheets/spreadsheetsSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import classnames from 'classnames';
import './Spreadsheet.css';
import { getComputedValue } from './util';
import { useErrorBoundary } from 'react-error-boundary';

const UPDATE_NOTIFY_INTERVAL = 2000; // 2 seconds for the newly updated cell to return to the original background color

export default function SpreadSheet ({ docName, boardId, contextManager, boardType, settingsObject }) {
    const [activeCellData, setActiveCellData] = useState(undefined);
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    const spreadsheet = useSelector((state) => selectSpreadsheet(state, docName));
    useEffect(() => {
        if (!settingsObject.loadSkip) {
            contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.SPREADSHEET, undefined, settingsObject.isExternal);
        }
    }, []);
    const err = useSelector((state) => selectSpreadSheetError(state, docName));
    if (err) {
        showBoundary(err);
    }
    /**
     * dispatches an edit cell action whenever a cell is committed
     */
    const handleCommit = ({ lastCommit }) => {
        const cellCommit = lastCommit[0];
        const value = cellCommit.nextCell.value;
        const type = cellCommit.nextCell.type || 'text';
        const color = cellCommit.nextCell.color;
        const row = cellCommit.row;
        const column = cellCommit.column;
        dispatch(editCell(docName, row, column, value, type, color));
    };

    // add rows function
    // add column function
    /**
    * @param toAppendLastRow If true, the a new column will be added to the end of the spreadsheet. If false/undefined, column will be added to active cell
    * */
    const handleRowClick = (toAppendLastRow) => {
        dispatch(addRow(docName, toAppendLastRow ? undefined : activeCellData.row));
    };

    // add column function
    /**
    * @param toAppendLastColumn If true, the a new column will be added to the end of the spreadsheet. If false/undefined, column will be added to active cell
    * */
    const handleColumnClick = (toAppendLastColumn) => {
        dispatch(addColumn(docName, toAppendLastColumn ? undefined : activeCellData.column));
    };

    // Remove row
    /* if activeCellData is false we have no activeCell and remove the last row  */
    const deleteRow = () => {
        dispatch(removeRow(docName, activeCellData ? activeCellData.row : undefined));
    };
    // Remove column
    /* if activeCellData is false we have no activeCell and remove the last column  */
    const deleteColumn = () => {
        dispatch(removeColumn(docName, activeCellData ? activeCellData.column : undefined));
    };

    // change label
    const handleColumnLabelChange = (column, value) => {
        dispatch(editHeader(docName, column, value));
    };

    const handleCellColorChange = (row, column, value, type, color) => {
        dispatch(editCell(docName, row, column, value, type, color));
    };

    const handleAddCellHighlightFormatRule = (cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText) => {
        dispatch(addCellHighlightFormatRule(docName, cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText));
    };

    const handleDeleteCellHighlightFormatRule = (ruleKey) => {
        dispatch(deleteCellHighlightFormatRule(docName, ruleKey));
    };

    const handleActivateCell = (row, column, value) => {
        if (activeCellData && row === activeCellData.row && column === activeCellData.column) return;
        setActiveCellData({
            row,
            column,
            value
        });
    };

    const handleColumnWidthChange = (columnIndex, width) => {
        dispatch(setColumnWidth(docName, columnIndex, width));
    };

    // activeCellData.value returns value of selected cell
    // spreadsheet.data returns values of spreadsheet
    // use Array(spreadsheet.data) to turn the spreadsheet into an array where each element is a column
    return (
        spreadsheet.isExternal && (spreadsheet.meta.rows.length === 0 || spreadsheet.meta.columns.length === 0)
            ? <div> Loading </div>
            : <React.Fragment>
                <SpreadSheetStateProvider
                    data={spreadsheet.data}
                    columnWidths={spreadsheet.columnWidths}
                    columnLabels={spreadsheet.headers}
                    cellHighlightFormatRules={spreadsheet.cellHighlightFormatRules}
                    fullWidthColumns={spreadsheet.fullWidthColumns}
                    onCellCommit={handleCommit}
                    DataViewer={TimeStampedView}
                    onClickColumnHeader={handleColumnClick}
                    onClickRowHeader={handleRowClick}
                    onClickRowDelete={deleteRow}
                    onClickColumnDelete={deleteColumn}
                    onClickColumnLabel={handleColumnLabelChange}
                    onColorChange={handleCellColorChange}
                    onAddCellHighlightFormatRule={handleAddCellHighlightFormatRule}
                    onDeleteCellHighlightFormatRule={handleDeleteCellHighlightFormatRule}
                    onActivateCell={handleActivateCell} // try not to trigger the event if is the same cell
                    onColumnWidthChange={handleColumnWidthChange}
                    boardType={boardType}
                    contextManager={contextManager}
                    settingsObject={settingsObject}
                    docName={docName}
                // onChange={onChange}
                // onEditValue={handleEditActiveCell}
                // onKeyDown={onKeyDown}
                // columnLabels={['t1', 't2']} // use this to provide column labels
                // hideRowIndicators={true}
                // hideColumnIndicators={true}
                />
            </React.Fragment>
    );
}

/**
 * Timestamp aware cell view, used to highlight cells that have been recently edited
 */
const TimeStampedView = (data) => {
    const { cell, formulaParser } = data;
    const now = new Date().valueOf();
    // const value = getValue({ data: cell }); // value without parsing formulas
    const value = getComputedValue({ cell, formulaParser });
    const highlight = (cell && cell.timestamp && (now - cell.timestamp <= UPDATE_NOTIFY_INTERVAL));
    const className = classnames('timestamp-cell', { highlighted: highlight });
    return (
        <span
            className={className}
        >
            {value}
        </span>
    );
};
