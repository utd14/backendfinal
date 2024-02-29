const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const dbURI = 'mongodb+srv://utdana14:ndpfsEHp5KSg4n5S@cluster0.afiguob.mongodb.net/';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log('Connected to db'))
  .catch((err) => console.log(err));


app.get('/', (req, res) => {
  res.render('index'); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const User = require('./models/User');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: 'ut.dana14@gmail.com',
      pass: 'qqts kuur dpvy rukd'
    }
  }))

/* - - - - - REGISTER - - - - - */

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
    try {
      const userExists = await User.findOne({ username: req.body.username });
      if (userExists) {
        return res.status(400).send('Username already exists');
      }
  
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        country: req.body.country,
        gender: req.body.gender,
        email: req.body.email, 
        role: req.body.role 
      });
    
      let mailOptions = {
        from: 'ut.dana14@gmail.com',
        to: req.body.email,
        subject: 'Welcome to Our App!',
        text: 'Thank you for registering!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.redirect('/login');
    } catch (error) {
      console.log(error);
      res.redirect('/register');
    }

});

/* - - - - - LOGIN - - - - - */

app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;
  
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
  
    if (!user) {
      return res.status(400).send('The user does not exist');
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('The password is wrong');
    }
  
    res.redirect('/home');
  });

/* - - - - - NODEMAILER - - - - - */





app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
  });

app.post('/send-recovery-email', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
  
    if (!user) {
      return res.status(400).send('No account associated with this email');
    }
  
    const resetToken = "dummy-token";
  
    let mailOptions = {
      from: 'ut.dana14@gmail.com',
      to: email,
      subject: 'Password Recovery',
      text: `Your password recovery token is: ${resetToken}`
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        return res.status(500).send('Failed to send recovery email');
      } else {
        console.log('Recovery email sent: ' + info.response);
        res.send('Recovery email sent successfully');
      }
    });
  });

const Schema = mongoose.Schema;

const portfolioItemSchema = new Schema({
    pictures: [String], // URLs to images
    title: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

  app.post('/admin/portfolio', async (req, res) => {
    try {
      const { pictures, title, description } = req.body;
      const newItem = new PortfolioItem({ pictures, title, description });
      await newItem.save();
      res.redirect('/admin'); // Redirect back to the admin page or handle appropriately
    } catch (error) {
      console.log(error);
      res.status(500).send('Error adding item');
    }
  });

  app.post('/admin/portfolio/:id/update', async (req, res) => {
    const { pictures, title, description } = req.body;
    try {
      await PortfolioItem.findByIdAndUpdate(req.params.id, {
        pictures,
        title,
        description,
        updatedAt: Date.now()
      });
      res.redirect('/admin');
    } catch (error) {
      console.log(error);
      res.status(500).send('Error updating item');
    }
  });
  
  app.post('/admin/portfolio/:id/delete', async (req, res) => {
    try {
      await PortfolioItem.findByIdAndRemove(req.params.id);
      res.redirect('/admin');
    } catch (error) {
      console.log(error);
      res.status(500).send('Error deleting item');
    }
  });

  