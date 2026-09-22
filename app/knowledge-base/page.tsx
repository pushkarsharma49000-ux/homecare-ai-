'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KnowledgeDocument, KnowledgeCategory } from '@/types';
import { getKnowledgeDocuments } from '@/lib/services/knowledge-base';
import { supabase } from '@/lib/supabase/client';

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

interface RetrievalResult {
  id: string;
  documentId: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDocument, setActiveDocument] = useState<KnowledgeDocument | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [retrievalQuery, setRetrievalQuery] = useState('');
  const [retrievalResults, setRetrievalResults] = useState<RetrievalResult[]>([]);
  const [retrievalLoading, setRetrievalLoading] = useState(false);
  const [retrievalError, setRetrievalError] = useState<string | null>(null);

  const ingestDocument = async (documentId: string) => {
  try {
    setIngesting(true);
    setIngestMessage(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('You must be signed in to ingest a knowledge document.');
    }

    const response = await fetch('/api/rag/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ documentId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Knowledge document ingestion failed.');
    }

    setIngestMessage(
      `Ingested successfully: ${result.chunkCount} chunks with ${result.embeddingDimensions}-dimension embeddings.`
    );
  } catch (err: unknown) {
    setIngestMessage(
      err instanceof Error ? err.message : 'Knowledge document ingestion failed.'
    );
  } finally {
    setIngesting(false);
  }
};

  const searchKnowledge = async () => {
    const query = retrievalQuery.trim();
    if (!query) {
      setRetrievalError('Enter a troubleshooting question to search the knowledge base.');
      setRetrievalResults([]);
      return;
    }

    try {
      setRetrievalLoading(true);
      setRetrievalError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace('/login');
        return;
      }

      const response = await fetch('/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query,
          applianceType: 'Washing Machine',
          category: 'Troubleshooting',
        }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Knowledge search failed.');
      setRetrievalResults(result.results ?? []);
    } catch (err: unknown) {
      setRetrievalResults([]);
      setRetrievalError(err instanceof Error ? err.message : 'Knowledge search failed.');
    } finally {
      setRetrievalLoading(false);
    }
  };
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKnowledgeDocuments();
      setDocuments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setAuthChecking(false);
      void fetchDocuments();
    };
    void checkSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchTerm === '' ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  if (authChecking) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">Checking your session...</div>
    );
  }

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

        <div className="flex items-center gap-2">
          {/* Future RAG Readiness Badge (Section 22) */}
          <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Knowledge Database:</strong> Connected to Supabase
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
            All Categories ({documents.length})
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

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Test RAG Retrieval</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Search grounded troubleshooting guidance for a washing machine.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Washing Machine · Troubleshooting</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={retrievalQuery}
              onChange={(event) => setRetrievalQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void searchKnowledge();
              }}
              placeholder="Ask a troubleshooting question..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => void searchKnowledge()}
              disabled={retrievalLoading}
              className="h-10 justify-center whitespace-nowrap"
            >
              {retrievalLoading ? 'Searching...' : 'Search Knowledge'}
            </Button>
          </div>

          {retrievalError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {retrievalError}
            </p>
          )}

          {!retrievalError && retrievalResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {retrievalResults.length} result{retrievalResults.length === 1 ? '' : 's'} found
              </p>
              {retrievalResults.map((result) => (
                <div key={result.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-slate-400">Document: {result.documentId}</span>
                    <span className="font-semibold text-blue-700">
                      Similarity: {result.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">{result.content}</p>
                </div>
              ))}
            </div>
          )}

          {!retrievalError && !retrievalLoading && retrievalQuery.trim() && retrievalResults.length === 0 && (
            <p className="text-xs text-slate-500">No matching knowledge chunks found.</p>
          )}
        </CardContent>
      </Card>

      {/* Document Cards Grid */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500">Querying Supabase knowledge documents...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">Failed to load knowledge documents</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDocuments} className="text-xs mt-2">
            Try Again
          </Button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">
            {documents.length === 0 ? 'No documents in database' : 'No matching knowledge documents'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {documents.length === 0
              ? 'Your Supabase knowledge_documents table currently has 0 rows. Run the seed script in Supabase to populate demo data.'
              : 'Try adjusting your search terms or selecting a different category.'}
          </p>
        </div>
      ) : (
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

              <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
  <span className="text-[11px] text-slate-400">
    Updated: {doc.lastUpdated}
  </span>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      void ingestDocument(doc.id);
    }}
    disabled={ingesting}
    className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {ingesting ? 'Ingesting...' : 'Ingest for AI'}
  </button>
</div>
            </Card>
          ))}
        </div>
      )}

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
