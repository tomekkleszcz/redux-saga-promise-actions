export default {
    preset: 'ts-jest',
    clearMocks: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['src/*']
};
