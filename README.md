# skype-bot
A project to create a bot chat on Skype

## Explaination
- This project is trying to solve a small problem when working with team in epidamic period. Team is working through Skype and Microsoft really strict about adding a bot to Skype so I cloned a bot from Microsoft repos and customized it.
- **Problem**
  - Daily meetings usually being delayed because people in team do not manage time well
  - Some daily things need to tell over & over again such as remember to update the time working on their own task, run automation testing at the end of day, etc.
- **Solution**
  - Create a bot to schedule sending the messages at the time configured

## Current status & Future orientation
- **Now**
  - The project can working fine with setting up message at multiple schedule
- **Future intentions**
  - Can customize message
  - Using some ML model to analyze the sentence to set scheduler (*NLP* for example)

## Installation and deployment
- **Installation** (*same as other Node JS projects*)
  - Install node packages
    ```
    npm install
    ```
  - Start the project
    ```
    npm start
    ```
- **Deployment** (*quite tricky because the document of Azure seems quite hardhard to follow (Only for NodeJS project)*)
  - Ref: [Publish your bot to Azure - Bot Service | Microsoft Docs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-deploy-az-cli?view=azure-bot-service-4.0&tabs=singletenant%2Cnewgroup%2Cjavascript)
  - My steps to deploy:
    - Have an account in Azure (**Important!!!**)
    - Setup account
    ```
    az account set --subscription "<azure-subscription-id>"
    ```
    - Run this command (remember the **display-name**, **password** & **appId**) & use this info to fill in the `.env`
    ```
    az ad app create --display-name "[Name of the bot]" --password "[AtLeastSixteenCharacters_0]" --available-to-other-tenants
    ```
    - Config deployment (*Really long command!!!*) (My stratergy is using display name for all kinds of other names, you can customize it, and since I live in SEA so all locations will be **eastasia**)
    ```
    az deployment sub create --template-file "deploymentTemplates/template-with-new-rg.json" --location eastasia --parameters appId="[appId]" appSecret="[password]" botId="[display-name]"  botSku=F0 newAppServicePlanName="[display-name]-plan" newWebAppName="[display-name]-webapp" groupName="[display-name]-group" groupLocation="eastasia" newAppServicePlanLocation="eastasia" --name "[display-name]"
    ```
    - Preparing for deploy (Almost done, hurayyyy!!!)
    ```
    az bot prepare-deploy --code-dir "." --lang Javascript
    ```
    - Compress files into zip
    ```
    Compress-Archive -Path * -DestinationPath bot.zip
    ```
    - Let's launch the zip to the Azure server
    ```
    az webapp deployment source config-zip --resource-group "[display-name]-group" --name "[display-name]-webapp" --src "./bot.zip"
    ```
