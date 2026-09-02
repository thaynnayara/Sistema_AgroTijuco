package com.agrotijuco.sistema.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class JwtTokenService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenService(
            @Value("${jwt.secret:AgroTijucoSuperSecretKeyForJWTTokenGeneration2026SaaSPlatformRequiredAtLeast256BitsLong}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) { // 24 Hours default
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, String tenantId, String role, java.util.UUID produtorId, String nome) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(email)
                .claim("tenant_id", tenantId)
                .claim("role", role)
                .claim("nome", nome)
                .issuedAt(now)
                .expiration(expiry);

        if (produtorId != null) {
            builder.claim("produtor_id", produtorId.toString());
        }

        return builder.signWith(key).compact();
    }

    public String generateToken(String email, String tenantId, String role) {
        return generateToken(email, tenantId, role, null, null);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractTenantId(String token) {
        return getClaims(token).get("tenant_id", String.class);
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public String extractNome(String token) {
        return getClaims(token).get("nome", String.class);
    }

    public String extractProdutorId(String token) {
        return getClaims(token).get("produtor_id", String.class);
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        List<SimpleGrantedAuthority> authorities = role != null 
                ? List.of(new SimpleGrantedAuthority("ROLE_" + role)) 
                : Collections.emptyList();

        return new UsernamePasswordAuthenticationToken(email, null, authorities);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
