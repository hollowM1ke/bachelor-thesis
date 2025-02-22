import React, { Component } from 'react';
import { connect } from 'unistore/react';
import {
    Parser as FormulaParser,
    columnIndexToLabel
} from 'hot-formula-parser';
import Table from './Table';
import Row from './Row';
import { Cell, enhance as enhanceCell } from './Cell';
import DataViewer from './DataViewer';
import DataEditor from './DataEditor';
import ActiveCell from './ActiveCell';
import Selected from './Selected';
import Copied from './Copied';
import Toolbar from './Toolbar';
import { getBindingsForCell } from './bindings';
import { range, writeTextToClipboard } from './util';
import * as PointSet from './point-set';
import * as Matrix from './matrix';
import * as Actions from './actions';
import { USER_ROLES } from '../../../users/users';
import { BOARD_TYPES } from '../../../Board/boardConfig';
const getValue = ({ data }) => {
    // TODO this is only used in combination with cells here, does a cell always have a value??
    return data ? data.value : null;
};
const defalutColumnWidth = 75;
const DefaultRowIndicator = ({ row, label, onClick }) =>
    label !== undefined
        ? <th row={row} onClick={(e) => { try { onClick(e); } catch (err) { console.log(err); } }}>{label}</th>
        : <th row={row} onClick={(e) => { try { onClick(e); } catch (err) { console.log(err); } }}>{row + 1}</th>;

