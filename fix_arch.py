
import re

with open("arch.txt", "r", encoding="utf-16") as f:
    lines = f.read().splitlines()

jsdoc_violations = []
import_violations = []

for i, line in enumerate(lines):
    if "lacks JSDoc documentation comments" in line:
        filepath = lines[i+1].strip()
        parts = filepath.rsplit(":", 1)
        filepath = parts[0]
        found_line = lines[i+2].strip().replace("Found: ", "")
        jsdoc_violations.append((filepath, found_line))
    
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

print(f"JSDoc: {len(jsdoc_violations)}, Imports: {len(import_violations)}")

# Apply JSDoc fixes
for filepath, found_line in jsdoc_violations:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # find the found_line
        if found_line in content:
            # check if it already has jsdoc
            idx = content.find(found_line)
            preceding = content[max(0, idx-100):idx]
            if "*/" not in preceding.split("\n")[-2]:
                indent = found_line[:len(found_line)-len(found_line.lstrip())]
                doc = f"{indent}/**\n{indent} * Documentation\n{indent} */\n{found_line}"
                content = content.replace(found_line, doc)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
    except Exception as e:
        print(e)

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

