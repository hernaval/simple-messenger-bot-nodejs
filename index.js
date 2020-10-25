let express = require("express"),
    bodyParser = require("body-parser"),
    app = express()


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get("/",(req,res)=>{
    res.send("Hello word")
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("app is running")
})