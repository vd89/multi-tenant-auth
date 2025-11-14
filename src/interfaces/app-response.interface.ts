export interface IAppResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

export interface IAppInfo {
  name: string;
  version: string;
  status: string;
  timestamp: string;
}
