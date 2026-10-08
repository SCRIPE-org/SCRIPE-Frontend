import re

with open('arch_output.txt', 'r', encoding='utf-16', errors='replace') as f:
    text = f.read()

if '\x00' in text[:100]:
    pass
else:
    with open('arch_output.txt', 'r', encoding='utf-8', errors='replace') as f:
        text = f.read()

text = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', text)

issues = []
blocks = text.split('FE-V')
for i, block in enumerate(blocks[1:]):
    lines = block.split('\n')
    rule_id = 'FE-V' + lines[0].split()[0]
    module = lines[0].split()[1] if len(lines[0].split()) > 1 else 'unknown'
    desc = lines[1].strip() if len(lines) > 1 else ''
    path_line = ''
    for line in lines:
        if 'D:\\01_PROJECTS' in line:
            path_line = line.strip()
            break
            
    if path_line:
        issues.append({
            'rule': rule_id,
            'module': module,
            'desc': desc,
            'path': path_line
        })

print('Total issues parsed: ' + str(len(issues)))

for issue in issues:
    print(issue['rule'] + ' - ' + issue['module'] + ': ' + issue['desc'][:50] + '... in ' + issue['path'])
