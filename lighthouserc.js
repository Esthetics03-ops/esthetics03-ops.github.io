module.exports = {
  ci: {
    collect: {
      url: ['https://esthetics03-ops.github.io'],
      numberOfRuns: 1,
      settings: { emulatedFormFactor: 'mobile', throttlingMethod: 'provided' }
    },
    upload: { target: 'temporary-public-storage' }
  }
};
