import { chunkText } from '../src/services/chunkingService.js';
import { generateEmbedding, generateEmbeddings } from '../src/services/embeddingService.js';

async function testPhase4Services() {
  console.log('--- Testing chunkingService ---');
  const sampleText = 'Study Vault AI is an intelligent RAG platform. '.repeat(30); // ~1410 chars
  const chunks = chunkText(sampleText, { chunkSize: 700, chunkOverlap: 100 });
  console.log(`Input text length: ${sampleText.length} chars`);
  console.log(`Generated ${chunks.length} chunks.`);
  chunks.forEach((c) => {
    console.log(`Chunk #${c.chunkIndex}: length ${c.content.length} chars`);
  });

  if (chunks.length < 2) {
    throw new Error('Chunking failed: expected at least 2 chunks');
  }

  console.log('\n--- Testing embeddingService ---');
  const singleVec = await generateEmbedding('Sample chunk text');
  console.log(`Single embedding dimension: ${singleVec.length}`);
  if (singleVec.length !== 768) {
    throw new Error(`Embedding dimension mismatch: expected 768, got ${singleVec.length}`);
  }

  const batchVecs = await generateEmbeddings(['Chunk 1 text', 'Chunk 2 text']);
  console.log(`Batch embeddings generated: ${batchVecs.length} vectors, each of dim ${batchVecs[0].length}`);
  if (batchVecs.length !== 2 || batchVecs[0].length !== 768) {
    throw new Error('Batch embedding failed');
  }

  console.log('\n✅ All Phase 4 Services verified successfully!');
}

testPhase4Services().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
