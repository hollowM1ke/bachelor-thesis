import 'react-contexify/ReactContexify.css';
import { v4 as uuidv4 } from 'uuid';
import './App.scss';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { React, useEffect, useState } from 'react';
import {
    useSearchParams,
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom';
import Modal from 'react-modal';
// import ErrorBoundary from './components/ErrorBoundaries/ErrorBoundary';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorApplication, logError } from './components/ErrorBoundaries/ErrorFallbacks';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import BoardContextManager from './components/Board/BoardContextManager';
import { loadState, unloadSate } from './model/features/metaData/metaDataSlice';
import { useDispatch } from 'react-redux';
import { USER_ROLES, getRole } from './components/users/users';
import packageJson from '../package.json';
import AdminDashboard from './components/Admin/AdminDashboard';
import PersonalData from './components/PersonalData/PersonalData';
import { initDocument } from './services/collectionprovider';
import LoginKeycloak from './components/LoginScreen/LoginKeycloak';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import keycloak from './components/LoginScreen/Keycloak';
import PrivateRoute from './components/LoginScreen/PrivateRoute';
import LoginScreen from './components/LoginScreen/LoginScreen';
import LoginLandingPage from './components/LoginScreen/LoginLandingPage';
import { dummyGroupInfos } from './components/LoginScreen/loginCreds';

Modal.setAppElement('#root');
function App () {
    // Required as we maintain multiple instances on the server for the app, based on target audience
    const envRootPath = process.env.REACT_APP_HOMEPAGE;

    return (
        <ErrorBoundary FallbackComponent={ ErrorApplication } onError={ logError }>
            <ReactKeycloakProvider authClient={keycloak}>
                <BrowserRouter>
                    <Routes>
                        <Route path={`${envRootPath}/:loginMethod/board/`} element={<PrivateRoute TabbedBoardPage={TabbedBoardPage}></PrivateRoute>}/>
                        <Route exact path={'/' + `${envRootPath}?/`} element={<LoginLandingPage/>} />
                        <Route path={'/' + `${envRootPath}?/keycloak`} element={<LoginKeycloak/>} />
                        <Route path={'/' + `${envRootPath}?/oldstatic`} element={<LoginScreen/>} />
                    </Routes>
                </BrowserRouter>
            </ReactKeycloakProvider>
        </ErrorBoundary>
    );
}

function TabbedBoardPage (props) {
    const handle = useFullScreenHandle();
    const groupNameFixed = '13a';
    console.log('groupNameFixed', groupNameFixed);
    initDocument(groupNameFixed);

    const dispatch = useDispatch();
    const { keycloak } = useKeycloak();
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [groups, setGroups] = useState(null);
    const [groupInfos, setGroupInfos] = useState(null);
    useEffect(() => {
        dispatch(loadState({ id: process.env.REACT_APP_META_DATA_ID }));
        return () => {
            dispatch(unloadSate({ id: process.env.REACT_APP_META_DATA_ID }));
        };
    }, []);

    // Will display a prompt warning users that they are leaving the application.
    window.addEventListener('beforeunload', (e) => {
        const confirmationMessage = 'Are you sure you want to exit application?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    });

    // Filter out relevant info for AdminDashboard
    const filteredDummyGroupInfos = dummyGroupInfos.map(groupInfo => ({
        name: groupInfo.name,
        members: groupInfo.members.map(({ username }) => ({ username }))
    }));

    const renderLocalLoginContent = (userId, userRole) => (
        <FullScreen handle={handle}>
            <DndProvider options={HTML5toTouch}>
                {userRole === USER_ROLES.ADMIN && <AdminDashboard previewOnly={false} userId={userId} userRole={userRole} groupInfos={filteredDummyGroupInfos}/>}
                <PersonalData userId={userId} userRole={userRole} groupInfos={dummyGroupInfos}/>
                {userRole === USER_ROLES.STUDENT && <BoardContextManager previewOnly={false} fullScreenHandle={handle} userId={userId} userRole={userRole} loginWithKeyCloak={props.loginWithKeyCloak} />}
            </DndProvider>
        </FullScreen>
    );

    const renderKeycloakLoginContent = (profile, role, groups, groupInfos) => {
        let groupNameFixed = '13a';
        if (groups && groups.length > 0) {
            groupNameFixed = groups[0].slice(1);
        }
        console.log('hi', props.loginWithKeyCloak);
        return (
            <FullScreen handle={handle}>
                <DndProvider options={HTML5toTouch}>
                    {role === USER_ROLES.ADMIN && <AdminDashboard previewOnly={false} userId={profile.username} userRole={role} groupInfos={groupInfos} groupName={groupNameFixed} loginWithKeyCloak={props.loginWithKeyCloak} />}
                    <PersonalData userId={profile.username} userRole={role} groupInfos={groupInfos} groupName={groupNameFixed} />
                    {role === USER_ROLES.STUDENT && <BoardContextManager previewOnly={false} fullScreenHandle={handle} userId={profile.username} userRole={role} groupName={groupNameFixed} loginWithKeyCloak={props.loginWithKeyCloak} />}
                </DndProvider>
            </FullScreen>
        );
    };
    console.log('props.loginWithKeyCloak', props.loginWithKeyCloak);
    if (props.loginWithKeyCloak) {
        useEffect(async () => {
            const p = await keycloak.loadUserProfile();
            const r = keycloak.hasRealmRole('teacher') ? USER_ROLES.ADMIN : USER_ROLES.STUDENT;
            const userInfo = await keycloak.loadUserInfo();

            setProfile(p);
            setRole(r);
            setGroups(userInfo.groups);
            if (r === USER_ROLES.ADMIN) {
                const accInfos = [];
                for (const groupPath of userInfo.groups) {
                    const groupInfo = await getGroupInfo(keycloak, groupPath);
                    groupInfo.members = await getUsersInGroup(keycloak, groupInfo.id);
                    accInfos.push(groupInfo);
                }
                setGroupInfos(accInfos);
            } else {
                setGroupInfos([]);
            }
        }, []);

        if (profile === null || role === null || groupInfos === null) {
            return null;
        }
        window.sessionStorage.setItem('userId', profile.username + uuidv4());
        return renderKeycloakLoginContent(profile, role, groups, groupInfos);
    } else {
        const [searchParams] = useSearchParams();
        const userId = searchParams.get('id');
        const userRole = getRole(userId);

        if (!userId || userId.length < 4) {
            return (
                <div>
                    Please use a user id
                </div>
            );
        }
        window.sessionStorage.setItem('userId', userId + uuidv4());
        return renderLocalLoginContent(userId, userRole);
    }
}

// Function to get users in a specific group
async function getUsersInGroup (keycloak, groupId) {
    const groupEndpoint = `${keycloak.authServerUrl}admin/realms/${keycloak.realm}/groups/${groupId}/members`;

    const response = await fetch(groupEndpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

// Function to get users in a specific group
async function getGroupInfo (keycloak, groupPath) {
    const request = `${keycloak.authServerUrl}admin/realms/${keycloak.realm}/group-by-path${groupPath}`;
    const response = await fetch(request, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

export default App;
