export const encodeBoolean = function (checked) {
    return String(checked);
};

export const decodeBoolean = function (checked) {
    return checked === 'true';
};
