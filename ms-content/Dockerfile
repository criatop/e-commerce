FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-content-*.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]
