import React from 'react';
import { WORK_COMP_ERROR_BOUNDARY_STYLE } from './WorkCompErrorStyle';
// THIS IS UNUSED AND PROBABLY UNNECESSARY
class WorkCompErrorBoundaries extends React.Component {
    constructor (props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError () {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch (error, info) {
        console.error('Caught an error:', error, info);
    };

    resetErrorBoundary = () => {
        this.setState({ hasError: false });
    };

    render () {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback(resetErrorBoundary);
        }

        return this.props.children;
    }
}

export default WorkCompErrorBoundaries;
