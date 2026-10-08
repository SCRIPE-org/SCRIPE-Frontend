
content = """
export { getVenueLocator, venueLocator } from "./shared/src/presentation/viewmodels/venueServiceLocator";
export type { IOperationsCalendarRepository } from "./operations-calendar/src/domain/interfaces/IOperationsCalendarRepository";
export type { ISchedulableResourceRepository } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceRepository";
export type { IFacilityResourceProfileRepository } from "./facility-resource-profile/src/domain/interfaces/IFacilityResourceProfileRepository";
export type { IFacilityRepository } from "./facility/src/domain/interfaces/IFacilityRepository";
export { resolveSportIcon } from "./shared/src/presentation/utils/sportIcons";
"""

with open("src/modules/venue/index.ts", "a", encoding="utf-8") as f:
    f.write(content)
print("Added exports to venue/index.ts")

