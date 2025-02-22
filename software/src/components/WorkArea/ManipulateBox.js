import { addComponent, moveComponent, removeComponent } from '../../model/features/boards/boardsSlice';
import { removeFlag, removeProgressTrackerItem } from '../../model/features/personaldata/personaldataSlice';
import { generatePseudoRandomId } from '../../services/ids';

export function getMoveBox (dispatch, boardId) {
    return (id, left, top, sync = true) => {
        dispatch(moveComponent(boardId, id, { x: left, y: top }, sync));
    };
}

export function getAddBox (dispatch, boardId, contextManager) {
    return (type, left, top, id, dataId, size, createdBy, createdOn, description) => {
        dataId = dataId || generatePseudoRandomId();
        createdBy = createdBy || contextManager.userId;
        createdOn = createdOn || (new Date()).toLocaleDateString('en-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const componentName = contextManager.toolList.filter(tool => tool.type === type)[0].name;
        dispatch(addComponent({ id: boardId, type, innerId: dataId, position: { x: left, y: top }, componentInfo: { componentId: id, size }, createdBy, createdOn, componentName, description }));
        contextManager.addRecentlyUsedTool(type);
    };
}

export function getRemoveBox (dispatch, boardId) {
    return (id) => {
        dispatch(removeComponent(boardId, id));
        dispatch(removeFlag(boardId, id));
        dispatch(removeProgressTrackerItem(boardId, id));
    };
}
