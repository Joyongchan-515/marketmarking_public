require('dotenv').config();

const axios = require('axios');

const apiClient = axios.create({
    headers: {
        "Content-Type": 'application/json',
        "Authorization": ``
    },
    baseURL: ''
});

const { get, post, patch, put, delete: destroy } = apiClient;
module.exports = { get, post, patch, put, destroy };