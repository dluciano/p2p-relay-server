import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@chainsafe/libp2p-identify";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { setTimeout } from "node:timers/promises";
import { createLibp2p } from "libp2p";
// import type { Multiaddr } from '@multiformats/multiaddr';

const relay = await createLibp2p({
  addresses: {
    listen: [
      "/ip4/127.0.0.1/tcp/8080/ws",
      // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/443/wss',
      // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/80/ws',
      // "/ip4/4.227.145.88/tcp/8080/ws/",
    ],
  },
  transports: [webSockets({ filter: filters.all })],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    relay: circuitRelayServer(),
  },
});
relay.addEventListener("start", (e) => {
  console.info(e.detail.getMultiaddrs());
});
const c = async () => {
  while (true) {
    const p = relay.peerId;
    const addr = relay.getMultiaddrs();
    if (addr) {
      console.log(addr.toString());
      return;
    }
    await setTimeout(500);
  }
};
c();
try {
  await relay.start();
} catch (error) {
  console.error(error);
}
