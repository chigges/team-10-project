import { Octokit, App } from "octokit";

export async function getClones(owner_in:string, repo_in:string) {

    const octokit = new Octokit({ 
        auth: `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` 
    });

    const me = await octokit.rest.users.getAuthenticated({
        type: "login",
    }); 

    const repos = await octokit.rest.repos.getClones({
        owner: owner_in,
        repo: repo_in
    })
    console.log(repos.data.clones)
}

export async function getMe() {

    const octokit = new Octokit({ 
        auth: `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` 
    });

    const me = await octokit.rest.users.getAuthenticated({
        type: "login",
    }); 

    console.log(me)
}
