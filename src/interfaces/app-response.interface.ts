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

export interface AppResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  tenantId?: string;
}
