export const USER_ROLES = {
    STUDENT: 's',
    ADMIN: 'a'
};

export const getRole = (id) => {
    const roleChar = id.charAt(0);
    return Object.entries(USER_ROLES).filter(([key, val]) => val === roleChar)[0][1]; // unbox result then get value
};
