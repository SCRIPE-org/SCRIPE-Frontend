
const fs = require('fs');
let content = fs.readFileSync('src/core/crud/components/generic-crud-view.customfields.test.tsx', 'utf8');

content = content.replace(/^( *)render\(<GenericCrudView ([^>]*?)\/>\);/gm, function(match, p1, p2) {
  return p1 + 'await act(async () => {\n' +
         p1 + '  render(<GenericCrudView ' + p2 + '/>);\n' +
         p1 + '  await new Promise((r) => setTimeout(r, 0));\n' +
         p1 + '});';
});

content = content.replace(/^( *)expect\(\(\) => render\(<GenericCrudView ([^>]*?)\/>\)\)\.not\.toThrow\(\);/gm, function(match, p1, p2) {
  return p1 + 'await act(async () => {\n' +
         p1 + '  expect(() => render(<GenericCrudView ' + p2 + '/>)).not.toThrow();\n' +
         p1 + '  await new Promise((r) => setTimeout(r, 0));\n' +
         p1 + '});';
});

fs.writeFileSync('src/core/crud/components/generic-crud-view.customfields.test.tsx', content);

