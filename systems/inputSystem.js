function calcAccuracy(target, typed) {
  const maxLen = Math.max(target.length, 1);
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, typed.length); i += 1) {
    if (target[i] === typed[i]) correct += 1;
  }
  const lengthPenalty = Math.abs(target.length - typed.length) * 0.08;
  return Math.max(0, Math.min(1, correct / maxLen - lengthPenalty));
}

function evaluateTyping({ target, typed, elapsedMs }) {
  const trimmed = typed.trim();
  const exact = trimmed === target.text;
  const accuracy = exact ? 1 : calcAccuracy(target.text, trimmed);
  const cps = trimmed.length / Math.max(elapsedMs / 1000, 0.2);
  return {
    exact,
    accuracy,
    cps,
    wordType: target.type,
    length: target.text.length,
    typed: trimmed,
  };
}

function renderTargetWithHint(targetText) {
  const first = targetText.slice(0, 1);
  const rest = targetText.slice(1);
  return `\x1b[96m${first}\x1b[0m${rest}`;
}

module.exports = { evaluateTyping, renderTargetWithHint };
