/**
 * This file is autogenerated. Do not edit it manually.
 */
import { type Abi } from 'viem';

export const vouchAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'AccessControlBadConfirmation', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'bytes32', name: 'neededRole', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { internalType: 'address', name: 'caller', type: 'address' },
      { internalType: 'address', name: 'author', type: 'address' },
    ],
    name: 'AddressNotVouchAuthor',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'AlreadyUnvouched',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'author', type: 'uint256' },
      { internalType: 'uint256', name: 'voucheeEthosProfileId', type: 'uint256' },
    ],
    name: 'AlreadyVouched',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'CannotMarkVouchAsUnhealthy',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'implementation', type: 'address' }],
    name: 'ERC1967InvalidImplementation',
    type: 'error',
  },
  { inputs: [], name: 'ERC1967NonPayable', type: 'error' },
  { inputs: [], name: 'ETHTransferFailed', type: 'error' },
  { inputs: [], name: 'EnforcedPause', type: 'error' },
  { inputs: [], name: 'ExpectedPause', type: 'error' },
  { inputs: [], name: 'FailedCall', type: 'error' },
  {
    inputs: [{ internalType: 'string', name: 'message', type: 'string' }],
    name: 'FeeTransferFailed',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'totalFees', type: 'uint256' },
      { internalType: 'uint256', name: 'maxFees', type: 'uint256' },
    ],
    name: 'FeesExceedMaximum',
    type: 'error',
  },
  { inputs: [], name: 'InsufficientProtocolFeeBalance', type: 'error' },
  { inputs: [], name: 'InsufficientRewardsBalance', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'ethosProfileId', type: 'uint256' }],
    name: 'InvalidEthosProfileForVouch',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'newFee', type: 'uint256' }],
    name: 'InvalidFeeMultiplier',
    type: 'error',
  },
  { inputs: [], name: 'InvalidFeeProtocolAddress', type: 'error' },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'InvalidSlashPercentage', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'vouches', type: 'uint256' },
      { internalType: 'string', name: 'message', type: 'string' },
    ],
    name: 'MaximumVouchesExceeded',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'MinimumVouchAmount',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { internalType: 'uint256', name: 'user', type: 'uint256' },
    ],
    name: 'NotAuthorForVouch',
    type: 'error',
  },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  { inputs: [], name: 'NotSlasher', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'ProfileNotFoundForAddress',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'author', type: 'uint256' },
      { internalType: 'uint256', name: 'voucheeEthosProfileId', type: 'uint256' },
    ],
    name: 'SelfVouch',
    type: 'error',
  },
  { inputs: [], name: 'SignatureWasUsed', type: 'error' },
  { inputs: [], name: 'UUPSUnauthorizedCallContext', type: 'error' },
  {
    inputs: [{ internalType: 'bytes32', name: 'slot', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'VouchNotFound',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'string', name: 'message', type: 'string' },
    ],
    name: 'WithdrawalFailed',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
    ],
    name: 'WrongSubjectProfileIdForVouch',
    type: 'error',
  },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'recipientProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'DepositedToRewards',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newDonationFeeBasisPoints',
        type: 'uint256',
      },
    ],
    name: 'EntryDonationFeeBasisPointsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newProtocolFeeBasisPoints',
        type: 'uint256',
      },
    ],
    name: 'EntryProtocolFeeBasisPointsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newVouchersPoolFeeBasisPoints',
        type: 'uint256',
      },
    ],
    name: 'EntryVouchersPoolFeeBasisPointsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'newExitFeeBasisPoints', type: 'uint256' },
    ],
    name: 'ExitFeeBasisPointsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
    ],
    name: 'MarkedUnhealthy',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'newFeeProtocolAddress', type: 'address' },
    ],
    name: 'ProtocolFeeAddressUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'slashBasisPoints', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalSlashed', type: 'uint256' },
    ],
    name: 'Slashed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountWithdrawn', type: 'uint256' },
    ],
    name: 'Unvouched',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'implementation', type: 'address' }],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountStaked', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountDeposited', type: 'uint256' },
    ],
    name: 'VouchIncreased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountStaked', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountDeposited', type: 'uint256' },
    ],
    name: 'Vouched',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'accountProfileId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'WithdrawnFromRewards',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'BASIS_POINT_SCALE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_SLASH_PERCENTAGE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_TOTAL_FEES',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'OWNER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'admin', type: 'address' }],
    name: 'addAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'configuredMinimumVouchAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractAddressManager',
    outputs: [{ internalType: 'contract IContractAddressManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryDonationFeeBasisPoints',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryProtocolFeeBasisPoints',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryVouchersPoolFeeBasisPoints',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exitFeeBasisPoints',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'expectedSigner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'getRoleMember',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleMemberCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleMembers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'increaseVouch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_admin', type: 'address' },
      { internalType: 'address', name: '_expectedSigner', type: 'address' },
      { internalType: 'address', name: '_signatureVerifier', type: 'address' },
      { internalType: 'address', name: '_contractAddressManagerAddr', type: 'address' },
      { internalType: 'address', name: '_feeProtocolAddress', type: 'address' },
      { internalType: 'uint256', name: '_entryProtocolFeeBasisPoints', type: 'uint256' },
      { internalType: 'uint256', name: '_entryDonationFeeBasisPoints', type: 'uint256' },
      { internalType: 'uint256', name: '_entryVouchersPoolFeeBasisPoints', type: 'uint256' },
      { internalType: 'uint256', name: '_exitFeeBasisPoints', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'markUnhealthy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maximumVouches',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFeeAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'admin', type: 'address' }],
    name: 'removeAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'callerConfirmation', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'rewards',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newEntryDonationFeeBasisPoints', type: 'uint256' }],
    name: 'setEntryDonationFeeBasisPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newEntryProtocolFeeBasisPoints', type: 'uint256' }],
    name: 'setEntryProtocolFeeBasisPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_newEntryVouchersPoolFeeBasisPoints', type: 'uint256' },
    ],
    name: 'setEntryVouchersPoolFeeBasisPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newExitFeeBasisPoints', type: 'uint256' }],
    name: 'setExitFeeBasisPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'setMinimumVouchAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_protocolFeeAddress', type: 'address' }],
    name: 'setProtocolFeeAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    name: 'signatureUsed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'signatureVerifier',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { internalType: 'uint256', name: 'slashBasisPoints', type: 'uint256' },
    ],
    name: 'slash',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'targetId', type: 'uint256' }],
    name: 'targetExistsAndAllowedForId',
    outputs: [
      { internalType: 'bool', name: 'exists', type: 'bool' },
      { internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unhealthyResponsePeriod',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'unvouch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vouchId', type: 'uint256' }],
    name: 'unvouchUnhealthy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'contractAddressesAddr', type: 'address' }],
    name: 'updateContractAddressManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
    name: 'updateExpectedSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'maximumVouches_', type: 'uint256' }],
    name: 'updateMaximumVouches',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'updateOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'sinatureVerifier', type: 'address' }],
    name: 'updateSignatureVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'unhealthyResponsePeriodDuration', type: 'uint256' }],
    name: 'updateUnhealthyResponsePeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'newImplementation', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'author', type: 'uint256' },
      { internalType: 'address', name: 'subjectAddress', type: 'address' },
    ],
    name: 'verifiedVouchByAuthorForSubjectAddress',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'archived', type: 'bool' },
          { internalType: 'bool', name: 'unhealthy', type: 'bool' },
          { internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
          { internalType: 'address', name: 'authorAddress', type: 'address' },
          { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
          { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
          { internalType: 'uint256', name: 'balance', type: 'uint256' },
          { internalType: 'string', name: 'comment', type: 'string' },
          { internalType: 'string', name: 'metadata', type: 'string' },
          {
            components: [
              { internalType: 'uint256', name: 'vouchedAt', type: 'uint256' },
              { internalType: 'uint256', name: 'unvouchedAt', type: 'uint256' },
              { internalType: 'uint256', name: 'unhealthyAt', type: 'uint256' },
            ],
            internalType: 'struct EthosVouch.ActivityCheckpoints',
            name: 'activityCheckpoints',
            type: 'tuple',
          },
        ],
        internalType: 'struct EthosVouch.Vouch',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'author', type: 'uint256' },
      { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
    ],
    name: 'verifiedVouchByAuthorForSubjectProfileId',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'archived', type: 'bool' },
          { internalType: 'bool', name: 'unhealthy', type: 'bool' },
          { internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
          { internalType: 'address', name: 'authorAddress', type: 'address' },
          { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
          { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
          { internalType: 'uint256', name: 'balance', type: 'uint256' },
          { internalType: 'string', name: 'comment', type: 'string' },
          { internalType: 'string', name: 'metadata', type: 'string' },
          {
            components: [
              { internalType: 'uint256', name: 'vouchedAt', type: 'uint256' },
              { internalType: 'uint256', name: 'unvouchedAt', type: 'uint256' },
              { internalType: 'uint256', name: 'unhealthyAt', type: 'uint256' },
            ],
            internalType: 'struct EthosVouch.ActivityCheckpoints',
            name: 'activityCheckpoints',
            type: 'tuple',
          },
        ],
        internalType: 'struct EthosVouch.Vouch',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'subjectAddress', type: 'address' },
      { internalType: 'string', name: 'comment', type: 'string' },
      { internalType: 'string', name: 'metadata', type: 'string' },
    ],
    name: 'vouchByAddress',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
      { internalType: 'string', name: 'comment', type: 'string' },
      { internalType: 'string', name: 'metadata', type: 'string' },
    ],
    name: 'vouchByProfileId',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vouchCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'author', type: 'uint256' },
      { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
    ],
    name: 'vouchExistsFor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vouchIdByAuthorForSubjectProfileId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vouchIdsByAuthor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vouchIdsByAuthorIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vouchIdsForSubjectProfileId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'vouchIdsForSubjectProfileIdIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'vouches',
    outputs: [
      { internalType: 'bool', name: 'archived', type: 'bool' },
      { internalType: 'bool', name: 'unhealthy', type: 'bool' },
      { internalType: 'uint256', name: 'authorProfileId', type: 'uint256' },
      { internalType: 'address', name: 'authorAddress', type: 'address' },
      { internalType: 'uint256', name: 'vouchId', type: 'uint256' },
      { internalType: 'uint256', name: 'subjectProfileId', type: 'uint256' },
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      { internalType: 'string', name: 'comment', type: 'string' },
      { internalType: 'string', name: 'metadata', type: 'string' },
      {
        components: [
          { internalType: 'uint256', name: 'vouchedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'unvouchedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'unhealthyAt', type: 'uint256' },
        ],
        internalType: 'struct EthosVouch.ActivityCheckpoints',
        name: 'activityCheckpoints',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;