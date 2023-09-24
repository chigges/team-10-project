import { readFileSync } from "fs";
import axios from "axios";

export type GithubRepoInfo = {
	url: string;
	owner: string;
	repo: string;
};

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

	async getGithubRepoInfo(): Promise<GithubRepoInfo[]> {
		const githubUrls = await this.getOnlyGithubUrls();
		const githubRepoInfo: GithubRepoInfo[] = [];
		githubUrls.forEach((url) => {
			const regex = /github\.com\/([^/]+\/[^/]+)/;
			const match = url.match(regex);
			if (match != null) {
				const owner = match[1].split("/")[0];
				const repo = match[1].split("/")[1];
				githubRepoInfo.push({ url, owner, repo });
			}
		});
		return githubRepoInfo;
	}

	async getOnlyGithubUrls(): Promise<string[]> {
		const allUrls = this.getUrls();
		const npmUrls = allUrls.filter((url) => url.includes("npmjs.com"));
		const githubUrls = allUrls.filter((url) => url.includes("github.com"));

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
		const packageName = this.extractPackageNameFromNpmLink(npmUrl);
		let githubLink = null;
		if (packageName != null) {
			const endpoint = `https://registry.npmjs.org/${packageName}`;
			await axios
				.get(endpoint)
				.then((res) => {
					const data = res.data;
					// console.log(data);
					let linkEnding = data["repository"]["url"];
					linkEnding = this.extractGithubRepo(linkEnding);
					if (linkEnding != null) {
						githubLink = "https://github.com/" + linkEnding;
					}
				})
				.catch(() => {
					console.error(
						"Error getting github repo from npm link for " + packageName + ".",
					);
				});
		}
		return githubLink || null;
	}

	extractGithubRepo(url: string): string | null {
		const regex = /github\.com\/([^/]+\/[^/]+)\.git/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	extractPackageNameFromNpmLink(url: string): string | null {
		const regex = /https:\/\/www\.npmjs\.com\/package\/([^/]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}
}

export default URLParser;
