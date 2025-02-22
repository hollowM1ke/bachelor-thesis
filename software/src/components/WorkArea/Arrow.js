import { addConnection, removeConnection } from '../../model/features/boards/boardsSlice';

export function getAnchorArrow (dispatch, boardId, setCurrentAnchor, setShowMousePointer, resetAnchor) {
    return (currentAnchor, componentId) => {
        if (currentAnchor) {
            if (currentAnchor !== componentId) { // Prevent self connections
                dispatch(addConnection(boardId, currentAnchor, componentId));
            }

            resetAnchor(setCurrentAnchor, setShowMousePointer);
        } else {
            setShowMousePointer(true);
            setCurrentAnchor(componentId);
        }
    };
}

export function getResetAnchor (setCurrentAnchor, setShowMousePointer) {
    return () => {
        setCurrentAnchor();
        setShowMousePointer(false);
    };
}

export function getRemoveArrow (dispatch, boardId) {
    return (from, to) => {
        dispatch(removeConnection(boardId, from, to));
    };
}
