FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-order-*.jar app.jar
EXPOSE 9030
ENTRYPOINT ["java", "-jar", "app.jar"]
