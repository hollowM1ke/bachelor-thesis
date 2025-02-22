import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    selectDiagram,
    selectDiagramError
} from '../../../../model/features/diagrams/diagramsSlice';
import DiagramSettings from './Settings/DiagramSettings';
import DiagramVisual from './DiagramVisual';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import { USER_ROLES } from '../../../users/users';
import { BOARD_TYPES } from '../../../Board/boardConfig';
import { useErrorBoundary } from 'react-error-boundary';
export default function Diagram ({
    docName,
    boardId,
    containerId,
    contextManager,
    boardType
}) {
    const studentOnBoardSktipt = contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS;
    // Retrieve all information associated with the diagram component
    const diagramInfo = useSelector((state) => selectDiagram(state, docName));
    const { showBoundary } = useErrorBoundary();
    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.DIAGRAM);
    }, []);

    useEffect(() => {
        enableShowDiagramVisual();
    }, [diagramInfo.settings]);

    const [showDiagramVisual, setShowDiagramVisual] = useState(false);

    const enableShowDiagramVisual = () => {
        if (diagramInfo && diagramInfo.ssid && diagramInfo.type && diagramInfo.settings && Object.keys(JSON.parse(diagramInfo.settings)).length > 0) {
            setShowDiagramVisual(true);
        }
    };

    const err = useSelector((state) => selectDiagramError(state, docName));
    if (err) {
        showBoundary(err);
    }
    return (
        showDiagramVisual
            ? <DiagramVisual docName={docName} boardId={boardId} containerId={containerId} contextManager={contextManager} diagramInfo={diagramInfo} setShowDiagramVisual={setShowDiagramVisual} />
            : <DiagramSettings docName={docName} boardId={boardId} containerId={containerId} contextManager={contextManager} diagramInfo={diagramInfo} setShowDiagramVisual={setShowDiagramVisual} studentOnBoardSktipt={studentOnBoardSktipt} />
    );
}
