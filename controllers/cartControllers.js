const Cart = require("../models/cart");
const Order = require("../models/Orders");
const User = require("../models/user");
const Project = require("../models/Project");
const Pricing = require("../models/productPricing");
const coreproductinfos = require("../models/coreProductInformation");
var mongoose = require("mongoose");
const moment = require("moment");
const sgMail = require("@sendgrid/mail");
const { getMaxListeners } = require("../models/cart");

let Designer_html =
  `<div style="width:600px; text-align: center; margin:auto">` +
  `<table style="margin:auto"><tbody><tr><td style="font-size:6px; line-height:10px; padding:30px 0px 25px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png" alt="Ingrid & Anders" width="300" data-responsive="true" data-proportionally-constrained="false"></td></tr></tbody></table>` +
  `<div style="font-family: inherit; text-align: center"><br></div>` +
  `<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>Congratulations!</strong></span></div>` +
  `<div style="font-family: inherit; text-align: center"><br></div>` +
  `<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-family: georgia, serif; font-size: 18px"><strong>One of your clients has finalized a purchase.&nbsp;</strong></span></div>` +
  `<div style="font-family: inherit; text-align: center"><br></div>` +
  `<div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">The total commission from this purchase will be updated to your Hemly account in the next few days. The commission itself will be available for withdrawal 7 days after clients receipt of merchandise. As an additional confirmation, we will send another email letting you know when the funds are available to withdraw!</span></div>
    <div style="font-family: inherit; text-align: center"><br></div>
    <div style="font-family: inherit; text-align: center"><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">Please let us know if you have any questions or concerns at hello@hemlyco.com</span></div>` +
  `</div>`;

