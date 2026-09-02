package com.agrotijuco.sistema.config.security;

import com.agrotijuco.sistema.config.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("traceId", traceId);

        try {
            String token = extractToken(request);
            if (token != null && jwtTokenService.validateToken(token)) {
                var authentication = jwtTokenService.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String tenantId = jwtTokenService.extractTenantId(token);
                String email = jwtTokenService.extractEmail(token);

                if (tenantId != null) {
                    TenantContext.setCurrentTenant(tenantId);
                    MDC.put("tenantId", tenantId);
                }
                if (email != null) {
                    MDC.put("userId", email);
                }
            } else {
                // Fallback to Header if explicit header present (e.g. initial setup)
                String headerTenant = request.getHeader("X-Tenant-ID");
                if (headerTenant != null && !headerTenant.isBlank()) {
                    TenantContext.setCurrentTenant(headerTenant);
                    MDC.put("tenantId", headerTenant);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            MDC.clear();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
