// frontend/src/pages/CreatePage.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";

export default function CreatePage() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "", // now a simple string
    price: "",
    image: "",
  });
  const toast = useToast();
  const createProduct = useProductStore((s) => s.createProduct);

  const handleSubmit = async () => {
    // Build payload, converting price to a number
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      image: form.image,
    };

    const { success, message } = await createProduct(payload);
    toast({
      title: success ? "Created" : "Error",
      description: success ? "Product added" : message,
      status: success ? "success" : "error",
      isClosable: true,
    });

    if (success) {
      // reset form
      setForm({
        name: "",
        category: "",
        description: "",
        price: "",
        image: "",
      });
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6}>
        <Heading>Create New Product</Heading>

        <Input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
        />

        <Select
          placeholder="Select Category"
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value }))
          }
        >
          <option>Car (Automobile)</option>
          <option>Motorcycle</option>
          <option>Bicycle (Cycle)</option>
          <option>Ship/Boat</option>
          <option>Aeroplane (Airplane)</option>
          <option>Helicopter</option>
        </Select>

        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={4}
        />

        <Input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) =>
            setForm((f) => ({ ...f, price: e.target.value }))
          }
        />

        <Input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm((f) => ({ ...f, image: e.target.value }))
          }
        />

        <Button colorScheme="blue" onClick={handleSubmit} w="full">
          Add Product
        </Button>
      </VStack>
    </Container>
  );
}
