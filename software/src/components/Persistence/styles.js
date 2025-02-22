import makeStyles from '@mui/styles/makeStyles';
export const SI_MODAL_STYLE = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

export const SI_CONTAINER_STYLE = {
    textAlign: 'center'
};

export const ACTION_BUTTON_STYLE = {
    margin: 'auto 5px',
    float: 'right'
};

export const MIDDLE_ROW_CONTAINER_STYLE = {
    margin: '20px auto'
};

export const useToolboxStyles = makeStyles((theme) => ({
    root: {
        width: '100%'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary
    },
    list: {
        width: '100%'
    }
}));
