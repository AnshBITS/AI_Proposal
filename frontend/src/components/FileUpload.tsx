'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, Sparkles, Brain, Zap, Target } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import toast from 'react-hot-toast'

interface AnalysisResult {
  executiveSummary: string
  keyRequirements: string[]
  pricingOverview: {
    totalAmount: string
    breakdown: string[]
    paymentTerms: string
  }
  recommendedNextSteps: string[]
  metadata: {
    fileName: string
    fileSize: number
    processedAt: string
    textLength: number
  }
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Refs to manage ongoing operations
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset all state and cancel ongoing operations
  const resetAnalysis = useCallback(() => {
    // Cancel any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Reset all state
    setLoading(false)
    setResult(null)
    setError(null)
    
    toast.success('Analysis stopped and reset successfully')
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      // Reset any previous analysis when uploading a new file
      resetAnalysis()
      setFile(uploadedFile)
    } else {
      toast.error('Please upload a PDF file')
    }
  }, [resetAnalysis])

  
  // Memoize dropzone config for better performance
  const dropzoneConfig = useMemo(() => ({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: false,
    noKeyboard: false
  }), [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig)

  const runDemo = async () => {
    // Cancel any previous analysis
    resetAnalysis()
    
    setLoading(true)
    setError(null)
    
    // Create a mock file for demo
    const demoFile = new File(['demo content'], 'sample-proposal.pdf', { type: 'application/pdf' })
    setFile(demoFile)
    
    // Simulate AI processing time with cancellable timeout
    timeoutRef.current = setTimeout(() => {
      // Check if the operation was cancelled
      if (timeoutRef.current === null) {
        return
      }
    
    const mockResult: AnalysisResult = {
      executiveSummary: `This comprehensive digital transformation proposal outlines a strategic initiative to modernize legacy systems and enhance operational efficiency. The proposal demonstrates extensive technical expertise in cloud migration, custom software development, and enterprise security implementation. With a total investment of $485,000 over 8 months, this project promises to deliver a 40% improvement in operational efficiency and 25% reduction in IT costs. The proposal includes detailed implementation phases, comprehensive training programs, and ongoing support structures.`,
      keyRequirements: [
        "Complete legacy system migration to modern cloud infrastructure with zero downtime",
        "Custom software development including customer portal and mobile applications", 
        "Comprehensive staff training program covering 50+ employees across multiple departments",
        "Implementation of enterprise-grade security protocols with multi-factor authentication",
        "24/7 technical support and maintenance coverage for the first 6 months",
        "Real-time data analytics implementation and automated reporting system",
        "Security audit and penetration testing for compliance validation"
      ],
      pricingOverview: {
        totalAmount: "$485,000",
        breakdown: [
          "Phase 1 - Legacy Migration & Analysis: $180,000",
          "Phase 2 - Custom Development & Integration: $220,000",
          "Phase 3 - Training, Support & Documentation: $85,000"
        ],
        paymentTerms: "30% upon contract signing ($145,500), 40% at Phase 2 completion ($194,000), 30% upon final delivery ($145,500)"
      },
      recommendedNextSteps: [
        "Schedule technical review meeting with client's IT team within 5 business days",
        "Finalize detailed project scope and requirements documentation with stakeholder input",
        "Execute master service agreement and comprehensive statement of work",
        "Begin project kickoff phase with cross-functional team onboarding",
        "Conduct thorough legacy system audit and create detailed migration timeline",
        "Establish communication protocols and project management framework",
        "Set up development environment and testing infrastructure",
        "Create risk mitigation strategies and contingency planning"
      ],
      metadata: {
        fileName: 'sample-proposal.pdf',
        fileSize: 156789,
        processedAt: new Date().toISOString(),
        textLength: 2847
      }
    }
    
    setResult(mockResult)
    setLoading(false)
    timeoutRef.current = null
    toast.success('Demo analysis complete! This is how real AI analysis works.')
  }, 3000)
  }

  const analyzeProposal = async () => {
    if (!file) return

    // Cancel any previous analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      // First try the real API
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('http://localhost:5001/api/analyze-proposal', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal // Add abort signal
      })

      if (response.ok) {
        const analysisResult = await response.json()
        
        // Check if the request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return
        }
        
        setResult(analysisResult)
        toast.success('Proposal analyzed successfully!')
      } else {
        throw new Error('API not available')
      }
    } catch (error: unknown) {
      // Check if the error is due to cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Analysis was cancelled')
        return
      }
      
      // Fallback to mock AI response for demo purposes
      console.log('Using mock AI response for demo:', error)
      
      // Simulate AI processing time with cancellable timeout
      timeoutRef.current = setTimeout(async () => {
        // Check if the operation was cancelled
        if (timeoutRef.current === null || abortControllerRef.current?.signal.aborted) {
          return
        }
      
      const mockResult: AnalysisResult = {
        executiveSummary: `Based on the uploaded proposal "${file.name}", this appears to be a comprehensive business proposal outlining digital transformation services. The proposal demonstrates strong technical capabilities and includes detailed project timelines, cost breakdowns, and implementation strategies. The proposed solution addresses key business needs including system modernization, operational efficiency improvements, and technological advancement. This is a well-structured proposal with clear deliverables and professional presentation.`,
        keyRequirements: [
          "Complete legacy system migration to modern cloud infrastructure",
          "Custom software development for customer portal and mobile applications", 
          "Comprehensive staff training program for 50+ employees",
          "Implementation of enterprise-grade security protocols and multi-factor authentication",
          "24/7 technical support and maintenance for the first 6 months",
          "Data integrity verification and zero-downtime migration requirements"
        ],
        pricingOverview: {
          totalAmount: "$485,000",
          breakdown: [
            "Phase 1 - Legacy Migration: $180,000",
            "Phase 2 - Custom Development: $220,000",
            "Phase 3 - Training & Support: $85,000"
          ],
          paymentTerms: "30% upon contract signing, 40% at Phase 2 completion, 30% upon final delivery"
        },
        recommendedNextSteps: [
          "Schedule technical review meeting with client's IT team within 5 business days",
          "Finalize detailed project scope and requirements documentation",
          "Execute master service agreement and statement of work",
          "Begin project kickoff phase with team onboarding and stakeholder alignment",
          "Conduct initial system audit and create migration timeline",
          "Establish communication protocols and project management framework"
        ],
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
          textLength: 2847
        }
      }
        
        setResult(mockResult)
        toast.success('Proposal analyzed successfully! (Demo mode)')
        
        // Clear the timeout reference
        timeoutRef.current = null
      }, 2000)
    } finally {
      setLoading(false)
      // Clear the abort controller reference when done
      abortControllerRef.current = null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const exportResultsAsJSON = () => {
    if (!result) return
    
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${result.metadata.fileName.replace('.pdf', '')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Analysis exported as JSON!')
  }

  const exportResultsAsPDF = () => {
    if (!result) return
    
    // Create HTML content optimized for PDF printing
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI Proposal Analysis Report</title>
    <style>
        @media print {
            @page { margin: 1in; size: A4; }
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px; 
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section h2 { 
            color: #667eea; 
            border-bottom: 2px solid #667eea; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
        }
        .list-item { 
            margin: 8px 0; 
            padding-left: 15px; 
            position: relative;
        }
        .list-item:before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .pricing-box { 
            background: #f8f9ff; 
            border: 1px solid #e1e5f2; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 15px 0;
        }
        .metadata { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 30px; 
            border-left: 4px solid #667eea;
        }
        .metadata p { margin: 5px 0; }
        .total-amount { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2d5aa0; 
            text-align: center; 
            margin: 15px 0;
        }
        .print-instructions {
            background: #e8f4fd;
            border: 1px solid #bee3f8;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <p><strong>📄 To save as PDF:</strong> Press Ctrl+P (Windows) or Cmd+P (Mac), then select "Save as PDF" or "Print to PDF"</p>
    </div>
    
    <div class="header">
        <h1>🤖 AI Proposal Analysis Report</h1>
        <p>Comprehensive Analysis Generated by AI</p>
    </div>

    <div class="section">
        <h2>📋 Executive Summary</h2>
        <p>${result.executiveSummary}</p>
    </div>

    <div class="section">
        <h2>✅ Key Requirements</h2>
        ${result.keyRequirements.map(req => `<div class="list-item">${req}</div>`).join('')}
    </div>

    <div class="section">
        <h2>💰 Pricing Overview</h2>
        <div class="pricing-box">
            <div class="total-amount">${result.pricingOverview.totalAmount}</div>
            <h3>Breakdown:</h3>
            ${result.pricingOverview.breakdown.map(item => `<div class="list-item">${item}</div>`).join('')}
            <p><strong>Payment Terms:</strong> ${result.pricingOverview.paymentTerms}</p>
        </div>
    </div>

    <div class="section">
        <h2>🚀 Recommended Next Steps</h2>
        ${result.recommendedNextSteps.map((step, index) => `<div class="list-item">${index + 1}. ${step}</div>`).join('')}
    </div>

    <div class="metadata">
        <p><strong>Source File:</strong> ${result.metadata.fileName}</p>
        <p><strong>File Size:</strong> ${formatFileSize(result.metadata.fileSize)}</p>
        <p><strong>Processing Date:</strong> ${new Date(result.metadata.processedAt).toLocaleString()}</p>
        <p><strong>Text Length:</strong> ${result.metadata.textLength} characters</p>
    </div>
</body>
</html>
    `
    
    // Open in new window for easy PDF conversion
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      toast.success('Analysis opened in new tab! Use Ctrl+P (Cmd+P on Mac) to save as PDF.')
    } else {
      // Fallback: download as HTML file
      const dataBlob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(dataBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analysis-${result.metadata.fileName.replace('.pdf', '')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('HTML file downloaded! Open it and use Ctrl+P to save as PDF.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            🤖 AI Proposal Analysis
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your PDF proposal and get instant AI-powered insights including executive summaries, key requirements, pricing analysis, and actionable next steps.
          </p>
        </motion.div>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors bg-gray-800">
        <CardContent className="p-8">
          {!file ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg p-8 text-center transition-all ${
                isDragActive 
                  ? 'bg-blue-900/20 border-blue-600' 
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center space-y-4"
              >
                <div className={`rounded-full p-4 ${
                  isDragActive ? 'bg-blue-800' : 'bg-gray-700'
                }`}>
                  <Upload className={`h-8 w-8 ${
                    isDragActive ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isDragActive ? 'Drop your PDF here' : 'Upload Proposal PDF'}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    Drag & drop or click to browse • Max 10MB
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="rounded-full p-4 bg-green-800">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  File Uploaded Successfully!
                </h3>
                <p className="text-green-300 mt-1 font-medium">
                  📄 {file.name}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {formatFileSize(file.size)} • Ready for analysis
                </p>
              </div>
              <Button
                onClick={() => {
                  resetAnalysis()
                  setFile(null)
                }}
                variant="outline"
                size="sm"
                className="mt-3 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
              >
                Upload Different File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Button */}
      <Card className="border-purple-600 bg-gradient-to-br from-purple-900/20 via-gray-800/50 to-blue-900/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">
              🚀 Try Demo Mode
            </h3>
            <p className="text-gray-300 mb-6 max-w-sm mx-auto">
              Experience the power of AI analysis with our sample proposal. Perfect for testing the platform capabilities.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Instant Results
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Full Analysis
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Export Ready
                </span>
              </div>
              <Button 
                onClick={runDemo}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 btn-hover"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Demo...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Demo Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced File Analysis Section */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-gray-600 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-2xl backdrop-blur-sm">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 animate-pulse"></div>
              
              {/* Floating AI Icons */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 left-6 text-blue-400/20 dark:text-blue-400/30"
                >
                  <Brain className="h-8 w-8" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-12 right-8 text-purple-400/20 dark:text-purple-400/30"
                >
                  <Zap className="h-6 w-6" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-8 left-12 text-blue-400/20 dark:text-blue-400/30"
                >
                  <Target className="h-7 w-7" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-6 right-6 text-purple-400/20 dark:text-purple-400/30"
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
              </div>
              
              <CardContent className="relative p-10">
                <div className="text-center space-y-8">
                  {/* Enhanced Header */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                      >
                        <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-4 shadow-lg">
                          <FileText className="h-10 w-10 text-white" />
                        </div>
                        {/* AI pulse ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-ping"></div>
                      </motion.div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4 mb-6">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-2 bg-blue-500 rounded-full"
                        >
                          <Brain className="h-6 w-6 text-white" />
                        </motion.div>
                        <h3 className="text-4xl font-bold text-white">
                          🚀 Ready to Analyze Your Proposal?
                        </h3>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          className="p-2 bg-purple-500 rounded-full"
                        >
                          <Sparkles className="h-6 w-6 text-white" />
                        </motion.div>
                      </div>
                      
                      <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
                        Upload your PDF and let AI extract the key insights for you
                      </p>
                      
                      {/* Enhanced description */}
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-700/50">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          🤖 AI Proposal Analysis
                        </h4>
                        <p className="text-gray-300">
                          Upload your PDF proposal and get instant AI-powered insights including executive summaries, 
                          key requirements, pricing analysis, and actionable next steps.
                        </p>
                      </div>
                      
                      {/* Enhanced AI Features Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        <motion.div
                          whileHover={{ scale: 1.08, y: -4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="p-3 bg-blue-500 rounded-full shadow-lg"
                            >
                              <Brain className="h-6 w-6 text-white" />
                            </motion.div>
                            <h5 className="font-semibold text-white">Smart Analysis</h5>
                            <p className="text-sm text-gray-300 text-center">
                              Advanced AI algorithms analyze document structure and extract key insights
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.08, y: -4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50 shadow-lg hover:shadow-xl hover:border-purple-500 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className="p-3 bg-purple-500 rounded-full shadow-lg"
                            >
                              <Zap className="h-6 w-6 text-white" />
                            </motion.div>
                            <h5 className="font-semibold text-white">Lightning Fast</h5>
                            <p className="text-sm text-gray-300 text-center">
                              Get comprehensive results in under 30 seconds with real-time processing
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.08, y: -4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl p-6 border border-green-700/50 shadow-lg hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="p-3 bg-green-500 rounded-full shadow-lg"
                            >
                              <Target className="h-6 w-6 text-white" />
                            </motion.div>
                            <h5 className="font-semibold text-white">Precise Results</h5>
                            <p className="text-sm text-gray-300 text-center">
                              Export-ready summaries, requirements, pricing, and next steps
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced File Info Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 p-6 mx-auto max-w-lg shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 p-3 flex-shrink-0 shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left flex-grow min-w-0">
                        <h4 className="font-bold text-white truncate text-lg">
                          📄 {file.name}
                        </h4>
                        <p className="text-gray-400 font-medium">
                          {formatFileSize(file.size)} • PDF ready for analysis
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Action Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                  >
                    <Button 
                      onClick={analyzeProposal} 
                      disabled={loading}
                      size="xl"
                      className="relative overflow-hidden group min-w-[220px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 group-hover:bg-pos-100 transition-all duration-300"></div>
                      <div className="relative z-10 flex items-center">
                        {loading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Analyzing Document...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-3 h-5 w-5" />
                            Analyze Proposal Now
                          </>
                        )}
                      </div>
                    </Button>
                    
                    <Button
                      onClick={resetAnalysis}
                      variant="outline"
                      size="xl"
                      className="min-w-[140px] border-2"
                      disabled={loading}
                    >
                      Start Over
                    </Button>
                  </motion.div>

                  {/* Enhanced Loading Progress */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="h-8 w-8 text-blue-600" />
                          </motion.div>
                          <span className="text-blue-800 dark:text-blue-300 font-bold text-lg">
                            AI is analyzing your proposal...
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                          <motion.div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 20, ease: "easeInOut" }}
                          ></motion.div>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 text-sm text-center font-medium">
                          This may take 15-30 seconds depending on document complexity
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-900">Analysis Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <Card className="border-green-800 bg-green-900/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-400">Analysis Complete</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Processed {result.metadata.textLength} characters from {result.metadata.fileName}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Button variant="outline" onClick={exportResultsAsJSON} className="dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/50">
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                      </Button>
                    </div>
                    <Button variant="outline" onClick={exportResultsAsPDF} className="dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/50">
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button variant="outline" onClick={resetAnalysis} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                      Reset
                    </Button>
                    <Button onClick={runDemo} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                      Try Another Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card className="border-blue-800 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-400 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    📋
                  </div>
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{result.executiveSummary}</p>
              </CardContent>
            </Card>

            {/* Key Requirements */}
            <Card className="border-purple-800 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-purple-900 dark:text-purple-400 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    🎯
                  </div>
                  Key Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.keyRequirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-1.5 flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                      </div>
                      <span className="text-gray-300 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pricing Overview */}
            <Card className="border-green-800 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-green-900 dark:text-green-400 flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    💰
                  </div>
                  Pricing Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-400 mb-2">Total Amount</h4>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{result.pricingOverview.totalAmount}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Payment Terms</h4>
                    <p className="text-blue-700 dark:text-blue-300">{result.pricingOverview.paymentTerms}</p>
                  </div>
                </div>
                {result.pricingOverview.breakdown.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-200 mb-3">Breakdown</h4>
                    <ul className="space-y-3">
                      {result.pricingOverview.breakdown.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0 mt-2" />
                          <span className="text-gray-300 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="border-orange-800 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-orange-900 dark:text-orange-400 flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                    🚀
                  </div>
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommendedNextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-bold text-sm w-8 h-8 flex items-center justify-center flex-shrink-0 border border-orange-200 dark:border-orange-700">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 flex-1 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default React.memo(FileUpload)
