import { type EthosUserTarget, fromUserKey } from '@ethos/domain';
import {
  calculateScore,
  calculateElement,
  getDefaultScoreCalculation,
  type ScoreConfig,
} from '@ethos/score';
import { user } from '../user/lookup/index.js';
import { getLatestScore } from './calculate.js';
import { calculateInvitationImpact } from './elements/ethos.js';
import { findScoreTargetKey } from './lookup.js';
import { type ScoreElementResult, type ScoreCalculationResults } from './types.js';
import { simulateUserInputs } from './userLookup.js';

/**
 * Simulates the score for the given Ethos user target
 *
 * Warning: if this encounters any errors in pulling external data,
 * it will return them in the errors array rather than outright failing. Make sure to
 * check the errors array to see if any errors occurred.
 *
 * Note: this involves performing many lookups, including from external services
 * and possibly pulling from scratch. Do not call it frequently; instead use
 * getLatestScore.
 * @param target - The Ethos user target to calculate the score for.
 * @param simulatedInput - The score parameters that should be overwritten.
 * @returns The calculated score, underlying score elements, and any errors.
 */
export async function simulateNewScore(
  target: EthosUserTarget,
  simulatedInput: Record<string, number>,
): Promise<ScoreCalculationResults> {
  const result: ScoreCalculationResults = { score: 0, elements: {}, metadata: {}, errors: [] };
  const targetKey = await findScoreTargetKey(target);

  const { rootCalculation, elementDefinitions }: ScoreConfig = getDefaultScoreCalculation();
  const { elementValues, errors } = await simulateUserInputs(
    simulatedInput,
    elementDefinitions,
    fromUserKey(targetKey),
  );

  result.score = calculateScore(rootCalculation, elementValues).score;
  elementDefinitions.forEach((element) => {
    const raw = elementValues[element.name];
    const weighted = calculateElement(element, elementValues).score;
    const error = errors.includes(element.name);
    result.elements[element.name] = { element, raw, weighted, error };
  });
  result.errors = errors;

  return result;
}

export async function simulateAcceptInvitation(
  inviteSender: EthosUserTarget,
): Promise<ScoreElementResult> {
  const profile = await user.getProfile(inviteSender);

  if (!profile) return { score: 0, metadata: {} };

  const scoreData = await getLatestScore(inviteSender);

  return calculateInvitationImpact(scoreData);
}
