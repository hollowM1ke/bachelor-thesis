import { createTheme } from '@mui/material/styles';

// Taken from https://github.com/mui/material-ui/issues/15618#issuecomment-1062138287
function container () {
    // Use the fullscreen element if in fullscreen mode, otherwise just the document's body
    return document.fullscreenElement ?? document.body;
}

export const appTheme = createTheme({
    components: {
        // Adjust the default containers for modals/popover/tooltips so they work in full-screen mode
        MuiMenu: {
            defaultProps: {
                container
            }
        },
        MuiTooltip: {
            defaultProps: {
                PopperProps: {
                    container
                }
            }
        },
        MuiModal: {
            defaultProps: {
                container
            }
        },
        MuiPopover: {
            defaultProps: {
                container
            }
        },
        MuiToolbar: {
            variants: [
                {
                    props: { variant: 'connected' },
                    style: {
                        backgroundColor: '#004A96',
                        color: '#fff'
                    }
                },
                {
                    props: { variant: 'disconnected' },
                    style: {
                        backgroundColor: '#00793A',
                        color: '#fff'
                    }
                }
            ]
        }
    },
    status: {
        danger: '#e53e3e'
    },
    palette: {
        primary: {
            main: '#004A96',
            // main: '#00793A', Grün
            light: '#edf8fc',
            contrastText: '#fff'
        },
        secondary: {
            main: '#21A0D2',
            contrastText: '#fff'
        },
        error: {
            main: '#f44336'
        },
        info: {
            main: '#2196f3'
        },
        success: {
            main: '#4caf50'
        },
        neutral: {
            main: '#5c6ac4'
        },
        connected: {
            main: '#004A96',
            contrastText: '#fff'
        },
        disconnected: {
            main: '#00793A',
            contrastText: '#fff'
        }
    }
});
