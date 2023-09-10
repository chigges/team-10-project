import { Octokit, App } from "octokit";

export function tsAPI() {
var main = async () => {
    const octokit = new Octokit({ 
        auth: `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` 
    });

    const login = await octokit.rest.users.getAuthenticated({
        type: "login",
    }); 

    // const repos = await octo.repos.listForOrg({
    //     org: ORGANIZATION,
    //   })
    
    console.log(login)
    console.log("F")
};}

// var promise_B = login_promise.then(function(result)) {

// });
// console.log(login_promise)
// const {
//     data: { login },
//   } = await octokit.rest.users.getAuthenticated();
//   console.log("Hello, %s", login);
