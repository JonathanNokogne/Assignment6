/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jonathan Joy Nokogne Tene Student ID: 106100225 Date: 02/08/2024
*
*  Published URL: https://github.com/JonathanNokogne/Assignment-5.git
*
********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");

const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");

// Middleware to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lego/sets", async (req, res) => {
    try {
        const sets = await legoData.getAllSets();
        res.render("sets", { sets: sets });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/lego/sets/:num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.num);
        res.render("set", { set: set });
    } catch (error) {
        res.status(404).render("404", { message: "Set not found" });
    }
});

app.get("/lego/addSet", async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.post("/lego/addSet", async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get("/lego/editSet/:num", async (req, res) => {
    try {
        const [set, themes] = await Promise.all([legoData.getSetByNum(req.params.num), legoData.getAllThemes()]);
        res.render("editSet", { set, themes });
    } catch (error) {
        res.status(404).render("404", { message: "Set not found" });
    }
});

app.post("/lego/editSet", async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

legoData.initialize().then(() => {
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}).catch(error => {
    console.error("Failed to initialize data:", error);
});
