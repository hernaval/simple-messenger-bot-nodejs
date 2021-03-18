

let express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    request = require('request')

    const  nodeMailer = require("nodemailer") ;
    const { google } = require("googleapis");

    var pushpad = require('pushpad');

    var project = new pushpad.Pushpad({
      authToken: "35cd9573a316ea85f041b8e709c6d6d2",
      projectId: 7610
    });

var cors = require("cors")

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.send("Hello word")
})


app.get("/webhook",(req,res)=>{
    let VERIFY_TOKEN ="navalona123"

    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    if(mode && token){
        
        if(mode ==="subscribe" && token === VERIFY_TOKEN){
            console.log("WEBHOOK_VERIFIED")

            res.status(200).send(challenge)
        }
    }
})

app.post("/webhook",(req,res)=>{
    let body = req.body

    
    if(body.object==="page"){
        
        body.entry.forEach(entry=>{
            let webhook_event = entry.messaging[0]
            console.log("the webhook event is ",webhook_event)

            let sender_psid = webhook_event.sender.id
            console.log("Sender PSID ",sender_psid)

            if(webhook_event.message){
                handleMessage(sender_psid, webhook_event.message)
            }else{
                handlePostback(sender_psid, webhook_event.postback)
            }
        })
        res.status(200).send("EVENT_RECEIVED")
    }else{
        res.sendStatus(404)
    }
})

app.get("/regtopizza",(req, res) =>{
    let userId = req.query.userId 
    let hmac = project.signatureFor(userId)

    res.json({
        signature : hmac,
        succcess : true
    })
})

app.get("/pizzaandroidnotification",async (req, res) =>{

    require("dotenv").config()
    let playerId = req.query.player_id
    let presta = req.query.presta

    const OneSignal = require('onesignal-node');    
    const APP_ID = process.env.ONESIGNAL_APP_ID
    const API_KEY = process.env.ONESIGNAL_API_KEY
    const client = new OneSignal.Client(APP_ID, API_KEY);

    const notification = {
        contents: {
          'en': "De nouvelles commandes sont en attente",
        },
        headings : {
          'en' : "Commandes clients"
        },
        include_player_ids:[playerId],
        url : "https://pizzareunion.re/prestataire/index.php?Num_prestataire="+presta,
        small_icon : "https://pizzareunion.re/reunion/images/Logo-v.4-coins-arrondis-petit.png",
        large_icon : "https://pizzareunion.re/reunion/images/Logo-v.4-coins-arrondis-petit.png"
    };

    try{
        let response = await  client.createNotification(notification)
    
        console.log(response.body);
        
    }catch(e){
    
        if (e instanceof OneSignal.HTTPError) {
            // When status code of HTTP response is not 2xx, HTTPError is thrown.
            console.log(e.statusCode);
            console.log(e.body);
          }
    
    }

    res.json("ok send android")

})

app.get("/pizzanotification",(req,res)=>{
  
    let presta = req.query.presta
//
    var notification = new pushpad.Notification({
        project: project,
        body: 'De nouvelles commandes sont en attente',
        title: 'Pizzareunion', // optional, defaults to your project name
        targetUrl: 'https://pizzareunion.re', // optional, defaults to your project website
        iconUrl: 'https://pizzareunion.re/reunion/images/Logo-v.4-coins-arrondis-petit.png', // optional, defaults to the project icon
        imageUrl: 'https://pizzareunion.re/reunion/images/Logo-v.4-coins-arrondis-petit.png', // optional, an image to display in the notification content
        ttl: 604800, // optional, drop the notification after this number of seconds if a device is offline
        requireInteraction: true, // optional, prevent Chrome on desktop from automatically closing the notification after a few seconds
        silent: false, // optional, enable this option if you want a mute notification without any sound
        urgent: false, // optional, enable this option only for time-sensitive alerts (e.g. incoming phone call)
        customData: '123', // optional, a string that is passed as an argument to action button callbacks
        // optional, add some action buttons to the notification
        // see https://pushpad.xyz/docs/action_buttons
        actions: [
          {
            title: 'voir commandes',
            targetUrl: 'https://pizzareunion.re/prestataire/index.php?Num_prestataire='+presta, // optional
            icon: 'https://example.com/assets/button-icon.png', // optional
            action: 'voir' // optional
          }
        ],
        starred: true, // optional, bookmark the notification in the Pushpad dashboard (e.g. to highlight manual notifications)
        // optional, use this option only if you need to create scheduled notifications (max 5 days)
        // see https://pushpad.xyz/docs/schedule_notifications
        sendAt: new Date(), // 2016-07-25 10:09 UTC
        // optional, add the notification to custom categories for stats aggregation
        // see https://pushpad.xyz/docs/monitoring
      });

      notification.deliverTo([presta], function(err, result) { /*...*/ });

      res.json("ok")
})

