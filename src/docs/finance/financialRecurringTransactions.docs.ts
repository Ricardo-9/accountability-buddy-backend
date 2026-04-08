/**
 * @swagger
 * tags:
 *  - name: Recurring Transactions
 *    description: Recurring Transactions Management
 */

/**
 * @swagger
 * /transactions:
 *  get:
 *      summary: Get recurring transactions
 *      tags: [Recurring Transactions]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: type
 *            required: false
 *            schema:
 *              type: string
 *              enum: [INCOME, EXPENSE]
 *              example: EXPENSE
 *
 *          - in: query
 *            name: categoryId
 *            required: false
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *
 *          - in: query
 *            name: startDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2025-01-01
 *
 *          - in: query
 *            name: endDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2025-12-31
 *
 *          - in: query
 *            name: page
 *            required: false
 *            schema:
 *              type: number
 *              example: 1
 *
 *          - in: query
 *            name: limit
 *            required: false
 *            schema:
 *              type: number
 *              example: 10
 *
 *          - in: query
 *            name: order
 *            required: false
 *            schema:
 *              type: string
 *              enum: [asc, desc]
 *              example: asc
 *
 *      responses:
 *          200:
 *              description: Recurring transactions retrieved successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: string
 *                                              format: uuid
 *                                              example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *                                          userId:
 *                                              type: string
 *                                              format: uuid
 *                                              example: 07c7db0b-8c87-4bc6-853b-1327afa6b262
 *                                          categoryId:
 *                                              type: string
 *                                              format: uuid
 *                                              nullable: true
 *                                              example: null
 *                                          type:
 *                                              type: string
 *                                              enum: [INCOME, EXPENSE]
 *                                              example: EXPENSE
 *                                          name:
 *                                              type: string
 *                                              example: Rent
 *                                          amount:
 *                                              type: string
 *                                              description: Decimal value serialized as string
 *                                              example: "1500.00"
 *                                          recurrenceValue:
 *                                              type: number
 *                                              example: 1
 *                                          recurrenceUnit:
 *                                              type: string
 *                                              example: MONTH
 *                                          dayOfMonth:
 *                                              type: number
 *                                              nullable: true
 *                                              example: 5
 *                                          nextOccurrence:
 *                                              type: string
 *                                              format: date-time
 *                                              example: 2025-05-05T00:00:00.000Z
 *                                          createdAt:
 *                                              type: string
 *                                              format: date-time
 *                                              example: 2025-04-01T12:00:00.000Z
 *
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: User account not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /transactions/{id}:
 *  get:
 *      summary: Get recurring transaction by id
 *      tags: [Recurring Transactions]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Recurring transaction id (uuid)
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *
 *      responses:
 *          200:
 *              description: Recurring transaction retrieved successfully
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
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *                                      userId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 07c7db0b-8c87-4bc6-853b-1327afa6b262
 *                                      categoryId:
 *                                          type: string
 *                                          format: uuid
 *                                          nullable: true
 *                                          example: null
 *                                      type:
 *                                          type: string
 *                                          enum: [INCOME, EXPENSE]
 *                                          example: EXPENSE
 *                                      name:
 *                                          type: string
 *                                          example: Rent
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: "1500.00"
 *                                      recurrenceValue:
 *                                          type: number
 *                                          example: 1
 *                                      recurrenceUnit:
 *                                          type: string
 *                                          example: MONTH
 *                                      dayOfMonth:
 *                                          type: number
 *                                          nullable: true
 *                                          example: 5
 *                                      nextOccurrence:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-05-05T00:00:00.000Z
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Recurring transaction not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */
