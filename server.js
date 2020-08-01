import { createSecureServer, constants as http2Constants } from "http2"
import { readFileSync } from "fs"

import config from "./server-config.json"

/** @param {import('http2').IncomingHttpHeaders} headers */
function generate_request(headers) {
  const request_path = headers[http2Constants.HTTP2_HEADER_PATH].slice(1)
  const queryOperatorIndex = request_path?.indexOf("?")

  return {
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
}

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

/** @param {String} resource_path */
function generate_response_headers(resource_path) {
  const response_headers = {
    [http2Constants.HTTP2_HEADER_STATUS]: http2Constants.HTTP_STATUS_OK,
    [http2Constants.HTTP2_HEADER_CONTENT_TYPE]: get_content_type(resource_path),
  }

  if (resource_path.includes("sw.js")) {
    response_headers["Service-Worker-Allowed"] = "/"
  }

  return response_headers
}

/** @param {[String, import('http2').ServerHttp2Stream]} pushable_resource_tuple */
function create_push_stream_promise(pushable_resource_tuple) {
  return new Promise((resolve, reject) => {
    const resource_path = pushable_resource_tuple[0]
    pushable_resource_tuple[1].pushStream(
      generate_response_headers(resource_path),
      (err, pushStream) => {
        if (err) {
          reject(err)
        } else {
          resolve([resource_path, pushStream])
        }
      }
    )
  })
}

/** @param {import('http2').ServerHttp2Stream} stream */
async function push_handler(stream) {
  /** @type {[string, import('http2').ServerHttp2Stream][]} */
  let mapped_pushes = []

  try {
    mapped_pushes = await Promise.all(
      config.pushable_resources
        .map((resource) => [`${config.serve_directory}${resource}`, stream])
        .map(create_push_stream_promise)
    )
  } catch (ex) {
    console.error(ex)
    return
  }

  for (const [each_resource_path, each_push_stream] of mapped_pushes) {
    respond(each_push_stream, each_resource_path)
    console.log(
      `[SERVER] Pushed: ${each_resource_path} - from stream id: ${each_push_stream.id}`
    )
  }
}

/** @param {import('http2').ServerHttp2Stream} stream */
async function extract_payload(stream) {
  return stream.readable
    ? stream.read()
    : await new Promise((resolve, reject) => {
        stream.on("readable", (err) => {
          err ? reject(err) : resolve(stream.read())
        })
      })
}

/**
 * @param {import('http2').ServerHttp2Stream} stream
 * @param {String} resource_path
 */
function respond(stream, resource_path) {
  const response_headers = generate_response_headers(resource_path)

  /** @type {String | Buffer} */
  let content = "<html><body>File not found!</body></html>"
  try {
    content = readFileSync(resource_path)
  } catch (ex) {
    response_headers[http2Constants.HTTP2_HEADER_STATUS] =
      http2Constants.HTTP_STATUS_NOT_FOUND
    response_headers[http2Constants.HTTP2_HEADER_CONTENT_TYPE] = "text/html"
  }
  stream.respond(response_headers)
  stream.write(content)
  console.log(
    `[SERVER] Responded to: ${resource_path} - from stream id: ${stream.id}`
  )
  stream.end()
}

/**
 * @param {import('http2').ServerHttp2Stream} stream
 * @param {import('http2').IncomingHttpHeaders} headers
 */
async function on_stream(stream, headers) {
  stream.on("error", console.error)

  const request = generate_request(headers)

  let push_promise = null
  if (request.resource_path === "") {
    request.resource_path = "index.html"
    push_promise = push_handler(stream)
  }

  request.resource_path = `${config.serve_directory}/${request.resource_path}`

  console.log(`[SERVER] Incoming request: ${JSON.stringify(request)}`)

  if (request.method === "POST") {
    request.payload = await extract_payload(stream)
    console.log(`Request payload: ${request.payload}`)
  }

  respond(stream, request.resource_path)
  if (push_promise !== null) await push_promise
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
