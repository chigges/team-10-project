# A CLI for trustworthy module reuse

## Usage

```
# Download the project
git clone https://github.com/CtrlAltDelight/team-10-project.git
cd team-10-project

# Install dependencies
./run install

# Pass in a file with urls in it (each url separated by a newline)
./run url_file.txt

# Run test suite
./run test
```

## Considerations

Metrics are subclasses of BaseMetric. Each metric has an `Metric.evaluate()` method. This will return a number between 0 and 1.

`./run install` is taken care of entirely within the `run` file. It is written in python3.

We used jest for our tests and our test files are located in the `test/` directory.

You must have a `GITHUB_TOKEN` and `LOG_FILE` environment variables set in a .env file in the root directory of the project. `LOG_LEVEL` is optional and defaults to 0.


## Testing

Front-end testing is completed using the Selenium testing framework with TypeScript.

The selenium test files are located in the [selenium](front-end/selenium/) directory. 

The selenium test suite logger is the [selenium-test.log](./selenium-test.log) file.

To run the selenium testing framework, run `./selenium-test.sh` from the [root](./) directory. This will install the necessary dependencies, compile the TypeScript code, setup the selenium logger, and run the selenium test suite.

- You must have an `IAM AUTHENTICATION TOKEN` for the tests to access the AWS DB hosting the packages in the registry. If you do not have a token, the test suite is still able to execute but expect most tests to fail.


## Contributors

Luke Chigges, Faaiz Memon, Avigdor Roytman, Jungwoo Kwon

Madi Arnold, Max Michalec, Michael Ross, Caroline Gilbert
