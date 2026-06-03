import { Box, Text, VStack, Icon, Badge } from "@chakra-ui/react";
import React, { useState } from "react";
import { MdDragIndicator } from "react-icons/md";
import { MoonquakeData, isShallowMoonquake, isDeepMoonquake, isArtificialImpact } from "@/type";

type Props = {
  selectedMoonquake: MoonquakeData | null;
};

const TYPE_LABEL = ["Shallow", "Deep", "Artificial Impact"];
const TYPE_COLOR = ["orange", "purple", "blue"] as const;

export const Panel = ({ selectedMoonquake }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const rows = selectedMoonquake ? getMoonquakeRows(selectedMoonquake) : null;

  return (
    <Box
      position="absolute"
      top={10}
      right={10}
      zIndex={1}
      h={isOpen ? "auto" : "64px"}
      borderRadius="md"
      color="gray.200"
      border="1px solid"
      borderColor="gray.200"
      bgColor="#fff1"
      minW="240px"
      userSelect="none"
      backdropFilter="blur(2px)"
      overflow="hidden"
      transition="0.3s"
    >
      <Box position="relative" px="24px" py="16px">
        <Text fontWeight={500} fontSize={20} pb="10px" lineHeight="32px">
          {selectedMoonquake ? (
            <Badge colorScheme={TYPE_COLOR[selectedMoonquake.type]} fontSize="sm" verticalAlign="middle">
              {TYPE_LABEL[selectedMoonquake.type]}
            </Badge>
          ) : (
            "Detail"
          )}
        </Text>
        <Icon
          position="absolute"
          as={MdDragIndicator}
          fontSize={30}
          opacity={0.8}
          top={4}
          right={4}
          cursor="pointer"
          transition="0.3s"
          _hover={{ opacity: 0.5 }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <VStack spacing={0} align="flex-start" opacity={isOpen ? 1 : 0} transition="0.3s">
          {!rows ? (
            <Text fontSize="14px" color="gray.400" py={2}>
              Click a pin to see details
            </Text>
          ) : (
            rows.map(({ key, value }, i) => (
              <Text
                key={i}
                fontSize="16px"
                minH="40px"
                lineHeight="40px"
                borderTop="1px solid"
                borderColor="#B0BAC640"
                w="100%"
                isTruncated
              >
                {key}: {value}
              </Text>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
};

const getMoonquakeRows = (quake: MoonquakeData): { key: string; value: string | number }[] => {
  const rows: { key: string; value: string | number }[] = [
    { key: "Lat", value: quake.location.latitude.toFixed(2) },
    { key: "Long", value: quake.location.longitude.toFixed(2) },
  ];

  if (isShallowMoonquake(quake)) {
    rows.push({ key: "Magnitude", value: quake.magnitude });
    if (quake.time) {
      rows.push({ key: "Year", value: quake.time.year });
      rows.push({ key: "Day", value: quake.time.day });
    }
    if (quake.comments) rows.push({ key: "Note", value: quake.comments });
  } else if (isDeepMoonquake(quake)) {
    rows.push({ key: "Depth", value: `${quake.depth} km` });
    rows.push({ key: "Station", value: quake.A });
    rows.push({ key: "Side", value: quake.side });
  } else if (isArtificialImpact(quake)) {
    rows.push({ key: "Mission", value: quake.ai });
    if (quake.time) rows.push({ key: "Year", value: quake.time.year });
  }

  return rows;
};
