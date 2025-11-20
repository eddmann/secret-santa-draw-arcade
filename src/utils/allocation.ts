/**
 * Performs a constrained shuffle for Secret Santa allocation
 * Ensures no self-pairing and respects exclusions
 */
export function allocateSecretSanta(
  participants: string[],
  exclusions: Record<string, string[]>
): Record<string, string> | null {
  if (participants.length < 2) {
    return null;
  }

  const maxAttempts = 1000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const allocation: Record<string, string> = {};
    let valid = true;

    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i];
      const receiver = shuffled[i];

      // Check self-pairing
      if (giver === receiver) {
        valid = false;
        break;
      }

      // Check exclusions
      const excluded = exclusions[giver] || [];
      if (excluded.includes(receiver)) {
        valid = false;
        break;
      }

      allocation[giver] = receiver;
    }

    if (valid) {
      return allocation;
    }

    attempts++;
  }

  // If we couldn't find a valid allocation, try a more systematic approach
  return allocateSystematic(participants, exclusions);
}

/**
 * Systematic allocation using a backtracking approach
 */
function allocateSystematic(
  participants: string[],
  exclusions: Record<string, string[]>
): Record<string, string> | null {
  const allocation: Record<string, string> = {};
  const used: Set<string> = new Set();

  function backtrack(index: number): boolean {
    if (index >= participants.length) {
      return true;
    }

    const giver = participants[index];
    const excluded = new Set([giver, ...(exclusions[giver] || [])]);

    // Shuffle remaining candidates for randomness
    const candidates = participants
      .filter(p => !excluded.has(p) && !used.has(p))
      .sort(() => Math.random() - 0.5);

    for (const receiver of candidates) {
      allocation[giver] = receiver;
      used.add(receiver);

      if (backtrack(index + 1)) {
        return true;
      }

      used.delete(receiver);
      delete allocation[giver];
    }

    return false;
  }

  return backtrack(0) ? allocation : null;
}
