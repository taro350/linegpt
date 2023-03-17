const openai = require("openai");

openai.apiKey = process.env.OPENAI_API_KEY

async function askGpt3DominosQuestion(question) {
  const prompt = `
    The following is a conversation with an AI specifically trained on Domino's Pizza information. It can provide helpful answers to any questions related to Domino's Pizza, including products, services, promotions, and more.

    User: ${question}
    AI:`;

  const response = await openai.Completion.create({
    engine: "davinci-codex",
    prompt: prompt,
    max_tokens: 100,
    n: 1,
    stop: null,
    temperature: 0.75,
  });

  const answer = response.choices[0].text.trim();
  console.log(answer)
  return answer;
}

export default async function handler(req, res) {
  if (req.body) {
    const { body } = req;
    
    try {
      const a = askGpt3DominosQuestion(body.question)
    } catch (e) {
      console.log(`Error occured! : ${e}`)
    }

    return res.send(`Here's the answer : ${a}`);
  } else {
    res.status(400).send("400 Error [INVALID_PAYLOAD] Your request does not include JSON data `question' parameter for GPT!")
  }

  }