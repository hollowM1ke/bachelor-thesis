import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
    addItem,
    editText,
    removeItem,
    selectTodoList,
    setChecked,
    addChildItem,
    removeChildItem,
    setChildItemChecked,
    editChildItemText
} from '../../../../model/features/todolists/todolistsSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import { useSelector, useDispatch } from 'react-redux';
import { USER_ROLES } from '../../../users/users';
import { BOARD_TYPES } from '../../../Board/boardConfig';
import { Box } from '@mui/material';
import { addProgressTrackerItem, selectPersonalDataError } from '../../../../model/features/personaldata/personaldataSlice';
import { selectLabels } from '../../../../model/features/boards/boardsSlice';
import { useErrorBoundary } from 'react-error-boundary';

export default function ProgressTracker ({
    docName,
    boardId,
    contextManager,
    boardType,
    containerId
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    const studentOnBoardSktipt = contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS;
    const adminPreview = contextManager.adminPreview;
    const student = contextManager.userRole === USER_ROLES.STUDENT;
    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.PROGRESS_TRACKER);
    }, []);
    const dataList = useSelector((state) => selectTodoList(state, docName));
    const label = useSelector((state) => selectLabels(state, boardId));
    useEffect(() => {
        const componentLabel = label.find(item => item.componentId === containerId).description;
        dispatch(addProgressTrackerItem(boardId, containerId, calculatePercentageCompleted(dataList), componentLabel));
    }, [calculatePercentageCompleted(dataList)]);

    const [dirtyTexts, setDirtyTexts] = useState({});

    const switchChecked = (value, idx) => {
        dispatch(setChecked(docName, idx, !value.checked));
    };

    const changeText = (value, text) => {
        const newDirtyTexts = {
            ...dirtyTexts,
            [value.id]: text
        };

        setDirtyTexts(newDirtyTexts);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
    };

    const commitText = (value, idx, text = '') => {
        if (dirtyTexts[value.id]) {
            const newDirtyTexts = {
                ...dirtyTexts
            };
            delete newDirtyTexts[value.id];
            setDirtyTexts(newDirtyTexts);
        }
        dispatch(editText(docName, idx, text));
    };

    const removeListItem = (value, idx) => {
        dispatch(removeItem(docName, value.id, idx));
    };

    const addListItem = () => {
        dispatch(addItem(docName, dataList.length - 1));
    };

    const childItemChangeText = (value, text) => {
        const newDirtyTexts = {
            ...dirtyTexts,
            [value.id]: text
        };

        setDirtyTexts(newDirtyTexts);
    };

    const childItemChecked = (value) => {
        dispatch(setChildItemChecked(docName, value.id, !value.checked));
    };

    const childItemCommitText = (value, text) => {
        if (dirtyTexts[value.id]) {
            const newDirtyTexts = {
                ...dirtyTexts
            };
            delete newDirtyTexts[value.id];
            setDirtyTexts(newDirtyTexts);
        }
        dispatch(editChildItemText(docName, value.id, text));
    };

    const childItemRemoveListItem = (value) => {
        // delete function with value.id
        dispatch(removeChildItem(docName, value.id, value.parentId));
    };

    const childItemAdd = (parentId) => {
        dispatch(addChildItem(docName, parentId));
    };

    const checkChildrenStatus = (value) => {
        if (value.nestedItems.length === 0) {
            return false;
        } else {
            const checkedValue = !(value.nestedItems.find(item => item.checked === false));
            if (checkedValue && value.parentId) {
                if (value.checked !== checkedValue) {
                    childItemChecked(value);
                }
            } else if (checkedValue && !value.parentId) {
                if (value.checked !== checkedValue) {
                    const idx = dataList.findIndex(item => item.id === value.id);
                    switchChecked(value, idx);
                }
            } else {
                if (value.parentId && value.checked === true) {
                    childItemChecked(value);
                } else if (!value.parentId && value.checked === true) {
                    const idx = dataList.findIndex(item => item.id === value.id);
                    switchChecked(value, idx);
                }
            }
            return true;
        }
    };

    function calculatePercentageCompleted (dataList) {
        // Calculate the percentage for a single task or subtask, recursively
        function calculateTaskPercentage (task) {
            if (!task.nestedItems || task.nestedItems.length === 0) {
                return task.checked ? 100 : 0;
            }
            const totalSubtasks = task.nestedItems.length;
            const completedSubtasks = task.nestedItems.reduce((total, subtask) => {
                const subtaskPercentage = calculateTaskPercentage(subtask);
                return total + (subtaskPercentage / totalSubtasks);
            }, 0);
            return completedSubtasks;
        }
        const totalTasks = dataList.length;
        const totalPercentage = dataList.reduce((total, task) => {
            const taskPercentage = calculateTaskPercentage(task);
            return total + (taskPercentage / totalTasks);
        }, 0);
        return totalPercentage;
    }
    // const overallPercentage = calculatePercentageCompleted(dataList);
    // console.log('Overall percentage of completed tasks: ', overallPercentage);
    const err = useSelector((state) => selectPersonalDataError(state, docName));
    if (err) {
        showBoundary(err);
    }
    const renderNestedItems = (nestedItems, parentIndex) => {
        if (!nestedItems) return null;
        return nestedItems.map((nestedValue, nestedIdx) => (
            <React.Fragment key={nestedValue.id} >
                <ListItem key={nestedValue.id} role={undefined} dense>
                    <ListItemIcon>
                        <Checkbox
                            inputProps={{ 'data-testid': 'todoCheckboxInput' }}
                            edge="start"
                            checked={nestedValue.checked}
                            disabled = {checkChildrenStatus(nestedValue)}
                            tabIndex={-1}
                            onClick={(e) => {
                                if (!studentOnBoardSktipt && !adminPreview) {
                                    try {
                                        childItemChecked(nestedValue);
                                    } catch (err) {
                                        showBoundary(err);
                                    }
                                }
                            }}
                        />
                    </ListItemIcon>
                    <TextField
                        data-testid="todoTextField"
                        id={'outlined-basic'}
                        variant="outlined"
                        style={{
                            width: '100%',
                            backgroundColor: dirtyTexts[nestedValue.id]
                                ? 'rgb(255, 102, 102)'
                                : 'transparent'
                        }}
                        inputProps={{ readOnly: studentOnBoardSktipt || adminPreview || student }}
                        value={
                            dirtyTexts[nestedValue.id] !== undefined
                                ? dirtyTexts[nestedValue.id]
                                : nestedValue.text !== undefined
                                    ? nestedValue.text
                                    : ''
                        }
                        onChange={(e) => { try { childItemChangeText(nestedValue, e.target.value); } catch (err) { showBoundary(err); } }}
                        onKeyDown={(e) => {
                            try {
                                e.key === 'Enter' &&
                                dirtyTexts[nestedValue.id] &&
                                commitText(nestedValue, parentIndex, e.target.value);
                            } catch (err) {
                                showBoundary(err);
                            }
                        }}
                        onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }}
                        onBlur={(e) => { try { dirtyTexts[nestedValue.id] && childItemCommitText(nestedValue, e.target.value); } catch (err) { showBoundary(err); } }}
                    />
                    <ListItemIcon>
                        <IconButton
                            data-testid="buttonRemove"
                            edge="end"
                            disabled={studentOnBoardSktipt || adminPreview || student}
                            onClick={() => { try { childItemRemoveListItem(nestedValue); } catch (err) { showBoundary(err); } }}
                            size="large"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </ListItemIcon>
                    <ListItemIcon>
                        <IconButton
                            data-testid="buttonAdd"
                            disabled={studentOnBoardSktipt || adminPreview || student}
                            onClick={() => { try { childItemAdd(nestedValue.id); } catch (err) { showBoundary(err); } }}
                            size="large"
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </ListItemIcon>
                </ListItem>
                <Box sx = {{ marginLeft: '10%' }}>{renderNestedItems(nestedValue.nestedItems, nestedIdx)}</Box>
            </React.Fragment>
        ));
    };
    return (
        <List data-testid="ToDo Liste" style={{ height: '100%', width: '100%' }}>
            {dataList.map((value, idx) => (
                <React.Fragment key={value.id}>
                    <ListItem key={value.id} role={undefined} dense>
                        <ListItemIcon>
                            <Checkbox
                                inputProps={{ 'data-testid': 'todoCheckboxInput' }}
                                edge="start"
                                checked={value.checked}
                                disabled = {checkChildrenStatus(value)}
                                tabIndex={-1}
                                onClick={(e) => {
                                    if (!studentOnBoardSktipt && !adminPreview) {
                                        try {
                                            switchChecked(value, idx);
                                        } catch (err) {
                                            showBoundary(err);
                                        }
                                    }
                                }}
                            />
                        </ListItemIcon>
                        <TextField
                            data-testid="todoTextField"
                            id={'outlined-basic'}
                            variant="outlined"
                            style={{
                                width: '100%',
                                backgroundColor: dirtyTexts[value.id]
                                    ? 'rgb(255, 102, 102)'
                                    : 'transparent'
                            }}
                            inputProps={{ readOnly: studentOnBoardSktipt || adminPreview || student }}
                            value={
                                dirtyTexts[value.id] !== undefined
                                    ? dirtyTexts[value.id]
                                    : value.text !== undefined
                                        ? value.text
                                        : ''
                            }
                            onChange={(e) => changeText(value, e.target.value)}
                            onKeyDown={(e) => {
                                try {
                                    e.key === 'Enter' &&
                                    dirtyTexts[value.id] &&
                                    commitText(value, idx, e.target.value);
                                } catch (err) {
                                    showBoundary(err);
                                }
                            }}
                            onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }}
                            onBlur={(e) => { try { dirtyTexts[value.id] && commitText(value, idx, e.target.value); } catch (err) { showBoundary(err); } } }
                        />
                        <ListItemIcon>
                            <IconButton
                                data-testid="buttonRemove"
                                edge="end"
                                disabled={studentOnBoardSktipt || adminPreview || student}
                                onClick={(e) => { try { removeListItem(value, idx); } catch (err) { showBoundary(err); } }}
                                size="large"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemIcon>
                        <ListItemIcon>
                            <IconButton
                                data-testid="buttonAdd"
                                disabled={studentOnBoardSktipt || adminPreview || student}
                                onClick={(e) => { try { childItemAdd(value.id); } catch (err) { showBoundary(err); } }}
                                size="large"
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
                    <Box sx = {{ marginLeft: '10%' }}>{renderNestedItems(value.nestedItems, idx)}</Box>
                </React.Fragment>
            ))}
            <ListItem
                key={dataList.length}
                role={undefined}
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                <ListItemIcon>
                    <IconButton
                        data-testid="buttonAdd"
                        disabled={studentOnBoardSktipt || adminPreview || student}
                        onClick={(e) => { try { addListItem(); } catch (err) { showBoundary(err); } }}
                        size="large"
                    >
                        <AddCircleIcon />
                    </IconButton>
                </ListItemIcon>
            </ListItem>
        </List>
    );
}
