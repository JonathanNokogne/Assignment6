const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
require('dotenv').config();

let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }]
});

let User; // to be defined on new connection

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);

        db.on('error', (err) => {
            reject(err); 
        });

        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            // Hash the password before saving the user
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save().then(() => {
                    resolve();
                }).catch((err) => {
                    if (err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                });
            }).catch(err => {
                reject("There was an error encrypting the password");
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName }).exec()
            .then((users) => {
                if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    // Compare the hashed password
                    bcrypt.compare(userData.password, users[0].password).then((result) => {
                        if (result === true) {
                            if (users[0].loginHistory.length === 8) {
                                users[0].loginHistory.pop();
                            }
                            users[0].loginHistory.unshift({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                            User.updateOne({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } })
                                .exec()
                                .then(() => {
                                    resolve(users[0]);
                                }).catch((err) => {
                                    reject("There was an error verifying the user: " + err);
                                });
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    });
                }
            }).catch(() => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};
