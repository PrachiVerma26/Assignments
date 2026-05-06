package com.training.vehiclerentalsystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    @InjectMocks
    private JwtUtil jwtUtil;
    private CustomUserDetailsService userDetailsService;
    private JwtFilter jwtFilter;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtUtil = mock(JwtUtil.class);
        userDetailsService = mock(CustomUserDetailsService.class);
        jwtFilter = new JwtFilter(jwtUtil, userDetailsService);

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);

        SecurityContextHolder.clearContext();
    }


    // no Authorization header
    @Test
    void shouldContinueWhenNoAuthorizationHeader() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    // header present but not Bearer
    @Test
    void shouldIgnoreWhenHeaderDoesNotStartWithBearer() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("Authorization")).thenReturn("Basic abc123");

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    // invalid token
    @Test
    void shouldNotAuthenticateWhenTokenIsInvalid() throws Exception {
        String token = "invalidToken";
        String email = "test@example.com";

        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        when(jwtUtil.extractUsername(token)).thenReturn(email);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(false);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    // valid token test case
    @Test
    void shouldAuthenticateWhenTokenIsValid() throws Exception {
        String token = "validToken";
        String email = "test@example.com";

        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        when(jwtUtil.extractUsername(token)).thenReturn(email);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(true);
        when(userDetails.getAuthorities()).thenReturn(null);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}