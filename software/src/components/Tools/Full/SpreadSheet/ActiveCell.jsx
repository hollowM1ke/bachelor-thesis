import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'unistore/react';
import * as Matrix from './matrix';
import * as Actions from './actions';
import { getCellDimensions } from './util';
class ActiveCell extends Component {
    state = { cellBeforeUpdate: null };

    handleChange = (row, column, cell) => {
        const { onEditValue } = this.props;
        const { setData, getBindingsForCell } = this.props;
        const bindings = getBindingsForCell(cell);
        setData({ row, column }, cell, bindings);
        if (onEditValue) {
            onEditValue(row, column, cell.value);
        }
    };

    handleDoubleClick = (e) => {
        e.stopPropagation();
    };

    shouldComponentUpdate (prevProps) {
        const { edit } = this.props;
        // When working on mobile device, to ensure the virtual keyboard is open, the mode is changed is to 'editMobile' in the 'actions.js' file
        // Switched back to edit() mode to continue operation seamlessly
        if (prevProps.mode === 'editMobile') {
            edit();
        }
        return true;
    }

    // NOTE: Currently all logics here belongs to commit event
    componentDidUpdate (prevProps) {
        const { cell, row: currRow, column: currCol, mode, commit, onActivateCell } = this.props;
        if (onActivateCell) {
            onActivateCell(currRow, currCol, this.props.cell ? this.props.cell.value : '');
        }
        if (cell || cell === undefined) {
            if (prevProps.mode === 'view' && mode === 'edit') {
                this.setState({ cellBeforeUpdate: prevProps.cell });
            } else if (
                prevProps.mode === 'edit' &&
                prevProps.mode !== this.props.mode &&
                prevProps.cell &&
                prevProps.cell !== this.state.cellBeforeUpdate
            ) {
                commit([
                    { prevCell: this.state.cellBeforeUpdate, nextCell: prevProps.cell, row: prevProps.row, column: prevProps.column }
                ]);
            }
        }
    }

    render () {
        let { DataEditor } = this.props;
        const {
            getValue,
            row,
            column,
            cell,
            width,
            height,
            top,
            left,
            hidden,
            mode,
            edit
        } = this.props;
        DataEditor = (cell && cell.DataEditor) || DataEditor;
        return hidden
            ? null
            : (
                <div
                    data-testid="active-cell-mode"
                    className={classnames('ActiveCell', mode)}
                    style={{ width, height, top, left }}
                    onClick={(e) => {
                        try {
                            if (mode === 'view') {
                                edit();
                            }
                        } catch (err) { console.log(err); }
                    }}
                    onDoubleClick={(e) => { try { this.handleDoubleClick(e); } catch (err) { console.log(err); } }}
                >
                    {mode === 'edit' && (
                        <DataEditor
                            row={row}
                            column={column}
                            cell={cell}
                            onChange={(cell) => { try { this.handleChange(row, column, cell); } catch (err) { console.log(err); } }}
                            getValue={getValue}
                        />
                    )}
                </div>
            );
    }
}

const mapStateToProps = (state) => {
    const dimensions = state.active && getCellDimensions(state.active, state);
    if (!state.active || !dimensions) {
        return { hidden: true };
    }
    return {
        hidden: false,
        ...state.active,
        // $FlowFixMe
        cell: Matrix.get(state.active.row, state.active.column, state.data),
        width: dimensions.width,
        height: dimensions.height,
        top: dimensions.top,
        left: dimensions.left,
        mode: state.mode
    };
};

export default connect(
    mapStateToProps,
    {
        setData: Actions.setData,
        edit: Actions.edit,
        commit: Actions.commit
    }
)(ActiveCell);
