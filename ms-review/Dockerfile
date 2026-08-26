FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-review-*.jar app.jar
EXPOSE 9050
ENTRYPOINT ["java", "-jar", "app.jar"]
