module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFiles: ["dotenv/config"],
	collectCoverage: true,
	testTimeout: 20000,
};
