require('dotenv').config()

var session = require('express-session')
var express = require('express');
const mongoose = require('mongoose')
var app = express();
const bcrypt = require('bcrypt')

mongoose.connect(process.env.dbUrl, {
   useNewUrlParser: true,
   useUnifiedTopology: true

})

const Shorturl = require('./models/urlShort')
const User = require('./models/user')




app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(session({
   secret:"hello_world",
   resave: true,
   saveUninitialized: true,
   cookie:{maxAge:6000000}
}))



app.get('/', async (req, res) => {
   let user = req.session.user

   if (user){

      const shortUrls = await Shorturl.find()

      res.render('index', { shortUrls: shortUrls })


   } else {

      res.redirect('/login')

   }

});


app.get('/signup',(req,res)=>{
   res.render('signup')
})

app.post('/signup',async (req,res)=>{

   try {
      const {username,email,password} = req.body;

      if(!(email && password && username)){
         res.status(400).send("All input is required")
         // 404 bad request

      }

      const oldUser = await User.findOne({email});

      if (oldUser){
         return res.status(409).send("User Already Exist. Please Login")
      }

      // Encrypt User password

      encryptedPassword = await bcrypt.hash(password,10)

      // all validation is done then save to database

      const obj = await User.create({
         username,
         email:email.toLowerCase(),
         password:encryptedPassword
      });
      
      res.status(201).json(obj);



   } catch (err){
      console.log(err);
   }

  
    
})

app.get('/login',(req,res)=>{
   let user = req.session.user

   if(user){
      res.redirect('/')

   } else {


      res.render('login')

   }
})

app.post('/login', async (req,res)=>{

   


  try{
   const { email, password } = req.body;
   console.log(req.body)

   // validate user input 
   if (! (email && password)){
      res.status(400).send("All input requireed you fool");

   }


   // check user available in database

   const user = await User.findOne({
      email
   })
   console.log(user)

   if(user){
      
   if (email && (await bcrypt.compare(password,user.password))){
       req.session.user = user
      console.log(req.session.user)
      res.redirect('/')
   } else {
      res.status(200).send("password mismatch")
   }


   }
   res.status(404).send("user not found ")



  } catch (err ){
     console.log(err);

  }


})


app.get('/test',(req,res)=>{
   req.session.test = 'session testing with multiple'
   res.send("Test route working")
})


app.post('/shortUrl', async (req, res) => {


   await Shorturl.create({
      full: req.body.fullUrl,
      short: req.body.shortUrl

   })

   res.redirect('/')

})


app.get('/:shorturl',async (req,res)=>{
    const url = await Shorturl.findOne({short: req.params.shorturl})
    console.log(url);

    if(url == null) return res.sendStatus(404)

    url.clicks++;
    url.save();
    
    res.redirect(url.full)
    
})

// login page setup and signup page



app.listen(process.env.PORT || 8000);






