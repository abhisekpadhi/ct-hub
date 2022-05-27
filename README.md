# Rapyd Genie
It a POC of an Ad network that tracks what incentivizes users & leverages that information to recover abandoned carts.

## How does it works?
- This project contains 2 components:
  - `API Server`: API's to capture abandoned carts, fetch ads for the client 
  - `Ad frontend`: Frontend app built with React that handles logic of showing ad. It is located at `rapydgenie.netlify.com`
  - Embed script at `embed.js`, which publishers needs to embed 
- To embed simply put this before closing of `<body>` tag
```html
<script src="https://cdn.statically.io/gh/abhisekpadhi/ct-hub/main/embed.js" async defer></script>
```

## How to setup this project
- To test the POC, you will need to run an ecommerce app & a game app
- Ecommerce app is here: https://github.com/abhisekpadhi/ct-sat1
- Game app is here: https://github.com/abhisekpadhi/ct-sat2
- Run the server, in the `ct-hub` project run
```shell
yarn server
```
- Note: Embed script is currently set to call the api server running at localhost

## Tech stack
- API: nodejs
- Frontend: react

## Tests
- [x] Create customer using rapyd api
- [ ] Webhook to receive abandon cart events
- [x] API to fetch ads to show on the ad frontend app in the publisher side
- [x] Webhook to receive user traits (incentives)
- [x] API to mark cart recovered
- [x] Localstorage sharing with whitelisted domains
