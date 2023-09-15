import URLParser from "./URLParser";

describe("URLParser", () => {
    const parser = new URLParser("Sample Url File.txt");

	it("should extract a list of URLs", async () => {
		const URLList = parser.getUrls();
		expect(URLList).toBeDefined();
	});

	it("should extract package name from npm link", async () => {
        const packageName = parser.extractPackageNameFromNpmLink('https://www.npmjs.com/package/browserify');
        expect(packageName).toBe('browserify');
	});

    it("should extract github repo from janky git link", async () => {
        const githubRepo = parser.extractGithubRepo('git+ssh://git@github.com/browserify/browserify.git');
        expect(githubRepo).toBe('browserify/browserify.git');
    });

    it("should extract github repo from npm link", async () => {
        const githubRepo = await parser.getGithubRepoFromNpm('https://www.npmjs.com/package/browserify');
        expect(githubRepo).toBe('https://github.com/browserify/browserify.git');
    });

    it("should get all github links from list of links", async () => {
        const onlyGithubLinks = await parser.getOnlyGithubUrls();
        for (const link of onlyGithubLinks) {
            expect(link).toContain('github.com');
        }
    });
});