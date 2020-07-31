import { createSecureServer, constants as http2Constants } from "http2"
import { readFileSync } from "fs"

import config from "./server-config.json"
import { rejects } from "assert"

/** @param {String} file */
function get_content_type(file) {
  switch (file.split(".").pop()) {
    case "html":
      return "text/html"
    case "css":
      return "text/css"
    case "js":
      return "application/javascript"
    case "json":
      return "application/json"
    case "png":
      return "image/png"
    case "ico":
      return "image/x-icon"
    case "svg":
      return "image/svg+xml"
    case "xml":
      return "image/svg+xml"
    default:
      return "text/plain"
  }
}

/** @param {String} file */
function get_headers(file) {
  const headers = {
    [http2Constants.HTTP2_HEADER_STATUS]: http2Constants.HTTP_STATUS_OK,
    [http2Constants.HTTP2_HEADER_CONTENT_TYPE]: get_content_type(file),
  }

  if (file.includes("sw.js")) {
    headers["Service-Worker-Allowed"] = "/"
  }

  return headers
}

/** @param {import('http2').ServerHttp2Stream} stream */
function push_handler(stream) {
  const pushable_resources = ["app/manifest.json", "app/shell/sw.js"]
  return Promise.all([
    new Promise((resolve, reject) => {
      const resource_path = "app/manifest.json"
      stream.pushStream(get_headers(resource_path), (err, pushStream) => {
        if (err) {
          reject(err)
        } else {
          resolve([resource_path, pushStream])
        }
      })
    }),
    new Promise((resolve, reject) => {
      const resource_path = "app/shell/sw.js"
      stream.pushStream(get_headers(resource_path), (err, pushStream) => {
        if (err) {
          reject(err)
        } else {
          resolve([resource_path, pushStream])
        }
      })
    }),
  ])
}

/**
 * @param {import('http2').ServerHttp2Stream} stream
 * @param {import('http2').IncomingHttpHeaders} headers
 */
async function on_stream(stream, headers) {
  stream.on("error", console.error)
  stream.on("readable", () => {}) // TODO This dictates the body of a payload

  const request_path = headers[http2Constants.HTTP2_HEADER_PATH]?.slice(1)
  const queryOperatorIndex = request_path?.indexOf("?")

  const request = {
    method: headers[http2Constants.HTTP2_HEADER_METHOD],
    resource_path:
      queryOperatorIndex !== -1
        ? request_path?.slice(0, queryOperatorIndex)
        : request_path,
    query:
      queryOperatorIndex !== -1
        ? request_path?.slice(queryOperatorIndex + 1)
        : "",
    referer: headers[http2Constants.HTTP2_HEADER_REFERER],
    payload: null,
  }

  if (request.resource_path === "") {
    request.resource_path = "index.html"
    /** @type {[string, import('http2').ServerHttp2Stream][]} */
    let push_map = []
    try {
      push_map = await push_handler(stream)
    } catch (ex) {
      console.error(ex)
    }

    for (const [each_resource_path, each_push_stream] of push_map) {
      each_push_stream.respondWithFile(each_resource_path)
    }
  }

  request.resource_path = `${config.serve_directory}/${request.resource_path}`

  console.log(`[STREAM] ${JSON.stringify(request)}`)

  if (request.method === "POST") {
    request.payload = await new Promise((resolve, reject) => {
      stream.on("readable", (err) => {
        err ? reject(err) : resolve(stream.read())
      })
    })
    console.log(`Request payload: ${request.payload}`)
  }

  const response_headers = get_headers(request.resource_path)
  let content = null
  try {
    content = readFileSync(request.resource_path)
  } catch (ex) {
    content = "<html><body>File not found!</body></html>"
    response_headers[http2Constants.HTTP2_HEADER_STATUS] =
      http2Constants.HTTP_STATUS_NOT_FOUND
    response_headers[http2Constants.HTTP2_HEADER_CONTENT_TYPE] = "text/html"
  }

  stream.respond(response_headers)
  stream.write(content)
  stream.end()
}

async function main() {
  var server = createSecureServer({
    cert: readFileSync("./.security/cert.pem"),
    key: readFileSync("./.security/key.pem"),
  })

  server.on("stream", on_stream)
  server.on("error", console.error)

  await new Promise((resolve) => {
    server.listen(config.port, config.host, resolve)
  })
  if (!server.listening) {
    console.error(`Could not listen on: ${config.host}:${config.port}`)
    return
  }
  console.log(`Server listening on ${config.host}:${config.port}`)
}

main()
