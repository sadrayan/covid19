# Deploy Facebook Prophet on AWS Lambda

build:
docker build -t fbprophet . && \
docker run --rm -v $PWD:/export \
fbprophet cp upload-to-s3.zip /export

Upload the zip to s3 and lambda function.