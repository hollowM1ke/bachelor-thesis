import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Paper,
    Box,
    Grid,
    Typography,
    FormLabel,
    RadioGroup,
    Radio
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useStyles } from './loginScreenStyles';
import logo from './../../assets/images/logoBASF/BASFLogo-TIF(RGB)/linkBASF.svg';
import md5 from 'crypto-js/md5';
import packageJson from '../../../package.json';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useErrorBoundary } from 'react-error-boundary';

export default function LoginScreen () {
    const { showBoundary } = useErrorBoundary();
    const styleClasses = useStyles();
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({ userName: undefined, password: '', loginType: 's', remember: false });

    // The useEffect will be triggered whenever the react router value is updated.
    // Necessary even though the component will load on routing back again in the event of caching a page, and ensure the warning message is loaded
    const handleFormValueChange = (formKey, newValue) => {
        const tempFormValueState = { ...formValues };
        tempFormValueState[formKey] = newValue;
        setFormValues(tempFormValueState);
    };

    useEffect(() => {
        if (window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)) {
            navigate(`${process.env.REACT_APP_HOMEPAGE}/oldstatic/board/?id=${window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)}`);
        }

        /*
        if (window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)) {
            navigate(`${process.env.REACT_APP_HOMEPAGE}/oldstatic/board/?id=${window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)}`);
        }
        */

        if (window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)) {
            navigate(`${process.env.REACT_APP_HOMEPAGE}/oldstatic/board/?id=${window.sessionStorage.getItem(process.env.REACT_APP_HOMEPAGE)}`);
        }
    }, []);

    const loginHandler = (event) => {
        event.preventDefault();
        const enteredUserName = formValues.loginType + formValues.userName;
        const enteredPassword = formValues.password;
        const expectedPassword = String(md5(enteredUserName + 'LABBOOK')).substring(0, 10);
        const validUserFlag = formValues.loginType === 'a' ? enteredPassword === expectedPassword : true;

        if (validUserFlag && enteredUserName) {
            navigate(`${process.env.REACT_APP_HOMEPAGE}/oldstatic/board?id=${enteredUserName}`);
            if (formValues.remember) {
                window.sessionStorage.setItem(process.env.REACT_APP_HOMEPAGE, enteredUserName);
            }
        } else {
            toast.error('Bitte geben Sie einen gültigen Benutzernamen und ein gültiges Passwort ein. Wenden Sie sich bei Fragen an den Administrator.');
        }
    };

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
                            Einloggen
                        </Typography>
                        <Box component='form' onSubmit={loginHandler} className={styleClasses.loginInputsContainer}>
                            <TextField
                                margin='normal'
                                required
                                fullWidth
                                id='groupName'
                                label='Gruppenname'
                                name='groupName'
                                variant='outlined'
                                autoFocus
                                type='number'
                                inputMode='numeric'
                                value={formValues.userName}
                                onKeyDown={(event) => { try { ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault(); } catch (err) { showBoundary(err); } }}
                                onChange={event => { try { handleFormValueChange('userName', event.target.value); } catch (err) { showBoundary(err); } }}
                                disabled={process.env.NODE_ENV === 'production' ? 'disabled' : null}
                            />
                            {formValues.loginType === 'a'
                                ? <TextField
                                    margin='normal'
                                    required
                                    fullWidth
                                    name='password'
                                    placeholder='Anmeldecode'
                                    type='password'
                                    id='loginCode'
                                    variant='outlined'
                                    autoComplete='current-password'
                                    value={formValues.password}
                                    onChange={event => { try { handleFormValueChange('password', event.target.value); } catch (err) { showBoundary(err); } }}
                                    disabled={process.env.NODE_ENV === 'production' ? 'disabled' : null}
                                />
                                : <TextField
                                    margin='normal'
                                    // required
                                    fullWidth
                                    name='password'
                                    placeholder='Anmeldecode'
                                    type='password'
                                    id='loginCode'
                                    variant='outlined'
                                    autoComplete='current-password'
                                    value={formValues.password}
                                    onChange={event => handleFormValueChange('password', event.target.value)}
                                    disabled={process.env.NODE_ENV === 'production' ? 'disabled' : null}
                                />}

                            <br />
                            <br />
                            <FormLabel component='legend'>Anmeldetyp</FormLabel>
                            <RadioGroup row value={formValues.loginType} onChange={event => { try { handleFormValueChange('loginType', event.target.value); } catch (err) { showBoundary(err); } }} aria-label='loginType' name='customized-radios'>
                                <FormControlLabel value='s' control={<Radio />} label='Student' />
                                <FormControlLabel value='a' control={<Radio />} label='Admin' />
                            </RadioGroup>

                            <FormControlLabel
                                control={<Checkbox value={formValues.remember} onChange={event => { try { handleFormValueChange('remember', event.target.checked); } catch (err) { showBoundary(err); } }} color='primary' />}
                                label='Eingeloggt bleiben'
                            />
                            <Button
                                type='submit'
                                fullWidth
                                variant='contained'
                                className={styleClasses.loginButton}
                                color='primary'
                                // disabled={!(formValues.userName && formValues.password && formValues.loginType)}
                                disabled={!(formValues.userName && formValues.loginType)}
                            >
                                Einloggen
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
