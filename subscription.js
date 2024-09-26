"use strict";

require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("subscription.ejs");
});

app.get("/subscribe", async (req, res) => {
  const plan = req.query.plan;

  if (!plan) {
    return res.status(400).send("Subscription plan not found");
  }

  let priceId;

  switch (plan.toLowerCase()) {
    case "starter":
      priceId = "price_1Q3N1SDVXaKZGUL1R5d682zp";
      break;

    case "pro":
      priceId = "price_1Q3N2DDVXaKZGUL1d4YxoQcO";
      break;

    default:
      return res.status(400).send("Subscription plan not found");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });
  //   console.log(session);
  res.redirect(session.url);
});

app.get("/success", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(
    req.query.session_id,
    { expand: ["subscription", "subscription.plan.product"] }
  );

  console.log(JSON.stringify(session));

  res.send("Your subscription was successful");
});

app.get("/cancel", (req, res) => {
  res.redirect("/");
});

app.get("/customers/:customerId", async (req, res) => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: req.params.customerId,
    return_url: `${process.env.BASE_URL}/`,
  });
  //   console.log(portalSession);
  res.redirect(portalSession.url);
});

app.listen(8000, () => console.log("Server started on port 8000"));
