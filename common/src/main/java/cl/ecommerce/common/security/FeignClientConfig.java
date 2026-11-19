package cl.ecommerce.common.security;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    public static final String INTERNAL_KEY_HEADER = "X-Internal-Key";

    private final String internalKey;

    public FeignClientConfig(
            @Value("${internal.key:${INTERNAL_KEY:accesorios-chic-internal}}") String internalKey) {
        this.internalKey = internalKey;
    }

    @Bean
    public RequestInterceptor jwtPropagation() {
        return template -> {
            template.header(INTERNAL_KEY_HEADER, internalKey);

            var attributes = RequestContextHolder.getRequestAttributes();
            if (attributes instanceof ServletRequestAttributes servletAttrs) {
                String auth = servletAttrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                if (auth != null) {
                    template.header(HttpHeaders.AUTHORIZATION, auth);
                }
            }
        };
    }
}
