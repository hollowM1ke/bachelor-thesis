import { BOARD_TYPES } from './boardConfig';
import { USER_ROLES } from '../users/users';

export const USAGE_MODES = {
    PAN: 'pan',
    DISPLACE: 'displace'
};

// Maintains list of usage modes, to be disabled based for a defined board, on current logged in user role.
// 'usageMode' key, points to the mode to be disabled/hidden.
// 'boardType' key, defines which board the usage mode is to be diabled for.
// 'userRoles' key, defines which user roles this usage mode is disabled for.
export const DISABLED_USAGE_MODES_CONFIG = [
    { usageMode: USAGE_MODES.DISPLACE, boardType: BOARD_TYPES.CLASS, userRoles: [USER_ROLES.STUDENT] }
];
