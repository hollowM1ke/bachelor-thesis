import { useEffect } from 'react';
import packageJson from '../../../package.json';
import { useKeycloak } from '@react-keycloak/web';

const LoginKeycloak = () => {
    const { keycloak } = useKeycloak();

    useEffect(() => {
        keycloak.login({ onLoad: 'login-required', redirectUri: new URL(`${process.env.REACT_APP_HOMEPAGE}/keycloak/board`, document.baseURI) });
    }, []);

    return null;
};

export default LoginKeycloak;
