import {
  Box,
  Icon,
  useDisclosure,
  SlideFade,
  VStack,
  Text,
  Checkbox,
  Divider,
} from "@chakra-ui/react";
import { AiOutlineClose, AiOutlineMenu, AiFillInfoCircle } from "react-icons/ai";
import type { Filters } from "@/type";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export const Header = ({ filters, setFilters }: Props) => {
  const { isOpen, onToggle } = useDisclosure();

  const toggle = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box position="absolute" top={0} left={0} userSelect="none" h="fit-content" w="280px" zIndex={1}>
      <Icon
        position="absolute"
        top="24px"
        left="24px"
        as={isOpen ? AiOutlineClose : AiOutlineMenu}
        fontSize={24}
        color={isOpen ? "gray.600" : "gray.300"}
        onClick={onToggle}
        zIndex={10}
        cursor="pointer"
      />
      <SlideFade in={isOpen} offsetX={-80} offsetY={0} unmountOnExit>
        <VStack bgColor="gray.300" h="100vh" pt="72px" px="26px" gap={2} color="gray.600" overflowY="scroll">
          <Box w="100%">
            <Text fontSize={24} fontWeight="medium">
              Filter
            </Text>
            <Text fontSize={12}>
              <Icon as={AiFillInfoCircle} fontSize={12} mr="8px" />
              Click to filter.
            </Text>
            <Box w="100%" pt={3} pb={1}>
              <Checkbox
                size="lg"
                colorScheme="orange"
                isChecked={filters.shallow}
                onChange={() => toggle("shallow")}
              >
                Shallow
              </Checkbox>
            </Box>
            <Box w="100%" pb={1}>
              <Checkbox
                size="lg"
                colorScheme="purple"
                isChecked={filters.deep}
                onChange={() => toggle("deep")}
              >
                Deep
              </Checkbox>
            </Box>
            <Box w="100%">
              <Checkbox
                size="lg"
                colorScheme="blue"
                isChecked={filters.artificial}
                onChange={() => toggle("artificial")}
              >
                Artificial
              </Checkbox>
            </Box>
          </Box>
          <Divider borderColor="gray.600" pt={4} />
          <Box w="100%" pt={2}>
            <Text fontSize={14} color="gray.500">
              Data: NASA Apollo Seismic Event Catalog
            </Text>
            <Text fontSize={12} color="gray.400" pt={1}>
              Orange = Shallow · Purple = Deep · Blue = Artificial Impact
            </Text>
          </Box>
          <Divider borderColor="gray.600" pt={4} />
          <Text fontSize={12} color="gray.500">©ESO/S. Brunier</Text>
          <Text fontSize={12} color="gray.500">Developed by Ren Aoki</Text>
        </VStack>
      </SlideFade>
    </Box>
  );
};
