@echo off
echo Starting Flix Spring Boot Backend on http://localhost:8081 ...
cd /d "%~dp0"
.\mvnw.cmd spring-boot:run
