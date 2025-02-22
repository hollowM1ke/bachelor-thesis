import { useDrag } from 'react-dnd';

/**
 * A convenience function to create a drag item ref for a toolbox item
 *
 * @param itemType The itemtype
 */
export const useDragItem = (itemType) => {
    return useDrag(
        () => ({
            type: itemType,
            item: {
                type: itemType
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );
};
