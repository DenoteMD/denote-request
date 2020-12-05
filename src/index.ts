import { sha256 } from 'hash.js';
import lodash from 'lodash';
import { DenoteUserIdentity } from 'denote-ui';
import { Buffer } from 'safe-buffer';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const instancePool: { [key: string]: DenoteRequest } = {};

export class DenoteRequest {
  private denoteUi: DenoteUserIdentity;

  constructor(instanceDenoteUi: DenoteUserIdentity) {
    this.denoteUi = instanceDenoteUi;
  }

  // We are only init once
  public static init(instanceDenoteUi: DenoteUserIdentity): DenoteRequest {
    // Cache the first instance
    if (typeof instancePool['denote-ui'] === 'undefined') {
      instancePool['denote-ui'] = new DenoteRequest(instanceDenoteUi);
    }
    return instancePool['denote-ui'];
  }

  public static getInstance(): DenoteRequest {
    if (typeof instancePool['denote-ui'] !== 'undefined') {
      return instancePool['denote-ui'];
    }
    throw new Error('Please init DenoteRequest first');
  }

  /**
   * Wrapper of axios
   * @param {AxiosRequestConfig} axiosConfig
   * @return {Promise<AxiosResponse<any>>}
   * @memberof DenoteRequest
   */
  public request(axiosConfig: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    let dataDigest: Buffer;
    // Sign payload, in case data is empty we sign hash of empty Buffer
    if (axiosConfig.data && Object.keys(axiosConfig.data).length > 0) {
      dataDigest = Buffer.from(sha256().update(JSON.stringify(axiosConfig.data)).digest());
    } else {
      // Digest of empty string, we won't calculate it
      dataDigest = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex');
    }
    // Sign data digest with Denote User Identity
    const signature = this.denoteUi.sign(dataDigest).toString('base64');
    // Create default configuration
    const opConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-Denote-User-Identity': signature,
      },
    };
    // Invoke axios with merge data with default config and denote-ui metadata
    return axios.request(lodash.merge(axiosConfig, opConfig));
  }
}

export default DenoteRequest;
