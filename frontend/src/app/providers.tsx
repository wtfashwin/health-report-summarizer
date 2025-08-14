
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/theme'
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button,
  IconButton,
  HStack,
  Spacer
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, TimeIcon } from '@chakra-ui/icons'
import { useState } from 'react'

// Custom theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0066cc',
      600: '#0052a3',
      700: '#003d7a',
      800: '#002952',
      900: '#001429',
    }
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

// Chakra providers wrapper with app shell
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AppShell>
          {children}
        </AppShell>
      </ChakraProvider>
    </>
  )
}

// Main app shell with navigation
function AppShell({ children }: { children: React.ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const [showHistory, setShowHistory] = useState(false)

  const handleHistoryToggle = () => {
    setShowHistory(!showHistory)
    // Dispatch custom event for page.tsx to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggleHistory', { detail: !showHistory }))
    }
  }

  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      {/* Navigation Header */}
      <Box 
        as="nav" 
        bg={colorMode === 'light' ? 'white' : 'gray.800'} 
        borderBottom="1px" 
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        position="sticky"
        top={0}
        zIndex={10}
        shadow="sm"
      >
        <Container maxW="1200px">
          <Flex align="center" h={16} px={4}>
            {/* Logo and Title */}
            <HStack spacing={3}>
              <Box 
                w={8} 
                h={8} 
                bg="brand.500" 
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="sm"
              >
                H+
              </Box>
              <Box>
                <Heading size="md" color="brand.600">
                  Health Report Summarizer
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={-1}>
                  AI-powered medical document analysis
                </Text>
              </Box>
            </HStack>

            <Spacer />

            {/* Navigation Actions */}
            <HStack spacing={2}>
              <Button
                leftIcon={<TimeIcon />}
                variant="ghost"
                size="sm"
                onClick={handleHistoryToggle}
                aria-label="Toggle history panel"
              >
                History
              </Button>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content Container */}
      <Container maxW="1200px" py={6} px={4}>
        {children}
      </Container>

      {/* Footer */}
      <Box 
        as="footer" 
        py={8} 
        mt={12}
        borderTop="1px" 
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
      >
        <Container maxW="1200px">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'center', md: 'center' }} 
            justify="space-between"
            gap={4}
          >
            <Text fontSize="sm" color="gray.500" textAlign={{ base: 'center', md: 'left' }}>
              Want faster processing? Deploy backend locally or increase server resources for better performance.
            </Text>
            <Text fontSize="xs" color="gray.400">
              © 2025 Health Report Summarizer. Built with Next.js & Chakra UI.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}