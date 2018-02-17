export declare const blockParamSchema: {
    id: string;
    oneOf: ({
        type: string;
    } | {
        enum: string[];
    })[];
};
export declare const subscriptionOptsSchema: {
    id: string;
    properties: {
        fromBlock: {
            $ref: string;
        };
        toBlock: {
            $ref: string;
        };
    };
    type: string;
};
