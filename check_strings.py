import json
with open('eslint-report-latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
files = set()
for item in data:
    for msg in item.get('messages', []):
        if msg.get('ruleId') == '@typescript-eslint/no-explicit-any':
            files.add(item['filePath'])
count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            if '"any"' in content or ''any'' in content or '`any`' in content:
                print(file)
                count += 1
    except Exception as e:
        pass
print(f'Total {count}')
