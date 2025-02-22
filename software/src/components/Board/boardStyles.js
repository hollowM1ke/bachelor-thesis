import makeStyles from '@mui/styles/makeStyles';

const drawerWidth = '8%';
export const useStyles = makeStyles((theme) => ({
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    menuButton: {
        marginRight: theme.spacing(2)
    },
    hide: {
        display: 'none'
    },
    drawer: {
        // width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        // width: drawerWidth
        width: 'min-content'
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end'
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        marginLeft: -drawerWidth
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0
    },
    resizer: {
        backgroundColor: '#cbd5e0',
        cursor: 'ew-resize',
        height: '100%',
        width: '4px',
        padding: '0px'
    },
    navBarSvgIcons: {
        verticalAlign: 'middle',
        fill: 'white',
        stroke: 'white'
    },
    success: {
        color: theme.palette.success.main
    },
    error: {
        color: theme.palette.error.main
    },
    tabActiveconnected: {
        // border: '1px solid white !important',
        color: '#fff',
        backgroundColor: '#00397d'
    },
    tabActivedisconnected: {
        // border: '1px solid white !important',
        color: '#fff',
        backgroundColor: '#00662c'
    },
    tabStyle: {
        color: '#fff'
    }
}));

export const PREVIEW_BOARD_STYLE = {
    width: 2000,
    height: 1000,
    border: '1px solid black',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

export const BOARD_WORK_AREA_STYLE = {
    // flexGrow: '25',
    // border: '1px dotted black',
    flexGrow: '1',
    height: '100%',
    width: '100%'
};

export const BOARD_MODAL_STYLE = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        height: '80%',
        width: '60%',
        overflow: 'scroll'
    }
};

export const BOARD_LABEL_STYLE = {
    textAlign: 'center',
    fontSize: '20px',
    '&:hover': {
        cursor: 'pointer'
    }
};

export const BOARD_IMAGE_STYLE = {
    height: '20px',
    verticalAlign: 'middle',
    margin: '2px'
};
