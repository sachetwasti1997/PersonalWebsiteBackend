const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      fetchedUser = user;
      if (!user) {
        return res.status(404).json({
          message:
            "No user with given email found! Please try logging in earlier.",
        });
      }
      console.log(user);
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "Password entered is incorrect. Please try again.",
        });
      }
      const tokenGenerated = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "long_string_secret_not_to_be_shared"
      );
      return res.status(200).json({
        token: tokenGenerated,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Auth Failed, due to some internal server. Please try again later!",
      });
    });
});

module.exports = router;
