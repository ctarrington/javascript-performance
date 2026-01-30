# about
just static data for clusters

# notes
nvm use    
npm run dev    

# access from a limited resource container

create a /silly-config    

sudo podman run -d \
  --name=chrome \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /silly-config:/config \
  --shm-size="2gb" \
  --restart unless-stopped \
  lscr.io/linuxserver/chrome:latest    

in host browser, go to https://localhost:3001

in vnc browser inside the browser, go to http://host.containers.internal:8080/    
 
