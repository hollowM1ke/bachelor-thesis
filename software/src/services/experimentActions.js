/**
 * ExperimentActions Module
 *
 * This module provides functions to interact with an API related to experiments.
 * It includes functions for fetching, inserting, deleting, and updating experiment data.
 *
 * The module uses the Axios library for making HTTP requests and handles both success
 * and error scenarios. Additionally, it uses the fetch API for sending GET requests.
 *
 * @module experimentActions
 */

import axios from 'axios';
import getValidAccessToken from './authUtils';

/**
 * Fetches experiments from the API based on user role and visibility.
 * @param {string} userRole - The user's role ('s' for special role).
 * @returns {Array} An array of Experiment instances.
 */
const baseUrl = process.env.REACT_APP_SS_API_URL;
export async function fetchExperiments (userRole) {
    try {
        let url = baseUrl + 'experiments';
        const token = await getValidAccessToken();

        // If user role is 's', modify the URL to filter by visibility
        if (userRole === 's') {
            url += '?filterByVisibility=true';
        }

        const headers = new Headers();
        headers.append('userRole', userRole); // Add userRole to headers
        headers.append('Authorization', `Bearer ${token}`);
        const requestOptions = {
            method: 'GET',
            headers: headers
        };

        const response = await fetch(url, requestOptions);
        const responseData = await response.text();
        const data = JSON.parse(responseData);
        return data; // Returns an array of Experiment instances
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return [];
    }
}

export async function fetchPrograms (userRole) {
    try {
        let url = baseUrl + 'programs';
        const token = await getValidAccessToken();

        // If user role is 's', modify the URL to filter by visibility
        if (userRole === 's') {
            url += '?filterByVisibility=true';
        }

        const headers = new Headers();
        headers.append('userRole', userRole); // Add userRole to headers
        headers.append('Authorization', `Bearer ${token}`);
        const requestOptions = {
            method: 'GET',
            headers: headers
        };

        const response = await fetch(url, requestOptions);
        const responseData = await response.text();
        const data = JSON.parse(responseData);
        return data; // Returns an array of Experiment instances
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return [];
    }
}

export async function insertProgram (programs, visibility) {
    try {
        const token = await getValidAccessToken();
        const response = await axios.post(baseUrl + 'programs', {
            programs: programs,
            visibility: visibility
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error inserting data:', error.response.data);
        throw error;
    }
}

export async function deleteProgramByName (name) {
    try {
        const token = await getValidAccessToken();
        const response = await axios.delete(baseUrl + 'programs', { data: { Programname: name }, headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        console.error('Error deleting experiment:', error.response.data);
        throw error;
    }
}

export async function updateProgramByName (oldName, newName, jsonData, newVisibility) {
    try {
        const token = await getValidAccessToken();
        const data = JSON.stringify(jsonData);
        const response = await axios.put(baseUrl + 'programs/', {
            newName: newName,
            newVisibility: newVisibility
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating experiment:', error.response.data);
        throw error;
    }
}

/**
 * Inserts a new experiment into the API.
 * @param {string} name - The name of the experiment.
 * @param {Object} jsonData - The experiment data in JSON format.
 * @param {string} visibility - The visibility of the experiment.
 * @returns {Object} The response data from the API.
 * @throws An error if the insertion fails.
 */
export async function insertExperiment (name, jsonData, visibility) {
    try {
        const token = await getValidAccessToken();
        const data = JSON.stringify(jsonData);
        const response = await axios.post(baseUrl + 'experiments', {
            name: name,
            jsonData: data,
            visibility: visibility
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error inserting data:', error.response.data);
        throw error;
    }
}

/**
 * Deletes an experiment from the API by its name.
 * @param {string} name - The name of the experiment to delete.
 * @returns {Object} The response data from the API.
 * @throws An error if the deletion fails.
 */
export async function deleteExperimentByName (name) {
    try {
        const token = await getValidAccessToken();
        const requestData = { experimentName: name };
        const response = await axios.delete(baseUrl + 'experiments', { data: requestData, headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        console.error('Error deleting experiment:', error.response.data);
        throw error;
    }
}

/**
 * Updates an experiment in the API by its name.
 * @param {string} oldName - The current name of the experiment.
 * @param {string} newName - The new name for the experiment.
 * @param {Object} jsonData - The updated experiment data in JSON format.
 * @param {string} newVisibility - The new visibility for the experiment.
 * @returns {Object} The response data from the API.
 * @throws An error if the update fails.
 */
export async function updateExperimentByName (oldName, newName, jsonData, newVisibility) {
    try {
        const token = await getValidAccessToken();
        const data = JSON.stringify(jsonData);
        const requestData = {
            newName: newName,
            jsonData: data,
            newVisibility: newVisibility,
            oldExperimentName: oldName
        };
        const response = await axios.put(baseUrl + 'experiments', requestData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating experiment:', error.response.data);
        throw error;
    }
}
