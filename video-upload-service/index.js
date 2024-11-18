const express = require('express')
const amqp = require('amqplib/callback_api');
const app = express();
const {randomPrefixGenerator} = require("./src/util/randomPrefixGenerator")

require('dotenv').config()

const PORT = process.env.PORT

const Minio = require('minio');
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

const resolutions= ['480p', '720p', '1080p']

app.use(express.json());

// Queue setup utility
async function setupQueue(channel, queueName) {
    await channel.assertQueue(queueName, { durable: true });
}

// TODO check auth
app.post('/api/upload',async (req, res) => {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { videoName } = req.body;

        try {
            // Connect to RabbitMQ and create a channel
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            const channel = await connection.createChannel();

            const queueName = 'transcoder-queue';
            await setupQueue(channel, queueName);

            const baseData = {
                videoName,
                segmentLength: 10,
                format: 'hls',
            };

            for (const resolution of resolutions) {
                const data = { ...baseData, resolution };
                const message = JSON.stringify(data);

                logger.info(`Sending message to queue: ${message}`);
                channel.sendToQueue(queueName, Buffer.from(message));
            }

            // Close the channel and connection
            await channel.close();
            await connection.close();

            res.status(200).json({ message: 'Video upload queued successfully' });
        } catch (error) {
            logger.error('Error processing video upload:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
);



app.get("/api/presignedURL", (req, res) => {
    let { fileName } = req.query;
    if(fileName == undefined){
      return res.status(400).json({"message": "fileName is a required parameter and is missing"})
    }

    const randomPrefix = randomPrefixGenerator();
    fileName = randomPrefix + '_' + fileName;
    console.log(fileName)


    minioClient.presignedPutObject('input-video', fileName, (err, url) => {
      if (err) throw err;
      return res.status(200).json({"message": "success", url, fileName})
  });
});

app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
})
