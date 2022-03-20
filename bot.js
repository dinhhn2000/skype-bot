const { ActivityHandler, TurnContext } = require('botbuilder')
const cron = require('node-cron')
const ENV_FILE = path.join(__dirname, '.env')
require('dotenv').config({ path: ENV_FILE })

class ProactiveBot extends ActivityHandler {
  constructor(conversationReferences, adapter, refs, appId) {
    super()
    this.cron = {}
    const welcomeMessage = process.env.welcomeMessage
    const activateMessage = process.env.activateMessage
    const deactivateMessage = process.env.deactivateMessage

    this.conversationReferences = conversationReferences

    this.onMessage(async (context, next) => {
      try {
        this.addConversationReference(context.activity)

        if (context.activity.text.includes(welcomeMessage)) {
          await context.sendActivity('Hi human whose name is ' + context.activity.from.name)
        }

        // Start the cron job and send proactive message if the message is ativate
        if (context.activity.text.includes(activateMessage) && context.activity.text.length > activateMessage.length) {
          const id = context.activity.text.split(activateMessage)[1].trim()
          const command = id.split(' ')
          const message = command.pop()
          const cronPattern = command.join(' ')

          if (this.cron[id]) throw new Error('This protocol has already activated!!!')
          if (message && message.length > 0 && cron.validate(cronPattern)) {
            await context.sendActivity('Protocol D activated!!!')
            this.cron[id] = cron.schedule(cronPattern, async () => {
              for (const ref of Object.values(refs)) {
                await adapter.continueConversationAsync(appId, ref, async (context) => {
                  await context.sendActivity(message)
                })
              }
            })
          } else throw new Error('Wrong command format!!!')
        }

        if (
          context.activity.text.includes(deactivateMessage) &&
          context.activity.text.length > deactivateMessage.length
        ) {
          const id = context.activity.text.split(deactivateMessage)[1].trim()
          await context.sendActivity('Protocol D deactivated!!!')
          this.cron[id].stop()
          delete this.cron[id]
        }

        await next()
      } catch (error) {
        console.error(error.message)
        await context.sendActivity('Wrong format, cannot activate protocol!!!')
      }
    })
  }

  addConversationReference(activity) {
    const conversationReference = TurnContext.getConversationReference(activity)
    this.conversationReferences[conversationReference.conversation.id] = conversationReference
  }
}

module.exports.ProactiveBot = ProactiveBot
