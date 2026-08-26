FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/ms-product-*.jar app.jar
EXPOSE 9015
ENTRYPOINT ["java", "-jar", "app.jar"]
