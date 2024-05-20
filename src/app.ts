import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@chainsafe/libp2p-identify";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { createLibp2p } from "libp2p";
import { logger } from "@libp2p/logger";

const log = logger("libp2p:app");
log(`ADDRESS: ${process.env.ADDRESS}`);
const relay = await createLibp2p({
  addresses: {
    announce: [process.env.ADDRESS],
    listen: [process.env.ADDRESS],
  },
  transports: [webSockets({ filter: filters.all })],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    relay: circuitRelayServer(),
  },
  start: false,
});
relay.addEventListener("peer:connect", (event) => {
  log("peer:connect");
  log(event.detail);
});
relay.addEventListener("connection:open", (event) => {
  log("connection:open");
  log(event.detail);
});
relay.addEventListener("self:peer:update", (event) => {
  log("self:peer:update");
  log(event.detail);
  log(event.detail.peer);
});
relay.addEventListener("transport:listening", (event) => {
  log("transport:listening");
  console.log(event.detail.getAddrs());
});
relay.addEventListener("start", (event) => {
  log("start");
  log(event.detail.getMultiaddrs());
});

try {
  await relay.start();
} catch (error) {
  log.error(error);
}
