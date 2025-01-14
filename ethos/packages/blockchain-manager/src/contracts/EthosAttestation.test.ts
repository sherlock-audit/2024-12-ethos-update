import { hashServiceAndAccount } from './utils.js';

describe('hashServiceAndAccount', () => {
  it('should return the same hash as the blockchain manager getServiceAndAccountHash function', () => {
    const combinations = [
      {
        service: 'service',
        account: 'account',
        hash: '0x0423512e07aff27ea2f78564b40f9d7a52209e156a44a01cb48d4d55cf3f0445',
      },
      {
        service: 'x.com',
        account: 'benwalther256',
        hash: '0xf62354dc3386209390cbd17034bc141ecf753e4116fc9d5a4b6f80bbb407fac4',
      },
      {
        service: 'x.com',
        account: ' ',
        hash: '0xb7846bcd824253c55de64c0102495685c17dc835768c55e47b5248dcf07a2300',
      },
      {
        service: 'anything else',
        account: 'arbitrary string',
        hash: '0x024fa0fed9e57db3fec0dac633d6cc0cb896bcf4476ffcc6bab2b93e1a9dd64a',
      },
    ];

    for (const { service, account, hash: expectedHash } of combinations) {
      expect(hashServiceAndAccount(service, account)).toBe(expectedHash);
    }
  });
});
