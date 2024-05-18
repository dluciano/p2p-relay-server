import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
// import { echo } from '@libp2p/echo';
import {
  // circuitRelayTransport,
  circuitRelayServer,
} from '@libp2p/circuit-relay-v2';
import { identify } from '@chainsafe/libp2p-identify';
// import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
// import { WebRTC } from '@multiformats/multiaddr-matcher';
// import delay from 'delay';
// import { pipe } from 'it-pipe';
import { createLibp2p } from 'libp2p';
// import type { Multiaddr } from '@multiformats/multiaddr';

const relay = await createLibp2p({
  addresses: {
    listen: [
	   // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/443/wss', 
	   // '/dns4/p2p.eastus.cloudapp.azure.com/tcp/80/ws'
	  '/ip4/4.227.145.88/tcp/8080/ws/'
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

await relay.start();
