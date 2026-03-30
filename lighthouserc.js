module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:',
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/explore',
        'http://localhost:5173/auth/login'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
