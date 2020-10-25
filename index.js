

let express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    request = require('request'),
    config = require('config')


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

const handleMessage = (sender_psid, received_message) =>{
    let response = "Heureux de vous rencontrez"

    if(received_message.text){
        callSendAPI(sender_psid,response)
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
        "qs": {"access_token" : config.get('facebook.page.access_token') },
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
    console.log("payload ",payload)
    if(payload === "GET_STARTED"){

    }
}

app.listen(process.env.PORT || 3000,()=>{
    console.log("app is running")
})