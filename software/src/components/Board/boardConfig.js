import { ReactComponent as GroupBoardImage } from '../../assets/images/BoardLogos/blackboard_text_nopng.svg';
import { TOOL_TYPES } from '../Tools/toolTypes';
import { USER_ROLES } from '../users/users';

import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';

import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ListAltTwoToneIcon from '@mui/icons-material/ListAltTwoTone';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckBoxTwoToneIcon from '@mui/icons-material/CheckBoxTwoTone';
import CodeIcon from '@mui/icons-material/Code';
import CommentIcon from '@mui/icons-material/Comment';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const BOARD_TYPES = {
    PERSONAL: 'personal',
    GROUP: 'group',
    CLASS: 'class'
};

// Updating this config will update the board tabs referenced throughout the solution
// 'icon' key points to the material-ui icon being used and must be a valid SvgIcon from the material-ui library
// 'imageRef' key allows images to be loaded opposed to material icons
// 'showRightDivider' key displays a divider right of the icon to provide a visual of the grouping of boards, default: false
// 'showLeftDivider' key displays a divider left the icon to provide a visual of the grouping of boards, default: false
export const BOARD_CONFIGS = [
    { id: 'skript', name: 'Skript', icon: DescriptionIcon, type: BOARD_TYPES.CLASS, showLeftDivider: true },
    { id: 'notizbuch', name: 'Notizen', icon: PersonIcon, type: BOARD_TYPES.PERSONAL },
    { id: 'tafel', name: 'Tafel', imageRef: GroupBoardImage, type: BOARD_TYPES.GROUP, showRightDivider: true }
];

export const EXPERIMENTS = {
    B1: {
        id: 'b1',
        title: 'B1 Salzsäure mit Natronlauge gegen Indikator'
    },
    B2: {
        id: 'b2',
        title: 'B2 Salzsäure mit Natronlauge und pH-Meter'
    },
    C1: {
        id: 'c1',
        title: 'C1 Essigsäure oder Ameisensäure mit Natronlauge gegen Indikator'
    },
    C2: {
        id: 'c2',
        title: 'C2 Essigsäure oder Ameisensäure mit Natronlauge und pH-Meter'
    },
    D1: {
        id: 'd1',
        title: 'D1 Phosphorsäure mit Natronlauge und pH-Meter'
    },
    D2: {
        id: 'd2',
        title: 'D2 Titration beider Umschlagpunkte'
    }

};

// 'icon' key points to the material-ui icon being used and must be a valid SvgIcon from the material-ui library
// 'accessibleUserRoles' key contains list of userRoles who can access tool. If not defined all users have access. Note an empty array [] definition would mean that access is denied for all users
export const TOOL_LIST = [
    { name: 'Text', type: TOOL_TYPES.MARKDOWN, icon: EditTwoToneIcon },
    { name: 'Tabelle', type: TOOL_TYPES.SPREADSHEET, icon: ListAltTwoToneIcon },
    { name: 'Diagram', type: TOOL_TYPES.DIAGRAM, icon: ShowChartIcon },
    { name: 'Bild', type: TOOL_TYPES.IMAGE, icon: PhotoLibraryIcon },
    { name: 'ToDo Liste', type: TOOL_TYPES.TODO_LIST, icon: CheckBoxTwoToneIcon },
    { name: 'HTML', type: TOOL_TYPES.HTML, icon: CodeIcon, accessibleUserRoles: [USER_ROLES.ADMIN] },
    { name: 'Kommentare', type: TOOL_TYPES.COMMENT, icon: CommentIcon },
    { name: 'Arbeitsaufträge', type: TOOL_TYPES.PROGRESS_TRACKER, icon: AssessmentIcon, accessibleUserRoles: [USER_ROLES.ADMIN] }
];
