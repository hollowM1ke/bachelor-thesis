const { Server } = require('@hocuspocus/server');
const { Logger } = require('@hocuspocus/extension-logger');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const jwtVerify = promisify(jwt.verify);
require('dotenv').config();

const server = Server.configure({
    port: 1234,
    extensions: [
        new Logger(),
    ],

    async beforeHandleMessage(data) {
        if(data.context.isAuthenticated) {
            const currentTime = Math.floor(Date.now() / 1000);
            if(data.context.tokenExpiration <= currentTime) {
                console.log('Token expired');
                data.context.isAuthenticated = false;
                throw Error('Token expired');
            }
        }
    },

    async onConnect({connection}) {
        console.log('Incoming connection:');
        connection.requiresAuthentication = true;
    },

  
    async onAuthenticate(data) {
        try {
            const publicKey = process.env.KEYCLOAK_PUBLIC_KEY.replace(/\\n/g, '\n');
            const decoded_token = await jwtVerify(data.token, publicKey, {
                    issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
                    algorithms: ['RS256']
                });
            data.context.isAuthenticated = true;
            console.log('Connection authenticated');
            data.context.userRoles = decoded_token.realm_access.roles;
            data.context.tokenExpiration = decoded_token.exp;  
        } catch (error) {
            data.context.isAuthenticated = false;
            throw new Error('Could not authenticate, token is invalid!');
        }
    }
});

server.listen();