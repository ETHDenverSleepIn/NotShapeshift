import * as fs from 'fs';
import * as request from 'superagent';
import * as yargs from 'yargs';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 as any;
const baseApiUrl = yargs.argv.baseApiUrl;
if (!baseApiUrl) {
  throw new Error('No baseApiUrl provided.');
}

const getEventJson = () => {
  return new Promise<any>((resolve, _reject) => {
    request
      .get(`${baseApiUrl}/events.json`)
      .set('Accept', 'application/json')
      .end((_, res) => {
        resolve(res.body);
      });
  });
};

(async () => {
  const spec = await getEventJson();
  fs.writeFileSync('./events.json', JSON.stringify(spec));
  fs.writeFileSync('./docs/src/events.json', JSON.stringify(spec));
})();
