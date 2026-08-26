FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-auth-*.jar app.jar
EXPOSE 9010
ENTRYPOINT ["java", "-jar", "app.jar"]
