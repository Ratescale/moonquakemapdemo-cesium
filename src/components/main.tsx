import { Box, Button } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { Header } from "./header";
import { MapComponent } from "./mapLibre";
import { Panel } from "./panel";
import type { Filters, MoonquakeData } from "@/type";
import { fetchArtificialImpactCSV, fetchDeepMoonquakeCSV, fetchShallowMoonquakeCSV } from "@/utils/fetchMoonquakeCSV";

// CesiumJS must be client-side only (no SSR)
const CesiumGlobe = dynamic(() => import("./cesiumGlobe").then((m) => ({ default: m.CesiumGlobe })), {
  ssr: false,
  loading: () => <Box w="100%" h="100%" bgColor="black" />,
});

export const Main = () => {
  const [isMap, setIsMap] = useState(false);
  const [moonquakeData, setMoonquakeData] = useState<MoonquakeData[]>([]);
  const [selectedMoonquake, setSelectedMoonquake] = useState<MoonquakeData | null>(null);
  const [filters, setFilters] = useState<Filters>({ shallow: true, deep: true, artificial: true });

  useEffect(() => {
    const fetchAll = async () => {
      const [shallow, deep, artificial] = await Promise.all([
        fetchShallowMoonquakeCSV(),
        fetchDeepMoonquakeCSV(),
        fetchArtificialImpactCSV(),
      ]);
      setMoonquakeData([...shallow, ...deep, ...artificial] as MoonquakeData[]);
    };
    fetchAll();
  }, []);

  return (
    <Box w="100%" h="100vh" position="relative" overflow="hidden">
      <Header filters={filters} setFilters={setFilters} />
      <Panel selectedMoonquake={selectedMoonquake} />

      <Button
        onClick={() => setIsMap(!isMap)}
        position="absolute"
        bottom={10}
        right={10}
        zIndex={100}
        colorScheme="whiteAlpha"
        variant="outline"
        size="sm"
      >
        {isMap ? "3D Globe" : "2D Map"}
      </Button>

      <Box w="100%" h="100%" position="absolute" top={0} left={0} zIndex={isMap ? 0 : -1}>
        <MapComponent
          setIsMap={setIsMap}
          moonquakeData={moonquakeData}
          filters={filters}
          onSelectMoonquake={setSelectedMoonquake}
        />
      </Box>
      <Box w="100%" h="100%" position="absolute" top={0} left={0} zIndex={isMap ? -1 : 0}>
        <CesiumGlobe
          moonquakeData={moonquakeData}
          filters={filters}
          onSelectMoonquake={setSelectedMoonquake}
          onZoomIn={() => setIsMap(true)}
        />
      </Box>
    </Box>
  );
};
