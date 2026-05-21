package com.oes.interceptor;

import com.oes.config.JwtUtils;
import com.oes.service.SysLogService;
import com.oes.util.OperationDescUtil;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;
    private final SysLogService sysLogService;

    public AuthInterceptor(JwtUtils jwtUtils, SysLogService sysLogService) {
        this.jwtUtils = jwtUtils;
        this.sysLogService = sysLogService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("========== AuthInterceptor.preHandle called ==========");
        System.out.println("Request method: " + request.getMethod());
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request URL: " + request.getRequestURL());

        if ("OPTIONS".equals(request.getMethod())) {
            System.out.println("OPTIONS request, returning true");
            return true;
        }

        String uri = request.getRequestURI();
        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
            System.out.println("Public endpoint, skipping authentication");
            return true;
        }

        String token = request.getHeader("Authorization");
        System.out.println("Authorization token: " + (token != null ? "present" : "null"));

        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("No valid token, returning 401");
            response.setStatus(401);
            return false;
        }

        token = token.replace("Bearer ", "");
        if (!jwtUtils.validateToken(token)) {
            System.out.println("Invalid token, returning 401");
            response.setStatus(401);
            return false;
        }

        String username = jwtUtils.getUsernameFromToken(token);
        request.setAttribute("userId", jwtUtils.getUserIdFromToken(token));
        request.setAttribute("username", username);
        request.setAttribute("role", jwtUtils.getRoleFromToken(token));

        System.out.println("User authenticated: " + username);

        try {
            System.out.println("Attempting to save log...");
            String operation = OperationDescUtil.getOperationDesc(request.getMethod(), uri);
            sysLogService.saveLog(username, operation, request.getMethod(),
                    "", request.getRemoteAddr());
            System.out.println("Log saved successfully");
        } catch (Exception e) {
            System.out.println("Error saving log: " + e.getMessage());
            e.printStackTrace();
        }

        return true;
    }
}
