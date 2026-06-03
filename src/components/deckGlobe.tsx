import { _GlobeView as GlobeView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useMemo, useRef } from "react";
import { isShallowMoonquake } from "@/type";
import type { Filters, MoonquakeData } from "@/type";

const MOON_TILE_URL =
  "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg";

const ZOOM_SWITCH = 3.5;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.8,
};

type Props = {
  moonquakeData: MoonquakeData[];
  filters: Filters;
  onSelectMoonquake: (q: MoonquakeData) => void;
  onZoomIn: () => void;
};

const getColor = (q: MoonquakeData): [number, number, number, number] => {
  if (q.type === 0) return [255, 165, 0, 217];
  if (q.type === 1) return [204, 136, 255, 217];
  return [51, 153, 255, 217];
};

const getRadius = (q: MoonquakeData): number => {
  if (isShallowMoonquake(q)) return Math.max(8, q.magnitude ** 2 * 1.6);
  if (q.type === 2) return 11;
  return 8;
};

export const DeckGlobe = ({ moonquakeData, filters, onSelectMoonquake, onZoomIn }: Props) => {
  const switchedRef = useRef(false);

  const layers = useMemo(() => {
    const tileLayer = new TileLayer({
      id: "moon-tiles",
      data: MOON_TILE_URL,
      minZoom: 0,
      maxZoom: 6,
      tileSize: 256,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderSubLayers: (props: any) => {
        const { west, south, east, north } = props.tile.bbox;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
    });

    const filtered = moonquakeData.filter(
      (q) =>
        (q.type === 0 && filters.shallow) ||
        (q.type === 1 && filters.deep) ||
        (q.type === 2 && filters.artificial),
    );

    const scatterLayer = new ScatterplotLayer<MoonquakeData>({
      id: "moonquakes",
      data: filtered,
      getPosition: (d) => [d.location.longitude, d.location.latitude, 5000],
      getFillColor: getColor,
      getRadius,
      radiusUnits: "pixels",
      radiusMinPixels: 5,
      stroked: true,
      getLineColor: [255, 255, 255, 100],
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        if (info.object) onSelectMoonquake(info.object);
      },
    });

    return [tileLayer, scatterLayer];
  }, [moonquakeData, filters, onSelectMoonquake]);

  return (
    <DeckGL
      views={new GlobeView()}
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={layers}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onViewStateChange={({ viewState }: any) => {
        if (viewState.zoom <= ZOOM_SWITCH) {
          switchedRef.current = false;
        } else if (!switchedRef.current) {
          switchedRef.current = true;
          onZoomIn();
        }
      }}
      getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      style={{ background: "black", width: "100%", height: "100%" }}
    />
  );
};
