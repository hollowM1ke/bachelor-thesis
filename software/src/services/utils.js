export function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generic function to check if the logged in device is a mobile/tablet.
 *  If a more suitable logic is found in future development cycles, this function can be updated with ideally no break in existing functionality.
*/
export function isMobileDevice () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

/**
 * Returns a flag indicating if the application is supported on the browser user has logged in from.
 */
export const isSupportedBrowser = () => {
    // only chrome browser supported at the moment
    return (navigator.userAgent.toLowerCase().indexOf('chrome') > -1);
};
/**
 * Return the Index of the file type in the array of accepted file types or -1 if not found
 * @param input file
 * @param {*} fileTypes array of accepted file types
 * @returns {number} index of the file type in the array of accepted file types or -1 if not found
 */
export function checkFileTypes (input, fileTypes) {
    if (input) {
        const extension = input.name.split('.').pop().toLowerCase(); // file extension from input file
        const fileTypeIndex = fileTypes.indexOf(extension); // is extension in acceptable types
        return fileTypeIndex;
    }
}

/**
 * Format a number to show n decimal places only
 * @param num The number to format
 * @param n Number of decimal places
 */
export function nDecimalPlaces (num, n) {
    return (Math.round(num * 100) / 100).toFixed(n);
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * @param num The number to clamp
 * @param min The lower boundary of the output range
 * @param max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
export function clamp (num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export const resizeToAspectRatio = (area, aspectRatio) => {
    const width = Math.round(Math.sqrt(area * aspectRatio));
    const height = Math.round(Math.sqrt(area / aspectRatio));
    return { width, height };
};

export const getImageMetaData = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

/**
 * Returns the maximum value of a number from an array of strings.
 */
export const getMaxNumericArrayValue = (input) => {
    if (input.length) {
        return Math.max.apply(null, sanitize(input));
    }
};
// Exclude text from the array and convert to numStrings to number
const sanitize = (input) => {
    return input.filter(i => {
        if (i === '' || i === null) {
            return false;
        }
        return !isNaN(i);
    }).map(i => Number(i));
};
