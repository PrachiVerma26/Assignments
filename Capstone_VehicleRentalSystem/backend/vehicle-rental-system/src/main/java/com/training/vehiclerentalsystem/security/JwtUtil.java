package com.training.vehiclerentalsystem.security;
import com.training.vehiclerentalsystem.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "yK0fP8g1vUqzM3np7dTqJlW1JiwfE2sb6kqS4Zx6ZtM=";

    private static final long EXPIRATION = 1000 * 60 * 60 ; //for 1 hour user can logged in

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate JWT token with user identity and roles
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId",user.getId())
                .claim("roles", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //extract email
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //extract userid
    public UUID extractUserId(String token){
        return extractClaim(token, claims -> claims.get("userId",UUID.class));
    }

    //extract role
    public List<String> extractRoles(String token) {
        return extractClaim(token,claims ->claims.get("roles", List.class));
    }

    // Extract specific claim from token using functional interface
    private <T> T extractClaim(String token, Function<Claims, T> resolver){
        return resolver.apply(extractAllClaim(token));
    }
    //extract all claims
    private Claims extractAllClaim(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    //validate token
    public boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername())
            && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token){
        return extractClaim(token, Claims :: getExpiration).before(new Date());
    }
    private Claims getClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
