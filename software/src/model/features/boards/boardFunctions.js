export const decodePosition = function (position) {
    const positions = position.split('-');
    return {
        x: Number(positions[0]),
        y: Number(positions[1])
    };
};

export const encodePosition = function (position) {
    const { x, y } = position;
    return `${x}-${y}`;
};

export const encodeComponentInfo = function (componentInfo) {
    return JSON.stringify(componentInfo); // TODO: compress if needed
};

export const decodeComponentInfo = function (componentInfo) {
    return JSON.parse(componentInfo);
};

export const encodeConnection = function (from, to) {
    return `${from}/${to}`;
};

export const decodeConnection = function (connections) {
    const parts = connections.split('/');
    return {
        from: parts[0],
        to: parts[1]
    };
};
