import { coinWord } from './morphology.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testEngine() {
  console.log("Calling coinWord('expression')...");
  const startTime = Date.now();
  try {
    const result = await coinWord('expression');
    console.log(`Success in ${Date.now() - startTime}ms! Result:`);
    console.dir(result, { depth: null });
  } catch (err) {
    console.error(`Failed in ${Date.now() - startTime}ms:`, err);
  }
}

testEngine();
