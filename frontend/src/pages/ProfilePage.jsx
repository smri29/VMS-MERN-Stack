// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  HStack,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/auth";
import { authFetch } from "../utils/authFetch";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [info, setInfo] = useState({ name: "", email: "" });
  const [pwd, setPwd] = useState({ current: "", new: "" });
  const [orders, setOrders] = useState([]);

  // Load user info & orders on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setInfo({ name: user.name, email: user.email });

    authFetch("/api/orders", { method: "GET" })
      .then((r) => r.json())
      .then(({ data }) => setOrders(data))
      .catch(() =>
        toast({ status: "error", title: "Failed to load orders" })
      );
  }, [user, navigate, toast]);

  // 1. Save personal info
  const saveInfo = async () => {
    const res = await authFetch("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(info),
    });
    const { success, message } = await res.json();
    toast({ status: success ? "success" : "error", title: message });
  };

  // 2. Change password
  const changePassword = async () => {
    const res = await authFetch("/api/users/password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword: pwd.current,
        newPassword: pwd.new,
      }),
    });
    const { success, message } = await res.json();
    toast({ status: success ? "success" : "error", title: message });
    if (success) setPwd({ current: "", new: "" });
  };

  // 4. Delete account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    const res = await authFetch("/api/users", { method: "DELETE" });
    const { success } = await res.json();
    if (success) {
      toast({ status: "info", title: "Account deleted" });
      logout();
      navigate("/");
    }
  };

  // 3. Referral info
  const referralCode = user?.referralCode;
  const referralCount = user?.referralCount || 0;
  const referralLink = `${window.location.origin}/signup?ref=${user?.id}`;

  return (
    <Container py={8}>
      <VStack spacing={8} align="stretch">
        {/* Personal Info */}
        <Box p={6} shadow="md" rounded="md">
          <Heading size="md" mb={4}>
            Personal Information
          </Heading>
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
            />
          </FormControl>
          <Button colorScheme="blue" onClick={saveInfo}>
            Save Changes
          </Button>
        </Box>

        <Divider />

        {/* Change Password */}
        <Box p={6} shadow="md" rounded="md">
          <Heading size="md" mb={4}>
            Change Password
          </Heading>
          <FormControl mb={3}>
            <FormLabel>Current Password</FormLabel>
            <Input
              type="password"
              value={pwd.current}
              onChange={(e) =>
                setPwd({ ...pwd, current: e.target.value })
              }
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={pwd.new}
              onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
            />
          </FormControl>
          <Button colorScheme="blue" onClick={changePassword}>
            Update Password
          </Button>
        </Box>

        <Divider />

        {/* Order History */}
        <Box p={6} shadow="md" rounded="md">
          <Heading size="md" mb={4}>
            My Recent Orders
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Order #</Th>
                  <Th>Date</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Invoice</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((o) => (
                  <Tr key={o._id}>
                    <Td>{o._id.slice(-6)}</Td>
                    <Td>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>${o.totalPrice.toFixed(2)}</Td>
                    <Td>{o.isPaid ? "Paid" : "Pending"}</Td>
                    <Td>
                      <Button
                        size="sm"
                        as="a"
                        href={`/api/invoice/${o._id}`}
                        target="_blank"
                      >
                        Download
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        {/* Referral / Invite */}
        <Box p={6} shadow="md" rounded="md">
          <HStack>
            <Box>
              <Heading size="md" mb={2}>
                Invite Friends
              </Heading>
              <Text mb={1}>
                Your referral code: <strong>{referralCode}</strong>
              </Text>
              <Text mb={3}>
                You’ve referred {referralCount} friend
                {referralCount !== 1 ? "s" : ""}
              </Text>
              <Input value={referralLink} isReadOnly />
            </Box>
            <Spacer />
            <Button
              onClick={() =>
                navigator.clipboard.writeText(referralLink) &
                toast({ status: "success", title: "Copied!" })
              }
            >
              Copy Link
            </Button>
          </HStack>
        </Box>

        <Divider />

        {/* Delete Account */}
        <Box p={6} shadow="md" rounded="md" bg="red.50">
          <Heading size="md" mb={4} color="red.600">
            Danger Zone
          </Heading>
          <Button colorScheme="red" onClick={deleteAccount}>
            Delete My Account
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
