import React, { useState, useEffect } from "react";
import { Box, Text, Spinner, Center } from "@chakra-ui/react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const owmKey = import.meta.env.VITE_OWM_API_KEY;
const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// A small inline style for the map container
const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "8px" };

export default function WeatherMap() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [err, setErr] = useState("");
  
  // 1) Grab browser geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoords({ lat: coords.latitude, lng: coords.longitude });
      },
      (e) => setErr("Location permission denied")
    );
  }, []);

  // 2) Fetch weather once we have coords
  useEffect(() => {
    if (!coords) return;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${owmKey}&units=metric`
    )
      .then((r) => r.json())
      .then((data) => setWeather(data))
      .catch(() => setErr("Failed to load weather"));
  }, [coords]);

  // 3) Load Google Maps JS
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapsKey,
  });

  if (err) {
    return (
      <Center py={4}>
        <Text color="red.500">{err}</Text>
      </Center>
    );
  }

  if (!coords || !weather || !isLoaded) {
    return (
      <Center py={4}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box w="full" mb={8}>
      {/* Weather Summary */}
      <Box bg="blue.50" p={4} rounded="md" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Weather at your location
        </Text>
        <Text>
          {weather.weather[0].description}, {weather.main.temp.toFixed(1)}°C
        </Text>
        <Text fontSize="sm" color="gray.600">
          {weather.name}, {weather.sys.country}
        </Text>
      </Box>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coords}
        zoom={12}
      >
        <Marker position={coords} />
      </GoogleMap>
    </Box>
  );
}
