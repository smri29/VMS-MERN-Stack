import React, { useState } from "react";
import {
  Box, Button, Container, Heading, Input, VStack, useToast,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const signup = useAuthStore((s) => s.signup);
  const toast = useToast();
  const nav = useNavigate();

  const handleSubmit = async () => {
    const { success, message } = await signup(form.name, form.email, form.password);
    if (success) {
      toast({ status: "success", title: "Account created!" });
      nav("/"); // redirect home
    } else {
      toast({ status: "error", title: message });
    }
  };

  return (
    <Container py={8}>
      <VStack spacing={4}>
        <Heading>Sign Up</Heading>
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
        <Button colorScheme="blue" onClick={handleSubmit}>Sign Up</Button>
      </VStack>
    </Container>
  );
}
