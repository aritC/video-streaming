const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const VIDEO_SIZE = Object.freeze({
    '480p': '640x480',
    '720p': '1280x720',
    '1080p': '1920x1080'
})

const convertVideoFormat = async (inputVideoName, segmentDuration, videoSize, outputFormat) => {


    if(VIDEO_SIZE[videoSize] === undefined){
        throw new Error('Video Size Unknown')
    }

    ffmpeg(`./videos/input/${inputVideoName}`, { timeout: 10000 })
        .size(`${VIDEO_SIZE[videoSize]}`)
        .addOptions([
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            `-hls_time ${segmentDuration}`,
            `-f ${outputFormat}`
        ])
        .output(`./videos/output/${inputVideoName}x${videoSize}.m3u8`)
        .run()
        .on('error', (err)=> {
            console.error(err)
        });
};  



module.exports = { convertVideoFormat, VIDEO_SIZE}
