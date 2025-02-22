import React from 'react';
import * as PointSet from './point-set';
import classnames from 'classnames';
import { getCellDimensions } from './util';
import './FloatingRect.css';

const FloatingRect = ({
    width,
    height,
    top,
    left,
    className,
    hidden
}) => (
    <div
        className={classnames('FloatingRect', { hidden }, className)}
        style={{ width, height, top, left }}
    />
);

const getRangeDimensions = (
    points,
    state
) => {
    const { width, height, left, top } = PointSet.reduce(
        (acc, point) => {
            const isOnEdge = PointSet.onEdge(points, point);
            const dimensions = getCellDimensions(point, state);
            if (dimensions) {
                acc.width = isOnEdge.top ? acc.width + dimensions.width : acc.width;
                acc.height = isOnEdge.left
                    ? acc.height + dimensions.height
                    : acc.height;
                acc.left = isOnEdge.left && isOnEdge.top ? dimensions.left : acc.left;
                acc.top = isOnEdge.left && isOnEdge.top ? dimensions.top : acc.top;
            }
            return acc;
        },
        points,
        { left: 0, top: 0, width: 0, height: 0 }
    );
    return { left, top, width, height };
};

export const mapStateToProps = (cells) => (
    state
) => {
    return {
        ...getRangeDimensions(cells, state),
        hidden: PointSet.size(cells) === 0
    };
};

export default FloatingRect;
