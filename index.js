"use strict";

require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Node.js and Express book",
          },
          unit_amount: 50 * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "JavaScript T-Shirt",
          },
          unit_amount: 20 * 100,
        },
        quantity: 2,
      },
    ],
    // mode: "subscription"
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: [
        "US",
        "CA",
        "GB",
        "ES",
        "FR",
        "DE",
        "IT",
        "NL",
        "BE",
        "DK",
        "SE",
        "NO",
        "FI",
        "IE",
        "AT",
        "LU",
        "PL",
        "CZ",
        "SK",
        "HU",
        "SI",
        "GR",
        "BG",
        "RO",
        "CH",
        "HR",
        "CY",
        "MT",
        "LI",
        "LV",
        "LT",
        "EE",
        "LV",
        "AD",
        "BY",
        "MD",
        "UA",
        "SM",
        "VA",
        "RS",
        "ME",
        "MK",
        "AL",
        "AM",
        "AT",
        "BY",
        "CH",
        "CY",
        "CZ",
        "TR",
      ],
    },
    success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  //   console.log(session);
  res.redirect(session.url);
});

// Complete Route
app.get("/complete", async (req, res) => {
  // Retrieve the Stripe checkout session and expand the payment method details
  const session = await stripe.checkout.sessions.retrieve(
    req.query.session_id,
    { expand: ["payment_intent.payment_method"] }
  );
  // Retrieve the list of line items associated with the session
  const lineItems = await stripe.checkout.sessions.listLineItems(
    req.query.session_id
  );

  // Refactored approach: Fetch both the session and line items in parallel
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  // console.log(req.query.session_id);
  // console.log(session);
  // console.log(lineItems);
  console.log(result);

  res.send("Your payment was successful");
});

// Cancel Route
app.get("/cancel", (req, res) => {
  res.redirect("/");
});

app.listen(8000, () => console.log("Server started on port 8000"));
