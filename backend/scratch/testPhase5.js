import { formatContext, SYSTEM_PROMPT } from '../src/utils/prompts.js';
import { generateEmbedding } from '../src/services/embeddingService.js';
import { generateAnswer } from '../src/services/groqService.js';

async function testPhase5() {
  console.log('--- Testing Phase 5 Prompts & Context Builder ---');

  const matches = [
    {
      metadata: {
        documentId: 'doc-123',
        documentName: 'Quantum Mechanics Lecture Notes.pdf',
        chunkIndex: 0,
        content: 'Schrodinger equation describes how the quantum state of a physical system changes with time.',
      },
      score: 0.92,
    },
    {
      metadata: {
        documentId: 'doc-123',
        documentName: 'Quantum Mechanics Lecture Notes.pdf',
        chunkIndex: 1,
        content: 'Wave function collapses upon measurement into an eigenstate of the observable.',
      },
      score: 0.88,
    },
  ];

  const formattedContext = formatContext(matches);
  console.log('Formatted Context Output:\n' + formattedContext);

  console.log('\n--- Testing Question Embedding Generation ---');
  const qVector = await generateEmbedding('What is the Schrodinger equation?');
  console.log(`Query vector generated: length ${qVector.length}`);

  console.log('\n--- Testing Groq Answer Generation (Dev Mode or Live) ---');
  const answer = await generateAnswer(formattedContext, 'What is the Schrodinger equation?');
  console.log('Generated Answer:\n' + answer);

  console.log('\n✅ Phase 5 Pipeline components verified successfully!');
}

testPhase5().catch((err) => {
  console.error('❌ Phase 5 verification failed:', err);
  process.exit(1);
});
