import clipboard from 'clipboard-polyfill';

export const moveCursorToEnd = (el) => {
    el.selectionStart = el.selectionEnd = el.value.length;
};

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end. A step of -1 is used if a negative start is specified without an end or step. If end is not specified, it's set to start with start then set to 0.
 * @param end
 * @param start
 * @param step
 */
export function range (
    end,
    start = 0,
    step = 1
) {
    const array = [];
    if (Math.sign(end - start) === -1) {
        for (let element = start; element > end; element -= step) {
            array.push(element);
        }
        return array;
    }
    for (let element = start; element < end; element += step) {
        array.push(element);
    }
    return array;
}

export function updateData (
    data,
    cellDescriptor
) {
    const row = data[cellDescriptor.row];
    const nextData = [...data];
    const nextRow = row ? [...row] : [];
    nextRow[cellDescriptor.column] = cellDescriptor.data;
    nextData[cellDescriptor.row] = nextRow;
    return nextData;
}

export function setCell (
    state,
    active,
    cell
) {
    return updateData(state.data, {
        ...active,
        data: cell
    });
}

export function isActive (
    active,
    { row, column }
) {
    return Boolean(active && column === active.column && row === active.row);
}

export const getOffsetRect = (element) => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
    left: element.offsetLeft,
    top: element.offsetTop
});

/**
 * @todo better error management
 */
/**
 * Wraps Clipboard.writeText() with permission check if necessary
 * @param string - The string to be written to the clipboard.
 */
export const writeTextToClipboard = (string) => {
    const write = () => clipboard.writeText(string);
    if (navigator.permissions) {
        navigator.permissions
            .query({
                name: 'clipboard-read'
            })
            .then(readClipboardStatus => {
                if (readClipboardStatus.state) {
                    write();
                }
            });
    } else {
        write();
    }
};

export function createEmptyCell () {
    const currentTime = new Date().valueOf();
    // TODO Shouldn't this be part of the Cell class?
    const cell = {
        value: '',
        type: 'string',
        timestamp: currentTime,
        color: '#ffffff'
    };
    return cell;
}

export const getCellDimensions = (
    point,
    state
) => {
    const rowDimensions = state.rowDimensions[point.row];
    const columnDimensions = state.columnDimensions[point.column];
    return (
        rowDimensions &&
    columnDimensions && { ...rowDimensions, ...columnDimensions }
    );
};

export function getComputedValue ({ cell, formulaParser }) {
    if (cell === undefined) {
        return null;
    }
    const rawValue = cell.value;
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
        // split input into array as =sum(a1,a2,b1)-> ['sum','a1','a2','b1']
        const splitInput = rawValue.slice(1).split(/[(,:,)]/);
        const parsedData = [];
        if (rawValue[1] !== '(') {
            if (rawValue.includes(':') && splitInput.length >= 3) {
                const rangeOfCell = getRangeOfCells(splitInput[1], splitInput[2]);
                for (let i = 0; i < rangeOfCell.length; i++) {
                    const parsed = getCellValue(formulaParser, rangeOfCell[i]);
                    parsedData.push(parsed);
                }
            } else {
                for (let i = 1; i < splitInput.length - 1; i++) {
                    const parsed = getCellValue(formulaParser, splitInput[i]);
                    parsedData.push(parsed);
                }
            }
            const { result, error } = formulaParser.parse(String(splitInput[0]) + '(' + parsedData + ')');
            return error || result;
        } else {
            const { result, error } = formulaParser.parse(rawValue.slice(1));
            return error || result;
        }
    }

    return rawValue;
}

// Function return cell value given cell name
// Example getCellValue(formulaParser, 'a2') -> 12 [return the value of cell a2]
export function getCellValue (formulaParser, cell) {
    const result = formulaParser.parse(String(cell));
    if (result.error === null) {
        return (result.result);
    } else {
        return cell;
    }
}

// This function return range of column or row cells given starting and ending cell
// for example getRangeOfCells('a1':'c1') -> ['a1','b1','c1']
export function getRangeOfCells (startCell, endCell) {
    // startCellRow = 'a1' to 1
    // endCellRow = 'a12' to 12
    // startCellColumn = 'a1' to 'a'
    // endCellColumn = 'd1' to 'd'
    let startCellRow = parseInt(startCell.match(/\d+/));
    let endCellRow = parseInt(endCell.match(/\d+/));
    let startCellColumn = (startCell.replace(/\d/g, '')).toLowerCase();
    let endCellColumn = (endCell.replace(/\d/g, '')).toLowerCase();
    const allCell = [];
    if (startCellRow === endCellRow) {
        let startCellColumnNumber = 0;
        let endCellColumnNumber = 0;
        for (let i = 0; i < startCellColumn.length; i++) {
            startCellColumnNumber += (startCellColumn.charCodeAt(i) - 96) * Math.pow(26, startCellColumn.length - i - 1);
        }
        // This loop convert column character to number 'a'->1, 'e'->5, 'ab'->28
        for (let i = 0; i < endCellColumn.length; i++) {
            endCellColumnNumber += (endCellColumn.charCodeAt(i) - 96) * Math.pow(26, endCellColumn.length - i - 1);
        }
        for (let i = startCellColumnNumber; i <= endCellColumnNumber; i++) {
            let columnLetter = '';
            let temp = 0;
            let num = i;
            // This while loop convert number to column Character 1->'a', 5->'e' 27->'aa'
            while (num > 0) {
                temp = (num - 1) % 26;
                columnLetter = String.fromCharCode(97 + temp) + columnLetter;
                num = (num) / 26 | 0;
            }
            allCell.push(columnLetter + String(startCellRow));
        }
        return allCell;
    } else if (startCellColumn === endCellColumn) {
        if (startCellRow > endCellRow) {
            [startCellRow, endCellRow] = [endCellRow, startCellRow];
            [startCellColumn, endCellColumn] = [endCellColumn, startCellColumn];
        }
        for (let i = startCellRow; i <= endCellRow; i++) {
            allCell.push(startCellColumn + String(i));
        }
    }
    return allCell;
}

export function createEmptyMatrix (rows, columns) {
    return range(rows).map(() => Array(columns).fill(createEmptyCell()));
}
