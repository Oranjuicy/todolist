const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todoList');

let items = [];

const itemsSchema = new mongoose.Schema({
  name: String,
})

const Item = new mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Buy food",
})

const item2 = new Item({
  name: "Cook food",
})

const item3 = new Item({
  name: "Eat food",
})

const defaultArray = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {  
  Item.find({}).then((foundItems)=>{
    if (foundItems.length === 0) {
      Item.collection.insertMany(defaultArray, function(err){
        if(err){
          console.log(err)
        }
      })
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})}});
    }  
  );

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const newItem = new Item({
    name: itemName,
  })

  if (listName === "Today"){
    
    newItem.save().then()
    res.redirect("/")

  } else {
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(newItem)
      foundList.save().then()
      res.redirect("/" + listName)
    })
  } 
});

app.post("/delete", (req, res)=>{
  const itemToDelete = req.body.checkbox
  const listName = req.body.listName

  if  (listName === "Today"){
    Item.findByIdAndDelete({_id: itemToDelete}).then()
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemToDelete}}}).then()
    res.redirect("/" + listName)
  }

  
})

app.get("/:route", function(req,res){
  
  const listName = _.capitalize(req.params.route);

  List.findOne({name: listName}).then(function(foundList){
      if (foundList) {
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      } else {
        const list = new List({
          name: listName,
          items: defaultArray
        })
        list.save()
        res.render("list",{listTitle: list.name, newListItems: list.items})
      }
    })}
 );


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
