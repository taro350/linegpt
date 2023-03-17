import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

// async function askGpt3DominosQuestion(question) {
//   const prompt = `
//     The following is a conversation with an AI specifically trained on Domino Pizza information. It can provide helpful answers to any questions related to Domino's Pizza, including products, services, promotions, and more.

//     User: ${question}
//     AI:`;

//   const completion = await openai.createCompletion({
//     model: "davinci-codex",
//     prompt: prompt,
//     max_tokens: 100,
//     n: 1,
//     stop: null,
//     temperature: 0.75,
//   });
//   const answer = completion.data
//   console.log("******************************************************************")
//   console.log("Here's the answer form GPT model: " +  answer)
//   console.log("******************************************************************")
//   return answer;
// }

export default async function handler(req, res) {
  console.log("---- You are at /api endpoint");
  if (req.body) {
    console.log("---- You send us JSON data at /api endpoint");
    // try {
    //   console.log(`Question : "${req.body.question}"`)
    //   const ans = await askGpt3DominosQuestion(req.body.question)
    //   console.log(ans)  // <pending>
    //   console.log(`Promise resolved!: ${ans}`)

    //   return res.send({"answer" : ans});
    // } catch (error) {
    //   console.log(`--- Error occured! : *****${error}*****`)
    //   if (error.response) {
    //     console.log("--- Error message : " + error.response.status);
    //     console.log("--- Error message : " + error.response.data);
    //   } else {
    //     console.log(`--- Error message : ${error.message}`);
    //   }
    // }
  } else {
    res.status(400).send("400 Error [INVALID_PAYLOAD] Your request does not include JSON data 'question' parameter for GPT!")
  }

  }