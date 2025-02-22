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

export const HTML_INPUT_CONTAINER_STYLE = {
    marginTop: '10px',
    flex: 1,
    height: '100%'
};

export const HTML_INPUT_CONTROL_CONTAINER_STYLE = {
    paddingLeft: '5px',
    paddingRight: '5px',
    height: '100%',
    maxHeight: '650px'
};

export const HTML_PREVIEW_CONTAINER_STYLE = {
    paddingLeft: '5px',
    paddingRight: '5px',
    border: '1px solid black',
    height: '100%',
    maxHeight: '675px',
    overflow: 'auto',
    // wordWrap: 'break-word',
    wordBreak: 'break-word'
};

export const EMPTY_HTML_PREVIEW_STYLE = {
    padding: '0px',
    backgroundColor: 'rgb(128 128 128 / 67%)',
    height: '100%'
};

export const HTML_INPUT_STYLE = {
    width: '100%',
    height: '100%'
};

export const HTML_INPUT_LABEL_STYLE = {
    fontWeight: 'bold',
    fontSize: 'medium'
};

export const HTML_EDIT_MODAL_PREVIEW_STYLE = {
    border: '1px solid rgba(128, 128, 128, 0.67)',
    maxHeight: '300px',
    maxWidth: '100%',
    overflow: 'auto'
};
