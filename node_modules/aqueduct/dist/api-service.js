"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var request = require("superagent");
var ApiService = /** @class */ (function () {
    function ApiService() {
    }
    ApiService.prototype.executeRequest = function (params) {
        return new Promise(function (resolve, reject) {
            var req = request(params.method, params.url)
                .set('Content-Type', 'application/json');
            var queryParameters = params.queryParameters;
            if (queryParameters) {
                Object.keys(queryParameters).forEach(function (key) {
                    var value = queryParameters[key];
                    if (Object.prototype.toString.call(value) === '[object Date]') {
                        queryParameters[key] = moment(value).format();
                    }
                });
                req = req.query(queryParameters);
            }
            if (params.body) {
                req.send(params.body);
            }
            req.end(function (error, response) {
                if (error || !response.ok) {
                    if (response && response.body && response.body.error) {
                        reject(response.body.error);
                        return;
                    }
                    reject(error);
                }
                else {
                    resolve(response.body);
                }
            });
        });
    };
    return ApiService;
}());
exports.ApiService = ApiService;
//# sourceMappingURL=api-service.js.map