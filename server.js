import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import { Users } from './Routes/Users.js'
import { fileURLToPath } from 'url';
import trackerRoutes from './Routes/TrackerRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
app.use(express.json());


mongoose.connect('mongodb+srv://harshitrath9990:Rathore8880%40@goals.a4wxwmi.mongodb.net/').then(() => console.log("Mongodb Connected")).catch(err => console.log("Mongodb error", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
    sameSite: 'lax', 
  }
}));
// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Protected dashboard route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/');
  }
});

// Use user routes
app.use('/',Users);
app.use('/',trackerRoutes);


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
