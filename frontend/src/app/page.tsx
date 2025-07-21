'use client'

import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { FileText, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import { toast, Toaster } from 'react-hot-toast';

const Home = memo(function Home() {
  // Removed unused state variables for cleaner code
  const fileUploadRef = useRef<{ triggerFileSelect: () => void }>(null);

  // Memoize expensive operations
  const featureData = useMemo(() => [
    { 
      icon: FileText, 
      title: 'Smart Upload', 
      desc: 'Drag & drop PDF files for instant processing with intelligent format detection', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-900/20 to-blue-800/20',
      borderColor: 'border-blue-700/50'
    },
    { 
      icon: Sparkles, 
      title: 'AI Analysis', 
      desc: 'Advanced GPT-4 powered document understanding with 99% accuracy', 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-700/50'
    },
    { 
      icon: Zap, 
      title: 'Fast Results', 
      desc: 'Get comprehensive insights in under 30 seconds with real-time processing', 
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-orange-900/20 to-yellow-800/20',
      borderColor: 'border-orange-700/50'
    },
    { 
      icon: Shield, 
      title: 'Secure', 
      desc: 'Enterprise-grade security with end-to-end encryption and data protection', 
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-900/20 to-green-800/20',
      borderColor: 'border-green-700/50'
    }
  ], []);

  const statsData = useMemo(() => [
    { value: '99%', label: 'Accuracy Rate', icon: '🎯', color: 'text-blue-400', bgColor: 'from-blue-900/20 to-blue-800/20' },
    { value: '<30s', label: 'Processing Time', icon: '⚡', color: 'text-purple-400', bgColor: 'from-purple-900/20 to-purple-800/20' },
    { value: '10MB', label: 'Max File Size', icon: '📊', color: 'text-green-400', bgColor: 'from-green-900/20 to-green-800/20' }
  ], []);

  // Ensure page always starts at the top when loaded/reloaded
  useEffect(() => {
    // Scroll to top immediately on component mount
    window.scrollTo(0, 0)
    
    // Also ensure scroll restoration is disabled for this page
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <header className="border-b bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ProposalAI</h1>
                <p className="text-sm text-gray-400">AI-Powered Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Ansh&apos;s Internship Project
              </div>
              <div className="text-purple-400 text-xl">
                ✨
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 section-lazy relative overflow-hidden">
        {/* Background decorative elements - static for better performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-blue-400/10">
            <Sparkles className="h-16 w-16" />
          </div>
          <div className="absolute top-40 right-10 text-purple-400/10">
            <FileText className="h-20 w-20" />
          </div>
          <div className="absolute bottom-20 left-1/4 text-blue-400/10">
            <Zap className="h-12 w-12" />
          </div>
        </div>

        <div className="text-center mb-16 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm border border-blue-500/20">
              <div>
                <Sparkles className="h-5 w-5" />
              </div>
              <span>AI-Powered Document Analysis</span>
            </div>
          </div>
          
          <h1 className="text-7xl font-bold text-white mb-8 leading-tight">
            <span>Transform Your </span>
            <span className="text-blue-400 font-extrabold relative">Proposals</span>
            <span> into Insights</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Upload any client proposal PDF and instantly receive AI-powered summaries, 
            key requirements analysis, pricing breakdowns, and actionable next steps.
          </p>
          
          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div>
              <Button
                size="xl"
                onClick={() => {
                  const uploadSection = document.getElementById('upload-section');
                  if (uploadSection) {
                    const headerHeight = 80; // Account for sticky header height
                    const targetPosition = uploadSection.offsetTop - headerHeight;
                    window.scrollTo({ 
                      top: targetPosition, 
                      behavior: 'smooth' 
                    });
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Analysis Now
                </span>
              </Button>
            </div>
            
            <div className="flex gap-3">
              <div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/Sample.pdf';
                    link.download = 'Sample.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Sample PDF downloaded successfully!');
                  }}
                  className="border-2 border-purple-500/50 bg-gray-800/80 backdrop-blur-sm text-purple-400 hover:bg-purple-900/20 hover:border-purple-400 transition-all duration-300 px-6 py-3 shadow-lg"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  📥 Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Our AI Platform?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience cutting-edge technology designed for modern business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featureData.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.bgColor} backdrop-blur-sm rounded-2xl p-8 shadow-xl border ${feature.borderColor} hover:shadow-2xl hover:border-opacity-100 transition-all duration-300 cursor-pointer group relative overflow-hidden transform-gpu`}
              >
                {/* Enhanced background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`rounded-xl bg-gradient-to-r ${feature.color} p-4 w-fit mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="h-7 w-7 text-white group-hover:drop-shadow-lg transition-all duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 group-hover:drop-shadow-sm">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
                
                {/* Additional hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative mb-16">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-600/50 p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 opacity-50" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-center text-white mb-8">
                Trusted by Professionals Worldwide
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {statsData.map((stat, index) => (
                  <div 
                    key={index}
                    className={`text-center p-6 rounded-2xl bg-gradient-to-br ${stat.bgColor} border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">
                        {stat.icon}
                      </div>
                      
                      <div className={`text-5xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                        {stat.value}
                      </div>
                      
                      <div className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="container mx-auto px-4 py-16 section-lazy">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
            
            <h2 className="text-5xl font-bold text-white mb-6 relative">
              <span className="text-blue-400">Ready to Analyze</span>
              <br />
              <span className="text-white">Your Proposal?</span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Upload your PDF and let our advanced AI extract key insights, 
              recommendations, and actionable intelligence in seconds
            </p>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </div>
          
          <FileUpload />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md mt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">ProposalAI</h3>
              <p className="text-gray-400">Transform Your Proposals into Insights</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              {/* Frontend Technologies */}
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Next.js 15
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                React 18
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                TypeScript
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                Tailwind CSS
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Framer Motion
              </span>
              
              {/* Backend Technologies */}
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Node.js
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Express.js
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                JavaScript
              </span>
              
              {/* AI & APIs */}
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                REST APIs
              </span>
              
              {/* Additional Libraries */}
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                PDF Processing
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                File Upload APIs
              </span>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p className="mb-2">© 2025 ProposalAI - Internship Project</p>
              <p>Built with ❤️ for modern businesses</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
});

export default Home;
