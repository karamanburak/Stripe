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
    ],
    // mode: "subscription"
    mode: "payment",
    success_url: `${process.env.BASE_URL}/complete`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  //   console.log(session);
  res.redirect(session.url);
});

// Complete Route
app.get("/complete", (req, res) => {
  res.send("Your payment was successful");
});

// Cancel Route
app.get("/cancel", (req, res) => {
  res.redirect("/");
});

app.listen(8000, () => console.log("Server started on port 8000"));
