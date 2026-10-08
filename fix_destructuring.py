import re
log_path = r'C:\Users\seifmoustafa\.gemini\antigravity\brain\e2da0931-89fa-4559-b7a3-46a4f64ab48b\.system_generated\tasks\task-1959.log'
with open(log_path, 'r', encoding='utf-8') as f:
    log_content = f.read()
pattern = re.compile(r'^(src/[^\:]+)\((\d+),(\d+)\): error TS2339: Property \'_([a-zA-Z0-9]+)\' does not exist on type', re.MULTILINE)
fixes = {}
for match in pattern.finditer(log_content):
    file_path, line, col, prop = match.groups()
    if file_path not in fixes:
        fixes[file_path] = []
    fixes[file_path].append((int(line), int(col), prop))
count = 0
for file_path, errors in fixes.items():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for line_num, col, prop in errors:
            idx = line_num - 1
            lines[idx] = re.sub(rf'\b_{prop}\b', f'{prop}: _{prop}', lines[idx])
            count += 1
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    except Exception as e:
        print(f'Error processing {file_path}: {e}')
print(f'Fixed {count} destructuring errors.')
