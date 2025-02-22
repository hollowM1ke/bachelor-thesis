import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './model/app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { appTheme } from './theme';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import ScreenRotationTwoToneIcon from '@mui/icons-material/ScreenRotationTwoTone';
import { Grid } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

ReactDOM.render(
    <React.Fragment>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={appTheme}>
                <div id='container'>
                    <Provider store={store}>
                        <DndProvider options={HTML5toTouch}>
                            <App />
                        </DndProvider>
                        <ToastContainer />
                    </Provider>
                </div>
                <div id='turn' >
                    <Grid direction="column" style={{ userSelect: 'none' }} alignItems="center" justify="center" sx={{
                        bgcolor: '#004A96',
                        minHeight: '100vh'
                    }} justifyContent="center" container >
                        <Card elevation={24} sx={{ m: 2, textAlign: 'center' }}>
                            <CardContent>
                                <ScreenRotationTwoToneIcon fontSize="large" aria-label="rotate"/>
                                <Typography variant="h5" color="text.secondary" gutterBottom>
                                    Rotate your device
                                </Typography>
                                <Divider />
                                <Typography sx={{ mt: 2, textAlign: 'center' }} fontSize="medium">
                        Use this app in landscape mode.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    </React.Fragment>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
