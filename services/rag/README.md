# RAG Ingestion Testability

This repository does not currently include a test runner. Phase 2C.2 keeps the core behaviors directly testable through exported helpers:

- `chunkDocument()` and `cleanDocumentContent()` for deterministic chunking, overlap, and empty-content handling.
- `normalizeEmbedding()` for normalized vectors and zero-vector rejection.
- `validateEmbeddingDimension()` for the configured 768-value contract.
- `isValidDocumentId()` for ingestion request validation.

Manual checks still required after configuring server credentials and applying the already-reviewed migration:

1. Ingest a published document and verify chunk count, `chunk_index`, overlap, token counts, metadata, model, and 768-value vectors.
2. Re-ingest an edited document and verify current chunks are updated and stale higher-index chunks are removed.
3. Attempt invalid, missing, draft, review-required, and empty documents and verify safe HTTP responses.
4. Query retrieval with appliance/category filters and confirm cosine-ranked results and citation metadata.
5. Confirm browser requests never receive embeddings or server credentials.
