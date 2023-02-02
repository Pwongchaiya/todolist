const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")

const app = express()
const items = []
const workList = []

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

app.get("/", function (req, res) { 
   
    res.render("list", {
        listTitle: date.getDate(),
        newListItems: items
    })
 
 })

 app.get("/work", function (req, res) { 
    res.render("list", {
        listTitle: "Work",
        newListItems: workList
    })
  })

app.listen(3000, function () {
    console.log("Listening on port 3000")
})

app.post("/", function (req, res) { 

    let item = req.body.newItem
    let title = req.body.list

    if(title === "Work"){
        workList.push(item)
        
    }else{
        items.push(item)
        title = ""
    }
    res.redirect("/"+title)


 })


