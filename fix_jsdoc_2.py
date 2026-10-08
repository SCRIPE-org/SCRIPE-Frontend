import re
import sys

def fix_jsdocs(log_path):
    with open(log_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    jsdoc_violations = []
    lines = content.splitlines()
    
    for i, line in enumerate(lines):
        if "lacks JSDoc documentation comments" in line:
            filepath_line = lines[i+1].strip()
            filepath = filepath_line.rsplit(":", 1)[0]
            found_line = lines[i+2].strip().replace("Found: ", "")
            jsdoc_violations.append((filepath, found_line))
            
    print(f"Found {len(jsdoc_violations)} JSDoc violations.")
    
    for filepath, found_line in jsdoc_violations:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                file_content = f.read()
                
            if found_line in file_content:
                idx = file_content.find(found_line)
                preceding = file_content[max(0, idx-100):idx]
                
                parts = preceding.split("\n")
                has_jsdoc = False
                if len(parts) >= 2 and "*/" in parts[-2]:
                    has_jsdoc = True
                elif len(parts) >= 1 and "*/" in parts[-1]:
                    has_jsdoc = True
                    
                if not has_jsdoc:
                    indent = found_line[:len(found_line)-len(found_line.lstrip())]
                    
                    tokens = found_line.split()
                    name = "element"
                    if len(tokens) > 0:
                        name = tokens[-1].split('(')[0].replace('{', '').replace('}', '').replace(';', '')
                        if not name:
                            name = "module export"
                            
                    doc = f"{indent}/**\n{indent} * Documentation for {name}\n{indent} */\n{found_line}"
                    file_content = file_content.replace(found_line, doc)
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(file_content)
                    print(f"Fixed JSDoc in {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

fix_jsdocs(r"C:\Users\seifmoustafa\.gemini\antigravity\brain\b98f3a48-9f40-4f4d-a966-7d23981c4344\.system_generated\tasks\task-5461.log")
