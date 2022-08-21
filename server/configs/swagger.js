import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  info: {
    openapi: '3.0.0',
    title: 'Chat App API Docs',
    version: '1.0.0',
    description: 'A Simple Chat API',
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      description: '"Bearer $Token"',
      scheme: 'bearer',
      in: 'header',
    },
  },
};

const options = {
  swaggerDefinition,
  // looks other specifications for routes
  apis: ['./routes/v1/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
