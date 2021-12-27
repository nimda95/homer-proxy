## Homer proxy 
[![Build Status](http://drone.aymane.xyz/api/badges/nimda95/homer-proxy/status.svg)](http://drone.aymane.xyz/nimda95/homer-proxy)


**What is homer-proxy:question:**
This is a simple docker container that can be used to check if a container is running and return a simple response to be reflect on the health check feature on [homer](https://github.com/bastienwirtz/homer)
Can also be used to check if a remote endpoint is up and running.
>Keep in mind that the endpoint will be queried using `HEAD` http queries, so make sure that those endpoints can answer with a simple [HTTP Response Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) that will be forwarded directly to homer dashboard.

## How-to run the image

### 1. Get the image locally
- Option 1:  Build from source
```bash
git clone https://git.aymane.xyz/nimda95/homer-proxy.git
cd homer-proxy/
docker build . -t shimgapi/homer-proxy
```
- Option 2: Pull from docker-hub
```bash
docker pull shimgapi/homer-proxy:latest
```
### 2. Run the image
- Using `docker run`
```bash
# Simplest possible way
docker run -d -p 3000:3000 shimgapi/homer-proxy
```
> if you changed the image name durring build time, please change-it in the command above accordingly

- Using `docker-compose`
Create a file called `docker-compose.yaml` with the following content
```yaml
version:  "2"
services:
    homer-proxy:
        image:  shimgapi/homer-proxy
        container_name:  homer-proxy
        volumes:
            -  /var/run/docker.sock:/var/run/docker.sock  # needed to check the health of containers
        ports:
            -  3000:3000  # map to whatever port you like
        environment:
            - DOCKER_BLACKLIST=''		##################################################
            - HOSTNAME_BLACKLIST=''		##----------------------------------------------##
            - HOSTNAME_WHITELIST=''		## These variables are self-explanatory I guess ##
            - PORT=3000					##----------------------------------------------##
            - DOCKER_WHITELIST=''		##################################################
            - CORS_ORIGIN='*' 			# value to put in the CORS header. Defaults to '*'
        restart:  unless-stopped
```
- On Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/nimda95/homer-proxy.git)

### 3. Usage
In this example we assume that the `homer-proxy` instance is hosted on `https://health.aymane.xyz`
```yaml
    ... homer config
      - name: "Gitea"
        logo: "assets/icons/gitea.png"
        subtitle: "Git server"
        tag: "git"
        url: "https://git.aymane.xyz"
        target: "_blank"
        endpoint: "https://health.aymane.xyz/head/aHR0cHM6Ly9naXQuYXltYW5lLnh5eg"
        type: "Ping"
```
you can use the as follows:
- Track state of docker container
`/docker/<containerId or containerName>`
- Track health of http(s) endpoint
`/head/<base64 encoded endpoint>`