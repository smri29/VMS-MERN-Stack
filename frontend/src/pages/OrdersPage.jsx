import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrderStore } from "../store/order";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { authFetch } from "../utils/authFetch";

export default function OrdersPage() {
  const { fetchOrders, orders, cancelOrder } = useOrderStore();
  const toast = useToast();

  useEffect(() => {
    fetchOrders().catch(() =>
      toast({ title: "Error fetching orders", status: "error" })
    );
  }, [fetchOrders, toast]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await authFetch(`/api/invoice/${orderId}`, { method: "GET" });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Failed to download invoice");
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
    } catch (error) {
      toast({ title: error.message, status: "error" });
    }
  };

  const handleCancel = async (orderId) => {
    const { success, message } = await cancelOrder(orderId);
    toast({
      title: success ? "Order canceled" : "Error cancelling",
      description: message,
      status: success ? "success" : "error",
    });
  };

  if (orders === undefined) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={6}>My Orders</Heading>

      {orders.length === 0 ? (
        <Text>No orders yet.</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {orders.map((o) => (
            <Box key={o._id} p={4} shadow="md" rounded="md" bg="gray.50">
              <Text fontWeight="bold">Order #{o._id}</Text>
              <Text>Date: {new Date(o.createdAt).toLocaleString()}</Text>
              <Text>Total: ${o.totalPrice.toFixed(2)}</Text>

              <HStack spacing={4} mt={4}>
                {/* Pay Now */}
                <Link to={`/payment/${o._id}`}>
                  <Button size="sm" colorScheme="purple">
                    Pay Now
                  </Button>
                </Link>

                {/* Download Invoice */}
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleDownloadInvoice(o._id)}
                >
                  Download Invoice
                </Button>

                {/* Cancel Order */}
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleCancel(o._id)}
                >
                  Cancel Order
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Container>
  );
}
