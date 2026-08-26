FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-shipping-*.jar app.jar
EXPOSE 9040
ENTRYPOINT ["java", "-jar", "app.jar"]
