# Hi there!
This is a simple online pong game with server rooms and p2p support.

# Deployment
## Node.js
```sh
npm i
node index.js
```
**PORT** and **HOST** envs can be used to change server address.

## Docker
```sh
sudo docker image build -t pong .
sudo docker container run --name pong -d --rm -p 8080:80 pong
```

# Trivia
 - This program uses only 2 packages: [ws](https://www.npmjs.com/package/ws) and [qrcode](https://www.npmjs.com/package/qrcode)
 - [index.html](https://raw.githubusercontent.com/Astroner/pong/master/index.html) and [index.min.html](https://raw.githubusercontent.com/Astroner/pong/master/index.min.html) are standalone applications and require server only for server rooms.
 - This version of the game was completed in **18 hours and 10 minutes**.
