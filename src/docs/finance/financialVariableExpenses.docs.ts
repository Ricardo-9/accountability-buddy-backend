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
 *              description: Variable Expense registered
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
 *                                  example: Variable Expense registered
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      variableExpense:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                                  example: "234.45"
 *                                              expenseDate:
 *                                                  type: string
 *                                                  format: date-time
 *                                              updatedAt:
 *                                                  type: string
 *                                                  format: date-time
 *                                              category:
 *                                                  nullable: true
 *                                                  type: object
 *                                                  properties:
 *                                                      id:
 *                                                          type: string
 *                                                          format: uuid
 *                                                      name:
 *                                                          type: string
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Category not found
 *          422:
 *              description: Insufficient balance
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
 *            schema:
 *              type: string
 *              format: date
 *          - in: query
 *            name: endDate
 *            schema:
 *              type: string
 *              format: date
 *          - in: query
 *            name: categoryId
 *            schema:
 *              type: string
 *              format: uuid
 *          - in: query
 *            name: limit
 *            schema:
 *              type: number
 *              example: 10
 *          - in: query
 *            name: cursor
 *            schema:
 *              type: string
 *              format: uuid
 *      responses:
 *          200:
 *              description: Variable expenses retrieved
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
 *                                      variableExpenses:
 *                                          type: array
 *                                          items:
 *                                              type: object
 *                                              properties:
 *                                                  id:
 *                                                      type: string
 *                                                      format: uuid
 *                                                  name:
 *                                                      type: string
 *                                                  amount:
 *                                                      type: string
 *                                                  expenseDate:
 *                                                      type: string
 *                                                      format: date-time
 *                                                  updatedAt:
 *                                                      type: string
 *                                                      format: date-time
 *                                                  category:
 *                                                      nullable: true
 *                                                      type: object
 *                                                      properties:
 *                                                          id:
 *                                                              type: string
 *                                                              format: uuid
 *                                                          name:
 *                                                              type: string
 *                                      nextCursor:
 *                                          type: string
 *                                          nullable: true
 *                                          format: uuid
 *          400:
 *              description: Invalid query params
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
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
 *            schema:
 *              type: string
 *              format: uuid
 *      responses:
 *          200:
 *              description: Variable expense retrieved
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
 *                                      variableExpense:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                              expenseDate:
 *                                                  type: string
 *                                              updatedAt:
 *                                                  type: string
 *                                              category:
 *                                                  nullable: true
 *                                                  type: object
 *                                                  properties:
 *                                                      id:
 *                                                          type: string
 *                                                      name:
 *                                                          type: string
 *          400:
 *              description: Invalid id
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Variable expense not found
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /finance/variable-expense/{id}:
 *  patch:
 *      summary: Update variable expense
 *      tags: [Variable Expenses]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *              format: uuid
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          amount:
 *                              type: number
 *                          expenseDate:
 *                              type: string
 *                              format: date
 *                          categoryId:
 *                              type: string
 *                              format: uuid
 *                              nullable: true
 *      responses:
 *          200:
 *              description: sucessfuly updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                              message:
 *                                  type: string
 *                                  example: sucessfuly updated
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      variableExpense:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                              expenseDate:
 *                                                  type: string
 *                                              updatedAt:
 *                                                  type: string
 *                                              category:
 *                                                  nullable: true
 *                                                  type: object
 *                                                  properties:
 *                                                      id:
 *                                                          type: string
 *                                                      name:
 *                                                          type: string
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Expense or category not found
 *          422:
 *              description: Insufficient balance
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
 *            schema:
 *              type: string
 *              format: uuid
 *      responses:
 *          200:
 *              description: sucessfuly deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                              message:
 *                                  type: string
 *                                  example: sucessfuly deleted
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      variableExpense:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                              name:
 *                                                  type: string
 *                                              amount:
 *                                                  type: string
 *                                              expenseDate:
 *                                                  type: string
 *                                              deletedAt:
 *                                                  type: string
 *                                              category:
 *                                                  nullable: true
 *                                                  type: object
 *                                                  properties:
 *                                                      id:
 *                                                          type: string
 *                                                      name:
 *                                                          type: string
 *          400:
 *              description: Invalid id
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *          404:
 *              description: Variable expense not found
 *          500:
 *              description: Internal server error
 */