FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-inventory-*.jar app.jar
EXPOSE 9020
ENTRYPOINT ["java", "-jar", "app.jar"]
