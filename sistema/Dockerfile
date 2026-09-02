# Stage 1: Build Image
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user setup for security compliance
RUN addgroup -S agrotijuco && adduser -S agrotijuco -G agrotijuco
USER agrotijuco:agrotijuco

# Copy jar from builder
COPY --from=builder /app/target/sistema-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# JVM Container Tuning: G1GC, 75% RAM limit, OutOfMemory panic trigger
ENTRYPOINT ["java", \
  "-XX:+UseG1GC", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-jar", "app.jar"]
