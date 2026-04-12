/**
 * @swagger
 * tags:
 *  - name: Recurring Transactions
 *    description: Recurring Transactions Management
 */

/**
 * @swagger
 * /finance/transactions:
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
 * /finance/transactions/{id}:
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

/**
 * @swagger
 * /finance/transactions/{id}:
 *  patch:
 *      summary: Update recurring transaction
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
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          type:
 *                              type: string
 *                              enum: [INCOME, EXPENSE]
 *                              example: EXPENSE
 *
 *                          name:
 *                              type: string
 *                              example: Rent
 *
 *                          amount:
 *                              type: number
 *                              example: 1500
 *
 *                          recurrenceValue:
 *                              type: number
 *                              format: integer
 *                              example: 1
 *
 *                          recurrenceUnit:
 *                              type: string
 *                              enum: [DAY, WEEK, MONTH]
 *                              example: MONTH
 *
 *                          firstOccurrence:
 *                              type: string
 *                              format: date
 *                              example: 2026-05-05
 *
 *                          dayOfMonth:
 *                              type: number
 *                              format: integer
 *                              nullable: true
 *                              example: 5
 *
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              nullable: true
 *                              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *
 *      responses:
 *          200:
 *              description: Recurring transaction successfully updated
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
 *                                          enum: [DAY, WEEK, MONTH]
 *                                          example: MONTH
 *                                      dayOfMonth:
 *                                          type: number
 *                                          nullable: true
 *                                          example: 5
 *                                      nextOccurrence:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-05-05T00:00:00.000Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-04-01T12:00:00.000Z
 *
 *          400:
 *              description: Invalid data (validation error, invalid dayOfMonth, past date, etc)
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Recurring transaction or category not found
 *          409:
 *              description: Recurring transaction already exists
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/transactions:
 *  post:
 *      summary: Create a recurring transaction
 *      tags: [Recurring Transactions]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - type
 *                          - name
 *                          - amount
 *                          - recurrenceValue
 *                          - recurrenceUnit
 *                          - firstOccurrence
 *                      properties:
 *                          type:
 *                              type: string
 *                              enum: [INCOME, EXPENSE]
 *                              example: INCOME
 *                          name:
 *                              type: string
 *                              example: Salary
 *                          amount:
 *                              type: number
 *                              example: 1621
 *                          recurrenceValue:
 *                              type: number
 *                              format: integer
 *                              example: 1
 *                          recurrenceUnit:
 *                              type: string
 *                              enum: [DAY, WEEK, MONTH]
 *                              example: MONTH
 *                          firstOccurrence:
 *                              type: string
 *                              format: date
 *                              example: 2026-05-08
 *                          dayOfMonth:
 *                              type: number
 *                              format: integer
 *                              example: 8
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 * 
 *      responses:
 *          201:
 *              description: Recurring transaction successfully created
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
 *                                          example: 8c4ab071-fd20-444a-8bd3-f39e1dbe4a00
 *                                      userId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 07c7db0b-8c87-4bc6-853b-1327afa6b262
 *                                      categoryId:
 *                                          type: string
 *                                          format: uuid
 *                                          nullable: true
 *                                          example: c478795a-9215-4c25-9e7b-eefdc242b429
 *                                      type:
 *                                          type: string
 *                                          enum: [INCOME, EXPENSE]
 *                                          example: INCOME
 *                                      name:
 *                                          type: string
 *                                          example: Salary
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: 1621
 *                                      recurrenceValue:
 *                                          type: number
 *                                          format: integer
 *                                          example: 1
 *                                      recurrenceUnit:
 *                                          type: string
 *                                          enum: [DAY, WEEK, MONTH]
 *                                          example: MONTH
 *                                      dayOfMonth:
 *                                          type: number
 *                                          format: integer
 *                                          nullable: true
 *                                          example: 8
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-03-27T16:11:22.487Z
 *                                      nextOccurrence:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2026-05-08T00:00:00.000Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Resource not found (account or category)
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/transactions/{id}:
 *  delete:
 *      summary: Delete recurring transaction
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
 *              example: 3c53ba94-47b8-49c0-ac2a-0ec936316cd0
 *      responses:
 *          200:
 *              description: Recurring transaction successfully deleted
 *              content:
 *                  application/json:
 *                      schema: 
 *                          type: object
 *                          properties:
 *                              success: 
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: Transaction successfully deleted
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Resource not found (account or recurring transaction)
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error  
 */
