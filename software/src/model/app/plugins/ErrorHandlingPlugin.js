import { setErrorCheckbox } from '../../features/checkboxes/checkboxesSlice';
import { setErrorTodoList } from '../../features/todolists/todolistsSlice';
import { setErrorImage } from '../../features/images/imagesSlice';
import { setErrorSpreadSheet } from '../../features/spreadsheets/spreadsheetsSlice';
import { setErrorDiagram } from '../../features/diagrams/diagramsSlice';
import { setErrorMarkdown } from '../../features/markdowns/markdownsSlice';
import { setErrorPersonalData } from '../../features/personaldata/personaldataSlice';
import { setErrorComment } from '../../features/comments/commentsSlice';
import { setErrorBoard } from '../../features/boards/boardsSlice';

const ErrorReducerLookupMap =
{
    todolists: setErrorTodoList,
    checkboxes: setErrorCheckbox,
    images: setErrorImage,
    spreadsheets: setErrorSpreadSheet,
    diagrams: setErrorDiagram,
    markdowns: setErrorMarkdown,
    personaldata: setErrorPersonalData,
    comments: setErrorComment,
    boards: setErrorBoard
};

export const ErrorHandlingMiddleware = store => next => action => {
    try {
        // Pass the action to the next middleware or the reducer
        return next(action);
    } catch (error) {
        // Handle the error here or dispatch an error action
        console.error('An error occurred while redux was trying to modify its state:', error);
        // Determine the slice name associated with the error
        const sliceName = action.type.split('/')[0];
        // Dispatch an error action specific to the slice
        if (sliceName) {
            const errorReducer = ErrorReducerLookupMap[sliceName];
            store.dispatch(errorReducer(action.payload.id, error));
        }
    }
};
