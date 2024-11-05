const express = require('express')
const amqp = require('amqplib/callback_api');
const app = express();
const PORT = 3000
let queueConnection = null ;
const resolutions= ['480p', '720p', '1080p']

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      throw error0;
    }

    queueConnection = connection;
    console.log('Connected to Queue')
});



app.use(express.json());

//TODO check auth for upload
app.post('/api/upload', (req,res) => {
    const { videoName } = req.body;

    queueConnection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
          }
          const queue = 'transcoder-queue';
      
          channel.assertQueue(queue, {
            durable: false
          });

          let data = {
            videoName,
            segmentLength: 10,
            format:'hls'
          }
          
          resolutions.forEach((resolution) => {
            data = {...data , resolution}
            console.log(" [x] Sent %s", JSON.stringify(data));

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
          });
    });
})

app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
})
