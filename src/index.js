const core = require("@actions/core")
const axios = require("axios")
const fs = require("fs").promises
const FormData = require("form-data")

const BASE_FAMOCO_URL = "https://my.famoco.com/api/organizations/"
const FAMOCO_API_TOKEN = process.env.FAMOCO_API_TOKEN
const FAMOCO_ORGANIZATION_ID = process.env.FAMOCO_ORGANIZATION_ID

async function run() {
  try {
    // Validate environment variables
    if (!FAMOCO_API_TOKEN || !FAMOCO_ORGANIZATION_ID) {
      throw new Error("Missing required environment variables: FAMOCO_API_TOKEN and/or FAMOCO_ORGANIZATION_ID")
    }

    const apk = core.getInput("apk", { required: true })
    
    // Check file accessibility
    await fs.access(apk, fs.constants.F_OK | fs.constants.R_OK)
    
    const form = new FormData()
    form.append("apk", fs.createReadStream(apk))
    
    const response = await axios.post(
      `${BASE_FAMOCO_URL}${FAMOCO_ORGANIZATION_ID}/applications/`,
      form,
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${FAMOCO_API_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    )

    core.info(`*SUCCESS:* Version *${response.data.package_version_name}* uploaded to MDM`)
  } catch (error) {
    if (error.response) {
      core.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
    } else if (error.request) {
      core.error(`Request Error: ${error.request}`)
    } else {
      core.error(`Error: ${error.message}`)
    }
    core.setFailed(error.message || 'An unknown error occurred')
  }
}

run()
