/* eslint-disable */

import handshakeDefault from './templates/address/handshake/default'
import tronDefault from './templates/address/tron/default'
import stellarDefault from './templates/address/stellar/default'
import polkadotDefault from './templates/address/polkadot/default'
import kusamaDefault from './templates/address/kusama/default'


const templates = {
  'handshake/default': handshakeDefault,
  'tron/default': tronDefault,
  'stellar/default': stellarDefault,
  'polkadot/default': polkadotDefault,
  'kusama/default': kusamaDefault
}

export default templates