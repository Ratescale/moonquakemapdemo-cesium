import { Box, Text, Badge, IconButton } from "@chakra-ui/react";
import { AiOutlineClose } from "react-icons/ai";
import { MoonquakeData, isShallowMoonquake, isDeepMoonquake, isArtificialImpact } from "@/type";

type Props = {
  selectedMoonquake: MoonquakeData | null;
  onClose: () => void;
};

const TYPE_LABEL = ["Shallow Moonquake", "Deep Moonquake", "Artificial Impact"];
const TYPE_COLOR = ["orange", "purple", "blue"] as const;

export const Panel = ({ selectedMoonquake, onClose }: Props) => {
  const rows = selectedMoonquake ? getMoonquakeRows(selectedMoonquake) : [];

  return (
    <Box
      position="absolute"
      top={10}
      right={10}
      zIndex={10}
      minW="260px"
      maxW="320px"
      borderRadius="xl"
      bgColor="rgba(10, 12, 18, 0.88)"
      backdropFilter="blur(14px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      boxShadow="0 8px 32px rgba(0,0,0,0.6)"
      transform={selectedMoonquake ? "translateX(0)" : "translateX(calc(100% + 48px))"}
      transition="transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Box px={5} pt={4} pb={5}>
        {/* header row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Badge
            colorScheme={TYPE_COLOR[selectedMoonquake?.type ?? 0]}
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
            textTransform="uppercase"
            letterSpacing="wide"
          >
            {selectedMoonquake ? TYPE_LABEL[selectedMoonquake.type] : ""}
          </Badge>
          <IconButton
            aria-label="Close panel"
            icon={<AiOutlineClose />}
            size="xs"
            variant="ghost"
            color="whiteAlpha.600"
            _hover={{ color: "white", bg: "whiteAlpha.100" }}
            onClick={onClose}
          />
        </Box>

        {/* data rows */}
        <Box>
          {rows.map(({ key, value }, i) => (
            <Box
              key={i}
              py={2}
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="wider" lineHeight={1}>
                {key}
              </Text>
              <Text fontSize="sm" color="gray.100" mt={1} fontFamily="mono">
                {value}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const getMoonquakeRows = (quake: MoonquakeData): { key: string; value: string | number }[] => {
  const rows: { key: string; value: string | number }[] = [
    { key: "Latitude", value: `${quake.location.latitude.toFixed(3)}°` },
    { key: "Longitude", value: `${quake.location.longitude.toFixed(3)}°` },
  ];

  if (isShallowMoonquake(quake)) {
    rows.push({ key: "Magnitude", value: quake.magnitude });
    if (quake.time) {
      rows.push({ key: "Year / Day", value: `${quake.time.year} / ${quake.time.day}` });
      rows.push({ key: "Time (UTC)", value: `${String(quake.time.hour).padStart(2, "0")}:${String(quake.time.minutes).padStart(2, "0")}:${String(quake.time.seconds).padStart(2, "0")}` });
    }
    if (quake.comments) rows.push({ key: "Note", value: quake.comments });
  } else if (isDeepMoonquake(quake)) {
    rows.push({ key: "Depth", value: `${quake.depth} km` });
    rows.push({ key: "Station", value: quake.A });
    rows.push({ key: "Near Side / Far Side", value: quake.side });
    if (quake.assumed) rows.push({ key: "Assumed", value: quake.assumed });
  } else if (isArtificialImpact(quake)) {
    rows.push({ key: "Mission", value: quake.ai });
    if (quake.time) {
      rows.push({ key: "Year / Day", value: `${quake.time.year} / ${quake.time.day}` });
    }
  }

  return rows;
};
