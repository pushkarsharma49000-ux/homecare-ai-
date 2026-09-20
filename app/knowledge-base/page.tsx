'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  FileText,
  HelpCircle,
  ShieldCheck,
  Wrench,
  Tv,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockKnowledgeDocuments } from '@/lib/mock-data/knowledge-base';
import { KnowledgeDocument, KnowledgeCategory } from '@/types';

const categories: KnowledgeCategory[] = [
  'Air Conditioner',
  'Washing Machine',
  'Refrigerator',
  'Television',
  'Water Purifier',
  'Warranty',
  'Installation',
  'Troubleshooting',
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDocument, setActiveDocument] = useState<KnowledgeDocument | null>(null);

  const filteredDocuments = useMemo(() => {
    return mockKnowledgeDocuments.filter((doc) => {
      const matchesSearch =
        searchTerm === '' ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appliance Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">
            Standard operating diagnostics, OEM error code schemas, and warranty policies
          </p>
        </div>

        {/* Future RAG Readiness Badge (Section 22) */}
        <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Future AI RAG Corpus:</strong> Pre-indexed for vector embeddings in Phase 2
          </span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides, error codes (4C, E4, UE), maintenance steps, or warranties..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-subtle transition-colors"
          />
        </div>

        {/* Category Horizontal Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories ({mockKnowledgeDocuments.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card
            key={doc.id}
            className="hover:border-blue-300 hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between"
            onClick={() => setActiveDocument(doc)}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {doc.readingTime}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {doc.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Updated: {doc.lastUpdated}</span>
              <span className="text-blue-600 font-semibold flex items-center gap-0.5 text-xs">
                Read Guide
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Document Reader Modal / Slide-over */}
      {activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    {activeDocument.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {activeDocument.id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{activeDocument.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Author: {activeDocument.author}</span>
                  <span>•</span>
                  <span>Updated: {activeDocument.lastUpdated}</span>
                  <span>•</span>
                  <span>Read time: {activeDocument.readingTime}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveDocument(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/60 text-blue-900 text-xs">
                <strong>Executive Summary:</strong> {activeDocument.summary}
              </div>

              <div className="whitespace-pre-wrap font-sans text-slate-800 space-y-3">
                {activeDocument.content}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Keywords for AI Retrieval
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDocument.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Source Document • Status: <strong>{activeDocument.status}</strong>
              </span>
              <Button size="sm" variant="outline" onClick={() => setActiveDocument(null)}>
                Close Reader
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
