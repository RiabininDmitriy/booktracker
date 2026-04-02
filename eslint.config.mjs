import apiConfig from './apps/api/eslint.config.mjs';
import webConfig from './apps/web/eslint.config.mjs';

function scopeConfig(configArray, prefix) {
  return configArray.map((c) => {
    // Leave global ignore-only objects alone
    if (Object.keys(c).length === 1 && c.ignores) return c;
    
    // We want to force all these rules to only apply to the sub-project
    return { ...c, files: [`${prefix}/**/*`] };
  });
}

const config = [
  ...scopeConfig(apiConfig, 'apps/api'),
  ...scopeConfig(webConfig, 'apps/web'),
];

export default config;
