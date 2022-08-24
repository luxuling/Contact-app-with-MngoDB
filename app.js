const { urlencoded } = require("body-parser")
const express = require("express")
const port = 3000
const app = express()
const expressLayouts = require("express-ejs-layouts")
const methodOverride = require("method-override")
const { body, validationResult, check } = require('express-validator');


//configure flash msg
const sessions = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")


//configure view engine
app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(urlencoded({extended:true}))

//configure method-override
app.use(methodOverride('_method'))

//connect mongodb
require("./utils/db")
const Contact = require("./model/model")
//configure flash
app.use(cookieParser("secret"))
app.use(sessions({
  cookie: {maxAge:6000},
  secret: "secret",
  resave: true,
  saveUninitialized: true
}))
app.use(flash()) 

//home
app.use((req, res, next)=>{
    console.log(new Date)
    next()
  })
  
  app.get('/', (req, res) => {
    const user =[
      {
        nama: "user1",
        email: "user1@gmail.com"
      },
      {
        nama: "user2",
        email: "user2@gmail.com"
      },
      {
        nama: "user3",
        email: "user3@gmail.com"
      }
    ]
    res.render("index", {
      nama: "Antoni Saputra",
      user,
      title: "Home Page",
      layout : "main_layout"
    })
  })
//about
app.get('/about', (req, res) => {
    res.render("about",{
      title: "About Page",
      layout : "main_layout",
  })
  })
//contact
app.get('/contact', async (req, res) => {
     const contacts = await Contact.find()
    res.render("contact",{
      title: "contact Page",
      layout : "main_layout",
      contacts,
      msg: res.req.flash("msg")
  })
  })
//tambah data
app.get('/contact/add', (req, res) => {
  res.render("add",{
    title: "Add contact",
    layout : "main_layout",
})
})
app.post("/contact",[
  body("nama").custom(async (value)=>{
    const dupliat = await Contact.findOne({nama : value})
    if(dupliat){
      throw new Error("nama sudah digunakan")
    }
    return true
  }),
  check("noHp", "format nomor anda salah").isMobilePhone("id-ID"),
  check("email", "format email anda salah").isEmail(),
  
],async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render("add",{
      title: "Add contact",
      layout : "main_layout",
      errors: errors.array()
  })
  }else{
  await Contact.insertMany(req.body)
  req.flash("msg", "Data acount berhasil di tambahkan")
  res.redirect("/contact")
  }
})

//detail
  app.get('/contact/:nama',async (req, res) => {
    const found = await Contact.findOne({nama : req.params.nama})
      if(!found){
        res.status(404)
        res.render("404", {
          title : "Page not found",
          layout : "main_layout"
        })
      }else{
        const contact = await Contact.findOne({nama : req.params.nama})
        res.render("detail",{
        title: "contact Page",
        layout : "main_layout",
        contact,
        })
      }
    
  })
//delete
app.delete("/contact",async (req, res)=>{
      await Contact.deleteOne({nama : req.body.nama})
      req.flash("msg", "data berhasil dihapus")
      res.redirect("/contact")
})
//ubah/update
app.get("/contact/change/:nama",async (req, res)=>{
  const contact = await Contact.findOne({nama : req.params.nama})
  res.render("change", {
    title:"Change contact",
    layout:"main_layout",
    contact
  })
})

app.put("/contact",[
  body("nama").custom(async (value,{req})=>{
    const dupliat = await Contact.findOne({nama: value})
    if(value !== req.body.nama && dupliat){
      throw new Error("nama sudah digunakan")
    }
    return true
  }),
  check("noHp", "format nomor anda salah").isMobilePhone("id-ID"),
  check("email", "format email anda salah").isEmail(),
  
],async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render("change",{
      title: "Change contact",
      layout : "main_layout",
      errors: errors.array(),
      contact : req.body
  })
  }else{
  await Contact.updateMany({_id: req.body._id},req.body)
  req.flash("msg", "Contact berhasil di ubah")
  res.redirect("/contact")
  }
})

app.listen(port, ()=> console.log(`server listening in http://localhost:${port}`))