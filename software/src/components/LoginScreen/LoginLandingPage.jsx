import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Avatar,
    Button,
    CssBaseline,
    Paper,
    Box,
    Grid,
    Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { isSupportedBrowser } from './../../services/utils';
import { useStyles } from './loginScreenStyles';
import logo from './../../assets/images/logoBASF/BASFLogo-TIF(RGB)/linkBASF.svg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function LoginLandingPage () {
    const styleClasses = useStyles();
    const location = useLocation();
    useEffect(() => {
        if (!isSupportedBrowser()) {
            // update for ipad
            toast.warn('Hinweis: Dies ist kein unterstützter Browser. Bitte verwende einen chromium basierierten Browser (z.B.: Chrome)!');
        }
    }, [location]);
    return (
        <React.Fragment>
            <AppBar position='sticky'>
                <Toolbar>
                    <nav className='navbar is-link' role='navigation' aria-label='main navigation' id='navbarTop'>
                        <div className='navbar-menu'>
                            <div className='navbar-start'>
                                <label className='navbar-item'>
                                    Teens’ Labbook
                                </label>
                            </div>
                        </div>
                    </nav>

                    <img style={{ marginLeft: 'auto' }} src={logo} alt='' height='60' />
                </Toolbar>
            </AppBar>

            <Grid container component='main' className={styleClasses.loginScreen}>
                <CssBaseline />
                <Grid item xs={false} sm={4} md={7} className={styleClasses.loginScreenImage} />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box className={styleClasses.loginForm}>
                        <Avatar className={styleClasses.loginIcon}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component='h1' variant='h5'>
                            Login Options
                        </Typography>

                        <br />
                        <br />
                        {process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production'
                            ? <Link to={location.pathname.endsWith('/') ? location.pathname + 'oldstatic' : location.pathname + '/oldstatic'}>
                                <Button
                                    type='submit'
                                    fullWidth
                                    variant='contained'
                                    className={styleClasses.loginButton}
                                    color='primary'
                                // disabled={!(formValues.userName && formValues.password && formValues.loginType)}
                                >
                                LOGIN WITH USERNAME AND PASSWORD
                                </Button>
                            </Link>
                            : null}
                        <div className={styleClasses.or}></div>
                        <Link to={location.pathname.endsWith('/') ? location.pathname + 'keycloak' : location.pathname + '/keycloak'}>
                            <Button
                                type='submit'
                                fullWidth
                                variant='contained'
                                className={styleClasses.loginButton}
                                color='primary'
                            >
                                Login with Keycloak
                            </Button>
                        </Link>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default LoginLandingPage;
