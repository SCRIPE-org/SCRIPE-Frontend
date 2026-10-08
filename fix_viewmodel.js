
const fs = require("fs");

let path = "src/modules/custom-fields/custom-fields/custom-field/src/presentation/viewmodels/useCustomFieldViewModel.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  `queryKey: ["customFields", "entityTypes"],`,
  `queryKey: ["customFields", "entityTypes"],`
);

// Add the key status query
const keyStatusQuery = `
  const { data: keyStatus } = useQuery({
    queryKey: ["customFields", "encryption", "status"],
    queryFn: () => getCustomFieldsContainer().keyManagementRepository.getStatus(),
  });
`;

content = content.replace(
  `const { customFieldRepository } = getCustomFieldsContainer();`,
  `const { customFieldRepository } = getCustomFieldsContainer();\n${keyStatusQuery}`
);

content = content.replace(
  `return { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes };`,
  `return { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes, keyStatus };`
);

fs.writeFileSync(path, content, "utf-8");

console.log("Done viewmodel");

