import { IAppResponse, IAppInfo } from './app-response.interface';

describe('App Response Interfaces', () => {
  describe('IAppResponse', () => {
    it('should have correct structure', () => {
      const mockResponse: IAppResponse = {
        statusCode: 200,
        success: true,
        message: 'Test message',
      };

      expect(mockResponse).toHaveProperty('statusCode');
      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('message');
      expect(typeof mockResponse.statusCode).toBe('number');
      expect(typeof mockResponse.success).toBe('boolean');
      expect(typeof mockResponse.message).toBe('string');
    });
  });

  describe('IAppInfo', () => {
    it('should have correct structure', () => {
      const mockAppInfo: IAppInfo = {
        appName: 'Test App',
        version: '1.0.0',
        description: 'Test description',
      };

      expect(mockAppInfo).toHaveProperty('appName');
      expect(mockAppInfo).toHaveProperty('version');
      expect(mockAppInfo).toHaveProperty('description');
      expect(typeof mockAppInfo.appName).toBe('string');
      expect(typeof mockAppInfo.version).toBe('string');
      expect(typeof mockAppInfo.description).toBe('string');
    });
  });
});
