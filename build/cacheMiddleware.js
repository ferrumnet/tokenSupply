"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 60 }); // 60 seconds TTL
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        const key = req.originalUrl;
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            res.send(cachedResponse);
        }
        else {
            const originalSend = res.send.bind(res);
            res.send = ((body) => {
                cache.set(key, body, duration);
                originalSend(body);
            });
            next();
        }
    };
};
exports.default = cacheMiddleware;
