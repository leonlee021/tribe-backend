const stripe = require('stripe')('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');

stripe.customers.create({
  email: 'test@example.com',
})
  .then((customer) => {
    console.log('Customer created:', customer);
  })
  .catch((error) => {
    console.error('Error creating customer:', error);
  });
