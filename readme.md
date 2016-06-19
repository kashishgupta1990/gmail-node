# Node GMail Sender 

## How to get secret key
- Open link https://console.developers.google.com/flows/enableapi?apiid=gmail
- Use this wizard to create or select a project in the Google Developers Console and automatically turn on the API. 
- Click Continue, then Go to credentials.
- At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
- Select the Credentials tab, click the Create credentials button and select OAuth client ID.
- Select the application type Other, enter the any name "gmail-node-app", and click the Create button.
- Click OK to dismiss the resulting dialog.
- Click the file_download (Download JSON) button to the right of the client ID.
- Move this file to your working directory and use it with any name like client_secret.json.

## Available GMail methods
1. Init GMail:
```javascript
var gmailNode = require('gmail-node');
var clientSecret = {
    installed: {
        client_id: "k677725446467-6li25pcqgkcllsoh6f6dijcvse64n9pf.apps.googleusercontent.com",
        project_id: "clean-node-119606",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "kF7DvoA_ZrNfa65GnU2zQBgw7",
        redirect_uris: [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
        ]
    }
};
gmailNode.init(clientSecret, './token.json', function(err,data){ ... });
```
2. Send GMail: 
```javascript
var emailMessage = {
    to: 'guptkashish@gmail.com',
    subject: 'Test Subject',
    message: 'Test Email'
};
 gmailNode.send(emailMessage, function (err, data) { ... });
```
3. Clear GMail Token:
```javascript
gmailNode.clearToken();
```
## Example
```javascript
/* Client-Secret Downloaded from Google Development */
var clientSecret = {
    installed: {
        client_id: "k677725446467-6li25pcqgkcllsoh6f6dijcvse64n9pf.apps.googleusercontent.com",
        project_id: "clean-node-119606",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "kF7DvoA_ZrNfa65GnU2zQBgw7",
        redirect_uris: [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
        ]
    }
};

var gmailNode = require('gmail-node');

// Message
var testMessage = {
    to: 'guptkashish@gmail.com',
    subject: 'Test Subject',
    message: 'Test Email'
};

// ClientSecret:
gmailNode.init(clientSecret, './token.json', initComplete);

function initComplete(err, dataObject) {
    if(err){
        console.log('Error ', err);
    }else {
        gmailNode.send(testMessage, function (err, data) {
            console.log(err,data);
        });
    }
}
```

