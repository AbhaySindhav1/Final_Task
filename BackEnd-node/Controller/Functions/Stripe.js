// const path = require("path");
// const envPath = path.join(__dirname, "../../key.env");
// require("dotenv").config({ path: envPath });
const Settings = require("../../Model/settingModel");

let stripeInstance = null;

async function initializeStripe() {
  try {
    if (stripeInstance === null) {
      const Setting = await Settings.find({});
      const StripePrivateKey = Setting[0].StripePrivateKey; // Assuming the fetched value is stored in the 'privateKey' field
      stripeInstance = require("stripe")(StripePrivateKey);
    }
    return stripeInstance;
  } catch (error) {
    console.log("initializeStripe", error);
  }
}

async function updateStripePrivateKey() {
  try {
    const Setting = await Settings.find({});
    const StripePrivateKey = Setting[0].StripePrivateKey; // Assuming the fetched value is stored in the 'privateKey' field

    stripeInstance = require("stripe")(StripePrivateKey);
    console.log("StripePrivateKey",StripePrivateKey);
  } catch (error) {
    console.log("updateStripePrivateKey", error);
  }
}

// const stripe = require("stripe")(process.env.StripePrivateKey);

async function createCustomer(email, name) {
  try {
    if (!email || !name) {
      throw new Error("Enter Valid Datails");
    }

    const stripe = await initializeStripe();

    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

async function SetUpIntant(customer) {
  try {
    const stripe = await initializeStripe();

    const setupIntent = await stripe.setupIntents.create({
      customer: customer,
      automatic_payment_methods: { enabled: true },
    });

    return setupIntent;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

async function retrievePaymentMethods(CUSTOMER_ID) {
  try {
    const stripe = await initializeStripe();

    const paymentMethods = await stripe.paymentMethods.list({
      customer: CUSTOMER_ID,
      type: "card",
    });
    return paymentMethods.data;
  } catch (error) {
    console.error("Error retrieving payment methods:", error);
    return null;
  }
}

async function deletePaymentMethod(paymentMethodId) {
  try {
    const stripe = await initializeStripe();

    const deletedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId
    );
    return deletedPaymentMethod;
  } catch (error) {
    console.error("Error deleting payment method:", error);
  }
}

async function updateDefaultCard(customerId, cardId) {
  try {
    const stripe = await initializeStripe();

    const updatedCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: cardId,
      },
    });
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating default card:", error);
  }
}

async function getCustomer(customerId) {
  try {
    const stripe = await initializeStripe();
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    return error;
  }
}

async function GetPayment(customerId, paymentCardId, amountToDeduct) {
  console.log(customerId, paymentCardId, amountToDeduct);
  try {
    const stripe = await initializeStripe();
    payment_intent = await stripe.paymentIntents.create({
      amount: +amountToDeduct * 100,
      currency: "usd",
      customer: customerId,
      payment_method: paymentCardId,
      confirm: true,
    });

    if (payment_intent.status == "succeeded") {
      console.log("Payment processed successfully.");
    } else {
      console.log(payment_intent);
      console.log("Payment failed.");
    }
  } catch (error) {
    return error;
  }
}

async function deleteCustomer(customerId) {
  try {
    const stripe = await initializeStripe();
    const deletedCustomer = await stripe.customers.del(customerId);
    return deletedCustomer;
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
}

module.exports = {
  createCustomer,
  SetUpIntant,
  retrievePaymentMethods,
  deletePaymentMethod,
  updateDefaultCard,
  getCustomer,
  GetPayment,
  deleteCustomer,
  updateStripePrivateKey,
};
