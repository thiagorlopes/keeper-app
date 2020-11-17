const db = require("../models");
const User = db.User;
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.current = (req, res) => {
    res.send(req.isAuthenticated());
};

exports.signup = (req, res, next) => {
    passport.authenticate("local-signup", function(err, user) {
      if(err) {
        return next(err);
      }
    
      if(user.notUnique) {
        return res.status(422).send(user);
      }

      req.login(user, function(err) {
        if(err) {
          return next(err);
        }
        return res.send({success: true, user_id: user.id, message: "login succeeded"});
      });
    })(req, res, next);
  };

exports.login = (req, res, next) => {
    passport.authenticate("local-login", function(err, user) {
      if(err) {
        return next(err);
      }

      if(!user) {
        return res.status(400).send({success: false, message: "wrong username or password"});
      }

      req.login(user, function(err) {
        if(err) {
          return next(err);
        }

        return res.send({success: true, userId: user.id, message: "login succeeded"});
      });
    })(req, res, next);
  }

exports.logout = (req, res) => {
    console.log("logging out");
    req.session.destroy(function (err) {
        if (err) console.log(err)
        return res.send({success: true, message: "logout succeeded"});
    });
}

exports.forgot = (req, res) => {

  // Generate password reset token
  crypto.randomBytes(20, function(err, buf) {
    if(err) {
      res.status(400).send(err);
    }
    var token = buf.toString("hex");

    return findUser(token);
  });

  // If username exists, token value and expiration date are stored in database
  function findUser(token) {
    console.log();
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(function(user) {
      if(!user) {
        return res.status(422).json({message: "No account with that email exists."});
      }

      user.reset_password_token = token;
      user.reset_password_expires = Date.now() + 60*60*1000;

      // If user is successfully saved on database, send token to them through SMTP server
      user.save().then(function(user) {
        sendEmail(token, user); 
      }).catch(function(error) {
        res.status(422).send(error);
      });
    })
    .catch((e) => {
      res.status(422).json({message: "No account with that email exists."});
    });
  }

  function sendEmail(token, user){
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    var resetOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Keeper Password Reset",
      html: `<p>Hi, ${user.username}</p>
      <p>You recently requested to reset your password for your Keeper account.
      Click the link below to reset it.</p> 
      <a href="http://${req.headers["x-forwarded-host"]}/reset/${token}">Reset password</a>
      <p>If you did not request a password reset, please ignore this email or reply to let us know.
      This password reset is only valid for the next hour.<p>

      <p>Thanks,<br />
      Thiago Rodrigues</p>
      <hr />

      <h4 style="font-weight:normal;">If you are having trouble clicking the password reset link, copy and paste the URL below
      into your browser</h4>
      http://${req.headers["x-forwarded-host"]}/reset/${token}`
    }; 

    transporter.sendMail(resetOptions, function(err, info){
      console.log(info);
      if(err) {
        res.status(400).send(err);
      } else {
        console.log ("success", "An e-mail has been sent to " + user.email + " with further instructions to reset password.");
        return res.status(200).json({
          success: true,
          message: `An email has been sent to ${user.email} with further instructions to reset the password.`
        });
      }
    });
  }
}

// If token is valid, redirect user to password reset screen
exports.reset = (req, res) => {
  console.log(new Date().toLocaleString());
  User.findOne({
    where: {
      reset_password_token: req.params.token,
      reset_password_expires: { $gt: new Date().toLocaleString() }
    }
  }).then(function(user) {
    if(!user) {
      return res.status(422).json({message: "Token is invalid or has expired."});
    }
    return res.status(200).send({successRedirect: "/login", failureRedirect: "/reset"});
  })
  .catch((e) => {
    console.log(e);
  });
}
