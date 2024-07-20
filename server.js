/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jonathan Joy Nokogne Tene Student ID: 106100225 Date: 07/18/2024
*
*  Published URL: 
*
********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");

const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lego/sets", async (req, res) => {
    try {
        await legoData.initialize();
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
