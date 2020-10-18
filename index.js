const { Requester, Validator } = require('@chainlink/external-adapter')
const TikTokScraper = require('tiktok-scraper')

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  videoUrl: ['videoUrl']
}

const createRequest = (input, callback) => {
  // The input data is validated upon instantiating the Validator
  const validator = new Validator(input, customParams)
  // Check for error, and callback if exists
  if (validator.error) return callback(validator.error.statusCode, validator.error)
  const jobRunID = validator.validated.id
  const videoUrl = validator.validated.data.videoUrl;

  (async () => {
    try {
      const videoData = await TikTokScraper.getVideoMeta(videoUrl, null)
      const response = getResponse(videoData)
      // response.data.result = Requester.validateResultNumber(response.data, ['result'])
      callback(200, Requester.success(jobRunID, response))
    } catch (error) {
      callback(500, Requester.errored(jobRunID, error))
    }
  })()
}

function getResponse (data) {
  return {
    data: {
      result: {
        likesCount: data.diggCount,
        playCount: data.playCount,
        commentCount: data.commentCount,
        shareCount: data.shareCount,
        createTime: data.createTime,
        musicMeta: data.musicMeta,
        musicUrl: getMusicUrl(data.musicMeta)
      }
    },
    status: 200
  }
}

function getMusicUrl (musicMeta) {
  const musicId = musicMeta.musicId
  const name = musicMeta.musicName
  const nameNoSpaces = name.replace(/\s/g, '-')
  return `https://www.tiktok.com/music/${nameNoSpaces}-${musicId}?lang=en`
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
