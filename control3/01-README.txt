DSY1104 - Desarrollo Fullstack II
Evaluación Parcial N°3 - Control 3
============================================================

INTEGRANTES (completar con nombres reales antes de subir)
- [NOMBRE COMPLETO 1] - [RUT] - [GitHub usuario]
- [NOMBRE COMPLETO 2] - [RUT] - [GitHub usuario]
- [NOMBRE COMPLETO 3] - [RUT] - [GitHub usuario] (opcional, equipo máx. 3)

REPOSITORIOS
- Backend: https://github.com/criatop/e-commerce (rama limpieza_Back)
- Frontend: https://github.com/criatop/e-commerce/tree/limpieza_Back/frontend-react (rama limpieza_Back)

CONTENIDO DEL ZIP Control3-FullStack2-INTEGRANTES.zip
01-README.txt                          Este archivo
02-Documento-ERS.docx                  Especificación de requisitos de software
03-Documento-de-Cobertura-de-Testing.docx  Cobertura y resultados de pruebas
04-Documentación-de-APIs.xlsx         Matriz de endpoints REST
05-Documentación-de-APIs-e-Integración.docx  Documentación API + integración front/back
06-Manual-de-Usuario.docx              Manual con espacios para capturas
07-Proyecto-frontend-comprimido.zip   Código del frontend (sin node_modules)
08-Proyecto-backend-comprimido.zip    Código del backend (sin target/.git)
09-Video-de-presentación/             Guion y checklist; grabar MP4 con las voces del equipo

CONFIGURACIÓN LOCAL
- PostgreSQL: localhost:5433, usuario postgres, clave 123
- Backend: 8 servicios + ms-content, gateway en http://localhost:9000
- Eureka: http://localhost:8761
- Frontend: npm install && npm run dev (VITE_API_URL=http://localhost:9000)
- Swagger: http://localhost:9000/swagger-ui.html
- Health: http://localhost:9000/actuator/health

CREDENCIALES DE PRUEBA (semilla)
- admin@gmail.com / admin123  (ADMIN)
- vendedor@gmail.com / vend1234  (SELLER)
- camila@gmail.com / cliente1  (CUSTOMER)
- diego@gmail.com / diego123  (CUSTOMER)

COMO EJECUTAR PRUEBAS
- Backend: mvn -o -pl common,ms-auth,ms-product,ms-cart,ms-order,ms-payment,ms-shipping,ms-content -am test
- Frontend: cd frontend-react && npm test -- --run && npm run build && npm run lint

NOTA: reemplazar los marcadores [NOMBRE COMPLETO]/[RUT], capturar pantallazos reales
y grabar el video antes de subir a AVA y Google Drive.
