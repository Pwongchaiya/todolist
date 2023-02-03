const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const app = express()
const uri ="mongodb://127.0.0.1:27017/toDoList"

mongoose.set('strictQuery', true)
mongoose.connect(uri)

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

const itemSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {  
    renderHomePage(res)
 })

app.get("/:listName", function (req, res) {
    const name = req.params.listName
    checkListForName(res,name)    
})

app.post("/", function (req, res) { 
    
    let item = req.body.newItem
    let listTitle = req.body.listName

    if(listTitle !== "Current Working Lists"){
        pushNewItemIntoList(listTitle, item)
        res.redirect("/" + listTitle)        
    }else{
        saveList(item).save()
        res.redirect("/")
    }

 })

 app.post("/delete", function (req, res) { 
    const id = req.body.checkbox
    const listTitle = req.body.listName

    if(listTitle === "Current Working Lists"){
        deleteList(listTitle)
        res.redirect("/")
    }else{
        deleteItemFromList(id, listTitle, res)
    }
    
  })

app.get("/delete/:listName", function (req, res) { 
    const name = req.params.listName
    console.log(name)
    deleteList(name)
    res.redirect("/")
 })

 app.listen(3000, function () {
    console.log("Listening on port 3000")
})


//-------------------FUNCTIONS-------------------\\

function renderHomePage(res) {
    List.find({}, function (err, foundList) {
        console.log(foundList)
        res.render("home",{
            listTitle: "Current Working Lists",
            newListItems: foundList
        })
      })
}
 function renderOrSaveList(res,listName,foundItem) {
    
    if(!foundItem){
        saveList(listName).save()
        console.log("List has been saved")
        res.redirect("/"+listName)
    }else{
        res.render("list",{
        listTitle: foundItem.name,
        newListItems: foundItem.items
        })
    }  
 }
 function checkListForName(res, listName) { 
    List.findOne({name: listName}, function(err, foundItem){
        if(err){
            console.log(err)
        }else{

            renderOrSaveList(res, listName, foundItem)
        }
    })
  }

  function pushNewItemIntoList(listName, item) {
    List.findOne({name:listName}, function(err, foundItem){
        if(err){
            console.log(err)
        }else{
            foundItem.items.push(saveItem(item))
            foundItem.save()
            console.log("item has been saved to the list")
            console.log(foundItem.name)
        }
    })
  }

 function saveList(list){
    return new List({
        name: list,
        items: []
    })
 }

function deleteItemFromList(id, listTitle,res){
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: id}}}, function (err, results) { 
        if(!err){
            console.log("Item has been successfully deleted")
            res.redirect("/"+ listTitle)
        }
    })
  }

function deleteList(id) { 
    List.findOneAndDelete(id, function (err){
        if(err){
            console.log(err)
        }else{
            console.log("List has successfully been deleted")
        }
    })
}

 function saveItem(item) {
    return new Item({
            name: item
        })
 }

function insertFirstEntry (req, res) { 
    Item.find({}, function (err, entries) { 
        res.render("list", {
            listTitle: "Today",
            newListItems: entries
            }) 
     })
 }

 function deleteItem(id,res) { 
    Item.findByIdAndRemove(id, function (err) { 
            if(err){
                console.log(err)
            }else{
                console.log("Item has been successfully deleted")
            }
        })
        res.redirect("/")
  }
