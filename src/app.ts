import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@chainsafe/libp2p-identify";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { setTimeout } from "node:timers/promises";
import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { logger } from "@libp2p/logger";
import { createFromJSON } from "@libp2p/peer-id-factory";
// import peerIdJson from "./id.json";
// import type { Multiaddr } from '@multiformats/multiaddr';

const log = logger("libp2p:app");
// const peerId = await createFromJSON(peerIdJson);
const relay = await createLibp2p({
  // peerId: peerId,
  addresses: {
    // announce: ["/dns4/app/tcp/8080/ws/"],
    listen: [
      "/dns4/app/tcp/8080/ws/",
      // "/ip4/127.0.0.1/tcp/8080/ws/",
      // "/dns4/localhost/tcp/8082/ws/",
      // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/443/wss',
      // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/80/ws',
      // "/ip4/4.227.145.88/tcp/8080/ws/",
    ],
  },
  transports: [webSockets({ filter: filters.all }), tcp()],
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
