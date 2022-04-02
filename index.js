require('dotenv').config()

var express = require('express');
const mongoose = require('mongoose')
var app = express();
let url = 'mongodb+srv://sheheer:sheheer@cluster0.optng.mongodb.net/ShoppingCartDB'
mongoose.connect(process.env.dbUrl || url , {
   useNewUrlParser: true,
   useUnifiedTopology: true

})

const Shorturl = require('./models/urlShort')



app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))



app.get('/', async (req, res) => {

   const shortUrls = await Shorturl.find()

   res.render('index', { shortUrls: shortUrls })
});


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
app.listen(process.env.PORT || 8000);






