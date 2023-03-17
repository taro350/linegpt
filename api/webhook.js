// import { Configuration, OpenAIApi } from "openai";

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
const CHAT_KEY = process.env.OPENAI_API_KEY

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

async function askGpt3DominosQuestion(question) {

  // ********** Chat **********
  const msg = 
      {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
              "role": "user", 
              "content": question
            }
          ]
      }
    
  // Message data, must be stringified
  const dataString = JSON.stringify(msg)

  // Request header
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + CHAT_KEY
  }

  // Options to pass into the request
  const options = {
    "hostname": "api.openai.com",
    "path": "/v1/chat/completions",
    "method": "POST",
    "headers": headers,
    "body": dataString
  }

  return new Promise((resolve, reject) => {
    const request = https.request(options, (res) => {
      let data = "";

      res
        .on("data", (chunk) => {
          data += chunk
          console.log("Write chunk into data .....")
          // process.stdout.write(chunk)
        })
        .on("end", () => {
          resolve(data);
        });
    })

    // Handle error
    request.on("error", (err) => {
      console.error("---- Here's a request error: " + err)
      reject(err);
    })

    // Send data
    request.write(dataString)
    request.end()
  });


  // ********** Completioins **********

  // const compPrompt = `
  // // The following is a conversation with an AI specifically trained on Domino Pizza information. 
  // // It can provide helpful answers to any questions related to Domino's Pizza, including products, services, promotions, and more.
  // // User: ${question}
  // // AI:`;


  // const completion = await openai.createCompletion({
  //   model: "davinci-codex",
  //   prompt: compPrompt,
  //   max_tokens: 70,
  //   n: 1,
  //   stop: null,
  //   temperature: 0.75,
  // });

  // const answer = completion.data
  // return answer;

  // console.log("Here's the answer form GPT model:")
  // console.log("**************************** Begin **************************************")
  
}

export default async function handler(req, res) {
  if (req.body) {
    console.log("---- You send us JSON data at /api/webhook endpoint");
  
    if (req.body.events[0].type === "message") {
      const m = req.body.events[0].message.text
      try {
        console.log('---- Question : ' + m )
        console.log("---- It's time to chat with ChatGPT");
        console.log("**************************** Begin **************************************")
        const answer = await askGpt3DominosQuestion(m)
        console.log("**************************** End **************************************")

        // return res.send({"answer" : ans});

        console.log("---- Here's the answer returned: " + answer)
        const msg = [
          {
            "type": "text",
            "text": answer.choices.message.content
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
        console.log(`--- Error occured! : "${error}"`)
        if (error.response) {
          console.log("--- Error res status : " + error.response.status);
          console.log("--- Error res message : " + error.response.data);
        } else {
          console.log(`--- Error message : "${error.message}"`);
        }
      }
      
    } else {
      res.status(400).send('400 Error [INVALID_PAYLOAD]: events[0].type is not message')
    }
  } else {
    res.status(400).send('400 Error [INVALID_PAYLOAD]: This is LINE Messaging webhook endpoint! Your request does not include JSON data.')
  }
}