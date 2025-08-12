// app/layout.tsx

import './globals.css'
import { Metadata } from 'next'
import { ChakraProviders } from './components/providers'

export const metadata: Metadata = {
  title: 'Health Report Summarizer | AI-Powered Medical Document Analysis',
  description: 'Upload and analyze medical reports, diagnostic results, and health documents with AI-powered summarization. Get key insights, detected terms, and structured summaries.',
  keywords: 'medical reports, health analysis, AI summarization, diagnostic reports, healthcare AI',
  authors: [{ name: 'Health Report Summarizer' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Health Report Summarizer',
    description: 'AI-powered medical document analysis and summarization',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health Report Summarizer',
    description: 'AI-powered medical document analysis and summarization',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ChakraProviders>
          <AppShell>
            {children}
          </AppShell>
        </ChakraProviders>
      </body>
    </html>
  )
}

// Navigation and layout components
'use client'

import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button,
  useColorMode,
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

// Chakra providers wrapper
function ChakraProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        {children}
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

export { ChakraProviders }

import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button,
  useColorMode,
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

function ProvidersComponent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </>
  )
}

export { ProvidersComponent as Providers }

// Navigation and layout shell
function AppShell({ children }: { children: React.ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const [showHistory, setShowHistory] = useState(false)

  const handleHistoryToggle = () => {
    setShowHistory(!showHistory)
    // Dispatch custom event for page.tsx to listen to
    window.dispatchEvent(new CustomEvent('toggleHistory', { detail: !showHistory }))
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