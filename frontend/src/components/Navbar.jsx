// frontend/src/components/Navbar.jsx
import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAuthStore } from "../store/auth";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const user  = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const navigate = useNavigate();

  return (
    <Box bg={bg} boxShadow="sm">
      <Container maxW="1140px" px={4}>
        <Flex
          h={16}
          align="center"
          justify="space-between"
        >
          <Text
            fontSize={{ base: "22px", sm: "28px" }}
            fontWeight="bold"
            textTransform="uppercase"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
          >
            <Link to="/">Vehicle Managemet System</Link>
          </Text>

          <HStack spacing={4} align="center">
            {/* Profile or Login */}
            {token ? (
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}

            {/* Create + */}
            <Link to="/create">
              <IconButton
                aria-label="Create"
                icon={<AiOutlinePlusSquare size={20} />}
                variant="ghost"
              />
            </Link>

            {/* More menu */}
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                More
              </MenuButton>
              <MenuList>
                {/* Theme toggle */}
                <MenuItem onClick={toggleColorMode}>
                  {colorMode === "light" ? (
                    <>
                      <IoMoon style={{ marginRight: 8 }} />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <LuSun style={{ marginRight: 8 }} size={18} />
                      Light Mode
                    </>
                  )}
                </MenuItem>

                {/* Sign Up */}
                {!token && (
                  <MenuItem as={Link} to="/signup">
                    Sign Up
                  </MenuItem>
                )}

                {/* Project Credits */}
                <MenuItem as={Link} to="/credentials">
                  Project Credits
                </MenuItem>

                {/* Logout */}
                {token && (
                  <MenuItem onClick={() => navigate("/logout")}>
                    Logout
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