const DefaultColumnIndicator = ({ column, label, onClick, onDoubleClick, className, columnNumber = 0, state = {} }) => {
    return label !== undefined
        ? <th column={column} style={{ 'min-width': state[columnNumber] ? state[columnNumber] + 'px' : defalutColumnWidth + 'px' }} onClick={(e) => { try { onClick(e); } catch (err) { console.log(err); } }} onDoubleClick={(e) => { try { onDoubleClick(e); } catch (err) { console.log(err); } }} className={className} data-testid = 'coll'>{label}</th>
        : <th column={column} style={{ 'min-width': state[columnNumber] ? state[columnNumber] + 'px' : defalutColumnWidth + 'px' }} onClick={(e) => { try { onClick(e); } catch (err) { console.log(err); } }} onDoubleClick={(e) => { try { onDoubleClick(e); } catch (err) { console.log(err); } }}>{columnIndexToLabel(column)}</th>;
};
class Spreadsheet extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    static defaultProps = {
        Table,
        Row,
        /** @todo enhance incoming Cell prop */
        Cell: enhanceCell(Cell),
        DataViewer,
        DataEditor,
        getValue,
        getBindingsForCell
    };

    formulaParser = new FormulaParser();
    clip = () => {
        const { store, getValue } = this.props;
        const { data, selected } = store.getState();
        const startPoint = PointSet.min(selected);
        const endPoint = PointSet.max(selected);
        const slicedMatrix = Matrix.slice(startPoint, endPoint, data);
        const valueMatrix = Matrix.map((value, point) => {
            // Slice makes non-existing cells undefined, empty cells are classically
            // translated to an empty string in join()
            if (value === undefined) {
                return '';
            }
            return getValue({ ...point, data: value });
        }, slicedMatrix);
        writeTextToClipboard(Matrix.join(valueMatrix));
    };

    isFocused () {
        const { activeElement } = document;
        return this.root
            ? this.root === activeElement || this.root.contains(activeElement)
            : false;
    }

    componentDidMount () {
        const { copy, cut, paste, store } = this.props;
        document.addEventListener('copy', (event) => {
            if (this.isFocused()) {
                event.preventDefault();
                event.stopPropagation();
                this.clip();
                copy();
            }
        });

        document.addEventListener('cut', (event) => {
            if (this.isFocused()) {
                event.preventDefault();
                event.stopPropagation();
                this.clip();
                cut();
            }
        });
        document.addEventListener('paste', (event) => {
            if (this.isFocused()) {
                event.preventDefault();
                event.stopPropagation();
                paste();
            }
        });

        const parseNoCycles = (cell) => {
            let res;
            if (cell !== undefined) {
                if (cell.value && cell.value.length > 0 && cell.value.charAt(0) === '=' && !cell.visited) {
                    res = this.formulaParser.parse(getValue({ data: cell }).slice(1)).result;
                } else {
                    res = getValue({ data: cell }) === '' ? 0 : getValue({ data: cell });
                }
                delete cell.visited;
            }
            return res;
        };

        this.formulaParser.on('callCellValue', (cellCoord, done) => {
            let value;
            /** @todo More sound error, or at least document */
            try {
                const cell = Matrix.get(
                    cellCoord.row.index,
                    cellCoord.column.index,
                    store.getState().data
                );
                value = parseNoCycles(cell);
            } catch (error) {
                console.error(error);
            } finally {
                done(value);
            }
        });
        this.formulaParser.on(
            'callRangeValue',
            (startCellCoord, endCellCoord, done) => {
                const startPoint = {
                    row: startCellCoord.row.index,
                    column: startCellCoord.column.index
                };
                const endPoint = {
                    row: endCellCoord.row.index,
                    column: endCellCoord.column.index
                };
                const values = Matrix.toArray(
                    Matrix.slice(startPoint, endPoint, store.getState().data)
                ).map(cell => parseNoCycles(cell));
                done(values);
            }
        );
        range(this.props.columns).forEach(columnNumber => {
            // The _ is used because uuids can start with numbers which isnt a valid css selector for class names but if it starts with _ it is valid
            const th1 = document.querySelector('._' + this.props.docName + ' th:nth-child(' + (columnNumber + 3) + ')');
            const th2 = document.querySelector('._' + this.props.docName + ' th:nth-child(' + (columnNumber + 2) + ')');
            const th1Width = th1.offsetLeft;
            const th1offsetHeight = th1.offsetParent.offsetParent.offsetTop;
            const th1Height = th2.offsetHeight;
            // Position the overlay between the first and second columns
            const overlay = document.getElementById('_' + this.props.docName + '=' + columnNumber);
            overlay.style.left = th1Width + 'px';
            overlay.style.top = th1offsetHeight + 'px';
            overlay.style.height = th1Height + 'px';
            // overlay.style.height = th1Height;
        });
        const columnsWidth = {};
        range(this.props.columns).forEach(columnNumber => {
            columnsWidth[columnNumber] = defalutColumnWidth;
        });
        this.setState(columnsWidth);
    }

    // Optimize so that it only updates the style if the column width has changed or a column has been added
    componentDidUpdate (prevProps, prevState) {
        if (prevProps.columns !== this.props.columns || prevState !== this.state) {
            const columnsWidth = {};
            range(this.props.columns).forEach(columnNumber => {
                // The _ is used because uuids can start with numbers which isnt a valid css selector for class names but if it starts with _ it is valid
                const th1 = document.querySelector('._' + this.props.docName + ' th:nth-child(' + (columnNumber + 3) + ')');
                const th2 = document.querySelector('._' + this.props.docName + ' th:nth-child(' + (columnNumber + 2) + ')');
                if (th1.offsetParent && th2.offsetHeight) {
                    const th1Width = th1.offsetLeft - 1;
                    const th1offsetHeight = th1.offsetParent.offsetParent.offsetTop;
                    const th1Height = th2.offsetHeight;
                    // Position the overlay between the first and second columns
                    const overlay = document.getElementById('_' + this.props.docName + '=' + columnNumber);
                    overlay.style.left = th1Width + 'px';
                    overlay.style.top = th1offsetHeight + 'px';
                    overlay.style.height = th1Height + 'px';

                    columnsWidth[columnNumber] = prevState[columnNumber] ? prevState[columnNumber] : this.props.columnWidths ? this.props.columnWidths[columnNumber] : defalutColumnWidth;
                }
            });
            if (prevProps.columns !== this.props.columns) {
                this.setState(columnsWidth);
            }
        }
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.columnWidths !== this.state) {
            this.setState(nextProps.columnWidths);
        }
    }

    handleKeyDown = event => {
        const { store, onKeyDown } = this.props;
        // Only disable default behavior if an handler exist
        if (Actions.getKeyDownHandler(store.getState(), event)) {
            event.nativeEvent.preventDefault();
        }
        onKeyDown(event);
    };

    handleMouseUp = () => {
        this.props.onDragEnd();
        document.removeEventListener('mouseup', this.handleMouseUp);
    };

    handleMouseMove = event => {
        if (!this.props.store.getState().dragging && event.buttons === 1) {
            this.props.onDragStart();
            document.addEventListener('mouseup', this.handleMouseUp);
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    handleRoot = (root) => {
        this.root = root;
    };

    // The active cell state is set to empty, this will prevent data entry hapazadly when multiple spreadsheets are open
    loseActiveCellFocus = () => {
        const { blur } = this.props;
        const row = undefined;
        const column = undefined;
        blur({ row, column });
    };

    onClickRowDelete = () => {
        this.props.onClickRowDelete();
        this.loseActiveCellFocus();
    };

    onClickColumnDelete = () => {
        this.props.onClickColumnDelete();
        this.loseActiveCellFocus();
    };

    updateCells = () => {
        this.forceUpdate();
    };

    resizingStart = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.buttons === 1) {
            this.setState({ [event.target.id.split('=')[1]]: this.state[event.target.id.split('=')[1]] + (event.movementX / this.props.contextManager.scaleFactor) });
        }
    };

    render () {
        const {
            Table,
            Row,
            Cell,
            columnLabels,
            rowLabels,
            DataViewer,
            getValue,
            rows,
            columns,
            onKeyPress,
            getBindingsForCell,
            hideColumnIndicators,
            hideRowIndicators,
            onClickColumnHeader,
            onClickRowHeader,
            onActivateCell,
            onEditValue,
            activeCellData,
            onColorChange,
            cellHighlightFormatRules,
            boardType,
            contextManager,
            settingsObject,
            docName
        } = this.props;

        const getActiveCellValue = (data) => {
            if (activeCellData) {
                return activeCellData.value;
            } else {
                return getValue(data);
            }
        };
        // students should not maipulate the spreadsheet on the script board
        const studentOnBoardSktipt = contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS;
        const adminPreview = contextManager.adminPreview;

        const ColumnIndicator = this.props.ColumnIndicator || DefaultColumnIndicator;
        const RowIndicator = this.props.RowIndicator || DefaultRowIndicator;
        const handleColumnHeaderClick = (columnIdx) => {
            if (studentOnBoardSktipt || adminPreview) {
                return;
            }
            const newHeader = prompt('Bitte Spaltenbeschriftung eingeben!');
            const newHeaderValue = newHeader || columnLabels[columnIdx];
            this.props.onClickColumnLabel(columnIdx, newHeaderValue);
        };
        return (
            <div className='Spreadsheet-container' class={ '_' + this.props.docName + ' ' + 'Spreadsheet-container' } onMouseLeave={(e) => { try { this.loseActiveCellFocus(e); } catch (err) { console.log(err); } }}>
                <Toolbar
                    onClickRow={() => this.props.onClickRowHeader(false)}
                    onClickColumn={() => this.props.onClickColumnHeader(false)}
                    onClickRowDelete={this.onClickRowDelete}
                    onClickColumnDelete={this.onClickColumnDelete}
                    onCellCommit={this.props.onCellCommit}
                    onColorChange={onColorChange}
                    data={this.props.store.getState().data}
                    selected={this.props.store.getState().selected}
                    studentOnBoardSktipt={studentOnBoardSktipt}
                    adminPreview = {adminPreview}
                    settingsObject={settingsObject}
                    cellHighlightFormatRules={cellHighlightFormatRules}
                    onAddCellHighlightFormatRule={this.props.onAddCellHighlightFormatRule}
                    onDeleteCellHighlightFormatRule={this.props.onDeleteCellHighlightFormatRule}
                />
                <div
                    data-testid = 'Tabelle'
                    ref={this.handleRoot}
                    className="Spreadsheet"
                    onKeyPress={(e) => { try { onKeyPress(e); } catch (err) { console.log(err); } }}
                    onKeyDown={(e) => { try { this.handleKeyDown(e); } catch (err) { console.log(err); } }}
                    onMouseMove={(e) => { try { this.handleMouseMove(e); } catch (err) { console.log(err); } }}
                >
                    <Table>
                        <tr className='firstrow'>
                            {!hideRowIndicators && !hideColumnIndicators && <th />}
                            {!hideColumnIndicators &&
                                range(columns).map(columnNumber => (
                                    <ColumnIndicator key={columnNumber} column={columnNumber} className={(this.props.fullWidthColumns && this.props.fullWidthColumns[columnNumber]) ? 'fullColumnWidth' : 'fixedColumnWidth'} columnNumber={columnNumber} state={this.state} />) // onDoubleClick={() => this.props.onColumnWidthChange(columnNumber)}
                                )}
                            {/* <Tooltip title="Spalte hinzufügen" arrow> */}
                            <th className='AddRowColumnButtons AddColumnButton' data-testid='plusCol' column={columns.length} rowSpan={2} onClick={(e) => { if (!studentOnBoardSktipt && !adminPreview) { try { onClickColumnHeader(true); } catch (err) { console.log(err); } } }}>+</th>
                            {/* </Tooltip> */}
                        </tr>
                        <tr>
                            {!hideRowIndicators && !hideColumnIndicators && <th />}
                            {!hideColumnIndicators &&
                                range(columns).map(columnNumber =>
                                    columnLabels
                                        ? (
                                            <ColumnIndicator
                                                key={columnNumber}
                                                column={columnNumber}
                                                label={
                                                    columnNumber in columnLabels
                                                        ? columnLabels[columnNumber]
                                                        : null
                                                }
                                                onClick={e => handleColumnHeaderClick(columnNumber)}
                                            />
                                        )
                                        : (
                                            <ColumnIndicator key={columnNumber} column={columnNumber} onClick={(e) => { try { handleColumnHeaderClick(columnNumber); } catch (err) { console.log(err); } }} />
                                        )
                                )}
                        </tr>
                        {
                            range(rows).map(rowNumber => (
                                <Row key={rowNumber}>
                                    {!hideRowIndicators &&
                                        (rowLabels
                                            ? (
                                                <RowIndicator
                                                    key={rowNumber}
                                                    row={rowNumber}
                                                    label={rowNumber in rowLabels ? rowLabels[rowNumber] : null}
                                                />
                                            )
                                            : (
                                                <RowIndicator key={rowNumber} row={rowNumber} />
                                            ))}
                                    {range(columns).map(columnNumber => (
                                        <Cell
                                            key={columnNumber}
                                            row={rowNumber}
                                            column={columnNumber}
                                            DataViewer={DataViewer}
                                            getValue={getValue}
                                            formulaParser={this.formulaParser}
                                            cellHighlightFormatRules={cellHighlightFormatRules}
                                            updateCells={this.updateCells}
                                            className={(this.props.fullWidthColumns && this.props.fullWidthColumns[columnNumber]) ? 'fullColumnWidth' : 'fixedColumnWidth'}
                                            studentOnBoardSktipt={studentOnBoardSktipt}
                                            adminPreview = {adminPreview}
                                        />
                                    ))}
                                </Row>
                            ))
                        }
                        <Row key={rows.length}>
                            {/* <Tooltip title="Reihe hinzufügen" arrow> */}
                            <th className='AddRowColumnButtons AddRowButton' data-testid='plusRow' row={rows.length} onClick={() => { if (!studentOnBoardSktipt && !adminPreview) { onClickRowHeader(true); } }}>+</th>
                            {/* </Tooltip> */}
                        </Row>
                    </Table>
                    <ActiveCell
                        DataEditor={DataEditor}
                        getValue={getActiveCellValue}
                        getBindingsForCell={getBindingsForCell}
                        onActivateCell={onActivateCell}
                        onEditValue={onEditValue}
                    />
                    <Selected />
                    <Copied />
                </div>
                {range(columns).map(columnNumber => (
                    /* Needs optimization if mouse leave only update state when change in column width occured */
                    <div className ="overlay" id={'_' + docName + '=' + columnNumber} key={columnNumber} onMouseMove={(e) => { try { this.resizingStart(e); } catch (err) { console.log(e); } }} onMouseUp={(e) => { try { this.props.onColumnWidthChange(columnNumber, this.state[columnNumber]); } catch (err) { console.log(err); } }} onMouseLeave={(e) => { try { this.props.onColumnWidthChange(columnNumber, this.state[columnNumber]); } catch (err) { console.log(err); } }}>
                        <div className ="css-dreieck"></div>
                    </div>))}
            </div>
        );
    }
}

const mapStateToProps = ({ data }) =>
    Matrix.getSize(data);

export default connect(
    mapStateToProps,
    {
        copy: Actions.copy,
        cut: Actions.cut,
        paste: Actions.paste,
        onKeyDown: Actions.keyDown,
        onKeyPress: Actions.keyPress,
        onDragStart: Actions.dragStart,
        onDragEnd: Actions.dragEnd,
        blur: Actions.blur
    }
)(Spreadsheet);
