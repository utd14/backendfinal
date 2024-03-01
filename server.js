  const express = require('express');
  const session = require('express-session');
  const mongoose = require('mongoose');
  const ejs = require('ejs');
  const bcrypt = require('bcrypt');
  const nodemailer = require('nodemailer');
  var smtpTransport = require('nodemailer-smtp-transport');
  const axios = require('axios');

  const app = express();

  app.set('view engine', 'ejs');

  app.use(express.urlencoded({ extended: true }));

  const dbURI = 'mongodb+srv://utdana14:ndpfsEHp5KSg4n5S@cluster0.afiguob.mongodb.net/';
  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));


  app.get('/', (req, res) => {
    res.redirect('/login');
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

  const jwt = require('jsonwebtoken');
  const secretKey = 'asdkj37qoa839';

  app.get('/login', (req, res) => {
      res.render('login');
    });
    
    app.post('/login', async (req, res) => {
      const { username, password } = req.body;
    
      const user = await User.findOne({
        $or: [{ username: username }]
      });
    
      if (!user) {
        return res.status(400).send('The user does not exist');
      }
      
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      
      if (!isMatch) {
        return res.status(400).send('The password is wrong');
      }

      const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
      res.redirect(`/home?token=${token}`);

    });

    const verifyToken = (req, res, next) => {
      const bypassRoutes = ['/forgot-password', '/login', '/register', '/send-recovery-email'];
      if (bypassRoutes.includes(req.path)) {
        return next(); 
      }

      const token = req.query.token;
      if (!token) return res.status(403).send('A token is required for authentication');
    
      try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(401).send('Invalid Token');
      }
    };

  app.use((req, res, next) => {
    const bypassRoutes = ['/forgot-password', '/login', '/register', '/send-recovery-email'];
    if (bypassRoutes.includes(req.path)) {
      return next(); 
    }

    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      //return res.status(403).send("A token is required for authentication");
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    next();
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

  /* app.use(session({
    secret: 'asdkj37qoa839',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } 
  }));*/

  const itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [String], 
    createdAt: { type: Date, default: Date.now },
    languages: [String], 
  });

  const Item = mongoose.model('Item', itemSchema);

  module.exports = Item;



  app.get('/home', verifyToken, async (req, res) => {
    if (req.user && req.user.role) {
      const token = req.query.token;
      const role = req.user.role;
      const gitConnectedResponse = await axios.get('https://gitconnected.com/v1/portfolio/utd14');
      const gitConnectedData = gitConnectedResponse.data;
      const githubToken = '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'; 
      const githubGraphQLResponse = await axios.post(
        'https://api.github.com/graphql',
        {
          query: `
            query {
              user(login: "utd14") {
                contributionsCollection(from: "2023-01-01T00:00:00Z", to: "2023-12-31T23:59:59Z") {
                  contributionCalendar {
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                      }
                    }
                  }
                }
              }
            }
          `
        },
        {
          headers: {
            Authorization: `bearer ${githubToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const githubData = githubGraphQLResponse.data.data;

      const items = await Item.find({});
      res.render('home', { role: role, token: token, items: items, profile: gitConnectedData, github: githubData });
    } else {
      res.status(401).send("Unauthorized: No valid token provided.");
    }
  });

  app.get('/admin', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }
    const token = req.query.token;
    const role = req.user.role;
    const items = await Item.find({});
    res.render('admin', {token: token, role: role, items: items});
  });

  async function fetchGitConnectedProfile() {
    const response = await axios.get('https://gitconnected.com/v1/portfolio/utd14');
    return response.data; 
  }

  app.post('/admin/add-item', verifyToken, async (req, res) => {
    const { title, description, images, languages } = req.body; 
    const newItem = new Item({ title, description, images: images.split(', '), languages: languages.split(', ') });
    await newItem.save();
    //res.redirect('/home?token=${token}');
  });

  app.post('/admin/update-item/:itemId', verifyToken, async (req, res) => {
    const { title, description, images, languages } = req.body;
    await Item.findByIdAndUpdate(req.params.itemId, {
        title,
        description,
        images: images.split(',').map(img => img.trim()),
        languages: languages.split(',').map(lang => lang.trim())
    });
    //res.redirect('/home?token=${token}');
  });

  app.post('/admin/delete-item/:itemId', verifyToken, async (req, res) => {
    await Item.findByIdAndDelete(req.params.itemId);
    //res.redirect('/home?token=${token}');
  });
