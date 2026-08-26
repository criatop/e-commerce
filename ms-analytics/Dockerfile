FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-analytics-*.jar app.jar
EXPOSE 9055
ENTRYPOINT ["java", "-jar", "app.jar"]
