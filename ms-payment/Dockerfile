FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-payment-*.jar app.jar
EXPOSE 9035
ENTRYPOINT ["java", "-jar", "app.jar"]
