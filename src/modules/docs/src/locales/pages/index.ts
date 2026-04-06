/**
 * Barrel file — re-exports all page locale chunks.
 */

export { en as commonEn } from './common.en';
export { ar as commonAr } from './common.ar';
export { fr as commonFr } from './common.fr';
export { ru as commonRu } from './common.ru';
export { zh as commonZh } from './common.zh';
export { es as commonEs } from './common.es';
export { de as commonDe } from './common.de';

export { en as getStartedEn } from './get-started.en';
export { ar as getStartedAr } from './get-started.ar';
export { fr as getStartedFr } from './get-started.fr';
export { ru as getStartedRu } from './get-started.ru';
export { zh as getStartedZh } from './get-started.zh';
export { es as getStartedEs } from './get-started.es';
export { de as getStartedDe } from './get-started.de';

export { en as architectureEn } from './architecture.en';
export { ar as architectureAr } from './architecture.ar';
export { fr as architectureFr } from './architecture.fr';
export { ru as architectureRu } from './architecture.ru';
export { zh as architectureZh } from './architecture.zh';
export { es as architectureEs } from './architecture.es';
export { de as architectureDe } from './architecture.de';

export { en as featuresEn } from './features.en';
export { ar as featuresAr } from './features.ar';
export { fr as featuresFr } from './features.fr';
export { ru as featuresRu } from './features.ru';
export { zh as featuresZh } from './features.zh';
export { es as featuresEs } from './features.es';
export { de as featuresDe } from './features.de';

export { en as modulesEn } from './modules.en';
export { ar as modulesAr } from './modules.ar';
export { fr as modulesFr } from './modules.fr';
export { ru as modulesRu } from './modules.ru';
export { zh as modulesZh } from './modules.zh';
export { es as modulesEs } from './modules.es';
export { de as modulesDe } from './modules.de';

export { en as securityEn } from './security.en';
export { ar as securityAr } from './security.ar';
export { fr as securityFr } from './security.fr';
export { ru as securityRu } from './security.ru';
export { zh as securityZh } from './security.zh';
export { es as securityEs } from './security.es';
export { de as securityDe } from './security.de';

export { en as frontendEn } from './frontend.en';
export { ar as frontendAr } from './frontend.ar';
export { fr as frontendFr } from './frontend.fr';
export { ru as frontendRu } from './frontend.ru';
export { zh as frontendZh } from './frontend.zh';
export { es as frontendEs } from './frontend.es';
export { de as frontendDe } from './frontend.de';

export { en as infrastructureEn } from './infrastructure.en';
export { ar as infrastructureAr } from './infrastructure.ar';
export { fr as infrastructureFr } from './infrastructure.fr';
export { ru as infrastructureRu } from './infrastructure.ru';
export { zh as infrastructureZh } from './infrastructure.zh';
export { es as infrastructureEs } from './infrastructure.es';
export { de as infrastructureDe } from './infrastructure.de';

export { en as tutorialsEn } from './tutorials.en';
export { ar as tutorialsAr } from './tutorials.ar';
export { fr as tutorialsFr } from './tutorials.fr';
export { ru as tutorialsRu } from './tutorials.ru';
export { zh as tutorialsZh } from './tutorials.zh';
export { es as tutorialsEs } from './tutorials.es';
export { de as tutorialsDe } from './tutorials.de';

export { en as apiReferenceEn } from './api-reference.en';
export { ar as apiReferenceAr } from './api-reference.ar';
export { fr as apiReferenceFr } from './api-reference.fr';
export { ru as apiReferenceRu } from './api-reference.ru';
export { zh as apiReferenceZh } from './api-reference.zh';
export { es as apiReferenceEs } from './api-reference.es';
export { de as apiReferenceDe } from './api-reference.de';

// Lazy loader map for dynamic imports
export const pageLoaders: Record<string, () => Promise<any>> = {
  'common': () => import('./common.en'),
  'get-started': () => import('./get-started.en'),
  'architecture': () => import('./architecture.en'),
  'features': () => import('./features.en'),
  'modules': () => import('./modules.en'),
  'security': () => import('./security.en'),
  'frontend': () => import('./frontend.en'),
  'infrastructure': () => import('./infrastructure.en'),
  'tutorials': () => import('./tutorials.en'),
  'api-reference': () => import('./api-reference.en'),
};
