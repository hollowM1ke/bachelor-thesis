import React from 'react';
import { ItemTypes } from './../ItemTypes';
import EditIcon from '@mui/icons-material/Edit';
import { useDragItem } from './hooks';
import { MDEDITOR_STYLE } from './styles';

/**
 * The mark down editor toolbox item
 */
export default function MDEditorTool () {
    const [{ isDragging }, drag] = useDragItem(ItemTypes.TOOL_BOX_ITEM);

    return (
        <div ref={drag} style={MDEDITOR_STYLE}>
            <EditIcon fontSize='small' />
        </div>
    );
}
