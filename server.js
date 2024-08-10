/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jonathan Joy Nokogne Tene Student ID: 106100225 Date: 07/08/2024
*
*  Published URL: https://github.com/JonathanNokogne/assignment6.git
*
********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const authData = require('./modules/auth-service');
const path = require("path");

const app = express();
const clientSessions = require('client-sessions');

// Set the view engine to ejs
app.set("view engine", "ejs");

// Middleware to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(clientSessions({
    cookieName: "session",
    secret: "yourSecretKey", // Use a strong key
    duration: 24 * 60 * 60 * 1000, // 24 hours
    activeDuration: 1000 * 60 * 5 // 5 minutes
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lego/sets", ensureLogin, async (req, res) => {
    try {
        const sets = await legoData.getAllSets();
        res.render("sets", { sets: sets });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/lego/sets/:num", ensureLogin, async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.num);
        res.render("set", { set: set });
    } catch (error) {
        res.status(404).render("404", { message: "Set not found" });
    }
});

app.get("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
    try {
        const [set, themes] = await Promise.all([legoData.getSetByNum(req.params.num), legoData.getAllThemes()]);
        res.render("editSet", { set, themes });
    } catch (error) {
        res.status(404).render("404", { message: "Set not found" });
    }
});

app.post("/lego/editSet", ensureLogin, async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { userName: '', errorMessage: null });
});

app.get('/register', (req, res) => {
    res.render('register', { successMessage: null, errorMessage: null, userName: '' });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body).then(() => {
        console.log("Registration successful"); 
        res.render('register', { 
            successMessage: "User created successfully", 
            errorMessage: null, 
            userName: '' 
        });
    }).catch((err) => {
        console.log("Registration error: ", err); 
        res.render('register', { 
            errorMessage: err, 
            successMessage: null, 
            userName: req.body.userName 
        });
    });
});




app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    }).catch(error => {
        console.error("Failed to initialize data:", error);
    });
