/**
 * @swagger
 * tags:
 *  - name: Finance
 *    description: Financial Account Management
 */

/**
 * @swagger
 * /finance/accounts:
 *  post:
 *      summary: Create financial account
 *      tags: [Finance]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - balance
 *                      properties:
 *                          balance:
 *                              type: number
 *                              example: 1000
 *      responses:
 *          201:
 *              description: Finance account successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success: 
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      accountId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 550e8400-e29b-41d4-a716-446655440000
 *                                      ownerId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: bc2d0f53-5041-46e8-a14c-267875a49f0c
 *                                      balance:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: 1000
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: "2026-03-24T12:56:03Z"
 * 
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User is not registered in FINANCES
 *          409:
 *              description: User already has an account
 *          500:
 *              description: Internal server error
 */