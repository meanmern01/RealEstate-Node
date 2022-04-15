const mongoose = require("mongoose");
const Users = require("../models/user");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var request = require("request");

const sgMail = require("@sendgrid/mail");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    if (!firstname || !lastname || !email || !password) {
      res
        .status(400)
        .json({ message: "Please enter all the fields", success: false });
    } else if (
      /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i.test(
        email
      ) == false
    ) {
      res.status(400).json({ message: "Invalid email", success: false });
    } else {
      Users.findOne({ email: email })
        .then((user) => {
          if (user) {
            res.status(400).json({
              message:
                "An account is already registered with this email address",
              success: false,
            });
          } else {
            const newUser = new Users({
              firstname,
              lastname,
              email,
              password,
              role,
            });
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                  res
                    .status(404)
                    .json({ message: err.message, success: false });
                }
                newUser.password = hash;
                newUser.save().then((user) => {
                  jwt.sign(
                    {
                      id: user.id,
                      email: user.email,
                      firstname: user.firstname,
                      lastname: user.lastname,
                    },
                    process.env.JWT_SECRET,
                    {
                      expiresIn: 3600,
                    },
                    (err, token) => {
                      if (err) throw err;
                      else {
                        if (user.role == "designer") {
                          var options = {
                            method: "PUT",
                            url:
                              "https://api.sendgrid.com/v3/marketing/contacts",
                            headers: {
                              "content-type": "application/json",
                              authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                            },
                            body: {
                              list_ids: [
                                "ae3e5f76-78b5-43c7-a8a2-40929bac9274",
                              ],
                              contacts: [
                                {
                                  email: user.email,
                                  first_name: user.firstname,
                                  last_name: user.lastname,
                                },
                              ],
                            },
                            json: true,
                          };
                          request(
                            options,
                            async function (error, response, body) {
                              console.log("bdy-=-=", body, response);
                              if (error) {
                                res.status(404).json({
                                  message: error.message,
                                  success: false,
                                });
                              } else {
                                const data = {
                                  to: user.email,
                                  from: process.env.SENDGRID_SENDER,
                                  subject: `Welcome to Hemly!`,
                                  // text:
                                  //   "Hi " +
                                  //   user.firstname.charAt(0).toUpperCase() +
                                  //   user.firstname.slice(1) +
                                  //   "! (don't mind our dust)" +
                                  //   ".\n\n" +
                                  //   `Thank you for exploring Hemly during our beta launch. Hemly is a brand new company with an exciting platform that empowers you to turn your passion for home décor / interior decorating into your own personal business. We have a ton of instructional information within our app under the "How To" section (located on the navigation panel in our app). This section is the best resource to help learn the platform and see all that Hemly has to offer. If there is ever any problems that can't be answered on the "How To" tutorials, please don't hesitate to reach out!` +
                                  //   ".\n\n" +
                                  //   `You can reach out to hello@hemlyco.com at any time and a real person will get back to you.` +
                                  //   ".\n\n" +
                                  //   "Welcome to the Hemly community! We are excited to take this adventure with you. " +
                                  //   ".\n\n",
                                  html:
                                    `<div style="width:600px; text-align: center; margin:auto">` +
                                    `<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>Hi ${
                                      user.firstname.charAt(0).toUpperCase() +
                                      user.firstname.slice(1)
                                    }!</strong></span></div><div style="font-family: inherit; text-align: center"><br></div><div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 16px; font-family: georgia, serif"><strong>(don't mind our dust)</strong></span></div> <div style="font-family: inherit; text-align: center"><br></div>` +
                                    `<div style="text-align: center;color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">Thank you for exploring Hemly during our beta launch. Hemly is a brand new company with an exciting platform that empowers you to turn your passion for home décor / interior decorating into your own personal business. We have a ton of instructional information within our app under the "How To" section (located on the navigation panel in our app). This section is the best resource to help learn the platform and see all that Hemly has to offer. If there is ever any problems that can't be answered on the "How To" tutorials, please don't hesitate to reach out!</div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">You can reach out to hello@hemlyco.com at any time and a real person will get back to you.</span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">Welcome to the Hemly community! We are excited to take this adventure with you.</span></div>` +
                                    `<table style="margin:auto"><tbody><tr><td style="line-height:10px; padding:30px 0px 20px 0px; " valign="top" align="center">
                    <img class="imageTag" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; width: 40%; max-width: 300px !important;"   alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png">
                  </td></tr></tbody></table></div>`,
                                };
                                sgMail
                                  .send(data)
                                  .then(async (response) => {
                                    console.log("Response-=-=", response);
                                    res.status(200).json({
                                      message: {
                                        token,
                                        user,
                                      },
                                      success: true,
                                    });
                                  })
                                  .catch((error) => {
                                    console.log("error-=-=", error);
                                    res.status(422).send({
                                      success: false,
                                      message: error.message,
                                    });
                                  });
                              }
                            }
                            // });
                          );
                        } else {
                          res.status(200).json({
                            message: {
                              token,
                              user,
                            },
                            success: true,
                          });
                        }
                      }
                    }
                  );
                });
              });
            });
          }
        })
        .catch((err) =>
          res.status(404).json({ message: err.message, success: false })
        );
    }
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "Please enter all the fields", success: false });
  } else {
    Users.findOne({ email: email })
      .then((user) => {
        if (!user) {
          res.status(400).json({
            message: "No account is registered with this email",
            success: false,
          });
        } else {
          bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
              jwt.sign(
                {
                  id: user.id,
                  email: user.email,
                  firstname: user.firstname,
                  lastname: user.lastname,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: 3600,
                },
                (err, token) => {
                  if (err) {
                    res.status(400).json({
                      message: error.message,
                      success: false,
                    });
                  }

                  res.status(200).json({
                    message: {
                      token,
                      user,
                    },
                    success: true,
                  });
                }
              );
            } else {
              res.status(400).json({
                message: "Invalid password. Please try again!",
                success: false,
              });
            }
          });
        }
      })
      .catch((error) =>
        res.status(404).json({ message: error.message, success: false })
      );
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email) {
    res
      .status(400)
      .json({ message: "Please enter all the fields", success: false });
  } else {
    if (!emailRegexp.test(email)) {
      return res.send({ success: false, message: "Invalid Email" });
    }

    Users.findOne({ email: email })
      .then((user) => {
        if (!user) {
          res.status(400).json({
            message: "No account is registered with this email",
            success: false,
          });
        } else {
          jwt.sign(
            {
              id: user.id,
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: 3600,
            },
            (err, token) => {
              if (err) {
                res.status(400).json({
                  message: error.message,
                  success: false,
                });
              } else {
                const data = {
                  to: email,
                  from: process.env.SENDGRID_SENDER,
                  subject: "Click Below Link To Reset Password ",
                  text:
                    "Confirm your email address to get started.\n\n" +
                    "Please click on the following link, or paste it into your browser to reset you password:\n\n" +
                    process.env.BASEURL +
                    "/resetPassword?token=" +
                    token +
                    "\n\n" +
                    "If you haven't initiated the reset password process then please ignore this email. Your password will remain unchanged.\n",
                };
                sgMail
                  .send(data)
                  .then(async (response) => {
                    res.status(200).send({
                      success: true,
                      message:
                        "Please check your email to reset your password!",
                    });
                  })
                  .catch((error) => {
                    res.status(422).send({
                      success: false,
                      message: error.message,
                    });
                  });
              }
            }
          );
        }
      })
      .catch((error) =>
        res.status(404).json({ message: error.message, success: false })
      );
  }
};
const resetPassword = async (req, res) => {
  console.log("=====reset password");
  try {
    const token = req.body.token; //JWT
    const decoded = jwt.decode(token);
    console.log("===email", decoded);
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        if (err) {
          res.status(404).json({ message: err.message, success: false });
        }
        let password = hash;
        await Users.findOneAndUpdate(
          { email: decoded.email },
          { password: password }
        );
        console.log("resetPassword done::::::", decoded.email);
        return res.status(200).send({
          success: true,
          message: "Your password is changed successfully",
        });
      });
    });
  } catch (err) {
    console.log("=====error");
    res.status(422).send({ success: false, message: err.message });
  }
};

