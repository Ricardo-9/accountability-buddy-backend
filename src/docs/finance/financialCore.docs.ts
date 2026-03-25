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
 *                                          example: 2026-03-24T12:56:03Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          409:
 *              description: User already has an account
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/accounts:
 *  get:
 *      summary: Get user account
 *      tags: [Finance]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Account successfully retrieved
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
 *                                          example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *                                      ownerId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 9bbdaeba-c0e8-4b76-b887-20112e487bdd
 *                                      balance:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: 1000
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-03-25T12:36:35.127Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-03-25T12:38:35.127Z
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: User does not have an account
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
*/

/**
 * @swagger
 * /finance/accounts/balance:
 *  patch:
 *      summary: Adjust balance in existent account
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
 *                          - amount
 *                          - type
 *                          - reason
 *                      properties:
 *                          amount:
 *                              type: number
 *                              example: 100
 *                          type:
 *                              type: string
 *                              example: INCREMENT
 *                          reason:
 *                              type: string
 *                              example: INCOME
 *      responses:
 *          200:
 *              description: Account successfully updated
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
 *                                          example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *                                      ownerId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 9bbdaeba-c0e8-4b76-b887-20112e487bdd
 *                                      balance:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: 1000
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-03-25T12:38:35.127Z
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: User does not have an account
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error 
 */