import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectBoard } from '../../model/features/boards/boardsSlice';
import { prepareDownload } from './functions';

export default function ExportBoard ({ boardId, triggerEvent }) {
    const { components } = useSelector((state) => selectBoard(state, boardId));
    // useEffect with 'triggerEvent' used as onclick function cannot be placed within another element which has an onclick event
    // Eg: ToolBox.jsx has a parent element ListItem which has a click event, as per react standards, click events must be handled at parent
    useEffect(() => {
        if (triggerEvent > 0) {
            exportClone();
        }
    }, [triggerEvent]);

    function exportClone () {
        const componentsWithSize = {};
        for (const componentId in components) {
            componentsWithSize[componentId] = Object.assign(components[componentId]);
        }
        prepareDownload(boardId, JSON.stringify(componentsWithSize, null, 4));
    }

    return (
        <span>Shallow Export</span>
        // <Item onClick={exportClone}>Shallow Export</Item>
    );
}
