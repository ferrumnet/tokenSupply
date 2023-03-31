import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL

const cacheMiddleware = (duration: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.originalUrl;
      const cachedResponse = cache.get(key);
  
      if (cachedResponse) {
        res.send(cachedResponse);
      } else {
        const originalSend = res.send.bind(res);
  
        res.send = ((body: any) => {
          cache.set(key, body, duration);
          originalSend(body);
        }) as Response['send'];
  
        next();
      }
    };
  }
export default cacheMiddleware;
