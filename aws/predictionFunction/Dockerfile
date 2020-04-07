FROM lambci/lambda:build-python3.6

ENV VIRTUAL_ENV=venv
ENV PATH $VIRTUAL_ENV/bin:$PATH
RUN python3 -m venv $VIRTUAL_ENV

COPY requirements.txt .
RUN yum -y install gcc
RUN yum -y install gcc-c++
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

WORKDIR /var/task/venv/lib/python3.6/site-packages

RUN pip uninstall -y matplolib
RUN find "/var/task/venv/lib/python3.6/site-packages" -name "test" | xargs rm -rf
RUN find "/var/task/venv/lib/python3.6/site-packages" -name "tests" | xargs rm -rf
RUN rm -rf "/var/task/venv/lib/python3.6/site-packages/pystan/stan/src"
RUN rm -rf "/var/task/venv/lib/python3.6/site-packages/pystan/stan/lib/stan_math/lib"

COPY lambda_function.py .
COPY .lambdaignore .

RUN echo "Unzipped size: $(du -sh . | cut -f1)"
RUN cat .lambdaignore | xargs zip -9qr upload-to-s3.zip * -x
RUN echo "Zipped file size (excl. entries in .lambdaignore): $(du -mh upload-to-s3.zip | cut -f1)"
