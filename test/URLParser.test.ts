import URLParser from "../src/URLParser";

describe("URLParser", () => {
	const parser = new URLParser("Sample Url File.txt");

	it("should extract a list of URLs", async () => {
		const URLList = parser.getUrls();
		expect(URLList).toBeDefined();
	});

	it("should extract package name from npm link", async () => {
		const packageName = parser.extractPackageNameFromNpmLink(
			"https://www.npmjs.com/package/browserify",
		);
		expect(packageName).toBe("browserify");
	});

	it("should extract github repo from janky git link", async () => {
		const githubRepo = parser.extractGithubRepo(
			"git+ssh://git@github.com/browserify/browserify.git",
		);
		expect(githubRepo).toBe("browserify/browserify");
	});

	it("should extract github repo from npm link", async () => {
		const githubRepo = await parser.getGithubRepoFromNpm(
			"https://www.npmjs.com/package/browserify",
		);
		expect(githubRepo).toBe("https://github.com/browserify/browserify");
	});

	it("should get all github links from list of links", async () => {
		const onlyGithubLinks = await parser.getOnlyGithubUrls();
		for (const link of onlyGithubLinks) {
			expect(link).toContain("github.com");
		}
	});

	it("should return a list of gitHubInfo objects", async () => {
		const githubRepoInfoList = await parser.getGithubRepoInfo();
		expect(githubRepoInfoList.length).toBe((await parser.getOnlyGithubUrls()).length);
		for (const info of githubRepoInfoList) {
			expect(info).toBeDefined();
			expect(info.owner).toBeDefined();
			expect(info.repo).toBeDefined();
		}
	});

	it("should have null when the link is invalid", async () => {
		const githubRepo = await parser.getGithubRepoFromNpm("fake link doesn't work");
		expect(githubRepo).toBeNull();
	});

	it("should be null when the link is invalid for github", async () => {
		const githubRepo = await parser.getGithubRepoFromNpm(
			"https://www.npmjs.com/package/fakepackagenoexistofake",
		);
		expect(githubRepo).toBeNull();
	});

	it("should be null when trying to extract github repo from bad link", async () => {
		const githubRepo = parser.extractGithubRepo("fake link doesn't work");
		expect(githubRepo).toBeNull();
	});
});
