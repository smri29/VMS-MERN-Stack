// frontend/src/pages/HomePage.jsx
import React, { useEffect } from "react";
import {
  Container,
  SimpleGrid,
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import WeatherMap from "../components/WeatherMap";

export default function HomePage() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const products     = useProductStore((s) => s.products);
  const toast        = useToast();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts().catch(() =>
      toast({ title: "Error loading products", status: "error" })
    );
  }, [fetchProducts, toast]);

  // Build list of non-empty categories
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // Card styles for a more premium look
  const cardBg   = useColorModeValue("white", "gray.700");
  const hoverBg  = useColorModeValue("gray.50", "gray.600");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Container maxW="container.xl" py={12}>
      {/* Collapsible Weather & Map */}
      <Accordion allowToggle mb={8}>
        <AccordionItem border="1px solid" borderColor="gray.200" rounded="md">
          <h2>
            <AccordionButton px={4} py={2}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                🌤 Your Local Weather & Map
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel p={0}>
            <WeatherMap />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <VStack spacing={8}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          Vehicle Categories
        </Text>

        {products.length === 0 ? (
          <Center>
            <Spinner size="lg" />
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {categories.map((cat) => (
              <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                <Box
                  p={6}
                  bg={cardBg}
                  rounded="lg"
                  textAlign="center"
                  boxShadow="md"
                  transition="background 0.2s, transform 0.2s"
                  _hover={{ bg: hoverBg, transform: "translateY(-4px)" }}
                >
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {cat}
                  </Text>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
