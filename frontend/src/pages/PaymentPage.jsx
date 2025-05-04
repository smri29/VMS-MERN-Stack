import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  Center,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { authFetch } from "../utils/authFetch";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function CheckoutForm({ clientSecret, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Confirm the payment
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      toast({ status: "error", title: error.message });
    } else {
      toast({ status: "success", title: "Payment successful!" });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <CardElement />
      <Button type="submit" mt={4} isDisabled={!stripe}>
        Pay ${ (amount / 100).toFixed(2) }
      </Button>
    </Box>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const toast = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // 1) Fetch the order so we know how much to charge
        const orderRes = await authFetch(`/api/orders`, {
          method: "GET",
        });
        const { data: orders, success } = await orderRes.json();
        if (!success) throw new Error("Failed to load orders");

        const order = orders.find((o) => o._id === orderId);
        if (!order) throw new Error("Order not found");

        const cents = Math.round(order.totalPrice * 100);
        setAmount(cents);

        // 2) Create a Stripe PaymentIntent for that amount
        const piRes = await authFetch(
          "/api/payment/create-payment-intent",
          {
            method: "POST",
            body: JSON.stringify({ amount: cents }),
          }
        );
        const { clientSecret: secret, success: piSuccess, message } =
          await piRes.json();
        if (!piSuccess) throw new Error(message || "Payment init failed");

        setClientSecret(secret);
      } catch (err) {
        console.error(err);
        toast({ status: "error", title: err.message });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [orderId, toast]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (!clientSecret) {
    return (
      <Center h="100vh">
        <Text>Unable to initialize payment.</Text>
      </Center>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm clientSecret={clientSecret} amount={amount} />
    </Elements>
  );
}
