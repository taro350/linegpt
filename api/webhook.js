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



export default async function handler(req, res) {
  if (req.body) {
    console.log("---- You send us JSON data at /webhook endpoint");
  
    if (req.body.events[0].type === "message") {
      // Message data, must be stringified
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            "type": "text",
            "text": "Hello, user"
          },
          {
            "type": "text",
            "text": "May I help you?"
          }
        ]
      })

      // Request header
      const headers = {
        "Content-Type": "application/json",
        "Authorization": LINE_ACCESS_TOKEN
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
    } else {
      res.status(400).send('400 Error [INVALID_PAYLOAD] Your request does not include JSON data!')
    }
  } 
}