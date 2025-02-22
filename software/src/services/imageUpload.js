import getValidAccessToken from './authUtils';

const UPLOAD_LOCATION = process.env.REACT_APP_UPLOAD_LOCATION;

export async function uploadImageFile (image) {
    console.trace('In UploadImageFile path = ' + UPLOAD_LOCATION);
    const data = new FormData();
    data.append('image', image);
    const token = await getValidAccessToken();
    const requestOptions = {
        method: 'POST',
        body: data,
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    try {
        const response = await fetch(UPLOAD_LOCATION, requestOptions);
        return response;
    } catch (error) {
        console.log('Forbidden you do not have permission.');
    }
}
export async function getImage (imagePath) {
    const token = await getValidAccessToken();
    const url = `${UPLOAD_LOCATION}/${imagePath}`;
    const requestOptions = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error('Image fetch failed');
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.log('GET request failed');
    }
}
/**
 * Converts a data URL to a blob.
 * @see {@link https://stackoverflow.com/questions/12168909/blob-from-dataurl}
 * @param dataURI The data url to use
 * @returns file blob
 */
export function dataURItoBlob (dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = Buffer.from(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString[i];
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString });
    return blob;
}
