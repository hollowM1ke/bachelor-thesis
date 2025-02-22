import { useKeycloak } from '@react-keycloak/web';
import { React, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const PrivateRoute = ({ TabbedBoardPage }) => {
    const { keycloak, initialized } = useKeycloak();
    const [showHelper, setShowHelper] = useState(false);// Why not everytime true ???
    const params = useParams();
    useEffect(() => {
        setTimeout(() => setShowHelper(true), 1000); // Why delay?
    }, []);

    const isLoggedIn = keycloak.authenticated;
    if (isLoggedIn && params.loginMethod === 'keycloak') {
        console.log('PrivateRoute: isLoggedIn', isLoggedIn, initialized);
        return <TabbedBoardPage loginWithKeyCloak={true}/>;
    } else if (params.loginMethod === 'oldstatic') {
        return <TabbedBoardPage loginWithKeyCloak={false}/>;
    } else if (showHelper) {
        return (<p>Please sign in on <a href='/'>the main page</a>.</p>);
    } else {
        return null;
    }
};

export default PrivateRoute;
