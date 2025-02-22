
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import somethingWentWrong from '../../assets/images/ErrorBoundaries/something_went_wrong.png';
import { ERROR_BOUNDARY_CONTAINER_STYLE } from './errorBoundaryStyles';
import packageJson from '../../../package.json';
// eslint-disable-next-line node/handle-callback-err
export function ErrorToolComponent ({ error, resetErrorBoundary }) {
    return (
        <div>
            <p>Die Komponente kann wegen eines Fehlers nicht geladen werden.</p>
            <button onClick={(e) => resetErrorBoundary(e) } > Noch einmal versuchen!</button>
        </div>
    );
}

export function ErrorWorkboard ({ _error, resetBoundary }) {
    return (
        <div>
            <p>Das Board kann wegen eines Fehlers nicht geladen werden.</p>
            <button onClick={resetBoundary}>Noch einmal versuchen!</button>
        </div>
    );
}
const reloadLoginPage = (event) => {
    window.location.href = `${process.env.REACT_APP_URL}${process.env.REACT_APP_HOMEPAGE}/`;
};
export function ErrorApplication ({ _error, resetBoundary }) {
    return (
        <div style={ERROR_BOUNDARY_CONTAINER_STYLE}>
            <img src={somethingWentWrong} alt="Oops Error Image!" />
            <br/>
            <Button onClick={() => reloadLoginPage()} size='small' variant='contained' color='primary' aria-label='small contained primary button'>TRY AGAIN</Button>
        </div>
    );
}

export const logError = (error, info) => {
    console.error('Caught an error:', error, info);
};
