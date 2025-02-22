const accessControlMatrix = require('./accessControlMatrix');


const hasPermission = (resource, action) => {
    return (req, res, next) => {
        const decodedToken = req.tokenInfo;
        const realmRoles = decodedToken.realm_access.roles;
        const role = realmRoles.includes('teacher') ? 'teacher' : 'student';

        const permissions = accessControlMatrix[role];

        if (!permissions[resource].includes(action)) {
            res.status(403).send('Forbidden: You do not have permission to perform this action');
        }
        next();
    }
}
module.exports = hasPermission;