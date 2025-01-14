import { type Request, type Response } from 'express';
import { CreateAttestationSignature } from '../services/signatures/create-attestation.service.js';
import { RegisterAddressSignature } from '../services/signatures/register-address.service.js';
import { Route } from './route.base.js';

export class Signatures extends Route {
  async createAttestation(req: Request, res: Response): Promise<void> {
    void this.initService(CreateAttestationSignature, req.body).run(req, res);
  }

  async registerAddress(req: Request, res: Response): Promise<void> {
    void this.initService(RegisterAddressSignature).run(req, res);
  }
}
