
import glob
import os

files_to_fix = [
    "src/modules/venue/booking-360/src/presentation/components/BookingChangeResourceDialog.tsx",
    "src/modules/venue/booking-360/src/presentation/components/BookingRescheduleDialog.tsx",
    "src/modules/venue/facility/src/presentation/components/FacilityQuickCreateDialog.tsx",
    "src/modules/venue/operations-calendar/src/presentation/components/BlockTimeModal.tsx",
    "src/modules/venue/operations-calendar/src/presentation/components/ClickToBookModal.tsx",
    "src/modules/venue/site/src/presentation/components/SiteFormDialog.tsx",
    "src/modules/venue/site/src/presentation/components/SiteQuickCreateDialog.tsx",
    "src/modules/venue/venue-profile/src/presentation/components/VenueProfileQuickCreateDialog.tsx"
]

for f in files_to_fix:
    try:
        with open(f, "r", encoding="utf-8") as file:
            content = file.read()
            
        content = content.replace(
            "import { getVenueContainer } from \"@modules/venue/di\";",
            "import { useVenueContainer } from \"@modules/venue/shared/src/presentation/viewmodels/useVenueDI\";"
        )
        content = content.replace(
            "import { venueContainer } from \"@modules/venue/di\";",
            "import { useVenueDI } from \"@modules/venue/shared/src/presentation/viewmodels/useVenueDI\";"
        )
        
        # also replace usages
        content = content.replace("getVenueContainer()", "useVenueContainer()")
        content = content.replace("venueContainer.", "useVenueDI().")
        
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
            
    except Exception as e:
        print(f"Failed {f}: {e}")

print("DI fixed")

