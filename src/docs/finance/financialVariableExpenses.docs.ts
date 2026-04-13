/**
 * @swagger
 * tags:
 *  - name: Variable Expenses
 *    description: Variable Expenses Management
 */

/**
 * @swagger
 * /finance/variable-expense:
 *  post:
 *      summary: Create variable expense
 *      tags: [Variable Expenses]
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
 *                          - amount
 *                          - expenseDate
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: Dentist appointment
 *                          amount:
 *                              type: number
 *                              example: 234.45
 *                          expenseDate:
 *                              type: string
 *                              format: date
 *                              example: 2025-04-01
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              nullable: true
 *                              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *      responses:
 *          200:
 *              description: Variable expense successfully registered
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
 *                                      name:
 *                                          type: string
 *                                          example: Dentist appointment
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: "234.45"
 *                                      expenseDate:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T00:00:00.000Z
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *              message:
 *                  type: string
 *                  example: Variable Expense registered
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Category not found
 *          422:
 *              description: Insufficient balance to register expense
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/variable-expense:
 *  get:
 *      summary: Get variable expenses
 *      tags: [Variable Expenses]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: startDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2025-01-01
 *          - in: query
 *            name: endDate
 *            required: false
 *            schema:
 *              type: string
 *              format: date
 *              example: 2025-12-31
 *          - in: query
 *            name: categoryId
 *            required: false
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *      responses:
 *          200:
 *              description: Variable expenses retrieved successfully
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
 *                                          name:
 *                                              type: string
 *                                              example: Dentist appointment
 *                                          amount:
 *                                              type: string
 *                                              description: Decimal value serialized as string
 *                                              example: "234.45"
 *                                          expenseDate:
 *                                              type: string
 *                                              format: date-time
 *                                              example: 2025-04-01T00:00:00.000Z
 *                                          createdAt:
 *                                              type: string
 *                                              format: date-time
 *                                              example: 2025-04-01T12:00:00.000Z
 *                                          updatedAt:
 *                                              type: string
 *                                              format: date-time
 *                                              example: 2025-04-01T12:00:00.000Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/variable-expense/{id}:
 *  get:
 *      summary: Get variable expense by id
 *      tags: [Variable Expenses]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Variable expense id (uuid)
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *      responses:
 *          200:
 *              description: Variable expense retrieved successfully
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
 *                                      name:
 *                                          type: string
 *                                          example: Dentist appointment
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: "234.45"
 *                                      expenseDate:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T00:00:00.000Z
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Variable expense not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/variable-expense/{id}:
 *  patch:
 *      summary: Update a variable expense
 *      tags: [Variable Expenses]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Variable expense id (uuid)
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: Updated expense name
 *                          amount:
 *                              type: number
 *                              example: 300.00
 *                          expenseDate:
 *                              type: string
 *                              format: date
 *                              example: 2025-04-15
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              nullable: true
 *                              example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *      responses:
 *          200:
 *              description: Variable expense updated successfully
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
 *                                          example: 7d1effd5-3185-432b-bb39-8b6aa1ef2791
 *                                      name:
 *                                          type: string
 *                                          example: Updated expense name
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: "300.00"
 *                                      expenseDate:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-15T00:00:00.000Z
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-15T10:30:00.000Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Variable expense or category not found
 *          422:
 *              description: Insufficient balance to update expense
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /finance/variable-expense/{id}:
 *  delete:
 *      summary: Delete variable expense
 *      tags: [Variable Expenses]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Variable expense id (uuid)
 *            schema:
 *              type: string
 *              format: uuid
 *              example: 3fd12663-f4df-4fcf-a67a-83e3035338ca
 *      responses:
 *          200:
 *              description: Variable expense successfully deleted and amount refunded to balance
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
 *                                      name:
 *                                          type: string
 *                                          example: Dentist appointment
 *                                      amount:
 *                                          type: string
 *                                          description: Decimal value serialized as string
 *                                          example: "234.45"
 *                                      expenseDate:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T00:00:00.000Z
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: 2025-04-01T12:00:00.000Z
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Variable expense not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */
