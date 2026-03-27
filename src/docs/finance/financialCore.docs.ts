/**
 * @swagger
 * tags:
 *  - name: Financial Core
 *    description: Financial Account Management
 */

/**
 * @swagger
 * /finance/accounts:
 *  post:
 *      summary: Create financial account
 *      tags: [Financial Core]
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
 *      tags: [Financial Core]
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
 *      tags: [Financial Core]
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
 *                              enum: [INCREMENT, DECREMENT]
 *                              example: INCREMENT
 *                          reason:
 *                              type: string
 *                              enum: [INCOME, EXPENSE, GOAL]
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
 *          422:
 *              description: Insufficient balance
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error 
 */

/**
 * @swagger
 * /finance/accounts/statement:
 *  get:
 *      summary: Get account statement
 *      tags: [Financial Core]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: startDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2026-03-25
 *          - in: query
 *            name: endDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2026-03-26
 *          - in: query
 *            name: limit
 *            required: false
 *            schema:
 *              type: number
 *              example: 21
 *              description: Number of records to return
 *          - in: query
 *            name: cursor
 *            required: false
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *              description: Pagination cursor
 *      responses:
 *          200:
 *              description: Statement retrieved successfully
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
 *                                      data: 
 *                                          type: array
 *                                          items:
 *                                              type: object
 *                                              properties:
 *                                                  id:
 *                                                      type: string
 *                                                      format: uuid
 *                                                      example: eba6db67-31b1-4e29-aeb9-bfc8fdf40fca
 *                                                  balance:
 *                                                      type: string
 *                                                      description: Decimal value serialized as string
 *                                                      example: 1000
 *                                                  change:
 *                                                      type: string
 *                                                      description: Decimal value serialized as string
 *                                                      example: -1000
 *                                                  type:
 *                                                      type: string
 *                                                      example: EXPENSE
 *                                                  createdAt:
 *                                                      type: string
 *                                                      format: date-time
 *                                                      example: 2026-03-25T16:08:07.955Z
 *                                      nextCursor:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 8a7455df-2b3a-4405-ab3b-df29b2fec44d
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