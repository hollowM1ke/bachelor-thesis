import makeStyles from '@mui/styles/makeStyles';

export const getContainerStyles = (left, top, isDragging, scale) => {
    const transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    return {
        position: 'absolute',
        transform,
        WebkitTransform: transform,
        transformOrigin: 'top left',
        margin: 0,
        padding: 0,
        opacity: isDragging ? 0.5 : 1
        // minHeight: '30%',
        // minWidth: '25%',
        // maxHeight: '40%',
        // maxWidth: '30%',
        // height: 'auto',
        // width: 'auto',
        // overflow: 'scroll',
        // zIndex: 0
    };
};

export const CARD_STYLE = {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgb(232, 232, 232)'
};

export const useStyles = (left, top, isDragging) => makeStyles({
    root: getContainerStyles(left, top, isDragging)
});

export const DEFAULT_BOX_SIZE = 200;
export const MIN_BOX_SIZE = 10;

export const CONTEXT_MENU_LABEL_STYLE = {
    textAlign: 'center',
    marginRight: '8px'
};

export const WORK_COMPONENT_HEADER_STYLE = {
    textAlign: 'text',
    paddingLeft: '1px',
    fontSize: '10px',
    borderBottom: '1px solid',
    backgroundColor: '#004A96',
    color: 'white',
    width: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};

export const ATTENTION_REQUIRED_STYLE = {
    textAlign: 'text',
    paddingLeft: '1px',
    fontSize: '10px',
    borderBottom: '1px solid',
    // backgroundColor: '#004A96',
    color: 'white',
    width: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: 'red'
};

export const RESOLVED_STYLE = {
    textAlign: 'text',
    paddingLeft: '1px',
    fontSize: '10px',
    borderBottom: '1px solid',
    backgroundColor: 'GREEN',
    color: 'white',
    width: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};
