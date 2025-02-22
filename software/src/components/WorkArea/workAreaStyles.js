export const WORK_AREA_STYLE = {
    height: '100%',
    width: '100%',
    overflow: 'auto',
    touchAction: 'none'
};

export const WORK_AREA_DISABLED_STYLE = {
    filter: 'brightness(0.6)',
    cursor: 'not-allowed',
    backgroundColor: 'white'
};

export const CONTAINER_STYLE = {
    height: '100%',
    width: '100%',
    overflow: 'auto',
    cursor: 'default',
    // Disable user selection so text does not get highlighted
    userSelect: 'none'
};

export const MOUSE_BOX_STYLE = {
    backgroundColor: 'blue',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    position: 'relative'
};

export const NAME_DISPLAY_STYLE = {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: 'red',
    borderRadius: '10px',
    paddingRight: '1%',
    paddingLeft: '1%'
};

export function getContainerStyle (withCursor, cursor) {
    const style = {
        ...CONTAINER_STYLE
    };

    if (withCursor) {
        style.cursor = 'cell';
    }

    return style;
}

export const ADD_ITEM_POINTER_STYLE = 'crosshair';
