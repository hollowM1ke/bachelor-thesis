import Spreadsheet from './Full/SpreadSheet/SpreadSheetComponent';
import Diagram from './Full/Diagram/Diagram';
import MarkDownPreview from './Previews/MarkDownPreview';
import HTMLComponent from './Full/HTML/HTMLComponent';
import Image from './Full/Image/Image';
import Checkbox from './Full/Checkbox/Checkbox';
import TodoList from './Full/TodoList/TodoList';
import Comment from './Full/Comment/Comment';
import { getDefaultState } from '../../model/features/spreadsheets/spreadsheetsSlice';
import ProgressTracker from './Full/ProgressTracker/ProgressTracker';

export const TOOL_TYPES = {
    MARKDOWN: 'markdown',
    SPREADSHEET: 'spreadsheet',
    IMAGE: 'image',
    CHECKBOX: 'checkbox',
    TODO_LIST: 'todolist',
    DIAGRAM: 'diagram',
    HTML: 'htmlcomp',
    COMMENT: 'comment',
    PROGRESS_TRACKER: 'progresstracker'
};

/**
 * Binds tool types with the corresponding actual component that represents them
 * @param {string} toolType The tool type
 * @returns The component representing the tool type
 */
export function getToolComponent (toolType) {
    if (toolType === TOOL_TYPES.MARKDOWN) return MarkDownPreview;
    else if (toolType === TOOL_TYPES.SPREADSHEET) return Spreadsheet;
    else if (toolType === TOOL_TYPES.DIAGRAM) return Diagram;
    else if (toolType === TOOL_TYPES.IMAGE) return Image;
    else if (toolType === TOOL_TYPES.CHECKBOX) return Checkbox;
    else if (toolType === TOOL_TYPES.TODO_LIST) return TodoList;
    else if (toolType === TOOL_TYPES.HTML) return HTMLComponent;
    else if (toolType === TOOL_TYPES.COMMENT) return Comment;
    else if (toolType === TOOL_TYPES.PROGRESS_TRACKER) return ProgressTracker;
}

export function getToolDefaultValue (toolType) {
    if (toolType === TOOL_TYPES.SPREADSHEET) {
        return { value: getDefaultState() };
    };
}
