export const PREVIEW_CONTAINER_STYLE = {
    // ESLint ignores because duplicate keys. However, browsers will ignore unknown values
    height: '-moz-available', // eslint-disable-line no-dupe-keys
    height: '-webkit-fill-available', // eslint-disable-line no-dupe-keys
    width: '100%',
    margin: 0,
    padding: 0,
    position: 'absolute',
    overflow: 'auto'
};

export const PREVIEW_FULLVIEW_CONTAINER_STYLE = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        maxHeight: '50%',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

export const ACTION_BUTTON_STYLE = {
    margin: 'auto 5px',
    float: 'right'
};
