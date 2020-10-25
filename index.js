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

app.listen(process.env.PORT || 3000,()=>{
    console.log("app is running")
})