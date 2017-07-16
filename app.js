const fs = require('fs');
const path = require('path');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const EventEmitter = require('events');

var __clientSecret;
var __tokenFilePath;
var emailEmitter = new EventEmitter();

var gmailClass = (function () {
    var _init = function (credentials, tokenFilePath, callback) {
        __clientSecret = credentials;
        __tokenFilePath = tokenFilePath;
        authorize(__clientSecret, null, function (auth) {
            if (auth) {
                callback(null, 'Successfully Initialized');
                emailEmitter.emit('init', {success: 'Successfully Initialized'});
            } else {
                callback('Error in initializing', null);
                emailEmitter.emit('init', {error: 'Error in initializing'});
            }
        });
    };
    var _send = function (emailObject, callback) {
        authorize(__clientSecret, null, function (auth) {
            sendMail(auth, emailObject, 'plain', callback);
        });
    };
    var _sendHTML = function (emailObject, callback) {
        authorize(__clientSecret, null, function (auth) {
            sendMail(auth, emailObject, 'html', callback);
        });
    };
    var _sendWithToken = function (emailObject, credentials, token, callback) {
        authorize(credentials, token, function (auth) {
            sendMail(auth, emailObject, 'plain', callback);
        });
    };
    var _sendHTMLWithToken = function (emailObject, credentials, token,callback) {
        authorize(credentials, token, function (auth) {
            sendMail(auth, emailObject, 'html', callback);
        });
    };
    var _clearToken = function (callback) {
        fs.unlink(__tokenFilePath, callback);
    };
    var _generateToken = function (credentials, code, callback) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.getToken(code,callback);
    };
    var _generateUrl = function (credentials) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        return authUrl;
    };

    return {
        init: _init,
        send: _send,
        sendHTML: _sendHTML,
        sendWithToken: _sendWithToken,
        sendHTMLWithToken: _sendHTMLWithToken,
        clearToken: _clearToken,
        generateUrl: _generateUrl,
        generateToken: _generateToken,
        event: emailEmitter
    }

})();

function authorize(credentials, token, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    if(token){
        oauth2Client.credentials = token;
        callback(oauth2Client);
    }else {
        fs.readFile(__tokenFilePath, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }
}

function makeBody(to, subject, message, type) {
    var str = [];
    if (type == 'html') {
        str.push("Content-Type: text/html; charset=\"UTF-8\"\n")
    } else {
        str.push("Content-Type: text/plain; charset=\"UTF-8\"\n")
    }
    str.push("MIME-Version: 1.0\n");
    str.push("Content-Transfer-Encoding: 7bit\n");
    str.push("to: ", to, "\n");
    str.push("subject: ", subject, "\n\n");
    str.push(message);
    str = str.join('');
    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

function sendMail(auth, emailObject, type, callback) {
    var gmail = google.gmail('v1');
    var raw = makeBody(emailObject.to, emailObject.subject, emailObject.message, type);

    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, (error, success) => {
        callback(error, success);
        emailEmitter.emit('sent', {error, success});
    });
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
            emailEmitter.emit('token', token);
        });
    });
}

function storeToken(token, tokenFilePath) {
    fs.writeFileSync(tokenFilePath, JSON.stringify(token));
    console.log('Token stored to ', tokenFilePath);
}

module.exports = gmailClass;