/* tslint:disable:no-console */
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { compile } from 'json-schema-to-typescript';
import * as yargs from 'yargs';
import { ISchema } from './swagger';
import * as Swagger from './swagger';

interface IEvent {
  path: string;
  description: string;
  operation: string;
  params: string;
  returns: string;
}

export interface IEventsSchema {
  events: IEvent[];
  schema: {
    title: string;
  }[];
}

interface ITemplateView {
  events: IEvent[];
  services: ITemplateService[];
  models: ITemplateModel[];
  baseUrl: string;
  apiPath: string;
}

interface ITemplateService {
  name: string;
  operations: ITemplateOperation[];
}

interface ITemplateModel {
  name: string;
  description?: string;
  properties: Array<{
    propertyName: string;
    propertyType: string;
    description?: string;
  }>;
}

interface ITemplateOperation {
  id: string;
  method: string;
  signature: string;
  urlTemplate: string;
  returnType: string;
  paramsInterfaceName?: string;
  parameters?: ITemplateOperationParameters[];
  queryParameters?: string[];
  bodyParameter?: string;
  hasParameters: boolean;
  hasBodyParameter: boolean;
  description?: string;
}

interface ITemplateOperationParameters {
  parameterName: string;
  parameterType: string;
  description?: string;
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 as any;
const baseApiUrl = yargs.argv.baseApiUrl;
if (!baseApiUrl) {
  throw new Error('No baseApiUrl provided.');
}

const template = (eventModelContent: string) => handlebars.compile(`/* tslint:disable */
import { ApiService, IRequestParams } from '../api-service';
import { BigNumber } from 'bignumber.js';
import { tokenCache, TokenCache } from '../token-cache';
const ReconnectingWebsocket = require('reconnecting-websocket');

export namespace Aqueduct {
  export let socket: WebSocket;
  let baseApiUrl: string;
  let hasWebSocket: boolean;
  let socketOpen = false;

  let subscriptions: {
    [channel: string]: {
      callbacks: Array<(data: any) => void>,
      resub: () => void,
      subActive: boolean
    } | undefined
  } = {};

  const send = (message: string, tries = 0) => {
    if (socketOpen) {
      socket.send(message);
      return;
    }

    // retry for 20 seconds
    if (tries < 20) {
      setTimeout(() => {
        send(message, tries + 1);
      }, 250);
    } else {
      console.log('failed to send');
    }
  };

  /**
   * Initialize the Aqueduct client. Required to use the client.
   */
  export const Initialize = (params?: { host?: string; }) => {
    const hasProcess = typeof process !== 'undefined' && process.env;
    const host = (params && params.host) || (hasProcess && process.env.AQUEDUCT_HOST) || 'api.ercdex.com';
    baseApiUrl = \`https://\${host}\`;

    if (hasProcess && baseApiUrl.indexOf('localhost') !== -1) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 as any;
    }

    hasWebSocket = typeof WebSocket !== 'undefined';
    if (!hasWebSocket) {
      console.warn('No WebSocket found in global namespace; subscriptions will not be configured.');
      return;
    }

    socket = new ReconnectingWebsocket(\`wss:\${host}\`, undefined);

    socket.onopen = () => {
      Object.keys(subscriptions).map(k => subscriptions[k]).forEach(s => {
        if (s && !s.subActive) {
          s.resub();
          s.subActive = true;
        }
      });
      socketOpen = true;
    };

    socket.onclose = () => {
      Object.keys(subscriptions).map(k => subscriptions[k]).forEach(s => {
        if (s) {
          s.subActive = false;
        }
      });
      socketOpen = false;
    };

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as { channel?: string; data: any };
        if (data.channel) {
          const sub = subscriptions[data.channel];
          if (sub) {
            sub.callbacks.forEach(cb => cb(data.data));
          }
        }
      } catch(err) {
        return;
      }
    };
  };

  /**
   * Namespace representing REST API for ERC dEX
   */
  export namespace Api {
    {{#models}}

    {{#if description}}
    /**
     * {{description}}
     */
    {{/if}}
    export interface {{name}} {
      {{#properties}}
      {{#if description}}
      /**
       * {{description}}
       */
      {{/if}}
      {{propertyName}}: {{propertyType}};
      {{/properties}}
    }
    {{/models}}

    {{#services}}
    {{#operations}}
    {{#if hasParameters}}

    export interface {{paramsInterfaceName}} {
      {{#parameters}}
      {{#if description}}
      /**
       * {{description}}
       */
      {{/if}}
      {{parameterName}}: {{parameterType}};
      {{/parameters}}
    }
    {{/if}}
    {{/operations}}
    {{/services}}
    {{#services}}
    export class {{name}} extends ApiService {
      {{#operations}}

      {{#if description}}
      /**
       * {{description}}
       */
      {{/if}}
      public async {{id}}({{signature}}) {
        const requestParams: IRequestParams = {
          method: '{{method}}',
          url: \`\${baseApiUrl}{{../../apiPath}}{{urlTemplate}}\`
        };
        {{#if queryParameters}}

        requestParams.queryParameters = {
        {{#queryParameters}}
          {{this}}: params.{{this}},
        {{/queryParameters}}
        };
        {{/if}}
        {{#if hasBodyParameter}}

        requestParams.body = params.{{bodyParameter}};
        {{/if}}
        return this.executeRequest<{{returnType}}>(requestParams);
      }
      {{/operations}}
    }
    {{/services}}
  }

  /**
   * Namespace containing socket related events
   */
  export namespace Events {
    ${eventModelContent}

    export abstract class SocketEvent<P extends { [key: string]: any }, R> {
      protected abstract path: string;
      private params: P;
      private callback: (data: R) => void;

      /**
       * Subscribe to this event
       * @param params Payload to submit to the server
       * @param cb Handler for event broadcasts
       */
      public subscribe(params: P, cb: (data: R) => void) {
        if (!hasWebSocket) {
          throw new Error('WebSockets not configured.');
        }

        this.params = params;
        this.callback = cb;

        const channel = this.getChannel(params);
        send(\`sub:\${channel}\`);

        const sub = subscriptions[channel];
        if (sub) {
          sub.callbacks.push(this.callback);
        } else {
          subscriptions[channel] = {
            callbacks: [this.callback],
            resub: () => {
              send(\`sub:\${channel}\`)
            },
            subActive: true
          };
        }

        return this;
      }

      /**
       * Dispose of an active subscription
       */
      public unsubscribe() {
        send(\`unsub:\${this.getChannel(this.params)}\`);
      }

      private getChannel(params: P) {
        let channel = this.path;

        Object.keys(params).forEach(k => {
          channel = channel.replace(\`:\${k}\`, params[k]);
        });

        return channel;
      }
    }
    {{#events}}

    /**
     * {{description}}
     */
    export class {{operation}} extends SocketEvent<{{params}}, {{returns}}> {
      protected path = '{{path}}';
    }
    {{/events}}
  }

  export namespace Utils {
    export interface ISignOrderParams {
      maker: string;
      taker: string;
      makerFee: BigNumber;
      takerFee: BigNumber;
      makerTokenAmount: BigNumber;
      makerTokenAddress: string;
      takerTokenAmount: BigNumber;
      takerTokenAddress: string;
      exchangeContractAddress: string;
      feeRecipient: string;
      expirationUnixTimestampSec: number;
      salt: BigNumber;
    }

    export interface IZeroExOrder {
      maker: string;
      taker: string;
      makerFee: BigNumber;
      takerFee: BigNumber;
      makerTokenAmount: BigNumber;
      takerTokenAmount: BigNumber;
      makerTokenAddress: string;
      takerTokenAddress: string;
      salt: BigNumber;
      exchangeContractAddress: string;
      feeRecipient: string;
      expirationUnixTimestampSec: BigNumber;
    }

    export interface IZeroExSignedOrder extends IZeroExOrder {
      ecSignature: Api.IEcSignature;
    }

    export interface IZeroExImplementation {
      client: {
        signOrderHashAsync(orderHash: string, maker: string): Promise<Api.IEcSignature>;
      };
      getOrderHashHex: (order: IZeroExOrder) => string;
    }

    export const signOrder = async (zeroEx: IZeroExImplementation, params: ISignOrderParams): Promise<Aqueduct.Api.IStandardOrderCreationRequest> => {
      const order: IZeroExOrder = {
        maker: params.maker,
        taker: params.taker,
        makerFee: params.makerFee,
        takerFee: params.takerFee,
        makerTokenAmount: params.makerTokenAmount,
        takerTokenAmount: params.takerTokenAmount,
        makerTokenAddress: params.makerTokenAddress,
        takerTokenAddress: params.takerTokenAddress as string,
        salt: params.salt,
        exchangeContractAddress: params.exchangeContractAddress,
        feeRecipient: params.feeRecipient,
        expirationUnixTimestampSec: new BigNumber(params.expirationUnixTimestampSec)
      };

      const orderHash = zeroEx.getOrderHashHex(order);
      const ecSignature = await zeroEx.client.signOrderHashAsync(orderHash, params.maker);

      return {
        maker: params.maker,
        taker: order.taker,
        makerFee: params.makerFee.toString(),
        takerFee: params.takerFee.toString(),
        makerTokenAmount: params.makerTokenAmount.toString(),
        takerTokenAmount: params.takerTokenAmount.toString(),
        makerTokenAddress: params.makerTokenAddress,
        takerTokenAddress: params.takerTokenAddress,
        salt: order.salt.toString(),
        exchangeContractAddress: params.exchangeContractAddress,
        feeRecipient: params.feeRecipient,
        expirationUnixTimestampSec: order.expirationUnixTimestampSec.toString(),
        ecSignature
      };
    };

    export const convertStandardOrderToSignedOrder = (order: Aqueduct.Api.IStandardOrder): IZeroExSignedOrder => {
      return {
        ecSignature: order.ecSignature,
        exchangeContractAddress: order.exchangeContractAddress,
        expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
        feeRecipient: order.feeRecipient,
        maker: order.maker,
        makerFee: new BigNumber(order.makerFee),
        makerTokenAddress: order.makerTokenAddress,
        makerTokenAmount: new BigNumber(order.makerTokenAmount),
        salt: new BigNumber(order.salt),
        taker: order.taker,
        takerFee: new BigNumber(order.takerFee),
        takerTokenAddress: order.takerTokenAddress,
        takerTokenAmount: new BigNumber(order.takerTokenAmount)
      };
    };

    export const convertOrderToSignedOrder = (order: Aqueduct.Api.Order): IZeroExSignedOrder => {
      return {
        ecSignature: JSON.parse(order.serializedEcSignature),
        exchangeContractAddress: order.exchangeContractAddress,
        expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
        feeRecipient: order.feeRecipient,
        maker: order.maker,
        makerFee: new BigNumber(order.makerFee),
        makerTokenAddress: order.makerTokenAddress,
        makerTokenAmount: new BigNumber(order.makerTokenAmount),
        salt: new BigNumber(order.salt),
        taker: order.taker,
        takerFee: new BigNumber(order.takerFee),
        takerTokenAddress: order.takerTokenAddress,
        takerTokenAmount: new BigNumber(order.takerTokenAmount)
      };
    };

    export const Tokens: TokenCache = tokenCache;
  }
}
`);

const stringifyNumberEnum = (enumValue: Array<any>) => enumValue.map(s => `${s}`).join(' | ');
const getTypeFromRef = ($ref: string) => {
  return `${$ref.replace('#/definitions/', '')}`;
};

const getPropertyTypeFromSwaggerProperty = (property: Swagger.ISchema): string => {
  if (!property) { return 'void'; }

  if (property.type) {
    if (property.type === 'integer' || property.format === 'double') {
      if (property.format === 'int64') { return 'string'; }
      if (property.enum) { return stringifyNumberEnum(property.enum); }

      return 'number';
    }
    if (property.type === 'boolean') { return 'boolean'; }
    if (property.type === 'string') {
      return property.format === 'date-time' ? 'Date' : 'string';
    }

    if (property.type === 'array') {
      const items = property.items as Swagger.ISchema;
      if (!items) { throw new Error(); }

      if (items.type) {
        return `any[]`;
      }

      return `${getTypeFromRef(items.$ref as string)}[]`;
    }
  }

  if (property.$ref) { return getTypeFromRef(property.$ref); }

  return 'any';
};

const getTypeScriptTypeFromSwaggerType = (schema: ISchema) => {
  if (schema.type === 'integer' || schema.type === 'number') {
    if (schema.enum) {
      return stringifyNumberEnum(schema.enum);
    }

    return 'number';
  }

  if (schema.type === 'boolean') { return 'boolean'; }
  if (schema.type === 'string') {
    return schema.format === 'date-time' ? 'Date' : 'string';
  }

  return undefined;
};

const getPropertyTypeFromSwaggerParameter = (parameter: Swagger.IBaseParameter): string => {
  const queryParameter = parameter as Swagger.IQueryParameter;
  if (queryParameter.type) {
    const tsType = getTypeScriptTypeFromSwaggerType(queryParameter as any);
    if (tsType) { return tsType; }
  }

  const bodyParameter = parameter as Swagger.IBodyParameter;
  const schema = bodyParameter.schema;
  if (schema) {
    if (schema.$ref) {
      return getTypeFromRef(schema.$ref);
    }

    if (schema.type === 'array') {
      const items = schema.items as Swagger.ISchema;
      if (items.$ref) { return `${getTypeFromRef(items.$ref as string)}[]`; }
      if (items.type) {
        const tsType = getTypeScriptTypeFromSwaggerType(items);
        if (tsType) { return `${tsType}[]`; }
      }
    }
  }

  return 'any';
};

const getNormalizedDefinitionKey = (key: string) => {
  if (key.includes('[]')) {
    return key;
  }

  return key.replace('[', '').replace(']', '');
};

const getTemplateView = (swagger: Swagger.ISpec, eventSchema: IEventsSchema): ITemplateView => {
  const definitions = swagger.definitions;
  if (!definitions) { throw new Error('No definitions.'); }

  const paths = swagger.paths;
  if (!paths) { throw new Error('No paths.'); }

  const serviceMap: { [serviceName: string]: ITemplateService } = {};
  Object.keys(paths)
    .forEach(pathKey => {
      const methods = ['get', 'post', 'delete', 'patch', 'put', 'options', 'head'];
      const path = paths[pathKey];

      Object.keys(path)
        .filter(operationKey => methods.find(m => m === operationKey))
        .forEach(operationKey => {
          const operation = (path as any)[operationKey] as Swagger.IOperation;
          if (!operation.operationId || !operation.tags) { throw new Error(); }

          const tag = operation.tags[0];
          const service = serviceMap[tag] = serviceMap[tag] || { name: `${tag}Service`, operations: [] };

          let operationId = operation.operationId.replace('_', '');
          if (tag) {
            operationId = operationId.replace(tag, '');
          }

          const parameters = operation.parameters;
          const operationParameters = new Array<ITemplateOperationParameters>();

          // /api/{someParam}/{anotherParam} => /api/${someParam}/${anotherParam}
          let urlTemplate = `${pathKey}`.replace(/\{/g, '${');
          let signature = '';
          let paramsInterfaceName = '';
          let queryParameters: string[] | undefined = undefined;
          let bodyParameter: string | undefined;
          let hasBodyParameter = false;

          if (parameters && parameters.length) {
            paramsInterfaceName = `I${tag}${operationId.charAt(0).toUpperCase() + operationId.slice(1)}Params`;
            signature = `params: ${paramsInterfaceName}`;
            parameters.forEach(parameter => {
              const parameterName = parameter.name;

              operationParameters.push({
                parameterName: `${parameterName}${parameter.required === false ? '?' : ''}`,
                parameterType: getPropertyTypeFromSwaggerParameter(parameter),
                description: parameter.description
              });

              if (parameter.in === 'path') {
                urlTemplate = urlTemplate.replace(parameter.name, `params.${parameterName}`);
                return;
              }

              if (parameter.in === 'query') {
                queryParameters = queryParameters || new Array<string>();
                queryParameters.push(parameterName);
                return;
              }

              if (parameter.in === 'body') {
                hasBodyParameter = true;
                bodyParameter = parameterName;
              }
            });
          }

          let returnType = 'void';
          if (operation.responses['200']) {
            returnType = getNormalizedDefinitionKey(getPropertyTypeFromSwaggerProperty(operation.responses['200'].schema as Swagger.ISchema));
          }

          service.operations.push({
            id: operationId.charAt(0).toLowerCase() + operationId.slice(1),
            method: operationKey.toUpperCase(),
            signature,
            urlTemplate,
            parameters: operationParameters,
            hasParameters: !!operationParameters.length,
            bodyParameter,
            queryParameters,
            returnType,
            paramsInterfaceName,
            hasBodyParameter,
            description: operation.description
          } as ITemplateOperation);
        });
    });

  return {
    events: eventSchema.events,
    baseUrl: baseApiUrl,
    apiPath: swagger.basePath as string,
    services: Object.keys(serviceMap).map(key => serviceMap[key]),
    models: Object.keys(definitions).map(definitionKey => {
      const definition = definitions[definitionKey];
      if (!definition) { throw new Error('No definition found.'); }

      const properties = definition.properties;
      if (!properties) {
        console.log(definition);
        throw new Error('No definition properties found.');
      }

      return {
        name: `${getNormalizedDefinitionKey(definitionKey)}`,
        description: definition.description,
        properties: Object.keys(properties).map(propertyKey => {
          const property = properties[propertyKey];
          const isRequired = definition.required && definition.required.find(propertyName => propertyName === propertyKey);

          return {
            propertyName: `${propertyKey}${isRequired ? '' : '?'}`,
            propertyType: getPropertyTypeFromSwaggerProperty(property),
            description: property.description
          };
        })
      };
    })
  };
};

const replaceAll = (value: string, pattern: string, replacement: string) => {
  return value.split(pattern).join(replacement);
};

(async () => {
  // tslint:disable-next-line
  const spec = require('./swagger.json');

  // tslint:disable-next-line
  const eventSchema = require('./events.json') as IEventsSchema;

  let modelsContent = '/* tslint:disable */';

  for (const s of eventSchema.schema) {
    const content = await compile(s, s.title, {
      declareExternallyReferenced: true
    });

    modelsContent += content;
  }

  let eventModelContent = replaceAll(modelsContent, '[k: string]: any;', '');
  eventModelContent = replaceAll(eventModelContent, 'expirationDate: string;', 'expirationDate: Date;');
  eventModelContent = replaceAll(eventModelContent, 'dateCreated: string;', 'dateCreated: Date;');
  eventModelContent = replaceAll(eventModelContent, 'dateClosed: string;', 'dateClosed: Date;');
  eventModelContent = replaceAll(eventModelContent, 'dateUpdated: string;', 'dateUpdated: Date;');
  eventModelContent = replaceAll(eventModelContent, `/**
  * This file was automatically generated by json-schema-to-typescript.
  * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
  * and run json-schema-to-typescript to regenerate this file.
  */`, '');

  try {
    const compiled = template(eventModelContent)(getTemplateView(spec, eventSchema));
    fs.writeFileSync(`${__dirname}/src/generated/aqueduct.ts`, compiled);
    console.log('Api file generated!');
  } catch (err) {
    console.log(err);
  }
})();
