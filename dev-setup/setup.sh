mkdir -p ~/wanchain/data
cp -r ../../wanwallet-cli ~/wanchain/data/
docker build -t "wanwallet-cli:0.0.1" --rm=true --no-cache .
docker run -itd --name="wanwallet-cli" -v ~/wanchain/data/:/data/ wanwallet-cli:0.0.1
docker exec -it wanwallet-cli sh -c "cd /data/wanwallet-cli && npm install"