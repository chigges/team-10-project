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

## Contributors

Luke Chigges, Faaiz Memon, Avigdor Roytman, Jungwoo Kwon
