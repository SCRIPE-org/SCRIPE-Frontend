import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

const page: DocPageData = {
      slug: 'get-started/prerequisites',
      titleKey: 'getStarted.prerequisites.title',
      descriptionKey: 'getStarted.prerequisites.description',
      category: 'get-started',
      order: 2,
      sections: [
            { type: 'paragraph', contentKey: 'getStarted.prerequisites.intro' },
            { type: 'heading', level: 2, titleKey: 'getStarted.prerequisites.required', id: 'required' },
            {
                  type: 'table',
                  headers: ['Tool', 'Version', 'Description'],
                  rows: [
                        ['.NET SDK', '10.0+', 'Required for building and running the backend'],
                        ['Node.js', '20.0+', 'Required for the frontend (LTS recommended)'],
                        ['npm', '10.0+', 'Comes with Node.js'],
                        ['SQL Server', '2019+', 'Default database (PostgreSQL/Oracle also supported)'],
                        ['IDE', 'VS 2022+ / VS Code', 'Visual Studio for backend, VS Code for frontend'],
                  ],
            },
            { type: 'info', variant: 'tip', contentKey: 'getStarted.prerequisites.ideText' },
            { type: 'heading', level: 2, titleKey: 'getStarted.prerequisites.optional', id: 'optional' },
            {
                  type: 'table',
                  headers: ['Tool', 'Purpose'],
                  rows: [
                        ['Git', 'Version control and cloning'],
                        ['Docker', 'Running databases in containers'],
                        ['Postman / Thunder Client', 'Testing API endpoints'],
                  ],
            },
            {
                  type: 'code',
                  language: 'bash',
                  filename: 'Verify installations',
                  code: `# Verify .NET
dotnet --version

# Verify Node.js
node --version
npm --version

# Verify Git
git --version`,
            },
      ],
      relatedSlugs: ['get-started/quick-start'],
};

registerPage(page);
