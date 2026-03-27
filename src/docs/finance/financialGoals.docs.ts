/**
 * @swagger
 * tags:
 *  - name: Financial Goals
 *    description: Financial Goals Management
 */

/**
 * @swagger
 * /finance/goals:
 *  post:
 *      summary: Create financial goal
 *      tags: [Financial Goals]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - target
 *                          - initialAmount
 *                          - durationValue
 *                          - durationUnit
 *                          - style
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: Buy a house
 *                          target:
 *                              type: number
 *                              example: 1000000
 *                          initialAmount:
 *                              type: number
 *                              example: 1000
 *                          durationValue:
 *                              type: number
 *                              format: integer
 *                              example: 120
 *                          durationUnit:
 *                              type: string
 *                              example: MONTHS
 *                          style:
 *                              type: string
 *                              example: MEDIUM
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *      responses:
 *          201:
 *              description: Financial goal successfully created
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
 *                                      goal:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  example: 8c4ab071-fd20-444a-8bd3-f39e1dbe4a00
 *                                              userId:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  example: 07c7db0b-8c87-4bc6-853b-1327afa6b262
 *                                              name:
 *                                                  type: string
 *                                                  example: Buy a house
 *                                              target:
 *                                                  type: string
 *                                                  description: Decimal value serialized as string
 *                                                  example: 1000000
 *                                              initialAmount:
 *                                                  type: string
 *                                                  description: Decimal value serialized as string
 *                                                  example: 1000
 *                                              durationValue:
 *                                                  type: number
 *                                                  format: integer
 *                                                  example: 120
 *                                              durationUnit:
 *                                                  type: string
 *                                                  enum: [WEEKS, MONTHS]
 *                                                  example: MONTHS
 *                                              style:
 *                                                  type: string
 *                                                  enum: [LOW, MEDIUM, HIGH]
 *                                                  example: MEDIUM
 *                                              categoryId:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  nullable: true
 *                                                  example: c478795a-9215-4c25-9e7b-eefdc242b429
 *                                              createdAt:
 *                                                  type: string
 *                                                  format: date-time
 *                                                  example: 2026-03-27T16:11:22.487Z
 *                                      newBalance:
 *                                          type: string
 *                                          description: Updated account balance after goal creation (decimal serialized as string)
 *                                          example: 2000                                           
 *                              message:
 *                                  type: string
 *                                  example: Financial goal successfully created
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Resource not found (account or category)
 *          422:
 *             description: User cannot create a new goal because his balance is insufficient
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

