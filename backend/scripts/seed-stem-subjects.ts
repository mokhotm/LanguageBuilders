import { db } from '../db.js';
import { users, dictionaryWords } from '../schema.js';
import { eq } from 'drizzle-orm';

async function seedStemSubjects() {
  console.log('Seeding 12 custom STEM subject words...');

  // Get moderator user ID
  let creatorId = 1;
  try {
    const moderator = await db.query.users.findFirst({
      where: eq(users.username, 'moderator')
    });
    if (moderator) {
      creatorId = moderator.id;
    }
  } catch (err) {
    console.log('Error getting moderator:', err);
  }

  const subjects = [
    {
      englishWord: 'Science',
      sesothoWord: 'Thutahlahlobo',
      partOfSpeech: 'Noun (Class 9)',
      category: 'general',
      definition: 'Science is both a systematic body of knowledge and the empirical process used to build it. It aims to discover and describe the universe through observation, experimentation, and critical analysis, continuously testing explanations that can be validated or challenged by the scientific community.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study/science) + hlahloba (examine/investigate). Literally, "the study of systematic investigation".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Biology',
      sesothoWord: 'Thutobophelo',
      partOfSpeech: 'Noun (Class 9)',
      category: 'biology',
      definition: 'Biology is the scientific study of life and living organisms. Derived from the Greek words bios (meaning "life") and logos (meaning "study"), it examines everything from microscopic cells to complex ecosystems, focusing on their structure, function, growth, origin, evolution, and distribution.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + bophelo (life). Literally, "the study of life". This is the standard terminology used in South African schools.'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Chemistry',
      sesothoWord: 'Thutakopanyo',
      partOfSpeech: 'Noun (Class 9)',
      category: 'chemistry',
      definition: 'Chemistry is the branch of science that studies the composition, structure, and properties of matter, as well as the changes and energy transformations it undergoes. Often called the "central science," it bridges physics and biology by examining how atoms and molecules interact to form the world around us.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + kopanya (to combine/mix). Literally, "the study of how substances combine/interact".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Physics',
      sesothoWord: 'Thutamatla',
      partOfSpeech: 'Noun (Class 9)',
      category: 'physics',
      definition: 'Physics is the fundamental natural science that studies matter, energy, space, time, and how they interact. Its ultimate goal is to discover the underlying mathematical laws that govern everything in the universe, from the behavior of subatomic particles to the movement of entire galaxies.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + matla (force/energy). Literally, "the study of energy, force, and physical interactions".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Computer Science',
      sesothoWord: 'Thutosebali',
      partOfSpeech: 'Noun (Class 9)',
      category: 'computer_science',
      definition: 'Computer Science is the rigorous study of computation, information, and algorithmic processes. Rather than just studying computers—like astronomy studies telescopes—it explores what can be computed, how to process data efficiently, and how to build software and hardware systems to solve complex, real-world problems.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + sebali (computer/calculator, from verb ho bala - to count). Literally, "the study of computing systems".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Psychology',
      sesothoWord: 'Thutakelello',
      partOfSpeech: 'Noun (Class 9)',
      category: 'biology',
      definition: 'Psychology is the scientific study of the mind and behavior. It explores both observable actions (what we do) and internal mental processes (how we think, feel, and perceive). This field aims to understand, explain, and predict human and animal activity.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + kelello (mind/brain). Literally, "the study of the mind/mental processes".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Geography',
      sesothoWord: 'Thutafatshe',
      partOfSpeech: 'Noun (Class 9)',
      category: 'physics',
      definition: 'Geography is the study of Earth\'s physical landscapes, environments, and human societies, along with the reciprocal interactions between them. It goes beyond just memorizing locations to answer where things are, why they are there, and how they change over time.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + lefatshe (earth/world). Literally, "the study of the earth".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Philosophy',
      sesothoWord: 'Thutabohlale',
      partOfSpeech: 'Noun (Class 9)',
      category: 'general',
      definition: 'Philosophy is the rational and critical investigation of fundamental truths, existence, knowledge, and conduct. Originating from the Greek word philosophia (meaning "love of wisdom"), it uses logical reasoning to explore ultimate questions about reality, ethics, and meaning.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + bohlale (wisdom). Literally, "the study of wisdom". Mirrors the Greek word philosophia (love of wisdom).'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Engineering',
      sesothoWord: 'Thutakaho',
      partOfSpeech: 'Noun (Class 9)',
      category: 'physics',
      definition: 'Engineering is the systematic application of science and mathematics to design, build, and optimize systems, structures, and processes. It bridges the gap between scientific discovery and practical application, solving real-world problems while balancing constraints like cost, safety, and efficiency.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + kaho (building/construction, from verb ho haha). Literally, "the study of engineering/building systems".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Architecture',
      sesothoWord: 'Boqapikaho',
      partOfSpeech: 'Noun (Class 14)',
      category: 'general',
      definition: 'Architecture is the art and technique of designing and constructing buildings that balance practical utility with aesthetic expression. It unites science and art to shape the human environment, transforming raw materials into organized, functional, and meaningful spaces.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from boqapi (art/design/creativity) + kaho (construction/building). Literally, "the creative art of designing buildings".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Astronomy',
      sesothoWord: 'Thutadinaledi',
      partOfSpeech: 'Noun (Class 9)',
      category: 'physics',
      definition: 'Astronomy is the scientific study of everything in the universe beyond Earth\'s atmosphere. It is a physical science that uses mathematics, physics, and chemistry to observe, analyze, and explain the position, size, composition, origin, and evolution of celestial objects like planets, stars, galaxies, and black holes.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from thuto (study) + dinaledi (stars). Literally, "the study of the stars".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    },
    {
      englishWord: 'Technology',
      sesothoWord: 'Tshebediso-bohlale',
      partOfSpeech: 'Noun (Class 9)',
      category: 'computer_science',
      definition: 'The best definition of technology is the practical application of scientific knowledge to solve problems, achieve specific purposes, or expand human capabilities. It encompasses not just physical tools, machines, and digital devices (like smartphones and computers), but also the intangible methods, systems, and ideas used to simplify tasks and improve the human experience.',
      morphology: JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Compounded from tshebediso (use/application) + bohlale (intelligence/cleverness). Literally, "the intelligent application of knowledge".'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    }
  ];

  for (const subject of subjects) {
    try {
      // Clear existing entry if exists to avoid duplication
      await db.delete(dictionaryWords).where(eq(dictionaryWords.englishWord, subject.englishWord));
      await db.insert(dictionaryWords).values(subject);
      console.log(`Inserted ${subject.englishWord} -> ${subject.sesothoWord}`);
    } catch (err) {
      console.error(`Failed to insert ${subject.englishWord}:`, err);
    }
  }

  console.log('STEM subjects seeded successfully!');
  process.exit(0);
}

seedStemSubjects().catch(err => {
  console.error('Failed to seed STEM subjects:', err);
  process.exit(1);
});
