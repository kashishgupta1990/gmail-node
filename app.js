var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
var __clientSecret;
var __tokenFilePath;

var gmailClass = (function () {

    var _init = function (credentials, tokenFilePath, callback) {
        __clientSecret = credentials;
        __tokenFilePath = tokenFilePath;
        authorize(__clientSecret, function (auth) {
            if (auth) {
                callback(null, 'Successfully Initialized');
            } else {
                callback('Error in initializing', null);
            }
        });
    };
    var _send = function (emailObject, callback) {
        authorize(__clientSecret, function (auth) {
            sendMail(auth, emailObject, callback);
        });
    };
    var _clearToken = function (callback) {
        fs.unlink(__tokenFilePath, callback);
    };

    return {
        init: _init,
        send: _send,
        clearToken: _clearToken
    }

})();

function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(__tokenFilePath, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

function makeBody(to, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

function sendMail(auth, emailObject, callback) {
    var gmail = google.gmail('v1');
    var raw = makeBody(emailObject.to, emailObject.subject, emailObject.message);

    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, callback);
}

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    r1.question('Enter the code from that page here: ', function (code) {
        r1.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token, __tokenFilePath);
            callback(oauth2Client);
        });
    });
}

function storeToken(token, tokenFilePath) {
    fs.writeFileSync(tokenFilePath, JSON.stringify(token));
    console.log('Token stored to ', tokenFilePath);
}

module.exports = gmailClass;