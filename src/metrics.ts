import { Octokit } from "octokit";
//import fetch  from "node-fetch";

export interface Metric {
    name: string;
    description: string;
    evaluate(): Promise<number>;
}

// This is our class for all metrics.
export abstract class BaseMetric implements Metric {
    // NOTE: Not necessary to implement the interface properties, but I think it's good practice.
    //       Also, initializing a default value. These will get overwritten by the subclass.
    public name: string = "BaseMetric";
    public description: string = "BaseMetricDescription";
    public octokit: Octokit;
    public owner: string;
    public repo: string;

    constructor(owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;
        
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN, request: { fetch } });
    }


    abstract evaluate(): Promise<number>;
}

// A subclass of BaseMetric.
export class BusFactor extends BaseMetric {
    name = "BusFactor";
    description = "Measures how many developers are essential for the project.";

    async evaluate(): Promise<number> {
        return 0.5; // Just a placeholder. TODO: implement.
    }
}

// A subclass of BaseMetric.
export class Responsiveness extends BaseMetric {
    name = "Responsiveness";
    description = "Measures how quickly the developers react to changes in the module.";

    async evaluate(): Promise<number> {
        return 0.5; // Just a placeholder. TODO: implement.
    }
}

// A subclass of BaseMetric.
export class License extends BaseMetric {
    name = "License";
    description = "Determines if the license is compatable with LGPLv2.1.";

    async evaluate(): Promise<number> {
        return 0.5; // Just a placeholder. TODO: implement.
    }
}

// A subclass of BaseMetric.
export class RampUp extends BaseMetric {
    name = "RampUp";
    description = "Measures how quickly a developer can get up to speed with the module.";

    async evaluate(): Promise<number> {
        return 0.5; // Just a placeholder. TODO: implement.
    }
}

// A subclass of BaseMetric.
export class Correctness extends BaseMetric {
    name = "Correctness";
    description = "Measures how many bugs are in the module.";


    async evaluate(): Promise<number> {
        // 1. Check for GitHub workflow actions presence
        const hasWorkflowActions = await this.hasWorkflowActions();


        // 2. Count TODO or FIXME comments
        const todoFixmeCount = await this.countTodoFixmeComments();

        // 3. Get test coverage percentage (assumed to be a method that fetches this info)
        const testCoverage = await this.getTestCoverage();

        // 4. Calculate the ratio of closed issues to total issues
        const { openIssues, closedIssues } = await this.getIssueCounts();
        const issueRatio = closedIssues / (openIssues + closedIssues);

        // Combine all factors to calculate the metric
        const score =
            (hasWorkflowActions ? 0.3 : 0) +
            (1 / todoFixmeCount * 0.2) +
            (testCoverage * 0.3) +
            (issueRatio * 0.2);

        return score;
    }


    private async hasWorkflowActions(): Promise<boolean> {
        try {
            // Try to get the workflows directory. If it exists, return true.
            await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: this.owner,
                repo: this.repo,
                path: ".github/workflows"
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    private async countTodoFixmeComments(): Promise<number> {
        let count = 0;

        try {
            const files = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: this.owner,
                repo: this.repo,
                path: ''  // Root directory
            });

            if (Array.isArray(files.data)) {
                for (const file of files.data) {
                    if (file.type === 'file' && file.content) {
                        const decodedContent = Buffer.from(file.content, 'base64').toString('utf8');
                        count += (decodedContent.match(/TODO/g) || []).length;
                        count += (decodedContent.match(/FIXME/g) || []).length;
                    }
                }
            }
        } catch (error) {
            console.error("Error evaluating Correctness metric:", error);
            throw new Error("Failed to evaluate Correctness metric");
        }

        return count;
    }




    private async getTestCoverage(): Promise<number> {
        // Placeholder method. You need to decide how to get test coverage and implement here.
        // For now, returning a dummy value.
        return 0.5;
    }

    private async getIssueCounts(): Promise<{ openIssues: number, closedIssues: number }> {
        const openIssuesCount = await this.octokit.request('GET /repos/{owner}/{repo}/issues', {
            owner: this.owner,
            repo: this.repo,
            state: 'open',
            per_page: 1
        }).then(response => ((response as unknown) as { data: { total_count: number } }).data.total_count);

        const closedIssuesCount = await this.octokit.request('GET /repos/{owner}/{repo}/issues', {
            owner: this.owner,
            repo: this.repo,
            state: 'closed',
            per_page: 1
        }).then(response => ((response as unknown) as { data: { total_count: number } }).data.total_count);

        return { openIssues: openIssuesCount, closedIssues: closedIssuesCount };
    }
}