app.get("/sendMail",(req,res) =>{
    let emailUser = req.query.email
    let ticket = req.query.ticket
    
    const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com", // ClientID
            "bVgL6oA34brKnykRkpbFzRgU", // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
            refresh_token: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",

        });
  
        const accessToken = oauth2Client.getAccessToken((res) => {
           console.log(res)
        })
        let trasporter = nodeMailer.createTransport({
            
             service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user: 'devacadys@gmail.com',
                  clientId: "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com",
                  clientSecret: "bVgL6oA34brKnykRkpbFzRgU",
                  refreshToken: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",
                  accessToken: accessToken
                }
        })

        let mailOptions = {
            from: "devacadys@gmail.com",
            to: `${emailUser}`,
            subject: "TICKET",
            html: `
            <div style="margin :0 auto; width: 50%;-webkit-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    -moz-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);">
        <div style="background-color: #3e75cf; padding : 50px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        
             <h1 style="text-align: center;font-family: Helvetica;color: #fff;">TICKET[${ticket}]</h1>
    
        </div>

        <div>
               
   
          
            <p style="font-size: 12px; color: red;text-align: center;">En recevant cet email, nous confirmons avoir reçu votre ticket.</p>
            
            <p style="font-size: 12px; color: red;text-align: center;">Suivre le lien ci-après pour voir l'etat de votre ticket :
                <a href="https://frugality.tech/suivi.php?ticket_key=${ticket}">ici</a>
            </p>

           
        </div>

        <div></div>
    </div>
            `,

        }

        trasporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })

        res.json("ok");
})

app.get("/notification",(req,res) =>{
    let emailUser = req.query.email
    let ticket = req.query.ticket
    let ticketTitle = req.query.title
    
    const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com", // ClientID
            "bVgL6oA34brKnykRkpbFzRgU", // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
            refresh_token: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",

        });
  
        const accessToken = oauth2Client.getAccessToken((res) => {
           console.log(res)
        })
        let trasporter = nodeMailer.createTransport({
            
             service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user: 'devacadys@gmail.com',
                  clientId: "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com",
                  clientSecret: "bVgL6oA34brKnykRkpbFzRgU",
                  refreshToken: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",
                  accessToken: accessToken
                }
        })

        let mailOptions = {
            from: "devacadys@gmail.com",
            to: `${emailUser}`,
            subject: `Le ticket ${ticket} -${ticketTitle}  a été mis à jour`,
            html: `
            <div style="margin :0 auto; width: 50%;-webkit-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    -moz-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);">
        <div style="background-color: #3e75cf; padding : 50px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        
             <h1 style="text-align: center;font-family: Helvetica;color: #fff;">TICKET[${ticket}] MIS A JOUR</h1>
    
        </div>

        <div>
               
   
          
            <p style="font-size: 12px; color: red;text-align: center;">En recevant cet email, un membre de l'équipe vient modifier un ticket.</p>
            
            <p style="font-size: 12px; color: red;text-align: center;">Suivre le lien ci-après pour voir l'etat de votre ticket :
                <a href="https://frugality.tech/suivi.php?ticket_key=${ticket}">ici</a>
            </p>

           
        </div>

        <div></div>
    </div>
            `,

        }

        trasporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })

        res.json("ok");
})

