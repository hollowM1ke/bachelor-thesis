import * as PointSet from './point-set';
import * as PointMap from './point-map';
import * as Matrix from './matrix';
import { isActive, setCell, updateData } from './util';
import { isMobileDevice } from '../../../../services/utils';

let pasteCounter = 0;

export const select = (state, cellPointer) => {
    if (state.active && !isActive(state.active, cellPointer)) {
        return {
            selected: PointSet.from(
                Matrix.inclusiveRange(
                    { row: cellPointer.row, column: cellPointer.column },
                    { row: state.active.row, column: state.active.column }
                )
            ),
            mode: 'view'
        };
    }
    return null;
};

export const activate = (state, cellPointer) => ({
    selected: PointSet.from([cellPointer]),
    active: cellPointer,
    mode: isActive(state.active, cellPointer) ? 'edit' : 'view'
});

export function setData (
    state,
    active,
    data,
    bindings
) {
    return {
        mode: 'edit',
        data: setCell(state, active, data),
        activeData: data,
        lastChanged: active,
        bindings: PointMap.set(active, PointSet.from(bindings), state.bindings),
        lastPasteCounter: pasteCounter
    };
}

export function setCellDimensions (
    state,
    point,
    dimensions
) {
    const prevRowDimensions = state.rowDimensions[point.row];
    const prevColumnDimensions = state.columnDimensions[point.column];
    if (
        prevRowDimensions &&
        prevColumnDimensions &&
        prevRowDimensions.top === dimensions.top &&
        prevRowDimensions.height === dimensions.height &&
        prevColumnDimensions.left === dimensions.left &&
        prevColumnDimensions.width === dimensions.width
    ) {
        return null;
    }
    return {
        rowDimensions: {
            ...state.rowDimensions,
            [point.row]: { top: dimensions.top, height: dimensions.height }
        },
        columnDimensions: {
            ...state.columnDimensions,
            [point.column]: { left: dimensions.left, width: dimensions.width }
        }
    };
}

export const copy = (state) => ({
    copied: PointSet.reduce(
        (acc, point) =>
            PointMap.set(point, Matrix.get(point.row, point.column, state.data), acc),
        state.selected,
        PointMap.from([])
    ),
    cut: false,
    lastPasteCounter: pasteCounter
});

export const cut = (state) => ({
    ...copy(state),
    cut: true
});

export function paste (state) {
    const minPoint = PointSet.min(state.copied);

    const { data, selected, commit } = PointMap.reduce(
        (acc, value, { row, column }) => {
            if (!state.active) {
                return acc;
            }

            let commit = acc.commit || ([], 'lastCommit');
            const nextRow = row - minPoint.row + state.active.row;
            const nextColumn = column - minPoint.column + state.active.column;

            const nextData = state.cut
                ? Matrix.unset(row, column, acc.data)
                : acc.data;

            if (state.cut) {
                commit = [...commit, { prevCell: value, nextCell: undefined }];
            }

            if (!Matrix.has(nextRow, nextColumn, state.data)) {
                return {
                    data: nextData,
                    selected: acc.selected,
                    commit
                };
            }

            commit = [
                ...commit,
                {
                    prevCell: Matrix.get(nextRow, nextColumn, nextData),
                    nextCell: value,
                    row,
                    column
                }
            ];

            return {
                data: Matrix.set(nextRow, nextColumn, value, nextData),
                selected: PointSet.add(acc.selected, {
                    row: nextRow,
                    column: nextColumn
                }),
                commit
            };
        },
        state.copied,
        { data: state.data, selected: PointSet.from([]), commit: [] }
    );
    return {
        data,
        selected,
        pasteCounter: ++pasteCounter,
        hasPasted: true,
        hasCut: state.cut ? pasteCounter : -1,
        cut: false,
        mode: 'view',
        lastCommit: commit,
        activeData: undefined
    };
}

export const edit = () => ({
    mode: 'edit'
});

export const view = () => ({
    mode: 'view'
});

export const clear = (state) => {
    if (!state.active) {
        return null;
    }

    const { row, column } = state.active;
    const cell = Matrix.get(row, column, state.data);
    return {
        lastPasteCounter: pasteCounter,
        data: PointSet.reduce(
            (acc, point) =>
                updateData(acc, {
                    ...point,
                    data: { ...cell, value: '' }
                }),
            state.selected,
            state.data
        ),
        ...commit(
            state,
            PointSet.toArray(state.selected).map(point => {
                const cell = Matrix.get(point.row, point.column, state.data);
                return {
                    prevCell: cell,
                    nextCell: { ...cell, value: '' }
                };
            })
        )
    };
};

