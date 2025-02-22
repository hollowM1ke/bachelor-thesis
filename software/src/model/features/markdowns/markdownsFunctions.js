export function decodeMarkdownTextObject (textVal) {
    return JSON.parse(textVal);
};

export function encodeMarkdownTextObject (textObject) {
    return JSON.stringify(textObject);
};
