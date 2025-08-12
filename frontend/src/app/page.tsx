// app/page.tsx

'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Progress,
  Skeleton,
  SkeletonText,
  Tag,
  TagLabel,
  Text,
  useColorMode,
  useToast,
  VStack,
  Collapse,
  Badge,
  Divider,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import {
  AttachmentIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  TimeIcon,
  ViewIcon,
  WarningIcon,
  InfoIcon
} from '@chakra-ui/icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// TypeScript types
type SummaryResult = {
  summary: string
  metadata: {
    filename: string
    n_pages?: number
    n_sentences?: number
    terms?: string[]
  }
}

type HistoryItem = {
  id: string
  filename: string
  summaryPreview: string
  timestamp: string
}

const UPLOAD_API_URL = 'http://localhost:5000/upload'
const HISTORY_API_URL = '/api/history'
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB in bytes

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { colorMode } = useColorMode()

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory()
    
    // Listen for history toggle events from layout
    const handleToggleHistory = (event: CustomEvent) => {
      setShowHistory(event.detail)
    }
    
    window.addEventListener('toggleHistory', handleToggleHistory as EventListener)
    return () => window.removeEventListener('toggleHistory', handleToggleHistory as EventListener)
  }, [])

  // Fetch history from API (with mock fallback)
  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch(HISTORY_API_URL)
      if (response.ok) {
        const data = await response.json()
        setHistoryItems(data)
      } else {
        // Mock data fallback
        const mockHistory: HistoryItem[] = [
          {
            id: '1',
            filename: 'mammogram_results_2024.pdf',
            summaryPreview: 'Normal breast tissue examination with no abnormalities detected...',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            id: '2',
            filename: 'blood_work_comprehensive.csv',
            summaryPreview: 'Complete blood count within normal ranges, cholesterol slightly elevated...',
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            id: '3',
            filename: 'cardiology_report_june.pdf',
            summaryPreview: 'ECG shows normal sinus rhythm, echocardiogram reveals good cardiac function...',
            timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          }
        ]
        setHistoryItems(mockHistory)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      // Use mock data on error
      setHistoryItems([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
    const allowedExtensions = ['.pdf', '.csv']
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 15MB limit.`
    }
    
    const hasValidType = allowedTypes.includes(file.type)
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!hasValidType && !hasValidExtension) {
      return 'Only PDF and CSV files are supported.'
    }
    
    return null
  }

  // Upload file function with progress simulation
  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast({
        title: 'File Validation Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setSummaryResult(null)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const result: SummaryResult = await response.json()
      setSummaryResult(result)
      
      toast({
        title: 'Upload Successful',
        description: `Successfully processed ${file.name}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      // Refresh history
      fetchHistory()

    } catch (error) {
      clearInterval(progressInterval)
      console.error('Upload failed:', error)
      
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Network error occurred. Please try again.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  // Download summary as text file
  const downloadSummary = () => {
    if (!summaryResult) return
    
    const content = `# ${summaryResult.metadata.filename} - Summary\n\n${summaryResult.summary}\n\n## Metadata\n- Pages: ${summaryResult.metadata.n_pages || 'N/A'}\n- Sentences: ${summaryResult.metadata.n_sentences || 'N/A'}\n- Detected Terms: ${summaryResult.metadata.terms?.join(', ') || 'None'}`
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${summaryResult.metadata.filename.replace(/\.[^/.]+$/, '')}_summary.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy summary to clipboard
  const copyToClipboard = async () => {
    if (!summaryResult) return
    
    try {
      await navigator.clipboard.writeText(summaryResult.summary)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
      
      toast({
        title: 'Copied to Clipboard',
        description: 'Summary has been copied to your clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const loadFromHistory = (item: HistoryItem) => {
    const mockResult: SummaryResult = {
      summary: `${item.summaryPreview} This is a mock expanded summary that would typically be fetched from your backend API. The full analysis would include detailed findings, recommendations, and medical insights based on the processed document.`,
      metadata: {
        filename: item.filename,
        n_pages: Math.floor(Math.random() * 10) + 1,
        n_sentences: Math.floor(Math.random() * 50) + 20,
        terms: ['normal', 'examination', 'recommendation', 'follow-up']
      }
    }
    
    setSummaryResult(mockResult)
    
    toast({
      title: 'Loaded from History',
      description: `Loaded summary for ${item.filename}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Highlight important terms in summary text
  const highlightTerms = (text: string, terms: string[] = []) => {
    if (terms.length === 0) return text
    
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => {
      const isHighlighted = terms.some(term => 
        part.toLowerCase() === term.toLowerCase()
      )
      
      return isHighlighted ? (
        <Box 
          key={index} 
          as="span" 
          bg="yellow.200" 
          color="yellow.800" 
          px={1} 
          borderRadius="sm"
          fontWeight="medium"
        >
          {part}
        </Box>
      ) : part
    })
  }

  return (
    <Grid 
      templateColumns={{ base: '1fr', lg: showHistory ? '1fr 350px' : '1fr' }} 
      gap={6}
      minH="70vh"
    >
      {/* Main Content Column */}
      <GridItem>
        <VStack spacing={6} align="stretch">
          
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <Heading size="md" color="brand.600">
                Upload Health Report
              </Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Upload PDF or CSV files for AI-powered analysis and summarization
              </Text>
            </CardHeader>
            <CardBody>
              {/* Upload Zone */}
              <Box
                className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
                p={8}
                textAlign="center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload file area"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
              >
                <VStack spacing={4}>
                  <Icon 
                    as={AttachmentIcon} 
                    boxSize={12} 
                    color={isDragOver ? 'brand.500' : 'gray.400'} 
                  />
                  <Box>
                    <Text fontSize="lg" fontWeight="medium" color="gray.700">
                      Drop files here or click to browse
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Supports PDF and CSV files up to 15MB
                    </Text>
                  </Box>
                  <Button 
                    colorScheme="brand" 
                    size="md"
                    isDisabled={isUploading}
                  >
                    Choose File
                  </Button>
                </VStack>
              </Box>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-label="File upload input"
              />

              {/* Upload Progress */}
              {isUploading && (
                <Box mt={4}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" color="gray.600">
                      Processing file...
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {Math.round(uploadProgress)}%
                    </Text>
                  </Flex>
                  <Progress 
                    value={uploadProgress} 
                    colorScheme="brand" 
                    size="sm"
                    borderRadius="md"
                  />
                </Box>
              )}

              {/* File Size Warning */}
              <Alert status="info" mt={4} borderRadius="md">
                <AlertIcon />
                <Box fontSize="sm">
                  <AlertTitle>File Requirements</AlertTitle>
                  <AlertDescription>
                    Maximum file size: 15MB. Supported formats: PDF, CSV
                  </AlertDescription>
                </Box>
              </Alert>
            </CardBody>
          </Card>

          {/* Summary Results */}
          {summaryResult && (
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="start">
                  <Box>
                    <Heading size="md" color="brand.600">
                      Analysis Results
                    </Heading>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {summaryResult.metadata.filename}
                    </Text>
                  </Box>
                  <HStack>
                    <Tooltip label={copiedToClipboard ? 'Copied!' : 'Copy to clipboard'}>
                      <IconButton
                        aria-label="Copy summary to clipboard"
                        icon={copiedToClipboard ? <CheckIcon /> : <CopyIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={copyToClipboard}
                        colorScheme={copiedToClipboard ? 'green' : 'gray'}
                      />
                    </Tooltip>
                    <Tooltip label="Download summary">
                      <IconButton
                        aria-label="Download summary"
                        icon={<DownloadIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={downloadSummary}
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {/* Metadata Tags */}
                <HStack spacing={2} mb={4} wrap="wrap">
                  {summaryResult.metadata.n_pages && (
                    <Badge colorScheme="blue" variant="subtle">
                      {summaryResult.metadata.n_pages} pages
                    </Badge>
                  )}
                  {summaryResult.metadata.n_sentences && (
                    <Badge colorScheme="green" variant="subtle">
                      {summaryResult.metadata.n_sentences} sentences
                    </Badge>
                  )}
                </HStack>

                {/* Medical Terms */}
                {summaryResult.metadata.terms && summaryResult.metadata.terms.length > 0 && (
                  <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                      Detected Medical Terms:
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      {summaryResult.metadata.terms.map((term, index) => (
                        <Tag key={index} size="sm" colorScheme="brand" variant="subtle">
                          <TagLabel>{term}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}

                <Divider mb={4} />

                {/* Summary Text */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                    Summary:
                  </Text>
                  <Box 
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} 
                    p={4} 
                    borderRadius="md"
                    fontSize="sm"
                    lineHeight="1.6"
                  >
                    {highlightTerms(summaryResult.summary, summaryResult.metadata.terms)}
                  </Box>
                </Box>
              </CardBody>
            </Card>
          )}

          {/* Empty State */}
          {!summaryResult && !isUploading && (
            <Card>
              <CardBody py={12}>
                <VStack spacing={4}>
                  <Icon as={InfoIcon} boxSize={12} color="gray.300" />
                  <Box textAlign="center">
                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                      No reports analyzed yet
                    </Text>
                    <Text fontSize="sm" color="gray.400" mt={1}>
                      Upload a health report to get started with AI-powered analysis
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </GridItem>

      {/* History Panel */}
      <Collapse in={showHistory} animateOpacity>
        <GridItem>
          <Card h="fit-content" maxH="80vh">
            <CardHeader>
              <Heading size="md" color="brand.600">
                <HStack>
                  <TimeIcon />
                  <Text>Recent Analysis</Text>
                </HStack>
              </Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Previously processed reports
              </Text>
            </CardHeader>
            <CardBody className="history-scroll" overflowY="auto" maxH="60vh">
              {isLoadingHistory ? (
                <VStack spacing={4}>
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} w="full">
                      <Skeleton height="20px" mb={2} />
                      <SkeletonText noOfLines={2} spacing="2" />
                    </Box>
                  ))}
                </VStack>
              ) : historyItems.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {historyItems.map((item) => (
                    <Card key={item.id} size="sm" variant="outline">
                      <CardBody p={3}>
                        <VStack align="stretch" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {item.filename}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={2}>
                            {item.summaryPreview}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.400">
                              {formatTimestamp(item.timestamp)}
                            </Text>
                            <Button
                              size="xs"
                              variant="ghost"
                              leftIcon={<ViewIcon />}
                              onClick={() => loadFromHistory(item)}
                            >
                              Load
                            </Button>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <VStack spacing={4} py={8}>
                  <Icon as={TimeIcon} boxSize={8} color="gray.300" />
                  <Box textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                      No previous reports
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Upload files to build your history
                    </Text>
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Collapse>
    </Grid>
  )
}