app.get("/forgot",(req,res) =>{
    let emailUser = req.query.email
   

    let tok = req.query.token
    const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com", // ClientID
            "bVgL6oA34brKnykRkpbFzRgU", // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
            refresh_token: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",

        });
  
        const accessToken = oauth2Client.getAccessToken((res) => {
           console.log(res)
        })
        let trasporter = nodeMailer.createTransport({
            
             service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user: 'devacadys@gmail.com',
                  clientId: "942898229269-obsisctr1ppn24savr6b7uf6ksn147s7.apps.googleusercontent.com",
                  clientSecret: "bVgL6oA34brKnykRkpbFzRgU",
                  refreshToken: "1//049CHC_zJKnQVCgYIARAAGAQSNwF-L9IrbFZ8VQomvAL7PKlUettCCRwen6tknyhmfkCILxPnIeyYiY83AjZEyC0-cxKlt2PQzmo",
                  accessToken: accessToken
                }
        })

        let mailOptions = {
            from: "devacadys@gmail.com",
            to: `${emailUser}`,
            subject: `Lien de réinitialisation de mot de passe`,
            html: `
            <div style="margin :0 auto; width: 50%;-webkit-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    -moz-box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);
    box-shadow: 0px 5px 8px -1px rgba(97,97,97,0.82);">
        <div style="background-color: #3e75cf; padding : 50px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        
             <h1 style="text-align: center;font-family: Helvetica;color: #fff;">REINITIALISATION MOT DE PASSE</h1>
    
        </div>

        <div>
               
   
          
            <p style="font-size: 12px; color: red;text-align: center;">Ne vous inquietez pas, vous pouvez réinitialiser votre mot de passe à tout moment.</p>
            
            <p style="font-size: 12px; color: red;text-align: center;">Suivre le lien ci-après pour la réinitialisation :
                <a href="http://diagnosticcom.lech0958.odns.fr/reinitialisation?token="${tok}">ici</a>
            </p>
            
           
        </div>

        <div></div>
    </div>
            `,

        }

        trasporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })

        res.json("ok");
})


const handleMessage = (sender_psid, received_message) =>{
    let response 

    if(received_message.text){
        response = askTemplate();
    }

    callSendAPI(sender_psid, response);
}


const askTemplate = (text) => {
    return {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": text,
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Cats",
                        "payload":"CAT_PICS"
                    },
                    {
                        "type":"postback",
                        "title":"Dogs",
                        "payload":"DOG_PICS"
                    }
                ]
            }
        }
    }
}

const callSendAPI = (sender_psid, response, cb=null) =>{
    let request_body = {
        "recipient" : {
            "id" : sender_psid
        },
        "message" :  response
    }

    request({
        "uri" : "https://graph.facebook.com/v3.1/me/messages",
        "qs": {"access_token" : "EAAm0ubtuIicBAOMwthWSLFcg9ImZAMZA1Jq2qwskxvt9Xe3s8BF91FEkKjn7B8yeGTcbk4N3vr54Gve1cRZAfZCZCBtINVgnIt7eQc5m2Kf79ideP5mOBgxsEvaHllYW9JCx16aK8siS8QZCA8E34J46ExJhET748nqMAHZAThu3wZDZD" },
        "method" : "POST",
        "json": request_body
    },(err, res,body)=>{
        if(!err){
            if(cb){
                cb()
            }
        }else{
            console.error("Unable to send message ",err)
        }
    })
}

const handlePostback = (sender_psid, received_postback) =>{
    let response

    let payload = received_postback.payload
    
    if(payload === "GET_STARTED"){

    }
}

app.listen(process.env.PORT || 3000,()=>{
    console.log("app is running")
})