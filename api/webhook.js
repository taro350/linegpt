import { Configuration, OpenAIApi } from "openai";

var https;

(async() => {
  console.log('Check if https module is available in Vercel run time node');

  try {
    https = await (eval('import("node:https")'));

    console.log('Available');
  } catch (err) {
    console.error('https support is disabled!');
  }
})();

const TOKEN = process.env.LINE_ACCESS_TOKEN


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function askGpt3DominosQuestion(question) {
  const prompt = `
    The following is a conversation with an AI specifically trained on Domino Pizza information. It can provide helpful answers to any questions related to Domino's Pizza, including products, services, promotions, and more.

    User: ${question}
    AI:`;

  const completion = await openai.createCompletion({
    model: "davinci-codex",
    prompt: prompt,
    max_tokens: 100,
    n: 1,
    stop: null,
    temperature: 0.75,
  });
  const answer = completion.data
  console.log("******************************************************************")
  console.log("Here's the answer form GPT model: " +  answer)
  console.log("******************************************************************")
  retur

export default async function handler(req, res) {
  if (req.body) {
    console.log("---- You send us JSON data at /webhook endpoint");
  
    if (req.body.events[0].type === "message") {
      const m = req.body.events[0].message.text
      try {
        console.log("Question : " + m)
        const answer = await askGpt3DominosQuestion(m)
        console.log(answer)  // <pending>
        console.log(`Promise resolved!: ${answer}`)

        // return res.send({"answer" : ans});

        const msg = [
          {
            "type": "text",
            "text": answer
          }
        ]

        // Message data, must be stringified
        const dataString = JSON.stringify({
          replyToken: req.body.events[0].replyToken,
          messages: msg
        })

        // Request header
        const headers = {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + TOKEN
        }

        // Options to pass into the request
        const webhookOptions = {
          "hostname": "api.line.me",
          "path": "/v2/bot/message/reply",
          "method": "POST",
          "headers": headers,
          "body": dataString
        }

        // Define request
        const request = await https.request(webhookOptions, (res) => {
          res.on("data", (d) => {
            process.stdout.write(d)
          })
        })

        // Handle error
        request.on("error", (err) => {
          console.error(err)
        })

        // Send data
        request.write(dataString)
        request.end()

      } catch (error) {
        console.log(`--- Error occured! : *****${error}*****`)
        if (error.response) {
          console.log("--- Error message : " + error.response.status);
          console.log("--- Error message : " + error.response.data);
        } else {
          console.log(`--- Error message : ${error.message}`);
        }
      }
      
    } else {
      res.status(400).send('400 Error [INVALID_PAYLOAD]: events[0].type is not message')
    }
  } else {
    res.status(400).send('400 Error [INVALID_PAYLOAD]: Your request does not include JSON data!')
  }
}