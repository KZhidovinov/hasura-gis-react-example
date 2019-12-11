const fs = require('fs')
const path = require('path')
const express = require('express');

if (fs.existsSync('.env')) {
    // Load environment variables
    require('dotenv').config()
}

const port = process.env.PORT || 9000
const isProduction = process.env.NODE_ENV === 'production'

const app = express();

if (isProduction) {
    app.use(express.static(path.join(__dirname, 'wwwroot')))
} else {
    const config = require('./webpack.dev.js');
    const webpack = require('webpack');
    const compiler = webpack(config);
    app.use(require("webpack-dev-middleware")(compiler, {
        publicPath: config.output.publicPath
    }));
}

app.get('/auth_webhook', (request, response) => {
    // Extract token from request
    var token = request.get('Authorization');

    // Fetch user_id that is associated with this token
    fetchUserInfo(token, (result) => {

        // Return appropriate response to Hasura
        var hasuraVariables = {
            'X-Hasura-Role': result.role,
            'X-Hasura-User-Id': result.user_id
        };
        response.json(hasuraVariables);
    });
});

function fetchUserInfo(token, cb) {
    // fetch user info and determine user role and id
    switch (token) {
        case 'test_user_token':
            cb({ role: 'user', user_id: '1' })
            break;
        case 'test_admin_token':
            cb({ role: 'admin', user_id: '0' })
            break;
        case 'test_viewer_token':
            cb({ role: 'viewer', user_id: '2' })
            break;
        default:
            cb({ role: 'anonymous' })
            break
    }
}

app.listen(port, function () {
    console.log(`\nServer is listening on port ${port}!\n`);
});