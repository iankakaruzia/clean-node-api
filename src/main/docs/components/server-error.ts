export const serverError = {
  description: 'Problema no Servidor',
  content: {
    'application/json': {
      schema: {
        $ref: '#/schemas/error'
      }
    }
  }
}
