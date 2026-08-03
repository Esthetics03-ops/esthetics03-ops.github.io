


lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: 'https://esthetics03-ops.github.io',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.5 }],
        'categories:seo': ['warn', { minScore: 0.5 }],
      },
    },
  },
};


