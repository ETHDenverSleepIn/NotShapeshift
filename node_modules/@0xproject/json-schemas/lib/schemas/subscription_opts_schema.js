"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockParamSchema = {
    id: '/BlockParam',
    oneOf: [
        {
            type: 'number',
        },
        {
            enum: ['latest', 'earliest', 'pending'],
        },
    ],
};
exports.subscriptionOptsSchema = {
    id: '/SubscriptionOpts',
    properties: {
        fromBlock: { $ref: '/BlockParam' },
        toBlock: { $ref: '/BlockParam' },
    },
    type: 'object',
};
//# sourceMappingURL=subscription_opts_schema.js.map