import React from 'react'; // TODO This has no relation to React, just pure functions

export const countDecimals = (value) => { // TODO why is this exported??
    if (Math.floor(value) === value) {
        return 0;
    }
    return value.toString().split('.')[1].length || 0;
};

// TODO toView is weirdly overloaded
const toView = (value, meta) => {
    const parsedValue = Number(value);
    if (value !== null && value !== '' && !isNaN(parsedValue)) { // TODO Checks like these shouldn't be necessary if function is  correctly dispatched
        let nCases = 0;
        if (meta !== undefined && meta.precision >= 0) {
            nCases = meta.precision;
        } else {
            nCases = countDecimals(parsedValue);
        }
        value = parsedValue.toFixed(Math.min(8, nCases)); // TODO Don't hard code such constants!!
    }
    if (value === false) {
        return <div className="boolean">FALSE</div>;
    }
    if (value === true) {
        return <div className="boolean">TRUE</div>;
    }
    return value;
};

const DataViewer = ({ getValue, cell, column, row, formulaParser }) => {
    const rawValue = getValue({ data: cell, column, row });
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
        const { result, error } = formulaParser.parse(rawValue.slice(1));
        return error || toView(result, cell ? cell.meta : undefined); // TODO The call to toView is unnecessary
    }
    return toView(rawValue, cell ? cell.meta : undefined);
};

export default DataViewer;
