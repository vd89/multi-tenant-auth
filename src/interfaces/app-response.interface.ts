export interface IAppResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

export interface IAppInfo {
  appName: string;
  version: string;
  description: string;
}
