// frontend/src/pages/OrdersPage.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrderStore } from "../store/order";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Badge,
  Divider,
  Spinner,
  Center,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";

export default function OrdersPage() {
  const { fetchOrders, orders, cancelOrder } = useOrderStore();
  const toast = useToast();

  useEffect(() => {
    fetchOrders().catch(() =>
      toast({ title: "Error fetching orders", status: "error" })
    );
  }, [fetchOrders, toast]);

  const handleCancel = async (orderId) => {
    const { success, message } = await cancelOrder(orderId);
    toast({
      title: success ? "Order canceled" : "Error canceling",
      description: message,
      status: success ? "success" : "error",
    });
  };

  if (orders === undefined) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={6}>My Orders</Heading>

      {orders.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.500">
          You have no orders yet.
        </Text>
      ) : (
        <VStack spacing={8} align="stretch">
          {orders.map((order) => (
            <Box
              key={order._id}
              bg="white"
              boxShadow="lg"
              rounded="lg"
              overflow="hidden"
            >
              {/* Order Header */}
              <Box bg="gray.50" p={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="bold">
                      Order #{order._id}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(order.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                  {order.isPaid ? (
                    <Badge colorScheme="green" fontSize="0.9em">
                      Paid
                    </Badge>
                  ) : (
                    <Badge colorScheme="red" fontSize="0.9em">
                      Unpaid
                    </Badge>
                  )}
                </HStack>
              </Box>

              <Divider />

              {/* Products Grid */}
              <Box p={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {order.products.map((item) => (
                    <HStack
                      key={item.product._id}
                      bg="gray.50"
                      p={3}
                      rounded="md"
                      spacing={4}
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        boxSize="80px"
                        objectFit="cover"
                        rounded="md"
                      />
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold">{item.product.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Qty: {item.qty} &times; ${item.price.toFixed(2)}
                        </Text>
                        <Text fontSize="sm" color="gray.800">
                          Line Total: ${(item.price * item.qty).toFixed(2)}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Order Footer */}
              <Box p={4}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    Total: ${order.totalPrice.toFixed(2)}
                  </Text>
                  <HStack spacing={3}>
                    {/* Only show Pay Now if unpaid */}
                    {!order.isPaid && (
                      <Link to={`/payment/${order._id}`}>
                        <Button colorScheme="purple" size="sm">
                          Pay Now
                        </Button>
                      </Link>
                    )}

                    {/* Always allow cancel */}
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order._id)}
                      isDisabled={order.isPaid}
                    >
                      Cancel Order
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            </Box>
          ))}
        </VStack>
      )}
    </Container>
  );
}
