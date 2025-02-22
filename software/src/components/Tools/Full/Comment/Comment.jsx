import React, { useEffect } from 'react';
import List from '@mui/material/List';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
export default function Comment ({
    docName,
    boardId,
    contextManager,
    boardType
}) {
    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.TODO_LIST);
    }, []);
    return (
        <List data-testid="ToDo Liste" style={{ height: '0% !important', width: '100%' }}>
            <React.Fragment >
            </React.Fragment>
        </List>
    );
}
