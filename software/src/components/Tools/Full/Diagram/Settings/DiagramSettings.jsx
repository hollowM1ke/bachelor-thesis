import React, { useEffect, useState } from 'react';
import { selectBoard, selectLabels } from '../../../../../model/features/boards/boardsSlice';
import { useSelector } from 'react-redux';
import { COMPONENT_TYPES } from '../../../../../model/features/functions/loaders';
import DiagramSettingTypeSpreadsheetId from './DiagramSettingTypeSpreadsheetId';
import DiagramSettingsProperties from './DiagramSettingProperties';

export default function DiagramSettings ({
    docName,
    boardId,
    containerId,
    contextManager,
    diagramInfo,
    setShowDiagramVisual
}) {
    // Retrieve all components available on current board. Required for linking diagram component to a spreadsheet component
    const { components } = useSelector((state) => selectBoard(state, boardId));
    // Required to link spreadsheet component by label name
    const allCurrentBoardLabels = useSelector((state) => selectLabels(state, boardId));

    useEffect(() => {
        if (components) {
            prepareSpreadsheetsComponentList();
        }
    }, [components]);

    // Store spreadsheet component information in format:
    // {componentId: {docName, label}}
    const [spreadsheetsComponentList, setSpreadsheetsComponentList] = useState({});

    // Filter 'allCurrentBoardComponents' to match with spreadsheet type components, associate their label and store in a JS object
    const prepareSpreadsheetsComponentList = () => {
        const spreadsheetList = {};
        Object.entries(components).filter(([, v]) => v.type === COMPONENT_TYPES.SPREADSHEET).forEach((component) => {
            const componentId = component[0];
            const SSId = component[1].innerId;
            const componentLabel = allCurrentBoardLabels.filter((labelEl) => labelEl.componentId === componentId);
            const label = componentLabel.length > 0 ? componentLabel[0].description : 'Unbenannt';
            spreadsheetList[componentId] = { SSId, label };
        });
        setSpreadsheetsComponentList(spreadsheetList);
    };

    // DiagramSettingsProperties - Component used for selection of diagram type and the spreadsheet to retrieve data from
    // DiagramSettingTypeSpreadsheetId - Component used to define visual properties of the diagram/visual
    const chooseSettingsForm = () => {
        if (diagramInfo && diagramInfo.type && diagramInfo.ssid) {
            return <DiagramSettingsProperties docName={docName} boardId={boardId} containerId={containerId} diagramInfo={diagramInfo} setShowDiagramVisual={setShowDiagramVisual} />;
        } else if (diagramInfo && diagramInfo.settings) {
            return <DiagramSettingTypeSpreadsheetId docName={docName} boardId={boardId} containerId={containerId} diagramInfo={diagramInfo} spreadsheetsComponentList={spreadsheetsComponentList} />;
        }
        return <></>;
    };

    return (
        <React.Fragment>
            { chooseSettingsForm() }
        </React.Fragment>
    );
}
