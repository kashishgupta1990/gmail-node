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

## Usage
`npm install gmail-node --save`

## Available GMail methods
- Init GMail:
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

- Send GMail Plain content: 
```javascript
var emailMessage = {
    to: 'guptkashish@gmail.com',
    subject: 'Test Subject',
    message: 'Test Email'
};
 gmailNode.send(emailMessage, function (err, data) { ... });
```

- Send GMail HTML content: 
```javascript
var emailMessage = {
    to: 'guptkashish@gmail.com',
    subject: 'Test Subject',
    message: '<h1>Test Email</h1>'
};
 gmailNode.sendHTML(emailMessage, function (err, data) { ... });
```

- Generate URL for Token: `Method: generateUrl()`: 
This will return the URL, which user have to open to get code.
```javascript
gmailNode.generateUrl(clientSecret);
```

- Generate Token from `code` generate from `URL` `Method: generateToken()`:
```javascript
gmailNode.generateToken(clientSecret, '4/bZ94wJNeLj4b1nZ0nUhQ7fbqfjIYd4basm_GuG3br2s',(err, data)=>{
    console.log(err || data)
});
```

- If you have `Token` and `Credenctial` then you can directly use `Method: sendWithToken or sendHTMLWithToken` No need to call `Method: init()`:
```javascript
gmailNode.sendWithToken(testMessage, clientSecret, token,function (err, data) {
    console.log(err,data);
});
gmailNode.sendHTMLWithToken(testMessage, clientSecret, token,function (err, data) {
    console.log(err,data);
});
```

- Clear GMail Token:
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
    message: '<h1>Test Email</h1>'
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
        
        // OR
        
        gmailNode.sendHTML(testMessage, function (err, data) {
            console.log(err,data);
        });
    }
}
```
## Contribution
It's an open source project, you can report issue and form this repository to create pull request to add features.

