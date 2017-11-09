# wanchain-dev
# Build using: docker build -t "wanwallet-cli:0.0.1" --rm=true --no-cache .
# Run using: docker run -itd --name="wanchain-dev" -v ~/wanchain/data/:/data/ wanwallet-cli:0.0.1

# NAME             wanwallet-cli
# VERSION          0.0.1
# LAST_UPDATED     2017-11-09 13:30

FROM ubuntu:16.04
MAINTAINER Ranadip Saha "ranadipheartz@gmail.com"

RUN apt-get update
RUN apt-get install git wget xz-utils python g++ make curl -y
RUN wget "https://nodejs.org/dist/v8.9.1/node-v8.9.1-linux-x64.tar.xz"
RUN tar -xJvf node-*.tar.xz
RUN rm node-*.tar.xz
RUN mv node-* /opt/node
RUN echo 'export PATH=$PATH:/opt/node/bin/' >> ~/.bashrc
RUN ln -s /opt/node/bin/* /bin/
RUN mkdir ~/npm-global
RUN npm config set prefix '~/npm-global'
RUN echo 'PATH=~/npm-global/bin:$PATH' >> ~/.bashrc

CMD ["/bin/bash"]