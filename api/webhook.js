import { Configuration, OpenAIApi } from "openai";

var https;

(async() => {
  console.log("---- Check if 'https' node module is available in Vercel run time node");

  try {
    https = await (eval('import("node:https")'));
    console.log("---- 'https' is Available");
  } catch (err) {
    console.error("'https' support is disabled");
  }
})();

const TOKEN = process.env.LINE_ACCESS_TOKEN


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function askGpt3DominosQuestion(question) {

  // Add context-aware if your goal is to make knowledge-based 
  // 
  // Ex.
  // `
  // The following is a conversation with an AI specifically trained on Domino Pizza information. 
  // It can provide helpful answers to any questions related to Domino's Pizza, including products, services, promotions, and more.
  // User: ${question}
  // AI:
  // `;

  const prompt = `以下の会話は日本語で行う。会話者はあなたです。

  ユーザ：${question}
  AI：`;

  const completion = await openai.createCompletion({
    model: "davinci-codex",
    prompt: prompt,
    max_tokens: 40,
    n: 1,
    stop: null,
    temperature: 0.75,
  });
  const answer = completion.data
  console.log("Here's the answer form GPT model:")
  console.log("**************************** Begin **************************************")
  return answer;
}

export default async function handler(req, res) {
  if (req.body) {
    console.log("---- You send us JSON data at /api/webhook endpoint");
  
    if (req.body.events[0].type === "message") {
      const m = req.body.events[0].message.text
      try {
        console.log('---- Question : ' + m )
        const answer = await askGpt3DominosQuestion(m)
        console.log(answer)  // <pending>
        console.log("**************************** End **************************************")

        // return res.send({"answer" : ans});

        const msg = [
          {
            "type": "text",
            "text": answer.choices[0].text
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

        console.log("--- It's time to reply to users on LINE");
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
    res.status(400).send('400 Error [INVALID_PAYLOAD]: This is LINE Messaging webhook endpoint! Your request does not include JSON data.')
  }
}