export const go = (
    rowDelta,
    columnDelta
) => (state, event) => {
    if (!state.active) {
        return null;
    }
    const nextActive = {
        row: state.active.row + rowDelta,
        column: state.active.column + columnDelta
    };
    if (!Matrix.has(nextActive.row, nextActive.column, state.data)) {
        const matrixSize = Matrix.getSize(state.data);
        // Condition checks if the last row AND last cell location has been reached.
        if (!(matrixSize.rows === nextActive.row && matrixSize.columns === nextActive.column)) {
            // If last row reached, and more columns exist in the iteration, move to the top row of the next column
            if (matrixSize.rows === nextActive.row && (nextActive.column < (matrixSize.columns - 1))) {
                nextActive.row = 0;
                nextActive.column = state.active.column + 1;
            } else if (matrixSize.columns === nextActive.column && (nextActive.row < (matrixSize.rows - 1))) { // If last column reached, and more rows exist in the iteration, move to the first column of the next row
                nextActive.column = 0;
                nextActive.row = state.active.row + 1;
            } else if (nextActive.row < 0 && nextActive.column > 0) { // When moving to the up from the first row of a current column, move to the last row of the previous column
                nextActive.row = matrixSize.rows - 1;
                nextActive.column = state.active.column - 1;
            } else if (nextActive.column < 0 && nextActive.row > 0) { // When moving left from the first column of a current row, move to the last column of the previous row
                nextActive.row = state.active.row - 1;
                nextActive.column = matrixSize.columns - 1;
            } else {
                return { mode: 'view' };
            }
        } else { // If last row AND last column reached, set table mode to view
            return { mode: 'view' };
        }
    }
    return {
        active: nextActive,
        selected: PointSet.from([nextActive]),
        mode: isMobileDevice() ? 'editMobile' : 'view'
        // Mobile devices use the virtual keyboard which does not have the arrow key options, the enter event will keep the virtual keyboard active as required in issue #131.
        // Non-mobile devices which use a mechanical keyboard, have the arrow key options, if the previous mode is set to edit, the arrow functionality will not move to the next cell.
        // 'editMobile' state is only for mobile devices, the mode is changed in the 'ActiveCell' when component is mounted.
    };
};

export const modifyEdge = (field, delta) => (
    state,
    event
) => {
    if (!state.active) {
        return null;
    }

    const edgeOffsets = PointSet.has(state.selected, {
        ...state.active,
        [field]: state.active[field] + delta * -1
    });

    const nextSelected = edgeOffsets
        ? PointSet.shrinkEdge(state.selected, field, delta * -1)
        : PointSet.extendEdge(state.selected, field, delta);

    return {
        selected: PointSet.filter(
            point => Matrix.has(point.row, point.column, state.data),
            nextSelected
        )
    };
};

export const blur = (state) => {
    return {
        active: { row: undefined, column: undefined },
        selected: {}
    };
};

// Key Bindings
/** @todo handle inactive state? */
const keyDownHandlers = {
    ArrowUp: go(-1, 0),
    ArrowDown: go(+1, 0),
    ArrowLeft: go(0, -1),
    ArrowRight: go(0, +1),
    Tab: go(0, +1),
    Enter: go(+1, 0),
    Backspace: clear,
    Escape: blur
};

const editKeyDownHandlers = {
    Escape: view,
    Tab: keyDownHandlers.Tab,
    Enter: keyDownHandlers.ArrowDown
};

const shiftKeyDownHandlers = {
    ArrowUp: modifyEdge('row', -1),
    ArrowDown: modifyEdge('row', 1),
    ArrowLeft: modifyEdge('column', -1),
    ArrowRight: modifyEdge('column', 1)
};

export function keyPress (
    state,
    event
) {
    if (state.mode === 'view' && state.active) {
        return { mode: 'edit' };
    }
    return null;
}

export const getKeyDownHandler = (
    state,
    event
) => {
    const { key } = event;
    let handlers;
    // Order matters
    if (state.mode === 'edit') {
        handlers = editKeyDownHandlers;
    } else if (event.shiftKey) {
        handlers = shiftKeyDownHandlers;
    } else {
        handlers = keyDownHandlers;
    }
    return handlers[key];
};

export function keyDown (
    state,
    event
) {
    const handler = getKeyDownHandler(state, event);
    if (handler) {
        return handler(state, event);
    }
    return null;
}

export function dragStart (state) {
    return { dragging: true };
}

export function dragEnd (state) {
    return { dragging: false };
}

export function commit (
    state,
    changes
) {
    return { lastCommit: changes, activeData: undefined };
}
