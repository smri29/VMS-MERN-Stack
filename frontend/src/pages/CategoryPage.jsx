// frontend/src/pages/CategoryPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  SimpleGrid,
  Text,
  VStack,
  Input,
  Select,
  Box,
  HStack,
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const { category } = useParams();
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const products     = useProductStore((s) => s.products);
  const toast        = useToast();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]); // Will reset below
  const [sortBy, setSortBy]         = useState("newest");    // options: newest, priceAsc, priceDesc
  const [bounds, setBounds]         = useState([0, 100000]);

  // 1) Fetch on mount
  useEffect(() => {
    fetchProducts().catch(() =>
      toast({ title: "Error loading products", status: "error" })
    );
  }, [fetchProducts, toast]);

  // 2) Compute only this category’s products
  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === decodeURIComponent(category)),
    [products, category]
  );

  // 3) Derive price bounds once we have data
  useEffect(() => {
    if (categoryProducts.length === 0) return;
    const prices = categoryProducts.map((p) => p.price);
    const min     = Math.min(...prices);
    const max     = Math.max(...prices);
    setBounds([min, max]);
    setPriceRange([min, max]);
  }, [categoryProducts]);

  // 4) Filter + sort
  const filtered = useMemo(() => {
    let arr = categoryProducts
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

    if (sortBy === "priceAsc") {
      arr.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      arr.sort((a, b) => b.price - a.price);
    } else {
      // newest first
      arr.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return arr;
  }, [categoryProducts, searchTerm, priceRange, sortBy]);

  if (products.length === 0) {
    return (
      <Center h="60vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          {decodeURIComponent(category)}
        </Text>

        {/* ── Controls ────────────────────────────────────────── */}
        <Box p={4} bg="gray.50" rounded="md">
          <VStack spacing={4}>
            {/* Search */}
            <Input
              placeholder="Search by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <HStack spacing={6} w="full" flexWrap="wrap">
              {/* Price Range */}
              <Box flex="1">
                <Text fontSize="sm" mb={1}>
                  Price: ${priceRange[0]} – ${priceRange[1]}
                </Text>
                <RangeSlider
                  min={bounds[0]}
                  max={bounds[1]}
                  step={1}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val)}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </Box>

              {/* Sort By */}
              <Box w="200px">
                <Select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low → High</option>
                  <option value="priceDesc">Price: High → Low</option>
                </Select>
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* ── Products Grid ───────────────────────────────────── */}
        {filtered.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No matching vehicles found.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
