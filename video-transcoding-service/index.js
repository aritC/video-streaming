#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const {convertVideoFormat} = require('./src/util/ffmpeg')


const transcodeVideo = async (message) => {
    console.log(" [x] Received %s", message.content.toString());
    let data = JSON.parse(msg.content.toString());
    convertVideoFormat(data.videoName, data.segmentLength, data.resolution, data.format)
}

const listenToQueue = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    const queueName = 'transcoder-queue';
    channel.assertQueue(queue, {
        durable: true
    })

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queueName, transcodeVideo, { noAck: true});

}

listenToQueue();



// amqp.connect('amqp://localhost', function(err, connection) {
//     if(err){
//         throw err;
//     }

//     connection.createChannel(function(err1, channel) {
//         if(err1)
//             throw err1;

//         const queue = 'transcoder-queue'
//         channel.assertQueue(queue, {
//             durable: true
//         })

//         console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
//         channel.consume(queue, function(msg) {
//             console.log(" [x] Received %s", msg.content.toString());
//             let data = JSON.parse(msg.content.toString());
//             convertVideoFormat(data.videoName, data.segmentLength, data.resolution, data.format)
//         }, {
//             noAck: true
//         });


//     })  
// })