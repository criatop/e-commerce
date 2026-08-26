FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-notification-*.jar app.jar
EXPOSE 9045
ENTRYPOINT ["java", "-jar", "app.jar"]
