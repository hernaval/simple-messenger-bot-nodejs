

let express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    request = require('request')

    const  nodeMailer = require("nodemailer") ;
    const { google } = require("googleapis");

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

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
        <div style="background-color: #00C1B4; padding : 50px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        
             <h1 style="text-align: center;font-family: Helvetica;color: #fff;">TICKET[${ticket}]</h1>
    
        </div>

        <div>
               
   
          
            <p style="font-size: 12px; color: red;text-align: center;">En recevant cet email, nous confirmons avoir reçu votre ticket.</p>
            
            <p style="font-size: 12px; color: red;text-align: center;">Suivre le lien ci-après pour voir l'etat de votre ticket :
                <a href="http://acadysticket.lech0958.odns.fr/suivi.php?ticket_key=${$ticket}">ici</a>
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