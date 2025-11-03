module.exports = {
  ci: {
    collect: {
      url: ['https://esthetics03-ops.github.io'],
      numberOfRuns: 1
    },
    upload: { target: 'temporary-public-storage' }
  }
};
