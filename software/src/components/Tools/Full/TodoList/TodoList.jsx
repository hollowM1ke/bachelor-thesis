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
    editText,
    removeItem,
    addItem,
    selectTodoList,
    selectTodoListError,
    setChecked
} from '../../../../model/features/todolists/todolistsSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import { useSelector, useDispatch } from 'react-redux';
import { USER_ROLES } from '../../../users/users';
import { BOARD_TYPES } from '../../../Board/boardConfig';
import { useErrorBoundary } from 'react-error-boundary';

export default function TodoList ({
    docName,
    boardId,
    contextManager,
    boardType
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();

    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.TODO_LIST);
    }, []);

    const dataList = useSelector((state) => selectTodoList(state, docName));
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

    const studentOnBoardSktipt = contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS;
    const adminPreview = contextManager.adminPreview;

    const err = useSelector((state) => selectTodoListError(state, docName));
    if (err) {
        showBoundary(err);
    }

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
                                tabIndex={-1}
                                onClick={(e) => {
                                    if (!studentOnBoardSktipt && !adminPreview) {
                                        try {
                                            switchChecked(value, idx);
                                        } catch (err) {
                                            showBoundary(err);
                                        }
                                    }
                                } }
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
                            inputProps={{ readOnly: studentOnBoardSktipt || adminPreview }}
                            value={
                                dirtyTexts[value.id] !== undefined
                                    ? dirtyTexts[value.id]
                                    : value.text !== undefined
                                        ? value.text
                                        : ''
                            }
                            onChange={(e) => {
                                try {
                                    changeText(value, e.target.value);
                                } catch (err) {
                                    showBoundary(err);
                                }
                            }}
                            onKeyDown={(e) => {
                                try {
                                    e.key === 'Enter' && dirtyTexts[value.id] && commitText(value, idx, e.target.value);
                                } catch (err) {
                                    showBoundary(err);
                                }
                            }}
                            onDoubleClick={(e) => {
                                try {
                                    handleDoubleClick();
                                } catch (err) {
                                    showBoundary(err);
                                }
                            }}
                            onBlur={(e) => {
                                try {
                                    dirtyTexts[value.id] && commitText(value, idx, e.target.value);
                                } catch (err) {
                                    showBoundary(err);
                                }
                            }}
                        />
                        <ListItemIcon>
                            <IconButton
                                data-testid="buttonRemove"
                                edge="end"
                                disabled={studentOnBoardSktipt || adminPreview}
                                onClick={(e) => {
                                    try {
                                        removeListItem(value, idx);
                                    } catch (err) {
                                        showBoundary(err);
                                    }
                                } }
                                size="large"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
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
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => {
                            try {
                                addListItem();
                            } catch (err) {
                                showBoundary(err);
                            }
                        }}
                        size="large"
                    >
                        <AddCircleIcon />
                    </IconButton>
                </ListItemIcon>
            </ListItem>
        </List>
    );
}
