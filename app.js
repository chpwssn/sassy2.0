
var restify = require('restify');
var builder = require('botbuilder');
var GphApiClient = require('giphy-js-sdk-core')
let giphyclient = GphApiClient(process.env.GIPHY_API_KEY)

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, () => {});

bot.recognizer(new builder.RegExpRecognizer( 'AnimIntent', /^anim\s+(.*)/));

bot.dialog('AnimIntent', function (session) {
    console.log(session.message);
    let term = session.message.text.replace(/^(anim|animation|gif)\s*/, '')
    giphyclient.translate('gifs', {"s": term})
    .then((response) => {
        console.log(response);
        let msg = new builder.Message(session);
        msg.attachments([
            new builder.AnimationCard(session)
            .media([
                { url: `https://media.giphy.com/media/${response.data.id}/giphy.gif` }
            ])
        ]);
        session.send(msg).endDialog();
    })
    .catch((err) => {
        console.log('giphy error', err);
    })
    
}).triggerAction({ matches: 'AnimIntent' });
