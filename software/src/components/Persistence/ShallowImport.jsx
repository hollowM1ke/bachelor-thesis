import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addComponent, addLabel } from '../../model/features/boards/boardsSlice';
import { generatePseudoRandomId } from '../../services/ids';
import { TOOL_LIST } from '../Board/boardConfig';

export default function ImportBoard ({ boardId, triggerEvent }) {
    const dispatch = useDispatch();

    // useEffect with 'triggerEvent' used as onclick function cannot be placed within another element which has an onclick event
    // Eg: ToolBox.jsx has a parent element ListItem which has a click event, as per react standards, click events must be handled at parent
    useEffect(() => {
        if (triggerEvent > 0) {
            openFileUpload();
        }
    }, [triggerEvent]);

    const openFileUpload = () => {
        const fileDialog = document.createElement('input');
        fileDialog.setAttribute('type', 'file');
        fileDialog.onchange = () => {
            const files = [...fileDialog.files];
            const reader = new FileReader();
            reader.onload = (e) => {
                importNewState(e.target.result);
            };
            reader.readAsText(files[0]);
        };
        fileDialog.click();
    };

    const importNewState = (jsonString) => {
        const importedState = JSON.parse(jsonString);
        for (const key in importedState) {
            const componentName = TOOL_LIST.filter(tool => tool.type === importedState[key].type)[0].name;
            dispatch(addComponent({
                id: boardId,
                type: importedState[key].type,
                innerId: importedState[key].innerId,
                position: { x: importedState[key].position.x, y: importedState[key].position.y },
                componentInfo: { componentId: generatePseudoRandomId(), size: importedState[key].size },
                createdBy: importedState[key].createdBy,
                createdOn: importedState[key].createdOn,
                componentName: componentName,
                description: importedState[key].label.description
            }));
        }
    };

    return (
        <span>Shallow Import</span>
        // <Item onClick={openFileUpload}>Shallow Import</Item>
    );
}
