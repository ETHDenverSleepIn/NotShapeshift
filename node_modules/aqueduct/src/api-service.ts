import * as moment from 'moment';
import * as request from 'superagent';

export interface IRequestParams {
  method: string;
  url: string;
  queryParameters?: { [key: string]: string | boolean | number | Date | undefined };
  body?: Object;
}

export abstract class ApiService {
  protected executeRequest<T>(params: IRequestParams) {
    return new Promise<T>((resolve, reject) => {
      let req = request(params.method, params.url)
        .set('Content-Type', 'application/json');

      const queryParameters = params.queryParameters;
      if (queryParameters) {
        Object.keys(queryParameters).forEach(key => {
          const value = queryParameters[key];
          if (Object.prototype.toString.call(value) === '[object Date]') {
            queryParameters[key] = moment(value as Date).format();
          }
        });

        req = req.query(queryParameters);
      }
      if (params.body) { req.send(params.body); }

      req.end((error: any, response: any) => {
        if (error || !response.ok) {
          if (response && response.body && response.body.error) {
            reject(response.body.error);
            return;
          }

          reject(error);
        } else {
          resolve(response.body);
        }
      });
    });
  }
}