const validtestToken = async (req, res) => {
  res.status(200).json({ message: "Authenticated", success: true });
};

const ContactUs = async (req, res) => {
  const { email, subject, body } = req.body;
  console.log("req,body", req.body);
  const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email && !subject && !body) {
    res
      .status(400)
      .json({ message: "Please enter all the fields", success: false });
  } else {
    if (!emailRegexp.test(email)) {
      return res.send({ success: false, message: "Invalid Email" });
    }

    const data = {
      to: process.env.SENDGRID_SENDER,
      // to: "bshicangi19@gmail.com",
      from: process.env.SENDGRID_SENDER,
      subject: subject,
      text: "The email address of this sender is:" + email + ".\n\n" + body,
    };
    sgMail
      .send(data)
      .then((response) => {
        console.log("Response-=-=", response);
        res.status(200).send({
          success: true,
          message:
            "Thank you for your message! We have received your email and will get back to you soon.",
        });
      })
      .catch((error) => {
        console.log("error-=-=", error);

        res.status(422).send({
          success: false,
          message: error.message,
        });
      });
  }
};

const StoreAddress = async (req, res) => {
  try {
    await Users.findOneAndUpdate(
      { email: req.user.email },
      {
        address: {
          line1: req.body.addressInfo.line1,
          line2: req.body.addressInfo.line2,
          city: req.body.addressInfo.city,
          state: req.body.addressInfo.state,
          zipcode: req.body.addressInfo.zipcode,
          country: req.body.addressInfo.country,
        },
      }
    );

    return res.status(200).send({
      success: true,
      message: "Your shipping details are stored successfully",
    });
  } catch (err) {
    console.log("=====error");
    res.status(422).send({ success: false, message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    Users.findOne({ _id: req.user.id })
      .then((user) => {
        res.status(200).json({ message: user, success: true });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
};

module.exports = {
  signup,
  login,
  validtestToken,
  forgotPassword,
  resetPassword,
  ContactUs,
  StoreAddress,
  getUser,
};
