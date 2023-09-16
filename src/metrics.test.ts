import "dotenv/config";
import { BusFactor, Responsiveness, Correctness, License, RampUp } from "./metrics";

describe("BusFactor", () => {
	it("should return a bus factor", async () => {
		const busFactorMetric = new BusFactor("https://github.com/example/repo", "fake-token");
		const score = await busFactorMetric.evaluate();
		expect(score).toBeDefined();
		expect(busFactorMetric.name).toBe("BusFactor");
	});
});

describe("Responsiveness", () => {
	it("should return a responsiveness score", async () => {
		const respMetric = new Responsiveness("https://github.com/example/repo", "fake-token");
		const score = await respMetric.evaluate();
		expect(score).toBeDefined();
		expect(respMetric.name).toBe("Responsiveness");
	});
});

describe("License", () => {
	it("should return a license score", async () => {
		const licenseMetric = new License("https://github.com/example/repo", "fake-token");
		const score = await licenseMetric.evaluate();
		expect(score).toBeDefined();
		expect(licenseMetric.name).toBe("License");
	});
});

describe("RampUp", () => {
	it("should return a rampup score", async () => {
		const rampUpMetric = new RampUp("https://github.com/example/repo", "fake-token");
		const score = await rampUpMetric.evaluate();
		expect(score).toBeDefined();
		expect(rampUpMetric.name).toBe("RampUp");
	});
});

describe("Correctness", () => {
	it("should return a correctness score", async () => {
		//const correctnessMetric = new Correctness("https://github.com/example/repo", "fake-token");
		const correctnessMetric = new Correctness("neovim", "neovim");
		const score = await correctnessMetric.evaluate();
		expect(score).toBeDefined();
		expect(correctnessMetric.name).toBe("Correctness");
	});
});
