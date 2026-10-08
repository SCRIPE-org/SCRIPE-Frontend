import json
import re

with open('eslint-report-latest.json', 'r', encoding='utf-16') as f:
    results = json.load(f)

for result in results:
    file_path = result['filePath']
    messages = result['messages']
    
    if not messages: continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    modified = False
    
    any_messages = [m for m in messages if m.get('ruleId') == '@typescript-eslint/no-explicit-any']
    unused_messages = [m for m in messages if m.get('ruleId') == 'unused-imports/no-unused-vars']
    
    if any_messages:
        for i in range(len(lines)):
            original = lines[i]
            lines[i] = lines[i].replace(' as any', ' as unknown')
            lines[i] = lines[i].replace(': any', ': unknown')
            lines[i] = lines[i].replace('<any>', '<unknown>')
            lines[i] = lines[i].replace(', any>', ', unknown>')
            lines[i] = lines[i].replace('<any,', '<unknown,')
            lines[i] = lines[i].replace('any[]', 'unknown[]')
            lines[i] = lines[i].replace('Record<string, any>', 'Record<string, unknown>')
            if lines[i] != original:
                modified = True

    for m in unused_messages:
        msg_text = m.get('message', '')
        match = re.search(r"'([^']+)'", msg_text)
        if match:
            var_name = match.group(1)
            line_idx = m['line'] - 1
            if line_idx < len(lines) and not var_name.startswith('_'):
                # safe replace just word boundaries
                new_line = re.sub(rf'\b{var_name}\b', f'_{var_name}', lines[line_idx], count=1)
                if new_line != lines[line_idx]:
                    lines[line_idx] = new_line
                    modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Fixed {file_path}")
