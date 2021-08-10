/* eslint-disable */
import BaseAdaptor from './adaptors/BaseAdaptor'
import EVMAdaptor from './adaptors/EVMAdaptor'
import UTXOAdaptor from './adaptors/UTXOAdaptor'
import { getStorage, setStorage } from '@/utils/storage'
import { encryptData, toBuffer, decryptData, getSeedFromMnemonic, getPublicKey } from '@/utils/cipher'
import CryptoProfile from './profile'

type Seed = Buffer
type PublicKey = Buffer
type MnemonicPhrase = string[]

class CryptoInterface {
  constructor() {}

  public getProfiles(): Record<string, unknown> {
    const profiles: Record<string, unknown> = getStorage('profiles') || {}
    return profiles
  }

  public async accessProfileByKey(profileKey: string, password: string): Promise<CryptoProfile|boolean> {
    return new Promise(async (resolve) => {
      const profiles: Record<string, unknown> = getStorage('profiles') || {}

      if (profiles[profileKey]) {
        const profileData = await this.accessProfile(profiles[profileKey], password)
        resolve(profileData)
      } else {
        resolve(false)
      }
    })
  }

  public async accessProfile(profile: unknown, password: string): Promise<CryptoProfile|boolean> {
    return new Promise(async (resolve) => {
      const profileSeed = await decryptData(profile, password)
      resolve(new CryptoProfile(toBuffer(profileSeed)))
    })
  }

  public async accessProfileByIndex(profileIndex: number, password: string): Promise<CryptoProfile|boolean> {
    return new Promise(async (resolve) => {
      const profiles: Record<string, unknown> = getStorage('profiles') || {}
      const profilesIndexes = Object.keys(profiles)
      if (profilesIndexes[profileIndex]) {
        const profileData = await this.accessProfile(profiles[profilesIndexes[profileIndex]], password)
        resolve(profileData)
      } else {
        resolve(false)
      }
    })
  }

  public async createProfileFromMnemonic(mnemonic: MnemonicPhrase, password: string): Promise<CryptoProfile> {
    const seed: Seed = await getSeedFromMnemonic(mnemonic)
    const publicKey: PublicKey = getPublicKey(seed)
    return await this.createProfile(seed, publicKey, password)
  }

  public async createProfile(seed: Seed, publicKey: PublicKey, password: string): Promise<CryptoProfile> {
    const newProfile = await encryptData(seed, publicKey, password)
    const profiles: Record<string, unknown> = getStorage('profiles') || {}
    const shortKey = publicKey.toString('hex').slice(0, 10)

    profiles[shortKey] = newProfile

    return new CryptoProfile(seed)
  }

  private async extendAdaptorConfig(options) {
    const {
      config,
      configsByName,
      cycleExtendDetector
    } = options

    if (config.parent) {
      if (cycleExtendDetector[config.parent]) {
        throw new Error(`Cycle extend config detected`)
      } else {
        if (!configsByName[config.parent]) {
          configsByName[config.parent] = await this._fetchNetworkConfig(config.parent)
        }
        const parentConfig = configsByName[config.parent]
        const extendedConfig = {
          ...parentConfig,
          ...config,
          parent: parentConfig.parent,
        }
        if (parentConfig.parent) {
          cycleExtendDetector[config.parent] = true
          return this.extendAdaptorConfig({
            config: extendedConfig,
            configsByName,
            cycleExtendDetector
          })
        } else {
          return extendedConfig
        }
      }
    } else {
      return config
    } 
  }

  public getNetworkConfig(networkId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const networkConfig = await this._fetchNetworkConfig(networkId)
      const extendedConfig = this.extendAdaptorConfig({
        config: networkConfig,
        configsByName: {},
        cycleExtendDetector: {},
      })
      // @ts-ignore
      extendedConfig.parent = networkConfig.parent
      resolve(extendedConfig)
    })
  }

  public getNetworkAdaptor(networkId: string): Promise<BaseAdaptor|boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const config = await this.getNetworkConfig(networkId)
        switch(config.type) {
          case `evm`:
            resolve(new EVMAdaptor(config))
            break
          case `utxo`:
            resolve(new UTXOAdaptor(config))
            break
          default:
            resolve(false)
        }
      } catch (e) {
        reject(e.message)
      }
    })
  }

  private _fetchNetworkConfig(networkId: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      fetch(`/swap.io-networks/networks/${networkId}/info.json`)
        .then(response => response.json())
        .then(data => resolve(data))
    })
  }

/*
  public getNetworkById(networkId: string): BaseAdaptor|boolean {
    
    const founded = this.adaptors.filter((adaptor: BaseAdaptor) => {
      return networkId.toLowerCase() === adaptor.getSymbol().toLowerCase()
    })
    return (founded.length) ? founded[0] : false
  }

  public getNetworkAdaptors(): Array<BaseAdaptor> {
    return this.adaptors
  }
*/
  public getNetworkByCoin(coinslug: string): Array<BaseAdaptor> {
    return []
  }
}


export default CryptoInterface
