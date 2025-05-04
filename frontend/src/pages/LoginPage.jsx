import React, { useState } from "react";
import {
  Box, Button, Container, Heading, Input, VStack, useToast,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const login = useAuthStore((s) => s.login);
  const toast = useToast();
  const nav = useNavigate();

  const handleSubmit = async () => {
    const { success, message } = await login(form.email, form.password);
    if (success) {
      toast({ status: "success", title: "Welcome back!" });
      nav("/");
    } else {
      toast({ status: "error", title: message });
    }
  };

  return (
    <Container py={8}>
      <VStack spacing={4}>
        <Heading>Log In</Heading>
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>Log In</Button>
      </VStack>
    </Container>
  );
}
