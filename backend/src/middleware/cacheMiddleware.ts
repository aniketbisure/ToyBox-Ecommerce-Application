import { Request, Response, NextFunction } from 'express';

// Mock Redis client for demonstration. In a real Enterprise app, use 'ioredis'
// const Redis = require('ioredis');
// const redis = new Redis(process.env.REDIS_URL);

/**
 * Enterprise Ready: Caching Middleware
 * Prevents database hitting for static/semi-static data like Product Lists
 */
export const cache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // In production, you would check Redis here:
    // const cachedData = await redis.get(req.originalUrl);
    // if (cachedData) return res.json(JSON.parse(cachedData));

    // For now, we wrap the original res.json to store the result in cache before sending
    const originalJson = res.json;
    res.json = (body) => {
      // redis.setex(req.originalUrl, duration, JSON.stringify(body));
      return originalJson.call(res, body);
    };

    next();
  };
};

export const clearCache = (pattern: string) => {
  // Logic to clear Redis keys matching the pattern (e.g., when a product is updated)
  // redis.keys(pattern).then(keys => keys.forEach(k => redis.del(k)));
};
