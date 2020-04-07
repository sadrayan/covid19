# Deploy Facebook Prophet on AWS Lambda

build:
docker build -t fbprophet . && \
docker run --rm -v $PWD:/export \
fbprophet cp upload-to-s3.zip /export

testing:
docker run --rm \
-v $PWD:/export \
marcmetz/prophet:1.0 \
cp upload-to-s3.zip /export