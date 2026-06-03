import * as Cesium from "cesium";
import type { Viewer as CesiumViewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useEffect, useRef } from "react";
import { Viewer as ResiumViewer } from "resium";
import type { CesiumComponentRef } from "resium";
import { isShallowMoonquake } from "@/type";
import type { Filters, MoonquakeData } from "@/type";

const MOON_TILE_URL =
  "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg";

// Switch to 2D map when camera is below this altitude (metres, using Earth ellipsoid scale)
const ZOOM_SWITCH_HEIGHT = 500_000;

type Props = {
  moonquakeData: MoonquakeData[];
  filters: Filters;
  onSelectMoonquake: (q: MoonquakeData) => void;
  onZoomIn: () => void;
};

const getPixelSize = (q: MoonquakeData): number => {
  if (isShallowMoonquake(q)) return Math.max(5, q.magnitude ** 2 * 1.2);
  if (q.type === 2) return 8;
  return 5;
};

const getCesiumColor = (q: MoonquakeData): Cesium.Color => {
  if (q.type === 0) return Cesium.Color.ORANGE.withAlpha(0.85);
  if (q.type === 1) return new Cesium.Color(0.8, 0.53, 1.0, 0.85);
  return new Cesium.Color(0.2, 0.6, 1.0, 0.85);
};

export const CesiumGlobe = ({ moonquakeData, filters, onSelectMoonquake, onZoomIn }: Props) => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const onSelectRef = useRef(onSelectMoonquake);
  const onZoomInRef = useRef(onZoomIn);
  const dataRef = useRef<MoonquakeData[]>(moonquakeData);

  onSelectRef.current = onSelectMoonquake;
  onZoomInRef.current = onZoomIn;
  dataRef.current = moonquakeData;

  // One-time viewer setup
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    // Moon imagery (replace default Earth tiles)
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: MOON_TILE_URL,
        minimumLevel: 0,
        maximumLevel: 6,
        credit: new Cesium.Credit("NASA/GSFC/Arizona State University"),
      }),
    );

    // Space environment
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
    if (viewer.scene.globe) viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.backgroundColor = Cesium.Color.BLACK;

    // Start with a nice orbital view
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 3_500_000),
      duration: 0,
    });

    // Zoom-in → switch to 2D map
    viewer.camera.percentageChanged = 0.05;
    const removeZoomListener = viewer.camera.changed.addEventListener(() => {
      if (viewer.camera.positionCartographic.height < ZOOM_SWITCH_HEIGHT) {
        onZoomInRef.current();
      }
    });

    // Click → select moonquake
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
        const id = picked.id.id as string;
        if (id?.startsWith("quake-")) {
          const idx = parseInt(id.slice(6), 10);
          const quake = dataRef.current[idx];
          if (quake) onSelectRef.current(quake);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Cursor change on hover
    const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    moveHandler.setInputAction((movement: { endPosition: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.endPosition);
      viewer.scene.canvas.style.cursor =
        Cesium.defined(picked) && picked.id instanceof Cesium.Entity ? "pointer" : "default";
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      removeZoomListener();
      handler.destroy();
      moveHandler.destroy();
    };
  }, []);

  // Update entities when data or filters change
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || !moonquakeData.length) return;

    viewer.entities.removeAll();

    moonquakeData.forEach((quake, idx) => {
      const visible =
        (quake.type === 0 && filters.shallow) ||
        (quake.type === 1 && filters.deep) ||
        (quake.type === 2 && filters.artificial);
      if (!visible) return;

      viewer.entities.add({
        id: `quake-${idx}`,
        position: Cesium.Cartesian3.fromDegrees(
          quake.location.longitude,
          quake.location.latitude,
          0,
        ),
        point: {
          pixelSize: getPixelSize(quake),
          color: getCesiumColor(quake),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
          outlineWidth: 1,
          // Always render on top of globe surface
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });
  }, [moonquakeData, filters]);

  return (
    <ResiumViewer
      ref={viewerRef}
      style={{ width: "100%", height: "100%" }}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      animation={false}
      timeline={false}
      fullscreenButton={false}
      infoBox={false}
      selectionIndicator={false}
    />
  );
};
