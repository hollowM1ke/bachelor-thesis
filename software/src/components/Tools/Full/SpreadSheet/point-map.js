/**
 * Immutable unordered Map like interface of point to value pairs.
 *
 */

export function set (
    point,
    value,
    map
) {
    return {
        ...map,
        [point.row]: {
            ...map[point.row],
            [point.column]: value
        }
    };
}

export function unset (
    { row, column },
    map
) {
    if (!(row in map) || !(column in map[row])) {
        return map;
    }
    const {
    // $FlowFixMe
        [String(row)]: { [String(column)]: _, ...nextRow },
        ...nextMap
    } = map;
    if (Object.keys(nextRow).length === 0) {
        return nextMap;
    }
    return { ...nextMap, [row]: nextRow };
}

/** Gets the value for point in map */
export function get (
    point,
    map
) {
    return map[point.row] && map[point.row][point.column];
}

/** Checks if map has point assigned to value */
export function has (point, map) {
    return point.row in map && point.column in map[point.row];
}

export function getRow (row, map) {
    return row in map
        ? Object.keys(map[row]).map(column => map[row][column])
        : [];
}

export function getColumn (column, map) {
    return Object.keys(map).map(row => map[row][column]);
}

const EMPTY = ({});

/** Creates a new PointMap instance from an array-like or iterable object. */
export function from (pairs) {
    return pairs.reduce((acc, [point, value]) => set(point, value, acc), EMPTY);
}

/** Returns the number of elements in a PointMap object. */
export function size (map) {
    let acc = 0;
    const mapKeys = Object.keys(map);
    for (let i = 0; i < mapKeys.length; i++) {
        const row = Number(mapKeys[i]);
        const columns = map[row];
        acc += Object.keys(columns).length;
    }
    return acc;
}

/** Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value */
export function reduce (
    func,
    map,
    initialValue
) {
    let acc = initialValue;
    const mapKeys = Object.keys(map);
    for (let i = 0; i < mapKeys.length; i++) {
        const row = Number(mapKeys[i]);
        const columns = map[row];
        const columnKeys = Object.keys(columns);
        for (let j = 0; j < columnKeys.length; j++) {
            const column = Number(columnKeys[j]);
            const value = columns[column];
            acc = func(acc, value, { row: row, column: column });
        }
    }
    return acc;
}

/** Creates a new map with the results of calling a provided function on every value in the calling map */
export function map (func, map) {
    return reduce(
        (acc, value, point) => set(point, func(value), acc),
        map,
        from([])
    );
}

/** Returns whether map has any points set to value */
export function isEmpty (map) {
    return Object.keys(map).length === 0;
}
