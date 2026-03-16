import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Accountability Buddy API',
      version: '1.0.0',
      description: 'API Documentation with Swagger',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' }
    ],
  },
  apis: ['./src/docs/**/*.ts'],
};

export default swaggerJsdoc(options);