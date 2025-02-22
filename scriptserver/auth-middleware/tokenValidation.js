const jwt = require('jsonwebtoken');

const publicKey = process.env.KEYCLOAK_PUBLIC_KEY.replace(/\\n/g, '\n');

function validateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        return res.status(401).send('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).send('Token missing');
    }

    jwt.verify(token, publicKey, {
        // audience: process.env.KEYCLOAK_CLIENT_ID,
        issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
        algorithms: ['RS256'],
    }, (err, decoded) => {
        if(err) {
            console.error('Token validation error:', err);
            return res.status(401).send('Invalid token');
        }
        req.tokenInfo = decoded;
        next();
    });
}

module.exports = validateToken;
