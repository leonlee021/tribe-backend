// controllers/paymentController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, sequelize } = require('../models'); // Import sequelize and User model
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); // Import the utility function

// Function to create or retrieve Stripe Customer
const createOrRetrieveStripeCustomer = async (user) => {
    if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`, // Optional, customize as needed
        });
        
        // Save the stripeCustomerId to the user record
        user.stripeCustomerId = customer.id;
        await user.save(); // Assuming you're using an ORM like Sequelize to save the user

        return customer.id;
    }

    return user.stripeCustomerId;
};

// Create Setup Intent
exports.createSetupIntent = async (req, res) => {
    console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

    try {
        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Fetch the user record from the database
        const user = await User.findByPk(userId);

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }

        // Make sure the user has a Stripe customer ID
        const stripeCustomerId = await createOrRetrieveStripeCustomer(user);

        // Now create the setup intent
        const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId, // Ensure correct Stripe customer ID
        });

        res.status(200).json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
        console.error('Error creating setup intent:', error);
        res.status(500).json({ error: 'Unable to create setup intent.' });
    }
};

// Attach Payment Method
exports.attachPaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        if (!paymentMethodId) {
            return res.status(400).json({ error: 'Payment Method ID is required.' });
        }

        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Fetch the user record from the database
        const user = await User.findByPk(userId);

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }

        if (!user.stripeCustomerId) {
            // Create a Stripe customer if not already present
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`, // Optional
            });
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Attach the payment method to the customer
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId, // Attach to the correct customer
        });

        // Set as default payment method
        await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        res.status(200).json({ success: true, paymentMethod });
    } catch (error) {
        console.error('Error attaching payment method:', error);
        res.status(500).json({ error: 'Unable to attach payment method.' });
    }
};

// Get Saved Card
exports.getSavedCard = async (req, res) => {
    try {
        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Fetch the user record from the database
        const user = await User.findByPk(userId);

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }

        const { stripeCustomerId } = user;

        if (!stripeCustomerId) {
            return res.status(200).json({ card: null });
        }

        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });

        if (paymentMethods.data.length === 0) {
            return res.status(200).json({ card: null });
        }

        const card = paymentMethods.data[0].card;
        res.status(200).json({
            card: {
                brand: card.brand,
                last4: card.last4,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
            },
        });
    } catch (error) {
        console.error('Error fetching saved card:', error);
        res.status(500).json({ error: 'Failed to fetch saved card.' });
    }
};

// Remove Saved Card
exports.removeCard = async (req, res) => {
    try {
        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Fetch the user record from the database
        const user = await User.findByPk(userId);

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }

        const { stripeCustomerId } = user;

        if (!stripeCustomerId) {
            return res.status(400).json({ error: 'No Stripe customer ID found.' });
        }

        // Get the customer's payment methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });

        if (paymentMethods.data.length === 0) {
            return res.status(404).json({ error: 'No saved card found.' });
        }

        // Detach the first card
        const paymentMethodId = paymentMethods.data[0].id;
        await stripe.paymentMethods.detach(paymentMethodId);

        res.status(200).json({ message: 'Card removed successfully.' });
    } catch (error) {
        console.error('Error removing card:', error);
        res.status(500).json({ error: 'Failed to remove card.' });
    }
};
