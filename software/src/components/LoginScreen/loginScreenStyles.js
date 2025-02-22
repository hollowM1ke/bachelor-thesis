import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
    loginButton: {
        marginTop: 20,
        marginBottom: 2
    },
    loginIcon: {
        margin: 1,
        backgroundColor: theme.palette.secondary.main
    },
    loginScreen: {
        height: '95dvh',
        overflow: 'auto !important'
    },
    loginForm: {
        margin: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    loginInputsContainer: {
        marginTop: 1
    },
    loginScreenImage: {
        backgroundImage: `url(${'https://dynamicassets.basf.com/is/image/basf/2-DJI_0457-HDR-Pano_1_LA:16x9?fmt=webp&fit=crop%2C1&wid=1280&hei=720'})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    or: {
        display: 'block',
        width: '100%',
        height: '1px',
        borderBottom: '1px solid #dee3e4',
        position: 'relative',
        margin: '20px 0',
        marginBottom: '0',
        '&::before': {
            content: '"OR"',
            width: '40px',
            height: '18px',
            position: 'absolute',
            top: '-5px',
            right: 'calc(50% - 20px)',
            backgroundColor: '#fff',
            textAlign: 'center',
            lineHeight: '10px',
            color: '#555'
        }
    }
}));
