/**
 * @swagger
 * tags:
 *  - name: Recurring Transactions
 *    description: Recurring Transactions Management
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
 *                                      recurringTransaction:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                              userId:
 *                                                  type: string
 *                                                  format: uuid
 *                                              categoryId:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  nullable: true
 *                                              type:
 *                                                  type: string
 *                                                  enum: [INCOME, EXPENSE]
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                                  description: Decimal serialized as string
 *                                              recurrenceValue:
 *                                                  type: number
 *                                              recurrenceUnit:
 *                                                  type: string
 *                                                  enum: [DAY, WEEK, MONTH]
 *                                              dayOfMonth:
 *                                                  type: number
 *                                                  nullable: true
 *                                              nextOccurrence:
 *                                                  type: string
 *                                                  format: date-time
 *                                              updatedAt:
 *                                                  type: string
 *                                                  format: date-time
 *
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Recurring transaction not found
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
 *
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *              format: uuid
 *
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      description: Partial update. Only provided fields will be updated.
 *                      properties:
 *                          type:
 *                              type: string
 *                              enum: [INCOME, EXPENSE]
 *                          name:
 *                              type: string
 *                          amount:
 *                              type: number
 *                          recurrenceValue:
 *                              type: number
 *                              format: integer
 *                          recurrenceUnit:
 *                              type: string
 *                              enum: [DAY, WEEK, MONTH]
 *                          firstOccurrence:
 *                              type: string
 *                              format: date
 *                              description: Recalculates nextOccurrence
 *                          dayOfMonth:
 *                              type: number
 *                              nullable: true
 *                              description: Only allowed when recurrenceUnit = MONTH
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              nullable: true
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
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      recurringTransaction:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                              userId:
 *                                                  type: string
 *                                              categoryId:
 *                                                  type: string
 *                                                  nullable: true
 *                                              type:
 *                                                  type: string
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                              recurrenceValue:
 *                                                  type: number
 *                                              recurrenceUnit:
 *                                                  type: string
 *                                              dayOfMonth:
 *                                                  type: number
 *                                                  nullable: true
 *                                              nextOccurrence:
 *                                                  type: string
 *                                                  format: date-time
 *                                              updatedAt:
 *                                                  type: string
 *                                                  format: date-time
 *
 *          400:
 *              description: Invalid data (validation, past date, invalid dayOfMonth)
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Recurring transaction or category not found
 *          409:
 *              description: Duplicate recurring transaction
 *          500:
 *              description: Internal server error
 */