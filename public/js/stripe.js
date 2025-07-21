/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51RkrXBHCK3eBVf7HnmvJMyZZ3CQO8dJmyfzw6T4fNYA6cmBUqhFi9O8dStf45It2eP9rF85KxJA0o0x09sFhNwUj00K6dY2t6J',
);

export const bookTour = async (tourId) => {
  try {
    //1) GET CHECKOUT SESSION FROM API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    //2) CREATE CHECKOUT FORM + CHARGE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert(
      'error',
      (error.response && error.response.data && error.response.data.message) ||
        error.message,
    );
  }
};
