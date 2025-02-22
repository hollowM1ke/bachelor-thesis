/**
 * Immutable Set like interface of points
 *
 */

import * as PointMap from './point-map';

/** Appends a new point to the Set object */
export const add = (set, point) =>
    PointMap.set(point, true, set);

/** Removes the point from the Set object */
export const remove = (set, point) =>
    PointMap.unset(point, set);

/** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
export const has = (set, point) =>
    PointMap.has(point, set);

/** Returns the number of points in a PointSet object */
export const size = (set) => PointMap.size(set);

/** Applies a function against an accumulator and each point in the set (from left to right) to reduce it to a single value */
export function reduce (
    func,
    set,
    initialValue
) {
    return PointMap.reduce(
        (acc, _, point) => func(acc, point),
        set,
        initialValue
    );
}

/** Creates a new set with the results of calling a provided function on every point in the calling set */
export function map (func, set) {
    return reduce((acc, point) => add(acc, func(point)), set, from([]));
}

/** Creates a new set with all points that pass the test implemented by the provided function */
export function filter (func, set) {
    return reduce(
        (acc, point) => {
            if (func(point)) {
                return add(acc, point);
            }
            return acc;
        },
        set,
        from([])
    );
}

const minKey = (object) =>
// $FlowFixMe
    Math.min(...Object.keys(object));

/** Returns the point on the minimal row in the minimal column in the set */
export function min (set) {
    const row = minKey(set);
    return { row, column: minKey(set[row]) };
}

const maxKey = (object) =>
// $FlowFixMe
    Math.max(...Object.keys(object));

/** Returns the point on the maximal row in the maximal column in the set */
export function max (set) {
    const row = maxKey(set);
    return { row, column: maxKey(set[row]) };
}

/** Creates a new PointSet instance from an array-like or iterable object */
export function from (points) {
    return points.reduce(add, PointMap.from([]));
}

/** Returns whether set has any points in */
export const isEmpty = (set) => PointMap.isEmpty(set);

/** Returns an array of the set points */
export function toArray (set) {
    return reduce((acc, point) => [...acc, point], set, []);
}

const NO_EDGE = {
    left: false,
    right: false,
    top: false,
    bottom: false
};

export function onEdge (set, point) {
    if (!has(set, point)) {
        return NO_EDGE;
    }

    const hasNot = (rowDelta, columnDelta) =>
        !has(set, {
            row: point.row + rowDelta,
            column: point.column + columnDelta
        });

    return {
        left: hasNot(0, -1),
        right: hasNot(0, 1),
        top: hasNot(-1, 0),
        bottom: hasNot(1, 0)
    };
}

export function getEdgeValue (
    set,
    field,
    delta
) {
    const compare = Math.sign(delta) === -1 ? Math.min : Math.max;
    if (size(set) === 0) {
        throw new Error('getEdgeValue() should never be called with an empty set');
    }
    // $FlowFixMe
    return reduce(
        (acc, point) => {
            if (acc === null) {
                return point[field];
            }
            return compare(acc, point[field]);
        },
        set,
        null
    );
}

export function extendEdge (
    set,
    field,
    delta
) {
    const oppositeField = field === 'row' ? 'column' : 'row';
    const edgeValue = getEdgeValue(set, field, delta);
    return reduce(
        (acc, point) => {
            if (point[field] === edgeValue) {
                return add(acc, {
                    [field]: edgeValue + delta,
                    [oppositeField]: point[oppositeField]
                });
            }
            return acc;
        },
        set,
        set
    );
}

export function shrinkEdge (
    set,
    field,
    delta
) {
    const edgeValue = getEdgeValue(set, field, delta);
    return reduce(
        (acc, point) => {
            if (point[field] === edgeValue) {
                return remove(acc, point);
            }
            return acc;
        },
        set,
        set
    );
}
