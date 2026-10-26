# ============================================================
# Multi-Stage Dockerfile for Arun Pandian Platform (Spring Boot)
# ============================================================

# Stage 1: Build Spring Boot Application
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /workspace

# Copy Maven wrapper & POM files first for caching dependencies
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn/
COPY backend/pom.xml backend/

RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B -f backend/pom.xml || true

# Copy source code and build
COPY backend/src backend/src
RUN ./mvnw clean package -DskipTests -B -f backend/pom.xml

# Stage 2: Production JRE Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app

# Run as non-privileged system user for security
RUN groupadd -r spring && useradd -r -g spring spring
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring:spring

# Copy built JAR from builder stage
COPY --from=builder --chown=spring:spring /workspace/backend/target/*.jar app.jar

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    STORAGE_UPLOAD_DIR=/app/uploads

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
