import axios from 'axios';

const stripe = Stripe('pk_test_51Hlb84IcSMNuHbUHl0CR78GI0qPglQg2Ol9h0tZVxddCx6DvQcROZcMlMWiEVwE72HzuKyydrYykfDZEvveWCxwI00qABLET1R');

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session form API
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log("HELLO WORLD!!!" + session);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (err) {
        console.log(err);
        alert('error', err)
    }

}