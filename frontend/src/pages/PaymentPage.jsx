// frontend/src/pages/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useOrderStore } from "../store/order";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret, amount, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const payOrder = useOrderStore((s) => s.payOrder);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // 1) Confirm the Stripe payment
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      return toast({ status: "error", title: error.message });
    }

    // 2) Mark the order paid on our backend
    const { success, message } = await payOrder(orderId);
    if (!success) {
      return toast({ status: "error", title: message });
    }

    toast({ status: "success", title: "Payment confirmed! Downloading invoice…" });

    // 3) Download the invoice PDF
    try {
      const res = await authFetch(`/api/invoice/${orderId}`, { method: "GET" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Invoice download failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (invErr) {
      toast({ status: "error", title: invErr.message });
    }

    // 4) Redirect back to orders
    navigate("/orders");
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
        // Fetch just this order from our backend
        const orderRes = await authFetch(`/api/orders`, { method: "GET" });
        const { data: orders, success } = await orderRes.json();
        if (!success) throw new Error("Failed to load orders");

        const order = orders.find((o) => o._id === orderId);
        if (!order) throw new Error("Order not found");
        const cents = Math.round(order.totalPrice * 100);
        setAmount(cents);

        // Create a Stripe PaymentIntent
        const piRes = await authFetch("/api/payment/create-payment-intent", {
          method: "POST",
          body: JSON.stringify({ amount: cents }),
        });
        const { clientSecret: secret, success: piSuccess, message } = await piRes.json();
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
        <Spinner size="xl" />
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
      <CheckoutForm clientSecret={clientSecret} amount={amount} orderId={orderId} />
    </Elements>
  );
}
