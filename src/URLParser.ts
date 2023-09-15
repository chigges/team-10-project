import { readFileSync } from "fs";

class URLParser {
	private filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
	}

	getUrls(): string[] {
		const fileContent = readFileSync(this.filePath, "utf-8");
		const urls = fileContent
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
		return urls;
	}
	
	async getOnlyGithubUrls(): Promise<string[]> {
		const allUrls = this.getUrls();
		const npmUrls = allUrls.filter((url) => url.includes("npmjs.com"));
		let githubUrls = allUrls.filter((url) => url.includes("github.com"));

		const additionalGithubUrls: string[] = [];

		for (const npmUrl of npmUrls) {
			const link = await this.getGithubRepoFromNpm(npmUrl);
			if (link != null) {
				additionalGithubUrls.push(link);
			}
		}

		return githubUrls.concat(additionalGithubUrls);
}

	async getGithubRepoFromNpm(npmUrl: string): Promise<string | null> {
		const packageName = this.extractPackageName(npmUrl);
		let githubLink = null;
		if (packageName != null) {
			const endpoint = `https://registry.npmjs.org/${packageName}`;
			const res = await fetch(endpoint);
			let data = await res.json();
			data = data['repository']['url'];
			githubLink = 'https://github.com/' + this.extractGithubRepo(data);
		}

		return githubLink || null;
	}
	
	extractGithubRepo(url: string): string | null {
		const regex = /github\.com\/([^\/]+\/[^\/]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	extractPackageName(url: string): string | null {
		const regex = /https:\/\/www\.npmjs\.com\/package\/([^\/]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}
}

export default URLParser;
