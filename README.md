# install node
#clone from git by using at root directory of http server 
git clone https://github.com/apacedeepak/node.git
cd node
git checkout
npm install
#Create a blank DB and  configure server/datasources.development.json
node server/create-lb-table.js
node server/server.js
cd client 
npm install
ng build --aot --base-href /portal/
