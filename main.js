const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const { runGame } = require('./systems/runSystem');
const { loadMeta } = require('./systems/metaSystem');

async function main() {
  const rl = readline.createInterface({ input, output });
  const io = {
    ask: async (q) => {
      try {
        return await rl.question(q);
      } catch {
        return '';
      }
    },
    print: (message) => console.log(message),
  };

  try {
    const meta = loadMeta();
    const result = await runGame(io, meta);
    console.log('\n=== Run Result ===');
    console.log(result.victory ? '🏆 ボス撃破! ランクリア' : '💀 敗北...');
    console.log(`到達ステージ: ${result.stage}`);
    console.log(`獲得Legacy Point: +${result.legacy}`);
  } finally {
    rl.close();
  }
}

main();
