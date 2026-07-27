const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Complaint Management System API',
      version: '1.0.0',
      description: 'REST API for the Complaint Management System (auth, vendors, executives, complaints, reports).'
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'] // add JSDoc @openapi comments to route files to enrich this
};

module.exports = swaggerJsdoc(options);
