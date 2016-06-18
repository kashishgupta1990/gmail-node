var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var CLIENT_SECRET_FILE_NAME = 'client_secret.json';
var TOKEN_FILE_NAME = 'token.json';
var SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = path.join(__dirname, 'config');
var CLIENT_SECRET_PATH = path.join(TOKEN_DIR, CLIENT_SECRET_FILE_NAME);
var TOKEN_PATH = path.join(TOKEN_DIR, TOKEN_FILE_NAME);

fs.readFile(CLIENT_SECRET_PATH, function (err, content) {
    if (err) {
        console.log('Error loading client secret file: ', err);
        return;
    } else {
        authorize(JSON.parse(content), sendMail)
    }
});

function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, function(err, token){
        if(err){
            getNewToken(oauth2Client, callback);
        }else{
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

function sendMail(auth) {
    var gmail = google.gmail('v1');
    var raw = makeBody('kashish.gupta@proptiger.com','Hi ','yo ho - 1');

    gmail.users.messages.send({
        auth:auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    },function(err, response){
        if(err){
            console.log(err);
        }else{
            console.log(response);
        }
    });
}

function getNewToken(oauth2Client, callback){
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    r1.question('Enter the code from that page here: ',function(code){
        r1.close();
        oauth2Client.getToken(code, function(err,token){
            if(err){
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

function storeToken(token){
    try{
        fs.mkdirSync(TOKEN_DIR);
    }catch (err){
        if(err.code != 'EEXIST'){
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ', TOKEN_PATH);
}



module.exports = {yo:''};