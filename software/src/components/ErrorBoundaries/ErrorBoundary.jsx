import React from 'react';
import { Button } from '@mui/material';
import somethingWentWrong from '../../assets/images/ErrorBoundaries/something_went_wrong.png';
import { ERROR_BOUNDARY_CONTAINER_STYLE } from './errorBoundaryStyles';
import packageJson from '../../../package.json';

class ErrorBoundary extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            hasError: false, // State variable to track if any JS error has been detected throughout the application and loads the fallback UI if true
            errorDetails: { // State variable to record all the error information which could be logged and most relevant information could be displayed to the user on the fallback UI
                errorInformation: '' // Stores error information thrown
            }
        };
    }

    static getDerivedStateFromError (error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorDetails: { errorInformation: error } };
    }

    reloadLoginPage (event) {
        window.location.href = `${process.env.REACT_APP_URL}${process.env.REACT_APP_HOMEPAGE}/`;
    }

    componentDidCatch (error, errorInfo) {
        // ToDo: Update DB with the state object errorDetails, for error logging and easy traceback of issue reason, when in production
        console.log(`Error: ${error}, ErrorInfo: ${errorInfo}`);
    }

    render () {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={ERROR_BOUNDARY_CONTAINER_STYLE}>
                    <img src={somethingWentWrong} alt="Oops Error Image!" />
                    <br/>
                    <Button onClick={() => this.reloadLoginPage()} size='small' variant='contained' color='primary' aria-label='small contained primary button'>TRY AGAIN</Button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
