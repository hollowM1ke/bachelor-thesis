import JSEncrypt from 'jsencrypt';
export function generateAPILinkConcentration ({ type = 'concentration', imageid, date, name }) {
    // Define the data to encrypt
    const data = 'name=' + name + '&date=' + date + '&imageid=' + imageid;

    // Encrypt the data with the public key
    const encrypt = new JSEncrypt();
    if (process.env.REACT_APP_API_PH_CONCENTRATION_PUBLIC_KEY === 'undefined') {
        throw new Error('This API is not supported in this version');
    }
    encrypt.setPublicKey(process.env.REACT_APP_API_PH_CONCENTRATION_PUBLIC_KEY);
    const encrypted = encrypt.encrypt(data);

    return 'https://api.fd.bio.uni-kl.de/' + type + '/?' + encrypted;
}
// ph
export function getApiOptionsBiologie () {
    if (process.env.REACT_APP_API_PH_CONCENTRATION_TOKEN === 'undefined') {
        throw new Error('This API is not supported in this version');
    }
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Token: process.env.REACT_APP_API_PH_CONCENTRATION_TOKEN
        }
    };
    return options;
}
export function redirectLinkBio (userName, type = 'concentration') {
    if (type === 'concentration') {
        return process.env.REACT_APP_API_MS_CONCENTRATION_URL + userName;
    } else if (type === 'pH') {
        return process.env.REACT_APP_API_MS_PH_URL + userName;
    }
}
