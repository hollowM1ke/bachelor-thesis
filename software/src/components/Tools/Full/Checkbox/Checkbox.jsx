import React, { useEffect } from 'react';
import CheckboxMUI from '@mui/material/Checkbox';
import { useErrorBoundary } from 'react-error-boundary';

import {
    selectCheckbox,
    setCheckbox,
    selectCheckboxError
} from '../../../../model/features/checkboxes/checkboxesSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import { useSelector, useDispatch } from 'react-redux';

export default function Checkbox ({
    docName,
    boardId,
    contextManager
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();

    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.CHECKBOX);
    }, []);

    const checked = useSelector((state) => {
        return selectCheckbox(state, docName);
    });

    const handleChange = () => {
        dispatch(setCheckbox(docName, !checked));
    };

    const err = useSelector((state) => selectCheckboxError(state, docName));
    if (err) {
        showBoundary(err);
    }

    return (
        <CheckboxMUI
            inputProps={{ 'data-testid': 'checkboxInput' }}
            style={{
                margin: '0px',
                padding: '0px'
            }}
            checked={checked}
            color="primary"
            onClick={(e) => {
                try {
                    handleChange();
                } catch (err) {
                    showBoundary(err);
                }
            }}
        />
    );
}
