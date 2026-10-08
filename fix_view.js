/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");

let path = "src/modules/custom-fields/custom-fields/custom-field/src/presentation/views/CustomFieldList/CustomFieldListView.tsx";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  `import { useQuery } from "@tanstack/react-query";`,
  ``
);

content = content.replace(
  `const { data: keyStatus } = useQuery({
    queryKey: ["customFields", "encryption", "status"],
    queryFn: () => getCustomFieldsContainer().keyManagementRepository.getStatus(),
  });`,
  ``
);

content = content.replace(
  `const { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes } =
    useCustomFieldViewModel();`,
  `const { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes, keyStatus } = useCustomFieldViewModel();`
);

fs.writeFileSync(path, content, "utf-8");

console.log("Done view");

