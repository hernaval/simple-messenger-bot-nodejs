let express = require("express"),
    bodyParser = require("body-parser"),
    app = express()


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

    console.log(body.object)
    if(body.object==="page"){
        
        body.entry.forEach(entry=>{
            let webhook_event = entry.messaging[0]
            console.log("the webhook event is ",webhook_event)

            let sender_psid = webhook_event.sender.id
            console.log("Sender PSID ",sender_psid)

            if(webhook_event.message){
                console.log(webhook_event.message)
            }else{
                console.log(webhook_event.postback)
            }
        })
        res.status(200).send("EVENT_RECEIVED")
    }else{
        res.sendStatus(404)
    }
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("app is running")
})