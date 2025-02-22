import keycloak from '../components/LoginScreen/Keycloak';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function getValidAccessToken () {
    try {
        // Ensure the token is valid and refresh it if necessary
        await keycloak.updateToken(5); // 5 seconds is a buffer period to refresh the token before it expires
        return keycloak.token;
    } catch (error) {
        console.error('Failed to refresh token', error);
        toast.error("Couldn't refresh token. Please log in again.");
        window.sessionStorage.removeItem(process.env.REACT_APP_HOMEPAGE);
        let url = new URL(`${process.env.REACT_APP_HOMEPAGE}`, document.baseURI);
        if (process.env.REACT_APP_HOMEPAGE === '' || process.env.REACT_APP_HOMEPAGE === '/') {
            url = new URL(process.env.REACT_APP_URL);
        }
        console.log('logout', url);
        keycloak.logout({ redirectUri: url.href });
    }
}
