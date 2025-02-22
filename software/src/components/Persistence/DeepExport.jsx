import React, { useCallback, useEffect } from 'react';
// import { Button } from '@mui/material';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useSelector, useStore } from 'react-redux';
import { selectBoard } from '../../model/features/boards/boardsSlice';
import { getContextSelectorForSlice } from '../../model/features/functions/loaders';
import { prepareDownload } from './functions';
import * as Y from 'yjs';
import { TOOL_LIST } from '../Board/boardConfig';
export default function ExportBoard ({ boardId, triggerEvent }) {
    const { components } = useSelector((state) => selectBoard(state, boardId));
    const store = useStore();

    // useEffect with 'triggerEvent' used as onclick function cannot be placed within another element which has an onclick event
    // Eg: ToolBox.jsx has a parent element ListItem which has a click event, as per react standards, click events must be handled at parent
    useEffect(() => {
        if (triggerEvent > 0) {
            exportDeepCopy();
        }
    }, [triggerEvent]);

    const exportDeepCopy = useCallback(() => {
        const deepCopy = {
            image: [],
            spreadsheet: [],
            markdown: [],
            htmlcomp: [],
            todolist: [],
            diagram: []
        };
        for (const componentId in components) {
            const { position, innerId, createdBy, createdOn, type, label } = components[componentId];
            const size = components[componentId].size;
            const oldId = components[componentId].innerId;
            const selector = getContextSelectorForSlice(type);
            let fullContext = {};
            if (type === TOOL_LIST[0].type) {
                const { type, value } = selector(store.getState(), innerId);
                fullContext = { type, value: value.get('quill', Y.Text).toDelta() };
            } else {
                fullContext = selector(store.getState(), innerId);
            }
            deepCopy[type].push({
                componentData: {
                    type,
                    position,
                    size,
                    createdBy,
                    createdOn,
                    label,
                    oldId
                },
                innerData: fullContext
            });
        }
        prepareDownload(boardId, JSON.stringify(deepCopy, null, 4));
    }, [store, components]);
    let title = 'BOARD Export';
    if (boardId) {
        title = boardId.toString() + ' Export';
    }
    return (
        <span> {title} </span>
        // <Item onClick={exportDeepCopy}>Deep Export</Item>
    );
}
