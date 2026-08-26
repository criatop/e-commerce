FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-cart-*.jar app.jar
EXPOSE 9025
ENTRYPOINT ["java", "-jar", "app.jar"]
