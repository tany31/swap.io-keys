/* eslint-disable */
import BaseAdaptor from './BaseAdaptor'
import BaseWallet from '../wallets/BaseWallet'
import EVMWallet from '../wallets/EVMWallet'
import { ISignedMessage } from '../types'
import * as EthUtil from 'ethereumjs-util'


type Seed = Buffer

class EVMAdaptor extends BaseAdaptor {
  constructor(networkConfig) {
    super(networkConfig)
  }

  public createWallet(options): BaseWallet|false{
    const wallet = new EVMWallet({
      networkAdaptor: this,
      ...options
    })
    return wallet
  }

  public signMessage(options): ISignedMessage|false {
    const {
      message,
    } = options
    //@ts-ignore
    const signWallet: BaseWallet = this.createWallet(options)

    const signWalletPrvKey = signWallet.getPrivateKey()

    const privateKey = EthUtil.toBuffer(signWalletPrvKey)
    const hashedMessage = EthUtil.keccak(Buffer.from(message, 'utf8'))
    const signature = EthUtil.ecsign(hashedMessage, privateKey)

    const compactSig = EthUtil.toRpcSig(
      signature.v,
      signature.r,
      signature.s
    )

    return {
      message,
      pubkey: signWallet.getPublicKey(),
      address: signWallet.getAddress(),
      sign: compactSig,
      network: this.getSymbol()
    }
  }

  public validateMessage(signedMessage: ISignedMessage): Boolean {
    const {
      message,
      pubkey,
      address,
      sign
    } = signedMessage
    const hashedMessage = EthUtil.keccak(Buffer.from(message, 'utf8'))
    const ecdsaSignature = EthUtil.fromRpcSig(sign)
    const publicKey = EthUtil.ecrecover(
      hashedMessage,
      ecdsaSignature.v,
      EthUtil.toBuffer(ecdsaSignature.r),
      EthUtil.toBuffer(ecdsaSignature.s)
    )
    const recoverdAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey))
    return (EthUtil.toChecksumAddress(address) == EthUtil.toChecksumAddress(recoverdAddress))
  }
}


export default EVMAdaptor