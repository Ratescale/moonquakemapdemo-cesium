import { Box } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import React, { useEffect, useRef } from "react";
import type { Filters, MoonquakeData } from "@/type";

type Props = {
  setIsMap: React.Dispatch<React.SetStateAction<boolean>>;
  moonquakeData: MoonquakeData[];
  filters: Filters;
  onSelectMoonquake: (moonquake: MoonquakeData) => void;
};

const QUAKE_LAYERS = ["moonquakes-shallow", "moonquakes-deep", "moonquakes-artificial"];

const toGeoJSON = (data: MoonquakeData[]) => ({
  type: "FeatureCollection" as const,
  features: data.map((q, i) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [q.location.longitude, q.location.latitude],
    },
    // Store index only — avoids JSON.stringify/parse round-trip issues
    properties: { quakeType: q.type, idx: i },
  })),
});

export const MapComponent = ({ setIsMap, moonquakeData, filters, onSelectMoonquake }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelectMoonquake);
  const dataRef = useRef<MoonquakeData[]>(moonquakeData);

  onSelectRef.current = onSelectMoonquake;
  dataRef.current = moonquakeData;

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      zoom: 4,
      center: [0, 0],
      dragRotate: false,
      touchZoomRotate: false,
      minPitch: 0,
      pitchWithRotate: false,
      renderWorldCopies: false,
      minZoom: 3,
      maxZoom: 6,
      style: {
        version: 8,
        sources: {
          "moon-tiles": {
            type: "raster",
            tiles: [
              "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg",
            ],
            tileSize: 256,
          },
        },
        layers: [{ id: "moon-layer", type: "raster", source: "moon-tiles" }],
      },
    });

    mapRef.current = map;

    map.on("zoom", () => {
      if (map.getZoom() <= 3) {
        setIsMap(false);
        map.setZoom(3.5);
      }
    });

    map.on("load", async () => {
      // Named places
      const resp = await fetch("/moon_place2en.geojson").catch(() => null);
      if (resp?.ok) {
        const places = await resp.json();
        map.addSource("places", { type: "geojson", data: places });
        map.addLayer({
          id: "places-layer",
          type: "circle",
          source: "places",
          paint: { "circle-radius": 6, "circle-color": "#B42222" },
        });
      }

      // Moonquake source & layers
      map.addSource("moonquakes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "moonquakes-shallow",
        type: "circle",
        source: "moonquakes",
        filter: ["==", ["get", "quakeType"], 0],
        paint: { "circle-radius": 6, "circle-color": "orange", "circle-opacity": 0.8 },
      });
      map.addLayer({
        id: "moonquakes-deep",
        type: "circle",
        source: "moonquakes",
        filter: ["==", ["get", "quakeType"], 1],
        paint: { "circle-radius": 4, "circle-color": "#cc88ff", "circle-opacity": 0.8 },
      });
      map.addLayer({
        id: "moonquakes-artificial",
        type: "circle",
        source: "moonquakes",
        filter: ["==", ["get", "quakeType"], 2],
        paint: { "circle-radius": 5, "circle-color": "#3399ff", "circle-opacity": 0.8 },
      });

      // Single click handler using queryRenderedFeatures for reliability
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: QUAKE_LAYERS });
        if (features.length === 0) return;
        const idx = features[0].properties?.idx;
        if (typeof idx === "number") {
          const quake = dataRef.current[idx];
          if (quake) onSelectRef.current(quake);
        }
      });

      QUAKE_LAYERS.forEach((layerId) => {
        map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
      });

      // Populate with data already loaded
      const src = map.getSource("moonquakes") as maplibregl.GeoJSONSource | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (src && dataRef.current.length > 0) src.setData(toGeoJSON(dataRef.current) as any);
    });

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsMap]);

  // Update source data when moonquakeData changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || moonquakeData.length === 0) return;

    const update = () => {
      const src = map.getSource("moonquakes") as maplibregl.GeoJSONSource | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (src) src.setData(toGeoJSON(moonquakeData) as any);
    };

    if (map.isStyleLoaded()) {
      update();
    } else {
      map.once("load", update);
    }
  }, [moonquakeData]);

  // Sync filter visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setLayoutProperty("moonquakes-shallow", "visibility", filters.shallow ? "visible" : "none");
    map.setLayoutProperty("moonquakes-deep", "visibility", filters.deep ? "visible" : "none");
    map.setLayoutProperty("moonquakes-artificial", "visibility", filters.artificial ? "visible" : "none");
  }, [filters]);

  return <Box ref={mapContainer} w="100%" h="100%" bgColor="black" />;
};
