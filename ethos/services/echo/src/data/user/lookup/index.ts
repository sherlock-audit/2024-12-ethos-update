import { privyLogin } from './privy-login.js';
import { profile } from './profile.js';

export const user = {
  ...privyLogin,
  ...profile,
};
