module.exports = {
  ci: {
    collect: {
      url: ['https://esthetics03-ops.github.io'],
      numberOfRuns: 1,
      settings: { 
        emulatedFormFactor: 'mobile', 
        throttlingMethod: 'provided' 
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:pwa': 'off' 
      }
    },
    upload: { 
      target: 'temporary-public-storage' 
    }
  }
};
