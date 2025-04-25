
const axios = require('axios');

const generateImage = async (req, res) => {
  const { prompt } = req.body;

  try {
    const predictionResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: { prompt }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const prediction = predictionResponse.data;
    const predictionId = prediction.id;

    let imageUrl;
    let status = prediction.status;
    let tries = 0;

    while (status !== 'succeeded' && status !== 'failed' && tries < 10) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusResponse = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      status = statusResponse.data.status;

      if (status === 'succeeded') {
        imageUrl = statusResponse.data.output[0];
      }

      tries++;
    }

    if (status === 'succeeded') {
      res.status(200).json({ imageUrl });
    } else {
      res.status(500).json({ message: "Image generation failed or timed out" });
    }
  } catch (error) {
    console.error("❌ Image generation error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to generate image",
      error: error.response?.data || error.message,
    });
  }
};
module.exports = { generateImage };
