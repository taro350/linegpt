export default async function handler(req, res) {
  if (req.body) {
    const { body } = req;
    return res.send(`Hello ${body.name}, you send us JSON data!`);
  } else {
    res.status(400).send('400 Error [INVALID_PAYLOAD] Your request does not include JSON data!')
  }

  }