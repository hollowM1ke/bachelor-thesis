export const DEFAULT_ROW = ['r1'];
export const DEFAULT_COLUMN = ['c1'];
export const DEFAULT_COLUMN_WIDTH = { 0: 75 };

export const encodeCellInfo = function (cellInfo) {
    return JSON.stringify(cellInfo);
};

export const decodeCellInfo = function (cellInfo) {
    return JSON.parse(cellInfo);
};

export const encodeCellKey = function (row, column) {
    // Don't use - as this is part of the row/column ids!
    return `${row}=${column}`;
};

export const decodeCellKey = function (key) {
    const vals = key.split('=');
    return {
        row: vals[0],
        column: vals[1]
    };
};

export const headerDefaultKeys = function (count) {
    return Array.from({ length: count }, (v, i) => 'XYZ');
};
