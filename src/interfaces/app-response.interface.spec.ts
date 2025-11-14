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
        name: 'Test App',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      };

      expect(mockAppInfo).toHaveProperty('name');
      expect(mockAppInfo).toHaveProperty('version');
      expect(mockAppInfo).toHaveProperty('status');
      expect(mockAppInfo).toHaveProperty('timestamp');
      expect(typeof mockAppInfo.name).toBe('string');
      expect(typeof mockAppInfo.version).toBe('string');
      expect(typeof mockAppInfo.status).toBe('string');
      expect(typeof mockAppInfo.timestamp).toBe('string');
    });
  });
});
