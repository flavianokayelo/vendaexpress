import { readJson, writeJson, keyFor, type StorageScope } from './storage';

export type OnboardingStep =
  | 'store-builder'
  | 'upload-photo'
  | 'first-product'
  | 'first-order'
  | 'invite-staff'
  | 'done';

const SCOPE: StorageScope = 'local';

function stepKey(slug: string) {
  return keyFor('onboarding', slug);
}

function getSteps(slug: string): OnboardingStep[] {
  const raw = readJson<OnboardingStep[] | null>(SCOPE, stepKey(slug), null);
  return Array.isArray(raw) ? raw : [];
}

export function isStepDone(slug: string, step: OnboardingStep): boolean {
  return getSteps(slug).includes(step);
}

export function completeStep(slug: string, step: OnboardingStep): void {
  const current = getSteps(slug);
  if (current.includes(step)) return;
  writeJson(SCOPE, stepKey(slug), [...current, step]);
}

export function resetOnboarding(slug: string): void {
  writeJson(SCOPE, stepKey(slug), []);
}

export function remainingSteps(slug: string): OnboardingStep[] {
  return (['store-builder', 'upload-photo', 'first-product', 'first-order', 'invite-staff', 'done'] as OnboardingStep[]).filter(
    (step) => !isStepDone(slug, step),
  );
}