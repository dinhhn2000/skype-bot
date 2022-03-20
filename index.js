// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require('path')

// Note: Ensure you have a .env file and include the MicrosoftAppId and MicrosoftAppPassword.
const ENV_FILE = path.join(__dirname, '.env')
require('dotenv').config({ path: ENV_FILE })

const restify = require('restify')

const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder')

const { ProactiveBot } = require('./bot')

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
})

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory)

const adapter = new CloudAdapter(botFrameworkAuthentication)

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`)

  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  )

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.')
  await context.sendActivity('To continue to run this bot, please fix the bot source code.')
}

const conversationReferences = {}
const bot = new ProactiveBot(conversationReferences, adapter, conversationReferences, process.env.MicrosoftAppId)

const server = restify.createServer()
server.use(restify.plugins.bodyParser())

server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log(`\n${server.name} listening to ${server.url}`)
  console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator')
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"')
})

server.post('/api/messages', async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context))
})
