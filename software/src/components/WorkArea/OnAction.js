import { useDrop } from 'react-dnd';
import ItemTypes from '../ToolBox/itemTypes';
import { USAGE_MODES } from '../Board/usageModes';
import { throttle } from 'lodash';

/**
 * NOTE: the translate under scale functions here e.g.  ((item.left + delta.x - displacement.left * scale) / scale)
 * were guessed and could be faulty.
 * A bug from react-dnd causes the calibration to be buggy.
 * {@link https://github.com/react-dnd/react-dnd-html5-backend/issues/12}
 */

function calculatePositionAndMove (item, delta, displacement, scale, moveFn, sync = true) {
    const leftRate = (item.left + delta.x - displacement.left * scale) / scale;
    const topRate = (item.top + delta.y + displacement.top * scale) / scale;

    moveFn(item.id, leftRate, topRate, sync);
}

export function getUseDrop (displacement, scale, moveBox, usageMode, boardId) {
    const throttledHover = throttle((item, monitor) => {
        if (!monitor.canDrop()) return;
        if (monitor.getDifferenceFromInitialOffset() === null) return; // prevent hover if frozen
        calculatePositionAndMove(item, monitor.getDifferenceFromInitialOffset(), displacement, scale, moveBox, false);
    }, 25); // throttle time in milliseconds (25ms in this example)

    return useDrop(() => ({
        accept: [ItemTypes.WorkComponent],
        canDrop: (item, monitor) => usageMode === USAGE_MODES.DISPLACE && (boardId === item.boardId), // Prevent drop if frozen board
        drop (item, monitor) {
            if (monitor.didDrop()) return; // in case elements are nested
            calculatePositionAndMove(item, monitor.getDifferenceFromInitialOffset(), displacement, scale, moveBox);
        },
        hover: throttledHover
    }), [displacement, scale, usageMode]);
}
