export interface IRequestParams {
    method: string;
    url: string;
    queryParameters?: {
        [key: string]: string | boolean | number | Date | undefined;
    };
    body?: Object;
}
export declare abstract class ApiService {
    protected executeRequest<T>(params: IRequestParams): Promise<T>;
}
