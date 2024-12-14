package com.game.alipetek.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.game.alipetek.model.RateLimit;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import redis.clients.jedis.Jedis;

@Aspect
@Component
public class RateLimitAspect {

    @Value("${spring.data.redis.host}")
    private String REDIS_HOST;

    @Value("${spring.data.redis.port}")
    private int REDIS_PORT;

    private final ObjectMapper objectMapper;

    public RateLimitAspect(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(rateLimit)")
    public Object checkRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String clientIp = request.getRemoteAddr();

        String rateLimitKey = "rate_limit:" + clientIp;
        String cacheKey = "cache:" + clientIp;

        try (Jedis jedis = new Jedis(REDIS_HOST, REDIS_PORT)) {
            String lastRequestTime = jedis.get(rateLimitKey);
            String cachedResponse = jedis.get(cacheKey);

            long timeoutInSeconds = rateLimit.timeUnit().toSeconds(rateLimit.duration());

            if (lastRequestTime != null) {
                if (cachedResponse != null) {
                    return objectMapper.readValue(cachedResponse, ResponseEntity.class);
                }
                return ResponseEntity.status(429).body("Rate limit exceeded. Try again later.");
            }

            Object result = joinPoint.proceed();

            jedis.setex(rateLimitKey, (int) timeoutInSeconds, String.valueOf(System.currentTimeMillis()));

            if (result instanceof ResponseEntity) {
                String serializedResponse = objectMapper.writeValueAsString(result);
                jedis.setex(cacheKey, (int) timeoutInSeconds, serializedResponse);
            }

            return result;
        }
    }
}
