import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

const page: DocPageData = {
      slug: 'get-started/quick-start',
      titleKey: 'getStarted.quickStart.title',
      descriptionKey: 'getStarted.quickStart.description',
      category: 'get-started',
      order: 3,
      sections: [
            { type: 'paragraph', contentKey: 'getStarted.quickStart.intro' },
            {
                  type: 'step-guide',
                  steps: [
                        {
                              titleKey: 'getStarted.quickStart.step1Title',
                              contentKey: 'getStarted.quickStart.step1Content',
                              code: 'git clone https://github.com/your-org/verified-platform.git\ncd verified-platform',
                              codeLanguage: 'bash',
                        },
                        {
                              titleKey: 'getStarted.quickStart.step2Title',
                              contentKey: 'getStarted.quickStart.step2Content',
                              code: `// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=VerifiedDB;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}`,
                              codeLanguage: 'json',
                              codeFilename: 'appsettings.json',
                        },
                        {
                              titleKey: 'getStarted.quickStart.step3Title',
                              contentKey: 'getStarted.quickStart.step3Content',
                              code: 'cd ASP.Net-Login-Project-CQRS\ndotnet ef database update',
                              codeLanguage: 'bash',
                        },
                        {
                              titleKey: 'getStarted.quickStart.step4Title',
                              contentKey: 'getStarted.quickStart.step4Content',
                              code: 'dotnet run',
                              codeLanguage: 'bash',
                        },
                        {
                              titleKey: 'getStarted.quickStart.step5Title',
                              contentKey: 'getStarted.quickStart.step5Content',
                              code: 'cd next-frontend-template-modular-clean\nnpm install\nnpm run dev',
                              codeLanguage: 'bash',
                        },
                        {
                              titleKey: 'getStarted.quickStart.step6Title',
                              contentKey: 'getStarted.quickStart.step6Content',
                              code: `Frontend: http://localhost:3000
Backend:  http://localhost:5000
Swagger:  http://localhost:5000/swagger`,
                              codeLanguage: 'bash',
                        },
                  ],
            },
            { type: 'heading', level: 2, titleKey: 'getStarted.quickStart.defaultCredentials', id: 'credentials' },
            {
                  type: 'table',
                  headers: ['Field', 'Value'],
                  rows: [
                        ['Email', 'admin@verified.com'],
                        ['Password', 'Admin@123'],
                  ],
            },
            { type: 'info', variant: 'tip', contentKey: 'getStarted.quickStart.successTip' },
      ],
      relatedSlugs: ['get-started/project-structure', 'get-started/prerequisites'],
};

registerPage(page);
