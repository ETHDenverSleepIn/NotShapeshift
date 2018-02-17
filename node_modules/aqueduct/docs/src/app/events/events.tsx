import { observable, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Gist from 'react-gist';
import './events.scss';

interface IEvent {
  path: string;
  description: string;
  params: string;
  returns: string;
  operation: string;
}

interface IEventsPayload {
  events: IEvent[];
  schema: ISchema[];
}

interface ISchema {
  type: string;
  properties: { [key: string]: { type: string; $ref?: string; items?: { $ref?: string } } };
  title: string;
  required?: string[];
  definitions?: {
    [key: string]: {
      description: string;
      properties: {
        [key: string]: {
          description: string;
          type: string;
          format?: string;
        }
      }
    }
  };
}

interface IProcessedEvent {
  description: string;
  path: string;
  parameters: IEventProperty[];
  returnType: IEventProperty[];
}

interface IEventProperty {
  name: string;
  type: string;
  required: boolean;
  properties: IEventProperty[];
  format?: string;
}

/* tslint:disable */
const events = require('events.json') as IEventsPayload;

@observer
export class Events extends React.Component {
  @observable private readonly processedEvents: IProcessedEvent[];
  @observable private readonly minimizedEvents = new ObservableMap<boolean>();

  constructor() {
    super();
    this.processedEvents = this.getProcessedEvents();
    this.processedEvents.forEach(e => {
      this.minimizedEvents.set(e.path, true);
    });
  }

  public render() {
    const handleMinimize = (event: IProcessedEvent) => () => {
      this.minimizedEvents.set(event.path, !this.minimizedEvents.get(event.path));
    };

    return (
      <div className='events p-bottom'>
        <div className='fl c'>
          <div className='content'>
            <div className='inner-container'>
              <h1>Introduction</h1>
              <p>
                Aqueduct includes a WebSocket API that notifies subscribers of important events. Our <a href='/client/modules/_aqueduct_.aqueduct.events.html'>JavaScript Client 'Events' module</a> serves
                as a wrapper for these APIs, but they can also be used with standalone Websocket clients.
              </p>
              <h1>Usage</h1>
              <h2>With JavaScript Client</h2>
              <p>
                <Gist id='8f23f064a92355d9fdc812a0cd83566d' />
              </p>
              <h2>With WebSocket Client</h2>
              <p>
                <Gist id='e20354111b0c355c39c4a5d176b8feb8' />
              </p>
              <h1>Events</h1>
              {this.processedEvents.map((e, i) => <div key={i} className='event-container'>
                <div className='event-description fl sb' onClick={handleMinimize(e)}>
                  {e.description}
                  <div className='fl vc'>
                    <i className={`fa ${this.minimizedEvents.get(e.path) ? 'fa-angle-down' : 'fa-angle-up'}`} />
                  </div>
                </div>
                <div className='event-path'>{e.path}</div>
                {!this.minimizedEvents.get(e.path) && <div>
                  {e.parameters.length > 0 && <div>
                    <h2>Parameters</h2>
                    {e.parameters.map((p, j) => (
                      <div key={j}>
                        <strong>{p.name}</strong> <span>{p.type}</span> {p.required && <span>(required)</span>}
                      </div>
                    ))}
                  </div>}
                  {e.returnType.length > 0 && <div>
                    <h2>Payload</h2>
                    {e.returnType.map((p, j) => (
                      <div key={j}>
                        <strong>{p.name}</strong> <span>{p.type}</span>
                        {p.properties && <div className='event-object-properties'>
                          {p.properties.map((sp, spIndex) => {
                            return (<div key={spIndex}>
                              <strong>{sp.name}</strong> <span>{sp.type}</span> {sp.format && <span>| {sp.format}</span>}
                            </div>)
                          })}
                        </div>}
                      </div>
                    ))}
                  </div>}
                </div>}
              </div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private getProcessedEvents() {
    return events.events.map((e): IProcessedEvent => {
      const paramSchema = events.schema.find(s => s.title === e.params) as ISchema;
      const returnSchema = events.schema.find(s => s.title === e.returns) as ISchema;

      const parameters = this.getPropertiesFromSchema(paramSchema);
      const returnType = this.getPropertiesFromSchema(returnSchema);

      return {
        path: e.path,
        description: e.description,
        parameters,
        returnType
      };
    });
  }

  private getPropertiesFromSchema(paramSchema: ISchema) {
    return paramSchema.properties
      ? Object.keys(paramSchema.properties).map((key): IEventProperty => {
        const property = paramSchema.properties[key];

        const subProperties = new Array<IEventProperty>();
        if (property.$ref) {
          const definition = paramSchema.definitions && paramSchema.definitions[property.$ref.replace('#/definitions/', '')];
          if (definition) {
            Object.keys(definition.properties).forEach(k => {
              const subProperty = definition.properties[k];
              subProperties.push({
                name: k,
                properties: [],
                required: true,
                type: subProperty.type,
                format: subProperty.format
              })
            });
          }
        }

        if (property.type === 'array' && property.items && property.items.$ref) {
          const definition = paramSchema.definitions && paramSchema.definitions[property.items.$ref.replace('#/definitions/', '')];
          if (definition) {
            Object.keys(definition.properties).forEach(k => {
              const subProperty = definition.properties[k];
              subProperties.push({
                name: k,
                properties: [],
                required: true,
                type: subProperty.type,
                format: subProperty.format
              })
            });
          }
        }

        return {
          name: key,
          required: paramSchema.required ? paramSchema.required.indexOf(key) !== -1 : false,
          type: property.type,
          properties: subProperties
        };
      })
      : [];
  }
}
