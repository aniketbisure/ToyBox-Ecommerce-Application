import { protect, admin, AuthRequest } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('protect', () => {
    test('should return 401 if no authorization header', () => {
      protect(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    });

    test('should return 401 if token is invalid', () => {
      mockRequest.headers!.authorization = 'Bearer invalidtoken';
      protect(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    });

    test('should call next if token is valid', () => {
      const token = jwt.sign({ id: '123', role: 'user', name: 'Test' }, 'testsecret');
      mockRequest.headers!.authorization = `Bearer ${token}`;

      protect(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ id: '123', role: 'user', name: 'Test' });
    });
  });

  describe('admin', () => {
    test('should return 403 if user is not admin', () => {
      mockRequest.user = { id: '123', role: 'user', name: 'Test' };
      admin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
    });

    test('should call next if user is admin', () => {
      mockRequest.user = { id: '123', role: 'admin', name: 'Admin' };
      admin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
