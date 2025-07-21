'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import toast from 'react-hot-toast'

interface SampleViewerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SampleViewer({ isOpen, onClose }: SampleViewerProps) {
  const [pdfError, setPdfError] = React.useState(false)
  const [pdfLoading, setPdfLoading] = React.useState(true)

  const downloadPDF = () => {
    // Download the PDF file
    const link = document.createElement('a')
    link.href = '/Sample.pdf'
    link.download = 'Sample.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sample PDF downloaded!')
  }

  const openPDFInNewTab = () => {
    // Open PDF in a new tab using the frontend static file
    window.open('/Sample.pdf', '_blank')
    toast.success('PDF opened in new tab!')
  }

  // Reset states when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPdfError(false)
      setPdfLoading(true)
      console.log('SampleViewer opened, PDF URL:', '/Sample.pdf')
      
      // Test if PDF is accessible first
      fetch('/Sample.pdf', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('PDF is accessible')
            // Set a reasonable timeout for PDF loading
            const loadingTimeout = setTimeout(() => {
              if (pdfLoading) {
                console.log('PDF iframe taking too long, showing error options')
                setPdfError(true)
                setPdfLoading(false)
              }
            }, 3000)
            
            return () => clearTimeout(loadingTimeout)
          } else {
            console.error('PDF not accessible')
            setPdfError(true)
            setPdfLoading(false)
          }
        })
        .catch(error => {
          console.error('Error testing PDF accessibility:', error)
          setPdfError(true)
          setPdfLoading(false)
        })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <div>
                  <h2 className="text-2xl font-bold">Sample File</h2>
                  <p className="text-blue-100">AI-Powered Document Viewer</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={openPDFInNewTab}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
                <Button
                  onClick={downloadPDF}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-[calc(90vh-200px)]">
            {/* PDF Viewer */}
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden relative">
              {pdfError ? (
                // Error state - show fallback options
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-6 text-lg">
                      PDF viewer not supported in this browser
                    </p>
                    <div className="space-x-4 space-y-2 flex flex-wrap justify-center">
                      <Button onClick={openPDFInNewTab} className="bg-blue-600 hover:bg-blue-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Normal state - show PDF
                <div className="relative w-full h-full">
                  {pdfLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-4">Loading PDF...</p>
                        <Button
                          onClick={() => {
                            setPdfError(true)
                            setPdfLoading(false)
                          }}
                          className="text-sm bg-orange-500 hover:bg-orange-600"
                          size="sm"
                        >
                          Having trouble? Click here
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Simple iframe PDF viewer */}
                  <iframe
                    src="/Sample.pdf#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
                    className="w-full h-full border-0"
                    title="Sample PDF Viewer"
                    style={{ minHeight: '600px' }}
                    onLoad={(e) => {
                      console.log('PDF iframe loaded successfully')
                      setPdfLoading(false)
                      // Double-check that the iframe actually has content
                      const iframe = e.target as HTMLIFrameElement
                      try {
                        if (iframe.contentDocument || iframe.contentWindow) {
                          console.log('Iframe content accessible')
                        }
                      } catch (error) {
                        console.log('Iframe content not accessible, but iframe loaded')
                      }
                    }}
                    onError={(e) => {
                      console.error('PDF iframe failed to load')
                      setPdfError(true)
                      setPdfLoading(false)
                    }}
                  />
                  
                  {/* Backup object viewer - hidden by default, shown if iframe fails */}
                  <object
                    data="/Sample.pdf"
                    type="application/pdf"
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                      minHeight: '600px',
                      display: pdfError ? 'block' : 'none'
                    }}
                    onLoad={() => {
                      console.log('PDF object loaded as backup')
                      setPdfError(false)
                      setPdfLoading(false)
                    }}
                  >
                    <p className="text-center p-8">
                      PDF cannot be displayed.
                    </p>
                  </object>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
