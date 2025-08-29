'use strict';
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '1234',
        database: process.env.DB_NAME || 'ippl_db',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || null,
        database: process.env.DB_TEST_NAME || 'database_test',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
    },
    production: {
        username: process.env.DB_USER_PROD || 'USER_PROD',
        password: process.env.DB_PASS_PROD || 'PASS_PROD',
        database: process.env.DB_NAME_PROD || 'DB_PROD',
        host: process.env.DB_HOST_PROD || 'HOST_PROD',
        port: process.env.DB_PORT_PROD || 3306,
        dialect: 'mysql',
    },
};