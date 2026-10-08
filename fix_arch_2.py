
import re

with open("arch_check_final.txt", "r", encoding="utf-16") as f:
    lines = f.read().splitlines()

import_violations = []

for i, line in enumerate(lines):
    if "imports from another sub-module" in line or "imports from another module category" in line:
        filepath = lines[i+1].strip()
        parts = filepath.rsplit(":", 1)
        filepath = parts[0]
        found_line = lines[i+2].strip().replace("Found: ", "")
        
        if "@modules/venue" in found_line:
            replacement = found_line.split("from")[0] + "from \"@modules/venue\";"
        elif "@modules/custom-fields" in found_line:
            replacement = found_line.split("from")[0] + "from \"@modules/custom-fields\";"
        elif "@modules/hrms" in found_line:
            replacement = found_line.split("from")[0] + "from \"@modules/hrms\";"
        else:
            replacement = found_line
            
        import_violations.append((filepath, found_line, replacement))
        
    if "directly calls useQuery or useMutation" in line:
        pass
        
    if "directly imports or accesses Dependency Injection" in line:
        pass

print(f"Imports: {len(import_violations)}")

# Apply Import fixes
for filepath, found_line, replacement in import_violations:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if found_line in content:
            content = content.replace(found_line, replacement)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
    except Exception as e:
        print(e)