const addToCart = async (req, res) => {
  try {
    const newCart = new Cart({
      buyerId: req.user.id,
      // price: req.body.price,
      MOE_ITEM: req.body.MOE_ITEM,
      quantity: req.body.quantity,
      projectId: req.body.projectId,
    });

    Cart.findOne({
      buyerId: req.user.id,
      MOE_ITEM: req.body.MOE_ITEM,
      paid: false,
    })
      .then((product) => {
        if (product) {
          res.status(400).json({
            message: "Product already in your cart",
            success: false,
          });
        } else {
          newCart
            .save()
            .then((project) => {
              res.status(200).json({
                message: "Added to your cart successfully",
                success: true,
              });
            })
            .catch((err) => {
              res.status(404).json({ message: err.message, success: false });
            });
        }
      })

      .catch((err) => {
        res.status(404).json({ message: err.message, success: false });
      });
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const updateQuantity = async (req, res) => {
  try {
    if (parseInt(req.body.quantity) == 0) {
      Cart.findOneAndRemove(
        {
          buyerId: mongoose.Types.ObjectId(req.user.id),
          MOE_ITEM: req.body.MOE_ITEM,
          paid: false,
        },
        (err, doc) => {
          if (err) {
            res.status(404).json({ message: err.message, success: false });
          } else {
            res.status(200).json({
              message: "quantity of product changed successfully",
              success: true,
            });
          }
        }
      );
    } else {
      Cart.findOneAndUpdate(
        {
          buyerId: mongoose.Types.ObjectId(req.user.id),
          MOE_ITEM: req.body.MOE_ITEM,
          paid: false,
        },
        { $set: { quantity: req.body.quantity } },
        { new: true },
        (err, doc) => {
          if (err) {
            res.status(404).json({ message: err.message, success: false });
          } else {
            res.status(200).json({
              message: "quantity of product changed successfully",
              success: true,
            });
          }
        }
      );
    }
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const getCartItem = async (req, res) => {
  try {
    Cart.aggregate(
      [
        {
          $match: {
            $and: [
              {
                buyerId: mongoose.Types.ObjectId(req.user.id),
                MOE_ITEM: req.body.MOE_ITEM,
                // paid: false,
              },
            ],
          },
        },
        {
          $lookup: {
            from: "coreproductinfos",
            localField: "MOE_ITEM",
            foreignField: "MOE_item",
            as: "productinfo",
          },
        },
        { $unwind: "$productinfo" },

        {
          $lookup: {
            from: "inventorydetails",
            localField: "productinfo.UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "productinfo.UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
      ],
      (err, docs) => {
        if (err) {
          console.log("error in fetching-=-=-=", err);
          res.status(404).json({ message: err.message, success: false });
        } else {
          res.status(200).json({ message: docs, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};
const getCartItems = async (req, res) => {
  try {
    Cart.aggregate(
      [
        {
          $match: {
            $and: [
              {
                buyerId: mongoose.Types.ObjectId(req.user.id),
                // MOE_ITEM: req.body.MOE_ITEM,
                paid: false,
              },
            ],
          },
        },
        {
          $lookup: {
            from: "coreproductinfos",
            localField: "MOE_ITEM",
            foreignField: "MOE_item",
            as: "productinfo",
          },
        },
        { $unwind: "$productinfo" },

        {
          $lookup: {
            from: "inventorydetails",
            localField: "productinfo.UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "productinfo.UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
      ],
      (err, docs) => {
        if (err) {
          console.log("error in fetching-=-=-=", err);
          res.status(404).json({ message: err.message, success: false });
        } else {
          res.status(200).json({ message: docs, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};

const changePaidStatus = async (req, res) => {
  let productHTML = "";
  let designerEmails = [];

  let userObject = await User.findOne({ _id: req.body.id });
  console.log("userObject-=-=-=-=-=", userObject);

  Cart.find({ buyerId: mongoose.Types.ObjectId(req.body.id), paid: false })
    .then(async (docs) => {
      const promises1 = docs.map(async (doc, i) => {
        let price = 0;

        let productObject = await coreproductinfos.findOne({
          MOE_item: doc.MOE_ITEM,
        });
        let productPricing = await Pricing.findOne({
          MOE_item: doc.MOE_ITEM,
        });
        if (doc.projectId != null) {
          price = productPricing.Map;
        } else {
          price = productPricing.ECommerceCost;
        }
        let email = "";

        if (doc.projectId) {
          if (doc.projectId != null) {
            let projectObject = await Project.findOne({ _id: doc.projectId });
            console.log("projectObject-=-=-=-=-=", projectObject);

            let userObject = await User.findOne({
              _id: projectObject.designerId,
            });
            console.log("projectObject-=-=-=-=-=", userObject);

            designerEmails.push(userObject.email);
            email = userObject.email;
            const newOrder = new Order({
              buyerId: doc.buyerId,
              MOE_ITEM: doc.MOE_ITEM,
              quantity: doc.quantity,
              projectId: doc.projectId,
            });
            await newOrder.save();
          } else {
            const newOrder = new Order({
              buyerId: doc.buyerId,
              MOE_ITEM: doc.MOE_ITEM,
              quantity: doc.quantity,
            });
            await newOrder.save();
          }
        } else {
          const newOrder = new Order({
            buyerId: doc.buyerId,
            MOE_ITEM: doc.MOE_ITEM,
            quantity: doc.quantity,
          });
          await newOrder.save();
        }
        productHTML =
          productHTML +
          `<div style="font-family: inherit;  display:flex; justify-content: space-between;">
                      <img src="${productObject.productImagesLinks[0]}" style="width:40%; margin-right:10px"/><div><div style="color: #506372; font-family: georgia, serif ">MOE ITEM NAME : ${productObject.MOE_productName}</div><div style="color: #506372; font-family: georgia, serif">MOE ITEM : ${productObject.MOE_item}</div><div style="color: #506372; font-family: georgia, serif">Quantity : ${doc.quantity}</div><div style="color: #506372; font-family: georgia, serif">Unit price : ${price}</div>` +
          `${
            email != ""
              ? `<div style="color: #506372; font-family: georgia, serif">Designer Email : ${email}</div>`
              : ``
          }` +
          `</div></div><br/>`;

        //   console.log("row-=-=-=-=-=", row.length);

        await Cart.findByIdAndRemove(doc._id);
      });
      const numPromise1 = await Promise.all(promises1);
      if (numPromise1.length == docs.length) {
        console.log("designerEmails-=-=-=-=-=", designerEmails);

        let uniqueArray = designerEmails.filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });

        console.log("uniqueArray-=-=-=-=-=", uniqueArray);
        const promises2 = uniqueArray.map((email) => {
          const data = {
            to: email,
            from: process.env.SENDGRID_SENDER,
            subject: `Congratulations on a sale: ${moment().format(
              "MMMM Do, YYYY"
            )}`,
            html: Designer_html,
          };
          sgMail
            .send(data)
            .then(async (response) => {})
            .catch((error) => {
              console.log("error-=-=", error);
            });
        });
        const numPromise2 = await Promise.all(promises2);
        if (numPromise2.length == uniqueArray.length) {
          let html =
            `<div style="width:600px;  margin:auto">` +
            `<table style="margin:auto"><tbody><tr><td style="font-size:6px; line-height:10px; padding:30px 0px 25px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png" alt="Ingrid & Anders" width="300" data-responsive="true" data-proportionally-constrained="false"></td></tr></tbody></table>` +
            `<div style="font-family: inherit; text-align: center"><br></div>` +
            `<div style="font-family: inherit; "><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>New Order!</strong></span></div>` +
            `<div style="font-family: inherit; text-align: center"><br></div>` +
            `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">User details</span></div>` +
            `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif"><div>User name :${userObject.firstname
              .charAt(0)
              .toUpperCase()}${userObject.firstname.slice(1)} ${
              userObject.lastname
            }</div><div>Email address :${
              userObject.email
            }</div><div>User role :${
              userObject.role
            }</div><div>Shipping details :${userObject.address.line1} ${
              userObject.address.line2
            }, ${userObject.address.city},  ${userObject.address.state} - ${
              userObject.address.zipcode
            }</div>` +
            `<div>Point of contact (name) :${userObject.address.pointOfContact
              .charAt(0)
              .toUpperCase()}${userObject.address.pointOfContact.slice(
              1
            )}</div>` +
            `<div>Contact phone number :${userObject.address.Contactphonenumber}</div>` +
            `<div>Shipping Instructions :${userObject.address.shippingInstructions}</div>` +
            `</span></div>
                                  <div style="font-family: inherit; text-align: center"><br></div>` +
            productHTML +
            `</div>`;
          const data2 = {
            // to: ["bshivangi47@gmail.com", "bshicangi19@gmail.com"],
            to: [
              process.env.SENDGRID_SENDER,
              "jon.tenorio@hemlyco.com",
              "david.mcnamara@hemlyco.com",
            ],

            from: process.env.SENDGRID_SENDER,
            subject: `New order: ${moment().format(
              "MMMM Do, YYYY,  h:mm:ss a"
            )}`,
            html: html,
          };
          sgMail
            .send(data2)
            .then(async (response) => {})
            .catch((error) => {
              console.log("error-=-=", error);
            });
          res
            .status(200)
            .json({ message: "Updated successfully", success: true });
        } else {
          res
            .status(404)
            .json({ message: "Something went wrong!", success: false });
        }
      } else {
        res
          .status(404)
          .json({ message: "Something went wrong!", success: false });
      }
    })
    .catch((err) => {
      res.status(404).json({ message: err.message, success: false });
    });
  // }
};

const addToOrder = async (req, res) => {
  try {
    let userObject = await User.findOne({ _id: req.body.id });

    const newOrder = new Order({
      buyerId: req.body.id,
      MOE_ITEM: req.body.itemId,
      quantity: req.body.quantity,
    });
    let productObject = await coreproductinfos.findOne({
      MOE_item: req.body.itemId,
    });
    let productPricing = await Pricing.findOne({
      MOE_item: req.body.itemId,
    });
    if (userObject.role == "client") {
      price = productPricing.Map;
    } else {
      price = productPricing.ECommerceCost;
    }
    let productHTML = `<div style="font-family: inherit;  display:flex; justify-content: space-between;">
                      <img src="${productObject.productImagesLinks[0]}" style="width:40%; margin-right:10px"/><div><div style="color: #506372; font-family: georgia, serif ">MOE ITEM NAME : ${productObject.MOE_productName}</div><div style="color: #506372; font-family: georgia, serif">MOE ITEM : ${productObject.MOE_item}</div><div style="color: #506372; font-family: georgia, serif">Quantity : ${req.body.quantity}</div><div style="color: #506372; font-family: georgia, serif">Unit price : ${price}</div></div></div>`;

    newOrder
      .save()
      .then((doc) => {
        let html =
          `<div style="width:600px;  margin:auto">` +
          `<table style="margin:auto"><tbody><tr><td style="font-size:6px; line-height:10px; padding:30px 0px 25px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png" alt="Ingrid & Anders" width="300" data-responsive="true" data-proportionally-constrained="false"></td></tr></tbody></table>` +
          `<div style="font-family: inherit; text-align: center"><br></div>` +
          `<div style="font-family: inherit; "><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>New Order!</strong></span></div>` +
          `<div style="font-family: inherit; text-align: center"><br></div>` +
          `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">User details</span></div>` +
          `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif"><div>User name :${userObject.firstname} ${userObject.lastname}</div><div>Email address :${userObject.email}</div><div>User role :${userObject.role}</div><div>Shipping details :${userObject.address.line1} ${userObject.address.line2}, ${userObject.address.city},  ${userObject.address.state} - ${userObject.address.zipcode}</div></span></div>
                                  <div style="font-family: inherit; text-align: center"><br></div>` +
          productHTML +
          `</div>`;
        const data2 = {
          to: process.env.SENDGRID_SENDER,
          from: process.env.SENDGRID_SENDER,
          subject: `New order: ${moment().format("MMMM Do, YYYY,  h:mm:ss a")}`,
          html: html,
        };
        sgMail
          .send(data2)
          .then(async (response) => {})
          .catch((error) => {
            console.log("error-=-=", error);
          });
        res
          .status(200)
          .json({ message: "Updated successfully", success: true });
      })
      .catch((err) => {
        res.status(404).json({ message: err.message, success: false });
      });
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};

const getPastOrders = async (req, res) => {
  try {
    Order.aggregate(
      [
        {
          $match: {
            buyerId: mongoose.Types.ObjectId(req.user.id),
          },
        },
        {
          $lookup: {
            from: "coreproductinfos",
            localField: "MOE_ITEM",
            foreignField: "MOE_item",
            as: "productinfo",
          },
        },
        { $unwind: "$productinfo" },

        {
          $lookup: {
            from: "inventorydetails",
            localField: "productinfo.UPC",
            foreignField: "UPC_Code",
            as: "InventoryDetails",
          },
        },
        {
          $lookup: {
            from: "productpricings",
            localField: "productinfo.UPC",
            foreignField: "UPC",
            as: "pricing",
          },
        },
        { $unwind: "$InventoryDetails" },
        { $sort: { createdAt: -1 } },
      ],
      (err, docs) => {
        if (err) {
          console.log("error in fetching-=-=-=", err);
          res.status(404).json({ message: err.message, success: false });
        } else {
          res.status(200).json({ message: docs, success: true });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ message: error.message, success: false });
  }
};

module.exports = {
  addToCart,
  changePaidStatus,
  getCartItems,
  updateQuantity,
  getCartItem,
  addToOrder,
  getPastOrders,
};
