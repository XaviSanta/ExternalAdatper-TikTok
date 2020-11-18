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
  console.log(validator)
  const jobRunID = validator.validated.id
  const videoUrl = validator.validated.data.videoUrl;

  (async () => {
    try {
      const videoData = await TikTokScraper.getVideoMeta(videoUrl, null)
      const response = getResponse(videoData)
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
        likes: data.collector[0].diggCount,
        musicId: data.collector[0].musicMeta.musicId
        // shareCount: data.collector[0].shareCount,
        // playCount: data.collector[0].playCount,
        // commentCount: data.collector[0].commentCount,
        // downloaded: data.collector[0].downloaded
      }
    },
    status: 200
  }
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
