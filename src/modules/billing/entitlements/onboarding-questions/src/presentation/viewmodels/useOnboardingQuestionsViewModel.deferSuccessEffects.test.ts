// useOnboardingQuestionsViewModel — custom-field values must not be discarded
//
// This screen sets entityTypeKey (see OnboardingQuestionsCatalogView.tsx),
// so GenericCrudView also saves custom-field values after the question
// itself is created/updated. The hook was missing deferSuccessEffects: true
// on useCrudViewModel, so the success toast fired and the modal closed the
// instant createItem's own promise resolved -- before the custom-field save
// even started (W0-1). create/update already returned the real fetched
// entity (via repository.getById), so this file only needed the option
// added.
//
// The regex below deliberately matches the option object only as the
// trailing argument to the useCrudViewModel(...) call -- i.e. the services
// object's closing "}," immediately followed by "{ deferSuccessEffects:
// true }" and the call's closing ")". A plain /deferSuccessEffects:\s*true/
// match would also pass on this file's doc comment alone (the vacuous
// pattern from the sibling W0-1 regression tests) even if the real option
// were deleted; this structural match requires the actual option object.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "useOnboardingQuestionsViewModel.ts"), "utf-8");

describe("useOnboardingQuestionsViewModel create/update contract", () => {
  it("opts into deferSuccessEffects as the real trailing option to useCrudViewModel", () => {
    expect(source).toMatch(/\},\s*\{\s*deferSuccessEffects:\s*true\s*\}\s*\)/);
  });
});
