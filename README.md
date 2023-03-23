# Token Supply

## Instructions to build and run the project
To build and run the project, you'll need to follow these steps:

Install Node.js and npm (if you haven't already) from the official Node.js website: https://nodejs.org/

Clone the GitHub repository or extract the project files to your local machine.

Open a terminal/command prompt and navigate to the project's root folder.

Install the project dependencies by running the following command:

```bash
npm install
```
Compile the TypeScript files by running:
```bash
npm run build
```
Start the server by running:
```bash
npm start
```

Now your server should be up and running. By default, it listens on localhost:3000. You can access the API endpoints using a web browser or an API testing tool like Postman.

### API Endpoints
For the total supply across all networks as a JSON object, visit or send a GET request to http://localhost:3000/totalSupplyAcrossNetworks
For the sum of the total supply across all networks, visit or send a GET request to http://localhost:3000/totalSupply

To enable automatic rebuilding and restarting the server during development, you can run the following command:

```bash
npm run dev
```

This will use nodemon to watch for file changes and restart the server automatically when needed.

## Retrieve Supply of a token across networks
1. Can provide different contracts for a token on each network
2. Checks for decimals of a token on each network
3. Sums value according to required decimal conversion and provides an across network totalSupplySum

## API Creation of /totalSupply and /totalSupplyAcrossNetworks
1. Access /totalSupply to get the sum of the supply across networks in one plain test value
2. Access /totalSupplyAcrossNetworks to get the individual total supply of the token across networks