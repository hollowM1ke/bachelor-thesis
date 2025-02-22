import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addComponent } from '../../model/features/boards/boardsSlice';
import { generatePseudoRandomId } from '../../services/ids';
import { TOOL_LIST } from '../Board/boardConfig';
import { TOOL_TYPES } from '../Tools/toolTypes';

export default function ImportBoard ({ boardId, contextManager, triggerEvent }) {
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
                importDeepCopy(e.target.result);
            };
            reader.readAsText(files[0]);
        };
        fileDialog.click();
    };

    const importDeepCopy = (deepCopyStr) => {
        const spreadsheetIdMap = {};
        const deepCopy = JSON.parse(deepCopyStr);
        Object.entries(deepCopy)
            .forEach(([type, typeData]) => {
                typeData.forEach(({ componentData, innerData }) => {
                    const componentName = TOOL_LIST.filter(tool => tool.type === type)[0].name;
                    const newInnerId = generatePseudoRandomId();
                    if (type === TOOL_TYPES.SPREADSHEET) {
                        spreadsheetIdMap[componentData.oldId] = newInnerId;
                    }
                    if (type === TOOL_TYPES.DIAGRAM) {
                        innerData.value.ssid = spreadsheetIdMap[innerData.value.ssid] || innerData.value.ssid;
                    }
                    dispatch(addComponent({
                        id: boardId,
                        type,
                        innerId: newInnerId,
                        position: componentData.position,
                        componentInfo: {
                            componentId: generatePseudoRandomId(),
                            size: componentData.size
                        },
                        createdBy: componentData.createdBy,
                        createdOn: componentData.createdOn,
                        componentName: componentName,
                        description: componentData.label.description,
                        loadSkip: true
                    }));
                    contextManager.loadComponent(boardId, newInnerId, type, innerData);
                });
            });
    };

    return (
        <span>Board Import</span>
    );
}
