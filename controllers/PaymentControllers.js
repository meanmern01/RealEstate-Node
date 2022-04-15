const Stripe = require("stripe");
const dotenv = require("dotenv");
const request = require("request");
const Cart = require("../models/cart");
const Order = require("../models/Orders");
const User = require("../models/user");
const Project = require("../models/Project");
const SalesTax = require("../models/SalesTax");

const moment = require("moment");
const sgMail = require("@sendgrid/mail");
const Avatax = require("avatax");
dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const config = {
  appName: "Hemly",
  appVersion: "1.0",
  environment: "production",
  // machineName: "your-machine-name",
};

const creds = {
  username: "2000785707",
  password: "D5C15BB99B0759E1",
};

var client = new Avatax(config).withSecurity(creds);

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

const payment = async (req, res) => {
  try {
    let userObject = await User.findOne({ email: req.user.email });
    let customer = null;
    const taxDocument = {
      type: "SalesInvoice",
      date: moment(),
      customerCode: "ABC",
      addresses: {
        SingleLocation: {
          // line1: "123 Main Street",
          // line2: "123 Main Street",
          city: req.body.addressInfo.city,
          region: req.body.addressInfo.state,
          country: "US",
          postalCode: req.body.addressInfo.zipcode,
        },
      },
      lines: [
        {
          number: "1",
          quantity: "1",
          amount: "200",
        },
      ],
      commit: true,
      currencyCode: "USD",
    };
    let salesTax = await SalesTax.findOne({
      state: req.body.addressInfo.state,
      city: req.body.addressInfo.city,
      zipcode: req.body.addressInfo.zipcode,
    });

    if (userObject.stripe_customer_id) {
      customer = await stripe.customers.retrieve(userObject.stripe_customer_id);
      console.log("customer.address", customer.address);
      if (
        customer.address.line1 !== req.body.addressInfo.line1 ||
        customer.address.line2 !== req.body.addressInfo.line2 ||
        customer.address.city !== req.body.addressInfo.city ||
        customer.address.state !== req.body.addressInfo.state ||
        customer.address.postal_code !== req.body.addressInfo.zipcode
      ) {
        customer = await stripe.customers.update(customer.id, {
          address: {
            line1: req.body.addressInfo.line1,
            line2: req.body.addressInfo.line2,
            city: req.body.addressInfo.city,
            state: req.body.addressInfo.state,
            postal_code: req.body.addressInfo.zipcode,
            country: "US",
          },
          name:
            req.user.firstname.charAt(0).toUpperCase() +
            req.user.firstname.slice(1) +
            " " +
            req.user.lastname.charAt(0).toUpperCase() +
            req.user.lastname.slice(1),
          email: req.user.email,
          shipping: {
            address: {
              line1: req.body.addressInfo.line1,
              line2: req.body.addressInfo.line2,
              city: req.body.addressInfo.city,
              state: req.body.addressInfo.state,
              postal_code: req.body.addressInfo.zipcode,
              country: "US",
            },
            name:
              req.user.firstname.charAt(0).toUpperCase() +
              req.user.firstname.slice(1) +
              " " +
              req.user.lastname.charAt(0).toUpperCase() +
              req.user.lastname.slice(1),
          },
        });
      }
    } else {
      customer = await stripe.customers.create({
        address: {
          line1: req.body.addressInfo.line1,
          line2: req.body.addressInfo.line2,
          city: req.body.addressInfo.city,
          state: req.body.addressInfo.state,
          postal_code: req.body.addressInfo.zipcode,
          country: "US",
        },
        name:
          req.user.firstname.charAt(0).toUpperCase() +
          req.user.firstname.slice(1) +
          " " +
          req.user.lastname.charAt(0).toUpperCase() +
          req.user.lastname.slice(1),
        email: req.user.email,
        shipping: {
          address: {
            line1: req.body.addressInfo.line1,
            line2: req.body.addressInfo.line2,
            city: req.body.addressInfo.city,
            state: req.body.addressInfo.state,
            postal_code: req.body.addressInfo.zipcode,
            country: "US",
          },
          name:
            req.user.firstname.charAt(0).toUpperCase() +
            req.user.firstname.slice(1) +
            " " +
            req.user.lastname.charAt(0).toUpperCase() +
            req.user.lastname.slice(1),
        },
      });
    }
    console.log("req.body.addressInfo=-=-=-", req.body.addressInfo);

    User.findOneAndUpdate(
      { email: req.user.email },
      {
        address: {
          pointOfContact: req.body.addressInfo.pointOfContact,
          Contactphonenumber: req.body.addressInfo.Contactphonenumber,
          line1: req.body.addressInfo.line1,
          line2: req.body.addressInfo.line2,
          city: req.body.addressInfo.city,
          state: req.body.addressInfo.state,
          zipcode: req.body.addressInfo.zipcode,
          country: req.body.addressInfo.country,
          shippingInstructions: req.body.addressInfo.shippingInstructions,
        },
        stripe_customer_id: customer.id,
      }
    )
      .then(async (updatedUser) => {
        let authHeader = req.header("Authorization");
        const token = authHeader.split(" ")[1];
        let token_encoded = Buffer.from(token).toString("base64");

        return client
          .createTransaction({ model: taxDocument })
          .then(async (result) => {
            // response tax document
            console.log("req.body=-=-=-", result);
            if (salesTax) {
              console.log("req.body=-=-=-", salesTax);

              const promises2 = result.summary.map(async (item, i) => {
                let rate = item.rate * 100;
                console.log("rate-=-=", rate);
                let foundTax = salesTax.taxes.filter(
                  (taxObject) =>
                    taxObject.taxName == item.taxName &&
                    taxObject.country == item.country &&
                    taxObject.region == item.region &&
                    taxObject.rate == item.rate &&
                    taxObject.jurisName == item.jurisName
                );
                if (foundTax.length == 0) {
                  let taxRate = await stripe.taxRates.create({
                    display_name: item.taxName,
                    inclusive: false,
                    percentage: rate.toFixed(2),
                    country: item.country,
                    state: item.region,
                    jurisdiction: item.jurisName,
                    // description: "CA Sales Tax",
                  });
                  result.summary[i] = {
                    ...result.summary[i],
                    stripeTaxId: taxRate.id,
                  };
                }
              });
              const numFruits2 = await Promise.all(promises2);
              if (numFruits2.length == result.summary.length) {
                SalesTax.findOneAndUpdate(
                  {
                    state: req.body.addressInfo.state,
                    city: req.body.addressInfo.city,
                    zipcode: req.body.addressInfo.zipcode,
                  },
                  {
                    taxRateStripe: result.summary,
                  }
                ).then(async (user) => {
                  // res.status(200).json({ message: "stored", success: true });
                  try {
                    let { line_items } = req.body;
                    let linesArray = [];

                    let dynamicTaxRates = [];
                    let salesTax = await SalesTax.findOne({
                      state: req.body.addressInfo.state,
                      city: req.body.addressInfo.city,
                      zipcode: req.body.addressInfo.zipcode,
                    });
                    const promises2 = salesTax.taxes.map((tax) => {
                      dynamicTaxRates.push(tax.stripeTaxId);
                    });

                    const numFruits2 = await Promise.all(promises2);
                    if (numFruits2.length == result.summary.length) {
                      for (let i = 0; i < line_items.length; i++) {
                        line_items[i] = {
                          ...line_items[i],
                          tax_rates: dynamicTaxRates,
                        };
                      }

                      console.log("line_items-=-=-", line_items);
                      const session = await stripe.checkout.sessions.create({
                        payment_method_types: ["card"],
                        line_items: line_items,
                        mode: "payment",
                        customer: customer.id,
                        // customer_email: req.user.email,
                        success_url: `${process.env.BASEURL}/Cart?success=true&auth=${token_encoded}`,
                        cancel_url: `${process.env.BASEURL}/Cart?canceled=true&auth=${token_encoded}`,
                        // shipping_address_collection: {
                        //   allowed_countries: ["US"],
                        // },
                      });
                      res.status(200).json({ message: session, success: true });
                      // res.status(200).json({ message: result, success: true });
                      // }
                    }
                  } catch (error) {
                    res
                      .status(400)
                      .json({ message: error.message, success: false });
                  }
                });
              }
            } else {
              const promises2 = result.summary.map(async (item, i) => {
                let rate = item.rate * 100;
                console.log("rate-=-=", rate);
                let taxRate = await stripe.taxRates.create({
                  display_name: item.taxName,
                  inclusive: false,
                  percentage: rate.toFixed(2),
                  country: item.country,
                  state: item.region,
                  jurisdiction: item.jurisName,
                  // description: "CA Sales Tax",
                });
                result.summary[i] = {
                  ...result.summary[i],
                  stripeTaxId: taxRate.id,
                };
              });
              const numFruits2 = await Promise.all(promises2);
              if (numFruits2.length == result.summary.length) {
                const newTax = new SalesTax({
                  state: req.body.addressInfo.state,
                  city: req.body.addressInfo.city,
                  zipcode: req.body.addressInfo.zipcode,
                  taxes: result.summary,
                });
                newTax
                  .save()
                  .then(async (tax) => {
                    // res.status(200).json({ message: "stored", success: true });
                    try {
                      let { line_items } = req.body;
                      let linesArray = [];

                      let dynamicTaxRates = [];
                      let salesTax = await SalesTax.findOne({
                        state: req.body.addressInfo.state,
                        city: req.body.addressInfo.city,
                        zipcode: req.body.addressInfo.zipcode,
                      });
                      const promises2 = salesTax.taxes.map((tax) => {
                        dynamicTaxRates.push(tax.stripeTaxId);
                      });

                      const numFruits2 = await Promise.all(promises2);
                      if (numFruits2.length == result.summary.length) {
                        for (let i = 0; i < line_items.length; i++) {
                          line_items[i] = {
                            ...line_items[i],
                            tax_rates: dynamicTaxRates,
                          };
                        }

                        console.log("line_items Else-=-=-", line_items);
                        const session = await stripe.checkout.sessions.create({
                          payment_method_types: ["card"],
                          line_items: line_items,
                          mode: "payment",
                          customer: customer.id,
                          // customer_email: req.user.email,
                          success_url: `${process.env.BASEURL}/Cart?success=true&auth=${token_encoded}`,
                          cancel_url: `${process.env.BASEURL}/Cart?canceled=true&auth=${token_encoded}`,
                          // shipping_address_collection: {
                          //   allowed_countries: ["US"],
                          // },
                        });
                        res
                          .status(200)
                          .json({ message: session, success: true });
                        // res.status(200).json({ message: result, success: true });
                        // }
                      }
                    } catch (error) {
                      res
                        .status(400)
                        .json({ message: error.message, success: false });
                    }
                  })
                  .catch((err) => {
                    res
                      .status(400)
                      .json({ message: err.message, success: false });
                  });
              }
            }
          })
          .catch((err) => {
            console.log("req.body=-=-=-", err.message);

            res.status(400).json({ message: err.message, success: false });
          });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
};
const BuyNow = async (req, res) => {
  try {
    let userObject = await User.findOne({ email: req.user.email });
    let customer = null;
    const taxDocument = {
      type: "SalesInvoice",
      date: moment(),
      customerCode: "ABC",
      addresses: {
        SingleLocation: {
          // line1: "123 Main Street",
          // line2: "123 Main Street",
          city: req.body.addressInfo.city,
          region: req.body.addressInfo.state,
          country: "US",
          postalCode: req.body.addressInfo.zipcode,
        },
      },
      lines: [
        {
          number: "1",
          quantity: "1",
          amount: "200",
        },
      ],
      commit: true,
      currencyCode: "USD",
    };
    let salesTax = await SalesTax.findOne({
      state: req.body.addressInfo.state,
      city: req.body.addressInfo.city,
      zipcode: req.body.addressInfo.zipcode,
    });

    if (userObject.stripe_customer_id) {
      customer = await stripe.customers.retrieve(userObject.stripe_customer_id);
      console.log("customer.address", customer.address);
      if (
        customer.address.line1 !== req.body.addressInfo.line1 ||
        customer.address.line2 !== req.body.addressInfo.line2 ||
        customer.address.city !== req.body.addressInfo.city ||
        customer.address.state !== req.body.addressInfo.state ||
        customer.address.postal_code !== req.body.addressInfo.zipcode
      ) {
        customer = await stripe.customers.update(customer.id, {
          address: {
            line1: req.body.addressInfo.line1,
            line2: req.body.addressInfo.line2,
            city: req.body.addressInfo.city,
            state: req.body.addressInfo.state,
            postal_code: req.body.addressInfo.zipcode,
            country: "US",
          },
          name:
            req.user.firstname.charAt(0).toUpperCase() +
            req.user.firstname.slice(1) +
            " " +
            req.user.lastname.charAt(0).toUpperCase() +
            req.user.lastname.slice(1),
          email: req.user.email,
          shipping: {
            address: {
              line1: req.body.addressInfo.line1,
              line2: req.body.addressInfo.line2,
              city: req.body.addressInfo.city,
              state: req.body.addressInfo.state,
              postal_code: req.body.addressInfo.zipcode,
              country: "US",
            },
            name:
              req.user.firstname.charAt(0).toUpperCase() +
              req.user.firstname.slice(1) +
              " " +
              req.user.lastname.charAt(0).toUpperCase() +
              req.user.lastname.slice(1),
          },
        });
      }
    } else {
      customer = await stripe.customers.create({
        address: {
          line1: req.body.addressInfo.line1,
          line2: req.body.addressInfo.line2,
          city: req.body.addressInfo.city,
          state: req.body.addressInfo.state,
          postal_code: req.body.addressInfo.zipcode,
          country: "US",
        },
        name:
          req.user.firstname.charAt(0).toUpperCase() +
          req.user.firstname.slice(1) +
          " " +
          req.user.lastname.charAt(0).toUpperCase() +
          req.user.lastname.slice(1),
        email: req.user.email,
        shipping: {
          address: {
            line1: req.body.addressInfo.line1,
            line2: req.body.addressInfo.line2,
            city: req.body.addressInfo.city,
            state: req.body.addressInfo.state,
            postal_code: req.body.addressInfo.zipcode,
            country: "US",
          },
          name:
            req.user.firstname.charAt(0).toUpperCase() +
            req.user.firstname.slice(1) +
            " " +
            req.user.lastname.charAt(0).toUpperCase() +
            req.user.lastname.slice(1),
        },
      });
    }
    User.findOneAndUpdate(
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
        stripe_customer_id: customer.id,
      }
    )
      .then(async (updatedUser) => {
        let authHeader = req.header("Authorization");
        const token = authHeader.split(" ")[1];
        let token_encoded = Buffer.from(token).toString("base64");
        const { itemId } = req.body;
        return client
          .createTransaction({ model: taxDocument })
          .then(async (result) => {
            // response tax document
            console.log("req.body=-=-=-", result);
            if (salesTax) {
              console.log("req.body=-=-=-", salesTax);

              const promises2 = result.summary.map(async (item, i) => {
                let rate = item.rate * 100;
                console.log("rate-=-=", rate);
                let foundTax = salesTax.taxes.filter(
                  (taxObject) =>
                    taxObject.taxName == item.taxName &&
                    taxObject.country == item.country &&
                    taxObject.region == item.region &&
                    taxObject.rate == item.rate &&
                    taxObject.jurisName == item.jurisName
                );
                if (foundTax.length == 0) {
                  let taxRate = await stripe.taxRates.create({
                    display_name: item.taxName,
                    inclusive: false,
                    percentage: rate.toFixed(2),
                    country: item.country,
                    state: item.region,
                    jurisdiction: item.jurisName,
                    // description: "CA Sales Tax",
                  });
                  result.summary[i] = {
                    ...result.summary[i],
                    stripeTaxId: taxRate.id,
                  };
                }
              });
              const numFruits2 = await Promise.all(promises2);
              if (numFruits2.length == result.summary.length) {
                SalesTax.findOneAndUpdate(
                  {
                    state: req.body.addressInfo.state,
                    city: req.body.addressInfo.city,
                    zipcode: req.body.addressInfo.zipcode,
                  },
                  {
                    taxRateStripe: result.summary,
                  }
                ).then(async (user) => {
                  // res.status(200).json({ message: "stored", success: true });
                  try {
                    let { line_items } = req.body;
                    let linesArray = [];

                    let dynamicTaxRates = [];
                    let salesTax = await SalesTax.findOne({
                      state: req.body.addressInfo.state,
                      city: req.body.addressInfo.city,
                      zipcode: req.body.addressInfo.zipcode,
                    });
                    const promises2 = salesTax.taxes.map((tax) => {
                      dynamicTaxRates.push(tax.stripeTaxId);
                    });

                    const numFruits2 = await Promise.all(promises2);
                    if (numFruits2.length == result.summary.length) {
                      for (let i = 0; i < line_items.length; i++) {
                        line_items[i] = {
                          ...line_items[i],
                          tax_rates: dynamicTaxRates,
                        };
                      }

                      console.log("line_items-=-=-", line_items);
                      const session = await stripe.checkout.sessions.create({
                        payment_method_types: ["card"],
                        line_items: line_items,
                        mode: "payment",
                        customer: customer.id,
                        // customer_email: req.user.email,
                        success_url: `${process.env.BASEURL}/viewItem?item=${itemId}&success=true&auth=${token_encoded}`,
                        cancel_url: `${process.env.BASEURL}/viewItem?item=${itemId}&canceled=true&auth=${token_encoded}`,
                        // shipping_address_collection: {
                        //   allowed_countries: ["US"],
                        // },
                      });
                      res.status(200).json({ message: session, success: true });
                      // res.status(200).json({ message: result, success: true });
                      // }
                    }
                  } catch (error) {
                    res
                      .status(400)
                      .json({ message: error.message, success: false });
                  }
                });
              }
            } else {
              const promises2 = result.summary.map(async (item, i) => {
                let rate = item.rate * 100;
                console.log("rate-=-=", rate);
                let taxRate = await stripe.taxRates.create({
                  display_name: item.taxName,
                  inclusive: false,
                  percentage: rate.toFixed(2),
                  country: item.country,
                  state: item.region,
                  jurisdiction: item.jurisName,
                  // description: "CA Sales Tax",
                });
                result.summary[i] = {
                  ...result.summary[i],
                  stripeTaxId: taxRate.id,
                };
              });
              const numFruits2 = await Promise.all(promises2);
              if (numFruits2.length == result.summary.length) {
                const newTax = new SalesTax({
                  state: req.body.addressInfo.state,
                  city: req.body.addressInfo.city,
                  zipcode: req.body.addressInfo.zipcode,
                  taxes: result.summary,
                });
                newTax
                  .save()
                  .then(async (tax) => {
                    // res.status(200).json({ message: "stored", success: true });
                    try {
                      let { line_items } = req.body;
                      let linesArray = [];

                      let dynamicTaxRates = [];
                      let salesTax = await SalesTax.findOne({
                        state: req.body.addressInfo.state,
                        city: req.body.addressInfo.city,
                        zipcode: req.body.addressInfo.zipcode,
                      });
                      const promises2 = salesTax.taxes.map((tax) => {
                        dynamicTaxRates.push(tax.stripeTaxId);
                      });

                      const numFruits2 = await Promise.all(promises2);
                      if (numFruits2.length == result.summary.length) {
                        for (let i = 0; i < line_items.length; i++) {
                          line_items[i] = {
                            ...line_items[i],
                            tax_rates: dynamicTaxRates,
                          };
                        }

                        console.log("line_items Else-=-=-", line_items);
                        const session = await stripe.checkout.sessions.create({
                          payment_method_types: ["card"],
                          line_items: line_items,
                          mode: "payment",
                          customer: customer.id,
                          // customer_email: req.user.email,
                          success_url: `${process.env.BASEURL}/viewItem?item=${itemId}&success=true&auth=${token_encoded}`,
                          cancel_url: `${process.env.BASEURL}/viewItem?item=${itemId}&canceled=true&auth=${token_encoded}`,
                          // shipping_address_collection: {
                          //   allowed_countries: ["US"],
                          // },
                        });
                        res
                          .status(200)
                          .json({ message: session, success: true });
                        // res.status(200).json({ message: result, success: true });
                        // }
                      }
                    } catch (error) {
                      res
                        .status(400)
                        .json({ message: error.message, success: false });
                    }
                  })
                  .catch((err) => {
                    res
                      .status(400)
                      .json({ message: err.message, success: false });
                  });
              }
            }
          })
          .catch((err) => {
            console.log("req.body=-=-=-", err.message);

            res.status(400).json({ message: err.message, success: false });
          });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
};
// const BuyNow = async (req, res) => {
//   console.log("line_Items-=-=-=", req.body.line_items);

//   let userObject = await User.findOne({ email: req.user.email });
//   let customer = null;
//   const taxDocument = {
//     type: "SalesInvoice",
//     date: moment(),
//     customerCode: "ABC",
//     addresses: {
//       SingleLocation: {
//         // line1: "123 Main Street",
//         // line2: "123 Main Street",
//         city: req.body.addressInfo.city,
//         region: req.body.addressInfo.state,
//         country: "US",
//         postalCode: req.body.addressInfo.zipcode,
//       },
//     },
//     lines: [
//       {
//         number: "1",
//         quantity: req.body.line_items[0].quantity,
//         amount: "200",
//       },
//     ],
//     commit: true,
//     currencyCode: "USD",
//   };
//   let salesTax = await SalesTax.findOne({
//     state: req.body.addressInfo.state,
//     city: req.body.addressInfo.city,
//     zipcode: req.body.addressInfo.zipcode,
//   });

//   if (userObject.stripe_customer_id) {
//     customer = await stripe.customers.retrieve(userObject.stripe_customer_id);
//     console.log("customer.address", customer.address);
//     if (
//       customer.address.line1 !== req.body.addressInfo.line1 ||
//       customer.address.line2 !== req.body.addressInfo.line2 ||
//       customer.address.city !== req.body.addressInfo.city ||
//       customer.address.state !== req.body.addressInfo.state ||
//       customer.address.postal_code !== req.body.addressInfo.zipcode
//     ) {
//       customer = await stripe.customers.update(customer.id, {
//         address: {
//           line1: req.body.addressInfo.line1,
//           line2: req.body.addressInfo.line2,
//           city: req.body.addressInfo.city,
//           state: req.body.addressInfo.state,
//           postal_code: req.body.addressInfo.zipcode,
//           country: "US",
//         },
//         name:
//           req.user.firstname.charAt(0).toUpperCase() +
//           req.user.firstname.slice(1) +
//           " " +
//           req.user.lastname.charAt(0).toUpperCase() +
//           req.user.lastname.slice(1),
//         email: req.user.email,
//         shipping: {
//           address: {
//             line1: req.body.addressInfo.line1,
//             line2: req.body.addressInfo.line2,
//             city: req.body.addressInfo.city,
//             state: req.body.addressInfo.state,
//             postal_code: req.body.addressInfo.zipcode,
//             country: "US",
//           },
//           name:
//             req.user.firstname.charAt(0).toUpperCase() +
//             req.user.firstname.slice(1) +
//             " " +
//             req.user.lastname.charAt(0).toUpperCase() +
//             req.user.lastname.slice(1),
//         },
//       });
//     }
//   } else {
//     customer = await stripe.customers.create({
//       address: {
//         line1: req.body.addressInfo.line1,
//         line2: req.body.addressInfo.line2,
//         city: req.body.addressInfo.city,
//         state: req.body.addressInfo.state,
//         postal_code: req.body.addressInfo.zipcode,
//         country: "US",
//       },
//       name:
//         req.user.firstname.charAt(0).toUpperCase() +
//         req.user.firstname.slice(1) +
//         " " +
//         req.user.lastname.charAt(0).toUpperCase() +
//         req.user.lastname.slice(1),
//       email: req.user.email,
//       shipping: {
//         address: {
//           line1: req.body.addressInfo.line1,
//           line2: req.body.addressInfo.line2,
//           city: req.body.addressInfo.city,
//           state: req.body.addressInfo.state,
//           postal_code: req.body.addressInfo.zipcode,
//           country: "US",
//         },
//         name:
//           req.user.firstname.charAt(0).toUpperCase() +
//           req.user.firstname.slice(1) +
//           " " +
//           req.user.lastname.charAt(0).toUpperCase() +
//           req.user.lastname.slice(1),
//       },
//     });
//   }

//   User.findOneAndUpdate(
//     { email: req.user.email },
//     {
//       address: {
//         line1: req.body.addressInfo.line1,
//         line2: req.body.addressInfo.line2,
//         city: req.body.addressInfo.city,
//         state: req.body.addressInfo.state,
//         zipcode: req.body.addressInfo.zipcode,
//         country: req.body.addressInfo.country,
//       },
//       stripe_customer_id: customer.id,
//     }
//   )
//     .then(async (updatedUser) => {
//       let authHeader = req.header("Authorization");
//       const token = authHeader.split(" ")[1];

//       let token_encoded = Buffer.from(token).toString("base64");
//       try {
//         const { line_items, itemId } = req.body;
//         console.log("line_Items-=-=-=", line_items);
//         const session = await stripe.checkout.sessions.create({
//           payment_method_types: ["card"],
//           line_items: line_items,
//           mode: "payment",
//           success_url: `${process.env.BASEURL}/viewItem?item=${itemId}&success=true&auth=${token_encoded}`,
//           cancel_url: `${process.env.BASEURL}/viewItem?item=${itemId}&canceled=true&auth=${token_encoded}`,
//         });
//         res.status(200).json({ message: session, success: true });
//       } catch (error) {
//         res.status(400).json({ message: error.message, success: false });
//       }
//     })
//     .catch((err) => {
//       res.status(400).json({ message: err.message, success: false });
//     });
// };

const AffirmConfirmation = async (req, res) => {
  try {
    console.log("req.body=-=-=-", req.body);
    let productHTML = "";
    User.findOneAndUpdate(
      { _id: req.body.userId },
      {
        address: {
          pointOfContact: req.body.addressInfo.pointOfContact,
          Contactphonenumber: req.body.addressInfo.Contactphonenumber,
          line1: req.body.addressInfo.line1,
          line2: req.body.addressInfo.line2,
          city: req.body.addressInfo.city,
          state: req.body.addressInfo.state,
          zipcode: req.body.addressInfo.zipcode,
          country: req.body.addressInfo.country,
          shippingInstructions: req.body.addressInfo.shippingInstructions,
        },
      }
    )
      .then(async (updatedUser) => {
        let designerEmails = [];

        let auth =
          "Basic " +
          Buffer.from(
            process.env.AFFIRM_PUBLIC_KEY + ":" + process.env.AFFIRM_PRIVATE_KEY
          ).toString("base64");

        request(
          {
            method: "POST",
            url: "https://sandbox.affirm.com/api/v2/charges",
            headers: {
              "content-type": "application/json",
              Authorization: auth,
            },
            body: {
              checkout_token: req.body.checkout_token,
              // checkout_token: "I75VDLZ0FRJIYLFM",
            },
            json: true,
          },
          async function (error, response, body) {
            // Do more stuff with 'body' here
            console.log("body-=-==-", body);
            if (error) {
              res.status(404).json({
                message: error.message,
                success: false,
              });
            } else {
              if (body.details && body.amount) {
                if (body.details.total != body.amount) {
                  res.status(400).json({
                    message: "Order amount is invalid",
                    success: false,
                  });
                } else {
                  console.log(" body.details.items", body.details.items);
                  var result = Object.keys(body.details.items).map((key) => [
                    Number(key),
                    body.details.items[key],
                  ]);
                  let email = "";
                  let charge_id = body.id;
                  const promises1 = result.map(async (doc, i) => {
                    let projectId = null;
                    let cartObject = await Cart.findOne({
                      buyerId: req.body.userId,
                      MOE_ITEM: doc[1].sku,
                    });
                    if (cartObject.projectId) {
                      if (cartObject.projectId != null) {
                        let projectObject = await Project.findOne({
                          _id: cartObject.projectId,
                        });
                        console.log("projectObject-=-=-=-=-=", projectObject);

                        let userObject = await User.findOne({
                          _id: projectObject.designerId,
                        });
                        console.log("projectObject-=-=-=-=-=", userObject);

                        designerEmails.push(userObject.email);
                        email = userObject.email;
                        const newOrder = new Order({
                          buyerId: req.body.userId,
                          MOE_ITEM: doc[1].sku,
                          quantity: doc[1].qty,
                          payment: "pending",
                          charge_id: body.id,
                          projectId: cartObject.projectId,
                        });
                        await newOrder.save();
                      } else {
                        const newOrder = new Order({
                          buyerId: req.body.userId,
                          MOE_ITEM: doc[1].sku,
                          quantity: doc[1].qty,
                          payment: "pending",
                          charge_id: body.id,
                        });
                        await newOrder.save();
                      }
                    } else {
                      const newOrder = new Order({
                        buyerId: req.body.userId,
                        MOE_ITEM: doc[1].sku,
                        quantity: doc[1].qty,
                        payment: "pending",
                        charge_id: body.id,
                      });
                      await newOrder.save();
                    }
                    productHTML =
                      productHTML +
                      `<div style="font-family: inherit;  display:flex; justify-content: space-between;">
                      <img src="${
                        doc[1].item_image_url
                      }" style="width:40%; margin-right:10px"/><div><div style="color: #506372; font-family: georgia, serif ">MOE ITEM NAME : ${
                        doc[1].display_name
                      }</div><div style="color: #506372; font-family: georgia, serif">MOE ITEM : ${
                        doc[1].sku
                      }</div><div style="color: #506372; font-family: georgia, serif">Quantity : ${
                        doc[1].qty
                      }</div><div style="color: #506372; font-family: georgia, serif">Unit price : ${
                        parseInt(doc[1].unit_price) / 100
                      }</div>${
                        email != ""
                          ? `<div style="color: #506372; font-family: georgia, serif">Designer Email : ${email}</div>`
                          : ``
                      }</div></div><br/>`;

                    // await Cart.findOneAndRemove({ MOE_ITEM: doc[1].sku });
                    await Cart.findByIdAndRemove(cartObject._id);
                  });
                  const numPromise1 = await Promise.all(promises1);
                  if (numPromise1.length == result.length) {
                    let uniqueArray = designerEmails.filter(function (
                      item,
                      pos,
                      self
                    ) {
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
                      let options = {
                        method: "POST",
                        url: `https://sandbox.affirm.com/api/v2/charges/${charge_id}/capture`,
                        headers: {
                          "content-type": "application/json",
                          Authorization: auth,
                        },
                        body: {
                          // checkout_token: req.body.checkout_token,
                          // checkout_token: "I75VDLZ0FRJIYLFM",
                        },
                        json: true,
                      };
                      request(options, async function (error, response, body) {
                        if (body.transaction_id) {
                          Order.updateMany(
                            { charge_id: charge_id },
                            { $set: { payment: "done" } },
                            { multi: true },
                            function (err, docs) {
                              if (err) {
                                res.status(400).json({
                                  message: err.message,
                                  success: false,
                                });
                              } else {
                                res.status(200).json({
                                  message: "Order placed successfully",
                                  success: true,
                                });
                                let html =
                                  `<div style="width:600px;  margin:auto">` +
                                  `<table style="margin:auto"><tbody><tr><td style="font-size:6px; line-height:10px; padding:30px 0px 25px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png" alt="Ingrid & Anders" width="300" data-responsive="true" data-proportionally-constrained="false"></td></tr></tbody></table>` +
                                  `<div style="font-family: inherit; text-align: center"><br></div>` +
                                  `<div style="font-family: inherit; "><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>New Order!</strong></span></div>` +
                                  `<div style="font-family: inherit; text-align: center"><br></div>` +
                                  `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">User details</span></div>` +
                                  `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif"><div>User name :${updatedUser.firstname
                                    .charAt(0)
                                    .toUpperCase()}${updatedUser.firstname.slice(
                                    1
                                  )} ${
                                    updatedUser.lastname
                                  }</div><div>Email address :${
                                    updatedUser.email
                                  }</div><div>User role :${
                                    updatedUser.role
                                  }</div><div>Shipping details :${
                                    req.body.addressInfo.line1
                                  } ${req.body.addressInfo.line2}, ${
                                    req.body.addressInfo.city
                                  },  ${req.body.addressInfo.state} - ${
                                    req.body.addressInfo.zipcode
                                  }</div>` +
                                  `<div>Point of contact (name) :${req.body.addressInfo.pointOfContact
                                    .charAt(0)
                                    .toUpperCase()}${req.body.addressInfo.pointOfContact.slice(
                                    1
                                  )}</div>` +
                                  `<div>Contact phone number :${req.body.addressInfo.Contactphonenumber}</div>` +
                                  `<div>Shipping Instructions :${req.body.addressInfo.shippingInstructions}</div>` +
                                  `</span></div>
                                  <div style="font-family: inherit; text-align: center"><br></div>` +
                                  productHTML +
                                  `</div>`;
                                const data2 = {
                                  to: [
                                    process.env.SENDGRID_SENDER,
                                    "jon.tenorio@hemlyco.com",
                                    "david.mcnamara@hemlyco.com",
                                  ],
                                  // to: "bshivangi47@gmail.com",

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
                              }
                              console.log(docs);
                            }
                          );
                        } else {
                          res.status(400).json({
                            message: "Your payment could not be captured",
                            success: false,
                          });
                        }
                      });
                    } else {
                      res.status(404).json({
                        message: "Something went wrong!",
                        success: false,
                      });
                    }
                  } else {
                    res.status(400).json({
                      message: "Something went wrong!",
                      success: false,
                    });
                  }
                }
              } else {
                res.status(400).json({ message: body.message, success: false });
              }
            }
          }
        );
      })
      .catch((err) => {
        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    console.log("req.body=-=-=-", error.message);

    res.status(400).json({ message: error.message, success: false });
  }
};
const AffirmConfirmationBuyNow = async (req, res) => {
  try {
    console.log("req.body=-=-=-", req.body);
    let productHTML = "";
    User.findOneAndUpdate(
      { _id: req.body.userId },
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
    )
      .then(async (updatedUser) => {
        let designerEmails = [];

        let auth =
          "Basic " +
          Buffer.from(
            process.env.AFFIRM_PUBLIC_KEY + ":" + process.env.AFFIRM_PRIVATE_KEY
          ).toString("base64");

        request(
          {
            method: "POST",
            url: "https://sandbox.affirm.com/api/v2/charges",
            headers: {
              "content-type": "application/json",
              Authorization: auth,
            },
            body: {
              checkout_token: req.body.checkout_token,
              // checkout_token: "I75VDLZ0FRJIYLFM",
            },
            json: true,
          },
          async function (error, response, body) {
            // Do more stuff with 'body' here
            console.log("body-=-==-", body);
            if (error) {
              res.status(404).json({
                message: error.message,
                success: false,
              });
            } else {
              if (body.details && body.amount) {
                if (body.details.total != body.amount) {
                  res.status(400).json({
                    message: "Order amount is invalid",
                    success: false,
                  });
                } else {
                  console.log(" body.details.items", body.details.items);
                  var result = Object.keys(body.details.items).map((key) => [
                    Number(key),
                    body.details.items[key],
                  ]);
                  let charge_id = body.id;
                  const promises1 = result.map(async (doc, i) => {
                    const newOrder = new Order({
                      buyerId: req.body.userId,
                      MOE_ITEM: doc[1].sku,
                      quantity: doc[1].qty,
                      payment: "pending",
                      charge_id: body.id,
                    });
                    await newOrder.save();

                    productHTML =
                      productHTML +
                      `<div style="font-family: inherit;  display:flex; justify-content: space-between;">
                      <img src="${
                        doc[1].item_image_url
                      }" style="width:40%; margin-right:10px"/><div><div style="color: #506372; font-family: georgia, serif ">MOE ITEM NAME : ${
                        doc[1].display_name
                      }</div><div style="color: #506372; font-family: georgia, serif">MOE ITEM : ${
                        doc[1].sku
                      }</div><div style="color: #506372; font-family: georgia, serif">Quantity : ${
                        doc[1].qty
                      }</div><div style="color: #506372; font-family: georgia, serif">Unit price : ${
                        parseInt(doc[1].unit_price) / 100
                      }</div></div></div>`;
                  });
                  const numPromise1 = await Promise.all(promises1);
                  if (numPromise1.length == result.length) {
                    let options = {
                      method: "POST",
                      url: `https://sandbox.affirm.com/api/v2/charges/${charge_id}/capture`,
                      headers: {
                        "content-type": "application/json",
                        Authorization: auth,
                      },
                      body: {
                        // checkout_token: req.body.checkout_token,
                        // checkout_token: "I75VDLZ0FRJIYLFM",
                      },
                      json: true,
                    };
                    request(options, async function (error, response, body) {
                      if (body.transaction_id) {
                        Order.updateMany(
                          { charge_id: charge_id },
                          { $set: { payment: "done" } },
                          { multi: true },
                          function (err, docs) {
                            if (err) {
                              res.status(400).json({
                                message: err.message,
                                success: false,
                              });
                            } else {
                              res.status(200).json({
                                message: "Order placed successfully",
                                success: true,
                              });
                              let html =
                                `<div style="width:600px;  margin:auto">` +
                                `<table style="margin:auto"><tbody><tr><td style="font-size:6px; line-height:10px; padding:30px 0px 25px 0px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/aea1fc7eb3a3822a/09fcda5e-dee0-4624-bc55-ec9b888a4e91/1345x342.png" alt="Ingrid & Anders" width="300" data-responsive="true" data-proportionally-constrained="false"></td></tr></tbody></table>` +
                                `<div style="font-family: inherit; text-align: center"><br></div>` +
                                `<div style="font-family: inherit; "><span style="color: #506372; font-size: 26px; font-family: georgia, serif"><strong>New Order!</strong></span></div>` +
                                `<div style="font-family: inherit; text-align: center"><br></div>` +
                                `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif">User details</span></div>` +
                                `<div style="font-family: inherit; "><span style="color: #506372; font-size: 14px; font-family: verdana, geneva, sans-serif"><div>User name :${updatedUser.firstname} ${updatedUser.lastname}</div><div>Email address :${updatedUser.email}</div><div>User role :${updatedUser.role}</div><div>Shipping details :${req.body.addressInfo.line1} ${req.body.addressInfo.line2}, ${req.body.addressInfo.city},  ${req.body.addressInfo.state} - ${req.body.addressInfo.zipcode}</div></span></div>
                                  <div style="font-family: inherit; text-align: center"><br></div>` +
                                productHTML +
                                `</div>`;
                              const data2 = {
                                to: process.env.SENDGRID_SENDER,
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
                            }
                            console.log(docs);
                          }
                        );
                      } else {
                        res.status(400).json({
                          message: "Your payment could not be captured",
                          success: false,
                        });
                      }
                    });
                  } else {
                    res.status(404).json({
                      message: "Something went wrong!",
                      success: false,
                    });
                  }
                }
              } else {
                res.status(400).json({ message: body.message, success: false });
              }
            }
          }
        );
      })
      .catch((err) => {
        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    console.log("req.body=-=-=-", error.message);

    res.status(400).json({ message: error.message, success: false });
  }
};
const GetTaxes = async (req, res) => {
  try {
    const taxDocument = {
      type: "SalesInvoice",
      date: moment(),
      customerCode: "ABC",
      addresses: {
        SingleLocation: {
          // line1: "123 Main Street",
          // line2: "123 Main Street",
          city: req.body.addressInfo.city,
          region: req.body.addressInfo.state,
          country: "US",
          postalCode: req.body.addressInfo.zipcode,
        },
      },
      lines: req.body.line_items,
      commit: true,
      currencyCode: "USD",
    };
    // let salesTax = await SalesTax.findOne({
    //   state: req.body.addressInfo.state,
    //   city: req.body.addressInfo.city,
    //   zipcode: req.body.addressInfo.zipcode,
    // });
    return client
      .createTransaction({ model: taxDocument })
      .then(async (result) => {
        // response tax document
        console.log("req.body=-=-=-", result);
        res.status(200).json({ message: result, success: true });

        // if (salesTax) {
        //   console.log("req.body=-=-=-", salesTax);

        //   const promises2 = result.summary.map(async (item, i) => {
        //     let rate = item.rate * 100;
        //     console.log("rate-=-=", rate);
        //     let foundTax = salesTax.taxes.filter(
        //       (taxObject) =>
        //         taxObject.taxName == item.taxName &&
        //         taxObject.country == item.country &&
        //         taxObject.region == item.region &&
        //         taxObject.rate == item.rate &&
        //         taxObject.jurisName == item.jurisName
        //     );
        //     if (foundTax.length == 0) {
        //       let taxRate = await stripe.taxRates.create({
        //         display_name: item.taxName,
        //         inclusive: false,
        //         percentage: rate.toFixed(2),
        //         country: item.country,
        //         state: item.region,
        //         jurisdiction: item.jurisName,
        //         // description: "CA Sales Tax",
        //       });
        //       result.summary[i] = {
        //         ...result.summary[i],
        //         stripeTaxId: taxRate.id,
        //       };
        //     }
        //   });
        //   const numFruits2 = await Promise.all(promises2);
        //   if (numFruits2.length == result.summary.length) {
        //     SalesTax.findOneAndUpdate(
        //       {
        //         state: req.body.addressInfo.state,
        //         city: req.body.addressInfo.city,
        //         zipcode: req.body.addressInfo.zipcode,
        //       },
        //       {
        //         taxRateStripe: result.summary,
        //       }
        //     ).then(async (user) => {
        //       res.status(200).json({ message: "stored", success: true });
        //     });
        //   }
        // } else {
        //   const promises2 = result.summary.map(async (item, i) => {
        //     let rate = item.rate * 100;
        //     console.log("rate-=-=", rate);
        //     let taxRate = await stripe.taxRates.create({
        //       display_name: item.taxName,
        //       inclusive: false,
        //       percentage: rate.toFixed(2),
        //       country: item.country,
        //       state: item.region,
        //       jurisdiction: item.jurisName,
        //       // description: "CA Sales Tax",
        //     });
        //     result.summary[i] = {
        //       ...result.summary[i],
        //       stripeTaxId: taxRate.id,
        //     };
        //   });
        //   const numFruits2 = await Promise.all(promises2);
        //   if (numFruits2.length == result.summary.length) {
        //     const newTax = new SalesTax({
        //       state: req.body.addressInfo.state,
        //       city: req.body.addressInfo.city,
        //       zipcode: req.body.addressInfo.zipcode,
        //       taxes: result.summary,
        //     });
        //     newTax
        //       .save()
        //       .then((tax) => {
        //         res.status(200).json({ message: "stored", success: true });
        //       })
        //       .catch((err) => {
        //         res.status(400).json({ message: err.message, success: false });
        //       });
        //   }
        // }
      })
      .catch((err) => {
        console.log("req.body=-=-=-", err.message);

        res.status(400).json({ message: err.message, success: false });
      });
  } catch (error) {
    console.log("req.body=-=-=-", error.message);

    res.status(400).json({ message: error.message, success: false });
  }
};

module.exports = {
  BuyNow,
  payment,
  AffirmConfirmation,
  GetTaxes,
  AffirmConfirmationBuyNow,
};
